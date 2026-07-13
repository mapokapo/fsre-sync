import { Elysia } from "elysia";

import { healthResponseSchema } from "@/features/health/responses/health.response.ts";

export const healthRoutes = new Elysia().get(
  "/health",
  () => ({ status: "ok" as const }),
  {
    detail: {
      description:
        "Returns 200 when the HTTP server is running. Does not check upstream Edupage or notification providers.",
      summary: "Liveness check",
      tags: ["health"],
    },
    response: { 200: healthResponseSchema },
  }
);
