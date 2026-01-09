"use client";

import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/lib/auth-client";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Loader2, Leaf, AlertCircle, Plus, X, Sparkles } from "lucide-react";
import Link from "next/link";

interface ScanResult {
    identifiedItem: string;
    confidence: string;
    category: string;
    estimatedCarbonKg: number;
    description: string;
    ecoTip: string;
    suggestedAction: string | null;
}

export function CarbonScanner() {
    const { data: session } = useSession();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scanMutation = trpc.scanner.analyzeImage.useMutation({
        onSuccess: (data) => {
            setIsScanning(false);
            if (data.success && data.data) {
                setScanResult(data.data);
                setError(null);
            } else {
                setError(data.error || "Failed to analyze image");
            }
        },
        onError: (err) => {
            setIsScanning(false);
            setError(err.message);
        },
    });

    const logMutation = trpc.carbon.logActivity.useMutation({
        onSuccess: () => {
            setScanResult(null);
            setImagePreview(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        },
    });

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setImagePreview(base64);
            setScanResult(null);
            setError(null);
        };
        reader.readAsDataURL(file);
    };

    const handleScan = () => {
        if (!imagePreview) return;
        setIsScanning(true);
        setError(null);
        scanMutation.mutate({ imageBase64: imagePreview });
    };

    const handleQuickLog = () => {
        if (!scanResult || !scanResult.suggestedAction) return;

        const actionMap: Record<string, { category: string; unit: string }> = {
            "diet-meat-high": { category: "DIET", unit: "meal" },
            "diet-meat-low": { category: "DIET", unit: "meal" },
            "diet-vegetarian": { category: "DIET", unit: "meal" },
            "diet-vegan": { category: "DIET", unit: "meal" },
            "transport-car-gas": { category: "TRANSPORT", unit: "km" },
            "transport-bike": { category: "TRANSPORT", unit: "km" },
            "transport-bus": { category: "TRANSPORT", unit: "km" },
            "transport-train": { category: "TRANSPORT", unit: "km" },
            "waste-plastic-bottle": { category: "WASTE", unit: "item" },
            "waste-plastic-bag": { category: "WASTE", unit: "item" },
        };

        const mapping = actionMap[scanResult.suggestedAction];
        if (!mapping) return;

        logMutation.mutate({
            category: mapping.category,
            action: scanResult.suggestedAction,
            value: 1,
            unit: mapping.unit,
        });
    };

    const reset = () => {
        setImagePreview(null);
        setScanResult(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    if (!session) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <Camera className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Carbon Scanner</h2>
                <p className="text-muted-foreground mb-6">Sign in to scan items and track their carbon footprint</p>
                <Link href="/signin" className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium">
                    Sign In
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-4">
                    <Sparkles className="w-4 h-4" />
                    AI-Powered Scanner
                </div>
                <h1 className="text-3xl font-bold mb-2">Carbon Scanner</h1>
                <p className="text-muted-foreground">Take a photo to estimate carbon footprint instantly</p>
            </div>

            {/* Upload Area */}
            <div className="relative">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                />

                {!imagePreview ? (
                    <motion.div
                        onClick={() => fileInputRef.current?.click()}
                        className="relative border-2 border-dashed border-border rounded-3xl p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all group"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        <div className="p-4 rounded-full bg-primary/10 inline-flex mb-4 group-hover:bg-primary/20 transition-colors">
                            <Camera className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Upload an Image</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                            Take a photo of food, products, or transport
                        </p>
                        <div className="flex justify-center gap-3">
                            <span className="px-3 py-1.5 rounded-lg bg-muted text-xs font-medium">📸 Camera</span>
                            <span className="px-3 py-1.5 rounded-lg bg-muted text-xs font-medium">📁 Gallery</span>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative"
                    >
                        {/* Image Preview */}
                        <div className="relative rounded-3xl overflow-hidden border border-border">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-64 object-cover"
                            />
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    reset();
                                }}
                                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Scanning Overlay */}
                            {isScanning && (
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                                    <div className="relative">
                                        <div className="w-20 h-20 border-4 border-emerald-500/30 rounded-full animate-ping absolute" />
                                        <div className="w-20 h-20 border-4 border-t-emerald-500 border-r-emerald-500 border-b-transparent border-l-transparent rounded-full animate-spin" />
                                    </div>
                                    <p className="text-white font-medium mt-4">Analyzing image...</p>
                                </div>
                            )}
                        </div>

                        {/* Scan Button */}
                        {!scanResult && !isScanning && (
                            <button
                                type="button"
                                onClick={handleScan}
                                className="w-full mt-4 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Sparkles className="w-5 h-5" />
                                Scan for Carbon Footprint
                            </button>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Error */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-600 dark:text-red-400"
                    >
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm">{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results */}
            <AnimatePresence>
                {scanResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mt-6 p-6 rounded-3xl border border-border bg-card"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold uppercase mb-2 ${scanResult.confidence === "high"
                                        ? "bg-emerald-500/10 text-emerald-600"
                                        : scanResult.confidence === "medium"
                                            ? "bg-yellow-500/10 text-yellow-600"
                                            : "bg-red-500/10 text-red-600"
                                    }`}>
                                    {scanResult.confidence} confidence
                                </span>
                                <h3 className="text-2xl font-bold capitalize">{scanResult.identifiedItem}</h3>
                                <p className="text-muted-foreground text-sm mt-1">{scanResult.description}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-bold text-primary">{scanResult.estimatedCarbonKg.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">kg CO₂e</p>
                            </div>
                        </div>

                        {/* Eco Tip */}
                        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 mb-4">
                            <div className="flex items-start gap-3">
                                <Leaf className="w-5 h-5 text-emerald-500 mt-0.5" />
                                <div>
                                    <p className="font-medium text-sm text-emerald-700 dark:text-emerald-300">Eco Tip</p>
                                    <p className="text-sm text-muted-foreground">{scanResult.ecoTip}</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 relative z-10">
                            {scanResult.suggestedAction && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleQuickLog();
                                    }}
                                    disabled={logMutation.isPending}
                                    className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer pointer-events-auto"
                                >
                                    {logMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Plus className="w-4 h-4" />
                                    )}
                                    Quick Log
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    reset();
                                }}
                                className="px-6 py-3 border border-border rounded-xl hover:bg-muted transition-colors font-medium cursor-pointer pointer-events-auto"
                            >
                                Scan Another
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tips */}
            {!imagePreview && (
                <div className="mt-8 grid grid-cols-3 gap-4">
                    {[
                        { emoji: "🍔", label: "Food & Meals" },
                        { emoji: "🚗", label: "Transport" },
                        { emoji: "♻️", label: "Products" },
                    ].map((item) => (
                        <div key={item.label} className="p-4 rounded-2xl bg-muted/50 text-center">
                            <span className="text-2xl mb-2 block">{item.emoji}</span>
                            <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
