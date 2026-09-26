// Derives a full Ionic color set from the two brand colors sampled out of
// the source logo. Uses proper HSL math (not RGB-toward-black/white
// blending, which desaturates) so derived surface tones still read as
// "navy" rather than collapsing to gray/black, and Ionic's own shade/tint
// convention (mix 12% black / 10% white) for the interactive color base.

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function clamp(v) {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, '0')).join('');
}

function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}

function hslToRgb([h, s, l]) {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) { const v = l * 255; return [v, v, v]; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [hue2rgb(p, q, h + 1 / 3) * 255, hue2rgb(p, q, h) * 255, hue2rgb(p, q, h - 1 / 3) * 255];
}

function withLightness(rgb, lPercent) {
  const [h, s] = rgbToHsl(rgb);
  return hslToRgb([h, s, lPercent]);
}

function shade(rgb) {
  const [r, g, b] = rgb;
  return [r * 0.88, g * 0.88, b * 0.88];
}

function tint(rgb) {
  const [r, g, b] = rgb;
  return [r + (255 - r) * 0.1, g + (255 - g) * 0.1, b + (255 - b) * 0.1];
}

function luminance([r, g, b]) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function contrastFor(rgb) {
  return luminance(rgb) > 0.5 ? '#12100a' : '#ffffff';
}

function report(name, rgb) {
  console.log(`\n--- ${name} ---`);
  console.log('base:    ', rgbToHex(rgb), rgb.map(Math.round).join(','));
  console.log('shade:   ', rgbToHex(shade(rgb)));
  console.log('tint:    ', rgbToHex(tint(rgb)));
  console.log('contrast:', contrastFor(rgb));
}

const gold = hexToRgb('#F0B030');
const navy = hexToRgb('#001040');
const [navyHue, navySat] = rgbToHsl(navy);
console.log('navy HSL:', navyHue.toFixed(1), navySat.toFixed(1) + '%');

report('Gold (primary)', gold);

// Lighten in HSL (hue/sat preserved) so it reads as blue, not gray.
const secondaryBlue = withLightness(navy, 42);
report('Secondary (navy lightened in HSL, for chips/buttons)', secondaryBlue);

const bronze = hexToRgb('#A05000');
report('Tertiary (bronze, sampled shadow tone)', bronze);

console.log('\n--- Surfaces (navy hue/sat preserved, lightness varied) ---');
console.log('background:      ', rgbToHex(withLightness(navy, 4)));
console.log('toolbar/tabbar:  ', rgbToHex(withLightness(navy, 6)));
console.log('card background: ', rgbToHex(withLightness(navy, 10)));
console.log('item background: ', rgbToHex(withLightness(navy, 11)));
console.log('border:          ', rgbToHex(withLightness(navy, 16)));
console.log('step-50:         ', rgbToHex(withLightness(navy, 10)));
console.log('step-100:        ', rgbToHex(withLightness(navy, 12)));
console.log('step-150:        ', rgbToHex(withLightness(navy, 14)));
console.log('step-200:        ', rgbToHex(withLightness(navy, 16)));

console.log('\n--- Banner gradient (gold-lit navy -> deep navy) ---');
console.log('from:', rgbToHex(withLightness(navy, 18)));
console.log('to:  ', rgbToHex(withLightness(navy, 6)));
