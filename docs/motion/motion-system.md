# Motion-System – Wir wollen weg / When do we go?

Stand: 2026-10-08 · Verantwortlich: Motion Designer · Status: v0.1 (Entwurf, erster Auftrag)
Bezug: [PRD](../product/PRD.md) §5/§8 · [Design-System](../design/design-system.md) §1, §2 Prinzip 7, §8, §9 · [tokens.css](../design/tokens.css) §1 Motion, §5 · [UX-Spec](../ux/ux-spec.md) §4, §6, §7.1 · [User-Flows](../ux/user-flows.md) B–D · Katalog: [interaktionen.md](interaktionen.md) · Prototypen: [prototypes/](prototypes/README.md) · Abstimmung: [abstimmung.md](abstimmung.md)

> **Arbeitsteilung:** Aussehen → Designer (`docs/design/`), Struktur und Abläufe → UI/UX (`docs/ux/`), **Bewegung dazwischen → dieses Dokument**. Das Motion-System ist bewusst **unabhängig vom Farb- und Formstil** geschrieben: Es beschreibt Rollen (wer bewegt sich wann, wie schnell, wie gefedert), nicht Farben. Die neue visuelle Richtung des Designers (`docs/design/richtungen/`, in Arbeit) „stimmt“ das System nur über wenige Regler (§3.6).

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

**Leitbild: „Vorfreude, die antwortet.“** Die App reagiert sofort und federnd auf jeden Finger – wie ein gutes Werkzeug, das sich gern benutzen lässt. Bewegung zeigt, *woher* etwas kommt und *was* gerade passiert ist (ein Tag ist gesetzt, ein Zeitraum passt für alle, eine Stimme zählt). Gefeiert wird sparsam und dann richtig: Wenn der Termin steht, darf die App einmal strahlen.

| Achse | Wir bewegen uns … | … und nicht |
|---|---|---|
| Tempo | schnell am Anfang, weich am Ende (Antwort < 100 ms, Ausklang 140–320 ms) | träge, „Folien-Präsentation“, Wartezeit durch Animation |
| Federung | leicht gefedert bei Bestätigungen (≈ 3 % Überschwingen), kräftig nur beim Siegel/Feier | wackelig, gummiartig, dauerhaftes Hüpfen |
| Richtung | logisch: Sheets von unten, Toasts aus der Leiste, Bänder vom Anreise- zum Abreisetag, Tab-Inhalte aus der Tab-Richtung | zufällig, dekoratives Einfliegen von allen Seiten |
| Menge | eine Sache bewegt sich, der Rest steht | gleichzeitiges Wuseln, Dauer-Loops, Hintergrund-Animationen |
| Ton | verspielt in Erfolgsmomenten, ruhig in Formularen, Login, Datenschutz, Fehlern | albern, Comic-Effekte, Schüttel-Orgien |

## 2. Prinzipien

1. **Sofort antworten.** Jede Berührung bekommt in ≤ 100 ms sichtbares Feedback (Eindrücken, Zustandswechsel). Zustände wechseln *sofort*, Bewegung ist nur der Ausklang – nie wartet der Inhalt auf die Animation (F-005 optimistisches UI, ux-spec §6).
2. **Bewegung erklärt Herkunft und Folge.** Dinge erscheinen dort, wo sie herkommen, und verschwinden dorthin, wohin sie gehen: Das Vorschlag-Band „zeichnet“ den Zeitraum vom An- zum Abreisetag, der Toast steigt aus der Werkzeugleiste, das Tagesdetail kommt aus dem unteren Rand. Eine Bewegung, die nichts erklärt oder belohnt, wird gestrichen.
3. **Weich gefedert, nie wackelig.** Bestätigungen (Tag gesetzt, Stimme gezählt, Häkchen) landen mit einer leichten Feder. Kräftige Federung ist für Belohnungen (Siegel) reserviert. Kein Element wackelt zweimal, nichts hüpft in Schleife.
4. **Ruhe, wo Vertrauen zählt.** Formulare, Login/Code, Konto, Datenschutz, Löschen und Fehler bewegen sich nur durch Überblenden (Energie-Stufe 0). Zahlen springen ohne Animation (Lesbarkeit, design-system §8). Fehler wackeln höchstens einmal (Code-Feld).
5. **Ein großer Moment.** Das Bewegungs-Budget wird gespart für „Es geht los!“ (F-012): Siegel, Kalenderblatt und Konfetti – einmal pro Person und Reise, abschaltbar, nach spätestens 2,6 s vorbei. Kleinere Meilensteine (Beitritt, Abgabe, Abstimmung gestartet) bekommen nur ein kleines Siegel.

