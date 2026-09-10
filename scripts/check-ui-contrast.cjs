// Checks actual HSL tokens, including muted text, state surfaces and control edges.
const fs = require('node:fs');
const css = fs.readFileSync('apps/web/src/app/globals.css', 'utf8');
function luminance(value) {
  const [h, s0, l0] = value.match(/[\d.]+/g).map(Number);
  const s = s0 / 100, l = l0 / 100;
  const a = s * Math.min(l, 1 - l);
  const channel = n => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4;
  };
  return .2126 * channel(0) + .7152 * channel(8) + .0722 * channel(4);
}
let failures = 0;
for (const theme of [':root', '.dark']) {
  const block = css.slice(css.indexOf(theme)).split('}')[0];
  const tokens = Object.fromEntries([...block.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(m => [m[1], m[2]]));
  const pairs = [
    ['foreground', 'background', 4.5], ['foreground', 'card', 4.5],
    ['muted-foreground', 'background', 4.5], ['muted-foreground', 'card', 4.5],
    ['muted-foreground', 'muted', 4.5], ['muted-foreground', 'accent', 4.5],
    ['primary-foreground', 'primary', 4.5], ['primary', 'card', 4.5],
    ['input', 'background', 3], ['input', 'card', 3], ['ring', 'card', 3],
    ...['success', 'warning', 'destructive'].flatMap(role => [
      [role + '-foreground', role, 4.5], [role, role + '-subtle', 4.5],
    ]),
    ['info', 'info-subtle', 4.5],
  ];
  let lowest = Infinity;
  for (const [fg, bg, min] of pairs) {
    const a = luminance(tokens[fg]), b = luminance(tokens[bg]);
    const ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    lowest = Math.min(lowest, ratio);
    if (ratio < min) { failures++; console.error(theme, fg, '/', bg, ratio.toFixed(2), '<', min); }
  }
  console.log(theme + ': ' + pairs.length + ' pairs checked; minimum ' + lowest.toFixed(2) + ':1');
}
process.exitCode = failures ? 1 : 0;
