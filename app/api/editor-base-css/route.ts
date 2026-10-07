import { initialPageDocument } from "@/lib/page-seed";

export function GET() {
  return new Response(`${initialPageDocument.baseCss}\nhtml body { background-color: var(--bg); }`, {
    headers: { "Content-Type": "text/css; charset=utf-8" },
  });
}
