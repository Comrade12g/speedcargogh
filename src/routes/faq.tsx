import { createFileRoute } from "@tanstack/react-router";
import html from "../../public/faq.html?raw";

export const Route = createFileRoute("/faq")({
  server: {
    handlers: {
      GET: () => new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } }),
    },
  },
});
