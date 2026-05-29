import { createFileRoute } from "@tanstack/react-router";
import html from "../../public/about.html?raw";

export const Route = createFileRoute("/about")({
  server: {
    handlers: {
      GET: () =>
        new Response(html, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }),
    },
  },
});
