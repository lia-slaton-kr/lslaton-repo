/* ============================================================
   Layer 1 — "The Landscape"
   - Section 1 stepper (model · platforms · versions · compare)
   - Going Deeper: revealed on opt-in, its own stepper (api · agent · claude-md)
   - Comparison tool: up to 3 tools desktop / 2 mobile, verbatim data
   - Hash routing for shareable deep links
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Section 1 stepper ---------- */
  var S1 = ["model", "platforms", "versions", "compare"];
  var s1Panels = {};
  document.querySelectorAll(".panel[data-step]").forEach(function (p) { s1Panels[Number(p.getAttribute("data-step"))] = p; });
  var s1Tabs = Array.prototype.slice.call(document.querySelectorAll("#stepper-1 .step-tab"));
  var cur1 = 0;

  /* ---------- Going Deeper stepper ---------- */
  var SD = ["api", "agent", "claude-md"];
  var sdPanels = {};
  document.querySelectorAll(".panel[data-dstep]").forEach(function (p) { sdPanels[Number(p.getAttribute("data-dstep"))] = p; });
  var sdTabs = Array.prototype.slice.call(document.querySelectorAll("#stepper-2 .step-tab"));
  var deeperBody = document.getElementById("deeper-body");
  var deeperCtaWrap = document.getElementById("deeper-cta-wrap");
  var deeperOpen = document.getElementById("deeper-open");
  var curD = 0;
  var deeperShown = false;

  var suppressHash = false;
  function setHash(id) {
    if (location.hash === "#" + id) return;
    suppressHash = true;
    location.hash = id;
  }

  function goto1(idx, fromHash) {
    cur1 = Math.max(0, Math.min(S1.length - 1, idx));
    Object.keys(s1Panels).forEach(function (k) { s1Panels[k].hidden = Number(k) !== cur1; });
    s1Tabs.forEach(function (t, i) {
      t.classList.toggle("is-done", i < cur1);
      if (i === cur1) t.setAttribute("aria-current", "step"); else t.removeAttribute("aria-current");
    });
    if (!fromHash) setHash(S1[cur1]);
    if (s1Tabs[cur1] && s1Tabs[cur1].scrollIntoView) s1Tabs[cur1].scrollIntoView({ block: "nearest", inline: "center" });
    var h = s1Panels[cur1].querySelector(".concept-h");
    if (h) h.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openDeeper() {
    if (deeperShown) return;
    deeperShown = true;
    deeperCtaWrap.hidden = true;
    deeperBody.hidden = false;
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
    var h = sdPanels[curD].querySelector(".concept-h");
    if (h) h.focus({ preventScroll: true });
    document.getElementById("stepper-2").scrollIntoView({ block: "start", behavior: "smooth" });
  }

  // tabs
  s1Tabs.forEach(function (t) { t.addEventListener("click", function () { goto1(Number(t.getAttribute("data-goto"))); }); });
  sdTabs.forEach(function (t) { t.addEventListener("click", function () { gotoD(Number(t.getAttribute("data-dgoto"))); }); });
  deeperOpen.addEventListener("click", function () { gotoD(0); });

  // nav buttons (delegation)
  document.addEventListener("click", function (e) {
    if (e.target.closest(".js-next1")) { goto1(cur1 + 1); return; }
    if (e.target.closest(".js-back1")) { goto1(cur1 - 1); return; }
    if (e.target.closest(".js-nextD")) { gotoD(curD + 1); return; }
    if (e.target.closest(".js-backD")) { gotoD(curD - 1); return; }
  });

  /* ---------- Comparison tool ---------- */
  var TOOLS = {
    claude: {
      name: "Claude",
      madeBy: "Anthropic",
      family: "Claude",
      versions: "Haiku, Sonnet, Opus",
      iface: "Claude.ai, Claude Code",
      engine: "Anthropic",
      best: "Strong reasoning, writing, and coding; built with safety as a core focus",
      designer: "Claude Code lets designers build and iterate with code; Claude.ai is strong for writing, research, and synthesis"
    },
    chatgpt: {
      name: "ChatGPT",
      madeBy: "OpenAI",
      family: "GPT",
      versions: "GPT-4o, GPT-4, GPT-3.5",
      iface: "ChatGPT",
      engine: "OpenAI",
      best: "The tool that introduced most people to AI; broad capability across many tasks",
      designer: "Strong for brainstorming, writing, and general-purpose AI tasks; widely used and well documented"
    },
    gemini: {
      name: "Gemini",
      madeBy: "Google",
      family: "Gemini",
      versions: "Flash, Pro, Ultra",
      iface: "Gemini",
      engine: "Google",
      best: "Deep integration with Google Workspace — Docs, Gmail, Slides",
      designer: "Most useful if your team lives in Google Workspace; Gemini in Slides and Docs can assist with presentations and documents"
    },
    copilot: {
      name: "Copilot",
      madeBy: "Microsoft (engine by OpenAI)",
      family: "GPT (licensed)",
      versions: "—",
      iface: "Copilot (in Office, Teams, Windows)",
      engine: "OpenAI",
      best: "AI embedded directly into Microsoft 365 — Word, PowerPoint, Teams, Outlook",
      designer: "Most useful if your organization runs on Microsoft 365; helpful for summarizing meetings, drafting documents, and Outlook triage"
    }
  };
  var ORDER = ["claude", "chatgpt", "gemini", "copilot"];
  var ROWS = [
    ["Made by", "madeBy"], ["Model family", "family"], ["Versions available", "versions"],
    ["Primary interface", "iface"], ["Who owns the engine", "engine"],
    ["Best known for", "best"], ["Designer relevance", "designer"]
  ];
  var selected = ["claude", "chatgpt"];

  var chipsEl = document.getElementById("cmp-chips");
  var tableEl = document.getElementById("cmp-table");
  var msgEl = document.getElementById("cmp-msg");

  function isMobile() { return window.matchMedia("(max-width: 640px)").matches; }
  function maxSel() { return isMobile() ? 2 : 3; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function showMsg(text) { msgEl.textContent = text; msgEl.hidden = false; }
  function clearMsg() { msgEl.hidden = true; msgEl.textContent = ""; }

  function renderChips() {
    chipsEl.innerHTML = "";
    ORDER.forEach(function (id) {
      var on = selected.indexOf(id) !== -1;
      var b = document.createElement("button");
      b.type = "button";
      b.className = "cmp-chip";
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.setAttribute("data-tool", id);
      b.innerHTML = '<span class="box" aria-hidden="true"></span>' + esc(TOOLS[id].name);
      b.addEventListener("click", function () { onChip(id); });
      chipsEl.appendChild(b);
    });
  }

  function onChip(id) {
    clearMsg();
    var i = selected.indexOf(id);
    if (i !== -1) {
      selected.splice(i, 1);            // deselect
    } else if (selected.length >= maxSel()) {
      showMsg(isMobile()
        ? "On mobile you can compare two at a time — deselect one to swap in another."
        : "You can compare up to three at a time — deselect one to swap in another.");
      return;
    } else {
      selected.push(id);
    }
    renderChips();
    renderTable();
  }

  function renderTable() {
    var cols = ORDER.filter(function (id) { return selected.indexOf(id) !== -1; }); // stable order
    if (cols.length === 0) {
      tableEl.innerHTML = '<tbody><tr><td style="color:var(--ink-faint);padding:16px 4px;">Pick a tool above to compare.</td></tr></tbody>';
      return;
    }
    var head = "<thead><tr><th></th>" + cols.map(function (id) { return "<th>" + esc(TOOLS[id].name) + "</th>"; }).join("") + "</tr></thead>";
    var body = "<tbody>" + ROWS.map(function (row) {
      var cells = cols.map(function (id) { return "<td>" + esc(TOOLS[id][row[1]]) + "</td>"; }).join("");
      return "<tr><th scope=\"row\">" + esc(row[0]) + "</th>" + cells + "</tr>";
    }).join("") + "</tbody>";
    tableEl.innerHTML = head + body;
  }

  renderChips();
  renderTable();
  // If viewport crosses to mobile with 3 selected, trim to 2
  window.addEventListener("resize", function () {
    if (isMobile() && selected.length > 2) {
      selected = selected.slice(0, 2);
      renderChips(); renderTable();
    }
  });

  /* ---------- Hash routing ---------- */
  function syncFromHash(initial) {
    if (suppressHash) { suppressHash = false; return; }
    var id = (location.hash || "").replace("#", "");
    if (S1.indexOf(id) !== -1) { goto1(S1.indexOf(id), true); }
    else if (SD.indexOf(id) !== -1) { gotoD(SD.indexOf(id), true); }
    else if (initial) { goto1(0, true); }
  }
  window.addEventListener("hashchange", function () { syncFromHash(false); });

  /* ---------- Init ---------- */
  var startId = (location.hash || "").replace("#", "");
  if (SD.indexOf(startId) !== -1) { goto1(0, true); gotoD(SD.indexOf(startId), true); }
  else if (S1.indexOf(startId) !== -1) { goto1(S1.indexOf(startId), true); }
  else { goto1(0, true); }
})();
