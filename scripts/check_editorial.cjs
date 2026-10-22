const { chromium } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

async function main() {
  const base = process.env.SITE_URL || "http://127.0.0.1:4000";
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.BROWSER_EXECUTABLE || "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  const output = path.resolve("preview/editorial");
  fs.mkdirSync(output, { recursive: true });
  const results = [];
  async function revealAndCapture(page, filename) {
    await page.mouse.move(0, 0);
    await page.evaluate(async () => {
      await document.fonts.ready;
      document.documentElement.style.scrollBehavior = "auto";
      const frame = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.7) {
        scrollTo(0, y);
        await frame();
      }
      scrollTo(0, 0);
      await frame();
      for (const animation of document.getAnimations()) animation.finish();
      document.documentElement.style.scrollBehavior = "";
    });
    assert.equal(await page.evaluate(() => scrollY), 0, "Screenshot starts at page top");
    assert.equal(
      await page.locator("[data-reveal]").evaluateAll((elements) => elements.some((element) => Number(getComputedStyle(element).opacity) < 0.99)),
      false,
      "All sections revealed before full screenshot"
    );
    await page.screenshot({ path: path.join(output, filename), fullPage: true });
  }
  async function checkPage(page, viewport) {
    assert.equal(await page.locator("h1").count(), 1, "One main heading");
    assert.equal(await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link").count(), 4);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Overflow at ${viewport.width}px`);
    assert.equal(await page.locator("img").evaluateAll((images) => images.some((i) => !i.complete || !i.naturalWidth)), false, "Images loaded");
    const ratios = await page.evaluate(() => {
      const luminance = (color) => {
        const values = color
          .match(/[\d.]+/g)
          .slice(0, 3)
          .map(Number)
          .map((v) => v / 255)
          .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
        return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
      };
      const background = luminance(getComputedStyle(document.body).backgroundColor);
      return [
        "h1",
        ".eyebrow",
        ".page-deck",
        ".about-prose",
        ".role-line",
        ".arrow-link",
        ".draft-note strong",
        ".essay-body > p",
        ".direction-status",
      ]
        .filter((selector) => document.querySelector(selector))
        .map((selector) => {
          const foreground = luminance(getComputedStyle(document.querySelector(selector)).color);
          return { selector, ratio: (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05) };
        });
    });
    for (const result of ratios) assert.ok(result.ratio >= 4.5, `Contrast ${JSON.stringify(result)}`);
  }
  try {
    const widths = process.env.CHECK_WIDTHS ? process.env.CHECK_WIDTHS.split(",").map(Number) : [1440, 390, 320, 768];
    for (const width of widths) {
      const viewport = { width, height: width >= 768 ? 1000 : 844 };
      const context = await browser.newContext({ viewport, colorScheme: "light" });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("response", (response) => {
        if (response.url().startsWith(base) && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
      });
      for (const [name, route] of [
        ["about", "/"],
        ["research", "/research/"],
        ["reflections", "/reflections/"],
        ["cv", "/cv/"],
      ]) {
        assert.equal((await page.goto(base + route, { waitUntil: "networkidle" })).status(), 200);
        await checkPage(page, viewport);
        await revealAndCapture(page, `${name}-${width}-light.png`);
      }
      await page.goto(base + "/research/", { waitUntil: "networkidle" });
      await page.waitForFunction(() => document.querySelector("canvas").dataset.settled === "true");
      const before = await page.locator("canvas").evaluate((canvas) => canvas.toDataURL());
      await page.getByRole("tab", { name: "02 Designing" }).click();
      await page.waitForFunction(
        () => document.querySelector("canvas").dataset.settled === "true" && document.querySelector("canvas").dataset.mode === "designing"
      );
      assert.equal(await page.getByRole("tab", { name: "02 Designing" }).getAttribute("aria-selected"), "true");
      assert.ok(await page.locator("#designing-panel").getByRole("heading", { name: "Designing learning." }).isVisible());
      assert.notEqual(await page.locator("canvas").evaluate((canvas) => canvas.toDataURL()), before, "Canvas morphed");
      await checkPage(page, viewport);
      await revealAndCapture(page, `research-${width}-designing.png`);
      await page.getByRole("tab", { name: "02 Designing" }).press("ArrowLeft");
      assert.equal(await page.getByRole("tab", { name: "01 Understanding" }).getAttribute("aria-selected"), "true");
      await page.goto(base + "/research/#designing", { waitUntil: "networkidle" });
      assert.equal(await page.getByRole("tab", { name: "02 Designing" }).getAttribute("aria-selected"), "true", "Deep link selected");

      await page.goto(base + "/reflections/", { waitUntil: "networkidle" });
      assert.equal(await page.locator(".essay-index-entry").count(), 1);
      assert.equal(await page.locator(".reflection-entry").count(), 0);
      await checkPage(page, viewport);
      await page.locator(".essay-index-entry").click();
      await page.waitForURL("**/reflections/on-living/");
      await page.getByRole("button", { name: "中文", exact: true }).click();
      await page.waitForFunction(() => document.querySelector("[data-bilingual-essay]").dataset.activeLanguage === "zh");
      await page.getByRole("button", { name: "English", exact: true }).press("Enter");
      await page.waitForFunction(() => document.querySelector("[data-bilingual-essay]").dataset.activeLanguage === "en");
      await page.getByRole("button", { name: "Switch to dark mode" }).click();
      await page.reload({ waitUntil: "networkidle" });
      assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), "dark", "Theme persists");
      for (const [name, route] of [
        ["about", "/"],
        ["research", "/research/"],
        ["reflections", "/reflections/"],
        ["cv", "/cv/"],
      ]) {
        await page.goto(base + route, { waitUntil: "networkidle" });
        await checkPage(page, viewport);
        await revealAndCapture(page, `${name}-${width}-dark.png`);
      }
      assert.deepEqual(errors, []);
      results.push(
        `${width}px: four pages, light/dark contrast, assets, layout, research keyboard/deep link, Canvas morph, bilingual essay, and saved theme PASS`
      );
      await context.close();
    }
    const reduced = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    const page = await reduced.newPage();
    await page.goto(base + "/research/", { waitUntil: "networkidle" });
    await page.getByRole("tab", { name: "02 Designing" }).click();
    assert.equal(await page.locator("canvas").getAttribute("data-settled"), "true", "Reduced-motion morph is immediate");
    assert.equal(await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length), 0);
    await page.goto(base + "/reflections/", { waitUntil: "networkidle" });
    await page.locator(".essay-index-entry").click();
    await page.waitForURL("**/reflections/on-living/");
    await page.getByRole("button", { name: "中文", exact: true }).click();
    await page.waitForFunction(() => document.querySelector("[data-bilingual-essay]").dataset.activeLanguage === "zh");
    assert.equal(await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length), 0);
    results.push("Reduced-motion: no active animations, immediate research and essay language switches PASS");
    await reduced.close();
    const noScript = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const fallback = await noScript.newPage();
    await fallback.goto(base + "/research/", { waitUntil: "networkidle" });
    assert.ok(await fallback.locator("#designing-panel").isVisible(), "Both research directions remain readable without JavaScript");
    await fallback.goto(base + "/reflections/", { waitUntil: "networkidle" });
    await fallback.locator(".essay-index-entry").click();
    await fallback.waitForURL("**/reflections/on-living/");
    assert.ok(await fallback.locator("#article-en").isVisible());
    assert.ok(await fallback.locator("#article-zh").isVisible());
    assert.ok(await fallback.getByRole("heading", { level: 1 }).isVisible());
    results.push("No JavaScript: core reading and native essay disclosure PASS");
    await noScript.close();
    const report = process.env.CHECK_WIDTHS ? `verification-${process.env.CHECK_WIDTHS.replaceAll(",", "-")}.txt` : "verification.txt";
    fs.writeFileSync(path.join(output, report), results.join("\n") + "\n");
    console.log(results.join("\n"));
  } finally {
    await browser.close();
  }
}
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
