/* ============================================================
   Layer 4 — "For Designers"
   - Main stepper (section-level): giving · artifacts · trust
   - Going Deeper (opt-in): tools · figma · claude-code
   - Interactive prompt anatomy (clean-copy independent of state)
   - Copyable prompt blocks
   - Claude Code: floating TOC (desktop) / jump menu (tablet+mobile)
     + scroll-spy, shown only while that panel is in view at >=1280px
   - Hash routing for shareable deep links
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Main stepper ---------- */
  var S1 = ["giving", "artifacts", "trust"];
  var s1Panels = {};
  document.querySelectorAll(".panel[data-step]").forEach(function (p) { s1Panels[Number(p.getAttribute("data-step"))] = p; });
  var s1Tabs = Array.prototype.slice.call(document.querySelectorAll("#stepper-1 .step-tab"));
  var cur1 = 0;

  /* ---------- Going Deeper stepper ---------- */
  var SD = ["tools", "figma", "claude-code"];
  var sdPanels = {};
  document.querySelectorAll(".panel[data-dstep]").forEach(function (p) { sdPanels[Number(p.getAttribute("data-dstep"))] = p; });
  var sdTabs = Array.prototype.slice.call(document.querySelectorAll("#stepper-2 .step-tab"));
  var deeperBody = document.getElementById("deeper-body");
  var deeperCtaWrap = document.getElementById("deeper-cta-wrap");
  var deeperOpen = document.getElementById("deeper-open");
  var curD = 0, deeperShown = false;

  var suppressHash = false;
  function setHash(id) { if (location.hash !== "#" + id) { suppressHash = true; location.hash = id; } }

  function goto1(idx, fromHash) {
    cur1 = Math.max(0, Math.min(S1.length - 1, idx));
    Object.keys(s1Panels).forEach(function (k) { s1Panels[k].hidden = Number(k) !== cur1; });
    s1Tabs.forEach(function (t, i) {
      t.classList.toggle("is-done", i < cur1);
      if (i === cur1) t.setAttribute("aria-current", "step"); else t.removeAttribute("aria-current");
    });
    if (!fromHash) setHash(S1[cur1]);
    if (s1Tabs[cur1]) s1Tabs[cur1].scrollIntoView({ block: "nearest", inline: "center" });
    var h = s1Panels[cur1].querySelector(".section-h");
    if (h) h.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function openDeeper() {
    if (deeperShown) return;
    deeperShown = true; deeperCtaWrap.hidden = true; deeperBody.hidden = false;
  }
  function gotoD(idx, fromHash) {
    openDeeper();
    curD = Math.max(0, Math.min(SD.length - 1, idx));
    Object.keys(sdPanels).forEach(function (k) { sdPanels[k].hidden = Number(k) !== curD; });
    sdTabs.forEach(function (t, i) {
      t.classList.toggle("is-done", i < curD);
      if (i === curD) t.setAttribute("aria-current", "step"); else t.removeAttribute("aria-current");
    });
    if (!fromHash) setHash(SD[curD]);
    var h = sdPanels[curD].querySelector(".section-h");
    if (h) h.focus({ preventScroll: true });
    document.getElementById("stepper-2").scrollIntoView({ block: "start", behavior: "smooth" });
    updateTocVisibility();
  }

  s1Tabs.forEach(function (t) { t.addEventListener("click", function () { goto1(Number(t.getAttribute("data-goto"))); }); });
  sdTabs.forEach(function (t) { t.addEventListener("click", function () { gotoD(Number(t.getAttribute("data-dgoto"))); }); });
  deeperOpen.addEventListener("click", function () { gotoD(0); });

  document.addEventListener("click", function (e) {
    if (e.target.closest(".js-next1")) { goto1(cur1 + 1); return; }
    if (e.target.closest(".js-back1")) { goto1(cur1 - 1); return; }
    if (e.target.closest(".js-nextD")) { gotoD(curD + 1); return; }
    if (e.target.closest(".js-backD")) { gotoD(curD - 1); return; }
  });

  /* ---------- Copyable blocks ---------- */
  function flashCopied(btn) {
    var prev = btn.textContent;
    btn.textContent = "Copied!"; btn.classList.add("copied");
    setTimeout(function () { btn.textContent = prev; btn.classList.remove("copied"); }, 1600);
  }
  function copyText(text, btn) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { flashCopied(btn); }, function () { fallbackCopy(text, btn); });
      } else { fallbackCopy(text, btn); }
    } catch (e) { fallbackCopy(text, btn); }
  }
  function fallbackCopy(text, btn) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta); flashCopied(btn);
  }
  // static code blocks
  document.querySelectorAll(".codeblock .copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var pre = btn.parentElement.querySelector(".code");
      copyText(pre ? pre.textContent : "", btn);
    });
  });

  /* ---------- Prompt anatomy ---------- */
  var A_LINES = [
    { t: "I need to write a research readout based on the data I'm going to paste below.", k: 0 },
    { t: "" },
    { t: "Ground rules:" },
    { t: "- Base every finding only on the data I provide — do not add outside knowledge, invented statistics, or general best practices", k: 1 },
    { t: "- For every finding, include at least two direct quotes or specific examples from the source data that support it", k: 2 },
    { t: "- If you identify a pattern but can only find one example supporting it, flag it as [SINGLE INSTANCE — NEEDS VALIDATION] rather than presenting it as a finding", k: 3 },
    { t: "- Do not include any percentages, averages, or statistics unless they appear explicitly in my data", k: 4 },
    { t: "- Use our readout template structure", k: 5 },
    { t: "" },
    { t: "Our research questions were:" },
    { t: "[paste questions]" },
    { t: "" },
    { t: "Our readout template:" },
    { t: "[paste template]" },
    { t: "" },
    { t: "Source data:" },
    { t: "[paste transcripts / tickets / survey results]" }
  ];
  var A_ANNO = [
    { echo: "I need to write a research readout based on the data I'm going to paste below.", title: "SETS THE TASK AND SIGNALS WHAT'S COMING", body: "Telling AI what format you need upfront means it organizes everything toward that output from the start. \"I'm going to paste below\" signals that real data is coming — it should wait for that, not draw from general knowledge." },
    { echo: "Base every finding only on the data I provide — do not add outside knowledge, invented statistics, or general best practices", title: "THE MOST IMPORTANT LINE", body: "Without this, AI will supplement your data with things it knows from training — confidently and without flagging it. This line makes the boundary explicit." },
    { echo: "For every finding, include at least two direct quotes or specific examples from the source data that support it", title: "ASKS FOR EVIDENCE, NOT JUST CONCLUSIONS", body: "This is what turns the output from a document you hope is accurate into one you can verify. When someone asks \"where did you get that?\" the answer is right there in the document." },
    { echo: "If you identify a pattern but can only find one example, flag it as [SINGLE INSTANCE — NEEDS VALIDATION]", title: "GIVES AI A GRACEFUL WAY TO BE HONEST", body: "Without this, AI will present a one-off observation as a pattern because patterns are what research readouts contain. This instruction creates an exit ramp for uncertainty rather than forcing false confidence." },
    { echo: "Do not include any percentages, averages, or statistics unless they appear explicitly in my data", title: "THE STATISTIC GUARDRAIL", body: "Specific because the problem is specific — AI generates plausible-sounding numbers. This closes that door explicitly." },
    { echo: "Use our readout template structure", title: "CONTROLS THE FORMAT", body: "Giving AI your template means the output fits directly into your workflow rather than needing reformatting. Always paste the actual template — describing it is less reliable than showing it." }
  ];
  var ANATOMY_CLEAN = A_LINES.map(function (l) { return l.t; }).join("\n");
  window.__ANATOMY_CLEAN = ANATOMY_CLEAN; // for verification only

  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  (function buildAnatomy() {
    var root = document.getElementById("anatomy");
    if (!root) return;
    var linesHtml = A_LINES.map(function (l) {
      if (l.t === "") return '<span class="aline blank"></span>';
      if (typeof l.k === "number") {
        return '<span class="aline clickable" role="button" tabindex="0" data-k="' + l.k + '">' + esc(l.t) + "</span>";
      }
      return '<span class="aline">' + esc(l.t) + "</span>";
    }).join("");

    root.innerHTML =
      '<div class="anatomy-prompt" id="anatomy-prompt">' +
        '<button type="button" class="copy-btn" id="anatomy-copy">Copy</button>' +
        linesHtml +
      "</div>" +
      '<div class="anatomy-anno empty" id="anatomy-anno" aria-live="polite">' +
        '<p class="anno-empty">Click any line to see what it\'s doing — and why it\'s worth including.</p>' +
      "</div>";

    var annoEl = document.getElementById("anatomy-anno");
    var activeLine = null;

    function clearActive() {
      if (activeLine) activeLine.classList.remove("active");
      activeLine = null;
      annoEl.classList.add("empty");
      annoEl.innerHTML = '<p class="anno-empty">Click any line to see what it\'s doing — and why it\'s worth including.</p>';
    }
    function selectLine(el) {
      var k = Number(el.getAttribute("data-k"));
      var a = A_ANNO[k];
      if (!a) return;
      if (activeLine === el) { clearActive(); return; } // toggle off
      if (activeLine) activeLine.classList.remove("active");
      activeLine = el; el.classList.add("active");
      annoEl.classList.remove("empty");
      annoEl.innerHTML =
        '<p class="anno-echo">"' + esc(a.echo) + '"</p>' +
        '<p class="anno-title">' + esc(a.title) + "</p>" +
        '<p class="anno-body">' + esc(a.body) + "</p>";
      // mobile: ensure annotation is visible
      if (window.matchMedia("(max-width: 640px)").matches) {
        annoEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }

    root.querySelectorAll(".aline.clickable").forEach(function (el) {
      el.addEventListener("click", function () { selectLine(el); });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") { e.preventDefault(); selectLine(el); }
      });
    });
    document.getElementById("anatomy-copy").addEventListener("click", function () {
      copyText(ANATOMY_CLEAN, this); // clean prompt only — no highlight/annotation artifacts
    });
  })();

  /* ---------- Claude Code sub-nav (TOC + jump menu + scroll-spy) ---------- */
  var toc = document.getElementById("cc-toc");
  var ccPanel = document.getElementById("claude-code");
  var ccInView = false;
  function isWide() { return window.matchMedia("(min-width: 1280px)").matches; }
  function updateTocVisibility() {
    var show = ccInView && isWide() && sdPanels[2] && !sdPanels[2].hidden;
    if (toc) toc.classList.toggle("visible", !!show);
  }
  if (ccPanel && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      ccInView = entries[0].isIntersecting;
      updateTocVisibility();
    }, { threshold: 0, rootMargin: "-120px 0px -40% 0px" }).observe(ccPanel);
  }
  window.addEventListener("resize", updateTocVisibility);

  // scroll-spy: mark the topmost visible cc-sub active in both TOC and jump list
  var ccSubs = Array.prototype.slice.call(document.querySelectorAll(".cc-sub"));
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll(".cc-toc a, .cc-jump-list a"));
  var spyScheduled = false;
  function updateActiveSub() {
    spyScheduled = false;
    if (!ccSubs.length) return;
    var active = ccSubs[0];
    ccSubs.forEach(function (s) { if (s.getBoundingClientRect().top <= 160) active = s; });
    tocLinks.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === "#" + active.id);
    });
  }
  window.addEventListener("scroll", function () {
    if (!spyScheduled) { spyScheduled = true; requestAnimationFrame(updateActiveSub); }
  }, { passive: true });

  // jump-menu (tablet + mobile)
  var jumpBtn = document.getElementById("cc-jump-btn");
  var jumpList = document.getElementById("cc-jump-list");
  if (jumpBtn) {
    jumpBtn.addEventListener("click", function () {
      var open = jumpList.hidden;
      jumpList.hidden = !open;
      jumpBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  // smooth-scroll for any sub-nav link (no hash change)
  document.querySelectorAll("[data-cc]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var target = document.querySelector(a.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      if (jumpList) { jumpList.hidden = true; if (jumpBtn) jumpBtn.setAttribute("aria-expanded", "false"); }
    });
  });

  /* ---------- Hash routing ---------- */
  function syncFromHash(initial) {
    if (suppressHash) { suppressHash = false; return; }
    var id = (location.hash || "").replace("#", "");
    if (S1.indexOf(id) !== -1) goto1(S1.indexOf(id), true);
    else if (SD.indexOf(id) !== -1) gotoD(SD.indexOf(id), true);
    else if (initial) goto1(0, true);
  }
  window.addEventListener("hashchange", function () { syncFromHash(false); });

  var startId = (location.hash || "").replace("#", "");
  if (SD.indexOf(startId) !== -1) { goto1(0, true); gotoD(SD.indexOf(startId), true); }
  else if (S1.indexOf(startId) !== -1) { goto1(S1.indexOf(startId), true); }
  else { goto1(0, true); }
})();
