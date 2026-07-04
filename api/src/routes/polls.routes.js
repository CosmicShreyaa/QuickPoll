import { Router } from "express";
import { Poll, SLUG_PATTERN } from "../models/Poll.js";
import { requireAuth } from "../middleware/auth.js";

export const pollsRouter = Router();

function isValidId(id) {
  return typeof id === "string" && SLUG_PATTERN.test(id);
}

pollsRouter.get("/", async (_req, res, next) => {
  try {
    const polls = await Poll.find().sort({ createdAt: -1 });
    res.json(polls.map((p) => p.toPublicJSON()));
  } catch (err) {
    next(err);
  }
});

pollsRouter.get("/:id", async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ error: "Poll not found" });
    const poll = await Poll.findOne({ slug: req.params.id });
    if (!poll) return res.status(404).json({ error: "Poll not found" });
    res.json(poll.toPublicJSON());
  } catch (err) {
    next(err);
  }
});

pollsRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const { question, options } = req.body ?? {};
    const cleanOptions = Array.isArray(options)
      ? options.map((o) => (typeof o === "string" ? o.trim() : "")).filter(Boolean)
      : [];

    if (!question?.trim()) {
      return res.status(400).json({ error: "question is required" });
    }
    if (cleanOptions.length < 2) {
      return res.status(400).json({ error: "At least two options are required" });
    }

    const pollData = {
      question: question.trim(),
      owner: req.user.email,
      options: cleanOptions.map((label, i) => ({
        id: String.fromCharCode(97 + i),
        label,
        votes: 0,
      })),
    };

    // `slug` has a `default` generator, so a fresh random slug is produced on
    // each attempt; retry covers the astronomically rare collision case.
    let poll;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        poll = await Poll.create(pollData);
        break;
      } catch (err) {
        if (err.code === 11000 && attempt < 4) continue;
        throw err;
      }
    }

    res.status(201).json(poll.toPublicJSON());
  } catch (err) {
    next(err);
  }
});

pollsRouter.post("/:id/vote", async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ error: "Poll not found" });
    const { optionId } = req.body ?? {};
    if (!optionId) return res.status(400).json({ error: "optionId is required" });

    const poll = await Poll.findOne({ slug: req.params.id });
    if (!poll) return res.status(404).json({ error: "Poll not found" });

    const option = poll.options.find((o) => o.id === optionId);
    if (!option) return res.status(400).json({ error: "Unknown optionId" });

    option.votes += 1;
    poll.voters += 1;
    await poll.save();

    res.json(poll.toPublicJSON());
  } catch (err) {
    next(err);
  }
});

pollsRouter.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ error: "Poll not found" });
    const poll = await Poll.findOne({ slug: req.params.id });
    if (!poll) return res.status(404).json({ error: "Poll not found" });
    if (poll.owner !== req.user.email) {
      return res.status(403).json({ error: "You do not own this poll" });
    }

    await poll.deleteOne();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
