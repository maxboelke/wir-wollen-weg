/* Promo v2 – nachgebaute App-Screens (240 × 516 CSS-px), Texte DE/EN, Gruppenchat, Handy-Rahmen, Screen-Folge.
   Jeder Screen: { el, dur, render(lt) } – lt = ms seit Screen-Start; rein zeitbasiert (auch rückwärts/springen).
   Fantasiedaten: Reise „Kroatien 2027“, Anna, Ben, Kemal, Mia, „du“ = Lea (L).
   Kosten-Begriffe nach w19-kosten.md E.2 (ausgelegt · zahlst/bekommst noch … zurück · quitt · Hab ich überwiesen). */
(function () {
'use strict';
var C = window.PromoCore;
var ic = C.ic, keys = C.keys, S = C.S, O = C.O, pr = C.pr, ez = C.ez, mix = C.mix, bump = C.bump, cl = C.cl, E = C.E, swap = C.swap, div = C.div;

var TX = {
de: {
  chatT: 'Urlaub 2027', chatS: 'Anna, Ben, Kemal, Mia, du', badge: '47 neu',
  bubbles: [['Anna', 'Wann habt ihr eigentlich Urlaub?'], ['Ben', 'Juli?'], ['Kemal', 'Ich kann nur im August.'], ['', 'Wer kann am 12.?'], ['Mia', 'Welcher 12.? Juni??'], ['Ben', 'Machen wir ’ne Umfrage?']],
  trip: 'Kroatien 2027', tabs: ['Übersicht', 'Meine Tage', 'Gruppe', 'Abstimmen'],
  ph4: 'Tage sammeln · 4/5 abgegeben', ph5: 'Tage sammeln · 5/5 abgegeben',
  phVote: 'Abstimmung läuft · 4/5', phVote5: 'Abstimmung läuft · 5/5', phFixed: 'Termin steht fest',
  month: 'Juli 2027', wd: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
  saved: 'Gespeichert', brush: ['Geht', 'Zur Not', 'Geht nicht'], submit: 'Fertig – abgeben', submitted: 'Abgegeben',
  legendAll: 'alle können', allIn: 'Alle können', sugTitle: 'Sa., 10. – Sa., 17. Juli', sugMeta: '7 Nächte · 5 von 5 können', startVote: 'Abstimmung starten',
  voteTitle: 'Wann fahren wir?',
  optA: ['Sa., 10. – Sa., 17. Juli', '7 Nächte · alle 5 können'], optB: ['Sa., 24. – Sa., 31. Juli', '7 Nächte · 4 von 5 können'],
  v: ['Ja', 'Vielleicht', 'Nein'], placeholder: 'Stimm ab, um das Ergebnis zu sehen.', rank: 'Platz 1',
  stat4: '4 von 5 haben abgestimmt', stat5: '5 von 5 haben abgestimmt', fix: 'Termin festlegen',
  cdTop: 'noch', cdUnit: 'Tage', eyebrow: 'Termin steht fest', go: 'Es geht los!', date: 'Sa., 10. – Sa., 17. Juli 2027', meta: '7 Nächte · 5 Personen', tell: 'Allen Bescheid geben',
  staysT: 'Unterkünfte', staysS: 'Kroatien 2027 · 3 Vorschläge', suggest: 'Vorschlagen', hint: 'Nach rechts wischen, wenn’s dir gefällt',
  by: 'Vorschlag von ',
  stays: [['Steinhaus mit Meerblick', 'Hvar · 4 Zimmer · bis 8 Gäste', '1.260 €', 'A'], ['Altstadtwohnung', 'Split · 3 Zimmer · bis 6 Gäste', '980 €', 'K'], ['Villa mit Pool', 'Brač · 5 Zimmer · bis 10 Gäste', '1.940 €', 'M']],
  names: { A: 'Anna', B: 'Ben', K: 'Kemal', M: 'Mia', L: 'Lea' },
  total: 'gesamt · 7 Nächte', like: 'Gefällt', nope: 'Eher nicht',
  costT: 'Kosten', costS: 'Kroatien 2027', stand: 'Dein Stand',
  owe1: 'Du zahlst noch<br>71,20 € zurück.', owe2: 'Du zahlst noch<br>88,10 € zurück.', oweTo: 'An Ben.',
  group: 'Ausgaben der Gruppe', groupSum1: 'Die Gruppe hat bisher 1.606,00 € ausgegeben.', groupSum2: 'Die Gruppe hat bisher 1.690,50 € ausgegeben.',
  rows: [['Steinhaus mit Meerblick', 'Ben hat ausgelegt · für alle', '1.260,00 €', 'auf dich 252,00 €'], ['Mietwagen', 'Du hast ausgelegt · für alle', '250,00 €', 'auf dich 50,00 €'], ['Fähre Split – Hvar', 'Anna hat ausgelegt · für alle', '96,00 €', 'auf dich 19,20 €']],
  newRow: ['Pizza am Hafen', 'Kemal hat ausgelegt · für alle', '84,50 €', 'auf dich 16,90 €'],
  add: 'Ausgabe eintragen', sheetT: 'Ausgabe eintragen',
  fWhat: 'Wofür?', fWhatV: 'Pizza am Hafen', fAmt: 'Betrag', fAmtV: '84,50 €', fWho: 'Wer hat ausgelegt?', fWhoV: 'Kemal', fFor: 'Für wen war es?', fForV: 'Alle 5 · gleich geteilt', save: 'Speichern',
  settleT: 'Ausgleichen', settleS: 'Kroatien 2027',
  oweS: 'Du zahlst noch<br>88,10 € zurück.', square: 'Du bist quitt ✓', squareSub: '88,10 € an Ben überwiesen', allSquare: 'Alle sind quitt ✓', allSquareSub: 'Niemand muss mehr etwas überweisen.',
  yourTransfer: 'Deine Überweisung', toBen: 'An Ben', toBenAmt: '88,10 €', iban: 'IBAN DE89 •••• •••• 3000', sent: 'Hab ich überwiesen', done: 'Erledigt',
  others: 'Ausgleiche der anderen', open: 'offen', otherRows: [['Anna', '242,10 €'], ['Kemal', '253,60 €'], ['Mia', '338,10 €']]
},
en: {
  chatT: 'Holiday 2027', chatS: 'Anna, Ben, Kemal, Mia, you', badge: '47 new',
  bubbles: [['Anna', 'So when is everyone off work?'], ['Ben', 'July?'], ['Kemal', 'I can only do August.'], ['', 'Who’s free on the 12th?'], ['Mia', 'Which 12th? June??'], ['Ben', 'Should we do a poll?']],
  trip: 'Croatia 2027', tabs: ['Overview', 'My dates', 'Group', 'Vote'],
  ph4: 'Collecting dates · 4/5 done', ph5: 'Collecting dates · 5/5 done',
  phVote: 'Voting open · 4/5', phVote5: 'Voting open · 5/5', phFixed: 'Dates are set',
  month: 'July 2027', wd: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  saved: 'Saved', brush: ['Works', 'If needed', 'Can’t'], submit: 'Done – submit', submitted: 'Submitted',
  legendAll: 'everyone free', allIn: 'Everyone can', sugTitle: 'Sat 10 – Sat 17 July', sugMeta: '7 nights · 5 of 5 can make it', startVote: 'Start vote',
  voteTitle: 'When are we going?',
  optA: ['Sat 10 – Sat 17 July', '7 nights · all 5 can make it'], optB: ['Sat 24 – Sat 31 July', '7 nights · 4 of 5 can make it'],
  v: ['Yes', 'Maybe', 'No'], placeholder: 'Vote to see the result.', rank: 'No. 1',
  stat4: '4 of 5 have voted', stat5: '5 of 5 have voted', fix: 'Lock in dates',
  cdTop: '', cdUnit: 'days to go', eyebrow: 'Dates are set', go: 'It’s on!', date: 'Sat 10 – Sat 17 July 2027', meta: '7 nights · 5 people', tell: 'Tell everyone',
  staysT: 'Stays', staysS: 'Croatia 2027 · 3 ideas', suggest: 'Suggest', hint: 'Swipe right if you like it',
  by: 'Suggested by ',
  stays: [['Stone house with sea view', 'Hvar · 4 bedrooms · sleeps 8', '€1,260', 'A'], ['Old-town flat', 'Split · 3 bedrooms · sleeps 6', '€980', 'K'], ['Villa with pool', 'Brač · 5 bedrooms · sleeps 10', '€1,940', 'M']],
  names: { A: 'Anna', B: 'Ben', K: 'Kemal', M: 'Mia', L: 'Lea' },
  total: 'total · 7 nights', like: 'Like', nope: 'Nope',
  costT: 'Expenses', costS: 'Croatia 2027', stand: 'Where you stand',
  owe1: 'You owe<br>€71.20.', owe2: 'You owe<br>€88.10.', oweTo: 'To Ben.',
  group: 'Group expenses', groupSum1: 'The group has spent €1,606.00 so far.', groupSum2: 'The group has spent €1,690.50 so far.',
  rows: [['Stone house with sea view', 'Ben paid · for everyone', '€1,260.00', 'your part €252.00'], ['Rental car', 'You paid · for everyone', '€250.00', 'your part €50.00'], ['Ferry Split – Hvar', 'Anna paid · for everyone', '€96.00', 'your part €19.20']],
  newRow: ['Pizza at the harbour', 'Kemal paid · for everyone', '€84.50', 'your part €16.90'],
  add: 'Add expense', sheetT: 'Add expense',
  fWhat: 'What for?', fWhatV: 'Pizza at the harbour', fAmt: 'Amount', fAmtV: '€84.50', fWho: 'Who paid?', fWhoV: 'Kemal', fFor: 'Who was it for?', fForV: 'All 5 · split equally', save: 'Save',
  settleT: 'Settle up', settleS: 'Croatia 2027',
  oweS: 'You owe<br>€88.10.', square: 'You’re all square ✓', squareSub: '€88.10 sent to Ben', allSquare: 'Everyone’s square ✓', allSquareSub: 'Nobody needs to send anything.',
  yourTransfer: 'Your transfer', toBen: 'To Ben', toBenAmt: '€88.10', iban: 'IBAN DE89 •••• •••• 3000', sent: 'I’ve sent it', done: 'Done',
  others: 'Other people’s transfers', open: 'open', otherRows: [['Anna', '€242.10'], ['Kemal', '€253.60'], ['Mia', '€338.10']]
}};
var L = TX[C.LANG];
var ASSETS = '../../../design/assets/';

var AV = { A: 'var(--ww-avatar-1)', B: 'var(--ww-avatar-2)', K: 'var(--ww-avatar-3)', M: 'var(--ww-avatar-5)', L: 'var(--ww-avatar-6)' };
function av(ch, k) { return '<span class="av"' + (k ? ' data-k="' + k + '"' : '') + ' style="background:' + AV[ch] + '">' + ch + '</span>'; }

/* ---------- Kopf (Cockpit) ---------- */
function header(title, sub, o) {
  o = o || {};
  var h = '<div class="ck' + (o.tab == null ? ' c' : '') + '"><div class="ck-row"><span class="ib">' + ic('back', 12) + '</span><div class="tn"><b>' + title + '</b>' +
    '<span style="--dot:' + (o.dot || 'var(--ww-mint-400)') + '"><i></i><span class="swp"><span class="pa" data-k="subA">' + sub + '</span>' +
    (o.subB ? '<span class="pb" data-k="subB">' + o.subB + '</span>' : '') + '</span></span></div>' +
    (o.right || '<span class="ib">' + ic('dots', 12) + '</span>') + '</div>';
  if (o.tab != null) h += '<div class="tabs">' + L.tabs.map(function (t, i) { return '<span' + (i === o.tab ? ' class="on"' : '') + '>' + t + '</span>'; }).join('') + '</div>';
  return h + '</div>';
}

/* ---------- Finger (Bildschirm-Koordinaten) ----------
   FK: [t, x, y, Deckkraft, gedrückt, linear?] · TAPS: [t, x, y] → Tipp-Welle */
function fingerHTML(n) { var h = '<div class="fing" data-k="fing"></div>'; for (var i = 0; i < n; i++) h += '<div class="rip" data-k="rip' + i + '"></div>'; return h; }
function fingerAt(FK, t) {
  if (t <= FK[0][0]) return [FK[0][1], FK[0][2], FK[0][3], FK[0][4]];
  for (var i = 1; i < FK.length; i++) {
    if (t <= FK[i][0]) {
      var a = FK[i - 1], b = FK[i], k = (t - a[0]) / (b[0] - a[0]), e = b[5] ? k : E.std(k);
      var dn = a[4] + (b[4] - a[4]) * Math.min(1, (t - a[0]) / 80);
      return [mix(a[1], b[1], e), mix(a[2], b[2], e), mix(a[3], b[3], k), dn];
    }
  }
  var z = FK[FK.length - 1]; return [z[1], z[2], z[3], 0];
}
function fingerR(k, FK, TAPS) {
  return function (t) {
    var f = fingerAt(FK, t); S(k.fing, { x: f[0], y: f[1], s: 1 - .18 * f[3], o: f[2] });
    for (var w = 0; w < TAPS.length; w++) {
      var tp = TAPS[w], kr = pr(t, tp[0], 450), rp = k['rip' + w];
      if (kr > 0 && kr < 1) S(rp, { x: tp[1], y: tp[2], s: mix(.5, 1.6, E.enter(kr)), o: .6 * (1 - kr) }); else O(rp, 0);
    }
  };
}
function screenEl(cls, html) { var el = div('scr ' + cls, html); return el; }

/* ---------- Kalender-Geometrie (1. Juli 2027 = Donnerstag) ---------- */
var CW = (240 - 16 - 24) / 7, CH = 30, GX = 4, GY = 4, X0 = 8, Y0 = 134;
function cpos(d) { var i = d + 2, c = i % 7, r = Math.floor(i / 7); return { c: c, r: r, x: X0 + c * (CW + GX), y: Y0 + r * (CH + GY), cx: X0 + c * (CW + GX) + CW / 2, cy: Y0 + r * (CH + GY) + CH / 2 }; }
function calBase(right) {
  var h = '<div class="mrow"><span>' + L.month + '</span>' + right + '</div>';
  [5, 6].forEach(function (c) { h += '<div class="lane" style="left:' + (X0 + c * (CW + GX) - 1).toFixed(2) + 'px"></div>'; });
  L.wd.forEach(function (w, c) { h += '<div class="wd" style="left:' + (X0 + c * (CW + GX)).toFixed(2) + 'px">' + w + '</div>'; });
  return h;
}

var SCR = {};

/* ===== 1a Meine Tage eintragen (F-005, W08) – 3200 ms ===== */
var PAINT = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
SCR.paint = function () {
  var h = header(L.trip, L.ph4, { tab: 1, subB: L.ph5 });
  h += calBase('<small class="saved" data-k="saved">' + ic('check', 9) + L.saved + '</small>');
  for (var d = 1; d <= 31; d++) {
    var p = cpos(d);
    h += '<div class="cell" data-k="c' + d + '" style="left:' + p.x.toFixed(2) + 'px;top:' + p.y + 'px"><span class="n">' + d + '</span>' +
      (PAINT.indexOf(d) >= 0 ? '<span class="f pf" data-k="f' + d + '">' + d + ic('check', 7) + '</span>' : '') + '</div>';
  }
  h += '<div class="brushes"><span class="br on"><u style="background:var(--ww-mint-100);box-shadow:inset 0 0 0 1.5px var(--ww-mint-500)"></u>' + L.brush[0] + '</span>' +
    '<span class="br"><u style="background:repeating-linear-gradient(45deg,#fff3cc 0 2px,#ffdb73 2px 4px)"></u>' + L.brush[1] + '</span>' +
    '<span class="br"><u style="background:#ddd9ea"></u>' + L.brush[2] + '</span></div>';
  h += '<div class="btn" data-k="btn" style="top:344px"><span class="bl" data-k="bl1">' + L.submit + '</span><span class="bl ok" data-k="bl2"><span data-k="okic" style="display:inline-flex">' + ic('check', 12) + '</span>' + L.submitted + '</span></div>';
  h += fingerHTML(1);
  var el = screenEl('s-paint', h), k = keys(el);
  var p8 = cpos(8), p11 = cpos(11), p12 = cpos(12), p18 = cpos(18);
  var FK = [[0, p8.cx, p8.cy + 24, 0, 0], [250, p8.cx, p8.cy + 24, 0, 0], [420, p8.cx, p8.cy, 1, 0], [460, p8.cx, p8.cy, 1, 1], [1000, p11.cx, p11.cy, 1, 1, 1], [1050, p11.cx, p11.cy, 1, 0],
    [1200, p12.cx, p12.cy, 1, 0], [1240, p12.cx, p12.cy, 1, 1], [1900, p18.cx, p18.cy, 1, 1, 1], [1950, p18.cx, p18.cy, 1, 0],
    [2180, 120, 361, 1, 0], [2240, 120, 361, 1, 1], [2360, 120, 361, 1, 0], [2620, 128, 380, 0, 0]];
  var fr = fingerR(k, FK, [[2240, 120, 361]]);
  function paintT(d) { return d <= 11 ? 460 + (d - 8) / 3 * 540 : 1240 + (d - 12) / 6 * 660; }
  return { el: el, dur: 3200, k: k, render: function (t) {
    PAINT.forEach(function (d) { var pt = paintT(d); S(k['c' + d], { s: t < pt ? 1 : mix(.9, 1, ez(t, pt, 340, E.bouncy)) }); O(k['f' + d], pr(t, pt, 90)); });
    O(k.saved, pr(t, 1980, 200));
    S(k.btn, { s: 1 - .03 * bump(t, 2240, 160) });
    swap(k.bl1, k.bl2, pr(t, 2330, 160));
    S(k.okic, { s: mix(.3, 1, ez(t, 2350, 460, E.bouncy)) });
    swap(k.subA, k.subB, pr(t, 2480, 200));
    fr(t);
  } };
};

/* ===== 1b Gruppen-Kalender (F-008/F-009, W09) – „alle können“ = Grün – 3200 ms ===== */
var LV = { 1: 1, 2: 1, 3: 0, 4: 0, 5: 1, 6: 2, 7: 2, 8: 3, 9: 3, 10: 4, 11: 4, 12: 4, 13: 4, 14: 4, 15: 4, 16: 4, 17: 4, 18: 3, 19: 2, 20: 2, 21: 1, 22: 1, 23: 2, 24: 3, 25: 3, 26: 3, 27: 3, 28: 3, 29: 3, 30: 3, 31: 3 };
var HMBG = ['var(--pv-hm-0)', 'var(--pv-hm-1)', 'var(--pv-hm-2)', 'var(--pv-hm-3)', 'var(--pv-hm-all)'];
var HMFG = ['var(--ww-ink-900)', 'var(--ww-ink-900)', 'var(--ww-ink-900)', '#fff', 'var(--pv-hm-all-fg)'];
SCR.heat = function () {
  var h = header(L.trip, L.ph5, { tab: 2 });
  h += calBase('<small class="lg"><u></u>' + L.legendAll + '</small>');
  for (var d = 1; d <= 31; d++) {
    var p = cpos(d);
    h += '<div class="cell nd" data-k="h' + d + '" style="left:' + p.x.toFixed(2) + 'px;top:' + p.y + 'px"><span class="n">' + d + '</span>' +
      '<span class="f' + (LV[d] === 4 ? ' all' : '') + '" data-k="hf' + d + '" style="background:' + HMBG[LV[d]] + ';color:' + HMFG[LV[d]] + '">' + d + '</span>' +
      (LV[d] === 4 ? '<span class="seal" data-k="hs' + d + '">' + ic('check', 8) + '</span>' : '') + '</div>';
  }
  var a = cpos(10), b = cpos(12);
  h += '<div class="band" data-k="band1" style="left:' + (a.x - 3).toFixed(2) + 'px;top:' + (a.y - 3) + 'px;width:' + (2 * CW + GX + 6).toFixed(2) + 'px"></div>';
  h += '<div class="band" data-k="band2" style="left:' + (b.x - 3).toFixed(2) + 'px;top:' + (b.y - 3) + 'px;width:' + (6 * CW + 5 * GX + 6).toFixed(2) + 'px"></div>';
  h += '<div class="sug" data-k="sug"><span class="pill mint" data-k="sugPill">' + ic('check', 9) + L.allIn + '</span>' +
    '<span class="avs">' + ['A', 'B', 'K', 'M', 'L'].map(function (c) { return av(c, 'sa' + c); }).join('') + '</span>' +
    '<h4>' + L.sugTitle + '</h4><p>' + L.sugMeta + '</p><div class="btn" data-k="sugBtn"><span class="bl">' + L.startVote + '</span></div></div>';
  h += fingerHTML(1);
  var el = screenEl('s-heat', h), k = keys(el);
  var fr = fingerR(k, [[0, 120, 432, 0, 0], [2380, 120, 432, 0, 0], [2560, 120, 401, 1, 0], [2650, 120, 401, 1, 1], [2780, 120, 401, 1, 0], [3050, 130, 420, 0, 0]], [[2650, 120, 401]]);
  return { el: el, dur: 3200, k: k, render: function (t) {
    for (var d = 1; d <= 31; d++) {
      var p = cpos(d), tw = 150 + (p.r + p.c) * 40;
      S(k['h' + d], { s: t < tw ? 1 : mix(.88, 1, ez(t, tw, 360, E.soft)) }); O(k['hf' + d], pr(t, tw, 140));
      if (LV[d] === 4) { var ts = 680 + p.c * 30 + p.r * 20; S(k['hs' + d], { s: mix(0, 1, ez(t, ts, 420, E.bouncy)), o: pr(t, ts, 80) }); }
    }
    S(k.band1, { sx: ez(t, 1000, 320), o: pr(t, 1000, 60) });
    S(k.band2, { sx: ez(t, 1180, 460), o: pr(t, 1180, 60) });
    var ks = ez(t, 1400, 520, E.soft); S(k.sug, { y: 44 * (1 - ks), o: pr(t, 1400, 160) });
    S(k.sugPill, { s: mix(.6, 1, ez(t, 1560, 420, E.bouncy)) });
    ['A', 'B', 'K', 'M', 'L'].forEach(function (ch, j) { var ta = 1620 + j * 50; S(k['sa' + ch], { s: mix(.4, 1, ez(t, ta, 420, E.bouncy)), o: pr(t, ta, 80) }); });
    S(k.sugBtn, { s: 1 - .03 * bump(t, 2650, 160) });
    fr(t);
  } };
};

/* ===== 1c Abstimmen (F-010/F-011, W10) – 2600 ms ===== */
function nums(y, m, n) { return '<span class="y">' + ic('check', 9) + '</span>' + y + '&nbsp;·&nbsp;<span class="mb">' + ic('maybe', 9) + '</span>' + m + '&nbsp;·&nbsp;<span class="no">' + ic('cross', 9) + '</span>' + n; }
function opt(id, top, data, res, bars) {
  return '<div class="opt" style="top:' + top + 'px"><span class="pill sun rank" data-k="' + id + 'rk">' + ic('star', 9) + L.rank + '</span>' +
    '<h4>' + data[0] + '</h4><p class="m">' + data[1] + '</p><div class="vseg">' +
    [0, 1, 2].map(function (j) {
      var n = ['check', 'maybe', 'cross'][j];
      return '<div class="v" data-k="' + id + 'v' + j + '"><span class="fb"></span><span class="lb">' + ic(n, 10) + L.v[j] + '</span><span class="lb2">' + ic(n, 10) + L.v[j] + '</span><span class="tick">' + ic('check', 9) + '</span></div>';
    }).join('') +
    '</div><div class="res"><span class="vph" data-k="' + id + 'ph">' + L.placeholder + '</span><span class="nums" data-k="' + id + 'nm">' + nums(res[0], res[1], res[2]) + '</span>' +
    '<span class="bar">' + bars.map(function (b, i) { return '<i data-k="' + id + 'b' + i + '" style="width:' + b[0] + 'px;background:' + b[1] + '"></i>'; }).join('') + '</span></div></div>';
}
SCR.vote = function () {
  var h = header(L.trip, L.phVote, { tab: 3, dot: 'var(--ww-lavender-300)', subB: L.phVote5 });
  h += '<div class="vt">' + L.voteTitle + '</div>';
  h += opt('oA', 122, L.optA, [5, 0, 0], [[120, 'var(--ww-mint-700)']]);
  h += opt('oB', 234, L.optB, [2, 2, 1], [[46.4, 'var(--ww-mint-700)'], [46.4, 'var(--ww-sun-500)'], [23.2, 'var(--ww-ink-500)']]);
  h += '<div class="stat"><span class="avs">' + av('A') + av('B') + av('K') + av('M') +
    '<span class="av open"><span class="av" data-k="vL" style="background:' + AV.L + ';position:absolute;left:-1.5px;top:-1.5px;margin:0;opacity:0;visibility:hidden">L</span></span></span>' +
    '<span class="swp"><span class="pa" data-k="stA">' + L.stat4 + '</span><span class="pb" data-k="stB">' + L.stat5 + ' ✓</span></span></div>';
  h += '<div class="btn" data-k="dock" style="top:380px"><span class="bl">' + L.fix + '</span></div>';
  h += fingerHTML(3);
  var el = screenEl('s-vote', h), k = keys(el);
  var fr = fingerR(k, [[0, 50, 206, 0, 0], [150, 50, 206, 0, 0], [320, 50, 182, 1, 0], [370, 50, 182, 1, 1], [490, 50, 182, 1, 0],
    [800, 120, 294, 1, 0], [850, 120, 294, 1, 1], [970, 120, 294, 1, 0], [1650, 120, 397, 1, 0], [1860, 120, 397, 1, 0], [1900, 120, 397, 1, 1], [2030, 120, 397, 1, 0], [2250, 128, 414, 0, 0]],
    [[370, 50, 182], [850, 120, 294], [1900, 120, 397]]);
  function sel(id, t0, t) {
    var v = k[id], fb = v.children[0], lb = v.children[1], lb2 = v.children[2], tk = v.children[3];
    S(fb, { s: mix(.9, 1, ez(t, t0, 280, E.soft)), o: pr(t, t0, 120) });
    swap(lb, lb2, pr(t, t0, 120));
    S(tk, { s: mix(.6, 1, ez(t, t0 + 60, 420, E.bouncy)), o: pr(t, t0 + 60, 100) });
    S(v, { s: 1 - .03 * bump(t, t0 - 40, 160) });
  }
  return { el: el, dur: 2600, k: k, render: function (t) {
    sel('oAv0', 400, t); sel('oBv1', 880, t);
    O(k.oAph, 1 - pr(t, 460, 120)); O(k.oAnm, pr(t, 600, 200));
    S(k.oAb0, { sx: ez(t, 580, 320) });
    S(k.oArk, { s: mix(.6, 1, ez(t, 700, 420, E.bouncy)), o: pr(t, 700, 100) });
    O(k.oBph, 1 - pr(t, 940, 120)); O(k.oBnm, pr(t, 1080, 200));
    for (var j = 0; j < 3; j++) S(k['oBb' + j], { sx: ez(t, 1000 + j * 50, 300) });
    S(k.vL, { s: mix(.4, 1, ez(t, 1180, 420, E.bouncy)), o: pr(t, 1180, 80) });
    swap(k.stA, k.stB, pr(t, 1220, 200));
    swap(k.subA, k.subB, pr(t, 1220, 200));
    S(k.dock, { s: 1 - .03 * bump(t, 1900, 160) });
    fr(t);
  } };
};

/* ===== 1d Termin steht – Vorfreude-Ring (F-012, W11) – 3200 ms; Konfetti-Burst bei burstAt (Stil-Datei) ===== */
SCR.party = function () {
  var h = '<div class="ckL">' + header(L.trip, L.phFixed, { dot: 'var(--ww-sun-400)' }) +
    '<svg class="ringw" viewBox="0 0 240 170" aria-hidden="true">' +
      '<defs><linearGradient id="pvRg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#52E5B8"/><stop offset="1" stop-color="#FFCF4A"/></linearGradient></defs>' +
      '<g data-k="rGlow" style="transform-origin:120px 88px;opacity:0"><circle cx="120" cy="88" r="84" fill="#FFCF4A" opacity=".08"/><circle cx="120" cy="88" r="66" fill="#FFCF4A" opacity=".13"/></g>' +
      '<circle cx="120" cy="88" r="50" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="10"/>' +
      '<path data-k="rArc" d="M120 38a50 50 0 1 1 0 100a50 50 0 1 1 0-100" pathLength="100" fill="none" stroke="url(#pvRg)" stroke-width="10" stroke-linecap="round" stroke-dasharray="0 100" style="opacity:0"/>' +
      '<g data-k="rKnob" style="transform-origin:120px 88px;opacity:0"><circle data-k="rDot" class="spk" cx="120" cy="38" r="7" fill="#FFCF4A" stroke="#2B2266" stroke-width="3"/></g>' +
      '<path class="spk" data-k="sp0" d="M40 52l2.2 5.3 5.3 2.2-5.3 2.2-2.2 5.3-2.2-5.3-5.3-2.2 5.3-2.2z" fill="#52E5B8" style="opacity:0"/>' +
      '<path class="spk" data-k="sp1" d="M200 40l2.2 5.3 5.3 2.2-5.3 2.2-2.2 5.3-2.2-5.3-5.3-2.2 5.3-2.2z" fill="#FFFFFF" style="opacity:0"/>' +
      '<path class="spk" data-k="sp2" d="M58 128l1.6 3.8 3.8 1.6-3.8 1.6-1.6 3.8-1.6-3.8-3.8-1.6 3.8-1.6z" fill="#FFCF4A" style="opacity:0"/>' +
    '</svg>' +
    '<div class="cd"><small>' + L.cdTop + '</small><b>86</b><small>' + L.cdUnit + '</small></div></div>' +
    '<div class="rc" data-k="rc"><p class="eyb">' + ic('check', 10) + L.eyebrow + '</p><h3 data-k="rcH">' + L.go + '</h3><p class="dt">' + L.date + '</p><p class="mt">' + L.meta + '</p>' +
    '<div class="btn"><span class="bl">' + ic('share', 11) + L.tell + '</span></div></div>';
  var el = screenEl('s-party', h), k = keys(el);
  return { el: el, dur: 3200, k: k, burstAt: 1150, ring: { x: 120, y: 144 }, render: function (t) {
    var g = k.rGlow; g.style.opacity = pr(t, 260, 320).toFixed(3);
    g.style.transform = 'scale(' + (mix(.7, 1, ez(t, 260, 480, E.soft)) + .08 * bump(t, 1150, 500)).toFixed(4) + ')';
    var qq = ez(t, 350, 800, E.std), arc = k.rArc;
    var len = 4 * qq + 52 * Math.sin(Math.PI * qq), end = 104 * qq, st = end - len;
    arc.setAttribute('stroke-dasharray', len.toFixed(3) + ' ' + (100 - len).toFixed(3));
    arc.setAttribute('stroke-dashoffset', (-st).toFixed(3));
    arc.style.opacity = pr(t, 350, 100).toFixed(3);
    k.rKnob.style.opacity = pr(t, 350, 100).toFixed(3); k.rKnob.style.transform = 'rotate(' + (374.4 * qq).toFixed(2) + 'deg)';
    k.rDot.style.transform = 'scale(' + (1 + .35 * bump(t, 1150, 260)).toFixed(4) + ')';
    for (var i = 0; i < 3; i++) { var tsp = 1220 + i * 70, sp = k['sp' + i]; sp.style.opacity = pr(t, tsp, 80).toFixed(3); sp.style.transform = 'scale(' + mix(0, 1, ez(t, tsp, 420, E.bouncy)).toFixed(4) + ')'; }
    S(k.rc, { y: 16 * (1 - ez(t, 120, 300, E.enter)), o: pr(t, 120, 160) });
    S(k.rcH, { s: mix(.86, 1, ez(t, 200, 600, E.bouncy)) });
  } };
};

/* ===== 2 Unterkünfte vorschlagen + swipen (F-031, W18) – 3000 ms ===== */
var IMG = ['demo-steinhaus-meerblick.svg', 'demo-altstadtwohnung.svg', 'demo-villa-pool.svg'];
SCR.swipe = function () {
  var h = header(L.staysT, L.staysS, { dot: 'var(--ww-lavender-300)', right: '<span class="hbtn">' + ic('plus', 9) + L.suggest + '</span>' });
  h += '<div class="hint">' + L.hint + '</div>';
  for (var i = 2; i >= 0; i--) {
    var s = L.stays[i];
    h += '<div class="card" data-k="cd' + i + '"><img src="' + ASSETS + 'unterkuenfte/' + IMG[i] + '" alt=""><span class="chip">' + av(s[3]) + L.by + L.names[s[3]] + '</span>' +
      '<div class="cb"><h4>' + s[0] + '</h4><p>' + s[1] + '</p><div class="pr"><span>' + s[2] + '</span><small>' + L.total + '</small></div></div>' +
      '<span class="stamp like" data-k="stL' + i + '">' + ic('heart', 13) + L.like + '</span><span class="stamp nope" data-k="stN' + i + '">' + ic('cross', 12) + L.nope + '</span></div>';
  }
  h += '<div class="rbtn no" data-k="rbNo">' + ic('cross', 18) + '</div><div class="rbtn yes" data-k="rbYes">' + ic('heart', 20) + '</div>';
  h += fingerHTML(1);
  var el = screenEl('s-swipe', h), k = keys(el);
  var fr = fingerR(k, [[0, 118, 232, 0, 0], [250, 118, 232, 0, 0], [420, 110, 200, 1, 0], [450, 110, 200, 1, 1], [900, 202, 194, 1, 1], [950, 206, 194, 1, 0],
    [1300, 84, 340, 1, 0], [1420, 84, 340, 1, 0], [1500, 84, 340, 1, 1], [1620, 84, 340, 1, 0], [1900, 92, 362, 0, 0]], [[1500, 84, 340]]);
  return { el: el, dur: 3000, k: k, render: function (t) {
    var tx1 = 92 * ez(t, 450, 450) + 250 * ez(t, 900, 300, E.exit);
    S(k.cd0, { x: tx1, y: -4 * pr(t, 450, 450), r: tx1 * .075 });
    var kl = cl((tx1 - 24) / 36, 0, 1); S(k.stL0, { r: -8, s: mix(.8, 1, kl), o: kl });
    var a1 = ez(t, 930, 380, E.soft), a2 = ez(t, 1610, 380, E.soft);
    var tx2 = -340 * ez(t, 1550, 340, E.exit);
    var d1 = 1 - a1; S(k.cd1, { x: tx2, y: 9 * d1, s: 1 - .045 * d1, r: tx2 * .075 });
    var kn2 = pr(t, 1520, 140); S(k.stN1, { r: 8, s: mix(.8, 1, kn2), o: kn2 });
    var d2 = 2 - a1 - a2; S(k.cd2, { y: 9 * d2, s: 1 - .045 * d2 });
    S(k.rbYes, { s: 1 + .1 * bump(t, 700, 280) });
    S(k.rbNo, { s: 1 - .1 * bump(t, 1500, 180) });
    fr(t);
  } };
};

/* ===== 3 Kosten unterwegs eintragen (F-035, W19 E.3) – 3400 ms ===== */
var CAT = [['house', 'var(--ww-lavender-100)', 'var(--ww-lavender-600)'], ['car', 'var(--ww-lavender-200)', 'var(--ww-indigo-800)'], ['boat', 'var(--ww-lavender-200)', 'var(--ww-indigo-800)']];
function xrow(r, cat, k, top, cls) {
  return '<div class="xr' + (cls || '') + '" data-k="' + k + '" style="top:' + top + 'px">' + (cls ? '<span class="hl" data-k="' + k + 'hl"></span>' : '') +
    '<span class="tile" style="background:' + cat[1] + ';color:' + cat[2] + '">' + ic(cat[0], 15) + '</span><div><b>' + r[0] + '</b><small>' + r[1] + '</small></div>' +
    '<span class="am">' + r[2] + '<br><small>' + r[3] + '</small></span></div>';
}
SCR.costs = function () {
  var h = header(L.costT, L.trip, { dot: 'var(--ww-sun-400)' });
  h += '<div class="stand"><div class="a"><div class="lab">' + L.stand + '</div>' +
    '<div class="sent swp"><span class="pa" data-k="owA">' + L.owe1 + '</span><span class="pb" data-k="owB">' + L.owe2 + '</span></div>' +
    '<div class="to">' + L.oweTo + '</div><span class="tile" style="background:var(--ww-mist-150);color:var(--ww-ink-700)">' + ic('wallet', 16) + '</span></div></div>';
  h += '<div class="lh" style="top:174px">' + L.group + '<small class="swp"><span class="pa" data-k="gsA">' + L.groupSum1 + '</span><span class="pb" data-k="gsB">' + L.groupSum2 + '</span></small></div>';
  h += xrow(L.newRow, ['food', 'var(--ww-sun-100)', 'var(--ww-sun-700)'], 'xn', 206, ' new');
  L.rows.forEach(function (r, i) { h += xrow(r, CAT[i], 'xr' + i, 206 + i * 40); });
  h += '<div class="dock" data-k="dock">' + ic('plus', 11) + L.add + '</div>';
  h += '<div class="scrim" data-k="scrim"></div>';
  h += '<div class="sheet" data-k="sheet"><div class="hd"></div><h5>' + L.sheetT + '</h5>' +
    '<div class="fld" style="left:12px;right:12px;top:40px"><i>' + L.fWhat + '</i><b>' + L.fWhatV + '</b></div>' +
    '<div class="fld" style="left:12px;width:84px;top:80px"><i>' + L.fAmt + '</i><b>' + L.fAmtV + '</b></div>' +
    '<div class="fld" style="left:102px;right:12px;top:80px"><i>' + L.fWho + '</i><b>' + L.fWhoV + '</b></div>' +
    '<div class="fld" style="left:12px;right:12px;top:120px"><i>' + L.fFor + '</i><b>' + L.fForV + '</b></div>' +
    '<div class="btn" data-k="save"><span class="bl">' + L.save + '</span></div></div>';
  h += fingerHTML(2);
  var el = screenEl('s-costs', h), k = keys(el);
  var fr = fingerR(k, [[0, 120, 400, 0, 0], [200, 120, 400, 0, 0], [340, 120, 384, 1, 0], [400, 120, 384, 1, 1], [520, 120, 384, 1, 0], [700, 140, 420, 0, 0],
    [1250, 120, 400, 0, 0], [1420, 120, 375, 1, 0], [1500, 120, 375, 1, 1], [1620, 120, 375, 1, 0], [1850, 130, 395, 0, 0]], [[400, 120, 384], [1500, 120, 375]]);
  return { el: el, dur: 3400, k: k, render: function (t) {
    S(k.dock, { s: 1 - .03 * bump(t, 400, 160) });
    var up = ez(t, 480, 420, E.emph), down = ez(t, 1600, 300, E.exit);
    var sh = 330 * (1 - up) + 330 * down;
    S(k.sheet, { y: sh }); k.sheet.style.visibility = (t >= 480 && t < 1900) ? 'visible' : 'hidden';
    O(k.scrim, pr(t, 480, 220) * (1 - pr(t, 1600, 260)));
    S(k.save, { s: 1 - .03 * bump(t, 1500, 160) });
    var sh2 = ez(t, 1750, 420, E.emph);
    for (var i = 0; i < 3; i++) S(k['xr' + i], { y: 40 * sh2 });
    S(k.xn, { s: mix(.92, 1, ez(t, 1800, 420, E.soft)), o: pr(t, 1800, 160) });
    O(k.xnhl, pr(t, 1800, 120) * (1 - pr(t, 2900, 500)));
    swap(k.owA, k.owB, pr(t, 1950, 160));
    swap(k.gsA, k.gsB, pr(t, 1950, 160));
    fr(t);
  } };
};

/* ===== 4 Am Ende ausgleichen (F-036, W19 E.5) – 3400 ms ===== */
SCR.settle = function () {
  var h = header(L.settleT, L.trip, { dot: 'var(--ww-sun-400)' });
  h += '<div class="stand" style="height:92px"><div class="a" data-k="stA"><div class="lab">' + L.stand + '</div><div class="sent">' + L.oweS + '</div><div class="to">' + L.oweTo + '</div>' +
    '<span class="tile" style="background:var(--ww-mist-150);color:var(--ww-ink-700)">' + ic('wallet', 16) + '</span></div>' +
    '<div class="b" data-k="stB"><span class="bigseal" data-k="seal">' + ic('check', 17) + '</span>' +
    '<strong class="swp"><span class="pa" data-k="sqA">' + L.square + '</span><span class="pb" data-k="sqB">' + L.allSquare + '</span></strong>' +
    '<small class="swp"><span class="pa" data-k="ssA">' + L.squareSub + '</span><span class="pb" data-k="ssB">' + L.allSquareSub + '</span></small></div></div>';
  h += '<div class="lh" style="top:181px">' + L.yourTransfer + '</div>';
  h += '<div class="tcard" style="top:197px"><div class="r1">' + av('B') + '<b>' + L.toBen + '</b><span>' + L.toBenAmt + '</span></div>' +
    '<div class="ib2">' + L.iban + '</div>' +
    '<div class="btn" data-k="sent"><span class="bl" data-k="sb1">' + ic('check', 12) + L.sent + '</span><span class="bl ok" data-k="sb2">' + ic('check', 12) + L.done + '</span></div></div>';
  h += '<div class="lh" style="top:304px">' + L.others + '</div>';
  L.otherRows.forEach(function (r, i) {
    h += '<div class="orow" style="top:' + (320 + i * 27) + 'px"><span class="nm">' + r[0] + ic('arrow', 9) + 'Ben</span><span class="amt">' + r[1] + '</span>' +
      '<span class="st"><span class="op" data-k="op' + i + '">' + L.open + '</span><span class="dn" data-k="dn' + i + '">' + ic('check', 8) + L.done + '</span></span></div>';
  });
  h += fingerHTML(1);
  var el = screenEl('s-settle', h), k = keys(el);
  var fr = fingerR(k, [[0, 120, 290, 0, 0], [300, 120, 290, 0, 0], [480, 120, 268, 1, 0], [600, 120, 268, 1, 1], [720, 120, 268, 1, 0], [950, 130, 290, 0, 0]], [[600, 120, 268]]);
  return { el: el, dur: 3400, k: k, render: function (t) {
    S(k.sent, { s: 1 - .03 * bump(t, 600, 160) });
    swap(k.sb1, k.sb2, pr(t, 690, 160));
    O(k.stA, 1 - pr(t, 760, 160)); O(k.stB, pr(t, 760, 220));
    S(k.seal, { s: mix(.3, 1, ez(t, 840, 520, E.bouncy)) * (1 + .14 * bump(t, 1750, 320)) });
    for (var i = 0; i < 3; i++) { var td = 1100 + i * 160; O(k['op' + i], 1 - pr(t, td, 120)); S(k['dn' + i], { s: mix(.6, 1, ez(t, td, 420, E.bouncy)), o: pr(t, td, 100) }); }
    swap(k.sqA, k.sqB, pr(t, 1700, 180));
    swap(k.ssA, k.ssB, pr(t, 1700, 180));
    fr(t);
  } };
};

/* ===== Hook: Gruppenchat-Karte (ohne Messenger-Marke) ===== */
var NAMEC = { Anna: 'var(--ww-mint-700)', Ben: 'var(--ww-lavender-600)', Kemal: 'var(--ww-coral-700)', Mia: 'var(--ww-sun-700)' };
function chat(o) {
  o = o || {};
  var t0 = o.start != null ? o.start : 260, gap = o.gap || 225, tBadge = o.badge != null ? o.badge : 1620;
  var h = '<span class="badge" data-k="badge">' + L.badge + '</span>' +
    '<div class="ch-h"><span class="avs">' + av('A') + av('B') + av('K') + '</span><div><b>' + L.chatT + '</b><small>' + L.chatS + '</small></div></div>' +
    L.bubbles.map(function (b, i) { return '<div class="bub' + (b[0] ? '' : ' me') + '" data-k="bub' + i + '">' + (b[0] ? '<i style="color:' + NAMEC[b[0]] + '">' + b[0] + '</i>' : '') + '<span>' + b[1] + '</span></div>'; }).join('');
  var el = div('chat', h), k = keys(el);
  return { el: el, k: k, render: function (t) {
    for (var b = 0; b < L.bubbles.length; b++) { var tb = t0 + b * gap, kb = ez(t, tb, 400, E.bouncy); S(k['bub' + b], { s: mix(.6, 1, kb), o: pr(t, tb, 120) }); }
    var kbd = ez(t, tBadge, 460, E.bouncy); S(k.badge, { s: mix(0, 1, kbd) * (1 + .12 * bump(t, tBadge + 280, 260)), o: pr(t, tBadge, 100) });
  } };
}

/* ===== Handy-Rahmen ===== */
function phone() {
  var el = div('ph', '<div class="ph-scr"><div class="island"></div><div class="sbar"><span>9:41</span><span class="bt">' +
    '<svg width="14" height="9" viewBox="0 0 14 9"><rect x="0" y="6" width="2.4" height="3" rx=".6" fill="#fff"/><rect x="3.8" y="4" width="2.4" height="5" rx=".6" fill="#fff"/><rect x="7.6" y="2" width="2.4" height="7" rx=".6" fill="#fff"/><rect x="11.4" y="0" width="2.4" height="9" rx=".6" fill="#fff"/></svg>' +
    '<svg width="20" height="10" viewBox="0 0 20 10"><rect x=".6" y=".6" width="16.4" height="8.8" rx="2.6" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.2"/><rect x="2.2" y="2.2" width="11" height="5.6" rx="1.4" fill="#fff"/><rect x="18" y="3.2" width="1.6" height="3.6" rx=".8" fill="#fff" fill-opacity=".6"/></svg>' +
    '</span></div></div>');
  return { el: el, slot: el.firstElementChild };
}

/* ===== Screen-Folge in einem Handy =====
   items: [{ s: Screen, tin: ms, mode: 'slide' | 'fade' | 'cut' }] – neuer Screen liegt deckend ÜBER dem alten
   (kein Überblenden zweier halbtransparenter Screens → keine blassen Texte). */
function sequence(items) {
  items.forEach(function (it, i) { it.s.el.style.zIndex = String(i + 1); });
  return function (t) {
    for (var i = 0; i < items.length; i++) {
      var it = items[i], nx = items[i + 1];
      var tEnd = nx ? nx.tin + (nx.mode === 'cut' ? 0 : 440) : Infinity;
      if ((i > 0 && t < it.tin) || t >= tEnd) { O(it.s.el, 0); continue; }
      var x = 0, sc = 1, o = 1;
      if (i > 0) {
        if (it.mode === 'slide') x = 240 * (1 - ez(t, it.tin, 420, E.emph));
        else if (it.mode === 'fade') { sc = mix(1.06, 1, ez(t, it.tin, 380, E.emph)); o = pr(t, it.tin, 200); }
      }
      if (nx && nx.mode === 'slide' && t > nx.tin) x += -60 * ez(t, nx.tin, 420, E.emph);
      S(it.s.el, { x: x, s: sc, o: o });
      it.s.render(t - it.tin);
    }
  };
}

window.PromoScreens = { L: L, TX: TX, SCR: SCR, chat: chat, phone: phone, sequence: sequence, header: header, av: av, ASSETS: ASSETS };
})();
