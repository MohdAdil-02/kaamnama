import * as Sentry from "@sentry/node";
import env from "./environment.js";

export const sentryEnabled = Boolean(env.SENTRY_DSN) && env.NODE_ENV !== "test";

if (sentryEnabled) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    sendDefaultPii: false,
    tracesSampleRate: 0, // errors only; no performance tracing
    // Defence in depth: strip anything personal before it leaves the server
    beforeSend(event) {
      if (event.request) {
        delete event.request.cookies;
        delete event.request.data;
        delete event.request.query_string;
        if (event.request.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
        }
      }
      return event;
    },
  });
}

export default Sentry;