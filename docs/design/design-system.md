# Design-System – Wir wollen weg

Stand: 2026-10-08 · Verantwortlich: Designer · Status: Entwurf v0.2 (Phase 0 → M0, abgeglichen mit UX-Spec und `docs/ux/abstimmung-design.md` D-1 bis D-13)
Bezug: [PRD](../product/PRD.md) · [Features](../product/features.md) · [Roadmap](../product/roadmap.md) · UX: [ux-spec](../ux/ux-spec.md), [Wireframes](../ux/wireframes/README.md) · Tokens: [tokens.css](tokens.css) · Assets: [assets/README.md](assets/README.md) · Abstimmung: [abstimmung-ux.md](abstimmung-ux.md)

> Arbeitsteilung: Struktur und Verhalten regelt die [UX-Spezifikation](../ux/ux-spec.md), das Aussehen dieses Dokument. Begriffe (DE/EN) folgen dem Glossar in ux-spec §10.2 („Geht / Zur Not / Geht nicht", „Works / If needed / Can't", „Orga / Organizer").

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
12. [Prüfprotokoll Barrierefreiheit (für Reviewer)](#12-prüfprotokoll-barrierefreiheit-für-reviewer)
13. [Übergabe & offene Punkte](#13-übergabe--offene-punkte)

---

## 1. Visuelle Richtung

**Leitbild: „Reiseplakat trifft Planungswerkzeug".** Flache, ruhige Flächen wie auf einem modernen Reiseplakat (Horizont, Sonne, Meer), aber mit der Klarheit eines guten Werkzeugs. Die App soll sich anfühlen wie die Vorfreude auf den Urlaub, nicht wie ein Reisebüro-Prospekt.

| Achse | Wir sind … | … und nicht |
|---|---|---|
| Stimmung | freundlich, warm, leicht verspielt | kindlich, albern, kitschig (keine Palmen, Flamingos, Emoji-Flut) |
| Vertrauen | aufgeräumt, präzise, ehrlich mit Zahlen | verspielt in Formularen, Login oder Datenschutz |
| Form | weiche Radien, großzügiger Weißraum, klare Kanten im Kalender | Glas-Effekte, starke Verläufe, 3D |
| Farbe | ein klarer Markenton (Lagune), ein warmer Akzent (Abendsonne), sandige Neutrale | Regenbogen, Neon, Rot als Stimmungsfarbe |
| Bilder | eigene, geometrische SVG-Illustrationen in Markenfarben | Stockfotos, generische 3D-Figuren |

**Stimmungsreferenzen (Haltung, nicht Kopiervorlage):**
- Reiseplakate der Bahn/Schweizer Tourismus-Plakate: Flächen, Horizontlinie, wenig Farben.
- Rallly / Cal.com: schlanke, vertrauenswürdige Terminfindung ohne Ballast.
- Airbnb (2023+): Wärme durch Radien, Typo und Off-White statt durch Dekoration.
- Things / Linear: Präzision, Ruhe, klare Zustände.
- GitHub-Contribution-Graph: Heatmap, die man ohne Legende versteht – bei uns ergänzt um Zahlen und Muster.

**Registrierung & Login (F-040, F-041):** Hier tritt das „Urlaubige" zurück: keine Illustration im Formular, nur Bildmarke, Reisename und Organisator der Einladung als vertrauter Anker. Vertrauen entsteht durch Ruhe, klare Hinweise („Wir schicken dir einen 6-stelligen Code") und sichtbaren Datenschutz-Link.

## 2. Design-Prinzipien

1. **Lesbar vor hübsch.** Jede Information im Kalender ist als Zahl oder Symbol lesbar – Farbe verstärkt nur (PRD §8, F-005, F-008).
2. **Rot heißt Fehler, nicht „Nein".** „Geht nicht" und „Nein" sind neutral (Stein-Grau), nicht rot. Niemand soll sich als Spielverderber fühlen; außerdem ist die Palette so frei von Rot-Grün-Konflikten. Rot gibt es nur für Fehler und destruktive Aktionen.
3. **Mehr Menschen = mehr Kontrast.** Die Heatmap wird in Light dunkler, in Dark heller, je mehr Personen können. Ein Prinzip, beide Modi.
4. **Daumen zuerst.** Mobile first ab 360 px, Touch-Ziele ≥ 44 px (Kalenderzellen ≥ 40 × 52 px), Haupt-Aktion unten erreichbar (PRD Prinzip 4).
5. **Beide Sprachen sind die Hauptsprache.** Layouts werden mit dem längeren Text gebaut (meist Deutsch) – nie mit fixer Breite (F-046).
6. **Leicht für In-App-Browser.** Systemschrift für Fließtext, SVG statt Bitmaps, keine externen Font-CDNs (DSGVO, < 2 s auf 4G).
7. **Feiern, wenn es etwas zu feiern gibt.** Dekoration und Bewegung sparsam – mit einer Ausnahme: das Festlegen des Termins (F-012) darf strahlen.

## 3. Marke: Name, Logo, Wortmarke

### 3.1 Name auf Englisch – Empfehlung
**Empfehlung: „Wir wollen weg" bleibt in beiden Sprachen die Marke; Englisch bekommt einen beschreibenden Untertitel.**
- EN-Untertitel (Deskriptor): **„Find dates for your group trip"** (Alternative: „Group trip dates, sorted.").
- DE-Untertitel (optional, z. B. Startseite): „Gemeinsam den Urlaubstermin finden".
- Begründung: (1) eine Marke, ein Logo, eine Domain, ein App-Name – keine doppelten Markenrechte/Domains; (2) die direkte Übersetzung „We want to get away" ist generisch, schwer schützbar und als Name schwach; (3) der deutsche Name ist kurz, eingängig und für eine Gruppen-App mit DACH-Fokus ein Wiedererkennungsmerkmal; (4) englische Texte dürfen den Spruch trotzdem spielerisch aufgreifen (Teilen-Text „We want to get away!", F-002).
- Risiko: Aussprache für Englischsprachige. Gegenmaßnahme: Untertitel immer neben der Wortmarke in EN-Kontexten (Open-Graph, Startseite, Mails).
- **Entscheidung durch Auftraggeber nötig** (siehe Bericht/CEO). Alternative wäre eine Doppelmarke „Let's get away" für EN – nicht empfohlen.

### 3.2 Bildmarken (Logo-Ideen)
| Variante | Datei | Idee | Bewertung |
|---|---|---|---|
| **A „Sonnenkalender" (empfohlen)** | `assets/logo/logo-mark-a-sonnenkalender.svg` | Kalenderblatt, in dem die Sonne über dem Meer aufgeht – Termin + Urlaub in einem Zeichen | Erklärt das Produkt sofort, funktioniert als Favicon (16 px) und App-Icon, ernst genug für Registrierung |
| B „Weg-Haken" | `assets/logo/logo-mark-b-weghaken.svg` | Häkchen, dessen langer Strich als Route zur Sonne weiterläuft – „entschieden, los!" | Sehr dynamisch, eher als Sekundärzeichen (z. B. Erfolgsmeldung F-012) |
| C „Treffpunkt" | `assets/logo/logo-mark-c-treffpunkt.svg` | Drei Wege/Freunde treffen sich an der Sonne am Horizont | Erzählt „Gruppe"; bei 16 px zu kleinteilig – nur groß einsetzbar |

Abgeleitete Dateien (Basis A): `favicon.svg` (32er Raster, vereinfacht), `app-icon.svg` (512 px, maskable-tauglich, Inhalt in der sicheren Zone), `logo-wordmark.svg` (DE), `logo-wordmark-en.svg` (mit EN-Untertitel).

**Regeln:** Schutzraum um die Bildmarke = ½ Markenbreite; Mindestgröße Bildmarke 16 px (nur Favicon), sonst ≥ 24 px; Wortmarke ≥ 120 px breit. Auf dunklem Grund bleibt die Bildmarke unverändert (sie hat eigene Fläche); die Schrift wechselt auf `--ww-color-text`. In der Wortmarke ist „weg" in Markenfarbe abgesetzt – das Wort, um das es geht.
Die Wortmarke liegt als `<text>` mit Figtree vor; **vor Produktion in Pfade umwandeln**, sobald die Schrift final ist (dann unabhängig von installierten Fonts).

## 4. Farbe & Kontraste

