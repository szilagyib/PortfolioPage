import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

/**
 * Astro emits no modulepreload hints for islands. The browser therefore
 * discovers the island's JS only once the inline hydration script runs, and
 * discovers that chunk's own imports one hop later again — three serial
 * round trips before React can render. On this site the body is empty until
 * then (Canvas is client:only), so those round trips are the blank screen.
 *
 * This walks the built HTML, reads the component-url / renderer-url off each
 * <astro-island>, follows their STATIC imports transitively, and injects a
 * modulepreload for the lot. The browser's preload scanner then starts every
 * fetch during HTML parse, in parallel with the stylesheet.
 *
 * Dynamic imports are deliberately not followed — those are the lazy chunks
 * (PuzzleHost, ArtifactCard) and preloading them would undo the split.
 */

/** `import{a}from"./x.js"` and bare `import"./x.js"` — static edges only. */
const STATIC_IMPORT = /(?:\bfrom|\bimport)\s*"(\.\/[^"]+)"/g;
const ISLAND_URLS = /<astro-island\b[^>]*?\b(?:component-url|renderer-url)="([^"]+)"[^>]*>/g;
const ISLAND_ATTR = /\b(?:component-url|renderer-url)="([^"]+)"/g;

/** Every module the given entries pull in eagerly, entries included. */
async function collectStaticGraph(distDir, entries) {
  const seen = new Set();
  const queue = [...entries];

  while (queue.length > 0) {
    const href = queue.pop();
    if (seen.has(href)) continue;
    seen.add(href);

    const file = path.join(distDir, href);
    let code;
    try {
      code = await readFile(file, 'utf8');
    } catch {
      // Not an emitted chunk (or already gone) — nothing to walk.
      continue;
    }

    for (const [, spec] of code.matchAll(STATIC_IMPORT)) {
      queue.push(path.posix.join(path.posix.dirname(href), spec));
    }
  }
  return seen;
}

function islandEntries(html) {
  const entries = new Set();
  for (const [tag] of html.matchAll(ISLAND_URLS)) {
    for (const [, url] of tag.matchAll(ISLAND_ATTR)) entries.add(url);
  }
  return entries;
}

export default function islandPreload() {
  return {
    name: 'island-preload',
    hooks: {
      'astro:build:done': async ({ dir, pages, logger }) => {
        const distDir = fileURLToPath(dir);

        for (const { pathname } of pages) {
          const htmlPath = path.join(distDir, pathname, 'index.html');
          let html;
          try {
            html = await readFile(htmlPath, 'utf8');
          } catch {
            continue;
          }

          const entries = islandEntries(html);
          if (entries.size === 0) continue;

          const graph = await collectStaticGraph(distDir, entries);
          const links = [...graph]
            .sort()
            .map((href) => `<link rel="modulepreload" href="${href}">`)
            .join('');

          await writeFile(htmlPath, html.replace('</head>', `${links}</head>`), 'utf8');
          logger.info(`/${pathname} — preloading ${graph.size} island chunk(s)`);
        }
      },
    },
  };
}
