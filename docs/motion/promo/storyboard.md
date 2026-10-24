# Promo-Video „Wir wollen weg“ – Konzept & Storyboard

Stand: 2026-10-23 (v2.0 – drei Stile, siehe **§9**; §1–§8 = v1.0, überholt durch das Feedback des Auftraggebers) · Verantwortlich: Motion Designer · Komposition v2: [a-clean](a-clean/index.html) · [b-kinetic](b-kinetic/index.html) · [c-abenteuer](c-abenteuer/index.html) (v1: [index.html](index.html), nicht mehr verwenden) · Aufnahme: [README.md](README.md)
Bezug: [motion-system.md](../motion-system.md), [interaktionen.md](../interaktionen.md), Design-System v1.0 (B0 „Indigo & Minze“), Prototypen a, b, c, f

## 1. Eckdaten
| | |
|---|---|
| Format | Hochformat 9:16, **1080 × 1920**, 30 fps, MP4 (H.264) |
| Kanäle | Instagram Reels, TikTok, WhatsApp-Status, YouTube Shorts |
| Länge | **28,0 s** (WhatsApp-Status: max. 60 s, passt; Reels/TikTok: kurz genug für mehrfaches Ansehen) |
| Ton | **keiner eingebaut** – das Video funktioniert vollständig stumm (Untertitel-Stil). Musik nur als Vorschlag, §6 |
| Sprache | DE (Standard); EN per `?lang=en` – alle Texte werden getauscht, Ablauf und Zeiten bleiben gleich |
| Daten | nur Fantasie: Reise „Kroatien 2027“, Anna, Ben, Kemal, Mia, „du“ = Lea; Unterkünfte = Demo-Illustrationen aus `docs/design/assets/unterkuenfte/`; Domains `*.test` |
| Optik | App-Screens nachgebaut im echten Look (Cockpit-Kopf Indigo, Minze-Akzente, Indigo-Rampe der Heatmap, Vorfreude-Ring); Farben aus `tokens.css` v1.3 |

## 2. Dramaturgie
**Problem → Lösung in sechs Schritten → ein großer Feier-Moment → Marke.**
- **Hook (0–2,8 s):** Wiedererkennung statt Erklärung – ein überquellender Gruppenchat. Text steht nach 0,6 s groß da: „Wann fahren wir *eigentlich* weg?“
- **Sechs Feature-Szenen à 3,4–4,2 s:** pro Szene **ein Satz**, **eine Geste** (sichtbarer Finger mit Tipp-Welle), **ein Ergebnis**. Die Szenen folgen dem echten Ablauf der App (Tage → Gruppe → Abstimmen → Termin → Unterkunft → Kosten) – so erzählt das Video nebenbei den „Reiseverlauf“.
- **Ein Höhepunkt (14,2–18,2 s):** „Es geht los!“ mit Vorfreude-Ring + Konfetti über den ganzen Bildschirm (motion-system: *ein* großer Feier-Moment statt vieler kleiner). Alle anderen Belohnungen bleiben klein (Siegel, Häkchen).
- **Endkarte (25–28 s):** Logo baut sich auf wie im Produkt (Sonne steigt, Wellen schwingen), Wortmarke, Claim, vier Stichwort-Chips.

## 3. Bildaufbau und sichere Ränder
Bühne 360 × 640 CSS-px (× 3 = 1080 × 1920). Die Plattform-Oberflächen verdecken Teile des Bilds; `?debug=1` blendet die Zonen rot ein.

| Zone (Video-px) | Was liegt dort? | Was wir dort zeigen |
|---|---|---|
| oben 0–220 | Reels-/TikTok-Kopf, Status-Leiste | nichts Wichtiges (nur Hintergrund) |
| **216–500 Untertitel** | frei | Untertitel: Etikett-Pille (11 px) + Satz in **Plus Jakarta Sans 800, 27 px (= 81 px im Video)**, max. 2 Zeilen, `text-wrap: balance`, Schlüsselwort in Minze (Feier: Sonne) |
| **528–1540 Handy** | frei | Handy-Rahmen 252 × 528 (CSS); alle Gesten und Ergebnisse liegen im Bildschirm bis ≈ y 1540 |
| unten 1540–1920 | Beschriftung, Profil, Musik-Zeile | nur Handy-Unterkante / untere Tasten (beschnitten, nicht nötig zum Verstehen) |
| rechts 918–1080, ab y ≈ 900 | Like/Kommentar/Teilen-Icons | Handy endet bei x 918 – nichts verdeckt |

