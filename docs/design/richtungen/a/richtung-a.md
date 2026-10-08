# Richtung A – „Sonnenaufgang“

Stand: 2026-10-08 · Verantwortlich: Designer · Status: **Entwurf zur Auswahl** (Look & Feel 2.0, ersetzt nichts in `docs/design/`, bis der Auftraggeber entschieden hat)
Bezug: [index.html](index.html) (7 High-Fidelity-Screens + Bausteine) · [Design-System v0.5](../../design-system.md) · [tokens.css](../../tokens.css) · UX: [ux-spec](../../../ux/ux-spec.md), Wireframes W01, W02, W03, W08, W09, W10, W11

Anlass: Feedback des Auftraggebers zum ersten App-Stand: „Das sieht sehr spartanisch aus. Ich möchte eine ansprechende App, die Spaß zu nutzen macht.“

---

## 1. Leitidee

**Jede Reise ist ein Sonnenaufgang.** Solange die Gruppe Tage sammelt, steht die Sonne noch tief über dem Meer. Während der Abstimmung steigt sie, und wenn der Termin feststeht, strahlt sie über allem. Der Himmel über jeder Reise zeigt diese Phase – morgens Lagune, nachmittags Flieder, abends Gold. So spürt man den Fortschritt, bevor man ihn liest.

Dazu kommt die Liebe zum Detail von **Reisepost**: Einladungen sind Tickets mit Perforation, der feste Termin bekommt eine Countdown-Marke, die Gruppe sitzt als bunte Aufkleber im selben Boot. Kräftige Tinte-Konturen und harte, kurze Versatzschatten machen Bedienelemente griffig wie Aufkleber. Zahlen, Zustände und Texte bleiben trotzdem nüchtern lesbar: Die Verspieltheit sitzt im Rahmen, in den Kalenderzellen bleibt alles klar.

Die Bildmarke A „Sonnenkalender“ trägt die Idee bereits in sich (Sonne geht im Kalenderblatt auf). Richtung A macht daraus das Ordnungsprinzip der ganzen App.

## 2. Stimmung

| Achse | Wir sind … | … und nicht |
|---|---|---|
| Ton | warm, verschmitzt, vorfreudig – wie die Nachricht „Leute, wir fahren!“ | kindlich, albern, Emoji-Flut, Maskottchen mit Gesicht |
| Farbe | sonnig und satt: Koralle, Sonne, Lagune, Flieder auf warmem Papier | Neon, Regenbogen, Rot als Stimmungsfarbe |
| Form | runde Pillen, Wellen, Tickets, Aufkleber mit Tinte-Kontur | Glas-Effekte, 3D, Hochglanz-Verläufe |
| Details | kleine Überraschungen am Rand (Handschrift-Notiz, Marke, freier Platz „+1“) | Dekoration mitten in Formularen oder Zahlen |
| Vertrauen | Login und Code bleiben ruhig – nur ein kleiner Brief als Gruß | Spielerei, wo es um E-Mail, Code und Datenschutz geht |

## 3. Referenzen (eigene Inspirationsquellen – Haltung, keine Kopiervorlage)

- **Reiseplakate der 1950er/60er** (Fluglinien, Bahn, Seebäder): große Sonne, wenige Flächen, eine Horizontlinie. Daraus: Sonne + Wellen als wiederkehrendes Motiv.
- **Lissabon selbst**: Elétrico 28 (die gelbe Straßenbahn), Terrakotta-Dächer, Azulejo-Weiß und -Blau. Daraus das Reise-Motiv „Stadt am Meer“ im Ticket.
- **Bordkarten, Briefmarken, Poststempel**: Perforation, Abriss-Kerbe, runde Marke mit gestricheltem Innenring. Daraus Ticket-Karte (Einladung, Ergebnis) und Countdown-Marke.
- **Laptop- und Koffer-Aufkleber**: kräftige Kontur, flache Farbe, leicht schräg aufgeklebt. Daraus Avatare als Aufkleber, „Platz 1“-Sticker, die gedrückte Taste als angedrückter Aufkleber.
- **Neo-Brutalismus „light“** im Web (Gumroad, Figma-Community-Seiten, Partiful-Einladungen): 2-px-Konturen + harter Versatzschatten wirken freundlich und taktil, ohne Spielzeug zu sein – bei uns gezähmt durch große Radien und warme Farben.
- **Editoriale Reise-Illustration** (Stadtführer-Karten, Monocle-Travel-Guides): reduzierte Häuser, Linien, keine Gesichter.
- **Echter Sonnenaufgang am Meer**: Farbfolge Türkis → Flieder → Gold für die drei Phasen-Himmel; nachts Navy statt Schwarz.

