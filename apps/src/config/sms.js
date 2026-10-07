import env from "./environment.js";
import logger from "./logger.js";
import AppError from "../utils/AppError.js";

const MAX_VAR_LENGTH = 30; // common DLT limit per variable

/**
 * One entry per DLT-approved template.
 * `vars` is the ORDER of the {#var#} slots in the approved text.
 * `text` is used only by the console provider (MSG91 uses the approved text itself).
 */
export const TEMPLATES = {
  login_otp: {
    envKey: "MSG91_TEMPLATE_LOGIN_OTP",
    vars: ["code", "minutes"],
    text: (v) => `Kaamnama: Your verification code is ${v.code}. Valid for ${v.minutes} minutes. Do not share it.`,
  },
  receipt_otp: {
    envKey: "MSG91_TEMPLATE_RECEIPT_OTP",
    vars: ["code", "job", "worker", "minutes"],
    text: (v) =>
      `Kaamnama: ${v.code} is your code to confirm the job ${v.job} by ${v.worker}. Valid ${v.minutes} min. Share it only if this work was done for you.`,
  },
  delete_otp: {
    envKey: "MSG91_TEMPLATE_DELETE_OTP",
    vars: ["code", "minutes"],
    text: (v) =>
      `Kaamnama: ${v.code} is your code to DELETE your account. Valid ${v.minutes} min. If you did not ask for this, do not share it.`,
  },
  receipt_link: {
    envKey: "MSG91_TEMPLATE_RECEIPT_LINK",
    vars: ["worker", "job", "link"],
    text: (v) => `Kaamnama: ${v.worker} has asked you to confirm a job ${v.job}. Open ${v.link}`,
  },
};

const clean = (value) =>
  String(value).replace(/\s+/g, " ").trim().slice(0, MAX_VAR_LENGTH);

// Validates, cleans and orders variables. The link is never cut (MSG91 shortens it).
export const prepareVars = (key, vars = {}) => {
  const tpl = TEMPLATES[key];
  if (!tpl) throw new Error(`Unknown SMS template: ${key}`);

  const out = {};
  for (const name of tpl.vars) {
    if (vars[name] === undefined || vars[name] === null) {
      throw new Error(`SMS template "${key}" is missing variable "${name}"`);
    }
    out[name] = name === "link" ? String(vars[name]) : clean(vars[name]);
  }
  return out;
};

export const renderText = (key, vars) => TEMPLATES[key].text(prepareVars(key, vars));

// Pure: builds the MSG91 Flow API request body
export const buildMsg91Request = (phone, key, vars, ids = env) => {
  const tpl = TEMPLATES[key];
  const prepared = prepareVars(key, vars);

  const recipient = { mobiles: phone.replace(/^\+/, "") }; // 919876543210, no "+"
  tpl.vars.forEach((name, i) => {
    recipient[`var${i + 1}`] = prepared[name]; // MSG91 variable names
  });

  return {
    template_id: ids[tpl.envKey],
    short_url: tpl.vars.includes("link") ? "1" : "0",
    recipients: [recipient],
  };
};

const providers = {
  // Dev only: prints readable text. Tests read OTPs from this output.
  console: async (phone, key, vars) => {
    console.log(`\n📱 [OTP - console provider] To: ${phone}\n   ${renderText(key, vars)}\n`);
  },

  msg91: async (phone, key, vars) => {
    const res = await fetch("https://control.msg91.com/api/v5/flow/", {
      method: "POST",
      headers: {
        authkey: env.MSG91_AUTH_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(buildMsg91Request(phone, key, vars)),
      signal: AbortSignal.timeout(10000),
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok || body.type === "error") {
      const err = new Error("SMS provider rejected the request");
      err.details = { status: res.status, body };
      throw err;
    }
  },
};

export const sendSms = async (phone, key, vars) => {
  prepareVars(key, vars); // programmer errors fail loudly, not as a "502"
  try {
    await providers[env.OTP_PROVIDER](phone, key, vars);
  } catch (err) {
    logger.error({ err, template: key, details: err.details }, "sms send failed");
    throw new AppError("Could not send SMS. Please try again", 502);
  }
};