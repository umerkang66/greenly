"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { MeetingCard } from "./MeetingCard";
import { Video, CalendarPlus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface MeetingListProps {
    communityId: string;
    onStartMeeting: (id: string) => void;
    onJoinMeeting: (id: string) => void;
    onCreateClick: () => void;
    isAdmin: boolean;
}

export function MeetingList({ communityId, onStartMeeting, onJoinMeeting, onCreateClick, isAdmin }: MeetingListProps) {
    const [startingId, setStartingId] = useState<string | null>(null);
    const [joiningId, setJoiningId] = useState<string | null>(null);

    const { data: meetings, isLoading } = trpc.meeting.getByCommunity.useQuery({ communityId });

    const handleStart = async (id: string) => {
        setStartingId(id);
        await onStartMeeting(id);
        setStartingId(null);
    };

    const handleJoin = async (id: string) => {
        setJoiningId(id);
        await onJoinMeeting(id);
        setJoiningId(null);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!meetings || meetings.length === 0) {
        return (
            <div className="text-center py-16 px-4 rounded-3xl border-2 border-dashed border-border bg-card/50">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Video className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Scheduled Meetings</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    {isAdmin
                        ? "Schedule a meeting with your community members to discuss topics, share updates, or just hang out!"
                        : "There are no upcoming meetings for this community. Check back later!"}
                </p>
                {isAdmin && (
                    <button
                        onClick={onCreateClick}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all mx-auto"
                    >
                        <CalendarPlus className="w-5 h-5" />
                        Schedule Meeting
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meetings.map((meeting) => (
                <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    onStart={handleStart}
                    onJoin={handleJoin}
                    isStarting={startingId === meeting.id}
                    isJoining={joiningId === meeting.id}
                />
            ))}
        </div>
    );
}