Lesbarkeit: kleinste Schrift im Handy 7,5 CSS-px = 22,5 Video-px (Wochentage, nur Kontext); alle tragenden Texte ≥ 10 CSS-px = 30 Video-px oder stehen zusätzlich im Untertitel.

## 4. Storyboard (Zeiten in Sekunden)

| # | Zeit | Untertitel DE / EN | Bild & Bewegung | Feature |
|---|---|---|---|---|
| 0 | **0,0–2,8** Hook | Pille „Kennt ihr das?“ · **„Wann fahren wir *eigentlich* weg?“** / „Sound familiar?“ · „So when are we *actually* going?“ | Weiße Chat-Karte „Urlaub 2027“ (keine Messenger-Marke nachgebildet). Sechs Blasen ploppen im 225-ms-Takt (Feder bouncy): „Wann habt ihr eigentlich Urlaub?“ – „Juli?“ – „Ich kann nur im August.“ – (du) „Wer kann am 12.?“ – „Welcher 12.? Juni??“ – „Machen wir ’ne Umfrage?“. 1,6 s: Zähler „47 neu“ ploppt (Koralle), 1,75–2,3 s: Karte zittert. 2,34 s: Karte kippt weg und schrumpft, gleichzeitig fährt das Handy von unten ein (760 ms, emphasized, 7° → 0°). | Problem |
| 1 | **2,8–7,0** Tage malen | Pille Mini-Logo + „Wir wollen weg“ · **„Jeder malt seine *freien Tage*.“** / „When do we go?“ · „Everyone paints their *free days*.“ | Screen „Meine Tage“ (W08), Juli 2027. Finger wischt 8.–11. und 12.–18. Juli; jede Zelle füllt sich **im Gleichlauf mit dem Finger** mit Minze (Pop .9 → 1, bouncy). „✓ Gespeichert“ erscheint. Tipp auf „Fertig – abgeben“ → Taste wird Minze „✓ Abgegeben“, Kopf springt auf „5/5 abgegeben“. | F-005 |
| 2 | **7,0–11,0** Heatmap | Pille „Gruppen-Kalender“ · **„Sofort sehen, wann *alle* können.“** / „See instantly when *everyone* can.“ | Screen „Gruppe“ (W09). Heatmap baut sich als diagonale Welle auf (42 ms Staffel, Indigo-Rampe), Minze-Siegel auf allen „Alle können“-Tagen. Minze-Rahmen zeichnet 10.–17. Juli nach. Vorschlagskarte gleitet hoch: „✓ Alle dabei · Sa., 10. – Sa., 17. Juli · 7 Nächte · 5 von 5 können“ + Avatare. Tipp auf „Abstimmung starten“. | F-008, F-009 |
| 3 | **11,0–14,2** Abstimmen | Pille „Abstimmung“ · **„Abstimmen mit *einem Tipp*.“** / „Vote with *one tap*.“ | Screen „Abstimmen“ (W10). Tipp „Ja“ bei Option 1 → Indigo-Fläche + Häkchen-Ecke, Ergebnis-Balken wachsen erst **nach** der eigenen Stimme (D-18), Chip „★ Platz 1“. Tipp „Vielleicht“ bei Option 2. Avatar L füllt die letzte Lücke: „5 von 5 haben abgestimmt ✓“. Tipp „Termin festlegen“. | F-010, F-011 |
| 4 | **14,2–18,2** Feier | Pille „Termin steht“ · **„Termin fix. *Vorfreude an!*“** (Sonne) / „Date’s set. *Countdown on!*“ | Screen „Es geht los!“ (W11). Countdown „noch 86 Tage“ steht **sofort** (zählt nie hoch, CEO 2026-10-08). Schein glüht auf, Sonnenpunkt dreht seine **Ehrenrunde** (800 ms) mit Kometen-Schweif und rastet bei ca. 4 % ein (M-D10) – Pop 1 → 1,35 → 1, drei Funkel, Handy macht einen kleinen „Hüpfer“ (+3 %). **Konfetti-Burst** aus dem Ring über den ganzen Bildschirm + Konfetti-Regen von oben (116 Teilchen, 5 Token-Farben), gelber Schein hinter dem Handy. Ergebniskarte „✓ Termin steht fest · Es geht los! · Sa., 10. – Sa., 17. Juli 2027“, Schritt 3 füllt sich in Sonne. | F-012 |
| 5 | **18,2–21,6** Unterkunft | Pille „Unterkünfte“ · **„Unterkunft finden: *einfach swipen*.“** / „Find a place: *just swipe*.“ | Screen Unterkünfte (W18). Kartenstapel (3). Finger zieht „Steinhaus mit Meerblick“ nach rechts – Karte kippt mit, Stempel „♥ Gefällt“ blendet ab der Schwelle ein, ♥-Taste pulsiert, Karte fliegt raus, nächste rückt federnd nach. Tipp auf ✕ → „Altstadtwohnung“ fliegt mit Stempel „✕ Eher nicht“ nach links. „Villa mit Pool“ bleibt liegen. | F-031 |
| 6 | **21,6–25,0** Kosten | Pille „Kosten“ · **„Kosten teilen, *fair auf den Cent*.“** / „Split costs, *fair to the cent*.“ | Screen Kosten (W19). „Dein Stand: Du schuldest Ben 88,10 €“, Ausgabenliste gleitet gestaffelt ein (Steinhaus 1.260,00 € · Mietwagen 250,00 € · Fähre 96,00 € · Pizza 84,50 € – Summe 1.690,50 €, Anteil 338,10 €, du hast 250,00 € gezahlt → 88,10 € offen). Tipp „Als bezahlt markieren“ → Karte wird Minze, Siegel ploppt: **„Du bist ausgeglichen ✓“**. Kein Konfetti (die Feier gehört dem Termin). | F-035, F-036 |
| 7 | **25,0–28,0** Endkarte | – | Handy sinkt weg. Logo-Bildmarke (Variante auf Indigo) ploppt, Sonne steigt hinter den Wellen auf, Wellen schwingen einmal. **„Wir wollen *weg*“** / **„When do we *go?*“**, Claim „Euren gemeinsamen Urlaub finden – ohne Chat-Chaos.“ / „Find your holiday together – no group-chat chaos.“, Chips „Tage · Termin · Unterkunft · Kosten“, Fußzeile „Einladen per Link · läuft im Browser“. Ab 26,6 s steht alles still (≥ 1,4 s Lesezeit, guter Loop-Punkt). | Marke |

