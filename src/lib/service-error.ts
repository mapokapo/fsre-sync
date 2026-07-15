import type { ServiceErrorCode } from "@/lib/service-error.codes.ts";

export class ServiceError extends Error {
  constructor(
    readonly code: ServiceErrorCode,
    detail: string,
    cause?: unknown
  ) {
    super(detail, { cause });
    this.name = new.target.name;
  }
}
