"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserDropdown } from "@/components/UserDropdown";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Leaf, BarChart3, Users, Sparkles, Trophy, Target, Camera } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Notifications } from "@/components/Notifications";

export function Header() {
    const { data: session, isPending } = useSession();
    const { scrollY } = useScroll();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 20);
    });

    const navLinks = [
        { href: "/carbon-tracking", label: "Tracker", icon: BarChart3 },
        { href: "/scanner", label: "Scanner", icon: Camera },
        { href: "/communities", label: "Communities", icon: Users },
        { href: "/challenges", label: "Challenges", icon: Target },
        { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    ];

    return (
        <motion.header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "py-2" : "py-4"
                }`}
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <motion.div
                    className={`relative mx-auto flex items-center justify-between rounded-full border transition-all duration-300 px-4 sm:px-6 ${isScrolled
                        ? "h-16 border-green-200 dark:border-green-800 bg-green-100/95 dark:bg-green-950/95 backdrop-blur-2xl shadow-lg shadow-green-900/10 dark:shadow-black/20"
                        : "h-16 border-green-200 dark:border-green-800 bg-green-100/90 dark:bg-green-950/90 backdrop-blur-xl"
                        }`}
                >
                    {/* Left: Logo */}
                    <div className="flex items-center shrink-0">
                        <Link
                            href="/"
                            className="group flex items-center gap-2"
                        >
                            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-green-500/30 to-teal-500/30 transition-all group-hover:from-green-500/40 group-hover:to-teal-500/40">
                                <Leaf className="h-6 w-6 text-green-700 dark:text-green-400 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
                            </div>
                            <span className="hidden sm:block text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 dark:from-green-400 dark:via-emerald-400 dark:to-teal-300">
                                Greenly
                            </span>
                        </Link>
                    </div>

                    {/* Center: Navigation Pill (Desktop) */}
                    <div className="hidden lg:flex items-center justify-center flex-1 px-4">
                        <div className="flex items-center p-1 rounded-full bg-green-200/80 dark:bg-white/10 border border-green-300 dark:border-white/10 backdrop-blur-md shadow-sm">
                            {navLinks.map((link) => {
                                const isActive = pathname?.startsWith(link.href);
                                const Icon = link.icon;

                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`relative px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${isActive
                                            ? "text-white"
                                            : "text-green-800 dark:text-gray-400 hover:text-green-950 dark:hover:text-white"
                                            }`}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="nav-pill"
                                                className="absolute inset-0 bg-primary rounded-full shadow-sm"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <span className="relative z-10 flex items-center gap-2">
                                            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
                                            <span className="hidden xl:inline">{link.label}</span>
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Auth & Theme (Desktop) */}
                    <div className="hidden lg:flex items-center gap-3 shrink-0">
                        <ThemeToggle />
                        {session && <Notifications />}

                        <div className="h-6 w-[1px] bg-green-300 dark:bg-white/20 mx-1" />

                        {isPending ? (
                            <div className="h-10 w-24 animate-pulse rounded-full bg-muted" />
                        ) : session ? (
                            <UserDropdown user={session.user} />
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/signin"
                                    className="px-4 py-2 text-sm font-medium text-green-800 dark:text-gray-400 hover:text-green-950 dark:hover:text-white transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/signup"
                                    className="relative inline-flex h-10 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                                >
                                    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)] dark:bg-[conic-gradient(from_90deg_at_50%_50%,#A7F3D0_0%,#10B981_50%,#A7F3D0_100%)]" />
                                    <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-5 py-1 text-sm font-medium text-white backdrop-blur-3xl transition-all hover:bg-slate-900">
                                        Get Started
                                    </span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Actions: Theme + Hamburger */}
                    <div className="flex lg:hidden items-center gap-3">
                        <ThemeToggle />
                        {session && <Notifications />}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-full hover:bg-green-200/50 dark:hover:bg-white/10 transition-colors"
                        >
                            <div className="w-6 h-6 flex flex-col justify-center gap-1.5">
                                <motion.span
                                    animate={isMobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                                    className="w-full h-0.5 bg-foreground block origin-center transition-all"
                                />
                                <motion.span
                                    animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                                    className="w-full h-0.5 bg-foreground block transition-all"
                                />
                                <motion.span
                                    animate={isMobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                                    className="w-full h-0.5 bg-foreground block origin-center transition-all"
                                />
                            </div>
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Mobile Menu Overlay */}
            <motion.div
                initial={false}
                animate={isMobileMenuOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                className="lg:hidden overflow-hidden bg-background/95 backdrop-blur-xl border-b border-border absolute top-full left-0 right-0 shadow-xl"
            >
                <div className="p-4 space-y-4">
                    <nav className="flex flex-col gap-2">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname?.startsWith(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isActive
                                            ? "bg-primary/10 text-primary"
                                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{link.label}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="h-[1px] bg-border my-2" />

                    <div className="flex flex-col gap-3">
                        {isPending ? (
                            <div className="h-10 w-full animate-pulse rounded-full bg-muted" />
                        ) : session ? (
                            <div className="flex items-center justify-between p-2">
                                <span className="text-sm font-medium text-muted-foreground">Signed in as {session.user.name}</span>
                                <UserDropdown user={session.user} />
                            </div>
                        ) : (
                            <>
                                <Link
                                    href="/signin"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full py-3 text-center font-medium border border-border rounded-xl hover:bg-muted transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/signup"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full py-3 text-center font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.header >
    );
}
