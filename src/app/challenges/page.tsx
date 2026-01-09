"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Trophy, Target, Users, Clock, Plus,
    Flame, Bike, Leaf, Zap, ArrowRight,
    Calendar, TrendingUp
} from "lucide-react";

const CHALLENGE_ICONS: Record<string, any> = {
    CYCLING: Bike,
    CARBON_SAVING: Leaf,
    PLASTIC_REDUCTION: Zap,
    VEGAN_MEALS: Flame,
    DEFAULT: Target,
};

const STATUS_COLORS: Record<string, string> = {
    UPCOMING: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    ACTIVE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    COMPLETED: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export default function ChallengesPage() {
    const [statusFilter, setStatusFilter] = useState<"ALL" | "UPCOMING" | "ACTIVE" | "COMPLETED">("ALL");

    const { data: challenges, isLoading } = trpc.challenge.getAll.useQuery(
        statusFilter === "ALL" ? {} : { status: statusFilter }
    );

    const filters = [
        { key: "ALL", label: "All Challenges", icon: Target },
        { key: "ACTIVE", label: "Active", icon: Flame },
        { key: "UPCOMING", label: "Upcoming", icon: Calendar },
        { key: "COMPLETED", label: "Completed", icon: Trophy },
    ];

    return (
        <div className="min-h-screen bg-background pt-24 px-6 pb-20">
            <div className="mx-auto max-w-7xl space-y-12">

                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 to-teal-900 p-8 lg:p-12">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBtLTI4IDBhMjggMjggMCAxIDAgNTYgMCAyOCAyOCAwIDEgMC01NiAwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9nPjwvc3ZnPg==')] opacity-50" />

                    <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                                    <Trophy className="w-8 h-8 text-yellow-400" />
                                </div>
                                <span className="text-white/80 font-medium uppercase tracking-wider text-sm">
                                    Community Challenges
                                </span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-bold text-white">
                                Join the Movement
                            </h1>
                            <p className="text-lg text-white/70 max-w-xl">
                                Participate in sustainability challenges, compete with others, and make a real impact on the environment.
                            </p>
                        </div>

                        <Link
                            href="/communities"
                            className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white text-emerald-900 font-bold transition-all hover:shadow-xl hover:shadow-white/10 hover:-translate-y-0.5"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Create Challenge</span>
                        </Link>
                    </div>

                    {/* Stats Row */}
                    <div className="relative z-10 mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { label: "Active Challenges", value: challenges?.filter((c: any) => c.status === "ACTIVE").length || 0, icon: Flame },
                            { label: "Total Participants", value: challenges?.reduce((sum: number, c: any) => sum + c.participantCount, 0) || 0, icon: Users },
                            { label: "Communities", value: new Set(challenges?.map((c: any) => c.communityId)).size || 0, icon: Target },
                        ].map((stat, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                                <stat.icon className="w-5 h-5 text-white/60 mb-2" />
                                <div className="text-2xl font-bold text-white">{stat.value}</div>
                                <div className="text-sm text-white/60">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-3">
                    {filters.map((filter) => {
                        const isActive = statusFilter === filter.key;
                        return (
                            <button
                                key={filter.key}
                                onClick={() => setStatusFilter(filter.key as typeof statusFilter)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all cursor-pointer ${isActive
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    }`}
                            >
                                <filter.icon className="w-4 h-4" />
                                {filter.label}
                            </button>
                        );
                    })}
                </div>

                {/* Challenges Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="h-80 rounded-3xl bg-muted animate-pulse" />
                        ))
                    ) : challenges?.length === 0 ? (
                        <div className="col-span-full py-20 text-center">
                            <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                                <Target className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-2xl font-bold">No challenges found</h3>
                            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                                {statusFilter === "ALL"
                                    ? "Be the first to create a community challenge!"
                                    : `No ${statusFilter.toLowerCase()} challenges at the moment.`
                                }
                            </p>
                            <Link
                                href="/communities"
                                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                Create a Challenge
                            </Link>
                        </div>
                    ) : (
                        challenges?.map((challenge: any, index: number) => {
                            const Icon = CHALLENGE_ICONS[challenge.type] || CHALLENGE_ICONS.DEFAULT;
                            const progress = challenge.progressPercentage || 0;
                            const daysLeft = Math.ceil(
                                (new Date(challenge.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                            );

                            return (
                                <motion.div
                                    key={challenge.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link href={`/challenges/${challenge.id}`} className="group block h-full">
                                        <div className="h-full rounded-3xl border border-border bg-card overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1 flex flex-col">
                                            {/* Header Gradient */}
                                            <div className="h-32 bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-cyan-500/20 relative overflow-hidden">
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Icon className="w-16 h-16 text-primary/30 group-hover:scale-110 transition-transform duration-500" />
                                                </div>
                                                <div className="absolute top-4 right-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${STATUS_COLORS[challenge.status]}`}>
                                                        {challenge.status}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-6 flex flex-col flex-1">
                                                <div className="flex items-start justify-between gap-4 mb-3">
                                                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                                                        {challenge.title}
                                                    </h3>
                                                </div>

                                                <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">
                                                    {challenge.description}
                                                </p>

                                                {/* Progress Bar */}
                                                <div className="mb-4">
                                                    <div className="flex items-center justify-between text-xs mb-2">
                                                        <span className="text-muted-foreground">Progress</span>
                                                        <span className="font-bold text-primary">{progress}%</span>
                                                    </div>
                                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${progress}%` }}
                                                            transition={{ duration: 1, delay: index * 0.1 }}
                                                            className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Footer Stats */}
                                                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1.5">
                                                            <Users className="w-4 h-4" />
                                                            <span>{challenge.participantCount}</span>
                                                        </div>
                                                        {challenge.status === "ACTIVE" && daysLeft > 0 && (
                                                            <div className="flex items-center gap-1.5">
                                                                <Clock className="w-4 h-4" />
                                                                <span>{daysLeft}d left</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-2 rounded-full bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                                        <ArrowRight className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
