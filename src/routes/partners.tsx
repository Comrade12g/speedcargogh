import { createFileRoute } from "@tanstack/react-router";
import html from "../../public/partners.html?raw";

export const Route = createFileRoute("/partners")({
  server: {
    handlers: {
      GET: () =>
        new Response(html, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }),
    },
  },
});
