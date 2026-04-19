import EmptyFloorState from "@/components/EmptyFloorState";
import MachineDashboard from "@/components/MachineDashboard";
import { createSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createSupabaseClient();
  const { data: machines, error } = await supabase.from("machines").select("*");
  const list = machines ?? [];
  const isEmpty = !error && list.length === 0;

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "2.5rem 1.5rem",
        fontFamily: "system-ui, sans-serif",
        background:
          "radial-gradient(ellipse 120% 80% at 50% -20%, rgba(34, 211, 238, 0.12), transparent 55%), linear-gradient(165deg, #0b0f14 0%, #12161f 45%, #0d1018 100%)",
      }}
    >
      <h1
        style={{
          margin: "0 0 1.75rem",
          fontSize: "1.75rem",
          fontWeight: 700,
          color: "rgba(248, 250, 252, 0.95)",
          textAlign: "center",
          letterSpacing: "-0.02em",
        }}
      >
        Machines
      </h1>

      {error ? (
        <p
          style={{
            textAlign: "center",
            color: "#fca5a5",
            maxWidth: "36rem",
            margin: "0 auto",
          }}
        >
          Could not load machines: {error.message}
        </p>
      ) : isEmpty ? (
        <EmptyFloorState />
      ) : (
        <MachineDashboard initialMachines={list} />
      )}
    </main>
  );
}
