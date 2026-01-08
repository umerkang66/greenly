"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

export default function CreateCommunityPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");

    const createMutation = trpc.community.create.useMutation({
        onSuccess: (data) => {
            router.push(`/communities/${data.slug}`);
            router.refresh();
        },
        onError: (err) => {
            setError(err.message);
        }
    });

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setName(val);
        // Auto-generate slug
        setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        createMutation.mutate({
            name,
            slug,
            description,
        });
    };

    return (
        <div className="min-h-screen bg-background pt-24 px-6 pb-20 flex justify-center">
            <div className="w-full max-w-2xl">
                <Link
                    href="/communities"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to communities
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            Create a Community <Sparkles className="w-6 h-6 text-primary" />
                        </h1>
                        <p className="text-muted-foreground mt-2 text-lg">
                            Start a movement. Gather people around a common goal.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8 bg-card border border-border p-8 rounded-2xl shadow-sm">

                        {error && (
                            <div className="p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Community Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={handleNameChange}
                                    className="w-full h-12 px-4 rounded-xl border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="e.g. San Francisco Cyclists"
                                    required
                                    minLength={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">URL Slug (Identifier)</label>
                                <div className="flex h-12 items-center rounded-xl border border-input bg-muted/30 px-4 text-muted-foreground">
                                    <span className="text-sm">greenly.com/communities/</span>
                                    <input
                                        type="text"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        className="flex-1 bg-transparent border-none outline-none font-medium text-foreground ml-1"
                                        placeholder="san-francisco-cyclists"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full min-h-[120px] p-4 rounded-xl border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                    placeholder="What is this community about?"
                                    required
                                    minLength={10}
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={createMutation.isPending}
                                className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2"
                            >
                                {createMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Create Community"}
                            </button>
                        </div>

                    </form>
                </motion.div>
            </div>
        </div>
    );
}
