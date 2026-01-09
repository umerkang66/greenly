"use client";

import { trpc } from "@/lib/trpc";
import { Sparkles, TrendingUp, Users, Leaf, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface CarbonForecastProps {
    slug: string;
}

export const CarbonForecast = ({ slug }: CarbonForecastProps) => {
    const { data, isLoading, error } = trpc.community.getCarbonForecast.useQuery(
        { slug },
        {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 60, // 1 hour
            retry: 1
        }
    );

    if (isLoading) {
        return (
            <div className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-white/10" />
                    <div className="h-6 w-48 bg-white/10 rounded" />
                </div>
                <div className="space-y-2">
                    <div className="h-4 w-full bg-white/10 rounded" />
                    <div className="h-4 w-3/4 bg-white/10 rounded" />
                    <div className="h-4 w-5/6 bg-white/10 rounded" />
                </div>
            </div>
        );
    }

    if (error) {
        // Only show error if it's NOT a permission issue (e.g. not a member)
        // If 403, we might just return null or a specific message
        if (error.data?.code === "FORBIDDEN") {
            return null;
        }

        return (
            <div className="w-full p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">Unable to generate forecast at this time.</p>
            </div>
        );
    }

    if (!data?.forecast) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full p-6 rounded-2xl bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-500/20 backdrop-blur-xl overflow-hidden relative"
        >
            <div className="absolute top-0 right-0 p-3 opacity-20">
                <Sparkles className="w-24 h-24 text-emerald-400" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-emerald-100">AI Carbon Forecast</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/20">
                        Beta
                    </span>
                </div>

                <div className="prose prose-invert prose-sm max-w-none prose-p:text-emerald-100/90 prose-headings:text-emerald-50 prose-strong:text-emerald-200">
                    <ReactMarkdown>{data.forecast}</ReactMarkdown>
                </div>

                <div className="mt-6 flex items-center gap-4 text-xs text-emerald-400/60 font-medium">
                    <span className="flex items-center gap-1">
                        <Leaf className="w-3 h-3" />
                        Next 30 Days
                    </span>
                    <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Community Powered
                    </span>
                </div>
            </div>
        </motion.div>
    );
};
