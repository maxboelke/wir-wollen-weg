# Richtung B „Reise-Cockpit“: Farbpaletten B0–B3

Stand: 2026-10-08 · Verantwortlich: Designer · Status: **entschieden** – Auftraggeber wählt **B0 „Indigo & Minze“** (2026-10-08, PRD §12 Q18); B1–B3 sind verworfen (Archiv). Gültig: [Design-System v1.0](../../design-system.md).
Bezug: [index.html](index.html) (Vergleichsseite mit Umschalter) · [Richtung B](../b/richtung-b.md) · [Richtung B Screens](../b/index.html)

Anlass: Der Auftraggeber wählt Richtung B. Struktur, Formen, Kacheln, Cockpit-Kopf, Kennzahl und Vorfreude-Ring bleiben. Bei der Farbgebung (Indigo/Minze/Lavendel/Sonne) ist er unsicher und möchte drei andere Paletten sehen. B0 ist die bisherige Palette als Referenz.

---

## 1. Überblick

| | **B0 Indigo & Minze** (Referenz) | **B1 Terrakotta & Safran** | **B2 Ägäis: Azur & Zitrone** | **B3 Tanne & Messing** |
|---|---|---|---|---|
| Stimmung | Abflug bei Nacht, Dashboard-Klarheit | warm, mediterran, Aperitivo am Abend | frisch, hell, Sommermorgen am Meer | edel, ruhig, Reisetagebuch, Berghütte |
| Grund | Nebel `#F4F2FB` (Lavendel-Hauch) | Sand `#FBF5EE` (warm) | Eis `#F3F8FC` (kühl, fast weiß) | Leinen `#F6F4EF` (warmgrau) |
| Cockpit / Aktion | Indigo `#2B2266` | Terrakotta `#8E3519` | Azur `#0A5FC2` | Tanne `#1F4A3C` |
| Akzent (auf Cockpit, Dunkel-Taste) | Minze `#52E5B8` | Safran `#FFC24D` | Zitrone `#FFE45C` | Messing `#D9B86A` |
| Geht / Ja / alle | Minze | Pinie / Olive | Lagune (Türkis) | Grün / Salbei |
| Zur Not | Sonne | Honig | Zitrone | Honig |
| Abstimmungsphase | Lavendel | Pflaume | Flamingo | Schieferblau |
| Feiertag | Koralle | **Azulejo-Blau** | Koralle | Ziegel |
| Heatmap | Indigo-Rampe | Terrakotta-Rampe | Meer-Rampe (Aqua → Azur) | Wald-Rampe (Salbei → Tanne) |
| Dunkel | „Mitternacht“ | „Espresso“ | „Tiefsee“ | „Waldnacht“ |

Die vier Paletten unterscheiden sich im Farbton der Markenfläche (Violett-Blau, Rot-Orange, Himmelblau, Grün), in der Helligkeit des Cockpits (B2 ist deutlich heller als die anderen) und im Grund (kühl, warm, eisig, leinen).

## 2. Methode

- Relative Luminanz nach WCAG 2.x (sRGB linearisiert, `L = 0,2126 R + 0,7152 G + 0,0722 B`), Kontrast `(L1 + 0,05) / (L2 + 0,05)`, auf eine Nachkommastelle **abgerundet**. Gerechnet, nicht gemessen: Stichprobe im Review mit WebAIM/axe.
- Lichtflecken im Cockpit (halbtransparente Kreise) sind am hellsten Punkt gerechnet: Mischfarbe in sRGB, dann Kontrast.
- Pflichten je Palette: Text ≥ 4,5 : 1, UI-Elemente und Grafik ≥ 3 : 1 (1.4.11), Heatmap mit 5 Stufen + „keine Daten“, Zahl auf jeder Stufe ≥ 4,5 : 1, Helligkeit der Rampe monoton, Zusatzkodierung bleibt.

## 3. Was in allen Paletten gleich bleibt

- **Zusatzkodierung der Heatmap:** Zahl in jeder Zelle, Schraffur bei „niemand“, Siegel bei „alle“, ◐ bei „zur Not“, Eselsohr mit Kerbe in Kartenfarbe bei Feiertag, Band in der Fuge für den Vorschlag, gestrichelter Rahmen + „–“ bei „keine Daten“ (1.4.1 erfüllt, unabhängig von der Farbe).
- **Nein** ist immer neutral (Vertieft + Tinte 2), nie rot. **Fehler** ist immer Rot, immer mit Icon und Text, und nur dort.
- **Akzentfarbe nie als Text auf Hell** (alle Akzente liegen bei 1,3–1,9 : 1 gegen Weiß). Akzent nur als Fläche mit dunklem Text, auf dem Cockpit oder im Dunkelmodus.
- **Regel „Band“:** hell = Markenfarbe (wie die Stufe „alle“), dunkel = Ja-hell-Farbe. **Haupt-Taste dunkel** = Akzent mit Grund-Text. **Gewählt dunkel** (Rahmen, Checkbox) = Akzent.
- **Fokus:** Blau `#2B59C3` 3 px + 2 px Hof auf hellen Flächen (≥ 5,7 auf jedem Grund), weißer Ring auf dem Cockpit, Ring in Textfarbe im Dunkelmodus.
- **Avatare:** dieselben 8 Pastelltöne in allen Paletten (bedeutungslos), Initialen in der dunklen Tinte der Palette (≥ 10 : 1).
- **Vorfreude-Ring:** Verlauf von „Ja hell“ zur Sonnenfarbe der Palette, Sonnenpunkt mit Rand in Cockpitfarbe.
- Schriften, Radien, Schatten-Logik, Zell-Anatomie, Texte und Beispieldaten wie in Richtung B.

