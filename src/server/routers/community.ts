import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { prisma } from "@/lib/db";
import { TRPCError } from "@trpc/server";

export const communityRouter = router({
    create: protectedProcedure
        .input(
            z.object({
                name: z.string().min(3, "Name must be at least 3 characters"),
                description: z.string().min(10, "Description must be at least 10 characters"),
                slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and dashes"),
                isPrivate: z.boolean().default(false),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const existing = await prisma.community.findUnique({
                where: { slug: input.slug },
            });

            if (existing) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "Community identifier already taken",
                });
            }

            const community = await prisma.community.create({
                data: {
                    name: input.name,
                    description: input.description,
                    slug: input.slug,
                    isPrivate: input.isPrivate,
                    ownerId: ctx.session.user.id,
                    members: {
                        create: {
                            userId: ctx.session.user.id,
                            role: "ADMIN",
                        },
                    },
                },
            });

            return community;
        }),

    getAll: publicProcedure
        .input(
            z.object({
                search: z.string().optional(),
            }).optional()
        )
        .query(async ({ input }) => {
            const where = input?.search
                ? {
                    OR: [
                        { name: { contains: input.search, mode: "insensitive" as const } },
                        { description: { contains: input.search, mode: "insensitive" as const } },
                    ],
                }
                : {};

            const communities = await prisma.community.findMany({
                where,
                include: {
                    _count: {
                        select: { members: true },
                    },
                },
                orderBy: {
                    members: {
                        _count: "desc",
                    },
                },
            });

            return communities.map((c: any) => ({
                ...c,
                memberCount: c._count.members,
            }));
        }),

    getBySlug: publicProcedure
        .input(z.object({ slug: z.string() }))
        .query(async ({ input, ctx }) => {
            const community = await prisma.community.findUnique({
                where: { slug: input.slug },
                include: {
                    _count: {
                        select: { members: true }
                    },
                    members: {
                        take: 5,
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    image: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!community) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Community not found" });
            }

            let isMember = false;
            let isAdmin = false;

            if (ctx.session?.user) {
                const memberRecord = await prisma.communityMember.findUnique({
                    where: {
                        userId_communityId: {
                            userId: ctx.session.user.id,
                            communityId: community.id,
                        },
                    },
                });
                if (memberRecord) {
                    isMember = true;
                    isAdmin = memberRecord.role === "ADMIN";
                }
            }

            return {
                ...community,
                memberCount: community._count.members,
                isMember,
                isAdmin,
            };
        }),

    join: protectedProcedure
        .input(z.object({ communityId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Check if already member
            const existing = await prisma.communityMember.findUnique({
                where: {
                    userId_communityId: {
                        userId: ctx.session.user.id,
                        communityId: input.communityId,
                    },
                },
            });

            const community = await prisma.community.findUnique({
                where: { id: input.communityId },
            });

            if (!community) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Community not found" });
            }

            if (community.isPrivate) {
                throw new TRPCError({ code: "FORBIDDEN", message: "This community is private. You must be invited." });
            }

            if (existing) {
                throw new TRPCError({ code: "CONFLICT", message: "Already a member" });
            }

            const member = await prisma.communityMember.create({
                data: {
                    userId: ctx.session.user.id,
                    communityId: input.communityId,
                    role: "MEMBER"
                }
            });

            return { success: true };
        }),

    searchUsers: protectedProcedure
        .input(z.object({ query: z.string().min(1) }))
        .query(async ({ input }) => {
            return await prisma.user.findMany({
                where: {
                    OR: [
                        { name: { contains: input.query, mode: "insensitive" } },
                        { email: { contains: input.query, mode: "insensitive" } }
                    ]
                },
                take: 5,
                select: { id: true, name: true, image: true, email: true }
            });
        }),

    inviteUser: protectedProcedure
        .input(z.object({ communityId: z.string(), userIds: z.array(z.string()) }))
        .mutation(async ({ ctx, input }) => {
            const community = await prisma.community.findUnique({
                where: { id: input.communityId },
            });
            if (!community) throw new TRPCError({ code: "NOT_FOUND" });

            // Check permission
            const member = await prisma.communityMember.findUnique({
                where: { userId_communityId: { userId: ctx.session.user.id, communityId: input.communityId } }
            });

            if (!member && community.ownerId !== ctx.session.user.id) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Must be a member to invite" });
            }

            // Create notifications for all
            await prisma.notification.createMany({
                data: input.userIds.map(userId => ({
                    userId: userId,
                    senderId: ctx.session.user.id,
                    type: "COMMUNITY_INVITE",
                    data: JSON.stringify({
                        communityId: community.id,
                        communityName: community.name,
                        communitySlug: community.slug
                    }),
                }))
            });

            return { success: true };
        }),

    acceptInvite: protectedProcedure
        .input(z.object({ notificationId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const notification = await prisma.notification.findUnique({
                where: { id: input.notificationId, userId: ctx.session.user.id }
            });
            if (!notification || notification.type !== "COMMUNITY_INVITE") {
                throw new TRPCError({ code: "BAD_REQUEST" });
            }

            const data = JSON.parse(notification.data);
            const communityId = data.communityId;

            // Add member (bypass private check)
            // Check if already member
            const existing = await prisma.communityMember.findUnique({
                where: { userId_communityId: { userId: ctx.session.user.id, communityId } }
            });

            if (!existing) {
                await prisma.communityMember.create({
                    data: {
                        userId: ctx.session.user.id,
                        communityId: communityId,
                        role: "MEMBER"
                    }
                });
            }

            // Mark read
            await prisma.notification.update({
                where: { id: input.notificationId },
                data: { isRead: true }
            });

            return { slug: data.communitySlug };
        }),

    leave: protectedProcedure
        .input(z.object({ communityId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            await prisma.communityMember.delete({
                where: {
                    userId_communityId: {
                        userId: ctx.session.user.id,
                        communityId: input.communityId
                    }
                }
            });
            return { success: true };
        }),

    getLeaderboard: publicProcedure
        .input(z.object({ communityId: z.string() }))
        .query(async ({ input }) => {
            // This is a simplified leaderboard. 
            // Ideally we would aggregate carbon from the Activity table for each member.
            // For MVP, since Activity schema isn't fully linked to Community yet (activities are global),
            // we will just show the members.
            // TODO: In real implementation, enhance Activity model to include communityId 
            // OR execute a heavy query to sum all activities for these users (might be slow).

            // Let's do a basic member list for now to satisfy the structure
            const members = await prisma.communityMember.findMany({
                where: { communityId: input.communityId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        }
                    }
                },
                take: 20,
            });

            return members.map((m: any) => ({
                userId: m.userId,
                name: m.user.name,
                image: m.user.image,
                score: Math.floor(Math.random() * 1000) // Mock score for MVP visual
            })).sort((a: any, b: any) => b.score - a.score);
        }),

    getCarbonForecast: protectedProcedure
        .input(z.object({ slug: z.string() }))
        .query(async ({ ctx, input }) => {
            const community = await prisma.community.findUnique({
                where: { slug: input.slug },
                include: {
                    _count: {
                        select: { members: true }
                    },
                    challenges: {
                        where: { status: "ACTIVE" },
                        include: {
                            _count: { select: { participants: true } }
                        }
                    }
                }
            });

            if (!community) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Community not found" });
            }

            // check membership
            const member = await prisma.communityMember.findUnique({
                where: {
                    userId_communityId: {
                        userId: ctx.session.user.id,
                        communityId: community.id
                    }
                }
            });

            if (!member && community.isPrivate) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Must be a member to view forecast" });
            }

            // Gather Engagement Metrics (Last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const recentPostsCount = await prisma.post.count({
                where: {
                    communityId: community.id,
                    createdAt: { gte: thirtyDaysAgo }
                }
            });

            const recentCommentsCount = await prisma.comment.count({
                where: {
                    post: { communityId: community.id },
                    createdAt: { gte: thirtyDaysAgo }
                }
            });

            // Prepare Prompt
            const challengeSummaries = community.challenges.map(c =>
                `- Challenge: "${c.title}" (${c.type}). Goal: ${c.goalValue} ${c.metric}. Participants: ${c._count.participants}`
            ).join("\n");

            const prompt = `
Analyze the community "${community.name}" to forecast potential carbon reduction for the next 30 days.

Data:
- Members: ${community._count.members}
- Total Carbon Saved All-Time: ${community.totalCarbonSaved} kg CO2e
- Recent Engagement (Last 30d): ${recentPostsCount} posts, ${recentCommentsCount} comments.
- Active Challenges:
${challengeSummaries || "None"}

Task:
1. Estimate the engagement level (Low/Medium/High).
2. Forecast the collective carbon reduction (in kg CO2e) for the next 30 days.
3. Provide a brief 2-3 sentence explanation citing the data.

Format the output clearly.
            `;

            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
                const model = genAI.getGenerativeModel({ model: "gemini-pro" });

                const result = await model.generateContent(prompt);
                const response = result.response;
                const text = response.text();

                return { forecast: text };
            } catch (error) {
                console.error("Gemini API Error:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to generate forecast. Please try again later."
                });
            }
        })
});
