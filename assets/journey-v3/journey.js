// One world and one clock for the gallery, fullscreen and Reflection frame.
const initialTime = Number(params.get("t"));
let elapsed = Number.isFinite(initialTime) ? Math.max(0, initialTime) : 0,
  distance = Number(params.get("d")) || elapsed * 23;
let previews = {};
for (const k of ["day", "season", "weather"]) if (params.has(k) && Number.isFinite(Number(params.get(k)))) previews[k] = Number(params.get(k));
if (params.has("scene")) {
  const type = World.registry.findIndex((s) => s.id === params.get("scene"));
  for (let i = 0; i < 10; i++)
    if (World.type(i) === type) {
      distance = (World.boundary(i) + World.boundary(i + 1)) / 2;
      break;
    }
}
const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
let playing = !motionPreference.matches,
  speed = 1,
  last = 0,
  lastFrame = 0,
  width = 0,
  height = 0,
  pixelRatio = 1;
let visible = !document.hidden,
  inViewport = true,
  lastChapter = -1,
  renderCount = 0;
const art = document.querySelector(".artwork");
function resize() {
  const b = art.getBoundingClientRect();
  width = b.width;
  height = b.height;
  pixelRatio = Math.min(devicePixelRatio || 1, embedded ? 1.35 : 1.8, 2400 / Math.max(1, width));
  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  render();
}
function camera() {
  const scale = Math.max(width / W, height / H);
  return { scale, cropX: (W - width / scale) * 0.43, cropY: (H - height / scale) * 0.43 };
}
function render() {
  if (!width || !height) return;
  const a = World.clock(elapsed, previews),
    cam = camera();
  const weather = World.weather(distance, elapsed, a, previews.weather);
  a.rain = weather.rain;
  a.sky = rgb(a.sky, rgb([130, 150, 158], [29, 43, 65], a.night), weather.rain * 0.45);
  a.horizon = rgb(a.horizon, rgb([189, 196, 185], [62, 76, 94], a.night), weather.rain * 0.4);
  ctx.setTransform(pixelRatio * cam.scale, 0, 0, pixelRatio * cam.scale, -cam.cropX * pixelRatio * cam.scale, -cam.cropY * pixelRatio * cam.scale);
  Painting.render(a, previews.weather);
  const here = World.at(distance);
  if (here.region !== lastChapter) {
    lastChapter = here.region;
    const def = World.registry[here.type];
    document.querySelector("#chapterName").textContent = def.name;
    document.querySelector("#chapterNumber").textContent = String(here.region + 1).padStart(2, "0");
    document.querySelector("#sceneLabel").textContent = def.note;
  }
  renderCount++;
}
new ResizeObserver(resize).observe(art);
document.addEventListener("visibilitychange", () => {
  visible = !document.hidden;
  last = 0;
});
new IntersectionObserver(
  ([entry]) => {
    inViewport = entry.isIntersecting;
    last = 0;
  },
  { threshold: 0 }
).observe(art);
function frame(now) {
  requestAnimationFrame(frame);
  if (!visible || !inViewport) {
    last = 0;
    return;
  }
  if (now - lastFrame < 1000 / (embedded ? 24 : 30) - 0.5) return;
  const dt = last ? Math.min((now - last) / 1000, 0.12) : 0;
  last = now;
  lastFrame = now;
  if (playing) {
    elapsed += dt * speed;
    distance += dt * 23 * speed;
    render();
  }
}
const playButton = document.querySelector("#playButton");
function updatePlay() {
  playButton.textContent = playing ? "Ⅱ" : "▷";
  playButton.setAttribute("aria-label", playing ? "暂停旅途" : "继续旅途");
  playButton.title = playing ? "暂停旅途" : "继续旅途";
}
function setPlaying(value) {
  playing = value;
  last = 0;
  updatePlay();
}
function togglePlay() {
  setPlaying(!playing);
}
playButton.addEventListener("click", togglePlay);
updatePlay();
motionPreference.addEventListener("change", (event) => {
  if (event.matches) setPlaying(false);
});
const speeds = [0.5, 1, 2];
function setSpeed(s) {
  speed = s;
  document.querySelector("#paceButton").innerHTML = `${speed === 0.5 ? "慢行" : speed === 2 ? "轻快" : "悠游"} <span>${speed}×</span>`;
  document.querySelector("#paceButton").setAttribute("aria-label", `旅行速度：${speed}倍`);
}
document.querySelector("#paceButton").addEventListener("click", () => setSpeed(speeds[(speeds.indexOf(speed) + 1) % speeds.length]));
async function fullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (art.requestFullscreen) await art.requestFullscreen();
    else location.href = "?mode=standalone";
  } catch {
    location.href = "?mode=standalone";
  }
}
document.querySelector("#fullscreenButton").addEventListener("click", fullscreen);
document.querySelector("#enterButton").addEventListener("click", () => {
  const url = new URL(location.href);
  url.pathname = url.pathname.replace(/frame\.html$/, "index.html");
  url.searchParams.set("mode", "standalone");
  url.searchParams.set("t", elapsed.toFixed(2));
  url.searchParams.set("d", distance.toFixed(2));
  url.searchParams.delete("scene");
  window.open(url.href, "_blank", "noopener");
});
const about = document.querySelector("#about"),
  aboutButton = document.querySelector("#aboutButton");
