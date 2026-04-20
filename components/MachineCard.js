"use client";

import { useEffect, useId, useRef, useState } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import AddLogModal from "./AddLogModal";
import styles from "./MachineCard.module.css";

const STATUS_OPTIONS = ["Operational", "Broken", "Maintenance"];

function badgeClassForStatus(status) {
  const key = String(status ?? "")
    .trim()
    .toLowerCase();
  if (key === "broken") return styles.badgeBroken;
  if (key === "maintenance") return styles.badgeMaintenance;
  if (key === "operational") return styles.badgeOperational;
  return styles.badgeUnknown;
}

export default function MachineCard({
  id,
  name,
  status,
  year,
  onStatusChange,
  onDeleted,
  onDeleteFailed,
  onAddNote,
  onViewHistory
}) {
  const statusMenuId = useId();
  const actionsMenuId = useId();
  const confirmTitleId = useId();
  const rootRef = useRef(null);

  const [isSaving, setIsSaving] = useState(false);
  const [optimisticStatus, setOptimisticStatus] = useState(undefined);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const statusValue = optimisticStatus ?? status;
  const statusLabel =
    statusValue === null || statusValue === undefined || statusValue === ""
      ? "—"
      : String(statusValue);

  useEffect(() => {
    if (!statusMenuOpen && !actionsMenuOpen) return;
    function onPointerDown(e) {
      if (!rootRef.current) return;
      if (rootRef.current.contains(e.target)) return;
      setStatusMenuOpen(false);
      setActionsMenuOpen(false);
    }

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [statusMenuOpen, actionsMenuOpen]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key !== "Escape") return;
      if (confirmOpen) {
        setConfirmOpen(false);
        return;
      }
      if (actionsMenuOpen) {
        setActionsMenuOpen(false);
        return;
      }
      if (statusMenuOpen) setStatusMenuOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [confirmOpen, actionsMenuOpen, statusMenuOpen]);

  async function setStatus(nextStatus) {
    if (!id) return;
    setStatusMenuOpen(false);
    const prevStatus = statusValue;
    setOptimisticStatus(nextStatus);
    if (typeof onStatusChange === "function") onStatusChange(id, nextStatus);
    setIsSaving(true);

    const supabase = getBrowserSupabaseClient();
    const { error } = await supabase
      .from("machines")
      .update({ status: nextStatus })
      .eq("id", id);

    if (error) {
      setOptimisticStatus(undefined);
      if (typeof onStatusChange === "function") onStatusChange(id, prevStatus);
      setIsSaving(false);
      alert(error.message);
      return;
    }

    setIsSaving(false);
  }

  async function confirmRemoveMachine() {
    if (!id) return;
    setConfirmOpen(false);
    setActionsMenuOpen(false);

    const snapshot = { id, name, status: statusValue, year };
    if (typeof onDeleted === "function") onDeleted(snapshot);

    const supabase = getBrowserSupabaseClient();
    const { error } = await supabase.from("machines").delete().eq("id", id);

    if (error) {
      if (typeof onDeleteFailed === "function") onDeleteFailed(snapshot);
      alert(error.message);
    }
  }

  const hasOpenMenu = statusMenuOpen || actionsMenuOpen;

  return (
    <article
      className={`${styles.card} ${hasOpenMenu ? styles.cardRaised : ""}`}
      ref={rootRef}
    >
      <div className={styles.kebabWrap}>
        <button
          type="button"
          className={styles.kebabButton}
          aria-label="Machine actions"
          aria-haspopup="menu"
          aria-expanded={actionsMenuOpen}
          aria-controls={actionsMenuId}
          disabled={isSaving || !id}
          onClick={() => {
            setStatusMenuOpen(false);
            setActionsMenuOpen((v) => !v);
          }}
        >
          <span className={styles.kebabIcon} aria-hidden="true">
            ⋮
          </span>
        </button>

        {actionsMenuOpen ? (
          <div id={actionsMenuId} className={styles.actionMenu} role="menu">
            <button
              type="button"
              role="menuitem"
              className={`${styles.menuItem} ${styles.menuItemDanger}`}
              onClick={() => {
                setActionsMenuOpen(false);
                setConfirmOpen(true);
              }}
            >
              Remove Machine
            </button>
          </div>
        ) : null}
        
      </div>

      <h2 
  className={styles.name} 
  onClick={onViewHistory} 
  style={{ 
    cursor: 'pointer', 
    transition: 'color 0.2s ease' 
  }}
  onMouseOver={(e) => e.currentTarget.style.color = '#22d3ee'}
  onMouseOut={(e) => e.currentTarget.style.color = 'rgba(248, 250, 252, 0.95)'}
>
  {name}
</h2>
      <div className={styles.meta}>
        <div className={styles.statusWrap}>
          <button
            type="button"
            className={`${styles.badge} ${styles.statusButton} ${badgeClassForStatus(statusValue)}`}
            aria-haspopup="menu"
            aria-expanded={statusMenuOpen}
            aria-controls={statusMenuId}
            onClick={() => {
              setActionsMenuOpen(false);
              setStatusMenuOpen((v) => !v);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setStatusMenuOpen(false);
            }}
            disabled={isSaving || !id}
          >
            {statusLabel}
          </button>

          {statusMenuOpen ? (
            <div id={statusMenuId} className={styles.menu} role="menu">
              {STATUS_OPTIONS.map((opt) => {
                const selected =
                  String(statusValue ?? "").trim().toLowerCase() ===
                  opt.toLowerCase();
                return (
                  <button
                    key={opt}
                    type="button"
                    role="menuitemradio"
                    aria-checked={selected}
                    className={`${styles.menuItem} ${selected ? styles.menuItemSelected : ""}`}
                    onClick={() => setStatus(opt)}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
        <p className={styles.year}>{year}</p>
      </div>

      {confirmOpen ? (
        <>
          <div
            className={styles.confirmBackdrop}
            onClick={() => setConfirmOpen(false)}
          />
          <div
            className={styles.confirmModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby={confirmTitleId}
          >
            <div className={styles.confirmPanel}>
              <h3 className={styles.confirmTitle} id={confirmTitleId}>
                Remove machine?
              </h3>
              <p className={styles.confirmBody}>
                Are you sure you want to remove{" "}
                <strong style={{ color: "rgba(248, 250, 252, 0.95)" }}>
                  {name}
                </strong>{" "}
                from the floor? This cannot be undone.
              </p>
              <div className={styles.confirmActions}>
                <button
                  type="button"
                  className={styles.confirmButton}
                  onClick={() => setConfirmOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`${styles.confirmButton} ${styles.confirmDanger}`}
                  onClick={confirmRemoveMachine}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* ADD REPAIR NOTE BUTTON */}
      <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={() => setLogModalOpen(true)}
          style={{
            backgroundColor: 'rgba(248, 250, 252, 0.05)',
            border: '1px solid rgba(248, 250, 252, 0.1)',
            color: 'rgba(248, 250, 252, 0.8)',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(248, 250, 252, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(248, 250, 252, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(248, 250, 252, 0.1)';
          }}
        >
          <span style={{ color: '#22d3ee', fontSize: '1.1rem' }}>+</span> 
          Add Note
        </button>
      </div>

      {logModalOpen && (
  <AddLogModal 
    machineId={id} 
    machineName={name} 
    onClose={() => setLogModalOpen(false)} 
  />
)}

    </article>
  );
}
