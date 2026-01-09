"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow } from "date-fns";
import { Send, Trash2, CornerDownRight, Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { motion, AnimatePresence } from "framer-motion";

interface CommentSectionProps {
    postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
    const { data: session } = useSession();
    const utils = trpc.useUtils();
    const [content, setContent] = useState("");

    const { data: comments, isLoading } = trpc.comment.getAll.useQuery({ postId });

    const createMutation = trpc.comment.create.useMutation({
        onSuccess: () => {
            setContent("");
            utils.comment.getAll.invalidate({ postId });
            utils.post.getInfinite.invalidate(); // To update comment count
        },
    });

    const deleteMutation = trpc.comment.delete.useMutation({
        onSuccess: () => {
            utils.comment.getAll.invalidate({ postId });
            utils.post.getInfinite.invalidate();
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        createMutation.mutate({ content, postId });
    };

    const handleDelete = (id: string) => {
        if (confirm("Delete comment?")) {
            deleteMutation.mutate({ id });
        }
    }

    return (
        <div className="bg-muted/20 rounded-2xl p-4 border border-border/50">
            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2 mb-4">
                {isLoading ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    </div>
                ) : comments?.length === 0 ? (
                    <div className="text-center py-6">
                        <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-2">
                            <MessageSquareIcon className="w-4 h-4 text-muted-foreground/50 opacity-0" /> {/* Placeholder hack */}
                            <span className="text-xl">💭</span>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">No comments yet.</p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {comments?.map((comment: any) => (
                            <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="group flex gap-3 text-sm"
                            >
                                <CornerDownRight className="w-4 h-4 text-muted-foreground/20 shrink-0 mt-2 ml-1" />
                                <div className="w-7 h-7 rounded-lg bg-background flex items-center justify-center overflow-hidden shrink-0 mt-0.5 border border-border/50 shadow-sm">
                                    {comment.user.image ? (
                                        <img src={comment.user.image} alt={comment.user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-[10px] font-bold text-muted-foreground">{comment.user.name?.[0]?.toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="bg-background rounded-2xl rounded-tl-none px-4 py-2.5 inline-block shadow-sm border border-border/40 max-w-full">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="font-semibold text-xs text-foreground/80">{comment.user.name}</span>
                                            <span className="text-[10px] text-muted-foreground/60 font-medium">
                                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                                    </div>

                                    {session?.user?.id === comment.userId && (
                                        <div className="mt-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleDelete(comment.id)}
                                                className="text-[10px] text-muted-foreground hover:text-destructive font-medium flex items-center gap-1 cursor-pointer"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {session && (
                <form onSubmit={handleSubmit} className="flex gap-3 pt-2 border-t border-border/30">
                    <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-border/50">
                        {session?.user?.image ? (
                            <img src={session.user.image} alt={session.user.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xs font-bold text-primary">{session.user.name?.[0]?.toUpperCase()}</span>
                        )}
                    </div>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write a comment..."
                            className="w-full bg-background border border-border/50 rounded-xl pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all shadow-sm"
                            disabled={createMutation.isPending}
                        />
                        <button
                            type="submit"
                            disabled={!content.trim() || createMutation.isPending}
                            className="absolute right-1.5 top-1.5 p-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all disabled:opacity-0 disabled:scale-75 shadow-md shadow-primary/20 cursor-pointer"
                        >
                            {createMutation.isPending ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Send className="w-3.5 h-3.5" />
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

function MessageSquareIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    )
}
