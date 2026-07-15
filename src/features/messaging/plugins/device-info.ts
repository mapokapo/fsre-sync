import { Elysia } from "elysia";

export const deviceInfoPlugin = new Elysia({ name: "device-info" }).derive(
  { as: "scoped" },
  ({ request }) => {
    const userAgent = request.headers.get("user-agent") ?? "unknown";
    const remoteAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    return { deviceInfo: `${userAgent} | IP: ${remoteAddress}` };
  }
);
