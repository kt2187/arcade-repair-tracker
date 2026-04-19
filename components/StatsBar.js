"use client";

import { useMemo } from "react";
import styles from "./StatsBar.module.css";

function countByStatus(machines) {
  let operational = 0;
  let broken = 0;
  let maintenance = 0;

  for (const m of machines ?? []) {
    const key = String(m?.status ?? "").trim().toLowerCase();
    if (key === "operational") operational += 1;
    else if (key === "broken") broken += 1;
    else if (key === "maintenance") maintenance += 1;
  }

  return { operational, broken, maintenance };
}

export default function StatsBar({ machines }) {
  const { operational, broken, maintenance } = useMemo(
    () => countByStatus(machines),
    [machines],
  );

  return (
    <section className={styles.bar} aria-label="Machine status summary">
      <dl className={styles.grid}>
        <div className={styles.stat}>
          <dt className={styles.label}>Operational</dt>
          <dd className={`${styles.value} ${styles.valueOperational}`}>
            {operational}
          </dd>
        </div>
        <div className={styles.stat}>
          <dt className={styles.label}>Broken</dt>
          <dd className={`${styles.value} ${styles.valueBroken}`}>{broken}</dd>
        </div>
        <div className={styles.stat}>
          <dt className={styles.label}>Maintenance</dt>
          <dd className={`${styles.value} ${styles.valueMaintenance}`}>
            {maintenance}
          </dd>
        </div>
      </dl>
    </section>
  );
}
