/**
 * Offline page `/offline` (W23 C.2, deployment.md §0.12.6 Nr. 2): one static HTML file with BOTH
 * languages (the service worker caches it once), no personal data, no sign-in, works without
 * JavaScript (reload via a GET form). With JavaScript: the language follows the `lang` cookie or
 * the browser, focus goes to the heading, the page reloads by itself when the device is online.
 *
 * Colours are the light/dark values of docs/design/tokens.css (like the mail templates – the
 * page must work without the app's CSS bundle).
 */

export interface OfflineTexts {
  lang: "de" | "en";
  title: string;
  heading: string;
  text: string;
  retry: string;
  retrying: string;
  auto: string;
}

const escape = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

function block(texts: OfflineTexts): string {
  return `<section class="block" lang="${texts.lang}" data-lang="${texts.lang}" data-retrying="${escape(texts.retrying)}">
  <h1 tabindex="-1">${escape(texts.heading)}</h1>
  <p>${escape(texts.text)}</p>
  <form method="get" action=""><button type="submit">${escape(texts.retry)}</button></form>
  <p class="auto" role="status">${escape(texts.auto)}</p>
</section>`;
}

export function offlinePageHtml(de: OfflineTexts, en: OfflineTexts): string {
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex">
<meta name="color-scheme" content="light dark">
<title>${escape(de.title)} · ${escape(en.title)}</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>
@font-face{font-family:"Figtree";src:url(/fonts/figtree-latin.woff2) format("woff2");font-weight:300 900;font-display:swap}
@font-face{font-family:"Plus Jakarta Sans";src:url(/fonts/plus-jakarta-sans-latin.woff2) format("woff2");font-weight:200 800;font-display:swap}
:root{--bg:#f4f2fb;--text:#1e1a3d;--muted:#57527a;--primary:#2b2266;--on-primary:#ffffff;--band:#2b2266;color-scheme:light dark}
@media (prefers-color-scheme:dark){:root{--bg:#14112e;--text:#f3f1ff;--muted:#b9b4dc;--primary:#52e5b8;--on-primary:#14112e;--band:#221b52}}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;padding:calc(env(safe-area-inset-top) + 24px) 16px 24px;background:var(--bg);color:var(--text);font:400 1rem/1.5 "Figtree",system-ui,sans-serif}
body::before{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top);background:var(--band)}
main{max-width:28rem;margin:0 auto;display:flex;flex-direction:column;gap:24px}
.logo{width:40px;height:40px}
.block{display:flex;flex-direction:column;gap:12px}
.block+.block{border-top:1px solid var(--muted);padding-top:24px}
.js .block[hidden]{display:none}
h1{margin:0;font:800 1.75rem/1.2 "Plus Jakarta Sans","Figtree",system-ui,sans-serif}
p{margin:0}
.auto{color:var(--muted);font-size:.875rem}
button{min-height:48px;width:100%;padding:12px 24px;border:0;border-radius:16px;background:var(--primary);color:var(--on-primary);font:700 1rem/1 "Figtree",system-ui,sans-serif;cursor:pointer}
button:focus-visible,h1:focus-visible{outline:3px solid var(--primary);outline-offset:3px}
</style>
</head>
<body>
<main>
<img class="logo" src="/favicon.svg" alt="" width="40" height="40">
${block(de)}
${block(en)}
</main>
<script>
(function () {
  var root = document.documentElement;
  var match = /(?:^|; )lang=(de|en)/.exec(document.cookie);
  var lang = match ? match[1] : /^de\\b/i.test(navigator.language || "") ? "de" : "en";
  root.classList.add("js");
  root.lang = lang;
  var shown = null;
  document.querySelectorAll(".block").forEach(function (section) {
    if (section.getAttribute("data-lang") === lang) shown = section;
    else section.hidden = true;
  });
  if (shown) {
    var heading = shown.querySelector("h1");
    if (heading) heading.focus();
    document.title = heading ? heading.textContent : document.title;
    var form = shown.querySelector("form");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var button = form.querySelector("button");
      button.setAttribute("aria-busy", "true");
      button.textContent = shown.getAttribute("data-retrying");
      location.reload();
    });
  }
  window.addEventListener("online", function () { location.reload(); });
})();
</script>
</body>
</html>
`;
}
