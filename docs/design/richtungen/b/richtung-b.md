# Richtung B – „Reise-Cockpit“

Stand: 2026-10-08 · Verantwortlich: Designer · Status: **gewählt** (Auftraggeber 2026-10-08, PRD §12 Q18, Palette B0) und **überführt in [Design-System v1.0](../../design-system.md)** – dieses Dokument ist ab jetzt Archiv/Begründung; bei Abweichungen gilt das Design-System (u. a. Kalender-Rand 8 px nach U-1, Tippflächen ≥ 44 px, Werkzeugleiste 150 px, keine hochzählenden Zahlen). Endgültige Assets: `docs/design/assets/`.
Bezug: [index.html](index.html) (7 High-Fidelity-Screens + Bausteine) · Vergleich: [Richtung A](../a/richtung-a.md) · [Design-System v0.5](../../design-system.md) · [tokens.css](../../tokens.css) · UX: [ux-spec](../../../ux/ux-spec.md), Wireframes W01, W02, W03, W08, W09, W10, W11

Anlass: Der Auftraggeber mag die Gestaltung der App **Finanzguru** und möchte eine zweite Richtung sehen, die sich an deren Prinzipien orientiert – ohne Kopie. Ziel bleibt: ansprechend, macht Spaß, nicht spartanisch.

---

## 1. Analyse: Was macht Finanzguru visuell aus?

**Methode und Grenze:** Die Website, die App-Store-Seiten und Brandfetch konnten nicht direkt abgerufen werden (Webabruf in dieser Umgebung nicht möglich). Die Analyse stützt sich auf Testberichte und Suchergebnisse (Quellen unten) sowie auf allgemeine Kenntnis der App. Punkte mit „(Kenntnis)“ sind **nicht live überprüft**. Der Auftraggeber sollte bestätigen, welche Elemente er konkret meint (siehe offene Punkte §14).

| # | Merkmal | Beobachtung | Beleg |
|---|---|---|---|
| 1 | **Farbe gegen das Branchen-Klischee** | Markenfarben Türkis und tiefes Violett statt Bank-Blau. Ein Testbericht schreibt, die Farben hätten „so gar nichts mit dem trockenen, überseriösen Image“ der Finanzbranche zu tun. Brandfetch erhebt automatisch #0FFDD9 (Türkis), #3C318F (Violett) und Weiß. | therichgirl.club, Brandfetch |
| 2 | **Dashboard als Zentrale, die Zahl zuerst** | Das Dashboard ist die zentrale Ansicht mit Gesamtübersicht; Kontoübersicht, Verträge und Analyse sind jeweils „zwei Fingertipps entfernt“. Kennzahl (Kontostand) groß oben, darunter weiße, abgerundete Karten (Kenntnis). | konto.org, kagels-trading.de |
| 3 | **Diagramme lesbar statt dekorativ** | Testbericht: „die Diagramme sind lesbar statt dekorativ“. Auswertung nach Kategorien, wenige Farben, runde Balken (Kenntnis). | kagels-trading.de, biallo.de |
| 4 | **Farbige Markierungen und eigene Icon-Welt** | „Farbliche Markierungen helfen, sich rasch zurechtzufinden“; Icons „verspielt, aber stimmig“. Für den App-Relaunch entstand ein eigenes Set aus 34 Icons, das „eine neue visuelle Ebene“ beitragen soll. Kategorien als Icons in getönten Kreisen/Kacheln (Kenntnis). | finanzwissen.de, Stefan Große Halbuer |
| 5 | **Charakter in kleinen Momenten** | Die Guru-Figur „wirkt niedlich und sympathisch“; beim Start „tüftelt er kurz hinter Wolken“ – ein Ladebildschirm, „der schön anzusehen ist“. | therichgirl.club |
| 6 | **Tonalität: Du, Fragen, einfach** | Schlichter Aufbau, auch für Einsteiger leicht verständlich. Analysen werden als Fragen formuliert („Wie viel kosten dich deine vier Wände?“). | t-online.de, Finanzguru-Ratgeberseiten |
| 7 | **Viel Weißraum, ruhige Flächen** | Helle Grundfläche, weiße Karten mit weichen Schatten, keine Konturen; Akzentfarbe sparsam für „positiv“ und Hervorhebungen (Kenntnis). | – |

**Kurz:** Finanzguru wirkt seriös und trotzdem gut gelaunt, weil (a) eine mutige, dunkle Markenfarbe mit einem leuchtenden Akzent kombiniert wird, (b) jede Ansicht mit der wichtigsten Zahl beginnt, (c) Daten klar und rund dargestellt werden, (d) Kacheln und Icons Orientierung geben und (e) Persönlichkeit in kleinen Momenten statt in Deko steckt.

### Quellen

