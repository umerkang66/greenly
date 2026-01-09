import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { prisma } from "@/lib/db";
import { TRPCError } from "@trpc/server";
import { generateUserToken, streamServerClient } from "@/lib/stream";

export const meetingRouter = router({
    create: protectedProcedure
        .input(
            z.object({
                title: z.string().min(3),
                description: z.string().optional(),
                startTime: z.string(), // ISO string
                communityId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const community = await prisma.community.findUnique({
                where: { id: input.communityId },
                include: { members: true }
            });

            if (!community) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Community not found" });
            }

            // Verify membership
            const member = community.members.find(m => m.userId === ctx.session.user.id);
            if (!member) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Must be a member to create a meeting" });
            }

            // Create meeting in DB
            const meeting = await prisma.meeting.create({
                data: {
                    title: input.title,
                    description: input.description,
                    startTime: new Date(input.startTime),
                    communityId: input.communityId,
                    createdById: ctx.session.user.id,
                }
            });

            // Create call in Stream (optional here, but ensures it exists)
            const call = streamServerClient.video.call("default", meeting.id);
            await call.getOrCreate({
                data: {
                    created_by_id: ctx.session.user.id,
                    custom: {
                        title: meeting.title,
                        description: meeting.description,
                    }
                }
            });

            return meeting;
        }),

    getByCommunity: protectedProcedure
        .input(z.object({ communityId: z.string() }))
        .query(async ({ input }) => {
            return await prisma.meeting.findMany({
                where: {
                    communityId: input.communityId,
                    startTime: {
                        gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000) // Show last 24h too
                    }
                },
                orderBy: { startTime: 'asc' },
                include: { createdBy: { select: { name: true, image: true, id: true } } }
            });
        }),

    start: protectedProcedure
        .input(z.object({ meetingId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const meeting = await prisma.meeting.findUnique({
                where: { id: input.meetingId }
            });

            if (!meeting) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
            }

            if (meeting.createdById !== ctx.session.user.id) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Only the host can start the meeting" });
            }

            // Update status
            await prisma.meeting.update({
                where: { id: input.meetingId },
                data: { status: "ACTIVE" }
            });

            // Generate token for host
            const token = generateUserToken(ctx.session.user.id);
            return { token, apiKey: process.env.STREAM_PUBLIC_KEY };
        }),

    join: protectedProcedure
        .input(z.object({ meetingId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const meeting = await prisma.meeting.findUnique({
                where: { id: input.meetingId },
                include: { community: { include: { members: true } } }
            });

            if (!meeting) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
            }

            // Check if meeting started (optional, based on req: "after creator started")
            if (meeting.status !== "ACTIVE") {
                throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Meeting has not started yet" });
            }

            // Check membership
            const isMember = meeting.community.members.some(m => m.userId === ctx.session.user.id);
            if (!isMember) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Must be a community member to join" });
            }

            // Generate token
            const token = generateUserToken(ctx.session.user.id);
            return { token, apiKey: process.env.STREAM_PUBLIC_KEY };
        }),
});
