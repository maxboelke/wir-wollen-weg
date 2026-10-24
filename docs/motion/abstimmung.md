# Abstimmung Motion ↔ Design, UI/UX, Entwicklung

Stand: 2026-10-23 (Runde 3) · Verantwortlich: Motion Designer · Status: **M-D1–M-D12, M-U1–M-U12 geklärt** (CEO 2026-10-08); **UM-1 – UM-13 beantwortet** (§4); **UM-14 – UM-19 beantwortet** (§5, Runde 4); offen: M-U13–M-U18, M-D13–M-D14, M-X8–M-X10
Bezug: [motion-system.md](motion-system.md) · [interaktionen.md](interaktionen.md) · [prototypes/](prototypes/README.md) · Antworten Designer: [design/abstimmung-ux.md §6](../design/abstimmung-ux.md) · Antworten UI/UX: [ux/abstimmung-design.md §9](../ux/abstimmung-design.md)

Der Motion Designer ändert keine Dateien in `docs/design/` oder `docs/ux/`. Wünsche stehen hier; Antworten bitte in den jeweiligen eigenen Abstimmungsdateien bzw. über den CEO.

**Status-Legende:** **geklärt** = beantwortet und in motion-system/interaktionen/Prototypen eingearbeitet · **offen** = Antwort ausstehend.

---

## 1. An den Designer

| # | Thema | Bitte (Runde 1) | Antwort Designer (abstimmung-ux §6) | Eingearbeitet in | Status |
|---|---|---|---|---|---|
| **M-D1** | Motion-Tokens in `tokens.css` | Dauern, Easing, Federn als `linear()`, Distanzen, Skalen, Staffel; Reduced-Motion auch unter `data-motion` | Übernommen 1:1, inkl. `:root[data-motion="reduce"]` | motion-system §3, §3.7; Prototypen (Token-Block) | **geklärt** |
| **M-D2** | `duration-fade` bleibt bei Reduced Motion | 140 ms in beiden Reduce-Blöcken | Übernommen | motion-system §3.7 | **geklärt** |
| **M-D3** | Animierbare Illustrationen (`data-anim`) | Ebenen je SVG, transformierte Gruppen in äußerer Gruppe, keine Texte, Endzustand statisch, IDs präfixiert | Umgesetzt für alle 14 Dateien. **Abweichungen:** `hero.svg` = Übersichtskarte (`plate`, `calendar`, `ring`, `friends`, `cells`, `band`, `sun`, `seal`, kein `sea`); `vote-done.svg` = kompakter Vorfreude-Ring (`backdrop`, `glow`, `confetti`, `track`, `ring`, `knob`); `invite.svg` = `letter` (Reisekarte) + `plane` | motion-system §5.5 (Tabelle); interaktionen W01-01, W01-03, W03-01, W04-03, W08-10; Prototyp d (hero v1.0 inline) | **geklärt** |
| **M-D4** | Siegel als Komponente | Kreis + Häkchen, 20/40/64 px | `seal.svg` (`disc`, `check`, `sparks`), **Minze mit Indigo-Häkchen** statt Sonne. Siegel nur Beitritt, Abgabe, alle haben abgestimmt; **Feier F-012 = Vorfreude-Ring** (CEO) | G-21; W02-05, W03-06, W08-10, W09-09; W11-02 neu; Prototypen a, c, d, e | **geklärt** |
| **M-D5** | Konfetti-Material | Formen + Farben als Tokens | Rechteck 8–9 × 12–15 (r 3), Kreis Ø 10, Sonnenstrahl 11 × 2,5, Vier-Zack-Funkel 12; `--ww-confetti-1…5` = Minze, Sonne, Lavendel, Koralle, Weiß; fällt über dem Indigo-Cockpit | motion-system §3.6; W11-02; Prototyp c (Puff) | **geklärt** |
| **M-D6** | Regler der Richtung | Tempo, Federung, Material | Tempo 1,0; Federn unverändert; Material wie M-D5; **Zahlen zählen nicht hoch** | motion-system §3.6, §2 Nr. 4; G-16 | **geklärt** |
| **M-D7** | Gleitender Pinsel-Indikator | ein Indikator, Marke ● entfallen/verschieben? | Einverstanden; ● sitzt **im** Indikator oben rechts und gleitet mit; Label-Fettung wechselt sofort | W08-06; Prototyp a | **geklärt** |
| **M-D8** | design-system §8 verweist auf Motion | Verweis + Heatmap-Farbwechsel als Ausnahme | Umgesetzt | motion-system §7 Regel 1 | **geklärt** |
| **M-D9** | Hover-Schatten als Pseudo-Element | `opacity` statt `box-shadow` | Übernommen | G-17 | **geklärt** |

### 1.1 Neu an den Designer (Runde 2)

