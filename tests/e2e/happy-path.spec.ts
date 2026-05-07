import { test, expect } from "@playwright/test";

test.describe("AI Content Factory — happy path", () => {
  test("marketing → studio → wizard → campaign", async ({ page }) => {
    // 1. Marketing homepage rendert.
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Volledige campagnes/i })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Start een campagne/i }).first()
    ).toBeVisible();

    // 2. Naar studio dashboard.
    await page.goto("/studio");
    await expect(
      page.getByRole("heading", { name: "Campagnes", exact: true })
    ).toBeVisible();
    await expect(page.getByTestId("campaigns-empty")).toBeVisible();

    // 3. Naar wizard.
    await page.goto("/studio/nieuw");
    await expect(page.getByRole("heading", { name: /Bedrijf/i })).toBeVisible();

    // Stap 1: business
    await page.getByTestId("business-type-trigger").click();
    await page.getByRole("option", { name: /Beautysalon/i }).click();
    await page.getByTestId("brief-name").fill("Atelier Nord");
    await page.getByTestId("brief-city").fill("Amsterdam");
    await page.getByTestId("wizard-next").click();

    // Stap 2: brand
    await expect(page.getByRole("heading", { name: /Merk/i })).toBeVisible();
    await page.getByTestId("tone-luxueus").click();
    await page.getByTestId("wizard-next").click();

    // Stap 3: doelgroep + USPs
    await expect(
      page.getByRole("heading", { name: /Doelgroep/i })
    ).toBeVisible();
    await page
      .getByTestId("brief-audience")
      .fill(
        "Vrouwen 30-55 in Amsterdam-Zuid die op zoek zijn naar een persoonlijke en doordachte beautyervaring zonder haast."
      );
    await page.getByTestId("brief-usp-0").fill("Persoonlijke aanpak");
    await page.getByTestId("brief-usp-1").fill("Premium producten");
    await page.getByTestId("brief-usp-2").fill("Stille ruimte zonder muziek");
    await page.getByTestId("wizard-next").click();

    // Stap 4: review + submit
    await expect(
      page.getByRole("heading", { name: /Controle/i })
    ).toBeVisible();
    await page.getByTestId("wizard-submit").click();

    // 4. Naar campagne overzicht (mock-mode levert direct).
    await page.waitForURL(/\/studio\/campaigns\/[\w-]+/, { timeout: 30_000 });
    await expect(
      page.getByRole("heading", { name: "Atelier Nord", exact: true })
    ).toBeVisible();

    // Tabs zichtbaar
    await expect(page.getByRole("tab", { name: "Landing" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "SEO" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Meta ads" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Instagram" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Cinematic" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Social shorts" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Prompt packs" })).toBeVisible();

    // Switch naar SEO tab
    await page.getByRole("tab", { name: "SEO" }).click();
    await expect(page.getByText(/Meta & Open Graph/i)).toBeVisible();

    // Switch naar Meta ads
    await page.getByRole("tab", { name: "Meta ads" }).click();
    await expect(page.getByText(/Campagne & doelgroep/i)).toBeVisible();

    // Switch naar Instagram
    await page.getByRole("tab", { name: "Instagram" }).click();
    await expect(page.getByText(/Bio/i).first()).toBeVisible();

    // Switch naar Cinematic
    await page.getByRole("tab", { name: "Cinematic" }).click();
    await expect(page.getByTestId("cinematic-preview")).toBeVisible();
    await expect(page.getByTestId("vo-script")).toBeVisible();
    await expect(page.getByTestId("scene-s01")).toBeVisible();
    // Klik scene 02 → shot s02-a verschijnt
    await page.getByTestId("scene-s02").click();
    await expect(page.getByTestId("shot-s02-a")).toBeVisible();

    // Switch naar Social shorts
    await page.getByRole("tab", { name: "Social shorts" }).click();
    await expect(page.getByTestId("social-shorts-preview")).toBeVisible();
    await expect(page.getByText(/Hook bank/i)).toBeVisible();
    await page.getByRole("tab", { name: "TikTok" }).click();
    await expect(page.getByText(/Beats & script/i)).toBeVisible();

    // Switch naar Prompt packs
    await page.getByRole("tab", { name: "Prompt packs" }).click();
    await expect(page.getByTestId("prompt-packs-preview")).toBeVisible();
    await expect(page.getByText(/Visual style guide/i)).toBeVisible();
    await page.getByRole("tab", { name: /^Video \(/i }).click();
    await expect(page.getByText(/Runway/i).first()).toBeVisible();

    // Switch naar Video productie tab
    await page
      .getByRole("tab", { name: "Video productie", exact: true })
      .click();
    await expect(page.getByTestId("video-production-preview")).toBeVisible();
    // Pipeline tab default zichtbaar
    await expect(page.getByText(/Render pipeline/i)).toBeVisible();
    await expect(page.getByTestId("pipeline-row-s01")).toBeVisible();
    // Render queue zichtbaar
    await expect(page.getByText("Render queue")).toBeVisible();
    await expect(page.getByTestId("render-queue-simulate")).toBeVisible();

    // Phase status cyclen door te klikken
    await page.getByTestId("phase-s02-edit").click();

    // Switch naar Assets per scene tab binnen Video productie
    await page.getByRole("tab", { name: "Assets per scene" }).click();
    await expect(page.getByTestId("scene-asset-s01-a")).toBeVisible();
    // Asset uploader (file input + URL field) en status pill aanwezig
    await expect(page.getByTestId("asset-vid-s01-a-url")).toBeVisible();
    await expect(page.getByTestId("asset-vid-s01-a-file-input")).toBeAttached();
    await expect(page.getByTestId("asset-status-vid-s01-a")).toBeVisible();
    // Cycle status door te klikken (uploaded → verified)
    const initialStatus = await page
      .getByTestId("asset-status-vid-s01-a")
      .innerText();
    await page.getByTestId("asset-status-vid-s01-a").click();
    await expect(page.getByTestId("asset-status-vid-s01-a")).not.toHaveText(
      initialStatus
    );
    // Plak een URL in image veld
    await page
      .getByTestId("asset-img-s01-a-url")
      .fill("https://cdn.midjourney.com/test/abc.png");
    await page.getByTestId("assets-scene-s02").click();
    await expect(page.getByTestId("scene-asset-s02-a")).toBeVisible();

    // Voice-over tab
    await page.getByRole("tab", { name: "Voice-over" }).click();
    await expect(page.getByTestId("vo-voice")).toBeVisible();
    await expect(page.getByTestId("vo-audio-url")).toBeVisible();

    // Voice-over: mock synthese (geen ELEVENLABS_API_KEY in test env).
    // Reset eerst het URL veld zodat we de "klaar" transitie kunnen waarnemen.
    await page.getByTestId("vo-audio-url").fill("");
    await page.getByTestId("vo-synthesize").click();
    await expect(page.getByTestId("vo-mode-mock")).toBeVisible({
      timeout: 10_000,
    });
    // De URL is nu een placeholder (mock) — geen audio player en geen download.
    await expect(page.getByTestId("vo-audio-player")).toHaveCount(0);
    await expect(page.getByTestId("vo-download")).toHaveCount(0);

    // Assembly tab — 4 per-preset scripts + bundle download
    await page.getByRole("tab", { name: "Assembly", exact: true }).click();
    await expect(page.getByTestId("assembly-tab")).toBeVisible();
    await expect(page.getByText("Export assembly")).toBeVisible();
    await expect(page.getByTestId("assembly-download-reel-9x16")).toBeVisible();
    await expect(page.getByTestId("assembly-download-square-1x1")).toBeVisible();
    await expect(
      page.getByTestId("assembly-download-youtube-16x9")
    ).toBeVisible();
    await expect(page.getByTestId("assembly-download-feed-4x5")).toBeVisible();

    // Daadwerkelijke download van het 9x16 script
    const downloadPromise = page.waitForEvent("download", { timeout: 5_000 });
    await page.getByTestId("assembly-download-reel-9x16").click();
    const dl = await downloadPromise;
    const fname = dl.suggestedFilename();
    if (!fname.endsWith("-export-reel-9x16.sh")) {
      throw new Error(
        `Onverwachte filename voor reel script: ${fname}`
      );
    }
    // Sanity check op script-inhoud
    const stream = await dl.createReadStream();
    let content = "";
    for await (const chunk of stream) content += chunk.toString();
    if (!content.startsWith("#!/usr/bin/env bash")) {
      throw new Error("Script heeft geen geldige shebang");
    }
    if (!content.includes("ffmpeg")) {
      throw new Error("Script bevat geen ffmpeg commando's");
    }
    if (!content.includes("scale=1080:1920")) {
      throw new Error(
        "Reel script bevat niet de juiste 9:16 resolutie (1080:1920)"
      );
    }

    // Export tab + preset selector + ffmpeg plan
    await page.getByRole("tab", { name: "Export" }).click();
    await expect(page.getByTestId("preset-reel-9x16")).toBeVisible();
    await expect(page.getByTestId("preset-youtube-16x9")).toBeVisible();
    await page.getByTestId("preset-square-1x1").click();
    await expect(page.getByText(/FFmpeg plan/i)).toBeVisible();
    await expect(page.getByTestId("export-download-script")).toBeVisible();

    // Werkstroom tab
    await page.getByRole("tab", { name: "Werkstroom" }).click();
    await expect(page.getByText(/Van prompts naar MP4/i)).toBeVisible();

    // 5. Terug naar dashboard, campagne staat in lijst.
    await page.goto("/studio");
    await expect(page.getByText("Atelier Nord")).toBeVisible();
  });
});
