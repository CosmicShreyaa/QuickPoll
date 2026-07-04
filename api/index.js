import "dotenv/config";
import serverlessHttp from "serverless-http";
import { app } from "./src/app.js";

// Vercel's Node.js runtime accepts an Express app directly as the default
// export and drives it like a normal request listener — no adapter needed.
export default app;

// For platforms that expect an AWS Lambda-style (event, context) handler
// instead (Netlify Functions, raw AWS Lambda, etc.), use this export.
export const handler = serverlessHttp(app);
