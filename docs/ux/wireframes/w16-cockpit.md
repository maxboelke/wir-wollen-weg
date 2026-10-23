# W16 – Reise-Cockpit (Übersicht nach der Festlegung, Phase 3)

Stand: 2026-10-23 · Verantwortlich: UI/UX
- **Teil A – W16 v2 „Reiseverlauf“ (gültig, ab 2026-10-22):** Auswahl des Auftraggebers aus den Cockpit-Varianten (Variante C, [`../../design/mockups/cockpit-varianten/index.html`](../../design/mockups/cockpit-varianten/index.html)), kombiniert mit der Designer-Empfehlung (Ticket-Kopf aus A, Bereiche ohne Ende als Kacheln unter dem Weg). Status: **baureif** – Auftraggeber-Freigabe Q26–Q36, UX-1, UX-2, UX-8, UX-9 (2026-10-22); Optik/Motion abgestimmt (`../abstimmung-design.md` §12–§13, Design-Mockup [`../../design/mockups/cockpit-reiseverlauf/index.html`](../../design/mockups/cockpit-reiseverlauf/index.html) = optische Vorgabe). Entscheidungen zu U-23–U-30: v2.12. **Inkrement-8-Schnitt: v2.13. Inkrement-9-Schnitt (V3 Unterkunft): v2.14. Inkrement-10-Schnitt (Kosten: Kachel, A1, D1, Kopf-Tasten): v2.15. Inkrement-11-Schnitt („Bucht“, V4, D3, Kachel Reisedaten): v2.16.**
- **Teil B – W16 v1 „Kachel-Cockpit“ (abgelöst):** bleibt als Verlauf stehen. Weiter gültig daraus sind nur die ausdrücklich in v2.0 genannten Teile (Hub ohne Tabs, Routen, Reisemenü, Teilphasen-Grenzen, offene Fragen UX-1 bis UX-7).

---

# Teil A – W16 v2 „Reiseverlauf“ (gültig)

Features: **F-053**, F-012 (Kopf/Feier), F-007 (Platzhalter), F-015-Muster (Erinnern), F-056, Einstieg in F-031, F-035/036, F-054, F-055, F-033 · Route `/trips/{id}` (Phase `fixed`)
Auftrag des Auftraggebers (2026-10-22): «Gefällt mir am besten, weil es den Reiseverlauf am logischsten zeigt und für jeden intuitiv klar wird, was als Nächstes zu tun ist. Bitte feile die Idee noch mehr aus.»
Beispieldaten wie Teil B (Kroatien 2027, 12.–19. Juni, Lena Orga + „bucht“, Max = du, Mia Platzhalter).

## v2.0 Was aus v1 bleibt, was sich ändert

| Thema | v2 |
|---|---|
| Hub ohne Tabs, Unterseiten eine Ebene tief, Routen-Tabelle, Weiterleitungen alter Tab-Routen | **bleibt** (Teil B §1, ux-spec §14.4 Deep-Links) |
| Reisemenü `⋯` | **bleibt** (Teil B §2.5) |
| Teilphasen *Vorbereitung / Unterwegs / Danach* und ihre Grenzen (Zeitzone der Reise, Wechsel beim Neuladen) | **bleibt** (Teil B §3, F-053) |
| Kennzahl-Box mit Mini-Ring 64 px | **ersetzt** durch Ticket-Kopf mit großem Ring (v2.2) |
| Karte „Für dich zu tun“ + Kachelraster „Eure Reise“ | **ersetzt** durch den **Weg** (v2.3–v2.5) + Kacheln **„Immer griffbereit“** nur für Bereiche ohne Ende (v2.6) |
| Ergebnis-Karte «Es geht los!» mit Drei-Schritte-Fortschritt (ux-spec §14.4 Nr. 2, heute gebaut) | **geht auf** im Ticket-Kopf (Datum, Kalender) und in der ersten Station «Termin steht» |
| Andockfläche «Als Nächstes» mit `TripModule` (ux-spec §14.4 Nr. 4) | **ersetzt** durch den Stations-/Kachel-Vertrag (v2.10). Die Überschrift «Als Nächstes» gibt es nicht mehr als Abschnitt, nur noch als Zustand einer Station. |
| Feier W11 | **bleibt** unverändert (einmal je Person und Festlegung) |

## v2.1 Aufbau von oben nach unten – und warum

| # | Block | Zweck | Warum an dieser Stelle |
|---|---|---|---|
| 1 | **Zeile 1** (sticky): ← · Reisename + Phasenzeile · ⋯ | Orientierung, Zurück, Menü | wie überall in Reisen; beim Scrollen erscheint hier der Mini-Ring (v2.8) |
| 2 | **Ticket-Kopf** (Indigo): großer Vorfreude-Ring mit Countdown, Reisezeitraum, Abriss-Kante, Abschnitt mit Crew + `[Kalender]` | Vorfreude und „Was ist das für eine Reise?“ | Der Auftraggeber will den Ring mit Konfetti in jedem Fall; das Ticket aus A gibt dem Kopf Reisegefühl. **Höhe gedeckelt** (v2.2), damit „Heute“ im ersten Bildschirm liegt. |
| 3 | **Weg** (h2 je Teilphase, v2.12 U-26: «Euer Weg bis zur Abreise» / «Eure Reise, Tag für Tag» / «Nach der Reise»): Erledigt (eingeklappt) → **HEUTE** (du bist dran) → Läuft (wartet auf andere) → Als Nächstes → Später → **Ziel** | Beantwortet in Leserichtung: Was ist geschafft? Was mache ich jetzt? Worauf warten wir? Was kommt? | Kern der Variante C. „Heute“ ersetzt die Nächster-Schritt-/To-do-Karte (v2.5), es gibt also **eine** Stelle für „was tun“. |
| 4 | **Immer griffbereit** (h2): kompakte Kacheln | Bereiche ohne Ende (Kosten, Unterlagen, Infos) und bereits abgeschlossene Bereiche | Die Designer-Empfehlung: Was keinen Zeitpunkt hat, gehört nicht auf die Zeitachse. Unter dem Weg, weil es Nachschlagen ist, nicht Handeln. |
| 5 | **Mehr zur Reise** (h2): «So habt ihr entschieden ›» · «Wer ist dabei? (6) ›» | Historie und Gruppe | Selten gebraucht, darum ganz unten; beide öffnen Sheets wie in v1 §2.4. |

**Grundsatz gegen Doppelungen:** Jede **Aufgabe** steht genau einmal auf der Seite (im Weg). Jeder **Bereich** hat genau einen Einstieg: als Station, solange er ein offenes Ende hat, sonst als Kachel. Ausnahmen, bewusst: (a) die eingeklappte Erledigt-Gruppe verlinkt erledigte Stationen nochmals (eingeklappt, stört nicht), (b) «Wer ist dabei?» ist über die Crew im Ticket und unten erreichbar (Kurzweg + verlässlicher Ort), (c) eine Kachel darf den Saldo zeigen, auch wenn dieselbe Schuld unter „Heute“ als Aufgabe steht (Status ≠ Aufgabe).

### Wireframe mobil (360 px), Vorbereitung, Sicht Max (Mitglied)

```
┌────────────────────────────────────┐
│▓(←)      Kroatien 2027         (⋯)▓│  Zeile 1, sticky ≈ 60 px
│▓    ● Steht fest · noch 41 Tage    ▓│  Phasenzeile (Text!)
│▓            .-~~~~-.    ˚ *        ▓│  Ring 136–168 px (v2.2), Countdown im Ring
│▓          /    41    \             ▓│  aria-hidden; Ring = Konfetti-Taste
│▓          \   Tage   /             ▓│
│▓            '-....-'               ▓│
│▓   Sa., 12. – Sa., 19. Juni 2027   ▓│  Jakarta 18/800
│▓ ◖- - - - - - - - - - - - - - - - ◗▓│  Abriss-Kante (Ticket A), dekorativ
│▓ (LE)(MA)(KE)+3 6 dabei ·7 Nächte  ▓│  Crew = Button → Sheet „Wer ist dabei?“
│▓                     [▣ Kalender]  ▓│  ICS wie W11
╰▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╯
  Euer Weg bis zur Abreise  1 von 5 geschafft   h2 + Meta (erledigte Stationen / alle ohne Ziel)
  (✓) 1 erledigt: Termin steht      ▾   Button, aria-expanded="false"
   ┃
  (☀) HEUTE · So., 2. Mai               h3 – Heute-Marker (Sonne, Indigo-Hof)
   ┃  Du bist dran – 3 Sachen für dich.  Heute-Satz (v2.5)
   ┃ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   ┃ ┃ DU BIST DRAN                  ┃  Station „Reisedaten“ – AUSGEKLAPPT
   ┃ ┃ (ID) Reisedaten für Lena    › ┃  Titelzeile = Link in den Bereich
   ┃ ┃ Für „Flüge München – Split“:  ┃  max. 2 Zeilen
   ┃ ┃ Name + Geburtsdatum. Nur Lena ┃
   ┃ ┃ [     Angaben freigeben     ] ┃  EINZIGE Primär-Taste der Seite
   ┃ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   ┃ ┌───────────────────────────────┐
   ┃ │ DU BIST DRAN                  │  Station „Unterkunft“ – kompakt
   ┃ │ (▤) Unterkunft              › │  ganze Karte = ein Link
   ┃ │ Du hast 2 von 5 bewertet ▓▓░░ │  Balken aria-hidden
   ┃ └───────────────────────────────┘
   ┃ ┌───────────────────────────────┐
   ┃ │ (€) Du schuldest Kemal        │  Aufgabe OHNE Station (Bereich Kosten)
   ┃ │     86,00 €                 › │
   ┃ └───────────────────────────────┘
   ┆
  (◔) LÄUFT · wartet auf andere
   ┆ ┌───────────────────────────────┐
   ┆ │ (⚇) Alle sind dabei         › │  Station „Gruppe“
   ┆ │ Mia ist noch nicht beigetreten│
   ┆ └───────────────────────────────┘
   ┆   [🔔 Lena Bescheid geben]           sekundär klein, 44 px, NICHT im Link
   ┆
  ( ) ALS NÄCHSTES
   ┆ ┌───────────────────────────────┐
   ┆ │ (✈) Anreise & Tickets       › │
   ┆ │ Lena bucht die Flüge – die    │
   ┆ │ Tickets landen dann hier.     │
   ┆ └───────────────────────────────┘
   ┆
  (★) ZIEL · Sa., 12. Juni
     ┌───────────────────────────────┐  Indigo-Karte (Ziel)
     │ (☀) Es geht los!            › │  → Infos
     │ Treffpunkt 6:15 Uhr · Flug-   │
     │ hafen München T2              │
     └───────────────────────────────┘
  Immer griffbereit                      h2
  ┌───────────────┐ ┌───────────────┐
  │(🎫)          ›│ │(€)           ›│   Kacheln kompakt ≥ 88 px
  │Unterlagen     │ │Kosten         │
  │2 · 1 neu      │ │456 € · du     │
  │               │ │schuldest 86 € │
  └───────────────┘ └───────────────┘
  ┌───────────────┐
  │(i)           ›│
  │Infos          │
  │Check-in 15 Uhr│
  └───────────────┘
  Mehr zur Reise                         h2
  (✓) So habt ihr entschieden          ›
  (⚇) Wer ist dabei? (6)  (LE)(MA)…    ›
```

Linie: durchgezogen (Minze) von der Erledigt-Gruppe bis zum Heute-Marker = geschafft; gestrichelt danach = liegt vor uns. Linie und Marker sind `aria-hidden`; die Bedeutung steht als Wort im Zustands-Label.

### Längen-Budget (Ziel: ≤ 2 Bildschirme bei 390 × 844, höchstens 2,5)

| Regel | Wirkung |
|---|---|
| **Erledigt immer eingeklappt** zu einer Zeile «(✓) {n} erledigt: {Titel 1}, {Titel 2} …» (Titel nach 1 Zeile mit „…“ gekürzt). Aufklappen per Tipp, Zustand gilt bis Sitzungsende. | spart pro erledigter Station ≈ 90 px |
| **Heute:** max. 3 Einträge – der erste ausgeklappt (≈ 170 px), die nächsten kompakt (≈ 76 px); mehr → Zeile «+ {n} weitere für dich ▾» (klappt auf). | „Was tun“ bleibt kurz |
| **Läuft:** max. 2 Stationen, mehr → «+ {n} weitere laufen ▾». | |
| **Als Nächstes:** genau **eine** Station. | klare Antwort auf „was kommt“ |
| **Später:** max. 2 **schmale Zeilen** (Icon 24 · Titel · Zeithinweis, 48 px, ohne Statuszeile), mehr → «+ {n} weitere Schritte ▾». | die Zukunft wird angedeutet, nicht ausgebreitet |
| **Ziel** immer, eine Karte. | |
| Kacheln kompakt (2 Spalten, ≥ 88 px), max. 5; Mehr zur Reise = 2 Zeilen. | |

Typischer Fall (Wireframe oben): Kopf ≈ 330 · Weg ≈ 880 · Kacheln ≈ 230 · Mehr ≈ 150 → **≈ 1 600 px ≈ 1,9 Bildschirme** (390 × 844). Ungünstigster Fall (3 + 2 + 1 + 2 + Ziel, 5 Kacheln) ≈ 2 100 px = 2,5 Bildschirme.

## v2.2 Ticket-Kopf mit Ring (Antwort auf Designer-Punkt U-17 aus Runde 4)

- **Ring dauerhaft groß**, aber in der Höhe gedeckelt: Durchmesser `clamp(120px, 21svh, 168px)` (360 × 640 → 134 px; 390 × 844 → 168 px). Im Ring Zahl + «Tage» (Jakarta), `aria-hidden`; der Countdown steht als Text in der Phasenzeile (und für Screenreader als `sr-only`-Satz «Noch 41 Tage bis zur Abreise.» direkt nach h1).
- **Höhen-Budget Kopf:** Zeile 1 + Ticket ≤ **340 px** bei 360 × 640. Daraus folgt: Der **Heute-Marker liegt bei 360 × 640 im ersten Bildschirm**, die Primär-Taste der ersten Heute-Station bei **360 × 740 und 390 × 844** (Abnahme-Kriterium). Das 470-px-Ticket aus Variante A ist dafür zu hoch (Designer-Punkt U-18): keine Felder-Reihe Hin/Zurück/Nächte/Dabei (steht schon im Zeitraum bzw. im Abschnitt), keine Ticket-Nummer.
- **Abschnitt unter der Abriss-Kante:** links Crew (3 Avatare + «+3», daneben «6 dabei · 7 Nächte») als **Button** → Sheet „Wer ist dabei?“; rechts **eine Tastengruppe** je Teilphase, **alle Kopf-Tasten Kontur** (`on-ck`, 44 px, nie Primär – v2.12 U-25): Vorbereitung `[Kalender]`, Unterwegs `[+ Ausgabe]` + `[Tickets]` (in dieser Reihenfolge), Danach `[Ausgleichen]` (nur bei offenen Salden). Eine Kopf-Taste erscheint nur, wenn ihr Bereich gebaut ist (v2.13).
- **Feier:** Die große Feier „Es geht los!“ (W11, Ehrenrunde, Konfetti) läuft **einmal je Person und Festlegung** (Server-Merker, unverändert). Danach ist der Ring **statisch, ohne Ehrenrunde**. **Antippen des Rings** löst eine **kleine Konfetti-Runde** aus (≤ 1,2 s, kein Puff, keine Vibration, Sperre 3 s gegen Dauertippen) – Spaß ohne Pflicht. Technisch ein `<button>` mit Namen «Vorfreude: noch 41 Tage», `aria-describedby` nicht nötig; bei reduzierter Bewegung nur kurzes Aufglühen (140 ms). Fokus/Gedrückt-Stil: Designer (D-44).
- **Orga direkt nach der Festlegung:** «Allen Bescheid geben» ist nicht mehr Kopf-Taste, sondern die Heute-Aufgabe der Station „Termin steht“ (v2.4, V1) – so bleibt der Kopf für alle gleich.

## v2.3 Stationen – Katalog und Reihenfolge

**Station** = ein Schritt der Reise mit **Ende** (kann erledigt werden) oder **Datum**. Bereiche ohne Ende (Kosten vor der Reise, Unterlagen als Ablage, Infos) sind **keine** Stationen, sondern Kacheln; ihre Aufgaben erscheinen trotzdem unter „Heute“ (Aufgaben ohne Station, A1–A2).

Die Reihenfolge ist **fest** (Katalog-Reihenfolge). Innerhalb jeder Gruppe (Heute, Läuft, Später) gilt sie ebenfalls – außer unter „Heute“, dort gilt die Dringlichkeit (v2.5).

