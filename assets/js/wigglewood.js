/* Wiggle Wood — interactions: nav, reveals, parallax, fireflies, chart, menu */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Sticky nav state ---- */
  var nav = document.querySelector(".nav");
  function onScrollNav() {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 40);
  }

  /* ---- Mobile menu ---- */
  var toggle = document.querySelector(".nav__toggle");
  var links = document.querySelector(".nav__links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") links.classList.remove("open");
    });
  }

  /* ---- Scroll reveal ---- */
  var revealEls = document.querySelectorAll("[data-reveal],[data-reveal-stagger]");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            if (en.target.hasAttribute("data-chart")) animateChart(en.target);
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
    document.querySelectorAll("[data-chart]").forEach(animateChart);
  }

  function animateChart(scope) {
    (scope || document).querySelectorAll(".bar__fill").forEach(function (b) {
      var h = b.getAttribute("data-h") || "20";
      requestAnimationFrame(function () { b.style.height = h + "%"; });
    });
  }

  /* ---- Scroll parallax (subtle, transform-only) ---- */
  var pEls = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  var ticking = false;
  function applyParallax() {
    var y = window.scrollY;
    for (var i = 0; i < pEls.length; i++) {
      var el = pEls[i];
      var s = parseFloat(el.getAttribute("data-speed")) || 0.08;
      el.style.transform = "translate3d(0," + (y * s).toFixed(1) + "px,0)";
    }
  }
  function onScroll() {
    onScrollNav();
    if (!reduce && pEls.length && !ticking) {
      ticking = true;
      requestAnimationFrame(function () { applyParallax(); ticking = false; });
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScrollNav();
  if (!reduce) applyParallax();

  /* ---- Fireflies / spores over the whole forest ---- */
  var field = document.querySelector(".fireflies");
  if (field && !reduce) {
    var N = window.innerWidth < 680 ? 16 : 32;
    var palette = ["#fff6c2", "#bdeaff", "#d8ffce", "#ffe07a"];
    for (var k = 0; k < N; k++) {
      var f = document.createElement("span");
      f.className = "firefly";
      var size = 3 + Math.random() * 7;
      f.style.width = f.style.height = size.toFixed(1) + "px";
      f.style.left = (Math.random() * 100).toFixed(2) + "%";
      f.style.bottom = "-" + (Math.random() * 30).toFixed(0) + "px";
      f.style.setProperty("--dx", (Math.random() * 140 - 70).toFixed(0) + "px");
      f.style.animationDuration = (10 + Math.random() * 14).toFixed(1) + "s";
      f.style.animationDelay = "-" + (Math.random() * 18).toFixed(1) + "s";
      var c = palette[k % palette.length];
      f.style.background = "radial-gradient(circle," + c + ",rgba(255,224,122,.04) 70%)";
      f.style.boxShadow = "0 0 10px 2px " + c + "99";
      field.appendChild(f);
    }
  }

  /* ---- Drifting leaves over the whole world ---- */
  var leafField = document.querySelector(".leaves");
  if (leafField && !reduce) {
    // hand-drawn-ish leaf silhouettes in the Wiggle Wood greens
    var leafColors = ["%238ccb6e", "%235aa152", "%23c3ef8f", "%232f7d52", "%23e79a23"];
    function leafSvg(c) {
      return "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpath d='M28 4C14 5 5 14 4 28c14-1 23-10 24-24z' fill='" + c + "'/%3E%3Cpath d='M6 26C12 18 19 11 27 6' stroke='%23204d2a' stroke-width='1.4' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")";
    }
    var LN = window.innerWidth < 680 ? 7 : 14;
    for (var i = 0; i < LN; i++) {
      var leaf = document.createElement("span");
      leaf.className = "leaf";
      var sz = 16 + Math.random() * 22;
      leaf.style.width = leaf.style.height = sz.toFixed(0) + "px";
      leaf.style.left = (Math.random() * 100).toFixed(2) + "%";
      leaf.style.backgroundImage = leafSvg(leafColors[i % leafColors.length]);
      leaf.style.setProperty("--dx", (Math.random() * 220 - 60).toFixed(0) + "px");
      leaf.style.setProperty("--dr", (260 + Math.random() * 620).toFixed(0) + "deg");
      leaf.style.animationDuration = (13 + Math.random() * 16).toFixed(1) + "s";
      leaf.style.animationDelay = "-" + (Math.random() * 24).toFixed(1) + "s";
      leaf.style.opacity = "0";
      leafField.appendChild(leaf);
    }
  }

  /* ---- Year in footer ---- */
  var yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();
})();
