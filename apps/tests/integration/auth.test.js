import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { startDb, stopDb, clearDb, getApp, loginWorker, lastOtpFor } from "../helpers.js";

let app;
beforeAll(async () => {
  await startDb();
  app = await getApp();
});
afterAll(stopDb);
beforeEach(clearDb);

describe("auth", () => {
  it("registers a new worker and creates a worker profile", async () => {
    const worker = await loginWorker(app);
    expect(worker.user.role).toBe("worker");

    const me = await request(app).get("/api/v1/auth/me").set(worker.auth);
    expect(me.status).toBe(200);
    expect(me.body.data.worker.displayName).toBe("Ramesh Kumar");
  });

  it("requires name and role for a new phone number", async () => {
    await request(app).post("/api/v1/auth/otp/send").send({ phone: "9876543210" });
    const otp = lastOtpFor("+919876543210");
    const res = await request(app).post("/api/v1/auth/otp/verify").send({ phone: "9876543210", otp });
    expect(res.status).toBe(400);
  });

  it("rejects a wrong OTP", async () => {
    await request(app).post("/api/v1/auth/otp/send").send({ phone: "9876543210" });
    const res = await request(app)
      .post("/api/v1/auth/otp/verify")
      .send({ phone: "9876543210", otp: "000000", name: "A B", role: "worker" });
    expect(res.status).toBe(400);
  });

  it("does not allow self-registering as admin", async () => {
    await request(app).post("/api/v1/auth/otp/send").send({ phone: "9876543210" });
    const otp = lastOtpFor("+919876543210");
    const res = await request(app)
      .post("/api/v1/auth/otp/verify")
      .send({ phone: "9876543210", otp, name: "Evil Admin", role: "admin" });
    expect(res.status).toBe(400);
  });

  it("rotates refresh tokens and rejects reuse of an old one", async () => {
    const worker = await (async () => {
      await request(app).post("/api/v1/auth/otp/send").send({ phone: "9876543210" });
      const otp = lastOtpFor("+919876543210");
      const res = await request(app)
        .post("/api/v1/auth/otp/verify")
        .send({ phone: "9876543210", otp, name: "Ramesh Kumar", role: "worker" });
      return res.body.data;
    })();

    const first = await request(app).post("/api/v1/auth/refresh").send({ refreshToken: worker.refreshToken });
    expect(first.status).toBe(200);

    const reuse = await request(app).post("/api/v1/auth/refresh").send({ refreshToken: worker.refreshToken });
    expect(reuse.status).toBe(401);
  });

  it("blocks protected routes without a token", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
  });
});