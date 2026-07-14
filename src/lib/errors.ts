// TODO: RFC 9457 JSON Problem Details: defer until Elysia 2.0 ships built-in support.

export interface FsreError {
  details?: unknown;
  error: string;
  message: string;
  status: number;
}

export function createFsreError(
  status: number,
  error: string,
  message: string,
  details?: unknown
): FsreError {
  return details
    ? { details, error, message, status }
    : { error, message, status };
}
