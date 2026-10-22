# W22 – Infos zur Reise (Anzeige & Bearbeiten)

Stand: 2026-10-20 · UI/UX · Status: Entwurf (Ausbaustufe R, Inkrement 8) · Feature **F-033** (Text & Links, ohne Dateien) · Routen `/trips/{id}/info`, `/info/edit`
Prototyp: [`#/info`](../mockups/reise-managen/index.html) (als Lena: „Bearbeiten“; nach „Das wird's“ in W18 „Adresse übernehmen“).

## Rechte
Anzeigen: alle Mitglieder. Bearbeiten: **Orga und „bucht“** (R.1). Unten immer «Zuletzt geändert von Lena, 30. April».

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
│ [▤ Aus „Kamena Kuća“ übernehmen]   │  nur wenn Unterkunft festgelegt und Adresse leer
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
