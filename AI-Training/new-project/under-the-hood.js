/* ============================================================
   Layer 2 — "Under the Hood"

   Two pieces of state:
   1. The outer stepper — 5 concepts + the walkthrough (6 steps),
      one visible at a time, jumpable, hash-routed & shareable.
   2. The walkthrough — a self-paced click-through with an optional,
      clearly-skippable MCP side-branch on the whiteboard step.
   ============================================================ */
(function () {
  "use strict";

  var STEP_IDS = ["model", "platforms", "tokens", "context", "mcp", "walkthrough"];
  var WALK_INDEX = 5;

  var panels = {};
  document.querySelectorAll(".panel").forEach(function (p) {
    panels[Number(p.getAttribute("data-step"))] = p;
  });
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".step-tab"));
  var stepper = document.getElementById("stepper");
  var current = 0;

  // ---- Outer stepper ---------------------------------------
  function goToStep(n, fromHash) {
    current = Math.max(0, Math.min(STEP_IDS.length - 1, n));

    Object.keys(panels).forEach(function (k) {
      panels[k].hidden = Number(k) !== current;
    });
    tabs.forEach(function (tab, i) {
      tab.classList.toggle("is-done", i < current);
      if (i === current) tab.setAttribute("aria-current", "step");
      else tab.removeAttribute("aria-current");
    });

    if (current === WALK_INDEX) resetWalk();

    if (!fromHash) {
      if (location.hash !== "#" + STEP_IDS[current]) {
        location.hash = STEP_IDS[current];
      }
    }

    // Keep the active tab in view on small screens
    if (tabs[current] && tabs[current].scrollIntoView) {
      tabs[current].scrollIntoView({ block: "nearest", inline: "center" });
    }

    // Move focus to the concept heading for keyboard / SR users
    var h = panels[current].querySelector(".concept-h");
    if (h) h.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Tab clicks
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      goToStep(Number(tab.getAttribute("data-goto")));
    });
  });

  // Next / Back / in-prose cross-links (event delegation)
  document.addEventListener("click", function (e) {
    var next = e.target.closest(".js-next");
    var back = e.target.closest(".js-back");
    var jump = e.target.closest("[data-goto]");
    if (next) { goToStep(current + 1); return; }
    if (back) { goToStep(current - 1); return; }
    if (jump && !jump.classList.contains("step-tab")) {
      e.preventDefault();
      goToStep(Number(jump.getAttribute("data-goto")));
    }
  });

  // Hash routing (shareable deep links + browser back/forward)
  function syncFromHash() {
    var id = (location.hash || "").replace("#", "");
    var idx = STEP_IDS.indexOf(id);
    if (idx !== -1 && idx !== current) goToStep(idx, true);
    else if (idx !== -1 && idx === current) { /* already here */ }
  }
  window.addEventListener("hashchange", syncFromHash);

  /* ==========================================================
     Walkthrough
     ========================================================== */
  var stage = document.getElementById("walk-stage");
  var caption = document.getElementById("walk-caption");
  var dotsWrap = document.getElementById("walk-dots");
  var aside = document.getElementById("walk-aside");
  var asideToggle = document.getElementById("aside-toggle");
  var asideBody = document.getElementById("aside-body");
  var controls = document.getElementById("walk-controls");
  var endBox = document.getElementById("walk-end");
  var btnNext = document.getElementById("walk-next");
  var btnBack = document.getElementById("walk-back");
  var btnSkip = document.getElementById("walk-skip");
  var btnReplay = document.getElementById("walk-replay");
  var stations = {};
  document.querySelectorAll("#walk-stations .station").forEach(function (s) {
    stations[s.getAttribute("data-station")] = s;
  });

  var LAST = 6; // sub-steps 1..6 are the journey; 0 is the intro
  var w = 0;

  var PROMPT = "Write a friendly welcome message";
  var PROMPT_TOKENS = ["Write", "a", "friend", "ly", "welcome", "message"];
  var REPLY = "Welcome aboard! We're so glad you're here.";
  var REPLY_TOKENS = ["Welcome", "aboard", "!", "We", "'re", "so", "glad", "you", "'re", "here", "."];

  var CAPTIONS = {
    0: "You've met the pieces — tokens, the whiteboard, pattern-matching. Here's how they work together in a single reply.",
    1: "It starts with you. You type a prompt — a question, an instruction, whatever you need.",
    2: "The AI doesn't read your words the way you do. First your prompt is broken into tokens — small chunks of text.",
    3: "Those tokens go up on the whiteboard — the context window. Everything the AI can see right now lives here.",
    4: "The model reads the whiteboard and does its thing: predicting what comes next, one token at a time — very sophisticated autocomplete, from patterns it learned.",
    5: "Each predicted token gets added back to the whiteboard — then it predicts the next one, building the response piece by piece.",
    6: "String them together and you get a reply. No lookup, no database — just patterns, predicted into something useful."
  };

  // active station(s) per sub-step
  var STATIONS_ON = {
    0: [], 1: ["you"], 2: ["tokens"], 3: ["whiteboard"],
    4: ["model"], 5: ["model", "reply"], 6: ["reply"]
  };

  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function chips(arr, cls) {
    return arr.map(function (t) { return '<span class="chip ' + (cls || "") + '">' + esc(t) + "</span>"; }).join("");
  }

  function stageHTML(step) {
    switch (step) {
      case 0:
        return '<div class="stage-inner"><p class="stage-label">Ready when you are</p>' +
          '<div class="stage-row"><span class="bubble">Press <b>Start</b> to watch a prompt become a reply.</span></div></div>';
      case 1:
        return '<div class="stage-inner"><p class="stage-label">Your prompt</p>' +
          '<div class="stage-row"><span class="bubble you">' + esc(PROMPT) + "</span></div></div>";
      case 2:
        return '<div class="stage-inner"><p class="stage-label">Broken into tokens</p>' +
          '<div class="stage-row">' + chips(PROMPT_TOKENS, "appear") + "</div></div>";
      case 3:
        return '<div class="stage-inner"><div class="whiteboard">' +
          '<span class="wb-tag">On the whiteboard (context window)</span>' + chips(PROMPT_TOKENS) + "</div></div>";
      case 4:
        return '<div class="stage-inner"><div class="whiteboard">' +
          '<span class="wb-tag">On the whiteboard</span>' + chips(PROMPT_TOKENS) + "</div>" +
          '<p class="stage-label" style="margin-top:12px">Model predicts the next token →</p>' +
          '<div class="stage-row"><span class="chip pred appear">Welcome</span></div></div>';
      case 5:
        return '<div class="stage-inner"><div class="whiteboard">' +
          '<span class="wb-tag">Whiteboard: prompt + reply, growing</span>' +
          chips(PROMPT_TOKENS) + chips(REPLY_TOKENS, "pred appear") + "</div></div>";
      case 6:
        return '<div class="stage-inner"><p class="stage-label">Your reply</p>' +
          '<div class="stage-row"><span class="bubble reply">' + esc(REPLY) + "</span></div></div>";
    }
    return "";
  }

  function renderWalk() {
    stage.innerHTML = stageHTML(w);
    caption.textContent = CAPTIONS[w];

    // stations
    Object.keys(stations).forEach(function (k) {
      stations[k].classList.toggle("on", STATIONS_ON[w].indexOf(k) !== -1);
    });

    // dots (journey steps 1..6)
    var html = "";
    for (var i = 1; i <= LAST; i++) {
      var cls = i < w ? "past" : (i === w ? "on" : "");
      html += '<span class="d ' + cls + '"></span>';
    }
    dotsWrap.innerHTML = html;

    // MCP side-branch only on the whiteboard step
    var showAside = (w === 3);
    aside.hidden = !showAside;
    if (!showAside) { asideBody.hidden = true; asideToggle.setAttribute("aria-expanded", "false"); }

    // controls
    btnBack.style.display = w === 0 ? "none" : "";
    btnNext.textContent = w === 0 ? "Start ▶" : (w === LAST ? "Finish ✓" : "Next →");
  }

  function showEnd() {
    // land on the final reply visual, then reveal the payoff
    w = LAST;
    renderWalk();
    controls.style.display = "none";
    dotsWrap.style.display = "none";
    caption.style.display = "none";
    aside.hidden = true;
    endBox.hidden = false;
  }

  function resetWalk() {
    w = 0;
    endBox.hidden = true;
    controls.style.display = "";
    dotsWrap.style.display = "";
    caption.style.display = "";
    renderWalk();
  }

  btnNext.addEventListener("click", function () {
    if (w >= LAST) { showEnd(); return; }
    w++;
    renderWalk();
  });
  btnBack.addEventListener("click", function () {
    if (w > 0) { w--; renderWalk(); }
  });
  btnSkip.addEventListener("click", showEnd);
  btnReplay.addEventListener("click", resetWalk);

  asideToggle.addEventListener("click", function () {
    var open = asideBody.hidden;
    asideBody.hidden = !open;
    asideToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // ---- Init ------------------------------------------------
  var startId = (location.hash || "").replace("#", "");
  var startIdx = STEP_IDS.indexOf(startId);
  goToStep(startIdx !== -1 ? startIdx : 0, true);
})();
