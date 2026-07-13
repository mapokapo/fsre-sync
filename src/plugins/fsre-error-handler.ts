import {
  ServiceErrorCode,
  type ServiceErrorCode as ServiceErrorCodeType,
} from "@/features/common/errors/service-error.codes.ts";
import { ServiceError } from "@/features/common/errors/service.error.ts";
import { createFsreError, type FsreError } from "@/lib/errors.ts";

interface HttpMapping {
  details?: (error: ServiceError) => string | undefined;
  message: ((error: ServiceError) => string) | string;
  status: number;
  title: string;
}

const SERVICE_ERROR_HTTP_MAP: Partial<
  Record<ServiceErrorCodeType, HttpMapping>
> = {
  [ServiceErrorCode.INVALID_ISO_WEEK]: {
    details: error => error.message,
    message: "Failed to parse ISO week",
    status: 400,
    title: "Bad Request",
  },
  [ServiceErrorCode.MESSAGING_SUBSCRIPTION_ALREADY_REGISTERED]: {
    message: error => error.message,
    status: 409,
    title: "Messaging Subscription Already Registered",
  },
  [ServiceErrorCode.TIMETABLE_DATABASE_NOT_LOADED]: {
    message: error => error.message,
    status: 500,
    title: "Internal Server Error",
  },
  [ServiceErrorCode.TIMETABLE_FETCH_FAILED]: {
    details: error => error.message,
    message: "Failed to make request to upstream server",
    status: 502,
    title: "Bad Gateway",
  },
  [ServiceErrorCode.TIMETABLE_PARSE_FAILED]: {
    details: error => error.message,
    message: "Failed to make request to upstream server",
    status: 502,
    title: "Bad Gateway",
  },
};

export function handleServiceError(
  error: unknown,
  set: { status?: number | string },
): FsreError | undefined {
  if (!(error instanceof ServiceError)) return undefined;

  const mapping = SERVICE_ERROR_HTTP_MAP[error.code];
  if (!mapping) return undefined;

  set.status = mapping.status;
  return createFsreError(
    mapping.status,
    mapping.title,
    typeof mapping.message === "function"
      ? mapping.message(error)
      : mapping.message,
    mapping.details?.(error),
  );
}
