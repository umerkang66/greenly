"use client";

import { trpc } from "@/lib/trpc";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Trophy, Target, Users, Clock, ArrowLeft,
    Flame, Bike, Leaf, Zap, CheckCircle2,
    TrendingUp, Medal, Calendar
} from "lucide-react";
import { useSession } from "@/lib/auth-client";

const CHALLENGE_ICONS: Record<string, any> = {
    CYCLING: Bike,
    CARBON_SAVING: Leaf,
    PLASTIC_REDUCTION: Zap,
    VEGAN_MEALS: Flame,
    DEFAULT: Target,
};

export default function ChallengeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const id = params?.id as string;

    const { data: challenge, isLoading, refetch } = trpc.challenge.getById.useQuery({ id });

    const joinMutation = trpc.challenge.join.useMutation({
        onSuccess: () => refetch(),
    });

    const leaveMutation = trpc.challenge.leave.useMutation({
        onSuccess: () => refetch(),
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!challenge) {
        return (
            <div className="min-h-screen pt-24 text-center">
                <h1 className="text-2xl font-bold">Challenge not found</h1>
                <Link href="/challenges" className="text-primary hover:underline mt-4 inline-block">
                    Back to Challenges
                </Link>
            </div>
        );
    }

    const Icon = CHALLENGE_ICONS[challenge.type] || CHALLENGE_ICONS.DEFAULT;
    const daysLeft = Math.ceil(
        (new Date(challenge.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    const isEnded = daysLeft <= 0;

    const handleJoin = () => {
        if (!session) {
            router.push("/signin");
            return;
        }
        joinMutation.mutate({ challengeId: challenge.id });
    };

    const handleLeave = () => {
        leaveMutation.mutate({ challengeId: challenge.id });
    };

    return (
        <div className="min-h-screen bg-background mt-[-70px]">
            {/* Hero Section */}
            <div className="relative h-[350px] lg:h-[450px] w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBtLTI4IDBhMjggMjggMCAxIDAgNTYgMCAyOCAyOCAwIDEgMC01NiAwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9nPjwvc3ZnPg==')] opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-900/40 to-transparent" />

                {/* Back Button */}
                <div className="absolute top-24 left-6 lg:left-12 z-20">
                    <Link
                        href="/challenges"
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium hidden sm:inline">All Challenges</span>
                    </Link>
                </div>

                {/* Challenge Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-3 text-white/80 mb-4">
                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${challenge.status === "ACTIVE"
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                : challenge.status === "UPCOMING"
                                    ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                    : "bg-gray-500/20 text-gray-300 border-gray-500/30"
                                }`}>
                                {challenge.status}
                            </div>
                            <span className="text-sm">•</span>
                            <Link
                                href={`/communities/${challenge.community.slug}`}
                                className="text-sm hover:text-white transition-colors"
                            >
                                {challenge.community.name}
                            </Link>
                        </div>

                        <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4">
                            {challenge.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-white/90">
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                <span className="font-medium">{challenge.participantCount} Participants</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Target className="w-5 h-5" />
                                <span className="font-medium">{challenge.goalValue} {challenge.metric}</span>
                            </div>
                            {challenge.status === "ACTIVE" && !isEnded && (
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    <span className="font-medium">{daysLeft} days left</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Progress Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 sm:p-6 lg:p-8 rounded-3xl border border-border bg-card"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Challenge Progress</h2>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
                                <TrendingUp className="w-5 h-5" />
                                <span className="font-bold">{challenge.progressPercentage.toFixed(1)}%</span>
                            </div>
                        </div>

                        {/* Progress Circle */}
                        <div className="flex items-center justify-center mb-8">
                            <div className="relative w-48 h-48">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="96"
                                        cy="96"
                                        r="88"
                                        className="stroke-muted fill-none"
                                        strokeWidth="12"
                                    />
                                    <motion.circle
                                        cx="96"
                                        cy="96"
                                        r="88"
                                        className="stroke-primary fill-none"
                                        strokeWidth="12"
                                        strokeLinecap="round"
                                        initial={{ strokeDasharray: "0 553" }}
                                        animate={{
                                            strokeDasharray: `${(challenge.progressPercentage / 100) * 553} 553`
                                        }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <Icon className="w-10 h-10 text-primary mb-2" />
                                    <span className="text-3xl font-bold">{challenge.totalProgress.toFixed(0)}</span>
                                    <span className="text-sm text-muted-foreground">of {challenge.goalValue} {challenge.metric}</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-4 rounded-2xl bg-muted/50 text-center">
                                <div className="text-2xl font-bold text-primary">{challenge.participantCount}</div>
                                <div className="text-sm text-muted-foreground">Participants</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-muted/50 text-center">
                                <div className="text-2xl font-bold text-primary">{challenge.totalProgress.toFixed(1)}</div>
                                <div className="text-sm text-muted-foreground">Total {challenge.metric}</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-muted/50 text-center">
                                <div className="text-2xl font-bold text-primary">{isEnded ? "Ended" : `${daysLeft}d`}</div>
                                <div className="text-sm text-muted-foreground">Time Left</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Description */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-4 sm:p-6 lg:p-8 rounded-3xl border border-border bg-card"
                    >
                        <h2 className="text-2xl font-bold mb-4">About This Challenge</h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            {challenge.description}
                        </p>

                        <div className="mt-6 pt-6 border-t border-border flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>Started {new Date(challenge.startDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>Ends {new Date(challenge.endDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* User's Progress (if participating) */}
                    {challenge.isParticipant && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-4 sm:p-6 lg:p-8 rounded-3xl border border-primary/30 bg-primary/5"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-primary/20 rounded-xl">
                                    <CheckCircle2 className="w-6 h-6 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold">Your Progress</h2>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-primary">{challenge.userProgress}</span>
                                <span className="text-lg text-muted-foreground">{challenge.metric}</span>
                            </div>
                            <div className="mt-4 h-3 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((challenge.userProgress / challenge.goalValue) * 100, 100)}%` }}
                                    transition={{ duration: 1 }}
                                    className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
                                />
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Right Column - Leaderboard & Actions */}
                <div className="space-y-8">
                    {/* Action Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-3xl border border-border bg-card"
                    >
                        {challenge.isParticipant ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/20">
                                    <CheckCircle2 className="w-6 h-6 text-primary" />
                                    <span className="font-medium text-primary">You're participating!</span>
                                </div>
                                <button
                                    onClick={handleLeave}
                                    disabled={leaveMutation.isPending}
                                    className="w-full py-3 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all font-medium cursor-pointer"
                                >
                                    {leaveMutation.isPending ? "Leaving..." : "Leave Challenge"}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleJoin}
                                disabled={joinMutation.isPending || challenge.status === "COMPLETED"}
                                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {joinMutation.isPending ? "Joining..." : "Join Challenge"}
                            </button>
                        )}


                    </motion.div>

                    {/* Leaderboard */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-6 rounded-3xl border border-border bg-card"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                Leaderboard
                            </h3>
                        </div>

                        <div className="space-y-3">
                            {challenge.participants.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>No participants yet</p>
                                    <p className="text-sm">Be the first to join!</p>
                                </div>
                            ) : (
                                challenge.participants.map((participant: any, index: number) => (
                                    <div
                                        key={participant.user.id}
                                        className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${session?.user?.id === participant.user.id
                                            ? "bg-primary/10 border border-primary/20"
                                            : "hover:bg-muted/50"
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${index === 0 ? "bg-yellow-500/20 text-yellow-600" :
                                            index === 1 ? "bg-gray-400/20 text-gray-600" :
                                                index === 2 ? "bg-orange-500/20 text-orange-600" :
                                                    "bg-muted text-muted-foreground"
                                            }`}>
                                            {index < 3 ? (
                                                <Medal className="w-5 h-5" />
                                            ) : (
                                                index + 1
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{participant.user.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {participant.progress.toFixed(1)} {challenge.metric}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
