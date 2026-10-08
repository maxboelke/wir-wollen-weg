# W09 – Reise: Tab „Gruppe“ – Vorschläge & Kalender (`/trips/{id}/group`)

Features: F-008, F-009, F-016, F-010 (Einstieg), F-015 (Erinnern) · Flow: [C](../user-flows.md#c-heatmap--vorschläge-f-008-f-009-f-016) · Regeln: [ux-spec §4.9](../ux-spec.md) (Zelle, Legende, Feiertagsliste), §7.3 (Grid/Tastatur) · Optik: design-system §6, §9.3, §9.7 · **Maßgebliche Skizze: [09-gruppe-heatmap.html](09-gruppe-heatmap.html)** (v2, Abstimmungsrunde 2)

Beispiel: 5 von 7 haben abgegeben (Lena, Jonas, Tim, Anna, Paul; offen: Kemal, Sara). Mindestdauer 4, Wunsch 5 Nächte, Toleranz 1, heute = Mo., 3. Mai 2027. Heatmap und Vorschläge in der HTML-Skizze stammen aus denselben Beispieldaten.

**Begriffe (verbindlich, ux-spec §10.2):** Zahl in der Zelle = Anzahl „Geht“ / abgegeben · ✓ = „Alle: Geht“ (x = n) · ◐ = mind. eine Person „Zur Not“ · Vorschlagsgruppe „Alle dabei“ = niemand hat „Geht nicht“ (F-009), „Fast alle dabei“ = 1 bis k fehlen (CEO-Entscheidungen U-4, U-14).

## Richtung B „Reise-Cockpit“ (Q18) – maßgeblich ab Look & Feel 2.0

Entscheidungen: [abstimmung-design §8.1](../abstimmung-design.md) (B-3 Kennzahl-Box, B-6 Vorschlag-Leiste), Regeln [ux-spec §4.10, §4.11](../ux-spec.md). Die Skizzen weiter unten gelten für Inhalte (Karten, Zelle, Tagesdetail, Leerzustände); **Statusband entfällt** (→ Kennzahl-Box). Die HTML-Skizze bleibt Referenz für Zelle/Grid/ARIA.

### Kopf mit Kennzahl-Box (beide Ansichten)
```
┌────────────────────────────────────┐
│▓(←)  Lissabon 2027             (⋯)▓│  sticky (kompakter Kopf ≈ 104 px)
│▓     ● Tage sammeln · 5/7 fertig  ▓│
│▓(Übersicht)(Meine Tage)(Gruppe)(Ab│  sticky
│▓ ┌──────────────────────────────┐ ▓│  ── scrollt mit, kein Einklappen ──
│▓ │ (◔) 5 von 7 haben abgegeben  │ ▓│  Ring aria-hidden, Text trägt die Zahl
│▓ │     Noch offen: Kemal, Sara –│ ▓│
│▓ │     das Ergebnis kann sich   │ ▓│
│▓ │     noch ändern. [Erinnern]  │ ▓│  Orga, Minze-Taste ≥ 44 px
│▓ └──────────────────────────────┘ ▓│  alle abgegeben: „Alle haben abgegeben.“ + Orga [Abstimmung starten]
╰▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╯
│ [ Vorschläge |▐Kalender▌ ]         │  Segment ≥ 44 px
│ (Dauer: 5 Nächte ▾)(Darf fehlen: 1▾)│  Filterzeile bleibt (fehlt im B-Entwurf, D-26)
│ (Personen ausblenden ▾)            │
```

### Ansicht Kalender mit Vorschlag-Leiste (< 960 px)
```
│ ▸ Legende                          │  <details>, Zustand nach U-6
│ Mai 2027                           │
│ … Heatmap (Zell-Anatomie unten) …  │
│ 4/5  5/5  5/5  5/5  5/5  4/5       │
│ ▐▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▌      │  Band = gewählter Vorschlag (bleibt, solange gewählt)
│ …                                  │
├────────────────────────────────────┤  fixiert · kein Griff · ≤ 120 px + Safe Area
│ [‹] 1 · ✓ Alle dabei · 1 von 5 [›] │  ‹ › 44 px, an den Enden aria-disabled (kein Umlauf)
│     Mi., 5. Mai – Mo., 10. Mai     │  Mitte = Button → Liste, Fokus auf diese Karte
│     bis zu 5 Nächte · ca. 3 Url.-T.│
│     (◐ 2× zur Not)(Christi Hi… +1) │  max. 1 Chip-Zeile, Überlauf „+1“
└────────────────────────────────────┘
```
- **Start:** Kalender direkt geöffnet → Vorschlag 1 gewählt, Band sichtbar, kein Umriss/Label, kein Scroll-Sprung. Über „Im Kalender zeigen“ → dieser Vorschlag, Scroll + Umriss/Label 4 s (dann weg, Band bleibt – M-U7).
- **Blättern:** Band wechselt, Scroll zum Anreisetag (oberes Drittel), Ansage «Vorschlag 2 von 5: Sa., 12. Juni – Sa., 19. Juni, Alle dabei». Keine Aufbau-Welle der Heatmap (M-U8).
- **Orga:** keine Auswahl in der Leiste; „Zur Abstimmung“ nur in der Listenansicht (dort die Auswahlleiste „2 ausgewählt · Abstimmung erstellen“).
- **Leer:** keine Treffer → «Gerade kein passender Zeitraum. [Tipps ansehen]»; niemand abgegeben → keine Leiste.
- **Tagesdetail** öffnet als Sheet über der Leiste. Snackbar liegt über der Leiste (`--ww-sticky-bar-h`).
- **≥ 960 px:** keine Leiste – Vorschlagsspalte rechts (wie Desktop unten), Kennzahl-Box im Kopf über beiden Spalten.
- **Zelle (B):** Kalender-Karte unter 400 px mit ≤ 8 px Gesamtrand je Seite → Zelle ≥ 45 px breit bei 360 px (D-21); Höhe 46 px + Fuge 9 px zulässig, wenn die Anatomie unten ohne Überlappung passt.

## Mobil – Ansicht „Vorschläge“ (Standard)

```
┌────────────────────────────────────┐
│ ←  Lissabon 2027               ⋯   │
│ Übersicht│Meine Tage│Gruppe│Abstimmen│
├────────────────────────────────────┤
│ ┌───────────────┬────────────────┐ │
│ │▐ Vorschläge ▌ │   Kalender     │ │  Segment (URL ?view=), aktiv = Rahmen + fett
│ └───────────────┴────────────────┘ │
│ ┃ 5 von 7 haben abgegeben. Noch    │  Statusband (Amber, design-system §9.12)
│ ┃ offen: Kemal, Sara – das Ergeb-  │
│ ┃ nis kann sich noch ändern.       │
│ ┃                     [Erinnern]   │  nur Orga
│ (Dauer: 5 Nächte ▾)(Darf fehlen: 1 ▾)│  Filter-Chips (lokal)
│ (Personen ausblenden ▾)            │  aktiv: (✓ 1 ausgeblendet ▾)
│                                    │
│ ✓ Alle dabei (2)                   │  h2, Strich-Icon ww-icon-check (nicht Badge)
│ ┌────────────────────────────────┐ │
│ │ Mi., 5. Mai – Mo., 10. Mai     │ │
│ │ bis zu 5 Nächte · ca. 3 Ur-    │ │
│ │ laubstage ⓘ                    │ │
│ │ (◐ 2× zur Not) (inkl. Christi  │ │  Zusatz-Chips, umbrechend
│ │  Himmelfahrt)                  │ │
│ │ Im Kalender zeigen  ☑ Zur Abst.│ │  Checkbox nur Orga
│ └────────────────────────────────┘ │
│ ┌────────────────────────────────┐ │
│ │ Sa., 12. Juni – Sa., 19. Juni  │ │
│ │ bis zu 7 Nächte · ca. 5 Ur-    │ │
│ │ laubstage ⓘ  (◐ 2× zur Not)    │ │
│ │ Im Kalender zeigen  ☑ Zur Abst.│ │
│ └────────────────────────────────┘ │
│                                    │  32 px Abstand
│ ⚇ Fast alle dabei (3)              │  h2, Icon ww-icon-users
│ ┌────────────────────────────────┐ │
│ │ Do., 13. Mai – Mi., 19. Mai    │ │
│ │ bis zu 6 Nächte · ca. 4 Ur-    │ │
│ │ laubstage ⓘ                    │ │
│ │ (✕ ohne Jonas) (inkl. Pfingst- │ │
│ │  montag)                       │ │
│ │ Im Kalender zeigen  ☐ Zur Abst.│ │
│ └────────────────────────────────┘ │
│ … Alle 3 anzeigen                  │
├────────────────────────────────────┤
│ 2 ausgewählt [Abstimmung erstellen]│  fixiert, nur Orga, wenn ≥ 1 gewählt
└────────────────────────────────────┘
```
Kein Mini-Streifen auf den Karten im MVP (U-10).

**Leerzustände** (Texte: Flow C.2; Illustrationen aus `docs/design/assets/illustrations/`):
```
Niemand hat abgegeben                 Keine Treffer
┌──────────────────────────────┐      ┌──────────────────────────────┐
│ [empty-nobody.svg]           │      │ [no-matches.svg]             │
│ Noch keine Vorschläge –      │      │ Leider kein Zeitraum, in dem │
│ sobald die ersten ihre Tage  │      │ alle 5 Nächte dabei sind.    │
│ eingetragen haben, rechnen   │      │ So klappt es vielleicht:     │
│ wir los.                     │      │ [Mit 4 Nächten: 3 Optionen]  │
│ [Meine Tage eintragen]       │      │ [Wenn 1 fehlen darf: 2 Opt.] │
└──────────────────────────────┘      │ Orga: [Suchzeitraum erweitern]│
                                      └──────────────────────────────┘
```

## Mobil – Ansicht „Kalender“ (Heatmap)

Zell-Anatomie (mobil 45,7 × 52 px, Kalender-Seitenrand 8 px, Fuge 4 px – U-1, U-2):
```
┌───────────────┐
│(6)          ◥ │  Datum oben links (Ring = heute) · Feiertag-Eselsohr Ecke oben rechts
│     5/5       │  Zählwert Mitte: Anzahl „Geht“ / abgegeben (ab n ≥ 10 mobil nur „x“)
│ ◐           ✓ │  ◐ unten links = jemand „Zur Not“ · ✓ unten rechts = alle „Geht“ (nie beide)
└───────────────┘
 ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬  Vorschlag-Band in der Fuge darunter (Kappen nur an An-/Abreisetag)
```

```
│ (Vorschläge)(▐Kalender▌)           │
│ [Statusband] [Filter-Chips]        │
│ ▾ Legende                          │  <details>, beim 1. Besuch offen, Zustand gemerkt (U-6)
│  [–]keine Daten [0]niemand [2]wenige│  echte Mini-Zellen mit Beispielzahlen
│  [3]einige [4]viele [5✓]alle       │
│  4/5 = 4 von 5 haben „Geht“        │
│  ✓ Alle: Geht · ◐ Jemand nur „Zur  │
│  Not“ · ◥ Feiertag · ▬ Vorschlag   │
│ Mai 2027                           │
│ Mo  Di  Mi  Do  Fr  Sa  So         │
│  ·   ·   ·   ·   ·   1◥  2         │  1.–2.5. vergangen (nur Datum, ≥ 3:1)
│ (3)  4   5   6◥  7   8   9         │  heute = 3.5.
│ 3/5 3/5 4/5 5/5 5/5 5/5 5/5        │
│          ◐   ✓   ✓   ✓   ✓         │
│        ▐▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ │  Band ab Anreise (Kappe + Rang „1“), Zeilenende offen
│ 10  11  12  13  14  15  16         │
│ 4/5 3/5 3/5 4/5 4/5 4/5 4/5        │
│  ◐                                 │  10.5.: Zur Not ohne „Geht nicht“ → nur ◐, kein ✓
│▬▬▬▌                                │  offen am Zeilenanfang, Kappe an Abreise
│ …                                  │
│ ◥ 1.5. Tag der Arbeit  ◥ 6.5. Chri-│  Feiertagsliste je Monat (U-11)
│   sti Himmelfahrt  ◥ 17.5. Pfingst-│
│   montag  ◥ 27.5. Fronleichnam     │
│ ▸ Wer hat abgegeben? (5/7)         │
```
(ASCII deutet Zellen nur an; maßgeblich sind HTML-Skizze und design-system §6.1.)

**Tagesdetail** (Antippen eines Tages → Bottom-Sheet, Rastpunkt ½, nach oben ziehbar auf „fast voll“):
```
┌────────────────────────────────────┐
│              ─────                 │  Griff (nicht einziges Schließmittel)
│ [‹]  Do., 6. Mai · Christi    [›][×]│  Tag blättern (auch wischen), Schließen
│      Himmelfahrt                   │
│      5 von 5: Geht                 │  Zählzeile = Zellwert
│      (✓ Alle: Geht)                │  Zusammenfassung (s. u.)
│ ✓ Geht (5)                         │
│   (LE) Lena (JO) Jonas (TI) Tim [💬]│  Kommentar-Icon antippbar
│   (AN) Anna (PA) Paul              │
│ ◐ Zur Not (0)  niemand             │
│ ✕ Geht nicht (0)  niemand          │
│ Noch offen (2)                     │  text-muted
│   (┄KE┄) Kemal (┄SA┄) Sara         │  gestrichelter Avatar-Ring (U-13)
│ [Ab hier als Option vorschlagen]   │  nur Orga, Phase 1/2
└────────────────────────────────────┘
```
Zusammenfassung je Fall (CEO-Entscheidung U-4, Wortlaut Glossar):
- x = n → «✓ Alle: Geht»
- kein „Geht nicht“, aber „Zur Not“ (z. B. 10. Mai, „4 von 5: Geht“) → «◐ Alle dabei – 1 nur zur Not»
- sonst (z. B. 13. Mai) → «✕ Nicht: Jonas» (max. 3 Namen, sonst «4 können nicht»)

Zugänglicher Name der Zelle: «Donnerstag, 6. Mai 2027, Feiertag Christi Himmelfahrt, 5 von 5 Geht – alle, Teil von Vorschlag 1» · «Montag, 10. Mai 2027, 4 von 5 Geht, 1 Zur Not, Teil von Vorschlag 1».

## Große Schrift (≥ ca. 175 % Textgröße) – Tagesliste (U-5)
```
│ Mai 2027                           │
│ ────────────────────────────────── │
│ Mi., 5. Mai                        │  eine Zeile/Kachel je Tag, Link → Tagesdetail
│ 4 von 5: Geht                      │
│ (◐ 1 Zur Not) (Vorschlag 1)        │
│ ────────────────────────────────── │
│ Do., 6. Mai                        │
│ 5 von 5: Geht                      │
│ (✓ alle) (◥ Christi Himmelfahrt)   │
│ (Vorschlag 1)                      │
```
Umschaltung automatisch per `em`-Container-Query (ux-spec §7.1). Meine Tage bleibt ein Raster.

## Desktop (≥ 960 px)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ← Meine Reisen   Lissabon 2027                                         ⋯    │
│ Übersicht   Meine Tage   Gruppe   Abstimmen                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Statusband: 5 von 7 … Noch offen: Kemal, Sara …             [Erinnern]]     │
│ (Dauer: 5 Nächte ▾) (Darf fehlen: 1 ▾) (Personen ausblenden ▾)              │
│ Legende (immer sichtbar): [–][0][2][3][4][5✓] · 4/5 = „Geht“ · ✓ · ◐ · ◥ · ▬ │
├────────────────────────┬────────────────────────┬───────────────────────────┤
│ Mai 2027               │ Juni 2027              │ ✓ Alle dabei (2)          │
│ Mo Di Mi Do Fr Sa So   │ Mo Di Mi Do Fr Sa So   │ ┌───────────────────────┐ │
│ Zellen 64 px: „4/5“,   │ …                      │ │ Mi., 5. Mai – …       │ │
│ ◐2 / ✓, Pegel ▬▬▬░     │                        │ └───────────────────────┘ │
│                        │                        │ ⚇ Fast alle dabei (3) …   │
│                        │                        │ [Abstimmung erstellen (2)]│
└────────────────────────┴────────────────────────┴───────────────────────────┘
```
- Klick auf Tag → rechte Spalte zeigt Tagesdetail (mit `[× Zurück zu Vorschlägen]`), nicht modal; der Tag erhält den Doppelrahmen „ausgewählt“.
- Hover oder Klick „Im Kalender zeigen“ auf Vorschlagskarte → Band im Kalender + Karte mit Rahmen `accent-strong` (nie nur Hover).
- Zellen zeigen „x/n“, ◐ mit Anzahl („◐2“) und den Pegel (4 Segmente, U-3).
