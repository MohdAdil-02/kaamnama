import env from "./environment.js";

export const otpConfig = {
  length: env.OTP_LENGTH,
  ttlMinutes: env.OTP_TTL_MINUTES,
  maxAttempts: env.OTP_MAX_ATTEMPTS,
  resendCooldownSeconds: env.OTP_RESEND_COOLDOWN_SECONDS,
};

// SMS sending now lives in ./sms.js (template based)
export { sendSms } from "./sms.js";