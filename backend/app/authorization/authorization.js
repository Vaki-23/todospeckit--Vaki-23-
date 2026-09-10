import db from "../models/index.js";
import logger from "../config/logger.js";

const Session = db.session;
const User = db.user;

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).send({ message: "Unauthorized! No token provided." });
    }

    const session = await Session.findOne({
      where: { token },
      include: [{ model: User, as: "user" }],
    });

    if (!session || !session.user || new Date(session.expirationDate) < new Date()) {
      return res.status(401).send({ message: "Unauthorized! Invalid or expired token." });
    }

    req.user = {
      id: session.user.id,
      role: session.user.role,
      organizationId: null,
    };

    return next();
  } catch (err) {
    logger.error(err.message);
    return res.status(401).send({ message: "Unauthorized! Invalid or expired token." });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role === "admin" || req.user?.role === "superadmin") {
    return next();
  }
  return res.status(403).send({ message: "Require Admin Role!" });
}

export function requireSuperAdmin(req, res, next) {
  if (req.user?.role === "superadmin") {
    return next();
  }
  return res.status(403).send({ message: "Require Super Admin Role!" });
}
