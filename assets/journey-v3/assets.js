// Original soft assets and train, adapted only in this independent edition.
// All imagery is drawn locally. No image downloads, rendering libraries, or build step.
const canvas = document.querySelector("#world");
const ctx = canvas.getContext("2d", { alpha: false });
const params = new URLSearchParams(location.search);
const embedded = params.get("mode") === "embed" || location.pathname.endsWith("/frame.html");
const standalone = params.get("mode") === "standalone";
document.body.classList.toggle("embedded", embedded);
document.body.classList.toggle("standalone", standalone);
const W = 1600,
  H = 1000,
  TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const mix = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash(n) {
  return rng(Math.imul(n + 1913, 374761393))();
}
function rgb(a, b, t) {
  return a.map((v, i) => Math.round(mix(v, b[i], t)));
}
const css = (v, a = 1) => `rgba(${v.join(",")},${a})`;
function make(w, h, paint) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  paint(c.getContext("2d"));
  return c;
}
function oval(c, x, y, rx, ry, color, angle = 0) {
  c.fillStyle = color;
  c.beginPath();
  c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), angle, 0, TAU);
  c.fill();
}
function stroke(c, points, color, width) {
  c.strokeStyle = color;
  c.lineWidth = width;
  c.lineCap = "round";
  c.beginPath();
  points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.stroke();
}
const cloudSprites = [];
for (let k = 0; k < 12; k++)
  cloudSprites.push(
    make(680, 280, (c) => {
      const r = rng(912 + k * 712),
        puffs = [];
      for (let j = 0; j < 30; j++) {
        const x = 65 + r() * 550;
        const envelope = Math.sin((x / 680) * Math.PI);
        puffs.push({ x, y: 178 - r() * 82 * envelope, rx: 25 + r() * 58, ry: 24 + r() * 48 });
      }
      for (const p of puffs) {
        const g = c.createRadialGradient(p.x - p.rx * 0.15, p.y - p.ry * 0.3, 2, p.x, p.y, p.rx * 1.2);
        g.addColorStop(0, "rgba(255,231,194,.34)");
        g.addColorStop(0.48, "rgba(241,205,175,.26)");
        g.addColorStop(0.8, "rgba(184,153,151,.10)");
        g.addColorStop(1, "rgba(184,153,151,0)");
        c.fillStyle = g;
        c.fillRect(p.x - p.rx * 1.3, p.y - p.rx * 1.3, p.rx * 2.6, p.rx * 2.6);
      }
      // Low opacity scumbling builds cloud forms without vector outlines.
      for (let layer = 0; layer < 4; layer++)
        for (const p of puffs) {
          for (let j = 0; j < 100; j++) {
            const angle = r() * TAU,
              rad = Math.sqrt(r());
            const x = p.x + Math.cos(angle) * p.rx * rad,
              y = p.y + Math.sin(angle) * p.ry * rad + layer * 7;
            const light = clamp(1 - (y - 60) / 170),
              warmth = r();
            const color =
              layer === 0
                ? `rgba(157,134,139,${0.035 + r() * 0.05})`
                : `rgba(${Math.round(208 + light * 45)},${Math.round(166 + light * 67 + warmth * 8)},${Math.round(151 + light * 56)},${0.07 + r() * 0.12})`;
            oval(c, x, y, 6 + r() * 18, 2 + r() * 8, color, -0.15 + r() * 0.3);
          }
        }
      for (let j = 0; j < 480; j++) {
        const x = r() * 650,
          y = 170 + r() * 70;
        oval(c, x, y, 9 + r() * 29, 1 + r() * 4, `rgba(249,213,175,${0.015 + r() * 0.035})`);
      }
    })
  );
