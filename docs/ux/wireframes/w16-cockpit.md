# W16 – Reise-Cockpit (Übersicht nach der Festlegung, Phase 3)

Stand: 2026-10-22 · Verantwortlich: UI/UX
- **Teil A – W16 v2 „Reiseverlauf“ (gültig, ab 2026-10-22):** Auswahl des Auftraggebers aus den Cockpit-Varianten (Variante C, [`../../design/mockups/cockpit-varianten/index.html`](../../design/mockups/cockpit-varianten/index.html)), kombiniert mit der Designer-Empfehlung (Ticket-Kopf aus A, Bereiche ohne Ende als Kacheln unter dem Weg). Status: **UX-Konzept, Optik/Motion in Abstimmung** (`../abstimmung-design.md` §12), Umsetzung nach Freigabe Q26/Q27.
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
| 3 | **Weg** (h2 «Euer Weg nach {Ziel/Reisename}»): Erledigt (eingeklappt) → **HEUTE** (du bist dran) → Läuft (wartet auf andere) → Als Nächstes → Später → **Ziel** | Beantwortet in Leserichtung: Was ist geschafft? Was mache ich jetzt? Worauf warten wir? Was kommt? | Kern der Variante C. „Heute“ ersetzt die Nächster-Schritt-/To-do-Karte (v2.5), es gibt also **eine** Stelle für „was tun“. |
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
  Euer Weg nach Kroatien    1 von 5 ✓   h2 + Meta (erledigte Stationen / alle ohne Ziel)
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
- **Abschnitt unter der Abriss-Kante:** links Crew (3 Avatare + «+3», daneben «6 dabei · 7 Nächte») als **Button** → Sheet „Wer ist dabei?“; rechts Taste je Teilphase (v2.7): Vorbereitung `[Kalender]`, Unterwegs `[+ Ausgabe]` (Minze, primär im Kopf) + `[Tickets]`, Danach `[Ausgleichen]` (nur bei offenen Salden).
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

**Mit wenig Bereichen (Inkrement 8, nur Cockpit + Infos)** besteht der Weg aus V1 ✓ · V2 · Heute · Ziel. Das ist kurz, aber ehrlich – und wächst mit jedem Inkrement um eine Station.

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
- Weg: «(✓) Vorbereitung · {n} erledigt ▾» (alle V-Stationen eingeklappt; nicht erledigte heißen darin «nicht genutzt», ohne Häkchen) → **HEUTE · Tag 3 · Mo., 14. Juni**: zuerst die **Termine des Tages** (datierte Unterlagen, nach Uhrzeit, kompakte Karten «9:30 · Fähre nach Stari Grad ›»), dann Aufgaben (A1, offene V-Aufgaben, z. B. Reisedaten noch offen) → **kommende Tage** mit Terminen als Stationen («MORGEN · Di., 15. Juni», danach Wochentag + Datum), max. 2 Tage + «+ {n} weitere Termine ›» (→ Unterlagen) → Ziel **Heimreise · Sa., 19. Juni** (Rückreise-Unterlage, falls vorhanden).
- Ohne Termine: Heute-Satz «Heute steht nichts an – genießt den Tag!»; der Weg ist dann Vorbereitung ✓ · Heute · Heimreise.
- Kacheln: Unterlagen · Kosten («du bekommst 42,00 €») · Infos · Unterkunft («Kamena Kuća · Adresse») · Reisedaten (nur „bucht“, solange Daten da sind).

### Teilphase Danach
- Phasenzeile «Zurück · Kosten ausgleichen» bzw. «Zurück · alles ausgeglichen»; Ring voll, im Ring «Schön war's!» (statt Zahl), kein Konfetti auf Antippen mehr nötig – bleibt aber erlaubt.
- Weg: «(✓) Reise · Vorbereitung und 8 Tage ▾» → **HEUTE · zurück seit 9 Tagen** → D1, D2, D3 nach Regeln unten → Ziel «Wohin geht's als Nächstes?» `[Neue Reise planen]` (sekundär) + 13 px «Diese Reise wird am 17. Sep. 2027 automatisch gelöscht.»

