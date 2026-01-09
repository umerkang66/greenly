import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "@/lib/db";

export const notificationRouter = router({
    getMine: protectedProcedure
        .query(async ({ ctx }) => {
            const notifications = await prisma.notification.findMany({
                where: { userId: ctx.session.user.id },
                orderBy: { createdAt: "desc" },
                include: {
                    sender: {
                        select: { name: true, image: true }
                    }
                }
            });

            const unreadCount = await prisma.notification.count({
                where: { userId: ctx.session.user.id, isRead: false }
            });

            return { notifications, unreadCount };
        }),

    markRead: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            await prisma.notification.update({
                where: { id: input.id, userId: ctx.session.user.id },
                data: { isRead: true }
            });
        }),
});
