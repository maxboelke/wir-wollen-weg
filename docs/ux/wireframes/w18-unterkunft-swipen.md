# W18 – Unterkünfte: Liste, Swipen, Rangliste, Festlegen

Stand: 2026-10-20 · UI/UX · Status: Entwurf (Ausbaustufe R, Inkrement 9) · Feature **F-031**, Q33, Q34 · Routen `/trips/{id}/stays`, `/trips/{id}/stays/swipe`
Prototyp: [`#/stay`](../mockups/reise-managen/index.html) und [`#/stay/swipe`](../mockups/reise-managen/index.html) – Swipe mit Maus/Finger, Tasten ← / →, Strg+Z.

## Grundregeln
- **Rangliste erst nach eigenem Swipen** (Q33, analog Q13 a): Ein Mitglied sieht Likes anderer und das Ranking erst, wenn es **alle aktuellen** Vorschläge bewertet hat. Kommt ein neuer Vorschlag dazu, wird das Ranking wieder gesperrt, bis man auch ihn bewertet hat («1 neue Unterkunft – bewerte sie, um das Ranking wieder zu sehen»). Serverseitig durchgesetzt.
- **Orga sieht immer alles** und **legt fest** («Das wird's»). „Bucht“ (F-056) und Orga markieren «gebucht ✓».
- Bewertung zweistufig: **♥ Gefällt mir** / **✕ Eher nicht** (neutral, nie Rot). Eigene Bewertung bleibt in der Liste änderbar (♥/✕ erneut tippen = zurück auf „offen“).

## A. Bereich „Unterkünfte“ – Mitglied, noch nicht fertig geswipt
```
┌────────────────────────────────────┐
│▓(←) Kroatien 2027   [+ Vorschlagen]▓│
│▓    Unterkünfte                    ▓│  h1
╰▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╯
│ ┌────────────────────────────────┐ │
│ │ (♥) 3 Unterkünfte warten auf   │ │
│ │     dich                       │ │
│ │     Du hast 2 von 5 bewertet.  │ │
│ │ ▓▓▓▓▓▓░░░░░░░░                 │ │
│ │ [      Jetzt swipen (3)      ] │ │  Hauptaktion
│ └────────────────────────────────┘ │
│ Rangliste                          │  h2
│ ┌────────────────────────────────┐ │
│ │ 🔒 Swipe alle durch, um das    │ │  gesperrt – KEINE Platzhalter-Balken/Zahlen
│ │ Ranking zu sehen.              │ │
│ │ So bewertet jede:r unbeein-    │ │
│ │ flusst. Noch 3 offen.          │ │
│ └────────────────────────────────┘ │
│ Alle Vorschläge (5)                │  h2 – neutrale Reihenfolge (Eingang), ohne Zahlen
│ ┌────────────────────────────────┐ │
│ │[▨] Villa Mare mit Pool  [✕][♥]│ │  ♥ gedrückt (aria-pressed=true)
│ │    booking.com · von Lena      │ │
│ │    ≈ 397 € p. P.               │ │
│ │[▨] Apartment Lavanda    [✕][♥]│ │  ✕ gedrückt
│ │[░] Kamena Kuća – Stein… [✕][♥]│ │  Platzhalterbild (airbnb blockt)
│ │ …                              │ │
│ └────────────────────────────────┘ │
│ Tippe ♥ oder ✕, um deine Bewertung │
│ zu ändern. Bilder kommen über      │
│ unseren Server.                    │
└────────────────────────────────────┘
```
Leer (noch kein Vorschlag): Illustration + «Noch keine Unterkünfte. Schlag die erste vor – ein Link reicht.» + Primär `[Unterkunft vorschlagen]`.

## B. Swipen (`/stays/swipe`)
```
┌────────────────────────────────────┐
│▓(←) Kroatien 2027                 ▓│
│▓    Unterkünfte bewerten          ▓│
╰▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╯
│ Unterkunft 3 von 5          3 offen│  Zähler (Text)
│ ┌────────────────────────────────┐ │  oberste Karte; nächste Karte dahinter (95 %, versetzt)
│ │ [♥ Gefällt mir]   [✕ Eher nicht]│ │  Stempel erscheinen beim Ziehen (Icon + Text)
│ │ ░░░░░░░░ Bild ░░░░░░░░░░░░░░░░ │ │
│ │ [Vorschau · airbnb.de]          │ │
│ │ Kamena Kuća – Steinhaus        │ │  h2
│ │ ⌖ Bol, Brač                    │ │
│ │ 2.050 € gesamt · ≈ 342 € p. P. │ │
│ │ „5 Min. zum Zlatni Rat“ – Sara │ │
│ │ Auf airbnb.de ansehen ↗        │ │  Text-Taste, startet KEINEN Swipe
│ └────────────────────────────────┘ │
│     (✕)        (↶)        (♥)      │  64 px · 48 px · 64 px, Label darunter
│  Eher nicht   Zurück   Gefällt mir │
│ Wischen oder tippen · Tastatur:    │
│ ← eher nicht · → gefällt mir       │
└────────────────────────────────────┘
```
**Geste:** horizontal ziehen; Karte folgt dem Finger (leichte Rotation dx/18°), Stempel blendet mit der Distanz ein. Auslösen bei > 30 % Kartenbreite **oder** Geschwindigkeit > 0,6 px/ms; sonst federt die Karte zurück (`spring-soft`, `slow`). Vertikales Scrollen bleibt möglich (`touch-action: pan-y`). **Gleichwertige Tasten** ✕/♥ (SC 2.5.7) und Tastatur ←/→; Rückgängig (letzter Swipe dieser Sitzung) per Taste und Strg/Cmd+Z.
**Rückmeldung:** Live-Region (polite) «Kamena Kuća: Gefällt mir. Noch 2 offen.»; reduzierte Bewegung → Karte blendet aus (140 ms), keine Flugbahn.
**Ende des Stapels:** Siegel (pop, `spring-bouncy`) + h2 «Geschafft!» + «Du hast alle 5 Unterkünfte bewertet. Jetzt siehst du, was der Gruppe gefällt.» + Primär `[Rangliste ansehen]` + Text-Taste «Letzte rückgängig».
**Neue Vorschläge während des Swipens:** Banner über dem Stapel «2 neue Unterkünfte» – werden hinten angehängt.
**In-App-Browser-Risiko:** Wischgesten können mit „Zurück wischen“ des Browsers kollidieren → Karte beginnt erst ab 8 px horizontaler Bewegung, Startbereich nicht am Bildschirmrand (16 px Rand frei); Tasten sind immer da.

## C. Rangliste (nach eigenem Swipen bzw. Orga)
```
│ Rangliste      nach ♥, dann ✕, dann Preis│
│ ┌────────────────────────────────┐ │
│ │ (1) Kamena Kuća – Steinhaus [★ Platz 1]│
│ │     Bol, Brač · 2.050 € · ≈ 342 € p. P.│
│ │     ♥ 5   ✕ 0                  │ │
│ │     ♥ Lena, Kemal, Sara, Jonas, du      │  Namen sichtbar (Transparenz wie F-011)
│ │     [Das wird's]  Ansehen ↗    │ │  nur Orga
│ │ (2) Villa Mare mit Pool        │ │
│ │     ♥ 4   ✕ 1                  │ │
│ │ …                              │ │
│ └────────────────────────────────┘ │
```
Sortierung (F-031): meiste ♥ → wenigste ✕ → niedrigerer Preis p. P. → früher vorgeschlagen. Rang als Kreis + sr-only «Platz 1»; Platz 1 zusätzlich Sonnen-Chip «Platz 1» (wie W10). Orga sieht bei Personen, die noch offen sind, «du: offen» bzw. in der Kachel «2 haben noch nicht alles bewertet» + `[Erinnern]` (Teilen-Text).

## D. Festlegen & gebucht (Orga / „bucht“)
1. Orga tippt `[Das wird's]` → Bestätigungs-Sheet «Kamena Kuća festlegen? Alle sehen sie dann als eure Unterkunft, das Swipen endet. Du kannst das wieder aufheben.» `[Abbrechen]` `[Das wird's]` (nicht destruktiv → Primär).
2. Danach oben die Karte **„Eure Unterkunft“**: großes Bild, Chip «noch nicht gebucht» (Uhr, Amber) → nach `[Als gebucht markieren]` «✓ gebucht» (Minze); Tasten `[Ansehen ↗]` `[Teilen]` (Teilen-Text «Unsere Unterkunft: <Titel> <Link>»), Text-Tasten «Adresse in „Infos“ übernehmen» (→ W22) und (Orga) «Festlegung aufheben».
3. Kleine Feier: Siegel + Snackbar «Eure Unterkunft steht: Kamena Kuća» mit Aktion «Teilen». Kein Konfetti (das bleibt dem Termin vorbehalten).
4. Swipen ist beendet (Route `/swipe` zeigt «Die Unterkunft steht schon»), Rangliste bleibt für alle sichtbar, „Vorschlagen“ verschwindet.
5. „gebucht“ ist rückgängig machbar (Snackbar «Rückgängig», später über die Karte).

## Fehler & Sonderfälle
| Fall | Verhalten |
|---|---|
| Vorschlag gelöscht, während jemand ihn swipt | Karte verschwindet mit Hinweis «Lena hat diesen Vorschlag entfernt.» |
| Netzwerkfehler beim Swipen | Optimistisch weiter; Bewertungen lokal halten, Retry 3×, Banner (ux-spec §6). |
| Person verlässt die Reise | Eigene Bewertungen gelöscht; eigene Vorschläge bleiben, Urheber «ehemaliges Mitglied». |
| Festlegung des Termins aufgehoben | Bereich bleibt, Banner «Termin wird neu abgestimmt – Preise können sich ändern.» |

## Barrierefreiheit
Karte `<article aria-roledescription="Karte" aria-label="<Titel>">`; Bewertungs-Tasten mit sichtbarem Label; ♥/✕ in der Liste als `aria-pressed`-Tasten in einer Gruppe «Deine Bewertung für <Titel>»; Fokus nach jedem Swipe bleibt auf der gedrückten Taste; nach Stapel-Ende Fokus auf «Geschafft!». Bilder dekorativ (`alt=""`), Inhalt steht als Text.

## Desktop
Stapel max. 420 px breit zentriert; Rangliste rechts daneben ab 960 px (nur sichtbar, wenn freigeschaltet, sonst Sperrhinweis). Tastatursteuerung wie mobil.
