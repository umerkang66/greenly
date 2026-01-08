import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { prisma } from "@/lib/db";

export const gamificationRouter = router({
    // Get user's gamification stats
    getUserStats: protectedProcedure.query(async ({ ctx }) => {
        const user = await prisma.user.findUnique({
            where: { id: ctx.session.user.id },
            include: {
                badges: {
                    include: {
                        badge: true,
                    },
                },
                challengeParticipations: {
                    include: {
                        challenge: true,
                    },
                },
            },
        });

        if (!user) {
            return {
                points: 0,
                badgeCount: 0,
                challengesJoined: 0,
                challengesCompleted: 0,
                rank: 0,
            };
        }

        // Calculate rank (position among all users by points)
        const usersAbove = await prisma.user.count({
            where: { points: { gt: user.points } },
        });

        const completedChallenges = user.challengeParticipations.filter(
            (p: any) => p.challenge.status === "COMPLETED"
        ).length;

        return {
            points: user.points,
            badgeCount: user.badges.length,
            challengesJoined: user.challengeParticipations.length,
            challengesCompleted: completedChallenges,
            rank: usersAbove + 1,
        };
    }),

    // Get all available badges
    getAllBadges: publicProcedure.query(async () => {
        const badges = await prisma.badge.findMany({
            orderBy: { pointsValue: "desc" },
        });

        return badges;
    }),

    // Get user's earned badges
    getUserBadges: protectedProcedure
        .input(z.object({ userId: z.string().optional() }))
        .query(async ({ ctx, input }) => {
            const userId = input.userId || ctx.session.user.id;

            const userBadges = await prisma.userBadge.findMany({
                where: { userId },
                include: {
                    badge: true,
                },
                orderBy: { earnedAt: "desc" },
            });

            return userBadges;
        }),

    // Award a badge to user
    awardBadge: protectedProcedure
        .input(z.object({ badgeId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Check if already has badge
            const existing = await prisma.userBadge.findUnique({
                where: {
                    userId_badgeId: {
                        userId: ctx.session.user.id,
                        badgeId: input.badgeId,
                    },
                },
            });

            if (existing) {
                return { success: false, message: "Badge already earned" };
            }

            const badge = await prisma.badge.findUnique({
                where: { id: input.badgeId },
            });

            if (!badge) {
                return { success: false, message: "Badge not found" };
            }

            // Award badge
            const userBadge = await prisma.userBadge.create({
                data: {
                    userId: ctx.session.user.id,
                    badgeId: input.badgeId,
                },
            });

            // Award points from badge
            await prisma.user.update({
                where: { id: ctx.session.user.id },
                data: { points: { increment: badge.pointsValue } },
            });

            return { success: true, userBadge };
        }),

    // Check eligibility and award badges
    checkAndAwardBadges: protectedProcedure.mutation(async ({ ctx }) => {
        const userId = ctx.session.user.id;
        const awardedBadges: string[] = [];

        // Get user stats
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                activities: true,
                badges: true,
                challengeParticipations: {
                    include: { challenge: true },
                },
                memberships: true,
            },
        });

        if (!user) return { awardedBadges: [] };

        const existingBadgeIds = user.badges.map((b: any) => b.badgeId);
        const allBadges = await prisma.badge.findMany();

        for (const badge of allBadges) {
            if (existingBadgeIds.includes(badge.id)) continue;

            let shouldAward = false;
            const criteria = JSON.parse(badge.criteria || "{}");

            // Check different badge criteria
            switch (badge.category) {
                case "MILESTONE":
                    if (criteria.type === "first_activity" && user.activities.length >= 1) {
                        shouldAward = true;
                    }
                    if (criteria.type === "carbon_saved" && criteria.value) {
                        const totalSaved = user.activities
                            .filter((a: any) => a.carbon < 0)
                            .reduce((sum: number, a: any) => sum + Math.abs(a.carbon), 0);
                        if (totalSaved >= criteria.value) {
                            shouldAward = true;
                        }
                    }
                    break;

                case "CHALLENGE":
                    if (criteria.type === "challenges_completed" && criteria.value) {
                        const completed = user.challengeParticipations.filter(
                            (p: any) => p.challenge.status === "COMPLETED"
                        ).length;
                        if (completed >= criteria.value) {
                            shouldAward = true;
                        }
                    }
                    break;

                case "COMMUNITY":
                    if (criteria.type === "community_joined" && user.memberships.length >= 1) {
                        shouldAward = true;
                    }
                    if (criteria.type === "community_created") {
                        const adminMemberships = user.memberships.filter(
                            (m: any) => m.role === "ADMIN"
                        );
                        if (adminMemberships.length >= 1) {
                            shouldAward = true;
                        }
                    }
                    break;
            }

            if (shouldAward) {
                await prisma.userBadge.create({
                    data: {
                        userId,
                        badgeId: badge.id,
                    },
                });

                await prisma.user.update({
                    where: { id: userId },
                    data: { points: { increment: badge.pointsValue } },
                });

                awardedBadges.push(badge.name);
            }
        }

        return { awardedBadges };
    }),

    // Get user profile with gamification data
    getProfile: publicProcedure
        .input(z.object({ userId: z.string() }))
        .query(async ({ input }) => {
            const user = await prisma.user.findUnique({
                where: { id: input.userId },
                select: {
                    id: true,
                    name: true,
                    image: true,
                    points: true,
                    createdAt: true,
                    badges: {
                        include: { badge: true },
                        orderBy: { earnedAt: "desc" },
                        take: 5,
                    },
                    challengeParticipations: {
                        include: {
                            challenge: {
                                select: {
                                    id: true,
                                    title: true,
                                    status: true,
                                },
                            },
                        },
                        orderBy: { joinedAt: "desc" },
                        take: 5,
                    },
                },
            });

            if (!user) return null;

            const rank = await prisma.user.count({
                where: { points: { gt: user.points } },
            });

            return {
                ...user,
                rank: rank + 1,
            };
        }),
});