### 4.1 Paletten (Primitive, Auszug – vollständig in `tokens.css`)
| Familie | Rolle | Schlüsseltöne |
|---|---|---|
| **Lagune** (Teal) | Marke, Primär-Buttons, Heatmap-Rampe, „geht/Ja" | 100 `#DDF1EE` · 300 `#A6DBD2` · 400 `#5FBFB1` · 500 `#187E73` · 600 `#0E6A68` · 700 `#0A5654` · 800 `#0B4F4A` |
| **Mint / Tiefsee** | Lagune für Dark Mode | Mint 100 `#B5F0E4` · 300 `#6CCFC0` · 400 `#5FC9BA` · Tiefsee 700 `#287268` · 800 `#1D4B46` · 900 `#163B38` |
| **Abendsonne** (Koralle) | Akzent: Vorschlag-Markierung, Feiertag, Illustration | 100 `#FCE6DE` · 300 `#F28A6E` · 500 `#E8694A` · 600 `#D4552F` · 700 `#B23F22` |
| **Sonne** (Amber) | „ginge zur Not / Vielleicht", Warnung, Krone | 100 `#FDF0CF` · 200 `#F1D58C` · 300 `#F2C46B` · 400 `#F4B942` · 600 `#B87A00` · 800 `#7A4E00` |
| **Sand** (warm neutral) | Hintergründe, „geht nicht/Nein", Schraffuren | 0 `#FFFFFF` · 50 `#FBF8F3` · 100 `#F1EEE8` · 150 `#ECE5D9` · 300 `#CFC9C0` · 400 `#A8A196` · 500 `#8A847A` |
| **Schiefer** (kühl neutral) | Text, Linien, Dark-Mode-Flächen | 50 `#ECF1F0` · 300 `#A9B4B2` · 500 `#858C8A` · 650 `#667070` · 700 `#55605F` · 900 `#1C2526` · 950 `#111819` |
| **Rot** | nur Fehler/destruktiv | 100 `#FBE4E1` · 300 `#FF8A80` · 600 `#B3261E` |
| **Blau** | nur Fokus-Ring | 300 `#8FB3FF` · 600 `#2B59C3` |

### 4.2 Semantische Tokens & Kontraste – Light
Methode: relative Luminanz L und Kontrast nach WCAG 2.x, `(L1 + 0,05) / (L2 + 0,05)`, auf eine Nachkommastelle **abgerundet**. Hintergrund `bg` = `#FBF8F3` (L 0,941), `surface` = `#FFFFFF`.

| Token | Wert | auf surface | auf bg | Verwendung / Anforderung |
|---|---|---|---|---|
| `--ww-color-text` | `#1C2526` | 15,6 | 14,7 | Fließtext (AA 4,5 ✔, AAA ✔) |
| `--ww-color-text-muted` | `#55605F` | 6,5 | 6,1 | Sekundärtext ✔ |
| `--ww-color-text-subtle` | `#667070` | 5,1 | 4,8 | Platzhalter, Metadaten ✔ |
| `--ww-color-link` / `primary-text` | `#0A5654` | 8,4 | 8,0 | Links (immer unterstrichen) ✔ |
| `--ww-color-primary` (als Fläche) | `#0E6A68` | – | – | Weißer Text darauf **6,3** ✔; als Text auf bg 6,0 |
| `--ww-color-primary-text` auf `primary-tint` `#DDF1EE` | | | | **7,2** ✔ (gewählte Chips) |
| `--ww-color-accent-text` | `#B23F22` | 5,7 | 5,4 | Akzent-Text ✔; auf `accent-tint` 4,8 ✔ |
| `--ww-color-accent-strong` | `#D4552F` | 4,0 | 3,8 | **nur Nicht-Text** (Vorschlag-Band, Feiertagsecke) – 3:1 ✔ |
| `--ww-color-danger` | `#B3261E` | 6,5 | 6,1 | Fehlertext ✔; weißer Text auf danger 6,5 ✔; auf `danger-tint` 5,3 ✔ |
| `--ww-color-warning-text` | `#7A4E00` | 7,1 | 6,7 | auf `warning-tint` `#FDF0CF` 6,3 ✔ |
| `--ww-color-border-strong` | `#858C8A` | 3,4 | 3,2 | Input-/Chip-Rahmen, 1.4.11 (3:1) ✔ |
| `--ww-color-border-subtle` | `#E4DED4` | – | – | nur dekorativ (Kartentrenner) |
| `--ww-color-focus` | `#2B59C3` | 6,3 | 5,9 | Fokus-Ring (3:1) ✔ |
| `--ww-color-inverse-bg` + Text weiß | `#1C2526` | | | Toast 15,6 ✔ |

### 4.3 Semantische Tokens & Kontraste – Dark
`bg` = `#111819` (L 0,008), `surface` = `#1A2324` (L 0,016), `surface-raised` = `#232E2F` (L 0,025).

| Token | Wert | auf bg | auf surface | auf raised | Anmerkung |
|---|---|---|---|---|---|
| `--ww-color-text` | `#ECF1F0` | 15,7 | 14,0 | 12,2 | ✔ |
| `--ww-color-text-muted` | `#A9B4B2` | 8,4 | 7,5 | 6,5 | ✔ |
| `--ww-color-text-subtle` | `#8F9A97` | 6,1 | 5,5 | 4,8 | ✔ |
| `--ww-color-primary` (Fläche & Text) | `#5FC9BA` | 9,0 | 8,0 | 7,0 | Text darauf `#0B1F1E`: **8,5** ✔ |
| `primary-text` auf `primary-tint` `#163B38` | | | | | 6,1 ✔ |
| `--ww-color-accent-text` | `#F28A6E` | 7,3 | 6,5 | – | ✔ |
| `--ww-color-danger` | `#FF8A80` | 7,8 | 7,0 | – | auf `danger-tint` 6,5 ✔ |
| `--ww-color-warning-text` | `#F2C46B` | 11,0 | – | – | auf `warning-tint` 8,1 ✔ |
| `--ww-color-border-strong` | `#6B7775` | 3,8 | 3,4 | 3,0 | 1.4.11 ✔ (raised knapp – Inputs auf raised mit 1,5 px) |
| `--ww-color-focus` | `#8FB3FF` | 8,6 | 7,6 | – | ✔ |

**Dark-Mode-Regeln:** Ebenen werden durch hellere Flächen statt Schatten getrennt; Schatten nur für Sheets/Toasts. Kein reines Schwarz (`#000`), kein reines Weiß für Text (Blendung). Illustrationen haben eigene Dark-Farben (siehe §11).

