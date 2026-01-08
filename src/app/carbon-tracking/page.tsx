"use client";

import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CATEGORIES = {
    TRANSPORT: {
        label: "Transport",
        icon: "🚗",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        actions: [
            { id: "transport-car-gas", label: "Car (Gas/Diesel)", unit: "km" },
            { id: "transport-car-ev", label: "Car (Electric)", unit: "km" },
            { id: "transport-bus", label: "Bus Ride", unit: "km" },
            { id: "transport-train", label: "Train/Subway", unit: "km" },
        ]
    },
    DIET: {
        label: "Diet",
        icon: "🥗",
        color: "text-green-500",
        bg: "bg-green-500/10",
        actions: [
            { id: "diet-meat-high", label: "High Meat Meal", unit: "meal" },
            { id: "diet-meat-low", label: "Low Meat Meal", unit: "meal" },
            { id: "diet-vegetarian", label: "Vegetarian Meal", unit: "meal" },
            { id: "diet-vegan", label: "Vegan Meal", unit: "meal" },
        ]
    },
    ENERGY: {
        label: "Energy",
        icon: "⚡",
        color: "text-yellow-500",
        bg: "bg-yellow-500/10",
        actions: [
            { id: "energy-grid", label: "Grid Electricity", unit: "kWh" },
        ]
    }
};

