import { verifyToken } from "../lib/jwt.js";
import { User } from "../models/User.js";

// Attaches req.user when a valid bearer token is present; does not reject.
export async function attachUser(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next();

  try {
    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);
    if (user) req.user = user;
  } catch {
    // invalid/expired token: treat request as unauthenticated
  }
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Authentication required" });
  next();
}
