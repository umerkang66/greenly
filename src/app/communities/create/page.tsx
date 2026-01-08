"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    ArrowLeft, Loader2, Sparkles, Users,
    Globe, Lock, CheckCircle2
} from "lucide-react";

export default function CreateCommunityPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
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
        setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        createMutation.mutate({
            name,
            slug,
            description,
            isPrivate,
        });
    };

    return (
        <div className="min-h-screen bg-background pt-24 px-6 pb-20">
            <div className="max-w-3xl mx-auto">

                {/* Back Link */}
                <Link
                    href="/communities"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to communities
                </Link>

                {/* Hero Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900 p-8 lg:p-12 mb-8"
                >
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBtLTI4IDBhMjggMjggMCAxIDAgNTYgMCAyOCAyOCAwIDEgMC01NiAwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9nPjwvc3ZnPg==')] opacity-50" />

                    <div className="relative z-10 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", bounce: 0.5 }}
                            className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/30"
                        >
                            <Users className="w-10 h-10 text-white" />
                        </motion.div>

                        <h1 className="text-3xl lg:text-4xl font-bold text-white flex items-center justify-center gap-3">
                            Create a Community
                            <Sparkles className="w-7 h-7 text-yellow-400" />
                        </h1>
                        <p className="text-lg text-white/70 mt-3 max-w-lg mx-auto">
                            Start a movement. Gather people around sustainability goals and make a collective impact.
                        </p>
                    </div>
                </motion.div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <form onSubmit={handleSubmit} className="space-y-8 bg-card border border-border p-8 rounded-3xl shadow-sm">

                        {error && (
                            <div className="p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Name Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground/80 pl-1">Community Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={handleNameChange}
                                    className="w-full h-14 px-5 rounded-2xl border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-lg"
                                    placeholder="e.g. San Francisco Cyclists"
                                    required
                                    minLength={3}
                                />
                            </div>

                            {/* Slug Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground/80 pl-1">URL Slug</label>
                                <div className="flex h-14 items-center rounded-2xl border border-input bg-muted/30 px-5">
                                    <span className="text-sm text-muted-foreground">greenly.com/communities/</span>
                                    <input
                                        type="text"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                        className="flex-1 bg-transparent border-none outline-none font-semibold text-foreground ml-1 text-lg"
                                        placeholder="san-francisco-cyclists"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground pl-1">
                                    Only lowercase letters, numbers, and dashes
                                </p>
                            </div>

                            {/* Description Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground/80 pl-1">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full min-h-[140px] p-5 rounded-2xl border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-base"
                                    placeholder="What is this community about? What are your sustainability goals?"
                                    required
                                    minLength={10}
                                />
                            </div>

                            {/* Privacy Toggle */}
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-foreground/80 pl-1">Visibility</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsPrivate(false)}
                                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-2 ${!isPrivate
                                            ? "border-primary bg-primary/5 text-primary"
                                            : "border-border hover:border-primary/30"
                                            }`}
                                    >
                                        <Globe className="w-6 h-6" />
                                        <span className="font-semibold">Public</span>
                                        <span className="text-xs text-muted-foreground text-center">Anyone can join</span>
                                        {!isPrivate && <CheckCircle2 className="w-5 h-5 text-primary" />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsPrivate(true)}
                                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-2 ${isPrivate
                                            ? "border-primary bg-primary/5 text-primary"
                                            : "border-border hover:border-primary/30"
                                            }`}
                                    >
                                        <Lock className="w-6 h-6" />
                                        <span className="font-semibold">Private</span>
                                        <span className="text-xs text-muted-foreground text-center">Invite only</span>
                                        {isPrivate && <CheckCircle2 className="w-5 h-5 text-primary" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={createMutation.isPending}
                                className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-lg hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {createMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Create Community
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