| D1 Kosten ausgleichen | Mitglied | Orga |
|---|---|---|
| ich schulde | **dran** «Du schuldest Kemal 23,50 €» `[Zum Ausgleich]` | **dran** |
| ich bekomme | wartet «Du bekommst noch 42,00 € von Sara» `[Sara erinnern]` | wartet, dto. |
| ich ausgeglichen, andere offen | wartet «Noch 2 Ausgleiche offen» (kein Erinnern – Geld zwischen anderen geht mich nichts an) | wartet «Noch 2 Ausgleiche offen» `[Erinnern]` |
| alle 0, nicht abgeschlossen | erledigt «Alles ausgeglichen ✓» | **dran** «Alles ausgeglichen – Abrechnung abschließen?» `[Abschließen]` (sekundär, keine Pflicht) |
| abgeschlossen | erledigt | erledigt |

D2 Unterlagen sichern: später «Werden am 19. Juli gelöscht»; ab 7 Tage vorher als Nächstes «Werden am 19. Juli gelöscht – jetzt herunterladen.»; nie „dran“ (kein Druck); danach erledigt «Gelöscht am 19. Juli». D3 Reisedaten: später «Werden am 26. Juni gelöscht», danach erledigt «Am 26. Juni gelöscht – wie angekündigt.» (Vertrauen schaffen).

Kacheln Danach: Unterkunft · Infos · Kosten (nach D1 erledigt: «ausgeglichen ✓») · Unterlagen (bis zur Löschung).

### Rollen auf einen Blick
| | Mitglied | „bucht“ | Orga |
|---|---|---|---|
| sieht | eigenen Stand + neutrale Zahlen (F-053) | + Status aller zu „seinen“ Anfragen, Namen der Offenen | + Gruppenfortschritt aller Stationen, Favorit der Unterkunft immer (Q33) |
| „du bist dran“ typisch | bewerten, freigeben, schulden | + buchen, Anfrage abschließen, Tickets hochladen (nur als Nächstes) | + Bescheid geben, festlegen, buchen (wenn Bucher), abschließen |
| Erinnern | V2 (Orga Bescheid geben), V3, D1 (eigene Forderung) | + V4 | + V2 (Platzhalter), V3, D1 (alle) |
| „ohne App erledigt“ (UX-9) | – | – | V2, V3, V5 |

## v2.5 „Heute“ – wo der Nächste Schritt aufgeht

- **Es gibt keine eigene Karte „Nächster Schritt“ oder „Für dich zu tun“ mehr.** Der Heute-Marker ist die Antwort: Er steht immer genau einmal im Weg, mit Datum, einem **Heute-Satz** (Wo stehen wir / wer ist dran) und darunter den Stationen und Aufgaben im Zustand **du bist dran**. Die erste davon ist ausgeklappt und trägt die **einzige Primär-Taste der Seite** (ux-spec §1.1, §14.1 Grundregel 3). Damit ist der Nächste Schritt identisch mit der ersten Station unter „Heute“ – nichts doppelt.
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
| H-5 | Danach, alles erledigt | Alles ausgeglichen – schön war's! | All settled – what a trip! |

  Kurzformen für H-2: «Mia tritt bei», «Lena legt die Unterkunft fest», «Lena bucht Kamena Kuća», «Freigaben für Lena», «Sara gleicht aus».
- ux-spec §14.1 („Phase 3: keine Nächster-Schritt-Karte“) bleibt richtig – die Matrix N1/N2 endet mit Phase 2, Phase 3 nutzt H-1 bis H-5.

## v2.6 Kacheln „Immer griffbereit“

