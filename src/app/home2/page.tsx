"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
    Leaf,
    Wind,
    Droplets,
    Zap,
    Users,
    Trophy,
    ArrowRight,
    Activity,
    BarChart3,
    Globe
} from "lucide-react";

// --- Hero Section Component ---
function Hero() {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);

    return (
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden pt-20">
            {/* Animated Background Mesh */}
            <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-200/50 dark:bg-green-900/40 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-lighten animate-blob" />
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-200/50 dark:bg-emerald-900/40 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-lighten animate-blob animation-delay-2000" />
                <div className="absolute -bottom-32 left-[20%] w-[60%] h-[60%] bg-teal-200/50 dark:bg-teal-900/40 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-lighten animate-blob animation-delay-4000" />
            </div>

            <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center text-center space-y-8">


                <motion.h1
                    className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground max-w-5xl"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                    Track Your Impact,<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400 dark:from-green-400 dark:to-emerald-200">
                        Heal the Planet.
                    </span>
                </motion.h1>

                <motion.p
                    className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                >
                    Join a global community committed to reducing carbon footprints. Monitor, connect, and thrive with Greenly.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center gap-4 mt-8"
                >
                    <Link href="/signup" className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-primary-foreground transition-all duration-200 bg-primary rounded-full hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary overflow-hidden shadow-lg shadow-green-500/20">
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-shine" />
                        Get Started Free
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link href="/signin" className="px-8 py-4 text-lg font-medium text-foreground transition-colors hover:text-primary">
                        Log in existing account
                    </Link>
                </motion.div>

                {/* Floating Elements controlled by Scroll */}
                <motion.div style={{ y: y1, x: -20 }} className="absolute left-10 top-32 hidden xl:block opacity-60">
                    <FloatingCard icon={<Leaf className="w-6 h-6 text-green-500" />} label="12kg Saver" />
                </motion.div>
                <motion.div style={{ y: y2, x: 20 }} className="absolute right-10 bottom-40 hidden xl:block opacity-60">
                    <FloatingCard icon={<Trophy className="w-6 h-6 text-yellow-500" />} label="Top 5%" />
                </motion.div>
            </div>
        </section>
    );
}

function FloatingCard({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <div className="flex items-center gap-3 bg-card/80 backdrop-blur-md border border-border p-4 rounded-2xl shadow-xl">
            <div className="p-2 bg-background rounded-full shadow-sm">
                {icon}
            </div>
            <span className="font-semibold text-sm">{label}</span>
        </div>
    )
}

// --- Bento Grid Components ---

function BentoCard({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay }}
            className={`bg-card border border-border p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden relative group ${className}`}
        >
            {children}
        </motion.div>
    );
}

