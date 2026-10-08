# W01 – Landing (`/de`, `/en`)

Features: F-046 (Sprache), Einstieg F-001/F-041 · Flow: [G](../user-flows.md#g-reise-anlegen--einladen-f-001-f-002), [F](../user-flows.md#f-sprachumschaltung-f-046)

Zweck: In 5 Sekunden verstehen, was die App tut, und sofort eine Reise anlegen können. Kein Login nötig, um anzufangen.

## Mobil (360 px)

```
┌────────────────────────────────────┐
│ [Logo] Wir wollen weg  ⊕English  Anmelden │  ← Header: Sprachlink in Zielsprache
├────────────────────────────────────┤
│      [hero.svg, max. 160 px hoch]  │  dekorativ, alt=""; ÜBER der Headline (U-12)
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

## Desktop (≥ 960 px)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [Logo] Wir wollen weg                              ⊕ English   Anmelden  │
├──────────────────────────────────────────────────────────────────────────┤
│  Vom Gruppenchat zum festen             │  [ hero.svg, 240–320 px breit,  │
│  Reisetermin.                           │    rechts neben der Headline,   │
│                                         │    vertikal zentriert ]         │
│  Alle tragen ein, wann sie können. …    │                                 │
│  [ Reise planen ]  Kostenlos · ohne App │                                 │
├──────────────────────────────────────────────────────────────────────────┤
│   ① Anlegen & teilen      ② Tage antippen       ③ Abstimmen & fix        │
├──────────────────────────────────────────────────────────────────────────┤
│ Hilfe · Datenschutz · Impressum · ⊕ English                              │
└──────────────────────────────────────────────────────────────────────────┘
```

**Hero-Platzierung (U-12):** mobil zentriert **über** der Headline, max. 160 px hoch – Rechnung 360 × 640 (sichtbar ≈ 560 px nach Browserleisten): Header 56 + Hero 160 + h1 2 Zeilen ≈ 72 + Unterzeile ≈ 72 + CTA 56 + Abstände ≈ 80 = ≈ 496 px → „Reise planen“ ohne Scrollen sichtbar. Bei großer Schrift darf gescrollt werden; die Illustration schrumpft nicht unter 120 px, sondern rückt unter den CTA, sobald die Root-Schrift ≥ 20 px ist (Hauptaktion zuerst). Ab 600 px zweispaltig (Text links, Illustration rechts).

Untertitel: DE optional „Gemeinsam den Urlaubstermin finden“, EN „Find dates for your group trip“ (Marke bleibt „Wir wollen weg“ – *CEO-Entscheidung 2026-10-08, vorbehaltlich Auftraggeber*).

## Verhalten
- Angemeldete Nutzer, die `/` aufrufen, landen auf `/trips` (W04); `/de` bzw. `/en` direkt bleibt erreichbar (Header zeigt dann Avatar).
- „Anmelden“ → `/login` (W02). „Reise planen“ → `/trips/new` (W05) ohne Login.
- Banner bei vorhandenem `pendingAuth` (Flow A.4 Regel 3): «Du warst gerade dabei, „Lissabon 2027“ beizutreten. [Weiter]».
- Landing ist die einzige indexierte App-Seite (+ Rechtstexte), `hreflang` de/en.
