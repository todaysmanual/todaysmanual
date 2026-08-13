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

test("server-renders the complete Today's Manual editorial homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Nobody Told Us/);
  assert.match(html, /After University/);
  assert.match(html, /Where are you/);
  assert.match(html, /The five manuals/i);
  assert.match(html, /The Morning Manual/);
  assert.match(html, /Made in Africa/);
  assert.match(html, /href="https:\/\/todaysmanual\.com\/todaysmanuallogo\.png"/);
  assert.match(html, /src="\/todaysmanual1\.png"/);
  assert.doesNotMatch(html, /COMING SOON|codex-preview|Your site is taking shape/);
});

test("includes responsive, accessible, motion-aware production styling", async () => {
  const [css, packageJson] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /@media \(max-width:\s*640px\)/);
  assert.match(css, /@media \(max-width:\s*380px\)/);
  assert.match(css, /overflow-x:\s*hidden/);
  assert.match(css, /\.search-overlay/);
  assert.match(packageJson, /"next"/);

  await Promise.all([
    access(new URL("../public/todaysmanuallogo.png", import.meta.url)),
    access(new URL("../public/todaysmanual1.png", import.meta.url)),
    access(new URL("../public/og.png", import.meta.url)),
    access(new URL("../public/editorial/student.jpg", import.meta.url)),
  ]);
});
