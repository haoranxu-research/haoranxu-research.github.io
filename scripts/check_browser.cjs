/* Browser smoke checks for the built site; screenshots stay local. */
const { chromium } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");

async function main() {
  const base = process.env.SITE_URL || "http://127.0.0.1:4000";
  const options = { headless: true };
  if (process.env.BROWSER_EXECUTABLE) options.executablePath = process.env.BROWSER_EXECUTABLE;
  const browser = await chromium.launch(options);
  const output = path.resolve("preview");
  fs.mkdirSync(output, { recursive: true });
  const results = [];
  try {
    const widths = process.env.CHECK_WIDTHS ? process.env.CHECK_WIDTHS.split(",").map(Number) : null;
    for (const viewport of [
      { width: 1440, height: 1000 },
      { width: 1920, height: 1080 },
      { width: 768, height: 1024 },
      { width: 390, height: 844 },
      { width: 320, height: 760 },
    ]) {
      if (widths && !widths.includes(viewport.width)) continue;
      const context = await browser.newContext({ viewport, colorScheme: "light" });
      const page = await context.newPage();
      const pageErrors = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));
      const missing = [];
      page.on("response", (response) => {
        if (response.url().startsWith(base) && response.status() >= 400) missing.push(response.url());
      });
      for (const route of ["/", "/publications/", "/cv/"]) {
        const response = await page.goto(base + route, { waitUntil: "networkidle" });
        if (response.status() !== 200) throw new Error(`${route}: HTTP ${response.status()}`);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
        if (overflow) throw new Error(`Horizontal overflow at ${viewport.width}px: ${route}`);
        const brokenImages = await page.locator("img").evaluateAll((images) => images.filter((i) => !i.complete || !i.naturalWidth).length);
        if (brokenImages) throw new Error(`Broken image: ${route}`);
        await page.screenshot({
          path: path.join(output, `${route === "/" ? "about" : route.split("/")[1]}-${viewport.width}-light.png`),
          fullPage: true,
        });
        results.push(`${viewport.width}px ${route}: HTTP, assets, and overflow passed`);
      }
      await page.goto(base + "/", { waitUntil: "networkidle" });
      const checkContrast = async () => {
        const ratios = await page.evaluate(() => {
          const luminance = (color) => {
            const rgb = color
              .match(/\d+/g)
              .slice(0, 3)
              .map(Number)
              .map((value) => value / 255);
            const linear = rgb.map((v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
            return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
          };
          const bg = luminance(getComputedStyle(document.body).backgroundColor);
          return [".post-title", ".about-biography > p", ".academic-affiliation > span", ".contact-pending", ".academic-brand"].map((selector) => {
            const fg = luminance(getComputedStyle(document.querySelector(selector)).color);
            return { selector, ratio: (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05) };
          });
        });
        for (const result of ratios) if (result.ratio < 4.5) throw new Error(`Insufficient contrast: ${JSON.stringify(result)}`);
      };
      await checkContrast();
      if (viewport.width < 576) {
        const menu = page.getByRole("button", { name: "Toggle navigation" });
        await menu.click();
        if ((await menu.getAttribute("aria-expanded")) !== "true") throw new Error("Mobile menu did not expand");
      }
      const about = page.locator("#navbarNav").getByRole("link", { name: "About", exact: false });
      if (!(await about.isVisible())) throw new Error("About navigation is missing");
      const publicNav = await page.locator("#navbarNav").getByRole("link", { name: "Publications", exact: false }).count();
      const cvNav = await page.locator("#navbarNav").getByRole("link", { name: "CV", exact: false }).count();
      if (publicNav || cvNav) throw new Error("Empty pages should be hidden from navigation");
      if ((await page.locator(".academic-brand").count()) !== 1) throw new Error("Name is missing from navbar");
      if ((await page.locator(".interest-list").count()) !== 0) throw new Error("Duplicate research interest list remains");
      const boxes = await page.evaluate(() => {
        const copy = document.querySelector(".about-copy").getBoundingClientRect();
        const photo = document.querySelector(".about-portrait").getBoundingClientRect();
        const brand = document.querySelector(".academic-brand").getBoundingClientRect();
        return {
          brandLeft: brand.left,
          copy: { left: copy.left, top: copy.top, right: copy.right, bottom: copy.bottom },
          photo: { left: photo.left, top: photo.top, bottom: photo.bottom },
        };
      });
      if (Math.abs(boxes.brandLeft - boxes.copy.left) > 1) throw new Error("Navbar and biography are not aligned");
      if (viewport.width >= 768 && boxes.photo.left <= boxes.copy.right) throw new Error("Desktop columns overlap");
      if (viewport.width < 768 && boxes.photo.top < boxes.copy.bottom) throw new Error("Mobile portrait overlaps the biography");
      await about.click();
      await page.waitForURL(base + "/");
      await page.goto(base + "/", { waitUntil: "networkidle" });
      if (viewport.width < 576) await page.getByRole("button", { name: "Toggle navigation" }).click();
      await page.getByRole("button", { name: "Change color theme" }).click();
      const setting = await page.evaluate(() => document.documentElement.dataset.themeSetting);
      if (setting !== "light") throw new Error(`Unexpected first theme state: ${setting}`);
      await page.getByRole("button", { name: "Change color theme" }).click();
      const theme = await page.evaluate(() => document.documentElement.dataset.theme);
      if (theme !== "dark") throw new Error("Theme did not switch to dark");
      await page.reload({ waitUntil: "networkidle" });
      if ((await page.evaluate(() => document.documentElement.dataset.theme)) !== "dark") throw new Error("Theme preference did not persist");
      const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      const channels = background.match(/\d+/g).slice(0, 3).map(Number);
      if (channels.some((channel) => channel > 100)) throw new Error(`Dark theme background is too light: ${background}`);
      await checkContrast();
      await page.screenshot({ path: path.join(output, `about-${viewport.width}-dark.png`), fullPage: true });
      results.push(`${viewport.width}px navigation, mobile menu, dark mode, and theme persistence passed`);
      if (pageErrors.length || missing.length) throw new Error(JSON.stringify({ pageErrors, missing }));
      await context.close();
    }
    fs.writeFileSync(path.join(output, widths ? `browser-results-${widths.join("-")}.txt` : "browser-results.txt"), results.join("\n") + "\n");
    console.log(results.join("\n"));
  } finally {
    await browser.close();
  }
}
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
