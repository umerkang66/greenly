"use client";

import { useState, Suspense } from "react";
import { trpc } from "@/lib/trpc";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    ArrowLeft, Loader2, Target, Calendar,
    Trophy, Bike, Leaf, Zap, Flame, CheckCircle2
} from "lucide-react";

const CHALLENGE_TYPES = [
    { key: "CYCLING", label: "Cycling", icon: Bike, description: "Track cycling kilometers" },
    { key: "CARBON_SAVING", label: "Carbon Saving", icon: Leaf, description: "Reduce CO2 emissions" },
    { key: "PLASTIC_REDUCTION", label: "Plastic Reduction", icon: Zap, description: "Reduce plastic usage" },
    { key: "VEGAN_MEALS", label: "Vegan Meals", icon: Flame, description: "Eat plant-based meals" },
];

const METRIC_OPTIONS = [
    { key: "km", label: "Kilometers (km)" },
    { key: "kg_co2", label: "kg CO2 Saved" },
    { key: "activities", label: "Activities" },
    { key: "meals", label: "Meals" },
    { key: "items", label: "Items" },
];

function CreateChallengeForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const communityId = searchParams?.get("communityId") || "";

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [goalValue, setGoalValue] = useState("");
    const [metric, setMetric] = useState("km");
    const [type, setType] = useState("CYCLING");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [error, setError] = useState("");

    const createMutation = trpc.challenge.create.useMutation({
        onSuccess: (data) => {
            router.push(`/challenges/${data.id}`);
            router.refresh();
        },
        onError: (err) => {
            setError(err.message);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!communityId) {
            setError("Community ID is required. Please go back and try again.");
            return;
        }

        createMutation.mutate({
            title,
            description,
            goalValue: parseFloat(goalValue),
            metric,
            type,
            communityId,
            startDate,
            endDate,
            isCustom: true,
        });
    };

    return (
        <div className="min-h-screen bg-background pt-24 px-6 pb-20">
            <div className="max-w-3xl mx-auto">

                {/* Back Link */}
                <Link
                    href="/challenges"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to challenges
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
                            <Target className="w-10 h-10 text-white" />
                        </motion.div>

                        <h1 className="text-3xl lg:text-4xl font-bold text-white flex items-center justify-center gap-3">
                            Create a Challenge
                            <Trophy className="w-7 h-7 text-yellow-400" />
                        </h1>
                        <p className="text-lg text-white/70 mt-3 max-w-lg mx-auto">
                            Rally your community around a sustainability goal and track progress together.
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
                            {/* Challenge Type */}
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-foreground/80 pl-1">Challenge Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {CHALLENGE_TYPES.map((t) => {
                                        const isSelected = type === t.key;
                                        const Icon = t.icon;
                                        return (
                                            <button
                                                key={t.key}
                                                type="button"
                                                onClick={() => setType(t.key)}
                                                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-2 ${isSelected
                                                    ? "border-primary bg-primary/5 text-primary"
                                                    : "border-border hover:border-primary/30"
                                                    }`}
                                            >
                                                <Icon className="w-6 h-6" />
                                                <span className="font-semibold text-sm">{t.label}</span>
                                                {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Title Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground/80 pl-1">Challenge Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full h-14 px-5 rounded-2xl border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-lg"
                                    placeholder="e.g. 30-Day Cycling Challenge"
                                    required
                                    minLength={3}
                                />
                            </div>

                            {/* Description Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground/80 pl-1">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full min-h-[120px] p-5 rounded-2xl border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-base"
                                    placeholder="Describe the challenge and what participants need to do..."
                                    required
                                    minLength={10}
                                />
                            </div>

                            {/* Goal & Metric */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground/80 pl-1">Goal Value</label>
                                    <input
                                        type="number"
                                        value={goalValue}
                                        onChange={(e) => setGoalValue(e.target.value)}
                                        className="w-full h-14 px-5 rounded-2xl border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-lg"
                                        placeholder="e.g. 500"
                                        required
                                        min={1}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground/80 pl-1">Metric</label>
                                    <select
                                        value={metric}
                                        onChange={(e) => setMetric(e.target.value)}
                                        className="w-full h-14 px-5 rounded-2xl border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base cursor-pointer"
                                        required
                                    >
                                        {METRIC_OPTIONS.map((m) => (
                                            <option key={m.key} value={m.key}>
                                                {m.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground/80 pl-1 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full h-14 px-5 rounded-2xl border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base cursor-pointer"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground/80 pl-1 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full h-14 px-5 rounded-2xl border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base cursor-pointer"
                                        required
                                    />
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
                                        <Target className="w-5 h-5" />
                                        Create Challenge
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

export default function CreateChallengePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
        }>
            <CreateChallengeForm />
        </Suspense>
    );
}
