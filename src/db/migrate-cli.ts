import { closeDatabase } from "@/db/client.ts";
import { migrateToLatest } from "@/db/migrate.ts";

await migrateToLatest();
await closeDatabase();
