import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface QrModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | number;
    bankName?: string;
}

export function QrModal({ isOpen, onClose, userId, bankName }: QrModalProps) {
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);

    // Format: userId@bankName (e.g. 101@sbi)
    // Clean bank name to be VPA friendly (lowercase, no spaces)
    const suffix = bankName ? bankName.toLowerCase().replace(/\s+/g, '') : 'paythm';
    const formattedId = `${userId}@${suffix}`;

    // Generate QR URL using a public API (no extra dependencies needed)
    // Data format: paythm://pay?uid=123 (Simulates a deep link scheme)
    const qrData = encodeURIComponent(`paythm://pay?vpa=${formattedId}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrData}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(formattedId);
        setCopied(true);
        toast({ title: "Copied!", description: "PayThm ID copied to clipboard." });
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My PayThm QR',
                    text: `Pay me on PayThm! My VPA is: ${formattedId}`,
                    url: qrUrl
                });
            } catch (err) {
                console.error("Share failed", err);
            }
        } else {
            // Fallback for desktop
            handleCopy();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl font-bold">Receive Money</DialogTitle>
                    <DialogDescription className="text-center">
                        Scan this QR code to receive payments directly.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center space-y-6 py-6">
                    <div className="p-4 bg-white rounded-3xl shadow-xl border border-zinc-100">
                        {/* QR Code Image */}
                        <img
                            src={qrUrl}
                            alt="My QR Code"
                            className="w-48 h-48 object-contain rounded-xl"
                        />
                    </div>

                    <div className="text-center space-y-1">
                        <p className="text-sm text-zinc-500 font-medium uppercase tracking-wide">My PayThm ID</p>
                        <div className="text-2xl font-mono font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
                            {formattedId}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full">
                        <Button variant="outline" className="w-full flex gap-2" onClick={handleCopy}>
                            <Copy className="w-4 h-4" />
                            {copied ? "Copied" : "Copy ID"}
                        </Button>
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex gap-2" onClick={handleShare}>
                            <Share2 className="w-4 h-4" />
                            Share
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
