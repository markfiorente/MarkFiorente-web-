/* ===========================================================
   MarkFiorente — main.js
   Animaciones de entrada (GSAP), reveals al hacer scroll
   (ScrollTrigger), nav y scroll suave. Respeta reduced-motion.
   =========================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof window.gsap !== "undefined";

  /* ---------- Nav: fondo al hacer scroll ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 24) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll suave en anchors del nav ---------- */
  var navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start"
      });
    });
  });

  /* ---------- Fallback sin GSAP o con reduced-motion ---------- */
  function revealAllStatic() {
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      el.classList.add("is-revealed");
    });
  }

  if (reduceMotion || !hasGSAP) {
    revealAllStatic();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Entrada del hero (staggered) ---------- */
  var heroEls = gsap.utils.toArray(".hero [data-reveal]");
  gsap.to(heroEls, {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: "power3.out",
    stagger: 0.18,
    delay: 0.3
  });

  /* ---------- Reveals por sección al hacer scroll ---------- */
  var sections = gsap.utils.toArray("main .section");
  sections.forEach(function (section) {
    var items = gsap.utils.toArray("[data-reveal]", section);
    if (!items.length) return;
    gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: {
        trigger: section,
        start: "top 78%",
        once: true
      }
    });
  });
})();
