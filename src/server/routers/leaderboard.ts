import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { prisma } from "@/lib/db";

interface CommunityMember {
    userId: string;
}

interface UserWithBadges {
    id: string;
    name: string;
    image: string | null;
    points: number;
    badges: { badge: { icon: string } }[];
}

interface CommunityWithCounts {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    totalCarbonSaved: number;
    _count: {
        members: number;
        challenges: number;
    };
}

interface Participant {
    user: {
        id: string;
        name: string;
        image: string | null;
        points: number;
    };
    progress: number;
    joinedAt: Date;
}

export const leaderboardRouter = router({
    // Get individual leaderboard (by points)
    getIndividual: publicProcedure
        .input(
            z.object({
                communityId: z.string().optional(),
                limit: z.number().min(1).max(100).default(20),
            }).optional()
        )
        .query(async ({ input }) => {
            let userIds: string[] | undefined;

            // If community filter, get community member IDs
            if (input?.communityId) {
                const members = await prisma.communityMember.findMany({
                    where: { communityId: input.communityId },
                    select: { userId: true },
                });
                userIds = members.map((m: CommunityMember) => m.userId);
            }

            const users = await prisma.user.findMany({
                where: userIds ? { id: { in: userIds } } : {},
                select: {
                    id: true,
                    name: true,
                    image: true,
                    points: true,
                    badges: {
                        select: { badge: { select: { icon: true } } },
                        take: 3,
                    },
                },
                orderBy: { points: "desc" },
                take: input?.limit || 20,
            }) as UserWithBadges[];

            return users.map((user: UserWithBadges, index: number) => ({
                rank: index + 1,
                id: user.id,
                name: user.name,
                image: user.image,
                points: user.points,
                topBadges: user.badges.map((b) => b.badge.icon),
            }));
        }),

    // Get community leaderboard (inter-community ranking)
    getCommunities: publicProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(50).default(20),
            }).optional()
        )
        .query(async ({ input }) => {
            const communities = await prisma.community.findMany({
                include: {
                    _count: {
                        select: { members: true, challenges: true },
                    },
                },
                orderBy: { totalCarbonSaved: "desc" },
                take: input?.limit || 20,
            }) as CommunityWithCounts[];

            // Calculate total points for each community
            const communitiesWithStats = await Promise.all(
                communities.map(async (community: CommunityWithCounts, index: number) => {
                    const memberIds = await prisma.communityMember.findMany({
                        where: { communityId: community.id },
                        select: { userId: true },
                    });

                    const totalPoints = await prisma.user.aggregate({
                        where: { id: { in: memberIds.map((m: CommunityMember) => m.userId) } },
                        _sum: { points: true },
                    });

                    return {
                        rank: index + 1,
                        id: community.id,
                        name: community.name,
                        slug: community.slug,
                        imageUrl: community.imageUrl,
                        memberCount: community._count.members,
                        challengeCount: community._count.challenges,
                        totalCarbonSaved: community.totalCarbonSaved,
                        totalPoints: totalPoints._sum.points || 0,
                    };
                })
            );

            // Re-sort by total points
            return communitiesWithStats.sort((a, b) => b.totalPoints - a.totalPoints);
        }),

    // Get challenge leaderboard
    getChallenge: publicProcedure
        .input(z.object({ challengeId: z.string() }))
        .query(async ({ input }) => {
            const participants = await prisma.challengeParticipant.findMany({
                where: { challengeId: input.challengeId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            points: true,
                        },
                    },
                },
                orderBy: { progress: "desc" },
            }) as Participant[];

            return participants.map((p: Participant, index: number) => ({
                rank: index + 1,
                id: p.user.id,
                name: p.user.name,
                image: p.user.image,
                progress: p.progress,
                joinedAt: p.joinedAt,
            }));
        }),

    // Get user's rank
    getUserRank: publicProcedure
        .input(z.object({ userId: z.string() }))
        .query(async ({ input }) => {
            const user = await prisma.user.findUnique({
                where: { id: input.userId },
                select: { points: true },
            });

            if (!user) return { rank: null, points: 0 };

            const rank = await prisma.user.count({
                where: { points: { gt: user.points } },
            });

            const totalUsers = await prisma.user.count();

            return {
                rank: rank + 1,
                points: user.points,
                totalUsers,
                percentile: Math.round(((totalUsers - rank) / totalUsers) * 100),
            };
        }),

    // Get weekly top performers
    getWeeklyTop: publicProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(20).default(10),
            }).optional()
        )
        .query(async ({ input }) => {
            // For a true weekly leaderboard, we'd need to track point changes
            // For now, return top users by points
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    image: true,
                    points: true,
                },
                orderBy: { points: "desc" },
                take: input?.limit || 10,
            });

            return users.map((user: { id: string; name: string; image: string | null; points: number }, index: number) => ({
                rank: index + 1,
                ...user,
            }));
        }),
});
