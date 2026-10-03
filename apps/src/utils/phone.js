import { parsePhoneNumberFromString } from "libphonenumber-js";
import AppError from "./AppError.js";

/**
 * Normalizes any input to E.164 (e.g. +919876543210).
 * Defaults to India if no country code is given.
 */
export const normalizePhone = (input, defaultCountry = "IN") => {
  const parsed = parsePhoneNumberFromString(String(input || "").trim(), defaultCountry);
  if (!parsed || !parsed.isValid()) {
    throw AppError.badRequest("Invalid phone number");
  }
  return parsed.number; // E.164
};

export const isValidPhone = (input, defaultCountry = "IN") => {
  const parsed = parsePhoneNumberFromString(String(input || "").trim(), defaultCountry);
  return Boolean(parsed && parsed.isValid());
};

// +919876543210 -> +91******3210 (for safe display)
export const maskPhone = (phone) =>
  phone ? phone.slice(0, 3) + "*".repeat(Math.max(phone.length - 7, 0)) + phone.slice(-4) : "";