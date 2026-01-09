"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageSquare, Share2, Trash2, MoreHorizontal, ExternalLink, Shield } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { CommentSection } from "./CommentSection";
import { motion } from "framer-motion";

interface PostItemProps {
    post: any;
    onPostDeleted?: (postId: string) => void;
}

export function PostItem({ post, onPostDeleted }: PostItemProps) {
    const { data: session } = useSession();
    const utils = trpc.useUtils();
    const [showComments, setShowComments] = useState(false);
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likeCount, setLikeCount] = useState(post._count.likes);

    const likeMutation = trpc.post.toggleLike.useMutation({
        onMutate: async ({ postId }) => {
            // Optimistic update
            setIsLiked(!isLiked);
            setLikeCount((prev: number) => isLiked ? prev - 1 : prev + 1);
        },
        onError: () => {
            // Revert on error
            setIsLiked(!isLiked);
            setLikeCount((prev: number) => isLiked ? prev + 1 : prev - 1);
        },
        onSettled: () => {
            utils.post.getInfinite.invalidate({ communityId: post.communityId });
        },
    });

    const deleteMutation = trpc.post.delete.useMutation({
        onSuccess: () => {
            if (onPostDeleted) onPostDeleted(post.id);
            utils.post.getInfinite.invalidate({ communityId: post.communityId });
        },
    });

    const handleLike = () => {
        if (!session) return;
        likeMutation.mutate({ postId: post.id });
    };

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this post?")) {
            deleteMutation.mutate({ id: post.id });
        }
    };

    const isAuthor = session?.user?.id === post.userId;

    const getTypeStyles = (type: string) => {
        switch (type) {
            case "TIP": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
            case "RESOURCE": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
            case "ACHIEVEMENT": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
            default: return "bg-muted text-muted-foreground border-border";
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group bg-card/50 backdrop-blur-sm border border-border/60 hover:border-border rounded-3xl p-6 mb-4 transition-all hover:shadow-lg hover:shadow-primary/5"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-11 h-11 rounded-xl bg-muted/50 flex items-center justify-center overflow-hidden shrink-0 border border-border/50">
                            {post.isAnonymous ? (
                                <Shield className="w-5 h-5 text-muted-foreground/50" />
                            ) : post.user.image ? (
                                <img src={post.user.image} alt={post.user.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-sm font-bold text-muted-foreground">{post.user.name?.[0]?.toUpperCase()}</span>
                            )}
                        </div>
                        {post.isAnonymous && <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border border-background" />}
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-base text-foreground/90">
                                {post.isAnonymous ? "Anonymous Member" : post.user.name}
                            </span>
                            {post.type !== "GENERAL" && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold tracking-wide uppercase ${getTypeStyles(post.type)}`}>
                                    {post.type}
                                </span>
                            )}
                        </div>
                        <div className="text-xs font-medium text-muted-foreground/60 flex items-center gap-1.5 ">
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </div>
                    </div>
                </div>

                {isAuthor && (
                    <button
                        onClick={handleDelete}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg cursor-pointer"
                        title="Delete post"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="pl-[60px]">
                <p className="text-[15px] leading-relaxed text-foreground/80 whitespace-pre-wrap">
                    {post.content}
                </p>

                {post.linkUrl && (
                    <a
                        href={post.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 mt-4 p-3 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 hover:border-primary/20 transition-all group/link"
                    >
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                            <ExternalLink className="w-5 h-5 text-blue-500 group-hover/link:scale-110 transition-transform" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Shared Link</div>
                            <div className="text-sm font-medium text-primary truncate">{post.linkUrl}</div>
                        </div>
                    </a>
                )}

                {post.imageUrl && (
                    <div className="mt-4 rounded-2xl overflow-hidden border border-border/50 shadow-sm">
                        <img src={post.imageUrl} alt="Post attachment" className="w-full max-h-[400px] object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                )}

                <div className="mt-5 pt-4 border-t border-border/30 flex items-center gap-6">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 text-sm font-medium transition-all p-1.5 pr-3 rounded-lg hover:bg-muted/50 cursor-pointer ${isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500/80"
                            }`}
                    >
                        <div className={`p-1 rounded-full ${isLiked ? 'bg-red-500/10' : ''}`}>
                            <Heart className={`w-4.5 h-4.5 ${isLiked ? "fill-current" : ""}`} />
                        </div>
                        <span>{likeCount || "Like"}</span>
                    </button>

                    <button
                        onClick={() => setShowComments(!showComments)}
                        className={`flex items-center gap-2 text-sm font-medium transition-all p-1.5 pr-3 rounded-lg hover:bg-muted/50 cursor-pointer ${showComments ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-primary"
                            }`}
                    >
                        <div className="p-1">
                            <MessageSquare className="w-4.5 h-4.5" />
                        </div>
                        <span>{post._count.comments || "Comment"}</span>
                    </button>

                    <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all ml-auto p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>

                {showComments && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 pt-2"
                    >
                        <CommentSection postId={post.id} />
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