export default function Home() {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-green-500/20 selection:text-green-900 overflow-x-hidden">

            <Hero />

            {/* Main Features Bento Grid */}
            <section className="container px-4 py-24 md:px-6 mx-auto">
                <div className="flex flex-col items-center text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Everything you need to go zero</h2>
                    <p className="text-xl text-muted-foreground max-w-2xl">Powering your journey to sustainability with data, community, and gamification.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-auto md:h-[600px]">

                    {/* Large Card: Tracker */}
                    <BentoCard className="md:col-span-2 md:row-span-2 relative flex flex-col justify-between group overflow-hidden bg-gradient-to-br from-card to-secondary/5">
                        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-700">
                            <BarChart3 size={300} />
                        </div>

                        <div className="relative z-10 space-y-4 max-w-md">
                            <div className="p-3 w-fit rounded-xl bg-green-500/10 text-green-600 dark:text-green-400">
                                <Activity size={32} />
                            </div>
                            <h3 className="text-3xl font-bold">Precision Carbon Tracking</h3>
                            <p className="text-muted-foreground text-lg">
                                Log your daily activities across transport, diet, and energy. visualizing your impact has never been this beautiful.
                            </p>
                            <ul className="space-y-2 mt-4">
                                {['Real-time analytics', 'Smart categorized logging', 'Impact equivalents'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm font-medium">
                                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Mock Graph Visual */}
                        <div className="relative h-48 mt-8 w-full bg-background/50 rounded-xl border border-border/50 p-4 flex items-end gap-2 overflow-hidden shadow-inner">
                            {[40, 65, 45, 80, 55, 90, 70, 85].map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    whileInView={{ height: `${h}%` }}
                                    transition={{ duration: 1, delay: i * 0.1, ease: "backOut" }}
                                    className="flex-1 bg-green-500/80 rounded-t-sm hover:bg-green-400 transition-colors"
                                />
                            ))}
                        </div>
                    </BentoCard>

                    {/* Medium Card: Community */}
                    <BentoCard className="md:col-span-1 md:row-span-1 bg-blue-500/5 hover:bg-blue-500/10 transition-colors cursor-pointer" delay={0.2}>
                        <div className="flex justify-between items-start">
                            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600">
                                <Users size={24} />
                            </div>
                            <ArrowRight className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                        <h3 className="text-xl font-bold mt-4">Global Community</h3>
                        <p className="text-sm text-muted-foreground mt-2">Join 50k+ eco-warriors comparing progress.</p>

                        <div className="flex -space-x-3 mt-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                    U{i}
                                </div>
                            ))}
                            <div className="w-10 h-10 rounded-full border-2 border-background bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                +2k
                            </div>
                        </div>
                    </BentoCard>

                    {/* Medium Card: Challenges */}
                    <BentoCard className="md:col-span-1 md:row-span-1 bg-yellow-500/5 hover:bg-yellow-500/10 transition-colors cursor-pointer" delay={0.3}>
                        <div className="flex justify-between items-start">
                            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-600">
                                <Trophy size={24} />
                            </div>
                            <div className="px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-[10px] font-bold text-yellow-700 dark:text-yellow-300 uppercase">
                                New
                            </div>
                        </div>
                        <h3 className="text-xl font-bold mt-4">Monthly Challenges</h3>
                        <p className="text-sm text-muted-foreground mt-2">Compete, earn badges, and plant real trees.</p>

                        <div className="mt-6 w-full bg-background/50 h-2 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: "75%" }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-yellow-500 rounded-full"
                            />
                        </div>
                        <div className="flex justify-between text-xs mt-2 font-medium text-muted-foreground">
                            <span>Progress</span>
                            <span>75%</span>
                        </div>
                    </BentoCard>
                </div>
            </section>

            {/* Ticker / Brands Section */}
            <section className="py-12 border-y border-border/50 bg-muted/30 overflow-hidden">
                <div className="container mx-auto px-4">
                    <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-8">Trusted by sustainable innovators</p>
                    <div className="relative flex overflow-x-hidden group">
                        <div className="animate-marquee whitespace-nowrap flex gap-16 items-center">
                            {['EcoLabs', 'GreenFuture', 'CleanTech', 'Sustainable.io', 'CarbonZero', 'FutureEarth', 'NatureFirst'].map((brand, i) => (
                                <span key={i} className="text-2xl font-bold text-muted-foreground/40 hover:text-green-500/60 transition-colors cursor-default">
                                    {brand}
                                </span>
                            ))}
                            {/* Duplicate for infinite loop */}
                            {['EcoLabs', 'GreenFuture', 'CleanTech', 'Sustainable.io', 'CarbonZero', 'FutureEarth', 'NatureFirst'].map((brand, i) => (
                                <span key={`dup-${i}`} className="text-2xl font-bold text-muted-foreground/40 hover:text-green-500/60 transition-colors cursor-default">
                                    {brand}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 container mx-auto px-4 text-center">
                <div className="max-w-3xl mx-auto space-y-8 p-12 rounded-[3rem] bg-gradient-to-b from-green-900/10 to-transparent border border-green-500/20">
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Ready to verify your impact?</h2>
                    <p className="text-xl text-muted-foreground">Join the platform that turns sustainability into a habit. Start for free today.</p>
                    <div className="flex justify-center gap-4">
                        <Link href="/signup" className="px-10 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg hover:shadow-lg hover:shadow-primary/25 transition-all transform hover:-translate-y-1">
                            Start Your Journey
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
}
