import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    showText?: boolean;
    variant?: "default" | "light" | "dark"; // Light = for dark backgrounds (white text), Dark = for light backgrounds
}

export function Logo({ className, showText = true, variant = "default" }: LogoProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            {/* Icon Container */}
            <div className="relative w-11 h-11 flex items-center justify-center transition-transform hover:scale-110 duration-300">
                <svg
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full drop-shadow-2xl"
                >
                    <defs>
                        <linearGradient id="logo_bg_gradient_v2" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#6366f1" /> {/* Indigo-500 */}
                            <stop offset="50%" stopColor="#8b5cf6" /> {/* Violet-500 */}
                            <stop offset="100%" stopColor="#ec4899" /> {/* Pink-500 */}
                        </linearGradient>
                        <filter id="glow_v2" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Main Shape with Glow */}
                    <rect width="40" height="40" rx="12" fill="url(#logo_bg_gradient_v2)" filter="url(#glow_v2)" />

                    {/* Inner Depth Stroke */}
                    <rect x="2" y="2" width="36" height="36" rx="10" stroke="white" strokeOpacity="0.2" strokeWidth="2" />

                    {/* Abstract 'P' Symbol - Modern Tech Stencil Style */}
                    <path
                        d="M14 11C13.4477 11 13 11.4477 13 12V32C13 33.1046 13.8954 34 15 34C16.1046 34 17 33.1046 17 32V12C17 11.4477 16.5523 11 16 11H14Z"
                        fill="white"
                        className="drop-shadow-sm"
                    />
                    <path
                        d="M19 11C19 10.4477 19.4477 10 20 10H23C27.9706 10 32 14.0294 32 19C32 23.9706 27.9706 28 23 28H20C19.4477 28 19 28.4477 19 29V23H23C25.2091 23 27 21.2091 27 19C27 16.7909 25.2091 15 23 15H19V11Z"
                        fill="white"
                        fillOpacity="0.95"
                        className="drop-shadow-sm"
                    />
                </svg>
            </div>

            {/* Text Logo */}
            {showText && (
                <span className={cn(
                    "font-extrabold text-3xl tracking-tight leading-none",
                    variant === "light" ? "text-white drop-shadow-md" :
                        variant === "dark" ? "text-zinc-900 dark:text-white" :
                            "bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-600 dark:from-white dark:to-zinc-200"
                )}>
                    PayThm
                </span>
            )}
        </div>
    );
}
