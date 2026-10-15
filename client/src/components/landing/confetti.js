// A quick burst of paper confetti from a point on the screen. Skips itself if the user prefers less motion.
const COLOURS = ['#E5532D', '#F2A818', '#5B82E8', '#B96AD3', '#7FA81E', '#14100B'];

export default function confetti(fromX = window.innerWidth / 2, fromY = window.innerHeight / 2) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: 60 });
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const bits = Array.from({ length: 160 }, () => ({
    x: fromX,
    y: fromY,
    vx: (Math.random() - 0.5) * 16,
    vy: -Math.random() * 16 - 4,
    size: Math.random() * 8 + 5,
    colour: COLOURS[Math.floor(Math.random() * COLOURS.length)],
    angle: Math.random() * 6,
    spin: (Math.random() - 0.5) * 0.4,
  }));
  let frame = 0;
  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bits.forEach((b) => {
      b.vy += 0.45;
      b.x += b.vx;
      b.y += b.vy;
      b.angle += b.spin;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);
      ctx.fillStyle = b.colour;
      ctx.fillRect(-b.size / 2, -b.size / 4, b.size, b.size / 2);
      ctx.restore();
    });
    if (++frame < 150) requestAnimationFrame(tick);
    else canvas.remove();
  };
  tick();
}