function showAbout(value) {
  about.hidden = !value;
  aboutButton.setAttribute("aria-expanded", String(value));
  (value ? document.querySelector("#closeAbout") : aboutButton).focus();
}
aboutButton.addEventListener("click", () => showAbout(about.hidden));
document.querySelector("#closeAbout").addEventListener("click", () => showAbout(false));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !about.hidden) showAbout(false);
  if (e.target.closest("button,a,input,textarea,select")) return;
  if (e.code === "Space") {
    e.preventDefault();
    togglePlay();
  }
  if (e.key.toLowerCase() === "f") fullscreen();
  if (e.key === "ArrowRight") {
    e.preventDefault();
    setSpeed(speeds[Math.min(2, speeds.indexOf(speed) + 1)]);
  }
  if (e.key === "ArrowLeft") {
    e.preventDefault();
    setSpeed(speeds[Math.max(0, speeds.indexOf(speed) - 1)]);
  }
});
window.journey = {
  get state() {
    return {
      elapsed,
      distance,
      playing,
      speed,
      chapter: lastChapter,
      embedded,
      visible,
      inViewport,
      renderCount,
      style: "living-world-v3",
      environment: World.at(distance),
      light: World.clock(elapsed, previews),
      weather: World.weather(distance, elapsed, World.clock(elapsed, previews), previews.weather),
      assets: { clouds: 24, trees: 64, flowers: 8, bags: World.cacheSize },
    };
  },
  seek(seconds) {
    if (Number.isFinite(seconds)) {
      elapsed = Math.max(0, seconds);
      distance = elapsed * 23;
      render();
    }
  },
  render,
  pause() {
    setPlaying(false);
  },
  play() {
    setPlaying(true);
  },
  debug: {
    catalog: World.registry.map(({ id, name }) => ({ id, name })),
    set(options = {}) {
      setPlaying(false);
      if (options.reset) {
        previews = {};
        elapsed = 0;
        distance = 0;
      }
      if (Number.isFinite(options.time)) elapsed = Math.max(0, options.time);
      if (Number.isFinite(options.distance)) distance = Math.max(0, options.distance);
      for (const k of ["day", "season", "weather"])
        if (k in options) {
          if (options[k] === null) delete previews[k];
          else if (Number.isFinite(options[k])) previews[k] = options[k];
        }
      if (options.scene) {
        const type = World.registry.findIndex((s) => s.id === options.scene);
        if (type < 0) throw Error("Unknown environment");
        for (let i = 0; i < 10; i++)
          if (World.type(i) === type) {
            distance = (World.boundary(i) + World.boundary(i + 1)) / 2;
            break;
          }
      }
      lastChapter = -1;
      render();
      return window.journey.state;
    },
    route(minutes = 60) {
      const out = [];
      for (let i = 0; World.boundary(i) < minutes * 60 * 23; i++)
        out.push({ region: i, id: World.registry[World.type(i)].id, startSeconds: World.boundary(i) / 23, endSeconds: World.boundary(i + 1) / 23 });
      return out;
    },
  },
};
// Optional parent-page control, limited to the actual embedding window.
window.addEventListener("message", (event) => {
  if (!embedded || event.source !== window.parent) return;
  if (event.data?.type === "still-wandering:pause") setPlaying(false);
  if (event.data?.type === "still-wandering:resume" && (!motionPreference.matches || event.data.userInitiated === true)) setPlaying(true);
});
resize();
render();
document.body.classList.remove("no-js");
requestAnimationFrame(frame);
