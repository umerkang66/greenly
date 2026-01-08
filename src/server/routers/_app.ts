import { z } from "zod";
import { publicProcedure, router } from "../trpc";

import { testRouter } from "./testing";
import { carbonRouter } from "./carbon";
import { communityRouter } from "./community";

export const appRouter = router({
    carbon: carbonRouter,
    test: testRouter,
    community: communityRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
