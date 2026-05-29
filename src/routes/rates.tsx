import { createFileRoute } from "@tanstack/react-router";
import html from "../../public/rates.html?raw";

export const Route = createFileRoute("/rates")({
  server: {
    handlers: {
      GET: () =>
        new Response(html, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }),
    },
  },
});