---

## 4. B0 „Indigo & Minze“ (Referenz)

Unverändert aus [richtung-b.md §4](../b/richtung-b.md). Kurzfassung:

| Rolle | Hex | Kontrast |
|---|---|---|
| Grund / Fläche / Vertieft | `#F4F2FB` / `#FFFFFF` / `#ECE9F7` | – |
| Tinte / 2 / 3 | `#1E1A3D` / `#57527A` / `#6E6992` | 16,5 / 7,2 / 5,1 Weiß · 14,9 / 6,5 / 4,6 Nebel |
| Rahmen | `#8A86A8` | 3,4 Weiß · 3,1 Nebel |
| Indigo (Cockpit, Aktion, „alle“, Band) | `#2B2266` | Weiß 13,7 |
| Minze (Akzent, Siegel) | `#52E5B8` | Indigo darauf 8,7 · gegen Weiß 1,5 |
| Ja | `#00775A` auf `#D9F8EC` | 4,9 (5,5 Weiß) |
| Zur Not | `#7A5200` auf `#FFF3CC` · Sonne `#FFCF4A` | 6,2 |
| Abstimmung / Links | `#5A3FD0` auf `#ECE6FF` | 5,6 (6,8 Weiß) |
| Feiertag | Koralle `#F0503F` · Chip `#A3321F` auf `#FFE4DF` | 3,5 Weiß · 5,7 |
| Fehler | `#B42318` | 6,5 Weiß |

Heatmap hell: `#EEECF5` 14,1 · `#D6CFFA` 11,1 · `#A79AF2` 6,7 · `#5B48C9` Weiß 6,5 · `#2B2266` Weiß 13,7.
Heatmap dunkel: `#221C4A` 14,1 · `#362C7A` 10,4 · `#5B48C9` Weiß 6,5 · `#A79AF2` 7,4 · `#52E5B8` 11,5.

**Vorteile:** klar, technisch sauber, sehr hohe Kontraste, Minze leuchtet. **Nachteile:** Violett + Türkis ist die Kernkombination von Finanzguru; kühl, eher „Fintech“ als „Urlaub“; Lavendel-Nebel wirkt etwas künstlich.

---

## 5. B1 „Terrakotta & Safran“ – warm, mediterran

**Stimmung:** Abendlicht auf Terrakotta-Dächern, ein Safran-Gelb wie die Tram in Lissabon, Sand als Grund, Azulejo-Blau als Feiertag. Fühlt sich nach Aperitivo auf der Dachterrasse an: warm, gesellig, nach Süden. Die Heatmap „glüht“: je mehr können, desto röter, wie eine Wärmekarte.

### 5.1 Hell – Primitive und Bedeutungen

