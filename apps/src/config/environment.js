import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const optional = z.string().optional().default("");

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().default("http://localhost:5173"),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be 32+ chars"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be 32+ chars"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),

  OTP_LENGTH: z.coerce.number().default(6),
  OTP_TTL_MINUTES: z.coerce.number().default(5),
  OTP_MAX_ATTEMPTS: z.coerce.number().default(5),
  OTP_RESEND_COOLDOWN_SECONDS: z.coerce.number().default(30),
  OTP_PROVIDER: z.enum(["console", "msg91"]).default("console"),

  MSG91_AUTH_KEY: optional,
  MSG91_TEMPLATE_LOGIN_OTP: optional,
  MSG91_TEMPLATE_RECEIPT_OTP: optional,
  MSG91_TEMPLATE_DELETE_OTP: optional,
  MSG91_TEMPLATE_RECEIPT_LINK: optional,

  ENABLE_JOBS: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),

  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  SENTRY_DSN: optional,

  CLOUDINARY_CLOUD_NAME: optional,
  CLOUDINARY_API_KEY: optional,
  CLOUDINARY_API_SECRET: optional,
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

const MSG91_REQUIRED = [
  "MSG91_AUTH_KEY",
  "MSG91_TEMPLATE_LOGIN_OTP",
  "MSG91_TEMPLATE_RECEIPT_OTP",
  "MSG91_TEMPLATE_DELETE_OTP",
  "MSG91_TEMPLATE_RECEIPT_LINK",
];

// ---------- Safety checks ----------
const problems = [];

// Wrong in any environment: msg91 selected but not configured
if (env.OTP_PROVIDER === "msg91") {
  const missing = MSG91_REQUIRED.filter((k) => !env[k]);
  if (missing.length) problems.push(`OTP_PROVIDER=msg91 but missing: ${missing.join(", ")}`);
}

if (env.NODE_ENV === "production") {
  if (env.OTP_PROVIDER === "console") {
    problems.push("OTP_PROVIDER=console is not allowed in production (OTPs would be printed in logs)");
  }
  if (/localhost|127\.0\.0\.1/.test(env.CLIENT_URL)) {
    problems.push("CLIENT_URL must be your real frontend URL in production");
  }
  if (/change_me|change_this|dev_/i.test(env.JWT_ACCESS_SECRET + env.JWT_REFRESH_SECRET)) {
    problems.push("JWT secrets look like development placeholders; generate real ones");
  }
  if (env.JWT_ACCESS_SECRET === env.JWT_REFRESH_SECRET) {
    problems.push("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different");
  }
}

if (problems.length) {
  console.error("❌ Unsafe configuration:");
  problems.forEach((p) => console.error(`   - ${p}`));
  process.exit(1);
}

export default {
  ...env,
  isProd: env.NODE_ENV === "production",
  isDev: env.NODE_ENV === "development",
};