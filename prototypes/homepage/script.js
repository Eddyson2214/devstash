(() => {
  "use strict";

  initNavbarScroll();
  initChaosAnimation();
  initScrollFadeIn();
  initPricingToggle();
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------ */
  /* Navbar: more opaque background once the page has scrolled          */
  /* ------------------------------------------------------------------ */
  function initNavbarScroll() {
    const navbar = document.getElementById("navbar");
    if (!navbar) return;

    const updateNavbar = () => {
      navbar.classList.toggle("scrolled", window.scrollY > 12);
    };

    updateNavbar();
    window.addEventListener("scroll", updateNavbar, { passive: true });
  }

  /* ------------------------------------------------------------------ */
  /* Chaos icons: drift, bounce off walls, repel from the mouse         */
  /* ------------------------------------------------------------------ */
  function initChaosAnimation() {
    const container = document.getElementById("chaosIcons");
    if (!container) return;

    const icons = Array.from(container.querySelectorAll(".chaos-icon"));
    if (!icons.length) return;

    const REPEL_RADIUS = 90;
    const REPEL_STRENGTH = 900;
    const MAX_SPEED = 0.6;

    let bounds = container.getBoundingClientRect();
    window.addEventListener("resize", () => {
      bounds = container.getBoundingClientRect();
    });

    const state = icons.map((el, i) => {
      const size = el.offsetWidth || 52;
      const x = Math.random() * Math.max(1, bounds.width - size);
      const y = Math.random() * Math.max(1, bounds.height - size);
      const angle = Math.random() * Math.PI * 2;
      el.style.animationDelay = `${(i * 0.4).toFixed(2)}s`;
      return {
        el,
        size,
        x,
        y,
        vx: Math.cos(angle) * (0.15 + Math.random() * 0.2),
        vy: Math.sin(angle) * (0.15 + Math.random() * 0.2),
        rotation: (Math.random() - 0.5) * 20,
      };
    });

    let mouseX = -9999;
    let mouseY = -9999;
    let mouseActive = false;

    container.addEventListener("mousemove", (event) => {
      const rect = container.getBoundingClientRect();
      mouseX = event.clientX - rect.left;
      mouseY = event.clientY - rect.top;
      mouseActive = true;
    });

    container.addEventListener("mouseleave", () => {
      mouseActive = false;
      mouseX = -9999;
      mouseY = -9999;
    });

    let lastTime = performance.now();

    function tick(now) {
      const dt = Math.min(32, now - lastTime);
      lastTime = now;

      bounds = container.getBoundingClientRect();
      const width = bounds.width;
      const height = bounds.height;

      for (const item of state) {
        if (mouseActive) {
          const cx = item.x + item.size / 2;
          const cy = item.y + item.size / 2;
          const dx = cx - mouseX;
          const dy = cy - mouseY;
          const dist = Math.hypot(dx, dy);
          if (dist < REPEL_RADIUS && dist > 0.01) {
            const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * REPEL_STRENGTH;
            item.vx += (dx / dist) * force * 0.00005 * dt;
            item.vy += (dy / dist) * force * 0.00005 * dt;
          }
        }

        const speed = Math.hypot(item.vx, item.vy);
        if (speed > MAX_SPEED) {
          item.vx = (item.vx / speed) * MAX_SPEED;
          item.vy = (item.vy / speed) * MAX_SPEED;
        }

        item.x += item.vx * dt;
        item.y += item.vy * dt;

        const maxX = Math.max(0, width - item.size);
        const maxY = Math.max(0, height - item.size);

        if (item.x < 0) {
          item.x = 0;
          item.vx = Math.abs(item.vx);
        } else if (item.x > maxX) {
          item.x = maxX;
          item.vx = -Math.abs(item.vx);
        }

        if (item.y < 0) {
          item.y = 0;
          item.vy = Math.abs(item.vy);
        } else if (item.y > maxY) {
          item.y = maxY;
          item.vy = -Math.abs(item.vy);
        }

        item.el.style.transform = `translate(${item.x}px, ${item.y}px)`;
      }

      requestAnimationFrame(tick);
    }

    requestAnimationFrame((now) => {
      lastTime = now;
      requestAnimationFrame(tick);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Fade elements in as they scroll into view                          */
  /* ------------------------------------------------------------------ */
  function initScrollFadeIn() {
    const targets = document.querySelectorAll(".fade-in");
    if (!targets.length) return;

    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("in-view"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------ */
  /* Pricing: monthly / yearly toggle                                   */
  /* ------------------------------------------------------------------ */
  function initPricingToggle() {
    const toggle = document.getElementById("billingToggle");
    if (!toggle) return;

    const options = document.querySelectorAll(".toggle-option");
    const amounts = document.querySelectorAll(".price-amount[data-monthly]");
    const periods = document.querySelectorAll(".price-period[data-monthly]");

    toggle.addEventListener("click", () => {
      const isYearly = toggle.getAttribute("aria-pressed") !== "true";
      toggle.setAttribute("aria-pressed", String(isYearly));

      options.forEach((option) => {
        const matches = option.dataset.period === (isYearly ? "yearly" : "monthly");
        option.classList.toggle("toggle-option-active", matches);
      });

      amounts.forEach((el) => {
        el.textContent = isYearly ? el.dataset.yearly : el.dataset.monthly;
      });

      periods.forEach((el) => {
        el.textContent = isYearly ? el.dataset.yearly : el.dataset.monthly;
      });
    });
  }
})();