const texture = make(800, 500, (c) => {
  const r = rng(12);
  for (let i = 0; i < 36000; i++) {
    const v = r() > 0.5 ? 255 : 58;
    c.fillStyle = `rgba(${v},${v - 8},${v - 15},${r() * 0.07})`;
    c.fillRect(r() * 800, r() * 500, 0.4 + r() * 2.3, 0.4 + r() * 1.1);
  }
});
const terrainPaint = make(1200, 600, (c) => {
  const r = rng(3084);
  for (let i = 0; i < 22000; i++) {
    const x = r() * 1200,
      y = r() * 600,
      n = Math.sin(x * 0.013 + Math.sin(y * 0.02)) * Math.cos(y * 0.021 + x * 0.006),
      light = n + r() * 0.8 > 0.25;
    oval(
      c,
      x,
      y,
      2 + r() * 15,
      1 + r() * 4,
      light ? `rgba(242,221,169,${0.02 + r() * 0.11})` : `rgba(40,74,77,${0.015 + r() * 0.07})`,
      -0.35 + r() * 0.6
    );
  }
  for (let i = 0; i < 1800; i++) {
    const x = r() * 1200,
      y = r() * 600;
    stroke(
      c,
      [
        [x, y],
        [x + 4 + r() * 12, y + 1 + r() * 3],
      ],
      `rgba(248,228,188,${r() * 0.07})`,
      0.7
    );
  }
});
const trainSprite = make(470, 150, (c) => {
  // Three warm-lit carriages and a bottle-green locomotive, facing east.
  for (let n = 0; n < 3; n++) {
    const x = 9 + n * 99;
    c.fillStyle = "#3b493c";
    c.fillRect(x, 61, 94, 61);
    c.fillStyle = "#9b5940";
    c.fillRect(x + 2, 64, 89, 51);
    c.fillStyle = "#be8053";
    c.fillRect(x + 3, 65, 87, 4);
    c.fillStyle = "#dca976";
    c.fillRect(x + 2, 108, 89, 3);
    for (let w = 0; w < 4; w++) {
      c.fillStyle = "#423e34";
      c.fillRect(x + 8 + w * 21, 72, 15, 27);
      const g = c.createLinearGradient(0, 72, 0, 99);
      g.addColorStop(0, "#f8dfaa");
      g.addColorStop(1, "#c9905b");
      c.fillStyle = g;
      c.fillRect(x + 10 + w * 21, 74, 11, 21);
      c.fillStyle = "#7d6951";
      c.fillRect(x + 15 + w * 21, 73, 1, 23);
      c.fillStyle = "#ebc091";
      c.fillRect(x + 8 + w * 21, 101, 15, 1);
    }
    c.fillStyle = "#3d4941";
    c.beginPath();
    c.roundRect(x - 2, 54, 98, 12, [7, 7, 2, 2]);
    c.fill();
    stroke(
      c,
      [
        [x + 2, 55],
        [x + 88, 55],
      ],
      "#7d8674",
      2
    );
    c.fillStyle = "#263b36";
    c.fillRect(x + 1, 117, 91, 7);
    c.fillStyle = "#bcb08b";
    for (let j = 0; j < 17; j++) c.fillRect(x + 4 + j * 5, 113, 1, 1);
    stroke(
      c,
      [
        [x + 94, 120],
        [x + 101, 120],
      ],
      "#3b493d",
      3
    );
  }
  c.fillStyle = "#314d43";
  c.fillRect(312, 62, 55, 62);
  c.fillStyle = "#b5a376";
  c.fillRect(316, 66, 46, 3);
  c.fillStyle = "#e6bd76";
  c.fillRect(319, 72, 15, 25);
  c.fillRect(341, 72, 15, 25);
  c.fillStyle = "#3a5144";
  c.fillRect(327, 73, 2, 23);
  c.fillRect(349, 73, 2, 23);
  c.fillStyle = "#273e38";
  c.beginPath();
  c.roundRect(306, 55, 65, 10, 4);
  c.fill();
  stroke(
    c,
    [
      [311, 55],
      [366, 55],
    ],
    "#9c9c76",
    2
  );
  const boiler = c.createLinearGradient(0, 85, 0, 119);
  boiler.addColorStop(0, "#71816a");
  boiler.addColorStop(0.35, "#3f6556");
  boiler.addColorStop(1, "#243e35");
  c.fillStyle = boiler;
  c.beginPath();
  c.roundRect(358, 84, 82, 38, 12);
  c.fill();
  c.fillStyle = "#bba16e";
  c.fillRect(371, 86, 3, 33);
  c.fillRect(419, 86, 3, 34);
  c.fillStyle = "#2d4439";
  c.fillRect(412, 56, 17, 31);
  c.beginPath();
  c.roundRect(406, 52, 29, 8, 2);
  c.fill();
  c.fillStyle = "#a18c5a";
  c.fillRect(413, 54, 15, 2);
  oval(c, 390, 82, 10, 8, "#6f7e58");
  c.fillStyle = "#b2784e";
  c.fillRect(311, 120, 137, 8);
  stroke(
    c,
    [
      [442, 111],
      [459, 130],
      [435, 130],
    ],
    "#374638",
    4
  );
  oval(c, 441, 95, 5, 8, "#e0c17d");
  oval(c, 442, 94, 2, 4, "#ffe6a0");
  // Fine broken paint marks on panels.
  const r = rng(66);
  for (let i = 0; i < 1700; i++) {
    const x = 12 + r() * 420,
      y = 65 + r() * 54;
    c.fillStyle = `rgba(${r() > 0.4 ? "239,203,146" : "38,55,44"},${r() * 0.12})`;
    c.fillRect(x, y, 0.5 + r() * 5, 0.4 + r() * 1.3);
  }
});
function drawBoat(x, y, s, a, seed) {
  ctx.save();
  ctx.translate(x, y + Math.sin(elapsed * 0.8 + seed) * 1.5);
  ctx.scale(s, s);
  stroke(
    ctx,
    [
      [-18, 0],
      [-11, 7],
      [15, 7],
      [24, 0],
    ],
    css(rgb([110, 99, 76], [40, 56, 70], a.night)),
    3
  );
  stroke(
    ctx,
    [
      [0, 0],
      [0, -41],
    ],
    "#c2b998",
    1.3
  );
  ctx.fillStyle = css(rgb([247, 227, 186], [160, 168, 169], a.night));
  ctx.beginPath();
  ctx.moveTo(-2, -39);
  ctx.lineTo(-2, -3);
  ctx.lineTo(-24, -3);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = css(a.horizon, 0.6);
  ctx.beginPath();
  ctx.moveTo(2, -34);
  ctx.lineTo(19, -4);
  ctx.lineTo(2, -4);
  ctx.fill();
  stroke(
    ctx,
    [
      [-25, 12],
      [22, 12],
    ],
    css(a.horizon, 0.3),
    1
  );
  ctx.restore();
}
function drawUmbrella(x, y, s, a, seed) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.rotate(Math.sin(elapsed * 0.65 + seed) * 0.025);
  stroke(
    ctx,
    [
      [0, 0],
      [0, -56],
    ],
    css(rgb([118, 114, 82], [80, 89, 93], a.night)),
    2
  );
  const palette = seed % 2 ? ["#d79c75", "#efd1a1"] : ["#8ba9a0", "#eddbb2"];
  for (let j = 0; j < 4; j++) {
    ctx.fillStyle = palette[j % 2];
    ctx.beginPath();
    ctx.moveTo(0, -66);
    ctx.quadraticCurveTo(-32 + j * 16, -61, -34 + j * 17, -42);
    ctx.quadraticCurveTo(-25 + j * 17, -46, -17 + j * 17, -42);
    ctx.closePath();
    ctx.fill();
  }
  oval(ctx, 0, 4, 28, 3, "#536c5a22");
  stroke(
    ctx,
    [
      [-10, -1],
      [13, -1],
    ],
    "#ccad81",
    2
  );
  ctx.restore();
}
function drawBooth(x, y, s, a) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  oval(ctx, 0, 4, 67, 7, "#4b65532e");
  ctx.fillStyle = css(rgb([182, 124, 86], [91, 83, 85], a.night));
  ctx.fillRect(-37, -90, 74, 90);
  ctx.fillStyle = "#cfaf7b";
  ctx.fillRect(-39, -91, 78, 5);
  for (let j = 0; j < 9; j++)
    stroke(
      ctx,
      [
        [-34 + j * 8, -83],
        [-34 + j * 8, -2],
      ],
      "#745e4c38",
      1
    );
  ctx.fillStyle = "#e5c78e";
  ctx.fillRect(-27, -78, 54, 14);
  ctx.fillStyle = "#594f3e";
  ctx.font = "8px Georgia";
  ctx.textAlign = "center";
  ctx.fillText("T I C K E T S", 0, -68);
  ctx.fillStyle = "#465c50";
  ctx.fillRect(-22, -56, 44, 31);
  ctx.fillStyle = css(rgb([217, 192, 135], [248, 201, 115], a.night));
  ctx.fillRect(-19, -53, 38, 25);
  stroke(
    ctx,
    [
      [0, -53],
      [0, -26],
    ],
    "#6b7259",
    2
  );
  ctx.fillStyle = "#798675";
  ctx.fillRect(-27, -25, 54, 5);
  ctx.fillStyle = "#405e56";
  ctx.beginPath();
  ctx.moveTo(-48, -91);
  ctx.lineTo(-30, -109);
  ctx.lineTo(32, -109);
  ctx.lineTo(47, -91);
  ctx.fill();
  stroke(
    ctx,
    [
      [-32, -108],
      [31, -108],
    ],
    "#a3ac87",
    2
  );
  stroke(
    ctx,
    [
      [26, -109],
      [26, -158],
    ],
    "#85876b",
    1.5
  );
  ctx.fillStyle = "#d6ae77";
  ctx.beginPath();
  ctx.moveTo(27, -156);
  ctx.bezierCurveTo(40, -156 + Math.sin(elapsed) * 3, 39, -146, 55, -148 + Math.sin(elapsed * 1.1) * 4);
  ctx.lineTo(53, -134 + Math.sin(elapsed * 1.1) * 4);
  ctx.bezierCurveTo(39, -133, 39, -144, 27, -141);
  ctx.fill();
  ctx.fillStyle = "#83916b";
  ctx.fillRect(-52, -20, 12, 20);
  for (let i = 0; i < 7; i++) oval(ctx, -50 + hash(i) * 10, -22 - hash(i + 1) * 15, 3, 6, "#738363");
  ctx.restore();
}
function drawTrain(a) {
  const x = 510,
    y = trackY(x) - 142 + Math.sin(elapsed * 3) * 0.45;
  oval(ctx, x + 220, trackY(x + 220) + 2, 220, 5, css(rgb([58, 73, 59], [28, 42, 49], a.night), 0.18));
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(0.022);
  // Underframe shadow and the revolving wheels.
  for (let n = 0; n < 3; n++) for (let w = 0; w < 2; w++) wheel(28 + n * 99 + w * 54, 131, 9);
  wheel(333, 130, 12);
  wheel(371, 129, 15);
  wheel(411, 129, 15);
  ctx.drawImage(trainSprite, 0, 0);
  if (a.night > 0.001) {
    ctx.globalAlpha = a.night;
    ctx.drawImage(M.trainNight, 0, 0);
    ctx.globalAlpha = 1;
  }
  // Reflections belong to each window, with warmer interiors as dusk arrives.
  for (let car = 0; car < 3; car++)
    for (let w = 0; w < 4; w++) {
      const wx = 19 + car * 99 + w * 21;
      ctx.fillStyle = css(rgb([164, 202, 204], [255, 211, 137], a.night), 0.1 + a.night * 0.22);
      ctx.fillRect(wx, 74, 10, 20);
      stroke(
        ctx,
        [
          [wx + 1, 76],
          [wx + 8, 85],
        ],
        css(a.horizon, 0.12 + a.warm * 0.1),
        1.2
      );
    }
  const rod = Math.sin(distance * 0.075) * 6;
  stroke(
    ctx,
    [
      [371 + rod, 130 + Math.cos(distance * 0.075) * 5],
      [411 + rod, 130 + Math.cos(distance * 0.075) * 5],
    ],
    "#baa67c",
    2.7
  );
  // A long, slender plume originates at the actual chimney lip in train coordinates.
  // A 3.2-second lifetime restores the trailing gesture without a cloud-sized puff.
  const steamTone = rgb([248, 236, 214], [166, 182, 193], a.night);
  ctx.save();
  ctx.filter = "blur(1.6px)";
  for (let i = 29; i >= 0; i--) {
    const phase = (((elapsed / 3.2 + i / 30) % 1) + 1) % 1;
    const px = 420 - phase * 245 + Math.sin(phase * 8 + elapsed * 0.6) * phase * 6,
      py = 51 - phase * 89 + Math.sin(phase * 13 + elapsed * 0.8) * phase * 5;
    const size = 4 + phase * 22,
      alpha = smooth(clamp(phase / 0.035)) * (1 - smooth(clamp((phase - 0.38) / 0.62))) * 0.3;
    oval(ctx, px, py, size * 1.7, size * 0.55, css(steamTone, alpha), -0.3);
    oval(ctx, px - 3 * phase, py - 2, size, size * 0.42, css(steamTone, alpha * 0.45), -0.45);
  }
  ctx.restore();
  ctx.restore();
  if (a.night > 0.1) {
    const g = ctx.createRadialGradient(x + 445, y + 99, 1, x + 445, y + 99, 85);
    g.addColorStop(0, `rgba(255,218,151,${a.night * 0.25})`);
    g.addColorStop(1, "rgba(255,218,151,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x + 360, y + 14, 170, 170);
  }
}
function wheel(x, y, r) {
  oval(ctx, x, y, r, r, "#293f38");
  oval(ctx, x, y, r - 2, r - 2, "#4e5c48");
  for (let i = 0; i < 7; i++) {
    const a = distance * 0.075 + (i * TAU) / 7;
    stroke(
      ctx,
      [
        [x, y],
        [x + Math.cos(a) * (r - 3), y + Math.sin(a) * (r - 3)],
      ],
      "#a3926f",
      1
    );
  }
  oval(ctx, x, y, 2, 2, "#c9b182");
}

// Feather cropped pigment at asset edges before the lighting variants are made.
for (const sprite of cloudSprites) {
  const c = sprite.getContext("2d");
  c.save();
  c.globalCompositeOperation = "destination-in";
  let g = c.createLinearGradient(0, 0, sprite.width, 0);
  g.addColorStop(0, "transparent");
  g.addColorStop(0.12, "black");
  g.addColorStop(0.88, "black");
  g.addColorStop(1, "transparent");
  c.fillStyle = g;
  c.fillRect(0, 0, sprite.width, sprite.height);
  g = c.createLinearGradient(0, 0, 0, sprite.height);
  g.addColorStop(0, "transparent");
  g.addColorStop(0.15, "black");
  g.addColorStop(0.84, "black");
  g.addColorStop(1, "transparent");
  c.fillStyle = g;
  c.fillRect(0, 0, sprite.width, sprite.height);
  c.restore();
}
