import { createFileRoute } from "@tanstack/react-router";
import html from "../../public/index.html?raw";

export const Route = createFileRoute("/")({
  server: {
    handlers: {
      GET: () =>
        new Response(html, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }),
    },
  },
});
