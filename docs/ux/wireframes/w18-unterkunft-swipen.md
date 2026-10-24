# W18 – Unterkünfte: Liste, Swipen, Rangliste, Festlegen

Stand: 2026-10-23 · UI/UX · Status: **baureif für Inkrement 9** – Präzisierungen und Inkrement-9-Schnitt: **Abschnitt E (gilt vor A–D)**; Inkrement 11 („Bucht“ markiert gebucht): **E.16** · Feature **F-031**, Q31, Q33, Q34 · Routen `/trips/{id}/stays`, `/trips/{id}/stays/swipe` · Vorschlagen/Bearbeiten: [W17](w17-unterkunft-vorschlagen.md) · Cockpit-Anbindung: [W16 v2.14](w16-cockpit.md) · Infos-Übernahme: [W22 D](w22-infoseite.md)
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

---

## E. Inkrement-9-Schnitt und Präzisierungen (2026-10-23, gilt vor A–D)

**Abgrenzung:** Daten, Rechte, Sicherheit (SSRF, Bild-Proxy, Rate-Limits), Export/Löschung und Demo-Seed regelt [`features.md` R.7](../../product/features.md) (PM, 2026-10-23). Dieser Abschnitt regelt **UI, Abläufe, Zustände und Texte**. CEO-Entscheidungen vom 2026-10-23 sind eingearbeitet: (a) Bereich nur in Phase 3, Daten bleiben bei Aufheben; (b) neue Festlegung mit anderem Zeitraum setzt „gebucht“ automatisch zurück + Hinweis; (c) Infos-Übernahme nur Name; (d) Feld „Ort“ entfällt; ♥ mit Namen, ✕ nur Zahl; Rangliste: Mitglied nach Bewerten aller aktuellen Vorschläge, Orga immer, nach Festlegung alle.

### E.0 Was sich gegenüber A–D ändert
| Thema | A–D (Entwurf) | **gilt jetzt** | Grund |
|---|---|---|---|
| Ort («⌖ Bol, Brač») | auf Karte und Rangliste | **entfällt** (kein Feld in Inkr. 9) | CEO (d) |
| Bewertungsstufen | ♥ / ✕ | **bleibt zweistufig, kein „Vielleicht“** (E.5.1) | Frage UX-10 nur zur Bestätigung |
| ✕-Namen | offen | **♥ namentlich, ✕ nur als Zahl** | CEO, R.7 I9-06 |
| Bewertung in der Liste | ♥/✕ erneut tippen = „offen“ | **bleibt so** (R.7 I9-05), aber mit Snackbar-Hinweis, wenn dadurch das Ranking wieder gesperrt wird (E.3) | Folge sichtbar machen |
| „gebucht“ setzen | Orga und „bucht“ | **Inkrement 9: nur Orga**; „Bucher“ in allen Texten = Orga | F-056 erst Inkr. 11 (keine Teaser) |
| Platzhalterkarte | Fokus springt ins Titel-Feld | **kein automatischer Fokussprung** (W17 F) | Fokus wandert nicht, während jemand einfügt/tippt |
| «Adresse in Infos übernehmen» | kopiert Adresse | **nur der Name** (W22 D); Adresse/Check-in trägt die Orga selbst ein | CEO (c) – Vorschau liefert keine verlässliche Adresse |
| Termin-Festlegung aufgehoben | Bereich bleibt mit Banner | **Bereich nicht erreichbar** (Weiterleitung), Daten bleiben | CEO (a), wie `/info` |
| Rückgängig | „letzter Swipe dieser Sitzung“ | **mehrstufig** bis zur ersten Bewertung seit Öffnen des Stapels | billiger Komfort; R.7 verlangt mindestens den letzten |
| UX-9 V3 | «Haben wir schon / brauchen wir nicht» | **eine** Markierung ohne Unterscheidung (Daten R.7 ohne Variante), Status «Ohne App erledigt» | R.7 Datenhaltung |

### E.1 Verfügbarkeit (Phasen-Regeln)
| Lage | `/stays`, `/stays/swipe`, `/stays/new`, `/stays/{sid}/edit` |
|---|---|
| Phase 1/2 (auch nach „Festlegung aufheben“) | Weiterleitung (307) auf `/trips/{id}`, ohne Fehlermeldung. Daten bleiben gespeichert; kein Einstieg, kein Hinweis (keine Teaser). Nach der nächsten Festlegung ist alles wieder da (E.8). |
| Phase `fixed` (Vorbereitung, Unterwegs, Danach) | nutzbar nach Rechten R.7. Es gibt **keine** zusätzliche Sperre ab Anreisetag; das Cockpit drängt ab dann nur nicht mehr (V3 „nicht genutzt“, W16 v2.14). |
| Nicht-Mitglied / falsche Reise | gleiche 404 wie andere Reise-Unterseiten |

**Empfehlung umgesetzt:** Unterkünfte erst nach der Terminfestlegung – Preise und Verfügbarkeit hängen am Datum, und ein zweites Abstimmen neben der Termin-Suche würde Phase 1/2 überladen.

### E.2 Rechte – was die Oberfläche je Rolle zeigt (Quelle: R.7-Tabelle)
| Element | Mitglied | Orga |
|---|---|---|
| `[+ Vorschlagen]`, Swipe-Aufforderung, Bewertungstasten | ✔ solange keine Unterkunft festgelegt | ✔ |
| Rangliste mit Zahlen/Namen | erst wenn „fertig“ (alle aktuellen Vorschläge bewertet) oder Unterkunft festgelegt; sonst Sperrhinweis | immer |
| Fortschritt «{x} von {n} haben bewertet» (nur Zahl) | ✔ | ✔ |
| `⋯` Bearbeiten / Löschen | nur eigene | alle |
| Bearbeiten der festgelegten Unterkunft | ✔ (eigene) bis «gebucht», danach nicht | ✔ bis «gebucht», danach nicht |
| Löschen der festgelegten Unterkunft | – (Menüpunkt fehlt) | – (erst aufheben) |
| `[Das wird's]`, «Festlegung aufheben», «gebucht ✓», UX-9, «Ändern» (Reisende), «Adresse & Check-in eintragen» | – | ✔ |