## 5. Motion-Regeln für das Video
- **Tokens wie im Produkt:** Dauern 140–800 ms, Kurven `standard`, `emphasized`, `exit`, Federn `spring-soft` und `spring-bouncy` (gleiche `linear()`-Stützpunkte wie `tokens.css` §6). Das Video zeigt also die echte Bewegung der App, nur dichter getaktet.
- **Ein Finger, eine Geste pro Szene.** Der Finger (weißer Kreis mit Indigo-Ring) erscheint 200 ms vor der Geste, Tipp = Eindrücken (−18 %) + Welle. So versteht man die Bedienung ohne Ton.
- **Zahlen zählen nie hoch** (Countdown, Beträge, Zähler springen) – wie im Produkt.
- **Szenenwechsel = App-Navigation:** neuer Screen gleitet 70 px von rechts mit `emphasized` (420 ms), alter gleitet 50 px nach links weg. Ausnahme Feier: Überblenden mit leichtem Heranzoomen (1,06 → 1).
- **Untertitel** kommen mit Feder (Pille zuerst, Satz 90 ms später) und gehen schnell (240 ms, `exit`). Zwischen zwei Untertiteln liegen 140–250 ms Pause, damit das Auge den Wechsel bemerkt.
- **Technik:** nur `transform`/`opacity`; Ausnahme ist der Ring (`stroke-dasharray`, wie im Produkt-Prototyp c) – für die Aufnahme unkritisch. Deterministisch: `render(t)` berechnet jeden Zustand aus der Zeit, Konfetti mit festem Seed (Mulberry32, Seed 20270710).

