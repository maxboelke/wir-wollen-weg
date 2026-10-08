# W08 – Reise: Tab „Meine Tage“ (`/trips/{id}/days`)

Features: F-005, F-016, F-046 (Wochenstart), F-007 (Abgabe-Status) · Flow: [B](../user-flows.md#b-tage-markieren-f-005-f-016-f-046) · Tastatur/ARIA: [ux-spec §7.3](../ux-spec.md) · Regeln Zelle/Legende: [ux-spec §4.9](../ux-spec.md) · Optik: design-system §6.6, §9.13 · **Maßgebliche, interaktive Skizze: [08-meine-tage.html](08-meine-tage.html)** (v2)

Beispiel: Suchzeitraum 1. Mai – 30. Juni 2027, Region DE-BY, Wochenstart Montag.

Legende der Skizze: `✕` geht nicht (Kreuzschraffur) · `◐` zur Not (Streifen) · (leer) geht/unmarkiert (glatte Fläche, **kein** Häkchen) · `·` außerhalb/vergangen · `◥` Feiertag (Eselsohr oben rechts) · Sa/So-Spalten = Wochenend-Spur · `( )` heute (Ring um die Datumszahl).

Maße mobil: Kalender-Seitenrand 8 px (`--ww-size-cal-inset-sm`), Fuge 4 px (`--ww-size-cal-gap`) → Zelle 45,7 × 52 px bei 360 px, 41 × 52 px bei 320 px (CEO-Entscheidung U-1).

## Mobil (360 px)

```
┌────────────────────────────────────┐
│ ←  Lissabon 2027               ⋯   │
│ Übersicht│Meine Tage│Gruppe│Abstimmen│
├────────────────────────────────────┤
│ Entwurf – zählt erst, wenn du      │  Statuszeile (vor 1. Abgabe)
│ abgibst.                           │
│ Feiertage für: Bayern  Ändern      │  F-016 (nur wenn Region geraten)
│ ▾ So funktioniert's                │  Legende: offen bis zur 1. Abgabe, dann zu
│ [Mai] [Juni]                       │  Sprung-Chips
│                                    │
│ Mai 2027                           │  sticky Monatsüberschrift
│ Mo  Di  Mi  Do  Fr  Sa  So         │
│  ·   ·   ·   ·   ·   1◥  2         │  26.–30.4. außerhalb, 1.–2.5. vergangen
│ (3)  4   5   6◥  7   8   9         │  heute = 3.5.
│ 10  11  12  13 ✕14 ✕15 ✕16         │
│✕17◥✕18 ✕19 ✕20 ✕21  22  23         │
│ 24  25  26 ◐27◥◐28  29  30         │
│ 31                                 │
│ ◥ 1.5. Tag der Arbeit  ◥ 6.5. Chri-│  Feiertagsliste (U-11), 13 px text-muted
│ sti Himmelfahrt  ◥ 17.5. Pfingst-  │
│ montag  ◥ 27.5. Fronleichnam       │
│                                    │
│ Juni 2027                          │
│ Mo  Di  Mi  Do  Fr  Sa  So         │
│  ·   1   2   3   4   5   6         │
│ ◐7  ◐8  ◐9 ◐10 ◐11  12  13         │
│ …                                  │
│                                    │
│ Möchtest du etwas dazu sagen?      │
│ (optional)                         │
│ [Juli nur mit Kindern …        ]   │  ≤ 200, „Alle in der Reise können
│                                    │   das lesen.“
├────────────────────────────────────┤  ── fixierte Werkzeugleiste ──
│ Was markierst du?                  │  (sr-only Label der Radiogruppe)
│ ┌──────────┬──────────┬─────────┐  │
│ │ [▩] ✕   ●│ [▨] ◐    │ [▢] ✓   │  │  Pinsel (Radiogruppe): Mini-Feld über Label
│ │Geht nicht│ Zur Not  │  Geht   │  │  (< 400 px); aktiv = Fläche + 2-px-Rahmen + ●
│ └──────────┴──────────┴─────────┘  │
│ [⇤⇥ Zeitraum] [↶] [⋯]  Gespeichert │  ww-icon-range · ww-icon-undo (aria-disabled, wenn leer) · ww-icon-quick-actions · Status
│ [      Fertig – abgeben        ]   │  primär
└────────────────────────────────────┘
```

Höhen (360 × 640): Header+Reise+Tabs ≈ 112 px, Werkzeugleiste ≤ 150 px (`--ww-size-toolbar-max`; Pinsel mit Mini-Feld über Label 56 px) → ~380 px sichtbarer Kalender (≥ 1 ganzer Monat bei 48-px-Zeilen inkl. Kopf). Der globale Header blendet beim Scrollen nach unten aus (+56 px).

**Kompakte Werkzeugleiste nach Abgabe** (Primärbutton entfällt → mehr Kalender sichtbar):
```
├────────────────────────────────────┤
│ [✕ Geht nicht●][◐ Zur Not][✓ Geht] │
│ [⇤⇥] [↶] [⋯]   ✓ Abgegeben · 14:32 │
└────────────────────────────────────┘
```

### Zustände während der Interaktion
```
Ziehen von Do 13. bis Mi 19. (Vorschau, vor dem Loslassen)
│ 10  11  12 ┌┄13┄┄14┄┄15┄┄16┄       │  Zellen zeigen schon Fläche/Muster des Pinsels;
│┄17┄┄18┄┄19┐ 20  21  22  23         │  gestrichelter 2-px-Umriss je Zeilensegment,
                                         an Umbrüchen offen (--ww-cal-preview-border)
  Ansage/Tooltip: „13.–19. Mai · 7 Tage“

Bereichsmodus aktiv, Start gesetzt
│ Jetzt das Ende antippen.  [Abbrechen] │  Hinweiszeile über der Werkzeugleiste
│ 10  11  12 •[13] 14  15  16        │  Startmarke: Doppelrahmen + Ankerpunkt links (--ww-cal-anchor)

Snackbar nach Zug
│ 7 Tage auf „geht nicht“ gesetzt    │
│                     [Rückgängig]   │  über der Werkzeugleiste: bottom = --ww-sticky-bar-h + 8 px (U-7), 6 s
```

### Schnellaktionen `[⋯]` (Bottom-Sheet)
```
│ Schnellaktionen                    │
│ ▢ Alle Werktage (Mo–Fr) auf „zur Not“ │
│ ▢ Alle Wochenenden auf „geht“      │
│ ▢ Feiertage auf „geht“             │
│ ▢ Auch Feiertage der Reise zeigen  │  nur wenn Reise-Region ≠ eigene
│ ─────────────                      │
│ ▢ Alles zurücksetzen               │  mit Bestätigung
```
(Jeder Eintrag ist ein Button, kein Checkbox – Symbol `▢` nur Skizze.)

### Abgabe ohne Markierung
```
│ Du hast keine Tage markiert. Heißt │
│ das, du kannst im ganzen Zeitraum? │
│ [Noch markieren] [Ja, ich kann immer] │
```

### Nach Abgabe – Erfolg + Feedback-Frage (einmalig, F-005)
```
│ [submitted.svg]                    │  Illustration klein, dekorativ
│ ✓ Danke, Kemal! Deine Tage sind    │
│   drin.                            │
│ Kurze Frage: Hättest du lieber     │
│ deinen Kalender importiert?        │
│ ( ) Ja, Apple/iCloud               │
│ ( ) Ja, Google                     │
│ ( ) Ja, Outlook                    │
│ ( ) Ja, anderer                    │
│ ( ) Nein, so passt es              │
│ [Überspringen]      [Antworten]    │
```

### Phase 3 (festgelegt) – schreibgeschützt
Werkzeugleiste ersetzt durch Hinweis mit Schloss-Icon (`ww-icon-lock`): «Der Termin steht fest – deine Tage sind gesperrt.» Zellen nicht bedienbar, Zustände bleiben **voll farbig** sichtbar (keine Opazität, design-system §6.6).

### Große Schrift (≥ ca. 175 %)
Raster bleibt; Zellen wachsen in der Höhe, Symbol rutscht unter die Datumszahl (ux-spec §7.1, U-5). Werkzeugleiste: Labels umbrechen, Leiste darf höher werden; ist sie > 40 % der Viewport-Höhe, wird sie nicht fixiert, sondern steht über dem Kalender (Skip-Link „Zu den Werkzeugen“).

## Desktop (≥ 960 px)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ← Meine Reisen   Lissabon 2027                                         ⋯    │
│ Übersicht   Meine Tage   Gruppe   Abstimmen                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ Was markierst du?  (✕ Geht nicht●) (~ Zur Not) ( Geht )   [⇤⇥ Zeitraum] [↶] [⋯] │ sticky
│ Tipp: Klicken, ziehen oder Umschalt+Klick für Zeiträume.  Gespeichert  [Fertig – abgeben] │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ Mai 2027                             │ Juni 2027                            │
│ Mo Di Mi Do Fr Sa So                 │ Mo Di Mi Do Fr Sa So                 │
│  ·  ·  ·  ·  · 1◥ 2                  │  ·  1  2  3  4  5  6                 │
│  3  4  5 6°  7  8  9                 │ ◐7 ◐8 ◐9 ◐10 ◐11 12 13               │
│ …                                    │ …                                    │
│ Feiertage: …                         │ Feiertage: …                         │
├──────────────────────────────────────┴──────────────────────────────────────┤
│ Kommentar (optional) [                                                   ]  │
└─────────────────────────────────────────────────────────────────────────────┘
```
≥ 1200 px: 3 Monate nebeneinander. Zellen ab 600 px 64 px hoch, Kalender-Seitenrand 16 px (`--ww-size-cal-inset`).