## 4. Farbe

Methode wie v0.5: relative Luminanz nach WCAG 2.x, Kontrast `(L1 + 0,05) / (L2 + 0,05)`, auf eine Nachkommastelle **abgerundet**. Alle Werte rechnerisch; Stichprobe im Review mit WebAIM/axe.

### 4.1 Palette hell

| Rolle | Name | Hex | Kontrast | Einsatz |
|---|---|---|---|---|
| Grund | Papier | `#FFF8EF` | – | Seitenhintergrund (wärmer als v0.5) |
| Fläche | Weiß | `#FFFFFF` | – | Karten, Leisten |
| Vertieft | Sand | `#F7EBDA` | – | Segment-Spur, Deaktiviert |
| Linie | Sandlinie | `#EBDDC9` | dekorativ | Kartenrand (nicht bedeutungstragend) |
| Text | **Tinte** | `#1D2440` | 14,4 auf Papier · 15,2 auf Weiß | Text **und** Konturen (Navy statt Schiefer – wärmer zur Koralle, edler als Schwarz) |
| Text 2 | Tinte 2 | `#4A5170` | 7,3 Papier · 7,7 Weiß · 6,6 Sand | Sekundärtext, inaktive Tabs |
| Text 3 | Tinte 3 | `#646B88` | 4,9 Papier · 5,2 Weiß | Metadaten, Countdown-Textbutton – **nicht auf Sand** (4,4) |
| Rahmen | Rahmen | `#7C8199` | 3,6 Papier · 3,8 Weiß | Inputs, Chips, inaktive Segmente (1.4.11 ✔) |
| Aktion | **Koralle** | `#FF7A59` | Tinte darauf **5,9** | Haupt-Button-Fläche. Fläche selbst gegen Papier nur 2,4 – deshalb **immer mit 2,5-px-Tinte-Kontur** (14,4) |
| Aktion Hover | Koralle hell | `#FF6A45` | Tinte darauf ≥ 5,4 | Hover |
| Wortmarke | Koralle 600 | `#D9481F` | 4,0 Papier | nur „weg“ / „go?“ in der Wortmarke (fett ≥ 18,7 px = große Schrift, 3:1 ✔) |
| Signal | Koralle kräftig | `#E5502B` | 3,6 Papier | **nur Nicht-Text**: Feiertags-Eselsohr, Vorschlag-Band |
| Signal-Text | Koralle-Text | `#A8360A` | 6,2 Papier · 5,3 auf Koralle-100 `#FFE3D8` | Feiertags-Chip |
| Freude | **Sonne** | `#FFC93C` | Tinte darauf 9,9 | Sonnen-Siegel „alle“, „Platz 1“, Text-Marker, aktueller Schritt, Illustration |
| „Zur Not“ | Sonne-100 / Sonne-Text | `#FFF1C7` / `#7A5200` | Tinte 13,5 · Sonne-Text 6,1 | Zur-Not-Zellen, Vielleicht, Statusband |
| Marke/Ja | **Lagune** | `#0B6B63` | 6,0 Papier · Weiß darauf 6,3 · auf Lagune-100 `#DDF3EE` 5,5 | Links, „Geht/Ja“, „Gespeichert“ |
| Abstimmung | **Flieder** | `#A995F5` (Fläche) · `#5B3FC4` (Text) | Text 6,7 Papier · 5,4 auf Flieder-100 `#E4DCFF` | Phase 2, Entwurf-Chip, Frist-Chip |
| Nein | Stein-100 / Tinte 2 | `#ECE6DC` / `#4A5170` | 6,2 | „Nein“, „ohne Jonas“ – weiter neutral, nicht rot |
| Fehler | Kirsche | `#B42318` | 6,2 Papier · 6,5 Weiß | **nur** Fehler/destruktiv, immer mit Icon + Text |
| Fokus | Blau | `#2B59C3` | 6,0 Papier | Fokus-Ring 3 px + 2 px Hof (wie v0.5) |

