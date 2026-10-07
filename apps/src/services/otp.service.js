import OTP from "../models/OTP.js";
import AppError from "../utils/AppError.js";
import { otpConfig } from "../config/otp.js";
import { sendSms } from "../config/sms.js";
import { generateNumericOtp, hashValue, compareHash } from "../utils/hash.js";

/**
 * `template` is a key from config/sms.js. `vars` are its extra variables;
 * `code` and `minutes` are added here.
 */
export const sendOtp = async ({ phone, purpose, reference = null, template = "login_otp", vars = {} }) => {
  // Cooldown: block rapid re-sends
  const last = await OTP.findOne({ phone, purpose }).sort({ createdAt: -1 });
  if (last) {
    const elapsed = (Date.now() - last.createdAt.getTime()) / 1000;
    if (elapsed < otpConfig.resendCooldownSeconds) {
      const wait = Math.ceil(otpConfig.resendCooldownSeconds - elapsed);
      throw AppError.tooMany(`Please wait ${wait}s before requesting another OTP`);
    }
  }

  // Invalidate any previous unused OTPs for this phone + purpose
  await OTP.updateMany({ phone, purpose, consumed: false }, { consumed: true });

  const code = generateNumericOtp(otpConfig.length);
  const record = await OTP.create({
    phone,
    purpose,
    reference,
    otpHash: await hashValue(code),
    expiresAt: new Date(Date.now() + otpConfig.ttlMinutes * 60 * 1000),
  });

  try {
    await sendSms(phone, template, { ...vars, code, minutes: otpConfig.ttlMinutes });
  } catch (err) {
    // Nothing was delivered, so don't leave a record that triggers the resend cooldown
    await OTP.deleteOne({ _id: record._id });
    throw err;
  }

  return { expiresInSeconds: otpConfig.ttlMinutes * 60 };
};

/**
 * Verifies and consumes an OTP. Throws on any failure.
 * `purposes` can be an array, since login and register share the same flow.
 * `reference` (optional) binds the OTP to a specific document, e.g. a receipt.
 */
export const verifyOtp = async ({ phone, code, purposes, reference = null }) => {
  const list = Array.isArray(purposes) ? purposes : [purposes];

  const query = {
    phone,
    purpose: { $in: list },
    consumed: false,
    expiresAt: { $gt: new Date() },
  };
  if (reference) query.reference = reference;

  const record = await OTP.findOne(query).sort({ createdAt: -1 });

  if (!record) throw AppError.badRequest("OTP expired or not requested. Please request a new one");

  if (record.attempts >= otpConfig.maxAttempts) {
    record.consumed = true;
    await record.save();
    throw AppError.tooMany("Too many wrong attempts. Please request a new OTP");
  }

  const ok = await compareHash(code, record.otpHash);
  if (!ok) {
    record.attempts += 1;
    await record.save();
    const left = otpConfig.maxAttempts - record.attempts;
    throw AppError.badRequest(`Incorrect OTP. ${left} attempt(s) left`);
  }

  record.consumed = true;
  await record.save();
  return record;
};