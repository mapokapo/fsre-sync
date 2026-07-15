import { logger } from "@/lib/logger.ts";
import { refreshTimetables } from "@/orchestration/refresh-timetables.ts";

export function scheduleTimetableRefresh(): void {
  Bun.cron("*/15 * * * *", () => {
    refreshTimetables().catch((error: unknown) => {
      logger.error("Cron refresh failed", error);
    });
  });
}
