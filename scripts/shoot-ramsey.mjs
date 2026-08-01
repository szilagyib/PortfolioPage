/**
 * Drives the running RAMSey stack and captures portfolio preview shots.
 * Flow mirrors e2e/import-example.spec.ts so it uses the real UI, not fixtures.
 *
 * Lives outside the RAMSey repo (nothing to clean up there), so Playwright is
 * resolved explicitly out of RAMSey's node_modules rather than by bare import.
 *
 *   node <this file> <ramseyRoot> <baseURL> <outDir>
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2] ?? 'C:/Users/szilagyi.borbala/Desktop/Adm/RAMSey';
const BASE = process.argv[3] ?? 'http://localhost:8080';
const OUT = process.argv[4] ?? 'shots';
mkdirSync(OUT, { recursive: true });

/* require, not dynamic import: @playwright/test is CJS, so an import()
   namespace buries the exports under .default. */
const require = createRequire(path.join(ROOT, 'package.json'));
const { chromium } = require('@playwright/test');

const example = (name) => path.join(ROOT, 'examples', name);

/* 1280 wide to match the existing previews; deviceScaleFactor 2 so the
   downscale to card size stays crisp. */
const VIEWPORT = { width: 1280, height: 720 };

async function createDiagram(page, name, typeLabel) {
  await page.getByRole('button', { name: 'New Diagram' }).first().click();
  await page.getByPlaceholder('e.g. Pump System Reliability').fill(name);
  if (typeLabel) {
    await page.locator('select').first().selectOption({ label: typeLabel });
  }
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await page.waitForURL(/\/projects\/.+\/diagrams\/.+/);
  await page.locator('.react-flow').waitFor({ state: 'visible' });
}

async function importJson(page, file) {
  await page.getByRole('button', { name: 'File' }).click();
  await page.getByText('Import JSON...').click();
  await page.locator('input[type="file"]').setInputFiles(file);
  await page.waitForTimeout(1500);
}

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: VIEWPORT,
  deviceScaleFactor: 2,
  colorScheme: 'dark',
});

/* The app keeps its own theme in localStorage and ignores the OS preference
   after first run, so colorScheme alone leaves it light. Seeding the key
   before any script runs avoids a visible light->dark flip mid-capture. */
await context.addInitScript(() => {
  window.localStorage.setItem('ramsey-theme', 'dark');
});

const page = await context.newPage();
page.on('console', (m) => {
  if (m.type() === 'error') console.log('  [page error]', m.text().slice(0, 160));
});

try {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  console.log('landed:', page.url(), '|', await page.title());

  await createDiagram(page, 'Cooling water loss', 'Fault Tree');
  console.log('diagram created:', page.url());

  await importJson(page, example('fault-tree-cooling-loss.json'));
  await page.waitForTimeout(900);

  /* Run the solver so the right rail shows minimal cut sets instead of the
     "select a node" empty state — cut sets are named in the portfolio copy
     and nothing in the current screenshot evidences them. */
  const sidebar = page.locator('aside').last();
  await page.getByRole('button', { name: 'Analysis', exact: true }).first().click();
  await page.getByText('Run Analysis...').click();
  await sidebar.getByRole('button', { name: 'Run analysis' }).click();
  await page.waitForTimeout(2500);
  console.log('analysis panel:', (await sidebar.innerText()).slice(0, 120).replace(/\n/g, ' | '));

  await page.screenshot({ path: `${OUT}/ramsey-fault-tree.png` });
  console.log('shot: ramsey-fault-tree.png');

  /* Same tree, cut-set solver. Two candidates so she can pick which claim the
     card should evidence: the probability result or the cut sets. */
  await sidebar.locator('select').first().selectOption({ label: 'Minimal cut sets' });
  await sidebar.getByRole('button', { name: 'Run analysis' }).click();
  await page.waitForTimeout(2500);
  console.log('cut sets:', (await sidebar.innerText()).slice(0, 160).replace(/\n/g, ' | '));
  await page.screenshot({ path: `${OUT}/ramsey-cut-sets.png` });
  console.log('shot: ramsey-cut-sets.png');
} catch (err) {
  console.error('FAILED:', err.message.split('\n')[0]);
  await page.screenshot({ path: `${OUT}/failure-state.png` }).catch(() => {});
  console.error('wrote failure-state.png for diagnosis');
} finally {
  await browser.close();
}