| ID | Teilphase | Station (Titel DE / EN) | sichtbar, wenn | erledigt, wenn | Ziel beim Tippen |
|---|---|---|---|---|---|
| V1 | Vorbereitung | Termin steht / Dates locked in | immer | immer (für Orga erst nach «Allen Bescheid geben» oder 7 Tage nach Festlegung) | Sheet „So habt ihr entschieden“ |
| V2 | Vorbereitung | Alle sind dabei / Everyone's in | immer | kein offener Platzhalter (oder Orga hat „ohne App erledigt“ gesetzt, UX-9) | Sheet „Wer ist dabei?“ |
| V3 | Vorbereitung | Unterkunft / Place to stay | Bereich gebaut (Inkr. 9) | Unterkunft festgelegt **und** «gebucht ✓» (oder „ohne App erledigt“) | `/stays` (W18) |
| V4 | Vorbereitung | Reisedaten / Travel details | Bereich gebaut (Inkr. 11) **und** (an mich gibt es eine Anfrage **oder** ich trage „bucht“ **oder** ich bin Orga und es gibt eine Anfrage) | Mitglied: alle Anfragen an mich beantwortet (freigegeben oder abgelehnt) · „bucht“: Anfrage abgeschlossen («Erledigt – Daten löschen») | `/travel-data` (W20) |
| V5 | Vorbereitung | Anreise & Tickets / Getting there | Unterlagen gebaut (Inkr. 12) | ≥ 1 für mich sichtbare Unterlage der Kategorie „Flug/Anreise“ (oder „ohne App erledigt“: «Jede:r reist selbst an») | `/documents?cat=travel` (W21, gefiltert) |
| V6 = Ziel | Vorbereitung | Es geht los! / Off we go! | immer | – (Ziel) | `/info` (W22) |
| T1…Tn | Unterwegs | ein Tag mit Terminen, z. B. «Mo., 14. Juni · Fähre nach Stari Grad 9:30» | Unterlagen mit Datum im Reisezeitraum | Tag vorbei | Unterlage öffnen (W21 Detail); mehrere Termine am Tag → `/documents?date=` |
| T-Ziel | Unterwegs | Heimreise / Heading home | immer | – | Rückreise-Unterlage, sonst `/info` |
| D1 | Danach | Kosten ausgleichen / Settle up | es gibt ≥ 1 Ausgabe | alle Salden 0 **oder** Abrechnung abgeschlossen | `/costs/balances` (W19) |
| D2 | Danach | Unterlagen sichern / Save your documents | es gibt Unterlagen | gelöscht (30 Tage nach Reiseende) | `/documents` |
| D3 | Danach | Reisedaten gelöscht / Travel details deleted | es gab Reisedaten für mich (bzw. ich war „bucht“) | gelöscht (7 Tage nach Reiseende) – wird automatisch erledigt | `/travel-data` (Leerzustand W20) |
| D-Ziel | Danach | Wohin geht's als Nächstes? / Where to next? | immer | – | `[Neue Reise planen]` (sekundär) |

**Bewusst keine Stationen (Stufe 1):** *Packen* (gibt es erst mit F-032 Checkliste – dann Station zwischen V5 und V6), *Fotos* (keine Funktion, Nicht-Ziel), *Infos/Treffpunkt* (Kachel; Treffpunkt steht in der Ziel-Station, fehlende Infos werden Aufgabe A2). Neue Bereiche docken über den Vertrag v2.10 an, ohne dass sich das Muster ändert.

**Mit wenig Bereichen (Inkrement 8, nur Cockpit + Infos)** besteht der Weg aus V1 ✓ · V2 · Heute · Ziel. Das ist kurz, aber ehrlich – und wächst mit jedem Inkrement um eine Station. Details: v2.13.

## v2.4 Zustände je Station und Rolle

### Die fünf Zustände (Label immer als Text, DE / EN)

| Zustand | Label DE / EN | Gruppe im Weg | Marker | Karte |
|---|---|---|---|---|
| erledigt | Erledigt / Done | Erledigt-Gruppe (eingeklappt) | Minze, Häkchen | ohne Fläche, 1,5-px-Rand |
| du bist dran | Du bist dran / Your turn | unter **HEUTE** | (keiner – hängt am Heute-Marker) | Fläche, Koralle-Kante links (`todo-*`) |
| wartet auf andere | Wartet auf andere / Waiting on others | **Läuft** | Halbkreis (◔) | Fläche, ohne Kante; Erinnern-Taste darunter |
| als Nächstes | Als Nächstes / Up next | nach Läuft | leerer Kreis, kräftiger Rand | Fläche |
| später | Später / Later | nach Als Nächstes | leerer Kreis, gedämpft | schmale Zeile |
| (Ziel) | Ziel / Destination | ganz unten | Stern/Sonne auf Indigo | Indigo-Karte |

### Regeln (Auswertung je Station, erste passende Regel gilt)
1. Erfüllt die Station „erledigt“ (Tabelle v2.3) → **erledigt**.
2. Ich habe in dieser Station eine eigene offene Handlung (Tabellen unten) → **du bist dran**.
3. Die Station ist angefangen und hängt an anderen Personen (ich habe meinen Teil getan oder kann nichts tun) → **wartet auf andere**.
4. Sonst: die **erste** übrige offene Station im Katalog → **als Nächstes**; alle weiteren → **später**.
5. Eine Station ist nie in zwei Zuständen; ändert sich ihr Zustand, wechselt sie die Gruppe (beim Neuladen, ohne Umsortier-Animation, v2.9).

### V1 Termin steht
| Lage | Mitglied | Orga |
|---|---|---|
| bis «Allen Bescheid geben» getippt bzw. 7 Tage nach Festlegung | erledigt «Platz 1 mit 5× Ja · festgelegt von Lena» | **du bist dran** «Sag allen Bescheid, dass der Termin steht.» `[Allen Bescheid geben]` (Teilen-Text F-012) |
| danach | erledigt | erledigt |

### V2 Alle sind dabei
| Lage | Mitglied | Orga |
|---|---|---|
| keine offenen Platzhalter | erledigt «Alle 6 sind dabei» | erledigt |
| ≥ 1 Platzhalter offen | wartet «Mia ist noch nicht beigetreten» · Text-Taste `[Lena Bescheid geben]` (Platzhalter-Text ux-spec §14.1) | wartet «Mia ist noch nicht beigetreten» · `[Mia erinnern]` (persönlicher Link, RemindSheet `single`) · Text-Taste «Mia macht ohne App mit» (→ erledigt, UX-9) |

Platzhalter blockieren nichts: Sie zählen bei Kosten und „€ pro Person“ mit (Q35), beim Bewerten und bei Reisedaten nicht (können nicht handeln).

### V3 Unterkunft («Bucher» = alle mit Markierung „bucht“, sonst die Orga)
| Lage | Mitglied | Orga | „bucht“ (nicht Orga) |
|---|---|---|---|
| noch kein Vorschlag | als Nächstes «Noch keine Vorschläge – schlag die erste vor, ein Link reicht.» | dto. | dto. |
| ich habe unbewertete Vorschläge | **dran** «{n} Unterkünfte bewerten» `[Jetzt swipen]` | **dran** | **dran** |
| ich bin fertig, andere nicht (zählen nur Mitglieder) | wartet «4 von 6 haben bewertet» `[Erinnern]` | wartet «4 von 6 haben bewertet · Favorit: Kamena Kuća (4 ♥)» `[Erinnern]` · Text-Taste «Schon festlegen» | wie Mitglied |
| alle haben bewertet, nicht festgelegt | wartet «Alle haben bewertet – Lena legt fest.» · Text-Taste `[Lena Bescheid geben]` | **dran** «Unterkunft festlegen – Favorit: Kamena Kuća (4 ♥)» `[Festlegen]` | wie Mitglied |
| festgelegt, nicht gebucht | wartet «Lena bucht Kamena Kuća.» · Text-Taste `[Lena Bescheid geben]` | **dran**, wenn Orga Bucher ist: «Kamena Kuća buchen – danach als gebucht markieren.» `[Zur Unterkunft]`; sonst wartet | **dran** (wie Orga) |
| gebucht | erledigt «Kamena Kuća · gebucht ✓» | erledigt | erledigt |

### V4 Reisedaten
| Lage | Mitglied | „bucht“ | Orga ohne „bucht“ |
|---|---|---|---|
| keine Anfrage | (nicht sichtbar) | als Nächstes «Frag die Reisedaten an, wenn du buchst – nur du siehst sie.» Text-Taste `[Anfrage erstellen]` | (nicht sichtbar) |
| Anfrage an mich offen | **dran** «Lena bittet um deine Reisedaten» – Text «Für „{Zweck}“: {Felder}. Nur Lena sieht sie.» `[Angaben freigeben]` | (eigene Anfrage an sich selbst gibt es nicht) | **dran**, falls an sie gerichtet |
| meine Anfrage läuft, andere fehlen | – | wartet «2 von 4 haben freigegeben · offen: Max, Jonas» `[Erinnern]` | wartet «Lena sammelt Reisedaten · 2 von 4» (kein Erinnern – die Anfrage gehört „bucht“) |
| alle beantwortet | erledigt «Freigegeben an Lena ✓» bzw. «Abgelehnt – du klärst es mit Lena» | **dran** «Alle Angaben da – jetzt buchen und die Anfrage abschließen.» `[Zu den Reisedaten]` | wartet «Lena bucht» |
| abgeschlossen / gelöscht | erledigt | erledigt «Erledigt – Daten gelöscht» | erledigt |

Neue Anfrage nach „erledigt“ → Station wird wieder offen (wechselt aus der Erledigt-Gruppe nach Heute). Mitglieder sehen von anderen nie Inhalte, nur Zahlen (F-054).

### V5 Anreise & Tickets
Nie „du bist dran“ – die App weiß nicht, wer bucht oder ob jede:r selbst anreist; sie drängt deshalb nicht.
| Lage | Mitglied | Orga / „bucht“ |
|---|---|---|
| keine Anreise-Unterlage für mich | als Nächstes/später «Lena bucht die Flüge – die Tickets landen dann hier.» (ohne „bucht“-Markierung: «Sobald jemand Tickets hochlädt, findest du sie hier.») | als Nächstes/später «Lade die Tickets hoch, sobald gebucht – dann hat sie jede:r griffbereit.» Text-Taste `[Hochladen]` · Orga zusätzlich «Jede:r reist selbst an» (UX-9) |
| ≥ 1 Anreise-Unterlage | erledigt «2 Tickets für dich da» | erledigt |

### V6 Ziel „Es geht los!“
Datum der Anreise; Text = Treffpunkt aus Infos («Treffpunkt 6:15 Uhr · Flughafen München T2»), sonst Check-in der Unterkunft, sonst «Noch 41 Tage». Kein Zustand, keine Aktion außer Link.

### Aufgaben ohne Station (erscheinen nur unter „Heute“, nie im übrigen Weg)
| ID | Wer | Wann | Text / Ziel |
|---|---|---|---|
| A1 | alle | Vorbereitung **und** Unterwegs: eigene Schuld ≥ 50 € (in *Danach* übernimmt D1) | «Du schuldest Kemal 86,00 €» → `/costs/balances` |
| A2 | Orga, „bucht“ | Infos leer (kein Treffpunkt und keine Adresse) und ≤ 21 Tage vor Anreise | «Trag Treffpunkt und Adresse in die Infos ein.» → `/info/edit` |

**Änderung gegenüber v1:** Die Schulden-Aufgabe gilt **unterwegs ebenfalls erst ab 50 €** (v1: immer). Unterwegs wechseln Salden täglich; eine Aufgabe für jede Kugel Eis nervt. Abgerechnet wird danach (D1). «1 neue Unterlage» ist keine Aufgabe, sondern ein Chip auf der Kachel.

