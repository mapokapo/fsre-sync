import { z } from "zod";

export const healthResponseSchema = z
  .object({
    status: z.literal("ok").meta({
      description: "Fixed value indicating the process is running",
      examples: ["ok"],
    }),
  })
  .meta({ description: "Liveness probe response" });

export type HealthResponse = z.infer<typeof healthResponseSchema>;
