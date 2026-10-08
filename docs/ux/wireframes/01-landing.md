# W01 – Landing (`/de`, `/en`)

Features: F-046 (Sprache), Einstieg F-001/F-041 · Flow: [G](../user-flows.md#g-reise-anlegen--einladen-f-001-f-002), [F](../user-flows.md#f-sprachumschaltung-f-046)

Zweck: In 5 Sekunden verstehen, was die App tut, und sofort eine Reise anlegen können. Kein Login nötig, um anzufangen.

## Mobil (360 px)

```
┌────────────────────────────────────┐
│ [Logo] Wir wollen weg  ⊕English  Anmelden │  ← Header: Sprachlink in Zielsprache
├────────────────────────────────────┤
│                                    │
│  Vom Gruppenchat zum festen        │  h1 (max. 2 Zeilen à 28 Z.)
│  Reisetermin.                      │
│                                    │
│  Alle tragen ein, wann sie können. │
│  Wir finden die Zeiträume, in      │
│  denen alle Zeit haben.            │
│                                    │
│  ┌──────────────────────────────┐  │
│  │      Reise planen            │  │  primär → /trips/new
│  └──────────────────────────────┘  │
│  Kostenlos · ohne App · ohne       │
│  Passwort                          │
│                                    │
│  [ Hero-Illustration: Kalender     │  (Designer)
│    mit Heatmap-Ausschnitt ]        │
│                                    │
│  So geht's                         │  h2
│  ① Reise anlegen, Link in den      │
│    Gruppenchat                     │
│  ② Alle tippen ihre freien Tage    │
│  ③ Vorschläge ansehen, abstimmen,  │
│    fertig                          │
│                                    │
│  Eingeladen worden?                │
│  Öffne einfach den Link aus        │
│  deinem Gruppenchat.               │
│                                    │
├────────────────────────────────────┤
│ Hilfe · Datenschutz · Impressum    │  Footer
│ ⊕ English                          │
└────────────────────────────────────┘
```

## Desktop (≥ 1024 px)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [Logo] Wir wollen weg                              ⊕ English   Anmelden  │
├──────────────────────────────────────────────────────────────────────────┤
│  Vom Gruppenchat zum festen             │  [ Hero-Illustration            │
│  Reisetermin.                           │    Heatmap-Ausschnitt mit       │
│                                         │    hervorgehobenem Zeitraum ]   │
│  Alle tragen ein, wann sie können. …    │                                 │
│  [ Reise planen ]  Kostenlos · ohne App │                                 │
├──────────────────────────────────────────────────────────────────────────┤
│   ① Anlegen & teilen      ② Tage antippen       ③ Abstimmen & fix        │
├──────────────────────────────────────────────────────────────────────────┤
│ Hilfe · Datenschutz · Impressum · ⊕ English                              │
└──────────────────────────────────────────────────────────────────────────┘
```

## Verhalten
- Angemeldete Nutzer, die `/` aufrufen, landen auf `/trips` (W04); `/de` bzw. `/en` direkt bleibt erreichbar (Header zeigt dann Avatar).
- „Anmelden“ → `/login` (W02). „Reise planen“ → `/trips/new` (W05) ohne Login.
- Banner bei vorhandenem `pendingAuth` (Flow A.4 Regel 3): «Du warst gerade dabei, „Lissabon 2027“ beizutreten. [Weiter]».
- Landing ist die einzige indexierte App-Seite (+ Rechtstexte), `hreflang` de/en.
