import { Elysia } from "elysia";

import { healthRoutes } from "@/features/health/routes/health.routes.ts";

export const healthFeature = new Elysia({ name: "health" }).use(healthRoutes);
