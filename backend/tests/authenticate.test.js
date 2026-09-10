/**
 * Feature 1 — User Authentication & Session Management
 * Spec: features/feature-1-user-auth.md
 */
import request from "supertest";
import app from "../server.js";
import db from "../app/models/index.js";
import { syncTestDatabase, registerUser } from "./helpers.js";

describe("Feature 1 — User Authentication & Session Management", () => {
  beforeEach(async () => {
    await syncTestDatabase();
  });

  describe("US-1.3 — Stay signed in across page loads", () => {
    it("API request includes session token", async () => {
      const { res: registerRes } = await registerUser();
      const token = registerRes.body.token;

      const res = await request(app)
        .get("/todo/lists")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("Protected API request succeeds with a valid session", async () => {
      const { res: userA } = await registerUser();
      const { res: userB } = await registerUser({
        username: "asmith",
        email: "asmith@example.com",
        fName: "Alex",
      });

      await db.list.create({ name: "User A List", userId: userA.body.userId });
      await db.list.create({ name: "User B List", userId: userB.body.userId });

      const res = await request(app)
        .get("/todo/lists")
        .set("Authorization", `Bearer ${userA.body.token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe("User A List");
      expect(res.body[0].userId).toBe(userA.body.userId);
    });

    it("Expired or invalid session token", async () => {
      const { res: registerRes } = await registerUser();
      const session = await db.session.findOne({ where: { userId: registerRes.body.userId } });
      await session.update({ expirationDate: new Date(Date.now() - 1000) });

      const res = await request(app)
        .get("/todo/lists")
        .set("Authorization", `Bearer ${registerRes.body.token}`);

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/Unauthorized/i);
    });
  });

  describe("US-1.5 — Block unauthenticated access", () => {
    it("Unauthenticated user accesses a protected route", async () => {
      const res = await request(app).get("/todo/lists");

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/Unauthorized/i);
    });
  });
});
