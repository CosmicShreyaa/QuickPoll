import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./lib/db.js";
import { Poll } from "./models/Poll.js";

const samplePolls = [
  {
    question: "What should we build next?",
    owner: null,
    options: [
      { id: "a", label: "Dark mode everywhere", votes: 94 },
      { id: "b", label: "Team workspaces", votes: 71 },
      { id: "c", label: "AI poll suggestions", votes: 58 },
      { id: "d", label: "Slack integration", votes: 25 },
    ],
    voters: 248,
  },
  {
    question: "Best day for the team offsite?",
    owner: null,
    options: [
      { id: "a", label: "Thursday", votes: 18 },
      { id: "b", label: "Friday", votes: 20 },
      { id: "c", label: "Saturday", votes: 4 },
    ],
    voters: 42,
  },
];

async function seed() {
  await connectDB();
  const count = await Poll.countDocuments();
  if (count > 0) {
    console.log(`Database already has ${count} poll(s) — skipping seed.`);
  } else {
    await Poll.insertMany(samplePolls);
    console.log(`Seeded ${samplePolls.length} sample polls.`);
  }
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
