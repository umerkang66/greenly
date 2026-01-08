import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "@/lib/db";
import type { Activity } from "@prisma/client";

// Carbon Constants (Impact in kg CO2e)
const CARBON_FACTORS: Record<string, number> = {
    // Transport (per km)
    "transport-car-gas": 0.192,
    "transport-car-ev": 0.053,
    "transport-bus": 0.105,
    "transport-train": 0.041,
    "transport-bike": 0,

    // Diet (per meal)
    "diet-meat-high": 2.5,  // Heavy meat meal
    "diet-meat-low": 1.2,   // Chicken/Fish
    "diet-vegetarian": 0.5,
    "diet-vegan": 0.3,

    // Energy (per kWh)
    "energy-grid": 0.4,
    "energy-solar": 0,
};

export const carbonRouter = router({
    logActivity: protectedProcedure
        .input(
            z.object({
                category: z.string(), // TRANSPORT, DIET, ENERGY
                action: z.string(),   // e.g. "transport-car-gas"
                value: z.number().min(0), // amount (km, meals, kWh)
                unit: z.string(),     // km, meal, kWh
                date: z.date().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const factor = CARBON_FACTORS[input.action] ?? 0;
            // Calculate total impact
            const carbonImpact = factor * input.value;

            // Determine Type: 
            // Simplified logic: Everything is an "Emission" unless specific "Saving" actions are defined.
            // But user wants "positive, carbon-saving actions".
            // We can treat "transport-bike" or "diet-vegan" as savings compared to baseline?
            // For now, let's just log the calculated carbon. Low carbon is good.
            // Or maybe the input `action` key determines if it's a "SAVING" (negative impact)?
            // Let's stick to recording the RAW emission for now, and UI can compare to average.

            // Actually, let's enable "manual" logging of savings if value < 0 ?? No.
            // Let's infer type based on action? 
            // For simplicity in this iteration: We track calculated emissions. 
            // "Planting a tree" could be a special action with negative factor?
            // Let's add that.

            let finalCarbon = carbonImpact;
            let type = "EMISSION";

            if (input.action === "action-plant-tree") {
                finalCarbon = -20; // -20kg per tree (approx lifetime)
                type = "SAVING";
            }

            // Refined Logic: If we want to show "Savings", we usually compare to a baseline.
            // E.g. Riding bike (0kg) vs Driving (0.19kg). The "Saving" is 0.19kg.
            // But database usually stores what happened.
            // Implementation: Store the computed carbon.

            const activity = await prisma.activity.create({
                data: {
                    userId: ctx.session.user.id,
                    category: input.category,
                    action: input.action,
                    value: input.value,
                    unit: input.unit,
                    carbon: finalCarbon,
                    type: type,
                    date: input.date || new Date(),
                },
            });

            return activity;
        }),

    getHistory: protectedProcedure
        .query(async ({ ctx }) => {
            return await prisma.activity.findMany({
                where: { userId: ctx.session.user.id },
                orderBy: { date: "desc" },
                take: 10,
            });
        }),

    getStats: protectedProcedure
        .query(async ({ ctx }) => {
            const activities = await prisma.activity.findMany({
                where: { userId: ctx.session.user.id },
            });

            const totalEmitted = activities
                .filter((a: Activity) => a.carbon > 0)
                .reduce((acc: number, curr: Activity) => acc + curr.carbon, 0);

            const totalSaved = activities
                .filter((a: Activity) => a.carbon < 0)
                .reduce((acc: number, curr: Activity) => acc + Math.abs(curr.carbon), 0);

            // Net could be Emitted - Saved? Or just Emitted.
            // Let's return both.

            // Trees needed to offset total emissions (approx 20kg per tree/year)
            const treesNeeded = Math.ceil(totalEmitted / 20);

            return {
                totalEmitted,
                totalSaved,
                netCarbon: totalEmitted - totalSaved,
                treesNeeded,
            };
        }),
});