// Custom Select Component for Premium Feel
function CustomSelect({ options, value, onChange, label }: {
    options: { id: string; label: string }[];
    value: string;
    onChange: (val: string) => void;
    label: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(o => o.id === value);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative space-y-2" ref={containerRef}>
            <label className="text-sm font-semibold text-foreground/80 pl-1">{label}</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full text-left p-4 rounded-xl border bg-background text-foreground transition-all duration-200 outline-none flex items-center justify-between cursor-pointer ${isOpen
                    ? "border-primary ring-2 ring-primary/10 shadow-lg shadow-primary/5"
                    : "border-input hover:border-primary/50"
                    }`}
            >
                <span className="font-medium">{selectedOption?.label || "Select an option"}</span>
                <span className={`text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                    ▼
                </span>
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 rounded-xl border border-border bg-popover text-popover-foreground shadow-xl animate-in fade-in-0 zoom-in-95 overflow-hidden">
                    <div className="p-1 max-h-60 overflow-y-auto custom-scrollbar">
                        {options.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => {
                                    onChange(option.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${value === option.id
                                    ? "bg-primary/10 text-primary"
                                    : "hover:bg-accent hover:text-accent-foreground"
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CarbonTrackingPage() {
    const { data: session, isPending: isSessionLoading } = useSession();

    // State
    const [selectedCategory, setSelectedCategory] = useState<"TRANSPORT" | "DIET" | "ENERGY">("TRANSPORT");
    const [selectedAction, setSelectedAction] = useState(CATEGORIES.TRANSPORT.actions[0].id);
    const [value, setValue] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // tRPC
    const utils = trpc.useContext();
    const statsQuery = trpc.carbon.getStats.useQuery(undefined, { enabled: !!session });
    const historyQuery = trpc.carbon.getHistory.useQuery(undefined, { enabled: !!session });
    const logMutation = trpc.carbon.logActivity.useMutation({
        onSuccess: () => {
            utils.carbon.invalidate();
            setValue("");
            setIsSubmitting(false);
        }
    });

    if (isSessionLoading) {
        return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
    }

    if (!session) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 text-center px-4">
                <div className="p-4 rounded-full bg-primary/10 mb-4">
                    <span className="text-4xl">🌍</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Track Your Impact</h1>
                <p className="text-lg text-muted-foreground max-w-md">
                    Join Greenly to monitor your carbon footprint and make a difference.
                </p>
                <Link href="/signin" className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-primary/25 hover:shadow-primary/40">
                    Get Started &rarr;
                </Link>
            </div>
        );
    }

    const handleLog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!value) return;

        setIsSubmitting(true);
        const actionDef = CATEGORIES[selectedCategory].actions.find(a => a.id === selectedAction);

        if (!actionDef) return;

        try {
            await logMutation.mutateAsync({
                category: selectedCategory,
                action: selectedAction,
                value: parseFloat(value),
                unit: actionDef.unit
            });
        } catch (error) {
            console.error("Failed to log activity", error);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container max-w-6xl mx-auto px-4 py-12 space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border/40 pb-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">Carbon Tracker</h1>
                    <p className="text-lg text-muted-foreground mt-2">Monitor, analyze, and reduce your environmental footprint.</p>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-sm font-medium text-muted-foreground">Current user</p>
                    <p className="text-base font-semibold">{session.user.name}</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Emissions */}
                <div className="relative group overflow-hidden p-6 rounded-3xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-6xl">☁️</span>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Emissions</p>
                    {statsQuery.isLoading ? (
                        <div className="h-10 w-32 bg-muted/50 animate-pulse rounded mt-2" />
                    ) : (
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-foreground">{statsQuery.data?.totalEmitted.toFixed(1) || "0.0"}</span>
                            <span className="text-sm font-medium text-muted-foreground">kg CO2e</span>
                        </div>
                    )}
                </div>

                {/* Offset Potential */}
                <div className="relative group overflow-hidden p-6 rounded-3xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-6xl">🌱</span>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Offset Potential</p>
                    {statsQuery.isLoading ? (
                        <div className="h-10 w-32 bg-muted/50 animate-pulse rounded mt-2" />
                    ) : (
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-green-600 dark:text-green-400">{statsQuery.data?.totalSaved.toFixed(1) || "0.0"}</span>
                            <span className="text-sm font-medium text-muted-foreground">kg CO2e</span>
                        </div>
                    )}
                </div>

                {/* Trees Needed */}
                <div className="relative group overflow-hidden p-6 rounded-3xl border border-green-200/50 dark:border-green-800/30 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
                        <span className="text-6xl">🌳</span>
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-3 bg-white/50 dark:bg-green-500/20 backdrop-blur-sm rounded-2xl shadow-sm">
                            <span className="text-2xl">🌳</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-green-800 dark:text-green-200 uppercase tracking-wider">Impact Equivalence</p>
                            {statsQuery.isLoading ? (
                                <div className="h-8 w-24 bg-green-200/50 dark:bg-green-800/50 animate-pulse rounded mt-1" />
                            ) : (
                                <p className="text-3xl font-bold text-green-900 dark:text-white">
                                    {statsQuery.data?.treesNeeded || 0} <span className="text-lg font-medium opacity-80 text-green-800 dark:text-green-200">Trees</span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Logging Form - 7 Cols */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="p-8 rounded-3xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold">Log Activity</h3>
                            <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wide">
                                New Entry
                            </div>
                        </div>

                        {/* Category Tabs */}
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            {(Object.keys(CATEGORIES) as Array<keyof typeof CATEGORIES>).map((cat) => (
                                <button
                                    type="button"
                                    key={cat}
                                    onClick={() => {
                                        setSelectedCategory(cat);
                                        setSelectedAction(CATEGORIES[cat].actions[0].id);
                                    }}
                                    className={`relative overflow-hidden flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all duration-300 cursor-pointer group ${selectedCategory === cat
                                        ? `border-primary/50 bg-primary/5 text-primary shadow-sm scale-[1.02]`
                                        : "border-border/40 bg-background/50 text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent"
                                        }`}
                                >
                                    <span className="text-3xl filter drop-shadow-sm transition-transform group-hover:scale-110 duration-300">{CATEGORIES[cat].icon}</span>
                                    <span className="text-sm font-semibold">{CATEGORIES[cat].label}</span>
                                    {selectedCategory === cat && (
                                        <div className="absolute inset-0 bg-primary/5 animate-pulse rounded-2xl pointer-events-none" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleLog} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Custom Select */}
                                <CustomSelect
                                    label="Action Type"
                                    options={CATEGORIES[selectedCategory].actions}
                                    value={selectedAction}
                                    onChange={setSelectedAction}
                                />

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground/80 pl-1">
                                        Quantity ({CATEGORIES[selectedCategory].actions.find(a => a.id === selectedAction)?.unit})
                                    </label>
                                    <div className={`relative transition-all duration-200 ${isFocused ? "transform scale-[1.01]" : ""}`}>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            placeholder="0.0"
                                            className={`w-full p-4 rounded-xl border bg-background text-foreground transition-all duration-200 outline-none placeholder:text-muted-foreground/30 ${isFocused
                                                ? "border-primary ring-2 ring-primary/10 shadow-lg shadow-primary/5"
                                                : "border-input hover:border-primary/50"
                                                }`}
                                            value={value}
                                            onChange={(e) => setValue(e.target.value)}
                                            onFocus={() => setIsFocused(true)}
                                            onBlur={() => setIsFocused(false)}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground font-medium text-sm">
                                            {CATEGORIES[selectedCategory].actions.find(a => a.id === selectedAction)?.unit}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!value || isSubmitting}
                                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg hover:opacity-95 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform active:scale-[0.99] cursor-pointer mt-4 relative overflow-hidden group"
                            >
                                <span className={`flex items-center justify-center gap-2 relative z-10 transition-transform duration-300 ${isSubmitting ? "translate-y-0" : "group-hover:-translate-y-1"}`}>
                                    {isSubmitting ? (
                                        <>
                                            <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                                            Saving...
                                        </>
                                    ) : "Log Activity"}
                                </span>
                                {!isSubmitting && (
                                    <span className="absolute bottom-3 left-0 right-0 text-center text-xs opacity-0 group-hover:opacity-80 transition-opacity duration-300 text-white/80">
                                        Click to save
                                    </span>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Recent Activity - 5 Cols */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="flex items-center justify-between pl-2">
                        <h3 className="text-xl font-bold">Recent History</h3>
                        <button className="text-xs font-medium text-primary hover:underline cursor-pointer">View All</button>
                    </div>

                    <div className="space-y-4">
                        {historyQuery.isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="p-4 rounded-2xl border border-border bg-card/50 h-20 animate-pulse" />
                            ))
                        ) : historyQuery.data?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-border/50 rounded-3xl">
                                <span className="text-4xl opacity-50 mb-2">📝</span>
                                <p className="text-muted-foreground font-medium">No logs yet.</p>
                                <p className="text-xs text-muted-foreground mt-1">Your recent activities will appear here.</p>
                            </div>
                        ) : (
                            historyQuery.data?.map((item) => {
                                const catKey = Object.keys(CATEGORIES).find(key =>
                                    CATEGORIES[key as keyof typeof CATEGORIES].actions.some(a => a.id === item.action)
                                ) as keyof typeof CATEGORIES | undefined;

                                const catDef = catKey ? CATEGORIES[catKey] : CATEGORIES.TRANSPORT;
                                const actionLabel = catDef.actions.find(a => a.id === item.action)?.label || item.action;

                                return (
                                    <div key={item.id} className="group p-4 rounded-2xl border border-border bg-card hover:bg-accent/50 hover:border-primary/20 transition-all duration-300 flex justify-between items-center cursor-default hover:shadow-sm hover:translate-x-1">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${catDef.bg} ${catDef.color} text-xl transition-transform duration-300 group-hover:scale-110`}>
                                                {catDef.icon}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground text-sm">{actionLabel}</p>
                                                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                                                    {new Date(item.date).toLocaleDateString()} • {item.value} {item.unit}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold text-sm ${item.carbon < 0 ? "text-green-600 dark:text-green-400" : "text-foreground"}`}>
                                                {item.carbon > 0 ? "+" : ""}{item.carbon.toFixed(2)}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">kg CO2</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