| Rolle | Name | Hex | Kontrast | Einsatz |
|---|---|---|---|---|
| Grund | Sand | `#FBF5EE` | – | Seitenhintergrund |
| Fläche | Weiß | `#FFFFFF` | – | Karten, Leisten |
| Vertieft | Sand 2 | `#F3EAE0` | – | Segment-Spur, Werkzeug-Tasten, Nein |
| Linie | Linie | `#EADFD3` | dekorativ | Trennlinien |
| Text | Espresso | `#2B1A14` | 16,6 Weiß · 15,3 Sand · 14,0 Vertieft | Text |
| Text 2 | Espresso 2 | `#6B4E42` | 7,5 Weiß · 6,9 Sand · 6,3 Vertieft | Sekundärtext |
| Text 3 | Espresso 3 | `#85685B` | 5,0 Weiß · 4,6 Sand – **nicht auf Vertieft** (4,2) | Metadaten |
| Rahmen | Rahmen | `#9A8377` | 3,5 Weiß · 3,2 Sand | Inputs, leere Kästchen |
| Marke / Aktion / Links | **Terrakotta** | `#8E3519` | Weiß darauf 7,8 · gegen Sand 7,2 | Cockpit, Haupt-Taste, „alle“, Band, Links |
| Hover / Gedrückt | | `#A0401F` / `#6E2812` | Weiß 6,4 / 10,6 | Tastenzustände |
| Akzent | **Safran** | `#FFC24D` | Espresso darauf 10,3 · gegen Terrakotta 4,8 · gegen Weiß 1,6 | Taste auf Cockpit, Ring, Freude, „Platz 1“. Nie Text auf Hell |
| Ja / Geht | Pinie / Pinie-100 | `#2F6B3A` / `#E3F0D8` | 6,3 Weiß · 5,9 Sand · 5,3 auf Pinie-100; Espresso auf Pinie-100 14,0 | „Ja“, „Gespeichert“, Geht-Zellen |
| Ja hell | **Olive** | `#B9E08F` | gegen Terrakotta 5,2 · Espresso darauf 11,2 | Siegel „alle“, Phasen-Punkt 1, Dunkel-Ja |
| Zur Not | Honig-100 / 200 / Text | `#FFF0C7` / `#FFD978` / `#7A5000` | Text auf 100: 6,2; Espresso 14,7 / 12,2 | Zur-Not-Zellen, Vielleicht |
| Sonne | = Safran | `#FFC24D` | Espresso 10,3 | Logo-Sonne, aktueller Schritt, Krone |
| Abstimmung | Pflaume / Pflaume-100 | `#7A3E6E` / `#F5E6F0` | 7,6 Weiß · 7,0 Sand · 6,3 auf 100 | Phase 2, Entwurf-Chip, Kacheln |
| Abstimmung Punkt | Pflaume hell | `#E3A6D6` | dekorativ | Phasen-Punkt, Konfetti |
| Feiertag | **Azulejo** | `#2F5FB3` | 6,1 Weiß (auch als Text) · Chip auf `#E3ECFA` 5,1 | Eselsohr, Feiertags-Chip |
| Nein | Sand 2 / Espresso 2 | `#F3EAE0` / `#6B4E42` | 6,3 | neutral |
| Fehler | Kirsche | `#B0123B` | 7,0 Weiß · 6,4 Sand | nur Fehler |
| Fokus | Blau | `#2B59C3` | 5,8 Sand | Fokus-Ring |

**Warum Feiertag in Blau:** Auf einer roten Rampe würde ein Koralle-Eselsohr verschwinden. Azulejo-Blau ist der Gegenpol, sichtbar auf jeder Stufe, und passt zum Beispiel Lissabon.
**Warum Fehler in Kirsche statt `#B42318`:** Das Standard-Rot liegt zu nah an Terrakotta. Kirsche ist kühler (Richtung Karmin) und damit unterscheidbar; Fehler bleiben zusätzlich an Icon + Text erkennbar.

**Cockpit-Kopf:** Terrakotta mit Lichtflecken Safran ≤ 10 % (oben rechts) und Pfirsich `#E8875C` ≤ 14 % (oben links). Am hellsten Punkt: Weiß ≥ 6,5, Kopf-Text 2 `#F7D9C9` ≥ 4,9 (auf reinem Terrakotta 5,8). **Tab-Spur und Kennzahl-Box dunkel statt weiß:** `rgba(40,10,0,.22)`, Kopf-Text 2 darauf 7,3 (mit Weiß 10 % wären es nur 4,6). Aktiver Tab: weiße Pille, Terrakotta-Text 7,8. Sprachlink im Kopf weiß (Safran wäre am Lichtfleck nur 4,1).

### 5.2 Heatmap hell – „Terrakotta-Rampe“

| Stufe | Fläche | Vordergrund | Kontrast | Zusatz |
|---|---|---|---|---|
| keine Daten | transparent, Rahmen `#9A8377` gestrichelt | Espresso 2 | 7,5 | „–“, Rahmen 3,5 |
| niemand | `#F2ECE6` + Schraffur (Espresso 18 %) | Espresso | 14,2 | Schraffur |
| wenige | `#FADCC8` | Espresso | 12,8 | Zahl |
| einige | `#F0A889` | Espresso | 8,4 | Zahl |
| viele | `#BC5530` | Weiß | 4,6 | Zahl |
| alle | `#8E3519` | Weiß | 7,8 | Zahl + **Olive-Siegel** (5,2 gegen Zelle, weißer Ring) |

Nachbarstufen: 1,1 · 1,5 · 2,3 · 1,6. Feiertag: Azulejo-Eselsohr (6,1 gegen Weiß). Vorschlag-Band: Terrakotta (7,8 gegen Weiß).

### 5.3 „Meine Tage“ hell

| Zustand | Fläche | Muster / Symbol | Kontrast |
|---|---|---|---|
| Geht | `#E3F0D8` | glatt | Espresso 14,0 |
| Zur Not | `#FFF0C7` / `#FFD978` | Streifen 135°, ◐ | Espresso 14,7 / 12,2 |
| Geht nicht | `#E6DDD5` | Kreuzschraffur, ✕ | Espresso 12,4 |

### 5.4 Dunkel – „Espresso“

