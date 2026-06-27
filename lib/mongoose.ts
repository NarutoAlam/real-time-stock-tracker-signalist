import mongoose from "mongoose";

declare global {
  // Reuse mongoose connection across module reloads in development
  // eslint-disable-next-line @typescript-eslint/naming-convention
  var _mongoose: { conn?: typeof mongoose | null; promise?: Promise<typeof mongoose> | null } | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/rt-stock";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

if (!global._mongoose) {
  global._mongoose = { conn: null, promise: null };
}

export async function connect() {
  if (global._mongoose!.conn) {
    return global._mongoose!.conn;
  }

  if (!global._mongoose!.promise) {
    global._mongoose!.promise = mongoose.connect(MONGODB_URI, {
      // useNewUrlParser and useUnifiedTopology are defaults in current mongoose versions,
      // options can be added here if needed.
    }).then((m) => m);
  }

  try {
    global._mongoose!.conn = await global._mongoose!.promise;
    return global._mongoose!.conn;
  } catch (err) {
    global._mongoose!.promise = null;
    throw err;
  }
}
