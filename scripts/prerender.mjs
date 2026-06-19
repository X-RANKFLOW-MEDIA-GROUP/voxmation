// Static prerender: render every indexable route to dist/<route>/index.html so
// crawlers receive real HTML + per-page <head> (title, meta, JSON-LD) instead of
// an empty SPA shell. Run after `vite build` (client) and the SSR build.
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist");
const ssrEntry = path.join(root, "dist-ssr", "entry-server.js");

// Tags the per-page <head> (via react-helmet) is responsible for. Strip the
// static defaults from the template so prerendered pages have no duplicates.
function stripManagedHead(html) {
  return html
    .replace(/\s*<title>[\s\S]*?<\/title>/i, "")
    .replace(
      /\s*<meta\s+(?:name="(?:description|keywords|robots|googlebot|bingbot|author|publisher)"|property="og:[^"]*"|name="twitter:[^"]*")[^>]*>/gi,
      ""
    )
    .replace(/\s*<link\s+rel="canonical"[^>]*>/gi, "");
}

async function main() {
  const { render, prerenderUrls } = await import(pathToFileURL(ssrEntry).href);
  const template = await fs.readFile(path.join(distDir, "index.html"), "utf8");
  const baseTemplate = stripManagedHead(template);

  let ok = 0;
  let skipped = 0;
  const skippedUrls = [];

  for (const url of prerenderUrls) {
    let rendered;
    try {
      rendered = render(url);
    } catch (err) {
      skipped++;
      skippedUrls.push(`${url} (render error: ${err.message})`);
      continue;
    }

    const { html, helmet } = rendered;
    // Empty/near-empty output means a 404 or redirect was hit -> let it fall
    // back to the SPA shell instead of writing a misleading static page.
    if (!html || html.length < 500) {
      skipped++;
      skippedUrls.push(`${url} (empty render)`);
      continue;
    }

    const headTags = helmet
      ? [
          helmet.title?.toString() ?? "",
          helmet.meta?.toString() ?? "",
          helmet.link?.toString() ?? "",
          helmet.script?.toString() ?? "",
        ].join("\n    ")
      : "";

    const page = baseTemplate
      .replace("</head>", `    ${headTags}\n  </head>`)
      .replace('<div id="root"></div>', `<div id="root">${html}</div>`);

    const outPath =
      url === "/"
        ? path.join(distDir, "index.html")
        : path.join(distDir, url, "index.html");
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, page, "utf8");
    ok++;
  }

  console.log(`\nPrerender complete: ${ok} pages written, ${skipped} skipped.`);
  if (skippedUrls.length) console.log("Skipped:\n  " + skippedUrls.join("\n  "));
}

main().catch((err) => {
  console.error("Prerender failed:", err);
  process.exit(1);
});