| Rolle | Hex | Kontrast |
|---|---|---|
| Grund / Fläche / Cockpit | `#1C130F` / `#2A1E18` / `#4A2014` | Weiß auf Cockpit 13,9 |
| Text | `#FBF1EA` | 16,4 Grund · 14,5 Fläche |
| Text 2 / 3 | `#CDB8AC` / `#A8917F` | 8,5 / 5,4 auf Fläche |
| Rahmen | `#8C766A` | 3,7 auf Fläche |
| Haupt-Taste | Safran, Text `#1C130F` | 11,3 |
| Links, Gewählt | Safran | 10,0 auf Fläche |
| Ja-Chip | `#24331C` / `#B9E08F` | 9,0 |
| Zur-Not-Chip | `#3D2E10` / `#FFD978` | 9,6 |
| Feiertag-Chip / Eselsohr | `#1B2A47` / `#A9C4F5` · Eselsohr `#7FA6EE` | 8,1 · 6,6 auf Fläche |
| Nein-Chip | `#3A2C25` / `#E6D7CC` | 9,5 |
| Abstimmung-Chip | `#3A2236` / `#E8B9DD` | 8,4 |
| Fehler | `#FF8A8A` | 7,1 auf Fläche |
| Vorschlag-Band | Olive `#B9E08F` | 10,8 auf Fläche |

Heatmap dunkel (heller = mehr): niemand `#2E211B` + Schraffur (Text 13,9) · wenige `#5A2E1F` (Text 10,2) · einige `#9A4426` (Weiß 6,5) · viele `#E08A5E` (Grund-Text 6,9) · alle Olive `#B9E08F` (Grund-Text 12,2) + dunkles Siegel. Nachbarstufen 1,3 · 1,7 · 2,4 · 1,7.

### 5.5 Logo B1
Blatt Terrakotta `#8E3519`, Sonne Safran mit Schein, Wellen Azulejo hell `#7FA6EE` und Azulejo `#2F5FB3`, Ringe Pfirsich `#F0A889`. Auf dem Cockpit: Blatt `#BC5530`, Ringe weiß. Wortmarke „weg“ in Terrakotta (hell) bzw. Safran (Cockpit).

### 5.6 Vor- und Nachteile
- **+** Am urlaubigsten und wärmsten, eigenständig (keine Fintech-Assoziation), Heatmap als „Wärme“ sofort verständlich, starker Bezug zu Südeuropa.
- **+** Feiertag in Blau ist auf der Rampe besser sichtbar als Koralle in B0.
- **−** Rote Haupt-Tasten können entfernt nach „Achtung“ aussehen; Fehler-Rot und Marke liegen im Farbton näher beieinander (gelöst über Kirsche + Icon, bleibt ein Restrisiko).
- **−** Stufe „viele“ hat mit 4,6 die knappste Zahl-Kontrastreserve aller Paletten.
- **−** Cockpit braucht dunkle statt weiße Tab-Spur (kleine Abweichung von der Bauweise in B).

---

## 6. B2 „Ägäis: Azur & Zitrone“ – frisch, hell

**Stimmung:** Kykladen-Blau, Zitronen und klares Lagunenwasser auf fast weißem Grund. Hell, sonnig, optimistisch, wie der erste Morgen am Meer. Das Cockpit ist ein klares Himmelblau statt einer Nachtfläche; die Heatmap wird zum Meer, das zur besten Zeit am tiefsten ist. Das Logo (Sonne geht über dem Meer auf) passt hier am direktesten.

### 6.1 Hell – Primitive und Bedeutungen

| Rolle | Name | Hex | Kontrast | Einsatz |
|---|---|---|---|---|
| Grund | Eis | `#F3F8FC` | – | Seitenhintergrund |
| Fläche | Weiß | `#FFFFFF` | – | Karten |
| Vertieft | Eis 2 | `#E7F0F7` | – | Spuren, Werkzeug, Nein |
| Linie | Linie | `#DCE7F0` | dekorativ | Trennlinien |
| Text | Tiefsee | `#0F2236` | 16,1 Weiß · 15,0 Eis · 13,9 Vertieft | Text |
| Text 2 | Tiefsee 2 | `#4A5D70` | 6,7 Weiß · 6,3 Eis · 5,8 Vertieft | Sekundärtext |
| Text 3 | Tiefsee 3 | `#5B6F82` | 5,1 Weiß · 4,8 Eis – **nicht auf Vertieft** (4,5, ohne Reserve) | Metadaten |
| Rahmen | Rahmen | `#788B9E` | 3,5 Weiß · 3,2 Eis | Inputs |
| Marke / Aktion / Links | **Azur** | `#0A5FC2` | Weiß darauf 6,1 · gegen Eis 5,7 | Cockpit, Haupt-Taste, Links, „alle“, Band |
| Hover / Gedrückt | | `#0B55AE` / `#08458F` | Weiß 7,1 / 9,2 | Tastenzustände |
| Akzent | **Zitrone** | `#FFE45C` | Tiefsee darauf 12,6 · gegen Azur 4,8 · gegen Weiß 1,3 | Taste auf Cockpit, Ring, „Platz 1“, Logo-Sonne. Nie Text auf Hell |
| Ja / Geht | Lagune-Text / Lagune-100 | `#00756B` / `#D5F5EF` | 5,5 Weiß · 5,2 Eis · 4,8 auf 100; Tiefsee auf 100 13,9 | „Ja“, Geht-Zellen |
| Ja hell | **Lagune** | `#3FD9C2` | gegen Azur 3,4 · Tiefsee darauf 9,1 | Siegel „alle“, Phasen-Punkt 1, Dunkel-Ja |
| Zur Not | Zitrone-100 / 200 / Text | `#FFF6C2` / `#FFE27A` / `#6B5300` | Text auf 100: 6,7; Tiefsee 14,7 / 12,6 | Zur Not, Vielleicht |
| Abstimmung | Flamingo / Flamingo-100 | `#B8266E` / `#FFE4F0` | 5,9 Weiß · 5,5 Eis · 4,9 auf 100 | Phase 2, Kacheln |
| Abstimmung Punkt | Flamingo hell | `#FF8CC0` | dekorativ | Phasen-Punkt, Konfetti |
| Feiertag | Koralle | `#EF5A3C` | 3,3 Weiß (nur Nicht-Text) | Eselsohr |
| Feiertag-Text | Koralle-100 / Text | `#FFE6DF` / `#A8321C` | 5,6 | Chip |
| Nein | Eis 2 / Tiefsee 2 | `#E7F0F7` / `#4A5D70` | 5,8 | neutral |
| Fehler | Kirsche | `#B42318` | 6,5 Weiß · 6,1 Eis | nur Fehler |
| Fokus | Blau | `#2B59C3` | 5,9 Eis | Fokus-Ring (nah an Azur, siehe Nachteile) |