**Phasen-Himmel** (Verläufe, dekorativ): Tage sammeln `#BFE9E1 → #DDF3EE` · Abstimmen `#D7CCFF → #ECE6FF` · Steht fest `#FFC76B → #FFDFA0 → #FFEBD0`. Tinte darauf ≥ 10,6, Tinte 2 ≥ 5,0 (geprüft am dunkelsten Punkt jedes Verlaufs). Tab-Leiste liegt zusätzlich auf einer Spur aus Weiß 55 %.

**Avatar-Aufkleber** (8 Töne, bedeutungslos, Hash der Mitglieds-ID): `#FFC9B8` `#BFE0FF` `#DDEFA8` `#D9CCFF` `#FFE08A` `#B2E4DA` `#FFC4DD` `#F1DCC0` – Initialen in Tinte ≥ 10 : 1, Kontur 2 px Tinte.

### 4.2 Heatmap hell – „Meer-Rampe“ (ein Farbton, monoton dunkler)

| Stufe | Fläche | L | Vordergrund | Kontrast | Zusatz-Kodierung |
|---|---|---|---|---|---|
| keine Daten | transparent, gestrichelter Rahmen `#7C8199` | – | Tinte 2 | 7,3 | Strich „–“, Rahmen 3,6 |
| niemand | `#F1E6D6` + Schraffur 45° (Tinte 20 %) | 0,80 | Tinte | 12,3 | Schraffur |
| wenige | `#B2E4DA` | 0,70 | Tinte | 10,9 | Zahl |
| einige | `#6FCFC0` | 0,52 | Tinte | 8,2 | Zahl |
| viele | `#0F7D72` | 0,16 | Weiß | 5,0 | Zahl |
| alle | `#0B4A52` | 0,056 | Weiß | 9,9 | Zahl + **Sonnen-Siegel** (Sonne `#FFC93C` mit Tinte-Kontur, gegen Zelle 6,4) |

Nachbarstufen Fläche zu Fläche: 1,13 · 1,31 · 2,71 · 1,99 (wie in v0.5 nicht alle ≥ 3 : 1 – die Information steckt in Zahl, Schraffur, Siegel und ◐; 1.4.1 erfüllt). Luminanz monoton → Graustufen und alle Farbfehlsichtigkeiten behalten die Reihenfolge. Feiertag (Eselsohr) und Vorschlag (Band unter der Zelle) sind Form-kodiert wie in v0.5.

### 4.3 „Meine Tage“ hell

| Zustand | Fläche | Muster | Symbol | Kontrast |
|---|---|---|---|---|
| Geht (Standard) | `#DDF3EE` | glatt | – (wie v0.5: kein Häkchen in der Zelle) | Tinte 13,1 |
| Zur Not | `#FFF1C7` / `#F5CF63` | breite Sonnenstreifen 135° | ◐ auf Plakette | Tinte 13,5 / 10,4 |
| Geht nicht | `#DCD3C4` | Kreuzschraffur (Tinte 26 %) | ✕ auf Plakette | Tinte 10,3 |

### 4.4 Dunkel – „Nacht am Meer“ (folgt nur dem System, wie entschieden)

| Rolle | Hex | Kontrast |
|---|---|---|
| Grund | `#12162B` (Navy-Nacht, kein Schwarz) | – |
| Fläche / erhöht | `#1B2140` / `#252C52` | – |
| Text | `#F5EEE3` | 15,5 Grund · 13,6 Fläche · 11,7 erhöht |
| Text 2 / 3 | `#B7BAD6` / `#9A9EC0` | 8,2 / 6,0 auf Fläche |
| Rahmen | `#7A80A8` | 4,1 auf Fläche |
| Lagune → Mint | `#6FE0CF` | 11,3 Grund · 9,9 Fläche |
| Haupt-Button | `#FF8A6B`, Text `#0E1226` | 8,0 (Fläche gegen Grund 7,7 – Kontur nicht nötig) |
| Zur Not | `#3B3216` / `#FFE08A` | 9,8 |
| Feiertag-Chip | `#4A2418` / `#FFB59E` | 7,9 |
| Nein-Chip | `#2A3157` / `#D7DAF0` | 9,0 |
| Ja-Chip | `#173F45` / `#6FE0CF` | 7,2 |
| Vorschlag-Band | `#FF8A6B` | 7,7 Grund |

