/* ============================================================
   Glossary page — render A–Z, live search, deep-link anchoring.
   Uses window.GLOSSARY (glossary-data.js).
   ============================================================ */
(function () {
  "use strict";
  var DATA = (window.GLOSSARY || []).slice().sort(function (a, b) {
    return a.term.toLowerCase().localeCompare(b.term.toLowerCase());
  });
  var listEl = document.getElementById("gl-list");
  var emptyEl = document.getElementById("gl-empty");
  var searchEl = document.getElementById("gl-search");

  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function render(filter) {
    var q = (filter || "").trim().toLowerCase();
    listEl.innerHTML = "";
    var shown = 0, lastLetter = "";

    DATA.forEach(function (e) {
      var hay = (e.term + " " + e.definition + " " + (e.analogy || "")).toLowerCase();
      if (q && hay.indexOf(q) === -1) return;
      shown++;

      var letter = e.term.charAt(0).toUpperCase();
      if (!q && letter !== lastLetter) {
        var lbl = document.createElement("div");
        lbl.className = "gl-group-label";
        lbl.textContent = letter;
        listEl.appendChild(lbl);
        lastLetter = letter;
      }

      var card = document.createElement("div");
      card.className = "gl-entry";
      card.id = e.id;
      card.innerHTML =
        '<p class="gl-term">' + esc(e.term) + "</p>" +
        '<p class="gl-def">' + esc(e.definition) + "</p>" +
        (e.analogy ? '<p class="gl-analogy">' + esc(e.analogy) + "</p>" : "");
      listEl.appendChild(card);
    });

    emptyEl.hidden = shown !== 0;
  }

  function flashFromHash() {
    var id = (location.hash || "").replace("#", "");
    if (!id) return;
    var el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.classList.add("flash");
      setTimeout(function () { el.classList.remove("flash"); }, 1800);
    }
  }

  searchEl.addEventListener("input", function () { render(searchEl.value); });

  render("");
  // allow layout to settle before anchoring
  setTimeout(flashFromHash, 60);
  window.addEventListener("hashchange", flashFromHash);
})();
