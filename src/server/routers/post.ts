import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/db";

export const postRouter = router({
    create: protectedProcedure
        .input(
            z.object({
                content: z.string().min(1),
                communityId: z.string(),
                type: z.enum(["GENERAL", "TIP", "RESOURCE", "ACHIEVEMENT"]).default("GENERAL"),
                isAnonymous: z.boolean().default(false),
                imageUrl: z.string().optional(),
                linkUrl: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Check if user is a member of the community
            const membership = await prisma.communityMember.findUnique({
                where: {
                    userId_communityId: {
                        userId: ctx.session.user.id,
                        communityId: input.communityId,
                    },
                },
            });

            if (!membership) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You must be a member of the community to post.",
                });
            }

            return prisma.post.create({
                data: {
                    content: input.content,
                    communityId: input.communityId,
                    userId: ctx.session.user.id,
                    type: input.type,
                    isAnonymous: input.isAnonymous,
                    imageUrl: input.imageUrl,
                    linkUrl: input.linkUrl,
                },
            });
        }),

    getInfinite: publicProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).default(10),
                cursor: z.string().nullish(),
                communityId: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {
            const limit = input.limit ?? 10;
            const { cursor } = input;

            const items = await prisma.post.findMany({
                take: limit + 1,
                cursor: cursor ? { id: cursor } : undefined,
                where: {
                    communityId: input.communityId,
                },
                orderBy: {
                    createdAt: "desc",
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                    _count: {
                        select: {
                            likes: true,
                            comments: true,
                        },
                    },
                    likes: ctx.session?.user?.id
                        ? {
                            where: {
                                userId: ctx.session.user.id,
                            },
                            select: {
                                userId: true,
                            },
                        }
                        : false,
                },
            });

            let nextCursor: typeof cursor | undefined = undefined;
            if (items.length > limit) {
                const nextItem = items.pop();
                nextCursor = nextItem!.id;
            }

            return {
                items: items.map((item: any) => ({
                    ...item,
                    isLiked: item.likes.length > 0,
                })),
                nextCursor,
            };
        }),

    toggleLike: protectedProcedure
        .input(z.object({ postId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const existingLike = await prisma.like.findUnique({
                where: {
                    userId_postId: {
                        userId: ctx.session.user.id,
                        postId: input.postId,
                    },
                },
            });

            if (existingLike) {
                await prisma.like.delete({
                    where: {
                        id: existingLike.id,
                    },
                });
                return { isLiked: false };
            } else {
                await prisma.like.create({
                    data: {
                        userId: ctx.session.user.id,
                        postId: input.postId,
                    },
                });
                return { isLiked: true };
            }
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const post = await prisma.post.findUnique({
                where: { id: input.id },
            });

            if (!post) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            if (post.userId !== ctx.session.user.id) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }

            return prisma.post.delete({
                where: { id: input.id },
            });
        }),
});
