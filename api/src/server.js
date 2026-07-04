import "dotenv/config";
import { app } from "./app.js";
import { connectDB } from "./lib/db.js";

const port = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`QuickPoll API listening on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
