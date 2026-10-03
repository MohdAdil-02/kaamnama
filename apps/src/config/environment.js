import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

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

  MSG91_AUTH_KEY: z.string().optional().default(""),
  MSG91_TEMPLATE_ID: z.string().optional().default(""),

  ENABLE_JOBS: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),

  CLOUDINARY_CLOUD_NAME: z.string().optional().default(""),
  CLOUDINARY_API_KEY: z.string().optional().default(""),
  CLOUDINARY_API_SECRET: z.string().optional().default(""),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

// ---------- Production safety checks ----------
if (env.NODE_ENV === "production") {
  const problems = [];

  if (env.OTP_PROVIDER === "console") {
    problems.push("OTP_PROVIDER=console is not allowed in production (OTPs would be printed in logs)");
  }
  if (env.OTP_PROVIDER === "msg91" && (!env.MSG91_AUTH_KEY || !env.MSG91_TEMPLATE_ID)) {
    problems.push("MSG91_AUTH_KEY and MSG91_TEMPLATE_ID are required when OTP_PROVIDER=msg91");
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

  if (problems.length) {
    console.error("❌ Unsafe production configuration:");
    problems.forEach((p) => console.error(`   - ${p}`));
    process.exit(1);
  }
}

export default {
  ...env,
  isProd: env.NODE_ENV === "production",
  isDev: env.NODE_ENV === "development",
};