export const ServiceErrorCode = {
  EMAIL_SEND_MESSAGE_FAILED: "email_send_message_failed",
  FCM_SEND_MESSAGE_FAILED: "fcm_send_message_failed",
  INVALID_ISO_WEEK: "invalid_iso_week",
  MESSAGING_SUBSCRIPTION_ALREADY_REGISTERED:
    "messaging_subscription_already_registered",
  TIMETABLE_DATABASE_FETCH_FAILED: "timetable_database_fetch_failed",
  TIMETABLE_DATABASE_NOT_LOADED: "timetable_database_not_loaded",
  TIMETABLE_DATABASE_PARSE_FAILED: "timetable_database_parse_failed",
  TIMETABLE_FETCH_FAILED: "timetable_fetch_failed",
  TIMETABLE_PARSE_FAILED: "timetable_parse_failed",
} as const;

export type ServiceErrorCode =
  (typeof ServiceErrorCode)[keyof typeof ServiceErrorCode];
