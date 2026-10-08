# W07 – Reise: Tab „Übersicht“ (`/trips/{id}`)

Features: F-007, F-004, F-012 (Ergebnis-Karte), F-015, F-017, F-001 (Kopfdaten) · Flows: [J](../user-flows.md#j-reise-verlassen--mitglied-entfernen--rolle-übergeben--reise-löschen-f-004-f-013), [K](../user-flows.md#k-nachzügler-erinnern-f-015)

Diese Datei zeigt auch den **Reise-Rahmen** (Header + Tabs), der für W08–W11 gilt.

## Reise-Rahmen (mobil)

```
┌────────────────────────────────────┐
│ [Logo]                       (KM)  │  globaler Header (kann beim Scrollen
├────────────────────────────────────┤  nach unten ausblenden, s. ux-spec §2)
│ ←  Lissabon 2027               ⋯   │  sticky; ← = Meine Reisen; ⋯ = Reisemenü
│ Übersicht│Meine Tage│Gruppe│Abstimmen│  sticky Tabs (Links, aria-current)
└────────────────────────────────────┘
```
Reisemenü „⋯“ (Bottom-Sheet): Freunde einladen · Mein Name in dieser Reise · *(Orga:)* Reise bearbeiten · Gruppe erinnern · Festlegung aufheben · Reise löschen · Reise verlassen.

## Phase 1 „Tage sammeln“ (mobil, Sicht Orga)

```
│  Lissabon 2027                     │  h1 (voller Name)
│  1. Mai – 30. Juni 2027 · 4–5 N.   │
│  „Sonne, Pastéis, Surfen …“        │
│                                    │
│  ① Tage sammeln ─ ② Abstimmen ─ ③ Fix │  Phasen-Leiste (Text + Nummer, aktiv hervorgehoben)
│                                    │
│  ┌──────────────────────────────┐  │  „Nächster Schritt“-Karte (kontextabhängig)
│  │ Nächster Schritt             │  │
│  │ 5 von 7 haben ihre Tage      │  │
│  │ eingetragen.                 │  │
│  │ ▓▓▓▓▓▓▓▓▓▓░░░░               │  │  <progress>
│  │ Noch offen: Kemal, Sara      │  │
│  │ Frist: Fr., 14. Mai (in 3 T.)│  │  F-017, falls gesetzt
│  │ [ Erinnern ]  [Vorschläge]   │  │  Orga: Erinnern; Mitglied: nur Vorschläge
│  └──────────────────────────────┘  │
│                                    │
│  Wer ist dabei? (7 + 1 Platzhalter)│  h2
│  ┌──────────────────────────────┐  │
│  │ (LE) Lena  [Orga]  ✓ abgegeben│ │  Status mit Symbol + Text
│  │ (JO) Jonas         ✓ abgegeben│ │
│  │ (KE) Kemal         ○ noch offen│ │
│  │ (SA) Sara          ○ noch offen│ │
│  │ (TI) Tim  „Juli nur mit Kids“ │  │  Kommentar (gekürzt, tippbar)
│  │      ✓ abgegeben              │  │
│  │ ( ?) Mia (Platzhalter) fehlt  │  │  F-007
│  │      noch                     │  │
│  │ … Alle 8 anzeigen             │  │  ab 6 Einträgen einklappen
│  └──────────────────────────────┘  │
│  Orga: je Zeile [⋯] → Entfernen, Orga übergeben
│                                    │
│  [ + Freunde einladen ]            │  → /invite
```

Nächster-Schritt-Karte – Varianten:

| Situation | Inhalt | Aktion |
|---|---|---|
| eigene Tage fehlen | «Trag deine Tage ein – dauert 2 Minuten.» | `[Tage eintragen]` |
| Orga, alle abgegeben | «Alle haben abgegeben! Zeit für die Abstimmung.» | `[Abstimmung erstellen]` |
| Mitglied, abgegeben, Phase 1 | «Danke! Jetzt warten wir auf Kemal und Sara.» | `[Vorschläge ansehen]` |
| Phase 2, eigene Stimme fehlt | «Die Abstimmung läuft – stimm ab.» | `[Abstimmen]` |
| Phase 2, Orga | «4 von 7 haben abgestimmt.» + Frist | `[Erinnern]` `[Termin festlegen]` |
| Phase 3 | Ergebnis-Karte (s. W11) | `[Zum Kalender hinzufügen]` `[Allen Bescheid geben]` |

## Desktop (≥ 960 px)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [Logo]                                                           (KM) ▾ │
├─────────────────────────────────────────────────────────────────────────┤
│ ← Meine Reisen   Lissabon 2027                                     ⋯    │
│ Übersicht   Meine Tage   Gruppe   Abstimmen                              │
├───────────────────────────────────────────────┬─────────────────────────┤
│ Lissabon 2027                                 │ Wer ist dabei? (7 + 1)  │
│ 1. Mai – 30. Juni 2027 · 4–5 Nächte           │ Lena [Orga] ✓           │
│ ① Tage sammeln ─ ② Abstimmen ─ ③ Fix          │ Jonas ✓                 │
│ ┌───────────────────────────────────────────┐ │ Kemal ○ noch offen      │
│ │ Nächster Schritt: 5 von 7 …  [Erinnern]   │ │ …                       │
│ └───────────────────────────────────────────┘ │ [+ Freunde einladen]    │
└───────────────────────────────────────────────┴─────────────────────────┘
```
