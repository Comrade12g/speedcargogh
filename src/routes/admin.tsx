import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin | Speed Cargo" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<"checking" | "ok" | "denied">("checking");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) navigate({ to: "/login" });
        return;
      }
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        setState("denied");
        return;
      }
      setState("ok");
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (state === "checking") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#0a0a0a",
          color: "#fff",
          fontFamily: "system-ui",
        }}
      >
        Checking access…
      </div>
    );
  }
  if (state === "denied") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#0a0a0a",
          color: "#fff",
          fontFamily: "system-ui",
          textAlign: "center",
          padding: 24,
        }}
      >
        <div>
          <h1>Access denied</h1>
          <p style={{ color: "#a3a3a3" }}>Your account doesn't have admin access.</p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/login" });
            }}
            style={{
              marginTop: 16,
              padding: "10px 18px",
              background: "#f97316",
              color: "#000",
              border: 0,
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <iframe
        src="/admin-app/index.html"
        title="Speed Cargo Admin"
        style={{ width: "100%", height: "100%", border: 0 }}
      />
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          navigate({ to: "/login" });
        }}
        style={{
          position: "fixed",
          top: 12,
          right: 12,
          padding: "6px 12px",
          background: "#0a0a0a",
          color: "#fff",
          border: "1px solid #333",
          borderRadius: 6,
          fontSize: 12,
          cursor: "pointer",
          zIndex: 10,
        }}
      >
        Sign out
      </button>
    </div>
  );
}
