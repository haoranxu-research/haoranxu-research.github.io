/* Preserve the reader's paragraph, not an unrelated percentage of the page. */
(() => {
  "use strict";
  const essay = document.querySelector("[data-bilingual-essay]");
  if (!essay) return;
  const panels = { en: essay.querySelector("#article-en"), zh: essay.querySelector("#article-zh") };
  const buttons = [...essay.querySelectorAll("[data-reader-language]")];
  const title = essay.querySelector(".reader-title");
  const subtitle = essay.querySelector(".reader-subtitle");
  const toolbar = essay.querySelector(".reader-toolbar");
  const announcement = essay.querySelector(".reader-announcement");
  let language = "en";
  let revision = 0;
  for (const [locale, panel] of Object.entries(panels)) {
    let paragraph = 0;
    [...panel.querySelectorAll(":scope > p")].forEach((element) => {
      // The supplied English literary rendering shares the Chinese quote's anchor.
      const translation = locale === "en" && element.previousElementSibling?.classList.contains("reader-quote");
      element.dataset.paragraph = String(translation ? paragraph - 1 : paragraph++);
    });
  }
  const readingLine = () => {
    const headerBottom = document.querySelector(".site-header").getBoundingClientRect().bottom;
    return Math.max(headerBottom, toolbar.getBoundingClientRect().bottom) + 24;
  };
  const captureAnchor = () => {
    const panel = panels[language];
    const line = readingLine();
    const box = panel.getBoundingClientRect();
    if (box.top > line || box.bottom < line) return null;
    let anchor = null;
    for (const p of panel.querySelectorAll(":scope > p")) {
      const rect = p.getBoundingClientRect();
      if (rect.top > line) break;
      anchor = { paragraph: p.dataset.paragraph, fraction: Math.min(1, Math.max(0, (line - rect.top) / rect.height)) };
    }
    return anchor;
  };
  const changeLanguage = async (next, remember = true) => {
    if (!panels[next] || next === language) return;
    const id = ++revision;
    const anchor = remember ? captureAnchor() : null;
    const previousScroll = scrollY;
    language = next;
    for (const [locale, panel] of Object.entries(panels)) panel.hidden = locale !== next;
    buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.readerLanguage === next)));
    title.textContent = next === "zh" ? essay.dataset.titleZh : essay.dataset.titleEn;
    title.lang = next === "zh" ? "zh-Hans" : "en";
    subtitle.textContent = next === "zh" ? essay.dataset.titleEn : essay.dataset.titleZh;
    subtitle.lang = next === "zh" ? "en" : "zh-Hans";
    document.title = `${title.textContent} | Haoran Xu`;
    await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(resolve));
    if (id !== revision) return;
    const scrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    if (anchor) {
      const p = panels[next].querySelector(`[data-paragraph="${anchor.paragraph}"]`);
      if (p) {
        const rect = p.getBoundingClientRect();
        scrollTo(0, Math.max(0, scrollY + rect.top + rect.height * anchor.fraction - readingLine()));
      }
    } else if (remember) scrollTo(0, previousScroll);
    document.documentElement.style.scrollBehavior = scrollBehavior;
    if (remember) {
      const url = new URL(location.href);
      if (next === "zh") url.searchParams.set("lang", "zh");
      else url.searchParams.delete("lang");
      history.replaceState(null, "", url);
      announcement.textContent = next === "zh" ? "已切换为中文。" : "Switched to English.";
      announcement.lang = next === "zh" ? "zh-Hans" : "en";
    }
    essay.dataset.activeLanguage = next;
    window.dispatchEvent(new Event("scroll"));
  };
  buttons.forEach((button) => button.addEventListener("click", () => changeLanguage(button.dataset.readerLanguage)));
  essay.dataset.activeLanguage = "en";
  if (new URL(location.href).searchParams.get("lang") === "zh") changeLanguage("zh", false);
})();