## 6. Musik (nur Vorschlag – nicht eingebaut)
- Charakter: **fröhlich, sommerlich, 110–124 BPM**, z. B. Ukulele/Pfeifen/Indie-Pop mit klarer Snare – Akzent (Becken/„Whoosh“) genau auf **15,35 s** (Sonnenpunkt rastet ein, Konfetti) und ein Abschluss-Akzent auf **25,25 s** (Logo).
- Wegen Lizenzen **keine** Musik in der Datei. Am einfachsten: beim Hochladen einen Titel aus der **Musikbibliothek der Plattform** wählen (Instagram/TikTok – dort lizenziert, aber nur für die Plattform); für WhatsApp-Status oder eigene Kanäle nur Titel mit klarer Lizenz (z. B. YouTube Audio Library, kostenpflichtige Lizenz von Epidemic/Artlist). Entscheidung: Auftraggeber.
- Für Schnitt auf den Takt: bei 120 BPM liegt alle 0,5 s ein Schlag – Szenenstarts (2,8 · 7,0 · 11,0 · 14,2 · 18,2 · 21,6 · 25,0 s) können um ± 100 ms verschoben werden, ohne die Komposition zu ändern (Zeiten stehen gesammelt im JS: `SCENES`, `CAPS`, `FK`).

## 7. Varianten (nicht gebaut, Vorschläge)
- **6-s-Bumper:** nur Feier (14,2–18,2 s) + Endkarte – für Story-Anzeigen.
- **15-s-Schnitt:** Hook → Heatmap → Feier → Endkarte (Szenen 0, 2, 4, 7).
- **Cover-Bild:** `?t=16000&pause=1` (Konfetti + Ring) oder `?t=27000&pause=1` (Endkarte).
- **Hell statt Indigo:** nicht empfohlen – Indigo-Hintergrund trennt Handy und Untertitel klar und ist die Markenfläche.

## 8. Offene Punkte
- **Claim** „Euren gemeinsamen Urlaub finden – ohne Chat-Chaos.“ ist ein Arbeitstitel (Produktmanager/Auftraggeber).
- **Endkarte ohne Link/Domain**, weil es noch keine öffentliche Adresse gibt (Arbeitsmodus Q25). Sobald es eine Domain gibt, Zeile „Einladen per Link · läuft im Browser“ durch die Adresse ersetzen.
- **Werbe-Aussagen** prüfen lassen (Operations/Recht): „läuft im Browser“ und „Einladen per Link“ sind Produktfakten; keine Preis- oder „kostenlos“-Aussage, solange das nicht entschieden ist.
- Kein Browser-Test durch den Motion Designer (keine Browser-Umgebung) – bitte bei der Aufnahme kurz die Szenen per `?scene=n` durchsehen.

---

## 9. v2 – drei Stile (2026-10-23, nach Sichtung durch den Auftraggeber)

### 9.1 Was sich gegenüber v1 ändert (gilt für alle drei Stile)
| # | Feedback | Umsetzung |
|---|---|---|
| 1 | „Jeder **malt** seine freien Tage“ missverständlich | **„Alle tragen ihre *freien Tage* ein.“** / „Everyone adds their *free days*.“ (B: „Alle tragen ihre / freien Tage ein.“) |
| 2 | Tage, an denen alle können, **grün** | Heatmap-Stufe „alle können“ = **Minze `#52E5B8`** mit Indigo-Zahl + Indigo-Siegel; Legende „■ alle können“; Vorschlags-Pille „✓ Alle können“ in Minze; Untertitel „***Grün** heißt: alle können.*“. Die übrigen Stufen bleiben die Lavendel/Violett-Rampe. Hinweis: In der App ist das im **Dunkelmodus** genau so, im Hellmodus ist „alle“ Indigo mit Minze-Siegel → Abstimmungspunkt M-P4. |
| 3 | In **Schritten** erzählen | ① **Zeitraum finden** (Tage eintragen → Gruppen-Kalender grün → abstimmen → Termin fix mit Konfetti-Ring) · ② **Unterkunft finden** (vorschlagen – Taste „+ Vorschlagen“, Karten „Vorschlag von Anna/Kemal/Mia“ – und swipen) · ③ **Kosten tracken** (unterwegs „+ Ausgabe eintragen“ → Blatt → Zeile erscheint, „Dein Stand“ springt) · ④ **Verrechnen** („Hab ich überwiesen“ → „Du bist quitt ✓“ → die anderen erledigt → „Alle sind quitt ✓“). Schritt-Nummer + Label immer sichtbar. |
| 4 | Neue **Kosten-Begriffe** (w19 E.2) | „Ben hat ausgelegt · für alle“, „auf dich 252,00 €“, „Wer hat ausgelegt?“, „Du zahlst noch 71,20 € / 88,10 € zurück. An Ben.“, „Hab ich überwiesen“, „Erledigt“, „Du bist quitt ✓“, „Alle sind quitt ✓ – Niemand muss mehr etwas überweisen.“, „Die Gruppe hat bisher … ausgegeben.“, Bereich „Ausgleichen“. EN: „Ben paid“, „your part“, „You owe €88.10. To Ben.“, „I’ve sent it“, „Done“, „You’re all square ✓“, „Everyone’s square ✓“. Keine alten Begriffe („bezahlt“, „schuldest“, „ausgeglichen“, „Saldo“). |
| 5 | Texte im Handy wirkten blass/unvollständig | (a) Jeder Screen hat einen **deckenden Hintergrund** und schiebt sich **über** den alten (kein Überblenden zweier halbtransparenter Screens mehr); (b) Inhalte kommen **mit** dem Screen herein statt nachträglich einzublenden – nur Ergebnisse (Häkchen, Balken, Siegel) erscheinen per Geste; (c) jede Szene hat eine **Ruhephase ≥ 0,6 s** im Endzustand, Untertitel stehen ≥ 2,3 s voll da; (d) Nebentexte im Handy mind. `ink-700`, ≥ 8,5 px (= 25 Video-px). |

