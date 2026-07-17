/* ============================================================
   The Landscape
   - Section tabs (model · platforms · versions · compare):
     standard tabs — all jumpable, no enforced sequence
   - Comparison tool: up to 3 tools desktop / 2 mobile, verbatim data
   - Hash routing for shareable deep links
   (Going Deeper now lives on landscape-going-deeper.html)
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Section tabs ---------- */
  var S1 = ["model", "platforms", "versions", "compare"];
  var s1Panels = {};
  document.querySelectorAll(".panel[data-step]").forEach(function (p) { s1Panels[Number(p.getAttribute("data-step"))] = p; });
  var tablist = document.getElementById("stepper-1");
  var s1Tabs = Array.prototype.slice.call(tablist.querySelectorAll(".step-tab"));
  var cur1 = 0;

  // Standard tab semantics
  tablist.setAttribute("role", "tablist");
  s1Tabs.forEach(function (t, i) {
    t.setAttribute("role", "tab");
    t.id = "tab-" + S1[i];
    t.setAttribute("aria-controls", S1[i]);
    var panel = s1Panels[i];
    if (panel) { panel.setAttribute("role", "tabpanel"); panel.setAttribute("aria-labelledby", "tab-" + S1[i]); }
  });

  var suppressHash = false;
  function setHash(id) { if (location.hash !== "#" + id) { suppressHash = true; location.hash = id; } }

  function goto1(idx, fromHash) {
    cur1 = Math.max(0, Math.min(S1.length - 1, idx));
    Object.keys(s1Panels).forEach(function (k) { s1Panels[k].hidden = Number(k) !== cur1; });
    s1Tabs.forEach(function (t, i) {
      var on = i === cur1;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
    });
    if (!fromHash) setHash(S1[cur1]);
    if (s1Tabs[cur1]) s1Tabs[cur1].scrollIntoView({ block: "nearest", inline: "center" });
    var h = s1Panels[cur1].querySelector(".concept-h");
    if (h) h.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Click + standard tablist keyboard nav (no sequence enforced)
  s1Tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { goto1(i); });
    t.addEventListener("keydown", function (e) {
      var idx = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") idx = (cur1 + 1) % S1.length;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") idx = (cur1 - 1 + S1.length) % S1.length;
      else if (e.key === "Home") idx = 0;
      else if (e.key === "End") idx = S1.length - 1;
      if (idx !== null) { e.preventDefault(); goto1(idx); s1Tabs[idx].focus(); }
    });
  });

  /* ---------- Comparison tool ---------- */
  var TOOLS = {
    claude: {
      name: "Claude", madeBy: "Anthropic", family: "Claude", versions: "Haiku, Sonnet, Opus",
      iface: "Claude.ai, Claude Code", engine: "Anthropic",
      best: "Strong reasoning, writing, and coding; built with safety as a core focus",
      designer: "Claude Code lets designers build and iterate with code; Claude.ai is strong for writing, research, and synthesis"
    },
    chatgpt: {
      name: "ChatGPT", madeBy: "OpenAI", family: "GPT", versions: "GPT-4o, GPT-4, GPT-3.5",
      iface: "ChatGPT", engine: "OpenAI",
      best: "The tool that introduced most people to AI; broad capability across many tasks",
      designer: "Strong for brainstorming, writing, and general-purpose AI tasks; widely used and well documented"
    },
    gemini: {
      name: "Gemini", madeBy: "Google", family: "Gemini", versions: "Flash, Pro, Ultra",
      iface: "Gemini", engine: "Google",
      best: "Deep integration with Google Workspace — Docs, Gmail, Slides",
      designer: "Most useful if your team lives in Google Workspace; Gemini in Slides and Docs can assist with presentations and documents"
    },
    copilot: {
      name: "Copilot", madeBy: "Microsoft (engine by OpenAI)", family: "GPT (licensed)", versions: "—",
      iface: "Copilot (in Office, Teams, Windows)", engine: "OpenAI",
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
      b.type = "button"; b.className = "cmp-chip";
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
    if (i !== -1) { selected.splice(i, 1); }
    else if (selected.length >= maxSel()) {
      showMsg(isMobile()
        ? "On mobile you can compare two at a time — deselect one to swap in another."
        : "You can compare up to three at a time — deselect one to swap in another.");
      return;
    } else { selected.push(id); }
    renderChips(); renderTable();
  }
  function renderTable() {
    var cols = ORDER.filter(function (id) { return selected.indexOf(id) !== -1; });
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
  window.addEventListener("resize", function () {
    if (isMobile() && selected.length > 2) { selected = selected.slice(0, 2); renderChips(); renderTable(); }
  });

  /* ---------- Hash routing ---------- */
  function syncFromHash(initial) {
    if (suppressHash) { suppressHash = false; return; }
    var id = (location.hash || "").replace("#", "");
    if (S1.indexOf(id) !== -1) goto1(S1.indexOf(id), true);
    else if (initial) goto1(0, true);
  }
  window.addEventListener("hashchange", function () { syncFromHash(false); });

  var startId = (location.hash || "").replace("#", "");
  if (S1.indexOf(startId) !== -1) goto1(S1.indexOf(startId), true); else goto1(0, true);
})();
