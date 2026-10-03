import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import {
  startDb, stopDb, clearDb, getApp, seedCategory,
  loginWorker, loginCustomer, createReceipt, confirmReceipt, lastOtpFor,
} from "../helpers.js";

let app;
let category;
const CUSTOMER_E164 = "+918123456789";

beforeAll(async () => {
  await startDb();
  app = await getApp();
});
afterAll(stopDb);
beforeEach(async () => {
  await clearDb();
  category = await seedCategory();
});

describe("receipt creation rules", () => {
  it("creates a pending receipt with a verify link and QR", async () => {
    const worker = await loginWorker(app);
    const { receipt, verification } = await createReceipt(app, worker, category._id);
    expect(receipt.status).toBe("pending");
    expect(receipt.receiptNumber).toMatch(/^KN-\d{8}-/);
    expect(verification.url).toContain("/verify/");
    expect(verification.qrDataUrl).toMatch(/^data:image\/png/);
  });

  it("does not store the raw verify token in the database", async () => {
    const worker = await loginWorker(app);
    const { receipt, verification } = await createReceipt(app, worker, category._id);
    const JobReceipt = (await import("../../src/models/JobReceipt.js")).default;
    const stored = await JobReceipt.findById(receipt._id).select("+verifyTokenHash").lean();
    expect(stored.verifyTokenHash).toBeDefined();
    expect(stored.verifyTokenHash).not.toBe(verification.token);
  });

  it("rejects a receipt for the worker's own phone", async () => {
    const worker = await loginWorker(app);
    const res = await request(app)
      .post("/api/v1/receipts")
      .set(worker.auth)
      .send({
        customerPhone: "9876543210",
        category: String(category._id),
        title: "Self job",
        workDate: new Date().toISOString().slice(0, 10),
      });
    expect(res.status).toBe(400);
  });

  it("rejects a work date in the far future", async () => {
    const worker = await loginWorker(app);
    const res = await request(app)
      .post("/api/v1/receipts")
      .set(worker.auth)
      .send({
        customerPhone: "8123456789",
        category: String(category._id),
        title: "Future job",
        workDate: "2099-01-01",
      });
    expect(res.status).toBe(400);
  });

  it("allows at most 3 pending receipts per customer", async () => {
    const worker = await loginWorker(app);
    for (let i = 0; i < 3; i++) await createReceipt(app, worker, category._id, { title: `Job number ${i}` });
    const res = await request(app)
      .post("/api/v1/receipts")
      .set(worker.auth)
      .send({
        customerPhone: "8123456789",
        category: String(category._id),
        title: "One too many",
        workDate: new Date().toISOString().slice(0, 10),
      });
    expect(res.status).toBe(409);
  });

  it("forbids customers from creating receipts", async () => {
    const customer = await loginCustomer(app);
    const res = await request(app).post("/api/v1/receipts").set(customer.auth).send({});
    expect(res.status).toBe(403);
  });
});

describe("customer verification flow", () => {
  it("shows a preview without exposing phone numbers", async () => {
    const worker = await loginWorker(app);
    const { verification } = await createReceipt(app, worker, category._id);
    const res = await request(app).get(`/api/v1/receipts/verify/${verification.token}`);
    expect(res.status).toBe(200);
    const text = JSON.stringify(res.body);
    expect(text).not.toContain("9876543210");
    expect(text).not.toContain("8123456789");
    expect(res.body.data.receipt.customerPhoneMasked).toContain("*");
  });

  it("verifies a receipt with the right OTP and updates the worker", async () => {
    const worker = await loginWorker(app);
    const { receipt, verification } = await createReceipt(app, worker, category._id);

    const res = await confirmReceipt(app, verification.token, CUSTOMER_E164);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("verified");

    const detail = await request(app).get(`/api/v1/receipts/${receipt._id}`).set(worker.auth);
    expect(detail.body.data.receipt.status).toBe("verified");
    expect(detail.body.data.events.map((e) => e.type)).toEqual(
      expect.arrayContaining(["created", "otp_sent", "verified"])
    );

    const trust = await request(app).get("/api/v1/workers/me/trust").set(worker.auth);
    expect(trust.body.data.trust.breakdown.verifiedJobs).toBe(1);
  });

  it("rejects a wrong OTP and leaves the receipt pending", async () => {
    const worker = await loginWorker(app);
    const { receipt, verification } = await createReceipt(app, worker, category._id);
    await request(app).post(`/api/v1/receipts/verify/${verification.token}/otp`);

    const res = await request(app)
      .post(`/api/v1/receipts/verify/${verification.token}/confirm`)
      .send({ otp: "000000", action: "verify" });
    expect(res.status).toBe(400);

    const detail = await request(app).get(`/api/v1/receipts/${receipt._id}`).set(worker.auth);
    expect(detail.body.data.receipt.status).toBe("pending");
  });

  it("sends the OTP to the customer's phone, not the worker's", async () => {
    const worker = await loginWorker(app);
    const { verification } = await createReceipt(app, worker, category._id);
    await request(app).post(`/api/v1/receipts/verify/${verification.token}/otp`);
    expect(() => lastOtpFor(CUSTOMER_E164)).not.toThrow();
  });

  it("makes the link single-use after confirming", async () => {
    const worker = await loginWorker(app);
    const { verification } = await createReceipt(app, worker, category._id);
    await confirmReceipt(app, verification.token, CUSTOMER_E164);

    const again = await request(app).get(`/api/v1/receipts/verify/${verification.token}`);
    expect(again.status).toBe(404);
  });

  it("requires a reason to dispute through the link", async () => {
    const worker = await loginWorker(app);
    const { verification } = await createReceipt(app, worker, category._id);
    await request(app).post(`/api/v1/receipts/verify/${verification.token}/otp`);
    const otp = lastOtpFor(CUSTOMER_E164);
    const res = await request(app)
      .post(`/api/v1/receipts/verify/${verification.token}/confirm`)
      .send({ otp, action: "dispute" });
    expect(res.status).toBe(400);
  });

  it("invalidates the old link when a new QR is generated", async () => {
    const worker = await loginWorker(app);
    const { receipt, verification } = await createReceipt(app, worker, category._id);
    const fresh = await request(app).post(`/api/v1/receipts/${receipt._id}/qr`).set(worker.auth);
    expect(fresh.status).toBe(200);

    const oldLink = await request(app).get(`/api/v1/receipts/verify/${verification.token}`);
    expect(oldLink.status).toBe(404);
    const newLink = await request(app).get(`/api/v1/receipts/verify/${fresh.body.data.verification.token}`);
    expect(newLink.status).toBe(200);
  });
});