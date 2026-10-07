import { describe, it, expect } from "vitest";
import { TEMPLATES, prepareVars, renderText, buildMsg91Request } from "../../src/config/sms.js";

const ids = {
  MSG91_TEMPLATE_LOGIN_OTP: "tpl_login",
  MSG91_TEMPLATE_RECEIPT_OTP: "tpl_receipt_otp",
  MSG91_TEMPLATE_DELETE_OTP: "tpl_delete",
  MSG91_TEMPLATE_RECEIPT_LINK: "tpl_link",
};

describe("sms templates", () => {
  it("renders every variable into the console text", () => {
    const sample = { code: "123456", minutes: 5, job: "Wiring", worker: "Ramesh", link: "https://k.in/v/abc" };
    for (const [key, tpl] of Object.entries(TEMPLATES)) {
      const text = renderText(key, sample);
      for (const name of tpl.vars) expect(text).toContain(String(sample[name]));
    }
  });

  it("puts the code first so it is easy to find", () => {
    expect(renderText("receipt_otp", { code: "654321", minutes: 5, job: "Job 111111", worker: "A" })).toMatch(
      /654321/
    );
  });

  it("throws when a variable is missing", () => {
    expect(() => prepareVars("receipt_otp", { code: "123456", minutes: 5 })).toThrow(/missing variable/);
  });

  it("throws for an unknown template", () => {
    expect(() => prepareVars("nope", {})).toThrow(/Unknown SMS template/);
  });

  it("cleans whitespace and cuts long values to 30 chars", () => {
    const v = prepareVars("receipt_otp", {
      code: "123456",
      minutes: 5,
      job: "Kitchen\nwiring   repair for the whole entire house and garage",
      worker: "Ramesh",
    });
    expect(v.job).not.toContain("\n");
    expect(v.job.length).toBeLessThanOrEqual(30);
  });
});

describe("buildMsg91Request", () => {
  it("maps variables to var1..varN in template order, without the + prefix", () => {
    const body = buildMsg91Request(
      "+919876543210",
      "receipt_otp",
      { code: "123456", minutes: 5, job: "Wiring", worker: "Ramesh" },
      ids
    );
    expect(body.template_id).toBe("tpl_receipt_otp");
    expect(body.recipients[0]).toEqual({
      mobiles: "919876543210",
      var1: "123456",
      var2: "Wiring",
      var3: "Ramesh",
      var4: "5",
    });
    expect(body.short_url).toBe("0");
  });

  it("turns on URL shortening and never truncates the link", () => {
    const link = "https://app.kaamnama.in/verify/" + "a".repeat(48);
    const body = buildMsg91Request("+919876543210", "receipt_link", { worker: "Ramesh", job: "Wiring", link }, ids);
    expect(body.short_url).toBe("1");
    expect(body.recipients[0].var3).toBe(link);
  });

  it("uses the login template for login codes", () => {
    const body = buildMsg91Request("+919876543210", "login_otp", { code: "111111", minutes: 5 }, ids);
    expect(body.template_id).toBe("tpl_login");
  });
});