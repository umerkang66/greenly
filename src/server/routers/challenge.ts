import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { prisma } from "@/lib/db";
import { TRPCError } from "@trpc/server";

export const challengeRouter = router({
    // Create a new challenge (admin only)
    create: protectedProcedure
        .input(
            z.object({
                title: z.string().min(3, "Title must be at least 3 characters"),
                description: z.string().min(10, "Description must be at least 10 characters"),
                goalValue: z.number().positive("Goal must be positive"),
                metric: z.string(),
                type: z.string(),
                communityId: z.string(),
                startDate: z.string(),
                endDate: z.string(),
                isCustom: z.boolean().default(true),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Check if user is admin of the community
            const membership = await prisma.communityMember.findUnique({
                where: {
                    userId_communityId: {
                        userId: ctx.session.user.id,
                        communityId: input.communityId,
                    },
                },
            });

            if (!membership || membership.role !== "ADMIN") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Only community admins can create challenges",
                });
            }

            const startDate = new Date(input.startDate);
            const endDate = new Date(input.endDate);

            const challenge = await prisma.challenge.create({
                data: {
                    title: input.title,
                    description: input.description,
                    goalValue: input.goalValue,
                    metric: input.metric,
                    type: input.type,
                    communityId: input.communityId,
                    createdById: ctx.session.user.id,
                    startDate: startDate,
                    endDate: endDate,
                    isCustom: input.isCustom,
                    status: new Date() < startDate ? "UPCOMING" : "ACTIVE",
                },
            });

            return challenge;
        }),

    // Get all challenges with optional filters
    getAll: publicProcedure
        .input(
            z.object({
                communityId: z.string().optional(),
                status: z.enum(["UPCOMING", "ACTIVE", "COMPLETED"]).optional(),
                limit: z.number().min(1).max(50).default(20),
            }).optional()
        )
        .query(async ({ input }) => {
            const where: any = {};

            if (input?.communityId) {
                where.communityId = input.communityId;
            }

            if (input?.status) {
                where.status = input.status;
            }

            const challenges = await prisma.challenge.findMany({
                where,
                include: {
                    community: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                    _count: {
                        select: { participants: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: input?.limit || 20,
            });

            return challenges.map((c: any) => ({
                ...c,
                participantCount: c._count.participants,
            }));
        }),

    // Get single challenge by ID
    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            const challenge = await prisma.challenge.findUnique({
                where: { id: input.id },
                include: {
                    community: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                    participants: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    image: true,
                                },
                            },
                        },
                        orderBy: { progress: "desc" },
                        take: 20,
                    },
                    _count: {
                        select: { participants: true },
                    },
                },
            });

            if (!challenge) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found" });
            }

            let isParticipant = false;
            let userProgress = 0;

            if (ctx.session?.user) {
                const participation = await prisma.challengeParticipant.findUnique({
                    where: {
                        userId_challengeId: {
                            userId: ctx.session.user.id,
                            challengeId: input.id,
                        },
                    },
                });

                if (participation) {
                    isParticipant = true;
                    userProgress = participation.progress;
                }
            }

            // Calculate total progress
            const totalProgress = challenge.participants.reduce(
                (sum: number, p: any) => sum + p.progress,
                0
            );

            return {
                ...challenge,
                participantCount: challenge._count.participants,
                isParticipant,
                userProgress,
                totalProgress,
                progressPercentage: Math.min((totalProgress / challenge.goalValue) * 100, 100),
            };
        }),

    // Join a challenge
    join: protectedProcedure
        .input(z.object({ challengeId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Check if already participating
            const existing = await prisma.challengeParticipant.findUnique({
                where: {
                    userId_challengeId: {
                        userId: ctx.session.user.id,
                        challengeId: input.challengeId,
                    },
                },
            });

            if (existing) {
                throw new TRPCError({ code: "CONFLICT", message: "Already participating" });
            }

            // Check if challenge exists and is active
            const challenge = await prisma.challenge.findUnique({
                where: { id: input.challengeId },
            });

            if (!challenge) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found" });
            }

            if (challenge.status === "COMPLETED") {
                throw new TRPCError({ code: "BAD_REQUEST", message: "Challenge has ended" });
            }

            const participant = await prisma.challengeParticipant.create({
                data: {
                    userId: ctx.session.user.id,
                    challengeId: input.challengeId,
                },
            });

            // Award points for joining
            await prisma.user.update({
                where: { id: ctx.session.user.id },
                data: { points: { increment: 10 } },
            });

            return { success: true, participant };
        }),

    // Leave a challenge
    leave: protectedProcedure
        .input(z.object({ challengeId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            await prisma.challengeParticipant.delete({
                where: {
                    userId_challengeId: {
                        userId: ctx.session.user.id,
                        challengeId: input.challengeId,
                    },
                },
            });

            return { success: true };
        }),

    // Update user progress in a challenge
    updateProgress: protectedProcedure
        .input(
            z.object({
                challengeId: z.string(),
                increment: z.number().positive(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const participant = await prisma.challengeParticipant.findUnique({
                where: {
                    userId_challengeId: {
                        userId: ctx.session.user.id,
                        challengeId: input.challengeId,
                    },
                },
            });

            if (!participant) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Not participating in this challenge",
                });
            }

            const updated = await prisma.challengeParticipant.update({
                where: { id: participant.id },
                data: {
                    progress: { increment: input.increment },
                },
            });

            // Award points for progress
            await prisma.user.update({
                where: { id: ctx.session.user.id },
                data: { points: { increment: Math.floor(input.increment) } },
            });

            return updated;
        }),

    // Get challenges for a specific community
    getByCommunity: publicProcedure
        .input(z.object({ communityId: z.string() }))
        .query(async ({ input }) => {
            const challenges = await prisma.challenge.findMany({
                where: { communityId: input.communityId },
                include: {
                    _count: {
                        select: { participants: true },
                    },
                },
                orderBy: { createdAt: "desc" },
            });

            return challenges.map((c: any) => ({
                ...c,
                participantCount: c._count.participants,
            }));
        }),
});
