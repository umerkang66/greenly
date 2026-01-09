"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Video, Play, ExternalLink } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { format } from "date-fns";

interface Meeting {
    id: string;
    title: string;
    description: string | null;
    startTime: string | Date;
    duration: number;
    status: string;
    createdById: string;
    createdBy: {
        id: string;
        name: string;
        image: string | null;
    };
}

interface MeetingCardProps {
    meeting: Meeting;
    onStart: (id: string) => void;
    onJoin: (id: string) => void;
    isStarting: boolean;
    isJoining: boolean;
}

export function MeetingCard({ meeting, onStart, onJoin, isStarting, isJoining }: MeetingCardProps) {
    const { data: session } = useSession();
    const isHost = session?.user?.id === meeting.createdById;
    const isStarted = meeting.status === "ACTIVE";
    const startDate = new Date(meeting.startTime);
    const isPast = startDate < new Date();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative p-6 rounded-3xl border border-border bg-card hover:shadow-lg transition-all overflow-hidden"
        >
            <div className={`absolute top-0 right-0 p-3 rounded-bl-2xl ${isStarted
                ? "bg-red-500/10 text-red-500 animate-pulse"
                : "bg-muted text-muted-foreground"
                }`}>
                {isStarted ? (
                    <div className="flex items-center gap-2 text-xs font-bold uppercase">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        Live Now
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-xs font-bold uppercase">
                        <Calendar className="w-3 h-3" />
                        Upcoming
                    </div>
                )}
            </div>

            <div className="mb-4">
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{meeting.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {meeting.description || "No description provided"}
                </p>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    {format(startDate, "MMM d, yyyy")}
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    {format(startDate, "h:mm a")} ({meeting.duration}m)
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                    {meeting.createdBy.image ? (
                        <img src={meeting.createdBy.image} alt={meeting.createdBy.name} className="w-8 h-8 rounded-full border border-border" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {meeting.createdBy.name[0]}
                        </div>
                    )}
                    <div className="text-xs">
                        <p className="font-medium text-foreground">{meeting.createdBy.name}</p>
                        <p className="text-muted-foreground">Host</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {isHost && !isStarted && (
                        <button
                            onClick={() => onStart(meeting.id)}
                            disabled={isStarting}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50"
                        >
                            <Play className="w-4 h-4" />
                            {isStarting ? "Starting..." : "Start"}
                        </button>
                    )}

                    {!isHost && !isStarted && (
                        <button
                            disabled
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-muted-foreground font-bold text-sm opacity-50 cursor-not-allowed"
                        >
                            <Clock className="w-4 h-4" />
                            Wait for Host
                        </button>
                    )}

                    {isStarted && (
                        <button
                            onClick={() => onJoin(meeting.id)}
                            disabled={isJoining}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-600 transition-all disabled:opacity-50 shadow-lg shadow-green-500/20"
                        >
                            <Video className="w-4 h-4" />
                            {isJoining ? "Joining..." : "Join Meeting"}
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
