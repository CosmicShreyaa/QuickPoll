import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { signToken } from "../lib/jwt.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

authRouter.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password } = req.body ?? {};
    if (!name?.trim() || !email?.trim() || !password) {
      return res
        .status(400)
        .json({ error: "name, email and password are required" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "password must be at least 8 characters" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: "An account with that email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    const token = signToken(user);
    res.status(201).json({ user: user.toPublicJSON(), token });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/signin", async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email?.trim() || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken(user);
    res.json({ user: user.toPublicJSON(), token });
  } catch (err) {
    next(err);
  }
});

authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
});
