"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";

const ROTATION_RANGE = 32.5;
const HALF_ROTATION_RANGE = 32.5 / 2;

export const TiltCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    const ref = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const xSpring = useSpring(x);
    const ySpring = useSpring(y);

    const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseX = (e.clientX - rect.left) * ROTATION_RANGE;
        const mouseY = (e.clientY - rect.top) * ROTATION_RANGE;

        const rX = (mouseY / height - HALF_ROTATION_RANGE) * -1;
        const rY = mouseX / width - HALF_ROTATION_RANGE;

        x.set(rX);
        y.set(rY);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                transformStyle: "preserve-3d",
                transform,
            }}
            className={className}
        >
            <div
                style={{
                    transform: "translateZ(75px)",
                    transformStyle: "preserve-3d",
                }}
                className="absolute inset-4 grid place-content-center rounded-xl bg-white shadow-lg"
            >
                {/* This inner div is just a placeholder/example structure. 
            For a generic wrapper, we might want to just render children directly 
            or let the user control the inner structure. 
            Let's adjust this to be more flexible. */}
            </div>
            {children}
        </motion.div>
    );
};

// A more specific 3D Card for the dashboard
// A more specific static but attractive Card for the dashboard
export const CreditCard3D = ({ userName = "GAURI SANKAR" }: { userName?: string }) => {
    return (
        <div className="relative h-64 w-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-primary/20">
            {/* Background Gradient & Texture */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1c2e] to-[#4a1d96]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
                <div className="absolute top-0 right-0 p-12 bg-purple-500/20 blur-[80px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 p-12 bg-cyan-500/20 blur-[80px] rounded-full pointer-events-none" />
            </div>

            {/* Glass Overlay Content */}
            <div className="absolute inset-0 flex flex-col justify-between p-8 text-white z-10">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="font-bold text-2xl tracking-tighter flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center text-[10px] font-bold shadow-lg">
                                ₱
                            </div>
                            PAYTHM
                        </div>
                        <p className="text-xs text-white/60 tracking-widest pl-1">PREMIUM</p>
                    </div>
                    <div className="h-10 w-16 opacity-50">
                        {/* Chip Graphic Mockup */}
                        <div className="w-12 h-9 rounded-md border border-yellow-500/30 bg-yellow-500/10 flex items-center justify-center">
                            <div className="w-8 h-6 border border-yellow-500/20 rounded-sm grid grid-cols-2 gap-1 p-0.5">
                                <div className="border border-yellow-500/20 rounded-[1px]" />
                                <div className="border border-yellow-500/20 rounded-[1px]" />
                                <div className="border border-yellow-500/20 rounded-[1px]" />
                                <div className="border border-yellow-500/20 rounded-[1px]" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <p className="text-2xl font-mono tracking-[0.2em] text-white/90 drop-shadow-md">
                        **** **** **** 1234
                    </p>

                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-[10px] text-white/50 uppercase tracking-wider">Card Holder</p>
                            <p className="font-medium tracking-wide">{userName.toUpperCase()}</p>
                        </div>
                        <div className="space-y-1 text-right">
                            <p className="text-[10px] text-white/50 uppercase tracking-wider">Expires</p>
                            <p className="font-medium tracking-wide">12/28</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Glossy Reflection Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none" />
        </div>
    );
};
