import { createFileRoute } from "@tanstack/react-router";
import html from "../../public/blog.html?raw";

export const Route = createFileRoute("/blog")({
  server: {
    handlers: {
      GET: () =>
        new Response(html, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }),
    },
  },
});