**Rechnung (Fantasiedaten, geprüft):** Steinhaus 1.260,00 (Ben) + Mietwagen 250,00 (du) + Fähre 96,00 (Anna) = 1.606,00 € → Anteil 321,20 €, du zahlst noch **71,20 €** zurück. + Pizza 84,50 € (Kemal) = **1.690,50 €** → Anteil 338,10 €, du zahlst noch **88,10 €** an Ben. Alle anderen an Ben: Anna 242,10 · Kemal 253,60 · Mia 338,10 (Summe 921,90 € = Bens Plus). „auf dich“: 252,00 + 50,00 + 19,20 + 16,90 = 338,10 €.

**Technik:** Gemeinsame Teile in [`shared/`](shared/) – `promo-core.js` (Easing = Motion-Tokens, Konfetti mit Seed, Abspieler + Aufnahme-API), `promo-screens.js` (sieben nachgebaute Screens + Gruppenchat + Handy + Screen-Folge, Texte DE/EN), `promo-screens.css`. Jeder Screen hat seine eigene, relative Choreografie (inkl. Finger); die Stil-Dateien entscheiden nur Rahmen, Kamera, Untertitel und Zeitpunkte. Schnittstelle wie v1 (`?lang=en`, `?t=`, `?scene=`, `?pause=1`, `?loop=1`, `?debug=1`, `?scale=`, `__promoReady/Render/Done/Duration`).

### 9.2 Stil A „Clean Product“ – [a-clean/index.html](a-clean/index.html) · 28,0 s
Ruhig, hochwertig, **hell** (Nebel-Weiß mit zarten Lavendel/Minze-Lichtern), Handy (Maßstab 0,88) zentral, weiche Schiebe-Übergänge wie in der App. Oben eine weiße Schritt-Pille „**①** Zeitraum finden ● ○ ○ ○“ (bleibt über den ganzen Schritt stehen), darunter **ein** Satz (Jakarta 800, 25 px, Schlüsselwort Lavendel, „Grün“/„alle quitt“ mit Minze-Marker).

