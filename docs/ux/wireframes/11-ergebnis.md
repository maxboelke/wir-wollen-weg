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

## Richtung B (Q18) – Ergebnis mit Vorfreude-Ring und Feier (maßgeblich ab Look & Feel 2.0)

Regeln: [ux-spec §4.2, §6, §7.5](../ux-spec.md); Entscheidungen M-U2, M-U6, M-U10, Q17 in [abstimmung-design §8.2, §9](../abstimmung-design.md).
```
┌────────────────────────────────────┐
│▓(←)  Lissabon 2027             (⋯)▓│  kompakter Kopf (sticky)
│▓     ● Steht fest · 7 dabei       ▓│
│▓(Übersicht)(Meine Tage)(Gruppe)(Ab│
│▓          ╭──────────╮            ▓│  Vorfreude-Ring + Countdown: dekorativ,
│▓          │   noch   │            ▓│  aria-hidden, scrollt mit
│▓          │    23    │            ▓│  Zahl steht sofort (kein Hochzählen)
│▓          │   Tage   │            ▓│
│▓          ╰──────────╯            ▓│
│ ┌────────────────────────────────┐ │
│ │ ✓ Termin steht fest            │ │
│ │ Es geht los!                   │ │  h1 (tabindex=-1, aria-describedby → Datum)
│ │ Mi., 5. Mai – Mo., 10. Mai 2027│ │
│ │ ☾ 5 Nächte · ⚇ 7 dabei ·       │ │  Countdown ALS TEXT (D-24)
│ │ noch 23 Tage                   │ │
│ │ [ Zum Kalender hinzufügen ▾ ]  │ │  Mitglied: primär · Orga direkt nach Festlegen: sekundär
│ │ [ Allen Bescheid geben       ] │ │  Orga direkt nach Festlegen: primär (D-30)
│ └────────────────────────────────┘ │
│ (✓ Tage)(✓ Abstimmen)(☀ Steht fest)│  Fortschritt, aria-current="step"
│ Wer ist dabei? (7) …               │
```
**Countdown-Texte:** «noch 23 Tage» · «noch 1 Tag» · «Heute geht's los!» · während der Reise «Gute Reise!» (EN «23 days to go» · «1 day to go» · «It's today!» · «Have a great trip!»). Danach Phase „Vergangen“.

**Feier (F-012, Q17 b):**
| Wer | Wann | Fokus | Wie oft |
|---|---|---|---|
| Orga | sofort nach `[Termin festlegen]` | **sofort** auf h1 «Es geht los!» (Sheet zu) | einmal je Festlegung |
| Mitglied | erstes Öffnen der **Übersicht** nach der Festlegung; anderer Tab direkt geöffnet → Banner «Der Termin steht fest! [Ansehen]» → Übersicht | kein Fokus-Sprung (normaler Seitenaufruf) | einmal pro Person und Festlegung, serverseitig gemerkt (geräteübergreifend), gesetzt beim sichtbaren Start |
| Beitritt in Phase 3 | erstes Öffnen nach Beitritt | wie Mitglied | einmal |
- Ablauf: Kern ≤ 1 s, Konfetti-Ausklang ≤ 2,6 s, Text und Tasten ab ≤ 300 ms bedienbar; Tipp/Scroll/Taste/`visibilitychange` beendet; Konfetti `aria-hidden`, `pointer-events: none`.
- Vibration (Android, best effort) beim Schließen des Rings; aus bei reduzierter Bewegung; kein Ton.
- Reduziert (Gerät oder Konto-Schalter): kein Konfetti, keine Skalierung; Karte blendet ≤ 140 ms ein. „Es geht los!“ trägt den Moment.
- Spätere Besuche: alles statisch. Festlegung mit **anderem** Zeitraum → Feier erneut.

## Ergebnis – Übersicht Phase 3 (alle, mobil)

```
┌────────────────────────────────────┐
│ ←  Lissabon 2027               ⋯   │
│ Übersicht│Meine Tage│Gruppe│Abstimmen│
├────────────────────────────────────┤
│ ┌────────────────────────────────┐ │
│ │ [vote-done.svg]                │ │  Erfolgsmotiv, dekorativ
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
