"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Search, Plus, Users, ArrowRight,
    Globe, Lock, Sparkles, TrendingUp,
    Target, Flame
} from "lucide-react";

export default function CommunitiesPage() {
    const [search, setSearch] = useState("");
    const { data: communities, isLoading } = trpc.community.getAll.useQuery({ search: search || undefined });

    // Calculate stats
    const totalMembers = communities?.reduce((sum: number, c: any) => sum + c.memberCount, 0) || 0;
    const totalCommunities = communities?.length || 0;

    return (
        <div className="min-h-screen bg-background pt-24 px-6 pb-20">
            <div className="mx-auto max-w-7xl space-y-12">

                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900 p-8 lg:p-12">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBtLTI4IDBhMjggMjggMCAxIDAgNTYgMCAyOCAyOCAwIDEgMC01NiAwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9nPjwvc3ZnPg==')] opacity-50" />

                    <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                                    <Users className="w-8 h-8 text-emerald-400" />
                                </div>
                                <span className="text-white/80 font-medium uppercase tracking-wider text-sm">
                                    Sustainability Communities
                                </span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-bold text-white">
                                Join Forces, Make Impact
                            </h1>
                            <p className="text-lg text-white/70 max-w-xl">
                                Connect with like-minded individuals, participate in community challenges, and amplify your environmental impact together.
                            </p>
                        </div>

                        <Link
                            href="/communities/create"
                            className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white text-emerald-900 font-bold transition-all hover:shadow-xl hover:shadow-white/10 hover:-translate-y-0.5"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Create Community</span>
                        </Link>
                    </div>

                    {/* Stats Row */}
                    <div className="relative z-10 mt-10 grid grid-cols-3 gap-4">
                        {[
                            { label: "Communities", value: totalCommunities, icon: Target },
                            { label: "Total Members", value: totalMembers, icon: Users },
                            { label: "Impact Together", value: "∞", icon: TrendingUp },
                        ].map((stat, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                                <stat.icon className="w-5 h-5 text-white/60 mb-2" />
                                <div className="text-2xl font-bold text-white">{stat.value}</div>
                                <div className="text-sm text-white/60">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-2xl mx-auto">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search communities by name or description..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-14 pl-14 pr-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-lg"
                    />
                </div>

                {/* Communities Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="h-72 rounded-3xl bg-muted animate-pulse" />
                        ))
                    ) : communities?.length === 0 ? (
                        <div className="col-span-full py-20 text-center">
                            <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                                <Users className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-2xl font-bold">No communities found</h3>
                            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                                {search
                                    ? "Try adjusting your search or create a new community!"
                                    : "Be the first to create a sustainability community!"
                                }
                            </p>
                            <Link
                                href="/communities/create"
                                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                Create Community
                            </Link>
                        </div>
                    ) : (
                        communities?.map((community: any, index: number) => (
                            <motion.div
                                key={community.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link
                                    href={`/communities/${community.slug}`}
                                    className="group block h-full"
                                >
                                    <div className="h-full rounded-3xl border border-border bg-card overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1 flex flex-col">
                                        {/* Cover Gradient */}
                                        <div className="h-32 bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-cyan-500/20 relative overflow-hidden">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Users className="w-16 h-16 text-primary/30 group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                            <div className="absolute top-4 right-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border flex items-center gap-1.5 ${community.isPrivate
                                                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                    : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                    }`}>
                                                    {community.isPrivate ? (
                                                        <><Lock className="w-3 h-3" /> Private</>
                                                    ) : (
                                                        <><Globe className="w-3 h-3" /> Public</>
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-6 flex flex-col flex-1">
                                            <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">
                                                {community.name}
                                            </h3>
                                            <p className="mt-2 text-muted-foreground text-sm line-clamp-2 flex-1">
                                                {community.description}
                                            </p>

                                            {/* Footer */}
                                            <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/50">
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1.5">
                                                        <Users className="w-4 h-4" />
                                                        <span className="font-medium">{community.memberCount}</span>
                                                    </div>
                                                    {community.totalCarbonSaved > 0 && (
                                                        <div className="flex items-center gap-1.5 text-emerald-500">
                                                            <Flame className="w-4 h-4" />
                                                            <span className="font-medium">{community.totalCarbonSaved.toFixed(0)} kg</span>
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
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
