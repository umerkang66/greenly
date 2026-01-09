"use client";

import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/lib/auth-client";
import { pusherClient } from "@/lib/pusher-client";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, AtSign, X } from "lucide-react";

interface Message {
    id: string;
    content: string;
    createdAt: Date | string;
    user: {
        id: string;
        name: string;
        image: string | null;
    };
    mentions: string[];
}

interface Member {
    id: string;
    name: string;
    image: string | null;
}

interface CommunityChatProps {
    communityId: string;
}

export function CommunityChat({ communityId }: CommunityChatProps) {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [showMentions, setShowMentions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState("");
    const [selectedMentions, setSelectedMentions] = useState<Member[]>([]);
    const [cursorPosition, setCursorPosition] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const utils = trpc.useUtils();

    // Fetch initial messages
    const { data: messageData, isLoading } = trpc.chat.getMessages.useQuery(
        { communityId, limit: 50 },
        { enabled: !!communityId }
    );

    // Fetch members for @mention - enabled when showMentions is true (no query length requirement)
    const { data: members, isLoading: isLoadingMembers } = trpc.chat.getMembers.useQuery(
        { communityId, query: mentionQuery || undefined },
        { enabled: showMentions }
    );

    // Send message mutation
    const sendMutation = trpc.chat.sendMessage.useMutation({
        onSuccess: () => {
            setInput("");
            setSelectedMentions([]);
        },
    });

    // Initialize messages from query
    useEffect(() => {
        if (messageData?.messages) {
            setMessages(messageData.messages);
        }
    }, [messageData]);

    // Subscribe to Pusher channel
    useEffect(() => {
        if (!communityId) return;

        const channel = pusherClient.subscribe(`community-${communityId}`);

        channel.bind("new-message", (newMessage: Message) => {
            setMessages((prev) => [...prev, newMessage]);
        });

        return () => {
            pusherClient.unsubscribe(`community-${communityId}`);
        };
    }, [communityId]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handle input change and detect @mention
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInput(value);
        setCursorPosition(e.target.selectionStart || 0);

        // Detect @ symbol for mentions
        const lastAtSymbol = value.lastIndexOf("@");
        if (lastAtSymbol !== -1 && lastAtSymbol < (e.target.selectionStart || 0)) {
            const queryAfterAt = value.slice(lastAtSymbol + 1, e.target.selectionStart || value.length);
            if (!queryAfterAt.includes(" ")) {
                setShowMentions(true);
                setMentionQuery(queryAfterAt);
                return;
            }
        }
        setShowMentions(false);
    };

    // Handle mention selection
    const handleMentionSelect = (member: Member) => {
        const lastAtSymbol = input.lastIndexOf("@");
        const beforeAt = input.slice(0, lastAtSymbol);
        const afterQuery = input.slice(cursorPosition);

        setInput(`${beforeAt}@${member.name} ${afterQuery}`);
        setSelectedMentions((prev) => [...prev, member]);
        setShowMentions(false);
        inputRef.current?.focus();
    };

    // Remove mention
    const removeMention = (memberId: string) => {
        setSelectedMentions((prev) => prev.filter((m) => m.id !== memberId));
    };

    // Send message
    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || sendMutation.isPending) return;

        sendMutation.mutate({
            communityId,
            content: input.trim(),
            mentions: selectedMentions.map((m) => m.id),
        });
    };

    // Format time
    const formatTime = (date: Date | string) => {
        return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    if (!session) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <p className="text-muted-foreground">Sign in to participate in chat</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[500px] bg-card rounded-2xl border border-border overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <p className="text-muted-foreground text-sm">No messages yet. Start the conversation! 💬</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isOwn = msg.user.id === session.user.id;
                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                            >
                                {/* Avatar */}
                                <div className="shrink-0">
                                    {msg.user.image ? (
                                        <img
                                            src={msg.user.image}
                                            alt={msg.user.name}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                            {msg.user.name.charAt(0)}
                                        </div>
                                    )}
                                </div>

                                {/* Message */}
                                <div className={`max-w-[70%] ${isOwn ? "text-right" : ""}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs font-medium ${isOwn ? "order-2" : ""}`}>
                                            {msg.user.name}
                                        </span>
                                        <span className={`text-[10px] text-muted-foreground ${isOwn ? "order-1" : ""}`}>
                                            {formatTime(msg.createdAt)}
                                        </span>
                                    </div>
                                    <div
                                        className={`inline-block px-4 py-2 rounded-2xl text-sm ${isOwn
                                            ? "bg-primary text-primary-foreground rounded-br-sm"
                                            : "bg-muted rounded-bl-sm"
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Selected Mentions */}
            {selectedMentions.length > 0 && (
                <div className="px-4 py-2 border-t border-border flex flex-wrap gap-2">
                    {selectedMentions.map((member) => (
                        <span
                            key={member.id}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                        >
                            @{member.name}
                            <button type="button" onClick={() => removeMention(member.id)}>
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Mention Autocomplete - Discord Style */}
            <AnimatePresence>
                {showMentions && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mx-4 mb-2 p-2 bg-card border border-border rounded-xl shadow-xl max-h-[200px] overflow-y-auto"
                    >
                        <div className="text-xs text-muted-foreground px-2 py-1 mb-1 font-medium uppercase tracking-wider">
                            Members {mentionQuery && `matching "${mentionQuery}"`}
                        </div>
                        {isLoadingMembers ? (
                            <div className="flex items-center justify-center p-4">
                                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                            </div>
                        ) : members && members.length > 0 ? (
                            members.map((member) => (
                                <button
                                    key={member.id}
                                    type="button"
                                    onClick={() => handleMentionSelect(member)}
                                    className="w-full flex items-center gap-3 p-2 hover:bg-primary/10 rounded-lg transition-colors text-left group"
                                >
                                    {member.image ? (
                                        <img src={member.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                            {member.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <span className="text-sm font-medium group-hover:text-primary transition-colors">{member.name}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">Click to mention</span>
                                </button>
                            ))
                        ) : (
                            <div className="text-sm text-muted-foreground text-center p-4">
                                No members found
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-border">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            setInput((prev) => prev + "@");
                            setShowMentions(true);
                            setMentionQuery("");
                            inputRef.current?.focus();
                        }}
                        className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                    >
                        <AtSign className="w-5 h-5" />
                    </button>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-muted/50 focus:bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                        disabled={sendMutation.isPending}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || sendMutation.isPending}
                        className="p-2.5 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 hover:opacity-90 transition-all cursor-pointer"
                    >
                        {sendMutation.isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
