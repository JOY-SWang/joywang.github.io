(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const masthead = document.querySelector(".masthead");
  if (masthead) {
    const onScroll = () => masthead.classList.toggle("is-scrolled", window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  const rotate = document.getElementById("joy-rotate");
  if (rotate && !reduce) {
    const words = (rotate.dataset.words || "").split("|").map((w) => w.trim()).filter(Boolean);
    if (words.length > 1) {
      let i = 0;
      setInterval(() => {
        i = (i + 1) % words.length;
        rotate.style.opacity = "0";
        setTimeout(() => {
          rotate.textContent = words[i];
          rotate.style.opacity = "1";
        }, 180);
      }, 2400);
      rotate.style.transition = "opacity 180ms ease";
    }
  }

  const canvas = document.getElementById("joy-net");
  if (!canvas || reduce) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  const parent = canvas.parentElement;
  const mouse = { x: -9999, y: -9999 };
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;
  let nodes = [];
  let raf = 0;

  const spawn = () => {
    const count = Math.max(28, Math.min(72, Math.floor((width * height) / 18000)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.32,
      r: Math.random() * 1.3 + 0.5
    }));
  };

  const resize = () => {
    const rect = parent.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    spawn();
  };

  const tick = () => {
    ctx.clearRect(0, 0, width, height);
    for (const node of nodes) {
      const dx = mouse.x - node.x;
      const dy = mouse.y - node.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist < 140) {
        node.vx += (dx / dist) * 0.012;
        node.vy += (dy / dist) * 0.012;
      }
      node.x += node.vx;
      node.y += node.vy;
      if (node.x < 0 || node.x > width) node.vx *= -1;
      if (node.y < 0 || node.y > height) node.vy *= -1;
      node.vx *= 0.995;
      node.vy *= 0.995;
    }

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 118) {
          ctx.strokeStyle = `rgba(196, 165, 116, ${0.16 * (1 - d / 118)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const node of nodes) {
      ctx.fillStyle = "rgba(47, 158, 139, 0.75)";
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fill();
    }

    raf = window.requestAnimationFrame(tick);
  };

  parent.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
  });
  parent.addEventListener("pointerleave", () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.cancelAnimationFrame(raf);
    } else {
      raf = window.requestAnimationFrame(tick);
    }
  });

  resize();
  raf = window.requestAnimationFrame(tick);
})();
