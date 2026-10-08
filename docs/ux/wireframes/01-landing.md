# W01 – Landing (`/de`, `/en`)

Features: F-046 (Sprache), Einstieg F-001/F-041 · Flow: [G](../user-flows.md#g-reise-anlegen--einladen-f-001-f-002), [F](../user-flows.md#f-sprachumschaltung-f-046)

Zweck: In 5 Sekunden verstehen, was die App tut, und sofort eine Reise anlegen können. Kein Login nötig, um anzufangen.

## Richtung B „Reise-Cockpit“ (Q18) – maßgeblich ab Look & Feel 2.0

Entscheidungen: [abstimmung-design §8.1](../abstimmung-design.md) (B-7, B-7a, Landing-Kopf, M-U4). Die Skizzen „Mobil“/„Desktop“ weiter unten gelten für Inhalte und Reihenfolge, die Anordnung folgt diesem Abschnitt.

```
Mobil 360 px                                   Mobil ≥ ca. 376 px (z. B. 390)
┌────────────────────────────────────┐         … Kopf/Cockpit gleich …
│▓[Logo] Wir wollen weg ⊕English [→]▓│  Kopf im Indigo-Cockpit; < 375 px
│▓                                  ▓│  „Anmelden“ = Icon-Taste 44 px
│▓ Vom Gruppenchat zum festen       ▓│  h1 Display
│▓ Reisetermin.                     ▓│
│▓ Alle tragen ein, wann sie können.▓│  Lead
│▓ Wir finden die Zeiträume, in     ▓│
│▓ denen alle Zeit haben.           ▓│
│▓ ┌──────────────────────────────┐ ▓│
│▓ │      Reise planen  →         │ ▓│  primär (Minze auf Indigo)
│▓ └──────────────────────────────┘ ▓│
│▓ Kostenlos · ohne App · ohne Pass-▓│
│▓ wort                             ▓│  ← CTA bei 360 × 640 ohne Scrollen sichtbar
│▓ ┌──────────────────────────────┐ ▓│
│  │ [hero-cockpit-karte, ragt    │  │  Hero UNTER dem CTA (ersetzt U-12),
│  │  ≈ 100 px in den hellen Teil]│  │  dekorativ, alt=""
│  └──────────────────────────────┘  │
│ So geht's                          │  h2
│ ┌──┐ 1 · Reise anlegen             │  < 21,5 em Container: LISTE         ┌────────┬────────┬────────┐
│ └──┘                               │  (Kachel-Icon links, Text rechts)   │[▣]     │[▣]     │[▣]     │
│ ┌──┐ 2 · Alle tippen ihre freien   │                                     │1 · Rei-│2 · Alle│3 · Ter-│
│ └──┘     Tage                      │                                     │se anle-│tippen …│min wäh-│
│ ┌──┐ 3 · Termin wählen             │                                     │gen     │        │len     │
│ └──┘                               │                                     └────────┴────────┴────────┘
│ Eingeladen worden? Öffne einfach   │                                     ≥ 21,5 em: drei Kacheln
│ den Link aus deinem Gruppenchat.   │
│ [ Reise planen ]                   │  Wiederholung am Ende (M-U4), statt Sticky-CTA
├────────────────────────────────────┤
│ Hilfe · Datenschutz · Impressum    │
│ Deutsch | English                  │
└────────────────────────────────────┘
```

- **„So geht's“-Umbruch (B-7):** Container-Query in `em`, **eine Regel für DE und EN**: `@container (min-width: 21.5em)` → 3 Spalten, sonst Liste. 360 px → Liste; 390 px → Kacheln; bei größerer Systemschrift früher Liste. Titel max. 3 Zeilen, `hyphens: auto`. Texte EN: «1 · Create a trip» · «2 · Everyone adds their dates» · «3 · Pick the dates».
- **Kopf < 375 px:** Bildmarke + Wortmarke + Sprachlink als Text; „Anmelden“/„Sign in“ als Icon-Taste (44 × 44, `aria-label`, Tooltip). ≥ 375 px: „Anmelden“ als Text.
- **Kein Sticky-CTA (M-U4):** Wiederholung `[Reise planen]` am Seitenende (gleiche Beschriftung, gleiches Ziel). Sekundär gestaltet, damit „eine Hauptaktion pro Bildschirm“ gilt.
- Hero-Bewegung (Motion W01-01) läuft nur in der Illustration; Headline und CTA stehen sofort.

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

**Hero-Platzierung (U-12; in Richtung B ersetzt durch B-7a – Hero unter dem CTA, s. oben):** mobil zentriert **über** der Headline, max. 160 px hoch – Rechnung 360 × 640 (sichtbar ≈ 560 px nach Browserleisten): Header 56 + Hero 160 + h1 2 Zeilen ≈ 72 + Unterzeile ≈ 72 + CTA 56 + Abstände ≈ 80 = ≈ 496 px → „Reise planen“ ohne Scrollen sichtbar. Bei großer Schrift darf gescrollt werden; die Illustration schrumpft nicht unter 120 px, sondern rückt unter den CTA, sobald die Root-Schrift ≥ 20 px ist (Hauptaktion zuerst). Ab 600 px zweispaltig (Text links, Illustration rechts).

Produktname je Sprache (*bestätigt (Auftraggeber 2026-10-08)*): DE-Landing `/de` zeigt „Wir wollen weg“, EN-Landing `/en` zeigt **„When do we go?“** – in Header-Wortmarke, `<title>` und Footer; Bildmarke (Logo A) identisch. Untertitel: DE optional „Gemeinsam den Urlaubstermin finden“, EN „Find dates for your group trip“. Schreibregeln: [ux-spec §10.6](../ux-spec.md).

EN-Header mobil (gleiche Länge, 14 Zeichen):
```
│ [Logo] When do we go?  ⊕Deutsch  Sign in │
```
- `<title>`: «Wir wollen weg – Gemeinsam den Urlaubstermin finden» / «When do we go? Find dates for your group trip» (die Frage im Namen, der Untertitel als Antwort – kein zusätzliches Satzzeichen).
- EN-h1 darf den Namen nicht wiederholen (Wortmarke steht darüber); Headline bleibt nutzenorientiert. Falls der Name doch in einen Satz soll: ans Satzende, nichts danach (ux-spec §10.6).

## Verhalten
- Angemeldete Nutzer, die `/` aufrufen, landen auf `/trips` (W04); `/de` bzw. `/en` direkt bleibt erreichbar (Header zeigt dann Avatar).
- „Anmelden“ → `/login` (W02). „Reise planen“ → `/trips/new` (W05) ohne Login.
- Banner bei vorhandenem `pendingAuth` (Flow A.4 Regel 3): «Du warst gerade dabei, „Lissabon 2027“ beizutreten. [Weiter]».
- Landing ist die einzige indexierte App-Seite (+ Rechtstexte), `hreflang` de/en.
