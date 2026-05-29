import { createFileRoute } from "@tanstack/react-router";
import html from "../../public/services/sea-freight.html?raw";

export const Route = createFileRoute("/services/sea-freight")({
  server: {
    handlers: {
      GET: () => new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } }),
    },
  },
});
