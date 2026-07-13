import { z } from "zod";

const configSchema = z.object({
  database: z.object({
    path: z.string().min(1).default("./data/fsre-sync.db"),
  }),
  edupage: z.object({
    timetableDbUri: z
      .url()
      .default(
        "https://fsre.edupage.org/rpr/server/maindbi.js?__func=mainDBIAccessor",
      ),
    timetableUri: z
      .url()
      .default(
        "https://fsre.edupage.org/timetable/server/currenttt.js?__func=curentttGetData",
      ),
  }),
  firebase: z.object({
    credentialsPath: z.string().optional(),
  }),
  mail: z.object({
    from: z.email().default("fsrenotifier@gmail.com"),
    fromName: z.string().default("FSRE Notifier"),
    host: z.string().default("smtp.gmail.com"),
    password: z.string().optional(),
    port: z.coerce.number().int().positive().default(587),
    username: z.string().optional(),
  }),
  port: z.coerce.number().int().positive().default(5000),
});

export const config = configSchema.parse({
  database: {
    path: process.env["SQLITE_PATH"],
  },
  edupage: {
    timetableDbUri: process.env["EDUPAGE_TIMETABLE_DB_URI"],
    timetableUri: process.env["EDUPAGE_TIMETABLE_URI"],
  },
  firebase: {
    credentialsPath: process.env["GOOGLE_APPLICATION_CREDENTIALS"],
  },
  mail: {
    password: process.env["MAIL_PASSWORD"],
    username: process.env["MAIL_USERNAME"],
  },
  port: process.env["PORT"],
});

export type AppConfig = z.infer<typeof configSchema>;
