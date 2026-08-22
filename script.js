// Standalone public website script — plain JS port of the useEffect logic in
// frontend/src/pages/Welcome.tsx (main SGMQ-Connect app). Kept behavior-identical on purpose;
// if you change the animation/carousel logic there, mirror the change here too.

// ---- ONE constant to update once the real subdomain exists ----
// Today (no domain yet): the SGMQ-Connect system's Render URL.
// Later, once ccfqatar.org + sgmq-connect.ccfqatar.org are set up, change this to
// "https://sgmq-connect.ccfqatar.org" and nothing else in this file needs to change.
const SGMQ_APP_URL = "https://sgmq-connect.onrender.com";

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("loginLink").href = SGMQ_APP_URL + "/login";
  document.querySelectorAll(".join-link").forEach(function (el) {
    el.href = SGMQ_APP_URL + "/join";
  });

  const nav = document.getElementById("wlcNav");
  const heroSection = document.querySelector(".wlc-hero");
  const heroMedia = document.getElementById("heroMedia");
  if (!nav || !heroSection || !heroMedia) return;

  const heroHeight = heroSection.offsetHeight || window.innerHeight;
  const heroPanels = Array.from(heroSection.querySelectorAll(".wlc-hero-panel"));

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;
    if (y > 40) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");

    const progress = Math.min(y / (heroHeight * 0.9), 1);
    const scale = 1 + progress * 0.12;
    const translate = progress * 60;
    const opacity = 1 - progress;
    heroMedia.style.transform = "translateY(" + translate + "px) scale(" + scale + ")";
    heroMedia.style.opacity = String(opacity);
    heroPanels.forEach(function (p) {
      p.style.opacity = String(opacity);
      p.style.transform = "translateY(" + (translate * 0.6) + "px)";
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Clear space below the fixed nav for the hero panels' text/logo, using the nav's *actual*
  // rendered height rather than a guessed percentage - it stays a single row on every screen
  // size now (mobile uses the hamburger overlay below instead of wrapping), but measuring
  // instead of hardcoding keeps this correct even if the nav's height ever changes. See
  // --nav-h usage on .wlc-hero-panel / .wlc-hero-logo3 in index.html's <style>.
  function updateNavHeight() {
    heroSection.style.setProperty("--nav-h", nav.getBoundingClientRect().height + "px");
  }
  updateNavHeight();
  var navResizeObs = new ResizeObserver(updateNavHeight);
  navResizeObs.observe(nav);

  // Apple-style full-screen mobile/tablet menu (<=900px): hamburger toggles a full-screen
  // overlay nav, replacing the old approach of letting .wlc-nav-links wrap onto 2-3 rows
  // inline in the nav bar (which ate a lot of vertical space and was the root cause of an
  // earlier hero/nav overlap bug). Locks body scroll while open.
  var burger = document.getElementById("wlcBurger");
  var mobileMenu = document.getElementById("wlcMobileMenu");
  var mobileClose = document.getElementById("wlcMobileClose");
  function closeMobileMenu() {
    if (burger) { burger.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }
    if (mobileMenu) mobileMenu.classList.remove("open");
    document.body.style.overflow = "";
  }
  function openMobileMenu() {
    if (burger) { burger.classList.add("open"); burger.setAttribute("aria-expanded", "true"); }
    if (mobileMenu) mobileMenu.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function toggleMobileMenu() {
    if (mobileMenu && mobileMenu.classList.contains("open")) closeMobileMenu();
    else openMobileMenu();
  }
  if (burger) burger.addEventListener("click", toggleMobileMenu);
  if (mobileClose) mobileClose.addEventListener("click", closeMobileMenu);
  if (mobileMenu) mobileMenu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMobileMenu); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMobileMenu(); });

  // Apple-style mega dropdown (ABOUT -> CCF Main church logo/link)
  const megaPanel = document.getElementById("wlcMegaPanel");
  if (megaPanel) {
    let megaCloseTimer;
    const positionMega = function () { megaPanel.style.top = nav.getBoundingClientRect().bottom + "px"; };
    const openMega = function () { clearTimeout(megaCloseTimer); positionMega(); megaPanel.classList.add("open"); };
    const closeMegaDelayed = function () {
      clearTimeout(megaCloseTimer);
      megaCloseTimer = setTimeout(function () { megaPanel.classList.remove("open"); }, 200);
    };
    document.querySelectorAll(".wlc-nav-item[data-dropdown]").forEach(function (item) {
      item.addEventListener("mouseenter", openMega);
      item.addEventListener("mouseleave", closeMegaDelayed);
    });
    megaPanel.addEventListener("mouseenter", function () { clearTimeout(megaCloseTimer); });
    megaPanel.addEventListener("mouseleave", closeMegaDelayed);
    window.addEventListener("scroll", function () { if (megaPanel.classList.contains("open")) positionMega(); }, { passive: true });
  }

  let heroSlideIndex = 0;
  const heroSlides = heroMedia.querySelectorAll(".wlc-hero-slide");

  function activateHeroSlide(index) {
    heroPanels.forEach(function (p, i) {
      p.classList.remove("active");
      if (i === index) {
        void p.offsetWidth; // force reflow so the reveal animation restarts every cycle
        p.classList.add("active");
      }
    });
  }
  activateHeroSlide(heroSlideIndex);

  if (heroSlides.length > 1) {
    setInterval(function () {
      heroSlides[heroSlideIndex].classList.remove("active");
      heroSlideIndex = (heroSlideIndex + 1) % heroSlides.length;
      heroSlides[heroSlideIndex].classList.add("active");
      activateHeroSlide(heroSlideIndex);
    }, 6000);
  }

  const revealEls = document.querySelectorAll(".wlc-fullbleed, .wlc-reveal, #wlc-contact");
  const revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) e.target.classList.add("in-view"); });
  }, { threshold: 0.15 });
  revealEls.forEach(function (el) { revealObs.observe(el); });

  const navLinks = document.querySelectorAll(".wlc-nav-links a, .wlc-mobile-menu a");
  const secIds = ["wlc-home", "wlc-about", "wlc-service", "wlc-resources", "wlc-events", "wlc-ministries", "wlc-contact"];
  const secEls = secIds.map(function (id) { return document.getElementById(id); });
  const navObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        navLinks.forEach(function (a) { a.classList.remove("active"); });
        const matches = document.querySelectorAll('.wlc-nav-links a[data-sec="' + e.target.id + '"], .wlc-mobile-menu a[data-sec="' + e.target.id + '"]');
        matches.forEach(function (m) { m.classList.add("active"); });
      }
    });
  }, { threshold: 0.5 });
  secEls.forEach(function (el) { if (el) navObs.observe(el); });

  // One small interval-driven carousel per photo section (Resources/About/Events).
  function startCarousel(containerId, ms) {
    const container = document.getElementById(containerId);
    const slides = container ? container.querySelectorAll(".wlc-slide") : null;
    if (!slides || slides.length < 2) return;
    let idx = 0;
    setInterval(function () {
      slides[idx].classList.remove("active");
      idx = (idx + 1) % slides.length;
      slides[idx].classList.add("active");
    }, ms);
  }
  startCarousel("wlc-resources", 4500);
  startCarousel("wlc-about", 4500);
  startCarousel("wlc-events", 4500);
});
