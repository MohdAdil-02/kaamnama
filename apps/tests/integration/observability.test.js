import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { startDb, stopDb, getApp } from "../helpers.js";
import { redactUrl } from "../../src/config/logger.js";

let app;
beforeAll(async () => {
  await startDb();
  app = await getApp();
});
afterAll(stopDb);

describe("request IDs", () => {
  it("adds an X-Request-Id header to every response", async () => {
    const res = await request(app).get("/health");
    expect(res.headers["x-request-id"]).toMatch(/^[\w-]{8,64}$/);
  });

  it("echoes a sane caller-provided ID", async () => {
    const res = await request(app).get("/health").set("X-Request-Id", "frontend-abc-12345");
    expect(res.headers["x-request-id"]).toBe("frontend-abc-12345");
  });

  it("replaces a malicious or malformed ID", async () => {
    const res = await request(app).get("/health").set("X-Request-Id", "bad id\twith spaces!!");
    expect(res.headers["x-request-id"]).not.toContain(" ");
    expect(res.headers["x-request-id"]).toMatch(/^[\w-]{8,64}$/);
  });

  it("includes the request ID in error bodies", async () => {
    const res = await request(app).get("/api/v1/nope");
    expect(res.status).toBe(404);
    expect(res.body.requestId).toBe(res.headers["x-request-id"]);
  });
});

describe("health", () => {
  it("reports ready when the database is connected", async () => {
    const res = await request(app).get("/health/ready");
    expect(res.status).toBe(200);
    expect(res.body.db).toBe("up");
  });
});

describe("log redaction", () => {
  it("masks verification tokens in URLs", () => {
    const token = "a".repeat(48);
    expect(redactUrl(`/api/v1/receipts/verify/${token}/otp`)).toBe(
      "/api/v1/receipts/verify/[redacted]/otp"
    );
  });

  it("drops query strings", () => {
    expect(redactUrl("/api/v1/admin/users?q=9876543210")).toBe("/api/v1/admin/users");
  });

  it("leaves normal URLs alone", () => {
    expect(redactUrl("/api/v1/directory/workers")).toBe("/api/v1/directory/workers");
  });
});