/* Registry, balanced spatial itinerary, independent sky and seasons.
   No visited-region store; only six small permutation bags are retained. */
(() => {
  const clamp = (x) => Math.max(0, Math.min(1, x)),
    smooth = (x) => {
      x = clamp(x);
      return x * x * (3 - 2 * x);
    };
  const lerp = (a, b, t) => a + (b - a) * t,
    TAU = Math.PI * 2;
  const seed = Number(new URLSearchParams(globalThis.location?.search || "").get("seed")) || 1967;
  function hash(n) {
    let a = Math.imul((n | 0) + seed, 374761393);
    a = Math.imul(a ^ (a >>> 13), 1274126177);
    return ((a ^ (a >>> 16)) >>> 0) / 4294967296;
  }
  function noise(x, step, s = 0) {
    const i = Math.floor(x / step);
    return lerp(hash(i + s), hash(i + s + 1), smooth(x / step - i));
  }
  const registry = [
    {
      id: "valley",
      name: "云间山谷",
      note: "山的另一边，云还在慢慢生长",
      water: 0,
      mist: 0.92,
      trees: 0.2,
      flowers: 0.13,
      elevation: 0.45,
      wet: 0.12,
      land: [130, 151, 111],
    },
    {
      id: "coast",
      name: "海风来信",
      note: "阳伞、潮汐，还有一间小小的售票亭",
      water: 1,
      mist: 0.14,
      trees: 0.05,
      flowers: 0.08,
      elevation: 0,
      wet: 0.03,
      land: [219, 200, 158],
    },
    {
      id: "forest",
      name: "松林小站",
      note: "树影里的小站，正等着一封来信",
      water: 0,
      mist: 0.5,
      trees: 0.95,
      flowers: 0.12,
      elevation: 0.3,
      wet: 0.3,
      land: [115, 141, 101],
    },
    {
      id: "flowers",
      name: "花海的午后",
      note: "风从一整片花田中穿过",
      water: 0,
      mist: 0.2,
      trees: 0.08,
      flowers: 1,
      elevation: 0.18,
      wet: 0.1,
      land: [156, 172, 115],
    },
    {
      id: "birch",
      name: "白桦溪径",
      note: "白色的树干旁，一条小溪通向远方",
      water: 0,
      mist: 0.28,
      trees: 0.76,
      flowers: 0.3,
      elevation: 0.25,
      wet: 0.2,
      land: [161, 156, 108],
    },
    {
      id: "town",
      name: "雨巷人家",
      note: "屋檐听雨，窗边有一盏灯",
      water: 0,
      mist: 0.3,
      trees: 0.13,
      flowers: 0.08,
      elevation: 0.12,
      wet: 0.9,
      land: [150, 157, 135],
    },
    {
      id: "harbor",
      name: "潮汐港湾",
      note: "灯塔守着码头，船只轻轻摇晃",
      water: 0.88,
      mist: 0.2,
      trees: 0.03,
      flowers: 0.03,
      elevation: 0,
      wet: 0.25,
      land: [173, 172, 148],
    },
    {
      id: "alpine",
      name: "高地雪原",
      note: "薄雪、木屋，和一缕升起的炊烟",
      water: 0,
      mist: 0.35,
      trees: 0.15,
      flowers: 0.05,
      elevation: 1,
      wet: 0.4,
      land: [184, 190, 164],
    },
    {
      id: "gorge",
      name: "溪谷石桥",
      note: "桥下的水声，比旅途更慢",
      water: 0,
      mist: 0.55,
      trees: 0.25,
      flowers: 0.12,
      elevation: 0.65,
      wet: 0.2,
      land: [141, 148, 117],
    },
    {
      id: "country",
      name: "田园晚信",
      note: "田垄转弯的地方，住着一座风车",
      water: 0,
      mist: 0.18,
      trees: 0.23,
      flowers: 0.32,
      elevation: 0.14,
      wet: 0.12,
      land: [175, 174, 120],
    },
  ];
  const cache = new Map();
  function rawBag(group) {
    const a = Array.from({ length: registry.length }, (_, i) => i);
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(hash(group * 71 + i + 540) * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    if (group === 0) {
      for (const [pos, wanted] of [
        [0, 0],
        [1, 1],
      ]) {
        const j = a.indexOf(wanted);
        [a[pos], a[j]] = [a[j], a[pos]];
      }
    }
    return a;
  }
  function bag(group) {
    if (cache.has(group)) return cache.get(group);
    const a = rawBag(group);
    if (group > 0 && a[0] === rawBag(group - 1).at(-1)) [a[0], a[1]] = [a[1], a[0]];
    if (cache.size >= 6) cache.delete(cache.keys().next().value);
    cache.set(group, a);
    return a;
  }
  const type = (i) => (i < 0 ? 0 : bag(Math.floor(i / registry.length))[i % registry.length]);
  const boundary = (i) => i * 3600 + (hash(i + 31) - hash(31)) * 600;
  function region(s) {
    let i = Math.floor(s / 3600);
    while (s < boundary(i)) i--;
    while (s >= boundary(i + 1)) i++;
    return i;
  }
  function at(s) {
    const i = region(s),
      half = 650;
    let a = i,
      b = i,
      f = 0;
    if (s < boundary(i) + half) {
      a = i - 1;
      b = i;
      f = smooth((s - boundary(i) + half) / (half * 2));
    } else if (s > boundary(i + 1) - half) {
      a = i;
      b = i + 1;
      f = smooth((s - boundary(i + 1) + half) / (half * 2));
    }
    const weights = new Array(registry.length).fill(0);
    weights[type(a)] += 1 - f;
    weights[type(b)] += f;
    const out = { region: i, type: type(i), weights, quiet: noise(s, 900, 91) };
    for (const k of ["water", "mist", "trees", "flowers", "elevation", "wet"]) out[k] = registry.reduce((v, def, j) => v + def[k] * weights[j], 0);
    out.land = [0, 1, 2].map((k) => registry.reduce((v, def, j) => v + def.land[k] * weights[j], 0));
    return out;
  }
  const daylight = [
    { h: -1, sky: [23, 34, 59], horizon: [67, 79, 103], low: [49, 65, 81] },
    { h: -0.13, sky: [53, 65, 98], horizon: [178, 137, 151], low: [108, 114, 129] },
    { h: 0.04, sky: [132, 149, 163], horizon: [249, 187, 139], low: [223, 174, 146] },
    { h: 0.5, sky: [127, 163, 173], horizon: [251, 218, 170], low: [224, 202, 162] },
    { h: 1, sky: [121, 168, 184], horizon: [241, 225, 190], low: [219, 213, 174] },
  ];
  function clock(time, override = {}) {
    const day = override.day ?? (((time / 1080 + 0.36) % 1) + 1) % 1,
      angle = TAU * (day - 0.25),
      altitude = Math.sin(angle);
    let i = 0;
    while (i < daylight.length - 2 && altitude > daylight[i + 1].h) i++;
    const a = daylight[i],
      b = daylight[i + 1],
      f = smooth((altitude - a.h) / (b.h - a.h));
    const out = {
      day,
      altitude,
      night: 1 - smooth((altitude + 0.14) / 0.34),
      warm: 1 - smooth(altitude / 0.65),
      sun: { x: 800 + 650 * Math.cos(angle), y: 520 - 315 * altitude, visible: altitude > -31 / 315 },
      moon: { x: 800 - 620 * Math.cos(angle), y: 520 + 280 * altitude, visible: altitude < 25 / 280 },
    };
    for (const k of ["sky", "horizon", "low"]) out[k] = a[k].map((v, j) => Math.round(lerp(v, b[k][j], f)));
    const season = (((override.season ?? (time / 3600) * 4 + 0.12) % 4) + 4) % 4,
      si = Math.floor(season),
      sf = smooth(season - si);
    out.season = season;
    out.seasons = [0, 0, 0, 0];
    out.seasons[si] = 1 - sf;
    out.seasons[(si + 1) % 4] = sf;
    const [spring, summer, autumn, winter] = out.seasons;
    out.snow = winter;
    out.bloom = spring + summer * 0.72 + autumn * 0.18;
    out.leaves = 1 - winter * 0.92;
    out.sun.y = 520 - 315 * (1 - winter * 0.2) * altitude;
    out.sun.visible = out.sun.y - 31 < 520;
    out.sky = out.sky.map((v, j) =>
      Math.round(lerp(v, [lerp(143, 24, out.night), lerp(168, 39, out.night), lerp(182, 61, out.night)][j], winter * 0.16))
    );
    out.water = [99, 154, 164].map((v, j) => Math.round(lerp(v, [42, 66, 88][j], out.night)));
    out.land = [118, 145, 109].map((v, j) => Math.round(lerp(v, [42, 63, 64][j], out.night)));
    return out;
  }
  function weather(s, time, clock, override) {
    const e = at(s),
      front = 0.55 + 0.45 * noise(s + time * 2, 1400, 710),
      strength = e.wet * front;
    const cold = clamp(clock.snow * 0.95 + e.elevation * 0.6 - 0.4),
      precip = override ?? smooth((strength - 0.18) / 0.65);
    return { rain: precip * (1 - cold), snow: precip * cold, wind: 0.18 + noise(s + time * 5, 1300, 377) * 0.5, wet: strength };
  }
  globalThis.World = {
    registry,
    hash,
    noise,
    type,
    boundary,
    region,
    at,
    clock,
    weather,
    seed,
    get cacheSize() {
      return cache.size;
    },
  };
})();
