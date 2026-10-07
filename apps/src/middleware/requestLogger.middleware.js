import pinoHttp from "pino-http";
import { randomUUID } from "crypto";
import logger, { redactUrl } from "../config/logger.js";

const SAFE_ID = /^[\w-]{8,64}$/;

const requestLogger = pinoHttp({
  logger,

  // Accept a caller's ID if it looks sane (so a frontend can correlate), else make one
  genReqId: (req, res) => {
    const incoming = req.headers["x-request-id"];
    const id = typeof incoming === "string" && SAFE_ID.test(incoming) ? incoming : randomUUID();
    res.setHeader("X-Request-Id", id);
    return id;
  },

  customLogLevel: (req, res, err) => {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },

  // Health checks run every few seconds; don't flood the logs
  autoLogging: { ignore: (req) => req.url.startsWith("/health") },

  serializers: {
    req: (req) => ({ id: req.id, method: req.method, url: redactUrl(req.url) }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
});

export default requestLogger;