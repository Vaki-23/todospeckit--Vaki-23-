import request from "supertest";
import app from "../server.js";
import db from "../app/models/index.js";

export const syncTestDatabase = async () => {
  await db.sequelize.sync({ force: true });
};

export const validRegisterBody = (overrides = {}) => ({
  fName: "Jane",
  lName: "Doe",
  email: "jdoe@example.com",
  username: "jdoe",
  password: "password123",
  ...overrides,
});

export const registerUser = async (overrides = {}) => {
  const body = validRegisterBody(overrides);
  const res = await request(app).post("/todo/register").send(body);
  return { res, body };
};

export const loginUser = async (username, password) => {
  return request(app).post("/todo/login").send({ username, password });
};
