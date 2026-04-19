"use client";

import { useRouter } from "next/navigation";
import AddMachineFAB from "@/components/AddMachineFAB";
import styles from "./EmptyFloorState.module.css";

export default function EmptyFloorState({ includeFab = true }) {
  const router = useRouter();

  return (
    <div className={styles.wrap}>
      <div className={styles.bgIcon} aria-hidden="true">
        <span className={styles.bgGlyph}>🕹</span>
      </div>
      <h2 className={styles.title}>The floor is empty!</h2>
      <p className={styles.sub}>
        Add your first pinball machine to start tracking repairs.
      </p>
      {includeFab ? (
        <AddMachineFAB
          onInserted={() => {
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}
