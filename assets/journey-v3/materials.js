// One small, fixed material library. Seasonal geometry changes, not a screen filter.
const M = (() => {
  const shadow = [29, 47, 66];
  const tone = (col, a, amount = 0.63) => css(rgb(col, shadow, a.night * amount));
  function treeAsset(kind, season, night) {
    return make(210, 330, (c) => {
      const r = rng(731 + kind * 177),
        pine = kind >= 5,
        birch = kind === 3 || kind === 4;
      const col = (v) => css(rgb(v, shadow, night * 0.64));
      // One connected crown envelope; branch tips and leaf masses share geometry.
      const center = (y) => 105 + Math.sin((y - 55) / 100 + kind) * 5;
      const crownWidth = (y) => (pine ? 15 + (y - 48) * 0.25 : (birch ? 55 : 66) * Math.sqrt(Math.max(0.08, 1 - Math.pow((y - 155) / 111, 2))));
      stroke(
        c,
        [
          [104, 319],
          [center(240), 240],
          [center(150), 150],
          [center(59), 59],
        ],
        col(birch ? [190, 186, 157] : [92, 99, 73]),
        birch ? 5 : 4
      );
      const clusters = [];
      for (let j = 0; j < 14; j++) {
        const y = 78 + j * 12,
          side = j % 2 ? -1 : 1,
          tipY = y - 12 - r() * 12;
        const end = [center(tipY) + side * crownWidth(tipY) * (0.48 + r() * 0.13), tipY];
        stroke(c, [[center(y + 25), y + 25], [center(y) + side * 9, y], end], col([108, 108, 79]), 1.2 + j / 19);
        clusters.push({ x: end[0], y: end[1] + 7, rx: pine ? 19 + j * 0.8 : 25 + r() * 9, ry: pine ? 17 : 25 + r() * 12 });
        if (birch)
          stroke(
            c,
            [
              [center(y) - 2, y + 10],
              [center(y) + 2, y + 12],
            ],
            col([89, 103, 87]),
            1.5
          );
      }
      for (let j = 0; j < 7; j++) clusters.push({ x: center(65 + j * 28), y: 65 + j * 28, rx: pine ? 15 + j * 5 : 30, ry: pine ? 22 : 34 });
      const palettes = [
        [
          [113, 156, 104],
          [170, 187, 119],
          [225, 204, 168],
        ],
        [
          [71, 116, 86],
          [112, 151, 99],
          [160, 177, 118],
        ],
        [
          [164, 116, 73],
          [213, 166, 83],
          [177, 93, 75],
        ],
        [
          [105, 129, 116],
          [137, 155, 138],
          [190, 199, 182],
        ],
      ];
      const density = season === 3 ? (pine ? 850 : 28) : season === 2 ? 1100 : 1400;
      // A continuous foliage underpainting hides the skeleton before broken leaf
      // strokes are added. Only winter deciduous trees expose the whole framework.
      const palette = pine && season === 2 ? palettes[1] : palettes[season];
      if (season !== 3 || pine)
        for (const cl of clusters) {
          oval(c, cl.x, cl.y, cl.rx * 0.86, cl.ry * 0.86, col(rgb(palette[0], palette[1], 0.3)));
        }
      for (let j = 0; j < density; j++) {
        const cl = clusters[j % clusters.length],
          a = r() * TAU,
          d = Math.sqrt(r()),
          x = cl.x + Math.cos(a) * cl.rx * d,
          y = cl.y + Math.sin(a) * cl.ry * d;
        const palette = pine && season === 2 ? palettes[1] : palettes[season],
          light = clamp((175 - x + y * 0.05) / 210);
        const color = rgb(palette[0], palette[1], light * 0.8 + r() * 0.3);
        oval(c, x, y, 2 + r() * 7, 2 + r() * 4, col(color), r() * 0.7);
        if (season === 0 && !pine && kind % 3 === 1 && j % 8 === 0) oval(c, x, y, 3, 2, col([239, 200, 181]));
      }
      if (season === 3 && pine)
        for (let j = 0; j < 34; j++) {
          const y = 68 + r() * 210,
            spread = (y - 45) * 0.27,
            x = 105 + (r() - 0.5) * spread * 1.8;
          oval(c, x, y, 4 + r() * 12, 1.4 + r() * 2.6, col([222, 231, 222]), -0.12 + r() * 0.24);
        }
    });
  }
  const trees = Array.from({ length: 8 }, (_, k) => Array.from({ length: 4 }, (_, s) => [treeAsset(k, s, 0), treeAsset(k, s, 1)]));
  const cloudNight = cloudSprites.map((sprite) =>
    make(sprite.width, sprite.height, (c) => {
      c.drawImage(sprite, 0, 0);
      c.globalCompositeOperation = "source-atop";
      c.fillStyle = "rgba(44,65,96,.70)";
      c.fillRect(0, 0, sprite.width, sprite.height);
    })
  );
  const trainNight = make(470, 150, (c) => {
    c.drawImage(trainSprite, 0, 0);
    c.globalCompositeOperation = "source-atop";
    c.fillStyle = "rgba(25,46,65,.54)";
    c.fillRect(0, 0, 470, 150);
  });
  const flowerTiles = Array.from({ length: 8 }, (_, k) =>
    make(460, 150, (c) => {
      const r = rng(907 + k * 191),
        palettes = [
          [
            [218, 179, 183],
            [241, 211, 185],
            [177, 160, 181],
          ],
          [
            [174, 164, 195],
            [207, 191, 207],
            [230, 209, 195],
          ],
          [
            [233, 204, 140],
            [237, 224, 182],
            [183, 180, 119],
          ],
        ],
        p = palettes[k % 3];
      const clumps = Array.from({ length: 7 }, () => ({ x: 35 + r() * 390, y: 25 + r() * 100, rx: 25 + r() * 60, ry: 12 + r() * 29 }));
      for (let j = 0; j < 1700; j++) {
        const cl = clumps[j % 7],
          a = r() * TAU,
          d = Math.sqrt(r()),
          x = cl.x + Math.cos(a) * cl.rx * d,
          y = cl.y + Math.sin(a) * cl.ry * d;
        if (x < 7 || x > 453 || y < 4 || y > 145) continue;
        oval(c, x, y, 1.4 + r() * 4, 0.9 + r() * 2, css(p[Math.floor(r() * 3)], 0.32 + r() * 0.48));
        if (j % 5 === 0) oval(c, x + 0.5, y - 0.5, 1.1, 0.7, "#fff1cb88");
      }
    })
  );
  function tree(x, y, scale, kind, a, opacity = 1) {
    const k = ((kind % 8) + 8) % 8,
      s0 = Math.floor(a.season),
      s1 = (s0 + 1) % 4,
      f = smooth(a.season - s0);
    ctx.save();
    ctx.translate(x, y);
    ctx.transform(1, 0, Math.sin(elapsed * 0.52 + kind) * 0.014, 1, 0, 0);
    const draw = (s, alpha) => {
      if (a.night < 0.999) {
        ctx.globalAlpha = alpha * opacity * (1 - a.night);
        ctx.drawImage(trees[k][s][0], -105 * scale, -320 * scale, 210 * scale, 330 * scale);
      }
      if (a.night > 0.001) {
        ctx.globalAlpha = alpha * opacity * a.night;
        ctx.drawImage(trees[k][s][1], -105 * scale, -320 * scale, 210 * scale, 330 * scale);
      }
    };
    draw(s0, 1 - f);
    if (f > 0.001) draw(s1, f);
    ctx.restore();
  }
  function building(x, y, scale, kind, seed, a, snow = 0) {
    const r = rng(seed * 131 + 117),
      w = 58 + r() * 45,
      h = (kind === "town" ? 68 : 49) + r() * 30,
      pitch = 18 + r() * 20;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    oval(ctx, 0, 3, w * 0.7, 5, css(rgb([80, 100, 77], shadow, a.night), 0.14));
    const facades = [
        [193, 170, 135],
        [182, 188, 155],
        [196, 160, 139],
        [181, 184, 172],
        [208, 192, 159],
      ],
      roofs = [
        [80, 112, 103],
        [133, 104, 95],
        [94, 117, 122],
      ];
    ctx.fillStyle = tone(facades[Math.floor(r() * 5)], a);
    ctx.fillRect(-w / 2, -h, w, h);
    ctx.fillStyle = tone([135, 144, 114], a);
    ctx.fillRect(-w / 2, -11, w, 11);
    for (let i = 0; i < 8; i++)
      stroke(
        ctx,
        [
          [-w / 2 + 2, -h + 8 + i * 8],
          [w / 2 - 2, -h + 8 + i * 8],
        ],
        tone([165, 157, 124], a),
        0.45
      );
    const roof = roofs[Math.floor(r() * 3)],
      gable = r() > 0.5;
    ctx.fillStyle = tone(roof, a);
    ctx.beginPath();
    ctx.moveTo(-w / 2 - 8, -h);
    if (gable) ctx.lineTo(-w * 0.12, -h - pitch - 5);
    else {
      ctx.lineTo(-w / 2 + 12, -h - pitch);
      ctx.lineTo(w / 2 - 12, -h - pitch);
    }
    ctx.lineTo(w / 2 + 8, -h);
    ctx.closePath();
    ctx.fill();
    stroke(
      ctx,
      [
        [-w / 2 + 12, -h - pitch],
        [w / 2 - 12, -h - pitch],
      ],
      tone([174, 184, 157], a),
      1.4
    );
    if (snow > 0.05) {
      ctx.globalAlpha = snow;
      stroke(
        ctx,
        gable
          ? [
              [-w / 2 - 5, -h - 2],
              [-w * 0.12, -h - pitch - 6],
              [w / 2 + 5, -h - 2],
            ]
          : [
              [-w / 2 - 5, -h - 2],
              [-w / 2 + 12, -h - pitch - 1],
              [w / 2 - 12, -h - pitch - 1],
              [w / 2 + 5, -h - 2],
            ],
        tone([232, 236, 226], a, 0.45),
        4
      );
      ctx.globalAlpha = 1;
    }
    const chimney = r() > 0.25;
    if (chimney) {
      ctx.fillStyle = tone([148, 135, 116], a);
      ctx.fillRect(w * 0.22, -h - pitch - 12, 9, 20);
      ctx.fillStyle = tone([175, 173, 147], a);
      ctx.fillRect(w * 0.22 - 2, -h - pitch - 13, 13, 3);
    }
    const floors = kind === "town" && h > 77 ? 2 : 1;
    for (let row = 0; row < floors; row++)
      for (let j = 0; j < 3; j++) {
        const xx = -w * 0.34 + j * w * 0.34,
          yy = -h + 14 + row * 26;
        ctx.fillStyle = tone([76, 104, 96], a);
        ctx.fillRect(xx - 7, yy - 1, 15, 20);
        ctx.fillStyle = css(rgb([191, 209, 192], [246, 204, 137], a.night));
        ctx.fillRect(xx - 5, yy + 1, 11, 15);
        stroke(
          ctx,
          [
            [xx, yy + 1],
            [xx, yy + 16],
          ],
          tone([137, 156, 136], a),
          1
        );
        if (j !== 1) {
          ctx.fillStyle = tone([113, 143, 125], a);
          ctx.fillRect(xx - 10, yy, 3, 17);
        }
      }
    ctx.fillStyle = tone([95, 121, 105], a);
    ctx.fillRect(-7, -29, 15, 29);
    ctx.fillStyle = css(rgb([179, 194, 160], [249, 210, 148], a.night));
    ctx.fillRect(-4, -26, 9, 14);
    if (kind === "town") {
      ctx.fillStyle = tone([234, 215, 174], a);
      ctx.fillRect(-w * 0.4, -h + 39, w * 0.8, 10);
      ctx.fillStyle = tone([78, 99, 81], a);
      ctx.font = "6px Georgia";
      ctx.textAlign = "center";
      ctx.fillText(["POSTE", "CAFÉ", "BOOKS", "ÉPICERIE"][seed % 4], 0, -h + 46);
      ctx.fillStyle = tone([120, 154, 132], a);
      ctx.beginPath();
      ctx.moveTo(-w / 2 - 3, -29);
      ctx.lineTo(w / 2 + 3, -29);
      ctx.lineTo(w / 2 + 9, -20);
      ctx.lineTo(-w / 2 - 9, -20);
      ctx.fill();
    }
    ctx.restore();
    if (chimney && (a.snow > 0.12 || kind === "cabin") && hash(seed + 91) > 0.35)
      smoke(x + w * 0.24 * scale, y - (h + pitch + 13) * scale, a, seed, 0.55);
  }
  function smoke(x, y, a, seed, scale = 1) {
    for (let i = 0; i < 6; i++) {
      const p = (elapsed * 0.055 + i / 6 + hash(seed)) % 1;
      ctx.globalAlpha = Math.sin(p * Math.PI) * 0.16;
      oval(ctx, x - p * 38 + Math.sin(p * 6 + seed) * 5, y - p * 68, 5 + p * 19, 3 + p * 10, css(rgb([238, 226, 201], [128, 150, 166], a.night)));
    }
    ctx.globalAlpha = 1;
  }
  function lamp(x, y, scale, a) {
    stroke(
      ctx,
      [
        [x, y],
        [x, y - 62 * scale],
      ],
      tone([93, 109, 97], a),
      2 * scale
    );
    oval(ctx, x, y - 64 * scale, 4 * scale, 6 * scale, css(rgb([215, 217, 180], [253, 211, 139], a.night)));
    if (a.night > 0.1) {
      const g = ctx.createRadialGradient(x, y - 64 * scale, 1, x, y - 64 * scale, 24 * scale);
      g.addColorStop(0, css([248, 208, 139], a.night * 0.18));
      g.addColorStop(1, "rgba(248,208,139,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - 24 * scale, y - 88 * scale, 48 * scale, 48 * scale);
    }
  }
  function fence(x, y, length, seed, a, snow = 0) {
    const count = Math.floor(length / 21);
    for (let j = 0; j < count; j++) {
      const xx = x + j * 21,
        yy = y + Math.sin(seed + j) * 1.5;
      stroke(
        ctx,
        [
          [xx, yy],
          [xx + 1, yy - 24],
        ],
        tone([149, 142, 108], a),
        2.6
      );
      if (j < count - 1) {
        stroke(
          ctx,
          [
            [xx, yy - 17],
            [xx + 22, yy - 17],
          ],
          tone([169, 157, 119], a),
          2
        );
        if (snow > 0.1)
          stroke(
            ctx,
            [
              [xx, yy - 19],
              [xx + 22, yy - 19],
            ],
            tone([228, 233, 223], a),
            snow * 2
          );
      }
    }
  }
  function boat(x, y, scale, seed, a) {
    ctx.save();
    ctx.translate(x, y + Math.sin(elapsed * 0.67 + seed) * 1.2);
    ctx.scale(scale, scale);
    ctx.rotate(Math.sin(elapsed * 0.45 + seed) * 0.012);
    const fishing = seed % 3 !== 0,
      w = 24 + (seed % 4) * 6;
    ctx.fillStyle = tone(seed % 2 ? [137, 111, 91] : [109, 139, 135], a);
    ctx.beginPath();
    ctx.moveTo(-w, 0);
    ctx.quadraticCurveTo(0, 19, w + 7, -1);
    ctx.closePath();
    ctx.fill();
    stroke(
      ctx,
      [
        [-w, 0],
        [w + 6, -1],
      ],
      tone([218, 194, 152], a),
      2
    );
    if (fishing) {
      ctx.fillStyle = tone([199, 194, 162], a);
      ctx.fillRect(-9, -22, 24, 22);
      ctx.fillStyle = css(rgb([147, 182, 181], [235, 200, 137], a.night));
      ctx.fillRect(-5, -17, 8, 10);
      ctx.fillRect(7, -17, 5, 10);
      stroke(
        ctx,
        [
          [8, -23],
          [8, -47],
        ],
        tone([125, 135, 116], a),
        1.3
      );
      stroke(
        ctx,
        [
          [8, -44],
          [w - 1, -25],
        ],
        tone([159, 166, 139], a),
        1
      );
    } else {
      stroke(
        ctx,
        [
          [0, 0],
          [0, -58],
        ],
        tone([169, 168, 136], a),
        1.3
      );
      ctx.fillStyle = tone([244, 225, 184], a, 0.45);
      ctx.beginPath();
      ctx.moveTo(-2, -54);
      ctx.quadraticCurveTo(-21, -33, -30, -3);
      ctx.lineTo(-2, -3);
      ctx.fill();
    }
    stroke(
      ctx,
      [
        [-w - 6, 15],
        [w + 4, 15],
      ],
      css(a.horizon, 0.2),
      1
    );
    ctx.restore();
  }
  function lighthouse(x, y, scale, a, seed) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    oval(ctx, 0, 5, 43, 9, tone([116, 132, 123], a));
    ctx.fillStyle = tone([222, 211, 177], a);
    ctx.beginPath();
    ctx.moveTo(-13, 0);
    ctx.lineTo(-9, -105);
    ctx.lineTo(9, -105);
    ctx.lineTo(14, 0);
    ctx.fill();
    ctx.fillStyle = tone([164, 134, 120], a);
    ctx.fillRect(-10, -70, 20, 12);
    ctx.fillRect(-11, -34, 22, 12);
    ctx.fillStyle = tone([79, 105, 98], a);
    ctx.fillRect(-13, -119, 26, 17);
    ctx.fillStyle = css(rgb([206, 215, 179], [255, 222, 148], a.night));
    ctx.fillRect(-9, -116, 18, 10);
    ctx.fillStyle = tone([84, 107, 101], a);
    ctx.beginPath();
    ctx.moveTo(-17, -120);
    ctx.lineTo(0, -136);
    ctx.lineTo(17, -120);
    ctx.fill();
    ctx.restore();
    if (a.night > 0.4) {
      ctx.save();
      ctx.translate(x, y - 110 * scale);
      ctx.rotate(Math.sin(elapsed * 0.055 + seed) * 0.27);
      const g = ctx.createLinearGradient(0, 0, 260, 0);
      g.addColorStop(0, css([250, 219, 153], a.night * 0.09));
      g.addColorStop(1, "rgba(250,219,153,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(260, -31);
      ctx.lineTo(260, 31);
      ctx.fill();
      ctx.restore();
    }
  }
  function windmill(x, y, scale, a, seed) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = tone([208, 195, 157], a);
    ctx.beginPath();
    ctx.moveTo(-19, 0);
    ctx.lineTo(-12, -85);
    ctx.lineTo(12, -85);
    ctx.lineTo(21, 0);
    ctx.fill();
    ctx.fillStyle = tone([113, 130, 108], a);
    ctx.beginPath();
    ctx.moveTo(-19, -85);
    ctx.lineTo(0, -106);
    ctx.lineTo(20, -85);
    ctx.fill();
    ctx.translate(0, -75);
    ctx.rotate(elapsed * 0.09 + seed);
    for (let j = 0; j < 4; j++) {
      ctx.rotate(Math.PI / 2);
      stroke(
        ctx,
        [
          [0, 0],
          [0, -56],
        ],
        tone([134, 137, 105], a),
        2
      );
      ctx.fillStyle = tone([204, 205, 165], a);
      ctx.fillRect(0, -53, 11, 33);
      for (let k = 0; k < 5; k++)
        stroke(
          ctx,
          [
            [0, -51 + k * 7],
            [11, -51 + k * 7],
          ],
          tone([150, 159, 121], a),
          0.7
        );
    }
    ctx.restore();
  }
  function pier(x, y, length, a, seed) {
    for (let j = 0; j < length; j += 23) {
      stroke(
        ctx,
        [
          [x + j, y],
          [x + j, y + 33],
        ],
        tone([99, 118, 105], a),
        3
      );
      stroke(
        ctx,
        [
          [x + j, y - 4],
          [x + j + 22, y - 4],
        ],
        tone([166, 158, 121], a),
        7
      );
      stroke(
        ctx,
        [
          [x + j, y - 8],
          [x + j + 22, y - 8],
        ],
        tone([209, 190, 148], a),
        1.2
      );
    }
    for (let j = 0; j < length; j += 46)
      stroke(
        ctx,
        [
          [x + j, y - 8],
          [x + j, y - 27],
        ],
        tone([121, 139, 117], a),
        2
      );
    stroke(
      ctx,
      [
        [x, y - 24],
        [x + length, y - 24],
      ],
      tone([165, 166, 134], a),
      1
    );
  }
  function waterTower(x, y, a, seed) {
    for (const side of [-1, 1])
      stroke(
        ctx,
        [
          [x + side * 15, y],
          [x + side * 12, y - 63],
        ],
        tone([127, 130, 101], a),
        3
      );
    stroke(
      ctx,
      [
        [x - 14, y - 8],
        [x + 13, y - 48],
        [x - 13, y - 48],
        [x + 14, y - 8],
      ],
      tone([153, 148, 111], a),
      1.4
    );
    ctx.fillStyle = tone([140, 161, 138], a);
    ctx.fillRect(x - 22, y - 99, 44, 39);
    oval(ctx, x, y - 99, 22, 6, tone([182, 189, 154], a));
    oval(ctx, x, y - 60, 22, 5, tone([111, 136, 118], a));
    stroke(
      ctx,
      [
        [x - 22, y - 84],
        [x + 22, y - 84],
      ],
      tone([193, 192, 152], a),
      2
    );
    stroke(
      ctx,
      [
        [x + 24, y],
        [x + 24, y - 91],
      ],
      tone([143, 153, 121], a),
      1.3
    );
    for (let j = 0; j < 9; j++)
      stroke(
        ctx,
        [
          [x + 21, y - 5 - j * 10],
          [x + 28, y - 5 - j * 10],
        ],
        tone([160, 165, 130], a),
        1
      );
  }
  return { tone, trees, cloudNight, trainNight, flowerTiles, tree, building, smoke, lamp, fence, boat, lighthouse, windmill, pier, waterTower };
})();
