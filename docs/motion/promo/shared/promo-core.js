/* Promo v2 – gemeinsamer Kern (Motion Designer, 2026-10-23)
   Easing = Motion-Tokens aus tokens.css §6, Hilfsfunktionen, Icons, Logo, Konfetti (fester Seed),
   Abspieler mit der Aufnahme-Schnittstelle (__promoReady, __promoRender, __promoDone, __promoDuration).
   Alles ist rein zeitbasiert: render(t) setzt jeden Zustand nur aus t (ms) – deterministisch. */
(function () {
'use strict';
var C = {};
var Q = new URLSearchParams(location.search);
C.Q = Q;
C.LANG = Q.get('lang') === 'en' ? 'en' : 'de';
document.documentElement.lang = C.LANG;

/* ---------- Easing ---------- */
function bez(x1, y1, x2, y2) {
  return function (x) {
    if (x <= 0) return 0; if (x >= 1) return 1;
    var lo = 0, hi = 1, t = x;
    for (var i = 0; i < 30; i++) {
      t = (lo + hi) / 2;
      var bx = 3 * x1 * t * (1 - t) * (1 - t) + 3 * x2 * t * t * (1 - t) + t * t * t;
      if (bx < x) lo = t; else hi = t;
    }
    return 3 * y1 * t * (1 - t) * (1 - t) + 3 * y2 * t * t * (1 - t) + t * t * t;
  };
}
function pl(str) {
  var pts = str.split(',').map(function (s, i) {
    var a = s.trim().split(/\s+/);
    return [a[1] != null ? parseFloat(a[1]) / 100 : (i === 0 ? 0 : 1), parseFloat(a[0])];
  });
  return function (x) {
    if (x <= 0) return 0; if (x >= 1) return 1;
    for (var i = 1; i < pts.length; i++) {
      if (x <= pts[i][0]) { var a = pts[i - 1], b = pts[i]; return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); }
    }
    return 1;
  };
}
/* = tokens.css §6 / motion-system.md §3 */
C.E = {
  lin: function (x) { return x <= 0 ? 0 : x >= 1 ? 1 : x; },
  std: bez(.2, 0, 0, 1), enter: bez(0, 0, 0, 1), exit: bez(.3, 0, 1, 1), emph: bez(.05, .7, .1, 1),
  soft: pl('0, .052 5%, .174 10%, .325 15%, .478 20%, .619 25%, .738 30%, .833 35%, .906 40%, .991 50%, 1.024 60%, 1.028 70%, 1.021 80%, 1.013 90%, 1'),
  bouncy: pl('0, .116 5%, .372 10%, .657 15%, .898 20%, 1.061 25%, 1.145 30%, 1.163 35%, 1.139 40%, 1.095 45%, 1.049 50%, .987 60%, .974 70%, .986 80%, .999 90%, 1')
};
var E = C.E;

/* ---------- Hilfen ---------- */
function cl(v, a, b) { return v < a ? a : v > b ? b : v; }
function pr(t, t0, d) { return d <= 0 ? (t >= t0 ? 1 : 0) : cl((t - t0) / d, 0, 1); }
function ez(t, t0, d, e) { return (e || E.std)(pr(t, t0, d)); }
function mix(a, b, k) { return a + (b - a) * k; }
function bump(t, t0, d) { var k = pr(t, t0, d); return (k > 0 && k < 1) ? Math.sin(k * Math.PI) : 0; }
/* Transform + Deckkraft setzen (nur transform/opacity). o<=0 → visibility:hidden */
function S(el, o) {
  if (!el) return;
  var tr = '';
  if (o.x || o.y) tr += 'translate(' + (o.x || 0).toFixed(2) + 'px,' + (o.y || 0).toFixed(2) + 'px) ';
  if (o.r) tr += 'rotate(' + o.r.toFixed(2) + 'deg) ';
  if (o.s != null && o.s !== 1) tr += 'scale(' + o.s.toFixed(4) + ') ';
  if (o.sx != null) tr += 'scaleX(' + o.sx.toFixed(4) + ') ';
  if (o.sy != null) tr += 'scaleY(' + o.sy.toFixed(4) + ') ';
  el.style.transform = tr || 'none';
  if (o.o != null) O(el, o.o);
}
function O(el, v) {
  if (!el) return;
  var op = cl(v, 0, 1);
  el.style.opacity = op.toFixed(3);
  el.style.visibility = op <= 0.001 ? 'hidden' : 'visible';
}
/* Überblenden zweier Zustände (.pa → .pb) */
function swap(a, b, k) { O(a, 1 - k); O(b, k); }
/* alle [data-k]-Elemente eines Wurzelelements als Map */
function keys(root) {
  var m = {};
  [].forEach.call(root.querySelectorAll('[data-k]'), function (e) { m[e.getAttribute('data-k')] = e; });
  return m;
}
function div(cls, html) { var d = document.createElement('div'); if (cls) d.className = cls; if (html != null) d.innerHTML = html; return d; }
/* Keyframe-Interpolation: kf = [[t, a, b, c, …], …], easing pro Segment optional als letztes Feld (Funktion) */
function track(kf, t) {
  if (t <= kf[0][0]) return kf[0].slice(1);
  for (var i = 1; i < kf.length; i++) {
    if (t <= kf[i][0]) {
      var a = kf[i - 1], b = kf[i], k = (t - a[0]) / (b[0] - a[0]);
      var fn = typeof b[b.length - 1] === 'function' ? b[b.length - 1] : E.std, e = fn(k), out = [];
      for (var j = 1; j < a.length; j++) { if (typeof a[j] === 'function') break; out.push(mix(a[j], b[j], e)); }
      return out;
    }
  }
  var z = kf[kf.length - 1], r = [];
  for (var q = 1; q < z.length; q++) { if (typeof z[q] === 'function') break; r.push(z[q]); }
  return r;
}
C.cl = cl; C.pr = pr; C.ez = ez; C.mix = mix; C.bump = bump; C.S = S; C.O = O; C.swap = swap; C.keys = keys; C.div = div; C.track = track;
C.$ = function (id) { return document.getElementById(id); };

/* ---------- Icons (inline, keine Schrift-Glyphen) ---------- */
var IC = {
  check: '<path d="M3.5 8.5l3 3 6-6.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
  cross: '<path d="M4.5 4.5l7 7m0-7l-7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
  maybe: '<circle cx="8" cy="8" r="5.3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 2.7a5.3 5.3 0 0 1 0 10.6z" fill="currentColor"/>',
  heart: '<path d="M8 13.8S1.8 10.3 1.8 6A3.1 3.1 0 0 1 8 4.4 3.1 3.1 0 0 1 14.2 6c0 4.3-6.2 7.8-6.2 7.8z" fill="currentColor"/>',
  star: '<path d="M8 1.6l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.4l-3.8 2 .7-4.3-3.1-3 4.3-.6z" fill="currentColor"/>',
  back: '<path d="M10 3.5L5.5 8l4.5 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  dots: '<circle cx="3.5" cy="8" r="1.4" fill="currentColor"/><circle cx="8" cy="8" r="1.4" fill="currentColor"/><circle cx="12.5" cy="8" r="1.4" fill="currentColor"/>',
  wallet: '<rect x="2" y="4" width="12" height="9" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M10 8.5h4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  house: '<path d="M2.5 7.5L8 3l5.5 4.5V13h-11z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M6.5 13V9.5h3V13" fill="none" stroke="currentColor" stroke-width="1.5"/>',
  car: '<path d="M2.5 10.5V8l1.6-3.2h7.8L13.5 8v2.5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="5" cy="11.5" r="1.4" fill="currentColor"/><circle cx="11" cy="11.5" r="1.4" fill="currentColor"/>',
  boat: '<path d="M1.8 10h12.4l-2.1 3.5H3.9z" fill="currentColor"/><path d="M5 10V6.2h6V10M8 6.2V2.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
  food: '<path d="M5 2.5v11M3.4 2.5V6a1.6 1.6 0 0 0 3.2 0V2.5M11.5 13.5v-11c-1.7.8-2.4 2.6-2.4 4.6h2.4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>',
  share: '<path d="M8 2.5v7.5M5 5.2l3-2.9 3 2.9M3.5 9v3.6h9V9" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
  plus: '<path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  arrow: '<path d="M2.5 8h10M9 4.5L12.5 8 9 11.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  flag: '<path d="M3.5 14V2.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4 3h8.5l-2 3 2 3H4z" fill="currentColor"/>',
  sun: '<circle cx="8" cy="8" r="3.3" fill="currentColor"/><path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  bed: '<path d="M2 12.5V4M2 10h12v2.5M14 10V8.2A2.2 2.2 0 0 0 11.8 6H7v4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="4.6" cy="7.6" r="1.4" fill="currentColor"/>',
  cal: '<rect x="2" y="3.2" width="12" height="10.8" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M2 6.6h12M5.2 1.8v2.6M10.8 1.8v2.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'
};
C.IC = IC;
C.ic = function (n, s) { return '<svg viewBox="0 0 16 16" width="' + s + '" height="' + s + '" aria-hidden="true">' + IC[n] + '</svg>'; };

/* ---------- Logo (Bildmarke B0) ---------- */
var logoN = 0;
/* variant: 'light' (logo-mark.svg, für helle Flächen) | 'brand' (logo-mark-on-brand.svg, für Indigo) */
C.logo = function (size, variant, key) {
  logoN++;
  var id = 'lgc' + logoN, brand = variant === 'brand';
  var sheet = brand ? '#5B48C9' : '#2B2266', ear = brand ? '#FFFFFF' : '#A79AF2';
  var k = key || 'lg';
  return '<svg viewBox="0 0 64 64" width="' + size + '" height="' + size + '" aria-hidden="true">' +
    '<defs><clipPath id="' + id + '"><rect x="6" y="11" width="52" height="47" rx="14"/></clipPath></defs>' +
    '<rect x="6" y="11" width="52" height="47" rx="14" fill="' + sheet + '"/>' +
    '<g clip-path="url(#' + id + ')">' +
      '<g data-k="' + k + 'Sun"><circle cx="32" cy="42" r="19" fill="#FFCF4A" opacity=".28"/><circle cx="32" cy="42" r="12" fill="#FFCF4A"/></g>' +
      '<g data-k="' + k + 'Waves"><path d="M-4 45C4 41 16 41 24 45S40 49 48 45S60 41 68 43V64H-4Z" fill="#52E5B8"/>' +
      '<path d="M-4 52C4 49 16 49 24 52S40 55 48 52S60 49 68 51V64H-4Z" fill="#1FBF94"/></g>' +
    '</g>' +
    '<rect x="18" y="5" width="7" height="12" rx="3.5" fill="' + ear + '"/>' +
    '<rect x="39" y="5" width="7" height="12" rx="3.5" fill="' + ear + '"/></svg>';
};
/* Logo-Aufbau wie im Produkt: Sonne steigt, Wellen schwingen einmal */
C.logoAnim = function (sunEl, wavesEl, t, t0) {
  if (sunEl) sunEl.style.transform = 'translateY(' + (14 * (1 - ez(t, t0, 640, E.soft))).toFixed(2) + 'px)';
  if (wavesEl) wavesEl.style.transform = 'translateX(' + (t > t0 ? 3 * Math.sin((t - t0) / 170) * (1 - pr(t, t0, 1100)) : 0).toFixed(2) + 'px)';
};

/* ---------- Konfetti (Mulberry32, fester Seed) ---------- */
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
C.mulberry32 = mulberry32;
C.confetti = function (container, seed, colors) {
  var rnd = mulberry32(seed), parts = [];
  var COL = colors || ['#52e5b8', '#ffcf4a', '#a79af2', '#f0503f', '#ffffff'];
  function burst(n, t0, ox, oy, mode, spread, width) {
    var W = width || 360;
    for (var i = 0; i < n; i++) {
      var p = { t0: t0 + rnd() * spread, ox: ox, oy: oy, col: COL[Math.floor(rnd() * COL.length)], shape: rnd() };
      if (mode === 'burst') { var a = (-90 + (rnd() - .5) * 170) * Math.PI / 180, sp = 300 + rnd() * 460; p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp; }
      else { p.ox = 8 + rnd() * (W - 16); p.oy = oy - 16 - rnd() * 40; p.vx = (rnd() - .5) * 50; p.vy = 30 + rnd() * 90; }
      p.g = 560 + rnd() * 180; p.k = 1.7 + rnd() * .9; p.spin = (rnd() - .5) * 900; p.r0 = rnd() * 360; p.flip = 7 + rnd() * 8;
      p.ph = rnd() * 6.283; p.wob = 3 + rnd() * 9; p.life = 2100 + rnd() * 900;
      var w, h, rad;
      if (p.shape < .5) { w = 5; h = 9; rad = '1.5px'; } else if (p.shape < .75) { w = 6; h = 6; rad = '50%'; } else { w = 11; h = 2.6; rad = '2px'; }
      var el = document.createElement('i');
      el.style.cssText = 'position:absolute;left:0;top:0;opacity:0;visibility:hidden;width:' + w + 'px;height:' + h + 'px;margin:' + (-h / 2) + 'px 0 0 ' + (-w / 2) + 'px;background:' + p.col + ';border-radius:' + rad;
      container.appendChild(el); p.el = el; parts.push(p);
    }
  }
  function render(t) {
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i], dt = (t - p.t0) / 1000;
      if (dt < 0 || dt * 1000 > p.life) { if (p.on) { p.el.style.opacity = 0; p.el.style.visibility = 'hidden'; p.on = false; } continue; }
      p.on = true;
      var e = 1 - Math.exp(-p.k * dt);
      var x = p.ox + p.vx * e / p.k + Math.sin(dt * p.flip * .5 + p.ph) * p.wob * Math.min(1, dt * 2);
      var y = p.oy + p.vy * e / p.k + p.g * (dt / p.k - e / (p.k * p.k));
      var o = 1 - cl((dt * 1000 - (p.life - 450)) / 450, 0, 1);
      p.el.style.visibility = 'visible'; p.el.style.opacity = o.toFixed(3);
      p.el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + (p.r0 + p.spin * dt).toFixed(1) + 'deg) scaleY(' + Math.cos(dt * p.flip + p.ph).toFixed(3) + ')';
    }
  }
  return { burst: burst, render: render };
};

