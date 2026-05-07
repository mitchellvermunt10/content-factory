import { test, expect } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * End-to-end test van de Render Agent in mock-mode.
 *
 * Test:
 *   - Maak een campagne via wizard
 *   - Open Video productie → Pipeline (waar render queue zit)
 *   - Klik "Render via API" op shot s01-a
 *   - Polling: status loopt van rendering → ready
 *   - "API mock" badge zichtbaar
 *   - "→ clips/" download knop verschijnt
 *   - Klik download → bestand verschijnt op disk in real-assets/
 */
test("Render Agent — mock-mode end-to-end", async ({ page }, info) => {
  info.setTimeout(90_000);

  // Pas op: deze test schrijft naar real-assets/test-render/clips/.
  // Cleanup vooraf zodat we de write kunnen verifiëren.
  const expectedDir = path.resolve("real-assets/test-render/clips");
  fs.rmSync(path.resolve("real-assets/test-render"), {
    recursive: true,
    force: true,
  });

  // 1. Maak campagne via wizard met deterministische naam.
  await page.goto("/studio/nieuw");
  await page.getByTestId("business-type-trigger").click();
  await page.getByRole("option", { name: /Beautysalon/i }).click();
  await page.getByTestId("brief-name").fill("Test Render");
  await page.getByTestId("brief-city").fill("Amsterdam");
  await page.getByTestId("wizard-next").click();
  await page.getByTestId("tone-luxueus").click();
  await page.getByTestId("wizard-next").click();
  await page
    .getByTestId("brief-audience")
    .fill(
      "Test doelgroep voor de render-agent: vrouwen in Amsterdam die schoonheid als ritueel zien."
    );
  await page.getByTestId("brief-usp-0").fill("USP een");
  await page.getByTestId("brief-usp-1").fill("USP twee");
  await page.getByTestId("brief-usp-2").fill("USP drie");
  await page.getByTestId("wizard-next").click();
  await page.getByTestId("wizard-submit").click();
  await page.waitForURL(/\/studio\/campaigns\/[\w-]+/, { timeout: 30_000 });

  // 2. Naar Video productie → Pipeline tab.
  await page.getByRole("tab", { name: "Video productie", exact: true }).click();
  await page.getByRole("tab", { name: "Pipeline", exact: true }).click();
  await expect(page.getByText(/Render queue/i)).toBeVisible();

  // 3. Vind een job die nog "queued" is en klik "Render via API".
  // Mock-mode bouwt initieel sommige jobs als ready/rendering — pak de eerste
  // queued job die zichtbaar is (via testid pattern: render-job-{shotId}-api).
  const apiButtons = page.locator('[data-testid$="-api"]');
  await expect(apiButtons.first()).toBeVisible({ timeout: 5_000 });
  // Lees uit het eerste button-attribute welke shot we triggeren.
  const firstShotTestId = await apiButtons
    .first()
    .getAttribute("data-testid");
  expect(firstShotTestId).toBeTruthy();
  // testid heeft vorm: render-job-<shotId>-api
  const m = firstShotTestId!.match(/^render-job-(.+)-api$/);
  expect(m).toBeTruthy();
  const shotId = m![1];

  await apiButtons.first().click();

  // 4. Wacht tot mock provider klaar is (poll interval 2s × 3 polls = ~6s).
  // Verwacht: API mock badge zichtbaar.
  await expect(
    page.locator(`[data-testid="render-job-${shotId}"] >> text=API mock`)
  ).toBeVisible({ timeout: 10_000 });

  // 5. Wacht tot download knop verschijnt (status === ready).
  const downloadBtn = page.locator(
    `[data-testid="render-job-${shotId}-download"]`
  );
  await expect(downloadBtn).toBeVisible({ timeout: 30_000 });

  // 6. Klik download — clip moet op disk landen.
  await downloadBtn.click();

  // Wacht op de "Opgeslagen" badge (savedToPath gevuld).
  await expect(
    page.locator(`[data-testid="render-job-${shotId}"] >> text=Opgeslagen`)
  ).toBeVisible({ timeout: 15_000 });

  // 7. Verifieer dat het echte bestand op disk staat.
  const clipPath = path.join(expectedDir, `${shotId}.mp4`);
  expect(fs.existsSync(clipPath)).toBe(true);
  const stat = fs.statSync(clipPath);
  // Real ffmpeg-static rendert > 1KB; pure placeholder zou 1 byte zijn.
  expect(stat.size).toBeGreaterThan(1024);
});
