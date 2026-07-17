/* ============================================================
   For Designers · Going Deeper (own page)
   Retains the Going Deeper stepper (Next/Back + jump): tools · figma · claude-code.
   Claude Code sub-nav: floating TOC (>=1280px) / jump menu + scroll-spy.
   Hash routing for deep links.
   ============================================================ */
(function () {
  "use strict";

  var SD = ["tools", "figma", "claude-code"];
  var panels = {};
  document.querySelectorAll(".panel[data-dstep]").forEach(function (p) { panels[Number(p.getAttribute("data-dstep"))] = p; });
  var tabs = Array.prototype.slice.call(document.querySelectorAll("#stepper-2 .step-tab"));
  var cur = 0;

  var suppressHash = false;
  function setHash(id) { if (location.hash !== "#" + id) { suppressHash = true; location.hash = id; } }

  function go(idx, fromHash) {
    cur = Math.max(0, Math.min(SD.length - 1, idx));
    Object.keys(panels).forEach(function (k) { panels[k].hidden = Number(k) !== cur; });
    tabs.forEach(function (t, i) { t.setAttribute("aria-selected", i === cur ? "true" : "false"); });
    if (!fromHash) setHash(SD[cur]);
    var h = panels[cur].querySelector(".section-h");
    if (h) h.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
    updateTocVisibility();
  }

  tabs.forEach(function (t, i) { t.addEventListener("click", function () { go(i); }); });
  document.addEventListener("click", function (e) {
    if (e.target.closest(".js-nextD")) { go(cur + 1); return; }
    if (e.target.closest(".js-backD")) { go(cur - 1); return; }
  });

  /* ---------- Claude Code sub-nav (TOC + jump menu + scroll-spy) ---------- */
  var toc = document.getElementById("cc-toc");
  var ccPanel = document.getElementById("claude-code");
  var ccInView = false;
  function isWide() { return window.matchMedia("(min-width: 1280px)").matches; }
  function updateTocVisibility() {
    var show = ccInView && isWide() && panels[2] && !panels[2].hidden;
    if (toc) toc.classList.toggle("visible", !!show);
  }
  if (ccPanel && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      ccInView = entries[0].isIntersecting;
      updateTocVisibility();
    }, { threshold: 0, rootMargin: "-120px 0px -40% 0px" }).observe(ccPanel);
  }
  window.addEventListener("resize", updateTocVisibility);

  var ccSubs = Array.prototype.slice.call(document.querySelectorAll(".cc-sub"));
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll(".cc-toc a, .cc-jump-list a"));
  var spyScheduled = false;
  function updateActiveSub() {
    spyScheduled = false;
    if (!ccSubs.length) return;
    var active = ccSubs[0];
    ccSubs.forEach(function (s) { if (s.getBoundingClientRect().top <= 160) active = s; });
    tocLinks.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + active.id); });
  }
  window.addEventListener("scroll", function () {
    if (!spyScheduled) { spyScheduled = true; requestAnimationFrame(updateActiveSub); }
  }, { passive: true });

  var jumpBtn = document.getElementById("cc-jump-btn");
  var jumpList = document.getElementById("cc-jump-list");
  if (jumpBtn) {
    jumpBtn.addEventListener("click", function () {
      var open = jumpList.hidden;
      jumpList.hidden = !open;
      jumpBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  document.querySelectorAll("[data-cc]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var target = document.querySelector(a.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      if (jumpList) { jumpList.hidden = true; if (jumpBtn) jumpBtn.setAttribute("aria-expanded", "false"); }
    });
  });

  /* ---------- Hash routing ---------- */
  function sync(initial) {
    if (suppressHash) { suppressHash = false; return; }
    var id = (location.hash || "").replace("#", "");
    if (SD.indexOf(id) !== -1) go(SD.indexOf(id), true);
    else if (initial) go(0, true);
  }
  window.addEventListener("hashchange", function () { sync(false); });

  var start = (location.hash || "").replace("#", "");
  if (SD.indexOf(start) !== -1) go(SD.indexOf(start), true); else go(0, true);
})();
