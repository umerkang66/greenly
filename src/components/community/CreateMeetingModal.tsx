"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { X, Calendar, Clock, Type, AlignLeft, Loader2 } from "lucide-react";

interface CreateMeetingModalProps {
    communityId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateMeetingModal({ communityId, isOpen, onClose, onSuccess }: CreateMeetingModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    // Default to tomorrow 10:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const [startTime, setStartTime] = useState(tomorrow.toISOString().slice(0, 16));

    const createMutation = trpc.meeting.create.useMutation({
        onSuccess: () => {
            onSuccess();
            onClose();
            setTitle("");
            setDescription("");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !startTime) return;

        createMutation.mutate({
            communityId,
            title,
            description,
            startTime: new Date(startTime).toISOString(),
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card text-card-foreground rounded-3xl p-6 w-full max-w-lg border border-border shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold">Schedule Meeting</h2>
                    <p className="text-sm text-muted-foreground mt-1">Plan a video call for your community.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <Type className="w-4 h-4" />
                            Meeting Title
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                            placeholder="e.g., Weekly Sync"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <AlignLeft className="w-4 h-4" />
                            Description (Optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none min-h-[100px] resize-none"
                            placeholder="What's this meeting about?"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            Date & Time
                        </label>
                        <input
                            type="datetime-local"
                            required
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-border mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-3 rounded-xl hover:bg-muted font-bold transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
                        >
                            {createMutation.isPending ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Scheduling...
                                </span>
                            ) : (
                                "Schedule Meeting"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
