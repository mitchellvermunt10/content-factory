import { test, expect } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";

const OUT_DIR = path.resolve("tests/showcase");

/**
 * Genereert de Maison Lumière showcase campagne via de UI in mock-mode en
 * exporteert (a) het 9:16 reel-script en (b) het volledige campaign JSON
 * naar tests/showcase/ voor verdere verwerking door run-showcase.sh.
 */
test("Maison Lumière showcase — download script + campaign JSON", async ({
  page,
}, info) => {
  info.setTimeout(60_000);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // 1. Wizard
  await page.goto("/studio/nieuw");
  await page.getByTestId("business-type-trigger").click();
  await page.getByRole("option", { name: /Beautysalon/i }).click();
  await page.getByTestId("brief-name").fill("Maison Lumière");
  await page.getByTestId("brief-city").fill("Amsterdam");
  await page.getByTestId("wizard-next").click();
  await page.getByTestId("tone-luxueus").click();
  await page.getByTestId("wizard-next").click();
  await page
    .getByTestId("brief-audience")
    .fill(
      "Vrouwen 30-50 in Amsterdam-Zuid en omliggende premium-buurten, design-bewust, willen schoonheid als ritueel ervaren — niet als snelle service. Tweede ring: cadeaubon-doelgroep 35-55."
    );
  await page.getByTestId("brief-usp-0").fill("Op afspraak, één klant tegelijk");
  await page
    .getByTestId("brief-usp-1")
    .fill("Stille ruimte, geen achtergrondmuziek, telefoon op stil");
  await page
    .getByTestId("brief-usp-2")
    .fill("Een vast gezicht voor élk bezoek — geen wisselende handen");
  await page.getByTestId("wizard-next").click();
  await page.getByTestId("wizard-submit").click();

  await page.waitForURL(/\/studio\/campaigns\/[\w-]+/, { timeout: 30_000 });
  await expect(
    page.getByRole("heading", { name: "Maison Lumière", exact: true })
  ).toBeVisible();

  // 2. Export full campaign JSON
  const dlJsonPromise = page.waitForEvent("download", { timeout: 8_000 });
  await page.getByTestId("export-json").click();
  const dlJson = await dlJsonPromise;
  await dlJson.saveAs(path.join(OUT_DIR, "maison-lumiere-campaign.json"));

  // 3. Naar Video productie → Assembly tab
  await page.getByRole("tab", { name: "Video productie", exact: true }).click();
  await page.getByRole("tab", { name: "Assembly", exact: true }).click();
  await expect(page.getByTestId("assembly-tab")).toBeVisible();

  // 4. Download het 9:16 reel script
  const dlSh = page.waitForEvent("download", { timeout: 8_000 });
  await page.getByTestId("assembly-download-reel-9x16").click();
  const sh = await dlSh;
  const target = path.join(
    OUT_DIR,
    "maison-lumiere-export-reel-9x16.sh"
  );
  await sh.saveAs(target);

  // 5. Sanity check — script bevat correcte filename + 9:16 specs
  const content = fs.readFileSync(target, "utf8");
  expect(content).toContain("Maison Lumière");
  expect(content).toContain("scale=1080:1920");
  expect(content).toContain("file 'clips/s01-s01-a.mp4'");
  expect(content).toContain("file 'clips/s04-s04-a.mp4'");

  console.log(
    `Showcase artefacten bewaard:\n  ${target}\n  ${path.join(OUT_DIR, "maison-lumiere-campaign.json")}`
  );
});
