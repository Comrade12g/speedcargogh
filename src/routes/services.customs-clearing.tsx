import { createFileRoute } from "@tanstack/react-router";
import html from "../../public/services/customs-clearing.html?raw";

export const Route = createFileRoute("/services/customs-clearing")({
  server: {
    handlers: {
      GET: () => new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } }),
    },
  },
});
