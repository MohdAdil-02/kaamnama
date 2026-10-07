import { sendSms } from "./config/sms.js";
import { normalizePhone } from "./utils/phone.js";

const [, , rawPhone, key = "login_otp"] = process.argv;
if (!rawPhone) {
  console.error("Usage: npm run sms:test -- 9876543210 login_otp");
  process.exit(1);
}

const samples = {
  login_otp: { code: "123456", minutes: 5 },
  delete_otp: { code: "123456", minutes: 5 },
  receipt_otp: { code: "123456", minutes: 5, job: "Test job", worker: "Test Worker" },
  receipt_link: { worker: "Test Worker", job: "Test job", link: "https://example.com/verify/test" },
};

await sendSms(normalizePhone(rawPhone), key, samples[key]);
console.log(`✅ Request for "${key}" accepted by the provider. Check your phone.`);
process.exit(0);