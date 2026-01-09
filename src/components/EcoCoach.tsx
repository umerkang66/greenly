"use client";

import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/lib/auth-client";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Sparkles, Loader2 } from "lucide-react";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

export function EcoCoach() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { data: quickPrompts } = trpc.ecoCoach.getQuickPrompts.useQuery(undefined, {
        enabled: !!session,
    });

    const chatMutation = trpc.ecoCoach.chat.useMutation({
        onSuccess: (data) => {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: data.message,
                },
            ]);
        },
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = (message?: string) => {
        const text = message || input.trim();
        if (!text) return;

        setMessages((prev) => [
            ...prev,
            { id: Date.now().toString(), role: "user", content: text },
        ]);
        setInput("");
        chatMutation.mutate({ message: text });
    };

    if (!session) return null;

    return (
        <>
            {/* Floating Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                        >
                            <X className="w-6 h-6" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            className="relative"
                        >
                            <Bot className="w-6 h-6" />
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[600px] bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-border bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground">Eco Coach</h3>
                                    <p className="text-xs text-muted-foreground">Your sustainability advisor</p>
                                </div>
                                <Sparkles className="w-4 h-4 text-yellow-500 ml-auto animate-pulse" />
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
                            {messages.length === 0 && (
                                <div className="text-center py-8">
                                    <Bot className="w-12 h-12 mx-auto text-emerald-500/30 mb-4" />
                                    <p className="text-muted-foreground text-sm">
                                        Hi! I&apos;m your AI Eco Coach. Ask me anything about your carbon footprint! 🌱
                                    </p>
                                </div>
                            )}

                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === "user"
                                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                                : "bg-muted text-foreground rounded-bl-sm"
                                            }`}
                                    >
                                        <div className="whitespace-pre-wrap">{msg.content}</div>
                                    </div>
                                </motion.div>
                            ))}

                            {chatMutation.isPending && (
                                <div className="flex justify-start">
                                    <div className="bg-muted p-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                                        <span className="text-sm text-muted-foreground">Thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Prompts */}
                        {messages.length === 0 && quickPrompts && (
                            <div className="px-4 pb-2">
                                <div className="flex flex-wrap gap-2">
                                    {quickPrompts.map((prompt) => (
                                        <button
                                            key={prompt.id}
                                            onClick={() => handleSend(prompt.prompt)}
                                            className="text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
                                        >
                                            {prompt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-4 border-t border-border">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSend();
                                }}
                                className="flex gap-2"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about your impact..."
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-muted/50 focus:bg-background focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
                                    disabled={chatMutation.isPending}
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || chatMutation.isPending}
                                    className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white disabled:opacity-50 hover:opacity-90 transition-all"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
