/* Thoughtful, dependency-free interactions for a static editorial site. */
(() => {
  "use strict";
  const root = document.documentElement;
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const themeButton = document.querySelector(".theme-toggle");
  const syncThemeButton = () => {
    const dark = root.dataset.theme === "dark";
    themeButton?.setAttribute("aria-pressed", String(dark));
    themeButton?.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  };
  syncThemeButton();
  themeButton?.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("theme", root.dataset.theme);
    } catch (_) {}
    syncThemeButton();
    document.dispatchEvent(new Event("editorial:theme"));
  });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
    let manual = null;
    try {
      manual = localStorage.getItem("theme");
    } catch (_) {}
    if (!manual || manual === "system") {
      root.dataset.theme = event.matches ? "dark" : "light";
      syncThemeButton();
      document.dispatchEvent(new Event("editorial:theme"));
    }
  });

  const reveals = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !motion.matches) {
    root.classList.add("js-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
      },
      { threshold: 0.06 }
    );
    reveals.forEach((element) => observer.observe(element));
  } else reveals.forEach((element) => element.classList.add("is-visible"));
  motion.addEventListener("change", () => {
    if (motion.matches) reveals.forEach((element) => element.classList.add("is-visible"));
  });

  function createLineStudy(canvas) {
    if (!canvas) return () => {};
    const context = canvas.getContext("2d");
    if (!context) return () => {};
    const lines = 32;
    const segments = 96;
    const observed = [];
    const imagined = [];
    for (let line = 0; line < lines; line++) {
      const a = [],
        b = [];
      for (let index = 0; index <= segments; index++) {
        const t = index / segments;
        const envelope = Math.sin(t * Math.PI);
        const phase = line * 0.11;
        a.push([
          42 + t * 556,
          220 +
            (line - (lines - 1) / 2) * 5.3 +
            Math.sin(t * Math.PI * 2 + phase) * 40 * envelope +
            Math.sin(t * Math.PI * 3 - phase * 0.6) * 15 * envelope,
        ]);
        const angle = t * Math.PI * 2;
        const radius = 77 + line * 3.35;
        b.push([
          320 + Math.cos(angle) * radius * 1.25 + Math.sin(angle * 2 + phase * 0.2) * 18,
          220 + Math.sin(angle) * radius * 0.82 + Math.sin(angle * 3 + phase * 0.2) * 13,
        ]);
      }
      observed.push(a);
      imagined.push(b);
    }
    let blend = 0,
      target = 0,
      frame = 0,
      last = 0;
    let pointerX = 0,
      pointerY = 0,
      currentX = 0,
      currentY = 0;
    let scale = 1,
      palette;
    const readPalette = () => {
      const style = getComputedStyle(root);
      palette = ["--ink", "--terra-art", "--sage-art", "--paper"].map((token) => style.getPropertyValue(token).trim());
    };
    readPalette();
    const point = (line, index) => {
      const a = observed[line][index],
        b = imagined[line][index];
      const envelope = Math.sin((index / segments) * Math.PI);
      return [a[0] + (b[0] - a[0]) * blend + currentX * 13 * envelope, a[1] + (b[1] - a[1]) * blend + currentY * 10 * envelope];
    };
    const draw = () => {
      context.setTransform(scale, 0, 0, scale, 0, 0);
      context.clearRect(0, 0, 640, 440);
      context.lineWidth = 0.7;
      for (let line = 0; line < lines; line++) {
        context.beginPath();
        for (let index = 0; index <= segments; index++) {
          const [x, y] = point(line, index);
          if (index === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.strokeStyle = palette[line % 8 === 0 ? 1 : line % 5 === 0 ? 2 : 0];
        context.globalAlpha = line % 8 === 0 ? 0.7 : 0.28;
        context.stroke();
      }
      context.globalAlpha = 1;
      for (let node = 0; node < 7; node++) {
        const [x, y] = point(3 + node * 4, 10 + node * 12);
        context.beginPath();
        context.arc(x, y, 3.3, 0, Math.PI * 2);
        context.fillStyle = palette[3];
        context.fill();
        context.strokeStyle = node % 2 ? palette[2] : palette[1];
        context.lineWidth = 0.9;
        context.stroke();
      }
    };
    const tick = (time) => {
      canvas.dataset.settled = "false";
      frame = 0;
      const dt = Math.min(40, last ? time - last : 16);
      last = time;
      const ease = 1 - Math.exp(-dt / 160);
      blend += (target - blend) * ease;
      currentX += (pointerX - currentX) * ease;
      currentY += (pointerY - currentY) * ease;
      draw();
      if (Math.abs(blend - target) > 0.0002 || Math.abs(currentX - pointerX) > 0.002 || Math.abs(currentY - pointerY) > 0.002)
        frame = requestAnimationFrame(tick);
      else {
        last = 0;
        canvas.dataset.settled = "true";
      }
    };
    const update = () => {
      if (motion.matches) {
        cancelAnimationFrame(frame);
        frame = 0;
        last = 0;
        blend = target;
        currentX = 0;
        currentY = 0;
        draw();
        canvas.dataset.settled = "true";
      } else if (!frame && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const resize = () => {
      const width = canvas.getBoundingClientRect().width;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(((width * 440) / 640) * dpr);
      scale = canvas.width / 640;
      draw();
    };
    new ResizeObserver(resize).observe(canvas);
    canvas.addEventListener("pointermove", (event) => {
      if (motion.matches || event.pointerType === "touch") return;
      const rect = canvas.getBoundingClientRect();
      pointerX = (event.clientX - rect.left) / rect.width - 0.5;
      pointerY = (event.clientY - rect.top) / rect.height - 0.5;
      update();
    });
    canvas.addEventListener("pointerleave", () => {
      pointerX = 0;
      pointerY = 0;
      update();
    });
    document.addEventListener("editorial:theme", () => {
      readPalette();
      draw();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
        last = 0;
      } else update();
    });
    motion.addEventListener("change", update);
    resize();
    return (mode) => {
      canvas.dataset.settled = "false";
      canvas.dataset.mode = mode;
      target = mode === "designing" ? 1 : 0;
      update();
    };
  }

  const tabs = Array.from(document.querySelectorAll(".research-tabs [role='tab']"));
  const setField = createLineStudy(document.querySelector("#research-field"));
  const setDirection = (mode, remember = false) => {
    for (const tab of tabs) {
      const selected = tab.dataset.mode === mode;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(tab.getAttribute("aria-controls"));
      panel.hidden = !selected;
      if (selected) panel.classList.add("is-changing");
    }
    const caption = document.querySelector(".field-caption-text");
    if (caption) caption.textContent = mode === "designing" ? "Structure, imagined." : "Structure, observed.";
    setField(mode);
    if (remember) history.replaceState(null, "", "#" + mode);
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => setDirection(tab.dataset.mode, true));
    tab.addEventListener("keydown", (event) => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        tabs[next].focus();
        setDirection(tabs[next].dataset.mode, true);
      }
    });
  });
  if (tabs.length) setDirection(location.hash === "#designing" ? "designing" : "understanding");
  window.addEventListener("hashchange", () => {
    if (tabs.length) setDirection(location.hash === "#designing" ? "designing" : "understanding");
  });

  const disclosureAnimations = new Map();
  document.querySelectorAll(".reflection-entry").forEach((details) => {
    const summary = details.querySelector("summary");
    summary.addEventListener("click", (event) => {
      if (motion.matches) return;
      event.preventDefault();
      const expand = details.dataset.expanded === undefined ? !details.open : details.dataset.expanded !== "true";
      details.dataset.expanded = String(expand);
      const from = details.getBoundingClientRect().height;
      disclosureAnimations.get(details)?.cancel();
      details.open = true;
      const to = expand ? details.getBoundingClientRect().height : summary.getBoundingClientRect().height + 1;
      details.style.overflow = "hidden";
      const animation = details.animate([{ height: from + "px" }, { height: to + "px" }], {
        duration: 420,
        easing: "cubic-bezier(.25,.7,.3,1)",
        fill: "both",
      });
      disclosureAnimations.set(details, animation);
      animation.onfinish = () => {
        details.open = expand;
        details.style.overflow = "";
        disclosureAnimations.delete(details);
        animation.cancel();
      };
    });
    details.addEventListener("toggle", () => {
      if (!disclosureAnimations.has(details)) details.dataset.expanded = String(details.open);
    });
  });
  motion.addEventListener("change", () => {
    if (motion.matches) disclosureAnimations.forEach((animation) => animation.finish());
  });

  if (document.querySelector(".reading-progress")) {
    let pending = false;
    const updateProgress = () => {
      pending = false;
      const available = document.documentElement.scrollHeight - innerHeight;
      root.style.setProperty("--read-progress", (available > 0 ? Math.min(100, (scrollY / available) * 100) : 0) + "%");
    };
    const schedule = () => {
      if (!pending) {
        pending = true;
        requestAnimationFrame(updateProgress);
      }
    };
    window.addEventListener("scroll", schedule, { passive: true });
    new ResizeObserver(schedule).observe(document.body);
    updateProgress();
  }
})();
