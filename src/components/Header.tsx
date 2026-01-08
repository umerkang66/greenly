"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserDropdown } from "@/components/UserDropdown";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { Leaf, BarChart3 } from "lucide-react";
import { useState } from "react";

export function Header() {
    const { data: session, isPending } = useSession();
    const { scrollY } = useScroll();
    const [isScrolled, setIsScrolled] = useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 20);
    });

    return (
        <motion.header
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        >
            {/* Background Layer - Handles Dark Mode Correctly */}
            <motion.div
                className="absolute inset-0 border-b transition-all duration-500 pointer-events-none z-0"
                initial={{ opacity: 0 }}
                animate={{
                    opacity: isScrolled ? 1 : 0,
                    backdropFilter: isScrolled ? "blur(12px)" : "blur(0px)",
                }}
                style={{
                    backgroundColor: "var(--background)", // Uses theme variable
                }}
            >
                {/* Overlay for tint to differentiate from plain background if needed */}
                <div className="absolute inset-0 bg-background/80 dark:bg-background/80" />
            </motion.div>

            {/* Border separate to handle subtle appearance */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-[1px] bg-border transition-opacity duration-300 pointer-events-none z-0"
                animate={{ opacity: isScrolled ? 1 : 0 }}
            />

            <nav className="relative z-10 mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

                {/* Left Side: Logo + Tracker Link */}
                <div className="flex items-center gap-8">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="group flex items-center gap-2 text-xl font-bold text-foreground transition-all duration-300"
                    >
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                            <Leaf className="h-6 w-6 text-primary transition-transform duration-500 group-hover:rotate-45" />
                        </div>
                        <span className="tracking-tight text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-500 dark:from-green-400 dark:to-teal-300">
                            Greenly
                        </span>
                    </Link>

                    {/* Tracker Link (Visible/Premium) */}
                    <Link
                        href="/carbon-tracking"
                        className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-all group relative overflow-hidden rounded-full hover:bg-primary/5"
                    >
                        <BarChart3 size={18} className="group-hover:text-green-500 transition-colors" />
                        <span>Tracker</span>
                        {/* Hover Underline Effect */}
                        <span className="absolute inset-x-4 bottom-1 h-0.5 bg-green-500 scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
                    </Link>
                </div>

                {/* Right Side: Auth Actions */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <ThemeToggle />

                    {isPending ? (
                        <div className="h-9 w-24 animate-pulse rounded-full bg-muted" />
                    ) : session ? (
                        <div className="flex items-center gap-4">
                            <UserDropdown user={session.user} />
                        </div>
                    ) : (
                        <>
                            <Link
                                href="/signin"
                                className="hidden sm:flex h-10 items-center justify-center rounded-full px-5 text-sm font-medium text-muted-foreground transition-all duration-300 hover:text-foreground hover:bg-secondary/50"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/signup"
                                className="group relative flex h-10 items-center justify-center overflow-hidden rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105 hover:shadow-primary/40"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Get Started
                                </span>
                                <div className="absolute inset-0 -z-10 translate-y-[100%] bg-gradient-to-r from-emerald-600 to-teal-600 transition-transform duration-300 group-hover:translate-y-0" />
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </motion.header>
    );
}
