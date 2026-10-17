/* AGBE site: theme toggle (same behaviour as the build notes) and the answer tabs. */
(function () {
  "use strict";
  var KEY = "agbe-theme", root = document.documentElement, button = document.querySelector(".theme");
  function dark() { return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches; }
  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function apply(t) { root.setAttribute("data-theme", t); if (button) { button.textContent = t === "dark" ? "Light" : "Dark"; button.setAttribute("aria-label", "Switch to " + (t === "dark" ? "light" : "dark") + " theme"); } }
  var saved = stored();
  if (saved === "dark" || saved === "light") apply(saved); else if (button) button.textContent = dark() ? "Light" : "Dark";
  if (button) button.addEventListener("click", function () {
    var cur = root.getAttribute("data-theme") || (dark() ? "dark" : "light"), next = cur === "dark" ? "light" : "dark";
    apply(next); try { localStorage.setItem(KEY, next); } catch (e) { /* not fatal */ }
  });

  var tabs = document.querySelectorAll(".tx-tabs [role=tab]");
  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      tabs.forEach(function (o) {
        var on = o === t; o.setAttribute("aria-selected", on ? "true" : "false");
        var p = document.getElementById(o.getAttribute("aria-controls")); if (p) p.hidden = !on;
      });
    });
    t.addEventListener("keydown", function (e) {
      var list = Array.prototype.slice.call(tabs), i = list.indexOf(t);
      if (e.key === "ArrowRight") { list[(i + 1) % list.length].focus(); list[(i + 1) % list.length].click(); }
      if (e.key === "ArrowLeft") { list[(i + list.length - 1) % list.length].focus(); list[(i + list.length - 1) % list.length].click(); }
    });
  });
})();
