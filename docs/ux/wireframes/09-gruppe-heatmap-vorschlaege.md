# W09 – Reise: Tab „Gruppe“ – Vorschläge & Kalender (`/trips/{id}/group`)

Features: F-008, F-009, F-016, F-010 (Einstieg), F-015 (Erinnern) · Flow: [C](../user-flows.md#c-heatmap--vorschläge-f-008-f-009-f-016) · Interaktive/konsistente Skizze: [09-gruppe-heatmap.html](09-gruppe-heatmap.html) · Zellen-Anforderungen an Design: [abstimmung-design.md §2](../abstimmung-design.md)

Beispiel: 5 von 7 haben abgegeben (offen: Kemal, Sara). Mindestdauer 4, Wunsch 5 Nächte, Toleranz 1.

## Mobil – Ansicht „Vorschläge“ (Standard)

```
┌────────────────────────────────────┐
│ ←  Lissabon 2027               ⋯   │
│ Übersicht│Meine Tage│Gruppe│Abstimmen│
├────────────────────────────────────┤
│ ┌───────────────┬────────────────┐ │
│ │■ Vorschläge   │   Kalender     │ │  Segment (URL ?view=)
│ └───────────────┴────────────────┘ │
│ ┌────────────────────────────────┐ │
│ │ 5 von 7 haben abgegeben. Noch  │ │  Statusband
│ │ offen: Kemal, Sara – das Er-   │ │
│ │ gebnis kann sich noch ändern.  │ │
│ │                    [Erinnern]  │ │  nur Orga
│ └────────────────────────────────┘ │
│ (Dauer: 5 Nächte ▾)(Darf fehlen: 1 ▾)│  Filter-Chips (lokal)
│ (Personen ausblenden ▾)            │
│                                    │
│ Alle können (2)                    │  h2
│ ┌────────────────────────────────┐ │
│ │ Mi., 5. Mai – Mo., 10. Mai     │ │
│ │ bis zu 5 Nächte · ca. 3 Ur-    │ │
│ │ laubstage ⓘ                    │ │
│ │ 2× zur Not · inkl. Christi     │ │
│ │ Himmelfahrt                    │ │
│ │ [Im Kalender zeigen] ☑ Zur Abst.│ │  Checkbox nur Orga
│ └────────────────────────────────┘ │
│ ┌────────────────────────────────┐ │
│ │ Sa., 12. Juni – Sa., 19. Juni  │ │
│ │ bis zu 7 Nächte · ca. 5 Ur-    │ │
│ │ laubstage · 2× zur Not         │ │
│ │ [Im Kalender zeigen] ☑ Zur Abst.│ │
│ └────────────────────────────────┘ │
│                                    │
│ Fast alle können (3)               │
│ ┌────────────────────────────────┐ │
│ │ Do., 13. Mai – Mi., 19. Mai    │ │
│ │ bis zu 6 Nächte · ca. 4 Ur-    │ │
│ │ laubstage                      │ │
│ │ ohne Jonas · inkl. Pfingstmon. │ │
│ │ [Im Kalender zeigen] ☐ Zur Abst.│ │
│ └────────────────────────────────┘ │
│ … Alle 3 anzeigen                  │
├────────────────────────────────────┤
│ 2 ausgewählt [Abstimmung erstellen]│  fixiert, nur Orga, wenn ≥ 1 gewählt
└────────────────────────────────────┘
```

**Leerzustände** (Texte: Flow C.2):
```
Niemand hat abgegeben                 Keine Treffer
┌──────────────────────────────┐      ┌──────────────────────────────┐
│ [Illustration: Rechner wartet]│      │ Leider kein Zeitraum, in dem │
│ Noch keine Vorschläge –      │      │ alle 5 Nächte können.        │
│ sobald die ersten ihre Tage  │      │ So klappt es vielleicht:     │
│ eingetragen haben, rechnen   │      │ [Mit 4 Nächten: 3 Optionen]  │
│ wir los.                     │      │ [Wenn 1 fehlen darf: 2 Opt.] │
│ [Meine Tage eintragen]       │      │ Orga: [Suchzeitraum erweitern]│
└──────────────────────────────┘      └──────────────────────────────┘
```

## Mobil – Ansicht „Kalender“ (Heatmap)

```
│ (Vorschläge)(■ Kalender)           │
│ [Statusband] [Filter-Chips]        │
│ Legende: □ ░ ▒ ▓ █ ★alle  ~ zur Not  ° Feiertag
│ Mai 2027                           │
│ Mo  Di  Mi  Do  Fr  Sa  So         │
│  ·   ·   ·   ·   ·  1°  2          │  Zelle: Tagesnr. oben links,
│                     4   4          │  Anzahl „geht“ groß,
│  3   4 ┏5━━ 6°━━7━━━8━━━9┓         │  ★ oben rechts = alle können,
│  4   4 ┃4~★ 5★  5★  5★  5★┃        │  ~n unten rechts = n zur Not
│┏10┛ 11  12  13  14  15  16         │  ┏━┓ = hervorgehobener Vorschlag
│┗4~★┛ 4   4   4   4   4   4         │
│ …                                  │
│ Feiertage: 1.5. … 6.5. … 17.5. …   │
│ ▸ Wer hat abgegeben? (5/7)         │
```
(ASCII kann Zellen nur andeuten; maßgeblich ist die HTML-Skizze.)

**Tagesdetail** (Antippen eines Tages → Bottom-Sheet ½ Höhe):
```
┌────────────────────────────────────┐
│              ─────                 │
│ [‹]   Do., 6. Mai · Christi    [›] │  Tag-für-Tag blättern (auch wischen)
│       Himmelfahrt                  │
│       5 von 5 können               │
│ Geht (5): Lena, Jonas, Tim, Anna,  │
│           Paul                     │
│ Zur Not (0): niemand               │
│ Geht nicht (0): niemand            │
│ Noch offen (2): Kemal, Sara        │  grau
│ Tim [Kommentar] → „Juli nur mit Kindern“     │  Kommentar-Symbol, antippbar
│ [Ab hier als Option vorschlagen]   │  nur Orga, Phase 1/2
└────────────────────────────────────┘
```

## Desktop (≥ 960 px)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ← Meine Reisen   Lissabon 2027                                         ⋯    │
│ Übersicht   Meine Tage   Gruppe   Abstimmen                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Statusband: 5 von 7 … Noch offen: Kemal, Sara …             [Erinnern]]     │
│ (Dauer: 5 Nächte ▾) (Darf fehlen: 1 ▾) (Personen ausblenden ▾)   Legende …  │
├────────────────────────┬────────────────────────┬───────────────────────────┤
│ Mai 2027               │ Juni 2027              │ Alle können (2)           │
│ Mo Di Mi Do Fr Sa So   │ Mo Di Mi Do Fr Sa So   │ ┌───────────────────────┐ │
│ …  Zellen „4/5“ …      │ …                      │ │ Mi 5. – Mo 10. Mai …  │ │
│                        │                        │ └───────────────────────┘ │
│                        │                        │ Fast alle können (3) …    │
│                        │                        │ [Abstimmung erstellen (2)]│
└────────────────────────┴────────────────────────┴───────────────────────────┘
```
- Klick auf Tag → rechte Spalte zeigt Tagesdetail (mit `[× Zurück zu Vorschlägen]`), nicht modal.
- Hover auf Vorschlagskarte → Zeitraum in der Heatmap umrandet (zusätzlich zu Klick, nie nur Hover).
- Zellen zeigen „4/5“ (genug Platz).