**Cockpit-Kopf:** Azur ist heller als die Kopf-Farben der anderen Paletten (Weiß nur 6,1). Lichtflecken deshalb sehr zart: Weiß ≤ 6 % (rechts), Lagune ≤ 10 % (links). Am hellsten Punkt: Weiß ≥ 5,3, Kopf-Text 2 `#E6F0FF` ≥ 4,6 (auf reinem Azur 5,3). **Tab-Spur und Kennzahl-Box dunkel:** `rgba(6,38,84,.28)`, Kopf-Text 2 darauf 6,8 (mit Weiß 10 % nur 4,3 – nicht zulässig). Aktiver Tab: weiße Pille, Azur-Text 6,1. Sprachlink im Kopf weiß.

### 6.2 Heatmap hell – „Meer-Rampe“

| Stufe | Fläche | Vordergrund | Kontrast | Zusatz |
|---|---|---|---|---|
| keine Daten | transparent, Rahmen `#788B9E` gestrichelt | Tiefsee 2 | 6,7 | „–“, Rahmen 3,5 |
| niemand | `#EDF2F6` + Schraffur (Tiefsee 18 %) | Tiefsee | 14,3 | Schraffur |
| wenige | `#C2EAF0` | Tiefsee | 12,5 | Zahl |
| einige | `#7FD0DC` | Tiefsee | 9,1 | Zahl |
| viele | `#3AA8C8` | Tiefsee | 5,8 | Zahl |
| alle | `#0A5FC2` | Weiß | 6,1 | Zahl + **Lagune-Siegel** (3,4 gegen Zelle, weißer Ring) |

Nachbarstufen: 1,1 · 1,3 · 1,5 · 2,2. Der Sprung „viele → alle“ ist hier der größte – der beste Zeitraum fällt besonders auf. Feiertag: Koralle-Eselsohr (3,3 gegen Weiß, Komplementärkontrast zur blauen Rampe). Band: Azur (6,1).

### 6.3 „Meine Tage“ hell

| Zustand | Fläche | Muster / Symbol | Kontrast |
|---|---|---|---|
| Geht | `#D5F5EF` | glatt | Tiefsee 13,9 |
| Zur Not | `#FFF6C2` / `#FFE27A` | Streifen 135°, ◐ | Tiefsee 14,7 / 12,6 |
| Geht nicht | `#DCE5EE` | Kreuzschraffur, ✕ | Tiefsee 12,6 |

### 6.4 Dunkel – „Tiefsee“

| Rolle | Hex | Kontrast |
|---|---|---|
| Grund / Fläche / Cockpit | `#0B1626` / `#13233A` / `#0E2F5C` | Weiß auf Cockpit 13,2 |
| Text | `#F0F6FC` | 16,6 Grund · 14,5 Fläche |
| Text 2 / 3 | `#B3C3D4` / `#8DA0B5` | 8,7 / 5,8 auf Fläche |
| Rahmen | `#6F86A0` | 4,2 auf Fläche |
| Haupt-Taste, Gewählt | Zitrone, Text `#0B1626` | 14,2 |
| Links | Lagune `#3FD9C2` | 8,9 auf Fläche |
| Ja-Chip | `#0F3A3A` / `#3FD9C2` | 7,0 |
| Zur-Not-Chip | `#3A3210` / `#FFE27A` | 9,9 |
| Feiertag-Chip / Eselsohr | `#4A1E16` / `#FFB4A3` · Eselsohr `#FF8F7A` | 8,2 · 7,1 auf Fläche |
| Nein-Chip | `#22344D` / `#D3DEEA` | 9,2 |
| Abstimmung-Chip | `#42183A` / `#FFA8D2` | 8,2 |
| Fehler | `#FF8A8A` | 6,9 auf Fläche |
| Vorschlag-Band | Lagune | 8,9 auf Fläche |