| # | Thema | Bitte / Vorschlag | Begründung | Status |
|---|---|---|---|---|
| **M-D10** | **Ring-Anteil im Moment der Feier** | design-system §9.12: Füllgrad = vergangene Vorfreude-Zeit (Festlegung → Abreise), mind. 4 %. Bei der Feier (Orga direkt nach Festlegung) ist der Ring also bei **≈ 4 %** – `countdown-ring.svg` zeigt dagegen 96,5 % bei „23 Tagen“. Bitte bestätigen, dass der Endzustand der Feier wirklich ≈ 4 % ist. Motion löst das mit der **Ehrenrunde** (Sonnenpunkt läuft eine volle Runde + Anteil, Füllung folgt als Schweif) – die Feier wirkt so unabhängig vom Anteil gleich groß. Zusätzlich: Der Kommentar in der SVG nennt „dashoffset 3,5; dasharray 96.5 100“, die Datei selbst hat `dashoffset 0` (beides ergibt 96,5 % – nur die Beschreibung angleichen). | Endzustand muss stimmen, sonst „springt“ der Ring nach der Feier. Prototyp c hat dafür einen Regler „Ring-Anteil“ (4 % · 35 % · 96,5 %). | **offen** |
| **M-D11** | **Ruhende Konfetti-Teilchen bei späteren Besuchen** | Endzustand der Datei = 12 Teilchen + 3 Funkel bleiben im Cockpit liegen. Empfehlung Motion: bei **späteren Besuchen** (W11-04) `confetti` und `sparkles` ausblenden, nur Ring + Schein zeigen – der Alltag bleibt ruhig, die Feier bleibt besonders. Bei der Feier selbst bleiben sie als Endzustand liegen. | Design-Entscheidung (Optik); Bewegung ist davon nicht betroffen. | **offen** |
| **M-D12** | **Haptik-Formulierung in design-system §8.3 Nr. 5** | Dort steht „wenn der Vorfreude-Ring/das Siegel schließt“. Nach Q17 gibt es nur **zwei** Stellen: Ziehen nach Halten und Feier-Abschluss (Ring rastet ein). Bitte „/das Siegel“ streichen, damit der Developer keine dritte Stelle baut. | Eindeutige Übergabe; Abgabe-Siegel vibriert nicht. | **offen** |

## 2. An UI/UX

| # | Thema | Bitte (Runde 1) | Antwort UI/UX (abstimmung-design §9) | Eingearbeitet in | Status |
|---|---|---|---|---|---|
| **M-U1** | Schalter „Bewegung reduzieren“ | W13, Standard = System | **Ja** (Q17 a). Präzisierung: Gerät reduziert → Schalter **an und nicht bedienbar** mit Grund | motion-system §6.3; W13-01; Prototypen (Schalter bleibt) | **geklärt** |
| **M-U2** | Dauer großer Erfolgsmomente | Kern ≤ 1 s, Ausklang ≤ 2,6 s, Text ≤ 300 ms bedienbar | Übernommen; zusätzlich `visibilitychange` beendet, nichts wiederholt sich, **kein Hochzählen** | W11-02 Zeitleiste; motion-system §3.5 | **geklärt** |
| **M-U3** | Umsortieren der Abstimmungskarten | FLIP mit Scroll-Anker oder beim nächsten Öffnen | **Variante 2: kein Umsortieren, solange man auf der Seite ist**; sortiert beim nächsten Öffnen | motion-system §5.10; W10-08; Prototyp c (Taste „Abstimmen neu öffnen“) | **geklärt** |
| **M-U4** | Sticky „Reise planen“ (Landing) | fixierte CTA-Leiste | **Nicht im MVP**; Wiederholung `[Reise planen]` am Seitenende | W01-05 (entfällt); Prototyp d | **geklärt** |
| **M-U5** | Code-Schritt optimistisch | sofort wechseln, Fokus synchron | **Übernommen** mit Bedingungen: Formatprüfung vorher, Status «Code wird gesendet …», Countdown erst nach Server-OK, Fehler → `history.replaceState` zurück, Fokus ins E-Mail-Feld, neutrale Antwort | W02-01, W03-03; Prototyp e (inkl. Fehler-Schalter) | **geklärt** |
| **M-U6** | Feier auch für Mitglieder | einmal pro Gerät | **Ja** (Q17 b), **einmal pro Person und Festlegung, serverseitig** je Mitgliedschaft; Auslöser erstes Öffnen der Übersicht | motion-system §5.8; W11-02, W11-04; Prototyp c (Rolle „Mitglied“) | **geklärt** |
| **M-U7** | Vorschlag im Kalender – was bleibt | Umriss/Label 4 s, Band bleibt | Übernommen; Band bleibt, solange der Vorschlag in der Vorschlag-Leiste gewählt ist; direkt geöffnet: Vorschlag 1 mit Band, ohne Umriss/Label, ohne Scroll-Sprung | W09-06, W09-13 | **geklärt** |
| **M-U8** | Heatmap-Aufbau nur über das Segment | – | Einverstanden; nur erstes Öffnen in der Sitzung, nicht beim Blättern | W09-05 | **geklärt** |
| **M-U9** | Geste-Hinweis | ≤ 2,8 s, reduziert Skizze 2,5 s | Übernommen; **reduziert: statische Skizze ohne Zeitlimit** bis der Hinweis geschlossen wird; nicht bei Tastatur-Fokus | W03-07; motion-system §6.2; Prototyp a | **geklärt** |
| **M-U10** | Fokus bei der Feier | Fokus sofort auf h1 | Übernommen: **Orga** sofort auf h1 (`aria-describedby` → Datum, keine Live-Ansage); **Mitglied** kein Fokussprung | W11-02; motion-system §6.1; Prototyp c | **geklärt** |
| **M-U11** | Tab-Richtung | – | Kein Einwand; nur bei Tipp, nicht bei Direktaufruf/Zurück/Weiterleitung; reduziert Fade | G-02 | **geklärt** |

Ebenfalls aus UX §9 übernommen: Konflikt (3) „Initiale reiht sich in Avatar-Reihe ein“ (W03-06) **entfällt** – eingearbeitet.

### 2.1 Neu an UI/UX (Runde 2)

