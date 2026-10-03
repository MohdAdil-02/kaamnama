import env from "./environment.js";

export const otpConfig = {
  length: env.OTP_LENGTH,
  ttlMinutes: env.OTP_TTL_MINUTES,
  maxAttempts: env.OTP_MAX_ATTEMPTS,
  resendCooldownSeconds: env.OTP_RESEND_COOLDOWN_SECONDS,
};

/**
 * SMS providers. Each takes (phone in E.164, message text).
 * Add another provider here without touching any service.
 */
const providers = {
  // Dev only: prints the message in the terminal
  console: async (phone, message) => {
    console.log(`\n📱 [OTP - console provider] To: ${phone}\n   ${message}\n`);
    return { success: true };
  },

  // MSG91 Flow API. Requires DLT registration and approved templates in India.
  msg91: async (phone, message) => {
    const res = await fetch("https://control.msg91.com/api/v5/flow/", {
      method: "POST",
      headers: {
        authkey: env.MSG91_AUTH_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        template_id: env.MSG91_TEMPLATE_ID,
        short_url: "0",
        recipients: [
          {
            mobiles: phone.replace(/^\+/, ""), // MSG91 wants 919876543210, no "+"
            message,
          },
        ],
      }),
      signal: AbortSignal.timeout(10000),
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok || body.type === "error") {
      console.error("MSG91 error:", res.status, body); // server-side only
      throw new Error("SMS provider failed");
    }
    return { success: true };
  },
};

export const sendSms = async (phone, message) => {
  const provider = providers[env.OTP_PROVIDER];
  if (!provider) throw new Error(`Unknown OTP provider: ${env.OTP_PROVIDER}`);
  return provider(phone, message);
};