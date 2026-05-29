import { createFileRoute } from "@tanstack/react-router";
import html from "../../public/careers.html?raw";

export const Route = createFileRoute("/careers")({
  server: {
    handlers: {
      GET: () =>
        new Response(html, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }),
    },
  },
});
