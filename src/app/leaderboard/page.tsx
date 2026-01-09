"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/lib/auth-client";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Trophy, Users, Medal, Crown,
    TrendingUp, Target, Flame, ArrowRight,
    Sparkles, ChevronRight, Leaf
} from "lucide-react";

type Tab = "individual" | "communities";

export default function LeaderboardPage() {
    const [activeTab, setActiveTab] = useState<Tab>("individual");
    const { data: session } = useSession();

    const { data: individualLeaderboard, isLoading: loadingIndividual } =
        trpc.leaderboard.getIndividual.useQuery({ limit: 50 }, { refetchOnMount: true });

    const { data: communityLeaderboard, isLoading: loadingCommunities } =
        trpc.leaderboard.getCommunities.useQuery({ limit: 50 }, { refetchOnMount: true });

    const { data: userRank } = trpc.leaderboard.getUserRank.useQuery(
        { userId: session?.user?.id || "" },
        { enabled: !!session?.user?.id, refetchOnMount: true }
    );

    const tabs = [
        { key: "individual" as Tab, label: "Top Users", icon: Users },
        { key: "communities" as Tab, label: "Top Communities", icon: Target },
    ];

    const totalPointsCalculated = individualLeaderboard?.reduce((acc: number, curr: any) => acc + (curr.points || 0), 0) || 0;

    return (
        <div className="min-h-screen bg-background pt-24 px-6 pb-20">
            <div className="mx-auto max-w-5xl space-y-12">

                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900 p-8 lg:p-12">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBtLTI4IDBhMjggMjggMCAxIDAgNTYgMCAyOCAyOCAwIDEgMC01NiAwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9nPjwvc3ZnPg==')] opacity-50" />

                    <div className="relative z-10 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", bounce: 0.5 }}
                            className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/30"
                        >
                            <Trophy className="w-10 h-10 text-white" />
                        </motion.div>

                        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                            Leaderboard
                        </h1>
                        <p className="text-lg text-white/70 max-w-xl mx-auto">
                            See who's leading the charge in sustainability. Compete, climb the ranks, and make a difference!
                        </p>

                        {/* User's Rank Card */}
                        {session && userRank && 'percentile' in userRank && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="mt-8 inline-flex items-center gap-6 px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20"
                            >
                                <div className="text-left">
                                    <div className="text-sm text-white/60">Your Rank</div>
                                    <div className="text-3xl font-bold text-white flex items-center gap-2">
                                        #{userRank.rank}
                                        <Sparkles className="w-5 h-5 text-emerald-400" />
                                    </div>
                                </div>
                                <div className="w-px h-10 bg-white/20" />
                                <div className="text-left">
                                    <div className="text-sm text-white/60">Points</div>
                                    <div className="text-3xl font-bold text-white">{userRank.points || 0}</div>
                                </div>
                                <div className="w-px h-10 bg-white/20" />
                                <div className="text-left">
                                    <div className="text-sm text-white/60">Top</div>
                                    <div className="text-3xl font-bold text-emerald-400">{userRank.percentile}%</div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Stats Row */}
                    <div className="relative z-10 mt-10 grid grid-cols-3 gap-4">
                        {[
                            { label: "Total Users", value: individualLeaderboard?.length || 0, icon: Users },
                            { label: "Communities", value: communityLeaderboard?.length || 0, icon: Target },
                            { label: "Total Points", value: totalPointsCalculated.toLocaleString(), icon: Leaf },
                        ].map((stat, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                                <stat.icon className="w-5 h-5 text-white/60 mb-2" />
                                <div className="text-2xl font-bold text-white">{stat.value}</div>
                                <div className="text-sm text-white/60">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex justify-center gap-3">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all cursor-pointer ${isActive
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Leaderboard Content */}
                <div className="space-y-4">
                    {activeTab === "individual" ? (
                        loadingIndividual ? (
                            [...Array(10)].map((_, i) => (
                                <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
                            ))
                        ) : (
                            <>
                                {/* Top 3 Podium */}
                                {individualLeaderboard && individualLeaderboard.length >= 3 && (
                                    <div className="grid grid-cols-3 gap-4 mb-8">
                                        {[1, 0, 2].map((podiumIndex) => {
                                            const user = individualLeaderboard[podiumIndex];
                                            if (!user) return null;

                                            const isFirst = podiumIndex === 0;
                                            const isSecond = podiumIndex === 1;

                                            return (
                                                <motion.div
                                                    key={user.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: podiumIndex * 0.1 }}
                                                    className={`relative p-6 rounded-3xl border text-center ${isFirst
                                                        ? "bg-gradient-to-b from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 order-2"
                                                        : isSecond
                                                            ? "bg-gradient-to-b from-teal-500/20 to-teal-500/5 border-teal-500/30 order-1"
                                                            : "bg-gradient-to-b from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 order-3"
                                                        } ${isFirst ? "scale-105" : ""}`}
                                                >
                                                    <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-3 ${isFirst ? "bg-emerald-500" :
                                                        isSecond ? "bg-teal-500" : "bg-cyan-500"
                                                        }`}>
                                                        {isFirst ? (
                                                            <Crown className="w-7 h-7 text-white" />
                                                        ) : (
                                                            <Medal className="w-7 h-7 text-white" />
                                                        )}
                                                    </div>
                                                    <div className="text-lg font-bold truncate">{user.name}</div>
                                                    <div className="text-2xl font-bold text-primary mt-1">{user.points}</div>
                                                    <div className="text-sm text-muted-foreground">points</div>
                                                    {user.topBadges.length > 0 && (
                                                        <div className="flex justify-center gap-1 mt-3">
                                                            {user.topBadges.map((badge: string, i: number) => (
                                                                <span key={i} className="text-lg">{badge}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Rest of Leaderboard */}
                                <div className="space-y-3">
                                    {individualLeaderboard?.slice(3).map((user: any, index: number) => (
                                        <motion.div
                                            key={user.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${session?.user?.id === user.id
                                                ? "bg-primary/10 border-primary/30"
                                                : "bg-card border-border hover:border-primary/20"
                                                }`}
                                        >
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center font-bold text-lg text-primary">
                                                {user.rank}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">{user.name}</div>
                                                {user.topBadges.length > 0 && (
                                                    <div className="flex gap-1 mt-0.5">
                                                        {user.topBadges.map((badge: string, i: number) => (
                                                            <span key={i} className="text-sm">{badge}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-primary">{user.points}</div>
                                                <div className="text-xs text-muted-foreground">points</div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {individualLeaderboard?.length === 0 && (
                                    <div className="text-center py-16 bg-card rounded-3xl border border-border">
                                        <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                        <h3 className="text-xl font-bold">No rankings yet</h3>
                                        <p className="text-muted-foreground mt-2">
                                            Start tracking activities to appear on the leaderboard!
                                        </p>
                                    </div>
                                )}
                            </>
                        )
                    ) : (
                        loadingCommunities ? (
                            [...Array(10)].map((_, i) => (
                                <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
                            ))
                        ) : (
                            <div className="space-y-4">
                                {communityLeaderboard?.map((community: any, index: number) => (
                                    <motion.div
                                        key={community.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Link
                                            href={`/communities/${community.slug}`}
                                            className="group flex items-center gap-4 p-5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all"
                                        >
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl ${index === 0 ? "bg-gradient-to-br from-emerald-500/30 to-teal-500/30 text-emerald-500 border border-emerald-500/30" :
                                                index === 1 ? "bg-gradient-to-br from-teal-500/30 to-cyan-500/30 text-teal-500 border border-teal-500/30" :
                                                    index === 2 ? "bg-gradient-to-br from-cyan-500/30 to-blue-500/30 text-cyan-500 border border-cyan-500/30" :
                                                        "bg-muted text-muted-foreground"
                                                }`}>
                                                {index < 3 ? (
                                                    <Trophy className="w-6 h-6" />
                                                ) : (
                                                    index + 1
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-lg group-hover:text-primary transition-colors truncate">
                                                    {community.name}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-4 h-4" />
                                                        {community.memberCount} members
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Flame className="w-4 h-4" />
                                                        {community.challengeCount} challenges
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-primary">{community.totalPoints}</div>
                                                <div className="text-xs text-muted-foreground">total points</div>
                                            </div>

                                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                        </Link>
                                    </motion.div>
                                ))}

                                {communityLeaderboard?.length === 0 && (
                                    <div className="text-center py-16 bg-card rounded-3xl border border-border">
                                        <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                        <h3 className="text-xl font-bold">No communities yet</h3>
                                        <p className="text-muted-foreground mt-2">
                                            Create or join a community to see rankings!
                                        </p>
                                        <Link
                                            href="/communities/create"
                                            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-all"
                                        >
                                            Create Community
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