Heatmap dunkel (heller = mehr): niemand `#1E2442` + Schraffur (Text ≥ 13) · wenige `#1F4A57` (8,3) · einige `#23716D` (4,9) · viele `#6FE0CF` mit Text `#0E1226` (11,7) · alle `#CFF7EF` mit Text `#0E1226` (16,1) + Sonnen-Siegel (Tinte-Kontur trägt). Konturen der Aufkleber werden im Dunkeln zu Flächen: Karten trennen sich über hellere Fläche, die gewählte Karte über einen 2,5-px-Mint-Rahmen.

## 5. Typografie

| Rolle | Schrift | Größe mobil | Einsatz |
|---|---|---|---|
| Display | **Bricolage Grotesque** 800, −0,025 em | 34–40 px (Desktop 48–56) | „Es geht los!“, Startseiten-Headline |
| H1 | Bricolage 800 | 28 px (Reisename im Ticket 32) | Seitentitel |
| H2 / Kartentitel / Datum | Bricolage 800 | 19–20 px | „Mi., 5. Mai – Mo., 10. Mai“, Abschnitte |
| Reisename in der Kopfzeile | Bricolage 800 | 22 px, eine Zeile mit „…“ | |
| Fließtext / Lead | **Figtree** 400–500 | 16 / 17 px | Inputs immer 16 px (kein iOS-Zoom) |
| Labels, Tabs, Buttons | Figtree 700–800 | 14 / 17 px | |
| Tags, Meta | Figtree 600–700 | 13 px (Minimum) | |
| Kalender | Figtree, `tabular-nums` | Datum 12/600, Zahl 14/800 | |
| Randnotiz | **Caveat** 700 | 22–30 px | nur dekorativ, `aria-hidden`, nie Information, max. 1 pro Screen |

- **Warum Bricolage Grotesque:** Grotesk mit Charakter (leicht exzentrische Formen in a, g, e, kräftige Tinte-Fallen bei 800), wirkt handgemacht, aber nicht verspielt-rund; optische Größenachse hält kleine Titel lesbar. Zusammen mit Figtree (bereits freigegeben) ergibt das „Plakat-Titel + klare UI“.
- **Lizenz:** alle drei SIL OFL 1.1. Im Entwurf über Google Fonts eingebunden, in der App **selbst gehostet** (DSGVO), Subset Latin + Latin Extended; Budget ca. Bricolage (wght 600–800, opsz) 45–60 KB, Figtree 35 KB, Caveat 25 KB. Caveat ist Kür – fällt sie weg, entfallen nur die Randnotizen.
- **Prüfen:** ob Figtree `tnum` vollständig unterstützt; sonst Kalenderzahlen in Bricolage (hat tabellarische Ziffern) oder Systemschrift.
- Regeln aus v0.5 bleiben: `text-wrap: balance` für Überschriften, keine Versalien außer Mini-Labels, Layouts mit dem längeren Text bauen.

## 6. Formensprache

1. **Aufkleber-Prinzip:** Was man drücken kann oder was gefeiert wird, hat eine **2–2,5-px-Tinte-Kontur und einen harten Versatzschatten** (3–6 px nach unten, ohne Unschärfe): Haupt-Button, aktiver Tab, aktiver Pinsel, gewählte Stimme, Ticket, Ergebnis-Karte, Avatare. Reine Informationskarten bleiben flach mit Sandlinie. So ist „bedienbar“ auch formal unterscheidbar.
2. **Gedrückt = angedrückter Aufkleber:** Schatten 4 → 1 px, Element 3 px nach unten. Hover: Fläche heller, 1 px nach oben.
3. **Radien:** Buttons, Tabs, Chips **Pille**; Karten 24; Tickets/Ergebnis 30; Leisten oben 28; Kalenderzellen 10; Code-Kästchen 14. Innere Radien kleiner als äußere.
4. **Welle:** Unterkante jedes Phasen-Himmels und Meer in Illustrationen – dieselbe Kurve wie im Logo.
5. **Ticket-Perforation:** gestrichelte Linie + zwei halbrunde Kerben mit Tinte-Kontur. Trennt „worum es geht“ (Reise, Termin) von „was du tust“ (Zitat, Aktionen).
6. **Sonnenbogen:** gepunkteter Bogen rechts im Himmel, die Sonne sitzt je nach Phase tief / halb / oben, nachts der Mond. Rein dekorativ (`aria-hidden`); die Phase steht immer als Text unter dem Reisenamen („Tage sammeln · 5 von 7 fertig“).
7. **Leicht schräg:** nur Deko-Aufkleber (Randnotiz, „Platz 1“, Countdown-Marke) dürfen 3–9° gedreht sein – nie Text in Formularen, nie Kalender.

