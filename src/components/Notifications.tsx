"use client";

import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Bell, Check, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

export function Notifications() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const utils = trpc.useContext();

    // Polling every 10 seconds
    const { data, refetch } = trpc.notification.getMine.useQuery(undefined, {
        refetchInterval: 10000
    });

    const acceptMutation = trpc.community.acceptInvite.useMutation({
        onSuccess: (data) => {
            utils.notification.invalidate();
            setIsOpen(false);
            router.push(`/communities/${data.slug}`);
        }
    });

    const markReadMutation = trpc.notification.markRead.useMutation({
        onSuccess: () => utils.notification.invalidate()
    });

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleAccept = (notificationId: string) => {
        acceptMutation.mutate({ notificationId });
    };

    const hasUnread = data?.unreadCount && data.unreadCount > 0;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-accent/50 transition-colors"
            >
                <Bell className={`w-5 h-5 ${hasUnread ? "text-primary fill-primary/20" : "text-muted-foreground"}`} />
                <span className={`absolute -bottom-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold rounded-full border-2 border-background ${hasUnread
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-muted text-muted-foreground"
                    }`}>
                    {data?.unreadCount ?? 0}
                </span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-[400px] overflow-y-auto origin-top-right rounded-xl border border-border bg-popover shadow-xl animate-in fade-in zoom-in-95 z-50">
                    <div className="p-3 border-b border-border font-semibold flex items-center justify-between">
                        <span>Notifications</span>
                        {hasUnread && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{data?.unreadCount} new</span>
                        )}
                    </div>
                    {!data?.notifications || data?.notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                            <Bell className="w-8 h-8 opacity-20" />
                            <p>No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {data?.notifications.map((n: any) => {
                                let payload: any = {};
                                try { payload = JSON.parse(n.data); } catch (e) { }

                                // Determine notification content based on type
                                const isMention = n.type === "CHAT_MENTION";
                                const isInvite = n.type === "COMMUNITY_INVITE";

                                const handleNotificationClick = () => {
                                    if (isMention && payload.communitySlug) {
                                        markReadMutation.mutate({ id: n.id });
                                        setIsOpen(false);
                                        router.push(`/communities/${payload.communitySlug}?tab=chat`);
                                    }
                                };

                                return (
                                    <div
                                        key={n.id}
                                        className={`p-4 hover:bg-muted/50 transition-colors ${!n.isRead ? "bg-primary/5" : ""} ${isMention ? "cursor-pointer" : ""}`}
                                        onClick={isMention ? handleNotificationClick : undefined}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-full shrink-0 ${isMention ? "bg-blue-500/10 text-blue-500" : "bg-primary/10 text-primary"}`}>
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 space-y-1 min-w-0">
                                                {isMention ? (
                                                    <p className="text-sm leading-snug">
                                                        <span className="font-semibold text-foreground">{payload.senderName || n.sender?.name || "Someone"}</span> mentioned you in <span className="font-semibold text-blue-500">{payload.communityName}</span>
                                                        {payload.messagePreview && (
                                                            <span className="block text-xs text-muted-foreground mt-1 truncate">"{payload.messagePreview}"</span>
                                                        )}
                                                    </p>
                                                ) : (
                                                    <p className="text-sm leading-snug">
                                                        <span className="font-semibold text-foreground">{n.sender?.name || "Someone"}</span> invited you to join <span className="font-semibold text-primary">{payload.communityName}</span>
                                                    </p>
                                                )}
                                                <p className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleDateString()}</p>

                                                {isInvite && !n.isRead && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAccept(n.id);
                                                        }}
                                                        disabled={acceptMutation.isPending}
                                                        className="mt-2 text-xs font-bold bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 w-full justify-center shadow-sm shadow-primary/20"
                                                    >
                                                        {acceptMutation.isPending ? "Joining..." : <>Join Community <Check className="w-3 h-3" /></>}
                                                    </button>
                                                )}

                                                {isMention && (
                                                    <span className="text-xs text-blue-500 font-medium">Click to view chat →</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
