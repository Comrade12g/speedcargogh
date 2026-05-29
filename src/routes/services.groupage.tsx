import { createFileRoute } from "@tanstack/react-router";
import html from "../../public/services/groupage.html?raw";

export const Route = createFileRoute("/services/groupage")({
  server: {
    handlers: {
      GET: () => new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } }),
    },
  },
});
