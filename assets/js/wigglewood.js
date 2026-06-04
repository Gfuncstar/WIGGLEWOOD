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

  /* ---- Dropdown groups ---- */
  document.querySelectorAll(".nav__group-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var isMobile = window.innerWidth <= 680;
      if (isMobile) {
        /* mobile: toggle accordion */
        var dropdown = btn.nextElementSibling;
        var isOpen = dropdown.classList.toggle("open");
        btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      }
    });
  });

  /* Desktop: close dropdowns on outside click */
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".nav__group")) {
      document.querySelectorAll(".nav__group-btn").forEach(function (btn) {
        btn.setAttribute("aria-expanded", "false");
      });
    }
  });

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

  /* ---- Drifting leaves over the whole world ---- */
  var leafField = document.querySelector(".leaves");
  if (leafField && !reduce) {
    // hand-drawn-ish leaf silhouettes in the Wiggle Wood greens
    var leafColors = ["%238ccb6e", "%235aa152", "%23c3ef8f", "%232f7d52", "%23e79a23"];
    function leafSvg(c) {
      return "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpath d='M28 4C14 5 5 14 4 28c14-1 23-10 24-24z' fill='" + c + "'/%3E%3Cpath d='M6 26C12 18 19 11 27 6' stroke='%23204d2a' stroke-width='1.4' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")";
    }
    var LN = window.innerWidth < 680 ? 6 : 11;
    for (var i = 0; i < LN; i++) {
      var leaf = document.createElement("span");
      leaf.className = "leaf";
      var sz = 38 + Math.random() * 44;
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

  /* ---- Floating forest air: pollen motes + drifting seeds ---- */
  var moteField = document.querySelector(".motes");
  if (moteField && !reduce) {
    var MN = window.innerWidth < 680 ? 14 : 26;
    for (var m = 0; m < MN; m++) {
      var mote = document.createElement("span");
      mote.className = "mote";
      var ms = 3 + Math.random() * 7;
      mote.style.width = mote.style.height = ms.toFixed(1) + "px";
      mote.style.left = (Math.random() * 100).toFixed(2) + "%";
      mote.style.bottom = "-" + (Math.random() * 20).toFixed(0) + "px";
      mote.style.setProperty("--dx", (Math.random() * 120 - 60).toFixed(0) + "px");
      mote.style.animationDuration = (16 + Math.random() * 18).toFixed(1) + "s";
      mote.style.animationDelay = "-" + (Math.random() * 26).toFixed(1) + "s";
      moteField.appendChild(mote);
    }
    // a few dandelion seeds drifting through
    var seedSvg = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cg stroke='%23eef7e6' stroke-width='1.2' opacity='.9'%3E%3Cline x1='20' y1='20' x2='20' y2='38'/%3E%3Cg stroke-linecap='round'%3E%3Cline x1='20' y1='14' x2='20' y2='3'/%3E%3Cline x1='20' y1='14' x2='12' y2='5'/%3E%3Cline x1='20' y1='14' x2='28' y2='5'/%3E%3Cline x1='20' y1='14' x2='8' y2='12'/%3E%3Cline x1='20' y1='14' x2='32' y2='12'/%3E%3Cline x1='20' y1='14' x2='14' y2='3'/%3E%3Cline x1='20' y1='14' x2='26' y2='3'/%3E%3C/g%3E%3C/g%3E%3Ccircle cx='20' cy='20' r='2' fill='%23d8c89a'/%3E%3C/svg%3E\")";
    var SN = window.innerWidth < 680 ? 2 : 4;
    for (var s = 0; s < SN; s++) {
      var seed = document.createElement("span");
      seed.className = "seed";
      var ss = 22 + Math.random() * 18;
      seed.style.width = seed.style.height = ss.toFixed(0) + "px";
      seed.style.left = (Math.random() * 100).toFixed(2) + "%";
      seed.style.top = "-6%";
      seed.style.backgroundImage = seedSvg;
      seed.style.setProperty("--dx", (Math.random() * 260 - 80).toFixed(0) + "px");
      seed.style.setProperty("--dr", (180 + Math.random() * 460).toFixed(0) + "deg");
      seed.style.animationDuration = (22 + Math.random() * 20).toFixed(1) + "s";
      seed.style.animationDelay = "-" + (Math.random() * 30).toFixed(1) + "s";
      moteField.appendChild(seed);
    }
  }

  /* ---- Year in footer ---- */
  var yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();
})();