## 3. Motion-Tokens

**Status:** Vorschlag an den Designer (er pflegt `tokens.css`, siehe [abstimmung.md](abstimmung.md) M-D1). Bestehende Tokens bleiben unverändert gültig. Präfix `--ww-` wie im Projekt. Die Prototypen verwenden genau diese Namen.

### 3.1 Dauern

| Token | Wert | Status | Einsatz |
|---|---|---|---|
| `--ww-duration-instant` | 80 ms | besteht | Eindrücken (Button, Zelle), Ziffer im Code-Feld, Symbol verschwinden |
| `--ww-duration-fast` | 140 ms | besteht | Hover, Chips, Häkchen-Pop klein, Segment-Wechsel, Ausblenden |
| `--ww-duration-base` | 220 ms | besteht | Toast rein, Inhalte wechseln, Tab-/Segment-Indikator, Ergebnis-Balken |
| `--ww-duration-slow` | 320 ms | besteht | Bottom-Sheet, Seitenwechsel, Karten-Eintritt, Umsortieren (FLIP) |
| `--ww-duration-moderate` | **480 ms** | **neu** | „Aufbau“-Momente: Vorschlag-Band zeichnen, Siegel klein, Hero-Eintritt je Ebene |
| `--ww-duration-celebrate` | 700 ms | besteht | Siegel groß (F-012), Ergebnis-Karte |
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
| `--ww-ease-spring-bouncy` | **`linear()`-Feder, ≈ 16 % Überschwingen** (Wert unten) | **neu** | nur Siegel (Beitritt, Abgabe, F-012) |
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
| `CELEBRATION_MAX_MS` | 2600 | neu – Feier endet deutlich vor 5 s (WCAG 2.2.2) |
| `SUCCESS_HOLD_MAX_MS` | 450 | neu – so lange darf eine Erfolgsanimation die Weiterleitung höchstens verzögern |

### 3.6 Regler für die visuelle Richtung (stilunabhängig)
Die neue Richtung des Designers muss das Motion-System nicht neu erfinden, nur diese Regler setzen:

| Regler | Spielraum | Beispiel |
|---|---|---|
| **Tempo** | alle Dauern × 0,85 … 1,2 (Verhältnisse bleiben) | „sportlich-knackig“ 0,85 · „entspannt-sommerlich“ 1,1 |
| **Federung** | `spring-soft` zwischen ζ 0,65 und 0,85; `spring-bouncy` zwischen ζ 0,45 und 0,6 | eckig-grafische Richtung: weniger Feder; runde, weiche Richtung: mehr |
| **Feier-Material** | Konfetti-Formen (Rechteck, Kreis, Sonnenstrahl, Wellen-Strich …) und **Farben aus semantischen Tokens** (`--ww-color-accent`, `--ww-color-sun`, `--ww-color-primary`, `--ww-color-primary-tint`) | Reiseplakat: Sonnenstrahlen + Kreise; Collage: Papierschnipsel |
| **Illustrations-Ebenen** | welche SVG-Ebenen sich beim Eintritt bewegen (§5.5) | Sonne geht auf, Kalender kippt ein |

Alles andere (Energie-Stufen, Choreografie, Reduced Motion, Performance) bleibt richtungsunabhängig.

### 3.7 Reduced-Motion-Werte (Ergänzung zu tokens.css §5)

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    /* bestehend: duration-instant … celebrate → 0.01ms, ease-spring → linear,
       motion-scale-press → 1, motion-distance → 0px */
    --ww-duration-moderate: 0.01ms;
    --ww-duration-confetti: 0ms;          /* Konfetti wird gar nicht erzeugt (JS prüft) */
    --ww-duration-fade: 140ms;            /* bleibt! Überblenden ist erlaubt (ux-spec §7.1) */
    --ww-ease-spring-soft: linear;
    --ww-ease-spring-bouncy: linear;
    --ww-motion-distance-sm: 0px;
    --ww-motion-distance-lg: 0px;
    --ww-motion-scale-cell: 1;
    --ww-motion-scale-enter: 1;
    --ww-motion-scale-pop: 1;
    --ww-stagger-cell: 0ms;
    --ww-stagger-item: 0ms;
    --ww-stagger-card: 0ms;
  }
}
/* Gleiche Werte zusätzlich unter :root[data-motion="reduce"]
   (In-App-Schalter, falls vom Auftraggeber gewünscht – §6.3) */
