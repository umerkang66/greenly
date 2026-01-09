"use client";

import { trpc } from "@/lib/trpc";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Users, Globe, Lock, Shield, UserPlus, Check, Trophy,
    Target, Plus, ArrowRight, Clock, Flame, ArrowLeft,
    TrendingUp, Medal, Leaf, Share2, Settings, MessageCircle
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { Feed } from "@/components/community/Feed";
import { CarbonForecast } from "@/components/community/CarbonForecast";
import { CommunityChat } from "@/components/community/CommunityChat";
import { MeetingList } from "@/components/community/MeetingList";
import { CreateMeetingModal } from "@/components/community/CreateMeetingModal";
import { MeetingRoom } from "@/components/community/MeetingRoom";
import { Video } from "lucide-react";

export default function CommunitySlugPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const slug = params?.slug as string;

    const { data: community, isLoading, refetch } = trpc.community.getBySlug.useQuery({ slug });
    const joinMutation = trpc.community.join.useMutation({
        onSuccess: () => refetch()
    });
    const leaveMutation = trpc.community.leave.useMutation({
        onSuccess: () => refetch()
    });

    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [inviteStatus, setInviteStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: "" });

    // Check URL for tab parameter (from notification click)
    const tabFromUrl = searchParams?.get("tab") as "overview" | "feed" | "chat" | "meetings" | null;
    const [activeTab, setActiveTab] = useState<"overview" | "feed" | "chat" | "meetings">(tabFromUrl || "overview");
    const [isCreateMeetingOpen, setIsCreateMeetingOpen] = useState(false);
    const [activeMeeting, setActiveMeeting] = useState<{ id: string; token: string; apiKey: string } | null>(null);

    // Update tab when URL changes
    useEffect(() => {
        if (tabFromUrl && ["overview", "feed", "chat", "meetings"].includes(tabFromUrl)) {
            setActiveTab(tabFromUrl);
        }
    }, [tabFromUrl]);

    // Search users query
    const { data: searchResults, isFetching: isSearching } = trpc.community.searchUsers.useQuery(
        { query: searchQuery },
        { enabled: searchQuery.length > 0 }
    );

    const inviteMutation = trpc.community.inviteUser.useMutation({
        onSuccess: () => {
            setSearchQuery("");
            setSelectedUserIds([]);
            setInviteStatus({ type: 'success', message: "Invitations sent successfully!" });
            setTimeout(() => setInviteStatus({ type: null, message: "" }), 3000);
        },
        onError: (err) => setInviteStatus({ type: 'error', message: err.message })
    });

    const startMeetingMutation = trpc.meeting.start.useMutation({
        onSuccess: (data, variables) => {
            setActiveMeeting({ id: variables.meetingId, token: data.token, apiKey: data.apiKey });
        }
    });

    const joinMeetingMutation = trpc.meeting.join.useMutation({
        onSuccess: (data, variables) => {
            setActiveMeeting({ id: variables.meetingId, token: data.token, apiKey: data.apiKey });
        }
    });

    const utils = trpc.useUtils();

    const endMeetingMutation = trpc.meeting.end.useMutation({
        onSuccess: () => {
            setActiveMeeting(null);
            // Invalidate the meetings list query to reflect the ended meeting
            utils.meeting.getByCommunity.invalidate();
        }
    });


    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (community && selectedUserIds.length > 0) {
            inviteMutation.mutate({ communityId: community.id, userIds: selectedUserIds });
        }
    };

    const toggleUserSelection = (userId: string) => {
        setSelectedUserIds(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const { data: leaderboard } = trpc.community.getLeaderboard.useQuery({ communityId: community?.id || "" }, {
        enabled: !!community?.id
    });

    const { data: challenges } = trpc.challenge.getByCommunity.useQuery({ communityId: community?.id || "" }, {
        enabled: !!community?.id
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!community) {
        return (
            <div className="min-h-screen pt-24 text-center">
                <h1 className="text-2xl font-bold">Community not found</h1>
                <Link href="/communities" className="text-primary hover:underline mt-4 inline-block">
                    Back to Communities
                </Link>
            </div>
        );
    }

    const handleJoin = () => {
        if (!session) {
            router.push("/signin");
            return;
        }
        joinMutation.mutate({ communityId: community.id });
    };

    const handleLeave = () => {
        leaveMutation.mutate({ communityId: community.id });
    };

    const activeChallenges = challenges?.filter((c: any) => c.status === "ACTIVE") || [];


    if (activeMeeting) {
        return (
            <MeetingRoom
                meetingId={activeMeeting.id}
                token={activeMeeting.token}
                apiKey={activeMeeting.apiKey}
                onLeave={(endForAll) => {
                    if (endForAll) {
                        endMeetingMutation.mutate({ meetingId: activeMeeting.id });
                    }
                    setActiveMeeting(null);
                }}
            />
        );
    }

    return (
        <div className="min-h-screen bg-background mt-[-70px]">
            {/* Hero Section */}
            <div className="relative h-[350px] lg:h-[420px] w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBtLTI4IDBhMjggMjggMCAxIDAgNTYgMCAyOCAyOCAwIDEgMC01NiAwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9nPjwvc3ZnPg==')] opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-900/40 to-transparent" />

                {/* Back Button */}
                <div className="absolute top-32 left-6 lg:left-12 z-20">
                    <Link
                        href="/communities"
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">All Communities</span>
                    </Link>
                </div>

                {/* Community Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-white/80">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border flex items-center gap-1.5 ${community.isPrivate
                                        ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                        }`}>
                                        {community.isPrivate ? (
                                            <><Lock className="w-3 h-3" /> Private</>
                                        ) : (
                                            <><Globe className="w-3 h-3" /> Public</>
                                        )}
                                    </span>
                                </div>

                                <h1 className="text-4xl lg:text-5xl font-bold text-white">
                                    {community.name}
                                </h1>

                                <div className="flex flex-wrap items-center gap-6 text-white/90">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5" />
                                        <span className="font-medium">{community.memberCount} Members</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-5 h-5" />
                                        <span className="font-medium">Admin: {community.members[0]?.user.name || 'Unknown'}</span>
                                    </div>
                                    {activeChallenges.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <Target className="w-5 h-5" />
                                            <span className="font-medium">{activeChallenges.length} Active Challenges</span>
                                        </div>
                                    )}
                                </div>
                            </div>



                            <div className="flex items-center gap-3">
                                {community.isMember ? (
                                    <>
                                        <button
                                            onClick={() => setIsInviteOpen(true)}
                                            className="px-5 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-900/20"
                                        >
                                            <UserPlus className="w-5 h-5" />
                                            Invite
                                        </button>
                                        <button
                                            className="px-6 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium hover:bg-white/20 transition-all flex items-center gap-2 cursor-default"
                                        >
                                            <Check className="w-5 h-5 text-emerald-400" />
                                            Joined
                                        </button>
                                        {community.isAdmin && (
                                            <button className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all cursor-pointer">
                                                <Settings className="w-5 h-5" />
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <button
                                        onClick={handleJoin}
                                        disabled={joinMutation.isPending}
                                        className="px-8 py-4 rounded-2xl bg-white text-emerald-900 font-bold text-lg hover:shadow-xl hover:shadow-white/10 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                                    >
                                        {joinMutation.isPending ? (
                                            "Joining..."
                                        ) : (
                                            <>
                                                <UserPlus className="w-5 h-5" />
                                                Join Community
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* Tabs */}
                <div className="flex items-center gap-6 border-b border-border/50 mb-8 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab("overview")}
                        className={`pb-4 px-2 font-bold text-sm lg:text-base transition-all relative whitespace-nowrap ${activeTab === "overview"
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Overview
                        {activeTab === "overview" && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("feed")}
                        className={`pb-4 px-2 font-bold text-sm lg:text-base transition-all relative flex items-center gap-2 whitespace-nowrap ${activeTab === "feed"
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <span className="flex items-center gap-1.5">
                            Community Feed
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] border border-emerald-500/20">New</span>
                        </span>
                        {activeTab === "feed" && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("chat")}
                        className={`pb-4 px-2 font-bold text-sm lg:text-base transition-all relative flex items-center gap-2 whitespace-nowrap ${activeTab === "chat"
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <span className="flex items-center gap-1.5">
                            <MessageCircle className="w-4 h-4" />
                            Chat
                            <span className="px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-[10px] border border-blue-500/20">Live</span>
                        </span>
                        {activeTab === "chat" && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("meetings")}
                        className={`pb-4 px-2 font-bold text-sm lg:text-base transition-all relative flex items-center gap-2 whitespace-nowrap ${activeTab === "meetings"
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <span className="flex items-center gap-1.5">
                            <Video className="w-4 h-4" />
                            Meetings
                        </span>
                        {activeTab === "meetings" && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                </div>

                {activeTab === "overview" ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">


                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-10">

                            {/* About Section */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-8 rounded-3xl border border-border bg-card"
                            >
                                <h2 className="text-2xl font-bold mb-4">About</h2>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    {community.description}
                                </p>
                            </motion.section>

                            {/* Impact Stats */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="p-8 rounded-3xl border border-border bg-card"
                            >
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                    <TrendingUp className="w-6 h-6 text-primary" />
                                    Community Impact
                                </h2>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-center">
                                        <Leaf className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                                        <div className="text-3xl font-bold text-primary">{community.totalCarbonSaved?.toFixed(0) || 0}</div>
                                        <div className="text-sm text-muted-foreground mt-1">kg CO2 Saved</div>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 text-center">
                                        <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                                        <div className="text-3xl font-bold text-primary">{activeChallenges.length}</div>
                                        <div className="text-sm text-muted-foreground mt-1">Active Challenges</div>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-center">
                                        <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                                        <div className="text-3xl font-bold text-primary">{community.memberCount}</div>
                                        <div className="text-sm text-muted-foreground mt-1">Contributors</div>
                                    </div>
                                </div>
                            </motion.section>

                            {/* Challenges Section */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        <Target className="w-6 h-6 text-primary" />
                                        Community Challenges
                                    </h2>
                                    {community.isAdmin && (
                                        <Link
                                            href={`/challenges/create?communityId=${community.id}`}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Create Challenge
                                        </Link>
                                    )}
                                </div>

                                {activeChallenges.length === 0 ? (
                                    <div className="p-10 rounded-3xl border-2 border-dashed border-border text-center bg-card/50">
                                        <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                        <h3 className="text-xl font-bold">No active challenges</h3>
                                        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                                            {community.isAdmin
                                                ? "Create a challenge to engage your community and track collective impact!"
                                                : "Check back later for new challenges from this community."
                                            }
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {activeChallenges.slice(0, 4).map((challenge: any, index: number) => {
                                            const daysLeft = Math.ceil(
                                                (new Date(challenge.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                                            );
                                            return (
                                                <motion.div
                                                    key={challenge.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                >
                                                    <Link
                                                        href={`/challenges/${challenge.id}`}
                                                        className="group block p-5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all"
                                                    >
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="p-2 rounded-xl bg-primary/10">
                                                                <Flame className="w-5 h-5 text-primary" />
                                                            </div>
                                                            <span className="text-xs font-bold text-emerald-500 uppercase px-2 py-1 bg-emerald-500/10 rounded-full">Active</span>
                                                        </div>
                                                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">
                                                            {challenge.title}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                                            {challenge.description}
                                                        </p>
                                                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50 text-sm text-muted-foreground">
                                                            <span className="flex items-center gap-1.5">
                                                                <Users className="w-4 h-4" />
                                                                {challenge.participantCount}
                                                            </span>
                                                            <span className="flex items-center gap-1.5">
                                                                <Clock className="w-4 h-4" />
                                                                {daysLeft}d left
                                                            </span>
                                                        </div>
                                                    </Link>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}

                                {activeChallenges.length > 4 && (
                                    <Link
                                        href={`/challenges?communityId=${community.id}`}
                                        className="flex items-center justify-center gap-2 py-3 text-primary hover:underline font-medium"
                                    >
                                        View all {activeChallenges.length} challenges
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                )}
                            </motion.section>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-8">
                            <CarbonForecast slug={community.slug} />

                            {/* Action Card */}
                            {community.isMember && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-6 rounded-3xl border border-border bg-card"
                                >
                                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
                                        <Check className="w-6 h-6 text-primary" />
                                        <span className="font-medium text-primary">You're a member!</span>
                                    </div>

                                    <div className="space-y-3">

                                        <button
                                            onClick={handleLeave}
                                            disabled={leaveMutation.isPending}
                                            className="w-full py-3 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all font-medium cursor-pointer"
                                        >
                                            {leaveMutation.isPending ? "Leaving..." : "Leave Community"}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Leaderboard */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="p-6 rounded-3xl border border-border bg-card"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-xl flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-yellow-500" />
                                        Top Contributors
                                    </h3>
                                    <Link href="/leaderboard" className="text-sm text-primary hover:underline">
                                        View all
                                    </Link>
                                </div>

                                <div className="space-y-3">
                                    {leaderboard?.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <p>No activity yet</p>
                                        </div>
                                    ) : (
                                        leaderboard?.slice(0, 5).map((member: any, index: number) => (
                                            <div
                                                key={member.userId}
                                                className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${session?.user?.id === member.userId
                                                    ? "bg-primary/10 border border-primary/20"
                                                    : "hover:bg-muted/50"
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${index === 0 ? 'bg-yellow-500/20 text-yellow-600' :
                                                    index === 1 ? 'bg-gray-400/20 text-gray-600' :
                                                        index === 2 ? 'bg-orange-500/20 text-orange-600' :
                                                            'bg-muted text-muted-foreground'
                                                    }`}>
                                                    {index < 3 ? (
                                                        <Medal className="w-5 h-5" />
                                                    ) : (
                                                        index + 1
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium truncate">{member.name}</div>
                                                    <div className="text-xs text-muted-foreground">{member.score} pts</div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                ) : activeTab === "feed" ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <Feed communityId={community.id} isMember={community.isMember} />
                    </motion.div>
                ) : activeTab === "chat" ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {community.isMember ? (
                            <CommunityChat communityId={community.id} />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[400px] text-center p-8 rounded-3xl border border-border bg-card">
                                <MessageCircle className="w-12 h-12 text-muted-foreground/30 mb-4" />
                                <h3 className="text-lg font-bold mb-2">Join to Chat</h3>
                                <p className="text-muted-foreground text-sm mb-4">You need to be a member to participate in the community chat.</p>
                                <button
                                    onClick={handleJoin}
                                    disabled={joinMutation.isPending}
                                    className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
                                >
                                    {joinMutation.isPending ? "Joining..." : "Join Community"}
                                </button>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <MeetingList
                            communityId={community.id}
                            isAdmin={community.isAdmin}
                            onStartMeeting={(id) => startMeetingMutation.mutate({ meetingId: id })}
                            onJoinMeeting={(id) => joinMeetingMutation.mutate({ meetingId: id })}
                            onCreateClick={() => setIsCreateMeetingOpen(true)}
                        />
                    </motion.div>
                )}
            </div>
            {/* Invite Modal */}
            {isInviteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card text-card-foreground rounded-3xl p-6 w-full max-w-lg border border-border shadow-2xl relative flex flex-col max-h-[85vh]">
                        <button
                            onClick={() => setIsInviteOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
                        >
                            <Plus className="w-5 h-5 rotate-45" />
                        </button>

                        <div className="text-center mb-6 shrink-0">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
                                <UserPlus className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h2 className="text-xl font-bold">Invite Friends</h2>
                            <p className="text-sm text-muted-foreground mt-1">Search and select users to invite to {community.name}.</p>
                        </div>

                        {inviteStatus.message && (
                            <div className={`mb-4 p-3 rounded-lg text-sm font-medium text-center animate-in fade-in slide-in-from-top-2 ${inviteStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'
                                }`}>
                                {inviteStatus.message}
                            </div>
                        )}

                        <form onSubmit={handleInvite} className="flex-1 flex flex-col min-h-0">
                            {/* Search Input */}
                            <div className="mb-4 shrink-0">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-4 py-3 pl-11 rounded-xl border border-border bg-muted/30 focus:bg-background focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                                        placeholder="Search by name or email..."
                                        autoFocus
                                    />
                                    <Users className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                                </div>
                            </div>

                            {/* Search Results */}
                            <div className="flex-1 overflow-y-auto min-h-[200px] border rounded-xl border-border bg-muted/10 p-2 mb-4">
                                {isSearching ? (
                                    <div className="flex justify-center p-8">
                                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : searchQuery.length > 0 && searchResults?.length === 0 ? (
                                    <div className="text-center p-8 text-muted-foreground text-sm">
                                        No users found
                                    </div>
                                ) : searchResults ? (
                                    <div className="space-y-1">
                                        {searchResults.map((user: any) => (
                                            <div
                                                key={user.id}
                                                onClick={() => toggleUserSelection(user.id)}
                                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedUserIds.includes(user.id)
                                                    ? "bg-emerald-500/10 border border-emerald-500/30"
                                                    : "hover:bg-muted"
                                                    }`}
                                            >
                                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${selectedUserIds.includes(user.id)
                                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                                    : "border-muted-foreground/30 bg-background"
                                                    }`}>
                                                    {selectedUserIds.includes(user.id) && <Check className="w-3.5 h-3.5" />}
                                                </div>

                                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                                                    {user.image ? (
                                                        <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-xs font-bold">{user.name?.[0]?.toUpperCase()}</span>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0 text-left">
                                                    <div className="font-medium text-sm truncate">{user.name}</div>
                                                    <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center p-8 text-muted-foreground text-sm flex flex-col items-center gap-2">
                                        <Users className="w-8 h-8 opacity-20" />
                                        <p>Type to search users...</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex gap-3 pt-2 shrink-0 border-t border-border mt-auto">
                                <button
                                    type="button"
                                    onClick={() => setIsInviteOpen(false)}
                                    className="px-4 py-3 rounded-xl hover:bg-muted font-bold transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={inviteMutation.isPending || selectedUserIds.length === 0}
                                    className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:shadow-none ml-auto text-sm"
                                >
                                    {inviteMutation.isPending
                                        ? "Sending..."
                                        : `Invite ${selectedUserIds.length > 0 ? `(${selectedUserIds.length})` : ""}`
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <CreateMeetingModal
                communityId={community.id}
                isOpen={isCreateMeetingOpen}
                onClose={() => setIsCreateMeetingOpen(false)}
                onSuccess={() => utils.meeting.getByCommunity.invalidate()}
            />
        </div>
    );
}
