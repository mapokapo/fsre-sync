import type { ColumnType } from "kysely";

export interface Database {
  messaging_subscriptions: MessagingSubscriptionsTable;
}

export interface MessagingSubscriptionsTable {
  created_at: ColumnType<Date, string, string>;
  device_info: string;
  email: null | string;
  fcm_token: null | string;
  id: string;
  last_notified_at: ColumnType<Date | null, null | string, null | string>;
  study_program_id: number;
}
