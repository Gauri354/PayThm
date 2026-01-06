"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, X, Send, Check, ArrowRight, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

export function VoiceAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [response, setResponse] = useState("");
    const [isSupported, setIsSupported] = useState(true);
    const [textInput, setTextInput] = useState("");
    const [actionLabel, setActionLabel] = useState("");
    const [actionPath, setActionPath] = useState("");
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Use refs for the recognition instance to persist across renders without causing re-renders itself until needed
    const recognitionRef = useRef<any>(null);
    const router = useRouter();
    const { toast } = useToast();

    const speakResponse = (text: string) => {
        if (typeof window !== "undefined" && 'speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            window.speechSynthesis.speak(utterance);
        }
    };

    const stopSpeaking = () => {
        if (typeof window !== "undefined" && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    const handleCommand = async (command: string) => {
        const lowerCmd = command.toLowerCase();
        let responseText = "I didn't understand that command.";
        let path = "";
        let label = "";

        // -----------------------------------------
        // 1. PATTERN MATCHING
        // -----------------------------------------

        // --- A. ADD TO GOAL: "Add [amount] to [goal_name]" ---
        const addToGoalMatch = lowerCmd.match(/add\s+(\d+)\s+to\s+(?:my\s+)?(?:goal\s+)?(.+)/i);
        // Ensure it doesn't match "add [amount] to wallet" if the user says that explicitly, 
        // though "wallet" could be a goal name. We'll assume "wallet" means main wallet.
        const isWalletTarget = addToGoalMatch && addToGoalMatch[2].trim().includes("wallet");

        if (addToGoalMatch && !isWalletTarget) {
            const amount = parseFloat(addToGoalMatch[1]);
            const goalNameLike = addToGoalMatch[2].trim();

            try {
                const userStr = localStorage.getItem("user");
                if (userStr) {
                    const user = JSON.parse(userStr);
                    const userId = user.id || user.user?.id;

                    // 1. Fetch all goals to find the ID
                    const goalsRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goals?userId=${userId}`);
                    const goals = goalsRes.data;

                    // 2. Fuzzy find goal
                    const targetGoal = goals.find((g: any) => g.name.toLowerCase().includes(goalNameLike.toLowerCase()));

                    if (targetGoal) {
                        // 3. Add Money to Goal
                        await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goals/${targetGoal.id}/add-money/${amount}`);

                        responseText = `Added ₹${amount} to your '${targetGoal.name}' goal. Keep it up!`;
                        speakResponse(responseText);
                        setResponse(responseText);
                        toast({ title: "Goal Updated", description: responseText, className: "bg-green-500 text-white" });

                        setTimeout(() => window.location.reload(), 2500);
                        return true;
                    } else {
                        responseText = `I couldn't find a goal named '${goalNameLike}'.`;
                    }
                }
            } catch (e) {
                console.error(e);
                responseText = "I encountered an error updating your goal.";
            }
            // If we failed (e.g. goal not found), we might fall through or just return response. 
            // Let's set response and stop here to avoid conflicting with other commands.
            if (responseText !== "I didn't understand that command.") {
                setResponse(responseText);
                speakResponse(responseText);
                return true;
            }
        }

        // --- B. CREATE GOAL: "Create goal [name] for [amount]" ---
        const createGoalMatch = lowerCmd.match(/create\s+(?:a\s+)?goal\s+(.+)\s+for\s+(\d+)/i);

        if (createGoalMatch) {
            const name = createGoalMatch[1].trim();
            const targetAmount = parseFloat(createGoalMatch[2]);

            try {
                const userStr = localStorage.getItem("user");
                if (userStr) {
                    const user = JSON.parse(userStr);
                    const userId = user.id || user.user?.id;

                    // Default deadline: 6 months from now
                    const date = new Date();
                    date.setMonth(date.getMonth() + 6);
                    const deadline = date.toISOString().split('T')[0];

                    await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goals?userId=${userId}`, {
                        name,
                        targetAmount,
                        currentAmount: 0,
                        deadline,
                        icon: "star"
                    });

                    responseText = `Created a new goal '${name}' for ₹${targetAmount}. Good luck!`;
                    speakResponse(responseText);
                    setResponse(responseText);
                    toast({ title: "Goal Created", description: responseText, className: "bg-green-500 text-white" });

                    setTimeout(() => router.push('/savings'), 2000);
                    return true;
                }
            } catch (e) {
                console.error(e);
                responseText = "Failed to create the goal.";
            }
        }

        // --- C. SEND MONEY: "Send [amount] to [name]" ---
        const amountMatch = lowerCmd.match(/(\d+)/);
        const amount = amountMatch ? amountMatch[0] : "";
        const sendToMatch = lowerCmd.match(/send\s+(\d+)\s+to\s+(.+)/i) || lowerCmd.match(/pay\s+(\d+)\s+to\s+(.+)/i);

        if (sendToMatch) {
            const amt = sendToMatch[1];
            const recipientName = sendToMatch[2].replace("mom", "Mom").replace("dad", "Dad");

            try {
                const userStr = localStorage.getItem("user");
                if (userStr) {
                    const user = JSON.parse(userStr);
                    const senderId = user.id || user.user?.id;

                    await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wallet/send-upi`, {
                        senderId: Number(senderId),
                        upiId: recipientName,
                        amount: parseFloat(amt),
                    });

                    responseText = `Successfully sent ₹${amt} to ${recipientName}.`;
                    speakResponse(responseText);
                    setResponse(responseText);

                    toast({
                        title: "Transaction Successful",
                        description: `Sent ₹${amt} to ${recipientName} successfully.`,
                        variant: "default",
                        className: "bg-green-500 text-white border-none"
                    });

                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                    return true;
                }
            } catch (e) {
                console.error(e);
                responseText = `Failed to send ₹${amt} to ${recipientName}. Please check balance and try again.`;
            }
            if (responseText !== "I didn't understand that command.") {
                setResponse(responseText);
                speakResponse(responseText);
                return true;
            }
        }

        // --- D. ADD MONEY (WALLET): "Add [amount]" ---
        // We look for 'add' + amount, but NOT 'to goal' (handled above)
        // Actually, since we handled 'add to goal' above and returned, we are safe if we just check for 'add' now.
        const addMatch = lowerCmd.match(/add\s+(\d+)/) || lowerCmd.match(/add.*money\s+(\d+)/);

        if (addMatch) {
            const addedAmt = addMatch[1] || addMatch[2];
            try {
                const userStr = localStorage.getItem("user");
                if (userStr) {
                    const user = JSON.parse(userStr);
                    const userId = user.id || user.user?.id;

                    await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wallet/add`, {
                        userId: Number(userId),
                        amount: parseFloat(addedAmt),
                    });

                    responseText = `Successfully added ₹${addedAmt} to your wallet.`;
                    speakResponse(responseText);
                    setResponse(responseText);

                    toast({
                        title: "Money Added",
                        description: `Added ₹${addedAmt} to your wallet successfully.`,
                        variant: "default",
                        className: "bg-green-500 text-white border-none"
                    });

                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                    return true;
                }
            } catch (e) {
                console.error(e);
                responseText = `Failed to add ₹${addedAmt}. Please try again.`;
            }
            if (responseText !== "I didn't understand that command.") {
                setResponse(responseText);
                speakResponse(responseText);
                return true;
            }
        }

        // -----------------------------------------
        // 2. NAVIGATION COMMANDS
        // -----------------------------------------

        if (lowerCmd.includes("dashboard") || lowerCmd.includes("home")) {
            responseText = "Navigating to Dashboard...";
            path = "/dashboard";
            label = "Go to Dashboard";
        }
        else if (lowerCmd.includes("send") || lowerCmd.includes("pay") || lowerCmd.includes("transfer")) {
            if (amount) {
                responseText = `Opening Send Money with ₹${amount}...`;
                path = `/send-money?amount=${amount}`;
            } else {
                responseText = "To whom and how much would you like to send?";
                path = "/send-money";
            }
            label = "Send Money";
        }
        else if (lowerCmd.includes("add") || lowerCmd.includes("deposit") || lowerCmd.includes("load")) {
            responseText = "How much would you like to add?";
            path = "/add-money";
            label = "Add Money";
        }
        else if (lowerCmd.includes("scan") || lowerCmd.includes("qr")) {
            responseText = "Opening QR Scanner...";
            path = "/scan-qr";
            label = "Scan QR";
        }
        else if (lowerCmd.includes("bill") || lowerCmd.includes("electricity") || lowerCmd.includes("recharge")) {
            responseText = "Opening Bills & Utilities...";
            path = "/bills";
            label = "Pay Bills";
        }
        else if (lowerCmd.includes("transaction") || lowerCmd.includes("history") || lowerCmd.includes("statement")) {
            responseText = "Showing Transactions...";
            path = "/dashboard";
            label = "View Transactions";
        }
        else if (lowerCmd.includes("report") || lowerCmd.includes("insight") || lowerCmd.includes("analytic")) {
            responseText = "Opening Insights...";
            path = "/insights";
            label = "View Insights";
        }
        else if (lowerCmd.includes("saving") || lowerCmd.includes("goal")) {
            responseText = "Opening Savings Goals...";
            path = "/savings";
            label = "View Savings";
        }
        else if (lowerCmd.includes("budget") || lowerCmd.includes("plan")) {
            responseText = "Opening Budget Planner...";
            path = "/budget";
            label = "View Budget";
        }
        else if (lowerCmd.includes("split")) {
            responseText = "Opening Split Bill...";
            path = "/split-bill";
            label = "Split Bill";
        }
        else if (lowerCmd.includes("merchant") || lowerCmd.includes("business")) {
            responseText = "Opening Merchant Dashboard...";
            path = "/merchant";
            label = "Merchant View";
        }
        else if (lowerCmd.includes("admin")) {
            responseText = "Opening Admin Panel...";
            path = "/admin";
            label = "Admin Panel";
        }
        else if (lowerCmd.includes("logout") || lowerCmd.includes("log out")) {
            responseText = "Logging you out...";
            path = "/login";
            label = "Logout";
        }
        else if (lowerCmd.includes("help") || lowerCmd.includes("hello") || lowerCmd.includes("hi")) {
            responseText = "Hello! You can say 'Send 500 to Mom', 'Add 1000', or 'Create goal Car for 50000'.";
        }

        setResponse(responseText);
        speakResponse(responseText);

        if (path) {
            setActionPath(path);
            setActionLabel(label);
            setTimeout(() => {
                router.push(path);
                setTimeout(() => setIsOpen(false), 2000);
            }, 1500);
            setIsSupported(true);
            return true;
        } else {
            setIsSupported(false);
            if (responseText === "I didn't understand that command.") {
                setResponse("I didn't capture that. Try 'Send 500' or 'Open Goals'.");
            }
            return false;
        }
        return false;
    };

    const initializeSpeechRecognition = () => {
        if (typeof window === 'undefined') return false;

        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return false;

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    const finalTranscript = event.results[i][0].transcript;
                    setTranscript(finalTranscript);
                    handleCommand(finalTranscript);
                } else {
                    interimTranscript += event.results[i][0].transcript;
                    setTranscript(interimTranscript);
                }
            }
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
            if (event.error === 'not-allowed') {
                if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                    toast({
                        title: "Connection Not Secure",
                        description: "Voice features might be blocked by your browser on this network. Use Localhost or HTTPS for best results.",
                        variant: "default",
                        className: "bg-yellow-500 text-white"
                    });
                }
                setResponse("Microphone access denied.");
            } else if (event.error === 'no-speech') {
                // setResponse("I didn't hear anything.");
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        return true;
    };

    const handleMicClick = () => {
        setIsOpen(true);
        setTranscript("");
        setActionLabel("");
        setActionPath("");

        let initialGreeting = "How can I help you?";
        setResponse(initialGreeting);
        speakResponse(initialGreeting);

        // Initialize and start
        const supported = initializeSpeechRecognition();

        if (supported && recognitionRef.current) {
            try {
                // Short delay to allow speech synthesis to start before listening (optional, but helps keep clean)
                // Actually start immediately, user can talk over
                recognitionRef.current.start();
            } catch (e) {
                console.error("Failed to start recognition", e);
            }
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (e) { }
        }
        stopSpeaking();
        setIsListening(false);
    };

    const handleAction = () => {
        if (actionPath) {
            router.push(actionPath);
            handleClose();
        }
    };

    const handleTextSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setTranscript(textInput);
        setTextInput("");
        handleCommand(textInput);
    };

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <>
            <motion.div
                className="fixed bottom-6 right-6 z-50"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <Button
                    className="h-14 w-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 border-2 border-white/20 relative group"
                    onClick={handleMicClick}
                >
                    <Mic className="h-6 w-6 text-white" />
                    <span className="absolute -top-2 -right-2 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-sky-500"></span>
                    </span>
                </Button>
            </motion.div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl p-6"
                        >
                            <Button
                                className="absolute right-4 top-4 text-zinc-400 hover:text-white"
                                onClick={handleClose}
                                variant="ghost"
                                size="icon"
                            >
                                <X className="h-5 w-5" />
                            </Button>

                            <div className="flex flex-col items-center gap-6 py-8">
                                <div className="relative cursor-pointer" onClick={() => {
                                    if (isListening) {
                                        try { recognitionRef.current?.stop(); } catch (e) { }
                                    } else {
                                        try { recognitionRef.current?.start(); } catch (e) { }
                                    }
                                }}>
                                    <div className={cn("h-20 w-20 rounded-full flex items-center justify-center transition-colors",
                                        isListening ? "bg-red-500/20" : "bg-indigo-500/20"
                                    )}>
                                        <Mic className={cn("h-8 w-8", isListening ? "text-red-500" : "text-indigo-500")} />
                                    </div>
                                    {isListening && (
                                        <>
                                            <motion.div
                                                className="absolute inset-0 rounded-full border-2 border-red-500"
                                                animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                                                transition={{ repeat: Infinity, duration: 1.5 }}
                                            />
                                            <motion.div
                                                className="absolute inset-0 rounded-full border-2 border-red-500"
                                                animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                                                transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
                                            />
                                        </>
                                    )}
                                </div>

                                <div className="text-center space-y-2 w-full">
                                    <div className="flex items-center justify-center gap-2">
                                        <h3 className="text-xl font-semibold text-white">
                                            {isListening ? "Listening..." : "PayThm Assistant"}
                                        </h3>
                                        {isSpeaking && <Volume2 className="h-4 w-4 text-indigo-400 animate-pulse" />}
                                    </div>

                                    <div className="bg-zinc-800/50 rounded-lg p-3 min-h-[60px] flex items-center justify-center border border-white/5">
                                        <p className="text-zinc-200">
                                            {transcript || response}
                                        </p>
                                    </div>

                                    <form onSubmit={handleTextSubmit} className="mt-4 flex gap-2 w-full">
                                        <input
                                            type="text"
                                            value={textInput}
                                            onChange={(e) => setTextInput(e.target.value)}
                                            placeholder="Type a command..."
                                            className="flex-1 bg-zinc-800 border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <Button type="submit" size="icon" className="bg-indigo-600 hover:bg-indigo-700">
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </form>
                                    {!isSupported && (
                                        <p className="text-xs text-red-400 mt-2">
                                            Use text input or try Chrome/Edge for voice.
                                        </p>
                                    )}
                                </div>

                                {response && !isListening && actionLabel && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="w-full"
                                    >
                                        <Button
                                            onClick={handleAction}
                                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white gap-2 shadow-lg shadow-indigo-500/20"
                                        >
                                            {actionLabel} <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
