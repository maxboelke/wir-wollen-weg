# W22 – Infos zur Reise (Anzeige & Bearbeiten)

Stand: 2026-10-23 · UI/UX · Status: **baureif für Inkrement 8** (Präzisierungen und Inkrement-8-Schnitt: Abschnitt C – gilt vor A/B) · **Inkrement 9: Abschnitt D** (Übernahme aus der Unterkunft) · Feature **F-033** (Text & Links, ohne Dateien) · Routen `/trips/{id}/info`, `/info/edit`
Prototyp: [`#/info`](../mockups/reise-managen/index.html) (als Lena: „Bearbeiten“; nach „Das wird's“ in W18 „Adresse übernehmen“).

## Rechte
Anzeigen: alle Mitglieder. Bearbeiten: **Orga und „bucht“** (R.1) – **in Inkrement 8 nur Orga** (s. C). Unten immer «Zuletzt geändert von Lena, 30. April».

## A. Anzeige
```
┌────────────────────────────────────┐
│▓(←) Kroatien 2027      [✎ Bearbeiten]▓│  Taste nur für Orga/„bucht“
│▓    Infos                         ▓│
╰▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╯
│ ┌ Unterkunft ────────────────────┐ │  h2 je Karte
│ │(▤) Kamena Kuća – Steinhaus     │ │
│ │    Put Zlatnog rata 8,         │ │
│ │    21420 Bol, Kroatien         │ │
│ │    [⌖ In Karten öffnen ↗]      │ │  normaler Link, KEINE eingebettete Karte
│ │(◷) Check-in                    │ │
│ │    Sa., 12. Juni · ab 15:00 Uhr│ │
│ │(◷) Check-out                   │ │
│ │    Sa., 19. Juni · bis 10:00 Uhr│ │
│ │(☏) Notfallkontakt der Unterkunft│ │
│ │    Gastgeberin Ana · +385 …    │ │  tel:-Link
│ └────────────────────────────────┘ │
│ ┌ Treffpunkt & Anreise ──────────┐ │
│ │(✈) Flughafen München, T1 –     │ │
│ │    Treffen 5:45 Uhr …          │ │
│ └────────────────────────────────┘ │
│ ┌ Gut zu wissen ─────────────────┐ │
│ │ Fähre ab Split um 9:30 Uhr –   │ │  Freitext, Zeilenumbrüche erhalten,
│ │ Tickets liegen unter „Unter-   │ │  Links automatisch erkannt (https),
│ │ lagen“.                        │ │  öffnen in neuem Tab
│ │ Unsere Playlist: https://…     │ │
│ └────────────────────────────────┘ │
│ Zuletzt geändert von Lena, 30. April│
└────────────────────────────────────┘
```
- Adresse fehlt: «Adresse folgt, sobald die Unterkunft gebucht ist.»
- **Leer** (noch nichts eingetragen): Mitglied «Noch keine Infos – Lena trägt hier Adresse, Check-in und Treffpunkt ein.»; Orga/„bucht“ zusätzlich Primär `[Infos ergänzen]`. Cockpit-Kachel für Orga: «Infos ergänzen».
- Leere Felder werden **nicht** angezeigt (keine „–“-Zeilen).

## B. Bearbeiten
```
│▓    Infos bearbeiten              ▓│
│ [▤ Aus „Kamena Kuća“ übernehmen]   │  nur wenn Unterkunft festgelegt und Adresse leer (ab Inkr. 9)
│ Name der Unterkunft  [            ] │  neu (s. C)
│ Adresse der Unterkunft             │
│ [                                ] │
│ Wird als Link „In Karten öffnen“   │
│ gezeigt – ohne eingebettete Karte. │
│ Check-in            [            ] │
│ Check-out           [            ] │  Stufe 1: Freitext; Stufe 2: Datum + Uhrzeit
│ Treffpunkt & Anreise[            ] │
│ Notfallkontakt der Unterkunft      │
│ [                                ] │
│ Nur Kontakte der Unterkunft – keine│
│ privaten Nummern.                  │
│ Gut zu wissen                      │
│ [                                ] │  ≤ 2 000 Zeichen, Zähler ab 1 800
│ Keine Ausweis- oder Buchungsnummern│
│ hier eintragen – dafür gibt es     │
│ Reisedaten und Unterlagen. Links   │
│ werden automatisch erkannt.        │
├────────────────────────────────────┤
│ [            Speichern           ] │
└────────────────────────────────────┘
```
- Expliziter Speichern-Knopf (Formular mit mehreren Feldern) → ungespeicherte Änderungen beim Zurück: Dialog «Änderungen verwerfen?» (ux-spec §3).
- Nach dem Speichern: zurück zur Anzeige, Snackbar «Infos gespeichert – alle sehen sie jetzt.»
- Gleichzeitiges Bearbeiten (zwei „bucht“): letzte Speicherung gewinnt, vorher Konflikt-Hinweis «Lena hat die Infos inzwischen geändert. [Neu laden]» (ux-spec §6 Konflikt).
- Kein HTML, kein Markdown; Links nur `https://`, angezeigt mit `rel="noopener noreferrer"`.

## Barrierefreiheit
Je Karte h2; Paare Label/Wert als `<dl>`; Kartenlink mit sr-only «(öffnet neuen Tab)»; Telefonnummer als `tel:`-Link; Freitext `white-space: pre-line`, `overflow-wrap: anywhere`.

## Desktop
Zwei Spalten ab 960 px (Unterkunft | Treffpunkt + Gut zu wissen), Bearbeiten einspaltig 640 px.

## C. Inkrement-8-Schnitt und Präzisierungen (2026-10-22, gilt vor A/B)

**Was es in Inkrement 8 nicht gibt:** «Aus „{Unterkunft}“ übernehmen» (braucht F-031, Inkr. 9), Bearbeiten durch „bucht“ (F-056, Inkr. 11), Verweise auf Unterlagen/Reisedaten in Texten. Rechteprüfung über `canEditTripInfo(member)` (Inkr. 8: `role === 'organizer'`; Inkr. 11 ergänzt „bucht“). Der Hinweistext unter „Gut zu wissen“ lautet in Inkr. 8 **«Keine Ausweis- oder Buchungsnummern hier eintragen.»** (der Satzteil „dafür gibt es Reisedaten und Unterlagen“ kommt mit Inkr. 11/12 dazu – keine Teaser, W16 v2.13).

**Erreichbarkeit:** `/info` und `/info/edit` nur in Phase `fixed`; in Phase 1/2 (auch nach „Festlegung aufheben“) Weiterleitung auf `/trips/{id}`, die Daten bleiben gespeichert. Einstiege: Kachel „Infos“, Ziel-Station (V6/T-Ziel), Treffpunkt-Termin am ersten Reisetag, Aufgabe A2 (→ `/info/edit`). Zurück zum Cockpit: Fokus auf die Infos-Kachel bzw. den Einstieg, von dem man kam (ux-spec §3). Mitglied ruft `/info/edit` auf → Weiterleitung auf `/info`, ohne Fehlermeldung.

**Kopf:** Zeile 1 = ← (zum Cockpit) · Reisename (klein) + h1 «Infos» · rechts Taste «Bearbeiten» (Kontur, `edit`-Icon, 44 px) nur für Orga; unter 400 px Container nur Icon mit zugänglichem Namen «Infos bearbeiten». `<title>`: «Infos · Kroatien 2027 · Wir wollen weg». Bearbeiten: h1 «Infos bearbeiten», ← mit Dialog «Änderungen verwerfen?» bei ungespeicherten Änderungen.

**Felder (alle optional, Reihenfolge = Formular = Anzeige):**

| Feld | Eingabe | Grenze / Prüfung | Anzeige |
|---|---|---|---|
| Name der Unterkunft (**neu**) | Text, 1 Zeile | ≤ 80 Zeichen | Titel der Karte „Unterkunft“ (fehlt er, steht dort nur die Adresse) |
| Adresse der Unterkunft | Textfeld, 2–3 Zeilen | ≤ 200 Zeichen | mehrzeilig + Link «In Karten öffnen ↗» = `https://www.google.com/maps/search/?api=1&query={Adresse URL-kodiert}` (öffnet auf dem Handy die Karten-App; normaler Link, nichts eingebettet, nichts vorab geladen), `target=_blank`, `rel="noopener noreferrer"`, sr-only «(öffnet neuen Tab)» |
| Check-in ab | **nur Uhrzeit** (`type=time`) | – | «Sa., 12. Juni · ab 15:00 Uhr» – Datum = **Anreisetag** des festgelegten Termins |
| Check-out bis | **nur Uhrzeit** (`type=time`) | – | «Sa., 19. Juni · bis 10:00 Uhr» – Datum = **Abreisetag** |
| Treffpunkt & Anreise | Textfeld, mehrzeilig | ≤ 300 Zeichen, Links (https) erkannt | Karte „Treffpunkt & Anreise“; **erste Zeile** dient im Cockpit als Ziel-Status und Treffpunkt-Termin (W16 v2.13) |
| Notfallkontakt der Unterkunft – Name | Text | ≤ 60 Zeichen | «Gastgeberin Ana» |
| Notfallkontakt – Telefon | `type=tel`, `autocomplete=off` | ≤ 20 Zeichen, nur `+`, Ziffern, Leerzeichen, `/`, `-`, `()`; Fehler: «Bitte nur die Telefonnummer – Ziffern, Leerzeichen und + sind erlaubt.» | `tel:`-Link (nur `+` und Ziffern), sichtbar wie eingegeben |
| Gut zu wissen | Textfeld | ≤ 2 000 Zeichen, Zähler ab 1 800, Links (https) erkannt | `white-space: pre-line` |

- **Check-in/-out als Uhrzeit statt Freitext oder Datum + Uhrzeit:** Das Datum ergibt sich aus der Festlegung und wandert bei einer neuen Festlegung automatisch mit; abweichende Daten (z. B. Anreise am Vorabend) gehören in „Gut zu wissen“. Weicht damit leicht von F-033 („Datum/Uhrzeit“) ab – Information an PM über den CEO, keine Rückfrage nötig.
- **Validierung** beim Verlassen des Felds und beim Speichern (ux-spec §5); Grenzen zusätzlich serverseitig. Leere Felder werden als leer gespeichert (Löschen = Feld leeren). Alles leer speichern ist erlaubt → Leerzustand.
- **Speichern:** Taste unten (mobil sticky über der Tastatur nicht nötig – Formular kurz), Ladezustand in der Taste; Erfolg → Anzeige + Snackbar «Infos gespeichert – alle sehen sie jetzt.»; Fehler → Banner oben im Formular, Eingaben bleiben.
- **Konflikt:** Formular sendet den Stand (`updatedAt`) mit; ist er veraltet → Banner «{Name} hat die Infos inzwischen geändert.» `[Neu laden]` (verwirft die eigenen Eingaben nach Rückfrage) – Speichern bleibt möglich („letzte Speicherung gewinnt“). In Inkr. 8 selten (nur eine Orga), aber billig.
- **„Zuletzt geändert von Lena, 30. April“:** Name = aktueller Anzeigename; Person hat die Reise verlassen oder ihr Konto gelöscht → «Zuletzt geändert am 30. April».
- **Leere Karten** werden nicht gezeigt; „Adresse folgt, sobald die Unterkunft gebucht ist.“ nur, wenn ein Name, aber keine Adresse eingetragen ist.
- **Datenschutz:** Infos sind Inhalte der Reise (keine „Reisedaten“ im Sinn von F-054), werden mit der Reise gelöscht (F-013) und nie in Mails, Teilen-Texte oder Logs übernommen. Im Datenexport (F-013) wie die Reisebeschreibung behandeln.
- **Leerzustand Mitglied:** «Noch keine Infos – {Orga} trägt hier Adresse, Check-in und Treffpunkt ein.» (Name der Orga, bei mehreren die erste). Orga: Primär `[Infos ergänzen]` → `/info/edit`.


## D. Inkrement 9 – Übernahme aus der festgelegten Unterkunft (2026-10-23, gilt vor A/B)

Grundlage: CEO-Entscheidung (c) vom 2026-10-23 und [`features.md` R.7](../../product/features.md) I9-09. Unterkünfte: [W18 E](w18-unterkunft-swipen.md).

**Regel:** Übernommen wird **nur der Name** (Titel des Vorschlags → Feld «Name der Unterkunft»). **Keine Adresse, kein Check-in, kein Link** – die Link-Vorschau liefert sie nicht verlässlich, und Portale nennen die genaue Adresse oft erst nach der Buchung. Es wird **nie automatisch gespeichert**: Die Übernahme füllt nur das Formular, gespeichert wird mit `[Speichern]`. Die Infos zeigen **keine** aus der Unterkunft abgeleiteten Angaben (eine Quelle: was in den Infos steht, hat die Orga eingetragen).

| Einstieg | Wer | Wirkung |
|---|---|---|
| W18 „Eure Unterkunft“: Text-Taste «Name in die Infos übernehmen ›» (solange Infos-Name ≠ Titel) | Orga (Inkr. 11: + „bucht“) | öffnet `/info/edit?from=stay`: Feld Name **vorbelegt** mit dem Titel (auch wenn schon ein anderer Name drinsteht – sichtbar geändert, Hinweis s. u.), Fokus auf das Feld **Adresse** |
| `/info/edit`: Taste (Kontur, `btn-sm`) über dem Feld Name «Aus „{Titel}“ übernehmen» | wie oben | nur sichtbar, wenn eine Unterkunft festgelegt ist **und** Feld Name ≠ Titel; füllt das Feld (nicht gespeichert), Fokus auf Adresse, Live-Ansage «Name übernommen – jetzt Adresse und Check-in ergänzen.» |

- War schon ein anderer Name eingetragen, steht unter dem Feld (Info, nicht Amber) «Vorher: „{alter Name}“» mit Text-Taste «Zurück» (stellt den alten Wert im Formular wieder her).
- **Adress-Hinweis** im Feld Adresse (Hilfe unter dem Feld, immer, wenn eine Unterkunft festgelegt ist): «Die genaue Adresse steht meist in der Buchungsbestätigung.» / «The exact address is usually in your booking confirmation.» Ohne festgelegte Unterkunft bleibt die bisherige Hilfe («Wird als Link „In Karten öffnen“ gezeigt …»); beide Sätze stehen dann hintereinander.
- Anzeige `/info`, Karte „Unterkunft“: bei festgelegter Unterkunft zusätzlich eine Text-Taste «Zur Unterkunft ›» (→ `/stays`), damit man vom Namen zum Portal-Link kommt – keine Kopie von Daten. Ist der Infos-Name leer, bleibt die Karte so, wie sie ohne Unterkunft wäre.
- Wird die Unterkunft-Festlegung aufgehoben oder eine andere festgelegt, bleiben die Infos **unverändert** (die Orga entscheidet, ob sie den Namen ändert); die Übernahme-Taste erscheint dann wieder, weil Name ≠ neuer Titel.
- Leerzustand Mitglied bei festgelegter, gebuchter Unterkunft, aber leeren Infos: unverändert «Noch keine Infos – {Orga} trägt hier Adresse, Check-in und Treffpunkt ein.»

| Schlüssel (Vorschlag) | DE | EN |
|---|---|---|
| `info.fromStay` | Aus „{title}“ übernehmen | Copy from “{title}” |
| `info.fromStay.done` (sr) | Name übernommen – jetzt Adresse und Check-in ergänzen. | Name copied – now add the address and check-in. |
| `info.fromStay.previous` / `.restore` | Vorher: „{name}“ · Zurück | Before: “{name}” · Restore |
| `info.addressHint.stay` | Die genaue Adresse steht meist in der Buchungsbestätigung. | The exact address is usually in your booking confirmation. |
| `info.toStay` | Zur Unterkunft | Go to the place |