- Erfahrungsbericht therichgirl.club – Farben Türkis/Lila, Guru-Figur, Ladebildschirm: <https://therichgirl.club/finanz-app-im-test-finanzguru/>
- Test kagels-trading.de – Oberfläche als stärkster Teil, „Diagramme lesbar statt dekorativ“: <https://www.kagels-trading.de/finanzguru-test/>
- Test finanzwissen.de – modernes Design, farbliche Markierungen, Icons verspielt aber stimmig: <https://finanzwissen.de/anbieter/finanzguru/test/>
- Test t-online.de – schlichter Aufbau, einsteigerfreundlich: <https://www.t-online.de/finanzen/ratgeber/verbraucher/id_100493796/finanzguru-haushaltsbuch-fuehren-leicht-gemacht.html>
- konto.org – Dashboard als zentrale Ansicht: <https://www.konto.org/software/finanzguru/>
- biallo.de – Auswertung per Diagramm: <https://www.biallo.de/anbieter/banking-app-finanzguru/>
- Brandfetch (automatisch erhobene Markenfarben): <https://brandfetch.com/finanzguru.de>
- Icon-Set zum App-Relaunch, Stefan Große Halbuer: <https://grossehalbuer.com/finanzguru-icon-set> · <https://www.behance.net/gallery/99419373/Finanzguru-Icon-Set>
- Finanzguru-Ratgeber zur App: <https://finanzguru.de/finanzwissen/finanzguru-app>
- App Store: <https://apps.apple.com/de/app/id1214803607>

### Was wir übernehmen – und was bewusst nicht

