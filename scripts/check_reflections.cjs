const { chromium } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const expected = Object.fromEntries(
  ["en", "zh"].map((locale) => {
    const text = fs.readFileSync(`_includes/reflections/on-living.${locale}.md`, "utf8");
    const paragraphs = text
      .trim()
      .split(/\r?\n\s*\r?\n/)
      .slice(1)
      .map((p) => p.replace(/\*\*/g, "").replace(/\*/g, "").replace(/\s+/g, " ").trim());
    return [locale, paragraphs];
  })
);

async function main() {
  const base = process.env.SITE_URL || "http://127.0.0.1:4000";
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.BROWSER_EXECUTABLE || "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  const output = path.resolve("preview/on-living");
  fs.mkdirSync(output, { recursive: true });
  const results = [];
  const frame = async (page) => page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const article = base + "/reflections/on-living/";
  async function checkText(page) {
    for (const locale of ["en", "zh"]) {
      const actual = await page.locator(`#article-${locale} > p`).evaluateAll((ps) => ps.map((p) => p.textContent.replace(/\s+/g, " ").trim()));
      assert.deepEqual(actual, expected[locale], `${locale}: preserve every paragraph and punctuation`);
    }
    assert.equal(await page.locator("#article-en .reader-quote").textContent(), "乘兴而去，兴尽而归。");
    assert.equal(
      await page.locator("#article-en .reader-quote + p").textContent(),
      "To set out when the spirit moves you, and to return when the journey feels complete."
    );
  }
  async function checkLayout(page) {
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, "No horizontal overflow");
    const toolbar = await page.locator(".reader-toolbar").boundingBox();
    assert.ok(toolbar.width <= (await page.viewportSize()).width, "Language toolbar fits");
  }
  async function screenshot(page, name) {
    await page.evaluate(async () => {
      await document.fonts.ready;
      document.activeElement?.blur();
      document.documentElement.style.scrollBehavior = "auto";
      scrollTo(0, 0);
    });
    await frame(page);
    await page.screenshot({ path: path.join(output, name + "-full.png"), fullPage: true });
    await page.evaluate(() => scrollTo(0, 0));
    await frame(page);
    assert.equal(await page.evaluate(() => scrollY), 0, "Top screenshot returns to beginning");
    await page.screenshot({ path: path.join(output, name + "-top.png") });
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = "";
    });
  }
  async function anchor(page) {
    return page.evaluate(() => {
      const active = document.querySelector(".reader-panel:not([hidden])");
      const line =
        Math.max(
          document.querySelector(".site-header").getBoundingClientRect().bottom,
          document.querySelector(".reader-toolbar").getBoundingClientRect().bottom
        ) + 24;
      let chosen;
      for (const p of active.querySelectorAll(":scope > p")) if (p.getBoundingClientRect().top <= line) chosen = p.dataset.paragraph;
      return chosen;
    });
  }
  try {
    const widths = process.env.CHECK_WIDTHS ? process.env.CHECK_WIDTHS.split(",").map(Number) : [1440, 390, 320];
    for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: width >= 768 ? 1000 : 844 }, colorScheme: "light" });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("response", (response) => {
        if (response.url().startsWith(base) && response.status() >= 400) errors.push(response.url());
      });
      await page.goto(base + "/reflections/", { waitUntil: "networkidle" });
      assert.equal(await page.locator(".essay-index-entry").count(), 1);
      assert.equal(await page.locator(".reflection-entry").count(), 0, "AI examples hidden");
      assert.ok(await page.getByRole("heading", { name: "On Living", exact: true }).isVisible());
      await page.screenshot({ path: path.join(output, `reflections-index-${width}.png`), fullPage: true });
      await page.locator(".essay-index-entry").click();
      await page.waitForURL(article);
      await page.waitForLoadState("networkidle");
      assert.equal(await page.locator("[data-bilingual-essay]").getAttribute("data-active-language"), "en");
      await checkText(page);
      await checkLayout(page);
      await screenshot(page, `on-living-en-${width}-light`);
      await page.evaluate(() => {
        const p = document.querySelector('#article-en [data-paragraph="12"]');
        scrollTo({ top: scrollY + p.getBoundingClientRect().top - 150, behavior: "instant" });
      });
      await frame(page);
      const before = await anchor(page);
      assert.ok(Number(before) >= 10, "Reader is well into the essay");
      await page.getByRole("button", { name: "中文", exact: true }).click();
      await page.waitForFunction(() => document.querySelector("[data-bilingual-essay]").dataset.activeLanguage === "zh");
      await frame(page);
      assert.equal(await anchor(page), before, "Chinese switch retains corresponding paragraph");
      assert.ok(await page.evaluate(() => scrollY > 500), "Language switch did not reset to top");
      assert.equal(await page.locator(".reader-title").textContent(), "关于生活的一些想法");
      assert.equal(await page.locator("#article-zh").getAttribute("lang"), "zh-Hans");
      await page.screenshot({ path: path.join(output, `on-living-zh-${width}-middle.png`) });
      await page.getByRole("button", { name: "English", exact: true }).press("Enter");
      await page.waitForFunction(() => document.querySelector("[data-bilingual-essay]").dataset.activeLanguage === "en");
      await frame(page);
      assert.equal(await anchor(page), before, "English return retains corresponding paragraph");
      await page.getByRole("button", { name: "中文", exact: true }).click();
      await page.waitForFunction(() => document.querySelector("[data-bilingual-essay]").dataset.activeLanguage === "zh");
      await checkLayout(page);
      await screenshot(page, `on-living-zh-${width}-light`);
      await page.reload({ waitUntil: "networkidle" });
      await page.waitForFunction(() => document.querySelector("[data-bilingual-essay]").dataset.activeLanguage === "zh");
      assert.ok(page.url().includes("lang=zh"), "Chinese URL survives reload");
      await page.getByRole("button", { name: "Switch to dark mode" }).click();
      await checkLayout(page);
      await screenshot(page, `on-living-zh-${width}-dark`);
      await page.getByRole("button", { name: "English", exact: true }).click();
      await page.waitForFunction(() => document.querySelector("[data-bilingual-essay]").dataset.activeLanguage === "en");
      await screenshot(page, `on-living-en-${width}-dark`);
      assert.deepEqual(errors, []);
      results.push(
        `${width}px: EN ${expected.en.length} / ZH ${expected.zh.length} paragraphs exact; index, keyboard, paragraph-preserving switch, Chinese URL, fonts, light/dark, overflow PASS`
      );
      await context.close();
    }
    const reduced = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    const reducedPage = await reduced.newPage();
    await reducedPage.goto(article, { waitUntil: "networkidle" });
    await reducedPage.getByRole("button", { name: "中文", exact: true }).click();
    await reducedPage.waitForFunction(() => document.querySelector("[data-bilingual-essay]").dataset.activeLanguage === "zh");
    assert.equal(await reducedPage.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length), 0);
    await reduced.close();
    const noScript = await browser.newContext({ javaScriptEnabled: false });
    const fallback = await noScript.newPage();
    await fallback.goto(article, { waitUntil: "networkidle" });
    assert.ok(await fallback.locator("#article-en").isVisible());
    assert.ok(await fallback.locator("#article-zh").isVisible());
    await checkText(fallback);
    await noScript.close();
    results.push("Reduced-motion and no-JavaScript bilingual reading PASS");
    fs.writeFileSync(path.join(output, "verification.txt"), results.join("\n") + "\n");
    console.log(results.join("\n"));
  } finally {
    await browser.close();
  }
}
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
