# W03 – Einladung & Beitritt (`/i/{inviteToken}`)

Features: F-002, F-003, F-007, F-040, F-041, F-046 · Flow: [A](../user-flows.md#a-einladung--vorschau--registrierung-per-code--beitritt--verfügbarkeit-f-002-f-003-f-040-f-041-f-007) (alle Zustände, Fehlerfälle, In-App-Browser)

**Wichtigste Seite des Produkts** (Beitrittsquote ≥ 65 %). Alle Schritte sind Zustände derselben URL; die Reise-Karte bleibt oben immer sichtbar.

**Produktname:** Skizzen zeigen DE. Auf EN steht in der Wortmarke „When do we go?“ (Umschalter dann „⊕ Deutsch“). Der Name folgt der **Oberflächensprache des Gastes**, nicht der Sprache des Teilen-Textes: Ein EN-Gast, der „Wir wollen weg: Lissabon 2027! …“ bekommen hat, sieht nach dem Umschalten „When do we go?“ – die gleiche Bildmarke und die Reise-Karte (Reisename, „Lena lädt dich ein“) halten den Zusammenhang. `<title>`: «Lissabon 2027 · Wir wollen weg» / «Lisbon 2027 · When do we go?».

## Z1 – Vorschau, nicht angemeldet (mobil 360 px)

```
┌────────────────────────────────────┐
│ [Logo] Wir wollen weg   ⊕ English  │  Sprachlink sichtbar (EN-Gäste in DE-Gruppe)
├────────────────────────────────────┤
│  Lena lädt dich ein                │  Kleintext über h1
│  ┌──────────────────────────────┐  │
│  │ [invite.svg]                 │  │  dekorativ, alt="", max. 160 px hoch
│  │                              │  │
│  │ Lissabon 2027                │  │  h1 = Reisename (bis 2 Zeilen)
│  │                              │  │
│  │ [Kal] Irgendwann zwischen        │  │
│  │    1. Mai und 30. Juni 2027  │  │
│  │ ☾ 4–5 Nächte                 │  │
│  │ [Pers] 7 sind schon dabei         │  │
│  │                              │  │
│  │ „Sonne, Pastéis, Surfen.     │  │  Beschreibung (optional)
│  │  Wer ist dabei?“             │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │          Mitmachen           │  │  primär, im Daumenbereich
│  └──────────────────────────────┘  │
│  Dauert 2 Minuten. Kostenlos, ohne │
│  App und ohne Passwort.            │
│                                    │
│  Schon ein Konto? Einfach auf      │
│  „Mitmachen“ tippen.               │
└────────────────────────────────────┘
```
(Icons in der Skizze sind Platzhalter; Designer liefert Icon-Set.)

## Z2 – E-Mail (Formular klappt unter der Karte auf, Karte kompakt)

```
┌────────────────────────────────────┐
│ [Logo]                  ⊕ English  │
├────────────────────────────────────┤
│ ┌────────────────────────────────┐ │  Kontext-Karte kompakt (1 Zeile Meta)
│ │ Lissabon 2027                  │ │
│ │ Lena lädt dich ein · 4–5 N.    │ │
│ └────────────────────────────────┘ │
│                                    │
│  Mit deiner E-Mail bist du in      │  h2
│  Sekunden dabei.                   │
│                                    │
│  E-Mail                            │
│  ┌──────────────────────────────┐  │  Fokus + Tastatur offen
│  │                              │  │
│  └──────────────────────────────┘  │
│  Wir schicken dir einen Code.      │
│  Kein Passwort nötig.              │
│                                    │
│  [         Code senden         ]   │
│  Mit Passwort anmelden             │
│                                    │
│  Mit dem Fortfahren akzeptierst du │
│  die Nutzungsbedingungen und den   │
│  Datenschutzhinweis.               │
└────────────────────────────────────┘
```

## Z3 – Code
Komponente aus [W02 Schritt 2](02-anmelden.md#schritt-2--code-mobil) unter der kompakten Kontext-Karte. Zusätzlich:
- Wiederhergestellt aus `pendingAuth`: Infozeile «Willkommen zurück – gib einfach den Code aus der Mail ein.»
- «Du hast auf den Link in der Mail getippt? Dann geht es im anderen Browser weiter. Hier kannst du stattdessen den Code eingeben.»

## Z4a – Name & Beitritt (neues Konto)

```
│ ┌────────────────────────────────┐ │
│ │ Lissabon 2027 · Lena lädt ein  │ │
│ └────────────────────────────────┘ │
│  Fast geschafft!                   │
│  Wie sollen dich die anderen       │
│  nennen?                           │
│  Dein Name                         │
│  ┌──────────────────────────────┐  │  bei Platzhalter-Link vorbelegt
│  │ Kemal                        │  │
│  └──────────────────────────────┘  │
│  ℹ Es gibt schon einen Kemal.      │  nur bei Dublette
│    Wie wäre es mit „Kemal B.“?     │
│    [Übernehmen]                    │
│                                    │
│  [           Beitreten          ]  │
│  Du bleibst auf diesem Gerät       │
│  angemeldet. Ändern                │
```

## Z4b – Bestätigen (bestehendes Konto / bereits angemeldet)

```
│ ┌────────────────────────────────┐ │
│ │ Lissabon 2027 (volle Vorschau) │ │
│ └────────────────────────────────┘ │
│  Angemeldet als Lena               │  nur wenn vor Aufruf schon angemeldet
│  (lena@beispiel.de) · Nicht du?    │  → Abmelden, bleibt auf /i/{token}
│                                    │
│  Du trittst als Kemal bei.         │
│  Name für diese Reise ändern       │  klappt Namensfeld auf
│                                    │
│  [           Beitreten          ]  │
```

## Z5 – Nach Beitritt → Reise, Tab „Meine Tage“ (W08) mit Willkommens-Hinweis

```
│ ┌────────────────────────────────┐ │
│ │ ✓ Du bist dabei!               │ │  schließbar, einmalig
│ │ Tippe die Tage an, an denen du │ │
│ │ NICHT kannst. Alles andere     │ │
│ │ zählt als „geht“.        [×]   │ │
│ └────────────────────────────────┘ │
```

## Sonderzustände (Texte: Flow A.3)

```
Reise voll / Beitritt gesperrt          Link ungültig (→ auch W14)
┌──────────────────────────────┐        ┌──────────────────────────────┐
│ Lissabon 2027 (Vorschau)     │        │ [error.svg]                  │
│ ┌──────────────────────────┐ │        │ Dieser Einladungslink        │
│ │ ⓘ Diese Reise ist voll   │ │        │ funktioniert nicht mehr.     │
│ │ (30 von 30). Frag Lena,  │ │        │ Vielleicht wurde er erneuert.│
│ │ ob sie Platz machen kann.│ │        │ Frag im Gruppenchat nach dem │
│ └──────────────────────────┘ │        │ aktuellen Link.              │
│ Eigene Reise planen          │        │ [Meine Reisen] / [Eigene     │
└──────────────────────────────┘        │  Reise planen]               │
                                        └──────────────────────────────┘
```

Phase 2/3: Hinweiszeile in der Vorschau-Karte («Die Abstimmung läuft schon – du kannst noch mitmachen.» / «Der Termin steht schon: 5.–10. Mai.»), CTA bleibt.

## Desktop (≥ 960 px)

```
┌───────────────────────────────────────────────────────────────────────┐
│ [Logo] Wir wollen weg                                     ⊕ English   │
├───────────────────────────────────────────────────────────────────────┤
│   ┌───────────────────────────────┐   ┌───────────────────────────┐   │
│   │ Lena lädt dich ein            │   │ Mitmachen                 │   │
│   │ Lissabon 2027                 │   │ E-Mail [               ]  │   │
│   │ 1. Mai – 30. Juni 2027        │   │ [Code senden]             │   │
│   │ 4–5 Nächte · 7 dabei          │   │ Mit Passwort anmelden     │   │
│   │ „Sonne, Pastéis, Surfen …“    │   │                           │   │
│   └───────────────────────────────┘   └───────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────┘
```
Auf Desktop ist das E-Mail-Feld direkt sichtbar (genug Platz, ein Klick weniger); mobil erst nach „Mitmachen“ (Vorschau soll zuerst wirken, Tastatur soll die Karte nicht sofort verdecken).