| Übernommen als **Prinzip** | **Nicht** übernommen |
|---|---|
| dunkle, mutige Markenfläche + ein leuchtender Akzent | Finanzgurus Farbcodes (unsere: Indigo #2B2266 statt #3C318F – tiefer und kühler; Minze #52E5B8 statt #0FFDD9 – deutlich grüner, weniger gesättigt) |
| Kennzahl zuerst, Details in Karten | Screens, Layouts 1:1, Kontokarten-Optik der Bank-Karten |
| Diagramme klar und rund, Farbe = Bedeutung | Kategorie-Farbsystem, Diagrammtypen 1:1 |
| Icons in getönten Kacheln, eigene Icon-Ebene | deren Icon-Set (© Rechteinhaber), Illustrationen |
| Persönlichkeit in kleinen Momenten | Guru-Figur, Wolken-Ladeszene, Name, Logo |

## 2. Leitidee

**Die Gruppe auf einen Blick.** Jede Reise hat ein **Cockpit**: oben eine tiefe Indigo-Fläche mit der einen Zahl, die gerade zählt („5 von 7 haben abgegeben“, „noch 3 Tage“, „noch 23 Tage“), darunter ruhige, weiße Karten mit den Details. Farbe bedeutet immer etwas: **Minze** = passt / alle können, **Sonne** = Freude und „zur Not“, **Lavendel** = Abstimmung, **Koralle** = Feiertag; die Heatmap ist eine Indigo-Rampe. Spaß entsteht durch **Fortschritt, den man sieht** – Ringe, die sich füllen, Balken, die wachsen, Kacheln, die man gern antippt – und durch einen lauten Moment: den Vorfreude-Ring, wenn der Termin feststeht.

Das Wort „Cockpit“ passt doppelt: Dashboard-Klarheit wie in einer guten Finanz-App und Reise-Gefühl (Flugzeug, Abendhimmel über dem Meer). Die Bildmarke „Sonnenkalender“ bleibt die Idee der Marke: Ihre Sonne geht im Ladezustand auf, ihre Wellen sind die Minze-Wellen der Reisekarte.

## 3. Stimmung

| Achse | Wir sind … | … und nicht |
|---|---|---|
| Ton | klar, freundlich, motivierend – „Noch 2 fehlen, dann habt ihr's!“ | kühl, technisch, Banken-Sprech |
| Farbe | Indigo-Nacht, Minze, Sonne, Lavendel auf zartem Nebel | Neon-Türkis, Regenbogen, Rot als Stimmungsfarbe |
| Form | weiche Karten, Kacheln, Ringe, runde Balken, keine Konturen | Aufkleber-Konturen (das ist A), Glas, 3D |
| Details | Zahlen zählen hoch, Ringe füllen sich, Häkchen ploppen | Maskottchen, Randnotizen in Handschrift |
| Vertrauen | Login/Code ruhig auf Hell, ein Brief mit Häkchen | Spielerei bei E-Mail, Code, Datenschutz |

## 4. Farbe

Methode wie v0.5 und A: relative Luminanz nach WCAG 2.x, Kontrast `(L1 + 0,05) / (L2 + 0,05)`, auf eine Nachkommastelle **abgerundet**. Alle Werte gerechnet, nicht gemessen – Stichprobe im Review mit WebAIM/axe.

### 4.1 Palette hell

| Rolle | Name | Hex | Kontrast | Einsatz |
|---|---|---|---|---|
| Grund | Nebel | `#F4F2FB` | – | Seitenhintergrund (Lavendel-Hauch) |
| Fläche | Weiß | `#FFFFFF` | – | Karten, Leisten |
| Vertieft | Nebel 2 | `#ECE9F7` | – | Segment-Spuren, Werkzeug-Tasten, Deaktiviert |
| Linie | Linie | `#E3DFF0` | dekorativ | Trennlinien in Karten |
| Text | **Tinte** | `#1E1A3D` | 14,9 Nebel · 16,5 Weiß · 13,8 Vertieft | Text |
| Text 2 | Tinte 2 | `#57527A` | 6,5 Nebel · 7,2 Weiß · 6,0 Vertieft | Sekundärtext |
| Text 3 | Tinte 3 | `#6E6992` | 4,6 Nebel · 5,1 Weiß | Metadaten – **nicht auf Vertieft** (4,2) |
| Rahmen | Rahmen | `#8A86A8` | 3,1 Nebel · 3,4 Weiß | Inputs, Stimm-Optionen, leere Code-Kästchen (1.4.11 ✔) |
| Marke / Aktion | **Indigo** | `#2B2266` | Weiß darauf **13,7** · gegen Nebel 12,4 | Cockpit-Kopf, Haupt-Taste hell, gewählte Stimme, Heatmap „alle“, Vorschlag-Band |
| Hover / Gedrückt | Indigo 600 / 900 | `#3A2F86` / `#221B52` | Weiß ≥ 11 | Tastenzustände; `#221B52` auch Dunkel-Cockpit |
| Akzent | **Minze** | `#52E5B8` | Indigo darauf **8,7** · gegen Indigo 8,7 · gegen Weiß nur 1,5 | Taste auf Indigo, Siegel „alle“, Fortschritt, Rahmen „alle können“. **Nie Text auf Hell.** |
| Akzent tief | Minze tief | `#1FBF94` | dekorativ | zweite Welle in Logo/Illustration |
| Ja / Geht | Minze-100 / **Minze-Text** | `#D9F8EC` / `#00775A` | Text 5,5 Weiß · 5,0 Nebel · 4,9 auf Minze-100; Tinte auf Minze-100 14,6 | „Geht“-Zellen, „Ja“, „Gespeichert“, „alle können“ |
| Abstimmung / Link | Lavendel 100 / **Lavendel-Text** | `#ECE6FF` / `#5A3FD0` | 6,8 Weiß · 6,1 Nebel · 5,6 auf Lavendel-100 | Links, Entwurf-Chip, Phase 2, Kacheln |
| Lavendel Flächen | Lavendel 200 / 300 | `#D6CFFA` / `#A79AF2` | Tinte 11,1 / 6,7 | Heatmap, Illustration, Phasen-Punkt |
| Freude | **Sonne** | `#FFCF4A` | Tinte 11,2 · Indigo 9,3 | „Platz 1“, aktueller Schritt, Logo-Sonne |
| Zur Not | Sonne-100 / Sonne-200 / Sonne-Text | `#FFF3CC` / `#FFDB73` / `#7A5200` | Tinte 14,9 / 12,3 · Sonne-Text auf 100: 6,2 | Zur-Not-Zellen, Vielleicht |
| Feiertag | **Koralle** | `#F0503F` | 3,5 Weiß · 3,1 Nebel | **nur Nicht-Text**: Eselsohr (immer mit Kerbe in Kartenfarbe) |
| Feiertag-Text | Koralle-100 / Koralle-Text | `#FFE4DF` / `#A3321F` | 5,7 | Feiertags-Chip |
| Nein | Nebel 2 / Tinte 2 | `#ECE9F7` / `#57527A` | 6,0 | „Nein“, „ohne Jonas“ – neutral, nicht rot |
| Fehler | Kirsche | `#B42318` | 6,5 Weiß · 5,9 Nebel | **nur** Fehler, immer mit Icon + Text |
| Fokus | Blau / Weiß | `#2B59C3` / `#FFFFFF` | Blau 5,7 auf Nebel · Weiß 13,7 auf Indigo | Fokus-Ring 3 px + 2 px Hof; **auf Indigo-Flächen weißer Ring** |

**Cockpit-Kopf:** Indigo `#2B2266` plus zwei weiche Lichtflecken (Minze ≤ 22 % oben rechts, Lavendel ≤ 30 % oben links). Am hellsten Punkt gerechnet: Weiß ≥ 8,4, Kopf-Text 2 `#CFC9F2` ≥ 5,0 (auf reinem Indigo 8,7). Tabs liegen auf einer Spur aus Weiß 10 % (Kopf-Text 2 darauf 6,5); aktiver Tab = weiße Pille mit Indigo-Text 13,7.

**Avatare** (8 Töne, bedeutungslos, Hash der Mitglieds-ID): `#FFD3C7` `#C9DBFF` `#D4F2B0` `#DCD3FF` `#FFE7A3` `#BDEFE0` `#FFCFE6` `#EADFCF` – Initialen in Tinte ≥ 10 : 1, kein Kontur, 2-px-Ring in der jeweiligen Flächenfarbe.

### 4.2 Heatmap hell – „Indigo-Rampe“ (ein Farbton, monoton dunkler)

| Stufe | Fläche | L | Vordergrund | Kontrast | Zusatz-Kodierung |
|---|---|---|---|---|---|
| keine Daten | transparent, gestrichelter Rahmen `#8A86A8` | – | Tinte 2 | 7,2 | Strich „–“, Rahmen 3,4 |
| niemand | `#EEECF5` + Schraffur 45° (Tinte 18 %) | 0,85 | Tinte | 14,1 | Schraffur |
| wenige | `#D6CFFA` | 0,66 | Tinte | 11,1 | Zahl |
| einige | `#A79AF2` | 0,38 | Tinte | 6,7 | Zahl |
| viele | `#5B48C9` | 0,11 | Weiß | 6,5 | Zahl |
| alle | `#2B2266` (Indigo) | 0,026 | Weiß | 13,7 | Zahl + **Minze-Siegel** (Minze gegen Zelle 8,7, weißer Ring 1,4 px) |

Nachbarstufen Fläche zu Fläche: 1,2 · 1,6 · 2,6 · 2,1 – wie in A und v0.5 nicht alle ≥ 3 : 1; die Information steckt in Zahl, Schraffur, Siegel, ◐ (1.4.1 erfüllt). Luminanz monoton → Graustufen und Farbfehlsichtigkeiten behalten die Reihenfolge. **Feiertag** = Koralle-Eselsohr oben rechts mit Kerbe in Kartenfarbe (Koralle gegen Weiß 3,5). **Vorschlag** = 4-px-Band in Indigo in der Fuge unter den Zellen mit Endkappen (13,7 gegen Weiß). „Alle können“ und „Vorschlag“ haben damit dieselbe Markenfarbe – gewollt: Der beste Zeitraum ist der „indigofarbene“.

Warum Indigo statt Teal wie in v0.5/A: In B ist Indigo die Markenfarbe; die tiefste Stufe der Heatmap ist damit buchstäblich „die Farbe der Reise“. Teal/Minze bleibt die Bedeutung „passt“ (Siegel, Geht, Ja).

### 4.3 „Meine Tage“ hell

| Zustand | Fläche | Muster | Symbol | Kontrast |
|---|---|---|---|---|
| Geht (Standard) | `#D9F8EC` | glatt | – (wie v0.5: kein Häkchen in der Zelle) | Tinte 14,6 |
| Zur Not | `#FFF3CC` / `#FFDB73` | Sonnenstreifen 135° | ◐ auf Plakette | Tinte 14,9 / 12,3 |
| Geht nicht | `#DDD9EA` | Kreuzschraffur (Tinte 26 %) | ✕ auf Plakette | Tinte 11,9 |

### 4.4 Dunkel – „Mitternacht“ (folgt nur dem System, wie entschieden)

| Rolle | Hex | Kontrast |
|---|---|---|
| Grund | `#14112E` | – |
| Fläche / erhöht | `#1F1A45` / `#2A2458` | – |
| Cockpit-Kopf | `#221B52` + Lichtflecken | hebt sich nur 1,1 : 1 vom Grund ab – dekorativ, Trennung über Rundung und Inhalt |
| Text | `#F3F1FF` | 16,3 Grund · 14,5 Fläche · 12,6 erhöht |
| Text 2 / 3 | `#B9B4DC` / `#9C97C4` | 8,2 / 5,9 auf Fläche |
| Rahmen | `#7D77AD` | 3,9 auf Fläche |
| Links, „Ja“, Auswahl | Minze `#52E5B8` | 11,5 Grund · 10,2 Fläche |
| Haupt-Taste | Minze, Text `#14112E` | 11,5 |
| Ja-Chip | `#133C3B` / `#52E5B8` | 7,6 |
| Zur-Not-Chip | `#3A3113` / `#FFDB73` | 9,6 |
| Feiertag-Chip | `#4A1F1A` / `#FFB4A8` | 8,2 |
| Nein-Chip | `#2E2860` / `#D9D5F2` | 9,2 |
| Lavendel-Chip | `#2E2566` / `#C3B8FF` | 7,3 |
| Vorschlag-Band | Minze | 10,2 Fläche |

Heatmap dunkel (heller = mehr): niemand `#221C4A` + Schraffur (Text 14,1) · wenige `#362C7A` (Text `#F3F1FF` 10,4) · einige `#5B48C9` (Weiß 6,5) · viele `#A79AF2` mit Text `#14112E` (7,4) · alle Minze `#52E5B8` mit Text `#14112E` (11,5) + **dunkles Siegel** (Mitternacht-Kreis mit Minze-Haken, `assets/siegel-alle-b.svg`). Schatten tragen im Dunkeln nicht – Karten trennen sich über hellere Fläche, die gewählte Karte über einen 2-px-Minze-Rahmen.

## 5. Typografie

| Rolle | Schrift | Größe mobil | Einsatz |
|---|---|---|---|
| Display | **Plus Jakarta Sans** 800, −0,03 em | 32–34 px (Desktop 48–56) | Startseiten-Headline, „Es geht los!“ |
| H1 | Plus Jakarta 800 | 24–26 px (Reisekarte 28) | Seitentitel |
| Kennzahl | Plus Jakarta 800, `tabular-nums` | 16–20 px, Countdown 46 px | „5 von 7“, „noch 3 Tage“, „23“ |
| H2 / Datum | Plus Jakarta 800 | 18–19 px | „Mi., 5. Mai – Mo., 10. Mai“ |
| Reisename im Kopf | Plus Jakarta 800 | 21 px, eine Zeile mit „…“ | |
| Fließtext / Lead | **Figtree** 400–500 | 16 px | Inputs immer 16 px |
| Labels, Tabs, Tasten | Figtree 700–800 | 14 / 17 px | |
| Tags, Meta | Figtree 600–700 | 13 px (Minimum 12 px in Kalender und Legende) | |
| Kalender | Datum Figtree 12/600, Zahl Plus Jakarta 14/800 tabellarisch | | |

- **Warum Plus Jakarta Sans:** geometrische Grotesk mit offenen, freundlichen Formen und sehr guten Ziffern – genau der „Dashboard mit guter Laune“-Ton. Zahlen wirken in 800 kräftig, aber nicht laut. Passt neben Figtree (bereits freigegeben), ohne mit ihr zu konkurrieren: Plus Jakarta für Zahlen und Titel, Figtree für alles, was man liest und bedient.
- **Keine Handschrift** in B – die Persönlichkeit liegt in Zahlen, Fortschritt und Farbe.
- **Lizenz:** beide SIL OFL 1.1. Im Entwurf via Google Fonts, in der App **selbst gehostet** (DSGVO). Budget: Plus Jakarta Sans variabel (wght 500–800, Latin + Latin Extended) ca. 40–50 KB, Figtree ca. 35 KB → **ca. 80 KB**, weniger als A (≈ 105–120 KB).
- **Prüfen:** `tnum` in Plus Jakarta Sans (laut Schriftbeschreibung vorhanden – im Build verifizieren).
- Regeln aus v0.5 bleiben: `text-wrap: balance` für Überschriften, keine Versalien außer Mini-Labels, Layouts mit dem längeren Text bauen.

## 6. Formensprache

1. **Keine Konturen.** Flächen trennen sich über Helligkeit und weiche Schatten: Karte `0 1px 2px rgba(30,26,61,.06), 0 14px 30px -18px rgba(43,34,102,.38)`. Das ist der deutlichste Unterschied zu A.
2. **Cockpit-Prinzip:** Jede Reise-Ansicht beginnt mit dem Indigo-Kopf (Unterkante Radius 30). Darin nur: Zurück, Reisename + Phase (Text + farbiger Punkt), Tabs und **höchstens eine Kennzahl**. Alles andere liegt in Karten auf Nebel.
3. **Kachel-Prinzip:** Icons in 40-px-Kacheln (Radius 13) mit getöntem Grund und Icon in der passenden Textfarbe – Lavendel = Zeit/Planung, Minze = Gruppe/passt, Sonne = Dauer/Freude, Koralle = Feiertag/Hervorhebung, Indigo = Marke. Die Kachel ist nie die einzige Information (immer Text daneben).
4. **Daten-Formen:** Fortschrittsring (Strich 6–12 px, runde Enden), Stimmen-Balken (12 px hoch, voll gerundet, 4 px Lücke), Tages-Balken (oben 6 px, unten 3 px gerundet). Zahlen stehen **immer** als Text daneben.
5. **Radien:** Tasten **16** (bewusst keine Pille – „Dashboard“ statt „Aufkleber“), Karten 24, Reisekarte 26, Ergebnis-Karte 28, Cockpit-Unterkante 30, Kacheln 13, Kalenderzellen 11, Code-Kästchen 14, Chips und Tabs Pille.
6. **Bedienbar sieht bedienbar aus:** Tasten haben eine volle Fläche (Indigo, auf Indigo: Minze) oder einen 2-px-Indigo-Rahmen (Sekundär). Werkzeug- und Blätter-Tasten sind Kacheln auf Nebel 2 mit Icon. Reine Info-Karten haben nie Rahmen.
7. **Gewählt-Zustand:** Pinsel und Segmente = weiße Fläche + **2-px-Indigo-Rahmen + Punkt bzw. fett**; Stimme = **Indigo-Fläche + Minze-Häkchen-Ecke + fett**; Vorschlagskarte (dunkel) = 2-px-Minze-Rahmen + Häkchen in der Checkbox. Nie nur Farbe.
8. **Reisekarte:** Die Einladung ist eine Karte im Querformat mit Indigo-Verlauf, Abendsonne und Minze-Wellen am unteren Rand – Text nur im oberen, ruhigen Teil, nie auf Sonne oder Wellen.

## 7. Illustrationsstil

- **Flach, weich, ohne Kontur**, max. 5 Palettenfarben pro Motiv, Lichtflecken als halbtransparente Kreise (Sonne 8–30 %).
- **Produkt als Illustration:** Statt Szenen (A: Boot, Tram) zeigt B das, was die App tut – eine Übersichtskarte mit Ring, Heatmap und minzgrün eingerahmten „alle können“-Zeiträumen (Hero W01). Das ist das Finanzguru-Prinzip „Zahlen sind das Bild“, übersetzt.
- **Wiederkehrende Motive:** Sonne (immer Kreis + Schein), Minze-Wellen (aus dem Logo), konzentrische Bögen, vierzackige Funkel, Konfetti als abgerundete Rechtecke.
- **Keine Figuren, keine Gesichter** – bewusst kein Maskottchen (das wäre zu nah an Finanzgurus Guru). Die „Figur“ von B ist die Logo-Sonne.
- Zahlen in Illustrationen nur sprachneutral („5/7“), sonst **kein Text in Grafiken**.
- Dunkel: Motive bleiben, Flächen etwas heller (Violett statt Indigo für das Logo-Blatt: `logo-mark-b-auf-indigo.svg`).
- Alle Illustrationen dekorativ (`aria-hidden` / `alt=""`).

## 8. Komponenten-Look (Kurzfassung für die Screens)

| Komponente | Richtung B |
|---|---|
| Haupt-Taste hell | Indigo-Fläche, weißer Text 17/700, Radius 16, min. 54 px, weicher Indigo-Schatten; max. eine pro Screen |
| Haupt-Taste auf Indigo / dunkel | Minze-Fläche, Indigo- bzw. Mitternacht-Text (8,7 / 11,5) |
| Sekundär-Taste | Weiß, 2-px-Indigo-Rahmen, Indigo-Text |
| Reise-Kopf (Cockpit) | Indigo mit Lichtflecken, runde Icon-Tasten 44 px (Weiß 12 %), Reisename 21 px, Phase als Text + Punkt (Minze / Lavendel / Sonne) |
| Tabs | Pillen-Leiste auf Weiß 10 %; aktiv = weiße Pille, Indigo-Text, fett. Fallback < 375 px: horizontal scrollen |
| Kennzahl-Box (W09) | im Cockpit: Fortschrittsring 52 px + „5 von 7 haben abgegeben“ + Fehlende + Minze-Taste „Erinnern“ – ersetzt das Statusband |
| Kennzahl-Kacheln (W10) | zwei weiße Karten nebeneinander: Frist und Beteiligung |
| Kalender | in weißer Karte; Zell-Anatomie aus v0.5 §6.1 unverändert (Datum oben links, Zahl Mitte, ◐ unten links, Siegel unten rechts, Eselsohr oben rechts, Band in der Fuge); Zellen 46 px, Radius 11, Zeilenfuge 9 px |
| Wochenende | Lavendel-Spur 16 % hinter Sa/So, Kopf fett |
| Abstimmung | weiße Karte; „Platz 1“ als Sonnen-Chip in der Kopfzeile (nicht schräg); Segmente 60 px, Icon über Label; Vorschlag aus den eigenen Tagen gestrichelt mit „Nein?“ |
| Code-Feld | ein Input, sechs Kästchen; gefüllt = Lavendel-100 + Indigo-Rahmen, aktiv = Indigo-Rahmen + Fokus-Ring + Caret |
| Ergebnis | Vorfreude-Ring im Cockpit (Minze → Sonne), Countdown in der Mitte, Ergebnis-Karte darunter, Fortschritt als drei Balken |
| Avatare | Pastell ohne Kontur, Ring in Flächenfarbe, Krone auf Sonnen-Kreis, gestrichelt = offen |

## 9. Unterschiede zu Richtung A

| Bereich | A „Sonnenaufgang“ | B „Reise-Cockpit“ |
|---|---|---|
| Haltung | verspielt, Reisepost, Liebe zum Detail | klar, aufgeräumt, „Dashboard mit guter Laune“ |
| Grundton | warmes Papier `#FFF8EF`, Navy-Tinte | kühler Nebel `#F4F2FB`, Indigo-Tinte |
| Markenfläche | Phasen-Himmel (Lagune → Flieder → Gold) mit Welle | **ein** Indigo-Cockpit für alle Phasen; Phase als Text + farbiger Punkt |
| Aktion | Koralle-Pille mit Tinte-Kontur | Indigo-Taste (hell), Minze-Taste auf Indigo/dunkel, Radius 16 |
| Form | 2–2,5-px-Konturen, harter Versatzschatten, schräge Aufkleber | keine Konturen, weiche Schatten, Kacheln, nichts schräg |
| Heatmap | Meer-Rampe (Teal) + Sonnen-Siegel | Indigo-Rampe + Minze-Siegel |
| Zahlen | Teil des Inhalts | **Hauptdarsteller**: Ringe, Kennzahl-Kacheln, Count-up |
| Illustration | szenisch (Boot, Tram, Ticket), konturiert | Produkt als Illustration, flach, Lichtflecken |
| Einladung | Ticket mit Perforation | Reisekarte im Querformat |
| Feier | Goldene Stunde, Countdown-Marke | Vorfreude-Ring mit Countdown, Konfetti |
| Schrift | Bricolage Grotesque + Figtree + Caveat | Plus Jakarta Sans + Figtree (leichter) |
| Logo | A 2.0 mit Tinte-Kontur, Koralle-Himmel | B: Indigo-Blatt, Minze-Wellen, ohne Kontur |
| Dunkel | Navy-Nacht, Mond und Sterne | Mitternacht-Indigo, Cockpit bleibt, Minze leuchtet |

Gemeinsam (unverändert aus v0.5): alle Barrierefreiheitsregeln, Zell-Anatomie, Zählwert-Regel U-4, Glossar, i18n-Regeln, Sprachumschalter D-16, Ergebnis-Sichtbarkeit D-18, keine Bottom-Navigation, dieselben Beispieldaten.

## 10. Bewegung – Momente für den Motion Designer

Grundsatz: **Bewegung zeigt Fortschritt.** Zahlen zählen, Ringe füllen sich, Balken wachsen. Alles einmalig, nichts in Dauerschleife > 5 s (WCAG 2.2.2), nichts > 3 Hz. Bei `prefers-reduced-motion: reduce` sofort Endzustand bzw. Überblenden ≤ 150 ms.

| Moment | Idee | Dauer (Vorschlag) |
|---|---|---|
| **Ladezustand** | Logo-Sonne steigt im Kalenderblatt auf, die Wellen schwingen einmal nach (`logo-mark-b-sonnenkalender.svg`, Gruppen `sonne`, `welle`). Dauert das Laden > 5 s: statisch + Text „Lädt …“ | 900 ms, einmal |
| **Kennzahl ändert sich** (z. B. jemand gibt ab) | Ring wächst per `stroke-dashoffset` um ein Segment; die Zahl wechselt **sofort** (4 → 5, höchstens Überblenden) – **kein Hochzählen** (CEO 2026-10-08, Motion G-16, F-052) | 480 ms (`duration-moderate`) |
| **Fertig – abgeben** (W08) | Taste füllt sich, Text wird zum Häkchen, Wechsel ins Cockpit: eigener Ring-Schritt kommt dazu | ≤ 700 ms |
| **Malen in Meine Tage** | Zelle drückt sich kurz an (scale .96, 80 ms), Plakette ✕/◐ ploppt mit kleinem Überschwinger | ≤ 140 ms je Zelle |
| **Heatmap erscheint** (W09) | Zellen blenden zeilenweise ein (Versatz 20 ms), danach ploppen die Minze-Siegel, Rahmen „alle können“ zeichnet sich | ≤ 500 ms gesamt |
| **Vorschlag blättern** (W09) | Indigo-Band zeichnet sich von An- zu Abreisetag; auf Karten wachsen die Tages-Balken von unten (Versatz 30 ms) | 300 ms |
| **Abstimmen** (W10) | gewählte Option füllt sich von der Mitte mit Indigo, Minze-Häkchen ploppt, Stimmen-Balken wächst von links, Zahlen zählen | 220–400 ms |
| **Termin steht fest** (W11) | Vorfreude-Ring zeichnet sich von 0 auf voll, der Sonnen-Punkt reitet auf der Spitze mit, der Countdown **steht sofort** („23“, kein Hochzählen; zusätzlich als Text in der Ergebnis-Karte), Konfetti fällt einmal, Schein hellt einmal auf (endgültig: `assets/illustrations/countdown-ring.svg`, Ebenen `glow`, `confetti`, `track`, `ring`, `knob`, `sparkles`) | Kern ≤ 1 s, Ausklang ≤ 2,6 s |
| **Einladung öffnen** (W03) | Reisekarte gleitet von unten ein (leichter Überschwinger), Sonne geht in der Karte auf, Avatare reihen sich nacheinander ein, „+1“ pulsiert einmal | ≤ 1 s |
| **Code unterwegs** (W02/W03) | Brief gleitet in die Kachel, Minze-Häkchen ploppt; Kästchen bekommen beim Tippen ihren Rahmen (80 ms) | 400 ms |
| **Startseite** | Übersichtskarte schwebt ein, Ring füllt sich auf 5/7, Rahmen „alle können“ zeichnen sich | ≤ 1,5 s, dann still |
| **Tabs, Segmente** | aktive Pille gleitet zur neuen Position | 200 ms |
| **Tasten** | gedrückt: scale .98, Schatten kleiner, Indigo 900 | 80 ms |

## 11. Barrierefreiheit – Prüfpunkte dieser Richtung

1. **Minze ist kein Text auf Hell** (1,5 : 1). Für „Geht/Ja/Gespeichert“ als Text immer Minze-Text `#00775A`. Minze nur als Fläche mit Indigo-Inhalt oder auf Indigo/dunkel.
2. **Tasten ohne Kontur:** Indigo-Fläche gegen Nebel 12,4 (1.4.11 ✔). Minze-Taste gegen Indigo 8,7 ✔. Sekundär mit 2-px-Indigo-Rahmen.
3. **Gewählt-Zustände** über Rahmen + Punkt/Häkchen + Fettung, nie nur Farbe (Pinsel, Segment, Stimme, Vorschlagsauswahl).
4. **Fokus auf Indigo:** weißer 3-px-Ring (13,7) statt Blau (das auf Indigo nur 2,1 hätte).
5. **Lichtflecken im Cockpit** begrenzt (Minze ≤ 22 %, Lavendel ≤ 30 %) – Kopf-Text 2 bleibt ≥ 5,0.
6. **Heatmap:** Zahl in jeder Zelle, Schraffur „niemand“, Minze-Siegel „alle“, ◐ „zur Not“, Eselsohr „Feiertag“, Band „Vorschlag“ – alles Form/Text.
7. **Ringe und Balken** sind `aria-hidden`; die Werte stehen als Text daneben („5 von 7 haben abgegeben“, „4 Ja · 1 Vielleicht · 0 Nein“).
8. **Phase** steht als Text im Kopf, der farbige Punkt ist Zusatz.
9. **Forced Colors:** Karten ohne Kontur verlieren ihre Schatten → im Build `@media (forced-colors: active)` 1-px-Rahmen `CanvasText` für Karten, Kacheln und Tasten ergänzen; Siegel und ◐ sind SVG mit eigener Form.
10. Avatare ohne Kontur: Initialen tragen die Information (≥ 10 : 1), die Farbe ist bedeutungslos.

## 12. Textlängen DE/EN

| Element | DE | EN | Verhalten |
|---|---|---|---|
| Tabs | Übersicht · Meine Tage · Gruppe · Abstimmen (≈ 350 px bei 390, Innenabstand 7 px) | Overview · My dates · Group · Vote | DE passt bei 390 knapp; **360 px → scrollen** |
| Kennzahl-Box W09 | „5 von 7 haben abgegeben“ + 2–3 Zeilen | „5 of 7 have submitted“ | Taste „Erinnern“/„Remind“ rechts unten, Text bricht um |
| Kennzahl-Kacheln W10 | noch 3 Tage / bis Do., 15. April · 4 von 7 / haben abgestimmt | 3 days left / until Thu, 15 April · 4 of 7 / have voted | je Kachel halbe Breite, zweizeilig erlaubt |
| Startseite „So geht's“ | 3 Kacheln nebeneinander, Titel bis 3 Zeilen | „Everyone adds their dates“ | **< 375 px oder EN zu lang → als Liste untereinander** |
| Pinsel | Geht nicht · Zur Not · Geht | Can’t · If needed · Works | Label unter Mini-Feld |
| Haupt-Taste W08 | Fertig – abgeben | Done – submit | teilt die Zeile mit 3 Werkzeug-Kacheln (≈ 194 px Platz) |
| Rang | Platz 1 | Top choice | Chip wächst; Datum daneben bricht um |
| Countdown | noch / 23 / Tage | 23 / days / to go | HTML-Text im Ring, 3 Zeilen |
| Ergebnis | Es geht los! | We’re off! | Display |
| Reisekarte | Gruppenreise · Lissabon 2027 · 6 sind schon dabei | Group trip · … · 6 are in | Name einzeilig mit „…“, Sonne rechts hält 80 px frei |
| Kopfzeile Start | Wir wollen weg + English + Anmelden | When do we go? + Deutsch + Sign in | **eng** wie in A: < 375 px nur Bildmarke oder Anmelden als Icon |

## 13. Logo B

`assets/logo-mark-b-sonnenkalender.svg` – gleiche Idee wie Logo A (Sonne geht im Kalenderblatt über dem Meer auf), neu eingefärbt: **Indigo-Blatt, Sonne `#FFCF4A` mit Schein, Minze-Wellen, Lavendel-Ringe, ohne Kontur**. Für Indigo- und Dunkelflächen `logo-mark-b-auf-indigo.svg` (Blatt Violett `#5B48C9`, Ringe weiß). Wortmarke: Plus Jakarta Sans 800, „weg“ / „go?“ in Lavendel-Text (hell, 6,1 auf Nebel) bzw. Minze (auf Indigo, 8,7). Favicon-Test bei 16 px steht aus.

## 14. Offene Punkte (Abstimmung mit Auftraggeber, UI/UX und CEO)

1. **Welche Finanzguru-Elemente meint der Auftraggeber genau?** Die Analyse beruht auf Testberichten und Kenntnis, nicht auf aktuellen Screenshots. Bitte bestätigen oder ergänzen (z. B. Farbwelt, Karten, Diagramme, Guru-Charakter, Tonalität).
2. **Nähe zu Finanzguru:** Violett + Türkis ist deren Kernkombination. Unsere Töne weichen klar ab (Indigo tiefer, Minze grüner) und das Produkt ist ein anderes – trotzdem sollte der Auftraggeber bewusst entscheiden, ob ihm die Nähe recht ist. Alternative: Akzent Minze → Sonne tauschen.
3. **Kennzahl-Box im Cockpit (W09)** ersetzt das Statusband: Kopf wird ≈ 268 px hoch, der Kalender rutscht nach unten. UX: bestätigen oder Kennzahl-Box beim Scrollen einklappen lassen.
4. **Kennzahl-Kacheln in W10** (Frist + Beteiligung) statt Frist-Chip + Avatar-Reihe der Abgestimmten – UX prüfen, ob die Avatar-Reihe gebraucht wird (dann in „Wer hat wie gestimmt?“).
5. **Tages-Balken auf Vorschlagskarten** (Dunkel-Screen): das in U-10 vertagte Mini-Diagramm, nur als Ausblick, dekorativ. Entscheidung bei UX/CEO.
6. **Vorschlag-Leiste unten im Kalender** (W09) – wie in A Punkt 1, gleiche Frage an UX.
7. **Startseite:** „So geht's“ als drei Kacheln nebeneinander; bei 360 px und EN zur Liste umbrechen (UX: Breakpoint bestätigen). Hero-Karte ragt ≈ 90 px in den hellen Bereich – auf 360 × 640 prüfen, ob „Reise planen“ ohne Scrollen sichtbar ist (ja: Taste liegt im Indigo-Bereich darüber).
8. **Tasten-Radius 16 statt Pille** – Abweichung von v0.5; nur relevant, wenn B gewählt wird.
9. **Logo B** braucht die Freigabe des Auftraggebers (Logo A als Idee bleibt, Farben ändern sich). Favicon-Test 16 px.
10. **Forced-Colors-Rahmen** für konturlose Karten/Tasten im Build ergänzen (§11 Punkt 9).
11. **Dunkel:** Cockpit hebt sich kaum vom Grund ab (dekorativ) – im Review mit echtem Gerät ansehen.
12. Beispieldaten wie A: heute = Mo., 12. April 2027 („bis Do., 15. April“, „noch 23 Tage“).

## 15. Dateien

| Datei | Inhalt |
|---|---|
| `index.html` | Präsentationsseite: Leitidee, „Was wir von Finanzguru gelernt haben“, Schriften, Vergleich zu A, Palette, 7 Screens (W01, W03, W02/W03-Code, W08, W09, W10, W11, Dunkel W09-Vorschläge), Bausteine |
| `assets/logo-mark-b-sonnenkalender.svg` | Bildmarke B (Gruppen `sonne`, `welle` für den Ladezustand) |
| `assets/logo-mark-b-auf-indigo.svg` | Bildmarke B für Indigo-/Dunkelflächen |
| `assets/hero-cockpit-karte.svg` | Hero Startseite: Übersichtskarte (IDs `ring-fortschritt`, `zellen`, `rahmen-alle`, `sonne`, `haken`) |
| `assets/reisekarte-motiv.svg` | Reisekarte der Einladung inkl. Verlauf, Abendsonne, Wellen |
| `assets/brief-code-b.svg` | „Code ist unterwegs“ |
| `assets/vorfreude-ring.svg` | Feier-Cockpit mit Vorfreude-Ring und Konfetti (IDs `schein`, `konfetti`, `ring-spur`, `ring`, `ring-sonne`) |
| `assets/siegel-alle-b.svg` | Heatmap-Siegel „Alle: Geht“, hell und dunkel |
| `assets/kalender-muster-b.svg` | Heatmap-Stufen + Muster Meine Tage + Feiertag + Vorschlag-Band |
| `assets/icons-b.svg` | Icon-Sprite (30 Symbole, Duoton) mit Vorschau |
