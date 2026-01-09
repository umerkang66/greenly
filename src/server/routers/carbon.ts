import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "@/lib/db";


// Carbon Constants (Impact in kg CO2e)
const CARBON_FACTORS: Record<string, number> = {
    // Transport (per km)
    "transport-car-gas": 0.192,
    "transport-car-ev": 0.053,
    "transport-bus": 0.105,
    "transport-train": 0.041,
    "transport-bike": 0,
    "transport-walk": 0,

    // Diet (per meal)
    "diet-meat-high": 2.5,  // Heavy meat meal
    "diet-meat-low": 1.2,   // Chicken/Fish
    "diet-vegetarian": 0.5,
    "diet-vegan": 0.3,

    // Energy (per kWh)
    "energy-grid": 0.4,
    "energy-solar": 0,

    // Waste (per item)
    "waste-plastic-bottle": 0.08,
    "waste-plastic-bag": 0.01,
    "waste-packaging": 0.5,
};

// Points awarded per activity type
const POINTS_PER_ACTIVITY: Record<string, number> = {
    // Eco-friendly transport
    "transport-bike": 15,
    "transport-walk": 15,
    "transport-train": 10,
    "transport-bus": 8,
    "transport-car-ev": 5,
    "transport-car-gas": 2,

    // Diet
    "diet-vegan": 15,
    "diet-vegetarian": 10,
    "diet-meat-low": 5,
    "diet-meat-high": 2,

    // Energy
    "energy-solar": 15,
    "energy-grid": 2,

    // Waste
    "waste-plastic-bottle": 5,
    "waste-plastic-bag": 5,
    "waste-packaging": 10,

    // Special actions
    "action-plant-tree": 50,
};

// Challenge type to activity mapping
const CHALLENGE_TYPE_ACTIONS: Record<string, string[]> = {
    "CYCLING": ["transport-bike"],
    "CARBON_SAVING": ["transport-bike", "transport-walk", "transport-train", "transport-bus", "transport-car-ev", "diet-vegan", "diet-vegetarian", "diet-meat-low", "energy-solar", "waste-plastic-bottle", "waste-plastic-bag", "waste-packaging"],
    "VEGAN_MEALS": ["diet-vegan"],
    "PLASTIC_REDUCTION": ["waste-plastic-bottle", "waste-plastic-bag", "waste-packaging"],
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
            const carbonImpact = factor * input.value;

            let finalCarbon = carbonImpact;
            let type = "EMISSION";

            if (input.action === "action-plant-tree") {
                finalCarbon = -20;
                type = "SAVING";
            }

            // Eco-friendly actions with 0 or low carbon are "savings"
            if (factor === 0 && input.value > 0) {
                type = "SAVING";
            }

            // Create the activity
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

            // === AWARD POINTS ===
            const pointsToAward = POINTS_PER_ACTIVITY[input.action] ?? 2;
            await prisma.user.update({
                where: { id: ctx.session.user.id },
                data: { points: { increment: pointsToAward } },
            });

            // === UPDATE CHALLENGE PROGRESS ===
            // Find active challenges user is participating in
            const userChallenges = await prisma.challengeParticipant.findMany({
                where: {
                    userId: ctx.session.user.id,
                    challenge: {
                        status: "ACTIVE",
                    },
                },
                include: {
                    challenge: true,
                },
            });

            // Update progress for matching challenges
            for (const participation of userChallenges) {
                const challengeType = participation.challenge.type;
                const matchingActions = CHALLENGE_TYPE_ACTIONS[challengeType] || [];

                if (matchingActions.includes(input.action) || challengeType === "CARBON_SAVING") {
                    // Calculate progress increment based on challenge type
                    let progressIncrement = input.value;

                    // For carbon saving challenges, use carbon saved
                    if (challengeType === "CARBON_SAVING" && type === "SAVING") {
                        progressIncrement = Math.abs(finalCarbon);
                    }

                    // Update participant progress
                    await prisma.challengeParticipant.update({
                        where: { id: participation.id },
                        data: {
                            progress: { increment: progressIncrement },
                        },
                    });

                    // Award bonus points for challenge progress
                    await prisma.user.update({
                        where: { id: ctx.session.user.id },
                        data: { points: { increment: Math.floor(progressIncrement) } },
                    });
                }
            }

            // === UPDATE COMMUNITY CARBON SAVED ===
            if (type === "SAVING" || finalCarbon < 0) {
                // Find user's communities and update their carbon saved
                const memberships = await prisma.communityMember.findMany({
                    where: { userId: ctx.session.user.id },
                });

                for (const membership of memberships) {
                    await prisma.community.update({
                        where: { id: membership.communityId },
                        data: {
                            totalCarbonSaved: { increment: Math.abs(finalCarbon) },
                        },
                    });
                }
            }

            return {
                ...activity,
                pointsAwarded: pointsToAward,
            };
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
                .filter((a: any) => a.carbon > 0)
                .reduce((acc: number, curr: any) => acc + curr.carbon, 0);

            const totalSaved = activities
                .filter((a: any) => a.carbon < 0)
                .reduce((acc: number, curr: any) => acc + Math.abs(curr.carbon), 0);

            const treesNeeded = Math.ceil(totalEmitted / 20);

            // Get user points
            const user = await prisma.user.findUnique({
                where: { id: ctx.session.user.id },
                select: { points: true },
            });

            return {
                totalEmitted,
                totalSaved,
                netCarbon: totalEmitted - totalSaved,
                treesNeeded,
                totalPoints: user?.points || 0,
                activityCount: activities.length,
            };
        }),
});