### E.3 Bereich `/stays` – Aufbau (mobil, von oben)
Kopf wie W22 C: ← (zum Cockpit, Fokus zurück auf die Herkunfts-Station/-Kachel) · Reisename klein + h1 «Unterkünfte» · rechts Kontur-Taste `[+ Vorschlagen]` (44 px; Container < 400 px nur Icon mit Namen «Unterkunft vorschlagen») – nur solange keine Unterkunft festgelegt ist. Bei 30 Vorschlägen `aria-disabled`, Tipp → Snackbar «Maximal 30 Vorschläge pro Reise – lösch einen, um Platz zu machen.». `<title>` «Unterkünfte · {Reise} · Wir wollen weg».

| # | Block | sichtbar, wenn |
|---|---|---|
| 1 | Hinweis **Termin geändert** (E.8) · Hinweis **„ohne App erledigt“** (E.7.5) | jeweilige Lage |
| 2 | **„Eure Unterkunft“** (E.7.2) | Unterkunft festgelegt |
| 3 | **Swipe-Aufforderung**: Icon + h2 «{n} Unterkünfte warten auf dich» + «Du hast {x} von {y} bewertet.» bzw. „Neu“-Satz (E.5.6) + Balken (`aria-hidden`) + Primär `[Jetzt swipen ({n})]` | ich habe ≥ 1 unbewerteten Vorschlag, nichts festgelegt |
| 4 | **Rangliste** (h2, `id="ranking"`) – frei (E.6) oder Sperrhinweis | ≥ 1 Vorschlag |
| 5 | **Alle Vorschläge ({n})** (h2) – Eingangsreihenfolge, nur eigene Bewertung | ≥ 1 Vorschlag **und** Rangliste gesperrt (ist sie frei, trägt die Rangliste dieselben Zeilen inkl. eigener Bewertung – keine Doppelliste) |
| 6 | Fußzeile 13 px «Tippe ♥ oder ✕, um deine Bewertung zu ändern. Bilder laden über unseren Server, nicht direkt vom Portal.» (erster Satz nur, solange Bewerten möglich) | ≥ 1 Vorschlag |
| – | **Leer:** Illustration + h2 «Noch keine Unterkünfte» + «Schlag die erste vor – ein Link aus Booking, Airbnb & Co. reicht.» + Primär `[Unterkunft vorschlagen]`; Orga zusätzlich Text-Taste «Haben wir schon / brauchen wir nicht …» (E.7.5) | 0 Vorschläge |

**Eine Primär-Taste je Ansicht** (Vorrang): Swipe-Aufforderung › Leerzustand › (Orga) `[Als gebucht markieren]`. `[Das wird's]` ist je Ranglisten-Zeile **sekundär** (`btn-sm`).

**Vorschlags-Zeile** (Liste und Rangliste gleich gebaut, `<li>`): Bild 64 × 64 (Proxy, sonst Platzhalter mit Bett-Icon) · h3 Titel 16/800 (max. 2 Zeilen, „…“) · Meta «{Site-Name oder Domain} · von {Name}» · Preiszeile «2.050 € · ≈ 342 € p. P.» bzw. «ohne Preis» · Chip «Neu» (E.5.6) · Notiz 1 Zeile + „…“ (voll im Stapel und auf „Eure Unterkunft“) · Bewertungspaar `[✕][♥]` (je 44 px, `role="group"` «Deine Bewertung für {Titel}», `aria-pressed`) – unbewertet: beide nicht gedrückt + Wort «offen» davor · Text-Tasten «Ansehen ↗» und `⋯` (Bearbeiten → `/stays/{sid}/edit` [W17 F.4], Löschen …). Die Zeile selbst ist **kein** Link (mehrere Ziele, nichts verschachtelt). Nach Festlegung: Paar wird Text «Deine Bewertung: ♥ / ✕ / keine».

**Bewertung zurücknehmen** (gedrückte Taste erneut tippen, R.7): sofort, Ansage/Snackbar «Bewertung zurückgenommen.» + «Rückgängig». War die Rangliste frei und wird dadurch gesperrt: Snackbar «Bewertung zurückgenommen – das Ranking ist wieder gesperrt, bis du neu bewertest.» + «Rückgängig» (6 s); die Rangliste wechselt erst beim nächsten Laden in den Sperrzustand (nichts verschwindet unter dem Finger, motion-system §5.10).

### E.4 Löschen
Eigener Vorschlag oder Orga, nicht die festgelegte Unterkunft. Dialog (destruktiv, ux-spec §4.2) «„{Titel}“ löschen?» · «Die Bewertungen dazu werden auch gelöscht. Das lässt sich nicht rückgängig machen.» · `[Abbrechen]` `[Löschen]` → Snackbar «Vorschlag gelöscht.», Fokus auf die nächste Zeile bzw. die Listen-Überschrift. Wer dadurch „fertig“ wird, sieht die Rangliste beim nächsten Laden (ohne Feier).

### E.5 Swipen (`/stays/swipe`)

#### E.5.1 Zweistufig, kein „Vielleicht“
Rechts / ♥ = **Gefällt mir**, links / ✕ = **Eher nicht**. Begründung: zwei Richtungen = zwei eindeutige, gelernte Gesten; eine dritte (hoch) ist schwer zu entdecken und kollidiert mit Scrollen; „Vielleicht“ würde zur Ausweichstufe und verwässert die Rangliste; „Eher nicht“ ist schon weich. Kein „Überspringen“: Das Ranking wird erst nach allen Bewertungen frei – Überspringen würde es dauerhaft sperren. → **UX-10** (Bestätigung, nicht blockierend).

