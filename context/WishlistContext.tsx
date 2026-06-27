"use client";
import { useEffect, useState, useCallback } from "react";

type WishlistItem = {
  symbol: string;
  company?: string;
};
 
const API_BASE = "/api/wishlist";

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  // fetch initial items from server
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(API_BASE, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as WishlistItem[];
        if (mounted) setItems(data);
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const isInWatchlist = useCallback(
    (symbol: string) => items.some((it) => it.symbol.toUpperCase() === symbol.toUpperCase()),
    [items]
  );

  const add = useCallback(
    async (symbol: string, company?: string) => {
      try {
        const res = await fetch(API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbol, company }),
        });
        if (!res.ok) return false;
        const updated = (await res.json()) as WishlistItem[];
        setItems(updated);
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  const remove = useCallback(
    async (symbol: string) => {
      try {
        const url = new URL(API_BASE, location.origin);
        url.searchParams.set("symbol", symbol);
        const res = await fetch(url.toString(), { method: "DELETE" });
        if (!res.ok) return false;
        const updated = (await res.json()) as WishlistItem[];
        setItems(updated);
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  const toggle = useCallback(
    async (symbol: string, company?: string) => {
      const present = isInWatchlist(symbol);
      if (present) {
        await remove(symbol);
        return false;
      } else {
        await add(symbol, company);
        return true;
      }
    },
    [isInWatchlist, add, remove]
  );

  const updateCompany = useCallback(
    async (symbol: string, company?: string) => {
      try {
        const res = await fetch(API_BASE, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbol, company }),
        });
        if (!res.ok) return false;
        const updated = (await res.json()) as WishlistItem[];
        setItems(updated);
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  const clear = useCallback(async () => {
    try {
      const res = await fetch(API_BASE, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clear: true }),
      });
      if (!res.ok) return false;
      setItems([]);
      return true;
    } catch {
      return false;
    }
  }, []);

  const exportJson = useCallback(() => {
    return JSON.stringify(items, null, 2);
  }, [items]);

  const importJson = useCallback(
    async (json: string, replace = true) => {
      try {
        const parsed = JSON.parse(json) as WishlistItem[];
        if (!Array.isArray(parsed)) return false;
        if (replace) {
          // clear then add all
          const okClear = await clear();
          if (!okClear) return false;
        }
        // add items sequentially (could be optimized)
        for (const it of parsed) {
          await add(it.symbol, it.company);
        }
        // refresh list
        const res = await fetch(API_BASE, { cache: "no-store" });
        if (res.ok) {
          const refreshed = (await res.json()) as WishlistItem[];
          setItems(refreshed);
        }
        return true;
      } catch {
        return false;
      }
    },
    [add, clear]
  );

  return {
    items,
    isInWatchlist,
    add,
    remove,
    toggle,
    updateCompany,
    clear,
    exportJson,
    importJson,
  };
}
