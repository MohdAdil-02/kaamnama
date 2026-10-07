import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import {
  startDb, stopDb, clearDb, getApp, seedCategory,
  login, loginWorker, loginCustomer, createReceipt, confirmReceipt, lastOtpFor,
} from "../helpers.js";

let app;
let category;

beforeAll(async () => {
  await startDb();
  app = await getApp();
});
afterAll(stopDb);
beforeEach(async () => {
  await clearDb();
  category = await seedCategory();
});

// Sends the deletion OTP and calls DELETE /account
const deleteAccount = async (who, phoneE164, overrides = {}) => {
  await request(app).post("/api/v1/account/delete-otp").set(who.auth);
  const otp = lastOtpFor(phoneE164);
  return request(app)
    .delete("/api/v1/account")
    .set(who.auth)
    .send({ otp, confirm: "DELETE", ...overrides });
};

describe("data export", () => {
  it("returns my data without secrets", async () => {
    const worker = await loginWorker(app);
    const res = await request(app).get("/api/v1/account/export").set(worker.auth);
    expect(res.status).toBe(200);
    expect(res.body.data.account.phone).toBe("+919876543210");
    expect(res.body.data.workerProfile.displayName).toBe("Ramesh Kumar");
    expect(JSON.stringify(res.body)).not.toContain("refreshTokens");
    expect(JSON.stringify(res.body)).not.toContain("tokenHash");
  });

  it("requires login", async () => {
    const res = await request(app).get("/api/v1/account/export");
    expect(res.status).toBe(401);
  });
});

describe("account deletion", () => {
  it("rejects a wrong OTP and keeps the account", async () => {
    const customer = await loginCustomer(app);
    await request(app).post("/api/v1/account/delete-otp").set(customer.auth);
    const res = await request(app)
      .delete("/api/v1/account")
      .set(customer.auth)
      .send({ otp: "000000", confirm: "DELETE" });
    expect(res.status).toBe(400);

    const me = await request(app).get("/api/v1/auth/me").set(customer.auth);
    expect(me.status).toBe(200);
  });

  it("requires typing DELETE", async () => {
    const customer = await loginCustomer(app);
    const res = await deleteAccount(customer, "+918123456789", { confirm: "yes" });
    expect(res.status).toBe(400);
  });

  it("blocks the old token after deletion", async () => {
    const customer = await loginCustomer(app);
    const res = await deleteAccount(customer, "+918123456789");
    expect(res.status).toBe(200);

    const me = await request(app).get("/api/v1/auth/me").set(customer.auth);
    expect(me.status).toBe(403);
  });

  it("frees the phone number for a brand new account", async () => {
    const customer = await loginCustomer(app);
    await deleteAccount(customer, "+918123456789");

    const again = await loginCustomer(app);
    expect(again.user._id).not.toBe(customer.user._id);
    const receipts = await request(app).get("/api/v1/customers/me/receipts").set(again.auth);
    expect(receipts.body.data.receipts).toHaveLength(0);
  });

  it("removes a deleted worker from the directory and public profile", async () => {
    const worker = await loginWorker(app);
    const me = await request(app).get("/api/v1/workers/me").set(worker.auth);
    const slug = me.body.data.worker.slug;

    const res = await deleteAccount(worker, "+919876543210");
    expect(res.status).toBe(200);

    const profile = await request(app).get(`/api/v1/profiles/${slug}`);
    expect(profile.status).toBe(404);
    const directory = await request(app).get("/api/v1/directory/workers");
    expect(directory.body.data.workers).toHaveLength(0);
  });

  it("expires a deleted worker's pending receipts so their link dies", async () => {
    const worker = await loginWorker(app);
    const { verification } = await createReceipt(app, worker, category._id);
    await deleteAccount(worker, "+919876543210");

    const link = await request(app).get(`/api/v1/receipts/verify/${verification.token}`);
    expect(link.status).toBe(404);
  });

  it("keeps a verified job but shows the worker as deleted to the customer", async () => {
    const worker = await loginWorker(app);
    const { verification } = await createReceipt(app, worker, category._id);
    await confirmReceipt(app, verification.token, "+918123456789");

    await deleteAccount(worker, "+919876543210");

    const customer = await loginCustomer(app);
    const res = await request(app).get("/api/v1/customers/me/receipts").set(customer.auth);
    expect(res.body.data.receipts).toHaveLength(1);
    expect(res.body.data.receipts[0].status).toBe("verified");
    expect(res.body.data.receipts[0].worker.displayName).toBe("Deleted worker");
  });

  it("scrubs the customer's phone from their receipts", async () => {
    const worker = await loginWorker(app);
    const { receipt, verification } = await createReceipt(app, worker, category._id, {
      customerName: "Anil Sharma",
    });
    await confirmReceipt(app, verification.token, "+918123456789");

    const customer = await loginCustomer(app);
    await deleteAccount(customer, "+918123456789");

    const JobReceipt = (await import("../../src/models/JobReceipt.js")).default;
    const stored = await JobReceipt.findById(receipt._id).lean();
    expect(stored.customerPhone).toMatch(/^deleted:/);
    expect(stored.customerName).toBeUndefined();
    expect(stored.status).toBe("verified"); // the worker's record survives
  });

  it("does not let an admin delete themselves through the API", async () => {
    const User = (await import("../../src/models/User.js")).default;
    await User.create({ phone: "+919812345679", name: "Admin", role: "admin", isPhoneVerified: true });
    const admin = await login(app, "9812345679");
    const res = await request(app).post("/api/v1/account/delete-otp").set(admin.auth);
    expect(res.status).toBe(403);
  });
});

describe("photo cleanup job", () => {
  it("expires stale receipts and clears their photo references", async () => {
    const worker = await loginWorker(app);
    const { receipt } = await createReceipt(app, worker, category._id);

    const JobReceipt = (await import("../../src/models/JobReceipt.js")).default;
    await JobReceipt.updateOne(
      { _id: receipt._id },
      { expiresAt: new Date(Date.now() - 1000), photos: [{ url: "https://x/y.jpg", publicId: "kaamnama/receipts/y" }] }
    );

    const { expireStaleReceipts } = await import("../../src/jobs/notification.job.js");
    const result = await expireStaleReceipts();
    expect(result.expired).toBe(1);
    expect(result.photosRemoved).toBe(1);

    const stored = await JobReceipt.findById(receipt._id).lean();
    expect(stored.status).toBe("expired");
    expect(stored.photos).toHaveLength(0);
  });
});