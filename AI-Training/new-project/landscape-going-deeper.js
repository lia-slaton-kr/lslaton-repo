/* ============================================================
   The Landscape · Going Deeper (own page)
   Retains the Going Deeper stepper pattern (Next/Back + jump).
   api · agent · claude-md. Hash routing for deep links.
   ============================================================ */
(function () {
  "use strict";
  var SD = ["api", "agent", "claude-md"];
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
    var h = panels[cur].querySelector(".concept-h");
    if (h) h.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  tabs.forEach(function (t, i) { t.addEventListener("click", function () { go(i); }); });
  document.addEventListener("click", function (e) {
    if (e.target.closest(".js-nextD")) { go(cur + 1); return; }
    if (e.target.closest(".js-backD")) { go(cur - 1); return; }
  });

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
