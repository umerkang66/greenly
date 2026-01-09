"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Send, Image as ImageIcon, Link as LinkIcon, Shield, X, Loader2, Sparkles } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { motion, AnimatePresence } from "framer-motion";

interface CreatePostProps {
    communityId: string;
}

export function CreatePost({ communityId }: CreatePostProps) {
    const { data: session } = useSession();
    const utils = trpc.useUtils();
    const [content, setContent] = useState("");
    const [type, setType] = useState<"GENERAL" | "TIP" | "RESOURCE" | "ACHIEVEMENT">("GENERAL");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const createMutation = trpc.post.create.useMutation({
        onSuccess: () => {
            setContent("");
            setType("GENERAL");
            setIsAnonymous(false);
            setLinkUrl("");
            setShowLinkInput(false);
            utils.post.getInfinite.invalidate({ communityId });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        createMutation.mutate({
            communityId,
            content,
            type,
            isAnonymous,
            linkUrl: linkUrl.trim() || undefined,
        });
    };

    if (!session) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-3xl border transition-all duration-300 ${isFocused
                ? "bg-muted/40 border-primary/20 shadow-lg shadow-primary/5"
                : "bg-muted/20 border-border/50 hover:bg-muted/30"
                }`}
        >
            {/* Decorative gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none transition-opacity duration-500 ${isFocused ? 'opacity-100' : 'opacity-0'}`} />

            <div className="relative p-6">
                <div className="flex gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-0.5">
                            <div className="w-full h-full rounded-[14px] bg-background/50 backdrop-blur-sm overflow-hidden flex items-center justify-center">
                                {session.user.image ? (
                                    <img src={session.user.image} alt={session.user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-sm font-bold text-primary">{session.user.name?.[0]?.toUpperCase()}</span>
                                )}
                            </div>
                        </div>
                        {isAnonymous && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center shadow-sm" title="Posting Anonymously">
                                <Shield className="w-3 h-3 text-muted-foreground" />
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 space-y-4">
                        <div className="relative">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                placeholder={`What's on your mind, ${session.user.name?.split(' ')[0]}?`}
                                className="w-full bg-transparent border-none focus:ring-0 text-base resize-none min-h-[60px] p-0 placeholder:text-muted-foreground/70 leading-relaxed"
                                disabled={createMutation.isPending}
                            />
                        </div>

                        <AnimatePresence>
                            {showLinkInput && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="flex items-center gap-3 bg-background/50 border border-border/50 p-3 rounded-xl">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                            <LinkIcon className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <input
                                            type="url"
                                            value={linkUrl}
                                            onChange={(e) => setLinkUrl(e.target.value)}
                                            placeholder="Paste your link here..."
                                            className="flex-1 bg-transparent border-none text-sm focus:outline-none placeholder:text-muted-foreground/50"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowLinkInput(false)}
                                            className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className={`flex flex-wrap items-center justify-between pt-2 transition-opacity duration-200 ${isFocused || content ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}>
                            <div className="flex items-center gap-2">
                                <div className="relative group">
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value as any)}
                                        className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-background/50 border border-border/50 text-xs font-semibold hover:border-primary/30 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer outline-none"
                                    >
                                        <option value="GENERAL">General</option>
                                        <option value="TIP">Sustainability Tip</option>
                                        <option value="RESOURCE">Resource</option>
                                        <option value="ACHIEVEMENT">Achievement</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                        <Sparkles className="w-3 h-3" />
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowLinkInput(!showLinkInput)}
                                    className={`p-2 rounded-xl border border-transparent transition-all cursor-pointer ${showLinkInput
                                        ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                        : 'hover:bg-background/50 hover:border-border/50 text-muted-foreground'
                                        }`}
                                    title="Add Link"
                                >
                                    <LinkIcon className="w-4 h-4" />
                                </button>

                                <label className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent cursor-pointer transition-all select-none ${isAnonymous
                                    ? 'bg-gray-500/10 text-gray-600 border-gray-500/20'
                                    : 'hover:bg-background/50 hover:border-border/50 text-muted-foreground'
                                    }`}>
                                    <input
                                        type="checkbox"
                                        checked={isAnonymous}
                                        onChange={(e) => setIsAnonymous(e.target.checked)}
                                        className="hidden"
                                    />
                                    <Shield className="w-4 h-4" />
                                    <span className="text-xs font-medium">Anonymous</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={!content.trim() || createMutation.isPending}
                                className={`
                    px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg 
                    flex items-center gap-2 transition-all cursor-pointer
                    ${!content.trim() || createMutation.isPending
                                        ? 'bg-muted text-muted-foreground shadow-none cursor-not-allowed'
                                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5'
                                    }
                 `}
                            >
                                {createMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Publishing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Post</span>
                                        <Send className="w-3.5 h-3.5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </motion.div>
    );
}