Heatmap dunkel: niemand `#172A40` + Schraffur (Text 13,3) · wenige `#164A6E` (Text 8,6) · einige `#1F78A8` (Weiß 4,8) · viele `#4AA3CC` (Grund-Text 6,3) · alle Lagune `#3FD9C2` (Grund-Text 10,2) + dunkles Siegel. Nachbarstufen 1,5 · 1,9 · 1,7 · 1,6.

### 6.5 Logo B2
Blatt Azur `#0A5FC2`, Sonne Zitrone mit Schein, Wellen Lagune `#3FD9C2` und `#14A894`, Ringe Hellblau `#9CC8F2`. Auf dem Cockpit: Blatt `#4C93E8`, Ringe weiß. Wortmarke „weg“ in Azur (hell) bzw. Zitrone (Cockpit).

### 6.6 Vor- und Nachteile
- **+** Frischste und hellste Palette, sofort „Sommer am Meer“; Logo-Idee (Sonne über dem Meer) wird wörtlich.
- **+** Heatmap als Meer ist intuitiv (tiefer = mehr), Zahlen auf allen Stufen gut lesbar; größter Sprung zur Stufe „alle“.
- **+** Deutlich weg von Finanzgurus Violett/Türkis; Blau + Gelb ist sehr freundlich und breit gefällig.
- **−** Blau ist die häufigste App-Farbe – B2 muss seine Eigenständigkeit über Zitrone, Lagune und Flamingo holen.
- **−** Das hellere Cockpit hat die knappsten Kopf-Kontraste (Kopf-Text 2 ≥ 4,6) und braucht eine dunkle Tab-Spur.
- **−** Lagune-Siegel gegen Azur nur 3,4 (erfüllt 3 : 1, aber ohne Reserve); Fokus-Blau liegt nah an Azur (Ring ist durch Hof und Abstand trotzdem erkennbar).

---

## 7. B3 „Tanne & Messing“ – edel, ruhig

**Stimmung:** Tiefes Tannengrün, Messing und Salbei auf Leinen. Wie ein gutes Reisetagebuch, ein Nachtzug-Abteil oder die Hütte in den Bergen: gelassen, hochwertig, unaufgeregt. Vorfreude als ruhiges Leuchten statt als Party.

### 7.1 Hell – Primitive und Bedeutungen

| Rolle | Name | Hex | Kontrast | Einsatz |
|---|---|---|---|---|
| Grund | Leinen | `#F6F4EF` | – | Seitenhintergrund |
| Fläche | Weiß | `#FFFFFF` | – | Karten |
| Vertieft | Leinen 2 | `#ECE9E1` | – | Spuren, Werkzeug, Nein |
| Linie | Linie | `#E2DED4` | dekorativ | Trennlinien |
| Text | Moos-Tinte | `#1A2420` | 15,9 Weiß · 14,5 Leinen · 13,1 Vertieft | Text |
| Text 2 | Tinte 2 | `#4E5A54` | 7,2 Weiß · 6,5 Leinen · 5,9 Vertieft | Sekundärtext |
| Text 3 | Tinte 3 | `#65706A` | 5,1 Weiß · 4,6 Leinen – **nicht auf Vertieft** (4,2) | Metadaten |
| Rahmen | Rahmen | `#848D87` | 3,4 Weiß · 3,1 Leinen | Inputs |
| Marke / Aktion | **Tanne** | `#1F4A3C` | Weiß darauf 9,9 · gegen Leinen 9,0 | Cockpit, Haupt-Taste, „alle“, Band |
| Hover / Gedrückt | | `#2A5C4B` / `#163729` | Weiß 7,6 / 13,0 | Tastenzustände |
| Akzent | **Messing** | `#D9B86A` | Moos-Tinte darauf 8,3 · gegen Tanne 5,2 · gegen Weiß 1,9 | Taste auf Cockpit, Ring, „Platz 1“, Logo-Sonne. Nie Text auf Hell |
| Ja / Geht | Grün / Grün-100 | `#2D6A4F` / `#DDF0E3` | 6,3 Weiß · 5,8 Leinen · 5,3 auf 100; Tinte auf 100 13,4 | „Ja“, Geht-Zellen |
| Ja hell | **Salbei** | `#9FD6B4` | gegen Tanne 6,0 · Tanne darauf 6,0 | Siegel „alle“, Phasen-Punkt 1, Dunkel-Ja |
| Zur Not | Honig-100 / 200 / Text | `#FBF0D2` / `#F0D58C` / `#6E5200` | Text auf 100: 6,4; Tinte 14,0 / 11,0 | Zur Not, Vielleicht |
| Abstimmung / Links | Schieferblau / -100 | `#3B5B8F` / `#E4EAF5` | 6,8 Weiß · 6,2 Leinen · 5,6 auf 100 | Phase 2, Links, Kacheln |
| Abstimmung Punkt | Schiefer hell | `#A9BCE0` | dekorativ | Phasen-Punkt, Konfetti |
| Feiertag | **Ziegel** | `#C8553D` | 4,3 Weiß (Nicht-Text) | Eselsohr |
| Feiertag-Text | Ziegel-100 / Text | `#FAE3DA` / `#9A3A25` | 5,6 | Chip |
| Nein | Leinen 2 / Tinte 2 | `#ECE9E1` / `#4E5A54` | 5,9 | neutral |
| Fehler | Kirsche | `#B42318` | 6,5 Weiß · 5,9 Leinen | nur Fehler |
| Fokus | Blau | `#2B59C3` | 5,7 Leinen | Fokus-Ring |

