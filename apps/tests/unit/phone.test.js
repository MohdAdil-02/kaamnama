import { describe, it, expect } from "vitest";
import { normalizePhone, isValidPhone, maskPhone } from "../../src/utils/phone.js";

describe("phone utils", () => {
  it("normalizes Indian numbers to E.164", () => {
    expect(normalizePhone("9876543210")).toBe("+919876543210");
    expect(normalizePhone("+91 98765 43210")).toBe("+919876543210");
  });

  it("rejects invalid numbers", () => {
    expect(isValidPhone("12345")).toBe(false);
    expect(() => normalizePhone("abc")).toThrow();
  });

  it("masks the middle of a number", () => {
    expect(maskPhone("+919876543210")).toBe("+91******3210");
  });
});