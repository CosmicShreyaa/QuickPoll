import mongoose from "mongoose";

// Reuse the connection across warm serverless invocations instead of
// reconnecting on every request (each connection attempt is slow and
// MongoDB Atlas caps concurrent connections per cluster tier).
let cached = global._quickpollMongoose;
if (!cached) {
  cached = global._quickpollMongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, { bufferCommands: false })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
