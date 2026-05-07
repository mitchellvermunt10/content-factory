import { test, expect } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";

const OUT_DIR = path.resolve("tests/mp4-proof");

/**
 * Genereert een echte campagne via de UI in mock-mode en bewaart het reel-9x16
 * export-script op een vaste locatie zodat de bash runner het kan uitvoeren.
 *
 * Run:  npx playwright test tests/e2e/mp4-proof.spec.ts
 */
test("MP4 proof — download reel 9:16 export script", async ({ page }, info) => {
  info.setTimeout(60_000);

  fs.mkdirSync(OUT_DIR, { recursive: true });

  // 1. Genereer een campagne met deterministische naam.
  await page.goto("/studio/nieuw");
  await page.getByTestId("business-type-trigger").click();
  await page.getByRole("option", { name: /Beautysalon/i }).click();
  await page.getByTestId("brief-name").fill("Atelier Nord");
  await page.getByTestId("brief-city").fill("Amsterdam");
  await page.getByTestId("wizard-next").click();
  await page.getByTestId("tone-luxueus").click();
  await page.getByTestId("wizard-next").click();
  await page
    .getByTestId("brief-audience")
    .fill(
      "Vrouwen 30-55 in Amsterdam-Zuid die een persoonlijke beautyervaring zoeken zonder haast."
    );
  await page.getByTestId("brief-usp-0").fill("Persoonlijke aanpak");
  await page.getByTestId("brief-usp-1").fill("Premium producten");
  await page.getByTestId("brief-usp-2").fill("Stille ruimte");
  await page.getByTestId("wizard-next").click();
  await page.getByTestId("wizard-submit").click();

  // 2. Wacht op campagne-pagina.
  await page.waitForURL(/\/studio\/campaigns\/[\w-]+/, { timeout: 30_000 });
  await expect(
    page.getByRole("heading", { name: "Atelier Nord", exact: true })
  ).toBeVisible();

  // 3. Naar Video productie → Assembly tab.
  await page.getByRole("tab", { name: "Video productie", exact: true }).click();
  await page.getByRole("tab", { name: "Assembly", exact: true }).click();
  await expect(page.getByTestId("assembly-tab")).toBeVisible();

  // 4. Download het 9:16 reel script.
  const dlPromise = page.waitForEvent("download", { timeout: 8_000 });
  await page.getByTestId("assembly-download-reel-9x16").click();
  const dl = await dlPromise;
  const target = path.join(OUT_DIR, "atelier-nord-export-reel-9x16.sh");
  await dl.saveAs(target);

  // 5. Sanity check.
  const content = fs.readFileSync(target, "utf8");
  expect(content).toContain("#!/usr/bin/env bash");
  expect(content).toContain("ffmpeg");
  expect(content).toContain("scale=1080:1920");
  expect(content).toContain("file 'clips/s01-s01-a.mp4'");

  console.log(`Script bewaard op: ${target} (${content.length} bytes)`);
});
