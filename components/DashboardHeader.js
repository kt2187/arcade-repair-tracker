"use client";

import { useEffect, useId, useMemo, useState } from "react";
import styles from "./DashboardHeader.module.css";

const FILTERS = ["All", "Operational", "Broken", "Maintenance"];

export default function DashboardHeader({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}) {
  const searchId = useId();
  const [draft, setDraft] = useState(search ?? "");

  useEffect(() => {
    setDraft(search ?? "");
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (typeof onSearchChange === "function") onSearchChange(draft);
    }, 300);
    return () => clearTimeout(t);
  }, [draft, onSearchChange]);

  const pills = useMemo(
    () =>
      FILTERS.map((label) => {
        const selected = (statusFilter ?? "All") === label;
        return (
          <button
            key={label}
            type="button"
            className={`${styles.pill} ${selected ? styles.pillSelected : ""}`}
            onClick={() =>
              typeof onStatusFilterChange === "function" &&
              onStatusFilterChange(label)
            }
            aria-pressed={selected}
          >
            {label}
          </button>
        );
      }),
    [statusFilter, onStatusFilterChange],
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.searchRow}>
        <label htmlFor={searchId} style={{ position: "absolute", left: -9999 }}>
          Search machines
        </label>
        <input
          id={searchId}
          className={styles.search}
          placeholder="Search machines by name..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
      </div>
      <div className={styles.pills}>{pills}</div>
    </div>
  );
}