#### E.5.2 Stapel und Karte
- Alle Vorschläge **ohne eigene Bewertung**, auch eigene, älteste zuerst. Zähler «Unterkunft {pos} von {total}» (pos = bewertete + 1) und rechts «{count} offen».
- Oberste Karte + eine dahinter (95 %, 8 px versetzt, `aria-hidden`, nicht fokussierbar).
- Karte: Bild 16:10 (max. 34 svh) oder Platzhalterfeld · Chip «Vorschau · {Domain}» bzw. «Keine Vorschau · {Domain}» · h2 Titel · Preiszeile · Notiz «„5 Min. zum Strand“ – Sara» bzw. «Vorgeschlagen von Sara» · Text-Taste «Auf {Domain} ansehen ↗» (startet keinen Swipe; Zeigerereignisse auf Links/Tasten ignoriert die Geste). **Kein Ort.**
- Direktaufruf ohne offene Vorschläge → Ende-Zustand ohne Siegel; 0 Vorschläge → Weiterleitung `/stays`; Unterkunft festgelegt → «Die Unterkunft steht schon» (D.4).

#### E.5.3 Geste
- Pointer Events, `touch-action: pan-y`. Start erst ab **8 px** horizontal und nur bei |dx| > |dy| (sonst scrollt die Seite). Start in den äußeren 16 px des Bildschirms wird ignoriert (System-Zurückwischen).
- Karte folgt dem Finger (translateX = dx, Rotation dx/18°, max. ±12°); Stempel «♥ Gefällt mir» / «✕ Eher nicht» (Icon + Text) blendet mit |dx| ÷ (30 % Kartenbreite) ein.
- Auslösen bei |dx| > 30 % Kartenbreite **oder** > 0,6 px/ms beim Loslassen; sonst zurückfedern; `pointercancel` = zurückfedern. Die nächste Karte ist schon bedienbar, während die alte ausfliegt.

#### E.5.4 Tasten (SC 2.5.7) und Tastatur
- `role="group"` «Bewerten»: `(✕) Eher nicht` 64 px · `(↶) Zurück` 48 px · `(♥) Gefällt mir` 64 px, Label immer sichtbar; gleiches Feedback wie die Geste.
- Tastatur (Fokus nicht in Eingabefeld, kein Dialog offen): **←** eher nicht · **→** gefällt mir · **Strg/Cmd+Z** zurück. Keine Einzelzeichen-Kürzel (SC 2.1.4). Hinweis unter den Tasten ab 600 px «Wischen oder tippen · Tastatur: ← eher nicht · → gefällt mir», mobil «Wischen oder tippen».
- Fokus bleibt nach jeder Bewertung auf der gedrückten Taste; nach dem letzten Swipe auf h2 «Geschafft!» (`tabindex="-1"`).

#### E.5.5 Rückgängig
`[Zurück]` / Strg+Z nimmt die letzte Bewertung **dieser Stapel-Sitzung** zurück (wieder „offen“) – mehrfach bis zur ersten seit Öffnen. Ohne Verlauf `aria-disabled="true"`. Karte kommt aus ihrer Ausflugrichtung zurück; Ansage «Rückgängig: {Titel} ist wieder offen.». Auf dem Ende-Bildschirm Text-Taste «Letzte rückgängig». Verlassen der Seite leert den Verlauf.

