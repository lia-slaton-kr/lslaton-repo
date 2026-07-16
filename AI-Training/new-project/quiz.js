/* ============================================================
   Homepage interactions
   - Muted "coming soon" / "in progress" cards reveal a warm note
   - Quiz drawer (right side / bottom sheet), dismiss via ✕ or ESC
     only (no click-outside — so progress isn't lost by accident)
   - 3-step quiz → honest recommendation + routing to Under the Hood
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Muted cards: reveal an inline message ---------- */
  document.querySelectorAll("[data-soon], [data-soon-gloss]").forEach(function (card) {
    card.addEventListener("click", function () {
      var msg = card.querySelector(".tc-msg");
      if (msg) msg.hidden = false;
    });
  });

  /* ---------- Quiz drawer open / close ---------- */
  var drawer = document.getElementById("quiz-drawer");
  var closeBtn = document.getElementById("drawer-close");
  var lastFocus = null;

  function openQuiz() {
    lastFocus = document.activeElement;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    // focus the current step's heading (or close button as fallback)
    var h = drawer.querySelector('.q-step:not([hidden]) .q') || closeBtn;
    if (h) h.focus({ preventScroll: true });
  }
  function closeQuiz() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.querySelectorAll("[data-open-quiz]").forEach(function (b) {
    b.addEventListener("click", openQuiz);
  });
  closeBtn.addEventListener("click", closeQuiz);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawer.classList.contains("open")) closeQuiz();
  });

  /* ---------- Quiz state ---------- */
  var STORAGE_KEY = "soaboutai:onboarding";
  var state = { start: null, goals: [] };
  var step = 1;

  var steps = {};
  drawer.querySelectorAll(".q-step").forEach(function (s) { steps[s.getAttribute("data-step")] = s; });
  var dots = drawer.querySelectorAll(".progress .dot");
  var stepLabel = document.getElementById("step-label");
  var backBtn = document.getElementById("q-back");
  var continueBtn = document.getElementById("q-continue");
  var nav = document.getElementById("drawer-nav");

  var step1Cards = Array.prototype.slice.call(steps["1"].querySelectorAll(".opt-card"));
  var step2Cards = Array.prototype.slice.call(steps["2"].querySelectorAll(".opt-card"));

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }
  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var p = JSON.parse(raw);
      if (p && typeof p === "object") {
        state.start = p.start || null;
        state.goals = Array.isArray(p.goals) ? p.goals : [];
      }
    } catch (e) {}
  }

  function selectStart(v) {
    state.start = v;
    step1Cards.forEach(function (c) {
      var on = c.getAttribute("data-value") === v;
      c.setAttribute("aria-checked", on ? "true" : "false");
      c.tabIndex = on ? 0 : -1;
    });
    updateContinue();
    save();
  }
  function toggleGoal(v) {
    var i = state.goals.indexOf(v);
    if (i === -1) state.goals.push(v); else state.goals.splice(i, 1);
    step2Cards.forEach(function (c) {
      c.setAttribute("aria-checked", state.goals.indexOf(c.getAttribute("data-value")) !== -1 ? "true" : "false");
    });
    save();
  }
  function hydrate() {
    if (state.start) selectStart(state.start);
    else { if (step1Cards[0]) step1Cards[0].tabIndex = 0; step1Cards.slice(1).forEach(function (c) { c.tabIndex = -1; }); }
    step2Cards.forEach(function (c) {
      c.setAttribute("aria-checked", state.goals.indexOf(c.getAttribute("data-value")) !== -1 ? "true" : "false");
    });
  }

  function updateContinue() {
    var ok = step !== 1 || !!state.start;
    if (ok) continueBtn.removeAttribute("disabled"); else continueBtn.setAttribute("disabled", "");
  }

  function goStep(n) {
    step = Math.max(1, Math.min(3, n));
    Object.keys(steps).forEach(function (k) { steps[k].hidden = Number(k) !== step; });
    dots.forEach(function (d) {
      var i = Number(d.getAttribute("data-dot"));
      d.classList.toggle("is-active", i === step);
      d.classList.toggle("is-done", i < step);
    });
    stepLabel.textContent = "Step " + step + " of 3";
    backBtn.style.display = step === 1 ? "none" : "";
    continueBtn.style.display = step === 3 ? "none" : "";
    updateContinue();
    if (step === 3) renderResult();
    var h = steps[String(step)].querySelector(".q") || steps[String(step)].querySelector(".reco-line");
    if (h && h.focus) h.focus({ preventScroll: true });
  }

  /* ---------- Recommendation ---------- */
  var LAYERS = {
    landscape: { name: "The Landscape", built: true, href: "landscape.html", bridge: null },
    under: { name: "Under the Hood", built: true, href: "under-the-hood.html", bridge: null },
    using: { name: "Using It Well", built: false, href: "under-the-hood.html",
      bridge: "We're still building that section — but start with Under the Hood. Understanding how AI actually works is what separates people who prompt okay from people who prompt well." },
    design: { name: "For Designers", built: true, href: "for-designers.html", bridge: null }
  };
  var recoHref = "under-the-hood.html";

  function recommend() {
    // Goals can promote; otherwise the starting point decides.
    if (state.goals.indexOf("design") !== -1) return "design";
    if (state.goals.indexOf("day-to-day") !== -1) return "using";
    if (state.start === "new") return "landscape";
    if (state.start === "regular") return "design";
    return "under"; // "some" (or any fallback)
  }

  function renderResult() {
    var key = recommend();
    var layer = LAYERS[key];
    document.getElementById("reco-line").innerHTML =
      "Based on your answers, <b>" + layer.name + "</b> is your best starting point.";
    var bridgeEl = document.getElementById("reco-bridge");
    var cta = document.getElementById("reco-cta");
    if (layer.built) {
      bridgeEl.hidden = true;
      bridgeEl.textContent = "";
      recoHref = layer.href;
      cta.textContent = "Explore " + layer.name + " →";
    } else {
      bridgeEl.hidden = false;
      bridgeEl.textContent = layer.bridge;
      recoHref = "under-the-hood.html";
      cta.textContent = "Explore Under the Hood →";
    }
  }

  document.getElementById("reco-cta").addEventListener("click", function () {
    location.href = recoHref;
  });

  /* ---------- Keyboard for option cards ---------- */
  function onKey(e, cards, isRadio) {
    var idx = cards.indexOf(e.currentTarget);
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") { e.preventDefault(); e.currentTarget.click(); return; }
    if (isRadio && ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].indexOf(e.key) !== -1) {
      e.preventDefault();
      var dir = (e.key === "ArrowDown" || e.key === "ArrowRight") ? 1 : -1;
      var next = (idx + dir + cards.length) % cards.length;
      cards[next].focus();
      selectStart(cards[next].getAttribute("data-value"));
    }
  }
  step1Cards.forEach(function (c) {
    c.addEventListener("click", function () { selectStart(c.getAttribute("data-value")); });
    c.addEventListener("keydown", function (e) { onKey(e, step1Cards, true); });
  });
  step2Cards.forEach(function (c) {
    c.addEventListener("click", function () { toggleGoal(c.getAttribute("data-value")); });
    c.addEventListener("keydown", function (e) { onKey(e, step2Cards, false); });
  });

  continueBtn.addEventListener("click", function () {
    if (step === 1 && !state.start) return;
    goStep(step + 1);
  });
  backBtn.addEventListener("click", function () { goStep(step - 1); });

  /* ---------- Init ---------- */
  load();
  hydrate();
  goStep(1);
})();