**Cockpit-Kopf:** Tanne mit Lichtflecken Messing ≤ 18 % (rechts) und Salbei ≤ 22 % (links). Am hellsten Punkt: Weiß ≥ 6,6, Kopf-Text 2 `#CFE0D6` ≥ 4,8 (auf reiner Tanne 7,2). Tab-Spur Weiß 10 % wie in B0 (Kopf-Text 2 darauf 5,4). Sprachlink im Kopf weiß.

### 7.2 Heatmap hell – „Wald-Rampe“

| Stufe | Fläche | Vordergrund | Kontrast | Zusatz |
|---|---|---|---|---|
| keine Daten | transparent, Rahmen `#848D87` gestrichelt | Tinte 2 | 7,2 | „–“, Rahmen 3,4 |
| niemand | `#EFEDE6` + Schraffur (Tinte 18 %) | Tinte | 13,6 | Schraffur |
| wenige | `#CBE5D3` | Tinte | 11,9 | Zahl |
| einige | `#9CC9AE` | Tinte | 8,6 | Zahl |
| viele | `#3B7D5F` | Weiß | 4,8 | Zahl |
| alle | `#1F4A3C` | Weiß | 9,9 | Zahl + **Salbei-Siegel** (6,0 gegen Zelle, weißer Ring) |

Nachbarstufen: 1,1 · 1,3 · 2,6 · 2,0. Feiertag: Ziegel-Eselsohr (4,3 gegen Weiß, Komplementär zur grünen Rampe). Band: Tanne (9,9).

### 7.3 „Meine Tage“ hell

| Zustand | Fläche | Muster / Symbol | Kontrast |
|---|---|---|---|
| Geht | `#DDF0E3` | glatt | Tinte 13,4 |
| Zur Not | `#FBF0D2` / `#F0D58C` | Streifen 135°, ◐ | Tinte 14,0 / 11,0 |
| Geht nicht | `#E3DFD6` | Kreuzschraffur, ✕ | Tinte 11,9 |

### 7.4 Dunkel – „Waldnacht“

| Rolle | Hex | Kontrast |
|---|---|---|
| Grund / Fläche / Cockpit | `#0F1714` / `#18241F` / `#173A2E` | Weiß auf Cockpit 12,4 |
| Text | `#EEF3EF` | 16,2 Grund · 14,2 Fläche |
| Text 2 / 3 | `#B5C4BB` / `#8FA197` | 8,8 / 5,8 auf Fläche |
| Rahmen | `#6F8278` | 3,9 auf Fläche |
| Haupt-Taste, Gewählt | Messing, Text `#0F1714` | 9,5 |
| Links | Salbei `#9FD6B4` | 9,7 auf Fläche |
| Ja-Chip | `#1D3A2B` / `#9FD6B4` | 7,5 |
| Zur-Not-Chip | `#383010` / `#F0D58C` | 9,1 |
| Feiertag-Chip / Eselsohr | `#45201A` / `#F5B3A3` · Eselsohr `#F08A72` | 8,0 · 6,5 auf Fläche |
| Nein-Chip | `#26332D` / `#D5DED8` | 9,5 |
| Abstimmung-Chip | `#1E2A44` / `#B8C8EE` | 8,5 |
| Fehler | `#FF8A8A` | 7,0 auf Fläche |
| Vorschlag-Band | Salbei | 9,7 auf Fläche |

Heatmap dunkel: niemand `#1E2B25` + Schraffur (Text 13,1) · wenige `#24503F` (Text 8,1) · einige `#3E7D62` (Weiß 4,8) · viele `#7FB898` (Grund-Text 7,9) · alle Salbei hell `#B4E6C7` (Grund-Text 13,0) + dunkles Siegel. Nachbarstufen 1,6 · 1,8 · 2,1 · 1,6.

### 7.5 Logo B3
Blatt Tanne `#1F4A3C`, Sonne Messing mit Schein, Wellen Salbei `#9FD6B4` und `#5FA582`, Ringe Messing. Auf dem Cockpit: Blatt `#2F6B57`, Ringe weiß. Wortmarke „weg“ in Messing dunkel `#8A6A1F` (hell, Logo-Ausnahme) bzw. Messing (Cockpit).

