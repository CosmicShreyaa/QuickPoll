import mongoose from "mongoose";
import crypto from "crypto";

// Unambiguous alphabet (no 0/O/1/l/I) so short links stay readable and short.
const SLUG_ALPHABET = "23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
const SLUG_LENGTH = 7;

export function generateSlug() {
  const bytes = crypto.randomBytes(SLUG_LENGTH);
  let slug = "";
  for (let i = 0; i < SLUG_LENGTH; i++) {
    slug += SLUG_ALPHABET[bytes[i] % SLUG_ALPHABET.length];
  }
  return slug;
}

export const SLUG_PATTERN = new RegExp(`^[${SLUG_ALPHABET}]{${SLUG_LENGTH}}$`);

const optionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true, trim: true },
    votes: { type: Number, default: 0 },
  },
  { _id: false },
);

const pollSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, default: generateSlug },
  question: { type: String, required: true, trim: true },
  options: {
    type: [optionSchema],
    validate: {
      validator: (opts) => Array.isArray(opts) && opts.length >= 2,
      message: "A poll needs at least two options",
    },
  },
  voters: { type: Number, default: 0 },
  owner: { type: String, default: null }, // creator's email; null = seed/public poll
  createdAt: { type: Date, default: Date.now },
});

pollSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this.slug,
    question: this.question,
    options: this.options.map((o) => ({ id: o.id, label: o.label, votes: o.votes })),
    voters: this.voters,
    owner: this.owner,
    createdAt: this.createdAt.toISOString(),
  };
};

export const Poll = mongoose.models.Poll || mongoose.model("Poll", pollSchema);