- Inhalt: Bereiche **ohne Ende** in der aktuellen Teilphase + Bereiche, deren Station **erledigt** ist. Feste Reihenfolge: Unterkunft · Unterlagen · Kosten · Infos · Reisedaten. Ein Bereich mit offener Station hat **keine** Kachel.
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
| Station wurde seit dem letzten Besuch erledigt | Erledigt-Zeile zeigt einmalig «(✓) Neu erledigt: Unterkunft gebucht · 2 erledigt ▾» (Vergleich mit zuletzt gesehenem Stand, `sessionStorage`/`localStorage` je Reise); Siegel-Plopp am Häkchen (Motion). Kein automatisches Aufklappen. |
| Bereich noch nie genutzt | Station im Zustand als Nächstes/später mit Einladung (V3 «schlag die erste vor»); **keine** Aufgabe, **kein** Erinnern. |
| Gruppe erledigt etwas außerhalb der App | Orga: «ohne App erledigt» je Station (V2 «Mia macht ohne App mit», V3 «Haben wir schon / brauchen wir nicht», V5 «Jede:r reist selbst an»), rückgängig in der Erledigt-Gruppe. **Frage UX-9.** Ohne diese Funktion: die Station bleibt als Nächstes/später und wird an der Teilphasen-Grenze zu «nicht genutzt». |
| Platzhalter | V2 wartet; zählen bei Kosten mit, nicht beim Bewerten/Reisedaten (s. V2). |
| Reise vorbei, alles erledigt | Weg = Erledigt-Zeile · Heute (H-5) · Ziel «Wohin geht's als Nächstes?». |
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
- **Unterwegs-Kopf:** `[+ Ausgabe]` öffnet `/costs/new` (Datum = heute), `[Tickets]` → `/documents?date=today`.

## v2.9 Barrierefreiheit & Responsive

- **Überschriften:** h1 Reisename · h2 «Euer Weg nach Kroatien» · h3 «Heute, Sonntag, 2. Mai» (Heute-Marker – per Überschriften-Navigation direkt anspringbar) · h2 «Immer griffbereit» · h2 «Mehr zur Reise». Gruppen-Labels „Läuft“, „Als Nächstes“, „Später“, „Ziel“ sind **keine** Überschriften, sondern stehen als erstes Wort in jedem Eintrag.
- **Struktur:** Der Weg ist eine `<ol>` (Reihenfolge trägt Bedeutung); jede Station ein `<li>`. Zustand steht als **Text** im Eintrag (sichtbares Label), nie nur als Marker/Farbe/Linie (alle `aria-hidden`).
- **Screenreader-Reihenfolge = visuelle Reihenfolge.** Beispiel: «Kroatien 2027, Überschrift 1 · Steht fest, noch 41 Tage · Sa., 12. bis Sa., 19. Juni 2027 · Schaltfläche 6 dabei, 7 Nächte · Schaltfläche Zum Kalender · Euer Weg nach Kroatien, Überschrift 2 · Liste 6 Einträge · Schaltfläche 1 erledigt anzeigen, reduziert · Heute, Sonntag, 2. Mai, Überschrift 3 · Du bist dran – 3 Sachen für dich · Du bist dran: Reisedaten für Lena, Link · Angaben freigeben, Schaltfläche · Du bist dran: Unterkunft, du hast 2 von 5 bewertet, Link · …».
- **Zugängliche Namen:** Station-Link = «{Zustand}: {Titel}. {Status}» (z. B. «Wartet auf andere: Alle sind dabei. Mia ist noch nicht beigetreten.»). Erinnern-Taste mit Objekt: «Lena Bescheid geben, dass Mia fehlt».
- **Ring:** `aria-hidden`; Countdown als Text (Phasenzeile + `sr-only`-Satz). Konfetti-Button hat Namen, löst keine Ansage aus.
- **Tippflächen:** Stationskarten ≥ 64 px, schmale Zeilen 48 px, Kacheln ≥ 88 px, Erinnern 44 px, Kopf-Tasten 44 px. Fokus-Stile wie D-22 (auf Indigo isoliert).
- **Farbe nie allein:** Zustand als Wort, Saldo mit Wort, Fortschritt als Zahl.
- **200 % Schrift / schmale Container:** Ist der Weg-Container < **22 em** breit (360 px bei ~160 % oder 200 %), entfallen Linie und linke Marker-Spalte; das Zustands-Label steht als Chip über jeder Karte (volle Breite, kein 46-px-Einzug). Ring schrumpft auf 120 px, Crew und Kopf-Taste brechen untereinander. Kacheln einspaltig. Nichts wird abgeschnitten, kein horizontales Scrollen (1.4.10).
- **320 px:** wie 200 %-Regel (Container < 22 em) – Linie aus.
- **600–959 px:** Inhalt max. 640 px zentriert; Kacheln 3 Spalten; Linie + Marker bleiben.
- **≥ 960 px:** Ticket-Kopf als breites Band (Ring links 168 px, Zeitraum/Crew/Tasten rechts, Höhe ≤ 240 px); darunter zwei Spalten: links der Weg (≈ 600 px), rechts „Immer griffbereit“ (einspaltig) + „Mehr zur Reise“. DOM-Reihenfolge: Weg vor Seitenspalte.
- `<title>`: «Übersicht · Kroatien 2027 · Wir wollen weg».

