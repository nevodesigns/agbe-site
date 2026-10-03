/* AGBE — theme control.
 *
 * The stylesheet already handles both themes on its own: a bare :root carries the
 * light palette and a prefers-color-scheme block overrides it. So the page is
 * fully readable with JavaScript disabled, and this file only adds an explicit
 * override for readers whose system setting does not match what they want.
 *
 * The override is written to data-theme on <html>, which the stylesheet honours
 * ahead of the media query in both directions.
 */
(function () {
  "use strict";

  var KEY = "agbe-theme";
  var root = document.documentElement;

  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function stored() {
    try {
      return localStorage.getItem(KEY);
    } catch (e) {
      return null; // private browsing, or storage disabled
    }
  }

  function persist(value) {
    try {
      localStorage.setItem(KEY, value);
    } catch (e) {
      /* not fatal: the theme still applies for this page view */
    }
  }

  function activeTheme() {
    return root.getAttribute("data-theme") || (systemPrefersDark() ? "dark" : "light");
  }

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    if (button) {
      button.textContent = theme === "dark" ? "Light" : "Dark";
      button.setAttribute("aria-label", "Switch to " + (theme === "dark" ? "light" : "dark") + " theme");
    }
  }

  var button = document.querySelector(".theme-toggle");

  // Restore a previous explicit choice. Absent one, leave the attribute unset so
  // the media query keeps control and the page follows the system.
  var saved = stored();
  if (saved === "dark" || saved === "light") {
    apply(saved);
  } else if (button) {
    button.textContent = systemPrefersDark() ? "Light" : "Dark";
  }

  if (button) {
    button.addEventListener("click", function () {
      var next = activeTheme() === "dark" ? "light" : "dark";
      apply(next);
      persist(next);
    });
  }

  // Follow the system while the reader has not made an explicit choice.
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var onChange = function (e) {
      if (stored()) return;
      if (button) button.textContent = e.matches ? "Light" : "Dark";
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }
})();

/* AGBE — documentation nudge.
 *
 * Most readers who bounce off the landing page never find the build notes, which
 * answer the questions the page raises. So the notes are offered once, quietly,
 * a few seconds in or as soon as the reader scrolls, and never again on that
 * browser. Everything here degrades to nothing: with JavaScript off the card
 * stays hidden and the header button still links to the notes.
 */
(function () {
  "use strict";

  var SEEN = "agbe-doc-nudge";
  var card = document.getElementById("docnudge");
  if (!card) return;

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function seen() {
    try { return localStorage.getItem(SEEN) === "1"; } catch (e) { return false; }
  }
  function remember() {
    try { localStorage.setItem(SEEN, "1"); } catch (e) {}
  }

  if (seen()) {
    document.documentElement.classList.add("docseen");
    return;
  }

  var hideTimer = null;

  function show() {
    card.hidden = false;
    /* one frame, so the transition has a starting state to move from */
    requestAnimationFrame(function () { card.classList.add("show"); });
    hideTimer = window.setTimeout(dismiss, 14000);
  }

  function dismiss() {
    window.clearTimeout(hideTimer);
    card.classList.remove("show");
    document.documentElement.classList.add("docseen");
    remember();
    window.setTimeout(function () { card.hidden = true; }, 500);
  }

  document.getElementById("docnudge-x").addEventListener("click", dismiss);
  document.getElementById("docnudge-go").addEventListener("click", remember);

  /* whichever comes first: a few seconds of reading, or the first scroll */
  var armed = true;
  function trigger() {
    if (!armed) return;
    armed = false;
    window.removeEventListener("scroll", onScroll);
    show();
  }
  function onScroll() {
    if (window.scrollY > 300) trigger();
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.setTimeout(trigger, reduce ? 1200 : 4200);
})();
