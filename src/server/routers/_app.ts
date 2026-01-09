import { z } from "zod";
import { publicProcedure, router } from "../trpc";

import { testRouter } from "./testing";
import { carbonRouter } from "./carbon";
import { communityRouter } from "./community";
import { challengeRouter } from "./challenge";
import { gamificationRouter } from "./gamification";
import { leaderboardRouter } from "./leaderboard";
import { notificationRouter } from "./notification";
import { postRouter } from "./post";
import { commentRouter } from "./comment";

export const appRouter = router({
    carbon: carbonRouter,
    test: testRouter,
    community: communityRouter,
    challenge: challengeRouter,
    gamification: gamificationRouter,
    leaderboard: leaderboardRouter,
    notification: notificationRouter,
    post: postRouter,
    comment: commentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

