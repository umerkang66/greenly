"use client";

import { CarbonScanner } from "@/components/CarbonScanner";

export default function ScannerPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5" />
                <div className="container max-w-4xl mx-auto px-4 py-12">
                    <CarbonScanner />
                </div>
            </div>
        </div>
    );
}
