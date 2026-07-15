import { ServiceErrorCode } from "@/lib/service-error.codes.ts";
import { ServiceError } from "@/lib/service-error.ts";

export class TimetableDatabaseFetchFailed extends ServiceError {
  constructor(cause?: unknown) {
    super(
      ServiceErrorCode.TIMETABLE_DATABASE_FETCH_FAILED,
      cause instanceof Error
        ? cause.message
        : "Failed to fetch timetable database",
      cause
    );
  }
}

export class TimetableDatabaseNotLoaded extends ServiceError {
  constructor() {
    super(
      ServiceErrorCode.TIMETABLE_DATABASE_NOT_LOADED,
      "Timetable database has not been fetched yet"
    );
  }
}

export class TimetableDatabaseParseFailed extends ServiceError {
  constructor(cause?: unknown) {
    super(
      ServiceErrorCode.TIMETABLE_DATABASE_PARSE_FAILED,
      cause instanceof Error
        ? cause.message
        : "Failed to parse timetable database",
      cause
    );
  }
}
