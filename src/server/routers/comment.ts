import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/db";

export const commentRouter = router({
    create: protectedProcedure
        .input(
            z.object({
                content: z.string().min(1),
                postId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return prisma.comment.create({
                data: {
                    content: input.content,
                    postId: input.postId,
                    userId: ctx.session.user.id,
                },
            });
        }),

    getAll: publicProcedure
        .input(z.object({ postId: z.string() }))
        .query(async ({ input }) => {
            return prisma.comment.findMany({
                where: { postId: input.postId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "asc",
                },
            });
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const comment = await prisma.comment.findUnique({
                where: { id: input.id },
            });

            if (!comment) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            if (comment.userId !== ctx.session.user.id) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }

            return prisma.comment.delete({
                where: { id: input.id },
            });
        }),
});
