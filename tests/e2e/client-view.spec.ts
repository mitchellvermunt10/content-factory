import { test, expect } from "@playwright/test";

test("Klantweergave — alle 8 secties zichtbaar zonder studio-techniek", async ({
  page,
}) => {
  test.setTimeout(60_000);

  // 1. Maak een mock-mode campagne aan via wizard.
  await page.goto("/studio/nieuw");
  await page.getByTestId("business-type-trigger").click();
  await page.getByRole("option", { name: /Beautysalon/i }).click();
  await page.getByTestId("brief-name").fill("Test Klant");
  await page.getByTestId("brief-city").fill("Utrecht");
  await page.getByTestId("wizard-next").click();
  await page.getByTestId("tone-luxueus").click();
  await page.getByTestId("wizard-next").click();
  await page
    .getByTestId("brief-audience")
    .fill(
      "Vrouwen 30-50 in Utrecht-Oost die schoonheid als ritueel zien en design-bewust zijn."
    );
  await page.getByTestId("brief-usp-0").fill("Op afspraak");
  await page.getByTestId("brief-usp-1").fill("Stille ruimte");
  await page.getByTestId("brief-usp-2").fill("Vast gezicht");
  await page.getByTestId("wizard-next").click();
  await page.getByTestId("wizard-submit").click();
  await page.waitForURL(/\/studio\/campaigns\/[\w-]+/, { timeout: 30_000 });

  // 2. Studio campagne-pagina toont nu een "Klantweergave"-knop.
  await expect(page.getByTestId("open-client-view")).toBeVisible();

  // 3. Klik op de knop — opens in nieuw tab. Pak de URL en navigeer er handmatig naar.
  const studioUrl = page.url();
  const campaignId = studioUrl.split("/").pop()!;
  await page.goto(`/c/${campaignId}`);

  // 4. Verifieer dat de hoofdcontainer er is.
  await expect(page.getByTestId("client-view")).toBeVisible();

  // 5. Hero met campagne-naam (in de concept-sectie specifiek).
  await expect(
    page
      .getByTestId("section-concept")
      .getByRole("heading", { name: "Test Klant", exact: true })
  ).toBeVisible();

  // 6. Alle 8 secties bestaan in de DOM (testids).
  for (const section of [
    "concept",
    "landing",
    "seo",
    "ads",
    "instagram",
    "cinematic",
    "shorts",
    "voiceover",
  ]) {
    await expect(page.getByTestId(`section-${section}`)).toBeAttached();
  }

  // 7. Géén studio-tabs/regen-knoppen op deze pagina.
  await expect(
    page.getByRole("tab", { name: "Cinematic" })
  ).toHaveCount(0);
  await expect(page.getByText(/Opnieuw genereren/i)).toHaveCount(0);
  await expect(page.getByText(/Render queue/i)).toHaveCount(0);

  // 8. Wel zichtbaar: terug-link naar studio (admin-only) + footer CTA.
  await expect(page.getByRole("link", { name: /Studio \(admin\)/i })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Start een eigen campagne/i })
  ).toBeVisible();
});
