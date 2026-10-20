# W17 – Unterkunft vorschlagen

Stand: 2026-10-20 · UI/UX · Status: Entwurf (Ausbaustufe R, Inkrement 9) · Feature **F-031** (Stufe 1), Q34 · Route `/trips/{id}/stays/new`
Prototyp: [`../mockups/reise-managen/index.html#/stay/new`](../mockups/reise-managen/index.html) · Einstieg: W18 Kopf-Taste `[+ Vorschlagen]`

## Ablauf (Flow R-1)
1. Mitglied tippt in W18 `[+ Vorschlagen]` (Kopf rechts, sichtbar solange keine Unterkunft festgelegt ist; max. 30 Vorschläge – danach Taste `aria-disabled` + «Maximal 30 Vorschläge pro Reise»).
2. Link einfügen → Server lädt Vorschau (best effort, ≤ 5 s). Währenddessen Ladezeile, **Formular bleibt bedienbar**.
3. Vorschau da → Karte mit Bild (über unseren Bild-Proxy) + Domain; **Titel wird vorbelegt**. Keine Vorschau (Portal blockt, Zeitlimit) → **Platzhalterkarte** «Keine Vorschau – das Portal lässt keinen Abruf zu. Kein Problem: Gib unten einen Titel ein, der Link funktioniert trotzdem.», Fokus springt ins leere Titel-Feld.
4. Optional Gesamtpreis (live «≈ 307 € pro Person (6 Reisende inkl. Platzhalter Mia)») und Notiz.
5. `[Vorschlag hinzufügen]` → zurück zu W18, Snackbar «Vorschlag hinzugefügt – er liegt jetzt im Swipe-Stapel.»; der neue Vorschlag ist auch im **eigenen** Stapel (alle bewerten alles).

## Wireframe mobil
```
┌────────────────────────────────────┐
│▓(←)  Kroatien 2027                ▓│  kompakter Kopf, Zurück → W18
│▓     Unterkunft vorschlagen       ▓│  h1
╰▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╯
│ Füge den Link aus Booking, Airbnb  │
│ & Co. ein – Titel und Bild holen   │
│ wir automatisch, wenn das Portal   │
│ es zulässt.                        │
│ Link zur Unterkunft                │
│ [https://…                       ] │  type=url, inputmode=url
│ ┌────────────────────────────────┐ │  Vorschau (aria-live=polite)
│ │ ░░░░░ Bild (Proxy) ░░░░░░░░░░░ │ │
│ │ [Vorschau · booking.com]       │ │
│ │ Haus Galeb – Meerblick …       │ │
│ │ Titel übernommen – du kannst   │ │
│ │ ihn unten ändern.              │ │
│ └────────────────────────────────┘ │
│ Titel                              │
│ [Haus Galeb – Meerblick & Terrasse]│
│ Gesamtpreis (optional)             │
│ [1.840                        € ]  │  inputmode=decimal
│ ≈ 307 € pro Person (6 Reisende …)  │  Live-Hilfe
│ Notiz (optional)                   │
│ [                                ] │
│ Alle in der Reise können das lesen.│        0/200
├────────────────────────────────────┤
│ [      Vorschlag hinzufügen      ] │  fixierte Aktionsleiste
│ Danach landet er bei allen im      │
│ Swipe-Stapel – auch bei dir.       │
└────────────────────────────────────┘
```

## Felder & Validierung (ux-spec §5)
| Feld | Regel | Fehlermeldung (inline, Icon + Text, `aria-invalid`) |
|---|---|---|
| Link | Pflicht, `https://`, gültige Domain | «Bitte füge einen Link ein.» / «Bitte einen vollständigen Link mit https:// einfügen.» |
| Titel | Pflicht, ≤ 80 Zeichen, vorbelegt aus Vorschau | «Bitte gib einen Titel ein.» |
| Gesamtpreis | optional, > 0, max. 2 Nachkommastellen, Währung der Reise | «Bitte einen Betrag wie 1.840 oder 1840,50 eingeben.» |
| Notiz | optional, ≤ 200, Zähler | – |
Validierung beim Absenden; danach live je Feld. Fokus auf das erste fehlerhafte Feld. Link prüfen auch bei `paste`/`change` (Vorschau starten).

## Zustände
- **Vorschau lädt:** Spinner + «Lade Vorschau von booking.com …» (erst nach 300 ms sichtbar). Absenden ist erlaubt – dann wird der Vorschlag ohne Bild gespeichert und das Bild später nachgeladen.
- **Vorschau fehlgeschlagen / blockiert:** Platzhalterkarte (gestreiftes Feld + Bett-Icon + Domain), nie Fehlerrot – das ist ein normaler Fall.
- **Doppelter Link:** Hinweis (Amber) «Diese Unterkunft hat Kemal schon vorgeschlagen.» + Text-Taste «Ansehen» – Absenden bleibt möglich? → **Nein**, Taste deaktiviert mit diesem Grund.
- **Unterkunft bereits festgelegt:** Route leitet auf W18 um, Snackbar «Die Unterkunft steht schon fest.»
- **Ungespeicherte Eingaben** beim Zurück: Bestätigung «Vorschlag verwerfen?» (ux-spec §3).

## Datenschutz/Technik (aus F-031, Q34)
Bilder nie direkt vom Portal in den Browser, sondern über den Bild-Proxy (kurzer Cache ≤ 7 Tage); Domain sichtbar auf jeder Karte; Link öffnet in neuem Tab mit `rel="noopener noreferrer"` + sichtbarem «↗» und sr-only «(öffnet neuen Tab)». Eigene Screenshots erst Stufe 2 (Inkrement 12).

## Desktop
Formular `content-narrow` 640 px, Vorschau-Karte rechts neben den Feldern ab 960 px (Raster 1fr 280 px).
