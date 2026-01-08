"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Plus, Users, ArrowRight } from "lucide-react";

export default function CommunitiesPage() {
    const [search, setSearch] = useState("");
    const { data: communities, isLoading } = trpc.community.getAll.useQuery({ search: search || undefined });

    return (
        <div className="min-h-screen bg-background pt-24 px-6 pb-20">
            <div className="mx-auto max-w-7xl space-y-12">

                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">Communities</h1>
                        <p className="mt-2 text-muted-foreground text-lg">
                            Join forces with others to amplify your impact.
                        </p>
                    </div>
                    <Link
                        href="/communities/create"
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium transition-all hover:opacity-90 hover:shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create Community</span>
                    </Link>
                </div>

                {/* Search */}
                <div className="relative max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search communities..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-input bg-card/50 backdrop-blur-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse border border-border/50" />
                        ))
                    ) : communities?.length === 0 ? (
                        <div className="col-span-full py-20 text-center">
                            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                <Users className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold">No communities found</h3>
                            <p className="text-muted-foreground mt-2">Try searching for something else or create your own!</p>
                        </div>
                    ) : (
                        communities?.map((community: any) => (
                            <Link
                                key={community.id}
                                href={`/communities/${community.slug}`}
                                className="group block h-full"
                            >
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="h-full rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col"
                                >
                                    {/* Cover Image Placeholder */}
                                    <div className="h-32 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 relative group-hover:scale-105 transition-transform duration-500 origin-top">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Users className="w-12 h-12 text-primary/40" />
                                        </div>
                                    </div>

                                    <div className="p-6 flex flex-col flex-1">
                                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{community.name}</h3>
                                        <p className="mt-2 text-muted-foreground text-sm line-clamp-2 flex-1">
                                            {community.description}
                                        </p>

                                        <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/50">
                                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                                <Users className="w-4 h-4" />
                                                <span>{community.memberCount} members</span>
                                            </div>
                                            <div className="p-2 rounded-full bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
