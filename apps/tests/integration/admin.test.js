import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import {
  startDb, stopDb, clearDb, getApp, seedCategory,
  login, loginWorker, loginCustomer, createReceipt, confirmReceipt,
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

// Admins can only be created outside the API, so insert one directly
const loginAdmin = async () => {
  const User = (await import("../../src/models/User.js")).default;
  await User.create({ phone: "+919812345679", name: "Admin", role: "admin", isPhoneVerified: true });
  return login(app, "9812345679");
};

describe("admin access", () => {
  it("blocks non-admins with 403", async () => {
    const customer = await loginCustomer(app);
    const res = await request(app).get("/api/v1/admin/stats").set(customer.auth);
    expect(res.status).toBe(403);
  });

  it("returns dashboard stats to admins", async () => {
    const admin = await loginAdmin();
    const res = await request(app).get("/api/v1/admin/stats").set(admin.auth);
    expect(res.status).toBe(200);
    expect(res.body.data.users.byRole.admin).toBe(1);
  });
});

describe("suspension", () => {
  it("blocks a suspended user's existing token immediately", async () => {
    const admin = await loginAdmin();
    const customer = await loginCustomer(app);

    const suspend = await request(app)
      .post(`/api/v1/admin/users/${customer.user._id}/suspend`)
      .set(admin.auth)
      .send({ reason: "Testing suspension" });
    expect(suspend.status).toBe(200);

    const me = await request(app).get("/api/v1/auth/me").set(customer.auth);
    expect(me.status).toBe(403);
  });

  it("requires a reason", async () => {
    const admin = await loginAdmin();
    const customer = await loginCustomer(app);
    const res = await request(app)
      .post(`/api/v1/admin/users/${customer.user._id}/suspend`)
      .set(admin.auth)
      .send({});
    expect(res.status).toBe(400);
  });

  it("cannot suspend itself", async () => {
    const admin = await loginAdmin();
    const res = await request(app)
      .post(`/api/v1/admin/users/${admin.user._id}/suspend`)
      .set(admin.auth)
      .send({ reason: "Suspending myself" });
    expect(res.status).toBe(400);
  });

  it("writes an audit log entry", async () => {
    const admin = await loginAdmin();
    const customer = await loginCustomer(app);
    await request(app)
      .post(`/api/v1/admin/users/${customer.user._id}/suspend`)
      .set(admin.auth)
      .send({ reason: "Testing audit trail" });

    const logs = await request(app).get("/api/v1/admin/audit-logs").set(admin.auth);
    expect(logs.body.data.logs.map((l) => l.action)).toContain("user.suspend");
  });
});

describe("rating moderation", () => {
  it("hiding a rating removes it from the worker's score and unhiding restores it", async () => {
    const admin = await loginAdmin();
    const worker = await loginWorker(app);
    const { receipt, verification } = await createReceipt(app, worker, category._id);
    await confirmReceipt(app, verification.token, "+918123456789");
    const customer = await loginCustomer(app);
    await request(app).post("/api/v1/ratings").set(customer.auth).send({ receiptId: receipt._id, stars: 5 });

    const ratings = await request(app).get("/api/v1/admin/ratings").set(admin.auth);
    const ratingId = ratings.body.data.ratings[0]._id;

    const before = await request(app).get("/api/v1/workers/me").set(worker.auth);
    expect(before.body.data.worker.ratingsCount).toBe(1);

    await request(app)
      .post(`/api/v1/admin/ratings/${ratingId}/hide`)
      .set(admin.auth)
      .send({ reason: "Abusive language" });
    const hidden = await request(app).get("/api/v1/workers/me").set(worker.auth);
    expect(hidden.body.data.worker.ratingsCount).toBe(0);

    await request(app).post(`/api/v1/admin/ratings/${ratingId}/unhide`).set(admin.auth);
    const restored = await request(app).get("/api/v1/workers/me").set(worker.auth);
    expect(restored.body.data.worker.ratingsCount).toBe(1);
  });
});