### 7.6 Vor- und Nachteile
- **+** Ruhigste und hochwertigste Wirkung; sehr hohe Kontraste (Marke 9,9), angenehm für lange Nutzung; eigenständig im Markt.
- **+** Grüne Rampe wird intuitiv als „passt“ gelesen; Ziegel-Feiertag hebt sich komplementär ab.
- **−** Am wenigsten „Party“: Vorfreude wirkt gedämpft, Messing leuchtet weniger als Minze, Safran oder Zitrone.
- **−** Ja-Grün und Markengrün liegen nah beieinander (die Bedeutung „Ja“ trägt deshalb stärker über Icon + Text).
- **−** Grün + Gold kann an Banken/Versicherungen oder Outdoor-Marken erinnern; das Meer im Logo wird zum Bergsee.

---

## 8. Vergleich auf einen Blick

| Kriterium | B0 | B1 | B2 | B3 |
|---|---|---|---|---|
| Urlaubsgefühl / Vorfreude | mittel (Abendflug) | **hoch (Süden, Wärme)** | **hoch (Meer, Sonne)** | mittel (ruhig, Berge) |
| Eigenständigkeit gegenüber Finanzguru | gering | hoch | hoch | hoch |
| Eigenständigkeit im App-Markt | mittel | hoch | mittel (viel Blau) | hoch |
| Heatmap intuitiv | gut | sehr gut (Wärme) | sehr gut (Meerestiefe) | gut |
| Kontrastreserve Kopf | sehr hoch | mittel | knapp | hoch |
| Kleinste Zahl-Kontraste Heatmap hell | 6,5 | 4,6 | 5,8 | 4,8 |
| Risiko Bedeutungs-Verwechslung | gering | Marke ↔ Fehler (Rot-Töne) | Fokus ↔ Marke (Blau) | Ja ↔ Marke (Grün) |
| Dunkelmodus | sehr gut | gut, warm | sehr gut | gut |

## 9. Empfehlung

**B2 „Ägäis“** als erste Wahl. Begründung: Sie verbindet das Cockpit-Prinzip am besten mit dem Produktgefühl. Die Logo-Idee (Sonne geht über dem Meer auf) wird wörtlich, die Heatmap als Meerestiefe versteht man ohne Legende, und Blau + Zitrone ist hell, freundlich und für eine breite Gruppe (alle Freundinnen und Freunde, nicht nur Design-Fans) gefällig. Sie löst sich klar von Finanzguru und wirkt im Hellmodus am leichtesten. Die knappen Kopf-Kontraste sind gerechnet und erfüllt; sie verlangen nur Disziplin bei den Lichtflecken (≤ 6 % / ≤ 10 %).

**B1 „Terrakotta“** als starke Alternative, wenn der Auftraggeber es wärmer und charaktervoller möchte – sie ist die urlaubigste der vier, verlangt aber Sorgfalt bei Fehlermeldungen (Kirsche + Icon) und wirkt mit roten Haupt-Tasten kräftiger.

**B3 „Tanne“** nur, wenn eine ruhige, erwachsene Anmutung wichtiger ist als Vorfreude-Energie. **B0** bleibt technisch die sauberste, ist aber am nächsten an Finanzguru.

Mischformen sind möglich, aber nicht empfohlen (z. B. B2 mit Safran statt Zitrone), weil jede Palette auf ihre eigene Rampe, Siegel- und Feiertagsfarbe abgestimmt und durchgerechnet ist.

## 10. Offene Punkte

1. **Auswahl durch den Auftraggeber:** Bitte die Seite `index.html` auf Desktop und Handy ansehen (Umschalter oben, „Alle untereinander“ als Standard) und eine Palette wählen. Danach überträgt der Designer die gewählte Palette in `tokens.css` und das Design-System; die Assets aus `../b/assets/` werden neu eingefärbt.
2. **Prüfung im Browser durch den CEO:** Die Kontraste sind gerechnet; Stichprobe mit WebAIM/axe im Review, besonders an den knappen Stellen: B1 „viele“ (4,6), B2 Kopf-Text 2 am Lichtfleck (4,6), B2 Lagune-Siegel gegen Azur (3,4), B2 Text 3 auf Vertieft (nicht verwenden).
3. **Tab-Spur dunkel statt weiß** in B1 und B2 (Kontrastgründe) – kleine Abweichung von der Bauweise in Richtung B; UI/UX muss nichts an der Struktur ändern, nur zur Kenntnis.
4. **Fehlerfarbe je Palette:** B1 nutzt Kirsche `#B0123B` statt `#B42318`. Falls der Auftraggeber eine palettenübergreifend einheitliche Fehlerfarbe wünscht, bleibt `#B42318` in B0, B2, B3.
5. **Favicon-Test 16 px** für das gewählte Logo steht weiterhin aus.
6. **Forced Colors** (aus Richtung B §11, Punkt 9) gilt unverändert für jede Palette.