### Teilphase Unterwegs
- Phasenzeile «Unterwegs · Tag 3 von 8»; Ring = Tages-Ring (Füllung = vergangene Reisetage), im Ring «Tag 3».
- Weg: «(✓) Vorbereitung · {n} erledigt ▾» (alle V-Stationen eingeklappt; nicht erledigte heißen darin «nicht genutzt», ohne Häkchen) → **HEUTE · Tag 3 · Mo., 14. Juni**: zuerst die **Termine des Tages** (datierte Unterlagen, nach Uhrzeit; Karte mit Lavendel-Kante + Chip «Termin heute» / EN «Today's plan», **keine** Koralle – ein Termin ist keine Aufgabe), dann Aufgaben (A1, offene V-Aufgaben, z. B. Reisedaten noch offen). Ausklapp- und Primär-Regel für Termine: v2.12 U-24 → **kommende Tage** mit Terminen als Stationen («MORGEN · Di., 15. Juni», danach Wochentag + Datum), max. 2 Tage + «+ {n} weitere Termine ›» (→ Unterlagen) → Ziel **Heimreise · Sa., 19. Juni** (Rückreise-Unterlage, falls vorhanden).
- Ohne Termine: Heute-Satz «Heute steht nichts an – genießt den Tag!» (H-4), mit Terminen H-6, am ersten Reisetag H-7 (v2.5); der Weg ist ohne Termine Vorbereitung ✓ · Heute · Heimreise.
- Kacheln: Unterlagen · Kosten («du bekommst 42,00 €») · Infos · Unterkunft («Kamena Kuća · Adresse») · Reisedaten (nur „bucht“, solange Daten da sind).

### Teilphase Danach
- Phasenzeile «Zurück · Kosten ausgleichen» bzw. «Zurück · alles ausgeglichen» (ohne Ausgaben bzw. ohne Bereich Kosten: «Zurück seit 9 Tagen»); Ring voll, im Ring «Schön war's!» (statt Zahl), kein Konfetti auf Antippen mehr nötig – bleibt aber erlaubt.
- Weg: «(✓) Reise · Vorbereitung und 8 Tage ▾» → **HEUTE · zurück seit 9 Tagen** → D1, D2, D3 nach Regeln unten → Ziel «Wohin geht's als Nächstes?» `[Neue Reise planen]` (sekundär) + 13 px «Diese Reise wird am 17. Sep. 2027 automatisch gelöscht.»

| D1 Kosten ausgleichen | Mitglied | Orga |
|---|---|---|
| ich schulde | **dran** «Du schuldest Kemal 23,50 €» `[Zum Ausgleich]` | **dran** |
| ich bekomme | wartet «Du bekommst noch 42,00 € von Sara» `[Sara erinnern]` | wartet, dto. |
| ich ausgeglichen, andere offen | wartet «Noch 2 Ausgleiche offen» (kein Erinnern – Geld zwischen anderen geht mich nichts an) | wartet «Noch 2 Ausgleiche offen» `[Erinnern]` |
| alle 0, nicht abgeschlossen | erledigt «Alles ausgeglichen ✓» | **dran** «Alles ausgeglichen – Abrechnung abschließen?» `[Abschließen]` (**immer sekundär**, auch wenn die Karte als erste unter Heute ausgeklappt ist – die Seite hat dann keine Primär-Taste; keine Pflicht, v2.12 U-30) |
| abgeschlossen | erledigt | erledigt |

D2 Unterlagen sichern (**geändert, v2.12 U-27**): **erscheint erst 7 Tage vor der Löschung** als Nächstes «Werden am 19. Juli gelöscht – jetzt herunterladen.»; vorher gibt es **nur die Kachel** „Unterlagen“ («7 Unterlagen · gelöscht am 19. Juli»). Solange D2 sichtbar ist, entfällt die Kachel (ein Einstieg je Bereich). Nie „dran“ (kein Druck); nach der Löschung erledigt «Gelöscht am 19. Juli» (in der Erledigt-Gruppe, keine Kachel mehr). D3 Reisedaten: später «Werden am 26. Juni gelöscht», danach erledigt «Am 26. Juni gelöscht – wie angekündigt.» (Vertrauen schaffen).

Kacheln Danach: Unterkunft · Unterlagen (bis 7 Tage vor der Löschung, danach übernimmt D2) · Kosten (nach D1 erledigt: «ausgeglichen ✓») · Infos.

### Rollen auf einen Blick
| | Mitglied | „bucht“ | Orga |
|---|---|---|---|
| sieht | eigenen Stand + neutrale Zahlen (F-053) | + Status aller zu „seinen“ Anfragen, Namen der Offenen | + Gruppenfortschritt aller Stationen, Favorit der Unterkunft immer (Q33) |
| „du bist dran“ typisch | bewerten, freigeben, schulden | + buchen, Anfrage abschließen, Tickets hochladen (nur als Nächstes) | + Bescheid geben, festlegen, buchen (wenn Bucher), abschließen |
| Erinnern | V2 (Orga Bescheid geben), V3, D1 (eigene Forderung) | + V4 | + V2 (Platzhalter), V3, D1 (alle) |
| „ohne App erledigt“ (UX-9) | – | – | V2, V3, V5 |

## v2.5 „Heute“ – wo der Nächste Schritt aufgeht

- **Es gibt keine eigene Karte „Nächster Schritt“ oder „Für dich zu tun“ mehr.** (Präzisiert v2.12 U-24: Die Primär-Taste gehört der **ersten Heute-Karte** – in *Vorbereitung*/*Danach* ist das die dringendste „du bist dran“-Aufgabe, *Unterwegs* der nächste anstehende Termin des Tages.) Der Heute-Marker ist die Antwort: Er steht immer genau einmal im Weg, mit Datum, einem **Heute-Satz** (Wo stehen wir / wer ist dran) und darunter den Stationen und Aufgaben im Zustand **du bist dran**. Die erste davon ist ausgeklappt und trägt die **einzige Primär-Taste der Seite** (ux-spec §1.1, §14.1 Grundregel 3). Damit ist der Nächste Schritt identisch mit der ersten Station unter „Heute“ – nichts doppelt.
- **Position:** direkt nach der Erledigt-Gruppe (bzw. ganz oben im Weg, wenn noch nichts erledigt ist). Der Marker wandert also nicht über die Zeitachse – er ist der feste Punkt „hier stehst du“, und die Stationen ordnen sich um ihn.
- **Datum:** heute in der Zeitzone der Reise (wie die Teilphase).
- **Sortierung „du bist dran“** (erste passende zuerst; gleicher Rang → Katalog-Reihenfolge):
  1. Was **andere blockiert**: V4 Reisedaten freigeben, V3 festlegen (Orga), V1 Allen Bescheid geben (Orga)
  2. Was eine **Frist/ein Datum** hat: V3 buchen, V4 „alle da – buchen“, A2 Infos (≤ 21 Tage), D1 schulden
  3. Eigene Beiträge: V3 bewerten, A1 Schulden ≥ 50 €
  4. Freiwilliges: D1 abschließen (Orga)
- **Heute-Satz** (eine Zeile, `text-muted` 14/600; reine Funktion, s. v2.10):

| ID | Lage | DE | EN |
|---|---|---|---|
| H-1 | ≥ 1 „dran“ | Du bist dran – {count, plural, one {eine Sache} other {# Sachen}} für dich. | Your turn – {count, plural, one {one thing} other {# things}} for you. |
| H-2 | nichts dran, ≥ 1 wartet | Für dich gerade nichts zu tun. Ihr wartet auf: {erste wartende Station, Kurzform}. | Nothing for you right now. You're waiting on: {…}. |
| H-3 | nichts dran, nichts wartet, Vorbereitung | Alles erledigt – jetzt nur noch Vorfreude! | All done – now it's just counting down! |
| H-4 | Unterwegs ohne Termine/Aufgaben | Heute steht nichts an – genießt den Tag! | Nothing planned today – enjoy! |
| H-5 | Danach, alles erledigt, es gab Ausgaben | Alles ausgeglichen – schön war's! | All settled – what a trip! |
| H-5b | Danach, alles erledigt, keine Ausgaben (bzw. Kosten nicht gebaut) | Schön war's – bis zur nächsten Reise! | What a trip – see you on the next one! |
| H-6 | Unterwegs, ≥ 1 Termin heute (neu, v2.12 U-23) | ≥ 1 „dran“: Heute {terms, plural, one {ein Termin} other {# Termine}} – und {count, plural, one {eine Sache} other {# Sachen}} für dich. · sonst: Heute {terms, plural, one {ein Termin} other {# Termine}} – sonst genießt den Tag! | {terms, plural, one {One plan} other {# plans}} today – and {count, plural, one {one thing} other {# things}} for you. · {terms, plural, one {One plan} other {# plans}} today – otherwise enjoy! |
| H-7 | erster Tag *Unterwegs* (UX-8), ganzer Tag, vor H-1/H-4/H-6 | Heute geht's los – gute Reise! | Today's the day – have a great trip! |

  **Vorrang:** H-7 → H-6 → H-1 → H-2 → H-3/H-4/H-5/H-5b (je Teilphase). Die Konfetti-Runde am Abreisetag (UM-7) läuft einmal je Person; der Satz H-7 steht den ganzen ersten Tag.

  Kurzformen für H-2: «Mia tritt bei», «Lena legt die Unterkunft fest», «Lena bucht Kamena Kuća», «Freigaben für Lena», «Sara gleicht aus».
- ux-spec §14.1 („Phase 3: keine Nächster-Schritt-Karte“) bleibt richtig – die Matrix N1/N2 endet mit Phase 2, Phase 3 nutzt H-1 bis H-7.

## v2.6 Kacheln „Immer griffbereit“

- Inhalt: Bereiche **ohne Ende** in der aktuellen Teilphase + Bereiche, deren Station **erledigt** ist. Feste Reihenfolge: Unterkunft · Unterlagen · Kosten · Infos · Reisedaten. Ein Bereich mit **sichtbarer** offener Station hat **keine** Kachel – ohne Ausnahme (auch nicht für D2, v2.12 U-27).
  - Vorbereitung (Beispiel oben): Unterlagen, Kosten, Infos (Unterkunft und Reisedaten sind offene Stationen).
  - Nach «gebucht ✓»: Unterkunft wandert vom Weg in die Kacheln («Kamena Kuća · gebucht ✓»).
- Kachel = ein Link: Icon-Kachel 32 · Titel 15/800 · **eine** Statuszeile (14/500, max. 2 Zeilen) · Chevron; optional ein Chip («1 neu»). **Keine Koralle-Kante** – Aufgaben stehen unter Heute. Zugänglicher Name = Titel + Status («Kosten. Gesamt 456,00 €, du schuldest 86,00 €»).
- Raster `repeat(auto-fit, minmax(min(100%, 9.5em), 1fr))`, Mindesthöhe 88 px; bei 200 % automatisch einspaltig. Ab 600 px drei Spalten.
- Leer: Kosten «Noch keine Ausgaben» · Infos Mitglied «Noch leer – Lena trägt sie ein», Orga «Infos ergänzen» · Unterlagen «Noch keine Unterlagen». Ein nicht gebauter Bereich erscheint nicht.
- Gibt es keine Kachel (z. B. heute im MVP ohne gebaute Bereiche), entfallen Überschrift und Abstand.

## v2.7 Sonderfälle

| Fall | Verhalten |
|---|---|
| Erster Besuch nach Festlegung | Feier W11 (einmal je Person), danach diese Seite; Weg baut sich auf (v2.9). |
| Station wurde seit dem letzten Besuch erledigt | Erledigt-Zeile zeigt einmalig «(✓) Neu erledigt: Unterkunft gebucht · 2 erledigt ▾» (Vergleich mit zuletzt gesehenem Stand, `sessionStorage`/`localStorage` je Reise); der **Erledigt-Marker selbst wird zum Siegel** und ploppt (UM-4, v2.12 U-29 – kein zusätzliches 20-px-Siegel). Keine Live-Ansage (der Text «Neu erledigt» trägt die Information). Kein automatisches Aufklappen. |
| Bereich noch nie genutzt | Station im Zustand als Nächstes/später mit Einladung (V3 «schlag die erste vor»); **keine** Aufgabe, **kein** Erinnern. |
| Gruppe erledigt etwas außerhalb der App | Orga: «ohne App erledigt» je Station (V2 «Mia macht ohne App mit», V3 «Haben wir schon / brauchen wir nicht», V5 «Jede:r reist selbst an»), rückgängig in der Erledigt-Gruppe. **Frage UX-9.** Ohne diese Funktion: die Station bleibt als Nächstes/später und wird an der Teilphasen-Grenze zu «nicht genutzt». |
| Platzhalter | V2 wartet; zählen bei Kosten mit, nicht beim Bewerten/Reisedaten (s. V2). |
| Reise vorbei, alles erledigt | Weg = Erledigt-Zeile · Heute (H-5 bzw. H-5b) · Ziel «Wohin geht's als Nächstes?». |
| Festlegung aufgehoben | wie ux-spec §14.4: Phase 2 mit Tabs, Weg verschwindet; Bereichsdaten bleiben (F-053 R.0.1). |
| Spät beigetreten (nach Festlegung) | Feier beim ersten Besuch (Regel W11); V1 erledigt. |
| Mehr als 3 „dran“ | 3 sichtbar + «+ {n} weitere für dich ▾». |
| Offline | Offline-Banner unter Zeile 1 (ux-spec §6); Weg zeigt letzten Stand; Primär-/Erinnern-Tasten mit Hinweis deaktiviert. |
| Laden | Skelett ab 300 ms: Ticket-Kopf (Ring-Umriss) + Heute-Marker + 3 Stations-Umrisse. |
| Fehler beim Laden eines Bereichs-Status | Station/Kachel zeigt «Stand gerade nicht verfügbar» (keine Zahl), bleibt Link. |

## v2.8 Interaktion

- **Tippen auf Station / Kachel** → Bereich (Routen Teil B §1) bzw. Sheet (V1, V2). Kompakte Karten sind **ein** Link (ganze Fläche). Die ausgeklappte Heute-Station hat **zwei** Ziele: Titelzeile (Link in den Bereich) und Primär-Taste (direkte Handlung, z. B. Freigabe-Formular `/travel-data/{requestId}`). Nie verschachtelte interaktive Elemente.
- **Erinnern / Bescheid geben** bei „wartet auf andere“: Taste **unter** der Karte (Geschwister, nicht im Link), `btn-sm` sekundär mit `remind`-Icon, 44 px. Öffnet das vorhandene **RemindSheet** (ux-spec §14.2) mit neuen Anlässen:

| Anlass | Schritt | Text DE | Text EN |
|---|---|---|---|
| `stay-rate` (V3) | `status` → `single`/`all` | Hey {name}, bei {trip} warten {count} Unterkünfte auf deine Bewertung – dauert eine Minute: {link} | Hey {name}, {count} places to stay are waiting for your rating in {trip} – takes a minute: {link} |
| `stay-fix` (V3, an Orga) | `orga` | Hey {orga}, alle haben die Unterkünfte für {trip} bewertet – du kannst jetzt festlegen: {link} | Hey {orga}, everyone has rated the places for {trip} – you can pick one now: {link} |
| `stay-book` (V3, an Bucher) | `orga` (Empfänger = Bucher) | Hey {booker}, {stay} steht fest – magst du buchen? {link} | Hey {booker}, we've picked {stay} – could you book it? {link} |
| `travel-data` (V4, nur „bucht“) | `status` → `single`/`all` | Hey {name}, für {purpose} brauche ich noch deine Reisedaten – bitte in der App freigeben, nicht hier im Chat: {link} | Hey {name}, I still need your travel details for {purpose} – please share them in the app, not here in the chat: {link} |
| `settle` (D1, eigene Forderung) | `single` | Hey {name}, laut Abrechnung von {trip} bekomme ich noch {amount} von dir. Danke! {link} | Hey {name}, according to the {trip} expenses you still owe me {amount}. Thanks! {link} |
| `settle-all` (D1, Orga) | `status` | Hey ihr, bei {trip} sind noch {count} Ausgleiche offen – schaut kurz rein: {link} | Hey all, {count} payments are still open for {trip} – take a quick look: {link} |
| Platzhalter (V2) | vorhanden (§14.1/§14.2) | unverändert | unverändert |

  `{link}` zeigt auf den Bereich (z. B. `/trips/{id}/stays`). Reisedaten-Texte enthalten **nie** Felder oder Werte.
- **Erledigt-Gruppe:** `<button aria-expanded>` «{n} erledigt anzeigen»; aufgeklappt eine Liste der erledigten Stationen (kompakte Links, Häkchen-Marker). Zustand gilt bis Sitzungsende; neue Sitzung = eingeklappt.
- **„+ n weitere“** (Heute, Läuft, Später): ebenfalls Button mit `aria-expanded`, klappt an Ort und Stelle auf; Fokus bleibt auf dem Button, Text wechselt zu «Weniger anzeigen».
- **Scroll-Verhalten:** Ticket-Kopf scrollt mit, **Zeile 1 bleibt sticky**. Sobald der große Ring den Bildschirm verlässt (IntersectionObserver, nicht scroll-gekoppelt), wird der Punkt in der Phasenzeile zum **Mini-Ring 20 px** mit derselben Füllung (Fade 140 ms). Kein fortlaufendes Schrumpfen des Kopfs (unruhig, teuer auf alten Handys, Bewegungsempfindlichkeit). Kein automatisches Scrollen zu „Heute“ – Heute liegt im ersten Bildschirm.
- **Zurück aus einem Bereich:** Scroll-Position wiederherstellen, Fokus auf die Station/Kachel, über die man gekommen ist (ux-spec §3). Hat sich ihr Zustand geändert, steht der Fokus auf dem Heute-Marker (h3) – die Station ist dann woanders.
- **Unterwegs-Kopf:** `[+ Ausgabe]` (Kontur, Plus-Icon, zugänglicher Name «Ausgabe hinzufügen») öffnet `/costs/new` (Datum = heute), `[Tickets]` (Kontur) → `/documents?date=today`. Beide nur, wenn der Bereich gebaut ist (v2.13).

## v2.9 Barrierefreiheit & Responsive

- **Überschriften:** h1 Reisename · h2 Weg-Überschrift je Teilphase (v2.12 U-26) · h3 «Heute, Sonntag, 2. Mai» (Heute-Marker – per Überschriften-Navigation direkt anspringbar) · h2 «Immer griffbereit» · h2 «Mehr zur Reise». Gruppen-Labels „Läuft“, „Als Nächstes“, „Später“, „Ziel“ sind **keine** Überschriften, sondern stehen als erstes Wort in jedem Eintrag.
- **Struktur:** Der Weg ist eine `<ol>` (Reihenfolge trägt Bedeutung); jede Station ein `<li>`. Zustand steht als **Text** im Eintrag (sichtbares Label), nie nur als Marker/Farbe/Linie (alle `aria-hidden`).
- **Screenreader-Reihenfolge = visuelle Reihenfolge.** Beispiel: «Kroatien 2027, Überschrift 1 · Steht fest, noch 41 Tage · Sa., 12. bis Sa., 19. Juni 2027 · Schaltfläche 6 dabei, 7 Nächte · Schaltfläche Zum Kalender · Euer Weg bis zur Abreise, Überschrift 2 · Liste 6 Einträge · Schaltfläche 1 erledigt anzeigen, reduziert · Heute, Sonntag, 2. Mai, Überschrift 3 · Du bist dran – 3 Sachen für dich · Du bist dran: Reisedaten für Lena, Link · Angaben freigeben, Schaltfläche · Du bist dran: Unterkunft, du hast 2 von 5 bewertet, Link · …».
- **Zugängliche Namen:** Station-Link = «{Zustand}: {Titel}. {Status}» (z. B. «Wartet auf andere: Alle sind dabei. Mia ist noch nicht beigetreten.»). Erinnern-Taste mit Objekt: «Lena Bescheid geben, dass Mia fehlt».
- **Ring:** `aria-hidden`; Countdown als Text (Phasenzeile + `sr-only`-Satz). Konfetti-Button hat Namen, löst keine Ansage aus.
- **Tippflächen:** Stationskarten ≥ 64 px, schmale Zeilen 48 px, Kacheln ≥ 88 px, Erinnern 44 px, Kopf-Tasten 44 px. Fokus-Stile wie D-22 (auf Indigo isoliert).
- **Farbe nie allein:** Zustand als Wort, Saldo mit Wort, Fortschritt als Zahl.
- **200 % Schrift / schmale Container (geändert, v2.12 U-28 = D-43):** Ist der Weg-Container < **22 em** breit (360 px bei ~160 % oder 200 %), wird die Linie zur **Schiene** (3 px am linken Rand, 16 px Einzug statt 46 px; erledigt durchgezogen, danach gestrichelt) und die Marker-Spalte entfällt; das Zustands-Label steht als Chip (`surface-sunken`) **mit Marker-Symbol 22 px** über jeder Karte. Schiene und Symbol bleiben `aria-hidden`. Ring schrumpft auf 120 px, Crew und Kopf-Taste brechen untereinander. Kacheln einspaltig. Nichts wird abgeschnitten, kein horizontales Scrollen (1.4.10).
- **320 px:** wie 200 %-Regel (Container < 22 em) – Schiene statt Linie.
- **600–959 px:** Inhalt max. 640 px zentriert; Kacheln 3 Spalten; Linie + Marker bleiben.
- **≥ 960 px:** Ticket-Kopf als breites Band (Ring links 168 px, Zeitraum/Crew/Tasten rechts, Höhe ≤ 240 px); darunter zwei Spalten: links der Weg (≈ 600 px), rechts „Immer griffbereit“ (einspaltig) + „Mehr zur Reise“. DOM-Reihenfolge: Weg vor Seitenspalte.
- `<title>`: «Übersicht · Kroatien 2027 · Wir wollen weg».

## v2.10 Übergabe an Entwicklung (Vertrag)

- **Reine Funktion** `tripRoute(trip, viewer, areas, today) → { subphase, heute: { date, sentenceKey, params, items: TripStation[] }, groups: { done, waiting, next, later }, goal, tiles: TripTile[] }` in `src/lib/trip-route.ts` – mit Unit-Tests **je Zeile** der Tabellen v2.4 und je Heute-Satz H-1–H-7 inkl. Vorrang (analog `nextStep()`).
- `TripStation { id: 'V1'|'V2'|…; state: 'done'|'yours'|'waiting'|'next'|'later'; title; status; href; primary?: {label, href}; remind?: {occasion, step}; textAction?: {label, action}; date?; isNew? }` · `TripTile { area; title; status; href; chip? }`.
- Jeder Bereich liefert seinen Status über einen Adapter (`stayStatus()`, `travelDataStatus()`, …); nicht gebaute Bereiche liefern `null` → Station/Kachel entfällt. Damit ist v2 **schon mit Inkrement 8** (Cockpit + Infos) baubar: V1, V2, Heute, V6, Kachel Infos – genauer Schnitt v2.13.
- Ersetzt in `src/app/(app)/trips/[id]/page.tsx` (Phase `fixed`): Ergebnis-Karte, Andock-Slot `TripModule`, Phasen-Leiste. „So habt ihr entschieden“ und „Wer ist dabei?“ werden zu Zeilen mit Sheet.
- **Abnahme UX:** 360 × 640, 360 × 740, 390 × 844, 200 % Text, Dark Mode; Fälle: Max Vorbereitung (Wireframe), Lena Vorbereitung (Orga + bucht), alles erledigt (H-3), Unterwegs mit/ohne Termine, Danach mit Schuld/Forderung/ausgeglichen; VoiceOver/TalkBack-Durchlauf der Reihenfolge v2.9.

## v2.11 Offene Fragen (an CEO / Auftraggeber) – Ergänzung zu UX-1 bis UX-7 (Teil B §8)

| Nr. | Frage | Empfehlung UX |
|---|---|---|
| **UX-8** | **Kleine Feier am Abreisetag?** Am ersten Tag von *Unterwegs* zeigt die Übersicht einmal je Person eine kleine Konfetti-Runde und den Heute-Satz «Heute geht's los – gute Reise!». | **Ja** – zweiter, kleiner Moment ohne Ehrenrunde (die große Feier bleibt die Festlegung). Macht Spaß, kostet wenig, abschaltbar über „Bewegung reduzieren“. **Entschieden 2026-10-22 (Auftraggeber): Ja.** |
| **UX-9** | **Darf die Orga eine Station „ohne App erledigt“ abhaken?** (V2 «Mia macht ohne App mit», V3 «Unterkunft haben wir schon / brauchen wir nicht», V5 «Jede:r reist selbst an») | **Ja** – sonst zeigt der Weg Wochen lang offene Schritte, die die Gruppe längst außerhalb der App erledigt hat, und verliert an Glaubwürdigkeit. Nur Orga, rückgängig machbar, für alle sichtbar «ohne App erledigt». Kleiner Zusatzaufwand (ein Merker je Station und Reise). **Entschieden 2026-10-22 (Auftraggeber): Ja.** |

**UX-1** (Hub ohne Tabs) und **UX-2** (Reisedaten als eigener Bereich) sind ebenfalls entschieden: **Ja** (Auftraggeber 2026-10-22, zusammen mit Q26–Q36). UX-3 bis UX-7 gelten mit den Empfehlungen aus Teil B §8; UX-3 ist durch v2.4 geändert (Schwelle 50 € gilt auch unterwegs; danach übernimmt D1).

Optik- und Motion-Punkte: [`../abstimmung-design.md` §12–§13](../abstimmung-design.md) (D-36–D-45, UM-1–UM-7, U-23–U-30).

## v2.12 Entscheidungen Runde 4b – U-23 bis U-30, UM-4 (UI/UX, 2026-10-22)

Grundlage: Design-Mockup [`cockpit-reiseverlauf/index.html`](../../design/mockups/cockpit-reiseverlauf/index.html) und `../../design/abstimmung-ux.md` §10.3. Das Mockup ist optische Vorgabe; wo es von dieser Tabelle abweicht, **gilt diese Tabelle** (Abweichungen sind in der Spalte „Mockup“ genannt).

| Nr. | Entscheidung | Begründung | Mockup |
|---|---|---|---|
| **U-23** Heute-Satz unterwegs mit Terminen | **Übernommen als H-6** (mit ICU-Plural für Termine und Aufgaben), dazu **H-7** «Heute geht's los – gute Reise!» für den ganzen ersten Reisetag und eine feste **Vorrang-Reihenfolge** H-7 → H-6 → H-1 → H-2 → H-3/H-4/H-5/H-5b. Neu **H-5b** für *Danach* ohne Ausgaben. Texte DE/EN: v2.5. | Der Satz muss sagen, was der Tag bringt; „Du bist dran“ wäre bei einem Termin falsch (niemand muss etwas erledigen). | passt (EN H-7 ergänzt) |
| **U-24** Erste Heute-Karte unterwegs = Termin | **Bestätigt.** Regel präzisiert: Die Primär-Taste gehört der **ersten Heute-Karte**; *Unterwegs* stehen Termine vor Aufgaben. (1) Termine des Tages nach Uhrzeit, Termine ohne Uhrzeit danach. (2) **Ausgeklappt mit Primär-Taste** ist der erste **anstehende** Termin (ohne Uhrzeit oder Uhrzeit + 60 min ≥ jetzt, Zeitzone der Reise, geprüft beim Laden). (3) Vergangene Termine des Tages werden kompakt, erhalten den Zusatz «vorbei» und rücken ans Ende der Heute-Liste. (4) Kein anstehender Termin → die erste Aufgabe ist ausgeklappt; keine Aufgabe → keine Primär-Taste. (5) Max. 3 Heute-Karten insgesamt, mehr → «+ {n} weitere heute ▾». Primär-Label: «Ticket öffnen» (Kategorien Flug/Anreise/Aktivität, W21), sonst «Unterlage öffnen»; Treffpunkt am ersten Reisetag «Infos öffnen». Optik: Lavendel-Kante, Chip «Termin heute» / «Today's plan» (EN «Today» wäre neben dem Label TODAY doppelt). Zugänglicher Name «Termin heute: 9:30, Fähre nach Stari Grad. Hafen Split, Anleger 3.» | Unterwegs ist der Termin die zeitkritische Handlung (Ticket am Schalter zeigen). Ein Termin ist aber keine Aufgabe – darum Lavendel statt Koralle und eigenes Wort. | EN-Chip «Today» → «Today's plan»; Regel (2)–(3) im Mockup nicht abgebildet |
| **U-25** Zwei Primär-Tasten unterwegs | **Entschieden: `[+ Ausgabe]` ist Kontur (sekundär, `on-ck`) wie alle Kopf-Tasten**, Plus-Icon, erste Taste der Gruppe, Name «Ausgabe hinzufügen». Die erste Heute-Karte (Termin) behält die **einzige Primär-Taste** der Seite. Abgelehnt: Termin nur kompakt ohne Taste. | ux-spec §1.1 (eine Primär-Aktion je Ansicht); zwei gefüllte Flächen konkurrieren auf 360 px im selben ersten Bildschirm; der Kopf ist in allen Teilphasen gleich gebaut (nur Kontur-Tasten); `[+ Ausgabe]` bleibt durch Lage (oben, erster Bildschirm, erste Taste) und Plus-Icon schnell. Minze bleibt Ring, Linie und „erledigt“ vorbehalten. | Mockup: Minze → **Kontur** |
| **U-26** Weg-Überschrift je Teilphase | **Festgelegt, ohne Reiseziel:** Vorbereitung «Euer Weg bis zur Abreise» / «The road to departure» · Unterwegs «Eure Reise, Tag für Tag» / «Your trip, day by day» · Danach «Nach der Reise» / «After the trip». Meta rechts: Vorbereitung/Danach «{done} von {total} geschafft» / «{done} of {total} done» (total = Stationen ohne Ziel; **total = 0 → Meta entfällt**), Unterwegs «Tag 3 von 8» / «Day 3 of 8». | Es gibt kein Feld „Reiseziel“, nur den frei gewählten Reisenamen («Jungs-Trip 2027», «Mallorca») – «nach {Name}» bricht die Grammatik (nach/in/auf/in die). Ein Zielfeld wäre ein eigenes Feature (später), dann kann die Überschrift es aufnehmen. | «Kroatien» im Mockup = Demo-Text, nicht übernehmen |
| **U-27** Danach – Unterlagen doppelt | **Nicht „beides“.** D2 „Unterlagen sichern“ erscheint **erst 7 Tage vor der Löschung** (Als Nächstes «Werden am 19. Juli gelöscht – jetzt herunterladen.»); bis dahin nur die Kachel «7 Unterlagen · gelöscht am 19. Juli». Solange D2 sichtbar ist, entfällt die Kachel. Nach der Löschung: D2 erledigt, keine Kachel. | Hält die Regel „ein Einstieg je Bereich“ ohne Ausnahme; eine Später-Zeile wäre für eine Ablage, die man *jetzt* öffnen will, der falsche Ort; die Frist erscheint, wenn sie relevant wird. (Betrifft Inkrement 12.) | Mockup zeigt beides – Entwicklung folgt v2.4 |
| **U-28** Schiene statt „Linie entfällt“ (D-43) | **Bestätigt.** Container < 22 em: Schiene 3 px links, 16 px Einzug, Label-Chips mit Marker-Symbol 22 px. Eingearbeitet in v2.9. | Der Weg bleibt auch bei 200 % als Weg lesbar; kein Platzverlust. | passt |
| **U-29** Siegel = Marker (UM-4) | **Bestätigt** – s. Bewertung UM-4 unten. Eingearbeitet in v2.7. | – | passt |
| **U-30** Orga Danach «Abrechnung abschließen?» | **Bestätigt:** Vereinfachung nur im Mockup; gebaut wird nach Tabelle D1 (v2.4). `[Abschließen]` ist **immer sekundär**, auch als erste ausgeklappte Heute-Karte (dann hat die Seite keine Primär-Taste). Rolle „Sara bucht“ ist nur eine Demo-Datenvariante; Lena bleibt Orga. (Betrifft Inkrement 10/11.) | Freiwilliges darf nicht wie Pflicht aussehen. | Rolle D1-Orga fehlt im Mockup – Entwicklung folgt v2.4 |

**Bewertung Motion-Abweichung UM-4 (Marker wird selbst zum Siegel): einverstanden.** Ein Objekt statt zwei gleich aussehender Minze-Kreise; die Ursache-Wirkung ist klarer (der Schritt selbst wird „besiegelt“); keine Layout-Verschiebung, kein zusätzliches Element im Fokus-/Lesepfad. Bedingungen: (a) Pop **einmal** je neu erledigter Station (Merker je Reise in `localStorage`, v2.7); mehrere neu erledigte Stationen = **ein** Pop am Marker der Erledigt-Zeile; (b) keine Live-Ansage – «Neu erledigt: …» steht als Text; (c) reduzierte Bewegung: nur Überblenden 140 ms; (d) kein FLIP/Umsortieren (wie M-U3). Die Gegenprüfung durch den Motion Designer (`docs/motion/abstimmung.md`) steht noch aus – aus UX-Sicht nicht blockierend.

## v2.13 Inkrement-8-Schnitt (Cockpit-Grundgerüst + Infos W22)

**Gebaut in Inkrement 8:** Ticket-Kopf mit Ring (Feier W11 unverändert, Konfetti auf Antippen UM-1, Mini-Ring UM-6), Weg mit allen Zuständen und Motion UM-2–UM-7, „ohne App erledigt“ (UX-9) für V2, Kacheln, „Mehr zur Reise“, Infos (W22), Phase-3-Navigation (Hub ohne Tabs, Weiterleitung alter Tab-Routen). **Nicht gebaut:** Unterkunft (Inkr. 9), Kosten (10), „Bucht“ + Reisedaten (11), Unterlagen (12).

**Grundregel – keine Teaser:** Adapter nicht gebauter Bereiche liefern `null`. Dann gibt es dafür **keine** Station, Kachel, Aufgabe, Kopf-Taste, keinen Menüpunkt, keinen Satzteil und keine Erwähnung in Leer-/Hilfetexten. Kein „Bald verfügbar“, keine ausgegrauten Kacheln, keine leeren Gruppen-Labels („Als Nächstes“/„Später“ entfallen ganz, wenn leer). Neue Bereiche docken später nur über ihren Adapter an – am Muster ändert sich nichts.

| | Vorbereitung | Unterwegs | Danach |
|---|---|---|---|
| Phasenzeile | «Steht fest · noch 41 Tage» | «Unterwegs · Tag 3 von 8» | **«Zurück seit 9 Tagen»** / «Back for 9 days» (die Kosten-Varianten erst ab Inkr. 10) |
| Kopf-Tasten | `[Kalender]` | **keine** (Crew-Button allein; `[+ Ausgabe]` ab 10, `[Tickets]` ab 12) | **keine** (`[Ausgleichen]` ab 10) |
| Stationen | V1, V2, Ziel V6 | Erledigt-Gruppe «Vorbereitung · {n} erledigt», Ziel T-Ziel „Heimreise“; Termine: nur der **Treffpunkt am ersten Reisetag** (aus Infos, s. u.) | Erledigt-Gruppe «Reise · Vorbereitung und 8 Tage», Ziel „Wohin geht's als Nächstes?“ (keine D-Stationen) |
| „du bist dran“ möglich | V1 (Orga: «Allen Bescheid geben»), A2 (nur **Orga**, Infos leer, ≤ 21 Tage vor Anreise) | – | – |
| „wartet“ möglich | V2 (Platzhalter offen; Orga `[Mia erinnern]` + «Mia macht ohne App mit», Mitglied `[Lena Bescheid geben]`) | – | – |
| Als Nächstes / Später | entfallen (kommt nicht vor) | entfallen | entfallen |
| Heute-Sätze | H-1, H-2 («Mia tritt bei»), H-3 | H-7 (Tag 1), H-4 | H-5b |
| Weg-Meta | «{done} von 2 geschafft» | «Tag 3 von 8» | entfällt (total = 0) |
| Kacheln | Infos | Infos | Infos |
| Mehr zur Reise | So habt ihr entschieden · Wer ist dabei? | dto. | dto. |

**Details:**
- **Ziel V6 „Es geht los!“** Statuszeile: erste Zeile des Felds *Treffpunkt & Anreise* (max. 2 Zeilen, „…“) → sonst «Check-in ab 15:00 Uhr» → sonst «Noch 41 Tage». Link → `/info`.
- **Ziel T-Ziel „Heimreise · Sa., 19. Juni“** (unterwegs): Statuszeile «Check-out bis 10:00 Uhr» → sonst «Noch 5 Tage»; Link → `/info`.
- **Treffpunkt-Termin am ersten Reisetag:** Haben die Infos einen Treffpunkt, steht er unter HEUTE als Termin-Karte (Lavendel, Chip «Termin heute», Titel «Treffpunkt», Text = Treffpunkt-Feld max. 2 Zeilen, Primär «Infos öffnen» → `/info`). Ohne Treffpunkt: Heute ohne Karte, nur H-7.
- **V2 mit offenem Platzhalter nach Reisebeginn:** wird in die Erledigt-Gruppe einsortiert als «nicht genutzt – Mia ist nicht beigetreten» (ohne Häkchen, v2.4 Unterwegs).
- **Infos-Kachel** (immer, einzige Kachel): Status = erste vorhandene Angabe aus «Treffpunkt steht» · «Check-in ab 15:00 Uhr» · «Adresse da»; mehrere → mit « · » verbunden, max. 2 Zeilen. Leer: Mitglied «Noch leer – {Orga} trägt sie ein», Orga «Infos ergänzen». Überschrift „Immer griffbereit“ bleibt auch bei nur einer Kachel (die Kachel nimmt mobil die halbe Breite ein, ab 600 px ein Drittel – nicht strecken).
- **Rechte:** Infos bearbeiten und A2 nur **Orga** (F-056 „Bucht“ erst Inkr. 11; Prüfung über eine Funktion `canEditTripInfo(member)`, die später „Bucht“ ergänzt).
- **Reisemenü `⋯`:** Freunde einladen · So habt ihr entschieden · *(Orga)* Reise bearbeiten · *(Orga)* Festlegung aufheben … · Hilfe · Reise verlassen … – **ohne** „Wer bucht?“ und ohne Saldo-/Unterlagen-Warnungen.
- **Danach – „Neue Reise planen“** → `/trips/new` (ohne Vorbelegung der Gruppe in Inkr. 8) + 13-px-Löschhinweis (F-013, vorhanden).

### Wireframes Inkrement 8 (360 px)

```
Vorbereitung, Max (Mitglied), alles erledigt        Vorbereitung, Lena (Orga), direkt nach Festlegung
┌──────────────────────────────┐                     ┌──────────────────────────────┐
│▓ Zeile 1 + Ticket (Kalender) ▓│                     │▓ Zeile 1 + Ticket (Kalender) ▓│
╰▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╯                     ╰▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╯
 Euer Weg bis zur Abreise                             Euer Weg bis zur Abreise
                 2 von 2 geschafft                                     0 von 2 geschafft
 (✓) 2 erledigt: Termin steht, … ▾                    (☀) HEUTE · Do., 22. Okt.
  ┃                                                    ┃ Du bist dran – eine Sache für dich.
 (☀) HEUTE · So., 2. Mai                               ┃ ┏ DU BIST DRAN ━━━━━━━━━━━━━━┓
  ┆ Alles erledigt – jetzt nur                         ┃ ┃(✓) Termin steht          › ┃
  ┆ noch Vorfreude!                                    ┃ ┃Sag allen Bescheid, dass  ┃
  ┆                                                    ┃ ┃der Termin steht.         ┃
 (★) ZIEL · Sa., 12. Juni                              ┃ ┃[  Allen Bescheid geben  ]┃  einzige Primär-Taste
  ┌ Es geht los!               › ┐                     ┃ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛
  │ Treffpunkt 6:15 Uhr · Flug-  │                     ┆
  │ hafen München T2             │                    (◔) LÄUFT · wartet auf andere
  └──────────────────────────────┘                     ┆ ┌ Alle sind dabei        › ┐
 Immer griffbereit                                     ┆ │ Mia ist noch nicht beigetreten │
 ┌──────────────┐                                      ┆ └──────────────────────────┘
 │(i)          ›│                                      ┆ [🔔 Mia erinnern]  Mia macht ohne App mit
 │Infos         │                                      ┆
 │Treffpunkt    │                                     (★) ZIEL · Sa., 12. Juni
 │steht · Check-│                                       ┌ Es geht los!   Noch 233 Tage › ┐
 │in ab 15 Uhr  │                                       └──────────────────────────────┘
 └──────────────┘                                     Immer griffbereit
 Mehr zur Reise                                        ┌ Infos – Infos ergänzen   › ┐
 (✓) So habt ihr entschieden ›                        Mehr zur Reise …
 (⚇) Wer ist dabei? (6)      ›
```

Länge Inkrement 8: Kopf ≈ 330 · Weg ≈ 300–520 · Kachel ≈ 130 · Mehr ≈ 150 → **≈ 0,9–1,3 Bildschirme** (390 × 844).

**Abnahme UX Inkrement 8** (zusätzlich zu v2.10, soweit ohne spätere Bereiche möglich): Max Vorbereitung alles erledigt (H-3) · Max mit offenem Platzhalter (H-2, `[Lena Bescheid geben]`) · Lena direkt nach Festlegung (V1 dran, Primär) · Lena „Mia macht ohne App mit“ + Rückgängig in der Erledigt-Gruppe · Lena ≤ 21 Tage mit leeren Infos (A2) · Unterwegs Tag 1 mit/ohne Treffpunkt (H-7, UM-7 einmal je Person) · Unterwegs Tag 3 (H-4) · Danach (H-5b, «Zurück seit 9 Tagen») · Infos-Kachel leer/gefüllt je Rolle · 200 % (Schiene) · Dark Mode · Prüfung, dass **kein** Text, Menüpunkt oder Platzhalter die Bereiche aus Inkr. 9–12 erwähnt.

## v2.14 Inkrement-9-Schnitt – Station V3 „Unterkunft“, Kachel, Erinnern (2026-10-23)

Gilt vor v2.4 (V3-Tabelle) und v2.6 für Inkrement 9. Bereich: [W18 E](w18-unterkunft-swipen.md), Vorschlagen: [W17 F](w17-unterkunft-vorschlagen.md), Daten/Rechte: [`features.md` R.7](../../product/features.md). „Bucher“ = **Orga** (Markierung „Bucht“ erst Inkr. 11 – Spalte „bucht“ der v2.4-Tabelle entfällt bis dahin, keine Erwähnung in Texten).

**Adapter** `stayStatus()` → `areas.stay` (Vorschlag für den Vertrag v2.10): `{ total, myUnrated, myNew, membersDone, membersTotal, favourite: { titles: string[]; likes: number } | null /* nur Orga oder wenn freigegeben */, chosen: { title } | null, booked: boolean, rebook: boolean /* „gebucht“ wegen neuem Termin zurückgesetzt, Hinweis nicht geschlossen */, withoutApp: boolean }`. `null` = Bereich nicht gebaut (vor Inkr. 9). Für Mitglieder, deren Rangliste gesperrt ist, liefert der Server `favourite = null` (Q33).

### V3 – Zustände (erste passende Regel gilt; Zählbasis `membersTotal` = Mitglieder ohne Platzhalter)
| # | Lage | Mitglied | Orga |
|---|---|---|---|
| 1 | **erledigt**: festgelegt **und** gebucht · oder UX-9 gesetzt | erledigt «{Titel} · gebucht ✓» bzw. «Ohne App erledigt» (Chip wie V2) | dto.; bei UX-9 in der aufgeklappten Erledigt-Gruppe Text-Taste «Rückgängig» |
| 2 | Teilphase *Unterwegs*/*Danach*, nicht erledigt | in der Erledigt-Gruppe **ohne Häkchen** («nicht genutzt»): festgelegt → «{Titel} · nicht als gebucht markiert», sonst «nicht genutzt – keine Unterkunft festgelegt» | dto. |
| 3 | ich habe unbewertete Vorschläge, nichts festgelegt | **dran** – Rang 3 (eigener Beitrag) | **dran** – Rang 3; zusätzlich Text-Taste «Schon festlegen» (→ `/stays#ranking`) |
| 4 | Orga: alle Mitglieder fertig, nichts festgelegt | – | **dran** – Rang 1 (blockiert andere) |
| 5 | Orga: festgelegt, nicht gebucht | – | **dran** – Rang 2 (Frist) |
| 6 | ich fertig, andere nicht, nichts festgelegt | **wartet** + `[Erinnern]` (`stay-rate`) | **wartet** + `[Erinnern]` + Text-Tasten «Schon festlegen», «Haben wir schon / brauchen wir nicht …» |
| 7 | alle fertig, nichts festgelegt | **wartet** + `[{Orga} Bescheid geben]` (`stay-fix`) | (→ Regel 4) |
| 8 | festgelegt, nicht gebucht | **wartet** + `[{Orga} Bescheid geben]` (`stay-book`) | (→ Regel 5) |
| 9 | 0 Vorschläge | **als Nächstes** (bzw. später) | dto. + Text-Taste «Haben wir schon / brauchen wir nicht …» |

Regel 3 vor 4: Hat die Orga selbst noch offen, bleibt sie „dran – bewerten“; Festlegen erreicht sie über «Schon festlegen». Nach einem neuen Vorschlag fällt jede Person mit offenem Vorschlag zurück auf Regel 3 (W18 E.5.6). UX-9 ist nur in Regeln 6 und 9 und beim Bewerten der Orga (3) als Text-Taste erreichbar, nie wenn festgelegt.

### V3 – Texte (Titel immer «Unterkunft» / «Place to stay», Icon `bed`, Ton Lavendel)
| Regel | Statuszeile / Text DE | EN | Taste |
|---|---|---|---|
| 3 kompakt | Du hast {rated} von {total} bewertet (+ Balken, `aria-hidden`) | You've rated {rated} of {total} | – |
| 3 ausgeklappt | {count, plural, one {Eine Unterkunft wartet} other {# Unterkünfte warten}} auf deine Bewertung. Du hast {rated} von {total} bewertet. · mit Neuen: {count, plural, one {1 neue Unterkunft} other {# neue Unterkünfte}} seit deinem letzten Swipen – danach siehst du das Ranking wieder. | {count, plural, one {One place is} other {# places are}} waiting for your rating. You've rated {rated} of {total}. · {count, plural, one {1 new place} other {# new places}} since you last swiped – rate them to see the ranking again. | Primär «Jetzt swipen» / «Start swiping» → `/stays/swipe` |
| 4 | Unterkunft festlegen – Favorit: {title} ({likes} ♥) · Gleichstand: Unterkunft festlegen – gleichauf: {titles} · ohne ♥: Unterkunft festlegen – noch kein klarer Favorit | Pick the place – favourite: {title} ({likes} ♥) · Pick the place – tied: {titles} · Pick the place – no clear favourite yet | Primär «Festlegen» / «Pick one» → `/stays#ranking` (Fokus h2 «Rangliste») |
| 5 | {title} buchen – danach als gebucht markieren. · nach Termin-Änderung: Neuer Termin – {title} neu buchen und als gebucht markieren. | Book {title} – then mark it as booked. · New dates – rebook {title} and mark it as booked. | Primär «Zur Unterkunft» / «Go to the place» → `/stays` |
| 6 Mitglied | {done} von {total} haben bewertet | {done} of {total} have rated | `[Erinnern]` (Name «Alle erinnern, die noch nicht bewertet haben») |
| 6 Orga | {done} von {total} haben bewertet · Favorit: {title} ({likes} ♥) | {done} of {total} have rated · favourite: {title} ({likes} ♥) | wie oben + Text-Tasten |
| 7 | Alle haben bewertet – {orga} legt fest. | Everyone's rated – {orga} will pick one. | `[{orga} Bescheid geben]` |
| 8 | {orga} bucht {title}. · nach Termin-Änderung: Neuer Termin – {orga} bucht {title} neu. | {orga} is booking {title}. · New dates – {orga} is rebooking {title}. | `[{orga} Bescheid geben]` |
| 9 | Noch keine Vorschläge – schlag die erste vor, ein Link reicht. | No suggestions yet – suggest the first one, a link is all it takes. | – (ganze Karte → `/stays`) |
| Text-Tasten | Schon festlegen · Haben wir schon / brauchen wir nicht … | Pick one now · Already sorted / don't need one … | |

**Kurzformen für H-2** («Ihr wartet auf: …»): Regel 6 «Bewertungen für die Unterkunft» / «ratings for the place to stay» · Regel 7 «{orga} legt die Unterkunft fest» / «{orga} to pick the place» · Regel 8 «{orga} bucht {title}» / «{orga} to book {title}».

**Heute-Sortierung:** Der Rang hängt jetzt vom **Zustand** ab, nicht nur von der Station (V3 kann Rang 1, 2 oder 3 haben). Vorschlag für `trip-route.ts`: `TripStation.rank` je Eintrag statt der festen `RANK`-Tabelle je ID; Reihenfolge bei gleichem Rang = Katalog (V1, V2, V3, A2). Gesamt: V1 Bescheid geben (1) · V3 festlegen (1) · V3 buchen (2) · A2 (2) · V3 bewerten (3).

**Gruppen und Meta:** „Als Nächstes“ kommt mit Inkr. 9 erstmals vor (Regel 9; ist V2 noch offen und V3 ohne Vorschläge, steht V3 unter „Als Nächstes“). Weg-Meta Vorbereitung «{done} von 3 geschafft». Ziel V6 unverändert (Check-in kommt aus den Infos, nicht aus der Unterkunft).

### Kachel „Unterkunft“ (v2.6, erste in der Reihenfolge)
Erscheint, wenn V3 **erledigt** ist (alle Teilphasen) **oder** in *Unterwegs*/*Danach*, sobald es ≥ 1 Vorschlag gibt (V3 steht dann „nicht genutzt“ in der Erledigt-Gruppe; die Kachel ist der Einstieg zum Nachschlagen, R.7 I9-08). Ziel `/stays`.

| Lage | Statuszeile DE | EN |
|---|---|---|
| festgelegt + gebucht | {title} · gebucht ✓ | {title} · booked ✓ |
| UX-9 | Ohne App erledigt | Sorted outside the app |
| Unterwegs/Danach, festgelegt, nicht gebucht | {title} | {title} |
| Unterwegs/Danach, nichts festgelegt | {count, plural, one {1 Vorschlag} other {# Vorschläge}} · keiner festgelegt | {count, plural, one {1 suggestion} other {# suggestions}} · none picked |

Zugänglicher Name = «Unterkunft. {Status}». Max. 2 Zeilen, Titel mit „…“ gekürzt. Kein Chip.

### Erinnern (RemindSheet, ux-spec §14.2) – Anlässe in Inkrement 9
| Anlass | Einstieg | Schritt | Inhalt |
|---|---|---|---|
| `stay-rate` | V3 Regel 6 `[Erinnern]`; W18 Hinweis «Basiert auf …» | `status` → `single`/`all` | `status`: h2 «Wer hat bewertet?» / «Who has rated?» · Gruppen «Fehlt noch ({n})» / «Still missing ({n})» und «Fertig ({n})» / «Done ({n})» · Statuszeilen «noch {count} offen» / «{count} left» bzw. «alles bewertet» / «all rated» · nur Mitglieder, keine Platzhalter · eigene Zeile (falls offen) Link «Jetzt swipen» · Fußleiste «Alle erinnern ({n})». Text `single`: DE «Hey {name}, bei {trip} {count, plural, one {wartet eine Unterkunft} other {warten # Unterkünfte}} auf deine Bewertung – dauert eine Minute: {link}» · EN «Hey {name}, {count, plural, one {one place is} other {# places are}} waiting for your rating in {trip} – takes a minute: {link}». `all`: DE «Hey ihr, bei {trip} warten noch Unterkünfte auf eure Bewertung – dauert eine Minute: {link}» · EN «Hey all, there are places waiting for your rating in {trip} – takes a minute: {link}». |
| `stay-fix` | V3 Regel 7 | `orga` | Kontext «Alle haben bewertet. Sag {orga} kurz, dass es ans Festlegen geht.» / «Everyone's rated. Give {orga} a nudge to pick one.» · Text v2.8 |
| `stay-book` | V3 Regel 8 | `orga` | Kontext «{title} steht fest. Sag {orga} kurz, dass es ans Buchen geht.» / «{title} is picked. Give {orga} a nudge to book it.» · Text v2.8 (`{booker}` = Orga) |

`{link}` = `/trips/{id}/stays` (dort sieht man je nach Lage die Swipe-Aufforderung oder „Eure Unterkunft“). Texte nennen nie Preise oder Notizen. Orga erinnert Platzhalter hier nicht (sie bewerten nicht).

### Sonstiges
- **Reisemenü `⋯`:** keine Änderung (kein Menüpunkt „Unterkünfte“ – ein Einstieg je Bereich).
- **Termin aufgehoben → Phase 2:** V3/Kachel verschwinden mit dem Weg; nach neuer Festlegung zurück (W18 E.8). Bei anderem Zeitraum steht die Orga sofort in Regel 5 („neu buchen“).
- **„Neu erledigt“ (v2.7):** gilt für V3 ebenso («Neu erledigt: Unterkunft»).
- **Kopf-Tasten:** keine neue.

**Abnahme UX (zusätzlich zu W18 E.15):** Max Vorbereitung mit 3 offenen (V3 dran, Rang nach V1-Orga-Fällen, Primär «Jetzt swipen») · Max fertig, andere offen (wartet, Erinnern → `status` ohne Platzhalter) · Max alle fertig (wartet, «Lena Bescheid geben» → `stay-fix`) · Lena alle fertig (dran Rang 1 «Festlegen») · Lena Gleichstand / kein ♥ · Lena festgelegt nicht gebucht (dran) · gebucht → Kachel «… · gebucht ✓» + «Neu erledigt» · UX-9 + Rückgängig · keine Vorschläge (Als Nächstes) · Unterwegs ohne Festlegung mit Vorschlägen (nicht genutzt + Kachel) · Termin anders neu festgelegt (Regel 5 „neu buchen“) · H-2-Kurzformen · 200 % (Schiene) · Dark Mode · kein Text, Chip oder Menüpunkt erwähnt die Markierung „Bucht“ (das Verb in «Lena bucht …» ist gemeint und richtig).

## v2.15 Inkrement-10-Schnitt – Kosten: Kachel, A1, D1, Kopf-Tasten, Erinnern (2026-10-23)

Gilt vor v2.4 (A1, D1-Tabelle, Teilphase Danach), v2.6 und v2.8 für Inkrement 10. Bereich: [W19 D](w19-kosten.md), Daten/Rechte/Rechenregeln: [`features.md` R.8](../../product/features.md). CEO-Entscheidungen 2026-10-23: (a) Orga markiert keine Ausgleiche zwischen zwei Mitgliedern mit Konto; (b) Abschließen sperrt auch das Markieren.

**Adapter** `costStatus()` → `areas.costs` (Vertrag v2.10): `{ expenseCount /* nicht gelöscht */, totalCents, currency, myBalanceCents, myDebts: { name: string; cents: number }[] /* Zeilen des Vorschlags, in denen ich zahle */, owedToMe: { name: string; cents: number; placeholder: boolean; former: boolean }[], openTransfers: number /* Zeilen des Vorschlags gesamt */, allSettled: boolean /* alle Salden 0 */, closed: boolean, threshold: number /* Cent, R.8 Regel 7 */ }`. `null` = Bereich nicht gebaut (vor Inkr. 10). „Offen“ = `!allSettled`.

### Kachel „Kosten“ (v2.6, Reihenfolge Unterkunft · Unterlagen · Kosten · Infos · Reisedaten)
Ziel `/costs`, Icon `wallet` (neu, D-58), Ton laut Designer (D-56). Erscheint in *Vorbereitung* und *Unterwegs* **immer** (auch ohne Ausgaben – Einstieg für Anzahlungen); in *Danach* nur, wenn **keine D1-Station sichtbar** ist (D1 erledigt oder 0 Ausgaben) – ein Einstieg je Bereich.

| Lage | Statuszeile DE | EN |
|---|---|---|
| 0 Ausgaben | Noch keine Ausgaben | No expenses yet |
| ≥ 1, Saldo < 0 | {total} gesamt · du schuldest {amount} | {total} in total · you owe {amount} |
| ≥ 1, Saldo > 0 | {total} gesamt · du bekommst {amount} | {total} in total · you're owed {amount} |
| ≥ 1, Saldo = 0, andere offen | {total} gesamt · bei dir ausgeglichen ✓ | {total} in total · you're all square ✓ |
| alle 0 | {total} gesamt · alles ausgeglichen ✓ | {total} in total · all square ✓ |
| abgeschlossen (Zusatz vorn) | Abgeschlossen · {…wie oben} | Closed · {…} |
Beträge über `formatMoney` (ganze Beträge ohne „,00“, sonst exakt); `{amount}` nie gerundet. Zugänglicher Name «Kosten. {Status}». Kein Chip. Max. 2 Zeilen.

### A1 „Du schuldest …“ (Aufgabe ohne Station, nur *Vorbereitung* und *Unterwegs*)
- **Bedingung:** eigener Saldo ≤ −Schwelle (R.8 Regel 7: 50 € / 50 £ / 500 DKK …; −49,99 € → keine Aufgabe) **und** nicht abgeschlossen. Rang **3** (eigener Beitrag, v2.5). Unterwegs nach den Terminen.
- **Titel** (Kartenkopf, statt Stations-Titel): 1 Empfänger «Du schuldest {name} {amount}» / «You owe {name} {amount}» · 2 Empfänger «Du schuldest {total} – an {name1} und {name2}» / «You owe {total} – to {name1} and {name2}» · ≥ 3 «Du schuldest {total} – an {name1} und {count} weitere» / «You owe {total} – to {name1} and {count} others» (`{total}` = |Saldo|, Empfänger in Vorschlags-Reihenfolge). Platzhalter-/ehemalige Empfänger mit Namen bzw. «ehemaliges Mitglied».
- **Status** (ausgeklappt): «Überweisen und als bezahlt markieren – die Zahlungsinfo steht beim Ausgleich.» / «Send the money, then mark it as paid – payment details are on the settle-up page.» (ohne Zahlungsinfo beim Empfänger: «Überweisen und als bezahlt markieren.» / «Send the money, then mark it as paid.»). **Primär** «Zum Ausgleich» / «Settle up» → `/costs/balances`. Titelzeile-Link → `/costs/balances`. Icon `wallet`.
- Keine Erinnern-Taste, keine H-2-Kurzform (A1 ist nie „wartet“).

### D1 „Kosten ausgleichen“ / „Settle up“ (nur *Danach*, sichtbar bei ≥ 1 Ausgabe) – ersetzt die D1-Tabelle in v2.4
Erste passende Zeile gilt. `[…]` = Taste; Text-Tasten in Klammern.

| # | Lage | Mitglied | Orga |
|---|---|---|---|
| 1 | alle 0 **und** abgeschlossen | erledigt «Alles ausgeglichen ✓» | erledigt «Alles ausgeglichen · abgeschlossen ✓» |
| 2 | abgeschlossen, offen | erledigt «Abrechnung abgeschlossen» (+ bei eigenem Saldo ≠ 0 «· du schuldest/bekommst noch {amount}» – Info, kein Druck; Markieren ist gesperrt) | erledigt, dto. – in der aufgeklappten Erledigt-Gruppe Text-Taste «Abrechnung wieder öffnen» |
| 3 | ich schulde | **dran**, Rang 2 – Titel wie A1 («Du schuldest Kemal 23,50 €» bzw. Mehr-Empfänger-Form), Status wie A1, Primär «Zum Ausgleich» | **dran**, dto. |
| 4 | ich bekomme | **wartet** «Du bekommst noch {amount} von {name}» (mehrere: «… von {name1} und {name2}» / «… von {name1} und {count} weiteren»); `[{name} erinnern]` bei genau einem Schuldner mit Konto oder Platzhalter, sonst `[Erinnern]` → Sheet-Schritt `status` nur mit **meinen** Schuldnern (keine ehemaligen) | **wartet**, dto. |
| 5 | ich ausgeglichen, andere offen | **wartet** «Noch {count} Ausgleiche offen» – kein Erinnern | **wartet** «Noch {count} Ausgleiche offen» `[Erinnern]` (`settle-all`) + (Abschließen …) |
| 6 | alle 0, nicht abgeschlossen | erledigt «Alles ausgeglichen ✓» | **dran**, Rang 4 «Alles ausgeglichen – Abrechnung abschließen?» `[Abschließen]` **immer sekundär** (U-30; Seite hat dann ggf. keine Primär-Taste) → Dialog W19 D.9 direkt im Cockpit |

- Text-Taste «Abschließen …» in Zeile 5 (Orga) öffnet den Warn-Dialog W19 D.9 („trotzdem abschließen?“).
- **Kurzformen H-2** («Ihr wartet auf: …»): Zeile 4 «{name} gleicht aus» / «{name} to settle up» (mehrere: «Ausgleiche an dich» / «payments to you») · Zeile 5 «Ausgleiche der anderen» / «the others to settle up».
- **Weg-Meta Danach** «{done} von {total} geschafft», total zählt D1 mit (Inkr. 10: total = 1, solange D2/D3 nicht gebaut). Erledigt-Zeile: «Reise · Vorbereitung, {days} Tage und Ausgleich» / «Trip · prep, {days} days and settling up», wenn D1 erledigt ist.
- „Neu erledigt“ (v2.7) gilt für D1 («Neu erledigt: Kosten ausgleichen»), Siegel-Marker UM-4.

### Phasenzeile, Heute-Satz, Kopf-Tasten
| | DE | EN | Regel |
|---|---|---|---|
| Phasenzeile *Danach* | Zurück · Kosten ausgleichen | Back · settling up | ≥ 1 Ausgabe, offen, nicht abgeschlossen |
| | Zurück · alles ausgeglichen | Back · all square | ≥ 1 Ausgabe und (alle 0 **oder** abgeschlossen) |
| | Zurück seit {count} Tagen (unverändert) | Back for {count} days | 0 Ausgaben |
| H-5 | Alles ausgeglichen – schön war's! | All square – what a trip! | *Danach*, nichts dran/wartet, ≥ 1 Ausgabe |
| H-5b | unverändert | unverändert | *Danach*, nichts dran/wartet, 0 Ausgaben |
| Kopf *Unterwegs* | `[+ Ausgabe]` – Kontur `on-ck`, Plus-Icon, erste Taste, Name «Ausgabe hinzufügen» | `[+ Expense]` – «Add an expense» | immer, außer abgeschlossen → `/costs/new?date=today&from=cockpit`; nach Speichern zurück ins Cockpit, Fokus auf die Taste, Snackbar mit «Ansehen» (W19 D.5.6) |
| Kopf *Danach* | `[Ausgleichen]` – Kontur `on-ck`, Icon `wallet` | `[Settle up]` | nur offen **und** nicht abgeschlossen → `/costs/balances` |
| Kopf *Vorbereitung* | unverändert `[Kalender]` (keine Kosten-Taste – Einstieg über die Kachel) | | |
Container < 22 em: Kopf-Tasten brechen unter die Crew (v2.9), Texte bleiben.

### Erinnern (RemindSheet, ux-spec §14.2) – Anlässe in Inkrement 10
| Anlass | Einstieg | Schritt | Inhalt |
|---|---|---|---|
| `settle` | D1 Zeile 4; W19 D.7 «{name} erinnern» | `single` (bei mehreren Schuldnern vorher `status`: h2 «Wer schuldet dir noch?» / «Who still owes you?», Zeilen «{name} – {amount}», je Zeile WhatsApp; kein „Alle erinnern“, jede Nachricht nennt einen eigenen Betrag) | DE «Hey {name}, laut Abrechnung von {trip} bekomme ich noch {amount} von dir. Danke! {link}» · EN «Hey {name}, according to the {trip} expenses you still owe me {amount}. Thanks! {link}». `{link}` = `/trips/{id}/costs/balances`; **Platzhalter:** `{link}` = sein persönlicher Link (R.8, wie V2). |
| `settle-all` | D1 Zeile 5 (nur Orga) | `status` | h2 «Offene Ausgleiche» / «Open payments» · Zeilen «{from} → {to}: {amount}» (nur Zeilen mit Schuldner = Mitglied mit Konto oder Platzhalter) · Fußleiste «Alle erinnern» mit DE «Hey ihr, bei {trip} {count, plural, one {ist noch ein Ausgleich} other {sind noch # Ausgleiche}} offen – schaut kurz rein: {link}» · EN «Hey all, {count, plural, one {one payment is} other {# payments are}} still open for {trip} – take a quick look: {link}». Einzeltext je Zeile an den Schuldner: DE «Hey {name}, laut Abrechnung von {trip} gehen noch {amount} von dir an {to}. {link}» · EN «Hey {name}, according to the {trip} expenses you still owe {to} {amount}. {link}». |
Texte nennen **nie** IBAN/Zahlungsinfo, Titel oder Einzelausgaben (R.8 I10-09). Nach Abschluss keine Erinnern-Tasten.

### Sonstiges
- **Reisemenü `⋯`:** keine neue Zeile (ein Einstieg je Bereich). „Reise verlassen …“ enthält die Saldo-Warnung W19 D.10.
- **Termin aufgehoben → Phase 2:** Kachel, A1, D1, Kopf-Tasten verschwinden mit dem Weg; Daten bleiben (W19 D.1).
- **Längen-Budget:** A1/D1 sind normale Heute-Karten (zählen zur 3er-Grenze).
- **`trip-route.ts`:** `StationId` + `"A1" | "D1"`; Katalog-Reihenfolge … V3, A2, A1 (Vorbereitung/Unterwegs) bzw. D1 (Danach); Rang je Zustand über `TripStation.rank` (A1 = 3, D1 schulden = 2, D1 abschließen = 4); `headActions` um `"addExpense" | "settle"`; `TripTile.area` um `"costs"`; Remind-Anlässe `settle`, `settle-all`; `RouteTarget.page` um `costs`, `costsBalances`, `costsNew`. Unit-Tests je Zeile der D1-Tabelle × Rolle, A1 an der Schwelle (−49,99 / −50,00 / −50,01 €, GBP, DKK), Kachel je Zeile, Phasenzeile, H-5/H-5b, Kopf-Tasten je Teilphase inkl. abgeschlossen.

**Abnahme UX (zusätzlich zu W19 D.18):** Vorbereitung 0 Ausgaben (Kachel «Noch keine Ausgaben», keine A1) · Schuld 49,99/50,00 € · A1 mit 1/2/3 Empfängern · Unterwegs `[+ Ausgabe]` → speichern → zurück ins Cockpit, Snackbar «Ansehen», Kachel-Status neu · Danach je D1-Zeile × Rolle (Orga Zeile 6: keine Primär-Taste) · abgeschlossen mit offenen Salden (D1 erledigt, kein `[Ausgleichen]`, Phasenzeile «alles ausgeglichen») · Kachel erscheint erst nach D1 erledigt · Erinnern `settle` an Platzhalter (persönlicher Link) und `settle-all` · H-2-Kurzformen · H-5 vs. H-5b · 200 % (Schiene, Kopf-Tasten umbrechen) · Dark Mode.

## v2.16 Inkrement-11-Schnitt – „Bucht“, Station V4, D3, Kachel „Reisedaten“, Erinnern (2026-10-23)

Gilt vor v2.3 (Zeilen V4, D3), v2.4 (V3-Spalte „bucht“, V4-Tabelle, A2, „Rollen auf einen Blick“), v2.6 und v2.8 für Inkrement 11. Bereich: [W20 H](w20-reisedaten.md) (gilt vor W20 A–G), Daten/Rechte/Lebenszyklus: `features.md` **R.9** (gilt dort; „Hinweise an UI/UX“ eingearbeitet, Nachweis W20 H.17). Mit Inkrement 11 gibt es die Markierung „Bucht“ (F-056): Texte dürfen sie jetzt nennen.

**Adapter** `travelDataStatus()` → `areas.travelData` (Vertrag v2.10, Vorschlag):
```
{
  deleteOn: IsoDate;                 // Abreise + 7 Tage (zugesagtes Datum)
  deleted: boolean;                  // Löschjob gelaufen
  toMe: { requestId; byName; purpose; fieldKeys: string[]; state: 'open'|'released'|'declined'|'expired' }[];
  mine: { requestId; purpose; released: number; total: number /* gefragte Mitglieder mit Konto */;
          open: { key; name }[]; complete: boolean /* niemand mehr offen */;
          usedSinceComplete: boolean /* „Bucht“ hat danach ≥ 1× angezeigt oder kopiert */;
          closed: boolean }[];
  others: { byName; purpose; released; total; complete: boolean }[];   // Orga und „Bucht“: Anfragen anderer „Bucht“-Personen (nur Zahlen)
}
```
`null` = Bereich nicht gebaut **oder abgeschaltet** (`TRAVEL_DATA_ENABLED` aus, R.9 I11-12) → keine V4, keine D3, keine Kachel, kein Anlass, keine Erwähnung. Dazu `RouteViewer.booker: boolean` und `RouteTrip.bookerNames: string[]` (Reihenfolge: Orga zuerst, dann nach Vergabe) – beide braucht V3 auch, wenn `travelData = null`.

### V4 „Reisedaten“ / „Travel details“ – sichtbar und Zustände
Icon `id-card` (D-64), Bereichsfarbe laut Designer (design-system §9.23: Lavendel/Indigo `travel-area-*`, D-68). Ziel der Karte: `/travel-data`.

**Sichtbar** in *Vorbereitung* und *Unterwegs*, wenn: (a) mindestens eine Anfrage an mich (nicht `expired`), **oder** (b) ich trage „Bucht“, **oder** (c) ich bin Orga und `others` ist nicht leer. Bei mehreren eigenen Anfragen zählt für Text und Zahlen die **älteste nicht abgeschlossene** (R.9 I11-03). In *Danach* gibt es keine V4 (dafür D3).

Erste passende Zeile gilt (eine Person kann zugleich gefragt und „Bucht“ sein – der dringendere Teil bestimmt die Karte, Details stehen im Bereich):

| # | Lage | Zustand | Statuszeile / Text DE | EN | Taste |
|---|---|---|---|---|---|
| 1 | ≥ 1 Anfrage an mich **offen** | **dran**, Rang **1** (blockiert andere) | Titel: 1 Anfrage «Reisedaten für {by}» · mehrere «Reisedaten – {count} Anfragen». Kompakt: «{by} bittet um deine Reisedaten» / mehrere «{by1} und {by2} bitten um deine Reisedaten». Ausgeklappt: «Für „{purpose}“: {fields}. Nur {by} sieht sie.» (`{fields}` = Feldnamen mit «und», z. B. «Name laut Ausweis und Geburtsdatum»; mit Dokument: «… und Ausweisnummer») | Title «Travel details for {by}» · «Travel details – {count} requests». «{by} is asking for your travel details» · «For “{purpose}”: {fields}. Only {by} sees them.» | Primär «Angaben freigeben» / «Share details» → `/travel-data/{requestId}` (älteste offene Anfrage) |
| 2 | ich bin „Bucht“, eine eigene Anfrage `complete`, ≥ 1 freigegeben, `!usedSinceComplete`, nicht geschlossen | **dran**, Rang **2** | «Alle haben geantwortet – {released} von {total} freigegeben. Du kannst buchen.» | «Everyone has answered – {released} of {total} shared. You can book now.» | Primär «Zu den Reisedaten» / «Go to travel details» → `/travel-data` |
| 3 | ich bin „Bucht“, eine eigene Anfrage hat Offene | **wartet** | «{released} von {total} haben freigegeben · offen: {names}» (Namen max. 2 + «und {n} weitere») | «{released} of {total} have shared · still open: {names}» | `[Erinnern]` (Name «Alle erinnern, die noch nicht geantwortet haben») → Anlass `travel-data` |
| 4 | ich bin Orga, Anfrage eines anderen läuft (nicht an mich oder von mir beantwortet) | **wartet** | «{by} sammelt Reisedaten · {released} von {total}» (mehrere „Bucht“: «{by1} und {by2} sammeln Reisedaten») | «{by} is collecting travel details · {released} of {total}» | – (die Anfrage gehört „Bucht“; kein Erinnern) |
| 5 | ich bin „Bucht“ **ohne** eigene Anfrage, nichts sonst offen | **später** (schmale Zeile, **nie** „als Nächstes“, zählt nicht im Weg-Meta, in *Unterwegs* nicht sichtbar) | «Nur falls die Buchung es braucht: hier anfragen statt im Chat.» | «Only if the booking needs it: ask here instead of in the chat.» | – (Zeile → `/travel-data`, dort Leerzustand mit Primär) |
| 6 | sonst | **erledigt** | Mitglied: «Freigegeben an {by} ✓» · «Du klärst es direkt mit {by}» · mehrere «{count} Anfragen beantwortet» · erloschen «Angaben gelöscht» · „Bucht“: «{released} von {total} freigegeben» · geschlossen «Abgeschlossen – Angaben gelöscht» · alle abgelehnt «Niemand hat freigegeben – ihr klärt es direkt» · Orga (4 fertig) «{by} hat alle Antworten» | «Shared with {by} ✓» · «You're sorting it out with {by}» · «{count} requests answered» · «Details deleted» · «{released} of {total} shared» · «Closed – details deleted» · «Nobody shared – you're sorting it out directly» · «{by} has every answer» | – |

- **Entscheidung „Angaben anfragen“ ist keine Heute-Aufgabe.** Die App weiß nicht, ob eine Buchung Ausweisdaten braucht (innerhalb Europas meist nicht). Würde sie „Bucht“ zum Anfragen drängen, sammelte sie Daten auf Vorrat – gegen die Datensparsamkeit von F-054. Darum Zeile 5 als leise „später“-Zeile und nur ein Einstieg, kein Druck (wie V5).
- **Zeile 2 statt „Abschließen“ als Pflicht** (Änderung zu v2.4): Die Aufgabe heißt „benutzen“, nicht „löschen“ – erledigt, sobald „Bucht“ nach der letzten Antwort einmal angezeigt oder kopiert hat. Abschließen bleibt freiwillig im Bereich (W20 H.7). Neue Antwort (z. B. nach „Doch freigeben“) setzt `usedSinceComplete` nicht zurück; neue Personen (Spätbeitretende) machen die Anfrage wieder „nicht complete“ → Zeile 3.
- **Unterwegs:** Zeile 1 steht unter HEUTE **nach** den Terminen (v2.4); Zeilen 2–4 wie in *Vorbereitung*; Zeile 5 entfällt. Nicht erledigte V4 rutscht **nicht** in „nicht genutzt“ – Anfragen können unterwegs noch beantwortet werden (Fähre am Tag 3).
- **Weg-Meta:** V4 zählt in `{total}`, wenn sie sichtbar ist und nicht Zeile 5. Vorbereitung «{done} von 4 geschafft» (V1, V2, V3, V4).
- **Neu erledigt** (v2.7) gilt: «Neu erledigt: Reisedaten».
- **Kurzformen H-2** («Ihr wartet auf: …»): Zeile 3 «Freigaben für deine Anfrage» / «shares for your request» · Zeile 4 «{by} sammelt Reisedaten» / «{by} collecting travel details». (Ersetzt «Freigaben für Lena» aus v2.5.)
- **Heute-Sortierung** (Rang je Zustand, `TripStation.rank`): V1 Bescheid (1) · V3 festlegen (1) · **V4 freigeben (1)** · V3 buchen (2) · **V4 „alle da“ (2)** · A2 (2) · V3 bewerten (3) · A1 (3) · D1 abschließen (4); gleicher Rang → Katalog V1, V2, V3, V4, A2, A1.

### D3 „Reisedaten gelöscht“ / „Travel details deleted“ (nur *Danach*)
Sichtbar, wenn bei Reiseende eine **aktive Freigabe von mir** bestand **oder** ich „Bucht“ mit einer nicht geschlossenen Anfrage mit ≥ 1 Freigabe war (Server merkt es sich bis zum Löschdatum; danach liefert `deleted = true` + Merker, ob es mich betraf).
| Lage | Zustand | DE | EN |
|---|---|---|---|
| vor dem Löschdatum (Tage 1–7 nach der Abreise) | **als Nächstes** (R.9 I11-03; nie dran, keine Taste; ist nach Regel 4 schon eine andere Station „als Nächstes“, dann „später“) | Werden am {date} gelöscht – bis dahin kannst du sie noch ansehen. | Will be deleted on {date} – you can still view them until then. |
| gelöscht | **erledigt** | Am {date} gelöscht – wie angekündigt. | Deleted on {date} – as promised. |
Ziel `/travel-data` (vor der Löschung lesbar und widerrufbar; danach Leerzustand W20 H.9). D3 zählt im Weg-Meta *Danach*. Offene, unbeantwortete Anfragen an mich sind in *Danach* **keine** Aufgabe; im Bereich bleiben sie beantwortbar (W20 H.11).

### Kachel „Reisedaten“ (v2.6, letzte in der Reihenfolge Unterkunft · Unterlagen · Kosten · Infos · Reisedaten)
Erscheint nur in *Vorbereitung* und *Unterwegs*, nur wenn **keine V4 im Zustand dran/wartet/später** sichtbar ist (ein Einstieg je Bereich) **und** Daten für mich da sind. **Auch für jede Person mit eigener gespeicherter Freigabe** (R.9 I11-03, ersetzt „nur Bucht“ aus v2.6/F-054) – der Weg zu Widerruf und Zugriffsprotokoll darf nicht in der eingeklappten Erledigt-Gruppe verschwinden (Art. 7 Abs. 3 DSGVO).

| Lage | Statuszeile DE | EN |
|---|---|---|
| „Bucht“, eine Anfrage mit ≥ 1 Freigabe, nicht geschlossen | {released} von {total} freigegeben · gelöscht am {date} | {released} of {total} shared · deleted on {date} |
| „Bucht“ **und** selbst mit Freigabe | Status der eigenen Anfrage (Zeile oben) – die eigene Freigabe steht im Bereich | wie oben |
| „Bucht“, mehrere solche Anfragen | {count} Anfragen · gelöscht am {date} | {count} requests · deleted on {date} |
| Person mit eigener Freigabe | Freigegeben an {by} ✓ · gelöscht am {date} (zwei: «an {by1} und {by2}», drei: «an {by1}, {by2} und {by3}») | Shared with {by} ✓ · deleted on {date} |
Zugänglicher Name «Reisedaten. {Status}». Kein Chip. In *Danach* keine Kachel (D3 übernimmt).

### V3 „Unterkunft“ – „Bucher“ sind jetzt die „Bucht“-Personen (ersetzt den Satz „Bucher = Orga“ aus v2.14)
**Bucher** = alle mit Markierung „Bucht“; gibt es keine, die Orga. Festlegen bleibt **nur Orga** (Q33); «gebucht ✓» setzen/zurücknehmen: Orga **und** „Bucht“ (W18 E.16).

| Regel v2.14 | Änderung |
|---|---|
| 5 (festgelegt, nicht gebucht) | **dran**, Rang 2, für **jede Bucher-Person** (auch wenn sie nicht Orga ist). Die Orga ist nur dann dran, wenn sie selbst Bucher ist; sonst **wartet** mit Text wie Regel 8 und `[{booker} Bescheid geben]` (`stay-book`). |
| 8 (Mitglied wartet) | «{bookers} bucht {title}.» – `{bookers}` = 1 Name, «Sara oder Kemal», «Lena, Sara oder Kemal» (max. 3 = Grenze; EN «Sara or Kemal is booking {title}.»). Bewusst «oder» statt R.9-Beispiel «Lena und Kemal buchen»: Gebucht wird einmal, von einer der Personen; nach Termin-Änderung «Neuer Termin – {bookers} bucht {title} neu.» Taste: 1 Bucher `[Sara Bescheid geben]`, mehrere `[Bescheid geben]` → RemindSheet Schritt `orga` mit Auswahl der Bucher (je Zeile WhatsApp). |
| Kurzform H-2 Regel 8 | «{bookers} bucht {title}» |
| 3, 4, 6, 7, 9 | unverändert (eine „Bucht“-Person ohne Orga-Rolle verhält sich dort wie ein Mitglied). |
| UX-9 «Haben wir schon …» | unverändert nur Orga. |
Anlass `stay-book`: Empfänger = Bucher (Text v2.8 mit `{booker}`). Der Platzhalter `{orga}` in `stays.chosen.waitMember` wird `{bookers}` (W18 E.16).

### A2 „Infos ergänzen“
Jetzt für **Orga und „Bucht“** (v2.4 wie ursprünglich vorgesehen); mehrere Personen können dieselbe Aufgabe sehen – wer zuerst einträgt, erledigt sie für alle. Infos-Kachel leer für „Bucht“: «Infos ergänzen» wie Orga (W22 E).

### Erinnern (RemindSheet, ux-spec §14.2) – Anlass in Inkrement 11
| Anlass | Einstieg | Schritt | Inhalt |
|---|---|---|---|
| `travel-data` | V4 Zeile 3 `[Erinnern]`; W20 H.7 `[Erinnern]` | `status` → `single`/`all` | h2 «Wer fehlt noch?» / «Who's still missing?» · bei mehreren laufenden eigenen Anfragen je Anfrage eine h3 «„{purpose}“» · Gruppe «Offen ({n})» / «Open ({n})» mit WhatsApp je Person · Gruppe «Klärt es direkt ({n})» / «Sorting it out directly ({n})» **ohne** Taste · nur Mitglieder mit Konto · Fußleiste «Alle erinnern ({n})» (nur bei genau einer laufenden Anfrage; sonst je h3 eine Taste «Alle erinnern»). Text `single` DE «Hey {name}, für „{purpose}“ brauche ich noch deine Reisedaten – bitte direkt in der App freigeben, nicht hier im Chat: {link}» · EN «Hey {name}, I still need your travel details for “{purpose}” – please share them in the app, not here in the chat: {link}». `all` DE «Hey ihr, für „{purpose}“ brauche ich noch eure Reisedaten – bitte direkt in der App freigeben, nicht hier im Chat: {link}» · EN «Hey all, I still need your travel details for “{purpose}” – please share them in the app, not here in the chat: {link}». |
`{link}` = `/trips/{id}/travel-data` (nie eine `requestId`, nie Felder oder Werte). Ersetzt den Text in v2.8 und W20 E. **Offene Platzhalter** (R.9 I11-09) stehen im Schritt `status` in einer eigenen Gruppe «Noch nicht dabei ({n})» / «Not joined yet ({n})» mit WhatsApp je Person, Anlass **`travel-data-join`**, `{link}` = **persönlicher Link** des Platzhalters: DE «Hey {name}, magst du bei {trip} beitreten? Für „{purpose}“ brauche ich danach deine Reisedaten – bitte in der App freigeben, nicht im Chat: {link}» · EN «Hey {name}, could you join {trip}? I'll then need your travel details for “{purpose}” – please share them in the app, not in the chat: {link}». Nicht in «Alle erinnern».

### „Wer ist dabei?“, „Mehr zur Reise“, Reisemenü
- **Sheet „Wer ist dabei?“:** Chip «Bucht» / «Booking» je Person (Icon `id-card` + Text); ohne jede Markierung sieht die Orga oben «Noch niemand bucht – markiere, wer Unterkunft und Tickets bucht.» + «Wer bucht? ›»; Mitglieder sehen darunter den Satz «{Namen} bucht/buchen für euch und darf/dürfen Reisedaten anfragen.»; Orga sieht Text-Taste **«Wer bucht? ändern ›»** → Unterschritt „Wer bucht?“ (W20 H.2).
- **Zeile „Wer ist dabei? (6)“** in „Mehr zur Reise“: Statuszeile «{Namen} bucht» bzw. «… buchen» (vor dem bisherigen Status).
- **Reisemenü `⋯`** (nur Orga, nur Phase 3): neuer Punkt **«Wer bucht? …»** (Icon `id-card`) zwischen «Freunde einladen» und «So habt ihr entschieden» → öffnet direkt denselben Unterschritt. Damit ist der in v2.13 ausgesparte Punkt aus Teil B §2.5 gebaut.
- **Ticket-Crew:** keine Chips (zu klein); nichts ändert sich.
- **„Reise verlassen …“ / „Mitglied entfernen …“ / „Festlegung aufheben …“:** Zusatzsätze zu Reisedaten nach W20 H.9/H.11.

### Rollen auf einen Blick (ersetzt die Tabelle in v2.4 für Inkrement 11)
| | Mitglied | „Bucht“ | Orga |
|---|---|---|---|
| sieht | eigenen Stand + neutrale Zahlen | + Werte (maskiert, Anzeigen/Kopieren protokolliert) **nur** zu eigenen Anfragen; Status je Person aller Anfragen | + Gruppenfortschritt, Favorit (Q33), Status je Person aller Anfragen – **nie** Inhalte |
| „du bist dran“ typisch | bewerten, **freigeben**, schulden | + **Unterkunft buchen**, **Reisedaten benutzen** (Zeile 2), A2 | + Bescheid geben, festlegen, buchen (nur als Bucher), A2, abschließen (Kosten) |
| Erinnern | V2 (Orga Bescheid), V3, D1 (eigene Forderung) | + **V4** (`travel-data`) | + V2 (Platzhalter), V3, D1 (alle) |
| „ohne App erledigt“ (UX-9) | – | – | V2, V3, V5 |
| Markierung „Bucht“ vergeben | – | – | ✔ |

### `trip-route.ts` (Vorschlag)
`StationId` + `"V4" | "D3"`; Katalog … V3, **V4**, A2, A1 (Vorbereitung/Unterwegs) bzw. D1, **D3** (Danach); `RouteViewer.booker`; `RouteTrip.bookerNames`; `RouteAreas.travelData?: TravelDataStatus | null`; `TripTile.area` + `"travelData"`; Remind-Anlässe `travel-data`, `travel-data-join`; `RouteTarget.page` + `travelData`, `travelDataRequest` (mit `requestId`), `travelDataNew`. V3-Funktion bekommt `bookerNames`/`viewer.booker` statt fester Orga. Unit-Tests je Zeile der V4-Tabelle × Rolle (Mitglied, „Bucht“, Orga ohne „Bucht“, Orga + „Bucht“, gefragt + „Bucht“), Rang-Reihenfolge mit V1/V3, D3 vor/nach Löschung, Kachel je Zeile inkl. „keine Kachel bei sichtbarer V4“, V3-Regeln 5/8 mit 0/1/2 Buchern, `travelData = null` → keine Spur (auch kein «Bucht» in V3-Texten fehlt nicht – V3 nutzt `bookerNames` unabhängig).

### Abnahme UX (zusätzlich zu W20 H.18)
Max gefragt (V4 dran Rang 1, Primär «Angaben freigeben» → Formular) · Max nach Freigabe (V4 erledigt, «Neu erledigt», Kachel «Freigegeben an Lena ✓ · gelöscht am 26. Juni») · Lena „Bucht“ ohne Anfrage (später-Zeile, Weg-Meta ohne V4) · Lena Anfrage läuft (wartet, Erinnern `travel-data` mit „Klärt es direkt“ ohne Taste) · Lena alle geantwortet (dran Rang 2 → einmal Anzeigen → erledigt + Kachel) · Lena gefragt von Sara **und** eigene Anfrage (Zeile 1 gewinnt) · Orga ohne „Bucht“ bei Saras Anfrage (wartet ohne Erinnern, keine Werte im Netzwerk-Tab) · Unterwegs Tag 3 mit offener Anfrage (nach Terminen) · Danach D3 später → nach Löschjob erledigt · V3 mit Sara als Bucherin (Sara dran «buchen», Lena wartet mit `[Sara Bescheid geben]`, Max «Sara bucht …») · 0 „Bucht“ → V3 wie Inkrement 9 · Reisemenü «Wer bucht? …» nur Orga · Sheet „Wer ist dabei?“ mit Chips · H-2-Kurzformen · `travelData = null` (Produktion vor G1b): keine V4/D3/Kachel, „Bucht“-Chips und V3-Bucher trotzdem da · 200 % · Dark Mode.

---

# Teil B – W16 v1 „Kachel-Cockpit“ (abgelöst am 2026-10-22 durch Teil A)

Stand: 2026-10-20 · Status: **abgelöst** – nur noch die in v2.0 genannten Teile gelten.
Features: **F-053**, F-012 (Kopf/Countdown), F-007 (Platzhalter), F-056 (Chip „bucht“), Einstieg in F-031, F-035/036, F-054, F-055, F-033 · Route `/trips/{id}` (Phase `fixed`)
Klickbarer Prototyp: [`../mockups/reise-managen/index.html`](../mockups/reise-managen/index.html) (Bildschirm W16; Steuerpanel rechts: Rolle Max/Lena, Teilphase, Dunkel, Bewegung)
Bezug: PRD §6b, features.md „AUSBAUSTUFE ‚Reise managen‘“ (R.0–R.5), PM-Empfehlungen Q26–Q36 (hier durchgehend angenommen), Design-System v1.0 (§9.2 Cockpit-Kopf, §9.3 Kennzahl-Box, §9.5 Kacheln, §9.6 Karten), Motion-System §3–§6.

Beispieldaten (auch im Prototyp): Reise **„Kroatien 2027“**, Sa., 12. – Sa., 19. Juni 2027 (7 Nächte), 6 Reisende: Lena (Orga, „bucht“), Max (du), Kemal, Sara, Jonas, Mia (Platzhalter, noch nicht beigetreten). „Heute“ je Teilphase: 2. Mai (Vorbereitung) · 14. Juni (Unterwegs, Tag 3 von 8) · 28. Juni (Danach).

---

## 1. Kernentscheidung: Hub statt Tabs (Phase 3)

Wunsch des Auftraggebers: Nach der Festlegung zeigt die Reise **nur noch die Übersicht – keine Tabs mehr**. Umsetzung als **Hub-and-Spoke**:

- In Phase 3 entfällt die Tab-Leiste (Übersicht · Meine Tage · Gruppe · Abstimmen) vollständig. Der Cockpit-Kopf besteht nur aus Zeile 1 (Zurück · Reisename + Phasenzeile · `⋯`) und der Kennzahl-Box.
- Das Cockpit ist der **einzige Einstieg**. Jeder Bereich ist **genau einen Tipp** entfernt (Kachel) und **genau eine Ebene** tief (Unterseite mit Zurück-Pfeil zum Cockpit). Formulare (Vorschlagen, Ausgabe, Freigabe, Hochladen) sind die einzige zweite Ebene.
- Termin-Historie (Gruppenkalender, Abstimmungsergebnis) bleibt **schreibgeschützt** erreichbar über die Zeile „So habt ihr entschieden“ und das Reisemenü `⋯`.
- **Abweichung von der PM-Empfehlung** (F-053 schlug Tabs «Übersicht · Unterkunft · Kosten · Unterlagen» vor): bewusst verworfen, weil (a) der Auftraggeber ausdrücklich „keine Tabs mehr“ will, (b) fünf Bereiche + Übersicht nicht in eine Tab-Spur auf 360 px passen (Scroll-Tabs verstecken Bereiche), (c) die Kacheln den Status zeigen, den eine Tab-Beschriftung nie zeigen kann („du schuldest 86 €“). → Offene Frage UX-1 unten.

### Routen (Vorschlag für den Developer)
| Ansicht | Route | Wireframe |
|---|---|---|
| Cockpit | `/trips/{id}` | W16 |
| Unterkünfte (Liste + Rangliste) | `/trips/{id}/stays` | W18 |
| Swipen | `/trips/{id}/stays/swipe` | W18 |
| Unterkunft vorschlagen | `/trips/{id}/stays/new` | W17 |
| Kosten – Ausgaben / Salden | `/trips/{id}/costs`, `/trips/{id}/costs/balances` | W19 |
| Ausgabe hinzufügen / bearbeiten | `/trips/{id}/costs/new`, `/costs/{expenseId}/edit` | W19 |
| Reisedaten | `/trips/{id}/travel-data` | W20 |
| Freigabe-Formular / neue Anfrage | `/trips/{id}/travel-data/{requestId}`, `/travel-data/new` | W20 |
| Unterlagen / hochladen | `/trips/{id}/documents`, `/documents/upload` | W21 |
| Infos / bearbeiten | `/trips/{id}/info`, `/info/edit` | W22 |

Alle Unterseiten sind echte URLs (Zurück-Taste des Browsers funktioniert, ux-spec §3). Die alten Tab-Routen (`/days`, `/group`, `/poll`) leiten in Phase 3 auf ihre schreibgeschützte Variante um.

---

## 2. Aufbau mobil (360–599 px), Teilphase „Vorbereitung“, Sicht Max (Mitglied)

```
┌────────────────────────────────────┐
│▓(←)  Kroatien 2027             (⋯)▓│  Zeile 1, sticky · ← = Meine Reisen · ⋯ = Reisemenü
│▓     ● Steht fest · noch 41 Tage  ▓│  Phasenzeile (Sonnen-Punkt = Zusatz)
│▓ ┌──────────────────────────────┐ ▓│  Kennzahl-Box (scrollt mit)
│▓ │ (◔41) Sa., 12. – Sa., 19.    │ ▓│  Mini-Vorfreude-Ring 64 px, aria-hidden
│▓ │  Tage Juni 2027              │ ▓│
│▓ │       7 Nächte · 6 dabei ·   │ ▓│  Countdown steht als TEXT daneben
│▓ │       noch 41 Tage           │ ▓│
│▓ │ [▣ Zum Kalender]             │ ▓│
│▓ └──────────────────────────────┘ ▓│
╰▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╯
┃ Für dich zu tun          (3 offen) │  Karte mit Koralle-Kante links (To-do-Muster W04)
┃ [ID] Lena bittet um deine          │  1. Eintrag = Hauptaktion der Seite
┃      Reisedaten                    │
┃      Für „Flüge München – Split“ · │
┃      nur Lena sieht sie            │
┃ [      Angaben freigeben         ] │  einzige Primär-Taste der Seite
┃ ────────────────────────────────── │
┃ (♥) 3 Unterkünfte bewerten      ›  │  weitere Einträge = Zeilen-Links
┃ (€) Du schuldest Kemal 86,00 €  ›  │
└────────────────────────────────────┘
  Eure Reise                            h2
┌────────────────────────────────────┐
│ (▤) Unterkunft                   › │  Leit-Kachel (volle Breite) der Teilphase
│ 5 Vorschläge · du hast 2 von 5     │
│ bewertet                           │
│ ▓▓▓▓▓▓░░░░░░░░                     │  Balken 6 px, aria-hidden
│ [▨][▨][▨][▨]                       │  Mini-Vorschaubilder, dekorativ
└────────────────────────────────────┘
┌────────────────┐ ┌────────────────┐
│ (ID)         › │ │ (🎫)         › │  Kachel-Raster 2 Spalten
│ Reisedaten     │ │ Unterlagen     │
│ Lena bucht –   │ │ 5 Unterlagen · │
│ deine Daten    │ │ 1 neu          │
│ fehlen noch    │ │                │
└────────────────┘ └────────────────┘
┌────────────────┐ ┌────────────────┐
│ (€)          › │ │ (i)          › │
│ Kosten         │ │ Infos          │
│ Gesamt 456 € · │ │ Check-in 15 Uhr│
│ du schuldest   │ │ · Treffpunkt   │
│ 86,00 €        │ │                │
└────────────────┘ └────────────────┘
  Mehr zur Reise                        h2
┌────────────────────────────────────┐
│ (✓) So habt ihr entschieden      › │  Sheet: Ergebnis + Link Gruppenkalender (nur lesen)
│     Gruppenkalender & Abstimmung   │
│ (⚇) Wer ist dabei? (6) (LE)(MA)… › │  Sheet: Mitglieder mit Chips Orga · bucht · Platzhalter
│     Lena bucht · 1 Platzhalter     │
└────────────────────────────────────┘
```

### 2.1 Kopf
- Zeile 1 wie Cockpit-Kopf (design-system §9.2) **ohne Tab-Spur**; sticky ≈ 60 px (statt 104 px – mehr Platz für Inhalt).
- **Kennzahl-Box Phase 3** (ersetzt den großen Vorfreude-Ring nach der einmaligen Feier aus W11): Mini-Ring 64 px (Füllgrad = vergangene Vorfreude-Zeit, min. 4 %, `aria-hidden`), daneben Datum (Jakarta 17/800) und Meta-Zeile «7 Nächte · 6 dabei · noch 41 Tage». Zahl **zählt nicht hoch**. Aktion: `[Zum Kalender]` (ICS wie W11).
- Die **Feier „Es geht los!“ (W11)** bleibt unverändert der erste Besuch nach der Festlegung; danach zeigt die Übersicht dauerhaft dieses Cockpit. Die Ergebnis-Karte von W11 entfällt im Cockpit (ihr Inhalt steckt in der Kennzahl-Box).

### 2.2 „Für dich zu tun“
- Nur **persönliche** Aufgaben, max. **3**, sortiert nach Dringlichkeit: (1) Reisedaten-Anfrage offen, (2) Unterkünfte unbewertet, (3) eigene Schuld (Vorbereitung erst ab 50 €, unterwegs/danach immer), (4) Orga/„bucht“: Unterkunft festlegen bzw. als gebucht markieren, offene Reisedaten-Anfrage, Abrechnung abschließen.
- Der **erste** Eintrag ist ausführlich mit Primär-Taste (Verb + Objekt: «Angaben freigeben», «Jetzt swipen», «Zum Ausgleich»); alle weiteren sind Zeilen-Links (≥ 56 px).
- Leer: Karte zeigt «Alles erledigt – Vorfreude!» + «Wir melden uns hier, wenn es etwas Neues gibt.» (keine leere Karte, kein Verschwinden – die Stelle bleibt verlässlich).
- Zähler-Chip «3 offen» (Text, nicht nur Farbe).

### 2.3 Kacheln „Eure Reise“
- Reihenfolge je Teilphase fest (Tabelle §3). Pro Teilphase ist die **Leit-Kachel** volle Breite mit Zusatzgrafik (Fortschrittsbalken/Vorschaubilder bzw. großer Saldo), alle anderen Kacheln im 2-Spalten-Raster.
- Jede Kachel ist **ein Link** (ganze Fläche ≥ 140 px hoch) mit Icon-Kachel, Titel (Jakarta 16/800), **genau einer** Statuszeile (14/500, wichtigster Teil fett) und Chevron. Zugänglicher Name = Titel + Status (z. B. «Kosten. Gesamt 456,00 €, du schuldest 86,00 €»).
- Bereiche, die noch nicht gebaut sind, erscheinen nicht (Inkrement-weise Einführung, F-053).
- Raster: `repeat(auto-fit, minmax(min(100%, 9.5em), 1fr))` → bei 200 % Text automatisch einspaltig.

### 2.4 „Mehr zur Reise“
- «So habt ihr entschieden» → Bottom-Sheet: Ergebnis (Datum, festgelegt von, Platz 1/2 mit Stimmen) + Hinweis auf Gruppenkalender/Abstimmung im Modus „nur lesen“.
- «Wer ist dabei? (6)» → Sheet mit allen Personen, Chips «Orga» (Krone + Text), «bucht», «Platzhalter · noch nicht dabei».

### 2.5 Reisemenü `⋯` (Phase 3)
Freunde einladen · *(Orga)* **Wer bucht?** (F-056, Sheet mit Schaltern, max. 3, Platzhalter deaktiviert mit Grund) · So habt ihr entschieden · *(Orga)* Reise bearbeiten · *(Orga)* Festlegung aufheben … · Hilfe · Reise verlassen … (destruktiv leise; Warnung bei offenem Saldo und eigenen Unterlagen, s. W19/W21).

---

## 3. Teilphasen (F-053) – was sich ändert

| | Vorbereitung (bis Tag vor Anreise) | Unterwegs (Anreise bis Abreise) | Danach (ab Tag nach Abreise) |
|---|---|---|---|
| Phasenzeile | «Steht fest · noch 41 Tage» (Punkt Sonne) | «Unterwegs · Tag 3 von 8» (Punkt Minze) | «Zurück · Kosten ausgleichen» bzw. «Zurück · alles ausgeglichen» (Punkt Tinte 3) |
| Kennzahl-Box | Mini-Vorfreude-Ring + Datum + «noch 41 Tage» · `[Zum Kalender]` | Tages-Ring «3 von 8» + «Heute: Mo., 14. Juni» + nächster Termin aus Unterlagen («Fähre nach Stari Grad · 9:30 Uhr») · `[+ Ausgabe]` (Minze-Taste) `[Tickets]` | Voller Ring + «Schön war's!» + Zeitraum · `[Ausgleichen]` nur bei offenen Salden |
| Leit-Kachel | **Unterkunft** | **Kosten** (großer Saldo «Du bekommst 42,00 €») | **Kosten** («Noch 3 Ausgleiche offen · du schuldest …») |
| Raster | Reisedaten · Unterlagen · Kosten · Infos | Unterlagen («Nächste: Fähre … · Mo., 14. Juni») · Infos · Unterkunft · Reisedaten (nur „bucht“) | Unterlagen («Werden am 19. Juli gelöscht – jetzt sichern») · Unterkunft · Reisedaten («Gelöscht am 26. Juni») · Infos |
| To-dos typisch | Reisedaten freigeben, swipen, Schulden ab 50 € | Schulden, offene Reisedaten | Ausgleichen, «Du bekommst noch …», Orga: Abrechnung abschließen |

Teilphase wird in der **Zeitzone der Reise** bestimmt (F-053); Wechsel passiert beim Neuladen (kein Live-Update).

### Sicht Orga + „bucht“ (Lena), Vorbereitung
- To-dos: «Reisedaten: 2 von 4 freigegeben» (noch offen: Max, Jonas) · «Unterkunft festlegen – Favorit: Kamena Kuća (4 ♥)» bzw. «Villa Mare buchen» nach der Festlegung.
- Kachel Reisedaten: «**2 von 4** haben freigegeben» (Platzhalter zählen nicht, weil sie nicht gefragt werden können; sie stehen im Bereich als «noch nicht dabei»).
- Orga sieht in der Unterkunft-Kachel immer den Favoriten (Q33: Orga sieht alles).
- **Kein Sonderzugriff:** Orga ohne Markierung „bucht“ sieht bei Reisedaten nur Zahlen/Status.

---

## 4. Zustände & Sonderfälle

| Fall | Verhalten |
|---|---|
| Erster Besuch nach Festlegung | Feier W11 (einmal je Person), danach dieses Cockpit; Kacheln erscheinen mit Staffel (`stagger-card` 60 ms, max. 400 ms, **nur beim ersten Aufbau je Sitzung**, motion-system §5.8). |
| Festlegung aufgehoben | Kopf zurück in Phase 2 (Tabs kommen zurück); Bereiche bleiben erhalten, Banner im jeweiligen Bereich «Termin wird neu abgestimmt – Unterkünfte, Ausgaben, Reisedaten und Unterlagen bleiben erhalten.» (F-053 R.0.1). |
| Bereich leer | Kachel nennt den nächsten Schritt statt „0“: «Noch keine Ausgaben», Orga: «Infos ergänzen». |
| Platzhalter | Zählen in Fortschritten mit, wo sie teilnehmen können (Kosten, Unterkunft p. P.); bei Reisedaten als «noch nicht dabei». |
| Offline | Offline-Banner unter dem Kopf (ux-spec §6); Kacheln zeigen letzten Stand, Aktionen, die den Server brauchen, mit Hinweis deaktiviert. |
| Laden | Skelett: Kennzahl-Box + To-do-Karte + 5 Kachel-Umrisse, ab 300 ms. |
| Große Schrift 200 % | Kacheln einspaltig, Kennzahl-Box Ring über dem Text, Phasenzeile bricht um. |

---

## 5. Interaktion & Barrierefreiheit
- Überschriften: h1 = Reisename (Kopf), h2 «Für dich zu tun», «Eure Reise», «Mehr zur Reise». Kacheltitel sind Teil des Link-Namens, keine Überschriften (sonst 6 h3 nur für Links).
- Ring/Balken/Vorschaubilder `aria-hidden`; alle Werte stehen als Text.
- Fokusreihenfolge = visuelle Reihenfolge; Fokus nach Rückkehr aus einem Bereich: auf der Kachel, über die man gekommen ist (Scrollposition wiederherstellen, ux-spec §3).
- Tippflächen: Kacheln ≥ 140 × 160 px, Zeilen ≥ 56 px, Kopftasten 44 px. Fokusring auf Indigo weiß mit Indigo-Hof (D-22).
- Farbe nie allein: Saldo immer mit Wort («du bekommst» / «du schuldest» / «ausgeglichen ✓»), To-do mit Zähler-Text, Teilphase mit Text.
- `<title>`: «Übersicht · Kroatien 2027 · Wir wollen weg».

## 6. Desktop (≥ 960 px)
Inhalt max. 1040 px: links (≈ 600 px) Kennzahl-Box-Karte + „Für dich zu tun“ + Leit-Kachel, rechts (≈ 400 px) Kachel-Raster einspaltig + „Mehr zur Reise“. Unterseiten öffnen als normale Seiten (kein Seitenpanel), Inhalt `content-narrow` 640 px zentriert.

## 7. Motion (Briefing an Motion Designer)
Kachel-Eintritt (Staffel, einmal je Sitzung) · Seitenwechsel Cockpit ↔ Bereich: horizontal `distance-lg` + Fade (`base`), zurück in Gegenrichtung · Ring wächst per `stroke-dashoffset` (`moderate`) · To-do erledigt: Zeile blendet aus, nächste rückt nach (FLIP `slow`) · reduziert: nur Überblenden 140 ms.

---

## 8. Offene UX-Fragen & Empfehlungen (an CEO / Auftraggeber)

| Nr. | Frage | Empfehlung UX |
|---|---|---|
| **UX-1** | Hub ohne Tabs (dieser Entwurf) statt der von der PM vorgeschlagenen Phase-3-Tabs? | **Hub ohne Tabs** – entspricht dem Auftraggeber-Wunsch, skaliert auf 5+ Bereiche, Status sichtbar. Unterwegs schneller Zugriff über die zwei Tasten in der Kennzahl-Box (`+ Ausgabe`, `Tickets`). |
| **UX-2** | Reisedaten als **eigener Bereich** (dieser Entwurf) oder als Abschnitt in „Unterlagen“ (PM-Vorschlag F-053/F-055)? | **Eigener Bereich** – der Auftraggeber nennt ihn ausdrücklich, er hat eigene Regeln (Einwilligung, Löschung nach 7 statt 30 Tagen), und „Unterlagen“ wäre sonst überladen. |
| UX-3 | Schulden-To-do in der Vorbereitung erst ab 50 € (sonst „nervt“ jede Fähren-Anzahlung)? | Ja, Schwelle 50 € nur in *Vorbereitung*; unterwegs/danach immer. Schwelle im Produkt fest, nicht einstellbar. |
| UX-4 | Sieht die Orga Titel von Unterlagen, die nur für andere freigegeben sind (für Moderation/Löschen)? | Nein im Stufe-1-Schnitt (Need-to-know). Orga sieht nur «+1 Unterlage nur für andere» ohne Titel und kann sie über diesen Eintrag löschen. → im Prototyp noch nicht abgebildet. |
| UX-5 | Kennzahl-Box „Unterwegs“ zeigt den nächsten Termin aus den Unterlagen (Datum + Uhrzeit). Braucht es dafür ein Uhrzeit-Feld beim Hochladen? | Ja, optional „Uhrzeit“ neben „Datum“ (W21); ohne Uhrzeit nur der Titel. |
| UX-6 | Desktop: Cockpit zweispaltig (oben) oder einspaltig wie mobil? | Zweispaltig ab 960 px; Designer bestätigt Optik. |
| UX-7 | Tab-Routen der Phasen 1/2 in Phase 3: weiterleiten (Vorschlag) oder 404? | Weiterleiten auf schreibgeschützte Ansicht (alte geteilte Links bleiben gültig). |

Zur Abstimmung an den Designer (über `docs/ux/abstimmung-design.md`, nach Freigabe): Kennzahl-Box Phase 3 mit 64-px-Ring statt 52 px; Leit-Kachel volle Breite mit Mini-Vorschaubildern; Kachel-Mindesthöhe 140 px; Koralle-Kante für „Für dich zu tun“ (Wiederverwendung `todo-*`).
