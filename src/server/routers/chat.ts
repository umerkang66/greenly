import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { prisma } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";

export const chatRouter = router({
    // Get chat messages for a community
    getMessages: protectedProcedure
        .input(z.object({
            communityId: z.string(),
            cursor: z.string().optional(),
            limit: z.number().min(1).max(50).default(30),
        }))
        .query(async ({ input }) => {
            const messages = await prisma.chatMessage.findMany({
                where: { communityId: input.communityId },
                orderBy: { createdAt: "desc" },
                take: input.limit + 1,
                cursor: input.cursor ? { id: input.cursor } : undefined,
                include: {
                    user: {
                        select: { id: true, name: true, image: true },
                    },
                },
            });

            let nextCursor: string | undefined = undefined;
            if (messages.length > input.limit) {
                const nextItem = messages.pop();
                nextCursor = nextItem?.id;
            }

            return {
                messages: messages.reverse(), // Oldest first
                nextCursor,
            };
        }),

    // Send a message
    sendMessage: protectedProcedure
        .input(z.object({
            communityId: z.string(),
            content: z.string().min(1).max(1000),
            mentions: z.array(z.string()).default([]),
        }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            // Verify user is member of community
            const membership = await prisma.communityMember.findUnique({
                where: {
                    userId_communityId: {
                        userId,
                        communityId: input.communityId,
                    },
                },
            });

            if (!membership) {
                throw new Error("You must be a member to send messages");
            }

            // Get user info
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, name: true, image: true },
            });

            // Create message
            const message = await prisma.chatMessage.create({
                data: {
                    content: input.content,
                    communityId: input.communityId,
                    userId,
                    mentions: input.mentions,
                },
                include: {
                    user: {
                        select: { id: true, name: true, image: true },
                    },
                },
            });

            // Broadcast to Pusher channel
            await pusherServer.trigger(
                `community-${input.communityId}`,
                "new-message",
                {
                    id: message.id,
                    content: message.content,
                    createdAt: message.createdAt,
                    user: message.user,
                    mentions: message.mentions,
                }
            );

            // Create notifications for mentioned users
            if (input.mentions.length > 0) {
                const community = await prisma.community.findUnique({
                    where: { id: input.communityId },
                    select: { name: true, slug: true },
                });

                // Create notifications for each mentioned user
                await prisma.notification.createMany({
                    data: input.mentions.map((mentionedUserId) => ({
                        userId: mentionedUserId,
                        senderId: userId,
                        type: "CHAT_MENTION",
                        data: JSON.stringify({
                            communityId: input.communityId,
                            communityName: community?.name,
                            communitySlug: community?.slug,
                            messageId: message.id,
                            senderName: user?.name,
                            messagePreview: input.content.slice(0, 100),
                        }),
                    })),
                });
            }

            return message;
        }),

    // Get community members for @mention autocomplete
    getMembers: protectedProcedure
        .input(z.object({
            communityId: z.string(),
            query: z.string().optional(),
        }))
        .query(async ({ input }) => {
            const members = await prisma.communityMember.findMany({
                where: {
                    communityId: input.communityId,
                    ...(input.query && {
                        user: {
                            name: { contains: input.query, mode: "insensitive" },
                        },
                    }),
                },
                take: 10,
                include: {
                    user: {
                        select: { id: true, name: true, image: true },
                    },
                },
            });

            return members.map((m) => m.user);
        }),
});
