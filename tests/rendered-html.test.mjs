import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Today's Manual coming-soon page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Today(?:'|&#x27;)s Manual — Coming Soon/);
  assert.match(html, /COMING/);
  assert.match(html, /SOON/);
  assert.match(html, /A modern guide for a generation finding its way/);
  assert.match(html, /todaysmanual@gmail\.com/);
  assert.match(html, /href="\/todaysmanuallogo\.png"/);
  assert.match(html, /src="\/todaysmanual1\.png"/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("includes responsive, accessible, motion-aware production styling", async () => {
  const [css, packageJson] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /@media \(max-width:\s*760px\)/);
  assert.match(css, /@media \(max-width:\s*380px\)/);
  assert.match(css, /overflow-x:\s*hidden/);
  assert.match(packageJson, /"framer-motion"/);

  await Promise.all([
    access(new URL("../public/todaysmanuallogo.png", import.meta.url)),
    access(new URL("../public/todaysmanual1.png", import.meta.url)),
  ]);
});
