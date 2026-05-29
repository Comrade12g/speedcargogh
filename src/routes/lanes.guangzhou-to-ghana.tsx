import { createFileRoute } from "@tanstack/react-router";
import html from "../../public/lanes/guangzhou-to-ghana.html?raw";

export const Route = createFileRoute("/lanes/guangzhou-to-ghana")({
  server: {
    handlers: {
      GET: () => new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } }),
    },
  },
});
