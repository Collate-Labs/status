// Local preview server for the Collate Upptime status page.
//
// Renders a mocked Upptime layout (navbar / hero / summary / site cards / footer)
// against the real assets/theme.css and assets/collate-logo.png so you can iterate
// on the styling without running Sapper or hitting the GitHub API.
//
// Usage:  npm run dev
// Open:   http://localhost:3000

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { fileURLToPath } from "node:url";

const PORT = Number(process.env.PORT) || 3000;
const ASSETS_DIR = fileURLToPath(new URL("../assets/", import.meta.url));

const HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Collate Status</title>
  <meta name="description" content="Real-time uptime and incident history for Collate services.">
  <meta name="theme-color" content="#00c758">
  <link rel="icon" href="/collate-logo.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Lora:wght@500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/theme.css">
  <style>
    /* Layout-only helpers used by the preview shell. All visual styling
       comes from /theme.css so what you see here mirrors production. */
    .nav-inner { max-width: 760px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
    .brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
    .brand strong { font-family: var(--font-serif); font-size: 1.125rem; font-weight: 600; letter-spacing: -0.01em; color: var(--color-text); }
    .nav-links { display: flex; gap: 4px; }
    .site-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
    .site-meta { display: flex; justify-content: space-between; margin-top: 14px; color: var(--color-muted); font-size: 0.8125rem; font-family: var(--font-mono); }
    .pill { display: inline-flex; align-items: center; gap: 8px; }
  </style>
</head>
<body>
  <nav class="navbar">
    <div class="nav-inner">
      <a class="brand" href="/">
        <img src="/collate-logo.png" alt="Collate">
        <strong>Collate Status</strong>
      </a>
      <div class="nav-links">
        <a href="/">Status</a>
        <a href="https://www.collate.ch" target="_blank" rel="noopener noreferrer">Collate</a>
        <a href="https://github.com/Collate-Labs/status" target="_blank" rel="noopener noreferrer">GitHub</a>
      </div>
    </div>
  </nav>

  <main class="container">
    <section class="intro">
      <h1>Collate Status</h1>
      <p>Real-time uptime and incident history for Collate services.</p>
    </section>

    <section class="summary up">
      <span class="dot"></span>
      <h2>All systems operational</h2>
    </section>

    <ul class="sites" style="padding:0;list-style:none;margin:24px 0 0 0;">
      <li class="site up">
        <div class="site-row">
          <div>
            <h3>Collate Workspace</h3>
            <small class="url">https://collateworkspace.com</small>
          </div>
          <div class="pill">
            <span class="dot"></span>
            <span class="badge up">Operational</span>
          </div>
        </div>
        <div class="site-meta">
          <span>Response time &middot; 142 ms</span>
          <span>Uptime &middot; 100.00%</span>
        </div>
      </li>

      <li class="site up">
        <div class="site-row">
          <div>
            <h3>Collate API</h3>
            <small class="url">https://api.collatelabs.com/health</small>
          </div>
          <div class="pill">
            <span class="dot"></span>
            <span class="badge up">Operational</span>
          </div>
        </div>
        <div class="site-meta">
          <span>Response time &middot; 168 ms</span>
          <span>Uptime &middot; 100.00%</span>
        </div>
      </li>

      <li class="site up">
        <div class="site-row">
          <div>
            <h3>Collate Auth</h3>
            <small class="url">https://auth.collatelabs.com/health</small>
          </div>
          <div class="pill">
            <span class="dot"></span>
            <span class="badge up">Operational</span>
          </div>
        </div>
        <div class="site-meta">
          <span>Response time &middot; 124 ms</span>
          <span>Uptime &middot; 100.00%</span>
        </div>
      </li>
    </ul>
  </main>

  <footer>
    <p>Powered by Upptime &middot; <a href="https://github.com/Collate-Labs/status" target="_blank" rel="noopener noreferrer">View on GitHub</a></p>
  </footer>
</body>
</html>
`;

const MIME = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function sendNotFound(res, what) {
  res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
  res.end(`404: ${what}\n`);
}

const server = createServer(async (req, res) => {
  const url = (req.url || "/").split("?")[0];

  if (url === "/" || url === "/index.html") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    res.end(HTML);
    return;
  }

  // Only allow simple, sandboxed paths under assets/
  const safe = url.replace(/^\/+/, "");
  if (safe.includes("..") || safe.includes("\0")) {
    return sendNotFound(res, url);
  }

  try {
    const data = await readFile(ASSETS_DIR + safe);
    const mime = MIME[extname(safe)] || "application/octet-stream";
    res.writeHead(200, { "content-type": mime, "cache-control": "no-store" });
    res.end(data);
  } catch {
    sendNotFound(res, url);
  }
});

server.listen(PORT, () => {
  console.log("");
  console.log(`  Collate Status — local preview`);
  console.log(`  http://localhost:${PORT}`);
  console.log("");
  console.log(`  Edit assets/theme.css and refresh the page to see changes.`);
  console.log(`  Press Ctrl+C to stop.`);
  console.log("");
});
