import sharp from 'sharp';

async function inspect(path) {
  const img = sharp(path);
  const meta = await img.metadata();
  console.log(`\n=== ${path} ===`);
  console.log('size:', meta.width, 'x', meta.height, 'channels:', meta.channels, 'hasAlpha:', meta.hasAlpha);
  return { img, meta };
}

function clamp(v) {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function toHex(r, g, b) {
  return '#' + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, '0')).join('');
}

async function sampleAt(img, meta, x, y, label) {
  const { data, info } = await img
    .clone()
    .extract({ left: x, top: y, width: 1, height: 1 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const [r, g, b] = data;
  console.log(`${label} @ (${x},${y}) [channels=${info.channels}]:`, toHex(r, g, b), `rgb(${r},${g},${b})`);
}

async function dominantColors(path, count = 6) {
  const { data, info } = await sharp(path)
    .resize(100, 100, { fit: 'inside' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;
  const buckets = new Map();

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const a = channels === 4 ? data[i + 3] : 255;
    if (a < 200) continue; // skip transparent
    // Quantize to reduce noise
    const key = `${clamp(Math.round(r / 16) * 16)},${clamp(Math.round(g / 16) * 16)},${clamp(Math.round(b / 16) * 16)}`;
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }

  const sorted = [...buckets.entries()].sort((a, b) => b[1] - a[1]).slice(0, count);
  console.log(`\nTop ${count} colors in ${path}:`);
  for (const [key, n] of sorted) {
    const [r, g, b] = key.split(',').map(Number);
    console.log(' ', toHex(r, g, b), `rgb(${r},${g},${b})`, 'count:', n);
  }
}

const guide = 'c:/xampp/htdocs/Spotify-App/mobile-ionic-app/branding/logo-color-guide.png';
const logo = 'c:/xampp/htdocs/Spotify-App/mobile-ionic-app/branding/altar-place-app-logo.png';

await inspect(guide);
await inspect(logo);

await dominantColors(guide, 20);
await dominantColors(logo, 20);