/* ---------- Abspieler + Aufnahme-Schnittstelle ----------
   o = { stage, duration, scenes:[ms…], render(t), name } */
C.player = function (o) {
  var stage = o.stage, DUR = o.duration, SC = o.scenes || [0];
  var DBG = Q.get('debug') === '1', dbgT = null;
  if (DBG) {
    var d = div('promo-dbg');
    d.style.cssText = 'position:absolute;inset:0;z-index:90;pointer-events:none';
    var zs = [['left:0;right:0;top:0;height:73px', 'Reels/TikTok-Kopf'], ['left:0;right:0;top:513px;bottom:0', 'Beschriftung / Profil'], ['left:306px;right:0;top:300px;height:213px', 'Icons']];
    zs.forEach(function (z) {
      var e = div('', z[1]);
      e.style.cssText = 'position:absolute;' + z[0] + ';background:rgb(240 80 63/.22);outline:1px dashed rgb(240 80 63/.8);font:700 8px/1.2 system-ui;color:#fff;padding:3px';
      d.appendChild(e);
    });
    dbgT = div('');
    dbgT.style.cssText = 'position:absolute;left:6px;bottom:6px;font:800 11px/1 system-ui;color:#fff;background:rgb(0 0 0/.6);padding:4px 6px;border-radius:6px';
    d.appendChild(dbgT); stage.appendChild(d);
  }
  function sceneAt(t) { var n = 0; for (var i = 0; i < SC.length; i++) if (t >= SC[i]) n = i; return n; }
  function draw(t) {
    o.render(t);
    if (dbgT) dbgT.textContent = (o.name ? o.name + ' · ' : '') + (t / 1000).toFixed(2) + ' s · Szene ' + sceneAt(t) + ' · ' + C.LANG.toUpperCase();
  }
  function fit() { var k = Q.get('scale') ? parseFloat(Q.get('scale')) : Math.min(innerWidth / 360, innerHeight / 640); stage.style.zoom = k; }
  fit(); addEventListener('resize', fit);

  var start = 0;
  if (Q.has('scene')) { var n = parseInt(Q.get('scene'), 10); if (n >= 0 && n < SC.length) start = SC[n]; }
  if (Q.has('t')) start = cl(parseInt(Q.get('t'), 10) || 0, 0, DUR);
  var paused = Q.get('pause') === '1', loop = Q.get('loop') === '1';
  var cur = start, anchorNow = null, anchorT = start, running = false;
  window.__promoDuration = DUR; window.__promoDone = false; window.__promoReady = false;
  window.__promoScenes = SC.slice();
  window.__promoRender = function (ms) { running = false; cur = cl(+ms || 0, 0, DUR); draw(cur); window.__promoDone = cur >= DUR; return cur; };
  function tick(now) {
    if (!running) return;
    if (anchorNow === null) anchorNow = now;
    cur = anchorT + (now - anchorNow);
    if (cur >= DUR) {
      cur = DUR; draw(cur); window.__promoDone = true;
      if (loop) { cur = 0; anchorT = 0; anchorNow = null; window.__promoDone = false; } else { running = false; return; }
    } else draw(cur);
    requestAnimationFrame(tick);
  }
  function play() { if (running) return; if (cur >= DUR) { cur = 0; window.__promoDone = false; } running = true; anchorT = cur; anchorNow = null; requestAnimationFrame(tick); }
  function seek(ms) { cur = cl(ms, 0, DUR); anchorT = cur; anchorNow = null; window.__promoDone = cur >= DUR; draw(cur); }
  addEventListener('keydown', function (e) {
    if (e.key === ' ') { e.preventDefault(); if (running) running = false; else play(); }
    else if (e.key === 'ArrowRight') seek(cur + (e.shiftKey ? 100 : 1000));
    else if (e.key === 'ArrowLeft') seek(cur - (e.shiftKey ? 100 : 1000));
    else if (/^[0-9]$/.test(e.key) && +e.key < SC.length) seek(SC[+e.key]);
    else if (e.key === 'r') { seek(0); play(); }
  });
  function ready() {
    var ps = [];
    if (document.fonts && document.fonts.load) {
      ['800 20px "Plus Jakarta Sans"', '700 20px "Plus Jakarta Sans"', '500 12px "Figtree"', '600 12px "Figtree"', '700 12px "Figtree"', '800 12px "Figtree"']
        .forEach(function (f) { ps.push(document.fonts.load(f).catch(function () {})); });
      ps.push(document.fonts.ready);
    }
    [].forEach.call(document.images, function (img) {
      ps.push(img.complete ? Promise.resolve() : new Promise(function (r) { img.onload = img.onerror = r; }));
    });
    return Promise.race([Promise.all(ps), new Promise(function (r) { setTimeout(r, 4000); })]);
  }
  draw(start);
  ready().then(function () {
    window.__promoReady = true;
    draw(cur);
    if (paused) { window.__promoDone = cur >= DUR; return; }
    play();
  });
};

window.PromoCore = C;
})();
