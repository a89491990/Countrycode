import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { COUNTRY_CODES, flagEmoji } from "../utils/countryCodes.js";

export default function CountrySearchSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  const selected = COUNTRY_CODES.find(
    (c) => c.iso2 === value?.iso2 && c.code === value?.code
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRY_CODES;
    return COUNTRY_CODES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.includes(q)
    );
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  function selectCountry(country) {
    onChange(country);
    setOpen(false);
    setQuery("");
  }

  function handleKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[activeIndex]) selectCountry(filtered[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <label className="block text-xs font-medium text-muted-light dark:text-muted-dark mb-1.5">
        Country
      </label>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-64 items-center justify-between gap-2 rounded-lg border border-indigo-300/60 dark:border-indigo-500/40 bg-indigo-50/60 dark:bg-indigo-500/10 px-3 py-2 text-sm hover:border-indigo-400 transition-colors"
        >
          {selected ? (
            <span className="flex items-center gap-2 truncate">
              <span className="text-base leading-none">{flagEmoji(selected.iso2)}</span>
              <span className="truncate">{selected.name}</span>
              <span className="text-muted-light dark:text-muted-dark shrink-0">
                +{selected.code}
              </span>
            </span>
          ) : (
            <span className="text-muted-light dark:text-muted-dark">
              Search a country…
            </span>
          )}
          <ChevronDown size={14} className="shrink-0 text-indigo-500" />
        </button>
      ) : (
        <div className="w-64 rounded-lg border border-indigo-400 bg-surface-light dark:bg-surface-dark shadow-lg shadow-indigo-500/10">
          <div className="flex items-center gap-2 border-b border-edge-light dark:border-edge-dark px-2.5 py-2">
            <Search size={14} className="text-indigo-500 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a country or code…"
              className="w-full bg-transparent text-sm outline-none"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
                <X size={13} className="text-muted-light dark:text-muted-dark" />
              </button>
            )}
          </div>
          <ul className="max-h-60 overflow-y-auto py-1 output-panel">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted-light dark:text-muted-dark">
                No matches
              </li>
            )}
            {filtered.map((c, i) => (
              <li key={`${c.iso2}-${c.code}`}>
                <button
                  type="button"
                  onClick={() => selectCountry(c)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`flex w-full items-center gap-2.5 px-3 py-1.5 text-sm text-left ${
                    i === activeIndex
                      ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"
                      : ""
                  }`}
                >
                  <span className="text-base leading-none">{flagEmoji(c.iso2)}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="text-muted-light dark:text-muted-dark shrink-0">
                    +{c.code}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
