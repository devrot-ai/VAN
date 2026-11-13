"use client";

import { useState } from "react";
import styles from "./app.module.css";

/**
 * Client-side search filter. Renders a search input and filters the provided
 * children based on text match against a key selector function.
 */
export default function SearchBar<T>({
  items,
  children,
  keyOf,
  placeholder = "Search…",
}: {
  items: T[];
  children: (filtered: T[]) => React.ReactNode;
  keyOf: (item: T) => string;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = query
    ? items.filter((item) => keyOf(item).toLowerCase().includes(query.toLowerCase()))
    : items;

  return (
    <>
      <div className={styles.filterField} style={{ marginBottom: "var(--space-4)" }}>
        <input
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ minWidth: "260px" }}
        />
      </div>
      {children(filtered)}
    </>
  );
}
