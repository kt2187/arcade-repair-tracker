"use client";

import { useEffect, useId, useRef, useState } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import styles from "./AddMachineFAB.module.css";

const STATUS_OPTIONS = ["Operational", "Broken", "Maintenance"];

export default function AddMachineFAB({ onInserted }) {
  const titleId = useId();
  const firstFieldRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [status, setStatus] = useState("Operational");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [model, setModel] = useState("");
  const [type, setType] = useState("Solid State");
  const canSubmit = name.trim().length > 0 && model.trim().length > 0 && String(year).trim().length > 0 && !saving;
  useEffect(() => {
    if (!open) return;
    setError("");
    const t = setTimeout(() => firstFieldRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    function onKeyDown(e) {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required.");
      return;
    }

    const yearNum =
      year.trim() === "" ? null : Number.parseInt(year.trim(), 10);
    if (yearNum !== null && Number.isNaN(yearNum)) {
      setError("Year must be a number.");
      return;
    }
    if (yearNum === null) {
      setError("Year is required.");
      return;
    }

    setSaving(true);
    const supabase = getBrowserSupabaseClient();

    const { data, error: insertError } = await supabase
      .from("machines")
      .insert({ name: trimmed, model: model.trim(), type: type,  year: yearNum, status })
      .select("*")
      .single();

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    if (typeof onInserted === "function" && data?.id) onInserted(data);
    setOpen(false);
    setName("");
    setYear("");
    setModel(""); // Reset manufacturer
    setType("Solid State"); // Reset to default
    setStatus("Operational");
  }

  return (
    <>
      <button
        type="button"
        className={styles.fab}
        onClick={() => setOpen(true)}
        aria-label="Add machine"
      >
        <span
          aria-hidden="true"
          style={{
            fontSize: "1.55rem",
            lineHeight: 1,
            textShadow:
              "0 0 14px rgba(34, 211, 238, 0.65), 0 0 30px rgba(34, 211, 238, 0.35)",
          }}
        >
          +
        </span>
      </button>

      {open ? (
        <>
          <div className={styles.backdrop} onClick={() => setOpen(false)} />
          <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby={titleId}>
            <div className={styles.panel}>
              <div className={styles.titleRow}>
                <h2 className={styles.title} id={titleId}>
                  Add Machine
                </h2>
                <button
                  type="button"
                  className={styles.close}
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                >
                  Close
                </button>
              </div>

              <form className={styles.form} onSubmit={onSubmit}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor={`${titleId}-name`}>
                    Name
                  </label>
                  <input
                    id={`${titleId}-name`}
                    ref={firstFieldRef}
                    className={styles.input}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Twilight Zone"
                    autoComplete="off"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor={`${titleId}-year`}>
                    Year
                  </label>
                  <input
                    id={`${titleId}-year`}
                    className={styles.input}
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="e.g. 1993"
                    type="number"
                    inputMode="numeric"
                    min={1930}
                    max={new Date().getFullYear() + 1}
                  />
                </div>

                {/* Model Field */}
<div className={styles.field}>
  <label className={styles.label} htmlFor={`${titleId}-model`}>Manufacturer</label>
  <input
    id={`${titleId}-model`}
    className={styles.input}
    value={model}
    onChange={(e) => setModel(e.target.value)}
    placeholder="e.g. Bally / Williams"
  />
</div>

{/* Type Field */}
<div className={styles.field}>
  <label className={styles.label} htmlFor={`${titleId}-type`}>Technology</label>
  <select
    id={`${titleId}-type`}
    className={styles.select}
    value={type}
    onChange={(e) => setType(e.target.value)}
  >
    <option value="Solid State">Solid State</option>
    <option value="Electro-Mechanical">Electro-Mechanical</option>
  </select>
</div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor={`${titleId}-status`}>
                    Status
                  </label>
                  <select
                    id={`${titleId}-status`}
                    className={styles.select}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {error ? <p className={styles.error}>{error}</p> : null}

                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.button}
                    onClick={() => setOpen(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`${styles.button} ${styles.primary}`}
                    disabled={!canSubmit}
                  >
                    {saving ? "Deploying..." : "Deploy to Floor"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}

