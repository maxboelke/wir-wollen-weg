# W12 – Reise-Einstellungen & Verwaltungsdialoge (`/trips/{id}/settings`)

Features: F-001 (bearbeiten), F-004, F-013, F-016 · Flow: [J](../user-flows.md#j-reise-verlassen--mitglied-entfernen--rolle-übergeben--reise-löschen-f-004-f-013)

## Reise bearbeiten – nur Orga (mobil)

```
┌────────────────────────────────────┐
│ ← Lissabon 2027   Reise bearbeiten │
├────────────────────────────────────┤
│ Reisename      [Lissabon 2027   ]  │
│ Zeitraum       [01.05.27][30.06.27]│
│ Mindestens     [−] 4 Nächte [+]    │
│ Am liebsten    [−] 5 Nächte [+]    │
│ Beschreibung   [               ]   │
│ Feiertage der Reise [DE – Bayern ▾]│
│ Frist Eintragen [14.05.2027] [×]   │  F-017
│                                    │
│ ⓘ Änderungen an Zeitraum/Dauer     │
│   berechnen die Vorschläge neu.    │
│   Tage außerhalb des Zeitraums     │
│   zählen nicht mehr.               │
│ [      Änderungen speichern     ]  │
│                                    │
│ Organisation                       │  h2
│ Orga übergeben             [›]     │  → Dialog
│                                    │
│ Gefahrenbereich                    │  h2, abgesetzt
│ ┌────────────────────────────────┐ │
│ │ Reise für alle löschen         │ │
│ │ Alle Tage, Stimmen und Mitglie-│ │
│ │ der werden sofort gelöscht.    │ │
│ │ [Reise löschen]                │ │  destruktiv (Textbutton/Outline)
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```
In Phase 2/3: Zeitraum/Dauer weiterhin änderbar (F-001), aber Hinweis «Die Abstimmung läuft – bestehende Optionen bleiben unverändert.»

## Dialoge

**Reise löschen**
```
┌────────────────────────────────────┐
│ Reise für alle löschen?            │
│ Alle Tage, Stimmen und Mitglieder  │
│ von „Lissabon 2027“ werden sofort  │
│ gelöscht. Das kann nicht rück-     │
│ gängig gemacht werden.             │
│ Tippe zur Bestätigung den Reise-   │
│ namen: Lissabon 2027               │
│ [                              ]   │
│ [Abbrechen]  [Reise löschen]       │  aktiv erst bei Übereinstimmung
└────────────────────────────────────┘
```

**Orga übergeben**
```
│ Wer soll die Reise organisieren?   │
│ (•) Sara  (seit 2. Mai dabei)      │  Radioliste, sortiert nach Beitritt
│ ( ) Jonas                          │
│ Du bleibst Mitglied.               │
│ [Abbrechen]  [Übergeben]           │
```

**Reise verlassen (Mitglied)**
```
│ „Lissabon 2027“ verlassen?         │
│ Deine Tage, Stimmen und dein Kom-  │
│ mentar in dieser Reise werden ge-  │
│ löscht. Dein Konto bleibt.         │
│ [Abbrechen]  [Reise verlassen]     │
```

**Reise verlassen (Orga)**
```
│ Als Orga musst du die Reise zuerst │
│ übergeben oder löschen.            │
│ [Orga übergeben] [Reise löschen]   │
│ [Abbrechen]                        │
```

**Mitglied entfernen** (aus Übersicht → Mitglied → ⋯)
```
│ Kemal entfernen?                   │
│ Seine Tage und Stimmen werden ge-  │
│ löscht. Er kann nur mit einem      │
│ Einladungslink wieder beitreten.   │
│ ☐ Einladungslink danach erneuern   │
│ [Abbrechen]  [Entfernen]           │
```
Copy-Hinweis: Pronomen vermeiden, wo möglich → «Die Tage und Stimmen von Kemal werden gelöscht.» (geschlechtsneutral, ux-spec §10.1).

**Mein Name in dieser Reise** (alle)
```
│ Dein Name in „Lissabon 2027“       │
│ [Kemal B.                      ]   │
│ Gilt nur für diese Reise.          │
│ [Abbrechen]  [Speichern]           │
```
