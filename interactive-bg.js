(function () {
  const canvas = document.getElementById("interactive-bg");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const BG = "#0a1120";
  const GRID_MINOR = "rgba(59, 130, 246, 0.05)";
  const GRID_MAJOR = "rgba(59, 130, 246, 0.11)";
  const GRID_ACCENT = "rgba(96, 165, 250, 0.16)";

  let width = 0;
  let height = 0;
  let animationId = null;
  let time = 0;
  let pointer = { x: -1000, y: -1000, active: false, smoothX: -1000, smoothY: -1000 };

  const blobs = [
    { ax: 0.18, ay: 0.22, fx: 0.00011, fy: 0.00009, px: 1.3, py: 0.7, r: 0.42, color: [10, 17, 32] },
    { ax: 0.72, ay: 0.28, fx: 0.00008, fy: 0.00013, px: 2.1, py: 1.4, r: 0.38, color: [30, 58, 138] },
    { ax: 0.55, ay: 0.68, fx: 0.00014, fy: 0.00007, px: 0.9, py: 2.3, r: 0.45, color: [37, 99, 235] },
    { ax: 0.25, ay: 0.78, fx: 0.00007, fy: 0.00012, px: 1.8, py: 1.1, r: 0.4, color: [6, 182, 212] },
    { ax: 0.82, ay: 0.72, fx: 0.0001, fy: 0.00015, px: 2.4, py: 1.6, r: 0.35, color: [59, 130, 246] },
    { ax: 0.45, ay: 0.45, fx: 0.00006, fy: 0.0001, px: 1.5, py: 2.0, r: 0.5, color: [15, 40, 80] },
  ];

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function blobPosition(blob, t) {
    const driftX =
      Math.sin(t * blob.fx + blob.px) * 0.07 +
      Math.sin(t * blob.fx * 1.618 + blob.px * 2) * 0.035;
    const driftY =
      Math.cos(t * blob.fy + blob.py) * 0.07 +
      Math.cos(t * blob.fy * 1.414 + blob.py * 1.5) * 0.035;

    return {
      x: (blob.ax + driftX) * width,
      y: (blob.ay + driftY) * height,
      radius: blob.r * Math.max(width, height),
    };
  }

  function drawBase() {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, width, height);
  }

  function drawMesh(t) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    blobs.forEach((blob) => {
      const { x, y, radius } = blobPosition(blob, t);
      const [r, g, b] = blob.color;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.55)`);
      gradient.addColorStop(0.45, `rgba(${r}, ${g}, ${b}, 0.18)`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    });

    ctx.restore();
  }

  function gridOffset() {
    if (!pointer.active || reducedMotion) return { x: 0, y: 0 };

    const targetX = (pointer.x - width * 0.5) * 0.018;
    const targetY = (pointer.y - height * 0.5) * 0.018;

    pointer.smoothX = lerp(pointer.smoothX, targetX, 0.06);
    pointer.smoothY = lerp(pointer.smoothY, targetY, 0.06);

    return { x: pointer.smoothX, y: pointer.smoothY };
  }

  function drawBlueprintGrid() {
    const minor = width < 600 ? 20 : 24;
    const major = minor * 4;
    const offset = gridOffset();
    const startX = ((offset.x % major) + major) % major;
    const startY = ((offset.y % major) + major) % major;

    ctx.save();
    ctx.lineCap = "square";

    ctx.strokeStyle = GRID_MINOR;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let x = startX - major; x <= width + major; x += minor) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = startY - major; y <= height + major; y += minor) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    ctx.strokeStyle = GRID_MAJOR;
    ctx.lineWidth = 0.75;
    ctx.beginPath();
    for (let x = startX; x <= width + major; x += major) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = startY; y <= height + major; y += major) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    ctx.strokeStyle = GRID_ACCENT;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = startX; x <= width + major; x += major * 4) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = startY; y <= height + major; y += major * 4) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    const dotSpacing = major * 2;
    ctx.fillStyle = "rgba(96, 165, 250, 0.22)";
    for (let x = startX; x <= width + major; x += dotSpacing) {
      for (let y = startY; y <= height + major; y += dotSpacing) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  function drawCursorGlow() {
    if (!pointer.active || reducedMotion) return;

    const gx = pointer.x;
    const gy = pointer.y;
    const glowRadius = Math.min(width, height) * 0.22;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, glowRadius);
    glow.addColorStop(0, "rgba(59, 130, 246, 0.14)");
    glow.addColorStop(0.35, "rgba(96, 165, 250, 0.06)");
    glow.addColorStop(0.7, "rgba(6, 182, 212, 0.02)");
    glow.addColorStop(1, "rgba(59, 130, 246, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(gx - glowRadius, gy - glowRadius, glowRadius * 2, glowRadius * 2);

    const ring = ctx.createRadialGradient(gx, gy, glowRadius * 0.15, gx, gy, glowRadius * 0.55);
    ring.addColorStop(0, "rgba(96, 165, 250, 0)");
    ring.addColorStop(0.5, "rgba(59, 130, 246, 0.08)");
    ring.addColorStop(1, "rgba(59, 130, 246, 0)");
    ctx.fillStyle = ring;
    ctx.fillRect(gx - glowRadius, gy - glowRadius, glowRadius * 2, glowRadius * 2);

    ctx.strokeStyle = "rgba(147, 197, 253, 0.12)";
    ctx.lineWidth = 0.5;
    const cross = 18;
    ctx.beginPath();
    ctx.moveTo(gx - cross, gy);
    ctx.lineTo(gx + cross, gy);
    ctx.moveTo(gx, gy - cross);
    ctx.lineTo(gx, gy + cross);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(gx, gy, 6, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(96, 165, 250, 0.2)";
    ctx.stroke();

    ctx.restore();
  }

  function drawVignette() {
    const gradient = ctx.createRadialGradient(
      width * 0.5,
      height * 0.5,
      Math.min(width, height) * 0.2,
      width * 0.5,
      height * 0.5,
      Math.max(width, height) * 0.75
    );
    gradient.addColorStop(0, "rgba(10, 17, 32, 0)");
    gradient.addColorStop(1, "rgba(10, 17, 32, 0.45)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  function render(t) {
    drawBase();
    drawMesh(t);
    drawBlueprintGrid();
    drawCursorGlow();
    drawVignette();
  }

  function animate() {
    time += 16;
    render(time);
    animationId = requestAnimationFrame(animate);
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    pointer.smoothX = 0;
    pointer.smoothY = 0;
  }

  function setPointer(x, y, active) {
    pointer.x = x;
    pointer.y = y;
    pointer.active = active;
  }

  window.addEventListener("mousemove", (e) => setPointer(e.clientX, e.clientY, true));
  window.addEventListener("mouseleave", () => setPointer(-1000, -1000, false));
  window.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches[0]) {
        setPointer(e.touches[0].clientX, e.touches[0].clientY, true);
      }
    },
    { passive: true }
  );
  window.addEventListener("touchend", () => setPointer(-1000, -1000, false));
  window.addEventListener("resize", () => {
    resize();
    if (reducedMotion) render(0);
  });

  resize();

  if (reducedMotion) {
    render(0);
  } else {
    animate();
  }

  window.addEventListener("beforeunload", () => {
    if (animationId) cancelAnimationFrame(animationId);
  });
})();
