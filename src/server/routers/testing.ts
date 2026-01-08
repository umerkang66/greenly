import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const testRouter = router({
    getTestMessage: publicProcedure
        .query(() => {
            return {
                message: "This is a message from the test router!",
                timestamp: new Date().toISOString(),
            };
        }),
});