```

## 4. Energie-Stufen – wie viel Bewegung wo

Jede Interaktion im [Katalog](interaktionen.md) trägt eine Stufe. Sie verhindert, dass sich kleine Effekte summieren.

| Stufe | Name | Dauer | Erlaubt | Wo |
|---|---|---|---|---|
| **E0** | Ruhig | ≤ 140 ms | nur Überblenden, ein einmaliges Wackeln bei Fehler im Code-Feld | Login/Code (W02), Formulare (W05, W12, W13), Rechtstexte, Hilfe (W15), Fehler (W14), destruktive Dialoge |
| **E1** | Antwort | 80–220 ms | Eindrücken, Zustandswechsel, kleiner Pop von Symbolen | Buttons, Zellen, Segmente, Chips, Checkboxen |
| **E2** | Übergang | 220–320 ms | Gleiten, Überblenden, FLIP, Staffeln (≤ 400 ms gesamt) | Seiten, Tabs, Sheets, Toasts, Listen, Heatmap-Aufbau |
| **E3** | Belohnung | 480–700 ms, einmalig | kleines Siegel mit Feder, Welle über Zellen, Band zeichnen | Beitritt (F-003), Abgabe (F-005), Vorschlag im Kalender (F-009), Abstimmung gestartet (F-010), alle Stimmen abgegeben (F-011) |
| **E4** | Feier | Kern ≤ 1 s, Ausklang ≤ 2,6 s | Siegel groß, Konfetti, Phasen-Leiste schließt | **nur** „Termin steht fest“ (F-012) |

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
Illustrationen bewegen sich **nur beim Eintritt** (einmal), nie in Schleife. Animierbar sind Ebenen (Sonne, Kalenderblatt, Siegel, Konfetti, Freunde), die der Designer als Gruppen mit `data-anim`-Attribut auszeichnet ([abstimmung.md](abstimmung.md) M-D3). Texte, Headline und Haupt-Button erscheinen **ohne Verzögerung** – Illustrationen bauen sich dahinter/daneben auf, nie davor.

### 5.6 Unterbrechbar
Jede Animation darf jederzeit von einer neuen Eingabe abgelöst werden: Klick während eines Austritts wirkt auf den neuen Zustand, Ziehen eines Sheets stoppt dessen Animation an der aktuellen Position, Tippen/Scrollen beendet Konfetti und Geste-Hinweis. Keine Animation setzt `pointer-events: none` auf bedienbare Inhalte.

### 5.7 Erfolg nicht vortäuschen
Belohnungen (E3/E4) starten erst nach Server-Bestätigung (Termin festgelegt, Beitritt erfolgt). Optimistische Aktionen (Tag setzen, Stimme) bekommen nur E1-Feedback; scheitert das Speichern, gibt es keinen „Rückwärts-Effekt“, sondern den Status „Nicht gespeichert“ (design-system §9.13).

### 5.8 Einmal ist genug
E3/E4-Momente und Eintritts-Choreografien (Heatmap-Aufbau, Karten-Staffel, Hero) laufen **einmal pro Sitzung bzw. pro Ereignis**; bei Zurück-Navigation und erneutem Öffnen erscheint alles sofort. Merker: `sessionStorage` (Aufbau-Effekte) bzw. `localStorage` (Feier je Reise und Person, kein Cookie).

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
| **2.2.2 Pausieren, Stoppen, Ausblenden** | Nichts bewegt sich automatisch länger als 5 s: Konfetti ≤ 2,6 s, Geste-Hinweis ≤ 3 s und einmalig, Skelett-Pulsieren max. 4 Zyklen (≈ 4,8 s) dann statisch, Caret im Code-Feld blinkt max. 5 s. Keine Endlos-Loops (auch nicht in Illustrationen). |
| **2.3.1 Drei Blitze** | Keine großflächigen Hell-Dunkel-Wechsel, kein Aufblitzen des Hintergrunds, nichts flackert > 3 Hz. Konfetti-Teilchen sind klein (≤ 10 px) und bedecken < 10 % der Fläche. |
| **2.3.3 Animation durch Interaktion** (AAA, Projekt-Ziel) | Alles, was durch Interaktion ausgelöst wird, ist abschaltbar – über die Systemeinstellung und (Empfehlung, §6.3) einen In-App-Schalter. Konfetti stoppt beim nächsten Tippen/Scrollen. |
| Fokus geht nie verloren | Fokus wird **zu Beginn** einer Animation gesetzt, nicht am Ende (Sheet → Überschrift/erstes Feld, Feier → h1 „Es geht los!“). FLIP-Umsortierung bewegt das fokussierte Element mit, ohne es zu ersetzen. Fokusringe werden nie animiert. |
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
| Konfetti | Teilchen | **entfällt**; Siegel + Text „Es geht los!“ tragen den Moment |
| Parallax, Scroll-Effekte | dekorativ | entfallen vollständig |
| Smooth-Scroll | `behavior: 'smooth'` | `behavior: 'auto'` (Sprung) |
| Code-Fehler-Wackeln | 1 × 4 px | entfällt; Fehlertext + Rahmen reichen |
| Spinner | dreht | drei statische Punkte (design-system §9.2) |
| Geste-Hinweis „wischen“ | animierter Finger | statische Skizze + Text |
| Ziehen (Tage, Sheet) | folgt dem Finger | **folgt weiterhin dem Finger** (direkte Manipulation ist keine Animation); nur Einrasten ohne Feder |

### 6.3 In-App-Schalter (Empfehlung, Frage an Auftraggeber)
Viele Menschen wissen nicht, dass es die Systemeinstellung gibt, und im In-App-Browser ist sie schwer zu finden. Empfehlung: In **Konto → Darstellung** (W13) ein Schalter **„Bewegung reduzieren“ / „Reduce motion“** mit drei Werten intern (`system` Standard · `reduce`), gespeichert im Konto + `localStorage`, gesetzt als `<html data-motion="reduce">`. Der Schalter kann Bewegung nur *reduzieren*, nie gegen die Systemeinstellung erzwingen. Aufwand gering (gleiches Muster wie `data-theme` in tokens.css). → [abstimmung.md](abstimmung.md) M-U1, Bericht an CEO.

## 7. Performance-Regeln

1. **Nur `transform` und `opacity` animieren.** Ausnahme mit Begründung: Farbwechsel (`background-color`, `border-color`) an *kleinen* Elementen (Zelle, Chip, Segment) ≤ 140 ms – das ist Paint, kein Layout. Nie animiert: `width/height/top/left/margin/padding`, `box-shadow`, `filter`/`backdrop-filter`, `clip-path` auf großen Flächen. Schatten-Übergänge über ein Pseudo-Element mit Schatten, dessen `opacity` wechselt.
2. **Kein Layout-Lesen in Animationsschleifen.** Messen (FLIP, Zellpositionen) einmal vor der Animation, gebündelt; Zieh-Vorschau per `requestAnimationFrame` und Hit-Test über `document.elementFromPoint` bzw. vorab gemessene Zell-Rechtecke.
3. **Animationsmenge begrenzen.** Heatmap-Aufbau nur für Zellen im Viewport (≈ 35–42 Zellen mobil); Konfetti ≤ 60 Teilchen mobil / ≤ 100 Desktop; Staffeln enden nach `--ww-stagger-max`.
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
| iOS: WhatsApp, Instagram, Facebook, Telegram (WKWebView bzw. SFSafariViewController) | WebKit der installierten iOS-Version | Features wie Safari derselben iOS-Version (`linear()` ab 17.2, `@starting-style` ab 17.5, View Transitions ab 18). `prefers-reduced-motion` folgt der iOS-Einstellung „Bewegung reduzieren“. **Keine Vibration** (`navigator.vibrate` fehlt). Gummiband-Überscrollen: Sheets und Kalender mit `overscroll-behavior: contain`. |
| Android: WhatsApp (oft Chrome Custom Tabs), Instagram/Facebook (Android System WebView) | Chromium, über Play Store aktuell gehalten | Volle Unterstützung; `navigator.vibrate` je nach App-Berechtigung oft wirkungslos → Haptik nur „best effort“. Speicher knapper als im Browser → `will-change` sparsam, Konfetti-Teilchen begrenzt. |
| Alle In-App-Browser | – | Untere Browserleiste blendet beim Scrollen ein/aus → fixierte Leisten, Sheets und Toasts mit `dvh` und `env(safe-area-inset-bottom)`; Animationen, die an die Viewport-Höhe gebunden sind, beim `resize` nicht neu starten. Web Share oft nicht verfügbar → Kopieren-Feedback (G-11) ist der Normalfall. |

### 8.2 Struktur-Vorschlag für den Developer (kein Produktivcode)
- `src/styles/motion.css` – Utility-Klassen auf Basis der Tokens (`.enter-rise`, `.press`, `.fade`), Reduced-Motion-Blöcke.
- `src/lib/motion.ts` – `prefersReducedMotion()` (Media Query + `data-motion`), `animateIfAllowed(el, keyframes, opts)` (liefert bei Reduced Motion sofort den Endzustand), `stagger(els, step, max)`, `flip(container, mutate)`, `celebrate(origin)` (lazy importiert).
- Feier (`celebrate`) per `import()` erst beim Ereignis laden → kein Gewicht im Normalfall.
- Tests: Playwright mit `reducedMotion: 'reduce'` **und** `'no-preference'` für die Kernflows; Snapshot erst nach `document.getAnimations()` = fertig.

## 9. Übergabe an Entwicklung

| Paket | Inhalt | Reife |
|---|---|---|
| **M-0 Grundlagen** | Tokens (§3) in tokens.css (Designer), `motion.css`, `motion.ts`, Reduced-Motion-Weiche | umsetzungsreif nach Freigabe Tokens durch Designer |
| **M-1 Inkrement 1** (F-040–F-042) | Code-Eingabe: Ziffer-Pop, Fehler-Wackeln, Erfolgs-Welle, Schrittwechsel (Prototyp e) | **umsetzungsreif** |
| **M-2 Komponenten** | Button-Press, Toast, Bottom-Sheet inkl. Ziehen/Rasten, Tab-Indikator, Segment-Indikator, Kopieren-Feedback | umsetzungsreif |
| **M-3 Meine Tage** (F-005) | Setz-Feedback, Zieh-Vorschau, Setz-Welle, Undo, Abgabe-Siegel (Prototyp a) | umsetzungsreif |
| **M-4 Gruppe** (F-008/F-009) | Heatmap-Aufbau, Vorschläge-Staffel, Filter-FLIP, „Im Kalender zeigen“ (Prototyp b) | umsetzungsreif |
| **M-5 Abstimmen & Feier** (F-011/F-012) | Stimme, Ergebnis-Enthüllung, Umsortieren, Feier (Prototyp c) | umsetzungsreif; Umsortieren abhängig von M-U3 |
| **M-6 Landing** | Hero-Eintritt, Scroll-Reveal, Parallax (Prototyp d) | umsetzungsreif; Illustrations-Ebenen abhängig von Designer (M-D3) |

## 10. Quellen
- Next.js Doku `viewTransition` (16.x, experimentell): https://nextjs.org/docs/app/api-reference/config/next-config-js/viewTransition
- Motion – Bundle-Größen: https://motion.dev/docs/react-reduce-bundle-size, https://motion.dev/docs/react-lazy-motion
- Can I use – View Transitions: https://caniuse.com/view-transitions, Cross-Document: https://caniuse.com/cross-document-view-transitions
- Chrome Developers – View Transitions: https://developer.chrome.com/docs/web-platform/view-transitions
- Scroll-getriebene Animationen: https://developer.chrome.com/articles/scroll-driven-animations, Status Firefox: https://bugzil.la/1808410
- WCAG 2.2: 2.2.2, 2.3.1, 2.3.3, 2.4.11, 2.5.7 (https://www.w3.org/TR/WCAG22/)

Browser-Versionsangaben aus Can-I-Use/Herstellerdokumentation, Stand Oktober 2026; vor Umsetzung durch Developer kurz gegenprüfen.
