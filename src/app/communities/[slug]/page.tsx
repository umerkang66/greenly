"use client";

import { trpc } from "@/lib/trpc";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Globe, Lock, Shield, UserPlus, Check, Trophy } from "lucide-react";
import Image from "next/image";

export default function CommunitySlugPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;

    const { data: community, isLoading, refetch } = trpc.community.getBySlug.useQuery({ slug });
    const joinMutation = trpc.community.join.useMutation({
        onSuccess: () => refetch()
    });
    const leaveMutation = trpc.community.leave.useMutation({
        onSuccess: () => refetch()
    });

    // For MVP, using same query for leaderboard or a separate one?
    const { data: leaderboard } = trpc.community.getLeaderboard.useQuery({ communityId: community?.id || "" }, {
        enabled: !!community?.id
    });

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
    if (!community) return <div className="min-h-screen pt-24 text-center">Community not found</div>;

    const handleJoin = () => {
        joinMutation.mutate({ communityId: community.id });
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative h-[300px] lg:h-[400px] w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 to-teal-900" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end gap-6 justify-between">
                        <div>
                            <div className="flex items-center gap-3 text-white/80 mb-2">
                                {community.isPrivate ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                                <span className="text-sm font-medium uppercase tracking-wider">{community.isPrivate ? "Private Group" : "Public Community"}</span>
                            </div>
                            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">{community.name}</h1>
                            <div className="flex items-center gap-6 text-white/90">
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    <span className="font-medium">{community.memberCount} Members</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="w-5 h-5" />
                                    <span className="font-medium">Admin: {community.members[0]?.user.name || 'Unknown'}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            {community.isMember ? (
                                <button className="px-8 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium hover:bg-white/20 transition-all flex items-center gap-2">
                                    <Check className="w-5 h-5" />
                                    Joined
                                </button>
                            ) : (
                                <button
                                    onClick={handleJoin}
                                    disabled={joinMutation.isPending}
                                    className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                                >
                                    {joinMutation.isPending ? "Joining..." : <> <UserPlus className="w-5 h-5" /> Join Community </>}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* Left Column: About */}
                <div className="lg:col-span-2 space-y-12">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">About</h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            {community.description}
                        </p>
                    </section>

                    <section className="bg-card border border-border rounded-2xl p-8">
                        <h2 className="text-2xl font-bold mb-6">Community Impact</h2>
                        <div className="grid grid-cols-3 gap-6 text-center">
                            <div className="p-4 rounded-xl bg-primary/5">
                                <div className="text-3xl font-bold text-primary">0</div>
                                <div className="text-sm text-muted-foreground mt-1">kg CO2 Saved</div>
                            </div>
                            <div className="p-4 rounded-xl bg-primary/5">
                                <div className="text-3xl font-bold text-primary">0</div>
                                <div className="text-sm text-muted-foreground mt-1">Active Challenges</div>
                            </div>
                            <div className="p-4 rounded-xl bg-primary/5">
                                <div className="text-3xl font-bold text-primary">{community.memberCount}</div>
                                <div className="text-sm text-muted-foreground mt-1">Contributors</div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Leaderboard / Members */}
                <div className="space-y-8">
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-xl flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                Top Contributors
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {leaderboard?.map((member: any, index: number) => (
                                <div key={member.userId} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-500/20 text-yellow-600' :
                                        index === 1 ? 'bg-gray-400/20 text-gray-600' :
                                            index === 2 ? 'bg-orange-500/20 text-orange-600' : 'bg-muted text-muted-foreground'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium">{member.name}</div>
                                        <div className="text-xs text-muted-foreground">{member.score} pts</div>
                                    </div>
                                </div>
                            ))}

                            {!leaderboard?.length && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No data yet
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
