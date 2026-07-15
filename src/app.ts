import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { z } from "zod";

import { healthFeature } from "@/features/health";
import { messagingFeature } from "@/features/messaging";
import { timetableFeature } from "@/features/timetable";
import { createFsreError } from "@/lib/errors.ts";
import { logger } from "@/lib/logger.ts";
import {
  handleParseError,
  handleServiceError,
  handleValidationError,
} from "@/plugins/fsre-error-handler.ts";

export function createApp() {
  const api = new Elysia({ precompile: true, prefix: "/api" })
    .use(cors({ origin: true }))
    .onError(({ error, set }) => {
      const handled =
        handleServiceError(error, set) ??
        handleValidationError(error, set) ??
        handleParseError(error, set);
      if (handled) return handled;

      logger.error("Unhandled error", error);

      let errorMessage: string;
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else {
        try {
          errorMessage = JSON.stringify(error);
        } catch {
          errorMessage = "Unknown error";
        }
      }

      set.status = 500;
      return createFsreError(
        500,
        "Internal Server Error",
        "An unexpected error occurred while processing the request",
        errorMessage
      );
    })
    .use(timetableFeature)
    .use(messagingFeature);

  return new Elysia()
    .onError(({ code, set }) => {
      if (code !== "NOT_FOUND") return;
      set.status = 404;
      return createFsreError(404, "Not Found", "Route not found");
    })
    .use(
      openapi({
        documentation: {
          info: {
            description: "FSRE Timetable Notify API",
            title: "FSRE Timetable Notify",
            version: "1.0.0",
          },
        },
        mapJsonSchema: {
          zod: z.toJSONSchema,
        },
        path: "/docs",
      })
    )
    .use(healthFeature)
    .use(api);
}
