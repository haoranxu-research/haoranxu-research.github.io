// A single shoreline separates water and ground. Every near object takes its
// footing from that same surface, so coastal transitions never cut a blue polygon
// through a mountain or leave a building floating in a different projection.
function trackY(x) {
  return 738 + 19 * Math.sin((x - 250) / 570);
}
const Painting = (() => {
  const Z = World,
    P = 0.65;
  const coordinate = (d, x, p = P) => d + (x - 740) / p;
  function ground(s) {
    const e = Z.at(s);
    return 535 + e.water * 145 + (Z.noise(s, 1050, 74) - 0.5) * 31 + (Z.noise(s, 320, 311) - 0.5) * e.water * 16;
  }
  function snowAt(e, a) {
    return clamp(a.snow * (0.88 - e.water * 0.72) + e.weights[7] * 0.65);
  }
  function landColor(e, a) {
    const spring = [152, 175, 122],
      autumn = [182, 158, 111];
    let col = e.land.map(Math.round);
    col = rgb(col, spring, a.seasons[0] * 0.16);
    col = rgb(col, autumn, a.seasons[2] * 0.22 * (1 - e.water));
    col = rgb(col, [222, 229, 222], snowAt(e, a) * 0.92);
    return rgb(col, [36, 54, 66], a.night * 0.7);
  }
  const moon = make(90, 90, (c) => {
    oval(c, 45, 45, 25, 25, "#eee4c6");
    c.globalCompositeOperation = "destination-out";
    oval(c, 57, 37, 23, 23, "#000");
  });
  function sky(a) {
    const g = ctx.createLinearGradient(0, 0, 0, 650);
    g.addColorStop(0, css(a.sky));
    g.addColorStop(0.78, css(a.horizon));
    g.addColorStop(1, css(a.low));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    for (let j = 0; j < 70; j++)
      oval(ctx, hash(j) * 1900 - 150 + Math.sin(elapsed * 0.002 + j) * 45, j * 7, 90 + hash(j + 2) * 180, 1 + hash(j + 8) * 3, css(a.horizon, 0.02));
    // Celestial bodies move along closed orbits, clipped below the same horizon.
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, 520);
    ctx.clip();
    if (a.sun.visible) {
      const { x, y } = a.sun,
        g = ctx.createRadialGradient(x, y, 4, x, y, 230);
      g.addColorStop(0, css([255, 225, 164], 0.2 * (1 - a.rain * 0.8)));
      g.addColorStop(1, "rgba(255,225,164,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - 230, y - 230, 460, 460);
      oval(ctx, x, y, 31, 31, css([255, 229, 177], 0.88 * (1 - a.rain * 0.8)));
    }
    if (a.moon.visible) {
      ctx.globalAlpha = a.night;
      ctx.drawImage(moon, a.moon.x - 45, a.moon.y - 45);
      ctx.globalAlpha = 1;
    }
    for (let i = 0; i < 72; i++)
      if (a.night > 0.1) oval(ctx, hash(i + 900) * W, hash(i + 1800) * 490, 0.5 + hash(i) * 0.8, 0.65, css([231, 226, 208], a.night * 0.75));
    ctx.restore();
  }
  function ocean(a) {
    const g = ctx.createLinearGradient(0, 520, 0, 1000);
    g.addColorStop(0, css(rgb(a.water, a.horizon, 0.28)));
    g.addColorStop(0.6, css(a.water));
    g.addColorStop(1, css(rgb(a.water, a.land, 0.2)));
    ctx.fillStyle = g;
    ctx.fillRect(0, 520, W, 480);
    // Inland ground must also underlie feathered terrain edges: otherwise the
    // global water plane leaks through as a blue-grey horizontal seam in snow.
    const inland = ctx.createLinearGradient(0, 0, W, 0);
    for (let x = 0; x <= W; x += 100) {
      const e = Z.at(coordinate(distance, x));
      inland.addColorStop(x / W, css(landColor(e, a), 1 - e.water));
    }
    ctx.fillStyle = inland;
    ctx.fillRect(0, 520, W, 480);
    for (let row = 0; row < 12; row++) {
      const space = 80 + row * 9,
        off = distance * (0.04 + row * 0.027),
        first = Math.floor(off / space);
      for (let i = first - 2; i < first + 23; i++) {
        const seed = i + row * 997,
          x = i * space - off + hash(seed) * 40,
          y = 530 + row * 20 + hash(seed + 4) * 9 + Math.sin(elapsed * 0.38 + seed) * 1.1;
        if (Z.at(coordinate(distance, x)).water < 0.15) continue;
        oval(
          ctx,
          x,
          y,
          3 + hash(seed + 2) * (5 + row * 2),
          0.5 + row * 0.055,
          css(hash(seed) > 0.4 ? a.horizon : rgb(a.water, [31, 74, 91], 0.35), 0.08 + hash(seed + 1) * 0.15)
        );
      }
    }
    const body = a.sun.visible ? a.sun : a.moon;
    for (let i = 0; i < 85; i++) {
      const y = 535 + hash(i + 13) * 220,
        x = body.x + (hash(i + 17) - 0.5) * (y - 480) * 0.7;
      oval(ctx, x + Math.sin(elapsed * 0.5 + i) * 3, y, 2 + hash(i + 11) * 12, 0.8, css(a.horizon, a.sun.visible ? 0.19 : 0.09));
    }
  }
  function mountains(a) {
    for (let layer = 0; layer < 3; layer++) {
      const p = [0.1, 0.17, 0.28][layer],
        points = [];
      for (let x = -40; x <= W + 40; x += 16) {
        const s = coordinate(distance, x, p),
          e = Z.at(s),
          n = Z.noise(s, [2400, 1700, 1300][layer], 200 + layer * 150);
        const altitude = (95 + layer * 14) * (1 - e.water * 0.52) + e.weights[7] * 65 + e.weights[8] * 45;
        const base = 539 + Z.noise(s, 950, 513 + layer) * 14;
        points.push([x, Math.min(base, 530 - n * altitude - 13 - layer * 7 + e.water * 32), base]);
      }
      ctx.beginPath();
      ctx.moveTo(-40, 553);
      points.forEach(([x, y]) => ctx.lineTo(x, y));
      for (let j = points.length - 1; j >= 0; j--) ctx.lineTo(points[j][0], points[j][2]);
      ctx.closePath();
      let ridgeColor = rgb(a.horizon, a.land, 0.35 + layer * 0.12);
      ridgeColor = rgb(ridgeColor, rgb([208, 220, 211], [74, 98, 121], a.night), a.snow * 0.55);
      ctx.fillStyle = css(ridgeColor);
      ctx.fill();
      ctx.save();
      ctx.clip();
      ctx.globalAlpha = 0.2;
      for (let x = -((distance * p) % 1200) - 1200; x < W; x += 1200) ctx.drawImage(terrainPaint, x, 350, 1200, 600);
      ctx.restore();
      // Snow occupies connected lee-side surfaces, with irregular melt edges.
      // Never stroke sampled ridge segments: round caps read as dotted outlines.
      const caps = points.map(([x, y]) => {
        const s = coordinate(distance, x, p),
          e = Z.at(s);
        const cover = clamp((a.snow * 0.7 + e.weights[7] * 0.72) * (1 - e.water * 0.85));
        const drift = Z.noise(s, 260, 81 + layer * 43),
          shelter = Z.noise(s, 730, 533);
        const depth = Math.max(0, (cover - 0.15) * 85) * Math.max(0, drift * 0.9 + shelter * 0.5 - 0.35);
        return { x, y, depth };
      });
      ctx.beginPath();
      caps.forEach((v, j) => (j ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y)));
      for (let j = caps.length - 1; j >= 0; j--) {
        const v = caps[j];
        ctx.lineTo(v.x, v.y + v.depth);
      }
      ctx.closePath();
      ctx.save();
      ctx.filter = "blur(1.2px)";
      ctx.fillStyle = css(rgb(rgb([218, 228, 218], a.horizon, 0.24), [72, 94, 117], a.night * 0.7), 0.67);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.clip();
      ctx.globalAlpha = 0.16;
      for (let x = -((distance * p) % 1200) - 1200; x < W; x += 1200) ctx.drawImage(terrainPaint, x, 350, 1200, 600);
      ctx.restore();
    }
    const haze = ctx.createLinearGradient(0, 480, 0, 565);
    haze.addColorStop(0, css(a.horizon, 0));
    haze.addColorStop(0.65, css(a.horizon, 0.15));
    haze.addColorStop(1, css(a.horizon, 0));
    ctx.fillStyle = haze;
    ctx.fillRect(0, 480, W, 85);
  }
  function groundPath(inset = 0) {
    ctx.beginPath();
    ctx.moveTo(-40, H + 40);
    for (let x = -40; x <= W + 40; x += 16) {
      const s = coordinate(distance, x);
      ctx.lineTo(x, ground(s) + inset * (1 - Z.at(s).water));
    }
    ctx.lineTo(W + 40, H + 40);
    ctx.closePath();
  }
  function terrain(a) {
    groundPath();
    const g = ctx.createLinearGradient(0, 0, W, 0);
    for (let x = 0; x <= W; x += 100) g.addColorStop(x / W, css(landColor(Z.at(coordinate(distance, x)), a)));
    ctx.fillStyle = g;
    ctx.save();
    ctx.filter = "blur(7px)";
    ctx.fill();
    ctx.restore();
    groundPath(12);
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.globalAlpha = 0.24;
    for (let x = -((distance * P) % 1200) - 1200; x < W; x += 1200) ctx.drawImage(terrainPaint, x, 520, 1200, 600);
    ctx.restore();
    // Broken, horizontal edge marks keep the coast airy without a geometric wipe.
    for (let x = -30; x < W + 30; x += 25) {
      const s = coordinate(distance, x),
        e = Z.at(s);
      if (e.water > 0.08) {
        const y = ground(s);
        stroke(
          ctx,
          [
            [x, y + 1],
            [x + 18, y + 1],
          ],
          css(a.horizon, 0.16 + e.water * 0.15),
          1.4
        );
      }
    }
  }
  function rill(x, y, a, seed, gorge = false) {
    const width = gorge ? 102 : 27,
      r = rng(seed * 33 + 91),
      bend = (hash(seed) - 0.5) * 160,
      bank = [];
    for (let j = 0; j <= 45; j++) {
      const d = j / 45,
        yy = y + d * (1030 - y),
        cx = x + Math.sin(d * 5 + seed) * d * 54 + bend * Math.sin(d * Math.PI),
        w = 5 + Math.pow(d, 1.15) * width;
      bank.push({ x: cx, y: yy, w, d });
    }
    const path = (outer) => {
      ctx.beginPath();
      bank.forEach((p, j) => (j ? ctx.lineTo(p.x - p.w - outer * p.d, p.y) : ctx.moveTo(p.x - p.w, p.y)));
      for (let j = bank.length - 1; j >= 0; j--) {
        const p = bank[j];
        ctx.lineTo(p.x + p.w + outer * p.d, p.y);
      }
      ctx.closePath();
    };
    if (gorge) {
      path(48);
      ctx.fillStyle = M.tone([150, 143, 119], a);
      ctx.fill();
    }
    path(0);
    ctx.fillStyle = css(rgb([126, 169, 164], [45, 77, 96], a.night));
    ctx.fill();
    for (let j = 0; j < 120; j++) {
      const p = bank[Math.floor(r() * bank.length)],
        side = r() > 0.5 ? 1 : -1;
      oval(ctx, p.x + side * (p.w + 4 + r() * 20 * p.d), p.y, 2 + r() * 9, 1 + r() * 4, M.tone(j % 3 ? [161, 161, 129] : [113, 137, 114], a), r());
    }
    for (let j = 0; j < 28; j++) {
      const p = bank[Math.floor(r() * bank.length)];
      oval(ctx, p.x + (r() - 0.5) * p.w * 1.4 + Math.sin(elapsed * 0.6 + j) * 2, p.y, 3 + r() * 9, 0.7, css(a.horizon, 0.24));
    }
    if (!gorge) {
      M.pier(x - 35, y + 95, 70, a, seed);
    }
  }
  function fields(a) {
    const space = 600,
      first = Math.floor((distance - 740 / P) / space) - 2;
    for (let i = first; i < first + 9; i++) {
      const s = i * space + hash(i + 94) * 180,
        x = (s - distance) * P + 740,
        e = Z.at(s),
        y = ground(s);
      if (e.weights[3] > 0.15) {
        for (let row = 0; row < 3; row++) {
          const alpha = e.weights[3] * a.bloom * (0.55 + hash(i + row) * 0.3);
          ctx.save();
          ctx.globalAlpha = alpha * (1 - a.night * 0.55);
          ctx.translate(x - 220, y + 10 + row * 48);
          ctx.transform(1, 0, Math.sin(elapsed * 0.35 + i + row) * 0.012, 1, 0, 0);
          ctx.drawImage(M.flowerTiles[(((i + row) % 8) + 8) % 8], 0, 0, 450 + row * 35, 90 + row * 15);
          ctx.restore();
        }
      }
      if (e.weights[9] > 0.3) {
        for (let j = 0; j < 7; j++) {
          const yy = y + 35 + j * 18;
          stroke(
            ctx,
            [
              [x - 160, yy + 15],
              [x - 30, yy],
              [x + 150, yy - 5],
            ],
            M.tone(rgb([163, 155, 105], [215, 223, 210], snowAt(e, a)), a),
            3.5
          );
        }
      }
      if (e.weights[4] > 0.65 && hash(i + 102) > 0.7) rill(x, y + 8, a, i, false);
    }
    const firstRegion = Z.region(distance - 4500),
      lastRegion = Z.region(distance + 4500);
    for (let i = firstRegion; i <= lastRegion; i++)
      if (Z.type(i) === 8) {
        const s = (Z.boundary(i) + Z.boundary(i + 1)) / 2,
          x = (s - distance) * P + 740;
        if (x > -500 && x < 2100) rill(x, ground(s) + 12, a, i, true);
      }
  }
  // Sky clouds have a fixed atmospheric altitude and pass BEHIND mountains.
  // Their broad painted silhouettes are never reused for ground mist or steam.
  function skyClouds(a) {
    const off = distance * 0.035 + elapsed * 0.35,
      first = Math.floor(off / 730) - 2;
    for (let i = first; i < first + 6; i++) {
      const k = (((i + 8) % 12) + 12) % 12,
        x = i * 730 - off,
        y = 55 + hash(i + 10) * 145;
      const width = 730 + hash(i + 20) * 250,
        height = 115 + hash(i + 30) * 48;
      const opacity = 0.35 + hash(i + 40) * 0.12;
      ctx.globalAlpha = opacity * (1 - a.night);
      ctx.drawImage(cloudSprites[k], x, y, width, height);
      ctx.globalAlpha = opacity * a.night;
      ctx.drawImage(M.cloudNight[k], x, y, width, height);
    }
    ctx.globalAlpha = 1;
  }
  // Long contour-following veils, built as feathered ribbons of air rather
  // than puff sprites. Density varies along the world, with no point emitter.
  const mistCanvas = make(400, 250, () => {}),
    mistContext = mistCanvas.getContext("2d");
  const mistPixels = mistContext.createImageData(400, 250);
  function groundMist(a, near = false) {
    const color = rgb(rgb(a.horizon, [210, 224, 213], 0.48), [73, 96, 116], a.night * 0.72);
    const pixels = mistPixels.data;
    pixels.fill(0);
    for (let ix = 0; ix < 400; ix++) {
      const x = ix * 4,
        s = coordinate(distance, x),
        e = Z.at(s);
      for (let layer = 0; layer < (near ? 1 : 2); layer++) {
        const drift = Z.noise(s + elapsed * 2, 850, 631 + layer * 93);
        const center = (ground(s) + (near ? 255 : layer * 63 + 13) + Math.sin(s / 620 + elapsed * 0.025) * 5) / 4;
        const width = ((near ? 26 : 34 + layer * 12) * (0.65 + drift * 0.65)) / 4;
        const density = e.mist * (0.28 + drift * 0.55) * (near ? 0.15 : 0.43);
        for (let iy = Math.max(0, Math.floor(center - width * 2)); iy < Math.min(250, center + width * 2); iy++) {
          const u = (iy - center) / width,
            alpha = Math.exp(-u * u * 2) * density;
          const k = (iy * 400 + ix) * 4;
          pixels[k] = color[0];
          pixels[k + 1] = color[1];
          pixels[k + 2] = color[2];
          pixels[k + 3] = Math.min(255, pixels[k + 3] + Math.round(alpha * 255));
        }
      }
    }
    mistContext.putImageData(mistPixels, 0, 0);
    ctx.drawImage(mistCanvas, 0, 0, W, H);
  }
  function distantTrees(a) {
    const space = 410,
      first = Math.floor((distance - 740 / P) / space) - 2;
    for (let i = first; i < first + 10; i++) {
      const s = i * space + hash(i + 17) * 120,
        e = Z.at(s),
        x = (s - distance) * P + 740;
      if (e.trees < 0.5 || hash(i + 78) > 0.84) continue;
      const feet = Math.max(ground(s) + 12, 645);
      for (let j = 0; j < 3; j++)
        M.tree(x + j * 30, feet + hash(i + j) * 12, 0.42 + hash(i + j + 9) * 0.14, e.weights[4] > 0.5 ? 3 : 5 + ((i + j) % 3), a, 0.45);
    }
  }
  function station(x, y, a, seed, snow) {
    M.building(x, y, 0.95, "station", seed, a, snow);
    M.fence(x - 105, y + 4, 210, seed, a, snow);
    M.lamp(x - 83, y, 1, a);
    M.lamp(x + 83, y, 1, a);
    ctx.fillStyle = M.tone([231, 215, 175], a);
    ctx.fillRect(x - 26, y - 87, 52, 12);
    ctx.fillStyle = M.tone([83, 108, 90], a);
    ctx.font = "7px Georgia";
    ctx.textAlign = "center";
    ctx.fillText(["FERN", "MOSS", "WILLOW", "PINE"][seed % 4], x, y - 78);
    stroke(
      ctx,
      [
        [x + 48, y - 20],
        [x + 79, y - 20],
      ],
      M.tone([179, 154, 117], a),
      3
    );
    stroke(
      ctx,
      [
        [x + 52, y - 20],
        [x + 52, y - 6],
      ],
      M.tone([118, 131, 102], a),
      2
    );
  }
  function objects(a) {
    const space = 360,
      first = Math.floor((distance - 740 / P) / space) - 3;
    for (let i = first; i < first + 14; i++) {
      const s = i * space + hash(i + 53) * 150,
        x = (s - distance) * P + 740;
      if (x < -400 || x > 1900) continue;
      const e = Z.at(s),
        choice = hash(i + 502);
      let type = 0,
        sum = 0;
      for (let j = 0; j < e.weights.length; j++) {
        sum += e.weights[j];
        if (choice <= sum) {
          type = j;
          break;
        }
      }
      const y = Math.max(ground(s) + 24, 705 + hash(i + 44) * 14),
        scale = 0.72 + hash(i + 12) * 0.28,
        snow = snowAt(e, a),
        chance = hash(i + 93);
      const ri = e.region,
        landmark = Math.floor((Z.boundary(ri) + (Z.boundary(ri + 1) - Z.boundary(ri)) * (0.4 + Z.hash(ri + 60) * 0.2)) / space) === i;
      if (type === 0) {
        if (chance < 0.15) M.building(x, y - 15, 0.65, "cabin", i, a, snow);
        else if (chance < 0.42) M.tree(x, y, scale, Math.abs(i) % 8, a, 0.72);
      } else if (type === 1) {
        if (landmark) {
          drawBooth(x, y, scale, a);
          if (snow > 0.1)
            stroke(
              ctx,
              [
                [x - 29, y - 109 * scale],
                [x + 30, y - 109 * scale],
              ],
              M.tone([229, 231, 218], a),
              3 * snow
            );
        } else if (chance < 0.65) {
          const open = clamp(a.seasons[0] * 0.55 + a.seasons[1] + a.seasons[2] * 0.3);
          ctx.globalAlpha = open;
          drawUmbrella(x, y, scale, a, i);
          ctx.globalAlpha = 1;
          stroke(
            ctx,
            [
              [x, y],
              [x, y - 53 * scale],
            ],
            M.tone([142, 143, 108], a),
            1.5
          );
          ctx.globalAlpha = 1 - open;
          ctx.fillStyle = M.tone(i % 2 ? [187, 155, 132] : [142, 170, 155], a);
          ctx.beginPath();
          ctx.moveTo(x, y - 63 * scale);
          ctx.lineTo(x - 5 * scale, y - 27 * scale);
          ctx.lineTo(x + 5 * scale, y - 28 * scale);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      } else if (type === 2) {
        if (landmark) station(x, y, a, i, snow);
        else if (chance < 0.78)
          for (let j = 0; j < 2 + Math.floor(hash(i) * 2); j++)
            M.tree(x + j * 45, y + hash(i + j) * 9, scale * (0.85 + hash(i + j) * 0.2), 5 + ((i + j) % 3), a);
      } else if (type === 3) {
        if (chance < 0.12) M.building(x, y, 0.65, "cottage", i, a, snow);
        else if (chance < 0.28) M.fence(x - 45, y, 95, i, a, snow);
      } else if (type === 4) {
        if (chance < 0.8)
          for (let j = 0; j < 2 + (i % 2); j++)
            M.tree(x + j * 45, y + hash(i + j) * 8, scale * (0.85 + hash(i + j + 7) * 0.22), 3 + ((i + j) % 2), a);
        if (chance < 0.32) M.fence(x - 75, y + 8, 120, i, a, snow);
      } else if (type === 5) {
        if (chance > 0.7) continue;
        // Separate houses, a lane and lamps make this a settlement rather than a recoloured station.
        stroke(
          ctx,
          [
            [x - 110, y + 4],
            [x + 125, y + 4],
          ],
          M.tone([163, 170, 152], a),
          11
        );
        for (let j = 0; j < 2; j++) M.building(x - 45 + j * 87, y, scale * (0.9 + hash(i + j) * 0.2), "town", i * 7 + j, a, snow);
        M.lamp(x + 112, y, 1, a);
        const wet = Z.weather(s, elapsed, a).rain;
        if (wet > 0.15 && a.night > 0.2)
          for (let j = 0; j < 5; j++)
            oval(ctx, x + 112 + (hash(i + j) - 0.5) * 18, y + 12 + j * 7, 2 + hash(j) * 7, 0.8, css([232, 202, 145], wet * a.night * 0.2));
      } else if (type === 6) {
        if (landmark) {
          M.lighthouse(x - 55, ground(s) - 37, 0.8, a, i);
          M.pier(x - 160, ground(s) - 3, 205, a, i);
        } else if (chance < 0.63) {
          M.building(x, y, scale, "warehouse", i, a, snow);
          M.pier(x - 88, ground(s) + 7, 90, a, i);
        }
        M.boat(x - 67, ground(s) - 31, 0.65, i, a);
      } else if (type === 7) {
        if (landmark || chance < 0.2) M.building(x, y, scale, "cabin", i, a, snow);
        else if (chance < 0.68) {
          M.tree(x, y, scale, 5 + (i % 3), a);
          M.fence(x + 45, y, 110, i, a, snow);
        }
      } else if (type === 8) {
        if (chance < 0.5) M.tree(x, y, scale * 0.75, 5 + (i % 3), a, 0.85);
        else if (chance > 0.93) M.building(x, y, 0.55, "cabin", i, a, snow);
      } else if (type === 9) {
        if (landmark) M.windmill(x, y, 1, a, i);
        else if (chance < 0.42) {
          M.building(x, y, scale, "farm", i, a, snow);
          M.fence(x - 100, y + 7, 190, i, a, snow);
        } else if (chance < 0.7) M.tree(x, y, scale, Math.abs(i) % 3, a);
      }
      // Sparse long-journey discoveries; not an always-visible layer of effects.
      if (ri >= 8 && hash(i + 806) > 0.988 && e.water < 0.2) {
        if (i % 2 === 0) M.waterTower(x + 108, y, a, i);
        else {
          stroke(
            ctx,
            [
              [x + 92, y],
              [x + 92, y - 49],
            ],
            M.tone([126, 140, 111], a),
            2
          );
          ctx.fillStyle = M.tone([203, 197, 153], a);
          ctx.fillRect(x + 82, y - 54, 22, 14);
          ctx.fillStyle = M.tone([95, 119, 101], a);
          ctx.font = "6px Georgia";
          ctx.textAlign = "center";
          ctx.fillText("FARTHER", x + 93, y - 44);
        }
      }
    }
    // Offshore boats are bound to coastal positions and stay behind the land.
  }
  function offshore(a) {
    const p = 0.2,
      space = 600,
      off = distance * p,
      first = Math.floor((off - 740) / space) - 2;
    for (let i = first; i < first + 7; i++) {
      const s = (i * space) / p,
        x = i * space - off + 740,
        e = Z.at(s);
      if (e.water > 0.7 && hash(i + 39) > 0.45) M.boat(x, 574 + hash(i + 83) * 40, 0.5 + hash(i + 9) * 0.22, i, a);
    }
  }
  function railway(a) {
    const space = 174,
      first = Math.floor(distance / space) - 2;
    for (let i = first; i < first + 14; i++) {
      const x = i * space - distance,
        y = trackY(x),
        ny = trackY(x + space),
        s = coordinate(distance, x, 1),
        e = Z.at(s);
      const high = e.weights[0] + e.weights[8] + e.weights[1] * 0.8;
      if (high > 0.18) {
        ctx.save();
        ctx.globalAlpha = clamp(high * 1.4);
        ctx.fillStyle = M.tone([147, 136, 106], a);
        ctx.beginPath();
        ctx.moveTo(x - 15, y + 17);
        ctx.lineTo(x + space + 15, ny + 17);
        ctx.lineTo(x + space + 15, 1050);
        ctx.lineTo(x + space - 19, 1050);
        ctx.lineTo(x + space - 19, ny + 120);
        ctx.bezierCurveTo(x + space - 19, ny + 40, x + 19, y + 43, x + 19, y + 120);
        ctx.lineTo(x + 19, 1050);
        ctx.lineTo(x - 15, 1050);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = M.tone([200, 180, 136], a);
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(x + 20, y + 120);
        ctx.bezierCurveTo(x + 20, y + 44, x + space - 20, ny + 44, x + space - 20, ny + 120);
        ctx.stroke();
        for (let j = 0; j < 12; j++)
          stroke(
            ctx,
            [
              [x - 12, y + 39 + j * 23],
              [x + 12, y + 40 + j * 23],
            ],
            M.tone([122, 124, 100], a),
            0.8
          );
        ctx.restore();
      } else if (e.weights[6] > 0.4) {
        for (let j = 0; j < 3; j++)
          stroke(
            ctx,
            [
              [x + j * 58, y + 13],
              [x + j * 58, 1000],
            ],
            M.tone([117, 130, 110], a),
            5
          );
      } else {
        ctx.fillStyle = M.tone([145, 150, 119], a);
        ctx.beginPath();
        ctx.moveTo(x - 10, y + 14);
        ctx.lineTo(x + space + 10, ny + 14);
        ctx.lineTo(x + space + 20, ny + 40);
        ctx.lineTo(x - 20, y + 40);
        ctx.fill();
      }
    }
    const deck = [];
    for (let x = -20; x < W + 20; x += 14) deck.push([x, trackY(x) + 11]);
    stroke(ctx, deck, M.tone([111, 123, 100], a), 17);
    stroke(
      ctx,
      deck.map(([x, y]) => [x, y - 8]),
      M.tone([207, 190, 147], a),
      5
    );
    for (let i = Math.floor(distance / 23) - 2; i < Math.floor(distance / 23) + 74; i++) {
      const x = i * 23 - distance;
      stroke(
        ctx,
        [
          [x - 5, trackY(x) - 2],
          [x + 9, trackY(x) + 5],
        ],
        M.tone([104, 113, 91], a),
        2.8
      );
    }
    for (const dy of [-3, 3])
      stroke(
        ctx,
        deck.map(([x]) => [x, trackY(x) + dy]),
        M.tone(dy < 0 ? [227, 203, 160] : [120, 128, 106], a),
        1.4
      );
    const snow = a.snow * 0.75;
    if (snow > 0.05)
      stroke(
        ctx,
        deck.map(([x, y]) => [x, y - 7]),
        css(rgb([230, 235, 226], [121, 143, 158], a.night), snow),
        2
      );
  }
  function atmosphere(a, override) {
    // Flocks arrive, pass, and leave long quiet gaps.
    const episode = Math.floor(elapsed / 57),
      f = elapsed / 57 - episode;
    if (hash(episode + 97) > 0.5 && f < 0.5)
      for (let i = 0; i < 3; i++) {
        const x = -100 + f * 3600 + i * 37,
          y = 305 + hash(episode + 4) * 70 + Math.sin(elapsed * 0.15 + i) * 8,
          w = Math.sin(elapsed * 2 + i) * 3;
        stroke(
          ctx,
          [
            [x - 6, y - w - 2],
            [x, y],
            [x + 6, y - w - 2],
          ],
          M.tone([103, 122, 112], a, 0.2),
          1.1
        );
      }
    for (let i = 0; i < 95; i++) {
      const x = hash(i + 521) * 1800 - 100 + Math.sin(elapsed * 0.08 + i) * 20,
        s = coordinate(distance, x),
        weather = Z.weather(s, elapsed, a, override),
        r = hash(i + 903);
      if (r < weather.rain * 0.72) {
        const y = ((hash(i + 633) * 1200 + elapsed * 220) % 1200) - 100;
        stroke(
          ctx,
          [
            [x, y],
            [x - 3, y + 12],
          ],
          css(rgb([170, 190, 193], [105, 132, 158], a.night), 0.17 + weather.rain * 0.13),
          0.7
        );
      } else if (r < weather.rain * 0.72 + weather.snow * 0.8) {
        const y = ((hash(i + 633) * 1200 + elapsed * 15) % 1200) - 100;
        oval(ctx, x + Math.sin(elapsed * 0.3 + i) * 15, y, 1 + hash(i + 3) * 1.2, 1, css(rgb([239, 241, 230], [172, 190, 205], a.night), 0.3));
      }
      if (i < 12 && a.seasons[2] > 0.2 && Z.at(s).trees > 0.5) {
        const y = 600 + ((hash(i + 13) * 400 + elapsed * 17) % 400);
        oval(
          ctx,
          x + Math.sin(elapsed * 0.7 + i) * 14,
          y,
          2.5,
          1.1,
          css(rgb([205, 158, 90], [91, 105, 101], a.night), a.seasons[2] * 0.7),
          elapsed * 0.5 + i
        );
      }
    }
    const e = Z.at(distance),
      rain = Z.weather(distance, elapsed, a, override).rain;
    if (rain > 0.1) {
      const g = ctx.createLinearGradient(0, 430, 0, 810);
      g.addColorStop(0, css(a.horizon, 0));
      g.addColorStop(0.5, css(a.horizon, rain * 0.1));
      g.addColorStop(1, css(a.horizon, 0));
      ctx.fillStyle = g;
      ctx.fillRect(0, 430, W, 380);
    }
  }
  function foreground(a) {
    const space = 54,
      off = distance * 1.1,
      first = Math.floor(off / space) - 2;
    for (let i = first; i < first + 35; i++) {
      const x = i * space - off,
        s = coordinate(distance, x, 1.1),
        e = Z.at(s),
        y = 984 + hash(i + 2) * 40;
      if (hash(i + 7) > 1 - e.water * 0.65) continue;
      const snow = snowAt(e, a);
      for (let j = 0; j < 2; j++) {
        const h = (18 + hash(i + j) * 33) * (1 - a.snow * 0.35),
          xx = x + j * 10 + Math.sin(elapsed * 0.6 + i) * 3;
        stroke(
          ctx,
          [
            [x + j * 10, y],
            [xx, y - h],
          ],
          M.tone(rgb([105, 139, 94], [186, 194, 176], snow), a),
          1.2
        );
        if (hash(i + j) > 0.35 && a.bloom > 0.1) oval(ctx, xx, y - h, 2.6, 1.7, css(rgb([234, 194, 156], [144, 151, 163], a.night), a.bloom * 0.7));
      }
    }
  }
  function render(a, weatherOverride) {
    sky(a);
    skyClouds(a);
    ocean(a);
    mountains(a);
    offshore(a);
    terrain(a);
    fields(a);
    distantTrees(a);
    groundMist(a);
    objects(a);
    railway(a);
    drawTrain(a);
    groundMist(a, true);
    foreground(a);
    atmosphere(a, weatherOverride);
    ctx.save();
    ctx.globalAlpha = 0.26;
    ctx.globalCompositeOperation = "soft-light";
    ctx.drawImage(texture, 0, 0, W, H);
    ctx.restore();
  }
  return { render, ground, snowAt, coordinate, landColor };
})();
