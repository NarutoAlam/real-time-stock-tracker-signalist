import { NextResponse } from "next/server";
import * as db from "@/lib/dbWishlist"; // server-side helper (replace with real DB)

// GET -> list items
export async function GET() {
  const items = await db.getAll();
  return NextResponse.json(items);
}

// POST -> add (or upsert) single item
export async function POST(req: Request) {
  try {
    const { symbol, company } = (await req.json()) as { symbol?: string; company?: string };
    if (!symbol) return NextResponse.json({ error: "missing symbol" }, { status: 400 });
    const updated = await db.addOrUpdate(symbol.toUpperCase(), company ?? "");
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
}

// PUT -> update company metadata for a symbol
export async function PUT(req: Request) {
  try {
    const { symbol, company } = (await req.json()) as { symbol?: string; company?: string };
    if (!symbol) return NextResponse.json({ error: "missing symbol" }, { status: 400 });
    const updated = await db.updateCompany(symbol.toUpperCase(), company ?? "");
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
}

// DELETE -> remove single symbol or clear all if body { clear: true }
export async function DELETE(req: Request) {
  try {
    // try query param first
    const url = new URL(req.url);
    const symbol = url.searchParams.get("symbol");
    if (symbol) {
      const updated = await db.remove(symbol.toUpperCase());
      return NextResponse.json(updated);
    }

    // check body for clear flag
    const body = await req.json().catch(() => null);
    if (body && (body.clear === true || body.clear === "true")) {
      await db.clear();
      return NextResponse.json([]);
    }

    return NextResponse.json({ error: "missing symbol or clear flag" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
}
