"use client";
import React, { useMemo, useState } from "react";
import { useWishlist } from "../context/WishlistContext";

// Minimal WatchlistButton implementation to satisfy page requirements.
// This component focuses on UI contract only. It toggles local state and
// calls onWatchlistChange if provided. Styling hooks match globals.css.

const WatchlistButton = ({
  symbol,
  company,
  isInWatchlist: isInWatchlistProp,
  showTrashIcon = false,
  type = "button",
  onWatchlistChange,
}: WatchlistButtonProps) => {
  const { isInWatchlist, toggle } = useWishlist();
  const [loading, setLoading] = useState(false);

  // determine if item is added either from hook or fallback prop
  const added = isInWatchlist(symbol) || !!isInWatchlistProp;

  const label = useMemo(() => {
    if (type === "icon") return added ? "" : "";
    return added ? "Remove" : "Add to Watchlist";
  }, [added, type]);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // toggle may be async; await to get new state
      const next = await toggle(symbol, company);
      onWatchlistChange?.(symbol, next);
    } finally {
      setLoading(false);
    }
  };

  const commonBtnProps = {
    onClick: handleClick,
    "aria-busy": loading || undefined,
    disabled: loading,
    className: `watchlist-btn transition-all duration-150 p-2 ${added ? "watchlist-remove" : ""} ${
      loading ? "opacity-60 cursor-wait" : ""
    }`,
  };

  if (type === "icon") {
    return (
      <button
        title={added ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
        aria-label={added ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
        className={`watchlist-icon-btn  ${added ? "watchlist-icon-added" : ""} ${
          loading ? "opacity-60 cursor-wait" : ""
        }`}
        onClick={handleClick}
        aria-busy={loading || undefined}
        disabled={loading}
        type="button"
      >
        {loading ? (
          // small spinner
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="3" strokeOpacity="0.2" />
            <path d="M22 12a10 10 0 00-10-10" strokeWidth="3" strokeLinecap="round" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={added ? "#FACC15" : "none"}
            stroke="#FACC15"
            strokeWidth="1.5"
            className="watchlist-star"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.385a.563.563 0 00-.182-.557L3.04 10.385a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z"
            />
          </svg>
        )}
      </button>
    );
  }

  return (
    <button {...commonBtnProps} type="button" role="button">
      {loading ? (
        <svg className="w-5 h-5 mr-2 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="3" strokeOpacity="0.2" />
          <path d="M22 12a10 10 0 00-10-10" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ) : null}
      <span>{label}</span>
    </button>
  );
};

export default WatchlistButton;