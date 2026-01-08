"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp, signIn } from "@/lib/auth-client";
import { motion } from "framer-motion";
import { Mail, Lock, User, Loader2, ArrowRight } from "lucide-react";

export default function SignUpPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isGithubLoading, setIsGithubLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const result = await signUp.email({
                email,
                password,
                name,
            });

            if (result.error) {
                setError(result.error.message || "Failed to create account");
                setIsLoading(false);
            } else {
                router.push("/");
                router.refresh();
            }
        } catch {
            setError("An unexpected error occurred");
            setIsLoading(false);
        }
    };

    const handleOAuthSignIn = async (provider: "google" | "github") => {
        if (provider === "google") setIsGoogleLoading(true);
        if (provider === "github") setIsGithubLoading(true);

        try {
            await signIn.social({
                provider,
                callbackURL: "/",
            });
        } catch {
            setError(`Failed to sign in with ${provider}`);
            setIsGoogleLoading(false);
            setIsGithubLoading(false);
        }
    };

    const getPasswordStrength = (pass: string) => {
        if (!pass) return { strength: 0, color: "bg-muted" };
        let s = 0;
        if (pass.length >= 8) s++;
        if (/[A-Z]/.test(pass)) s++;
        if (/[0-9]/.test(pass)) s++;
        if (/[^a-zA-Z0-9]/.test(pass)) s++;

        const colors = ["bg-destructive", "bg-orange-500", "bg-yellow-500", "bg-green-500"];
        return { strength: s, color: colors[s - 1] || "bg-muted" };
    };

    const strength = getPasswordStrength(password);

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background py-24">
            {/* Animated Background Orbs */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-green-950/30 via-background to-emerald-950/20" />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-20%] left-[-15%] w-[500px] h-[500px] bg-green-500/15 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[-15%] right-[-10%] w-[450px] h-[450px] bg-emerald-500/15 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.15, 0.3, 0.15],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
                    className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[80px]"
                />
            </div>

            {/* Auth Card */}
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 w-full max-w-md mx-4"
            >
                <div className="rounded-3xl border border-white/10 bg-card/40 backdrop-blur-2xl shadow-2xl shadow-black/20 overflow-hidden">
                    <div className="p-8 space-y-6">
                        {/* OAuth Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleOAuthSignIn("google")}
                                disabled={isGoogleLoading || isGithubLoading || isLoading}
                                className="flex items-center justify-center gap-2.5 h-12 rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 hover:border-primary/30 transition-all duration-300 disabled:opacity-50 cursor-pointer group"
                            >
                                {isGoogleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                )}
                                <span className="font-medium text-sm">Google</span>
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleOAuthSignIn("github")}
                                disabled={isGoogleLoading || isGithubLoading || isLoading}
                                className="flex items-center justify-center gap-2.5 h-12 rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 hover:border-primary/30 transition-all duration-300 disabled:opacity-50 cursor-pointer group"
                            >
                                {isGithubLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                )}
                                <span className="font-medium text-sm">GitHub</span>
                            </motion.button>
                        </div>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border/30" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-card/60 backdrop-blur-sm px-4 text-xs uppercase tracking-widest font-medium text-muted-foreground">
                                    or
                                </span>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-xl border border-destructive/20 text-center"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <div className="space-y-4">
                                {/* Name Field */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        Full Name
                                    </label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full h-12 bg-background/50 border border-border/50 rounded-xl pl-11 pr-4 outline-none focus:bg-background focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder:text-muted-foreground/40 text-sm"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Email Field */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        Email
                                    </label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full h-12 bg-background/50 border border-border/50 rounded-xl pl-11 pr-4 outline-none focus:bg-background focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder:text-muted-foreground/40 text-sm"
                                            placeholder="name@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        Password
                                    </label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full h-12 bg-background/50 border border-border/50 rounded-xl pl-11 pr-4 outline-none focus:bg-background focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder:text-muted-foreground/40 text-sm"
                                            placeholder="Min 8 characters"
                                            required
                                            minLength={8}
                                        />
                                    </div>
                                    {/* Password Strength Indicator */}
                                    {password && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="flex gap-1.5 pt-1"
                                        >
                                            {[1, 2, 3, 4].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`flex-1 h-1 rounded-full transition-colors duration-300 ${level <= strength.strength ? strength.color : "bg-muted/50"
                                                        }`}
                                                />
                                            ))}
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full h-12 overflow-hidden rounded-xl p-[1px] focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                            >
                                <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#A7F3D0_0%,#10B981_50%,#A7F3D0_100%)]" />
                                <span className="inline-flex h-full w-full items-center justify-center rounded-xl bg-background px-6 text-sm font-semibold backdrop-blur-3xl transition-all group-hover:bg-background/90 gap-2">
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Create Account
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </motion.button>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-5 bg-muted/20 border-t border-border/30 text-center">
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link
                                href="/signin"
                                className="font-semibold text-primary hover:text-primary/80 transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
