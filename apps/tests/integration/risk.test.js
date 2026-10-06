import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import {
  startDb, stopDb, clearDb, getApp, seedCategory,
  login, loginWorker, createReceipt, confirmReceipt,
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

const loginAdmin = async () => {
  const User = (await import("../../src/models/User.js")).default;
  await User.create({ phone: "+919812345679", name: "Admin", role: "admin", isPhoneVerified: true });
  return login(app, "9812345679");
};

// Same customer confirms `n` quick jobs for the worker (the suspicious pattern)
const suspiciousJobs = async (worker, n) => {
  for (let i = 0; i < n; i++) {
    const { verification } = await createReceipt(app, worker, category._id, { title: `Quick job ${i}` });
    const res = await confirmReceipt(app, verification.token, "+918123456789");
    expect(res.status).toBe(200);
  }
};

describe("collusion detection", () => {
  it("flags a worker with many fast jobs from one customer", async () => {
    const admin = await loginAdmin();
    const worker = await loginWorker(app);
    await suspiciousJobs(worker, 6);

    const res = await request(app).get("/api/v1/admin/workers/flagged").set(admin.auth);
    expect(res.status).toBe(200);
    expect(res.body.data.workers).toHaveLength(1);
    expect(res.body.data.workers[0].riskSignals.length).toBeGreaterThan(0);
  });

  it("does not flag a worker with a single job", async () => {
    const admin = await loginAdmin();
    const worker = await loginWorker(app);
    await suspiciousJobs(worker, 1);
    const res = await request(app).get("/api/v1/admin/workers/flagged").set(admin.auth);
    expect(res.body.data.workers).toHaveLength(0);
  });

  it("lets an admin clear a flag, and it stays cleared after a rescan", async () => {
    const admin = await loginAdmin();
    const worker = await loginWorker(app);
    await suspiciousJobs(worker, 6);
    const flagged = (await request(app).get("/api/v1/admin/workers/flagged").set(admin.auth)).body.data.workers[0];

    const clear = await request(app)
      .post(`/api/v1/admin/workers/${flagged._id}/clear-flag`)
      .set(admin.auth)
      .send({ reason: "Verified manually, regular customer" });
    expect(clear.status).toBe(200);

    await request(app).post(`/api/v1/admin/workers/${flagged._id}/rescan`).set(admin.auth);
    const after = await request(app).get("/api/v1/admin/workers/flagged").set(admin.auth);
    expect(after.body.data.workers).toHaveLength(0);
  });

  it("freezing pins the score at 0 and unfreezing restores it", async () => {
    const admin = await loginAdmin();
    const worker = await loginWorker(app);
    await suspiciousJobs(worker, 3);
    const me = await request(app).get("/api/v1/workers/me").set(worker.auth);
    const workerId = me.body.data.worker._id;
    expect(me.body.data.worker.trustScore).toBeGreaterThan(0);

    const freeze = await request(app)
      .post(`/api/v1/admin/workers/${workerId}/freeze`)
      .set(admin.auth)
      .send({ reason: "Under investigation" });
    expect(freeze.status).toBe(200);

    // A new verified job must not change a frozen score
    await suspiciousJobs(worker, 1);
    const frozen = await request(app).get("/api/v1/workers/me").set(worker.auth);
    expect(frozen.body.data.worker.trustScore).toBe(0);
    expect(frozen.body.data.worker.tier).toBe("new");

    const unfreeze = await request(app).post(`/api/v1/admin/workers/${workerId}/unfreeze`).set(admin.auth);
    expect(unfreeze.status).toBe(200);
    const restored = await request(app).get("/api/v1/workers/me").set(worker.auth);
    expect(restored.body.data.worker.trustScore).toBeGreaterThan(0);
  });

  it("blocks non-admins from the review queue", async () => {
    const worker = await loginWorker(app);
    const res = await request(app).get("/api/v1/admin/workers/flagged").set(worker.auth);
    expect(res.status).toBe(403);
  });
});