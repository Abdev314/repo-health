// Generates the PWA PNG icons (heart + pulse on dark slate, rounded)
// with zero dependencies. Run: node scripts/generate-icons.mjs

import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "../public/icons");

const BG = [15, 23, 42]; // slate-900
const FG = [255, 255, 255];

// --- minimal PNG encoder (8-bit RGBA) -----------------------------

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function encodePng(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// --- drawing -------------------------------------------------------

// Parametric heart outline samples.
function heartPolygon(samples = 256) {
  const points = [];
  for (let i = 0; i < samples; i++) {
    const t = (i / samples) * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3;
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);
    points.push([x, -y]); // flip so the heart points down
  }
  return points;
}

function pointInPolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }
  return inside;
}

function distanceToSegment(px, py, [ax, ay], [bx, by]) {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSq = dx * dx + dy * dy;
  const t =
    lengthSq === 0
      ? 0
      : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSq));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function roundedRectContains(x, y, size, radius) {
  const px = x + 0.5;
  const py = y + 0.5;
  const r = Math.min(radius, size / 2);
  const inCentralColumns = px >= r && px < size - r;
  const inCentralRows = py >= r && py < size - r;

  if (inCentralColumns || inCentralRows) {
    return true;
  }

  const cx = Math.min(Math.max(px, r), size - r);
  const cy = Math.min(Math.max(py, r), size - r);

  return (px - cx) ** 2 + (py - cy) ** 2 <= r * r;
}

function drawIcon(size, { maskable = false, opaque = false } = {}) {
  const rgba = Buffer.alloc(size * size * 4);
  const scale = size / 32; // heart is 32 units wide
  const heart = heartPolygon().map(([x, y]) => [
    size / 2 + x * scale * (maskable ? 0.55 : 0.72),
    size / 2 + (y + 6) * scale * (maskable ? 0.55 : 0.72) - size * 0.02,
  ]);

  // ECG-style pulse line across the heart, in heart-local units.
  const pulse = [
    [-14, 0], [-7, 0], [-5, -3], [-2, 4], [0, -5], [2, 1], [4, 0], [14, 0],
  ].map(([x, y]) => [
    size / 2 + x * scale * (maskable ? 0.55 : 0.72),
    size / 2 + (y - 0.5) * scale * (maskable ? 0.55 : 0.72) - size * 0.02,
  ]);

  const radius = size * 0.22;
  const lineWidth = Math.max(1.5, size * 0.032);
  const inHeart = (x, y) => pointInPolygon(x + 0.5, y + 0.5, heart);
  const nearPulse = (x, y) =>
    pulse.some((point, i) =>
      i < pulse.length - 1
        ? distanceToSegment(x + 0.5, y + 0.5, point, pulse[i + 1]) <= lineWidth
        : false,
    );

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const offset = (y * size + x) * 4;
      let color = null;

      const inBackground =
        opaque || maskable
          ? x >= 0 && y >= 0 && x < size && y < size
          : roundedRectContains(x, y, size, radius);

      if (inBackground) color = BG;
      if (color && inHeart(x, y)) color = FG;
      if (color && inHeart(x, y) && nearPulse(x, y)) color = BG;

      if (color) {
        rgba[offset] = color[0];
        rgba[offset + 1] = color[1];
        rgba[offset + 2] = color[2];
        rgba[offset + 3] = 255;
      }
    }
  }

  return rgba;
}

mkdirSync(OUT_DIR, { recursive: true });

const outputs = [
  ["icon-192.png", 192, { maskable: false, opaque: false }],
  ["icon-512.png", 512, { maskable: false, opaque: false }],
  ["icon-maskable-512.png", 512, { maskable: true, opaque: false }],
  ["apple-touch-icon.png", 180, { maskable: false, opaque: true }],
];

for (const [name, size, options] of outputs) {
  const png = encodePng(size, size, drawIcon(size, options));
  writeFileSync(join(OUT_DIR, name), png);
  console.log(`wrote public/icons/${name} (${png.length} bytes)`);
}