## v2.10 Übergabe an Entwicklung (Vertrag)

- **Reine Funktion** `tripRoute(trip, viewer, areas, today) → { subphase, heute: { date, sentenceKey, params, items: TripStation[] }, groups: { done, waiting, next, later }, goal, tiles: TripTile[] }` in `src/lib/trip-route.ts` – mit Unit-Tests **je Zeile** der Tabellen v2.4 und je Heute-Satz H-1–H-5 (analog `nextStep()`).
- `TripStation { id: 'V1'|'V2'|…; state: 'done'|'yours'|'waiting'|'next'|'later'; title; status; href; primary?: {label, href}; remind?: {occasion, step}; textAction?: {label, action}; date?; isNew? }` · `TripTile { area; title; status; href; chip? }`.
- Jeder Bereich liefert seinen Status über einen Adapter (`stayStatus()`, `travelDataStatus()`, …); nicht gebaute Bereiche liefern `null` → Station/Kachel entfällt. Damit ist v2 **schon mit Inkrement 8** (Cockpit + Infos) baubar: V1, V2, Heute, V6, Kachel Infos.
- Ersetzt in `src/app/(app)/trips/[id]/page.tsx` (Phase `fixed`): Ergebnis-Karte, Andock-Slot `TripModule`, Phasen-Leiste. „So habt ihr entschieden“ und „Wer ist dabei?“ werden zu Zeilen mit Sheet.
- **Abnahme UX:** 360 × 640, 360 × 740, 390 × 844, 200 % Text, Dark Mode; Fälle: Max Vorbereitung (Wireframe), Lena Vorbereitung (Orga + bucht), alles erledigt (H-3), Unterwegs mit/ohne Termine, Danach mit Schuld/Forderung/ausgeglichen; VoiceOver/TalkBack-Durchlauf der Reihenfolge v2.9.

## v2.11 Offene Fragen (an CEO / Auftraggeber) – Ergänzung zu UX-1 bis UX-7 (Teil B §8)

| Nr. | Frage | Empfehlung UX |
|---|---|---|
| **UX-8** | **Kleine Feier am Abreisetag?** Am ersten Tag von *Unterwegs* zeigt die Übersicht einmal je Person eine kleine Konfetti-Runde und den Heute-Satz «Heute geht's los – gute Reise!». | **Ja** – zweiter, kleiner Moment ohne Ehrenrunde (die große Feier bleibt die Festlegung). Macht Spaß, kostet wenig, abschaltbar über „Bewegung reduzieren“. |
| **UX-9** | **Darf die Orga eine Station „ohne App erledigt“ abhaken?** (V2 «Mia macht ohne App mit», V3 «Unterkunft haben wir schon / brauchen wir nicht», V5 «Jede:r reist selbst an») | **Ja** – sonst zeigt der Weg Wochen lang offene Schritte, die die Gruppe längst außerhalb der App erledigt hat, und verliert an Glaubwürdigkeit. Nur Orga, rückgängig machbar, für alle sichtbar «ohne App erledigt». Kleiner Zusatzaufwand (ein Merker je Station und Reise). |

Optik- und Motion-Punkte: [`../abstimmung-design.md` §12](../abstimmung-design.md) (D-36–D-45, UM-1–UM-7).

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
