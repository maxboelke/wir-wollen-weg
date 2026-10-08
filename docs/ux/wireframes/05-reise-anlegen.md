# W05 – Neue Reise planen (`/trips/new`)

Features: F-001, F-016 (Feiertagsregion), F-017 (Frist), F-040/F-041 (Auth am Ende) · Flow: [G](../user-flows.md#g-reise-anlegen--einladen-f-001-f-002) · Validierung: [ux-spec §5.2](../ux-spec.md)

## Mobil (360 px)

```
┌────────────────────────────────────┐
│ ← Zurück                     (KM)  │
├────────────────────────────────────┤
│  Neue Reise planen                 │  h1
│                                    │
│  Wie heißt eure Reise?             │
│  ┌──────────────────────────────┐  │
│  │ z. B. Lissabon 2027          │  │  Platzhalter = Beispiel
│  └──────────────────────────────┘  │
│                                    │
│  In welchem Zeitraum sucht ihr?    │
│  [Nächste 3 Mon.] [6 Mon.] [Sommer]│  Chips setzen Von/Bis
│  Von               Bis             │
│  ┌─────────────┐  ┌─────────────┐  │  native date inputs
│  │ 01.05.2027  │  │ 30.06.2027  │  │
│  └─────────────┘  └─────────────┘  │
│  Sa., 1. Mai – Mi., 30. Juni 2027  │  Klartext im App-Format
│                                    │
│  Wie lang soll die Reise sein?     │
│  mindestens                        │
│  [ − ]   4 Nächte   [ + ]          │  Stepper
│  = 5 Tage inkl. An- und Abreise    │
│  am liebsten (optional)            │
│  [ − ]   5 Nächte   [ + ]          │
│                                    │
│  ▸ Mehr Optionen                   │  Disclosure
│  ┊ Beschreibung (optional)         │
│  ┊ [                          ]    │  ≤ 500, Zähler ab 400
│  ┊ Feiertage der Reise             │
│  ┊ [Deutschland – Bayern     ▾]    │  Standard: eigene Region
│  ┊ Frist zum Eintragen (optional)  │
│  ┊ [            ] · in 1 Woche     │  F-017
│                                    │
│  [        Reise anlegen         ]  │  primär
└────────────────────────────────────┘
```

## Nicht angemeldet – nach „Reise anlegen“

```
│ ┌────────────────────────────────┐ │
│ │ Lissabon 2027                  │ │  Zusammenfassung des Formulars
│ │ 1. Mai – 30. Juni · 4–5 Nächte │ │
│ │ Bearbeiten                     │ │
│ └────────────────────────────────┘ │
│  Fast fertig – mit welcher E-Mail  │
│  willst du planen?                 │
│  E-Mail [                      ]   │
│  [         Code senden         ]   │  → Code → (neu: Name) → anlegen → W06
```

## Desktop
Einspaltiges Formular, max. 560 px, zentriert. Von/Bis nebeneinander, Stepper nebeneinander. Rechts (≥ 1024 px) optional Live-Vorschau der Einladungskarte («So sieht deine Einladung aus») – Nice-to-have, nicht MVP-kritisch.

## Fehler (Beispiele)
```
│  Bis                               │
│  ┌─────────────┐                   │  roter Rahmen
│  │ 03.05.2027  │                   │
│  └─────────────┘                   │
│  ⚠ Für 4 Nächte braucht der        │
│    Zeitraum mindestens 5 Tage.     │
```