#### E.5.6 „Neue Vorschläge seit deinem letzten Swipen“
- **Definition:** unbewerteter Vorschlag, angelegt **nach** meiner jüngsten Bewertung. Wer noch nie bewertet hat, sieht keine „Neu“-Chips.
- **Bereich:** Swipe-Aufforderung zeigt statt «Du hast x von y bewertet.» den Satz «{count, plural, one {1 neue Unterkunft} other {# neue Unterkünfte}} seit deinem letzten Swipen – bewerte sie, dann siehst du das Ranking wieder.»; Sperrhinweis mit «Noch {count} offen.»; Zeilen tragen Chip «Neu».
- **Cockpit:** V3 springt zurück auf „du bist dran“ (W16 v2.14).
- **Während des Swipens:** Jede Server-Antwort auf eine Bewertung liefert die aktuellen offenen IDs; neue werden **hinten** angehängt, Banner «{count, plural, one {1 neue Unterkunft} other {# neue Unterkünfte}} – hinten angehängt.» (polite). Kein Polling.

#### E.5.7 Ende des Stapels
Siegel (E.12) + h2 «Geschafft!» + «Du hast alle {total} Unterkünfte bewertet. Jetzt siehst du, was der Gruppe gefällt.» (Orga: «… – die Rangliste zählt jetzt auch deine Stimmen.») + Primär `[Rangliste ansehen]` (→ `/stays#ranking`, Fokus auf h2 «Rangliste») + Text-Taste «Letzte rückgängig». Ende erst, wenn alle Bewertungen gespeichert sind (sonst «Speichert …»).

#### E.5.8 Fehler und Gleichzeitigkeit
| Fall | Verhalten |
|---|---|
| Netz weg / Serverfehler | optimistisch weiter; Warteschlange, 3 Wiederholungen (1 s, 3 s, 10 s); Banner «Offline – deine Bewertungen werden gespeichert, sobald du wieder online bist.»; endgültig gescheitert → Karte(n) zurück in den Stapel + Snackbar «Konnte nicht gespeichert werden – bitte nochmal bewerten.» |
| Vorschlag inzwischen gelöscht | Karte blendet aus, Hinweis über dem Stapel «{Name} hat einen Vorschlag entfernt.»; Zähler passt sich an |
| Unterkunft inzwischen festgelegt | Bildschirm «Die Unterkunft steht schon» (D.4) mit `[Zur Unterkunft]`; letzte Bewertung verworfen |
| Termin inzwischen aufgehoben | Weiterleitung `/trips/{id}` |
| Rate-Limit (R.7) | Snackbar «Kurz durchatmen – gleich geht's weiter.»; Karte bleibt liegen |
| Zweites Gerät | letzte Bewertung gewinnt, kein Hinweis |

### E.6 Rangliste

#### E.6.1 Sichtbarkeit (Q33)
Frei für **Orga immer**, für Mitglieder, die **alle aktuellen** Vorschläge bewertet haben, und für **alle**, sobald eine Unterkunft festgelegt ist. Sonst Sperrhinweis: Schloss + «Swipe alle durch, um das Ranking zu sehen.» + «So bewertet jede:r unbeeinflusst. Noch {count} offen.» – **keine** Platzhalter-Balken, keine Zahlen (Server liefert sie nicht aus, R.7 I9-06). Wechsel gesperrt ↔ frei nur beim Laden.

#### E.6.2 Sortierung, Gleichstand, Anzeige
- Reihenfolge nach R.7 (♥ ↓, ✕ ↑, Preis p. P. ↑ – ohne Preis hinten, älter zuerst).
- **Rang** nur nach ♥ und ✕: gleiche ♥ **und** gleiche ✕ = gleicher Rang (1, 2, 2, 4), innerhalb nach Preis/Alter. Rang-Kreis 32 px (sr «Platz 2»), bei Gleichstand Chip «Gleichauf».
- Sonnen-Chip «Platz 1» nur bei ♥ ≥ 1; bei Gleichstand an der Spitze für alle Erstplatzierten, plus für die Orga über der Liste «Gleichstand an der Spitze – du entscheidest.». Niemand ♥ → kein Chip, Orga-Hinweis «Noch kein klarer Favorit.».
- Je Zeile «♥ 5 · ✕ 0» (sr «5-mal Gefällt mir, 0-mal Eher nicht») und «♥ von Lena, Kemal und dir» (Namen nach ux-spec §10.3, ab 5 «und 3 weiteren»). **✕ ohne Namen.**
- Eigene Bewertung bleibt in der Zeile änderbar; Zahlen aktualisieren sofort, **Umsortieren erst beim nächsten Laden** (M-U3).
- Kopf: h2 «Rangliste» · 13 px «Sortiert nach Gefällt mir, dann Eher nicht, dann Preis.» · Zeile «Preise pro Person für {n} Reisende» + (Orga, Should) Text-Taste «Ändern» → Dialog «Für wie viele rechnet ihr?» mit Stepper 1–50 (ux-spec §4.6), Hilfe «Standard: alle in der Reise ({n}).», Text-Taste «Automatisch» · `[Speichern]`.
- Orga je Zeile: `[Das wird's]` (sekundär) + «Ansehen ↗».

#### E.6.3 Wenige Stimmen
Zählbasis = Mitglieder ohne Platzhalter. Solange nicht alle fertig sind, Info-Hinweis über der Liste (Muster ux-spec §14.3, nicht Amber): «Basiert auf {done} von {total} – noch offen: {names}.» + Text-Taste «Erinnern» (RemindSheet `stay-rate`, Schritt `status`). Ist die Orga selbst offen: «… noch offen: du, Kemal und Sara.» + Text-Taste «Jetzt swipen». Nur 1 Vorschlag → Rangliste mit einem Eintrag.

### E.7 Festlegen, gebucht, aufheben, ohne App (nur Orga)

#### E.7.1 Festlegen
1. `[Das wird's]` in der Rangliste (oder Cockpit-Primär «Festlegen» → `/stays#ranking`).
2. Sheet «„{Titel}“ festlegen?» · «Alle sehen sie dann als eure Unterkunft, das Swipen endet. Du kannst das wieder aufheben.» · ggf. «{count, plural, one {1 Person hat} other {# Personen haben}} noch nicht alles bewertet.» · `[Abbrechen]` `[Das wird's]` (Primär).
3. Neu laden, „Eure Unterkunft“ oben (Fokus auf deren h2), Siegel-Plopp, Snackbar «Eure Unterkunft steht: {Titel}» + «Teilen» (6 s). **Kein Konfetti.**
4. Swipen/Vorschlagen enden, Rangliste für alle frei, Bewertungstasten werden Text.

#### E.7.2 Karte „Eure Unterkunft“
```
│ ┌ Eure Unterkunft ───────────────┐ │  h2
│ │ ░░░░░░░ Bild (Proxy) ░░░░░░░░░ │ │  16:9, sonst Platzhalter
│ │ Kamena Kuća – Steinhaus        │ │  h3
│ │ airbnb.de · von Sara           │ │
│ │ 2.050 € · ≈ 342 € p. P. · ♥ 5  │ │
│ │ „5 Min. zum Strand“ – Sara     │ │
│ │ [◷ noch nicht gebucht]         │ │  Chip Amber | [✓ gebucht] Minze + «am 3. Mai von Lena»
│ │ Lena bucht – sobald es klappt, │ │  nur Mitglied, nur „noch nicht gebucht“
│ │ steht hier „gebucht ✓“.        │ │
│ │ [   Als gebucht markieren    ] │ │  Orga, Primär (nach gebucht: Text-Taste «Doch nicht gebucht»)
│ │ [Ansehen ↗]  [Teilen]          │ │  sekundär
│ │ Name in die Infos übernehmen › │ │  Orga (W22 D) – bzw. «In den Infos ansehen ›» für alle
│ │ Festlegung aufheben …          │ │  Orga
│ └────────────────────────────────┘ │
```
- Teilen-Text (Teilen-Sheet ux-spec §4.5): «Unsere Unterkunft für {Reise}: {Titel} {Link}» / «Our place for {trip}: {title} {link}».
- «Name in die Infos übernehmen ›» erscheint, solange der Name in den Infos ≠ Titel; sonst «In den Infos ansehen ›» (→ `/info`).

#### E.7.3 gebucht
`[Als gebucht markieren]` sofort ohne Dialog → Chip «✓ gebucht», Siegel-Plopp am Chip, Snackbar «Als gebucht markiert.» + «Rückgängig». «Doch nicht gebucht» → Snackbar «Markierung entfernt.» + «Rückgängig». V3 wird erledigt → Kachel (W16 v2.14).

#### E.7.4 Festlegung aufheben
Dialog «Festlegung aufheben?» · «„{Titel}“ ist dann wieder ein Vorschlag wie die anderen. Alle Bewertungen bleiben, Swipen und Vorschlagen gehen wieder.» · falls gebucht: «Die Markierung „gebucht“ wird entfernt.» · `[Abbrechen]` `[Aufheben]` → Snackbar «Festlegung aufgehoben.», Fokus auf h2 «Rangliste». Infos bleiben unverändert. Offene Mitglieder sind wieder gesperrt (Q33).

#### E.7.5 „Ohne App erledigt“ (UX-9)
- Nur solange keine Unterkunft festgelegt ist. Einstieg: Text-Taste unter der V3-Karte und im Bereich (Leerzustand bzw. unter der Rangliste) «Haben wir schon / brauchen wir nicht …».
- Dialog «Unterkunft ohne App erledigt?» · «Der Schritt „Unterkunft“ gilt dann für alle als erledigt. Vorschlagen und Bewerten bleiben trotzdem möglich.» · `[Abbrechen]` `[Abhaken]`.
- Folge: V3 erledigt «Ohne App erledigt» (Chip wie V2); Hinweis im Bereich «{Orga} hat die Unterkunft als „ohne App erledigt“ markiert.» + (Orga) «Rückgängig». „Das wird's“ später ist möglich; dann zählt die Festlegung (Merker gegenstandslos, R.7).

### E.8 Termin aufheben / neu festlegen (CEO b)
| Lage | Verhalten |
|---|---|
| Termin-Festlegung aufgehoben | Bereich nicht erreichbar; Vorschläge, Bewertungen, festgelegte Unterkunft, „gebucht“, UX-9 bleiben gespeichert. |
| Neu festgelegt, gleicher Zeitraum | nichts ändert sich, kein Hinweis. |
| Neu festgelegt, **anderer** Zeitraum | „gebucht“ wird **automatisch zurückgesetzt**, die festgelegte Unterkunft bleibt. Hinweis (Amber, oben im Bereich), solange es Vorschläge von vor der aktuellen Festlegung gibt und die Orga ihn nicht geschlossen hat: **«Euer Termin hat sich geändert ({Zeitraum}) – prüft Preise und Verfügbarkeit der Vorschläge.»**; war gebucht, zusätzlich **«„Gebucht“ wurde zurückgesetzt – die Buchung galt für den alten Termin.»** Orga: Schließen-Taste `×` («Hinweis schließen»), gilt für alle. Mitglieder: kein Schließen. Cockpit: V3 für die Orga wieder „du bist dran“ (buchen). UX-9 bleibt unverändert. |
| Unterwegs / Danach | Bereich bleibt erreichbar (Kachel, sobald ≥ 1 Vorschlag oder UX-9); keine Aufgaben mehr im Cockpit. Gelöscht mit der Reise (Q31). |

### E.9 Weitere Sonderfälle
| Fall | Verhalten |
|---|---|
| Person verlässt die Reise / Konto gelöscht | eigene Bewertungen weg; eigene Vorschläge bleiben mit «ehemaliges Mitglied»; war sie die letzte Offene, ist das Ranking frei (beim Laden). |
| Neues Mitglied / Platzhalter tritt bei | alle Vorschläge offen für die Person; Zählbasis wächst; V3 anderer kann von „alle haben bewertet“ zurück auf „wartet“. |
| Bild später nicht mehr ladbar | Platzhalter, kein Fehler sichtbar. |
| Orga-Übergabe | Rechte wechseln sofort. |
| Lange Titel/Namen | Zeilen 2 Zeilen + „…“; Karte/„Eure Unterkunft“ vollständig (`overflow-wrap: anywhere`). |
| Offline im Bereich | Offline-Banner; Bewertungstasten, Festlegen, Löschen mit Hinweis deaktiviert (ux-spec §6). |

### E.10 Texte DE / EN (Bereich, Swipen; W17 in W17 F.6, Cockpit in W16 v2.14, Infos in W22 D)
| Schlüssel (Vorschlag) | DE | EN |
|---|---|---|
| `stays.title` | Unterkünfte | Places to stay |
| `stays.suggest` / Name | Vorschlagen · Unterkunft vorschlagen | Suggest · Suggest a place |
| `stays.limit` | Maximal 30 Vorschläge pro Reise – lösch einen, um Platz zu machen. | Up to 30 suggestions per trip – delete one to make room. |
| `stays.empty.*` | Noch keine Unterkünfte · Schlag die erste vor – ein Link aus Booking, Airbnb & Co. reicht. · Unterkunft vorschlagen | No places yet · Suggest the first one – a link from Booking, Airbnb & co. is all it takes. · Suggest a place |
| `stays.prompt.title` | {count, plural, one {Eine Unterkunft wartet} other {# Unterkünfte warten}} auf dich | {count, plural, one {One place is} other {# places are}} waiting for you |
| `stays.prompt.progress` | Du hast {rated} von {total} bewertet. | You've rated {rated} of {total}. |
| `stays.prompt.new` | {count, plural, one {1 neue Unterkunft} other {# neue Unterkünfte}} seit deinem letzten Swipen – bewerte sie, dann siehst du das Ranking wieder. | {count, plural, one {1 new place} other {# new places}} since you last swiped – rate {count, plural, one {it} other {them}} to see the ranking again. |
| `stays.prompt.cta` | Jetzt swipen ({count}) | Start swiping ({count}) |
| `stays.locked.*` | Swipe alle durch, um das Ranking zu sehen. · So bewertet jede:r unbeeinflusst. Noch {count} offen. | Swipe through all of them to see the ranking. · That way nobody gets swayed. {count} left. |
| `stays.ranking.title` / `.sort` | Rangliste · Sortiert nach Gefällt mir, dann Eher nicht, dann Preis. | Ranking · Sorted by likes, then fewest passes, then price. |
| `stays.ranking.party` / `.change` | Preise pro Person für {count} Reisende · Ändern | Prices per person for {count} travellers · Change |
| `stays.ranking.basedOn` | Basiert auf {done} von {total} – noch offen: {names}. | Based on {done} of {total} – still waiting for {names}. |
| `stays.ranking.rank` (sr) / `.first` / `.tied` | Platz {n} · Platz 1 · Gleichauf | Rank {n} · #1 · Tied |
| `stays.ranking.counts` (sr) | {likes}-mal Gefällt mir, {nopes}-mal Eher nicht | {likes} likes, {nopes} passes |
| `stays.ranking.likedBy` | ♥ von {names} | ♥ from {names} |
| `stays.ranking.tieOrga` / `.noFavourite` | Gleichstand an der Spitze – du entscheidest. · Noch kein klarer Favorit. | It's a tie at the top – your call. · No clear favourite yet. |
| `stays.fix` | Das wird's | This is the one |
| `stays.all.title` | Alle Vorschläge ({count}) | All suggestions ({count}) |
| `stays.row.meta` / `.noPrice` / `.perPerson` | {site} · von {name} · ohne Preis · ≈ {amount} p. P. | {site} · by {name} · no price · ≈ {amount} pp |
| `stays.row.new` / `.open` / `.formerMember` | Neu · offen · ehemaliges Mitglied | New · not rated · former member |
| `stays.rate.group` / `.like` / `.nope` | Deine Bewertung für {title} · Gefällt mir · Eher nicht | Your rating for {title} · Like · Pass |
| `stays.rate.cleared` / `.clearedLocked` | Bewertung zurückgenommen. · Bewertung zurückgenommen – das Ranking ist wieder gesperrt, bis du neu bewertest. | Rating removed. · Rating removed – the ranking is locked again until you rate it. |
| `stays.view` | Ansehen ↗ (sr: öffnet neuen Tab) | View ↗ (sr: opens in a new tab) |
| `stays.footer` | Tippe ♥ oder ✕, um deine Bewertung zu ändern. Bilder laden über unseren Server, nicht direkt vom Portal. | Tap ♥ or ✕ to change your rating. Images load via our server, not straight from the site. |
| `stays.delete.*` | „{title}“ löschen? · Die Bewertungen dazu werden auch gelöscht. Das lässt sich nicht rückgängig machen. · Vorschlag gelöscht. | Delete “{title}”? · Its ratings will be deleted too. This can't be undone. · Suggestion deleted. |
| `stays.swipe.title` | Unterkünfte bewerten | Rate places |
| `stays.swipe.position` / `.left` | Unterkunft {pos} von {total} · {count} offen | Place {pos} of {total} · {count} left |
| `stays.swipe.undo` / `.hint` / `.hintTouch` | Zurück · Wischen oder tippen · Tastatur: ← eher nicht · → gefällt mir · Wischen oder tippen | Undo · Swipe or tap · Keyboard: ← pass · → like · Swipe or tap |
| `stays.swipe.preview` / `.noPreview` / `.by` | Vorschau · {domain} · Keine Vorschau · {domain} · Vorgeschlagen von {name} | Preview · {domain} · No preview · {domain} · Suggested by {name} |
| `stays.swipe.open` | Auf {domain} ansehen ↗ | View on {domain} ↗ |
| `stays.swipe.announce` / `.undone` | {title}: {rating}. Noch {count} offen. · Rückgängig: {title} ist wieder offen. | {title}: {rating}. {count} left. · Undone: {title} is open again. |
| `stays.swipe.newArrived` / `.removed` | {count, plural, one {1 neue Unterkunft} other {# neue Unterkünfte}} – hinten angehängt. · {name} hat einen Vorschlag entfernt. | {count, plural, one {1 new place} other {# new places}} – added to the end. · {name} removed a suggestion. |
| `stays.swipe.done.*` | Geschafft! · Du hast alle {total} Unterkünfte bewertet. Jetzt siehst du, was der Gruppe gefällt. · (Orga) Du hast alle {total} Unterkünfte bewertet – die Rangliste zählt jetzt auch deine Stimmen. · Rangliste ansehen · Letzte rückgängig · Speichert … | All done! · You've rated all {total} places. Now you can see what the group likes. · You've rated all {total} places – the ranking now includes your votes. · See the ranking · Undo last · Saving … |
| `stays.swipe.alreadyFixed` | Die Unterkunft steht schon · {title} – Swipen ist beendet. · Zur Unterkunft | The place is already picked · {title} – swiping is over. · See the place |
| `stays.swipe.offline` / `.failed` / `.slow` | Offline – deine Bewertungen werden gespeichert, sobald du wieder online bist. · Konnte nicht gespeichert werden – bitte nochmal bewerten. · Kurz durchatmen – gleich geht's weiter. | You're offline – your ratings will be saved once you're back online. · Couldn't save – please rate again. · Take a breath – back in a moment. |
| `stays.fixSheet.*` | „{title}“ festlegen? · Alle sehen sie dann als eure Unterkunft, das Swipen endet. Du kannst das wieder aufheben. · {count, plural, one {1 Person hat} other {# Personen haben}} noch nicht alles bewertet. | Go with “{title}”? · Everyone will see it as your place to stay and swiping ends. You can undo this. · {count, plural, one {1 person hasn't} other {# people haven't}} finished rating yet. |
| `stays.fixed.toast` | Eure Unterkunft steht: {title} · Teilen | Your place is set: {title} · Share |
| `stays.chosen.title` | Eure Unterkunft | Your place to stay |
| `stays.chosen.notBooked` / `.booked` / `.bookedBy` | noch nicht gebucht · gebucht · am {date} von {name} | not booked yet · booked · on {date} by {name} |
| `stays.chosen.waitMember` | {orga} bucht – sobald es klappt, steht hier „gebucht ✓“. | {orga} is booking it – you'll see “booked ✓” here once it's done. |
| `stays.chosen.markBooked` / `.unbook` | Als gebucht markieren · Doch nicht gebucht | Mark as booked · Not booked after all |
| `stays.chosen.bookedToast` / `.unbookedToast` | Als gebucht markiert. · Markierung entfernt. (+ Rückgängig) | Marked as booked. · Mark removed. (+ Undo) |
| `stays.chosen.toInfo` / `.seeInfo` | Name in die Infos übernehmen · In den Infos ansehen | Copy name to the info · See it in the info |
| `stays.chosen.share` | Unsere Unterkunft für {trip}: {title} {link} | Our place for {trip}: {title} {link} |
| `stays.unfix.*` | Festlegung aufheben … · Festlegung aufheben? · „{title}“ ist dann wieder ein Vorschlag wie die anderen. Alle Bewertungen bleiben, Swipen und Vorschlagen gehen wieder. · Die Markierung „gebucht“ wird entfernt. · Aufheben · Festlegung aufgehoben. | Unpick … · Unpick this place? · “{title}” becomes a suggestion like the others again. All ratings stay; swiping and suggesting reopen. · The “booked” mark will be removed. · Unpick · Place unpicked. |
| `stays.withoutApp.*` (UX-9) | Haben wir schon / brauchen wir nicht … · Unterkunft ohne App erledigt? · Der Schritt „Unterkunft“ gilt dann für alle als erledigt. Vorschlagen und Bewerten bleiben trotzdem möglich. · Abhaken · {orga} hat die Unterkunft als „ohne App erledigt“ markiert. · Rückgängig | Already sorted / don't need one … · Place to stay sorted outside the app? · The “Place to stay” step will count as done for everyone. Suggesting and rating still work. · Tick off · {orga} marked the place to stay as sorted outside the app. · Undo |
| `stays.party.*` | Für wie viele rechnet ihr? · Standard: alle in der Reise ({count}). · Automatisch · Speichern | How many are you splitting it between? · Default: everyone on the trip ({count}). · Automatic · Save |
| `stays.datesChanged` | Euer Termin hat sich geändert ({range}) – prüft Preise und Verfügbarkeit der Vorschläge. | Your dates have changed ({range}) – check prices and availability of the suggestions. |
| `stays.datesChanged.unbooked` | „Gebucht“ wurde zurückgesetzt – die Buchung galt für den alten Termin. | “Booked” was reset – the booking was for the old dates. |
| `stays.datesChanged.close` | Hinweis schließen | Dismiss |

Glossar: „Unterkunft“ / „place (to stay)“ (nicht „accommodation“) · „vorschlagen“ / „suggest“ · Unterkunft „festlegen“ / „pick“ (Termin bleibt „lock in“) · „bewerten“ / „rate“ · „Gefällt mir / Eher nicht“ / „Like / Pass“.

### E.11 Responsive, 200 %, Dark Mode
- **360 × 640:** Bild max. 34 svh, damit Titel, Preis und die drei Tasten ohne Scrollen sichtbar sind (Abnahme). Tastenreihe 64 · 48 · 64 + 2 × 24 = 224 px.
- **320 px / Container < 22 em:** Bild max. 28 svh, Tastenabstand 12 px, Labels dürfen zweizeilig umbrechen.
- **200 %:** Karte wächst, Seite scrollt vertikal (Geste bleibt horizontal). Unter 20 em Containerbreite entfällt das Bild zugunsten des Domain-Chips. Ranglisten-Zeile: Bewertungspaar unter den Titel. Kopf-Taste nur Icon. Nichts abgeschnitten (1.4.10).
- **≥ 600 px:** max. 640 px; Tastatur-Hinweis sichtbar.
- **≥ 960 px:** `/stays` zweispaltig (links Aufforderung bzw. „Eure Unterkunft“ + „Alle Vorschläge“, rechts Rangliste/Sperrhinweis; DOM links zuerst). `/stays/swipe`: Stapel max. 420 px zentriert, **ohne** Rangliste daneben (auch die Orga swipt unbeeinflusst).
- **Dark Mode:** Bilder ohne Filter; Platzhalter, Stempel und Chips aus Tokens (≥ 4,5:1 Text, ≥ 3:1 Icons/Ränder); Verlauf hinter dem Domain-Chip auf Bildern (D-46).

### E.12 Motion (Vorschläge – UM-8 – UM-13, `../abstimmung-design.md` §14)
| Moment | Volle Bewegung | Reduziert |
|---|---|---|
| Ziehen | Karte folgt dem Finger, Rotation, Stempel blendet ein | folgt dem Finger (direkte Manipulation), ohne Rotation |
| Auslösen (Geste/Taste/Pfeil) | Karte fliegt mit Restgeschwindigkeit hinaus (`base`, `ease-exit`), nächste rückt 95 → 100 % (`base`, `spring-soft`) | Überblenden 140 ms |
| Zurückfedern | `slow` · `spring-soft` | sofort |
| Rückgängig | Karte kommt aus der Ausflugrichtung zurück (`slow`, `spring-soft`) | Überblenden |
| Stapel-Ende | Siegel-Plopp (`celebrate`, `spring-bouncy`) | statisch |
| Rangliste erstmals frei | Zeilen gestaffelt (`stagger-card`, max. 400 ms), einmal je Freischaltung | sofort |
| ♥/✕ in der Liste | kleiner Pop (`fast`, `spring-soft`) | sofort |
| Festlegen / gebucht | Siegel-Plopp an Karte bzw. Chip + Snackbar, **kein Konfetti** | statisch + Snackbar |
| Vibration | keine (Q17: nur zwei Stellen) | – |

### E.13 Barrierefreiheit (ergänzt den Abschnitt oben)
- Karte `<article aria-roledescription="Karte" aria-labelledby>`; Stempel `aria-hidden`; eine Live-Region (polite, außerhalb der Karte) für Bewertung, Rückgängig, neue/entfernte Vorschläge. Geste immer nur zusätzlich.
- Zähler als Text; Balken `aria-hidden`.
- Rangliste `<ol>`, Zeile `<li>` mit h3; sr-Reihenfolge «Platz 1, gleichauf. Kamena Kuća. 5-mal Gefällt mir, 0-mal Eher nicht. Gefällt Lena, Kemal und dir.».
- Externe Links mit sr «(öffnet neuen Tab)»; Domain immer sichtbar. Bilder `alt=""`.
- Dialoge/Sheets nach ux-spec §4.2, Fokus zurück auf den Auslöser.

### E.14 Hinweise zur Datenhaltung aus UX-Sicht (Ergänzung zu R.7)
R.7 gilt. Für die Oberfläche zusätzlich nötig: „Neu“ (E.5.6) aus `trip_stay.created_at` > jüngstes `rated_at` des Betrachters (keine neue Spalte); Rückgängig-Verlauf nur in `sessionStorage`; Hinweis „Termin geändert“ braucht einen Merker, ob er geschlossen wurde (R.7 `stay_date_notice_dismissed_at`) **und** dass die vorige Festlegung einen anderen Zeitraum hatte (gleicher Zeitraum → kein Hinweis, E.8).

### E.15 Abnahme UX Inkrement 9
360 × 640, 390 × 844, 320 px, 200 %, Dark Mode, DE/EN, ≥ 960 px · Leer (Mitglied/Orga) · Mitglied mit offenen (gesperrt, Netzwerk-Tab ohne fremde Zahlen/Namen) · Swipen per Geste, Tasten, Tastatur; Rückgängig mehrstufig · Ende → Rangliste frei · Bewertung in der Liste zurücknehmen → Snackbar „wieder gesperrt“ · neuer Vorschlag sperrt wieder („Neu“, V3 dran) · Gleichstand, niemand ♥ · Orga festlegen mit Offenen → alle sehen Rangliste · gebucht + Rückgängig · aufheben · UX-9 + Rückgängig · Termin aufheben → Weiterleitung; anders neu festlegen → „gebucht“ zurückgesetzt + Hinweis, Orga schließt ihn · Platzhalterkarte · VoiceOver/TalkBack nur mit Tasten.

### E.16 Inkrement 11 – „Bucht“ markiert «gebucht» (2026-10-23, gilt vor E.2 und E.7)

Grundlage: F-056, `features.md` R.9 I11-02, Cockpit [W16 v2.16](w16-cockpit.md) (V3 „Bucher“).

**Bucher** = alle mit Markierung „Bucht“; gibt es keine, die Orga.

| Element (E.2-Tabelle) | Mitglied | „Bucht“ (ohne Orga-Rolle) | Orga |
|---|---|---|---|
| `[Als gebucht markieren]` / «Doch nicht gebucht» | – | ✔ | ✔ (immer, auch ohne Markierung – R.9) |
| «Name in die Infos übernehmen ›» (W22 D/E) | – | ✔ | ✔ |
| `[Das wird's]`, «Festlegung aufheben», UX-9, «Ändern» (Reisende), Bearbeiten/Löschen fremder Vorschläge | – | – | ✔ (unverändert nur Orga, Q33) |

- **Karte „Eure Unterkunft“, Satz für alle ohne Recht:** `stays.chosen.waitMember` mit `{bookers}` statt `{orga}`: «{bookers} bucht – sobald es klappt, steht hier „gebucht ✓“.» / «{bookers} is booking it – you'll see “booked ✓” here once it's done.» (`{bookers}` wie W16 v2.16: «Sara», «Sara oder Kemal», «Lena, Sara oder Kemal»). Eine Orga ohne Markierung sieht trotzdem die Taste (sie darf) und zusätzlich darüber 13 px «Sara bucht – du kannst es auch selbst markieren.»
- **Primär-Vorrang (E.3):** Swipe-Aufforderung › Leerzustand › `[Als gebucht markieren]` – gilt jetzt für Orga **und** „Bucht“.
- **Chip nach dem Markieren:** «✓ gebucht · am 3. Mai von Sara» (`booked_by`, R.9) – ist die Person nicht mehr in der Reise: «✓ gebucht · am 3. Mai».
- **Fokus nach «Als gebucht markieren»** (Motion-Frage M-U14, hiermit bestätigt): Fokus sofort auf die Text-Taste «Doch nicht gebucht», die die Primär-Taste ersetzt; nach «Rückgängig» bzw. «Doch nicht gebucht» zurück auf `[Als gebucht markieren]`.
- **Markierung entzogen:** «gebucht ✓» bleibt bestehen (R.9); nur das Recht endet. Tippt die Person danach noch (veraltete Seite), lehnt der Server ab → Snackbar «Das kann gerade nur {bookers} oder die Orga.» + Seite neu laden.
- **Termin geändert → „gebucht“ zurückgesetzt** (E.8): Cockpit „neu buchen“ gilt für alle Bucher (W16 v2.16); Hinweis im Bereich unverändert, schließen darf weiterhin nur die Orga.
- **Erinnern `stay-book`:** Empfänger = Bucher; bei mehreren wählt man im Sheet-Schritt `orga` die Person (je Zeile WhatsApp), Kontext «{title} steht fest. Sag {bookers} kurz, dass es ans Buchen geht.».
- **Bei 0 „Bucht“** gilt alles wie Inkrement 9 (Orga = Bucher).
- Abnahme: Sara („Bucht“, nicht Orga) markiert/zieht zurück + Fokus · Mitglied ohne Markierung: keine Taste, Server lehnt Direktaufruf ab · Orga ohne Markierung bei Sara als Bucherin (Taste + Hinweissatz) · Chip «von Sara» · Entzug nach dem Markieren (bleibt gebucht) · mehrere Bucher in Texten und `stay-book` · DE/EN.
