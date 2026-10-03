import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { vi } from "vitest";

let mongod;
const sms = []; // every SMS the app "sent"

export const startDb = async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri("kaamnama_test"));

  // Capture SMS text instead of printing it
  vi.spyOn(console, "log").mockImplementation((...args) => {
    const text = args.join(" ");
    if (text.includes("[OTP - console provider]")) sms.push(text);
  });
};

export const stopDb = async () => {
  vi.restoreAllMocks();
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
};

export const clearDb = async () => {
  sms.length = 0;
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
};

export const getApp = async () => (await import("../src/app.js")).default;

// Returns the newest 6-digit code sent to this E.164 phone number
export const lastOtpFor = (phone) => {
  for (let i = sms.length - 1; i >= 0; i--) {
    if (sms[i].includes(`To: ${phone}`)) {
      const m = sms[i].match(/\b(\d{6})\b/);
      if (m) return m[1];
    }
  }
  throw new Error(`No OTP found for ${phone}`);
};

export const seedCategory = async () => {
  const Category = (await import("../src/models/Category.js")).default;
  return Category.create({ name: "Electrician", slug: "electrician" });
};

// Logs in (or registers) through the real OTP flow. `phone` is plain 10 digits.
export const login = async (app, phone, extra = {}) => {
  await request(app).post("/api/v1/auth/otp/send").send({ phone });
  const otp = lastOtpFor(`+91${phone}`);
  const res = await request(app).post("/api/v1/auth/otp/verify").send({ phone, otp, ...extra });
  if (![200, 201].includes(res.status)) {
    throw new Error(`Login failed for ${phone}: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return {
    token: res.body.data.accessToken,
    user: res.body.data.user,
    auth: { Authorization: `Bearer ${res.body.data.accessToken}` },
  };
};

export const loginWorker = (app, phone = "9876543210") =>
  login(app, phone, { name: "Ramesh Kumar", role: "worker", city: "Delhi" });

export const loginCustomer = (app, phone = "8123456789") =>
  login(app, phone, { name: "Anil Sharma", role: "customer", city: "Delhi" });

// Worker creates a receipt for `customerPhone`; returns the response data
export const createReceipt = async (app, worker, categoryId, overrides = {}) => {
  const res = await request(app)
    .post("/api/v1/receipts")
    .set(worker.auth)
    .send({
      customerPhone: "8123456789",
      category: String(categoryId),
      title: "Kitchen wiring repair",
      amount: 1500,
      workDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
      ...overrides,
    });
  if (res.status !== 201) throw new Error(`createReceipt failed: ${res.status} ${JSON.stringify(res.body)}`);
  return res.body.data;
};

// Customer completes the public OTP verification for a receipt token
export const confirmReceipt = async (app, token, customerPhoneE164, body = {}) => {
  await request(app).post(`/api/v1/receipts/verify/${token}/otp`);
  const otp = lastOtpFor(customerPhoneE164);
  return request(app)
    .post(`/api/v1/receipts/verify/${token}/confirm`)
    .send({ otp, action: "verify", channel: "qr", ...body });
};
