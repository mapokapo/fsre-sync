export class EdupageFetchError extends Error {
  constructor(message = "Failed to fetch from Edupage", cause?: unknown) {
    super(message, { cause });
    this.name = "EdupageFetchError";
  }
}

export class EdupageParseError extends Error {
  constructor(message = "Failed to parse Edupage response", cause?: unknown) {
    super(message, { cause });
    this.name = "EdupageParseError";
  }
}
