# W11 – Termin festlegen & Ergebnis (Dialog in `/poll`, Übersicht Phase 3)

Features: F-012, F-002 (Teilen), F-046 (Datumsformat des Betrachters) · Flow: [D.3](../user-flows.md#d3-ergebnis-festlegen-nur-orga-f-012-w11)

## Dialog „Termin festlegen“ (mobil Bottom-Sheet)

```
┌────────────────────────────────────┐
│              ─────                 │
│ Termin festlegen               [×] │
│                                    │
│ ⓘ Noch nicht abgestimmt: Kemal,    │  nur wenn zutreffend
│   Sara.                            │
│                                    │
│ (•) Mi., 5. Mai – Mo., 10. Mai     │  Vorauswahl = Platz 1
│     Platz 1 · Ja 4 · Vielleicht 1  │
│ ( ) Sa., 12. Juni – Do., 17. Juni  │
│     Platz 2 · Ja 3 · Vielleicht 2  │
│ ( ) Do., 13. Mai – Di., 18. Mai    │
│     Platz 3 · Ja 2 · Nein 1 (ohne  │
│     Jonas)                         │
│                                    │
│ Danach sind Tage und Stimmen       │
│ gesperrt. Du kannst das später     │
│ wieder aufheben.                   │
│ [Abbrechen]   [Termin festlegen]   │
└────────────────────────────────────┘
```
Gleichstand: keine Vorauswahl, Hinweis «Gleichstand auf Platz 1 – du entscheidest.»; `[Termin festlegen]` erst nach Auswahl aktiv (Grund steht dabei).

## Ergebnis – Übersicht Phase 3 (alle, mobil)

```
┌────────────────────────────────────┐
│ ←  Lissabon 2027               ⋯   │
│ Übersicht│Meine Tage│Gruppe│Abstimmen│
├────────────────────────────────────┤
│ ┌────────────────────────────────┐ │
│ │ [Illustration: Koffer/Flieger] │ │  Designer (Erfolgsmotiv)
│ │ Es geht los!                   │ │  h1
│ │ Mi., 5. Mai –                  │ │  groß
│ │ Mo., 10. Mai 2027              │ │
│ │ 5 Nächte · noch 23 Tage        │ │
│ │                                │ │
│ │ [  Zum Kalender hinzufügen ▾ ] │ │  → Kalenderdatei (Apple, Outlook …)
│ │                                │ │     · Google Kalender
│ │ [   Allen Bescheid geben     ] │ │  Teilen-Sheet (Text „Ergebnis“); prim. für Orga
│ └────────────────────────────────┘ │
│ ⓘ Download klappt nicht? Öffne die │  nur im erkannten In-App-Browser
│   Seite in Safari/Chrome.          │
│                                    │
│ ① Tage ✓ ─ ② Abstimmen ✓ ─ ③ Fix ● │
│ Wer ist dabei? (7) …               │  wie W07
└────────────────────────────────────┘
```
Primär: Für die Orga ist „Allen Bescheid geben“ primär (unmittelbar nach dem Festlegen), für Mitglieder „Zum Kalender hinzufügen“.

Menü „⋯“ (Orga): «Festlegung aufheben» → Dialog «Termin wieder offen machen? Die Abstimmung wird wieder geöffnet, alle Stimmen bleiben erhalten. Bereits geteilte Termine musst du im Gruppenchat selbst korrigieren.» `[Abbrechen]` `[Termin aufheben]`.

## Desktop
Ergebnis-Karte als breiter Kopfbereich über Übersicht (max. 720 px), Aktionen nebeneinander.
