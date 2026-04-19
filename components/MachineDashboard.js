"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import AddMachineFAB from "@/components/AddMachineFAB";
import EmptyFloorState from "@/components/EmptyFloorState";
import MachineCard from "@/components/MachineCard";
import StatsBar from "@/components/StatsBar";
import { getBrowserSupabaseClient } from "@/lib/supabase";

export default function MachineDashboard({ initialMachines }) {
  const [machines, setMachines] = useState(initialMachines ?? []);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    setMachines(initialMachines ?? []);
  }, [initialMachines]);

  const gridStyle = useMemo(
    () => ({
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
      gap: "1.25rem",
      maxWidth: "960px",
      margin: "0 auto",
      overflow: "visible",
    }),
    [],
  );

  useEffect(() => {
    const supabase = getBrowserSupabaseClient();

    const channel = supabase
      .channel("machines-table")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "machines" },
        (payload) => {
          const next = payload?.new;
          if (!next?.id) return;
          setMachines((prev) => {
            if (prev.some((m) => m.id === next.id)) return prev;
            return [next, ...prev];
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "machines" },
        (payload) => {
          const next = payload?.new;
          if (!next?.id) return;

          setMachines((prev) =>
            prev.map((m) => (m.id === next.id ? { ...m, ...next } : m)),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "machines" },
        (payload) => {
          const oldRow = payload?.old;
          if (!oldRow?.id) return;
          setMachines((prev) => prev.filter((m) => m.id !== oldRow.id));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  function onOptimisticStatusChange(id, nextStatus) {
    if (!id) return;
    setMachines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: nextStatus } : m)),
    );
  }

  function onInserted(row) {
    if (!row?.id) return;
    setMachines((prev) => {
      if (prev.some((m) => m.id === row.id)) return prev;
      return [row, ...prev];
    });
  }

  function onMachineDeleted(snapshot) {
    if (!snapshot?.id) return;
    setMachines((prev) => prev.filter((m) => m.id !== snapshot.id));
  }

  function onMachineDeleteFailed(snapshot) {
    if (!snapshot?.id) return;
    setMachines((prev) => {
      if (prev.some((m) => m.id === snapshot.id)) return prev;
      return [snapshot, ...prev];
    });
  }

  const filteredMachines = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (machines ?? []).filter((m) => {
      const nameOk =
        !q || String(m?.name ?? "").toLowerCase().includes(q);
      const statusOk =
        statusFilter === "All" ||
        String(m?.status ?? "").trim().toLowerCase() ===
          statusFilter.toLowerCase();
      return nameOk && statusOk;
    });
  }, [machines, search, statusFilter]);

  return (
    <>
      <StatsBar machines={machines} />
      <DashboardHeader
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {!machines?.length ? (
        <EmptyFloorState includeFab={false} />
      ) : !filteredMachines.length ? (
        <p style={{ textAlign: "center", color: "rgba(226, 232, 240, 0.65)" }}>
          No matching machines.
        </p>
      ) : (
        <div style={gridStyle}>
          {filteredMachines.map((row) => (
            <MachineCard
              key={row.id ?? `${row.name}-${row.status}`}
              id={row.id}
              name={row.name ?? "Untitled"}
              status={row.status}
              year={row.year ?? "—"}
              onStatusChange={onOptimisticStatusChange}
              onDeleted={onMachineDeleted}
              onDeleteFailed={onMachineDeleteFailed}
            />
          ))}
        </div>
      )}

      <AddMachineFAB onInserted={onInserted} />
    </>
  );
}

