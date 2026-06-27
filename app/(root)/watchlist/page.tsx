"use client";
import React, { useState, useMemo } from "react";
import { useWishlist } from "../../../context/WishlistContext";
import WatchlistButton from "../../../components/WatchlistButton";

// changed code: add search, sort, confirm on clear, copy feedback
export default function WatchlistPage() {
  const { items, remove, updateCompany, clear, exportJson, importJson } = useWishlist();
  const [importing, setImporting] = useState<string>("");
  const [query, setQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [copyMsg, setCopyMsg] = useState<string | null>(null);

  const handleFile = (f: File | null) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      importJson(text, false);
    };
    reader.readAsText(f);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = items.filter((it) => {
      if (!q) return true;
      return (
        it.symbol.toLowerCase().includes(q) ||
        (it.company || "").toLowerCase().includes(q)
      );
    });
    return list.sort((a, b) => (sortAsc ? a.symbol.localeCompare(b.symbol) : b.symbol.localeCompare(a.symbol)));
  }, [items, query, sortAsc]);

  const handleClear = () => {
    if (!confirm("Clear all items from your watchlist? This cannot be undone.")) return;
    clear();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportJson());
      setCopyMsg("Copied to clipboard");
      setTimeout(() => setCopyMsg(null), 2000);
    } catch {
      setCopyMsg("Copy failed");
      setTimeout(() => setCopyMsg(null), 2000);
    }
  };

  return (
    <div className="watchlist-page mx-auto p-4">
      <div className="header p-4 flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Your Watchlist <span className="text-sm text-white">({items.length})</span></h1>
        <div className="actions flex items-center space-x-2">
          <button onClick={handleCopy} className="btn">
            Copy JSON
          </button>
          <button onClick={handleClear} className="btn btn-danger">
            Clear All
          </button>
          <label className="btn">
            Import
            <input
              type="file"
              accept="application/json"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </div>

      <div className="controls flex items-center gap-3 mb-4">
        <input
          className="input flex-1"
          placeholder="Search by symbol or company..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn" onClick={() => setSortAsc((s) => !s)}>
          Sort {sortAsc ? "A→Z" : "Z→A"}
        </button>
        {copyMsg ? <div className="text-sm text-green-600">{copyMsg}</div> : null}
      </div>

      <ul className="watchlist-list space-y-3">
        {filtered.length === 0 ? (
          <li className="p-6 bg-gray-800 rounded text-center text-muted">
            No items found. Use the search or add symbols to your watchlist.
          </li>
        ) : (
          filtered.map((it) => (
            <li key={it.symbol} className="watchlist-item p-3 bg-gray-800 rounded shadow-sm flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="symbol font-medium text-lg">{it.symbol}</div>
                <div className="company text-sm text-gray-500">{it.company}</div>
              </div>

              <div className="controls ml-4 flex items-center">
                <WatchlistButton symbol={it.symbol} company={it.company} isInWatchlist={true} showTrashIcon />
                <button onClick={() => remove(it.symbol)} className="">
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}