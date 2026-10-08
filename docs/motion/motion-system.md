# Motion-System – Wir wollen weg / When do we go?

Stand: 2026-10-08 · Verantwortlich: Motion Designer · Status: **v1.0** (abgeglichen mit Design-System v1.0 „Reise-Cockpit“/B0 und den Antworten M-D1–M-D9, M-U1–M-U11)
Bezug: [PRD](../product/PRD.md) §5/§8, §12 Q17 · [Design-System](../design/design-system.md) §2 Nr. 11, §8, §9.6, §9.12, §9.20 · [tokens.css](../design/tokens.css) v1.0 §6 Motion · [UX-Spec](../ux/ux-spec.md) §4.2, §6, §7.5 · [User-Flows](../ux/user-flows.md) A.1, B.4, C.3, D.2, D.3 · Antworten: [design/abstimmung-ux.md §6](../design/abstimmung-ux.md), [ux/abstimmung-design.md §9](../ux/abstimmung-design.md) · Katalog: [interaktionen.md](interaktionen.md) · Prototypen: [prototypes/](prototypes/README.md) · Abstimmung: [abstimmung.md](abstimmung.md)

> **Arbeitsteilung:** Aussehen → Designer (`docs/design/`), Struktur und Abläufe → UI/UX (`docs/ux/`), **Bewegung dazwischen → dieses Dokument**. Das Motion-System beschreibt Rollen (wer bewegt sich wann, wie schnell, wie gefedert), nicht Farben. Die gewählte Richtung B „Reise-Cockpit“ (Palette B0 „Indigo & Minze“, Q18) stimmt es nur über die Regler in §3.6; die Tokens stehen seit v1.0 in `tokens.css` §6.
>
> **Verbindliche Entscheidungen (2026-10-08):** Zahlen zählen **nie** hoch – auch der Countdown nicht (CEO, D-31). Die große Feier ist der **Vorfreude-Ring** (`countdown-ring.svg`), nicht Siegel + Kalenderblatt (CEO, M-D4). Schalter „Bewegung reduzieren“ im Konto, Feier für alle Mitglieder einmal pro Person und Festlegung, Vibration nur auf Android bei Ziehen-nach-Halten und Feier-Abschluss (Auftraggeber, Q17).

---

