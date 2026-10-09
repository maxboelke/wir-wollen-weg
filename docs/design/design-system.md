# Design-System – Wir wollen weg / When do we go?

Stand: 2026-10-08 · Verantwortlich: Designer · Status: **v1.0 – verbindlich für die Umsetzung** (Richtung B „Reise-Cockpit“, Palette B0 „Indigo & Minze“, Auftraggeber PRD §12 Q18; Q17 Bewegung/Feier/Vibration; CEO-Entscheidungen 2026-10-08 zu D-20–D-35)
Bezug: [PRD](../product/PRD.md) · [Features](../product/features.md) · UX: [ux-spec](../ux/ux-spec.md), [Wireframes](../ux/wireframes/README.md), [abstimmung-design.md](../ux/abstimmung-design.md) · Motion: [motion-system.md](../motion/motion-system.md) · Tokens: [tokens.css](tokens.css) · Assets: [assets/README.md](assets/README.md) · Abstimmung: [abstimmung-ux.md](abstimmung-ux.md) · Entwurf (Archiv): [richtungen/b/richtung-b.md](richtungen/b/richtung-b.md)

> Arbeitsteilung: Struktur und Verhalten regelt die [UX-Spezifikation](../ux/ux-spec.md), Bewegung das [Motion-System](../motion/motion-system.md), das Aussehen dieses Dokument. Begriffe (DE/EN) folgen dem Glossar ux-spec §10.2. **B ändert die Optik, nicht Funktionen, Texte und Barrierefreiheitsregeln.**

---

