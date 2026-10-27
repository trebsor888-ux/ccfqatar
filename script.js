// Standalone public website script — plain JS port of the useEffect logic in
// frontend/src/pages/Welcome.tsx (main SGMQ-Connect app). Kept behavior-identical on purpose;
// if you change the animation/carousel logic there, mirror the change here too.

// ---- ONE constant to update once the real subdomain exists ----
// Used only for the Dgroup sign-up form's API calls (the site no longer links into the system).
// Today (no domain yet): the SGMQ-Connect system's Render URL.
// Later, once ccfqatar.org + sgmq-connect.ccfqatar.org are set up, change this to
// "https://sgmq-connect.ccfqatar.org" and nothing else in this file needs to change.
const SGMQ_APP_URL = "https://sgmq-connect.onrender.com";

document.addEventListener("DOMContentLoaded", function () {
  // The SGM logo (#loginLink) used to be a plain link to SGMQ_APP_URL + "/login". Since Oct 2026
  // leaders agreed to keep the system out of public view, so it's only reachable through the
  // staff tap pattern + question below.
  // Every "Join a Dgroup" button points to the GET IN TOUCH WITH US form in the home page's
  // contact section, not the system's /join page. Leaders agreed (Oct 2026) to keep SGMQ-Connect
  // out of public view for now, so the public site no longer links into it for registration.
  // On index.html the form is on the same page; on any other page (dgroup.html) it's a hop back.
  var contactHref = document.getElementById("wlc-join-form") ? "#wlc-join-form" : "index.html#wlc-join-form";
  document.querySelectorAll(".join-link").forEach(function (el) {
    el.href = contactHref;
    el.removeAttribute("target");
  });

  // Staff-only way into SGMQ-Connect (Oct 2026): tap the SGM logo 5 times within 3 seconds and a
  // "Who are you?" popup asks the staff question. Only the right answer goes on to the system's
  // login page (where the normal email + password is still required). The answer is stored only
  // as a SHA-256 hash of its letters, lowercased, so it doesn't sit in plain text in this file.
  (function () {
    var logo = document.getElementById("loginLink");
    if (!logo) return;
    var TAPS = 5, WINDOW_MS = 3000;
    var ANSWER_HASHES = [
      "fd84eec3342d4a9fe3983d8ac7ca3d822f728326b51bfa4246f06b1df9778e1c", // I'm a child of God
      "8860f28b51d41d2059b4e526a687ed444f247b742bc030b2fa2df6aacbdd49e5"  // I am a child of God
    ];
    var FAIL_MSG = "Classified Resource: Authentication Failed";

    var css = document.createElement("style");
    css.textContent =
      "#loginLink { cursor:default; touch-action:manipulation; -webkit-user-select:none; user-select:none; -webkit-tap-highlight-color:transparent; }" +
      "#loginLink img { pointer-events:none; -webkit-user-drag:none; }" +
      ".wlc-sa-backdrop { position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; padding:16px; background:rgba(3,8,11,.72); -webkit-backdrop-filter:blur(8px); backdrop-filter:blur(8px); opacity:0; transition:opacity .25s ease; }" +
      ".wlc-sa-backdrop.show { opacity:1; }" +
      ".wlc-sa-card { position:relative; width:100%; max-width:360px; padding:28px 24px 22px; border-radius:16px; background:rgba(14,26,31,.92); border:1px solid rgba(93,202,165,.28); box-shadow:0 20px 60px rgba(0,0,0,.55); color:#fff; text-align:center; transform:translateY(12px) scale(.97); transition:transform .25s ease; }" +
      ".wlc-sa-backdrop.show .wlc-sa-card { transform:none; }" +
      ".wlc-sa-card.shake { animation:wlcSaShake .4s; }" +
      "@keyframes wlcSaShake { 0%,100%{transform:none} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }" +
      ".wlc-sa-close { position:absolute; top:10px; right:12px; border:none; background:none; color:rgba(255,255,255,.5); font-size:22px; line-height:1; cursor:pointer; padding:4px; }" +
      ".wlc-sa-close:hover { color:#fff; }" +
      ".wlc-sa-logo { height:30px; width:auto; margin:0 auto 14px; display:block; }" +
      ".wlc-sa-q { margin:0 0 16px; font-size:1.25rem; font-weight:700; letter-spacing:.02em; }" +
      ".wlc-sa-input { width:100%; box-sizing:border-box; padding:.7rem .85rem; border-radius:10px; border:1px solid rgba(255,255,255,.18); background:rgba(255,255,255,.06); color:#fff; font-size:1rem; font-family:inherit; text-align:center; outline:none; transition:border-color .2s; }" +
      ".wlc-sa-input:focus { border-color:#2FBF71; }" +
      ".wlc-sa-input.bad { border-color:#F87171; }" +
      ".wlc-sa-btn { width:100%; margin-top:12px; padding:.7rem; border:none; border-radius:10px; background:#2FBF71; color:#06140D; font-size:.95rem; font-weight:700; font-family:inherit; cursor:pointer; transition:filter .2s; }" +
      ".wlc-sa-btn:hover { filter:brightness(1.1); }" +
      ".wlc-sa-btn:disabled { opacity:.6; cursor:default; }" +
      ".wlc-sa-msg { min-height:1.2em; margin:12px 0 0; font-size:.82rem; font-weight:600; color:#F87171; }" +
      ".wlc-sa-msg.ok { color:#5DCAA5; }";
    document.head.appendChild(css);

    var taps = [];
    logo.addEventListener("click", function () {
      var now = Date.now();
      taps = taps.filter(function (t) { return now - t < WINDOW_MS; });
      taps.push(now);
      if (taps.length >= TAPS) { taps = []; openPopup(); }
    });

    function normalize(s) { return s.toLowerCase().replace(/[^a-z]/g, ""); }

    function sha256(text) {
      return crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)).then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
      });
    }

    function openPopup() {
      if (document.querySelector(".wlc-sa-backdrop")) return;
      var logoSrc = logo.querySelector("img") ? logo.querySelector("img").getAttribute("src") : "";
      var backdrop = document.createElement("div");
      backdrop.className = "wlc-sa-backdrop";
      backdrop.innerHTML =
        '<form class="wlc-sa-card" role="dialog" aria-modal="true" aria-labelledby="wlcSaQ" autocomplete="off">' +
          '<button type="button" class="wlc-sa-close" aria-label="Close">&times;</button>' +
          (logoSrc ? '<img class="wlc-sa-logo" src="' + logoSrc + '" alt="" />' : "") +
          '<h4 class="wlc-sa-q" id="wlcSaQ">Who are you?</h4>' +
          '<input class="wlc-sa-input" type="text" maxlength="60" autocapitalize="off" spellcheck="false" aria-label="Your answer" />' +
          '<button type="submit" class="wlc-sa-btn">Enter</button>' +
          '<p class="wlc-sa-msg" role="alert"></p>' +
        "</form>";
      document.body.appendChild(backdrop);
      var card = backdrop.querySelector(".wlc-sa-card");
      var input = backdrop.querySelector(".wlc-sa-input");
      var btn = backdrop.querySelector(".wlc-sa-btn");
      var msg = backdrop.querySelector(".wlc-sa-msg");
      requestAnimationFrame(function () { backdrop.classList.add("show"); });
      setTimeout(function () { input.focus(); }, 50);

      function close() {
        backdrop.classList.remove("show");
        document.removeEventListener("keydown", onKey);
        setTimeout(function () { backdrop.remove(); }, 250);
      }
      function onKey(e) { if (e.key === "Escape") close(); }
      document.addEventListener("keydown", onKey);
      backdrop.querySelector(".wlc-sa-close").addEventListener("click", close);
      backdrop.addEventListener("click", function (e) { if (e.target === backdrop) close(); });
      input.addEventListener("input", function () { input.classList.remove("bad"); msg.textContent = ""; msg.classList.remove("ok"); });

      function fail() {
        msg.textContent = FAIL_MSG;
        input.classList.add("bad");
        input.value = "";
        card.classList.remove("shake");
        void card.offsetWidth;
        card.classList.add("shake");
        btn.disabled = false;
        input.focus();
      }

      card.addEventListener("submit", function (e) {
        e.preventDefault();
        var answer = normalize(input.value);
        if (!answer || !window.crypto || !crypto.subtle) { fail(); return; }
        btn.disabled = true;
        sha256(answer).then(function (hash) {
          if (ANSWER_HASHES.indexOf(hash) === -1) { fail(); return; }
          msg.classList.add("ok");
          msg.textContent = "Welcome. Opening the login page…";
          setTimeout(function () { window.location.href = SGMQ_APP_URL + "/login"; }, 700);
        }, fail);
      });
    }
  })();

  const nav = document.getElementById("wlcNav");

  // Nav scroll-to-glass toggle: this must work on EVERY page that shares this nav bar
  // (index.html's multi-slide hero AND dgroup.html's full-screen video hero), so it lives
  // here unconditionally rather than gated behind hero-slide-specific elements below.
  if (nav) {
    var onScroll = function () {
      const y = window.scrollY || window.pageYOffset;
      if (y > 40) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Home-page-only hero parallax (multi-slide hero with text/logo panels) - not present on
  // dgroup.html's full-screen video hero, so this whole block is skipped there.
  const heroSection = document.querySelector(".wlc-hero");
  const heroMedia = document.getElementById("heroMedia");
  if (nav && heroSection && heroMedia) {
    const heroHeight = heroSection.offsetHeight || window.innerHeight;
    const heroPanels = Array.from(heroSection.querySelectorAll(".wlc-hero-panel"));

    var onHeroScroll = function () {
      const y = window.scrollY || window.pageYOffset;
      const progress = Math.min(y / (heroHeight * 0.9), 1);
      const translate = progress * 60;
      const opacity = 1 - progress;
      heroMedia.style.transform = "translateY(" + translate + "px)";
      heroMedia.style.opacity = String(opacity);
      heroPanels.forEach(function (p) {
        p.style.opacity = String(opacity);
        p.style.transform = "translateY(" + (translate * 0.6) + "px)";
      });
    };
    window.addEventListener("scroll", onHeroScroll, { passive: true });
    onHeroScroll();

    // Clear space below the fixed nav for the hero panels' text/logo, using the nav's *actual*
    // rendered height rather than a guessed percentage - it stays a single row on every screen
    // size now (mobile uses the hamburger overlay below instead of wrapping), but measuring
    // instead of hardcoding keeps this correct even if the nav's height ever changes. See
    // --nav-h usage on .wlc-hero-panel / .wlc-hero-logo3 in index.html's <style>.
    var updateNavHeight = function () {
      heroSection.style.setProperty("--nav-h", nav.getBoundingClientRect().height + "px");
    };
    updateNavHeight();
    var navResizeObs = new ResizeObserver(updateNavHeight);
    navResizeObs.observe(nav);

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
  }

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

  // Apple-style disclosure rows inside the mobile overlay (ABOUT/MINISTRIES): tapping the
  // chevron expands a submenu with the same sub-link the desktop mega dropdown shows for that
  // tab, accordion-style (opening one closes any other that was open) - matches apple.com's
  // mobile nav pattern, since hover-based dropdowns don't work on touch.
  var mobileChevrons = mobileMenu ? Array.from(mobileMenu.querySelectorAll(".wlc-mobile-chevron")) : [];
  mobileChevrons.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var key = btn.getAttribute("data-toggle");
      var submenu = mobileMenu.querySelector('.wlc-mobile-submenu[data-submenu="' + key + '"]');
      var willOpen = !(submenu && submenu.classList.contains("open"));
      mobileMenu.querySelectorAll(".wlc-mobile-submenu.open").forEach(function (el) { el.classList.remove("open"); });
      mobileChevrons.forEach(function (c) { c.classList.remove("open"); c.setAttribute("aria-expanded", "false"); });
      if (willOpen) {
        if (submenu) submenu.classList.add("open");
        btn.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  // Dropdown (desktop/tablet hover, >900px): one shared panel whose content swaps per tab via
  // data-active (see .wlc-mega-content CSS). Position is re-centered under whichever tab is
  // currently hovered (activeItem) - was previously a full-width bar flush under the whole nav;
  // floats as a small card centered under that specific tab instead, clamped so it never runs
  // off either edge of the viewport.
  const megaPanel = document.getElementById("wlcMegaPanel");
  if (megaPanel) {
    let megaCloseTimer;
    let megaActiveItem = null;
    const positionMega = function () {
      megaPanel.style.top = nav.getBoundingClientRect().bottom + "px";
      if (!megaActiveItem) return;
      var itemRect = megaActiveItem.getBoundingClientRect();
      var panelWidth = megaPanel.getBoundingClientRect().width;
      var margin = 16;
      var centered = itemRect.left + itemRect.width / 2 - panelWidth / 2;
      var clamped = Math.max(margin, Math.min(centered, window.innerWidth - panelWidth - margin));
      megaPanel.style.left = clamped + "px";
    };
    const closeMegaDelayed = function () {
      clearTimeout(megaCloseTimer);
      megaCloseTimer = setTimeout(function () { megaPanel.classList.remove("open"); }, 200);
    };
    document.querySelectorAll(".wlc-nav-item[data-dropdown]").forEach(function (item) {
      var key = item.getAttribute("data-dropdown") || "";
      var openMega = function () {
        clearTimeout(megaCloseTimer);
        megaActiveItem = item;
        megaPanel.dataset.active = key;
        // data-active swap can change the panel's rendered width - measure/position on the next
        // frame so the width used for centering reflects the content that's about to show.
        requestAnimationFrame(positionMega);
        megaPanel.classList.add("open");
      };
      item.addEventListener("mouseenter", openMega);
      item.addEventListener("mouseleave", closeMegaDelayed);
    });
    megaPanel.addEventListener("mouseenter", function () { clearTimeout(megaCloseTimer); });
    megaPanel.addEventListener("mouseleave", closeMegaDelayed);
    window.addEventListener("scroll", function () { if (megaPanel.classList.contains("open")) positionMega(); }, { passive: true });
    window.addEventListener("resize", function () { if (megaPanel.classList.contains("open")) positionMega(); });
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

  // GET IN TOUCH WITH US = Dgroup sign-up (Oct 2026). Posts to SGMQ-Connect, which saves the
  // person as Pending for an admin to complete and a coordinator to contact on WhatsApp. The
  // system's CORS allows this site's origin on this one endpoint only.
  const joinForm = document.getElementById("wlcJoinForm");
  if (joinForm) {
    const SIGNUP_URL = SGMQ_APP_URL + "/api/people/website-signup";
    const formBox = document.getElementById("wlc-join-form");
    const success = document.getElementById("wlcJoinSuccess");
    const statusEl = document.getElementById("wlcJoinStatus");
    const submitBtn = joinForm.querySelector(".wlc-footer-submit");
    const byId = function (id) { return document.getElementById(id); };

    // Render's free tier sleeps the system after ~15 idle minutes and takes 30-60s to wake.
    // Ping it once as soon as a visitor heads for the form, so it's awake by the time they submit.
    var warmed = false;
    const warmUp = function () {
      if (warmed) return;
      warmed = true;
      fetch(SIGNUP_URL, { method: "GET" }).catch(function () {});
    };
    joinForm.addEventListener("focusin", warmUp);
    document.querySelectorAll(".join-link").forEach(function (el) { el.addEventListener("click", warmUp); });
    if ("IntersectionObserver" in window && formBox) {
      const warmObs = new IntersectionObserver(function (entries) {
        if (entries.some(function (en) { return en.isIntersecting; })) { warmUp(); warmObs.disconnect(); }
      }, { rootMargin: "300px" });
      warmObs.observe(formBox);
    }

    // Same-page join buttons: after the smooth scroll, flash the form box and put the cursor in
    // First Name so the visitor can start typing straight away.
    const highlightForm = function () {
      if (!formBox) return;
      formBox.classList.remove("wlc-formbox-flash"); void formBox.offsetWidth; formBox.classList.add("wlc-formbox-flash");
      setTimeout(function () { const f = byId("wlcFirst"); if (f && joinForm.style.display !== "none") f.focus({ preventScroll: true }); }, 700);
    };
    document.querySelectorAll('.join-link[href="#wlc-join-form"]').forEach(function (el) { el.addEventListener("click", highlightForm); });
    if (location.hash === "#wlc-join-form") setTimeout(highlightForm, 400); // arrived from dgroup.html

    const clearError = function (e) { const f = e.target.closest(".wlc-footer-field"); if (f) f.classList.remove("has-error"); };
    joinForm.addEventListener("input", clearError);
    joinForm.addEventListener("change", clearError);

    const validate = function () {
      var ok = true;
      const check = function (id, good) {
        byId(id).closest(".wlc-footer-field").classList.toggle("has-error", !good);
        if (!good) ok = false;
      };
      const phone = byId("wlcPhone").value.trim();
      const digits = phone.replace(/\D/g, "").length;
      check("wlcFirst", byId("wlcFirst").value.trim().length > 0);
      check("wlcLast", byId("wlcLast").value.trim().length > 0);
      check("wlcEmail", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(byId("wlcEmail").value.trim()));
      check("wlcPhone", /^[+\d\s()-]+$/.test(phone) && digits >= 8 && digits <= 15);
      check("wlcGender", !!byId("wlcGender").value);
      check("wlcCivil", !!byId("wlcCivil").value);
      return ok;
    };

    const showStatus = function (msg) { statusEl.textContent = msg; statusEl.classList.toggle("show", !!msg); };
    const UNREACHABLE = "Sorry, we couldn't send your details right now. Please try again in a minute, or email communication@ccfqatar.org.";

    joinForm.addEventListener("submit", function (e) {
      e.preventDefault();
      showStatus("");
      if (!validate()) {
        const bad = joinForm.querySelector(".has-error input, .has-error select");
        if (bad) bad.focus();
        return;
      }
      const payload = {
        first_name: byId("wlcFirst").value.trim(),
        last_name: byId("wlcLast").value.trim(),
        email: byId("wlcEmail").value.trim(),
        phone: byId("wlcPhone").value.trim(),
        gender: byId("wlcGender").value,
        civil_status: byId("wlcCivil").value,
        website: joinForm.elements.website.value,
      };
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
      // If the server was asleep despite the warm-up, the first request can take up to a minute.
      const slowTimer = setTimeout(function () { submitBtn.textContent = "Still sending… please wait"; }, 6000);
      const controller = "AbortController" in window ? new AbortController() : null;
      const abortTimer = controller ? setTimeout(function () { controller.abort(); }, 75000) : null;
      const done = function () {
        clearTimeout(slowTimer); if (abortTimer) clearTimeout(abortTimer);
        submitBtn.disabled = false; submitBtn.textContent = "Submit Request";
      };

      fetch(SIGNUP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller ? controller.signal : undefined,
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (data) { return { res: res, data: data }; });
        })
        .then(function (r) {
          done();
          if (!r.res.ok) { showStatus(r.data.error || UNREACHABLE); return; }
          byId("wlcSuccessTitle").textContent = "Thank you, " + payload.first_name + "!";
          joinForm.style.display = "none";
          success.classList.add("show");
        })
        .catch(function () { done(); showStatus(UNREACHABLE); });
    });

    byId("wlcJoinAgain").addEventListener("click", function () {
      joinForm.reset();
      showStatus("");
      success.classList.remove("show");
      joinForm.style.display = "";
    });
  }
});
