import { ServiceErrorCode } from "@/features/common/errors/service-error.codes.ts";
import { ServiceError } from "@/features/common/errors/service.error.ts";

export class InvalidIsoWeekError extends ServiceError {
  constructor(isoWeek: string) {
    super(ServiceErrorCode.INVALID_ISO_WEEK, `Invalid ISO week: ${isoWeek}`);
  }
}

export class TimetableFetchFailed extends ServiceError {
  constructor(cause?: unknown) {
    super(
      ServiceErrorCode.TIMETABLE_FETCH_FAILED,
      cause instanceof Error ? cause.message : "Failed to fetch timetable",
      cause,
    );
  }
}

export class TimetableParseFailed extends ServiceError {
  constructor(cause?: unknown) {
    super(
      ServiceErrorCode.TIMETABLE_PARSE_FAILED,
      cause instanceof Error ? cause.message : "Failed to parse timetable",
      cause,
    );
  }
}
