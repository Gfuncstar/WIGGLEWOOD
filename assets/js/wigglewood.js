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

  /* ---- Year in footer ---- */
  var yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();
})();
