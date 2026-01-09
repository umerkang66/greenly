import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/db";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const ecoCoachRouter = router({
    chat: protectedProcedure
        .input(z.object({
            message: z.string().min(1),
        }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            // Get user's carbon stats for context
            const activities = await prisma.activity.findMany({
                where: { userId },
                orderBy: { date: "desc" },
                take: 20,
            });

            const savingsStats = await prisma.activity.aggregate({
                where: { userId, type: "SAVING" },
                _sum: { carbon: true },
            });

            const emissionsStats = await prisma.activity.aggregate({
                where: { userId, type: "EMISSION" },
                _sum: { carbon: true },
            });

            // Build context for AI
            const recentActivities = activities.slice(0, 10).map((a: any) =>
                `${a.action}: ${a.value} ${a.unit} (${a.carbon > 0 ? '+' : ''}${a.carbon.toFixed(2)} kg CO2)`
            ).join("\n");

            const totalEmissions = emissionsStats._sum.carbon || 0;
            const totalSavings = Math.abs(savingsStats._sum.carbon || 0);
            const netCarbon = totalEmissions - totalSavings;

            const systemPrompt = `You are Greenly's AI Eco Coach - a friendly, knowledgeable sustainability advisor. Your role is to help users reduce their carbon footprint with personalized, actionable advice.

USER'S CARBON DATA:
- Total Emissions: ${totalEmissions.toFixed(1)} kg CO2
- Total Savings: ${totalSavings.toFixed(1)} kg CO2
- Net Carbon Footprint: ${netCarbon.toFixed(1)} kg CO2
- Recent Activities:
${recentActivities || "No activities logged yet"}

GUIDELINES:
1. Be encouraging and positive - celebrate their green actions
2. Give specific, actionable tips based on their actual data
3. Use emojis sparingly for friendliness 🌱
4. Keep responses concise (2-3 paragraphs max)
5. When discussing numbers, reference their actual stats
6. Suggest activities they could log to improve
7. If they ask for a summary, provide insights about their patterns

Respond to their message naturally and helpfully.`;

            try {
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

                const result = await model.generateContent([
                    { text: systemPrompt },
                    { text: `User message: ${input.message}` }
                ]);

                const response = result.response.text();

                return {
                    message: response,
                    stats: {
                        totalEmissions,
                        totalSavings,
                        netCarbon,
                    }
                };
            } catch (error) {
                console.error("AI Error:", error);
                return {
                    message: "I'm having trouble connecting right now. Please try again in a moment! 🌿",
                    stats: {
                        totalEmissions,
                        totalSavings,
                        netCarbon,
                    }
                };
            }
        }),

    getQuickPrompts: protectedProcedure.query(async () => {
        return [
            { id: "summary", label: "📊 Weekly Summary", prompt: "Give me a summary of my carbon footprint this week and tips to improve." },
            { id: "reduce", label: "💡 How to Reduce?", prompt: "What are the best ways I can reduce my carbon emissions based on my activities?" },
            { id: "compare", label: "🌍 Am I Doing Well?", prompt: "How does my carbon footprint compare to average? Am I on a good track?" },
            { id: "tips", label: "🌱 Green Tips", prompt: "Give me 3 easy sustainability tips I can start today." },
        ];
    }),

    // AI Weekly Report
    generateWeeklyReport: protectedProcedure.mutation(async ({ ctx }) => {
        const userId = ctx.session.user.id;
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const activities = await prisma.activity.findMany({
            where: { userId, date: { gte: oneWeekAgo } },
            orderBy: { date: "desc" },
        });

        const totalEmissions = activities.filter((a: any) => a.type === "EMISSION").reduce((acc: number, a: any) => acc + a.carbon, 0);
        const totalSavings = activities.filter((a: any) => a.type === "SAVING").reduce((acc: number, a: any) => acc + Math.abs(a.carbon), 0);

        const categoryBreakdown = activities.reduce((acc: any, a: any) => {
            acc[a.category] = (acc[a.category] || 0) + Math.abs(a.carbon);
            return acc;
        }, {});

        const prompt = `Generate a professional weekly sustainability report in markdown format.

USER'S WEEKLY DATA:
- Total Activities: ${activities.length}
- Emissions: ${totalEmissions.toFixed(2)} kg CO2
- Savings: ${totalSavings.toFixed(2)} kg CO2
- Net Impact: ${(totalEmissions - totalSavings).toFixed(2)} kg CO2
- Categories: ${JSON.stringify(categoryBreakdown)}

FORMAT:
# 🌍 Weekly Eco Report

## 📊 Summary
[Brief overview of the week]

## 🔥 Highlights
[Top achievements or areas of concern]

## 📈 Breakdown
[Category analysis]

## 💡 Recommendations
[3 specific action items for next week]

## 🎯 Challenge
[One fun challenge for the upcoming week]

Keep it encouraging and actionable. Use emojis. Max 400 words.`;

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const result = await model.generateContent([{ text: prompt }]);

            return {
                success: true,
                report: result.response.text(),
                stats: { totalEmissions, totalSavings, activityCount: activities.length },
            };
        } catch (error) {
            console.error("Report Error:", error);
            return { success: false, report: null, stats: null };
        }
    }),

    // AI Smart Goals
    suggestGoals: protectedProcedure.mutation(async ({ ctx }) => {
        const userId = ctx.session.user.id;

        const activities = await prisma.activity.findMany({
            where: { userId },
            orderBy: { date: "desc" },
            take: 30,
        });

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { points: true, name: true },
        });

        const prompt = `Based on the user's activity patterns, suggest 3 personalized sustainability goals.

USER DATA:
- Name: ${user?.name || "User"}
- Points: ${user?.points || 0}
- Recent Activities: ${activities.slice(0, 10).map((a: any) => a.action).join(", ")}
- Activity Count: ${activities.length}

Return ONLY valid JSON array (no markdown):
[
  {
    "title": "Goal title",
    "description": "Brief description",
    "target": "Specific measurable target",
    "difficulty": "easy" | "medium" | "hard",
    "points": 50-200,
    "icon": "emoji"
  }
]

Make goals specific, achievable, and based on their patterns.`;

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const result = await model.generateContent([{ text: prompt }]);

            let jsonStr = result.response.text();
            if (jsonStr.includes("```")) {
                jsonStr = jsonStr.split("```json")[1]?.split("```")[0] || jsonStr.split("```")[1]?.split("```")[0] || jsonStr;
            }

            const goals = JSON.parse(jsonStr.trim());
            return { success: true, goals };
        } catch (error) {
            console.error("Goals Error:", error);
            return { success: false, goals: [] };
        }
    }),
});
