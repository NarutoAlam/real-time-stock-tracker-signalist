import { connectToDatabase } from './../database/mongoose';
import { Watchlist } from "@/database/models/watchlist.model";

type Item = { symbol: string; company?: string };

// Use a default user id until you wire real auth
const USER_ID = process.env.DEFAULT_USER_ID || "global";

/**
 * getAll - return all items for the default user
 */
export async function getAll(): Promise<Item[]> {
  await connectToDatabase();
  const docs = await Watchlist.find({ userId: USER_ID }).sort({ symbol: 1 }).lean();
  return docs.map((d: any) => ({ symbol: d.symbol, company: d.company }));
}

/**
 * addOrUpdate - add symbol or update company if exists (upsert)
 */
export async function addOrUpdate(symbol: string, company?: string): Promise<Item[]> {
  await connectToDatabase();
  await Watchlist.findOneAndUpdate(
    { userId: USER_ID, symbol: symbol.toUpperCase() },
    { $set: { company: company ?? "", addedAt: new Date(), userId: USER_ID } },
    { upsert: true, new: true }
  ).exec();
  return getAll();
}

/**
 * updateCompany - update company metadata
 */
export async function updateCompany(symbol: string, company?: string): Promise<Item[]> {
  await connectToDatabase();
  await Watchlist.findOneAndUpdate(
    { userId: USER_ID, symbol: symbol.toUpperCase() },
    { $set: { company: company ?? "" }, $setOnInsert: { addedAt: new Date(), userId: USER_ID } },
    { upsert: true, new: true }
  ).exec();
  return getAll();
}

/**
 * remove - remove a symbol for the default user
 */
export async function remove(symbol: string): Promise<Item[]> {
  await connectToDatabase();
  await Watchlist.deleteOne({ userId: USER_ID, symbol: symbol.toUpperCase() }).exec();
  return getAll();
}

/**
 * clear - remove all for the default user
 */
export async function clear(): Promise<void> {
  await connectToDatabase();
  await Watchlist.deleteMany({ userId: USER_ID }).exec();
  return;
}