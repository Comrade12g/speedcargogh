import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Sign in | Speed Cargo" }, { name: "robots", content: "noindex" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate({ to: "/admin" });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        color: "#fff",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: "100%",
          maxWidth: 380,
          padding: 32,
          background: "#141414",
          borderRadius: 12,
          border: "1px solid #262626",
        }}
      >
        <h1 style={{ marginTop: 0, fontSize: 22 }}>Speed Cargo Admin</h1>
        <p style={{ color: "#a3a3a3", fontSize: 14, marginBottom: 24 }}>
          Sign in to manage site content.
        </p>
        <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          autoComplete="email"
          style={{
            width: "100%",
            padding: "10px 12px",
            marginBottom: 16,
            background: "#0a0a0a",
            border: "1px solid #333",
            borderRadius: 8,
            color: "#fff",
          }}
        />
        <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
          autoComplete="current-password"
          style={{
            width: "100%",
            padding: "10px 12px",
            marginBottom: 16,
            background: "#0a0a0a",
            border: "1px solid #333",
            borderRadius: 8,
            color: "#fff",
          }}
        />
        {error && <p style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            background: "#f97316",
            color: "#000",
            border: 0,
            borderRadius: 8,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