## Inhalt
1. [Motion-Charakter](#1-motion-charakter)
2. [Prinzipien](#2-prinzipien)
3. [Motion-Tokens](#3-motion-tokens)
4. [Energie-Stufen – wie viel Bewegung wo](#4-energie-stufen--wie-viel-bewegung-wo)
5. [Choreografie-Regeln](#5-choreografie-regeln)
6. [Barrierefreiheit & Reduced Motion](#6-barrierefreiheit--reduced-motion)
7. [Performance-Regeln](#7-performance-regeln)
8. [Technik-Empfehlung](#8-technik-empfehlung)
9. [Übergabe an Entwicklung](#9-übergabe-an-entwicklung)
10. [Quellen](#10-quellen)

---

## 1. Motion-Charakter

**Leitbild: „Vorfreude, die antwortet.“** Die App reagiert sofort und federnd auf jeden Finger – wie ein gutes Werkzeug, das sich gern benutzen lässt. Bewegung zeigt, *woher* etwas kommt und *was* gerade passiert ist (ein Tag ist gesetzt, ein Zeitraum passt für alle, eine Stimme zählt). Gefeiert wird sparsam und dann richtig: Wenn der Termin steht, läuft der Sonnenpunkt eine Ehrenrunde um den Vorfreude-Ring, und das Cockpit strahlt einmal. Passend zu B gilt: **Ringe füllen sich, Häkchen ploppen, Balken wachsen – Zahlen springen.**

| Achse | Wir bewegen uns … | … und nicht |
|---|---|---|
| Tempo | schnell am Anfang, weich am Ende (Antwort < 100 ms, Ausklang 140–320 ms) | träge, „Folien-Präsentation“, Wartezeit durch Animation |
| Federung | leicht gefedert bei Bestätigungen (≈ 3 % Überschwingen), kräftig nur beim Siegel | wackelig, gummiartig, dauerhaftes Hüpfen |
| Zahlen | springen sofort auf den neuen Wert | Hochzählen, rollende Ziffern (auch nicht beim Countdown) |
| Richtung | logisch: Sheets von unten, Toasts aus der Leiste, Bänder vom Anreise- zum Abreisetag, Tab-Inhalte aus der Tab-Richtung | zufällig, dekoratives Einfliegen von allen Seiten |
| Menge | eine Sache bewegt sich, der Rest steht | gleichzeitiges Wuseln, Dauer-Loops, Hintergrund-Animationen |
| Ton | verspielt in Erfolgsmomenten, ruhig in Formularen, Login, Datenschutz, Fehlern | albern, Comic-Effekte, Schüttel-Orgien |

## 2. Prinzipien

1. **Sofort antworten.** Jede Berührung bekommt in ≤ 100 ms sichtbares Feedback (Eindrücken, Zustandswechsel). Zustände wechseln *sofort*, Bewegung ist nur der Ausklang – nie wartet der Inhalt auf die Animation (F-005 optimistisches UI, ux-spec §6).
2. **Bewegung erklärt Herkunft und Folge.** Dinge erscheinen dort, wo sie herkommen, und verschwinden dorthin, wohin sie gehen: Das Vorschlag-Band „zeichnet“ den Zeitraum vom An- zum Abreisetag, der Toast steigt aus der Werkzeugleiste, das Tagesdetail kommt aus dem unteren Rand. Eine Bewegung, die nichts erklärt oder belohnt, wird gestrichen.
3. **Weich gefedert, nie wackelig.** Bestätigungen (Tag gesetzt, Stimme gezählt, Häkchen) landen mit einer leichten Feder. Kräftige Federung ist für Belohnungen (Siegel) reserviert. Kein Element wackelt zweimal, nichts hüpft in Schleife.
4. **Ruhe, wo Vertrauen zählt.** Formulare, Login/Code, Konto, Datenschutz, Löschen und Fehler bewegen sich nur durch Überblenden (Energie-Stufe 0). **Zahlen zählen nie hoch** – Kennzahlen, Stimmen, „x von n“ und der Countdown wechseln sofort (höchstens Überblenden; CEO-Entscheidung, design-system §2 Nr. 11). Fehler wackeln höchstens einmal (Code-Feld).
5. **Ein großer Moment.** Das Bewegungs-Budget wird gespart für „Es geht los!“ (F-012): **Vorfreude-Ring** mit Ehrenrunde des Sonnenpunkts, Schein, fallendem Konfetti und einem kleinen Puff – einmal pro Person und Festlegung, abschaltbar, Kern ≤ 1 s, nach spätestens 2,6 s vorbei. Kleinere Meilensteine (Beitritt, Abgabe, alle haben abgestimmt) bekommen nur das **Siegel** (`seal.svg`, Minze mit Indigo-Häkchen).

## 3. Motion-Tokens

**Status:** **übernommen** – Namen und Werte stehen 1:1 in `tokens.css` v1.0 §6 inklusive Reduced-Motion-Blöcken für `prefers-reduced-motion` **und** `:root[data-motion="reduce"]` (M-D1, M-D2 geklärt). Die Spalte „Status“ unten zeigt nur noch die Herkunft. Präfix `--ww-`. Die Prototypen verwenden genau diese Namen.

### 3.1 Dauern

| Token | Wert | Status | Einsatz |
|---|---|---|---|
| `--ww-duration-instant` | 80 ms | besteht | Eindrücken (Button, Zelle), Ziffer im Code-Feld, Symbol verschwinden |
| `--ww-duration-fast` | 140 ms | besteht | Hover, Chips, Häkchen-Pop klein, Segment-Wechsel, Ausblenden |
| `--ww-duration-base` | 220 ms | besteht | Toast rein, Inhalte wechseln, Tab-/Segment-Indikator, Ergebnis-Balken |
| `--ww-duration-slow` | 320 ms | besteht | Bottom-Sheet, Seitenwechsel, Karten-Eintritt, Umsortieren (FLIP) |
| `--ww-duration-moderate` | **480 ms** | **neu** | „Aufbau“-Momente: Vorschlag-Band zeichnen, Siegel klein, Hero-Eintritt je Ebene |
| `--ww-duration-celebrate` | 700 ms | besteht | Siegel 40/64 px (Abgabe) mit Feder; **Ehrenrunde** des Vorfreude-Rings (F-012) |
| `--ww-duration-confetti` | **1800 ms** | **neu** | Grunddauer eines Konfetti-Teilchens (± 400 ms Zufall; Gesamtende ≤ 2600 ms) |
| `--ww-duration-fade` | **140 ms** | **neu** | reines Überblenden – **bleibt bei reduzierter Bewegung erhalten** (§6.2) |

Faustregel Distanz → Dauer: bis 16 px ≤ 140 ms · bis 100 px ≈ 220 ms · Sheet/ganze Fläche ≈ 320 ms · nie > 480 ms für Navigation.

### 3.2 Easing & Federn

| Token | Wert | Status | Einsatz |
|---|---|---|---|
| `--ww-ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | besteht | Zustandswechsel, Indikatoren, Bänder |
| `--ww-ease-enter` | `cubic-bezier(0, 0, 0, 1)` | besteht | Eintritt (Toast, Karten, Inhalte) |
| `--ww-ease-exit` | `cubic-bezier(0.3, 0, 1, 1)` | besteht | Austritt (immer kürzer als Eintritt) |
| `--ww-ease-emphasized` | **`cubic-bezier(0.05, 0.7, 0.1, 1)`** | **neu** | große Eintritte: Bottom-Sheet, Ergebnis-Karte, Hero |
| `--ww-ease-spring-soft` | **`linear()`-Feder, ≈ 3 % Überschwingen** (Wert unten) | **neu** | Bestätigungen: Zelle zurückfedern, Häkchen-Pop, Anker-Punkt, Rang-Abzeichen, Sheet einrasten |
| `--ww-ease-spring-bouncy` | **`linear()`-Feder, ≈ 16 % Überschwingen** (Wert unten) | **neu** | **nur Siegel** (Beitritt, Abgabe, alle haben abgestimmt). Die Ring-Feier F-012 nutzt `standard` + `spring-soft`. |
| `--ww-ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | besteht | bleibt als **Fallback** für `spring-bouncy` |

**Federn als CSS-`linear()`** (gedämpfte Feder, normiert; berechnet mit Dämpfung ζ = 0,75 bzw. 0,5 – reproduzierbar mit der Formel in §3.2.1). Unterstützung: Chrome 113, Firefox 112, Safari/iOS 17.2. Weil ein ungültiger Wert in einer Custom Property **nicht** auf die vorige Deklaration zurückfällt, werden die Federn per `@supports` gesetzt:

```css
:root {
  --ww-ease-emphasized: cubic-bezier(0.05, 0.7, 0.1, 1);
  /* Fallbacks (ältere WebViews, iOS < 17.2) */
  --ww-ease-spring-soft: cubic-bezier(0.34, 1.3, 0.64, 1);
  --ww-ease-spring-bouncy: var(--ww-ease-spring);
}
@supports (transition-timing-function: linear(0, 1)) {
  :root {
    /* ζ = 0,75 – max. +2,8 % bei 70 % der Dauer; empfohlene Dauer 220–480 ms */
    --ww-ease-spring-soft: linear(0, 0.052 5%, 0.174 10%, 0.325 15%, 0.478 20%,
      0.619 25%, 0.738 30%, 0.833 35%, 0.906 40%, 0.991 50%, 1.024 60%,
      1.028 70%, 1.021 80%, 1.013 90%, 1);
    /* ζ = 0,5 – max. +16 % bei 35 % der Dauer; empfohlene Dauer 480–700 ms */
    --ww-ease-spring-bouncy: linear(0, 0.116 5%, 0.372 10%, 0.657 15%, 0.898 20%,
      1.061 25%, 1.145 30%, 1.163 35%, 1.139 40%, 1.095 45%, 1.049 50%,
      0.987 60%, 0.974 70%, 0.986 80%, 0.999 90%, 1);
  }
}
```

#### 3.2.1 Herleitung (für spätere Feinabstimmung durch Designer/Developer)
`x(u) = 1 − e^(−ζωu) · (cos(ω_d u) + (ζω/ω_d) · sin(ω_d u))`, `ω_d = ω·√(1−ζ²)`, `ζω = 5,3` (Ausschwingen < 0,5 % bei u = 1). Andere Federn: ζ ändern, Kurve in 5-%-Schritten abtasten. Für JS (WAAPI) können dieselben Strings als `easing` übergeben werden (`el.animate(…, { easing: 'linear(…)' })`).

### 3.3 Distanzen & Skalierungen

| Token | Wert | Status | Einsatz |
|---|---|---|---|
| `--ww-motion-distance-sm` | **8 px** | **neu** | Hinweiszeilen, Banner, Formularschritte, Labels über Zellen |
| `--ww-motion-distance` | 16 px | besteht | Toasts, Karten-Eintritt, Reveal beim Scrollen |
| `--ww-motion-distance-lg` | **24 px** | **neu** | Tab- und Segmentwechsel (horizontal), Tag blättern im Tagesdetail |
| `--ww-motion-scale-press` | 0,97 | besteht | Buttons, Karten, Segmente beim Drücken |
| `--ww-motion-scale-cell` | **0,94** | **neu** (Wert aus design-system §8/§9.9) | Kalenderzelle beim Setzen/Malen |
| `--ww-motion-scale-enter` | **0,96** | **neu** | Dialog/Menü/Ergebnis-Karte erscheinen |
| `--ww-motion-scale-pop` | **0,6** | **neu** | Startgröße für Symbole, Häkchen, Ankerpunkt, Siegel |

### 3.4 Staffelung (Stagger)

| Token | Wert | Einsatz |
|---|---|---|
| `--ww-stagger-cell` | **12 ms** | Kalenderzellen (Setz-Welle, Heatmap-Aufbau je Diagonale) |
| `--ww-stagger-item` | **40 ms** | Listeneinträge, Code-Kästchen, Chips, Ergebnis-Segmente |
| `--ww-stagger-card` | **60 ms** | Karten (Vorschläge, Reisen, Abstimmungsoptionen) |
| `--ww-stagger-max` | **400 ms** | **Obergrenze** der Gesamtverzögerung einer Staffel – danach erscheinen alle übrigen Elemente gleichzeitig |

Staffeln laufen nur über **sichtbare** Elemente (Viewport); alles außerhalb erscheint ohne Animation.

### 3.5 Zeit-Konstanten (JS, keine CSS-Tokens)

| Konstante | Wert | Quelle |
|---|---|---|
| `TOAST_MS` / `TOAST_ACTION_MS` | 4000 / 6000 | ux-spec §4.3 |
| `HIGHLIGHT_MS` (Vorschlag im Kalender) | 4000 | user-flows C.3 |
| `SKELETON_DELAY_MS` | 300 | ux-spec §6 |
| `SPINNER_DELAY_MS` („Speichert …“ erst nach) | 400 | neu – verhindert Flackern bei schneller Antwort |
| `COPIED_MS` („Kopiert ✓“) | 2000 | ux-spec §4.5 |
| `GESTURE_HINT_MAX_MS` | 3000 | user-flows B.4 |
| `CELEBRATION_MAX_MS` | 2600 | Feier endet deutlich vor 5 s (WCAG 2.2.2); hartes Ende = Endzustand |
| `CELEBRATION_CORE_MS` | 1000 | Kern der Feier (Ring, Sonnenpunkt, Karte) – danach nur noch Ausklang |
| `CELEBRATION_USABLE_MS` | 300 | spätestens ab hier sind Text und Tasten der Ergebnis-Karte voll sichtbar (tatsächlich 220 ms) |
| `SUCCESS_HOLD_MAX_MS` | 450 | so lange darf eine Erfolgsanimation die Weiterleitung höchstens verzögern |
| `HAPTIC_MS` | 10 (Ziehen) / 15 (Feier) | Vibration nur an diesen **zwei** Stellen (§6.4) |

### 3.6 Regler – gesetzt für Richtung B „Reise-Cockpit“ (M-D6, Designer)

| Regler | Spielraum | **Wert B / B0** |
|---|---|---|
| **Tempo** | alle Dauern × 0,85 … 1,2 | **1,0** (Tokens unverändert) |
| **Federung** | `spring-soft` ζ 0,65–0,85; `spring-bouncy` ζ 0,45–0,6 | **soft ζ 0,75 · bouncy ζ 0,5** (unverändert); bouncy nur Siegel |
| **Feier-Material** (M-D5) | Formen + Farben aus semantischen Tokens | Formen: abgerundetes Rechteck 8–9 × 12–15 px (Radius 3) · Kreis Ø 10 · Sonnenstrahl 11 × 2,5 · Vier-Zack-Funkel 12 px; alle Teilchen ≤ 15 px. Farben **`--ww-confetti-1…5`** = Minze `#52E5B8`, Sonne `#FFCF4A`, Lavendel `#A79AF2`, Koralle `#F0503F` (dunkel `#FF8A7A`), Weiß. Konfetti fällt **über dem Indigo-Cockpit**, nie über Karten-Text. |
| **Illustrations-Ebenen** (M-D3) | welche `data-anim`-Ebenen sich beim Eintritt bewegen (§5.5) | siehe Tabelle §5.5 |

Alles andere (Energie-Stufen, Choreografie, Reduced Motion, Performance) bleibt richtungsunabhängig.

### 3.7 Reduced-Motion-Werte (umgesetzt in tokens.css v1.0 §6)
Beide Blöcke – `@media (prefers-reduced-motion: reduce)` und `:root[data-motion="reduce"]` (Konto-Schalter) – setzen identisch: alle Dauern außer `fade` → 0,01 ms, `duration-confetti` → 0 ms (Konfetti wird gar nicht erzeugt, JS prüft), **`duration-fade` bleibt 140 ms** (M-D2), alle Federn → `linear`, Distanzen → 0 px, Skalen → 1, Staffeln → 0 ms. Keine weiteren Token-Wünsche.

## 4. Energie-Stufen – wie viel Bewegung wo

Jede Interaktion im [Katalog](interaktionen.md) trägt eine Stufe. Sie verhindert, dass sich kleine Effekte summieren.

| Stufe | Name | Dauer | Erlaubt | Wo |
|---|---|---|---|---|
| **E0** | Ruhig | ≤ 140 ms | nur Überblenden, ein einmaliges Wackeln bei Fehler im Code-Feld | Login/Code (W02), Formulare (W05, W12, W13), Rechtstexte, Hilfe (W15), Fehler (W14), destruktive Dialoge |
| **E1** | Antwort | 80–220 ms | Eindrücken, Zustandswechsel, kleiner Pop von Symbolen | Buttons, Zellen, Segmente, Chips, Checkboxen |
| **E2** | Übergang | 220–320 ms | Gleiten, Überblenden, FLIP, Staffeln (≤ 400 ms gesamt) | Seiten, Tabs, Sheets, Toasts, Listen, Heatmap-Aufbau |
| **E3** | Belohnung | 480–700 ms, einmalig | Siegel mit Feder, Welle über Zellen, Band zeichnen, Ring-Schritt | Beitritt (F-003), Abgabe (F-005), Vorschlag im Kalender (F-009), Abstimmung gestartet (F-010), alle haben abgestimmt (F-011) |
| **E4** | Feier | Kern ≤ 1 s, Ausklang ≤ 2,6 s | Vorfreude-Ring: Ehrenrunde, Schein, Konfetti fällt, Puff, Funkel; Schritt 3 wächst | **nur** „Termin steht fest“ (F-012), [interaktionen.md W11-02](interaktionen.md#w11-02--zeitleiste-der-feier) |

Pro Bildschirm läuft **höchstens eine** E3/E4-Bewegung gleichzeitig.

## 5. Choreografie-Regeln

### 5.1 Zustand zuerst, Bewegung danach
Der neue Zustand wird im selben Frame gesetzt wie die Eingabe (Fläche, Muster, Symbol, Text). Bewegung ist nur das „Nachfedern“. Beispiel Tag setzen: Fläche wechselt sofort, Zelle federt von 0,94 auf 1.

### 5.2 Eintritt lang, Austritt kurz
Austritte dauern ≈ 60 % des Eintritts und nutzen `ease-exit`. Was verschwindet, soll nicht im Weg stehen.

### 5.3 Richtung folgt der Logik
- Vorwärts im Flow (E-Mail → Code → Name) und Tab nach rechts: neuer Inhalt kommt von rechts (`+distance-lg`), zurück von links.
- Sheets und Toasts: von unten; Banner: von oben (unter dem Header).
- Zeiträume (Band, Setz-Welle): in Datumsreihenfolge, nicht nach Bildschirmposition.

### 5.4 Layout springt, Inhalt bewegt sich
Höhen, Breiten und Positionen werden **nie** animiert. Wenn sich Layout ändert (Karte bekommt Ergebnis-Balken, Liste wird umsortiert, Werkzeugleiste wird kompakt), springt das Layout und die Bewegung entsteht über `transform`:
- **FLIP** für Umsortieren/Entfernen (First–Last–Invert–Play: alte Position messen, neues Layout setzen, Differenz als `translate` rückwärts abspielen).
- **Überblenden** für Inhaltswechsel gleicher Stelle.
- Aufklappen (Akkordeon, Legende, „Wer hat wie gestimmt?“): Inhalt erscheint sofort mit Überblenden, nur der Chevron dreht sich.

### 5.5 Illustrationen
Illustrationen bewegen sich **nur beim Eintritt** (einmal), nie in Schleife. Animierbar sind die Ebenen, die der Designer als Gruppen mit `data-anim` auszeichnet (M-D3, umgesetzt für alle 14 Dateien, `docs/design/assets/README.md`). Texte, Headline und Haupt-Button erscheinen **ohne Verzögerung** – Illustrationen bauen sich dahinter/daneben auf, nie davor. Der statische Zustand der Datei ist der Endzustand (Reduced Motion). Gruppen mit `transform`-Attribut liegen in einer äußeren `data-anim`-Gruppe – CSS-/WAAPI-Transforms nur auf die äußere Gruppe.

| Datei (v1.0) | Ebenen (`data-anim`) | Bewegung |
|---|---|---|
| `hero.svg` (W01, Übersichtskarte) | `plate`, `calendar`, `ring`, `friends`, `cells`, `band`, `sun`, `seal` – **kein `sea`** | W01-01: Karte hebt sich, Ring füllt sich, Zellen als Welle, Bänder (Minze-Rahmen) blenden ein, Sonne geht auf, Siegel ploppt |
| `countdown-ring.svg` (W11, Feier) | `backdrop`, `glow`, `confetti` (`data-piece` 1–12), `track`, `ring` (`pathLength` 100), `knob`, `sparkles` | W11-02 (E4) |
| `vote-done.svg` (kompakter Vorfreude-Ring: Meine Reisen, Mail, Teilen-Bild) | `backdrop`, `glow`, `confetti`, `track`, `ring`, `knob` – **kein Kalenderblatt/Band mehr** | statisch; in W04 Ring-Schritt `moderate` beim ersten Sehen (W04-03) |
| `seal.svg` (M-D4, 20/40/64 px) | `disc`, `check` (`pathLength` 1), `sparks` | Scheibe `scale-pop → 1` mit `spring-bouncy`, Häkchen zeichnet sich (`stroke-dashoffset` 1 → 0), Funken nur bei 64 px |
| `invite.svg` (Mail, Fallback) | `letter` (Reisekarte), `plane` | Flieger gleitet 12 px schräg ein |
| `trip-card-motif.svg` (W03-Reisekarte) | `backdrop`, `rings`, `sun`, `waves`, `sparkles` | Sonne steigt 8 px, Wellen gleiten 6 px – einmal |
| `submitted.svg` (W08) | `plate`, `calendar`, `seal`, `sparks` | W08-10 |
| `code-sent.svg` (W02/W03) | `plate`, `letter`, `seal`, `sparks` | E0: nur Überblenden (Login bleibt ruhig) |
| übrige (`empty-*`, `no-matches`, `vote-waiting`, `error`, `goodbye`) | je 2–4 Ebenen | Leerzustände: einmal ≤ 700 ms; `error`/`goodbye` statisch |

### 5.6 Unterbrechbar
Jede Animation darf jederzeit von einer neuen Eingabe abgelöst werden: Klick während eines Austritts wirkt auf den neuen Zustand, Ziehen eines Sheets stoppt dessen Animation an der aktuellen Position, Tippen/Scrollen beendet Konfetti und Geste-Hinweis. Keine Animation setzt `pointer-events: none` auf bedienbare Inhalte.

### 5.7 Erfolg nicht vortäuschen
Belohnungen (E3/E4) starten erst nach Server-Bestätigung (Termin festgelegt, Beitritt erfolgt). Optimistische Aktionen (Tag setzen, Stimme) bekommen nur E1-Feedback; scheitert das Speichern, gibt es keinen „Rückwärts-Effekt“, sondern den Status „Nicht gespeichert“ (design-system §9.13).

### 5.8 Einmal ist genug
E3/E4-Momente und Eintritts-Choreografien (Heatmap-Aufbau, Karten-Staffel, Hero) laufen **einmal pro Sitzung bzw. pro Ereignis**; bei Zurück-Navigation und erneutem Öffnen erscheint alles sofort. Merker: `sessionStorage` (Aufbau-Effekte). **Feier F-012: serverseitig je Mitgliedschaft und Festlegung** (M-U6) – sonst feiert man in In-App-Browser und Browser doppelt; der Merker wird gesetzt, wenn die Feier sichtbar startet; neue Festlegung mit anderem Zeitraum → erneut.

### 5.10 Nichts springt unter dem Finger
Listen werden nicht umsortiert, solange man auf der Seite ist (M-U3: Abstimmungskarten erst beim nächsten Öffnen nach Rang). Bewegung, die Elemente verschiebt, gibt es nur als direkte Folge der eigenen Handlung (Filter → FLIP, W09-04).

### 5.9 Lange deutsche Texte (i18n)
- Keine Animation von Text-Einzelbuchstaben oder -wörtern (Silbentrennung, Screenreader, DE ≈ +30 %).
- Keine Bewegung, die feste Breiten annimmt: Indikatoren (Tabs, Segmente) messen ihre Zielbreite und skalieren per `scaleX` – bei zweizeiligen Labels bleiben sie korrekt.
- Text, der während einer Animation umbricht (Button wird zu „Wird gespeichert …“), wechselt per Überblenden; die Breite springt nicht (design-system §9.1).
- Labels über Zellen (Zieh-Vorschau „13.–19. Mai · 7 Tage“, Vorschlags-Label) werden am Rand des Rasters geklemmt, nie abgeschnitten.

## 6. Barrierefreiheit & Reduced Motion

### 6.1 Verbindliche Regeln (WCAG 2.2 AA + Projekt-Leitplanken)
| Regel | Umsetzung |
|---|---|
| `prefers-reduced-motion` wird immer bedient | Tokens schalten um (§3.7); JS fragt `matchMedia('(prefers-reduced-motion: reduce)')` **und** `data-motion` ab, bevor WAAPI-Animationen, Konfetti, Staffeln, Smooth-Scroll gestartet werden. |
| **2.2.2 Pausieren, Stoppen, Ausblenden** | Nichts bewegt sich automatisch länger als 5 s: Feier ≤ 2,6 s, Geste-Hinweis ≤ 2,8 s und einmalig, Skelett-Pulsieren max. 4 Zyklen (≈ 4,8 s) dann statisch, Caret im Code-Feld blinkt max. 5 s. Keine Endlos-Loops (auch nicht in Illustrationen). |
| **2.3.1 Drei Blitze** | Keine großflächigen Hell-Dunkel-Wechsel, kein Aufblitzen des Hintergrunds, nichts flackert > 3 Hz. Der Schein (`glow`) hellt **einmal** und nur bis 12 % Deckkraft auf. Konfetti-Teilchen sind klein (≤ 15 px) und bedecken < 10 % der Fläche. |
| **2.3.3 Animation durch Interaktion** (AAA, Projekt-Ziel) | Alles, was durch Interaktion ausgelöst wird, ist abschaltbar – über die Systemeinstellung **und** den Konto-Schalter „Bewegung reduzieren“ (Q17, §6.3). Die Feier endet beim nächsten Tippen/Scrollen/Tastendruck. |
| Fokus geht nie verloren | Fokus wird **zu Beginn** einer Animation gesetzt, nicht am Ende (Sheet → Überschrift/erstes Feld; Feier **Orga** → h1 „Es geht los!“ sofort, h1 mit `aria-describedby` auf die Datumszeile, keine zusätzliche Live-Ansage; Feier **Mitglied** → normaler Seitenaufruf, **kein** Fokussprung – M-U10). Listen werden nicht umsortiert, während Fokus darin ist (M-U3). Fokusringe werden nie animiert. |
| Inhalte nie nur während einer Animation sichtbar | Toasts bleiben 4/6 s und pausieren bei Fokus/Hover; die Vorschlags-Hervorhebung bleibt 4 s bzw. bis zur nächsten Interaktion – auch ohne Bewegung; alles, was eine Animation zeigt, steht auch als Text/Ansage zur Verfügung (`aria-live`). |
| Inhalte nie erst durch Scrollen lesbar | Scroll-Reveals starten **sichtbar** (Fallback ohne JS = sichtbar); Elemente im ersten Viewport werden nie versteckt; Reveal nur als leichtes Nachschieben (≤ 16 px, Deckkraft ab 0 nur unterhalb des ersten Viewports). |
| Fokus nicht verdeckt (2.4.11) | Smooth-Scroll und Auto-Scroll respektieren `scroll-padding` (`--ww-sticky-bar-h`, ux-spec §4.3). |
| Ziehbewegungen (2.5.7) | Jede Zieh-Animation hat eine Ein-Tipp-Alternative (Bereichsmodus, Schließen-Button, ‹ ›-Buttons) mit gleichwertigem Feedback. |

### 6.2 Was „reduziert“ konkret heißt

| Bewegungsart | Volle Bewegung | Reduziert |
|---|---|---|
| Eindrücken, Zurückfedern | Skalierung 0,94–0,97 | keine Skalierung; Zustandswechsel sofort |
| Gleiten (Sheet, Toast, Tab, Schritt) | Translation + Überblenden | **nur Überblenden** (`--ww-duration-fade`, 140 ms) |
| Staffeln, Wellen, Heatmap-Aufbau | gestaffelt | alles gleichzeitig, sofort |
| Band zeichnen (Vorschlag) | wächst vom An- zum Abreisetag | erscheint vollständig; Hervorhebung bleibt gleich lang |
| Siegel, Häkchen-Pop | Feder | statisch sichtbar (ggf. 140 ms Überblenden) |
| **Feier F-012** | Ehrenrunde, Schein, Konfetti, Puff, Funkel | **nur Überblenden** (Cockpit + Ergebnis-Karte 140 ms) in den statischen Endzustand von `countdown-ring.svg`; kein Puff, keine Vibration; Text „Es geht los!“ und Countdown tragen den Moment |
| Parallax, Scroll-Effekte | dekorativ | entfallen vollständig |
| Smooth-Scroll | `behavior: 'smooth'` | `behavior: 'auto'` (Sprung) |
| Code-Fehler-Wackeln | 1 × 4 px | entfällt; Fehlertext + Rahmen reichen |
| Spinner | dreht | drei statische Punkte (design-system §9.2) |
| Geste-Hinweis „wischen“ | animierter Finger | statische Skizze **ohne Zeitlimit** im Willkommens-Hinweis, bis dieser geschlossen wird (M-U9) |
| Ziehen (Tage, Sheet) | folgt dem Finger | **folgt weiterhin dem Finger** (direkte Manipulation ist keine Animation); nur Einrasten ohne Feder |
| Vibration | 2 Stellen (§6.4) | **aus** |

### 6.3 Konto-Schalter „Bewegung reduzieren“ (entschieden, Q17 / M-U1)
In **Konto → Darstellung** (W13, design-system §9.20) ein Schalter **„Bewegung reduzieren“ / „Reduce motion“**, `role="switch"`. Standard **aus** = folgt dem Gerät. **An** setzt sofort, ohne Neuladen, `<html data-motion="reduce">`, gespeichert im Konto **und** `localStorage` (damit der erste Seitenaufruf vor dem Login schon stimmt). Der Schalter kann Bewegung nur *reduzieren*. **Meldet das Gerät „reduzieren“**, erscheint der Schalter **an und nicht bedienbar** (Schloss + «Ist an, weil dein Gerät Bewegung reduziert.», `aria-disabled`) – nicht „aus“ bei trotzdem reduzierter Bewegung. Der Schalter selbst bewegt sich wie G-12 (Daumen gleitet; reduziert sofort).

JS-Weiche (eine Funktion für alle): `reducedMotion() = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduce'` – vor jeder WAAPI-Animation, Staffel, Konfetti, Smooth-Scroll und Vibration prüfen.

### 6.4 Haptik (entschieden, Q17)
Vibration **nur auf Android, best effort** (`navigator.vibrate`, iOS hat keine API), **nie Ton, nie einzige Rückmeldung**, aus bei reduzierter Bewegung – und **nur an zwei Stellen**:
1. **Ziehen nach 300 ms Halten** startet (W08-02): `navigator.vibrate(10)`.
2. **Feier-Abschluss**, wenn der Sonnenpunkt im Vorfreude-Ring einrastet (W11-02, t ≈ 780 ms): `navigator.vibrate(15)`.

Keine Vibration bei Tippen, Stimme, Abgabe-Siegel, Fehlern oder Code-Eingabe.

## 7. Performance-Regeln

1. **Nur `transform` und `opacity` animieren.** Ausnahmen mit Begründung: (a) Farbwechsel (`background-color`, `border-color`) an *kleinen* Elementen (Zelle, Chip, Segment) ≤ 140 ms, Heatmap-Neuberechnung 140 ms (design-system §8.3 Nr. 3) – Paint, kein Layout; (b) **Ringe** (Vorfreude-Ring, Fortschrittsringe 52 px, Siegel-Häkchen) per `stroke-dasharray`/`stroke-dashoffset` auf **einem** Pfad mit `pathLength` – Paint auf kleiner Fläche, ≤ 700 ms, so vom Designer spezifiziert (design-system §8.3 Nr. 1). Nie animiert: `width/height/top/left/margin/padding`, `box-shadow`, `filter`/`backdrop-filter`, `clip-path` auf großen Flächen. Schatten-Übergänge über ein Pseudo-Element mit Schatten, dessen `opacity` wechselt.
2. **Kein Layout-Lesen in Animationsschleifen.** Messen (FLIP, Zellpositionen) einmal vor der Animation, gebündelt; Zieh-Vorschau per `requestAnimationFrame` und Hit-Test über `document.elementFromPoint` bzw. vorab gemessene Zell-Rechtecke.
3. **Animationsmenge begrenzen.** Heatmap-Aufbau nur für Zellen im Viewport (≈ 35–42 Zellen mobil); Feier: 12 SVG-Teilchen + Puff ≤ 24 Teilchen mobil / ≤ 40 ab 600 px (zusammen < 60); Staffeln enden nach `--ww-stagger-max`.
4. **`will-change` nur während der Animation** (per JS setzen und danach entfernen) – sonst kostet jede Zelle eine eigene Ebene (Speicherdruck in In-App-Browsern).
5. **Eingaben nie blockieren.** Keine Animation hält den Main-Thread (WAAPI/CSS laufen auf dem Compositor). Keine Interaktion wartet auf `animationend` – nur Aufräumarbeiten.
6. **Ziel 60 fps auf Mittelklasse-Android** (Referenz: Pixel 6a / Galaxy A54 im WhatsApp-In-App-Browser). Prüfung: Chrome DevTools Performance mit 4× CPU-Drosselung, keine Long Tasks > 50 ms während Ziehen/Feier.
7. **Tipp-Feedback ≤ 100 ms:** `pointerdown` (nicht `click`) löst das Eindrücken aus; `touch-action: manipulation` gegen den 300-ms-Doppeltipp-Verzug; im Kalender `touch-action: pan-y` (vertikales Scrollen bleibt, horizontales Ziehen gehört der App, user-flows B.2).
8. **Unsichtbar = gestoppt.** Bei `document.hidden` laufende Feier/Staffeln beenden (Endzustand setzen).
9. **Kein Layout-Shift durch Animation** (CLS): Eintritts-Animationen nutzen `transform`, der Platz ist von Anfang an reserviert.

## 8. Technik-Empfehlung

Kurzfassung: **Plattform-first, keine Animationsbibliothek im MVP.** CSS + Tokens für ≈ 80 %, Web Animations API (WAAPI) für Sequenzen, Staffeln, FLIP und Konfetti, alles in einer kleinen eigenen Hilfsdatei (`src/lib/motion.ts`, ≈ 1–2 KB). View Transitions und Scroll-getriebene Animationen nur als Progressive Enhancement. Abstimmung mit Operations/Developer: [abstimmung.md](abstimmung.md) M-X1–M-X3.

| Technik | Wofür bei uns | Bundle | Unterstützung (Stand 10/2026) | Next.js App Router | Empfehlung |
|---|---|---|---|---|---|
| **CSS Transitions / Keyframes + Tokens** | Eindrücken, Toasts, Sheets, Indikatoren, Hover, Skelett, Reduced Motion per Media Query | 0 KB | überall | funktioniert in Server Components (nur Klassen/CSS Modules) | **MVP-Grundlage** |
| **`@starting-style` + `transition-behavior: allow-discrete`** | Eintritt von `<dialog>`, Popover, Toast ohne JS-Zwischenzustand | 0 KB | Chrome 117, Safari 17.5, Firefox 129 | CSS-only | **MVP**, ohne Unterstützung erscheint das Element einfach ohne Eintritt |
| **CSS `linear()`** | Federn in CSS | 0 KB | Chrome 113, Safari 17.2, Firefox 112 | CSS-only | **MVP** mit `@supports`-Fallback (§3.2) |
| **Web Animations API** (`element.animate`) | Setz-Welle, Heatmap-Aufbau, Band zeichnen, FLIP, Ergebnis-Balken, Siegel, Konfetti | 0 KB (+ ≈ 1–2 KB eigener Helfer) | überall inkl. iOS-WebView (Safari ≥ 13.1) | nur in Client Components (`"use client"`), z. B. Kalender, Abstimmungskarte, Feier | **MVP** |
| **View Transitions API** (same-document) | Tab-Wechsel, Segment Vorschläge ↔ Kalender, später gemeinsame Elemente (Reisekarte → Reise-Kopf) | 0 KB | Chrome 111, Safari/iOS 18, Firefox 144 | Next 16: `experimental.viewTransition` + React `<ViewTransition>` – laut Next-Doku **experimentell, nicht für Produktion empfohlen** | **später** (Spike nach MVP). Im MVP: Tab-Inhalt mit CSS-Eintritt (Richtung aus vorigem Tab), siehe [interaktionen.md](interaktionen.md) G-02 |
| **Scroll-getriebene Animationen** (`animation-timeline: scroll()/view()`) | nur Dekoration: Hero-Parallax, Schatten an fixierten Kopfzeilen, Reveal | 0 KB | Chrome 115, Safari 26; Firefox stabil noch hinter Flag | CSS-only | **MVP+** nur mit `@supports`; ohne Unterstützung: statisch (Reveal per IntersectionObserver) |
| **IntersectionObserver** | Scroll-Reveal (Landing), „einmal gesehen“ | 0 KB | überall | Client Component | **MVP** (Landing) |
| **Motion** (motion.dev, ehem. Framer Motion) | wäre: Sheet-Physik, Layout-Animationen, `AnimatePresence` | `animate` mini 2,3 KB (WAAPI + Federn); React `m` + `LazyMotion` ≈ 4,6 KB + `domAnimation` 15 KB bzw. `domMax` (Drag/Layout) 25 KB | gut | nur Client Components; Exit-Animationen über `AnimatePresence` | **nicht im MVP.** Wiedervorlage, falls eigener FLIP-/Sheet-Code > 300 Zeilen wird oder Fehler macht. Dann `motion/mini` bzw. `m`+`domAnimation` gezielt im Kalender/Sheet, nicht global |
| **canvas-confetti** u. ä. | Konfetti | wenige KB (vor Einsatz messen) | gut | Client, dynamisch laden | nicht nötig – eigenes WAAPI-Konfetti (≈ 60 Zeilen, Prototyp c) passt sich an Tokens/Richtung an |
| **Lottie / Rive** | – | Player ≥ 50 KB + Assets | gut | Client | **nein** – zu schwer für In-App-Browser (PRD: < 2 s auf 4G), Animationen an einen Stil gebunden |

### 8.1 Verhalten in In-App-Browsern
| Umgebung | Engine | Was das für Motion heißt |
|---|---|---|
| iOS: WhatsApp, Instagram, Facebook, Telegram (WKWebView bzw. SFSafariViewController) | WebKit der installierten iOS-Version | Features wie Safari derselben iOS-Version (`linear()` ab 17.2, `@starting-style` ab 17.5, View Transitions ab 18). `prefers-reduced-motion` folgt der iOS-Einstellung „Bewegung reduzieren“; zusätzlich wirkt der Konto-Schalter. **Keine Vibration** (`navigator.vibrate` fehlt) – die zwei Haptik-Stellen (§6.4) entfallen dort ersatzlos. Gummiband-Überscrollen: Sheets und Kalender mit `overscroll-behavior: contain`. |
| Android: WhatsApp (oft Chrome Custom Tabs), Instagram/Facebook (Android System WebView) | Chromium, über Play Store aktuell gehalten | Volle Unterstützung; `navigator.vibrate` je nach App-Berechtigung oft wirkungslos → Haptik nur „best effort“ und nur an den zwei Stellen aus §6.4. Speicher knapper als im Browser → `will-change` sparsam, Konfetti-Teilchen begrenzt. |
| Alle In-App-Browser | – | Untere Browserleiste blendet beim Scrollen ein/aus → fixierte Leisten, Sheets und Toasts mit `dvh` und `env(safe-area-inset-bottom)`; Animationen, die an die Viewport-Höhe gebunden sind, beim `resize` nicht neu starten. Web Share oft nicht verfügbar → Kopieren-Feedback (G-11) ist der Normalfall. |

### 8.2 Struktur-Vorschlag für den Developer (kein Produktivcode)
- `src/styles/motion.css` – Utility-Klassen auf Basis der Tokens (`.enter-rise`, `.press`, `.fade`), Reduced-Motion-Blöcke.
- `src/lib/motion.ts` – `prefersReducedMotion()` (Media Query + `data-motion`), `animateIfAllowed(el, keyframes, opts)` (liefert bei Reduced Motion sofort den Endzustand), `stagger(els, step, max)`, `flip(container, mutate)`, `haptic(kind)` (nur `'drag' | 'celebrate'`, prüft Reduced Motion), `celebrateRing(svg, { share, onDone })` (lazy importiert).
- Feier (`celebrateRing`) per `import()` erst beim Ereignis laden → kein Gewicht im Normalfall. Referenz-Umsetzung: Prototyp c (`ringFrames`, `celebrate`, `burst`, `finishCelebration`).
- Tests: Playwright mit `reducedMotion: 'reduce'` **und** `'no-preference'` für die Kernflows; Snapshot erst nach `document.getAnimations()` = fertig.

## 9. Übergabe an Entwicklung

| Paket | Inhalt | Reife |
|---|---|---|
| **M-0 Grundlagen** | Tokens sind in tokens.css v1.0 §6; `motion.css`, `motion.ts`, Reduced-Motion-Weiche (System + `data-motion`), Konto-Schalter W13-01 | **umsetzungsreif** |
| **M-1 Inkrement 1** (F-040–F-042) | Code-Eingabe: Ziffer-Pop, Fehler-Wackeln, Erfolgs-Welle, **optimistischer Code-Schritt (M-U5)** (Prototyp e) | **umsetzungsreif** |
| **M-2 Komponenten** | Button-Press, Toast, Bottom-Sheet inkl. Ziehen/Rasten, Cockpit-Tab-Pille, Segment-Indikator, Kopieren-Feedback, Siegel-Komponente | **umsetzungsreif** |
| **M-3 Meine Tage** (F-005) | Setz-Feedback, Zieh-Vorschau, Setz-Welle, Undo, gleitender Pinsel-Indikator (M-D7), Abgabe-Siegel, Haptik Ziehen (Prototyp a) | **umsetzungsreif** |
| **M-4 Gruppe** (F-008/F-009) | Heatmap-Aufbau, Vorschläge-Staffel, Filter-FLIP, „Im Kalender zeigen“/Vorschlag-Leiste (Prototyp b) | **umsetzungsreif** (Vorschlag-Leiste: Bewegung nach W09-13) |
| **M-5 Abstimmen & Feier** (F-011/F-012) | Stimme, Ergebnis-Enthüllung, **kein Umsortieren auf der Seite (M-U3)**, **Vorfreude-Ring-Feier W11-02** inkl. Fokus-Regel und Server-Merker (Prototyp c) | **umsetzungsreif**; offen nur M-D10/M-D11 (Ring-Anteil bei der Feier, ruhende Teilchen bei späteren Besuchen) – ändern die Zeitleiste nicht |
| **M-6 Landing** | Hero-Eintritt mit `hero.svg` v1.0, Scroll-Reveal, Parallax (Prototyp d); kein Sticky-CTA (M-U4) | **umsetzungsreif** |

## 10. Quellen
- Next.js Doku `viewTransition` (16.x, experimentell): https://nextjs.org/docs/app/api-reference/config/next-config-js/viewTransition
- Motion – Bundle-Größen: https://motion.dev/docs/react-reduce-bundle-size, https://motion.dev/docs/react-lazy-motion
- Can I use – View Transitions: https://caniuse.com/view-transitions, Cross-Document: https://caniuse.com/cross-document-view-transitions
- Chrome Developers – View Transitions: https://developer.chrome.com/docs/web-platform/view-transitions
- Scroll-getriebene Animationen: https://developer.chrome.com/articles/scroll-driven-animations, Status Firefox: https://bugzil.la/1808410
- WCAG 2.2: 2.2.2, 2.3.1, 2.3.3, 2.4.11, 2.5.7 (https://www.w3.org/TR/WCAG22/)

Browser-Versionsangaben aus Can-I-Use/Herstellerdokumentation, Stand Oktober 2026; vor Umsetzung durch Developer kurz gegenprüfen.

## Changelog
- 2026-10-08 **v1.0:** Abgleich mit Design-System v1.0 (Richtung B/B0) und den Antworten M-D1–M-D9 / M-U1–M-U11: Tokens als übernommen markiert, Regler B gesetzt (§3.6), Konfetti-Material und Farben `--ww-confetti-1…5`, `data-anim`-Ebenen v1.0 (§5.5: hero ohne `sea`, vote-done = kompakter Ring, invite = Reisekarte, Siegel Minze), Feier = Vorfreude-Ring (E4, §2 Nr. 5), kein Hochzählen, kein Umsortieren auf der Seite (§5.10), Server-Merker für die Feier (§5.8), Fokus-Regel Orga/Mitglied, Konto-Schalter entschieden (§6.3), Haptik nur an 2 Stellen (§6.4), Ring-Ausnahme `stroke-dash*` (§7).
- 2026-10-08 v0.1: Erstfassung.
