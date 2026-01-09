"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { trpc } from "@/lib/trpc";
import { PostItem } from "./PostItem";
import { CreatePost } from "./CreatePost";
import { Loader2, Ghost } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FeedProps {
    communityId: string;
    isMember: boolean;
}

export function Feed({ communityId, isMember }: FeedProps) {
    const { ref, inView } = useInView();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        isFetching,
        isLoading
    } = trpc.post.getInfinite.useInfiniteQuery(
        {
            communityId,
            limit: 10,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
            refetchOnWindowFocus: false, // Prevent jarring refetches
        }
    );

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, fetchNextPage, hasNextPage]);

    // Handle delete locally to avoid full refetch if possible (though mutation handles invalidate)
    // This helps UI feel snappy if we want to add animation
    const handlePostDeleted = (postId: string) => {
        // Logic handled by invalidate in PostItem, but we could add local state filtering here if needed
    };

    return (
        <div className="max-w-2xl mx-auto pb-20">
            {isMember && (
                <div className="mb-8">
                    <CreatePost communityId={communityId} />
                </div>
            )}

            {isLoading ? (
                <FeedSkeleton />
            ) : status === "error" ? (
                <div className="text-center py-12 text-destructive bg-destructive/5 rounded-3xl border border-destructive/20">
                    <p className="font-semibold">Error loading feed</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-2 text-sm underline hover:text-destructive/80"
                    >
                        Try refreshing
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    <AnimatePresence mode="popLayout">
                        {data?.pages.flatMap(page => page.items).map((post) => (
                            <PostItem key={post.id} post={post} onPostDeleted={handlePostDeleted} />
                        ))}
                    </AnimatePresence>

                    {data?.pages[0]?.items.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-16 px-4 rounded-3xl border-2 border-dashed border-border/50 bg-muted/5"
                        >
                            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
                                <Ghost className="w-8 h-8 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground/80">It's quiet here...</h3>
                            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                                Be the first to share a tip, resource, or achievement with the community!
                            </p>
                        </motion.div>
                    )}
                </div>
            )}

            <div ref={ref} className="py-8 flex justify-center h-20">
                {isFetchingNextPage && <Loader2 className="w-6 h-6 text-primary animate-spin" />}
            </div>
        </div>
    );
}

function FeedSkeleton() {
    return (
        <div className="space-y-6">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card/30 border border-border/40 rounded-3xl p-6 mb-4 animate-pulse">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-11 h-11 rounded-xl bg-muted/50" />
                        <div className="space-y-2">
                            <div className="w-32 h-4 rounded-md bg-muted/50" />
                            <div className="w-20 h-3 rounded-md bg-muted/30" />
                        </div>
                    </div>
                    <div className="space-y-3 pl-[60px]">
                        <div className="w-full h-4 rounded-md bg-muted/40" />
                        <div className="w-3/4 h-4 rounded-md bg-muted/40" />
                        <div className="w-1/2 h-4 rounded-md bg-muted/40" />
                    </div>
                </div>
            ))}
        </div>
    )
}
