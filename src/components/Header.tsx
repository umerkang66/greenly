"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { UserDropdown } from "@/components/UserDropdown";

export function Header() {
    const { data: session, isPending } = useSession();

    return (
        <header className="fixed top-4 left-0 right-0 z-50 px-6">
            <nav className="mx-auto max-w-5xl rounded-full border border-border/20 bg-white/70 backdrop-blur-xl shadow-lg overflow-hidden relative">
                {/* Green light animation */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute h-full w-32 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-shine" />
                </div>

                <div className="relative flex h-16 items-center justify-center gap-8 px-8">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 text-lg font-bold text-foreground hover:text-primary transition-colors absolute left-8">
                        <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Leaf Icon */}
                            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" fill="currentColor" opacity="0.15" />
                            <path d="M17 8c-4 0-7 3-7 7 0 1 .2 2 .5 3M17 8c0 4-3 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M17 8l-2 2M12 18V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <span>EcoMate</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-8">
                        <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                            Home
                        </Link>
                        <Link href="#about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                            About
                        </Link>
                        <Link href="#contact" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                            Contact Us
                        </Link>
                    </div>

                    {/* Auth Actions */}
                    <div className="flex items-center gap-3 absolute right-8">
                        {isPending ? (
                            <div className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
                        ) : session ? (
                            <UserDropdown user={session.user} />
                        ) : (
                            <>
                                <Link href="/signin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                    Sign In
                                </Link>
                                <Link href="/signup" className="flex h-9 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <style jsx>{`
                @keyframes shine {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(500%);
                    }
                }
                .animate-shine {
                    animation: shine 3s ease-in-out infinite;
                }
            `}</style>
        </header>
    );
}