## Inhalt
1. [Visuelle Richtung](#1-visuelle-richtung)
2. [Design-Prinzipien](#2-design-prinzipien)
3. [Marke: Name, Logo, Wortmarke](#3-marke-name-logo-wortmarke)
4. [Farbe & Kontraste](#4-farbe--kontraste)
5. [Typografie](#5-typografie)
6. [Kalender & barrierefreie Heatmap](#6-kalender--barrierefreie-heatmap)
7. [Raster, Abstände, Radien, Schatten](#7-raster-abstände-radien-schatten)
8. [Motion](#8-motion)
9. [Komponenten](#9-komponenten)
10. [i18n-robuste Layouts (DE/EN)](#10-i18n-robuste-layouts-deen)
11. [Ikonografie & Illustration](#11-ikonografie--illustration)
12. [Prüfprotokoll Barrierefreiheit](#12-prüfprotokoll-barrierefreiheit)
13. [Übergabe, Token-Änderungen, offene Punkte](#13-übergabe-token-änderungen-offene-punkte)

---

## 1. Visuelle Richtung

**Leitidee: „Die Gruppe auf einen Blick.“** Jede Reise hat ein **Cockpit**: oben eine tiefe Indigo-Fläche mit der einen Zahl, die gerade zählt („5 von 7 haben abgegeben“, „noch 3 Tage“, „noch 23 Tage“), darunter ruhige, weiße Karten mit den Details. Farbe bedeutet immer etwas – **Minze** = passt / alle können, **Sonne** = Freude und „Zur Not“, **Lavendel** = Abstimmung und Links, **Koralle** = Feiertag; die Heatmap ist eine Indigo-Rampe. Spaß entsteht durch **sichtbaren Fortschritt** (Ringe füllen sich, Balken wachsen, Kacheln laden zum Antippen ein) und durch einen lauten Moment: den **Vorfreude-Ring**, wenn der Termin feststeht.

„Cockpit“ passt doppelt: Dashboard-Klarheit einer guten Finanz-App (Prinzipien von Finanzguru, vom Auftraggeber gewünscht; die Nähe ist bewusst akzeptiert, Q18) und Reisegefühl (Abendhimmel über dem Meer). Die Bildmarke „Sonnenkalender“ bleibt die Idee der Marke.

| Achse | Wir sind … | … und nicht |
|---|---|---|
| Ton | klar, freundlich, motivierend – „Noch 2 fehlen, dann habt ihr's!“ | kühl, technisch, Banken-Sprech |
| Farbe | Indigo-Nacht, Minze, Sonne, Lavendel auf zartem Nebel | Neon-Türkis, Regenbogen, Rot als Stimmungsfarbe |
| Form | weiche Karten, Kacheln, Ringe, runde Balken, **keine Konturen** | Aufkleber-Konturen, Glas, 3D |
| Details | Ringe füllen sich, Häkchen ploppen, Balken wachsen | Maskottchen, Handschrift, hochzählende Zahlen |
| Vertrauen | Login/Code ruhig auf Hell, ein Brief mit Häkchen | Spielerei bei E-Mail, Code, Datenschutz |

**Übernommen als Prinzip (nicht kopiert):** dunkle, mutige Markenfläche + ein leuchtender Akzent; Kennzahl zuerst, Details in Karten; Diagramme klar und rund; Icons in getönten Kacheln; Persönlichkeit in kleinen Momenten. **Nicht übernommen:** fremde Farbcodes (unser Indigo `#2B2266` ist tiefer, Minze `#52E5B8` grüner), Layouts, Icon-Set, Maskottchen.

**Registrierung & Login (F-040, F-041):** ruhig auf hellem Grund, kein Cockpit-Spektakel – Bildmarke, Reisename, Vorname der Orga als vertrauter Anker, kleine Illustration `code-sent.svg`. Bewegung nur Stufe E0 (Überblenden).

## 2. Design-Prinzipien

1. **Lesbar vor hübsch.** Jede Information steht als Zahl, Text oder Form da – Farbe verstärkt nur (PRD §8). Ringe und Balken sind `aria-hidden`, ihr Wert steht als Text daneben.
2. **Die Zahl zuerst.** Jede Reise-Ansicht beginnt mit dem Cockpit und **höchstens einer** Kennzahl; alles andere liegt in Karten.
3. **Farbe heißt etwas.** Minze = passt/Ja, Sonne = Zur Not/Freude, Lavendel = Abstimmung/Link, Koralle = Feiertag, Indigo = Marke und „alle“. Keine Farbe ohne Bedeutung.
4. **Rot heißt Fehler, nicht „Nein“.** „Geht nicht“ und „Nein“ sind neutral (Nebel/Tinte 2). Kirsche `#B42318` nur für Fehler und Destruktives, immer mit Icon + Text.
5. **Mehr Menschen = mehr Kontrast.** Heatmap hell: je mehr können, desto tiefer das Indigo; dunkel: desto heller, bis Minze.
6. **Keine Konturen – aber immer erkennbar.** Flächen trennen sich über Helligkeit und weiche Schatten; Bedienbares hat volle Fläche oder 2-px-Rahmen; im Kontrastmodus zeigen transparente Rahmen die Flächen (`--ww-border-forced`).
7. **Daumen zuerst.** Mobile first ab 360 px, **jede Tippfläche ≥ 44 × 44 px** (CEO 2026-10-08), Haupt-Aktion unten oder im Cockpit erreichbar.
8. **Minze nie als Text auf Hell.** Minze `#52E5B8` hat auf Weiß nur 1,5 : 1. Als Text auf Hell immer Minze-Text `#00775A`; Minze nur als Fläche mit Indigo-Inhalt oder auf Indigo/Dunkel.
9. **Beide Sprachen sind die Hauptsprache.** Layouts mit dem längeren Text, nie feste Breiten (F-046).
10. **Leicht für In-App-Browser.** Zwei selbst gehostete variable Schriften (≈ 80 KB), SVG statt Bitmaps, keine CDNs.
11. **Feiern einmal – mit dem Vorfreude-Ring.** Zahlen **zählen nicht hoch** (auch nicht der Countdown; CEO, Motion G-16, F-052) – Ringe und Balken dürfen wachsen.

## 3. Marke: Name, Logo, Wortmarke

### 3.1 Zwei Namen, eine Bildmarke (bestätigt, PRD Q11)
| Sprache | Produktname | Hervorhebung | Untertitel (optional) |
|---|---|---|---|
| Deutsch | **Wir wollen weg** | „weg“ | „Gemeinsam den Urlaubstermin finden“ |
| Englisch | **When do we go?** | „go?“ als Einheit (D-19) | „Find dates for your group trip“ |

Regeln aus v0.5 gelten unverändert: Die UI-Sprache bestimmt den Namen (Kopf, `<title>` mit Trenner « · », Startseite, Fehlerseiten); nie beide Namen nebeneinander (Ausnahme Impressum/Datenschutz); Favicon, App-Icon und Ladeanzeige zeigen nur die Bildmarke; Manifest und Open Graph je Sprache (`short_name` = voller Name, CEO U-16); Schreibweise verbindlich in ux-spec §9 und §10.6. Fragezeichen: ASCII „?“, ohne Leerzeichen, gleiche Farbe wie „go“.

### 3.2 Bildmarke „Sonnenkalender“ B0
Gleiche Idee wie Logo A (die Sonne geht im Kalenderblatt über dem Meer auf), neu eingefärbt und **ohne Kontur**: Indigo-Blatt, Sonne `#FFCF4A` mit Schein, Minze-Wellen, Lavendel-Ringe.

| Datei | Einsatz |
|---|---|
| `assets/logo/logo-mark.svg` | helle Flächen |
| `assets/logo/logo-mark-on-brand.svg` | Indigo-Flächen (Cockpit, Reisekarte) und Dunkelmodus: Blatt Violett `#5B48C9`, Ringe weiß |
| `assets/logo/favicon.svg` / `favicon-16.svg` | 32er bzw. 16er Raster, vereinfacht (16 px: gerade Minze-Kante, ganze Pixel); dunkle Browserleiste per `prefers-color-scheme` |
| `assets/logo/app-icon.svg` | 512, vollflächig Indigo + Lichtflecken, Marke auf Indigo, maskable (Inhalt ≤ 185 px von der Mitte) |

Ladezustand: Ebene `sun` steigt auf, `waves` schwingt einmal nach (900 ms, einmal; > 5 s Laden → statisch + „Lädt …“). Schutzraum ½ Markenbreite; Mindestgröße 16 px (Favicon), sonst ≥ 24 px.

### 3.3 Wortmarken
**Plus Jakarta Sans 800, 28 px, −0,02 em**, Box 320 × 72 für DE und EN (kein Layoutsprung beim Sprachwechsel). Hervorhebung hell Lavendel-Text `#5A3FD0` (6,1 auf Nebel), dunkel und auf Indigo Minze (11,5 / 8,7).

| Datei | Mindestbreite | Einsatz |
|---|---|---|
| `logo-wordmark.svg` (DE) | 128 px | Kopf außerhalb von Reisen, Footer, Mail-Kopf, OG |
| `logo-wordmark-en.svg` (EN) | 136 px | wie DE |
| `logo-wordmark-en-tagline.svg` | 300 px | W01, OG-Bild EN, Mail-Kopf – nie im Kopf |
| `logo-wordmark-on-brand.svg` / `-en-on-brand.svg` | wie oben | Startseiten-Cockpit (Indigo) |

Unter der Mindestbreite nur die Bildmarke. Vor Produktion in Pfade umwandeln (dann Breiten nachmessen). **Landing-Kopf < 375 px** (D-29): Wortmarke + Sprachlink bleiben Text, „Anmelden“ wird Icon-Taste 44 × 44 (`ww-icon-login`, `aria-label` «Anmelden» / «Sign in», Tooltip).

## 4. Farbe & Kontraste

Methode: relative Luminanz nach WCAG 2.x, Kontrast `(L1 + 0,05) / (L2 + 0,05)`, auf eine Nachkommastelle **abgerundet**. Alle Werte gerechnet – Stichprobe im Review mit WebAIM/axe (§12).

### 4.1 Palette hell (Primitive → Semantik)
| Rolle | Hex | Token (Semantik) | Kontrast | Einsatz |
|---|---|---|---|---|
| Grund „Nebel“ | `#F4F2FB` | `--ww-color-bg` | – | Seitenhintergrund |
| Fläche | `#FFFFFF` | `surface`, `surface-raised` | – | Karten, Leisten |
| Vertieft | `#ECE9F7` | `surface-sunken` | – | Segment-Spur, Werkzeug-Kacheln, Deaktiviert |
| Linie | `#E3DFF0` | `border-subtle` | dekorativ | Trennlinien **in** Karten (keine Kartenkontur) |
| Tinte | `#1E1A3D` | `text` | 16,5 Weiß · 14,9 Nebel · 13,8 vertieft | Text |
| Tinte 2 | `#57527A` | `text-muted` | 7,2 · 6,5 · 6,0 | Sekundärtext |
| Tinte 3 | `#6E6992` | `text-subtle` | 5,1 · 4,6 · **nicht auf vertieft** (4,2) | Meta, Platzhalter |
| Rahmen | `#8A86A8` | `border-strong` | 3,4 · 3,1 | Inputs, Optionen, leere Code-Kästchen (1.4.11) |
| **Indigo** | `#2B2266` | `primary`, `cockpit-bg`, `hm-all-bg`, `hm-suggest` | Weiß darauf **13,7** · gegen Nebel 12,4 | Cockpit, Haupt-Taste, Heatmap „alle“, Vorschlag-Band |
| Indigo Hover / Gedrückt | `#3A2F86` / `#221B52` | `primary-hover` / `-active` | Weiß ≥ 11 | Tastenzustände |
| **Minze** | `#52E5B8` | `accent`, `cockpit-accent`, `seal-bg` | Indigo darauf **8,7** · gegen Weiß **1,5** | Taste auf Indigo, Siegel, Ring, Fortschritt im Kopf. **Nie Text auf Hell** |
| Minze tief | `#1FBF94` | – | dekorativ | zweite Welle Logo/Illustration |
| Minze-Text / Minze-100 | `#00775A` / `#D9F8EC` | `accent-text`, `success-*`, `vote-yes-*`, `avail-yes-*` | 5,5 Weiß · 5,0 Nebel · 4,9 auf Minze-100; Tinte auf Minze-100 14,6 | „Geht“, „Ja“, „Gespeichert“ |
| Lavendel-Text / -100 | `#5A3FD0` / `#ECE6FF` | `link`, `primary-text`, `info-*`, `phase-vote-*` | 6,8 Weiß · 6,1 Nebel · 5,6 auf Lavendel-100 | Links, Text-Tasten, Abstimmung |
| Lavendel 200 / 300 | `#D6CFFA` / `#A79AF2` | `hm-few-bg` / `hm-some-bg` | Tinte 11,1 / 6,7 | Heatmap, Illustration, Phasen-Punkt |
| Violett | `#5B48C9` | `hm-many-bg` | Weiß 6,5 | Heatmap „viele“ |
| **Sonne** | `#FFCF4A` | `sun`, `rank-bg`, `phase-fixed-bg` | Tinte 11,2 · Indigo 9,3 | Platz 1, aktueller Schritt, Krone, Logo-Sonne |
| Sonne-100 / -200 / -Text | `#FFF3CC` / `#FFDB73` / `#7A5200` | `avail-maybe-*`, `vote-maybe-*`, `warning-*` | Tinte 14,9 / 12,3 · Sonne-Text auf 100: 6,2 | Zur Not, Vielleicht, Warnung |
| Koralle | `#F0503F` | `hm-holiday`, `holiday-mark`, `todo-bar` | 3,5 Weiß · 3,1 Nebel | **nur Nicht-Text**: Eselsohr (immer mit Kerbe) |
| Koralle-100 / -Text | `#FFE4DF` / `#A3321F` | `holiday-*`, `todo-*` | 5,7 | Feiertags-Chip, To-do |
| Nein | `#ECE9F7` / `#57527A` | `vote-no-*` | 6,0 | „Nein“, „ohne Jonas“ – neutral |
| Geht nicht | `#DDD9EA` + Kreuzschraffur `#ABA7BD` | `avail-no-*` | Tinte 11,9 / auf Linie 7,0 | Meine Tage |
| Kirsche | `#B42318` / Tönung `#FDE7E4` | `danger`, `danger-tint` | 6,5 Weiß · 5,9 Nebel · 5,5 auf Tönung | **nur** Fehler, immer Icon + Text |
| Fokus | `#2B59C3` | `focus` | 6,3 Weiß · 5,7 Nebel | Ring 3 px + Hof 2 px; **auf Indigo weiß** (`focus-on-brand`, 13,7) |

### 4.2 Dunkel „Mitternacht“ (folgt nur dem System; `[data-theme]` für Tests)
Grund `#14112E` (L 0,0075) · Fläche `#1F1A45` (L 0,0146) · erhöht `#2A2458` (L 0,0246) · vertieft `#191538`.

| Rolle | Wert | Kontrast (Grund / Fläche / erhöht) |
|---|---|---|
| Text | `#F3F1FF` | 16,3 / 14,5 / 12,6 |
| Text 2 / 3 | `#B9B4DC` / `#9C97C4` | 9,2 / 8,2 / 7,1 · 6,6 / 5,9 / 5,1 |
| Rahmen | `#7D77AD` | 4,4 / 3,9 / 3,4 |
| Links, Primär, „Ja“, Auswahl | Minze `#52E5B8` | 11,5 / 10,2 / 8,9 |
| Haupt-Taste | Minze, Text `#14112E` | 11,5 |
| Ja-Fläche | `#133C3B` mit Minze 7,6 · Text 10,8 | |
| Zur-Not-Fläche | `#3A3113` / Streifen `#5A4A17` mit `#FFDB73` | 9,6 / 6,4 |
| Nein / Geht nicht | `#2E2860` mit `#D9D5F2` 9,2 · Text auf Kreuzschraffur `#4A4290` 7,6 | |
| Lavendel | `#2E2566` mit `#C3B8FF` | 7,3 |
| Feiertag | Chip `#4A1F1A` / `#FFB4A8` 8,2 · Eselsohr `#FF8A7A` gegen Fläche 7,0 | |
| Fehler | `#FF8A80` | 7,1 auf Fläche · 6,4 auf Tönung `#431B2A` |
| Fokus | `#8FB3FF` | 8,7 / 7,7 |
| Cockpit | `#221B52` + Lichtflecken | hebt sich nur 1,1 : 1 ab – Trennung über Rundung und Inhalt (im Review am Gerät prüfen) |

Dunkel-Regeln: Ebenen über hellere Flächen statt Schatten; gewählte Karte über 2-px-Minze-Rahmen; kein reines Schwarz, kein reines Weiß für Fließtext.

### 4.3 Cockpit-Farben
| Element | Hell | Dunkel | Kontrast |
|---|---|---|---|
| Fläche | Indigo `#2B2266` | `#221B52` | – |
| Lichtflecken | Minze 22 % oben rechts, Lavendel 30 % oben links, **feste Höhe 96 px** (`--ww-cockpit-image`) | 18 % / 22 % | enden in der Kopfzeile – **nie unter Tabs oder Kennzahl-Box** (D-23) |
| Text | Weiß | Weiß | 13,7 auf Indigo, ≥ 8,4 am hellsten Fleck |
| Text 2 | `#CFC9F2` | `#CFC9F2` | 8,7 auf Indigo · 6,5 auf Tab-Spur · **6,9 in der Kennzahl-Box** · 9,8 dunkel |
| Tab-Spur / Kennzahl-Box / runde Tasten | Weiß 10 % / 8 % / 12 % | gleich | – |
| aktiver Tab | weiße Pille, Indigo-Text | `#F3F1FF`, `#14112E` | 13,7 / 16,3 |
| Akzent | Minze, Inhalt Indigo | Minze, Inhalt `#14112E` | 8,7 / 11,5 |

### 4.4 Farbregeln
- Haupt-Taste (Indigo-Fläche hell, Minze dunkel und im Cockpit) **höchstens einmal** pro Bildschirm.
- Sonne nur für Platz 1, Krone, aktueller Schritt, Logo, Zur Not/Vielleicht und Warnung.
- Koralle nur Feiertag und To-do-Hinweis („du bist dran“) – nie Fehler.
- **Avatare:** 8 Pastelltöne `#FFD3C7` `#C9DBFF` `#D4F2B0` `#DCD3FF` `#FFE7A3` `#BDEFE0` `#FFCFE6` `#EADFCF` (`--ww-avatar-1…8`), in beiden Modi gleich, bedeutungslos (Hash der Mitglieds-ID); Initialen Tinte ≥ 10 : 1.

## 5. Typografie

### 5.1 Schriften (beide SIL OFL 1.1, selbst gehostet)
| Rolle | Schrift | Token |
|---|---|---|
| Titel, Kennzahlen, Kalenderzahl, Code, Countdown, Wortmarke | **Plus Jakarta Sans** variabel, wght 500–800 | `--ww-font-display`, `--ww-font-numeric` |
| UI, Fließtext, Labels, Tasten, Tabs | **Figtree** variabel, wght 400–800 | `--ww-font-sans` |
| Fallback | Systemschrift | `--ww-font-system` |

`@font-face`-Vorgabe für den Developer (Dateien unter `public/fonts/`, Subset Latin + Latin Extended, `OFL.txt` mitliefern, `<link rel="preload" as="font" crossorigin>` für beide):
```css
@font-face { font-family: "Figtree"; src: url("/fonts/figtree-var.woff2") format("woff2");
  font-weight: 400 800; font-style: normal; font-display: swap; }
@font-face { font-family: "Plus Jakarta Sans"; src: url("/fonts/plus-jakarta-sans-var.woff2") format("woff2");
  font-weight: 500 800; font-style: normal; font-display: swap; }
```
Budget ≈ 80 KB. Für ruhigen Font-Swap Fallback-`@font-face` mit `size-adjust` (Capsize/Fontaine). Die `@font-face`-Regeln gehören in `src/styles/` (nicht in tokens.css, damit die Pfade relativ zur App stimmen).

**Ziffernbreite prüfen (Pflicht im Build):** Kalender, Kennzahlen, Code-Feld und Countdown nutzen `font-variant-numeric: tabular-nums`. Testzeichenkette „1111 / 0000“ in Plus Jakarta Sans 800 rendern – sind die Breiten ungleich (kein `tnum` im Subset), `--ww-font-numeric` auf Figtree umstellen und dem Designer melden.

### 5.2 Skala
| Token | Größe | Schrift / Gewicht | Einsatz |
|---|---|---|---|
| `--ww-text-display` | 32 → 56 px, Zeile 1,08, −0,03 em | Jakarta 800 | Startseiten-Headline, „Es geht los!“ |
| `--ww-text-3xl` | 26 → 32 px, 1,12, −0,025 em | Jakarta 800 | H1 Seitentitel (Reisekarte 28) |
| `--ww-text-2xl` | 21 → 24 px | Jakarta 800 | Reisename im Cockpit (1 Zeile, „…“), Ergebnis-Datum |
| `--ww-text-xl` | 19 px, −0,015 em | Jakarta 800 | H2, Datumsbereich auf Karten |
| `--ww-text-lg` | 17 px | Figtree 700 | Tasten, Lead |
| `--ww-text-md` | 16 px, 1,45 | Figtree 400–500 | Fließtext, **alle Inputs** |
| `--ww-text-sm` | 14 px | Figtree 600–800 | Labels, Tabs, Hilfetext |
| `--ww-text-meta` | 13 px | Figtree 600–700 | Tags, Phase im Kopf, Meta |
| `--ww-text-xs` | 12 px | Figtree 600 | nur Kalenderdatum, Legende |
| `--ww-text-kpi` / `-kpi-lg` | 16 / 20 px | Jakarta 800, tabular | Kennzahl-Satz / Kennzahl-Kacheln |
| `--ww-text-countdown` | 46 px | Jakarta 800, tabular | Zahl im Vorfreude-Ring |
| `--ww-text-code` | 26 px | Jakarta 800, tabular | Code-Feld |

Regeln: `text-wrap: balance` für Überschriften, `pretty` für Fließtext, max. 65ch, keine Versalien außer Mini-Labels, nie unter 12 px. Textvergrößerung 200 %: Heatmap → Tagesliste (§6.8), Meine Tage bleibt Raster.

## 6. Kalender & barrierefreie Heatmap

### 6.1 Zellmaße und Anatomie
**Mobil (U-1, CEO bestätigt 2026-10-08):** Rand **8 px gesamt** je Seite (Kalender-Karte 4 px vom Bildschirmrand + 4 px Innenrand, `--ww-size-cal-card-gutter-sm` / `-card-pad-sm`), Spaltenfuge **4 px** → Zelle **(360 − 16 − 24) / 7 = 45,7 px** breit (320 px: 41 px, darunter nur in Extremfällen; Mindestwert `--ww-size-cal-cell-min-w` 44 px gilt ab 360 px). Höhe **46 px**, Zeilenfuge **9 px** (trägt das Vorschlag-Band) – Zeilenraster 55 px wie v0.5 (52 + 4). Radius 11. Ab 600 px: Rand 16 px, Zellen bis 64 px hoch.

Die Anatomie aus v0.5 bleibt (feste Orte, CEO U-1/U-2/U-4), in 45,7 × 46 px geprüft:

| Element | Ort | Maß mobil / ≥ 600 px |
|---|---|---|
| Datum (+ Heute-Ring) | oben links, 5 px / 6 px Abstand | Figtree 12/600 · Ring Ø 18 px, 1,5 px `currentColor` |
| Feiertag (Eselsohr) | Ecke oben rechts | Dreieck 13 px in Koralle + Kerbe 18 px in Kartenfarbe (`--ww-hm-holiday-edge`) |
| Zählwert „x/n“ | Mitte, Oberkante 20 px | Jakarta 14/800 tabular (15 ab 600 px) |
| ◐ Zur Not | unten links, 5 px | Ø 11 px (ab 600 px „◐2“) |
| Siegel „Alle: Geht“ | unten rechts, 3 px | Ø 16 px (ab 600 px 18 px), nur bei x = n |
| Pegel (4 Segmente) | Unterkante innen | nur ≥ 600 px |
| Ausgewählt | innen | Doppelrahmen 2 + 2 px (`--ww-selected-ring`) |
| Fokus | außen | `--ww-focus-ring-isolated` (Hof 2 + Ring 3 + Hof 2), `z-index: 1` |
| Vorschlag | Zeilenfuge darunter | Band 4 px, Endkappen 4 × 9 px |

Zählwert-Regel unverändert: mobil „x/n“ bis n ≤ 9, ab 10 nur „x“; ≥ 600 px immer „x/n“; Zahl = Anzahl **„Geht“** / abgegeben (U-4); zugänglicher Name immer „x von n Geht …“.

### 6.2 Heatmap-Stufen – „Indigo-Rampe“ (F-008)
Score s = (geht + ½ · zur Not) / abgegeben. Stufen und Siegel-Regel wie v0.5 (Siegel ⇔ x = n ⇔ Stufe „alle“; ✓ und ◐ schließen sich aus). Gruppen der Vorschläge: „Alle dabei“ / „Fast alle dabei“ mit Strich-Häkchen `ww-icon-check` bzw. `ww-icon-users` – **nicht** dem Siegel (U-14).

| Stufe | Bedingung | Hell: Fläche / Vordergrund | Kontrast | Dunkel: Fläche / Vordergrund | Kontrast | Zusatz-Kodierung |
|---|---|---|---|---|---|---|
| keine Daten | niemand abgegeben | transparent, gestrichelt `#8A86A8` / `#57527A` | 7,2 (Rahmen 3,4) | gestrichelt `#7D77AD` / `#B9B4DC` | 8,2 (3,9) | „–“ |
| niemand | s = 0 | `#EEECF5` + Schraffur 45° `#C9C6D4` / Tinte | 14,1 (Linie 9,8) | `#221C4A` + `#3A3370` / `#F3F1FF` | 14,1 (9,9) | Schraffur |
| wenige | 0 < s < 0,5 | `#D6CFFA` / Tinte | 11,1 | `#362C7A` / `#F3F1FF` | 10,4 | Zahl |
| einige | 0,5 ≤ s < 0,75 | `#A79AF2` / Tinte | 6,7 | `#5B48C9` / Weiß | 6,5 | Zahl |
| viele | 0,75 ≤ s < 1 | `#5B48C9` / Weiß | 6,5 | `#A79AF2` / `#14112E` | 7,4 | Zahl |
| alle | s = 1 | `#2B2266` / Weiß | 13,7 | Minze `#52E5B8` / `#14112E` | 11,5 | Zahl + **Siegel** (hell Minze mit weißem Ring, Minze gegen Zelle 8,7; dunkel Mitternacht-Kreis mit Minze-Haken) |

Luminanz monoton (hell 0,85 → 0,66 → 0,38 → 0,11 → 0,03) → Graustufen und Farbfehlsichtigkeit behalten die Reihenfolge; Nachbarstufen Fläche zu Fläche 1,2–2,6 – wie bisher nicht alle ≥ 3 : 1, die Information steckt in Zahl, Schraffur, Siegel und ◐ (1.4.1 erfüllt). Pflicht-Simulation im Review (§12). Referenz: `assets/heatmap/heatmap-legend.svg`.

### 6.3 Markierungen
| Zustand | Darstellung | Kontrast |
|---|---|---|
| Wochenende | Lavendel-Spur 16 % (dunkel 8 %) hinter Sa/So in Fugen und Kopf, Kopf-Label 800 in `text` | Label trägt die Info |
| Feiertag | Eselsohr Koralle **mit Kerbe** in Kartenfarbe; Name im Tagesdetail und im zugänglichen Namen | 3,5 hell / 7,0 dunkel gegen Kerbe |
| Heute | Ring 1,5 px `currentColor` um das Datum | wie Zelltext |
| Ausgewählt | Doppelrahmen innen: 2 px `hm-selected-outer` + 2 px `hm-selected-inner` | ein Ring ≥ 3 : 1 gegen jede Stufe |
| Fokus | Ring außen mit beidseitigem Hof | 5,7 hell / 8,7 dunkel |
| Vorschlag | **Indigo-Band** (dunkel Minze) 4 px in der Zeilenfuge, Endkappen nur an An-/Abreisetag, an Umbrüchen offen | 13,7 gegen Weiß / 10,2 dunkel |
| Außerhalb / vergangen | ohne Fläche, Datum `hm-outside-fg` | 3,4 / 3,9 |

„Alle können“ und „Vorschlag“ teilen die Markenfarbe – gewollt: der beste Zeitraum ist der indigofarbene. Referenz: `heatmap-markers.svg`.

### 6.4 Meine Tage (F-005)
| Zustand | Hell | Dunkel | Muster | Symbol |
|---|---|---|---|---|
| Geht (Standard) | `#D9F8EC` (Tinte 14,6) | `#133C3B` | glatt | **keines in der Zelle** (D-2.1) |
| Zur Not | `#FFF3CC` + Streifen `#FFDB73` (14,9 / 12,3) | `#3A3113` + `#5A4A17` | Sonnenstreifen 135°, 6/12 px | ◐ auf Plakette |
| Geht nicht | `#DDD9EA` + Kreuzschraffur `#ABA7BD` (11,9 / 7,0) | `#2E2860` + `#4A4290` | Kreuzschraffur 1,5/7 px | ✕ auf Plakette |

Plakette: Kreis 22 px in der Grundfarbe, 1,5-px-Ring `--ww-avail-plaque-ring`, Symbol 13 px; das Datum sitzt bei gemusterten Zellen auf einem kleinen Schild in Grundfarbe (Radius 5). Interaktionszustände aus v0.5 unverändert: Zieh-Vorschau (gestrichelter 2-px-Umriss `cal-preview-border`), Bereichsmodus-Anker (Punkt 8 px + Ring), schreibgeschützt (voll farbig, Leiste ersetzt durch Schloss-Hinweis), Setz-Feedback (Fläche sofort, Zelle federt `scale-cell` → 1). Referenz: `availability-legend.svg`, Muster `--ww-pattern-*`.

### 6.5 Forced Colors
Flächen und Verläufe verschwinden → Zahl, Symbole, ◐, Siegel als Text bzw. SVG mit eigener Form; „ausgewählt“ `outline: 2px solid Highlight`; Vorschlag `border-bottom: 4px solid CanvasText`; Karten, Kacheln, Tasten, Zellen tragen `border: var(--ww-border-forced)` (transparent → im Kontrastmodus sichtbar).

### 6.6 Tagesliste bei großer Schrift (U-5 / D-15)
Struktur wie v0.5: Zeile = ein Button, Stufenbalken 6 px links (Fläche der Stufe, `aria-hidden`), Zeile 1 Datum (Wochenende 700 + Spur), Zeile 2 „4 von 5: Geht“, Zeile 3 Abzeichen-Chips in fester Reihenfolge (Siegel alle · ◐ n Zur Not · Feiertag · Vorschlag n). In B: Zeilen in einer weißen Karte (Radius 24), Trennlinie `border-subtle`, Chips Pille 13/700 mit Tönungen aus §4, Vorschlag-Chip `hm-suggest-tint` + 2-px-Unterstrich `hm-suggest`. Fokus `--ww-focus-ring`, ausgewählt Doppelrahmen.

## 7. Raster, Abstände, Radien, Schatten

- **Raster:** 4 px. Seitenrand mobil 16 px (Kalender 8 px gesamt, §6.1), ab 600 px 24 px, ab 960 px zentriert (`content-narrow` 640 / `content-wide` 1040).
- **Abstände:** `--ww-space-1` (4) … `--ww-space-16` (64); innerhalb Komponente 8–12, zwischen Komponenten 12–16 (Karten-Stapel 12), Abschnitte 24–32.
- **Radien:** Zelle 11 · Kachel 13 (klein 11) · Code-Kästchen 14 · **Tasten und Inputs 16** (bewusst keine Pille) · kleine Taste 12 · Segment 12 (Spur 16) · **Karte 24** · Reisekarte 26 · Ergebnis-Karte, Sheet, Werkzeugleiste oben 28 · **Cockpit-Unterkante 30** · Chips, Tabs, Balken Pille. Komponenten nutzen die Alias-Tokens (`--ww-radius-card` usw.); die Skala `xs…2xl` wurde angepasst (§13).
- **Schatten (keine Konturen):** `shadow-1` Karte `0 1px 2px` + `0 14px 30px −18px` Indigo 38 % · `shadow-2` Hover/schwebend · `shadow-3` Sheet, Toast, Ergebnis-Karte · `shadow-button` unter Indigo-Tasten · `shadow-button-accent` unter Minze-Tasten · `shadow-selected` gewählter Pinsel/Segment · `shadow-sticky-bottom` fixierte Leisten. Dunkel: schwarze Schatten, Ebenen über Helligkeit. **Hover-Schatten als Pseudo-Element** mit wechselnder `opacity` (M-D9), nie `box-shadow` animieren.
- **Größen:** Touch ≥ 44 px überall; Controls 44 (sm) / 48 (md, Inputs, Sekundär) / 54 (lg, Haupt-Taste); Icons 16/20/24; Avatare 24/32/40; Kachel 40 (klein 34).

## 8. Motion

Quelle für Bewegung ist das **[Motion-System](../motion/motion-system.md)**; dieses Kapitel nennt nur die Tokens und die Design-Regeln. Antworten auf M-D1–M-D9: [abstimmung-ux.md §6](abstimmung-ux.md#6-antworten-an-motion-m-d1m-d9).

### 8.1 Tokens (tokens.css §6, Werte = motion-system §3)
| Gruppe | Tokens |
|---|---|
| Dauern | `instant` 80 · `fast` 140 · `base` 220 · `slow` 320 · `moderate` 480 · `celebrate` 700 · `confetti` 1800 · **`fade` 140 (bleibt bei reduzierter Bewegung)** |
| Easing | `standard`, `enter`, `exit`, `emphasized`, `spring-soft` (ζ 0,75), `spring-bouncy` (ζ 0,5, nur Siegel), `spring` (Fallback) – Federn als `linear()` in `@supports` |
| Distanzen / Skalen | `distance-sm` 8 · `distance` 16 · `distance-lg` 24 · `scale-press` 0,97 · `scale-cell` 0,94 · `scale-enter` 0,96 · `scale-pop` 0,6 |
| Staffel | `stagger-cell` 12 · `-item` 40 · `-card` 60 · `-max` 400 ms |

**Regler Richtung B (M-D6):** Tempo 1,0 · Federn unverändert (soft ζ 0,75, bouncy ζ 0,5) · Konfetti: abgerundetes Rechteck 8–9 × 12–15 px (Radius 3), Kreis Ø 10, Sonnenstrahl 11 × 2,5, Vier-Zack-Funkel 12 px; Farben `--ww-confetti-1…5` (Minze, Sonne, Lavendel, Koralle, Weiß). Konfetti fällt über dem Indigo-Cockpit.

### 8.2 Reduzierte Bewegung
Wirkt bei `prefers-reduced-motion: reduce` **oder** `<html data-motion="reduce">` (Konto-Schalter, Q17, §9.20). Dauern ≈ 0, Distanzen 0, Skalen 1, Federn linear, Staffeln 0, Konfetti entfällt (`duration-confetti: 0ms`, JS prüft) – **Überblenden mit `duration-fade` 140 ms bleibt** (M-D2). JS prüft Media Query **und** `data-motion`.

### 8.3 Design-Regeln für Bewegung in B
1. **Zahlen zählen nicht hoch** – Kennzahl, Stimmen, Countdown wechseln sofort (Überblenden erlaubt). Ringe und Balken wachsen per `stroke-dashoffset` bzw. `scaleX`.
2. **Die Feier ist der Vorfreude-Ring** (`countdown-ring.svg`, §9.12): Ring zeichnet sich, Sonnenpunkt reitet mit, Schein hellt einmal auf, Konfetti fällt einmal. Siegel (`seal.svg`) nur für kleine Meilensteine (Beitritt, Abgabe, alle haben abgestimmt).
3. Heatmap-Neuberechnung: Flächen blenden 140 ms über – erlaubte Farbwechsel-Ausnahme (motion-system §7 Regel 1); Zahlen springen.
4. Tasten: gedrückt `scale-press` + Indigo 900 + kleinerer Schatten (Pseudo-Element). Tabs/Segmente: Indikator gleitet (`scaleX`/`translate`, `base`).
5. **Vibration (Q17):** nur Android, best effort (`navigator.vibrate` 10–15 ms), nur beim Start des Ziehens (300 ms halten) und wenn der Vorfreude-Ring/das Siegel schließt; aus bei reduzierter Bewegung; nie Ton, nie einzige Rückmeldung.

## 9. Komponenten

Zustände: **Standard · Hover (`@media (hover: hover)`) · Gedrückt · Fokus (`:focus-visible`) · Deaktiviert · Laden · Fehler**. Fokus überall `--ww-focus-ring` bzw. `outline` 3 px + 2 px Abstand; in dichten Rastern `--ww-focus-ring-isolated`; **auf Indigo** `--ww-focus-ring-on-brand` (weiß), in der Tab-Spur und an Minze-Tasten im Cockpit `--ww-focus-ring-on-brand-isolated` (Hof Indigo + Ring Weiß + Hof Indigo, D-22). Alle konturlosen Flächen tragen `border: var(--ww-border-forced)`.

### 9.1 Tasten
| Variante | Fläche / Text | Rahmen | Einsatz |
|---|---|---|---|
| Primär hell | Indigo / Weiß 13,7, `shadow-button` | – | eine Haupt-Aktion („Fertig – abgeben“, „Reise planen“) |
| Primär dunkel / im Cockpit | Minze / Indigo bzw. `#14112E` (8,7 / 11,5), `shadow-button-accent` | – | „Mitmachen“, „Erinnern“, Haupt-Taste dunkel |
| Sekundär | Weiß / Indigo (dunkel: transparent / `#F3F1FF`) | 2 px `btn-secondary-border` | „Teilen“, „Link kopieren“ |
| Sekundär im Cockpit | transparent / Weiß | 1,5 px Weiß 60 % | „Anmelden“ auf der Landing |
| Text-Taste | – / `primary-text` (Lavendel; dunkel Minze), unterstrichen | – | „Im Kalender zeigen“ |
| Werkzeug-/Blätter-Kachel | `btn-tool-bg` / `btn-tool-fg`, Radius 14 | – | Rückgängig, Zeitraum, ‹ › |
| Destruktiv | Kirsche / Weiß 6,5 | – | nur in Bestätigungsdialogen |
| Destruktiv leise | – / Kirsche | – | „Reise verlassen …“ |

Maße: Haupt-Taste min. **54 px**, Polster 12/22, Radius **16**, Figtree 17/700, Icon 20 + 8 px Abstand. Sekundär 48 px. **Kleine Taste (`btn-sm`) min. 44 px** (Radius 12, 14/700) – auch „Erinnern“ in der Kennzahl-Box (D-20). Breite nie fix, Text darf zweizeilig werden. Hover: `primary-hover`; Gedrückt: `primary-active` + `scale-press`; Deaktiviert: bevorzugt `aria-disabled` + Erklärung, Optik `disabled-bg`/`disabled-text`, kein Schatten; Laden: Spinner 16 px statt Icon, Label „Wird gespeichert …“, Breite springt nicht.

### 9.2 Cockpit-Kopf
**Voll** (oben auf jeder Reise-Ansicht und der Startseite): Fläche `background: var(--ww-cockpit-image), var(--ww-cockpit-bg)`, Unterkante Radius 30, Polster unten 14. Inhalt von oben: Zeile 1 (48 px): runde Icon-Taste Zurück 44 px (Weiß 12 %), Reisename (`text-2xl`, eine Zeile mit „…“) mit **Phasenzeile** darunter (13/600 `cockpit-text-muted`, Phasen-Punkt 8 px vorn, z. B. «Tage sammeln · 5/7 fertig»; nie gekürzt, darf umbrechen), rechts „⋯“ 44 px. Zeile 2: Tab-Spur (§9.4). Zeile 3 (optional, höchstens eine): Kennzahl-Box (§9.3). Kein globaler Header in Reisen.

**Kompakt** (sticky beim Scrollen, B-3): Zeile 1 + Tabs + 8 px = **104 px** (`--ww-size-cockpit-compact-h`), ohne Kennzahl-Box (die scrollt mit dem Inhalt weg, keine Höhen-Animation). Unterkante Radius 30 bleibt, Schatten `shadow-2` sobald gescrollt.

### 9.3 Kennzahl-Box (W09 Gruppe, W07 Übersicht)
Raster: Ring 52 px links (über 2 Zeilen) · Kennzahl-Satz · rechts unten Taste. Fläche Weiß 8 % über Indigo, Radius 20, Polster 10/12, Abstand 12 zu den Tabs. Ring: Spur Weiß 18 %, Füllung Minze, Strich 6 px, runde Enden, Icon `users` 20 px weiß in der Mitte, `aria-hidden`. Satz: Jakarta 16/800 weiß „5 von 7 haben abgegeben“; Zeile 2: 13/500 `cockpit-text-muted` „Noch offen: Kemal, Sara – das Ergebnis kann sich noch ändern.“ (**6,9 : 1**, Lichtflecken liegen nie darunter, D-23). Taste „Erinnern“ = Minze-Taste klein, **44 px** (nur Orga). Je Tab höchstens eine Kennzahl: Übersicht = Phase (P1 Abgabe-Ring, P2 Abstimmungs-Ring + Frist-Text, P3 Mini-Vorfreude-Ring 52 px + „noch 23 Tage“), Gruppe = Abgabe, Meine Tage und Abstimmen = keine im Kopf.

### 9.4 Tabs (Reise-Navigation)
Links mit `aria-current` („Übersicht · Meine Tage · Gruppe · Abstimmen“). Spur **48 px** (Weiß 10 %, Polster 4, Pille), Tab-Pille **44 px** hoch (D-20), Polster horizontal 10, Figtree 14/700 `cockpit-text-muted` (6,5). Aktiv: weiße Pille, Indigo-Text 800 (13,7), Schatten `0 6px 14px −6px` schwarz 45 %. Fokus: `--ww-focus-ring-on-brand-isolated`, Tab `z-index: 1` (sichtbar auch an der weißen Pille). < 375 px oder bei Textvergrößerung: horizontal scrollen, **Verlaufskante** 24 px links/rechts in Cockpit-Farbe nur bei Überlauf, aktiver Tab beim Laden in Sicht (D-33). Indikator gleitet beim Wechsel (`duration-base`).

### 9.5 Kacheln
- **Icon-Kachel:** 40 × 40, Radius 13, getönte Fläche + Icon 22 px in der passenden Textfarbe (`--ww-tile-*`: Lavendel = Zeit/Planung/Abstimmung, Minze = Gruppe/passt, Sonne = Dauer/Freude, Koralle = Feiertag, Brand = Marke). Nie alleinige Information – immer Text daneben.
- **Kennzahl-Kacheln W10** (B-4): zwei weiße Karten nebeneinander (Radius 20, Polster 12, `shadow-1`): Kachel 34 px · Zahl Jakarta 20/800 tabular („noch 3 Tage“, „4 von 7“) · Label 13/500 `text-muted` („bis Do., 15. April“, „haben abgestimmt“). Die Beteiligungs-Kachel ist ein **Button** (ganze Kachel, Chevron rechts, ≥ 44 px) → Sheet „Wer hat abgestimmt?“. Ohne Frist: nur Beteiligung, volle Breite. Frist abgelaufen: Kachel in `warning-*` mit Warn-Icon (nie Rot).
- **„So geht's“ (W01, B-7):** drei Kacheln nebeneinander, wenn der Container ≥ 21,5 em breit ist, sonst Liste (Kachel links, Text rechts) – eine Regel für DE und EN. Titel Jakarta 15/800, max. 3 Zeilen, `hyphens: auto`.

### 9.6 Karten
- **Info-Karte:** `surface`, Radius 24, Polster 16, `shadow-1`, **keine Kontur** (nur `--ww-border-forced`). Trennlinien innen `border-subtle`. Abstand im Stapel 12.
- **Klickbare Karte:** ganze Karte ein Link; Hover `shadow-2` (Pseudo-Element); Gedrückt `scale-press`; Fokus-Ring um die Karte.
- **Reise in „Meine Reisen“ (F-044):** Reisename 19/800 (max. 2 Zeilen), Phasen-Chip (§9.14), Rolle „Orga“ als Chip mit Krone **und Text**, Fortschritt als Balken 6 px (`progress-track`/`progress-fill`) **plus Text** „5 von 7“; To-do-Zeile oben in `todo-*` mit 4-px-Kante links („Deine Tage fehlen noch →“). In Phase 3 Mini-Vorfreude-Ring (`vote-done.svg`) statt Balken.
- **Einladungs-Reisekarte (W03, F-003, D-25):** 196 px hoch, Radius 26, `--ww-gradient-trip-card` + `trip-card-motif.svg`, Schatten `0 22px 40px −22px` Indigo 80 %. Text nur oben links: Label „Gruppenreise“ (13/700 `#CFC9F2`, Icon `plane` in Minze), Reisename Jakarta 28/800 weiß (eine Zeile, „…“), „von Lena“ (**nur Vorname der Orga**). Unten links: **neutrale Avatar-Punkte ohne Initialen** (24 px, Avatar-Töne, Ring 2 px `#3F2F99`, max. 5) + gestrichelter weißer Kreis „+1“ (du) + Text „6 sind schon dabei“ (14/700 weiß). Rechts 80 px frei für die Sonne; nie Text auf Sonne oder Wellen.
- **Ergebnis-Karte (W11, F-012):** `surface`, Radius 28, `shadow-3`, ragt 32 px in das Cockpit. Eyebrow 13/700 `accent-text` mit Häkchen „Termin steht fest“; h1 „Es geht los!“ (`text-display`, Fokusziel bei Orga, M-U10); Datum Jakarta 24/800; **Meta-Zeile mit Countdown als Text** (D-24): „5 Nächte · 7 dabei · noch 23 Tage“ (Icons `nights`, `users`, `clock`; 15/700 `text-muted`). Countdown-Texte: «noch 23 Tage» · «noch 1 Tag» · «Heute geht's los!» · während der Reise «Gute Reise!» (EN «23 days to go» · «1 day to go» · «It's today!» · «Have a great trip!»). Tasten **Mitglied:** Primär „Zum Kalender hinzufügen“ (`calendar-download`), Sekundär „Teilen“. **Orga (D-30):** Primär „Allen Bescheid geben“ (`share`), Sekundär „Zum Kalender hinzufügen“. Darunter Fortschritt in drei Balken (§9.13).

### 9.7 Eingabefelder und Code-Feld
- **Input:** Höhe 48, Radius 16, Rahmen 1,5 px `border-strong`, Fläche `surface`, 16 px Text, Label immer sichtbar darüber (14/700), Hilfe darunter 14 `text-muted`. Fokus: 2 px `selected` + Fokus-Ring. Fehler: 2 px `danger` + Meldung mit Fehler-Icon und Text, `aria-invalid`. Erfolg: Rahmen `accent-text` + Häkchen. Schreibgeschützt: `surface-sunken`, gestrichelt.
- **Code-Feld (F-040/F-041):** **ein `<input>`**, sechs Kästchen rein visuell (Overlay-Technik wie v0.5), Kästchen **48 × 58** (< 380 px: 44 × 54), Radius 14, Abstand 8, nach der 3. Ziffer 16. Ziffern Jakarta 26/800 tabular. Zustände: leer 1,5 px `border-strong` · **gefüllt** Lavendel-100 + 2 px Indigo (dunkel: `primary-tint` + 2 px Minze) · **aktiv** 2 px `selected` + Fokus-Ring + Caret 2 × 26 px (blinkt max. 5 s, reduziert statisch) · markiert (ganzer Wert selektiert) alle Kästchen `primary-tint-strong` · **Fehler** alle Rahmen `danger` + Meldung „Dieser Code stimmt nicht. Noch 3 Versuche.“ (einmaliges Wackeln 4 px, reduziert keines) · **Prüfen** Rahmen `border-subtle`, Spinner + „Prüfe Code …“ · **Erfolg** `accent-tint` + Häkchen-Siegel 20 px · **gesperrt** `surface-sunken`, gestrichelt, Ziffern aus, Schloss + „Zu viele Versuche …“, „Neuen Code senden“ wird Primär-Taste. Darunter „Code erneut senden“ mit Countdown-Text „Neuer Code in 0:27“ (tabular, springt sekundenweise, keine Animation).

### 9.8 Kalenderzelle – Interaktion
Optik §6. Hover (Zeigegerät): Rahmen innen 1 px `border-strong`. Gedrückt/Malen: `scale-cell` 80 ms (reduziert: keine). Deaktiviert: kein Hover, Cursor default. Spaltenkopf 12/700 `text-muted`, Sa/So 800 `text` + Spur. Kalender liegt in einer weißen Karte (Radius 24; mobil 4 px vom Rand, 4 px Innenrand). Monatskopf Jakarta 18/800; **Monats-Sprung-Chips** sichtbar 36 px, Radius 12, `surface-sunken`, aktiv Indigo/Weiß (dunkel Minze/`#14112E`), **Trefferfläche 44 px** über Polster bzw. `::before` (D-20). Feiertagsliste unter dem Monat 13 px `text-muted` mit Eselsohr vorn (U-11).

### 9.9 Werkzeugleiste „Meine Tage“ (W08, D-28, CEO: ≤ 150 px)
Fixiert unten (< 960 px; ab 960 px sticky über dem Kalender). Fläche `surface`, oben Radius 28, `shadow-sticky-bottom`, **kein Griff** (keine Ziehgeste), **kein sichtbares Label** über den Pinseln (nur `aria-label` der Radiogruppe „Was markierst du?“). Aufbau ohne Safe-Area, Polster seitlich 14:

| Zeile | Höhe | Inhalt |
|---|---|---|
| Polster | 8 | – |
| Statuszeile | 16 | links «Entwurf» bzw. leer, rechts Speicherstatus 13/700: «Speichert …» (`text-muted`, Spinner erst nach 400 ms) · «Gespeichert» (✓ `accent-text`) · «✓ Abgegeben · 14:32» · «Nicht gespeichert» (Warn-Icon `warning-text`) + Text-Taste «Erneut versuchen» |
| Abstand | 4 | – |
| Pinsel | ≤ 58 | Spur `surface-sunken`, Radius 18, Polster 3; drei Segmente (Radius 14, Polster 5): Mini-Feld 38 × 22 (Fläche + Muster + Symbol, Ring 1,5 px Tinte 35 %) über Label 14/600 `text-muted`. **Gewählt:** weiße Fläche (dunkel `surface-raised`) + 2 px `selected` + Label 800 `text` + Punkt 8 px `selected` oben rechts + `shadow-selected` – als **ein gleitender Indikator** (M-D7) |
| Abstand | 8 | – |
| Werkzeugzeile | 48 | < 400 px drei Kacheln **44 × 48** (Zeitraum, Rückgängig, Schnellaktionen; Lücke 6) + Haupt-Taste „Fertig – abgeben“ 48 px, füllt den Rest (360 px: ≈ 182 px, einzeilig). ≥ 600 px Zeitraum mit Text |
| Polster | 8 | – |
| **Summe** | **150** | + `env(safe-area-inset-bottom)` |

Zeitraum-Taste (Icon-only < 600 px): `aria-label` + Tooltip «Zeitraum wählen», `aria-pressed`; gedrückt = Indigo-Fläche + weißes Icon (dunkel Minze + `#14112E`) **plus** Hinweiszeile über der Leiste in `info-*` «Jetzt den Start antippen.» + Text-Taste «Abbrechen». Rückgängig deaktiviert: Icon `disabled-text`. Nach Abgabe kompakt (ohne Haupt-Taste).

### 9.10 Gruppe W09: Segment, Filter, Legende, Vorschlag-Leiste, Vorschlagskarte
- **Segment „Vorschläge | Kalender“:** Spur `surface-sunken`, Radius 16, Polster 4, Segmente **44 px** (D-20), Radius 12, 14/700 `text-muted`; aktiv weiß + 2 px `selected` + 800 + `shadow-selected`; Indikator gleitet.
- **Filterzeile** (D-26) unter dem Segment: Chips „Dauer: 5 Nächte ▾“, „Darf fehlen: 1 ▾“, „Personen ausblenden ▾“ – sichtbar 36 px, Trefferfläche 44, Pille, 14/700, `surface` + 1,5 px `border-strong`; **aktiver Filter**: `primary-tint` + 2 px `selected` + Häkchen vorn („✓ 1 ausgeblendet ▾“). Horizontal scrollbar mit Verlaufskante.
- **Legende** als `<details>` (Zustand nach U-6): Kopf „Was bedeuten die Farben?“ + Chevron; Inhalt sechs Mini-Zellen 28 px mit Zahl, darunter Schlüssel (◐ Zur Not · Siegel Alle: Geht · Eselsohr Feiertag · Band Vorschlag) 12,5/600 `text-muted`.
- **Vorschlag-Leiste (B-6, < 960 px, ≤ 120 px + Safe-Area):** fixiert unten, `surface`, Radius 28 oben, **kein Griff**. `[‹]` Kachel 44 · Mitte als Button: Eyebrow 13/700 (Rang-Pille 22 px Indigo/Weiß bzw. Minze/`#14112E` + «Alle dabei · 1 von 5»), Zeitraum Jakarta 19/800, Meta 14/500 «bis zu 5 Nächte · ca. 3 Urlaubstage», höchstens eine Chip-Zeile (Überlauf «+1») · `[›]`. Ende erreicht: Pfeil `aria-disabled`, Icon `disabled-text` auf `surface-sunken` (Form bleibt sichtbar). Ohne Treffer: «Gerade kein passender Zeitraum.» + Text-Taste «Tipps ansehen».
- **Vorschlagskarte (Liste):** Karte Radius 22, Polster 14/16; Gruppenüberschrift Jakarta 17/800 mit `check` in `accent-text` bzw. `users` in `text-muted`, 32 px Abstand zwischen Gruppen; Zeitraum 19/800; Meta mit `nights`/`sun`; Chips „◐ 2× zur Not“ (`vote-maybe-*`), „✕ ohne Jonas“ (`vote-no-*`), „Feiertag inkl. Pfingstmontag“ (`holiday-*`); Text-Taste „Im Kalender zeigen“; Orga-Checkbox „Zur Abstimmung“ 24 px (Radius 7, 2 px `border-strong`; gewählt `selected` gefüllt + Häkchen in `bg`), Trefferfläche 44. Gewählt: 2 px `selected`-Rahmen. Tages-Balken: **nicht im MVP** (U-10/B-5).

### 9.11 Abstimmungs-Segmente (W10, F-011)
Karte (Radius 24): Datum Jakarta 18/800, Meta 14 `text-muted`, Verfügbarkeitszeile 14/700 („8 können · ohne Kemal“), rechts oben **Rang-Chip „Platz 1“ / „Top choice“** (Sonne, Tinte 13/800, Icon `star`, nicht schräg). Darunter drei gleich breite Optionen, **60 px** hoch, Radius 16, Icon 20 **über** Label 14/700, Rahmen 1,5 px `border-strong`, `surface`, `text-muted`.
- **Gewählt:** `vote-selected-bg` (Indigo; dunkel Minze) + `vote-selected-fg` + 800 + `shadow-button` + **Häkchen-Ecke** 22 px oben rechts (Minze mit Indigo-Häkchen, 2-px-Ring `surface`; dunkel `#F3F1FF` mit Indigo) – Fläche + Ecke + Fettung.
- **Unbestätigter Vorschlag** (D-6): 2 px **gestrichelt** `vote-ghost-border`, Icon als Umriss, sichtbares Label „Nein?“ / „Ja?“; darüber 13/700 `text-muted` „Vorschlag aus deinen Tagen“. Zugänglicher Name ohne „?“ (D-34, Developer).
- **Gesperrt:** gewählte Option bleibt gefüllt, übrige ohne Rahmen in `text-muted`, Schloss + „Abstimmung beendet“.
- **Ergebnis** (erst nach eigener Stimme, Orga immer – D-18): Balken 12 px, Pille, Lücke 4: Ja `vote-yes-bar` · Vielleicht `vote-maybe-bar` · Nein `vote-no-bar`, `aria-hidden`; darunter Zahlen 14/800 tabular mit Icons „✓ 4 · ◐ 1 · ✕ 0“. Davor die Zeile „Stimm ab, um das Ergebnis zu sehen.“ (14/400 `text-muted`, keine Platzhalter-Balken). Zeile „Wer hat wie gestimmt?“ mit Trennlinie, Chevron.
- Fokus: `--ww-focus-ring-isolated` je Option; auf der gewählten (Indigo) Option `--ww-focus-ring-on-brand`.

### 9.12 Vorfreude-Ring (Feier, W11, F-012)
Liegt im Cockpit (Höhe ≈ 352 px inkl. Ring) – Grafik `assets/illustrations/countdown-ring.svg`. Ring Ø 156 px (Radius 66, Strich 12, runde Enden), Spur Weiß 14 %, Füllung Verlauf Minze → Sonne (`--ww-ring-start`/`-end`), Sonnenpunkt Ø 18 mit 3-px-Rand in Cockpit-Farbe an der Spitze. Füllgrad = vergangene Vorfreude-Zeit (Festlegung → Abreise); mindestens 4 %, damit der Ring nie leer wirkt. **In der Mitte als HTML** (`aria-hidden`): „noch“ 13/700 `#CFC9F2` · Zahl Jakarta 46/800 weiß tabular · „Tage“. Die Zahl **zählt nicht hoch**; der Countdown steht zusätzlich als Text in der Ergebnis-Karte (§9.6). Konfetti nur beim ersten Öffnen nach Festlegung (für alle Mitglieder, einmal je Person und Festlegung, serverseitig gemerkt); später statischer Ring. Animierbare Ebenen (`data-anim`): `backdrop`, `glow`, `confetti` (`data-piece` 1–12), `track`, `ring` (`pathLength` 100), `knob` (dreht um den Ring-Mittelpunkt), `sparkles` – Zeitleiste: Motion Designer.

### 9.13 Fortschritt & Diagramme
- **Fortschrittsring:** 52 px (Kennzahl), Strich 6, runde Enden; im Cockpit Minze auf Weiß 18 %; auf Weiß Indigo auf `progress-track`. Wert immer als Text daneben.
- **Balken:** 6 px (Karten) bzw. 12 px (Stimmen), Pille, Lücke 4.
- **Drei Schritte (W11):** drei Balken 6 px: erledigt `progress-fill`, aktueller Schritt Sonne + 1,5-px-Innenkante `progress-current-edge` + Label 800 `text`, kommend `progress-track` + `text-muted`; Labels 13/700 mit Icon. Zustand nie nur über Farbe.

### 9.14 Chips, Phasen-Punkt, Tags
- **Status-/Zusatz-Chips** (nicht interaktiv): Höhe 26, Pille, Polster 3/10, 13/700, Icon 15; Tönungen: Ja `vote-yes-*`, Zur Not `vote-maybe-*`, Nein `vote-no-*`, Feiertag `holiday-*` (Eselsohr-Dreieck vorn), Lavendel `info-*`.
- **Interaktive Chips** (Filter): §9.10, Trefferfläche ≥ 44.
- **Phasen-Punkt:** Kreis 8 px vor dem Phasen-Text – Tage sammeln Minze · Abstimmung läuft Lavendel 300 · Steht fest Sonne · Vergangen Tinte 3/`#9C97C4`. Immer mit Text; Punkt ist Zusatz.
- **Phasen-Chip** (Karten außerhalb der Reise): `--ww-phase-*-bg/-fg` + Icon (Kalender / Abstimmung / Häkchen / Uhr) – Kontraste hell 4,9 / 5,6 / 11,2 / 6,0, dunkel 7,6 / 7,3 / 12,4 / 9,2.

### 9.15 Toast
Mobil unten mittig **über** der fixierten Leiste (`bottom: calc(var(--ww-sticky-bar-h) + var(--ww-size-toast-gap) + env(safe-area-inset-bottom))`), Desktop unten links. Breite `min(100% − 32px, 480px)`. Fläche `inverse-bg` (Tinte; dunkel `#F3F1FF`), Text `inverse-text` 15/600 (16,5), Radius 16, `shadow-3`, Polster 12/16, Icon links (Häkchen in Minze, 10,4), Aktion rechts Text-Taste `inverse-link` ≥ 44 px. 4 s, mit Aktion 6 s, pausiert bei Fokus/Hover, `role="status"`. Fehler nie als Toast. Bewegung: steigt `distance` aus der Leiste, reduziert: Überblenden `duration-fade`.

### 9.16 Bottom-Sheet
Tagesdetail, Teilen, Reisemenü, „Wer hat abgestimmt?“, Festlegen. Fläche `surface-raised`, Radius oben 28, **Griff nur hier** (40 × 5, Pille, `border-subtle`; zusätzlich Schließen-Taste 44 px), Titel Jakarta 18/800. Rastpunkte ½ / fast voll, Scrim `--ww-color-scrim`, Safe-Area. Ab 960 px Dialog (max. 480) bzw. Seitenpanel. Tagesdetail: Kopf mit ‹ › (Kacheln 44), Kopfzahl „5 von 7: Geht“ (Jakarta 18/800), Gruppen mit Icon-Kachel 34 px (Geht Minze · Zur Not Sonne · Geht nicht Nebel · Noch offen gestrichelt). Bewegung `slow` + `ease-emphasized`, reduziert Überblenden.

### 9.17 Avatare
Kreis 24/32/40, Pastell (`--ww-avatar-1…8`), Initialen Figtree 800 (10/11,5/13,5 px) in `avatar-fg`, **kein Kontur**, 2-px-Ring in Flächenfarbe (`avatar-ring`). **Orga:** Kronen-Badge 18 px (Kreis Sonne, Krone Tinte 11 px) oben rechts, Ring 2 px – in Listen immer mit Text „Orga“. **Noch offen:** transparent + 1,5 px gestrichelt `avatar-open-border`, Initialen `text-muted`. **Abgegeben:** Minze-Siegel 14 px unten rechts. Stapel −8 px, max. 5 + „+4“ (Pille `surface-sunken`). In der Einladung **ohne Initialen** (§9.6).

### 9.18 Banner & Hinweise
Info/Warnung/Erfolg/Fehler: Fläche `*-tint`, Text `*-text`, Icon links, Radius 16, Polster 12/16. Warnhinweise wie „Jonas kann an diesen Tagen nicht“ in Amber, nie Rot. Offline-Banner Info-Optik unter dem Cockpit. Banner „Der Termin steht fest! [Ansehen]“ in `accent-tint`/`accent-text` mit Siegel 20 px.

### 9.19 Sprachumschalter (D-16, unverändert)
Nicht angemeldet: Ein-Tipp-Taste mit `language` + „English“/„Deutsch“ (14/700; im Cockpit Minze, auf Hell `link`), `lang`-Attribut, ≥ 44 × 44. Angemeldet: im Avatar-Menü. Footer: Segment „Deutsch | English“ (Stil §9.10). Keine Flaggen.

### 9.20 Konto: Karte „Darstellung“ (W13, Q17)
Schalter „Bewegung reduzieren“ / „Reduce motion“, `role="switch"`, Spur 52 × 32 (Trefferfläche ganze Zeile ≥ 44), Knopf 26. **Aus:** Spur `surface-sunken` + 1,5 px `border-strong`, Knopf `border-strong`. **An:** Spur `primary` (Indigo; dunkel Minze), Knopf weiß (dunkel `#14112E`) mit Häkchen. **An durch Gerät (nicht bedienbar):** Optik „an“, zusätzlich Schloss-Icon und Grund darunter 14 `text-muted` («Ist an, weil dein Gerät Bewegung reduziert.»), keine Hover-Reaktion, `aria-disabled`. Fokus `--ww-focus-ring`. Sofortige Wirkung (`data-motion`), Snackbar „Gespeichert“.

## 10. i18n-robuste Layouts (DE/EN)

Regeln aus v0.5 gelten unverändert: keine fixen Textbreiten (nur `min-width` 44 und `max-width`); Layouts mit dem längeren Text, Pseudo-Locale +40 % testen; Umbruch erlauben (Tasten, Chips zweizeilig; Tabs scrollen statt kürzen; `line-clamp` nur für Nutzerinhalte); `lang` korrekt setzen, `hyphens: auto` in schmalen Spalten; `overflow-wrap: anywhere` + `min-width: 0` für Nutzerinhalte; keine Texte in Grafiken (außer Wortmarke); ICU-Plural und `Intl`-Formate; Wochentags-Kürzel zweistellig aus den Übersetzungen (Mo Di Mi … / Mo Tu We …; en-US So-Start), Wochenende bleibt Sa/So; Datumsbereiche über `formatRange` mit Halbgeviertstrich; Reisedauer in Nächten.

Textlängen in B (geprüft, D-35):

| Element | DE | EN | Verhalten |
|---|---|---|---|
| Tabs | Übersicht · Meine Tage · Gruppe · Abstimmen | Overview · My dates · Group · Vote | < 375 px scrollen mit Verlaufskante |
| Phasenzeile | «Abstimmung läuft · 4/7 fertig» | «Voting open · 4/7 done» | umbrechen, nie kürzen |
| Kennzahl-Box | „5 von 7 haben abgegeben“ + 2–3 Zeilen | „5 of 7 have submitted“ | Taste rechts unten, Text bricht um |
| Kennzahl-Kacheln | noch 3 Tage / bis Do., 15. April | 3 days left / until Thu, 15 April | zweizeilig |
| Pinsel | Geht nicht · Zur Not · Geht | Can't · If needed · Works | Label unter Mini-Feld |
| Haupt-Taste W08 | Fertig – abgeben | Done – submit | ≈ 182 px bei 360, einzeilig |
| Rang | Platz 1 | Top choice | Chip wächst, Datum bricht um |
| Countdown Ring / Karte | noch / 23 / Tage · „noch 23 Tage“ | 23 / days / to go · „23 days to go“ | Ring 3 Zeilen HTML |
| Ergebnis | Es geht los! | We're off! | Display, `balance` |
| Reisekarte | Gruppenreise · Lissabon 2027 · von Lena · 6 sind schon dabei | Group trip · … · by Lena · 6 are in | Name einzeilig „…“, Sonne hält 80 px frei |
| Landing-Kopf | Wortmarke + English + Anmelden | Wortmarke + Deutsch + Sign in | < 375 px „Anmelden“ als Icon-Taste |

## 11. Ikonografie & Illustration

**Icons** (`assets/icons/icons.svg`, 50 Symbole): 24er Raster, 2 px Strich (Häkchen/Kreuz 2,6, Chevrons 2,25), runde Enden, `currentColor`, weiche Duoton-Füllung 16 % bei Flächen-Icons. Größen 16/20/24, in Kacheln 22. Alle IDs aus v0.5 gültig; neu `chevron-down`, `arrow-right`, `calendar-plus`, `sun`, `star`, `sparkle`, `chart`, `plane`, `login`. Weitere bei Bedarf im selben Stil oder aus Lucide (ISC) mit Duoton ergänzen.

**Illustrationen** (`assets/illustrations/`): flach, **ohne Kontur**, Lavendel-Kachel (Radius 32) als Grund, max. 5 Palettenfarben, Lichtflecken als halbtransparente Kreise, wiederkehrende Motive Sonne (Kreis + Schein), Minze-Wellen, konzentrische Bögen, Vier-Zack-Funkel, Konfetti als abgerundete Rechtecke. **Produkt als Illustration** (Hero = Übersichtskarte). Keine Figuren, keine Gesichter, kein Maskottchen, keine Texte. Dunkel: eigene Werte über `--ww-illu-*`. Alle dekorativ. Animierbare Ebenen `data-anim` (M-D3) – Liste in [assets/README.md](assets/README.md).

| Datei | Einsatz |
|---|---|
| `hero.svg` | W01 Startseite (unter dem CTA, ragt aus dem Cockpit) |
| `countdown-ring.svg` | W11 Feier – Vorfreude-Ring |
| `vote-done.svg` | kompakter Vorfreude-Ring ohne Cockpit |
| `trip-card-motif.svg` | W03 Einladungs-Reisekarte |
| `seal.svg` | Siegel 20/40/64 (Beitritt, Abgabe, alle abgestimmt) |
| `invite.svg` | Einladung ohne Reisekarte (Mail, Fallback) |
| `code-sent.svg` | W02/W03 Code gesendet |
| `empty-trips.svg` · `empty-nobody.svg` · `no-matches.svg` · `submitted.svg` · `vote-waiting.svg` · `error.svg` · `goodbye.svg` | Leerzustände und Momente (W04, W07/W09, W09, W08, W10, W14) |

## 12. Prüfprotokoll Barrierefreiheit

1. Kontraste §4 und §6.2 stichprobenartig mit WebAIM/axe gegenprüfen – insbesondere Kennzahl-Box (≥ 4,5, gemessen ≈ 6,9), Tab-Spur, Lavendel-Text auf Nebel, Minze-Text auf Minze-100 (4,9).
2. **Minze nie als Text auf Hell** – Code-Suche nach `--ww-mint-400`/`accent` als `color` auf hellen Flächen.
3. Heatmap-Testreise (9 Personen, alle Stufen, Feiertag, heute, Auswahl, Vorschlag mit Umbruch, Fokus) in Protanopie, Deuteranopie, Tritanopie, Achromatopsie: jede Stufe per Zahl (+ Pegel ≥ 600 px), Markierungen per Form.
4. **Forced Colors:** Karten, Kacheln, Tasten, Kennzahl-Kacheln, Zellen sichtbar (Rahmen über `--ww-border-forced`), Auswahl und Vorschlag sichtbar.
5. **Tippflächen ≥ 44 px:** Tabs, Segment, Monats-Chips, Filter-Chips, „Erinnern“, „Anmelden“, Checkbox, Blätter-Pfeile, Werkzeug-Kacheln.
6. Fokus sichtbar: aktiver Tab (Ring mit Indigo-Hof), Minze-Tasten auf Indigo, Zellen, Optionen.
7. Zoom/Text 200 %: keine abgeschnittenen Labels, Heatmap → Tagesliste, Werkzeugleiste nicht fixiert, wenn > 40 % Höhe.
8. Reduzierte Bewegung (System **und** Konto-Schalter): keine Skalierung/Verschiebung, kein Konfetti, Überblenden bleibt; **keine hochzählenden Zahlen** in keinem Modus.
9. Einladung W03 zeigt keine Initialen oder Namen außer dem Vornamen der Orga.
10. Countdown steht als Text in der Ergebnis-Karte.
11. Ziffernbreite (tabular) in Kalender, Code, Kennzahl geprüft (§5.1).
12. Dunkelmodus am echten Gerät: Cockpit-Abgrenzung, Heatmap-Rampe, Siegel.

## 13. Übergabe, Token-Änderungen, offene Punkte

**Bereit zur Umsetzung:** `tokens.css` v1.0 (hell/dunkel, Cockpit, Kacheln, Heatmap, Verfügbarkeit, Abstimmung, Phasen, Siegel, Konfetti, Motion inkl. `data-motion`, Forced Colors), Icon-Sprite (50), Logo/Favicon/App-Icon/Wortmarken, 14 Illustrationen mit `data-anim`, Heatmap-Referenzen, Komponenten §9.

**Token-Änderungen für den Developer** (alle bisher im Code genutzten Token-Namen bleiben erhalten – kein Bruch; die Werte ändern sich):
- **Gleicher Name, neuer Wert (sichtbar):** `--ww-font-sans` (jetzt Figtree vor Systemschrift), `--ww-font-display` (Plus Jakarta Sans), `--ww-font-weight-display` 750 → 800, `--ww-text-lg` 18 → 17, `--ww-text-xl` 20 → 19, `--ww-text-2xl`/`-3xl`/`-display` (größer), `--ww-text-code` 24 → 26, `--ww-leading-normal` 1,5 → 1,45, `--ww-leading-tight` 1,15 → 1,12, `--ww-tracking-tight` −0,01 → −0,02 em, **Radien** `xs` 4 → 6, `sm` 8 → 11, **`md` 12 → 16**, **`lg` 16 → 24**, `xl` 24 → 28, `--ww-size-control-sm` 40 → 44, `--ww-size-control-lg` 56 → 54, `--ww-size-cal-cell-min-w` 40 → 44, `--ww-size-cal-cell-h` 52 → 46, `--ww-size-code-box-h` 56 → 58, `--ww-shadow-*` (Indigo-Schatten), alle `--ww-color-*`.
- **Code-Hinweise:** `.card` in `ui.module.css` – `border` auf `var(--ww-border-forced)` umstellen (keine sichtbare Kontur mehr). Links in `globals.css` nutzen `--ww-color-primary-text` – passt (Lavendel), sauberer ist `--ww-color-link`. `.button`: `border-radius: var(--ww-radius-button)`, `min-height: var(--ww-size-control-lg)`, `box-shadow: var(--ww-shadow-button)`. Fokus im Cockpit mit `--ww-focus-ring-on-brand(-isolated)`.
- **Entfernt (Primitive, im Code nicht genutzt):** `--ww-teal-*`, `--ww-deep-*`, `--ww-sand-*`, `--ww-slate-*`, `--ww-amber-*`, `--ww-red-*`, `--ww-coral-600`, `--ww-mint-200`, `--ww-avatar-light-*`, `--ww-avatar-dark-*`. Ersatz: `--ww-indigo-*`, `--ww-lavender-*`, `--ww-mint-*` (**neue Werte** für 100/300/400/500), `--ww-sun-*`, `--ww-coral-*` (**neue Werte**), `--ww-ink-*`, `--ww-mist-*`, `--ww-night-*`, `--ww-cherry-*`, `--ww-avatar-1…8`.
- **Entfernt (Illustration):** `--ww-illu-teal`, `-teal-dark`, `-teal-light`, `-sea`, `-deep`, `-coral-strong`, `-coral-dark` → neu `--ww-illu-brand`, `-violet`, `-lavender`, `-lavender-light`, `-mint`, `-mint-deep`, `-on-brand` (alle Illustrationen sind neu und nutzen nur diese).
- **Neu:** `--ww-color-on-accent`, `-selected`, `-holiday-*`, `-focus-on-brand`; `--ww-shadow-button(-accent)`, `-selected`; `--ww-btn-*`; `--ww-cockpit-*` + `--ww-cockpit-image`; `--ww-tile-*`; `--ww-progress-*`, `--ww-ring-*`, `--ww-daybar-*`; `--ww-seal-*`; `--ww-confetti-1…5`; `--ww-avatar-fg/-ring/-open-border`; `--ww-avail-plaque-ring`; `--ww-vote-selected-*`, `-tick-*`, `-ghost-border`, `--ww-rank-*`; `--ww-hm-seal-*`; `--ww-phase-*-dot`; `--ww-gradient-trip-card`, `--ww-gradient-ring`; `--ww-focus-ring-on-brand`, `-on-brand-isolated`; `--ww-radius-*` Komponenten-Aliase; Größen (`tile`, `kpi-ring`, `countdown-ring`, `seal-*`, `cal-row-gap`, `cal-card-*`, `toolbar-*`, `suggest-bar-max`, `tab-*`, `cockpit-*`); Motion (`moderate`, `confetti`, `fade`, `ease-emphasized`, `spring-soft/-bouncy`, Distanzen/Skalen/Staffel); `--ww-border-forced`; `--ww-font-system`, `--ww-font-weight-extrabold`, `--ww-text-meta`, `-kpi(-lg)`, `-countdown`, `--ww-tracking-display`, `--ww-space-1-5`, `--ww-z-celebration`.

**Offen:**
1. Wortmarken in Pfade umwandeln, sobald die Fonts eingebunden sind; Mindestbreiten nachmessen.
2. `tnum` in Plus Jakarta Sans im Build prüfen (§5.1).
3. Dunkel-Cockpit und Heatmap am echten Gerät ansehen (Review).
4. Kompakter Kopf (B-3) und Leeren-Zustand der Vorschlag-Leiste sind hier spezifiziert; HTML-Mockups liefere ich nach Bedarf.
5. Aufräumen (CEO/Developer): `logo-mark-a-sonnenkalender.svg` (Alias), `logo-mark-b-weghaken.svg`, `logo-mark-c-treffpunkt.svg` (Archiv) können gelöscht werden.

### Changelog
- **v1.0 (2026-10-08):** Richtung B „Reise-Cockpit“ mit Palette B0 als verbindliches System (Q18). Neu: Leitidee, Prinzipien (Zahl zuerst, keine Konturen, Minze nie Text auf Hell, keine hochzählenden Zahlen), Palette hell/dunkel mit Kontrasten, Cockpit-Farben, Plus Jakarta Sans + Figtree selbst gehostet, Indigo-Heatmap, Komponenten Cockpit-Kopf (voll/kompakt), Kennzahl-Box, Tabs, Kacheln, Karten (Einladungs-Reisekarte ohne Initialen, Ergebnis-Karte mit Countdown-Text und Orga-Variante), Code-Feld, Werkzeugleiste 150 px, Vorschlag-Leiste, Abstimmungs-Segmente, Vorfreude-Ring, Fortschritt, Toast, Sheet, Avatare, Phasen-Punkt, Darstellung-Schalter. Motion-Tokens aus dem Motion-System übernommen (M-D1–M-D9), `data-motion`, Vibration (Q17). CEO-Entscheidungen D-20–D-35 eingearbeitet (Touch ≥ 44, Fokus am aktiven Tab, Kalender 8 px/4 px nach U-1, Werkzeugleiste ≤ 150 px ohne Griff, Lichtflecken nur oben, Countdown als Text, Feier = Vorfreude-Ring). Assets komplett auf B0 umgestellt. v0.5-Abschnitte zu Lagune-Palette, Systemschrift-Fließtext, Logo-A-Farben, Unterstrich-Tabs, Pillen-/12er-Tasten und Teller-Illustrationen ersetzt.
- v0.5 (2026-10-08): Auftraggeber-Entscheidungen Marke (zwei Namen), Logo A, Dark Mode nur System, Figtree.
- v0.4 (2026-10-08): D-14–D-18 (Gruppennamen, Tagesliste, Sprachumschalter, Code-Feld, Ergebnis-Platzhalter).
- v0.3 (2026-10-08): CEO-Entscheide U-1, U-2, U-4.
- v0.2 (2026-10-08): Abgleich mit UX-Spec (D-1–D-13).
- v0.1 (2026-10-08): Erstentwurf.
