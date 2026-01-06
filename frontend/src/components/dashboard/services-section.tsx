'use client';

import React from 'react';
import { motion } from "framer-motion";
import {
    Smartphone,
    Tv,
    Zap,
    CreditCard,
    Home,
    Banknote,
    Flame,
    Wifi,
    Droplets,
    Train,
    Plane,
    Clapperboard
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const services = [
    { label: "Mobile Recharge", icon: Smartphone, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "DTH", icon: Tv, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Electricity", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { label: "Credit Card", icon: CreditCard, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "Rent Payment", icon: Home, color: "text-pink-500", bg: "bg-pink-500/10" },
    { label: "Loan Repay", icon: Banknote, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Book Cylinder", icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Broadband", icon: Wifi, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    // Extra row for "More" feel
    { label: "Water Bill", icon: Droplets, color: "text-sky-500", bg: "bg-sky-500/10" },
    { label: "Train Tickets", icon: Train, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Flights", icon: Plane, color: "text-teal-500", bg: "bg-teal-500/10" },
    { label: "Movie Tickets", icon: Clapperboard, color: "text-rose-500", bg: "bg-rose-500/10" },
];

export function ServicesSection() {
    const { toast } = useToast();

    const handleServiceClick = (label: string) => {
        toast({
            title: "Service Unavailable",
            description: `${label} feature is coming soon!`,
            variant: "default",
        });
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Recharge & Pay Bills
                <span className="text-[10px] font-bold text-white bg-gradient-to-r from-pink-500 to-purple-500 px-2 py-0.5 rounded-full uppercase tracking-wider">New</span>
            </h2>

            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {services.map((service, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex flex-col items-center gap-2 group cursor-pointer"
                        onClick={() => handleServiceClick(service.label)}
                    >
                        <div className={`w-14 h-14 rounded-2xl ${service.bg} flex items-center justify-center border border-transparent group-hover:border-zinc-200 dark:group-hover:border-zinc-700 transition-all shadow-sm group-hover:shadow-md`}>
                            <service.icon className={`w-7 h-7 ${service.color}`} strokeWidth={2} />
                        </div>
                        <span className="text-[11px] md:text-xs font-medium text-zinc-600 dark:text-zinc-400 text-center leading-tight max-w-[80px] group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">
                            {service.label}
                        </span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
