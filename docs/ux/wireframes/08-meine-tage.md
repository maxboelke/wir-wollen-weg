# W08 – Reise: Tab „Meine Tage“ (`/trips/{id}/days`)

Features: F-005, F-016, F-046 (Wochenstart), F-007 (Abgabe-Status) · Flow: [B](../user-flows.md#b-tage-markieren-f-005-f-016-f-046) · Tastatur/ARIA: [ux-spec §7.3](../ux-spec.md) · Interaktive Skizze: [08-meine-tage.html](08-meine-tage.html)

Beispiel: Suchzeitraum 1. Mai – 30. Juni 2027, Region DE-BY, Wochenstart Montag.

Legende der Skizze: `✕` geht nicht · `~` zur Not · (leer) geht/unmarkiert · `·` außerhalb/vergangen · `°` Feiertag · Sa/So-Spalten = Wochenende (getönt) · `[ ]` heute (Ring).

## Mobil (360 px)

```
┌────────────────────────────────────┐
│ ←  Lissabon 2027               ⋯   │
│ Übersicht│Meine Tage│Gruppe│Abstimmen│
├────────────────────────────────────┤
│ Entwurf – zählt erst, wenn du      │  Statuszeile (vor 1. Abgabe)
│ abgibst.                           │
│ Feiertage für: Bayern  Ändern      │  F-016 (nur wenn Region geraten)
│ ▸ So funktioniert's                │  Legende/Hilfe, einklappbar
│ [Mai] [Juni]                       │  Sprung-Chips
│                                    │
│ Mai 2027                           │  sticky Monatsüberschrift
│ Mo  Di  Mi  Do  Fr  Sa  So         │
│  ·   ·   ·   ·   ·  1°  2          │  26.–30.4. außerhalb (ausgegraut)
│  3   4   5  6°   7   8   9         │
│ 10  11  12  13 ✕14 ✕15 ✕16         │
│✕17°✕18 ✕19 ✕20 ✕21  22  23         │
│ 24  25  26 ~27°~28  29  30         │
│ 31                                 │
│ Feiertage: 1.5. Tag der Arbeit ·   │
│ 6.5. Christi Himmelfahrt · 17.5.   │
│ Pfingstmontag · 27.5. Fronleichnam │
│                                    │
│ Juni 2027                          │
│ Mo  Di  Mi  Do  Fr  Sa  So         │
│  ·   1   2   3   4   5   6         │
│ ~7  ~8  ~9 ~10 ~11  12  13         │
│ …                                  │
│                                    │
│ Möchtest du etwas dazu sagen?      │
│ (optional)                         │
│ [Juli nur mit Kindern …        ]   │  ≤ 200, „Alle in der Reise können
│                                    │   das lesen.“
├────────────────────────────────────┤  ── fixierte Werkzeugleiste ──
│ Was markierst du?                  │  (sr-only Label der Radiogruppe)
│ ┌──────────┬──────────┬─────────┐  │
│ │✕Geht     │~ Zur Not │  Geht   │  │  Pinsel (Radiogruppe), aktiv = gefüllt
│ │  nicht ● │          │         │  │
│ └──────────┴──────────┴─────────┘  │
│ [⇤⇥ Zeitraum] [↶] [⋯]  Gespeichert │  Bereichsmodus · Rückgängig · Schnellaktionen · Status
│ [      Fertig – abgeben        ]   │  primär
└────────────────────────────────────┘
```

Höhen (360 × 640): Header+Reise+Tabs ≈ 112 px, Werkzeugleiste ≈ 148 px → ~380 px sichtbarer Kalender (≥ 1 ganzer Monat bei 48-px-Zeilen inkl. Kopf). Der globale Header blendet beim Scrollen nach unten aus (+56 px).

**Kompakte Werkzeugleiste nach Abgabe** (Primärbutton entfällt → mehr Kalender sichtbar):
```
├────────────────────────────────────┤
│ [✕ Geht nicht●][~ Zur Not][ Geht ] │
│ [⇤⇥] [↶] [⋯]   ✓ Abgegeben · 14:32 │
└────────────────────────────────────┘
```

### Zustände während der Interaktion
```
Ziehen von Do 13. bis Mi 19. (Vorschau, vor dem Loslassen)
│ 10  11  12 ┏13━━14━━15━━16┓        │  durchgehender Umriss + Tönung
│┗17━━18━━19┛ 20  21  22  23         │  = Datumsbereich wie Textauswahl
  Ansage/Tooltip: „13.–19. Mai · 7 Tage“

Bereichsmodus aktiv, Start gesetzt
│ Jetzt das Ende antippen.  [Abbrechen] │  Hinweiszeile über der Werkzeugleiste
│ 10  11  12 ◉13  14  15  16         │  Startmarke

Snackbar nach Zug
│ 7 Tage auf „geht nicht“ gesetzt    │
│                     [Rückgängig]   │  über der Werkzeugleiste, 6 s
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
Werkzeugleiste ersetzt durch: «Der Termin steht fest – deine Tage sind gesperrt.» Zellen nicht bedienbar, Zustände bleiben sichtbar.

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
│  ·  ·  ·  ·  · 1° 2                  │  ·  1  2  3  4  5  6                 │
│  3  4  5 6°  7  8  9                 │ ~7 ~8 ~9 ~10 ~11 12 13               │
│ …                                    │ …                                    │
│ Feiertage: …                         │ Feiertage: …                         │
├──────────────────────────────────────┴──────────────────────────────────────┤
│ Kommentar (optional) [                                                   ]  │
└─────────────────────────────────────────────────────────────────────────────┘
```
≥ 1200 px: 3 Monate nebeneinander. Zellen auf Desktop 56–64 px.
