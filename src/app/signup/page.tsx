"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp, signIn } from "@/lib/auth-client";
import { motion } from "framer-motion";
import { Leaf, Mail, Lock, User, Loader2, Check } from "lucide-react";

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
        if (!pass) return { strength: 0, label: "", color: "bg-muted" };
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
        <div className="flex min-h-screen w-full">

            {/* Left Side - Hero Image/Abstract (Hidden on mobile) */}
            <div className="hidden lg:flex flex-1 relative bg-black items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop')] bg-cover bg-center opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 to-emerald-900/40 mix-blend-multiply" />

                <div className="relative z-10 p-12 text-white max-w-xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl">
                                <Leaf className="w-8 h-8 text-green-400" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight">Greenly</h2>
                        </div>
                        <h1 className="text-5xl font-bold leading-tight mb-6">
                            Create your eco profile.
                        </h1>
                        <div className="space-y-4">
                            {['Track carbon footprint', 'Compete with friends', 'Earn sustainable rewards', 'Join global challenges'].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + (i * 0.1) }}
                                    className="flex items-center gap-3 text-lg text-white/90"
                                >
                                    <div className="p-1 rounded-full bg-green-500/20">
                                        <Check className="w-4 h-4 text-green-400" />
                                    </div>
                                    {item}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>


            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-background">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md space-y-8"
                >
                    <div className="text-center lg:text-left">
                        <Link href="/" className="lg:hidden inline-flex items-center gap-2 mb-8 group">
                            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                <Leaf className="w-6 h-6 text-primary group-hover:rotate-12 transition-transform" />
                            </div>
                            <span className="text-xl font-bold">Greenly</span>
                        </Link>
                        <h2 className="text-3xl font-bold tracking-tight">Get Started</h2>
                        <p className="text-muted-foreground mt-2">Create a new account to begin your journey</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleOAuthSignIn("google")}
                            disabled={isGoogleLoading || isGithubLoading || isLoading}
                            className="flex items-center justify-center gap-2 h-14 rounded-xl border border-input bg-background hover:bg-muted/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 disabled:opacity-50 group transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                        >
                            {isGoogleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                            )}
                            <span className="font-medium group-hover:text-foreground/80">Google</span>
                        </button>
                        <button
                            onClick={() => handleOAuthSignIn("github")}
                            disabled={isGoogleLoading || isGithubLoading || isLoading}
                            className="flex items-center justify-center gap-2 h-14 rounded-xl border border-input bg-background hover:bg-muted/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 disabled:opacity-50 group transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                        >
                            {isGithubLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                            )}
                            <span className="font-medium group-hover:text-foreground/80">GitHub</span>
                        </button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or register with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-lg border border-destructive/20 animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2 group">
                                <label className="text-sm font-medium leading-none transition-colors group-focus-within:text-primary" htmlFor="name">Full Name</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-3.5 text-muted-foreground transition-colors group-focus-within:text-primary">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="flex h-12 w-full rounded-xl border border-input bg-card pl-10 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-300 hover:border-primary/50 shadow-sm"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-sm font-medium leading-none transition-colors group-focus-within:text-primary" htmlFor="email">Email</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-3.5 text-muted-foreground transition-colors group-focus-within:text-primary">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="flex h-12 w-full rounded-xl border border-input bg-card pl-10 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-300 hover:border-primary/50 shadow-sm"
                                        placeholder="name@example.com"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-sm font-medium leading-none transition-colors group-focus-within:text-primary" htmlFor="password">Password</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-3.5 text-muted-foreground transition-colors group-focus-within:text-primary">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="flex h-12 w-full rounded-xl border border-input bg-card pl-10 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-300 hover:border-primary/50 shadow-sm"
                                        placeholder="Min 8 characters"
                                        required
                                        minLength={8}
                                    />
                                </div>
                                {/* Password Strength Indicator */}
                                {password && (
                                    <div className="flex gap-1 h-1 mt-2">
                                        {[1, 2, 3, 4].map(l => (
                                            <div key={l} className={`flex-1 rounded-full ${l <= strength.strength ? strength.color : 'bg-muted'} transition-colors duration-300`} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full inline-flex h-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-medium transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-base overflow-hidden cursor-pointer"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:animate-shine pointer-events-none" />
                        </button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/signin" className="font-semibold text-primary hover:text-primary/80 hover:underline underline-offset-4 pointer-events-auto transition-colors">
                            Sign in
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
