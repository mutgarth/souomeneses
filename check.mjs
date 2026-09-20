import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { drawPlanet } from './public/orbit.js';
const content = JSON.parse(readFileSync(new URL('./src/content.json', import.meta.url), 'utf8'));

for (const route of ['', 'station', 'terminal', 'orbit']) {
  const theme = route || 'orbit';
  const html = readFileSync(new URL(`./dist/${route ? route + "/" : ""}index.html`, import.meta.url), 'utf8');
  for (const item of [...content.projects, content.community, ...content.socials]) {
    assert.equal(new URL(item.url).protocol, 'https:');
    assert.ok(html.includes(`href="${item.url}"`), `${theme}: missing ${item.url}`);
    assert.ok(html.includes(`src="${item.logo}"`), `${theme}: missing logo`);
    assert.ok(existsSync(new URL(`./dist${item.logo}`, import.meta.url)), 'Logo must ship with the site');
  }
  assert.ok(!html.includes('Convite em breve') && !html.includes('CONVITE<br'), 'Remove the pending invitation');
  assert.ok(html.includes(content.tagline));
  if (theme === 'orbit') {
    assert.ok(html.includes('meu trabalho') && !html.includes('PERSONAL UNIVERSE') && !html.includes('LINKS / 01'));
    assert.ok(html.includes('src="/orbit.js"') && html.includes('src="/uranus.png"'), 'Orbit must include the original artwork and renderer');
  } else assert.ok(!html.includes('<script'), `${theme}: static page should not need scripts`);
}

const calls = [];
const ctx = {
  clearRect() {}, fillRect(...args) { assert.ok(args.every(Number.isFinite)); },
  drawImage(...args) { calls.push(args); },
  getImageData(x, y, w, h) { assert.ok(w > 0 && h > 0); return { data: new Uint8ClampedArray(w * h * 4).fill(255) }; },
  putImageData() {},
};
drawPlanet(ctx, 110, 67, 0, { x: .5, y: .5 }, { complete: false });
assert.equal(calls.length, 0, 'Do not draw the planet before its image loads');
for (const w of [1, 110, 140]) {
  drawPlanet(ctx, w, 67, 2, { x: .5, y: .5 }, { complete: true, naturalWidth: 864 });
  assert.ok(calls.at(-1).slice(1).every(Number.isFinite));
}
console.log('OK: links, theme isolation, image loading and planet rendering verified.');
