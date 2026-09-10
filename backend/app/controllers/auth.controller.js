import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import db from "../models/index.js";
import authConfig from "../config/auth.config.js";
import logger from "../config/logger.js";

const User = db.user;
const Session = db.session;

const SALT_ROUNDS = 10;
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isBlank = (value) => !value || !String(value).trim();

const sessionPayload = (user, token) => ({
  userId: user.id,
  username: user.username,
  email: user.email,
  fName: user.fName,
  lName: user.lName,
  role: user.role,
  token,
});

const issueOrReuseSession = async (user) => {
  const existing = await Session.findOne({
    where: {
      userId: user.id,
      token: { [Op.ne]: "" },
      expirationDate: { [Op.gte]: new Date() },
    },
  });

  if (existing) {
    return existing.token;
  }

  const token = jwt.sign({ id: user.id }, authConfig.secret, { expiresIn: 86400 });
  await Session.create({
    token,
    email: user.email,
    expirationDate: new Date(Date.now() + SESSION_TTL_MS),
    userId: user.id,
  });

  return token;
};

const exports = {};

exports.register = async (req, res) => {
  const fName = req.body.fName?.trim();
  const lName = req.body.lName?.trim();
  const email = req.body.email?.trim();
  const username = req.body.username?.trim().toLowerCase();
  const password = req.body.password;

  if (isBlank(req.body.fName)) {
    return res.status(400).send({ message: "First name is required." });
  }
  if (isBlank(req.body.lName)) {
    return res.status(400).send({ message: "Last name is required." });
  }
  if (isBlank(req.body.email)) {
    return res.status(400).send({ message: "Email is required." });
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).send({ message: "Enter a valid email address." });
  }
  if (isBlank(req.body.username)) {
    return res.status(400).send({ message: "Username is required." });
  }
  if (isBlank(password)) {
    return res.status(400).send({ message: "Password is required." });
  }
  if (password.length < 8) {
    return res.status(400).send({ message: "Password must be at least 8 characters." });
  }

  try {
    const existingUsername = await User.unscoped().findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).send({ message: "Username is already taken." });
    }

    const existingEmail = await User.unscoped().findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).send({ message: "Email is already registered." });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      fName,
      lName,
      email,
      username,
      password: hash,
      role: "worker",
    });

    const token = await issueOrReuseSession(user);
    return res.status(201).send(sessionPayload(user, token));
  } catch (err) {
    logger.error(err.message);
    return res.status(500).send({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const username = req.body.username?.trim().toLowerCase();
  const password = req.body.password;

  if (isBlank(req.body.username)) {
    return res.status(400).send({ message: "Username is required." });
  }
  if (isBlank(password)) {
    return res.status(400).send({ message: "Password is required." });
  }

  try {
    const user = await User.unscoped().findOne({ where: { username } });
    if (!user) {
      return res.status(401).send({ message: "Invalid username or password." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).send({ message: "Invalid username or password." });
    }

    const token = await issueOrReuseSession(user);
    return res.status(200).send(sessionPayload(user, token));
  } catch (err) {
    logger.error(err.message);
    return res.status(500).send({ message: err.message });
  }
};

exports.logout = async (req, res) => {
  const header = req.headers.authorization || "";
  const token = header.split(" ")[1];

  try {
    const session = await Session.findOne({ where: { token } });
    if (session) {
      await session.update({ token: "" });
    }
    return res.send({ message: "You have been signed out." });
  } catch (err) {
    logger.error(err.message);
    return res.status(500).send({ message: err.message });
  }
};

export default exports;
