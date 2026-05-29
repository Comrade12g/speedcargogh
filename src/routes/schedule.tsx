import { createFileRoute } from "@tanstack/react-router";
import html from "../../public/schedule.html?raw";

export const Route = createFileRoute("/schedule")({
  server: {
    handlers: {
      GET: () =>
        new Response(html, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }),
    },
  },
});