| # | Thema | Frage / Vorschlag | Status |
|---|---|---|---|
| **M-U12** | **Wo landet die Orga nach dem Festlegen?** | Der Vorfreude-Ring sitzt im Cockpit der **Übersicht** (design-system §9.12). Die Orga legt im Tab **Abstimmen** fest (Sheet W11-01). Prototyp c wechselt nach dem Server-OK direkt zur Übersicht (Tab-Pille springt ohne G-02-Bewegung, die Feier ist die Bewegung) und setzt den Fokus auf die h1. Bitte in user-flows D.3 bestätigen oder anders festlegen (z. B. Ergebnis-Karte + Ring im Tab Abstimmen). | **offen** |

## 3. An Developer / Operations (über den CEO)

| # | Thema | Vorschlag | Status |
|---|---|---|---|
| **M-X1** | Bibliothek | **Keine Animationsbibliothek im MVP.** CSS + Tokens + WAAPI, eigener Helfer `src/lib/motion.ts` (≈ 1–2 KB). Wiedervorlage `motion`, falls eigener FLIP-/Sheet-Code ausufert. | offen (Developer, zur Kenntnis) |
| **M-X2** | View Transitions | Next 16 `experimental.viewTransition` ist experimentell → **nicht im MVP**; Spike nach dem MVP. | offen (Developer, zur Kenntnis) |
| **M-X3** | Tests & Budget | Playwright-Kernflows mit `reducedMotion: 'reduce'`, `'no-preference'` **und** `data-motion="reduce"`; 4× CPU-Drosselung, Long Tasks < 50 ms beim Ziehen/Feiern; Sichtprüfung In-App-Browser nach T2. | offen (Developer/Reviewer) |
| **M-X4** | Feier-Modul | `celebrateRing` per `import()` beim Ereignis laden; `pointer-events: none`, `aria-hidden`, Abbruch bei Interaktion und `visibilitychange`. | offen (Developer) |
| **M-X5** | Inkrement 1 | Für F-040–F-042 die Code-Feld-Bewegungen W02-01 … W02-08 **inkl. optimistischem Code-Schritt (M-U5)** mitbauen (Prototyp e). | offen (Developer) |
| **M-X6** | **Feier-Merker serverseitig** | Pro Mitgliedschaft die ID/Version der Festlegung speichern, für die die Feier gezeigt wurde (z. B. `celebratedFixationId`); setzen beim sichtbaren Start; neue Festlegung → neue ID → erneut. | offen (Developer) |
| **M-X7** | **Ring per WAAPI** | Ehrenrunde animiert `stroke-dasharray`/`stroke-dashoffset` (Ring) und `transform` (Sonnenpunkt) aus gemeinsam vorberechneten Keyframes. In Safari/iOS-WebView ≥ 17 und Android WebView kurz prüfen; Fallback ohne Unterstützung: Ring steht sofort im Endzustand (kein Fehler, nur weniger Bewegung). | offen (Developer, Test T2) |

## 4. Runde 3 – Cockpit „Reiseverlauf“ und Unterkünfte (2026-10-23)

