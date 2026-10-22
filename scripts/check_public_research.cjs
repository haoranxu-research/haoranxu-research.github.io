const { chromium } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

async function main() {
  const base = process.env.SITE_URL || "http://127.0.0.1:4007";
  const output = path.resolve("preview/research-resources");
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.BROWSER_EXECUTABLE || "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  const results = [];
  async function capture(page, name) {
    await page.evaluate(async () => {
      await document.fonts.ready;
      document.documentElement.style.scrollBehavior = "auto";
      for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.7) {
        scrollTo(0, y);
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      }
      scrollTo(0, 0);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      for (const animation of document.getAnimations()) animation.finish();
    });
    await page.screenshot({ path: path.join(output, name), fullPage: true });
  }
  try {
    for (const width of [1440, 390, 320]) {
      for (const theme of ["light", "dark"]) {
        const context = await browser.newContext({ viewport: { width, height: 1000 }, colorScheme: theme });
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", (e) => errors.push(e.message));
        await page.goto(base + "/research/", { waitUntil: "networkidle" });
        assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), theme);
        assert.equal(await page.locator(".preprint-entry").count(), 1);
        const button = page.getByRole("button", { name: "Abstract", exact: true });
        const panel = page.locator(".paper-abstract");
        assert.equal(await button.getAttribute("aria-expanded"), "false");
        assert.equal(await panel.isVisible(), false);
        assert.equal(await page.locator(".paper-resources a").count(), 1, "Only real Paper resource currently exists");
        assert.equal(await page.locator(".paper-resources a").getAttribute("href"), "https://doi.org/10.5281/zenodo.23428428");
        assert.equal(await page.getByRole("link", { name: "Code", exact: true }).count(), 0);
        assert.equal(await page.locator('a[href=""]').count(), 0);
        await capture(page, `research-${width}-${theme}-closed.png`);
        await button.click();
        assert.equal(await button.getAttribute("aria-expanded"), "true");
        assert.equal(await panel.isVisible(), true);
        const layout = await panel.locator("p").evaluate((p) => ({
          align: getComputedStyle(p).textAlign,
          spacing: getComputedStyle(p).wordSpacing,
          lineHeight: parseFloat(getComputedStyle(p).lineHeight),
          fontSize: parseFloat(getComputedStyle(p).fontSize),
        }));
        assert.equal(layout.align, "left");
        assert.ok(layout.spacing === "normal" || layout.spacing === "0px");
        assert.ok(layout.lineHeight / layout.fontSize >= 1.7);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        await capture(page, `research-${width}-${theme}-open.png`);
        await button.focus();
        await page.keyboard.press("Enter");
        assert.equal(await panel.isVisible(), false);
        await page.keyboard.press("Space");
        assert.equal(await panel.isVisible(), true);
        assert.deepEqual(errors, []);
        results.push(
          `${width}px ${theme}: default collapsed, click/Enter/Space toggle, left-aligned abstract, no overflow, no empty/Code links PASS`
        );
        await context.close();
      }
    }
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(base + "/research/", { waitUntil: "networkidle" });
    assert.ok(await page.locator(".paper-abstract").isVisible());
    assert.equal(await page.locator("[data-abstract-toggle]").isVisible(), false);
    results.push("No JavaScript: abstract remains readable, inactive toggle hidden PASS");
    await context.close();
    const external = await browser.newPage();
    await external.goto(base + "/research/", { waitUntil: "networkidle" });
    const navigation = external.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 20000 });
    await external.getByRole("link", { name: "Paper", exact: true }).click({ noWaitAfter: true });
    try {
      const response = await navigation;
      results.push(`Actual Paper click: HTTP ${response ? response.status() : "unknown"}; final URL ${external.url()}`);
    } catch (error) {
      results.push(`Actual Paper click: navigation could not complete (${error.message.split("\n")[0]}); URL ${external.url()}`);
    }
    fs.writeFileSync(path.join(output, "verification.txt"), results.join("\n") + "\n");
    console.log(results.join("\n"));
  } finally {
    await browser.close();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
