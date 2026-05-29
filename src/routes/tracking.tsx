import { createFileRoute } from "@tanstack/react-router";
import html from "../../public/tracking.html?raw";

export const Route = createFileRoute("/tracking")({
  server: {
    handlers: {
      GET: () =>
        new Response(html, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }),
    },
  },
});
