/* ============================================================
   Inline glossary popover — shared across all layers.
   - Upgrades every [data-term] into an accessible trigger
   - One popover at a time; anchored above the term (flips below
     if there isn't room); clamped to the viewport; caret tracks
     the term; toggles on the same term, switches on a different
   - Dismiss: outside click, ESC, or toggling the same term
   Requires glossary-data.js (window.GLOSSARY_BY_ID) +
   glossary-popover.css. Links to glossary.html#<id>.
   ============================================================ */
(function () {
  "use strict";
  var BY_ID = window.GLOSSARY_BY_ID || {};

  // Single reusable popover element
  var pop = document.createElement("div");
  pop.className = "gpop";
  pop.setAttribute("role", "dialog");
  pop.innerHTML =
    '<span class="gpop-caret" aria-hidden="true"></span>' +
    '<p class="gpop-term"></p>' +
    '<p class="gpop-def"></p>' +
    '<p class="gpop-analogy" hidden></p>' +
    '<a class="gpop-link" href="#">View in glossary →</a>';
  document.body.appendChild(pop);

  var elTerm = pop.querySelector(".gpop-term");
  var elDef = pop.querySelector(".gpop-def");
  var elAnalogy = pop.querySelector(".gpop-analogy");
  var elLink = pop.querySelector(".gpop-link");
  var caret = pop.querySelector(".gpop-caret");

  var openFor = null; // the trigger element currently shown

  function place(trigger) {
    var r = trigger.getBoundingClientRect();
    // measure
    pop.style.left = "-9999px";
    pop.style.top = "0px";
    pop.classList.add("open");
    var pw = pop.offsetWidth, ph = pop.offsetHeight;
    var margin = 10, pad = 12, vw = window.innerWidth, vh = window.innerHeight;

    var above = r.top >= ph + margin + 4;
    var top = above ? (r.top - ph - margin) : (r.bottom + margin);
    // if below would overflow and above has more room, force above
    if (!above && (r.bottom + margin + ph > vh) && r.top > (vh - r.bottom)) {
      top = Math.max(pad, r.top - ph - margin);
      above = true;
    }
    pop.classList.toggle("place-above", above);
    pop.classList.toggle("place-below", !above);

    var termCenter = r.left + r.width / 2;
    var left = termCenter - pw / 2;
    left = Math.max(pad, Math.min(left, vw - pw - pad));
    var caretLeft = termCenter - left;
    caretLeft = Math.max(14, Math.min(caretLeft, pw - 14));

    pop.style.left = Math.round(left) + "px";
    pop.style.top = Math.round(top) + "px";
    caret.style.left = Math.round(caretLeft) + "px";
  }

  function open(trigger) {
    var id = trigger.getAttribute("data-term");
    var entry = BY_ID[id];
    if (!entry) return;

    elTerm.textContent = entry.term;
    elDef.textContent = entry.definition;
    if (entry.analogy) { elAnalogy.hidden = false; elAnalogy.textContent = entry.analogy; }
    else { elAnalogy.hidden = true; elAnalogy.textContent = ""; }
    elLink.setAttribute("href", "glossary.html#" + id);

    openFor = trigger;
    trigger.setAttribute("aria-expanded", "true");
    place(trigger);
  }

  function close() {
    if (!openFor) return;
    openFor.setAttribute("aria-expanded", "false");
    openFor = null;
    pop.classList.remove("open");
  }

  function toggle(trigger) {
    if (openFor === trigger) { close(); return; }
    if (openFor) close();
    open(trigger);
  }

  // Upgrade every term trigger on the page
  document.querySelectorAll("[data-term]").forEach(function (t) {
    t.classList.add("gterm");
    t.setAttribute("role", "button");
    t.setAttribute("tabindex", "0");
    t.setAttribute("aria-haspopup", "dialog");
    t.setAttribute("aria-expanded", "false");
    t.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); toggle(t); });
    t.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") { e.preventDefault(); toggle(t); }
    });
  });

  // Dismissal
  document.addEventListener("click", function (e) {
    if (!openFor) return;
    if (pop.contains(e.target) || e.target === openFor) return;
    close();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && openFor) { var f = openFor; close(); if (f.focus) f.focus(); }
  });
  // Keep anchored while scrolling / resizing
  window.addEventListener("scroll", function () { if (openFor) place(openFor); }, true);
  window.addEventListener("resize", function () { if (openFor) place(openFor); });
})();
