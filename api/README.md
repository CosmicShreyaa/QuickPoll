# QuickPoll API

A serverless-ready Express API backing the QuickPoll frontend, persisted to MongoDB via Mongoose.

## Endpoints

| Method | Path                | Auth        | Body                                | Description                          |
| ------ | ------------------- | ----------- | ------------------------------------ | ------------------------------------ |
| GET    | `/api/health`        | –           | –                                     | Liveness check                       |
| POST   | `/api/auth/signup`   | –           | `{ name, email, password }`          | Create an account, returns JWT       |
| POST   | `/api/auth/signin`   | –           | `{ email, password }`                | Log in, returns JWT                  |
| GET    | `/api/auth/me`       | Bearer JWT  | –                                     | Current user                         |
| GET    | `/api/polls`         | –           | –                                     | List all polls                       |
| GET    | `/api/polls/:id`     | –           | –                                     | Get one poll                         |
| POST   | `/api/polls`         | Bearer JWT  | `{ question, options: string[] }`    | Create a poll (owned by caller)      |
| POST   | `/api/polls/:id/vote`| –           | `{ optionId }`                       | Cast a vote                          |
| DELETE | `/api/polls/:id`     | Bearer JWT  | –                                     | Delete a poll you own                |

## Local development (for Postman testing)

```bash
cd api
cp .env.example .env   # then edit MONGODB_URI / JWT_SECRET as needed
npm install
npm run dev             # http://localhost:4000/api/...
```

Requires a reachable MongoDB instance — either local (`mongod`) or a hosted
cluster such as MongoDB Atlas. Point `MONGODB_URI` at it.

Optionally seed two sample public polls (mirrors the old frontend mock data):

```bash
npm run seed
```

Import [`postman/QuickPoll.postman_collection.json`](./postman/QuickPoll.postman_collection.json)
into Postman — it includes every endpoint above and auto-captures the JWT
and created poll id into collection variables as you run the requests
(Sign up/Sign in → Create → Vote/Delete).

## Deploying alongside the frontend

This app is a plain Express app (`src/app.js`) with two entry points:

- `src/server.js` — calls `app.listen()`. Use this for any traditional Node
  host (Render, Railway, Fly.io, a VM, Docker, etc).
- `index.js` — exports the Express `app` as the default export (Vercel's
  Node runtime drives an Express app directly, no adapter required) and a
  named `handler` export wrapped with `serverless-http` for AWS
  Lambda/Netlify Functions-style platforms.

The root [`vercel.json`](../vercel.json) rewrites `/api/*` to this function,
so deploying the repo root to Vercel serves the frontend and API from the
same domain.

Note: the frontend in this repo builds against a Cloudflare Workers target
by default (via Nitro). Cloudflare Workers cannot open raw TCP sockets, so
the MongoDB driver can't run there — deploy this API to a Node-capable
target (Vercel Functions, Netlify Functions, Render, Railway, ...) even if
the frontend itself ends up on Cloudflare Pages. "Hosted alongside the
frontend" here means same repo/same project, routed together at the edge —
not necessarily the same runtime.

## Environment variables

| Variable       | Description                                      |
| -------------- | ------------------------------------------------- |
| `MONGODB_URI`  | MongoDB connection string                         |
| `JWT_SECRET`   | Secret used to sign auth tokens                   |
| `PORT`         | Local server port (default `4000`)                |
| `CORS_ORIGIN`  | Comma-separated allowed origins (default `*`)     |