Antworten auf [ux/abstimmung-design.md §12.3, §13 und §14.2](../ux/abstimmung-design.md). Ausführliche Spezifikation: [interaktionen.md W16, W17, W18](interaktionen.md#w18--unterkünfte-swipen-rangliste-festlegen-f-031-inkrement-9---f). Prototyp: [f-unterkunft-swipen.html](prototypes/f-unterkunft-swipen.html).

### 4.1 Antworten an UI/UX – UM-1 bis UM-7 (Cockpit, gegengeprüft am gebauten Code)

| # | Antwort Motion | Katalog | Status |
|---|---|---|---|
| **UM-1** Konfetti auf Antippen | **Einverstanden und so gebaut** (`confettiRound`: ≤ 1,2 s, Sperre 3 s, kein Puff, keine Vibration; reduziert kurzes Aufglühen 140 ms). Hinweis: Die Teilchen liegen im Cockpit-Ring dauerhaft (Mockup C v2); M-D11 („ausblenden bei späteren Besuchen“) betraf nur die alte Ergebnis-Karte W11-04 und gilt für den Ticket-Ring nicht. | W16-01 | **geklärt** |
| **UM-2** Weg baut sich auf | **Einverstanden, gebaut.** Läuft richtigerweise nur bei Client-Rendern (R-017); bei hartem Neuladen steht der Weg sofort – gewollt. | W16-02 | **geklärt** |
| **UM-3** Heute-Marker | **Einverstanden**, eine kleine Korrektur: gebaut 3 × 1,6 s ab 480 ms = Ende bei 5,28 s. Empfehlung **3 × 1,4 s** (Ende 4,68 s), damit sicher nichts > 5 s automatisch läuft (WCAG 2.2.2). | W16-03 | **geklärt** (Fix an Developer, M-X8) |
| **UM-4** Station neu erledigt | **Einverstanden mit den UX-Bedingungen** (ein Pop, keine Ansage, kein FLIP, reduziert statisch). Korrektur: Pop **nie kleiner** als der gemalte Zustand – `scale 1 → 1,25 → 1` ohne Verzögerung statt `0,6 → 1` nach 120 ms (sonst zuckt der server-gerenderte Marker). | W16-04 | **geklärt** (Fix an Developer, M-X8) |
| **UM-5** Aufklappen | **Bewegung der Einträge ja, Höhen-Animation nein.** Die gebaute `grid-template-rows`-Transition ist eine Layout-Animation (motion-system §5.4/§7, G-14). Empfehlung: Transition entfernen, Layout springt, Einträge blenden gestaffelt ein (ist schon gebaut). Falls der CEO die weiche Höhe behalten will: als dokumentierte Ausnahme nur für kurze Listen (≤ 6 Einträge) in diesem einen Bauteil. | W16-05 | **geklärt** (Fix an Developer, M-X8 – oder CEO-Ausnahme) |
| **UM-6** Mini-Ring | **Einverstanden, gebaut** (IntersectionObserver, Fade 140 ms, bleibt bei reduzierter Bewegung). | W16-06 | **geklärt** |
| **UM-7** Abreisetag | **Einverstanden, gebaut** (einmal je Person, Server-Merker, Start erst bei sichtbarem Tab, Vorrang der großen Feier, reduziert nur Satz). | W16-07 | **geklärt** |

### 4.2 Antworten an UI/UX – UM-8 bis UM-13 (Unterkünfte, Swipen)

| # | Antwort Motion | Katalog | Status |
|---|---|---|---|
| **UM-8** Ziehen + Stempel | **Übernommen und präzisiert:** Slop 8 px (danach \|dx\| > \|dy\|, sonst Scroll), Randstreifen 16 px, Versatz ohne Sprung (dx − 8), Rotation tx/18, max. ±12°, Drehpunkt unten Mitte. Stempel-Deckkraft ab 16 px bis zur Schwelle, Skalierung 0,9 → 1, Neigung fest (♥ oben links −12°, ✕ oben rechts +12°). Zweite Karte kommt beim Ziehen halb näher (95 → 97,5 %, 8 → 4 px). **Neu W18-02:** an der Schwelle nickt der Stempel einmal und die passende Taste zeigt ihren Gedrückt-Look – das ist der Ersatz für Vibration. Reduziert: folgt dem Finger ohne Rotation; Stempel-Deckkraft bleibt (direkte Rückmeldung). | W18-A, W18-01, W18-02 | **geklärt** |
| **UM-9** Auslösen / Ausfliegen | **Übernommen mit einer Änderung:** Nach einer **Geste** nicht `ease-exit`, sondern **`linear` mit übernommenem Schwung** (Dauer = Restweg / max(v, 1,2 px/ms), 140–220 ms) – `ease-exit` startet langsam und würde die fliegende Karte beim Loslassen kurz „stocken“ lassen. Nach **Taste/Pfeil** (Karte startet aus der Ruhe) wie vorgeschlagen `base` · `ease-exit`. Schwellen: 0,3 × Kartenbreite (geklemmt 80–140 px) oder ≥ 0,6 px/ms ab 24 px; bei schnellem Schwung entscheidet dessen Richtung. Nächste Karte **im selben Frame** oberste und bedienbar, federt `base` · `spring-soft` von ihrer aktuellen Lage auf 100 %. Ausflug 1,2 × Kartenbreite, Deckkraft ab 50 % → 0, max. 2 fliegende Karten. Gedrückt gehaltene Pfeiltaste bewertet nur einmal (`event.repeat` ignorieren). Reduziert: Überblenden 140 ms. | W18-03 … W18-05 | **geklärt** |
| **UM-10** Zurückfedern + Rückgängig | **Übernommen:** Zurückfedern `slow` · `spring-soft` (unterbrechbar, ein neuer Griff friert die Feder ein). Rückgängig: Karte kommt aus ihrer Ausflugrichtung (`slow` · `spring-soft`), **ihr alter Stempel** steht anfangs voll da und blendet aus (erklärt die Rücknahme); bisher oberste Karte wird zweite. Reduziert: zurückfedern sofort, Rückgängig Überblenden. | W18-06, W18-07 | **geklärt** |
| **UM-11** Stapel-Ende + Rangliste | **Übernommen:** Siegel **64 px** wie die Abgabe (W08-10) – erst nach Server-Bestätigung aller Bewertungen (sonst «Speichert …» ab 400 ms). Fokus sofort auf h2. Ranglisten-Staffel einmal je Freischaltung (Merker je Reise), nur bei Client-Rendern, nicht für die Orga – als **MVP+** (MVP darf statisch sein). | W18-08, W18-09 | **geklärt** |
| **UM-12** Festlegen / gebucht | **Übernommen, kein Konfetti, keine Vibration.** Festlegen: „Eure Unterkunft“ tritt ein, **Siegel 40 px** ploppt (nur für die handelnde Orga, kein Server-Merker), Snackbar. Gebucht: das ✓ im Chip ist ein **Siegel 20 px** und ploppt; Chip überblendet. Scheitern: zurück per Überblenden ohne Rückwärts-Siegel. Aufheben/Doch nicht/UX-9: E0. | W18-11 … W18-13 | **geklärt** |
| **UM-13** Haptik | **Bestätigt: keine zusätzliche Vibration.** Begründung: Bei bis zu 30 Karten würde eine Vibration je Schwelle/Auslösen schnell lästig; iOS (Mehrheit der Gruppe in WhatsApp/Instagram) kann ohnehin nicht vibrieren, d. h. das Gefühl muss optisch tragen (W18-02); Q17 bleibt unverändert bei zwei Stellen. **Keine Q17-Erweiterung vorgeschlagen.** | W18-18, motion-system §6.4 | **geklärt** |

### 4.3 Neu an UI/UX (Runde 3)

| # | Thema | Frage / Vorschlag | Status |
|---|---|---|---|
| **M-U13** | **Tastenreihe beim Swipen fixieren** | Karten sind unterschiedlich hoch (lange Titel, Notiz, ohne Bild bei 200 %). Steht die Tastenreihe direkt unter dem Stapel, springt sie nach jeder Bewertung – wer schnell `♥ ♥ ✕` tippt, trifft die falsche Taste (motion-system §5.10). Vorschlag: Tastenreihe + Hinweis als **fixierte Leiste unten** (Muster ux-spec §4.3, `env(safe-area-inset-bottom)`, Seite bekommt passenden `scroll-padding-bottom`); Stapel darüber. Alternative: Stapelhöhe merkt sich die größte bisher gezeigte Karte und wächst nur (springt seltener, aber nicht nie). | **offen** |
| **M-U14** | **Fokus nach «Als gebucht markieren»** | Die Primär-Taste wird zur Text-Taste «Doch nicht gebucht» – der Fokus verlöre sein Ziel. Vorschlag: Fokus sofort auf «Doch nicht gebucht» (ersetzt den Auslöser), umgekehrt beim Rückgängig auf `[Als gebucht markieren]`. Bitte in W18 E.7.3 bestätigen. | **offen** |
| **M-U15** | **Fokus in der ausfliegenden Karte** | Liegt der Fokus beim Bewerten (Pfeiltaste) auf dem Portal-Link der obersten Karte, verschwindet sein Element. Vorschlag: Fokus auf die h2 der neuen obersten Karte (`tabindex="-1"`); am Ende wie E.5.4 auf «Geschafft!». Bitte bestätigen oder anders festlegen. | **offen** |

### 4.4 Neu an den Designer (Runde 3)

| # | Thema | Bitte / Vorschlag | Status |
|---|---|---|---|
| **M-D13** | **Siegel an „Eure Unterkunft“** | UM-12 braucht einen Platz für das Siegel. Vorschlag: **40 px, überlappt die rechte obere Ecke des Bildes** (wie ein Stempel auf dem Foto, 3-px-Rand in Fläche), bleibt **dauerhaft** als Zeichen „das ist eure“ (statisch, `aria-hidden`); die Bewegung (Plopp) sieht nur die Orga direkt nach dem Festlegen. Bitte in D-51 aufnehmen oder anderen Platz nennen. | **offen** |
| **M-D14** | **Stempel und Tasten-Gedrückt-Look (zu D-47/D-49)** | Für die Bewegung nötig: Stempel als **ein** Element (Icon + Wort) mit fester Neigung ±12°, `max-width` 60 % der Karte, darf zweizeilig umbrechen; deckend genug, um auf jedem Foto lesbar zu sein (heller Grund ≈ 92 % statt Verlauf, kein `backdrop-filter`). Für W18-02 einen **Gedrückt-/Scharf-Look** der 64-px-Tasten, der ohne Bewegung wirkt (z. B. gefülltes Icon + Ring), damit er auch bei reduzierter Bewegung trägt. Farben (Minze vs. Lavendel für ♥, neutral für ✕) entscheidet der Designer – die Bewegung ist davon unabhängig. | **offen** |

### 4.5 An Developer (über den CEO)

| # | Thema | Vorschlag | Status |
|---|---|---|---|
| **M-X8** | **Kleine Cockpit-Korrekturen** (niedrig, z. B. im Pflege-Paket von Inkrement 9) | (a) `route.module.css` `.pulse::after`: `1.6s` → `1.4s` (W16-03). (b) `route-view.tsx` UM-4: Keyframes `scale(1) → scale(1.25) @0.35 → scale(1)`, ohne `delay`, Kurve `EASING.standard`, Dauer `moderate` (W16-04). (c) `route.module.css` `.expand`: `transition: grid-template-rows …` entfernen (Inhalt springt, `revealEntries` bleibt) – sofern der CEO keine Ausnahme beschließt (W16-05). | **offen** |
| **M-X9** | **Karten-Geste ohne Bibliothek** | Pointer Events + WAAPI, Parameter W18-A als Konstanten neben `src/lib/motion.ts`; Unterbrechen per `commitStyles()` + `cancel()`; Siegel-Pop über eine wiederverwendbare `sealPop(el, size)` (20/40/64 px) statt Einzel-Code an drei Stellen. Tests: Playwright mit `reducedMotion: 'reduce'` (keine `transform`-Animation außer dem Finger-Folgen), Geste per `page.mouse` (Schwelle, Schwung, Zurückfedern), `event.repeat`, Fokus nach Bewertung. | **offen** (zur Kenntnis) |

## 5. Runde 4 – Kosten teilen (Inkrement 10, 2026-10-23)

Antworten auf [ux/abstimmung-design.md §15.2](../ux/abstimmung-design.md) (UM-14 – UM-19). Spezifikation: [interaktionen.md W19](interaktionen.md#w19--kosten-teilen-ausgaben-ausgleich-salden-f-035f-036-inkrement-10), Regel-Präzisierung motion-system §5.10 (v1.2). Kein neuer Prototyp – alle Bausteine existieren (`sealPop`, G-04, G-11, G-12, G-16).

### 5.1 Antworten an UI/UX – UM-14 bis UM-19

| # | Antwort Motion | Katalog | Status |
|---|---|---|---|
| **UM-14** Saldo/Summen ändern sich | **Übernommen.** Ganzer Satz wechselt im selben Frame, dann Überblenden `fade` 140 ms als Deckkraft **0,35 → 1** (nicht über 0 – das wirkt wie Blinken); nur Elemente, deren Text sich wirklich ändert. Farbe Tinte ↔ Minze wechselt sofort. Reduziert: sofort (wie UX vorschlägt). Beim Laden statisch. | W19-01 | **geklärt** |
| **UM-15** Markieren → „Bereits bezahlt“ | **Entscheidung: UX-Vorschlag „Zeile bleibt an ihrem Platz“ gilt – ohne zeitgesteuertes Zuklappen nach der Snackbar.** Prüfung des Alternativ-Vorschlags (nach Snackbar-Ende `base` zuklappen): verstößt gegen §5.10 und ist nicht nötig. Gründe: (1) Das Zuklappen wäre **zeitgesteuert**, nicht direkte Folge einer Handlung – wer gerade die nächste Zeile «Als bezahlt markieren» antippen will, trifft nach 6 s die falsche (bei Geld besonders heikel). (2) Der Fokus liegt laut D.14 auf «Zurücknehmen» **in** dieser Zeile – sie müsste ihn beim Verschwinden wegschieben (Screenreader-Nutzer verlieren den Ort). (3) Die Snackbar pausiert bei Fokus/Hover – der Zeitpunkt wäre nicht vorhersehbar. (4) Höhe animieren ist ohnehin verboten; das „Zuklappen“ wäre ein Ausblenden mit springendem Layout. **Das von R.8 gewünschte „Wandern“ ist trotzdem sichtbar** – als Ergebnis statt als Flugbahn der Zeile: Zähler «Bereits bezahlt ({n})» springt sofort auf n + 1 (Überblenden), bei aufgeklappter Liste steht der Eintrag sofort oben darin (Tönung), beim nächsten Laden steht die Zahlung nur noch dort. **MVP+ „Beleg-Flug“:** ein Klon des ✓-Kreises fliegt vom Chip zur Zahl im Zähler, die einmal nickt – nur wenn der Zähler sichtbar ist und kein Siegel gleichzeitig läuft; nichts Echtes bewegt sich. Häkchen-Pop am Chip wie vorgeschlagen (`fast` · `spring-soft`), **kein** Siegel am Chip (Siegel gehört dem Saldo 0). Technisch wichtig (an Developer, M-X10): die Zeile muss aus Clientzustand kommen, sonst verschwindet sie beim `router.refresh()` nach der Server Action sofort. **Bitte an PM/UX:** R.8 „Eintrag wandert nach Bereits bezahlt“ als Ergebnis lesen („steht beim nächsten Laden dort“) – W19 D.8.1 sagt das bereits. | W19-A, W19-02 … W19-06 | **geklärt** (Entscheidung Motion; Bestätigung UX zu M-U16 erbeten) |
| **UM-16** Eigener Saldo wird 0 | **Übernommen mit zwei Präzisierungen:** (a) Dauer **`moderate` 480 ms** statt `celebrate` – so ist `sealPop(el, 20)` gebaut (G-21: 20 px = `moderate`); 700 ms wirken bei 20 px träge. (b) Siegel erst **nach Server-Bestätigung** (§5.7), Satz «Du bist ausgeglichen ✓» aber sofort. Einmal je Ansicht; nicht beim Laden, nicht durch Aktionen anderer, nicht nach Speichern einer Ausgabe (Seitenwechsel → statisch). Liegt „Dein Stand“ außerhalb des Viewports: kein Scrollen, Pop beim ersten Wieder-Sichtbarwerden. Reduziert: statisch. | W19-07 | **geklärt** |
| **UM-17** Alle ausgeglichen | **Übernommen, kein Konfetti.** Siegel 40 `sealPop(el, 40)`, Karte Fade + 8 px. **Wichtig wegen UM-15:** die Karte erscheint **unter** der letzten markierten Zeile (die mit «Zurücknehmen» bleibt unter dem Finger), beim nächsten Laden wie D.7 statt der Vorschläge. **Vorrang** vor UM-16 (eine E3 je Bildschirm): fällt beides zusammen, steht das Siegel 20 statisch. Fokus bleibt. Ansage siehe M-U17. | W19-08 | **geklärt** |
| **UM-18** Neu / gelöscht / Rückgängig | **Neu: übernommen, aber 1200 ms statt `slow`** – die Tönung startet sichtbar (auch im Server-HTML, kein Blinken), hält bis 40 % und blendet aus; nach einem Seitenwechsel wären 320 ms vorbei, bevor man hinsieht. Kein Einfliegen, kein Auto-Scroll. **Löschen:** „klappt zu“ als **Ausblenden + FLIP** der folgenden Zeilen (keine Höhen-Animation, vgl. W16-05), Start 120 ms in den Sheet-Schluss; Rückgängig: Zeile blendet an alter Stelle ein, Nachbarn FLIP. Reduziert: sofort. | W19-09, W19-10 | **geklärt** |
| **UM-19** Haptik | **Bestätigt: keine Vibration** im Bereich Kosten. Q17 bleibt bei zwei Stellen. | W19-16 | **geklärt** |

Ergänzend spezifiziert (ohne UM-Punkt): Zurücknehmen in „Bereits bezahlt“ mit Ankerausgleich (W19-05), Fehler/Ablehnung (W19-06), Abschließen mit Siegel nur bei „alles ausgeglichen“ (W19-11), Formular E0 (W19-12), IBAN anzeigen ohne Ziffern-Effekt (W19-13), keine Listen-Staffel beim Laden (W19-14), optionale Saldo-Balken (W19-15, MVP+).

### 5.2 Neu an UI/UX (Runde 4)

| # | Thema | Frage / Vorschlag | Status |
|---|---|---|---|
| **M-U16** | **Fokus nach «Zurücknehmen» in „Bereits bezahlt“** | Der Eintrag verschwindet (direkte Folge, W19-05). Vorschlag: Fokus auf «Zurücknehmen» des nächsten Eintrags, sonst auf den Button «Bereits bezahlt ({n})». Außerdem bitte bestätigen: Nach dem Markieren wird die nächste offene eigene Zeile **nicht** nachträglich zur Primär-Taste (kein Stilwechsel unter dem Finger) – erst beim nächsten Laden. | **offen** |
| **M-U17** | **Ansage „Alles ausgeglichen“** | Wenn meine Aktion die Gruppe ausgleicht, sieht man die Karte, Screenreader hören nur die Snackbar «Als bezahlt markiert …». Vorschlag: Snackbar-Text in diesem Fall ergänzen: «… Alles ausgeglichen ✓» bzw. «… – everyone's all square ✓» (eine Ansage, kein zweites `aria-live`). | **offen** |
| **M-U18** | **Hinweis „an dich bezahlt“ verschiebt nach dem Laden den Inhalt** | Der Merker liegt im `localStorage` – der Server kennt ihn nicht, der Hinweis kommt erst nach Hydration und schiebt „Dein Stand“ nach unten (Layout-Verschiebung kurz nach dem Laden, ggf. unter dem Finger). Vorschläge: (a) Merker „gesehen“ serverseitig je Zahlung/Mitglied (wie M-X6), dann steht er im Server-HTML; oder (b) Hinweis **unter** „Dein Stand“ (über dem Segment) statt ganz oben – verschiebt nur die Liste. Motion animiert ihn in keinem Fall hinein (W19-14). | **offen** |

### 5.3 An Developer (über den CEO)

| # | Thema | Vorschlag | Status |
|---|---|---|---|
| **M-X10** | **Kosten-Bewegung ohne neue Bibliothek** | (a) Ausgleich-Ansicht hält `recentlyPaid` im Clientzustand und rendert diese Zeilen an ihrem alten Index – unabhängig vom Serverstand nach `revalidatePath`/`router.refresh()`, bis zum Unmount (W19-A). (b) Ankerausgleich als kleiner Helfer `keepAnchor(el, mutate)` (messen → ändern → `scrollBy(Δ)`), kein `overflow-anchor`. (c) Text-Überblenden als Helfer `refresh(el)` = `animate(el, [{opacity: 0.35}, {opacity: 1}], {duration: DURATION.fade})` (wird bei reduzierter Bewegung von `animate()` schon übersprungen). (d) Siegel ausschließlich über `sealPop(…, 20 | 40)`, Element erst nach Server-Bestätigung mounten, Pop im `useLayoutEffect`. (e) Löschen/FLIP ohne `transition` auf Höhe. Tests: Playwright – Markieren → `router.refresh()` → Zeile noch da, Fokus auf «Zurücknehmen»; 7 s warten → Zeile noch da; Segment wechseln → nur unter „Bereits bezahlt“; Neuladen mit Saldo 0 → `document.getAnimations()` leer; `reducedMotion: 'reduce'` → keine `transform`-Animation; kein `navigator.vibrate`. | **offen** (zur Umsetzung in Inkrement 10) |

## 6. Runde 5 – Promo-Video 9:16 (2026-10-23)

Konzept [promo/storyboard.md](promo/storyboard.md), Komposition [promo/index.html](promo/index.html), Aufnahme [promo/README.md](promo/README.md).

| # | An | Thema | Frage / Vorschlag | Status |
|---|---|---|---|---|
| **M-P1** | Designer | Optik-Abnahme Promo | Screens im Video sind nachgebaut (vereinfacht, 240-px-Bildschirm) – bitte Farben, Wortmarke als HTML-Text (statt SVG, damit „weg“/„go?“ animierbar ist) und Untertitel-Stil (Jakarta 800, 27 px, Schlüsselwort Minze/Sonne) freigeben. | **offen** |
| **M-P2** | Produktmanager / Auftraggeber | Claim | Arbeitstitel „Euren gemeinsamen Urlaub finden – ohne Chat-Chaos.“ / „Find your holiday together – no group-chat chaos.“ | **offen** |
| **M-P3** | Operations | Werbe-Aussagen, Musik | Endkarte nennt nur Produktfakten („Einladen per Link · läuft im Browser“), keine Domain, kein „kostenlos“. Musik nicht eingebaut – Lizenzweg (Plattform-Bibliothek vs. eigene Lizenz) entscheidet der Auftraggeber. | **offen** |

### 6.1 Runde 5b – Promo v2, drei Stile (2026-10-23)
Nach Sichtung durch den Auftraggeber: [promo/storyboard.md §9](promo/storyboard.md), Kompositionen `promo/a-clean/`, `promo/b-kinetic/`, `promo/c-abenteuer/`, gemeinsame Teile `promo/shared/`.

| # | An | Thema | Frage / Vorschlag | Status |
|---|---|---|---|---|
| **M-P4** | Designer (+ CEO) | **„Alle können“ = Grün** | Der Auftraggeber möchte die Tage, an denen alle können, **grün** sehen („so wie in der App“). In `tokens.css` ist `--ww-hm-all-bg` aber nur im **Dunkelmodus** Minze; im **Hellmodus** ist „alle“ Indigo `#2B2266` mit Minze-Siegel (design-system §6.2 „der beste Zeitraum ist der indigofarbene“). Das Video zeigt Minze `#52E5B8` mit Indigo-Zahl und Indigo-Siegel (= Dunkelmodus-Logik, auf hellem Screen). Frage: Soll die **App** im Hellmodus nachziehen (z. B. `hm-all-bg: mint-400`, `hm-all-fg: indigo-800`, Siegel Indigo; Kontrast Indigo auf Minze ≈ 8,7 : 1)? Sonst weicht das Video bewusst ab. Empfehlung Motion: nachziehen – Grün = „frei/alle können“ ist sofort verständlich, und Video und App erzählen dasselbe. | **entschieden (2026-10-23, Auftraggeber: ja)** – umgesetzt mit Inkrement 11a: `tokens.css` hell `hm-all-bg` Minze-400, `hm-all-fg` Indigo-800, Siegel Indigo mit Minze-Haken (8,7 : 1); Rang-Pille neu `hm-suggest-fg`; design-system §6.2 angepasst. |
| **M-P5** | Designer | Optik-Abnahme v2 | Stil C nutzt Illustrationen als „Sticker“ (weißer Stanzrand, schräg), Gepäckanhänger-Etiketten, Klebeband und ein Kartenraster; Stil B riesige Ziffern (250 px) und Farbflächen in Vollton (Minze, Sonne, Lavendel, Koralle). Bitte freigeben bzw. Korrekturen nennen. Ersetzt M-P1. | **offen** |
| **M-P6** | UI/UX | Begriffe im Video | Video-Texte folgen w19 E.2. Zwei kleine Abweichungen zur App bitte bestätigen: Vorschlags-Pille „✓ Alle können“ statt „Alle dabei“ (passt zum Untertitel „Grün heißt: alle können“), Taste „+ Vorschlagen“ im Kopf der Unterkünfte und Chip „Vorschlag von Anna“ auf der Karte (zeigt Schritt ② „vorschlagen“). | **offen** |
| **M-P7** | Produktmanager / Auftraggeber | Stilwahl | Empfehlung Motion: **B** für Reels/TikTok, **A** für WhatsApp-Status/Website; C als Markenvariante, falls der Auftraggeber „verspielt“ möchte. | **offen** |

## Entscheidungen des Auftraggebers (2026-10-08, Q17)
- Schalter „Bewegung reduzieren“ im Konto (W13) zusätzlich zur Systemeinstellung: **ja**.
- Feier für **alle** Mitglieder, einmal pro Person und Festlegung (F-012): **ja**.
- Vibration auf Android (best effort, aus bei reduzierter Bewegung, kein Ton) **nur** beim Ziehen nach Halten und beim Feier-Abschluss: **ja**.

## CEO-Entscheidungen (2026-10-08)
- Zahlen zählen **nie** hoch – auch der Countdown nicht.
- Die Feier F-012 ist der **Vorfreude-Ring** (`countdown-ring.svg`), nicht Siegel + Kalenderblatt.

## Changelog
- 2026-10-23 Runde 5b: §6.1 – Promo v2, drei Stile nach Auftraggeber-Feedback (M-P4 – M-P7; M-P5 ersetzt M-P1).
- 2026-10-23 Runde 5: §6 – Promo-Video 9:16 (M-P1 – M-P3).
- 2026-10-23 Runde 4 (Inkrement 10): §5 – Antworten UM-14 – UM-19 (UM-15 entschieden: Zeile bleibt bis zum nächsten Laden, kein zeitgesteuertes Zuklappen; „Wandern“ über Zähler/aufgeklappte Liste, Beleg-Flug MVP+; UM-16 `moderate` statt `celebrate`; UM-18 Tönung 1200 ms, Löschen ohne Höhen-Animation; UM-19 bestätigt); neu M-U16 – M-U18, M-X10.
- 2026-10-23 Runde 3: §4 – Antworten UM-1 – UM-7 (Gegenprüfung Cockpit-Code, drei kleine Korrekturen → M-X8) und UM-8 – UM-13 (Swipen, UM-13 bestätigt: keine Vibration); neu M-U13–M-U15, M-D13–M-D14, M-X8–M-X9; Prototyp f.
- 2026-10-08 Runde 2: Status aller M-Punkte nach den Antworten von Designer (abstimmung-ux §6) und UI/UX (abstimmung-design §9) gesetzt; neu M-D10–M-D12, M-U12, M-X6–M-X7.
- 2026-10-08 Runde 1: Erstfassung M-D1–M-D9, M-U1–M-U11, M-X1–M-X5.

## CEO-Entscheidungen (2026-10-08, nach Motion v1.0)
- **M-D10:** Bei der Festlegung startet der Ring mit dem Mindestwert (ca. 4 %) und füllt sich bis zur Abreise; die SVG mit 96,5 % zeigt nur einen späteren Zustand. Kommentar in der SVG korrigiert der Designer bei nächster Gelegenheit.
- **M-D11:** Liegende Konfetti und Funkel werden bei späteren Besuchen ausgeblendet.
- **M-D12:** Vibration nur an zwei Stellen (Ziehen nach Halten, Feier-Abschluss); „/das Siegel“ in design-system §8.3 Nr. 5 entfällt (Designer streicht).
- **M-U12:** Nach „Termin festlegen“ wechselt die App für die Orga in die Übersicht, wo der Ring sitzt (UI/UX trägt es in user-flows D.3 ein).
- **M-X6/M-X7:** an Developer (Feier-Merker pro Mitgliedschaft+Festlegung serverseitig; Ring ohne WAAPI-Unterstützung steht sofort fertig).
