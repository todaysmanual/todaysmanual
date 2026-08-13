import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const debugPort = process.env.CHROME_DEBUG_PORT || "9222";
const outputDir = path.resolve(process.argv[2] || "tmp/pdfs/screenshots");
const baseUrl = process.env.SITE_URL || "http://localhost:3000";

await mkdir(outputDir, { recursive: true });

const targets = await fetch(`http://127.0.0.1:${debugPort}/json`).then((response) => response.json());
const pageTarget = targets.find((target) => target.type === "page");
if (!pageTarget?.webSocketDebuggerUrl) throw new Error("No Chrome page target is available.");

const socket = new WebSocket(pageTarget.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let sequence = 0;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (!message.id) return;
  const request = pending.get(message.id);
  if (!request) return;
  pending.delete(message.id);
  if (message.error) request.reject(new Error(message.error.message));
  else request.resolve(message.result);
});

function send(method, params = {}) {
  const id = ++sequence;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

const wait = (duration) => new Promise((resolve) => setTimeout(resolve, duration));

await send("Page.enable");
await send("Runtime.enable");

let currentViewport = { width: 1440, height: 1000 };

async function setViewport(width, height, mobile = false) {
  currentViewport = { width, height };
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
    screenWidth: width,
    screenHeight: height,
  });
  await send("Emulation.setTouchEmulationEnabled", { enabled: mobile, maxTouchPoints: mobile ? 5 : 1 });
}

async function navigate(route) {
  await send("Page.navigate", { url: `${baseUrl}${route}` });
  await wait(900);
  await send("Runtime.evaluate", {
    expression: `Promise.all([
      document.fonts ? document.fonts.ready : Promise.resolve(),
      ...Array.from(document.images).map((image) => image.complete
        ? Promise.resolve()
        : new Promise((resolve) => { image.addEventListener('load', resolve, {once:true}); image.addEventListener('error', resolve, {once:true}); }))
    ])`,
    awaitPromise: true,
    returnByValue: true,
  });
  await wait(250);
  await send("Runtime.evaluate", { expression: "window.scrollTo(0, 0)" });
}

async function capture(filename, { fullPage = true } = {}) {
  let clip;
  if (fullPage) {
    const metrics = await send("Page.getLayoutMetrics");
    const size = metrics.cssContentSize || metrics.contentSize;
    clip = { x: 0, y: 0, width: Math.ceil(size.width), height: Math.ceil(size.height), scale: 1 };
  } else {
    clip = { x: 0, y: 0, width: currentViewport.width, height: currentViewport.height, scale: 1 };
  }
  const result = await send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: true,
    ...(clip ? { clip } : {}),
  });
  await writeFile(path.join(outputDir, filename), Buffer.from(result.data, "base64"));
  process.stdout.write(`${filename}\n`);
}

const categoryRoutes = ["work", "money", "skills", "life", "opportunity"];
const articleRoutes = [
  "what-happens-after-university",
  "salary-is-not-net-worth",
  "skills-that-will-pay-in-2030",
  "five-things-about-your-first-job",
  "your-first-1000-ghs",
  "high-income-skills-six-months",
  "corporate-phrases-explained",
  "why-side-hustles-do-not-make-money",
];

await setViewport(1440, 1000, false);
await navigate("/");
await capture("home-desktop-full.png");

await send("Runtime.evaluate", { expression: `document.querySelector('button[aria-label="Open search"]')?.click()` });
await wait(400);
await capture("search-overlay-desktop.png", { fullPage: false });

for (const category of categoryRoutes) {
  await navigate(`/${category}`);
  await capture(`category-${category}.png`);
}

for (const article of articleRoutes) {
  await navigate(`/article/${article}`);
  await capture(`article-${article}.png`);
}

await navigate("/article/replace-this-placeholder");
await capture("article-placeholder-template.png");

await setViewport(390, 844, true);
await navigate("/");
await capture("home-mobile-full.png");

await navigate("/");
await send("Runtime.evaluate", { expression: `document.querySelector('button[aria-label="Open menu"]')?.click()` });
await wait(400);
await capture("mobile-menu.png", { fullPage: false });

socket.close();