## 7. Illustrationsstil

- Flache Flächen in max. 5 Palettenfarben, **Tinte-Kontur 2–2,5 px** an Hauptobjekten (Sonne, Boot, Häuser, Tram), Wellen nur an der Kammlinie konturiert, Konfetti ohne Kontur.
- Wiederkehrende Motive: Sonne, Wellen, Kalenderblatt, Boot, Ticket, Brief mit Sonnen-Marke, Sterne/Funkeln (vierzackig).
- **Menschen ohne Gesichter:** die Gruppe erscheint als 7 runde Köpfe in Avatar-Farben (im Boot) – inklusiv, kulturneutral, und sie greift die Avatar-Aufkleber der UI auf.
- **Reise-Motive** (neu, Vorschlag): das Ticket trägt ein Motiv zur Reise-Art – hier „Stadt am Meer“ mit gelber Tram. Weitere Kandidaten: Strand, Berge, Schnee, Land/Ferienhaus, Festival. Kein Text in Grafiken.
- Dunkel: gleiche Motive, Himmel Navy mit Mond und Sternen; Kontur bleibt Tinte, Flächen werden leicht abgedunkelt (eigene Dark-Varianten nötig).
- Alle Illustrationen dekorativ (`aria-hidden`/`alt=""`); der Text daneben trägt die Aussage.

## 8. Komponenten-Look (Kurzfassung für die Screens)

| Komponente | Richtung A |
|---|---|
| Haupt-Button | Koralle, Tinte-Text 17/800, Pille, min. 54 px, Kontur 2,5 + Schatten 4 px; max. einer pro Screen |
| Sekundär-Button | Weiß, gleiche Kontur und gleicher Schatten, Tinte-Text |
| Reise-Kopf | Phasen-Himmel mit Welle, runde Icon-Buttons (44 px, Kontur), Reisename Bricolage 22 + Phasen-Untertitel |
| Tabs | Pillen-Leiste auf weißer 55-%-Spur; aktiv = weiße Pille mit Kontur + Schatten (Form, nicht nur Farbe). Fallback < 375 px: horizontal scrollen |
| Kalenderzelle | Anatomie aus v0.5 §6.1 unverändert (Datum oben links, Zahl Mitte, ◐ unten links, Siegel unten rechts, Eselsohr oben rechts, Band in der Fuge). Neu: Fuge vertikal 10 px (Platz fürs Band), Radius 10, Sonnen-Siegel statt ✓-Badge |
| Wochenende | sonnengelbe Spur hinter Sa/So, Kopf fett |
| Statusband | Sonne-100, Radius 20, gestrichelte Avatare der Fehlenden, Button „Erinnern“ darunter |
| Abstimmung | Karte mit Kontur, wenn schon abgestimmt; „Platz 1“ als schräger Sonnen-Aufkleber auf der Kartenkante; Segmente 60 px, Icon über Label, gewählt = Lagune-Fläche + 2,5-px-Rahmen + Schatten + Häkchen-Ecke; Vorschlag aus den eigenen Tagen gestrichelt mit „Nein?“ |
| Code-Feld | ein Input (v0.5 §9.2), sechs Kästchen; gefüllt = Aufkleber mit Kontur, aktiv = Koralle-Rahmen + Fokus-Ring + Caret |
| Ergebnis | Ticket-Karte überlappt den Goldhimmel, Countdown-Marke oben rechts, Phasen-Spur „Tage ✓ – Abstimmen ✓ – Steht fest ☀“ |
| Avatare | Aufkleber 32/40 px, Krone auf Sonnen-Kreis für Orga, gestrichelt = offen |