| # | Zeit (s) | Schritt-Pille | Untertitel | Bild |
|---|---|---|---|---|
| 0 | 0,0–2,4 | ● Kennt ihr das? | Wann fahren wir *eigentlich* weg? | Chat-Karte „Urlaub 2027“, Blasen ploppen, „47 neu“, Karte zittert und kippt weg; Handy fährt von unten ein |
| 1 | 2,4–5,6 | ① Zeitraum finden | Alle tragen ihre *freien Tage* ein. | „Meine Tage“: Finger wischt 8.–11. und 12.–18. Juli, „✓ Gespeichert“, „Fertig – abgeben“ → „✓ Abgegeben“, Kopf 5/5 |
| 2 | 5,6–8,8 | ① | ***Grün** heißt: alle können.* | Gruppen-Kalender: Welle, 10.–17. Juli **grün** + Siegel, Rahmen um den Zeitraum, Vorschlag „✓ Alle können“ + Avatare, Tipp „Abstimmung starten“ |
| 3 | 8,8–11,4 | ① | Abstimmen mit *einem Tipp*. | „Ja“ bei Option 1 (Balken, „★ Platz 1“), „Vielleicht“ bei Option 2, „5 von 5 haben abgestimmt ✓“, Tipp „Termin festlegen“ |
| 4 | 11,4–14,6 | ① | Termin steht. *Vorfreude an!* | „Es geht los!“: Ring-Ehrenrunde, Konfetti über die Bühne (12,55 s), Sonnenschein, Handy-Hüpfer |
| 5 | 14,6–17,6 | ② Unterkunft finden | Unterkünfte vorschlagen, *alle swipen*. | Kopf mit „+ Vorschlagen“, Karte „Vorschlag von Anna“ nach rechts (♥ Gefällt), Altstadtwohnung per ✕ nach links |
| 6 | 17,6–21,0 | ③ Kosten tracken | Unterwegs Kosten *bequem eintragen*. | „+ Ausgabe eintragen“ → Blatt „Pizza am Hafen · 84,50 € · Wer hat ausgelegt? Kemal · Alle 5“ → Speichern → Zeile erscheint oben (Minze-Tönung), „Du zahlst noch 71,20 €“ springt auf **88,10 € zurück. An Ben.** |
| 7 | 21,0–24,6 | ④ Verrechnen | Bequem verrechnen – *alle quitt*. | „Ausgleichen“: „An Ben 88,10 €“ → „✓ Hab ich überwiesen“ → Karte Minze „**Du bist quitt ✓**“; Ausgleiche der anderen werden „✓ Erledigt“; Karte wechselt auf „**Alle sind quitt ✓** – Niemand muss mehr etwas überweisen.“ |
| 8 | 24,6–28,0 | – | – | Endkarte hell: Bildmarke (Sonne steigt), „Wir wollen *weg*“, Claim, vier Schritt-Chips ①–④, „Einladen per Link · läuft im Browser“; ab 26,4 s Standbild |

### 9.3 Stil B „Kinetic Type“ – [b-kinetic/index.html](b-kinetic/index.html) · 29,0 s
Mutig und taktorientiert: **harte Schnitte auf einem 250-ms-Raster** (120 BPM), vollflächige Farbflächen (Indigo, Minze, Sonne, Lavendel, Koralle), große Typo, das Handy als **Ausschnitt** (Maßstab 1,05–1,6) mit Kamerafahrten auf das Detail, das gerade passiert. Untertitel als schräge Farbstreifen (Jakarta 800, 31 px), die von links aufziehen; darüber der Chip „① Zeitraum finden“. Zwischen den Schritten eine **Schritt-Karte** mit riesiger Ziffer (250 px) und „Schritt 1 von 4“.

| # | Zeit (s) | Fläche | Inhalt |
|---|---|---|---|
| 0 | 0,0–3,0 | Indigo · Lavendel · Sonne · Koralle · Indigo | Wort-Schläge im Takt: „Wann?“ – „Juli?“ – „August?!“ – „**47** neue Nachrichten“ (zittert) – „Geht auch *einfacher.*“ |
| 1 | 3,0–3,75 | Minze | Schritt-Karte **1** „Zeitraum finden“ |
| 2 | 3,75–6,75 | Indigo | Zoom 1,55 auf die Kalenderzeilen, Finger trägt ein; Fahrt zur Taste „Fertig – abgeben“ · „Alle tragen ihre / *freien Tage ein.*“ |
| 3 | 6,75–9,75 | Indigo | Gruppen-Kalender, Zoom 1,6 auf die **grünen** Tage, Fahrt zum Vorschlag · „*Grün heißt:* / alle können.“ |
| 4 | 9,75–12,1 | Indigo | Abstimmen, Fahrt zu „5 von 5“ und „Termin festlegen“ · „Abstimmen. / *Ein Tipp.*“ |
| 5 | 12,1–15,1 | Indigo + Sonnenschein | Ring + Konfetti (13,25 s) · „Termin steht. / *Vorfreude an!*“ |
| 6 | 15,1–15,85 | Lavendel | Schritt-Karte **2** „Unterkunft finden“ |
| 7 | 15,85–18,65 | Minze | Swipen · „*Vorschlagen.* / Alle swipen.“ |
| 8 | 18,65–19,4 | Sonne | Schritt-Karte **3** „Kosten tracken“ |
| 9 | 19,4–22,4 | Sonne | Blatt „Ausgabe eintragen“, dann Fahrt zu „Dein Stand“ · „*Unterwegs:* / + Ausgabe. Fertig.“ |
| 10 | 22,4–23,15 | Indigo | Schritt-Karte **4** „Verrechnen“ |
| 11 | 23,15–26,15 | Lavendel | „Hab ich überwiesen“ → Fahrt über „Erledigt“ → Zoom 1,5 auf „**Alle sind quitt ✓**“ · „*Am Ende:* / alle quitt ✓“ |
| 12 | 26,15–29,0 | Indigo | Logo dreht sich ein, „Wir wollen“ / riesig „**weg**“ (Minze), Claim, Chips ①–④, Fußzeile; ab 27,8 s Standbild |

