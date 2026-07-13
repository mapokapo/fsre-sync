import { createApp } from "@/app.ts";
import { config } from "@/config.ts";
import { scheduleTimetableRefresh } from "@/lib/cron.ts";
import { logger } from "@/lib/logger.ts";
import { runStartup } from "@/lib/startup.ts";

await runStartup();

const app = createApp();
app.listen({
  hostname: "0.0.0.0",
  port: config.port,
});

logger.info(
  `FSRE Timetable Notify listening on http://0.0.0.0:${config.port.toString()}/api`
);

scheduleTimetableRefresh();

export type App = typeof app;
