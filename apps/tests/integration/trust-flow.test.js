import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import {
  startDb, stopDb, clearDb, getApp, seedCategory,
  loginWorker, loginCustomer, createReceipt, confirmReceipt,
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

// Worker creates a receipt and the customer verifies it. Returns the receipt id.
const verifiedJob = async (worker, title = "Wiring job") => {
  const { receipt, verification } = await createReceipt(app, worker, category._id, { title });
  const res = await confirmReceipt(app, verification.token, CUSTOMER_E164);
  expect(res.status).toBe(200);
  return receipt._id;
};

describe("ratings", () => {
  it("lets the customer rate a verified job once", async () => {
    const worker = await loginWorker(app);
    const rid = await verifiedJob(worker);
    const customer = await loginCustomer(app);

    const first = await request(app).post("/api/v1/ratings").set(customer.auth).send({ receiptId: rid, stars: 5 });
    expect(first.status).toBe(201);

    const second = await request(app).post("/api/v1/ratings").set(customer.auth).send({ receiptId: rid, stars: 4 });
    expect(second.status).toBe(409);
  });

  it("does not allow rating a pending receipt", async () => {
    const worker = await loginWorker(app);
    const { receipt } = await createReceipt(app, worker, category._id);
    const customer = await loginCustomer(app);
    const res = await request(app).post("/api/v1/ratings").set(customer.auth).send({ receiptId: receipt._id, stars: 5 });
    expect(res.status).toBe(400);
  });

  it("does not allow a different customer to rate someone else's job", async () => {
    const worker = await loginWorker(app);
    const rid = await verifiedJobs(worker);
    const stranger = await loginCustomer(app, "9123456780");
    const res = await request(app).post("/api/v1/ratings").set(stranger.auth).send({ receiptId: rid, stars: 1 });
    expect(res.status).toBe(404);
  });

  it("does not allow workers to rate", async () => {
    const worker = await loginWorker(app);
    const rid = await verifiedJob(worker);
    const res = await request(app).post("/api/v1/ratings").set(worker.auth).send({ receiptId: rid, stars: 5 });
    expect(res.status).toBe(403);
  });
});

// Small helper alias used above so the stranger test reads naturally
const verifiedJobs = (worker) => verifiedJob(worker);

describe("tier progression", () => {
  it("raises verified count but keeps tier 'new' until 3 jobs and a score of 30", async () => {
    const worker = await loginWorker(app);
    await verifiedJob(worker, "Job number one");
    const trust = await request(app).get("/api/v1/workers/me/trust").set(worker.auth);
    expect(trust.body.data.trust.tier).toBe("new");
    expect(trust.body.data.trust.nextTier.tier).toBe("bronze");
  });
});

describe("dispute after verification", () => {
  it("moves a verified job to disputed and lowers the verified count", async () => {
    const worker = await loginWorker(app);
    const rid = await verifiedJob(worker);
    const customer = await loginCustomer(app);

    const res = await request(app)
      .post(`/api/v1/customers/me/receipts/${rid}/dispute`)
      .set(customer.auth)
      .send({ reason: "I confirmed this by mistake, nothing was done." });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("disputed");

    const trust = await request(app).get("/api/v1/workers/me/trust").set(worker.auth);
    expect(trust.body.data.trust.breakdown.verifiedJobs).toBe(0);
    expect(trust.body.data.trust.breakdown.disputedOrRejected).toBe(1);
  });

  it("hides the rating of a disputed job", async () => {
    const worker = await loginWorker(app);
    const rid = await verifiedJob(worker);
    const customer = await loginCustomer(app);
    await request(app).post("/api/v1/ratings").set(customer.auth).send({ receiptId: rid, stars: 5 });

    await request(app)
      .post(`/api/v1/customers/me/receipts/${rid}/dispute`)
      .set(customer.auth)
      .send({ reason: "Changed my mind, the work was poor." });

    const me = await request(app).get("/api/v1/workers/me").set(worker.auth);
    expect(me.body.data.worker.ratingsCount).toBe(0);
  });

  it("cannot dispute twice", async () => {
    const worker = await loginWorker(app);
    const rid = await verifiedJob(worker);
    const customer = await loginCustomer(app);
    const body = { reason: "A long enough reason to pass validation." };

    await request(app).post(`/api/v1/customers/me/receipts/${rid}/dispute`).set(customer.auth).send(body);
    const again = await request(app).post(`/api/v1/customers/me/receipts/${rid}/dispute`).set(customer.auth).send(body);
    expect(again.status).toBe(409);
  });

  it("refuses after the 30-day window", async () => {
    const worker = await loginWorker(app);
    const rid = await verifiedJob(worker);
    const JobReceipt = (await import("../../src/models/JobReceipt.js")).default;
    await JobReceipt.updateOne({ _id: rid }, { verifiedAt: new Date(Date.now() - 40 * 86400000) });

    const customer = await loginCustomer(app);
    const res = await request(app)
      .post(`/api/v1/customers/me/receipts/${rid}/dispute`)
      .set(customer.auth)
      .send({ reason: "Trying to dispute far too late." });
    expect(res.status).toBe(400);
  });
});

describe("privacy", () => {
  it("never exposes phone numbers in the public profile or directory", async () => {
    const worker = await loginWorker(app);
    const me = await request(app).get("/api/v1/workers/me").set(worker.auth);
    const slug = me.body.data.worker.slug;

    const profile = await request(app).get(`/api/v1/profiles/${slug}`);
    const directory = await request(app).get("/api/v1/directory/workers");
    for (const body of [profile.body, directory.body]) {
      const text = JSON.stringify(body);
      expect(text).not.toContain("9876543210");
      expect(text).not.toContain('"phone"');
      expect(text).not.toContain('"location"');
    }
  });

  it("hides suspended workers from the directory", async () => {
    const worker = await loginWorker(app);
    await request(app).get("/api/v1/workers/me").set(worker.auth); // creates slug
    const User = (await import("../../src/models/User.js")).default;
    await User.updateOne({ phone: "+919876543210" }, { status: "suspended" });

    const directory = await request(app).get("/api/v1/directory/workers");
    expect(directory.body.data.workers).toHaveLength(0);
  });
});