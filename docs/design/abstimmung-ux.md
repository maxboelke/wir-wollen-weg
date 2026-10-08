# Abstimmung Design ↔ UI/UX

Stand: 2026-10-08 (Nachtrag Auftraggeber-Entscheidungen, D-19) · Verantwortlich: Designer · Gegenstück: [`docs/ux/abstimmung-design.md`](../ux/abstimmung-design.md) (UI/UX) · Bezug: [design-system.md](design-system.md), [tokens.css](tokens.css), [assets/README.md](assets/README.md)

Grundlage: UX-Spec, Sitemap, Wireframes W01–W14 und `abstimmung-design.md` (Stand 2026-10-08). Vielen Dank für die sehr präzisen Punkte – fast alles ist übernommen. Abweichungen sind mit **⚠ Abweichung** markiert und begründet.

---

## 1. Antworten auf `docs/ux/abstimmung-design.md` §2

| Punkt | Antwort Design | Wo festgelegt |
|---|---|---|
| **D-1 Heatmap-Zelle** | Feste Orte je Element: **Datum + Heute-Ring oben links · Feiertag (Eselsohr) Ecke oben rechts · Zählwert Mitte · ◐ zur Not unten links · ✓ Alle: Geht unten rechts** · Pegel (4 Segmente) nur ≥ 600 px · Auswahl innen · Fokus außen · Vorschlag-Band in der Fuge darunter. Prüffall „Feiertag + heute + Wochenende + ausgewählt + Fokus + ✓ + zur Not" passt in 45,7 × 52 px ohne Überlappung. **⚠ Abweichung:** ✓-Badge sitzt **unten rechts**, nicht oben rechts wie im Wireframe (★), weil oben rechts das Eselsohr liegt. | design-system §6.1 |
| D-1 Zählwert-Regel | **Bestätigt:** mobil „x/n" bis n ≤ 9, ab 10 nur „x" (n im Statusband/Legende); ≥ 600 px immer „x/n". Stufe `many` (Light, Weiß auf `#187E73`): Zahl 4,9:1; auf `many` liegt kein Muster, Badge und ◐ nutzen dieselbe Vordergrundfarbe → ebenfalls 4,9:1. | §6.1, §6.3 |
| D-1 Fokus auf `all` und neben Band | Neuer Token `--ww-focus-ring-isolated`: Hof 2 px + Ring 3 px + Hof 2 px in Hintergrundfarbe. Der Ring grenzt dadurch **nie** an eine Zelle oder das Band → 5,9:1 (L) / 8,6:1 (D) in jeder Lage. Fokussierte Zelle `z-index: 1`. | §6.5, tokens.css |
| D-1 Vorschlag über Umbrüche | Kappen nur an echtem An-/Abreisetag; am Zeilen-/Monatsende läuft das Band **ohne Kappe** bis an den Rasterrand (offene Kante) und beginnt in der nächsten Zeile ebenso offen. | §6.5 |
| D-1 nodata / außerhalb / vergangen | nodata: gestrichelter Rahmen + „–" (4,8 / 6,1). Außerhalb/vergangen: ohne Fläche, Datumszahl `--ww-hm-outside-fg` **3,2:1 (L) / 3,8:1 (D)** – erfüllt ≥ 3:1. | §6.3, §6.5 |
| D-1 Person ausgeblendet | Kein Zellzustand (einverstanden). Chip-Stil „aktiver Filter": `primary-tint` + 2-px-Rahmen `primary` + ✓-Icon + Text („✓ 1 ausgeblendet ▾"). | §9.5 |
| **D-2.1 „Geht" ohne Häkchen** | **Bestätigt.** Glatte Lagune-Fläche, Häkchen nur in Legende, Pinsel, Tagesdetail und im zugänglichen Namen. | §6.6 |
| D-2.2 Zieh-Vorschau | Zellen zeigen schon Fläche + Muster des Pinsels; um den Bereich **gestrichelter 2-px-Umriss in Textfarbe** (`--ww-cal-preview-border`), an Umbrüchen offen. Unterscheidet sich von „ausgewählt" (durchgezogener Doppelrahmen) und vom Vorschlag (Koralle-Band unten). | §6.6 |
| D-2.3 Startmarke | Doppelrahmen + **Ankerpunkt** 8 px (`--ww-cal-anchor`) mit Ring, mittig auf der linken Zellkante; dazu die Hinweiszeile aus W08. | §6.6 |
| D-2.4 Schreibgeschützt | Zustände bleiben voll farbig (keine Opazität); keine Hover/Druck-Reaktion; Erkennbarkeit über ersetzte Werkzeugleiste mit Schloss-Hinweis. | §6.6 |
| D-2.5 Entwurf vs. abgegeben | Einverstanden: kein Zellunterschied. | §6.6 |
| D-2.6 Setz-Feedback | 80 ms `scale(0.94 → 1)` + sofortiger Flächenwechsel; reduced motion: nur Flächenwechsel. | §6.6, §8 |
| **D-3 Zellbreite 360 px** | **⚠ Abweichung:** Fuge bleibt **4 px**, Seitenrand des Kalenders **8 px** (`--ww-size-cal-inset-sm`) → (360 − 16 − 24) / 7 = **45,7 px** (320 px: 41 px). Grund: Die 4-px-Fuge trägt die Wochenend-Spur und das Vorschlag-Band; bei 2 px wären beide kaum sichtbar. Ergebnis liegt zwischen deinen beiden Varianten (≥ 44 px erfüllt). Bitte ux-spec §2 („Kalender: 12 px") entsprechend anpassen. | §7, tokens.css |
| **D-4 Code-Feld** | **Bestätigt: ein `<input>`**, Kästchen rein visuell (Overlay-Variante beschrieben, Alternative mit `letter-spacing`). Alle geforderten Zustände gestaltet: leer, Fokus, gefüllt, Fehler, gesperrt (5 Fehlversuche), Prüfen, Erfolg, „Inhalt markiert". | §9.2 |
| **D-5 Werkzeugleiste** | Pinsel-Segmente mit Mini-Feld (Fläche + Muster) + Symbol + Label; aktiv = Zustandsfläche + 2-px-Rahmen + Punkt-Marke + Fettung. Bereichsmodus-Toggle, Rückgängig (deaktiviert), Schnellaktionen, Speicherstatus (3 Zustände + „Abgegeben · 14:32"), Primärbutton, kompakte Variante. Höhe ≤ 150 px (`--ww-size-toolbar-max`). | §9.13 |
| **D-6 Abstimmen-Schalter** | Zustände leer, gewählt (je Wert), **unbestätigter Vorschlag** (gestrichelter Rahmen, Umriss-Icon, Label „Vorschlag aus deinen Tagen"), gesperrt, Fokus. Ergebnisbalken mit Zahlen, Rang-Abzeichen „Platz 1", „ohne Jonas" als Stein-Chip, Warnhinweise in Amber. Unter 400 px Icon über Label. | §9.10 |
| **D-7 Phasen & To-do** | Phasen-Chips mit Text + Icon: Tage sammeln (Lagune hell) · Abstimmung läuft (Amber) · Steht fest (Lagune kräftig) · Vergangen (Sand). To-do-Zeile in **Koralle** (`--ww-todo-*`, 4-px-Kante links). Phasen-Leiste mit ✓ / Unterstrich / gedämpft. | §9.3, tokens.css |
| **D-8 Icons** | Alle 28 fehlenden Icons im Sprite ergänzt (`assets/icons/icons.svg`, IDs `ww-icon-…`, Liste in assets/README.md). Krone immer mit Label „Orga"/„Organizer" – übernommen. | §11 |
| **D-9 Illustrationen** | Alle 8 geliefert: `invite` (Einladung W03), `code-sent`, `no-matches`, `vote-waiting`, `error` (gemeinsam für W14), `goodbye`, `hero` (W01), `submitted`. Alle dekorativ, mobil max. 160 px hoch. | §11 |
| **D-10 Text & Typo** | Längenbudgets übernommen; `hyphens: auto` + korrektes `lang`, `overflow-wrap: anywhere` für Nutzerinhalte verankert. Tab-Stil: 14/600, Unterstrich, 8 px Innenabstand unter 400 px → „Übersicht · Meine Tage · Gruppe · Abstimmen" passt in 328 px; Fallback horizontal scrollbar mit Verlaufskante. | §9.4, §10 |
| **D-11 Sheet & Ebenen** | Zwei Rastpunkte (½ / fast voll, Tokens), Griff + Schließen-Button. Snackbar über der Leiste: `bottom = --ww-sticky-bar-h + 8 px + Safe-Area`; `--ww-z-toast` (50) > `--ww-z-sticky` (10). Desktop unten links. | §9.6, §9.7 |
| **D-12 Dark Mode** | **Einverstanden:** MVP folgt nur dem System, kein Schalter. `[data-theme]` bleibt für später/Tests. Bestätigt (Auftraggeber 2026-10-08): Dark Mode im MVP, nur System-folgend. | §13 |
| **D-13 Vorschlagskarte** | Gruppenüberschriften „Alle dabei" / „Fast alle dabei" mit Icon (Strich-Häkchen `ww-icon-check` / Personen, U-14) und 32 px Abstand; Zeitraum, Nächte, Urlaubstage ⓘ; Zusatz-Chips „◐ 2× zur Not" (Amber), „✕ ohne Jonas" (Stein), „⚑ inkl. Pfingstmontag" (Koralle hell); Text-Button „Im Kalender zeigen"; Orga-Checkbox. | §9.3 |

### 1a. Antworten auf `docs/ux/abstimmung-design.md` §6 (Runde 2: D-14 bis D-18)

| Punkt | Antwort Design | Wo festgelegt |
|---|---|---|
| **D-14** Gruppennamen | Umgestellt auf **„Alle dabei" / „Fast alle dabei"** („Everyone's in" / „Almost everyone's in"), CEO bestätigt. „können" bleibt nur in Optionszeilen („8 können · ohne Kemal"). SVG-Assets enthalten keine Gruppennamen – keine Änderung nötig. | design-system §6.2, §9.3 |
| **D-15** Tageslisten-Zeile | Optik geliefert: Stufenbalken 6 px links (zusätzliche Kodierung, `aria-hidden`), Datum mit Wochentag (Wochenende fett + Spur-Fläche, heute mit Ring), Zählzeile „4 von 5: Geht", Abzeichen-Chips in fester Reihenfolge ✓ alle · ◐ n Zur Not · Feiertag · Vorschlag n, Hover/Gedrückt/Fokus/Ausgewählt; Maße in `em`, keine neuen Tokens. | design-system §6.8 |
| **D-16** Sprachumschalter | **Entschieden (CEO, 2026-10-08)** zugunsten UX: nicht angemeldet Ein-Tipp-Umschalter mit `ww-icon-language` + „English"/„Deutsch" (mit `lang`), angemeldet im Avatar-Menü, Footer-Segment „Deutsch \| English" bleibt. | design-system §9.8, §9.4 |
| **D-17** Code-Feld | Fehlertext aus user-flows A.2 („Dieser Code stimmt nicht. Noch 3 Versuche.", Restversuche ab 2. Fehlversuch); gesperrt: „Neuen Code senden" als Primärbutton. | design-system §9.2 |
| **D-18** Ergebnis-Platzhalter | Vor der eigenen Stimme zu einer Option statt Balken/Zahlen/Rang/Avataren die Zeile „Stimm ab, um das Ergebnis zu sehen." / „Vote to see the results." (`text-muted`); Orga sieht immer das Ergebnis. | design-system §9.10 |

### 1b. Antwort auf D-19 (EN-Wortmarke „When do we go?", Auftraggeber 2026-10-08)

| Teilpunkt aus D-19 | Antwort Design | Wo festgelegt |
|---|---|---|
| Fragezeichen fester Teil der Wortmarke | **Bestätigt.** „?" steht in derselben Zeile, demselben `<tspan>`, derselben Schrift (Figtree 750, 30 px) direkt am „o", ohne Leerzeichen, ASCII U+003F. Es fehlt in keiner Variante (auch nicht in der mit Untertitel). | `logo-wordmark-en.svg`, `logo-wordmark-en-tagline.svg`, design-system §3.1 |
| Fragezeichen nicht hervorheben | **Bestätigt, mit Präzisierung:** Das „?" bekommt **keine eigene** Hervorhebung (keine andere Farbe, Größe, Sonnen-Amber o. Ä.). Es übernimmt die Farbe des Wortes, an dem es hängt: Die Markenfarbe liegt auf **„go?"** als Einheit – analog zu „weg" in der DE-Marke (letztes Wort = Pointe). Ein „?" in Textfarbe hinter einem farbigen „go" würde als abgetrenntes Zeichen wirken und damit gerade doch auffallen. Falls UI/UX „?" ausdrücklich in Textfarbe möchte: Änderung ist eine Zeile im SVG – bitte dann über CEO. | design-system §3.1 |
| `<title>` = «When do we go?» | **Umgesetzt** (Titel exakt «When do we go?», zusätzlich englische `<desc>`). Variante mit Untertitel: Titel «When do we go? Find dates for your group trip» – entspricht dem Landing-Titel aus ux-spec §3. | beide EN-SVGs |
| DE/EN gleich hoch | **Umgesetzt:** gleiche Box 320 × 72, gleiche Schriftgröße und Grundlinie (y = 46), Bildmarke an identischer Stelle → kein Layoutsprung beim Sprachwechsel. EN-Schriftzug ist bei gleichen 14 Zeichen ca. 8 % breiter (≈ 212 statt ≈ 195 px bei 30 px), liegt aber innerhalb derselben Box. | design-system §3.4 |
| Nur das W groß | **Umgesetzt:** „When do we go?". | `logo-wordmark-en.svg` |
| Namensregel je Sprache / Verweis | **Umgesetzt:** design-system §3.2 nennt die Design-Regeln (UI-Sprache bestimmt Namen, Icons sprachneutral, OG je Sprache) und verweist für Schreibweise/Satzbau verbindlich auf ux-spec §10.6 und §9. | design-system §3.2 |
| EN-Untertitel als Landing-Zusatz | **Einverstanden:** eigene Variante `logo-wordmark-en-tagline.svg` (≥ 300 px) für W01, OG-Bild EN, Mail-Kopf; nie in der Kopfzeile. | design-system §3.4 |

Außerdem übernommen: Glossar ux-spec §10.2 (Legende `availability-legend.svg` jetzt „Geht / Zur Not / Geht nicht" · „Works / If needed / Can't"), keine Emojis in UI-Texten, keine Bottom-Navigation, Reise-Tabs als Links, Segment „Vorschläge | Kalender" (mit 1,5-px-Rahmen am aktiven Segment, damit der Zustand ≥ 3:1 erkennbar ist).

## 2. Offen für UI/UX

**Stand 2026-10-08 (nach Auftraggeber-Entscheidungen): zwei Kleinpunkte offen – U-15, U-16.** U-1 bis U-14 sind von UI/UX beantwortet (`docs/ux/abstimmung-design.md` §4) bzw. vom CEO entschieden; finaler Status in §3. Die Tabelle U-1–U-14 bleibt als Verlauf stehen.

| # | Punkt | Vorschlag Design | Betrifft |
|---|---|---|---|
| **U-15** (neu) | **Kopfzeile/Landing mit EN-Namen:** Kopfzeile plant mit der etwas längeren EN-Wortmarke (gleiche Box 320 × 72, dargestellt 36 px hoch = 160 px Box, Inhalt ≈ 141 px EN / ≈ 133 px DE); Variante mit Untertitel nur auf W01/OG/Mail, nie im Header (design-system §3.4) | W01 und Header kurz gegenprüfen (ux-spec §10.6 Nr. 8 sagt bereits „passt ohne Sonderregel") | W01, ux-spec §10.6 |
| **U-16** (neu) | **`short_name` im Web-App-Manifest:** beide Namen 14 Zeichen, Homescreens kürzen teils ab ca. 12. Vorschlag: voller Name, auf iOS/Android testen; Fallback DE „Wollen weg"; EN nicht kürzen (Fragezeichen muss bleiben, ux-spec §10.6 Nr. 1) | entscheiden bzw. an PM/CEO geben | Manifest, ux-spec §10.6 |

| # | Punkt | Vorschlag Design | Betrifft |
|---|---|---|---|
| **U-1** | **Seitenrand Kalender 8 px statt 12 px** (D-3) | 8 px / Fuge 4 px → 45,7 px Zellbreite; ux-spec §2 und W08/W09-HTML-Skizzen anpassen – **entschieden (CEO, 2026-10-08)** | ux-spec §2, W08, W09 |
| **U-2** | **✓-Badge unten rechts** statt oben rechts (★ im Wireframe); ◐ unten links ohne Zahl (mobil), „◐2" ab 600 px | Wireframe-Legende und HTML-Skizze W09 angleichen – **entschieden (CEO, 2026-10-08)** | W09 |
| **U-3** | **Pegel (4 Segmente) erst ab 600 px** – mobil fehlt der Platz; Information steckt in Zahl + Badges | bestätigen | W09 |
| **U-4** | ~~Zählwert = Anzahl „Geht" … Alternative „können (Geht + Zur Not)"~~ → **entschieden durch CEO (2026-10-08):** Zahl bleibt „Anzahl ‚Geht' / abgegeben"; ✓ = alle Abgegebenen haben „Geht" (x = n); Tage ohne „Geht nicht", aber mit „Zur Not" zeigen ◐, kein ✓. „6/9 ✓ ◐" kann nicht mehr vorkommen. | Bitte W09-Legende, Tagesdetail-Kopf und zugängliche Namen (ux-spec §10.2) auf „x von n Geht" / „alle Geht" angleichen | F-008, W09, ux-spec §10.2 |
| **U-5** | **Textvergrößerung 200 %**: Die Zahl passt bei 200 % nicht mehr in 46 px Breite. Vorschlag: ab Root-Schriftgröße ≥ 24 px (bzw. Container-Query < 52 px Zellbreite) wechselt die Heatmap in eine **Tagesliste** (eine Zeile pro Tag: Datum · „6 von 9" · Badges), Meine Tage in eine Liste mit Zustands-Segmenten. Alternative: Zellen nur in der Höhe wachsen lassen und Zahl auf „x" kürzen. | Entscheidung UX (Verhalten); Optik liefere ich nach | ux-spec §7.1, W08, W09 |
| **U-6** | **Legende** der Heatmap (W09 zeigt „□ ░ ▒ ▓ █ ★ ~ °"): als Komponente mit echten Mini-Zellen (20 × 20 px mit Zahl-Beispiel, Muster, Badge, Eselsohr) in einer umbrechenden Zeile, einklappbar. Beim ersten Besuch aufgeklappt? | Zustand (offen/zu, Merken) entscheidet UX | W09 |
| **U-7** | **Snackbar-Position** braucht die Leistenhöhe als CSS-Variable `--ww-sticky-bar-h` (setzt das Layout, z. B. per ResizeObserver) | bestätigen, an Developer weitergeben | ux-spec §4.3 |
| **U-8** | **Abstimmen unter 400 px:** Icon über Label in den drei Segmenten (sonst passt „Vielleicht" nicht) – Segmente werden dadurch 56 px hoch | in W10 übernehmen | W10 |
| **U-9** | **Rang-Abzeichen-Text** „Platz 1" / „Top choice" (EN nicht „1st place", wirkt nach Wettbewerb) | Copy bestätigen | W10, ux-spec §10.2 |
| **U-10** | **Mini-Streifen** (6-px-Heatmap-Leiste des Zeitraums) auf der Vorschlagskarte – optional; hilft beim Wiedererkennen im Kalender, kostet eine Zeile | aufnehmen ja/nein | W09 |
| **U-11** | **Feiertagsliste unter dem Monat** (W08/W09): Darstellung 13 px `text-muted`, jeder Eintrag mit kleinem Eselsohr-Dreieck vorn (gleiche Form wie in der Zelle) – passt das zur Struktur? | bestätigen | W08, W09 |
| **U-12** | **Hero/Landing W01:** `hero.svg` ist 320 × 200 – mobil auf 160 px Höhe skaliert über oder neben der Headline? | Platzierung entscheidet UX | W01 |
| **U-13** | **Tagesdetail „Noch offen"**: gestrichelter Avatar-Ring (wie Teilnahmestatus F-007) statt nur Grau – bitte in W09 übernehmen | bestätigen | W09 |
| **U-14** (neu, Folge von U-4) | **Begriff „Alle können" in den Vorschlägen (F-009)** meint „niemand ‚Geht nicht'" und ist damit weiter als das ✓-Badge („alle ‚Geht'"). Design trennt optisch: Gruppenüberschrift mit Strich-Häkchen `ww-icon-check`, **nicht** mit dem gefüllten Badge; Zur-Not-Anteil als Chip „◐ 2× zur Not". Offen ist nur die **Benennung**: „Alle können" belassen (Design ok) oder z. B. „Alle dabei" / „Everyone's in"? | Copy-Entscheid UX (ggf. PM); Optik steht | W09, ux-spec §10.2, F-009 |

## 3. Abstimmungsstand (Design-Sicht)

Stand 2026-10-08, **final** (letzte Abstimmungsrunde). Legende: **erledigt** = beidseitig geklärt und in beiden Dokumentsätzen umgesetzt · **entschieden (CEO)** = verbindlich durch CEO · **entschieden (UX)** = Verhaltensentscheid UI/UX, Design hat übernommen · **bestätigt (Auftraggeber 2026-10-08)** = vom Auftraggeber entschieden (PRD §12 Q11–Q13). **Offen zwischen Design und UI/UX: nur der Kleinpunkt U-15 unten.**

| # | Thema | Status | Anmerkung |
|---|---|---|---|
| D-1 | Heatmap-Zelle (Anatomie, Zählwert, Fokus, Band, nodata) | erledigt | Badge-Position via U-2, ✓-Bedeutung via U-4 |
| D-2 | Meine Tage (Geht ohne Häkchen, Vorschau, Startmarke, schreibgeschützt, Feedback) | erledigt | |
| D-3 | Zellbreite 360 px | entschieden (CEO, 2026-10-08) | über U-1: 8 px Rand, 4 px Fuge |
| D-4 | Code-Feld als ein `<input>` | erledigt | Kleinkorrektur über D-17 |
| D-5 | Werkzeugleiste | erledigt | |
| D-6 | Abstimmen-Schalter | erledigt | < 400 px via U-8; Platzhalter via D-18 |
| D-7 | Phasen & To-do | erledigt | |
| D-8 | Icons | erledigt | 41 Icons; Titel `ww-icon-all-available` „Alle: Geht" |
| D-9 | Illustrationen | erledigt | Hero-Platzierung via U-12 |
| D-10 | Text & Typo | erledigt | Figtree: bestätigt (Auftraggeber 2026-10-08) |
| D-11 | Sheet & Ebenen | erledigt | `--ww-sticky-bar-h` via U-7 |
| D-12 | Dark Mode | entschieden (CEO), bestätigt (Auftraggeber 2026-10-08) | nur System-folgend, kein Schalter im MVP |
| D-13 | Vorschlagskarte | erledigt | Überschrift mit `ww-icon-check` (U-14), kein Mini-Streifen (U-10) |
| D-14 | Gruppennamen „Alle dabei" / „Fast alle dabei" | erledigt | CEO bestätigt beide Namen; design-system §6.2, §9.3 |
| D-15 | Optik Tageslisten-Zeile (große Schrift) | erledigt | design-system §6.8 |
| D-16 | Sprachumschalter Kopfzeile | **entschieden (CEO, 2026-10-08)** | zugunsten UX: Ein-Tipp-Umschalter „English"/„Deutsch" (nicht angemeldet), Avatar-Menü (angemeldet), Footer-Segment; design-system §9.8 |
| D-17 | Code-Feld Copy/Gewichtung | erledigt | design-system §9.2 |
| D-18 | Ergebnis-Platzhalter vor eigener Stimme | erledigt | design-system §9.10; Ergebnis-Sichtbarkeit selbst: bestätigt (Auftraggeber 2026-10-08, Q13) |
| D-19 | EN-Wortmarke „When do we go?" | erledigt (Design), Bestätigung UX zur Farbe von „?" erbeten | §1b; „?" Teil der Marke, keine eigene Hervorhebung, Markenfarbe auf „go?" als Einheit |
| U-1 | Kalender-Seitenrand 8 px, Fuge 4 px | entschieden (CEO, 2026-10-08) | in ux-spec §2, §7.2, W08, W09 umgesetzt |
| U-2 | ✓ unten rechts, ◐ unten links (≥ 600 px „◐2") | entschieden (CEO, 2026-10-08) | in ux-spec §4.9, W09 umgesetzt |
| U-3 | Pegel erst ab 600 px | erledigt | von UX bestätigt |
| U-4 | Zählwert / Bedeutung ✓ | entschieden (CEO, 2026-10-08) | Zahl = „Geht"/abgegeben; ✓ nur bei x = n; sonst ◐ |
| U-5 | Textvergrößerung 200 % → Tagesliste | entschieden (UX) | Heatmap → Tagesliste, Meine Tage bleibt Raster; Optik D-15 |
| U-6 | Legende als Komponente, Startzustand | entschieden (UX) | mobil beim ersten Besuch offen, Zustand gemerkt; ≥ 960 px immer sichtbar |
| U-7 | `--ww-sticky-bar-h` | erledigt | Umsetzung Developer (ResizeObserver) |
| U-8 | Abstimmen < 400 px: Icon über Label | erledigt | von UX übernommen |
| U-9 | „Platz 1" / „Top choice" | erledigt | im Glossar |
| U-10 | Mini-Streifen auf Vorschlagskarte | entschieden (UX): nicht im MVP | aus design-system §9.3 entfernt |
| U-11 | Feiertagsliste unter dem Monat | erledigt | von UX bestätigt |
| U-12 | Hero-Platzierung W01 | entschieden (UX) | mobil über der Headline, max. 160 px; ab 600 px rechts |
| U-13 | „Noch offen" mit gestricheltem Ring | erledigt | von UX bestätigt |
| U-14 | Benennung der Vorschlagsgruppen | entschieden (CEO, 2026-10-08) | „Alle dabei" / „Everyone's in"; Folgeentscheid UX „Fast alle dabei" / „Almost everyone's in" (D-14) |

**Bestätigt (Auftraggeber 2026-10-08):**
- **Marke:** zwei Namen, eine Bildmarke – DE „Wir wollen weg", EN **„When do we go?"** (abweichend von der Design-Empfehlung). EN-Wortmarke mit „go?" in Markenfarbe; „Find dates for your group trip" nur noch optionaler Untertitel (design-system §3.1–§3.4, `logo-wordmark-en.svg`, `logo-wordmark-en-tagline.svg`). Schreibregeln: ux-spec §10.6 – design-system verweist darauf.
- **Logo:** Variante A „Sonnenkalender" (§3.3); Favicon/App-Icon/Wortmarken basieren darauf, Icons sprachneutral.
- **Dark Mode:** im MVP nur System-folgend (`prefers-color-scheme`), kein Schalter (§13, D-12).
- **Schrift:** Figtree (selbst gehostet) für Überschriften und Wortmarke, Systemschrift für alles andere (§5).
- **Ergebnis-Sichtbarkeit** erst nach eigener Stimme, Rolle „Orga"/„Organizer" (PRD Q13): unverändert wie in §9.10 gestaltet.
- Offene Kleinpunkte U-15, U-16: siehe §2.

## 4. Bereits erledigt / keine Aktion nötig
- WCAG 2.2 AA als Ziel (ux-spec §7): Design ist darauf ausgelegt (2.4.11 Fokus nicht verdeckt über `scroll-padding`, 2.5.8 Zielgrößen, Fokus-Hof).
- Teilen-Texte ohne Emojis: einverstanden.
- „Rot heißt Fehler, nicht Nein" inkl. Amber für Warnhinweise wie „Jonas kann nicht": verankert in design-system §2, §9.10.

## Changelog
- 2026-10-08 (Auftraggeber-Entscheidungen): alle Vorbehalte zu Marke, Logo A, Dark Mode, Figtree, Ergebnis-Sichtbarkeit → „bestätigt (Auftraggeber 2026-10-08)"; EN-Name „When do we go?" eingearbeitet; §1b Antwort auf D-19; neue Kleinpunkte U-15, U-16 (§2).
- 2026-10-08 (letzte Runde): §1a Antworten auf D-14–D-18; §2 als erledigt markiert; §3 finaler Status aller D-1–D-18 und U-1–U-14 (D-16 entschieden durch CEO). Abstimmung Design ↔ UI/UX abgeschlossen.
- 2026-10-08 (Abstimmungsrunde): CEO-Entscheide U-1, U-2, U-4 eingearbeitet; U-14 neu; Abschnitt 3 „Abstimmungsstand (Design-Sicht)" mit Status D-1–D-13 / U-1–U-14 und Auftraggeber-Vorbehalten.
- 2026-10-08: Erstfassung; beantwortet D-1 bis D-13 aus `docs/ux/abstimmung-design.md`, neue Punkte U-1 bis U-13.
