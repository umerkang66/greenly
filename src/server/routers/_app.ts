import { z } from "zod";
import { publicProcedure, router } from "../trpc";

import { testRouter } from "./testing";
import { carbonRouter } from "./carbon";

export const appRouter = router({
    test: testRouter,
    carbon: carbonRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
