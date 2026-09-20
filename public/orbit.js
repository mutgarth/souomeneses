// Planet rendering adapted from Memory Module mm-front marketing-canvas.tsx.
// Original artwork, palette quantization and orbital particles; centered for this bio.

if (typeof document !== 'undefined') {
  const canvas = document.querySelector('#orbit-planet');
  const ctx = canvas?.getContext('2d', { willReadFrequently: true });
  if (ctx) {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const image = new Image();
    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    let frame = 0, previous = 0, elapsed = 0, visible = false;
    const draw = now => {
      frame = 0;
      if (!visible || document.hidden) { previous = 0; return; }
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const delta = previous ? Math.min(now - previous, 50) : 16;
      previous = now;
      if (!motion.matches) elapsed += delta / 1000;
      const ease = motion.matches ? 1 : 1 - Math.pow(0.94, delta / (1000 / 60));
      pointer.x += ((motion.matches ? 0.5 : pointer.tx) - pointer.x) * ease;
      pointer.y += ((motion.matches ? 0.5 : pointer.ty) - pointer.y) * ease;
      const w = Math.max(1, Math.round(rect.width / 3));
      const h = Math.max(1, Math.round(rect.height / 3));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      drawPlanet(ctx, w, h, motion.matches ? 0 : elapsed, pointer, image);
      if (image.complete && image.naturalWidth) canvas.parentElement.dataset.ready = '';
      if (!motion.matches) frame = requestAnimationFrame(draw);
    };
    const invalidate = () => { if (!frame) frame = requestAnimationFrame(draw); };
    const restart = () => { cancelAnimationFrame(frame); frame = 0; previous = 0; invalidate(); };
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; restart(); }).observe(canvas);
    new ResizeObserver(invalidate).observe(canvas);
    window.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch' || motion.matches) return;
      pointer.tx = event.clientX / innerWidth;
      pointer.ty = event.clientY / innerHeight;
      invalidate();
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { pointer.tx = pointer.ty = 0.5; invalidate(); });
    document.addEventListener('visibilitychange', restart);
    motion.addEventListener('change', restart);
    image.onload = invalidate;
    image.src = '/uranus.png';
  }
}
function hash(x, y) {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

export function drawPlanet(ctx, w, h, t, pointer, image, login = false) {
  ctx.clearRect(0, 0, w, h);
  ctx.imageSmoothingEnabled = false;
  const mx = pointer.x - 0.5, my = pointer.y - 0.5;
  const starCount = Math.round(w * h * (login ? 0.010 : 0.012));
  for (let i = 0; i < starCount; i++) {
    const parallax = 1 + hash(i, 3) * 2;
    const x = hash(i, 7) * w - mx * parallax * (login ? 5 : 6);
    const y = hash(i, 13) * h * (login ? 1 : 0.92) - my * parallax * 4;
    const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.7 + i));
    if (login) {
      ctx.fillStyle = `rgba(237,237,237,${(hash(i, 21) > 0.9 ? 0.6 : 0.26) * twinkle})`;
      ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
    } else {
      // The home prototype premultiplies the low-resolution star pixels.
      const alpha = (hash(i, 21) > 0.9 ? 150 : 70) * twinkle / 255;
      const channel = Math.round(237 * alpha);
      ctx.fillStyle = `rgba(${channel},${channel},${channel},${alpha})`;
      ctx.fillRect(Math.trunc(x), Math.trunc(y), 1, 1);
    }
  }
  if (!image.complete || !image.naturalWidth) return;

  const radius = Math.min(w * 0.20, h * 0.21);
  const cx = w * 0.50 + mx * w * 0.02;
  const cy = h * 0.50 + my * h * 0.02;
  const diameter = radius / 0.1632;
  const ox = cx - 0.5278 * diameter, oy = cy - 0.5069 * diameter;
  ctx.drawImage(image, ox, oy, diameter, diameter);

  const left = Math.max(0, Math.floor(ox)), top = Math.max(0, Math.floor(oy));
  const width = Math.min(w - left, Math.ceil(diameter)), height = Math.min(h - top, Math.ceil(diameter));
  if (width > 0 && height > 0) {
    const region = ctx.getImageData(left, top, width, height);
    const data = region.data;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) continue;
      const luminance = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11;
      for (let channel = 0; channel < 3; channel++) {
        data[i + channel] = Math.round((data[i + channel] * 0.84 + luminance * 0.16) / 20) * 20;
      }
    }
    ctx.putImageData(region, left, top);
  }

  for (let i = 0; i < 5; i++) {
    const angle = t * 0.22 + i * 1.257;
    const ex = Math.cos(angle) * diameter * 0.352;
    const ey = Math.sin(angle) * diameter * 0.112;
    const x = cx - 0.268 * ex + 0.963 * ey;
    const y = cy + 0.963 * ex + 0.268 * ey;
    const overDisc = Math.hypot(x - cx, y - cy) < radius * 0.98;
    ctx.fillStyle = overDisc ? "rgba(237,237,237,0.55)" : "rgba(4,191,225,0.95)";
    ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
    ctx.fillStyle = overDisc ? "rgba(237,237,237,0.25)" : "rgba(4,191,225,0.45)";
    ctx.fillRect(Math.round(x) + 1, Math.round(y), 1, 1);
    if (!login) ctx.fillRect(Math.round(x), Math.round(y) - 1, 1, 1);
  }
}