### 4.4 Farbregeln
- Primärfarbe max. einmal als volle Fläche pro Bildschirm (Haupt-CTA). Weitere Aktionen: Sekundär/Ghost.
- Koralle ist Signal („schau hier hin": Vorschlag, Feiertag) – nie für Fließtext in Light außer `accent-text`.
- Sonne/Amber ist ausschließlich „ginge zur Not / Vielleicht", Warnung und Krone.
- Avatar-Farben (8 Töne hell/dunkel, `--ww-avatar-*`) tragen keine Bedeutung; Identität = Initialen + Name. Initialen: Light `#1C2526` auf allen 8 Tönen ≥ 9:1; Dark `#ECF1F0` auf allen 8 Tönen ≥ 8:1.

## 5. Typografie

### 5.1 Schriften
| Rolle | Schrift | Begründung |
|---|---|---|
| Fließtext, UI, Zahlen | **Systemschrift** (`--ww-font-sans`: system-ui, SF, Segoe, Roboto …) | 0 KB, sofort da – wichtig in WhatsApp-/Instagram-In-App-Browsern; hervorragende Umlaut-/Ziffern-Qualität; `tabular-nums` überall verfügbar |
| Überschriften, Wortmarke, große Zahlen im Ergebnis | **Figtree** (SIL OFL 1.1), variable, **selbst gehostet** | freundlich-geometrisch, offen, gut lesbar; kein Google-Fonts-CDN (DSGVO). Nur ein WOFF2 (Subset Latin + Latin Extended, Achse wght 600–800, ≈ 30–40 KB), `font-display: swap`, `<link rel="preload">` |

Fallback: Ist das Ladebudget knapp, funktioniert das System komplett mit `--ww-font-sans` (Figtree ist Kür, nicht Pflicht). Für ruhigen Font-Swap eine Fallback-`@font-face` mit `size-adjust` (z. B. via Capsize/Fontaine) erzeugen.

### 5.2 Skala (rem, Basis 16 px, mobil → Desktop fließend)
| Token | Größe | Zeilenhöhe | Schrift / Gewicht | Einsatz |
|---|---|---|---|---|
| `--ww-text-display` | 32 → 48 px | 1,15 | Figtree 750 | „Es geht los: 3.–10. Juli" (F-012), Startseite |
| `--ww-text-3xl` | 26 → 32 px | 1,15 | Figtree 700 | H1 Seitentitel |
| `--ww-text-2xl` | 22 → 24 px | 1,3 | Figtree 700 | H2 Abschnitte, Reisename |
| `--ww-text-xl` | 20 px | 1,3 | System 600 | H3, Datumsbereich auf Vorschlagskarte |
| `--ww-text-lg` | 18 px | 1,5 | System 600 | Kartentitel, Lead |
| `--ww-text-md` | 16 px | 1,5 | System 400 | Fließtext, **alle Inputs** (verhindert iOS-Auto-Zoom) |
| `--ww-text-sm` | 14 px | 1,45 | System 400/600 | Hilfetexte, Labels, Chips, Tabs |
| `--ww-text-xs` | 12 px | 1,3 | System **600–700** | nur Kalenderzahlen, Badges, Zähler – nie Fließtext |
| `--ww-text-code` | 24 px | 1 | System 600, tabular | 6-stelliger Code |

Regeln: Zahlen in Kalender, Zählern, Code und Fortschritt immer `font-variant-numeric: tabular-nums`. Maximale Zeilenlänge 65ch. Überschriften `text-wrap: balance`, Fließtext `text-wrap: pretty`. Keine Versalien-Texte außer Wochentags-Kürzeln in sehr kleinen Labels (dann `--ww-tracking-wide`). Textvergrößerung bis 200 % darf kein Layout brechen (Kalender wechselt dann auf Listenansicht – siehe abstimmung-ux.md).

## 6. Kalender & barrierefreie Heatmap

### 6.1 Anatomie einer Kalenderzelle (verbindlich, beantwortet UX D-1)
Jedes Element hat einen **festen Ort** – so tragen auch alle Kombinationen (Feiertag + heute + Wochenende + ausgewählt + Fokus + alle können + zur Not) ohne Überlappung.

```
Mobil 45–46 × 52 px                      ≥ 600 px: 56–64 × 64 px
┌───────────────┐                        ┌──────────────────────┐
│(14)        ◥ │ ← Datum + Heute-Ring    │(14)               ◥ │  ◥ = Feiertag (Eselsohr, Ecke oben rechts)
│               │   oben links            │                      │
│      4        │ ← Zählwert Mitte        │        4/5           │  Zählwert „x/n" (Desktop immer)
│ ◐          ✓ │ ← unten links / rechts  │ ◐2               ✓  │  ◐ = zur Not (≥ 600 px mit Anzahl)
└───────────────┘                        │ ▬▬▬ ▬▬▬ ▬▬▬ ░░░    │  ✓ = alle können (Badge)
                                         └──────────────────────┘  Pegel 4 Segmente nur ≥ 600 px
```

| Element | Position | Maß (mobil / ≥ 600 px) | Hinweis |
|---|---|---|---|
| Datumszahl | oben links, 3 px Innenabstand | 12 px / 13 px, Gewicht 500 | Heute: Ring Ø 18 / 20 px, 1,5 px, `currentColor` |
| Feiertag | Ecke oben rechts | Dreieck 12 / 16 px, 1,5-px-Trennkante | wird von der Zellrundung beschnitten |
| Zählwert | zentriert, ab 45 % Höhe | 14 px / 15 px, 700, tabular | Regel siehe unten |
| ◐ zur Not | unten links | Ø 10 px / Ø 12 px + Zahl („◐2") | mobil ohne Zahl |
| ✓ alle können | unten rechts | Ø 12 px / Ø 14 px | gefüllter Kreis, Häkchen in Zellfarbe ausgespart |
| Pegel | Unterkante, innen | – / 4 Segmente à 4 px Höhe | **nur ≥ 600 px**; mobil reicht der Platz nicht, Zahl + Badges tragen die Information |
| Ausgewählt | innen, ganze Zelle | Doppelrahmen 2 + 2 px | liegt unter allen Inhalten |
| Fokus | außen | Hof 2 px + Ring 3 px + Hof 2 px (`--ww-focus-ring-isolated`) | liegt über Nachbarzellen (`z-index: 1`) |
| Vorschlag | unter der Zelle, in der 4-px-Fuge | Band 4 px, Kappen 12 px | siehe §6.5 |

**Zählwert-Regel mobil (bestätigt, UX D-1):** „x/n", solange n ≤ 9; ab 10 abgegebenen Mitgliedern nur „x" – n steht im Statusband („von 12") und in der Legende. Ab 600 px immer „x/n". Der zugängliche Name nennt immer „x von n". Die Zahl zeigt gemäß F-008 die Anzahl **„Geht"**.

Verfügbarkeitskalender „Meine Tage" (F-005) nutzt dieselbe Zelle; statt Zählwert/Badges steht dort das **Zustandssymbol** zentriert (✕ / ◐ 18–20 px), siehe §6.6.

### 6.2 Heatmap-Stufen (F-008)
Score pro Tag: **s = (geht + ½ · zur Not) / abgegeben** (wie F-008: „zur Not" zählt halb). Nur abgegebene Mitglieder zählen; ausgeblendete Personen (Was-wäre-wenn-Filter) fallen lokal heraus.

| Stufe | Bedingung | Fläche | Zahl | Pegel | Zusatz-Kodierung |
|---|---|---|---|---|---|
| **keine Daten** | niemand hat abgegeben (bzw. Person/Tag ohne Daten) | transparent, **gestrichelter Rahmen** | „–" | – | Strich statt Zahl |
| **niemand** | s = 0 | sehr hell neutral + **feine Schraffur** | „0/9" | 0 von 4 | Schraffur = blockiert |
| **wenige** | 0 < s < 0,5 | hell | „3/9" | 1 von 4 | |
| **einige** | 0,5 ≤ s < 0,75 | mittel | „5/9" | 2 von 4 | |
| **viele** | 0,75 ≤ s < 1 | dunkel (Light) / hell (Dark) | „7/9" | 3 von 4 | |
| **alle** | s = 1 (alle „geht") | dunkelste / hellste Stufe | „9/9" | 4 von 4 | ✓-Badge |

Unabhängig von der Stufe:
- **✓-Badge** (gefüllter Kreis mit Häkchen, unten rechts) = niemand hat „geht nicht" → „alle können" im Sinne von F-009. Kann auch auf „einige/viele" erscheinen, wenn Personen nur „zur Not" können. (Erfüllt F-008 „Tage, an denen alle können, … durch ein Symbol markiert".)
- **◐-Hinweis** (Halbkreis, unten links; ab 600 px mit Anzahl „◐2") = mindestens eine Person „Zur Not"; Details im Tagesdetail (F-008 „separat ausgewiesen").
- Die Stufen-Rampe gilt auch für den **Mini-Streifen** auf Vorschlagskarten (§9.3).
- Die Zahl zeigt laut F-008 die Anzahl **„geht"**. Vorschlag an PM/UX: prüfen, ob „können (inkl. zur Not)" verständlicher ist – siehe abstimmung-ux.md.
- Zugänglicher Name je Zelle, z. B. „Freitag, 3. Juli: 7 von 9 können, 1 zur Not, Feiertag Tag der Deutschen Einheit, Teil von Vorschlag 1".

Visuelle Referenz: `assets/heatmap/heatmap-legend.svg` (Light + Dark), `assets/heatmap/heatmap-markers.svg`.

### 6.3 Kontrast Zahl/Text je Stufe

**Light** (Text = Datum, Zählung, Pegel, ◐, Badge – alle in derselben Vordergrundfarbe)

| Stufe | Fläche | L | Vordergrund | Kontrast | Zusatz |
|---|---|---|---|---|---|
| keine Daten | transparent auf bg `#FBF8F3` | 0,941 | `#667070` | **4,8** ✔ | Rahmen `#858C8A` 3,2 ✔ |
| niemand | `#F1EEE8` + Linien `#CFC9C0` | 0,857 | `#1C2526` | **13,4** (auf Linie 9,3) ✔ | |
| wenige | `#A6DBD2` | 0,634 | `#1C2526` | **10,1** ✔ | |
| einige | `#5FBFB1` | 0,429 | `#1C2526` | **7,1** ✔ | |
| viele | `#187E73` | 0,164 | `#FFFFFF` | **4,9** ✔ | |
| alle | `#0B4F4A` | 0,062 | `#FFFFFF` | **9,4** ✔ | |

**Dark**

| Stufe | Fläche | L | Vordergrund | Kontrast | Zusatz |
|---|---|---|---|---|---|
| keine Daten | transparent auf bg `#111819` | 0,008 | `#8F9A97` | **6,1** ✔ | Rahmen `#6B7775` 3,8 ✔ |
| niemand | `#1C2526` + Linien `#3A4544` | 0,017 | `#ECF1F0` | **13,6** (auf Linie 8,6) ✔ | |
| wenige | `#1D4B46` | 0,057 | `#ECF1F0` | **8,5** ✔ | |
| einige | `#287268` | 0,135 | `#ECF1F0` | **4,9** ✔ | |
| viele | `#6CCFC0` | 0,516 | `#0B1F1E` | **9,2** ✔ | |
| alle | `#B5F0E4` | 0,777 | `#0B1F1E` | **13,4** ✔ | |

### 6.4 Unterscheidbarkeit ohne Farbe – Farbfehlsichtigkeit & Graustufen
**Strategie:** Die Rampe ist eine **einfarbige Helligkeitsrampe** (ein Farbton, monoton steigende/fallende Luminanz). Farbfehlsichtigkeit verändert vor allem den Farbton, kaum die Helligkeit – eine reine Helligkeitsrampe bleibt deshalb bei Protanopie, Deuteranopie und Tritanopie in derselben Reihenfolge erkennbar. Zusätzlich ist jede Stufe **dreifach redundant**: Zahl, Pegel (0–4 Segmente), Muster/Badge an den Enden.

Luminanz-Abstände benachbarter Stufen (Kontrastverhältnis Fläche zu Fläche):

| Übergang | Light | Dark |
|---|---|---|
| niemand → wenige | 1,33 | 1,59 |
| wenige → einige | 1,42 | 1,72 |
| einige → viele | 2,24 | 3,06 |
| viele → alle | 1,91 | 1,46 |

Ehrliche Einordnung: Fünf Stufen lassen sich nicht alle mit 3:1 voneinander trennen – das ist auch nicht nötig, weil die Information in **Zahl und Pegel** steckt (WCAG 1.4.1 „Use of Color" erfüllt; 1.4.11 betrifft hier die Zahl/Pegel, die ≥ 4,5:1 haben).

| Prüfung | Ergebnis (Entwurf) | Begründung |
|---|---|---|
| Graustufen | unterscheidbar | Luminanz monoton (Light 0,86 → 0,63 → 0,43 → 0,16 → 0,06), dazu Schraffur/Badge/Pegel |
| Deuteranopie / Protanopie | unterscheidbar | Teal-Töne haben kaum Rotanteil → Helligkeit bleibt; „niemand" ist neutral; kein Rot-Grün-Gegensatz im System. Koralle (Feiertag/Vorschlag) wirkt olivbraun, ist aber über Form (Ecke, Band) kodiert |
| Tritanopie | unterscheidbar | Teal kippt Richtung Cyan/Grau, Amber Richtung Rosa – Reihenfolge der Helligkeit bleibt; „zur Not" zusätzlich durch Streifen + ◐ |
| Achromatopsie | unterscheidbar | wie Graustufen |

**Pflicht-Verifikation durch Reviewer:** Chrome DevTools → Rendering → „Emulate vision deficiencies" (protanopia, deuteranopia, tritanopia, achromatopsia) und Windows „Kontrastdesign" (forced-colors) mit einer Testreise (9 Personen, alle Stufen). Die Werte oben sind rechnerisch ermittelt; die Simulation ist Teil des Reviews (§12).

### 6.5 Markierungen im Kalender
| Zustand | Darstellung | Nicht-Farb-Kodierung | Kontrast |
|---|---|---|---|
| **Wochenende** (F-016) | Farbige **Spur** hinter den Sa/So-Spalten (sichtbar in den 4-px-Fugen und im Spaltenkopf), Spaltenkopf fett | Position + Kopf-Label „Sa/So" | Spur rein dekorativ; Information über Label |
| **Feiertag** (F-016) | **Eselsohr-Ecke** rechts oben (Dreieck 14–18 px, `--ww-hm-holiday`) mit 1,5-px-Trennkante in Hintergrundfarbe; Name im Tages-Sheet und im zugänglichen Namen | Form (Dreieck) | Ecke vs. Trennkante 4,0 (L) / 7,3 (D); Trennkante vs. dunkle Zellen ≥ 4,9 |
| **Heute** | **Ring** (1,5 px, `currentColor`) um die Datumszahl | Form | wie Text der Stufe (≥ 4,8) |
| **Ausgewählt** (Bereichsauswahl F-005, manuelle Option F-010) | **Doppelrahmen innen**: 2 px außen `--ww-hm-selected-outer`, 2 px innen `--ww-hm-selected-inner` (`--ww-selected-ring`) | Rahmenform | mindestens ein Ring ≥ 3:1 gegen jede Stufe |
| **Fokus** (Tastatur) | **Ring außen mit Hof auf beiden Seiten**: 2 px Hintergrundfarbe + 3 px `--ww-color-focus` + 2 px Hintergrundfarbe (`--ww-focus-ring-isolated`); fokussierte Zelle liegt über den Nachbarn | liegt außerhalb der Zelle → nie mit „ausgewählt" verwechselbar | Ring grenzt nur an den Hof: 5,9 (L) / 8,6 (D) – unabhängig von Stufe `all` oder Vorschlag-Band (UX D-1) |
| **Vorschlag hervorgehoben** (F-009 ↔ Kalender) | **Band mit Endkappen** (4 px, Koralle) unter den Zellen des Zeitraums. Kappen (3 × 12 px) **nur** an echtem An- und Abreisetag. **Umbruch:** am Zeilenende läuft das Band ohne Kappe bis an den Rand des Rasters (gerade, offene Kante) und setzt in der nächsten Zeile/im nächsten Monat ebenso offen am linken Rand fort. Optional Rangnummer „1" (Pill 16 px) an der Startkappe | Form + Länge; offene vs. geschlossene Enden | 3,8 (L) / 7,3 (D) gegen bg |
| **Außerhalb Suchzeitraum / vergangen** | keine Fläche, kein Rahmen, Datumszahl `--ww-hm-outside-fg`, nicht fokussierbar | fehlende Fläche | 3,2 (L) / 3,8 (D) – erfüllt UX-Wunsch ≥ 3:1 |
| **keine Daten** | gestrichelter Rahmen, „–" | Rahmenform | siehe §6.3 |

Kombinationen sind erlaubt (z. B. Feiertag + heute + Vorschlag), weil jede Markierung einen eigenen Ort hat: Ecke rechts oben, Ring links oben, Rahmen innen, Ring außen, Band unten.

### 6.6 Eigene Verfügbarkeit (F-005)
| Zustand | Fläche (Light / Dark) | Muster | Symbol | Kontrast Symbol/Datum |
|---|---|---|---|---|
| **geht** (Standard) | `#C6E9E2` / `#1D4B46` | glatt | ✓ Häkchen | Light Symbol 6,5, Datum 12,0 · Dark Symbol 4,9, Datum 8,5 |
| **ginge zur Not** | `#FDF0CF` / `#3A2E12` | **breite Streifen** 135° (= „halb") | ◐ Halbkreis | Light 6,3 (auf Streifen 5,0) · Dark 8,1 (auf Streifen 5,8) |
| **geht nicht** | `#CFC9C0` / `#262D2C` | **Kreuzschraffur** | ✕ Kreuz | Light 9,5 (auf Linie 6,1) · Dark auf Linie 6,8 |

- **„Geht" als Standard (bestätigt, UX D-2.1):** unmarkierte Tage zeigen nur die glatte Lagune-Fläche **ohne Häkchen** – die beiden anderen Zustände tragen Muster + Symbol, „Geht" ist der ruhige Grund. Das Häkchen erscheint in Legende, Pinsel und Tagesdetail sowie im zugänglichen Namen („geht").
- Symbole (✕, ◐) sitzen auf einer kleinen **Plakette** in der Grundfarbe der Zelle (Kreis 22 px), damit Muster die Lesbarkeit nie stören. Die Datumszahl bleibt oben links (wie Heatmap).

**Interaktionszustände „Meine Tage" (UX D-2):**

| Zustand | Darstellung | Abgrenzung |
|---|---|---|
| **Zieh-Vorschau** (vor dem Loslassen) | Zellen im Bereich zeigen bereits Fläche + Muster des aktiven Pinsels (Symbol noch ohne Plakette); um den Bereich ein **gestrichelter 2-px-Umriss** `--ww-cal-preview-border` (je Zeilensegment, an Umbrüchen offen wie das Vorschlag-Band); Tooltip/Ansage „13.–19. Mai · 7 Tage" | Ausgewählt = durchgezogener Doppelrahmen; Vorschlag = Koralle-Band unten; Vorschau = gestrichelt in Textfarbe |
| **Bereichsmodus-Startmarke** | Doppelrahmen (wie ausgewählt) **plus Ankerpunkt**: Kreis 8 px `--ww-cal-anchor` mit 2-px-Ring `--ww-cal-anchor-ring`, mittig auf der linken Zellkante; Hinweiszeile „Jetzt das Ende antippen." über der Werkzeugleiste | Anker ist eindeutig (Punkt + Rahmen) |
| **Schreibgeschützt** (Phase 3, F-012) | Zustände bleiben **unverändert farbig** (keine Opazität, kein Kontrastverlust); keine Hover-/Druck-Reaktion, `cursor: default`; Werkzeugleiste ersetzt durch Hinweis mit Schloss-Icon „Der Termin steht fest – deine Tage sind gesperrt." | Erkennbar über fehlende Werkzeugleiste + Schloss-Hinweis, nicht über ausgegraute Zellen |
| **Setz-Feedback** | 80 ms `scale(0.94 → 1)` + sofortiger Flächenwechsel (≤ 140 ms gesamt); bei reduzierter Bewegung nur der Flächenwechsel | – |
| **Entwurf vs. abgegeben** | kein Zellunterschied (nur Statuszeile, W08) | – |
- Helligkeit: „geht nicht" ist in Light deutlich dunkler (L 0,59 vs. 0,76/0,88); „geht" und „zur Not" unterscheiden sich primär durch Muster + Symbol + Farbton (Teal vs. Amber – auch bei Rot-Grün-Schwäche als Blau- vs. Gelbton getrennt).
- Werkzeugwahl (Pinsel-Prinzip) zeigt dieselben Muster als Farbfeld im Segment, damit Werkzeug und Ergebnis visuell identisch sind.
- Referenz: `assets/heatmap/availability-legend.svg`, Muster: `assets/heatmap/heatmap-patterns.svg` bzw. `--ww-pattern-*` in tokens.css.

### 6.7 Forced Colors / Hochkontrastmodus
In `@media (forced-colors: active)` verschwinden Flächenfarben und Gradient-Muster. Deshalb müssen Zahl, Symbole, Pegel und Badges als **Text bzw. SVG mit `currentColor`** gerendert werden (nicht als Hintergrundbild). Zusätzlich: „ausgewählt" als `outline: 2px solid Highlight`, Vorschlag-Band als Rahmen unten (`border-bottom: 4px solid CanvasText`).

## 7. Raster, Abstände, Radien, Schatten

- **Raster:** 4-px-Basis. Seitenrand mobil 16 px, **Kalender mobil 8 px** (`--ww-size-cal-inset-sm`, Fuge bleibt 4 px → Zelle 45,7 px bei 360 px, 41 px bei 320 px; beantwortet UX D-3), ab 600 px 24 px, ab 960 px Inhalt zentriert (`--ww-size-content-narrow` 640 px für Formulare/Listen, `--ww-size-content-wide` 1040 px für Kalender).
- **Abstände:** `--ww-space-1` (4) bis `--ww-space-16` (64). Faustregel: innerhalb einer Komponente 8–12, zwischen Komponenten 16–24, zwischen Abschnitten 32–48.
- **Radien:** Zelle/Chip klein 8 · Button/Input/Toast/Code-Kästchen 12 · Karte 16 · Bottom-Sheet oben 24 · Pill 999. Radien werden nach innen kleiner (innerer Radius = äußerer − Abstand).
- **Schatten** (`--ww-shadow-1..3`): warm getönt, niedrig. Karten in Listen: Rahmen `border-subtle` statt Schatten (ruhiger, besser in Dark). Schatten 2 für schwebende Elemente (Sticky-CTA, Popover), 3 für Sheet/Toast/Dialog. Dark: Schatten stärker, Ebenen zusätzlich über hellere Fläche.
- **Größen:** Touch-Ziel min. 44 × 44 px; Controls 40/48/56 px Höhe (sm/md/lg); Icons 16/20/24 px; Avatare 24/32/40 px.

## 8. Motion

| Token | Wert | Einsatz |
|---|---|---|
| `--ww-duration-instant` | 80 ms | Button gedrückt, Zelle beim Malen |
| `--ww-duration-fast` | 140 ms | Hover, Chips, Tabs-Indikator |
| `--ww-duration-base` | 220 ms | Toast rein/raus, Akkordeon |
| `--ww-duration-slow` | 320 ms | Bottom-Sheet, Seitenwechsel |
| `--ww-duration-celebrate` | 700 ms | Konfetti/Siegel bei Festlegung (F-012) |
| `--ww-ease-standard` | `cubic-bezier(.2,0,0,1)` | Standard |
| `--ww-ease-enter` / `--ww-ease-exit` | | Rein / Raus |
| `--ww-ease-spring` | `cubic-bezier(.34,1.56,.64,1)` | nur Erfolgs-Siegel |

Regeln:
- Bewegung erklärt Zusammenhang (Sheet kommt von unten, Toast aus der Richtung seines Ortes) – nie Selbstzweck.
- Malen im Kalender: Zelle bekommt beim Überstreichen 80 ms ein `scale(0.94 → 1)` plus Flächenwechsel; nie verzögerte Farbübergänge (das Gefühl muss „sofort" sein, F-005 optimistisches UI).
- Heatmap-Neuberechnung: Flächen blenden 140 ms über; Zahlen springen ohne Animation (Lesbarkeit).
- **`prefers-reduced-motion: reduce`:** tokens.css setzt alle Dauern auf ≈ 0, `--ww-motion-scale-press` auf 1 und `--ww-motion-distance` auf 0. Komponenten verwenden nur diese Tokens → kein Skalieren, kein Einschieben, nur sofortiger Zustandswechsel bzw. Überblenden. Konfetti entfällt, das Siegel erscheint statisch. Keine Autoplay-Animationen, nichts blinkt (> 3 Hz ausgeschlossen).

## 9. Komponenten

Alle Zustände: **Standard · Hover (nur Zeigegeräte, `@media (hover: hover)`) · Gedrückt · Fokus (`:focus-visible`, Ring außen) · Deaktiviert · Laden · Fehler** – sofern zutreffend. Fokus-Ring ist überall identisch (`--ww-focus-ring`, 3 px + 2 px Abstand).

### 9.1 Buttons
| Variante | Fläche | Text | Rahmen | Einsatz |
|---|---|---|---|---|
| Primär | `primary` | `text-on-primary` (6,3 / 8,5) | – | eine Haupt-Aktion pro Ansicht („Mitmachen", „Fertig – abgeben") |
| Sekundär | `surface` | `primary-text` | 1,5 px `primary` | Neben-Aktionen („Link kopieren") |
| Ghost / Text | transparent | `primary-text` | – | Tertiär („Im Kalender zeigen") |
| Destruktiv | `danger` | `text-on-danger` (6,5) | – | nur in Bestätigungsdialogen („Reise löschen") |
| Destruktiv leise | transparent | `danger` | – | Einstieg („Reise verlassen …") |

- Maße: Höhe **min.** 48 px (md), 40 px (sm), 56 px (lg); `min-width: 44px`; Innenabstand horizontal 20 px; Radius 12; Schrift 16/600; Icon 20 px, Abstand 8 px.
- Breite **nie fix**: `width: auto` bzw. 100 % in mobilen Formularen/Sticky-Leisten. Text darf in **2 Zeilen umbrechen** (`white-space: normal`, Höhe wächst mit), Ausnahme: Icon-Buttons.
- Hover: Fläche `primary-hover`. Gedrückt: `primary-active` + `scale(var(--ww-motion-scale-press))`. Deaktiviert: `disabled-bg`/`disabled-text`, kein Schatten – **bevorzugt `aria-disabled` + Erklärung statt stummem Ausgrauen**. Laden: Spinner (16 px) ersetzt Icon, Label bleibt („Wird gespeichert …"), `aria-busy="true"`, Breite springt nicht.
- Sticky-Aktionsleiste unten: Fläche `surface`, `--ww-shadow-sticky-bottom`, Innenabstand 12/16 px + `env(safe-area-inset-bottom)`.

### 9.2 Eingabefelder
- Höhe min. 48 px, Schrift 16 px, Radius 12, Rahmen 1,5 px `border-strong` (3,2:1), Fläche `surface`. Label **immer sichtbar über** dem Feld (14/600), kein Placeholder-als-Label. Hilfetext darunter 14 px `text-muted`.
- Fokus: Rahmen 2 px `primary` + Fokus-Ring. Fehler: Rahmen 2 px `danger`, Fehlertext darunter mit ✕-Icon im Kreis und Text (nie nur roter Rahmen), `aria-invalid`, `aria-describedby`. Erfolg (z. B. Code gültig): Rahmen `primary`, ✓-Icon.
- Deaktiviert/schreibgeschützt (z. B. nach Festlegung F-012): Fläche `surface-sunken`, Text `text-muted`, gestrichelter Rahmen.

**6-stelliges Code-Feld (F-040/F-041):**
- Optik: 6 Kästchen 48 × 56 px (bei < 380 px Viewport 44 × 52), Abstand 8 px, nach der 3. Ziffer 16 px Lücke („123 456" – leichter abzulesen/abzutippen). 6 × 44 + 4 × 8 + 16 = 312 px → passt auf 360 px.
- Ziffern 24 px, 600, tabular, zentriert. Leeres Kästchen: Rahmen `border-strong`; aktives Kästchen: 2 px `primary` + blinkender Caret-Strich (reduced motion: statisch); gefüllt: Text `text`, Rahmen `border-strong`.
- Fehler (falscher Code): alle Kästchen Rahmen `danger`, Meldung darunter „Der Code stimmt nicht. Noch 3 Versuche." – kein Wackeln bei reduzierter Bewegung (sonst 1× horizontal 4 px, 220 ms).
- Erfolg: Kästchen kurz `primary-tint` + ✓, dann Weiterleitung.
- **Gesperrt** (5 Fehlversuche): Kästchen `surface-sunken`, gestrichelter Rahmen, Ziffern ausgeblendet; darunter Schloss-Icon + „Zu viele Versuche. Fordere einen neuen Code an." + Sekundär-Button „Neuen Code senden".
- **Prüfen** (Ladezustand nach 6. Ziffer/Einfügen): Kästchen-Rahmen `border-subtle`, Ziffern bleiben sichtbar, darunter 16-px-Spinner + „Prüfe Code …" (`aria-live="polite"`); bei reduzierter Bewegung statt Spinner drei statische Punkte.
- Darunter: „Code erneut senden" als Text-Button mit Countdown „Neuer Code in 0:27" (tabular, nicht animiert), Hinweis „Spam-Ordner prüfen" in `text-muted`.
- **Technik (bestätigt, UX D-4 / ux-spec §4.4): genau ein `<input>`**; die Kästchen sind rein visuell. Umsetzungsvorschlag: sechs `aria-hidden`-Kästchen rendern den Wert; darüber liegt das echte Input in voller Größe mit `color: transparent; caret-color: transparent; background: transparent` (Tippen, Einfügen, Autofill, Screenreader funktionieren normal). Aktives Kästchen = Index `value.length` bei Fokus. „Inhalt markiert lassen" nach Fehler (ux-spec): ist der gesamte Wert selektiert, erhalten alle Kästchen die Fläche `primary-tint`. Ist ein Overlay nicht gewünscht, Alternative: Monospace-Ziffern mit `letter-spacing` über einem Hintergrund aus sechs Kästchen (`repeating-linear-gradient`) – weniger robust gegenüber Systemschriften.

### 9.3 Karten
- Fläche `surface`, Rahmen 1 px `border-subtle`, Radius 16, Innenabstand 16 (mobil) / 20. Klickbare Karte: ganze Karte ist ein Link, Hover `shadow-2`, Fokus-Ring um die Karte.
- **Reisekarte („Meine Reisen", F-044):** Reisename (lg/600, max. 2 Zeilen mit „…", `overflow-wrap: anywhere`), Rolle als Chip mit Krone **und Text** „Orga"/„Organizer", Phasen-Chip (siehe unten), Fortschritt „5 von 7" als `<progress>`-Balken (Track `sand-200`/`slate-850`, Füllung `primary`, 6 px, Radius pill) **plus Text**.
- **To-do-Hervorhebung (UX D-7):** Zeile oben auf der Karte, Fläche `--ww-todo-bg`, Text `--ww-todo-fg` (4,8 / 6,0), 4-px-Kante links `--ww-todo-bar`, Pfeil-Icon rechts: „Deine Tage fehlen noch →". Koralle ist damit „Achtung, du bist dran" – nicht Fehler.
- **Phasen-Chip / Phasen-Leiste (UX D-7):** immer Text + Icon, Höhe 28 px (Chip) bzw. 4 Schritte als Leiste in W07.

| Phase | Chip-Fläche / Text | Icon | Kontrast L / D |
|---|---|---|---|
| Tage sammeln | `--ww-phase-collect-*` | Kalender | 7,8 / 6,1 |
| Abstimmung läuft | `--ww-phase-vote-*` | Abstimmung | 6,3 / 8,1 |
| Steht fest: 5.–10. Mai | `--ww-phase-fixed-*` (kräftig) | Check | 8,4 / 8,5 |
| Vergangen | `--ww-phase-past-*` | Uhr | 5,2 / 6,6 |

  Phasen-Leiste: vier Segmente, erledigte Schritte mit ✓ + `primary`, aktueller Schritt fett + 3-px-Unterstrich, kommende `text-muted` – Zustand nie nur über Farbe.
- **Vorschlagskarte (F-009, UX D-13):**
  - **Gruppenüberschriften** (h2): „Alle können (2)" mit vorangestelltem ✓-Badge-Icon in `primary`; „Fast alle können (3)" mit Personen-Icon in `text-muted`. Abstand zwischen Gruppen 32 px, damit die Trennung auch ohne Farbe klar ist.
  - Titel: Zeitraum (lg/700) „Mi., 5. Mai – Mo., 10. Mai"; Unterzeile `text-muted`: „bis zu 5 Nächte · ca. 3 Urlaubstage ⓘ" (F-016).
  - **Zusatz-Chips** (nicht interaktiv, 24 px hoch, 13/600): „◐ 2× zur Not" (`vote-maybe-bg/fg`), „✕ ohne Jonas" (`vote-no-bg/fg` – Stein, nicht Rot), „⚑ inkl. Pfingstmontag" (`accent-tint`/`accent-text`). Chips umbrechen in Zeilen.
  - **Mini-Streifen** (optional): die Tage des Fensters als 6 px hohe Heatmap-Leiste (Stufenfarben) – Wiedererkennung zum Kalender.
  - Aktionen: Text-Button „Im Kalender zeigen" (löst das Vorschlag-Band aus), Orga: Checkbox „Zur Abstimmung" (24-px-Kästchen, Touch-Fläche 44 px; gewählt = `primary` gefüllt + ✓).
  - Hervorgehoben (Hover/Klick „Im Kalender zeigen"): 2 px Rahmen `accent-strong` + Band im Kalender. Gewählt für Abstimmung: Rahmen 2 px `primary`.
- **Ergebniskarte (F-012):** Display-Schrift „Es geht los", Datumsbereich, Illustration `vote-done.svg`, Buttons „Zum Kalender hinzufügen" (Icon calendar-download) und „Teilen".

### 9.4 Tabs & Navigation
- **Reise-Navigation** (UX: Links mit `aria-current`, keine JS-Tabs): „Übersicht · Meine Tage · Gruppe · Abstimmen" / „Overview · My dates · Group · Vote". Text-Tabs 14/600, Höhe 48, Innenabstand horizontal 8 px unter 400 px Breite, sonst 12 px, **kein** Icon (Platz). Aktiv: Text `text` + 3-px-Unterstrich `primary` in Label-Breite, Radius 2; inaktiv `text-muted`; Hover `text`. Leiste mit 1-px-Linie `border-subtle` unten. Rechnung 360 px (328 px nutzbar): „Übersicht | Meine Tage | Gruppe | Abstimmen" ≈ 256 px Text + 4 × 16 px = 320 px → passt (EN kürzer); bei Systemschriften mit breiteren Glyphen oder Textvergrößerung greift der **Fallback:** horizontal scrollbar, Verlaufskante 24 px rechts (`linear-gradient(to right, transparent, var(--ww-color-bg))`), aktiver Tab wird in Sicht gescrollt – nie Kürzen. Optionaler Zähler („2") als Pill 18 px `accent-tint`/`accent-text`.
- **Segment „Vorschläge | Kalender"** (W09): Segment-Control, Höhe 40, Radius 12, Fläche `surface-sunken`, aktives Segment `surface` + Rahmen 1,5 px `border-strong` (3:1) + `shadow-1` + Text 600 – Zustand über Rahmen und Fettung, nicht nur Fläche.
- **Kopfzeile:** 56 px, Bildmarke 28 px (in Reisen: Zurück-Pfeil + Reisename 1 Zeile mit „…"), rechts Sprachumschalter/„⋯" + Konto-Avatar.
- **Keine Bottom-Navigation** (UX-Sitemap sieht keine vor; In-App-Browser haben eigene Leisten unten). Unten nur die fixierte Aktions-/Werkzeugleiste.

### 9.5 Chips
- Höhe 36 px (Touch-Fläche per Padding ≥ 44 px), Radius pill, 14/600, Icon 16.
- Filter-Chip (z. B. „Kemal ausblenden", F-008): Standard `surface` + Rahmen `border-strong`; aktiv `primary-tint` + `primary-text` + ✓-Icon vorn (Zustand nicht nur über Farbe). Ausgeblendete Person: durchgestrichener Name im Chip + Auge-zu-Symbol (Icon-Erweiterung nach Bedarf).
- Status-Chip (nicht interaktiv): kein Rahmen, Tönung je Status (info/warning/success), immer mit Icon.

### 9.6 Toasts
- Position mobil: unten mittig, **über** der fixierten Leiste: `bottom: calc(<Höhe der Leiste> + var(--ww-size-toast-gap) + env(safe-area-inset-bottom))` – die Leistenhöhe setzt die App als `--ww-sticky-bar-h` am Layout (UX D-11). Desktop (≥ 960 px): unten links, 24 px Abstand. Breite `min(100% - 32px, 480px)`; `z-index: var(--ww-z-toast)`.
- Fläche `inverse-bg`, Text `inverse-text` (15,6), Radius 12, `shadow-3`, Innenabstand 12/16, Icon links (✓, Kopieren, Info). Aktion rechts als Text-Button in `inverse-link` („Rückgängig" / „Undo", min. 44 px hoch). Text ≤ 60 Zeichen, darf zweizeilig werden.
- Dauer: 4 s, mit Aktion 6 s, pausiert bei Fokus/Hover; maximal eine gleichzeitig; `role="status"`. Fehler gehören **nicht** in Toasts, sondern an das Feld/den Bereich.
- Bewegung: 16 px von unten + Einblenden (220 ms); reduziert: nur Einblenden.
- Typische Texte: „Link kopiert" / „Link copied", „Gespeichert" / „Saved".

### 9.7 Bottom-Sheet
- Für Tagesdetails (F-008 „wer kann/zur Not/nicht"), Sprachwahl, Teilen-Optionen.
- Fläche `surface-raised`, Radius oben 24, Griff 36 × 4 px (`border-strong`) mittig 8 px unter Oberkante, Titelzeile 18/600 + Schließen-Button (44 px, ✕) – Griff ist **kein** einziges Schließmittel.
- Zwei Rastpunkte (UX D-11): **halb** (`--ww-size-sheet-half`, Standard fürs Tagesdetail) und **fast voll** (`--ww-size-sheet-full`); Inhalt scrollt innerhalb; Safe-Area unten. Scrim `--ww-color-scrim`. Tagesdetail: Kopf mit ‹ › (Tag blättern, je 44 px) links/rechts vom Datum.
- Bewegung 320 ms von unten; reduziert: Überblenden. Ab 960 px Breite: zentrierter Dialog (max. 480 px) bzw. Seitenpanel neben dem Kalender.
- **Tagesdetail-Inhalt:** Datum + Feiertagsname, „5 von 7 können" (lg/600), vier Gruppen mit Kopf und Icon (✓ Geht 5 · ◐ Zur Not 1 · ✕ Geht nicht 1 · Noch offen 2 in `text-muted` mit gestricheltem Avatar-Ring), darin Avatar + Name + Kommentar-Icon (antippbar) bzw. Kommentar in `text-muted`.

### 9.8 Sprachumschalter (F-046)
- In Kopfzeile: Ghost-Button mit Globus-Icon + Sprachcode „DE"/„EN" (14/700), min. 44 × 44. Öffnet Menü/Sheet mit **Sprachnamen in der jeweiligen Sprache**: „Deutsch", „English" – jeweils mit `lang`-Attribut, aktuelle Sprache mit ✓. **Keine Flaggen** (Flaggen sind Länder, nicht Sprachen; DE/AT/CH, UK/US).
- Im Footer/auf Login ohne Konto: Segment-Umschalter „Deutsch | English".
- Teilen-Text-Sprache (F-002, F-046): kleiner Segment-Umschalter direkt über dem Textfeld („Text auf: Deutsch | English").

### 9.9 Kalenderzelle – Zustände
Siehe §6. Zusätzlich Interaktion:
- Hover (Zeigegerät): Rahmen innen 1 px `border-strong`.
- Gedrückt/Malen: 80 ms Skalierung 0,94 (reduziert: keine).
- Deaktiviert (außerhalb Suchzeitraum, nach Festlegung schreibgeschützt): kein Hover, Cursor default; schreibgeschützt zusätzlich Schloss-Hinweis in Kopfzeile, nicht pro Zelle.
- Spaltenkopf Wochentage: 12/700, `text-muted`, Wochenende `text` + Spur.

### 9.10 Abstimmungsoptionen Ja / Vielleicht / Nein (F-011)
- Pro Option eine Karte: Datumsbereich (lg/600), Verfügbarkeitszeile („8 können · ohne Kemal"), darunter **Segment-Control** aus drei gleich breiten Buttons (min. 48 px hoch, Radius 12 außen, 1,5 px Rahmen `border-strong`).
- Segment-Inhalt: Icon (✓ / ◐ / ✕, 20 px) + Label („Ja / Vielleicht / Nein" – „Yes / Maybe / No"). **Unter 400 px Breite: Icon über Label** (gestapelt), damit „Vielleicht" ohne Kürzung passt.
- Ausgewählt: Fläche `vote-*-bg`, Text/Icon `vote-*-fg`, Rahmen 2 px in `vote-*-fg`, Icon gefüllt – Auswahl also über Fläche, Rahmenstärke **und** Häkchen-Eckmarke. Nicht gewählt: `surface`, `text-muted`.
- **Vorbelegung aus Verfügbarkeit (muss bestätigt werden):** gestrichelter Rahmen in `vote-*-fg` + kleines Label „Vorschlag" über der Option; erst nach Antippen durchgezogen.
- Ergebnis: gestapelter Balken (8 px, Radius pill, Segmente durch 2-px-Lücken in `surface` getrennt) Ja `vote-yes-bar` (4,6:1) · Vielleicht `vote-maybe-bar` (3,4:1) · Nein `vote-no-bar` (3,4:1) – **plus** Zahlen mit Icons „✓ 6 ◐ 2 ✕ 1". Rang 1 mit Badge „Vorne" (Krone **nicht** verwenden – reserviert für Organisator).
- Namentliche Stimmen (Transparenz): Avatarreihen je Antwort.

### 9.11 Avatare / Initialen
- Kreis 24/32/40 px, Initialen 1–2 Zeichen (10/13/16 px, 600), Farbe deterministisch aus 8 Tönen (`--ww-avatar-light-*` / `--ww-avatar-dark-*`) per Hash der Mitglieds-ID.
- **Organisator:** Kronen-Badge 14 px (Kreis `sun`, Icon `text`) rechts oben, 2 px Ring in `surface`.
- **Status Teilnahme (F-007):** abgegeben = ✓-Badge unten rechts (`primary`, Icon `text-on-primary`); noch offen = **gestrichelter Ring** um den Avatar (`border-strong`) – Form statt nur Farbe; Platzhalter (noch nicht beigetreten) = gestrichelter Kreis ohne Fläche, Initialen `text-muted`.
- Stapel: −8 px Überlappung, 2 px Ring in `surface`, max. 5 + Zähler „+4" (Pill `surface-sunken`).
- Bildschirmleser: Name im zugänglichen Namen, Farbe irrelevant.

### 9.12 Banner & Hinweise
- Info/Warnung/Erfolg/Fehler: Fläche `*-tint`, Text `*-text`, Icon links, Radius 12, Innenabstand 12/16. Beispiel F-008: Warn-Banner „Noch offen: Kemal, Sara – Ergebnis kann sich ändern" + Aktion „Erinnern" (F-015).
- Frist (F-017): Chip „noch 3 Tage" mit Uhr-Icon; ≤ 1 Tag Warnfarbe.

## 10. i18n-robuste Layouts (DE/EN)

### 10.1 Grundregeln
1. **Keine fixen Breiten** für Text-Container, Buttons, Tabs, Chips. Nur `min-width` (44 px) und `max-width`.
2. **Längen-Puffer:** Englisch → Deutsch ist typischerweise +30 %, bei kurzen UI-Labels bis +100 % („Vote" → „Abstimmung"). Layouts mit dem **längeren** Text entwerfen und mit einer **Pseudo-Locale (+40 %, Sonderzeichen ÄÖÜß)** testen.
3. **Umbruch erlauben:** Buttons und Chips dürfen zweizeilig werden; Tabs scrollen statt zu kürzen; Kartentitel max. 2–3 Zeilen mit `line-clamp` nur bei nutzergenerierten Inhalten (Reisename), nie bei UI-Texten.
4. **Silbentrennung:** `<html lang="de">` bzw. `lang="en"` korrekt setzen (bei Sprachwechsel aktualisieren); `hyphens: auto` für Fließtext und Überschriften in schmalen Spalten (Karten, Sheets, Tabellenzellen); `hyphens: manual` für Buttons (dort gezielt `&shy;` in Übersetzungsdateien bei bekannten Komposita).
5. **Lange Wörter & Nutzerinhalte:** `overflow-wrap: anywhere` für Reisenamen, Anzeigenamen, E-Mail-Adressen, Links; `min-width: 0` in Flex/Grid-Kindern.
6. **Keine Texte in Grafiken** (außer Wortmarke). Icons tragen keine Buchstaben.
7. **Zahlen & Plural** über ICU MessageFormat („1 Nacht / 7 Nächte", „1 night / 7 nights"); Zahlen-Formatierung über `Intl.NumberFormat` (de-CH: Apostroph als Tausendertrenner).

Typische Grenzfälle, die jede Komponente aushalten muss:

| Kontext | DE | EN |
|---|---|---|
| Haupt-CTA Verfügbarkeit | „Fertig – Verfügbarkeit abgeben" (30) | „Done – submit availability" (26) |
| Kompositum | „Verfügbarkeitsabgabefrist", „Datenschutzerklärung", „Urlaubstage-Optimierung" | „privacy policy" |
| Tab | „Abstimmung" (10) | „Vote" (4) |
| Option | „Vielleicht" (10) | „Maybe" (5) |
| Hinweis | „Noch offen: Kemal, Sara – Ergebnis kann sich ändern" | „Still missing: Kemal, Sara – result may change" |

### 10.2 Wochentags-Kürzel
Einheitlich **zwei Zeichen** (passt in 40-px-Spalten, eindeutig – „T/T" und „S/S" der Ein-Buchstaben-Variante sind im Englischen mehrdeutig):

| Locale | Mo-Start | So-Start (en-US) |
|---|---|---|
| de | Mo Di Mi Do Fr **Sa So** | – |
| en | Mo Tu We Th Fr **Sa Su** | **Su** Mo Tu We Th Fr **Sa** |

- Kürzel aus den Übersetzungsdateien, nicht aus `Intl` (`short` liefert „Mo." bzw. „Mon" – uneinheitliche Breite). Spaltenköpfe erhalten den vollen Namen für Screenreader (`<abbr title="Montag">` bzw. `aria-label`).
- Wochenende bleibt Sa/So unabhängig vom Wochenstart (F-016); die Spur wandert mit der Spaltenposition.

### 10.3 Datumsformate (über `Intl.DateTimeFormat` / `formatRange`, Region aus Konto, F-046)
| Region | Lang | Kompakt (Karten, Zellen-Sheet) | Bereich |
|---|---|---|---|
| de-DE | „Fr., 3. Juli 2027" | „3.7." / „03.07.2027" | „3.–10. Juli 2027" · monatsübergreifend „28. Juni – 5. Juli 2027" |
| de-AT | „Fr., 3. Juli 2027" („Jänner" für Januar!) | „3.7." | wie de-DE |
| de-CH | „Fr., 3. Juli 2027" | „3.7." / „03.07.2027" | wie de-DE |
| en-GB | „Fri 3 July 2027" | „3 Jul" | „3–10 July 2027" |
| en-US | „Fri, July 3, 2027" | „Jul 3" | „July 3–10, 2027" |

- Bereiche immer mit Halbgeviertstrich „–" (bei Leerzeichen-Variante „ – "), nie Bindestrich. `formatRange` übernimmt das je Locale.
- Monatskopf im Kalender: „Juli 2027" / „July 2027" (`month: 'long', year: 'numeric'`).
- Reisedauer immer zusätzlich in Nächten: „7 Nächte (8 Tage)" / „7 nights (8 days)".
- Ergebnis-Headline (F-012): „Es geht los: 3.–10. Juli 2027" / „We're off: 3–10 July 2027" bzw. „July 3–10, 2027" – Display-Schrift, darf zweizeilig werden (`text-wrap: balance`).

## 11. Ikonografie & Illustration

**Icons** (`assets/icons/`): 24er Raster, 2 px Strich (Check/Kreuz 2,5 px), runde Enden/Ecken, `currentColor`, keine Füllungen außer Bedeutungsträgern (◐, Badge). Größen 16/20/24. Dekorativ → `aria-hidden="true"`; alleinstehend (Icon-Button) → zugänglicher Name am Button, nicht im SVG. Kernset: Kalender, Teilen, Abstimmung, Krone, Check, Vielleicht, Kreuz, Sprache, ICS-Download, Kopieren, Feiertag, Link, „Alle können"-Badge. Weitere Icons (Zurück, Menü, Schließen, Info, Uhr, Auge, Person) im selben Stil ergänzen bzw. aus **Lucide** (ISC-Lizenz, gleicher Strich-Stil) übernehmen.

**Illustrationen** (`assets/illustrations/`): flache Formen auf einem Teller (Kreis), Motive Sonne/Horizont/Koffer/Kalender, max. 5 Farben aus der Palette, keine Figuren mit Gesichtern (neutral, kulturunabhängig). Farben über `--ww-illu-*`-Tokens (inline) mit eingebauten Fallbacks und eigener Dark-Variante (`prefers-color-scheme`). Größe 160–240 px breit, `alt=""` wenn der Leerzustands-Text daneben alles sagt.

| Datei | Einsatz |
|---|---|
| `empty-trips.svg` | „Meine Reisen" leer (F-044) – mit CTA „Neue Reise planen" |
| `empty-nobody.svg` | Heatmap/Gruppe, solange niemand abgegeben hat (F-007, F-008) – mit „Link teilen" |
| `vote-done.svg` | Ergebnis festgelegt (F-012) |

## 12. Prüfprotokoll Barrierefreiheit (für Reviewer)

1. Kontraste der Tabellen §4 und §6.3 mit einem Tool (z. B. WebAIM Contrast Checker, axe) stichprobenartig gegenprüfen – alle Werte sind rechnerisch ermittelt und abgerundet.
2. Heatmap-Testreise mit 9 Personen und allen Stufen + Feiertag + heute + Auswahl + Vorschlag: in DevTools-Simulation Protanopie, Deuteranopie, Tritanopie, Achromatopsie – jede Stufe muss per Zahl und Pegel benennbar, Markierungen per Form erkennbar sein.
3. Forced-Colors (Windows Kontrastdesign): Zahlen, Symbole, Auswahl und Vorschlag sichtbar.
4. Tastatur: Fokus-Ring auf jeder Zelle sichtbar und nie mit „ausgewählt" verwechselbar.
5. Zoom 200 % und Textgröße 200 % (iOS „Größerer Text"): keine abgeschnittenen Labels, Kalender schaltet ggf. auf Liste.
6. `prefers-reduced-motion`: keine Skalierung/Verschiebung, kein Konfetti.
7. Beide Sprachen + Pseudo-Locale: keine abgeschnittenen Buttons/Tabs bei 360 px.

## 13. Übergabe & offene Punkte

**Bereit zur Umsetzung:** `tokens.css` (vollständig, Light/Dark/Reduced-Motion, Heatmap, Muster), Icon-Sprite, Favicon/App-Icon (Basis Variante A, vorbehaltlich Auftraggeber-Wahl), Illustrationen, Heatmap-Spezifikation §6, Komponenten-Optik §9, i18n-Regeln §10.

**Offen:** siehe [abstimmung-ux.md](abstimmung-ux.md) (UI/UX) und Bericht an den CEO (Auftraggeber: Name EN, Logo-Variante, Dark Mode im MVP, Figtree).

Changelog
- v0.1 (2026-10-08): Erstentwurf Phase 0.
