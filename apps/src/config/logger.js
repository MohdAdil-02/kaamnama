import pino from "pino";
import env from "./environment.js";

// Verify links contain a secret token, so never write it to logs
export const redactUrl = (url = "") =>
  String(url)
    .split("?")[0] // query strings can carry phone numbers or search terms
    .replace(/\/verify\/[a-f0-9]{16,}/gi, "/verify/[redacted]");

const logger = pino({
  level: env.NODE_ENV === "test" ? "silent" : env.LOG_LEVEL,
  base: { service: "kaamnama-api", env: env.NODE_ENV },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      'res.headers["set-cookie"]',
      "*.otp",
      "*.refreshToken",
      "*.accessToken",
      "*.token",
      "*.password",
    ],
    censor: "[redacted]",
  },
  ...(env.isDev && {
    transport: {
      target: "pino-pretty",
      options: { colorize: true, translateTime: "SYS:HH:MM:ss", ignore: "pid,hostname,service,env" },
    },
  }),
});

export default logger;