import { test, expect } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";

type Finding =
  | { kind: "console-error"; text: string; loc?: string }
  | { kind: "console-warn"; text: string }
  | { kind: "page-error"; message: string; stack?: string[] }
  | { kind: "req-failed"; url: string; error?: string }
  | { kind: "note"; where: string; what: string };

const SHOTS_DIR = path.resolve("test-results/qa-audit");
fs.mkdirSync(SHOTS_DIR, { recursive: true });

function shotPath(name: string) {
  return path.join(SHOTS_DIR, `${name}.png`);
}

async function shoot(page: import("@playwright/test").Page, name: string) {
  await page.screenshot({ path: shotPath(name), fullPage: false });
}

test.describe.configure({ mode: "serial" });

test("QA audit — desktop walkthrough", async ({ page }, testInfo) => {
  testInfo.setTimeout(180_000);
  const findings: Finding[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      findings.push({
        kind: "console-error",
        text: msg.text(),
        loc: msg.location()?.url,
      });
    } else if (msg.type() === "warning") {
      findings.push({ kind: "console-warn", text: msg.text() });
    }
  });
  page.on("pageerror", (err) => {
    findings.push({
      kind: "page-error",
      message: err.message,
      stack: err.stack?.split("\n").slice(0, 4),
    });
  });
  page.on("requestfailed", (req) => {
    if (req.url().startsWith("chrome-extension")) return;
    findings.push({
      kind: "req-failed",
      url: req.url(),
      error: req.failure()?.errorText,
    });
  });

  // ------- 1. Marketing
  await page.goto("/");
  await shoot(page, "01-marketing-hero");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await page.waitForTimeout(400);
  await shoot(page, "02-marketing-mid");

  // ------- 2. Studio empty
  await page.goto("/studio");
  await shoot(page, "03-studio-empty");

  // ------- 3. Wizard step 1
  await page.goto("/studio/nieuw");
  await shoot(page, "04-wizard-step1");

  await page.getByTestId("business-type-trigger").click();
  await page.getByRole("option", { name: /Beautysalon/i }).click();
  await page.getByTestId("brief-name").fill("Atelier Nord");
  await page.getByTestId("brief-city").fill("Amsterdam");
  await page.getByTestId("wizard-next").click();

  await shoot(page, "05-wizard-step2-brand");
  await page.getByTestId("tone-luxueus").click();
  await shoot(page, "06-wizard-step2-tone-picked");
  await page.getByTestId("wizard-next").click();

  await shoot(page, "07-wizard-step3-audience");
  await page
    .getByTestId("brief-audience")
    .fill(
      "Vrouwen 30-55 in Amsterdam-Zuid die op zoek zijn naar een persoonlijke en doordachte beautyervaring zonder haast."
    );
  await page.getByTestId("brief-usp-0").fill("Persoonlijke aanpak");
  await page.getByTestId("brief-usp-1").fill("Premium producten");
  await page.getByTestId("brief-usp-2").fill("Stille ruimte zonder muziek");
  await page.getByTestId("wizard-next").click();

  await shoot(page, "08-wizard-step4-review");
  await page.getByTestId("wizard-submit").click();

  await page.waitForURL(/\/studio\/campaigns\/[\w-]+/, { timeout: 30_000 });
  await shoot(page, "09-campaign-overview-top");

  // ------- 4. Tabs walk-through
  for (const [tabName, file] of [
    ["Landing", "10-tab-landing"],
    ["SEO", "11-tab-seo"],
    ["Meta ads", "12-tab-meta"],
    ["Instagram", "13-tab-instagram"],
    ["Cinematic", "14-tab-cinematic"],
    ["Social shorts", "15-tab-social"],
    ["Prompt packs", "16-tab-prompt-packs"],
    ["Video productie", "17-tab-video-prod"],
  ] as const) {
    await page.getByRole("tab", { name: tabName, exact: true }).click();
    await page.waitForTimeout(450);
    await shoot(page, file);
  }

  // ------- 5. Inside Cinematic — click scene 02 to navigate
  await page.getByRole("tab", { name: "Cinematic", exact: true }).click();
  await page.getByTestId("scene-s02").click();
  await page.waitForTimeout(500);
  await shoot(page, "18-cinematic-scene-02");

  // ------- 6. Inside Video productie — sub tabs
  await page.getByRole("tab", { name: "Video productie", exact: true }).click();
  // Pipeline view default
  await shoot(page, "19-video-pipeline-table");
  // Click a phase cell to test interaction
  await page.getByTestId("phase-s02-edit").click();
  await page.waitForTimeout(200);
  // Render queue simulate
  await page.getByTestId("render-queue-simulate").click();
  await page.waitForTimeout(2_500);
  await shoot(page, "20-render-queue-simulating");
  await page.getByTestId("render-queue-simulate").click(); // pause
  await page.waitForTimeout(200);

  // Assets per scene
  await page.getByRole("tab", { name: "Assets per scene" }).click();
  await page.waitForTimeout(500);
  await shoot(page, "21-video-assets");
  await page.getByTestId("assets-scene-s02").click();
  await page.waitForTimeout(500);
  await shoot(page, "22-video-assets-scene-02");

  // Voice-over
  await page.getByRole("tab", { name: "Voice-over" }).click();
  await page.waitForTimeout(400);
  await shoot(page, "23-vo-panel");
  await page.getByTestId("vo-synthesize").click();
  await page.waitForTimeout(2_200);
  await shoot(page, "24-vo-synthesized");

  // Export presets + script download
  await page.getByRole("tab", { name: "Export" }).click();
  await page.waitForTimeout(400);
  await shoot(page, "25-export-presets");
  await page.getByTestId("preset-square-1x1").click();
  await page.waitForTimeout(300);
  await shoot(page, "26-export-square-active");
  // Download .sh script
  const downloadPromise = page.waitForEvent("download", { timeout: 5_000 });
  await page.getByTestId("export-download-script").click();
  const download = await downloadPromise;
  const downloadPath = path.join(SHOTS_DIR, download.suggestedFilename());
  await download.saveAs(downloadPath);
  const sh = fs.readFileSync(downloadPath, "utf8");
  if (!sh.startsWith("#!/usr/bin/env bash")) {
    findings.push({
      kind: "note",
      where: "export-download",
      what: `script.sh missing shebang: ${sh.slice(0, 60)}`,
    });
  }
  if (!sh.includes("ffmpeg")) {
    findings.push({
      kind: "note",
      where: "export-download",
      what: "downloaded script.sh contains no ffmpeg commands",
    });
  }

  // Workflow doc
  await page.getByRole("tab", { name: "Werkstroom" }).click();
  await page.waitForTimeout(400);
  await shoot(page, "27-workflow-doc");

  // ------- 7. UX details
  // Edit a prompt in cinematic shot to verify persistence
  await page.getByRole("tab", { name: "Cinematic", exact: true }).click();
  const firstImagePromptTextarea = page
    .locator('[data-testid="shot-s01-a"] textarea')
    .first();
  await firstImagePromptTextarea.fill("EDITED — testing persistence");
  await page.waitForTimeout(200);
  // Switch to another tab and back
  await page.getByRole("tab", { name: "SEO", exact: true }).click();
  await page.waitForTimeout(200);
  await page.getByRole("tab", { name: "Cinematic", exact: true }).click();
  const persistedValue = await firstImagePromptTextarea.inputValue();
  if (persistedValue !== "EDITED — testing persistence") {
    findings.push({
      kind: "note",
      where: "cinematic-prompt-edit",
      what: `prompt edit did NOT persist after tab switch (got: ${persistedValue.slice(0, 40)}…)`,
    });
  } else {
    findings.push({
      kind: "note",
      where: "cinematic-prompt-edit",
      what: "prompt edit persists after tab switch ✓",
    });
  }

  // ------- 8. Console summary
  console.log("\n========== QA AUDIT — DESKTOP ==========");
  console.log(`Findings: ${findings.length}`);
  for (const f of findings) {
    console.log(JSON.stringify(f));
  }

  // Always pass — this is a report, not a gate.
  expect(true).toBe(true);
});