## 9. Was sich gegenüber v0.5 ändert

| Bereich | v0.5 | Richtung A | Warum |
|---|---|---|---|
| Grundton | kühles Off-White, Schiefer-Text | warmes Papier `#FFF8EF`, Navy-Tinte | wärmer, „Urlaub“, Tinte verbindet Text und Konturen |
| Primärfarbe Aktion | Lagune-Teal, weißer Text | **Koralle mit Tinte-Kontur** | sichtbarer, fröhlicher, hebt sich von der Teal-Heatmap ab |
| Teal | Marke + Buttons + Heatmap | nur noch Heatmap, „Geht/Ja“, Links | eine Bedeutung je Farbe |
| Neue Farbe | – | **Flieder** = Abstimmungs-Phase | Phasen farblich unterscheidbar |
| Form | Radius 12, flache Karten, Systemschrift | Pillen, Aufkleber-Kontur + Versatzschatten, Tickets, Wellen | Charakter, Taktilität |
| Typo | Systemschrift + Figtree für Titel | **Bricolage Grotesque** für Titel, Figtree für alles andere, Caveat für Randnotizen | Plakat-Wirkung; Systemschrift wirkte „spartanisch“ |
| Kopfbereich | weiße Kopfzeile + Unterstrich-Tabs | **Phasen-Himmel** mit Sonnenbogen und Welle, Pillen-Tabs | Fortschritt fühlbar, jede Reise hat Atmosphäre |
| Heatmap | Lagune-Rampe, ✓-Badge | Meer-Rampe (gleiche Logik, Stufe „alle“ tiefer), **Sonnen-Siegel** | „alle können“ = die Sonne scheint |
| Illustration | geometrisch, ohne Kontur, auf Teller | konturiert, szenisch (Boot, Tram, Brief, Feier-Himmel), Gruppe als Köpfe | mehr Geschichte, mehr Wärme |
| Logo A | Teal-Blatt, Sonne, Wellen | **A 2.0**: Koralle-Morgenhimmel, Sonne mit Kontur, Wellen Teal/Tiefsee, Tinte-Kontur | gleiche Idee, passt zur Aufkleber-Sprache (Datei `assets/logo-mark-a2-sonnenkalender.svg`) |
| Dunkel | Schiefer-Schwarz | Navy-Nacht, Mond + Sterne | Fortsetzung der Himmel-Idee |
| Feier | Siegel + Konfetti | Goldene Stunde: Sonne mit Strahlen, Konfetti, Ticket mit Countdown-Marke | der eine laute Moment |

Unverändert übernommen: alle Barrierefreiheits-Regeln (v0.5 §2, §6, §12), Zell-Anatomie, Zählwert-Regel U-4, Glossar, i18n-Regeln §10, Sprachumschalter D-16, Ergebnis-Sichtbarkeit D-18, keine Bottom-Navigation.

## 10. Bewegung – Momente für den Motion Designer

Grundsatz: Bewegung erzählt den Sonnenaufgang und macht Aufkleber „physisch“. Alles einmalig, nichts in Dauerschleife > 5 s (WCAG 2.2.2), nichts > 3 Hz. Bei `prefers-reduced-motion: reduce` nur Überblenden bzw. statischer Endzustand.

