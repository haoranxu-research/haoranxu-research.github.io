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
  let themeTransition;
  const setTheme = (theme) => {
    const update = () => {
      root.dataset.theme = theme;
      syncThemeButton();
      document.dispatchEvent(new Event("editorial:theme"));
    };
    if (!motion.matches && document.startViewTransition) {
      themeTransition?.skipTransition();
      themeTransition = document.startViewTransition(update);
    } else {
      update();
    }
  };
  themeButton?.addEventListener("click", () => {
    const theme = root.dataset.theme === "dark" ? "light" : "dark";
    setTheme(theme);
    try {
      localStorage.setItem("theme", theme);
    } catch (_) {}
  });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
    let manual = null;
    try {
      manual = localStorage.getItem("theme");
    } catch (_) {}
    if (!manual || manual === "system") setTheme(event.matches ? "dark" : "light");
  });
  motion.addEventListener("change", () => {
    if (motion.matches) themeTransition?.skipTransition();
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
    const segments = 256;
    const observed = [];
    const imagined = [];
    const smoothstep = (value) => {
      const t = Math.max(0, Math.min(1, value));
      return t * t * (3 - 2 * t);
    };
    for (let line = 0; line < lines; line++) {
      const a = [],
        b = [];
      const phase = line * 0.11;
      for (let index = 0; index <= segments; index++) {
        const angle = (index / segments) * Math.PI * 2;
        const waveX = 320 + Math.cos(angle) * 1000;
        const u = (waveX + 180) / 1040;
        // The wave is the lower slice of a much larger smooth closed form.
        // Both shapes share the same winding; the initial return is offscreen.
        // Use a smooth periodic curve throughout, so a cropped shoulder cannot
        // become an angular bend as it enters the frame during deformation.
        const sine = Math.sin(angle);
        const waveY =
          -1000 +
          sine * (1220 + (line - (lines - 1) / 2) * 5.3 + Math.sin(u * Math.PI * 2 + phase) * 40 + Math.sin(u * Math.PI * 3 - phase * 0.6) * 15);
        a.push([waveX, waveY]);
        const radius = 77 + line * 3.35;
        b.push([
          320 + Math.cos(angle) * radius * 1.25 + Math.sin(angle * 2 + phase * 0.2) * 18,
          220 + Math.sin(angle) * radius * 0.82 + Math.sin(angle * 3 + phase * 0.2) * 13,
        ]);
      }
      observed.push(a);
      imagined.push(b);
    }
    let shapeBlend = 0;
    let blend = 0,
      target = 0,
      frame = 0,
      last = 0,
      elapsed = 0,
      inView = true;
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
      const lower = Math.floor(index);
      const upper = Math.min(lower + 1, segments);
      const fraction = index - lower;
      const a = observed[line][lower],
        an = observed[line][upper];
      const b = imagined[line][lower],
        bn = imagined[line][upper];
      const ax = a[0] + (an[0] - a[0]) * fraction;
      const ay = a[1] + (an[1] - a[1]) * fraction;
      const bx = b[0] + (bn[0] - b[0]) * fraction;
      const by = b[1] + (bn[1] - b[1]) * fraction;
      const x = ax + (bx - ax) * shapeBlend;
      const y = ay + (by - ay) * shapeBlend;
      const envelope = Math.sin((index / segments) * Math.PI);
      const driftX = motion.matches ? 0 : Math.sin(elapsed * 0.18 + y * 0.007 + line * 0.025) * 5;
      const driftY = motion.matches ? 0 : Math.sin(elapsed * 0.24 + x * 0.006 + line * 0.06) * 4;
      return [x + (currentX * 13 + driftX) * envelope, y + (currentY * 10 + driftY) * envelope];
    };
    const draw = () => {
      // A single continuous deformation of an already-complete field.
      // The hidden return enters across the crop, never as a joining stroke.
      shapeBlend = smoothstep(blend);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      context.clearRect(0, 0, 640, 440);
      context.lineWidth = 0.7;
      // One continuously deforming field at fixed opacity, not a crossfade.
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
        const u = (0.19 + node * 0.018) * (1 - shapeBlend) + ((10 + node * 12) / 96) * shapeBlend;
        const progress = (u * segments + (motion.matches ? 0 : elapsed * 0.4)) % segments;
        const [x, y] = point(3 + node * 4, progress);
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
      frame = 0;
      if (last && time - last < 1000 / 30 - 1) {
        frame = requestAnimationFrame(tick);
        return;
      }
      const dt = Math.min(67, last ? time - last : 16);
      last = time;
      elapsed += dt / 1000;
      const ease = 1 - Math.exp(-dt / 160);
      blend += Math.sign(target - blend) * Math.min(Math.abs(target - blend), dt / 2600);
      currentX += (pointerX - currentX) * ease;
      currentY += (pointerY - currentY) * ease;
      draw();
      const settling = Math.abs(blend - target) > 0.0002 || Math.abs(currentX - pointerX) > 0.002 || Math.abs(currentY - pointerY) > 0.002;
      canvas.dataset.settled = String(!settling);
      // Settled refers to the mode transition, not the quiet ambient flow.
      if (inView && !document.hidden && !motion.matches) frame = requestAnimationFrame(tick);
      else last = 0;
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
      } else if (!frame && inView && !document.hidden) frame = requestAnimationFrame(tick);
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
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        ([entry]) => {
          inView = entry.isIntersecting;
          if (inView) update();
          else {
            cancelAnimationFrame(frame);
            frame = 0;
            last = 0;
          }
        },
        { rootMargin: "80px" }
      ).observe(canvas);
    }
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

  document.querySelectorAll("[data-abstract-toggle]").forEach((button) => {
    const abstract = document.getElementById(button.getAttribute("aria-controls"));
    if (!abstract) return;
    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      abstract.hidden = expanded;
    });
  });

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
