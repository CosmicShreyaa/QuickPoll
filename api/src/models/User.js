import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return { name: this.name, email: this.email };
};

export const User = mongoose.models.User || mongoose.model("User", userSchema);
