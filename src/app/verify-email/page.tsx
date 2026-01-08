"use client";

import { useEffect, useState, Suspense } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, CheckCircle2, Loader2, RefreshCw, LogOut, ArrowLeft } from "lucide-react";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const router = useRouter();
    const { data: session } = useSession();

    const [status, setStatus] = useState<"verifying" | "success" | "error" | "waiting">("waiting");
    const [message, setMessage] = useState("");
    const [isResending, setIsResending] = useState(false);
    const [resendStatus, setResendStatus] = useState("");

    useEffect(() => {
        if (token) {
            setStatus("verifying");
            const verify = async () => {
                try {
                    const { error } = await authClient.verifyEmail({
                        query: { token }
                    });

                    if (error) {
                        setStatus("error");
                        setMessage(error.message || "Failed to verify email");
                    } else {
                        setStatus("success");
                        setTimeout(() => router.push("/"), 2000);
                    }
                } catch {
                    setStatus("error");
                    setMessage("An unexpected error occurred");
                }
            };
            verify();
        } else {
            setStatus("error");
            setMessage("Please verify your email address to continue.");
        }
    }, [token, router]);

    const handleResendEmail = async () => {
        if (!session?.user?.email) return;

        setIsResending(true);
        setResendStatus("");

        try {
            const { error } = await authClient.sendVerificationEmail({
                email: session.user.email,
                callbackURL: "/verify-email"
            });

            if (error) {
                setResendStatus(error.message || "Failed to send email");
            } else {
                setResendStatus("Email sent! Check your inbox.");
            }
        } catch {
            setResendStatus("Error sending email");
        } finally {
            setIsResending(false);
        }
    };

    useEffect(() => {
        if (session?.user?.emailVerified && !token) {
            router.push("/");
        }
    }, [session, token, router]);

    if (status === "verifying") {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center space-y-4"
            >
                <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 border border-primary/20 flex items-center justify-center">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </div>
                </div>
                <div className="text-center space-y-1">
                    <h2 className="text-xl font-semibold text-foreground">Verifying Email</h2>
                    <p className="text-sm text-muted-foreground">Please wait while we verify your email...</p>
                </div>
            </motion.div>
        );
    }

    if (status === "success") {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center space-y-4"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center"
                >
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                </motion.div>
                <div className="text-center space-y-1">
                    <h2 className="text-xl font-semibold text-foreground">Email Verified!</h2>
                    <p className="text-sm text-muted-foreground">Redirecting you to the dashboard...</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Redirecting...
                </div>
            </motion.div>
        );
    }

    // Default view (No token / Error)
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Icon Header */}
            <div className="text-center space-y-4">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center"
                >
                    <Mail className="w-10 h-10 text-amber-500" />
                </motion.div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">Verify Your Email</h2>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        {token ? message : "You need to verify your email address to access your account."}
                    </p>
                    {session?.user?.email && (
                        <p className="text-xs font-medium text-primary">
                            {session.user.email}
                        </p>
                    )}
                </div>
            </div>

            {session ? (
                <div className="space-y-4">
                    {resendStatus && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-3 text-sm font-medium rounded-xl border text-center ${resendStatus.includes("sent")
                                    ? "text-green-600 bg-green-500/10 border-green-500/20"
                                    : "text-destructive bg-destructive/10 border-destructive/20"
                                }`}
                        >
                            {resendStatus}
                        </motion.div>
                    )}

                    {/* Resend Button */}
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleResendEmail}
                        disabled={isResending}
                        className="group relative w-full h-12 overflow-hidden rounded-xl p-[1px] focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                    >
                        <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#A7F3D0_0%,#10B981_50%,#A7F3D0_100%)]" />
                        <span className="inline-flex h-full w-full items-center justify-center rounded-xl bg-background px-6 text-sm font-semibold backdrop-blur-3xl transition-all group-hover:bg-background/90 gap-2">
                            {isResending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4" />
                                    Resend Verification Email
                                </>
                            )}
                        </span>
                    </motion.button>

                    {/* Sign Out Button */}
                    <button
                        onClick={async () => {
                            await authClient.signOut();
                            router.push("/signin");
                        }}
                        className="w-full flex items-center justify-center gap-2 h-10 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
                    >
                        <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        Sign Out
                    </button>
                </div>
            ) : (
                <button
                    onClick={async () => {
                        await authClient.signOut();
                        router.push("/signin");
                    }}
                    className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 hover:border-primary/30 transition-all duration-300 cursor-pointer group text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Sign In
                </button>
            )}
        </motion.div>
    );
}

export default function VerifyEmailPage() {
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

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 w-full max-w-md mx-4"
            >
                <div className="rounded-3xl border border-white/10 bg-card/40 backdrop-blur-2xl shadow-2xl shadow-black/20 overflow-hidden">
                    <div className="p-8">
                        <Suspense fallback={
                            <div className="flex flex-col items-center space-y-4">
                                <div className="w-20 h-20 rounded-2xl bg-muted/20 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                                </div>
                                <p className="text-sm text-muted-foreground">Loading...</p>
                            </div>
                        }>
                            <VerifyEmailContent />
                        </Suspense>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