| Moment | Idee | Dauer (Vorschlag) |
|---|---|---|
| **Phasenwechsel** (Abstimmung startet, Termin steht) | Sonne wandert auf dem Bogen eine Station weiter, Himmel blendet von Lagune → Flieder → Gold über | 700–900 ms, ease-out |
| **Termin steht fest** (W11) | Sonne steigt aus dem Meer, Strahlen klappen nacheinander auf, Konfetti fällt einmal, Countdown-Marke wird „aufgestempelt“ (Skalierung 1,25 → 1 + 9° Drehung, kleiner Überschwinger) | 1,2–1,6 s gesamt |
| **Fertig – abgeben** (W08) | Button drückt sich an, eigener Avatar bekommt ein ✓-Siegel, kleines Funkeln am Avatar | ≤ 500 ms |
| **Malen in Meine Tage** | Zelle 80 ms angedrückt (wie v0.5), Plakette ✕/◐ „ploppt“ mit Überschwinger; Muster sofort da | ≤ 140 ms je Zelle |
| **Vorschlag blättern** (W09) | Korallen-Band zeichnet sich von An- zu Abreisetag (Strichlänge), Zellen bleiben ruhig, Zahlen springen nicht | 300 ms |
| **Abstimmen** (W10) | Häkchen-Ecke ploppt (Feder), Ergebnisbalken wächst nach der eigenen Stimme von links | 220–400 ms |
| **Einladung öffnen** (W03) | Ticket gleitet von unten ein, die Tram fährt einmal ins Bild, der „+1“-Platz wackelt einmal | ≤ 1,2 s, einmalig |
| **Code unterwegs** (W02/W03) | Brief fliegt mit den Bewegungslinien herein; Kästchen werden beim Tippen zu Aufklebern (Schatten erscheint) | 400 ms / 80 ms |
| **Startseite** | Boot schaukelt 2–3 Mal sanft und kommt zur Ruhe, Vögel flattern einmal | ≤ 3 s, dann still |
| **Buttons, Tabs, Segmente** | Aufkleber-Druck: 3 px nach unten, Schatten 4 → 1 px | 80 ms |
| **Dunkel** | Sterne funkeln einmal beim Laden (kein Dauerflackern) | ≤ 1,5 s |

## 11. Barrierefreiheit – Prüfpunkte dieser Richtung

1. Haupt-Button: Koralle-Fläche selbst hat gegen Papier nur 2,4 : 1 → **Kontur ist Pflicht** (1.4.11), nicht Deko. Im Dunkelmodus trägt die Fläche selbst (7,7).
2. Aktiver Tab, aktiver Pinsel, gewählte Stimme: Zustand über **Kontur + Schatten + Fettung bzw. Häkchen/Punkt**, nie nur Farbe.
3. Phasen-Himmel und Sonnenbogen sind Deko – die Phase steht als Text im Untertitel.
4. Handschrift (Caveat) nur dekorativ und `aria-hidden`; nichts, was man wissen muss.
5. Heatmap: Zahl in jeder Zelle, Schraffur „niemand“, Sonnen-Siegel „alle“, ◐ „zur Not“, Eselsohr „Feiertag“, Band „Vorschlag“ – alles Form/Text, Farbe verstärkt nur.
6. Forced Colors: Konturen werden zu `CanvasText`, Versatzschatten entfallen (zulässig, Kontur bleibt). Siegel und ◐ als SVG mit Kontur → sichtbar.
7. Fokus-Ring bleibt Blau mit Hof (in den Screens am aktiven Code-Kästchen gezeigt).

## 12. Textlängen DE/EN

Alle Elemente ohne feste Breite; geprüft an den längsten Fällen im Entwurf:

| Element | DE | EN | Verhalten |
|---|---|---|---|
| Tabs | Übersicht · Meine Tage · Gruppe · Abstimmen (≈ 355 px bei 390) | Overview · My dates · Group · Vote | DE passt bei 390 px knapp; **360 px → scrollen** (Fallback wie v0.5) |
| Pinsel | Geht nicht · Zur Not · Geht | Can’t · If needed · Works | Label unter Mini-Feld, darf umbrechen |
| Haupt-Button W08 | Fertig – abgeben | Done – submit | teilt die Zeile mit 3 Icon-Buttons (≈ 190 px Platz) |
| Rang-Aufkleber | Platz 1 | Top choice | Pille wächst mit |
| Countdown-Marke | noch / 23 / Tage | 23 / days / to go | Text liegt als HTML auf der Marke, 3 Zeilen |
| Randnotiz | dauert nur 2 Min.! · für dich! | takes 2 min! · for you! | dekorativ, darf bei Platzmangel entfallen |
| Ergebnis | Es geht los! | We’re off! | Display, darf zweizeilig |
| Kopfzeile Start | Wir wollen weg + English + Anmelden | When do we go? + Deutsch + Sign in | **eng**: bei < 375 px Anmelden nur als Icon/Avatar-Menü oder nur Bildmarke |

