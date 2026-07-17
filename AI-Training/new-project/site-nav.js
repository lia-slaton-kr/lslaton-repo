/* ============================================================
   Global navigation — single source of truth.
   Injects the nav bar at the top of every page, marks the
   current page active, and wires the mobile hamburger.
   To add a future layer: add ONE entry to NAV_LINKS below.
   ============================================================ */
(function () {
  "use strict";

  var BRAND = "So About This AI Stuff";
  var NAV_LINKS = [
    { label: "Home", href: "index.html" },
    { label: "The Landscape", href: "landscape.html" },
    { label: "Under the Hood", href: "under-the-hood.html" },
    { label: "For Designers", href: "for-designers.html" }
    // , { label: "Using It Well", href: "using-it-well.html" }  // add when built
    , { label: "Glossary", href: "glossary.html" }
  ];

  // Current page filename (default to index.html)
  var current = (location.pathname.split("/").pop() || "index.html");
  if (current === "") current = "index.html";

  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  var linksHtml = NAV_LINKS.map(function (l) {
    var active = l.href === current ? ' aria-current="page"' : "";
    return '<li><a href="' + l.href + '"' + active + ">" + esc(l.label) + "</a></li>";
  }).join("");

  var nav = document.createElement("nav");
  nav.className = "site-nav";
  nav.setAttribute("aria-label", "Primary");
  nav.innerHTML =
    '<div class="site-nav-inner">' +
      '<a class="site-nav-brand" href="index.html">' + esc(BRAND) + "</a>" +
      '<button type="button" class="site-nav-toggle" aria-label="Menu" aria-expanded="false" aria-controls="site-nav-links">☰</button>' +
      '<ul class="site-nav-links" id="site-nav-links">' + linksHtml + "</ul>" +
    "</div>";

  document.body.insertAdjacentElement("afterbegin", nav);

  // Mobile hamburger
  var toggle = nav.querySelector(".site-nav-toggle");
  var list = nav.querySelector(".site-nav-links");
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  // Tapping a link navigates and closes the menu
  list.addEventListener("click", function (e) {
    if (e.target.closest("a")) { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
  });
})();
