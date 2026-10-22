const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

async function main() {
  const base = process.env.SITE_URL || "http://127.0.0.1:4000";
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.BROWSER_EXECUTABLE || "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  const results = [];
  try {
    for (const width of [1440, 390, 320]) {
      const context = await browser.newContext({ viewport: { width, height: 844 }, acceptDownloads: true });
      const page = await context.newPage();
      await page.goto(base, { waitUntil: "networkidle" });
      const cv = page.locator(".about-links").getByRole("link", { name: "Academic CV", exact: true });
      const bounds = await cv.boundingBox();
      assert.ok(bounds && bounds.y >= 0 && bounds.y + bounds.height < 844, "CV visible in first viewport");
      assert.deepEqual(
        await page.locator('a[href^="mailto:"]').evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
        ["mailto:haoranxu1104@gmail.com", "mailto:haoranxu2024@zju.edu.cn"],
        "Confirmed Gmail is primary, with ZJU email as secondary"
      );
      assert.equal(await page.locator(".public-research").count(), 0, "No public preprint block on home");
      assert.equal(await page.getByText("Same Data, Different Domains", { exact: false }).count(), 0, "No duplicate preprint title on home");
      const pdfURL = new URL(await cv.getAttribute("href"), base).href;
      const response = await context.request.get(pdfURL);
      assert.equal(response.status(), 200);
      assert.ok(response.headers()["content-type"].includes("application/pdf"));
      assert.ok((await response.body()).subarray(0, 5).equals(Buffer.from("%PDF-")));
      await page.goto(base + "/research/", { waitUntil: "networkidle" });
      assert.equal(await page.locator(".public-research").count(), 1, "Exactly one public research block");
      const order = await page.locator("main > section").evaluateAll((elements) => elements.map((el) => el.getAttribute("aria-labelledby")));
      assert.ok(
        order.indexOf("experience") >= 0 && order.indexOf("public-research") > order.indexOf("experience"),
        "Public research follows research experience"
      );
      await page.goto(base + "/cv/", { waitUntil: "networkidle" });
      const pending = page.waitForEvent("download");
      await page.getByRole("link", { name: "Download Academic CV", exact: true }).click();
      const download = await pending;
      assert.equal(download.suggestedFilename(), "Haoran_Xu_Academic_CV.pdf");
      assert.equal(await download.failure(), null);
      assert.ok(fs.readFileSync(await download.path()).equals(fs.readFileSync("assets/pdf/haoran-xu-cv.pdf")), "Download matches reviewed PDF");
      for (const route of ["/", "/research/", "/cv/"]) {
        await page.goto(base + route, { waitUntil: "networkidle" });
        const content = await page.locator("main").innerText();
        assert.ok(!/\bTODO\b|under review|manuscripts?\s*:\s*\d/i.test(content), "No draft placeholders or manuscript status");
        assert.equal(await page.locator('a[aria-current="page"]').count(), 1);
        assert.ok(!(await page.locator("footer").innerText()).includes("A space for learning"), "No footer slogan");
      }
      results.push(
        `${width}px: first-screen CV, confirmed email links, preprint placement, PDF response/download integrity, active navigation, and public copy PASS`
      );
      await context.close();
    }
    const output = path.resolve("preview/editorial/academic-verification.txt");
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, results.join("\n") + "\n");
    console.log(results.join("\n"));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
