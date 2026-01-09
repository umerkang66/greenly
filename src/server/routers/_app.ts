import { z } from "zod";
import { publicProcedure, router } from "../trpc";

import { carbonRouter } from "./carbon";
import { communityRouter } from "./community";
import { challengeRouter } from "./challenge";
import { gamificationRouter } from "./gamification";
import { leaderboardRouter } from "./leaderboard";
import { notificationRouter } from "./notification";
import { postRouter } from "./post";
import { commentRouter } from "./comment";
import { ecoCoachRouter } from "./ecoCoach";
import { scannerRouter } from "./scanner";
import { chatRouter } from "./chat";

export const appRouter = router({
    carbon: carbonRouter,
    community: communityRouter,
    challenge: challengeRouter,
    gamification: gamificationRouter,
    leaderboard: leaderboardRouter,
    notification: notificationRouter,
    post: postRouter,
    comment: commentRouter,
    ecoCoach: ecoCoachRouter,
    scanner: scannerRouter,
    chat: chatRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