## 13. Offene Punkte (Abstimmung mit UI/UX und CEO)

1. **Vorschlag-Leiste in der Kalender-Ansicht (W09, neu):** unten fixierte Leiste „‹ Vorschlag 1 von 5 ›“, die das Band im Kalender zeigt – verbindet Vorschläge und Heatmap ohne Segment-Wechsel. UX muss bestätigen (Verhältnis zum Segment „Vorschläge | Kalender“, Orga-Leiste „Abstimmung erstellen“).
2. **„Tage-Perlen“ auf Vorschlagskarten** (dunkler Screen): kleine Stufen-Pillen je Tag. Das ist der in U-10 vertagte Mini-Streifen – nur als Ausblick gezeigt, rein dekorativ; Entscheidung bleibt bei UX/CEO.
3. **Werkzeugleiste W08:** „Zeitraum“ als Icon-Button ohne sichtbares Label (Platz für den Haupt-Button in derselben Zeile); Leiste ≈ 190 px statt max. 150 px. UX: Label per Tooltip/Hinweiszeile ausreichend? Alternativ Label zurück und Haupt-Button eigene Zeile.
4. **Hero 196 px statt max. 160 px** (U-12/D-9): auf 360 × 640 prüfen, ob „Reise planen“ ohne Scrollen sichtbar bleibt; sonst Hero auf 160 px.
5. **Reise-Untertitel mit Phase** („Tage sammeln · 5 von 7 fertig“) unter dem Reisenamen – neue Information in der Kopfzeile, UX bitte bestätigen.
6. **Reise-Motive** (Ticket-Illustration je Reise-Art): Feature-Idee für den Product Manager; im MVP ein neutrales Standard-Motiv.
7. **Logo A 2.0** (Koralle-Himmel statt Teal-Blatt, Tinte-Kontur): Weiterentwicklung im erlaubten Rahmen, braucht aber die Freigabe des Auftraggebers; Favicon-Test bei 16 px steht aus.
8. **Koralle als Aktionsfarbe vs. Prinzip „Rot heißt Fehler“:** Koralle ist orange-warm und immer Button-Form mit Kontur; Fehler sind dunkles Kirschrot mit Icon und Text. Im Review mit Protanopie-Simulation gegenprüfen.
9. **Ladebudget:** drei Webfonts (≈ 105–120 KB) statt Systemschrift – gegen das Ziel „< 2 s auf 4G im In-App-Browser“ abwägen (Caveat optional).
10. Annahme für die Beispieldaten: heute = Mo., 12. April 2027 (daher „bis Do., 15. April“ und „noch 23 Tage“); das weicht vom Wireframe-Beispiel „heute = 3. Mai“ ab.

## 14. Dateien

| Datei | Inhalt |
|---|---|
| `index.html` | Präsentationsseite: Leitidee, Palette, Schriften, 7 Screens (W01, W03, W02/W03-Code, W08, W09, W10, W11, Dunkel W09-Vorschläge), Bausteine |
| `assets/logo-mark-a2-sonnenkalender.svg` | Bildmarke A 2.0 |
| `assets/hero-alle-in-einem-boot.svg` | Hero Startseite |
| `assets/motiv-stadt-am-meer.svg` | Ticket-Motiv Einladung |
| `assets/brief-code.svg` | „Code ist unterwegs“ |
| `assets/feier-sonne.svg` | Feier-Himmel „Goldene Stunde“ (mit Gruppen-IDs `sonne`, `strahlen`, `konfetti`, `meer` für die Animation) |
| `assets/countdown-marke.svg` | Countdown-Marke (Text als HTML darüber) |
| `assets/sonnen-siegel.svg` | Heatmap-Siegel „Alle: Geht“ |
| `assets/himmel-sonnenbogen.svg` | Phasen-Himmel mit Sonnenbogen, 4 Varianten |
| `assets/welle-kante.svg` | Wellen-Unterkante des Himmels |
| `assets/kalender-muster-a.svg` | Muster Meine Tage + Heatmap-Stufen |
| `assets/icons-a.svg` | Icon-Sprite (28 Symbole) mit Vorschau |