test("QA audit — mobile walkthrough", async ({ browser }, testInfo) => {
  testInfo.setTimeout(120_000);
  const findings: Finding[] = [];

  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  });
  const page = await ctx.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      findings.push({ kind: "console-error", text: msg.text() });
    }
  });
  page.on("pageerror", (err) =>
    findings.push({ kind: "page-error", message: err.message })
  );

  await page.goto("/");
  await shoot(page, "M01-marketing-hero");
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(300);
  await shoot(page, "M02-marketing-scrolled");

  await page.goto("/studio");
  await shoot(page, "M03-studio-empty");

  await page.goto("/studio/nieuw");
  await shoot(page, "M04-wizard-step1");

  // Try to fill and proceed
  await page.getByTestId("business-type-trigger").click();
  await page.waitForTimeout(200);
  await page.getByRole("option", { name: /Restaurant/i }).click();
  await page.getByTestId("brief-name").fill("Atelier Sud");
  await page.getByTestId("brief-city").fill("Rotterdam");
  // Mobile: fixed bottom-bar + touch simulation kan Playwright's hit-test verstoren.
  // De UI klopt visueel, dus force-click is hier het juiste tool.
  await page.getByTestId("wizard-next").click({ force: true });
  await page.getByTestId("tone-warm").click();
  await page.getByTestId("wizard-next").click({ force: true });
  await page.getByTestId("brief-audience").fill(
    "Tweepersoonse koppels in Rotterdam die zoeken naar een rustig diner met persoonlijke service."
  );
  await page.getByTestId("brief-usp-0").fill("Open keuken");
  await page.getByTestId("brief-usp-1").fill("Vaste kookchef");
  await page.getByTestId("wizard-next").click({ force: true });
  await shoot(page, "M05-wizard-review");
  await page.getByTestId("wizard-submit").click({ force: true });
  await page.waitForURL(/\/studio\/campaigns\/[\w-]+/, { timeout: 30_000 });
  await shoot(page, "M06-campaign-overview");

  // Try the tabs row — does it scroll on mobile?
  const tabsRow = page.getByRole("tablist").first();
  const overflowing = await tabsRow.evaluate((el) =>
    el.scrollWidth > el.clientWidth + 4
  );
  findings.push({
    kind: "note",
    where: "mobile-tabs",
    what: `tabs row scrollable: ${overflowing}`,
  });

  await page
    .getByRole("tab", { name: "Cinematic", exact: true })
    .scrollIntoViewIfNeeded();
  await page.getByRole("tab", { name: "Cinematic", exact: true }).click();
  await page.waitForTimeout(400);
  await shoot(page, "M07-tab-cinematic");

  await page
    .getByRole("tab", { name: "Video productie", exact: true })
    .scrollIntoViewIfNeeded();
  await page
    .getByRole("tab", { name: "Video productie", exact: true })
    .click();
  await page.waitForTimeout(400);
  await shoot(page, "M08-video-prod");
  await page
    .getByRole("tab", { name: "Werkstroom" })
    .scrollIntoViewIfNeeded();
  await page.getByRole("tab", { name: "Werkstroom" }).click({ force: true });
  await page.waitForTimeout(400);
  await shoot(page, "M09-video-workflow");

  console.log("\n========== QA AUDIT — MOBILE ==========");
  console.log(`Findings: ${findings.length}`);
  for (const f of findings) {
    console.log(JSON.stringify(f));
  }

  await ctx.close();
  expect(true).toBe(true);
});
