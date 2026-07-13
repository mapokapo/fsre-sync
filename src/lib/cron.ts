import { refreshTimetables } from "@/features/timing/services/refresh-timetables.service.ts";
import { logger } from "@/lib/logger.ts";

export function scheduleTimetableRefresh(): void {
  Bun.cron("*/15 * * * *", () => {
    refreshTimetables().catch((error: unknown) => {
      logger.error("Cron refresh failed", error);
    });
  });
}