Barrierefreiheit Video: höchstens 2 Farbschnitte pro Sekunde (WCAG 2.3.1: < 3 Blitze/s), Koralle nur einmal 0,75 s, keine Rot-Wechsel.

### 9.4 Stil C „Reise-Abenteuer“ – [c-abenteuer/index.html](c-abenteuer/index.html) · 30,0 s
Verspielt, wie ein Reise-Tagebuch: **Kartenpapier** (Creme mit feinem Lavendel-Raster, Meer- und Sonnenflecken), **Gepäckanhänger** als Schritt-Etiketten („① Zeitraum finden“), Handys mit **Klebeband** an den Ecken, **Sticker** aus `docs/design/assets/illustrations/` (submitted, vote-done, empty-stays, empty-costs, seal) mit weißem Stanzrand. Eine **Reiseroute** schlängelt sich durch alle Stationen – wie im Cockpit „Reiseverlauf“: **gestrichelt = kommt noch, durchgezogen Minze = geschafft**, ein **Sonnen-Marker** zeigt „hier sind wir“ und wandert während jeder Station langsam weiter (Fortschritt). Beim Aufbruch zur nächsten Station wird die Stationsnummer zum Minze-Häkchen (Stempel). Die Kamera fährt die Route Seite für Seite nach unten (900 ms, `standard`).

| # | Zeit (s) | Seite | Etikett · Überschrift | Bild |
|---|---|---|---|---|
| 0 | 0,0–3,2 | Start | „Kennt ihr das?“ · Wann fahren wir *eigentlich* weg? | Chat-Karte schräg auf der Karte, Start-Fähnchen; ab 2,3 s Fahrt zu Station 1 |
| 1 | 3,2–6,2 | ① | Zeitraum finden · Alle tragen ihre *freien Tage* ein. | Meine Tage; Sticker „abgegeben“ klebt sich an (6,0 s) |
| 2 | 6,2–9,2 | ① | ***Grün** heißt: alle können.* | Gruppen-Kalender grün |
| 3 | 9,2–11,7 | ① | Abstimmen mit *einem Tipp*. | Abstimmen |
| 4 | 11,7–14,5 | ① | Termin steht – *Vorfreude an!* | Ring + Konfetti (12,85 s), Sticker Vorfreude-Ring; 14,5 s: ① wird ✓, Fahrt zu ② |
| 5 | 15,4–18,3 | ② | Unterkunft finden · Unterkünfte vorschlagen, *alle swipen*. | Swipen, Sticker Haus |
| 6 | 19,2–22,5 | ③ | Kosten tracken · Unterwegs Kosten *bequem eintragen*. | + Ausgabe, Sticker Geldbörse |
| 7 | 23,4–26,6 | ④ | Verrechnen · Am Ende verrechnen: *alle quitt*. | Ausgleichen → „Alle sind quitt ✓“, Siegel-Sticker |
| 8 | 27,4–30,0 | Ziel | – | Route endet im Logo (Ziel), „Wir wollen *weg*“, Claim, Chips als Anhänger mit ✓; ab 28,6 s Standbild |

Zwischen den Stationen (2,3–3,2 · 14,5–15,4 · 18,3–19,2 · 22,5–23,4 · 26,6–27,4 s) fährt die Kamera; Etikett und Überschrift der neuen Station stehen bei Ankunft schon da.

### 9.5 Empfehlung
- **Für Reels/TikTok: B** (stoppt das Scrollen in den ersten 0,5 s, Takt-Schnitte, große Typo – auch ohne Ton lesbar).
- **Für WhatsApp-Status, Website, Präsentation: A** (erklärt am ruhigsten, wirkt am „produktnahesten“).
- **C** ist der sympathischste und markantste Stil (Reiseroute = Produktidee „Reiseverlauf“), braucht aber die meiste Optik-Abnahme (Designer) und ist mit 30,0 s am längsten.
- Alle drei teilen dieselben Screens → Texte/Zahlen ändern sich an **einer** Stelle (`shared/promo-screens.js`).
