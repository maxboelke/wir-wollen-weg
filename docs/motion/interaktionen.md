# Interaktions-Katalog (Motion) – pro Ansicht und Feature

Stand: 2026-10-08 · Verantwortlich: Motion Designer · Status: **v1.0** (abgeglichen mit Design-System v1.0 Richtung B/B0, Antworten M-D1–M-D9 und M-U1–M-U11, Q17)
Bezug: [motion-system.md](motion-system.md) (Tokens, Energie-Stufen E0–E4, Regeln) · Wireframes [W01–W15](../ux/wireframes/README.md) · [user-flows.md](../ux/user-flows.md) · [ux-spec.md](../ux/ux-spec.md) · [design-system.md](../design/design-system.md) · Prototypen: [prototypes/](prototypes/README.md)

**Querschnitts-Regeln v1.0:** Zahlen zählen **nie** hoch (G-16, auch Countdown) · Feier = **Vorfreude-Ring** (W11-02) · Siegel = Minze mit Indigo-Häkchen (`seal.svg`), nur Beitritt, Abgabe, alle haben abgestimmt · keine Umsortierung, solange man auf der Seite ist (W10-08) · Vibration **nur** W08-02 (Ziehen nach Halten) und W11-02 (Ring rastet ein) · Reduziert gilt bei System-Einstellung **oder** Konto-Schalter (W13-01).

**Lesehilfe**
- **ID**: `G-xx` = global/Komponente, `Wnn-xx` = Ansicht. IDs bitte in Tickets und Reviews referenzieren (wie F-xxx/R-xxx).
- **Dauer/Easing** nennt Tokens aus motion-system §3 (Kurzform: `instant` = `--ww-duration-instant`, `spring-soft` = `--ww-ease-spring-soft` usw.).
- **Reduziert** = Verhalten bei `prefers-reduced-motion: reduce` bzw. `data-motion="reduce"`. „Fade“ = Überblenden mit `--ww-duration-fade` (140 ms), „sofort“ = ohne Übergang.
- **Stufe** = Energie-Stufe E0–E4 (motion-system §4). **Prio**: **MVP** (mit dem jeweiligen Feature bauen) · **MVP+** (wenn Zeit, vor Beta) · **später**.
- „Zustand sofort“ heißt immer: Fläche/Text/Symbol wechseln im selben Frame wie die Eingabe; die beschriebene Bewegung ist nur der Ausklang (motion-system §5.1).
- 🎬 = im Prototyp zu sehen.

---

## 0. Die fünf wichtigsten Bewegungs-Momente

| # | Moment | ID | Warum |
|---|---|---|---|
| 1 | **Tage malen** – Zelle federt unter dem Finger, Zieh-Vorschau, Setz-Welle beim Loslassen | W08-01 … W08-05 | Häufigste Handlung; muss sich „sofort und satt“ anfühlen (F-005) 🎬 a |
| 2 | **Heatmap baut sich auf** + **Vorschlag zeichnet sich in den Kalender** | W09-05, W09-06 | Macht den Kernnutzen sichtbar: „Hier passt es für alle“ (F-008/F-009) 🎬 b |
| 3 | **Stimme zählt** – Segment federt, Ergebnis-Balken wächst erst nach der eigenen Stimme | W10-04, W10-05 | Belohnt das Abstimmen, erklärt die Sichtbarkeitsregel (F-011, D-18) 🎬 c |
| 4 | **„Es geht los!“** – Vorfreude-Ring: Sonnenpunkt läuft eine Ehrenrunde, Schein, Konfetti fällt; einmal pro Person und Festlegung | W11-02 | Der eine große Feier-Moment (F-012) 🎬 c |
| 5 | **Code richtig → „Du bist dabei!“** – Erfolgs-Welle über die Kästchen, Siegel im Willkommens-Hinweis | W02-05, W03-06 | Erster Eindruck für Eingeladene, Beitrittsquote (F-040/F-003) 🎬 e |

---

## 1. Global & Komponenten

| ID | Auslöser | Ablauf | Dauer / Easing | Reduziert | Stufe | Prio |
|---|---|---|---|---|---|---|
| **G-01** Seitenwechsel (Route) | Navigation zu neuer Seite (nicht Tabs) | Alte Seite verschwindet sofort (kein Austritt, damit nichts wartet). Neuer Hauptinhalt (`<main>`): Deckkraft 0 → 1 + `translateY(distance-sm → 0)`. Header bleibt stehen. Zurück-Navigation: **keine** Animation, Scrollposition wird wiederhergestellt (ux-spec §3). | `base` · `enter` | Fade | E2 | MVP |
| **G-02** Tab-Wechsel Reise (Cockpit-Tabs: Übersicht · Meine Tage · Gruppe · Abstimmen) | **Tipp** auf Tab-Link (nicht bei Direktaufruf, Zurück-Taste oder Standard-Tab-Weiterleitung – M-U11) | 1) Die **weiße Tab-Pille** gleitet als ein Indikator-Element zur neuen Position und passt ihre Breite an (`translateX` + `scaleX`, gemessen an der Tab-Breite – funktioniert bei langen Labels und in der scrollenden Spur < 375 px); Label-Farbe wechselt sofort. 2) Neuer Tab-Inhalt kommt aus der Richtung des Tabs: rechts liegender Tab `translateX(+distance-lg → 0)`, links liegender `−distance-lg`, plus Fade. Richtung aus vorigem Tab-Index (`sessionStorage`). Die Cockpit-Fläche selbst bleibt stehen. Spur scrollt den aktiven Tab bei Überbreite sanft in Sicht. | Pille `base` · `standard`; Inhalt `base` · `enter` | Pille springt; Inhalt Fade | E2 | MVP |
| **G-03** Button drücken | `pointerdown` | Skalierung auf `scale-press` (0,97) sofort; beim Loslassen zurück mit Feder. Ladezustand: Spinner (16 px) blendet ein, Label bleibt, Breite fix. | runter `instant` · `standard`; zurück `fast` · `spring-soft` | keine Skalierung (Token = 1) | E1 | MVP |
| **G-04** Snackbar/Toast | erscheint (z. B. „Link kopiert“, „8 Tage auf ‚geht nicht‘ gesetzt · Rückgängig“) | Steigt aus der fixierten Leiste: `translateY(distance → 0)` + Fade. Austritt: Fade + `translateY(0 → distance-sm)`. Neue Snackbar ersetzt alte: alte raus (`fast`), neue rein – nie gestapelt. **Kein** Countdown-Balken (wäre bewegte Info). Pausiert bei Hover/Fokus. | rein `base` · `enter`; raus `fast` · `exit` | Fade | E2 | MVP |
| **G-05** Bottom-Sheet (Tagesdetail, Teilen, Reisemenü, Festlegen) | öffnen | Scrim blendet ein (`base`). Sheet gleitet von unten: `translateY(100% → Rastpunkt)`. Das Sheet ist intern immer `--ww-size-sheet-full` hoch; „halb“ = Verschiebung um (full − half) – so bleibt alles `transform`. Fokus **sofort** auf Überschrift/erstes Element. | `slow` · `emphasized` | Fade (Sheet + Scrim) | E2 | MVP |
| **G-05a** Sheet ziehen | Griff/Kopf ziehen | Folgt dem Finger 1:1 (`transform`, rAF). Über den oberen Rastpunkt hinaus: Gummiband (Widerstand 0,3). Loslassen: Geschwindigkeit > 0,5 px/ms nach unten **oder** > 30 % der Höhe → schließen; sonst nächster Rastpunkt (halb/fast voll). Inhalt scrollt erst, wenn Sheet „fast voll“ ist. 🎬 b | Einrasten `slow` · `spring-soft`; Schließen `base` · `exit` | Ziehen folgt weiter dem Finger; Einrasten/Schließen sofort | E2 | MVP |
| **G-05b** Sheet schließen | ✕, Scrim, Esc, Zurück | `translateY(→ 100%)` + Scrim-Fade. Fokus zurück auf Auslöser (sofort). | `base` · `exit` | Fade | E2 | MVP |
| **G-06** Dialog (≥ 600 px) | öffnen/schließen | `scale-enter` → 1 + Fade; schließen kürzer. Destruktive Dialoge: keine Feder. | `base` · `enter` / `fast` · `exit` | Fade | E0/E2 | MVP |
| **G-07** Skelett | Laden > 300 ms | Skelett erscheint (Fade). Pulsieren der Deckkraft 1 → 0,6 → 1, max. 4 Zyklen, danach statisch. Inhalt ersetzt Skelett per Fade (keine Staffel, wenn der Inhalt erst nach > 1 s kommt). | Zyklus 1200 ms · `standard` | statisch | E0 | MVP |
| **G-08** Smooth-Scroll | Sprung-Chips, „Im Kalender zeigen“, Sprung zu Fehlerfeld | `scrollIntoView({behavior:'smooth', block:'start'})`, respektiert `scroll-padding` | Browser | `behavior:'auto'` | E2 | MVP |
| **G-09** Banner (Offline, Konflikt, `pendingAuth`) | erscheint/verschwindet | Unter dem Header: `translateY(−distance-sm → 0)` + Fade. Das Layout darunter springt (keine Höhen-Animation). | `base` · `enter` | Fade | E0 | MVP |
| **G-10** Feldfehler (Formulare) | Validierung beim Absenden/Verlassen | Fehlertext + Icon blenden ein; Rahmen wechselt sofort. **Kein** Wackeln (Ausnahme Code-Feld W02-04). | `fast` | Fade | E0 | MVP |
| **G-11** Kopieren-Feedback | Tipp auf „Link kopieren“/„Text kopieren“ | Button-Label überblendet zu „Kopiert ✓“; das Häkchen springt mit Feder von `scale-pop` auf 1. Nach 2 s zurück (Fade). Zusätzlich `role="status"`-Ansage. Kein Toast doppelt (Button-Feedback genügt; Toast nur, wenn der Button nicht sichtbar bleibt). | Label `fast`; Häkchen `base` · `spring-soft` | Fade, Häkchen statisch | E1 | MVP |
| **G-12** Checkbox / Radio / Schalter | Auswahl | Häkchen/Punkt: `scale-pop` → 1; Schalter-Daumen gleitet (`translateX`). | `fast` · `spring-soft` | sofort | E1 | MVP |
| **G-13** Chip-Filter aktiv | Filterwert ≠ Standard | ✓-Icon im Chip springt ein (`scale-pop` → 1), Fläche wechselt sofort. | `fast` · `spring-soft` | sofort | E1 | MVP |
| **G-14** Akkordeon / `<details>` (Legende, Mehr Optionen, Vergangene Reisen, FAQ, „Wer hat wie gestimmt?“) | auf-/zuklappen | Chevron dreht 180° (`rotate`). Inhalt erscheint sofort per Fade; **keine** Höhen-Animation. | Chevron `base` · `standard`; Inhalt `fast` | Chevron springt, Inhalt Fade | E1 | MVP |
| **G-15** Fortschrittsbalken (6 px Karten, 12 px Stimmen, „5 von 7“) | erstes Erscheinen in der Sitzung | Füllung wächst von 0 auf den Wert (`scaleX`, Ursprung links). Text „5 von 7“ steht sofort da. Bei späteren Wertänderungen: von alt auf neu. | `moderate` · `standard` | sofort | E2 | MVP+ |
| **G-16** Zahlen | jede Änderung (Kennzahl, x/n, Stimmen, **Countdown**, Code-Countdown) | **Keine Animation, kein Hochzählen** (CEO-Entscheidung, design-system §2 Nr. 11 / §8.3). Erlaubt: Überblenden des ganzen Textes (`fade`). Ringe und Balken daneben dürfen wachsen. | – / `fade` | – | – | **Regel** |
| **G-17** Hover (nur Zeigegeräte) | `@media (hover:hover)` | Karten heben sich `translateY(−2px)`, Schatten über Pseudo-Element (`opacity`, M-D9). | `fast` · `standard` | nur Schatten | E1 | MVP+ |
| **G-18** Haptik (Q17) | **nur zwei Stellen:** Ziehen startet nach 300 ms Halten (W08-02) · Sonnenpunkt rastet ein (W11-02) | `navigator.vibrate(10)` bzw. `navigator.vibrate(15)`, nur Android/best effort (iOS: nie), nie Ton, nie einzige Rückmeldung. Sonst **keine** Vibration. | – | aus | E1 | MVP |
| **G-20** Fortschrittsring (Kennzahl-Box 52 px, Mini-Vorfreude-Ring) | erstes Erscheinen in der Sitzung bzw. Wert geändert | Füllung zeichnet sich per `stroke-dashoffset` von 0 (bzw. altem Wert) auf den Wert, Ursprung 12 Uhr, im Uhrzeigersinn; Zahl daneben steht sofort (G-16). | `moderate` · `standard` | sofort | E2 | MVP |
| **G-21** Siegel (`seal.svg`, 20/40/64 px, M-D4) | Beitritt, Abgabe, alle haben abgestimmt | Scheibe `scale-pop → 1` (`spring-bouncy`), Häkchen zeichnet sich (`stroke-dashoffset` 1 → 0, ab 40 % der Scheibe), Funken nur bei 64 px (einmal, `moderate`). Farbe Minze mit Indigo-Häkchen. | 20 px `moderate`; 40/64 px `celebrate` | statisch (Fade) | E3 | MVP |
| **G-19** Sprache umschalten | Tipp auf „English“/„Deutsch“ | Keine Animation (Seite lädt neu, Fokus bleibt auf Umschalter, user-flows F.3). | – | – | E0 | Regel |

---

## 2. Ansichten

### W01 – Landing (`/de`, `/en`) · Scroll-Effekte · 🎬 d

| ID | Auslöser | Ablauf | Dauer / Easing | Reduziert | Stufe | Prio |
|---|---|---|---|---|---|---|
| **W01-01** Hero-Eintritt (`hero.svg` v1.0 Übersichtskarte, ragt aus dem Cockpit) | Laden (einmal pro Sitzung) | **Text, Headline und „Reise planen“ im Cockpit stehen sofort** (LCP!). Nur die Illustration baut sich auf, Ebenen gestaffelt: `plate` (Lavendel-Karte) kippt von −8° auf −4° → `calendar` (weiße Karte) hebt sich 16 px → `ring` füllt sich (G-20) → `friends` ploppen nacheinander → `cells` als Diagonal-Welle → `band` (Minze-Rahmen) blendet ein → `sun` steigt 12 px → `seal` ploppt (Siegel-Feder). Gesamt ≤ 1,1 s. | je Ebene `moderate`; Zellen `stagger-cell`; Freunde `stagger-item` · `spring-soft`; Siegel `moderate` · `spring-bouncy` | statisch | E3 | MVP+ |
| **W01-02** „So geht’s“ – Reveal | Schritt-Karten kommen in den Viewport (IntersectionObserver, 20 %) | Karte: Fade + `translateY(distance → 0)`, gestaffelt; Nummern-Kreis ①②③ springt mit Feder ein. Einmalig. **Nur unterhalb des ersten Viewports**; ohne JS/IO: sofort sichtbar. | `slow` · `enter`, `stagger-card` | sichtbar ohne Bewegung | E2 | MVP |
| **W01-03** Parallax Sonne | Scrollen | Ebene `sun` der Hero-Illustration bewegt sich langsamer als die Seite (max. 24 px), `plate` minimal (max. 8 px). Rein dekorativ, per `animation-timeline: scroll()` in `@supports`. (Kein Meer mehr in `hero.svg` v1.0.) | scroll-gebunden, `linear` | entfällt | E2 | MVP+ |
| **W01-04** Mini-Demos in „So geht’s“ (Kacheln) | Kachel im Viewport | ② „Tage antippen“: drei Mini-Zellen werden nacheinander markiert (einmal, 900 ms) · ③ „Abstimmen & fix“: Siegel 20 px ploppt (G-21). Keine Schleife. | `stagger-item`, `spring-soft` | statischer Endzustand | E2 | später |
| **W01-05** ~~Sticky „Reise planen“~~ | – | **Entfällt im MVP (M-U4):** stattdessen Wiederholung `[Reise planen]` am Seitenende ohne eigene Bewegung (Reveal wie W01-02). | – | – | – | entfällt |
| **W01-06** Sticky-Kopf-Schatten | Seite gescrollt > 0 | Schatten unter dem kompakten Kopf blendet ein (Pseudo-Element, `opacity`), per Scroll-Timeline oder IO-Sentinel. | `fast` | sofort | E1 | MVP+ |

### W02 – Anmelden, Code, Profil (`/login`) · ruhig (E0) · 🎬 e

| ID | Auslöser | Ablauf | Dauer / Easing | Reduziert | Stufe | Prio |
|---|---|---|---|---|---|---|
| **W02-01** Schrittwechsel E-Mail → Code → Name | E-Mail: Tipp „Code senden“ mit **gültigem Format** (sonst kein Wechsel, Fehler am Feld). Name: Server-OK des Codes. | **Code-Schritt sofort, optimistisch (M-U5):** im selben Tipp-Ereignis wechselt der Schritt und der Fokus springt ins Code-Feld (iOS öffnet die Tastatur nur dann). Überschrift «Schau in dein Postfach», Statuszeile (`role="status"`) «Code wird gesendet …» → nach Server-OK «Code an kemal@… gesendet» (Überblenden). „Neuen Code senden“-Countdown startet **erst nach Server-OK**. **Fehler** (Rate-Limit, Netz, Server): zurück zum E-Mail-Schritt per `history.replaceState` (kein toter Zurück-Eintrag), E-Mail bleibt, Meldung am Feld, Fokus ins E-Mail-Feld – Wechsel rückwärts wie unten (von links). Antwort neutral (keine Enumeration). Bewegung: alter Schritt Fade raus, neuer Schritt Fade + `translateX(+distance-sm → 0)`. | raus `fast` · `exit`; rein `base` · `enter`; Statuszeile `fade` | Fade | E0 | **MVP (Ink. 1)** |
| **W02-02** Ziffer erscheint | Eingabe/Löschen | Ziffer im Kästchen: `scale(0.8 → 1)` + Fade. Aktives Kästchen wechselt sofort (Rahmen). Löschen: ohne Animation. | `instant` · `standard` | sofort | E1 | **MVP (Ink. 1)** |
| **W02-03** Einfügen / Autofill | 6 Ziffern auf einmal | Ziffern erscheinen von links nach rechts gestaffelt (insgesamt ≤ 120 ms), danach Zustand „Prüfe Code …“. Absenden startet **sofort**, nicht nach der Staffel. | `instant`, Staffel 20 ms | sofort | E1 | **MVP (Ink. 1)** |
| **W02-04** Code falsch | Server: falsch (Versuch 1–4) | Alle Kästchen: einmal horizontal wackeln (0 → −4 → 4 → −2 → 0 px), Rahmen sofort `danger`, Fehlertext blendet ein, Wert bleibt markiert, Fokus bleibt. | `base` · `standard` | **kein Wackeln**, nur Rahmen + Text | E0 | **MVP (Ink. 1)** |
| **W02-05** Code richtig | Server: OK | Kästchen werden von links nach rechts `accent-tint` (Fläche sofort je Kästchen, kleine Skalierung 1 → 1,06 → 1), danach ploppt das **Häkchen-Siegel 20 px** rechts neben dem Feld (G-21, klein). Navigation läuft parallel; Weiterleitung spätestens 450 ms nach OK (`SUCCESS_HOLD_MAX_MS`). | `stagger-item` je Kästchen, `fast`; Siegel `moderate` · `spring-bouncy` | Fläche + Siegel sofort | E1 | **MVP (Ink. 1)** |
| **W02-06** Gesperrt (5. Versuch) | Server: gesperrt | Kästchen blenden in den gesperrten Zustand (gestrichelt), Schloss + Text blenden ein, Primärbutton wechselt per Fade. Kein Wackeln. | `base` | Fade | E0 | **MVP (Ink. 1)** |
| **W02-07** Caret & Countdown | Fokus im Feld | Caret-Strich blinkt 1 Hz, **max. 5 s**, dann statisch. Countdown „Neuer Code in 0:27“ ohne Animation. | 1000 ms `steps(1)` | statisch | E0 | **MVP (Ink. 1)** |
| **W02-08** „Prüfe Code …“ | nach 6. Ziffer | Spinner 16 px blendet ein (erst nach 400 ms Wartezeit). | `fast` | drei statische Punkte | E0 | **MVP (Ink. 1)** |

### W03 – Einladung & Beitritt (`/i/{token}`, F-003) · 🎬 e

| ID | Auslöser | Ablauf | Dauer / Easing | Reduziert | Stufe | Prio |
|---|---|---|---|---|---|---|
| **W03-01** Einladungs-Reisekarte | Laden | Reisekarte (Indigo-Verlauf, `trip-card-motif.svg`): Fade + `translateY(distance → 0)`. Text sofort lesbar (max. 320 ms). Motiv einmal: `sun` steigt 8 px, `waves` gleiten 6 px von links, `sparkles` ploppen; `rings` statisch. Neutrale Avatar-Punkte ohne Bewegung (D-25). | Karte `slow` · `emphasized`; Motiv `moderate` · `enter` | Fade | E2 | MVP |
| **W03-02** „Mitmachen“ → Formular | Tipp | Volle Karte überblendet zur kompakten Karte (Inhalt überblenden, kein Höhen-Morph); das E-Mail-Formular kommt von unten (`distance-sm`) + Fade. Fokus sofort ins E-Mail-Feld (synchron). | `base` · `enter` | Fade | E0 | MVP |
| **W03-03** Schritte E-Mail → Code → Name | wie W02-01 | wie W02-01 inkl. **optimistischem Code-Schritt (M-U5)**; die Kontext-Karte bleibt stehen (Anker). | wie W02-01 | Fade | E0 | MVP |
| **W03-04** Code-Zustände | wie W02-02 … W02-08 | identische Komponente | | | | MVP |
| **W03-05** Name doppelt | Hinweis erscheint | Hinweis blendet ein; Tipp auf „Übernehmen“: Feldwert überblendet, kurzer ✓-Pop. | `fast` | Fade | E0 | MVP |
| **W03-06** Beitritt geschafft → Meine Tage | Server: beigetreten | Seitenwechsel (G-01). Willkommens-Hinweis „Du bist dabei!“ gleitet von oben ein (`distance-sm`), sein **Siegel 40 px** (Minze, G-21) springt ein (einziges Siegel im Flow). ~~Initiale reiht sich in Avatar-Reihe ein~~ – **entfällt** (in B keine Avatar-Reihe in Meine Tage, UX §9 Konflikt 3). | Hinweis `base` · `enter`; Siegel `moderate` · `spring-bouncy` | Hinweis + Siegel statisch | E3 | MVP |
| **W03-07** Geste-Hinweis „Tippen oder wischen“ (M-U9) | 600 ms nach W03-06, **nur beim ersten Besuch**, nicht bei Tastatur-Fokus im Kalender | Halbtransparenter Finger-Punkt wischt über 4 Zellen einer Woche; die Zellen zeigen die gestrichelte Vorschau (werden **nicht** geändert). 2 Durchläufe, ≤ 2,8 s, jede Berührung/Scroll/Taste stoppt ihn. Text darunter bleibt stehen. 🎬 a | 2 × 1400 ms · `standard` | **statische Skizze ohne Zeitlimit** im Willkommens-Hinweis, bis dieser geschlossen wird | E2 | MVP |
| **W03-08** Sonderzustände (voll, gesperrt, ungültig) | Laden | Nur Fade. `error.svg` ohne Bewegung. | `fast` | Fade | E0 | MVP |

### W04 – Meine Reisen (`/trips`, F-044)

| ID | Auslöser | Ablauf | Dauer / Easing | Reduziert | Stufe | Prio |
|---|---|---|---|---|---|---|
| **W04-01** Karten-Eintritt | erstes Laden in der Sitzung | „Zu tun“-Karten zuerst, dann laufende Reisen: Fade + `translateY(distance → 0)`, gestaffelt (max. 5 Karten, Rest gleichzeitig). Zurück-Navigation: keine Staffel. | `slow` · `enter`, `stagger-card` | Fade | E2 | MVP |
| **W04-02** To-do-Zeile | Karte erscheint | Pfeil „→“ nickt einmal 4 px nach rechts (nach dem Eintritt) – Hinweis „hier bist du dran“. Einmal, keine Schleife. | 2 × `base` | entfällt | E1 | MVP+ |
| **W04-03** Fortschritt „5 von 7“ / Mini-Vorfreude-Ring (Phase 3, `vote-done.svg`) | Karte erscheint | Balken: G-15. Phase 3: Ring-Füllung zeichnet sich einmal (G-20), **kein Konfetti** (die Feier gehört W11-02). | | | | MVP+ |
| **W04-04** Karte antippen | Tipp | G-03 (`scale-press` auf ganzer Karte), dann G-01. Später: gemeinsames Element Reisename → Reise-Kopf (View Transition). | | | E1 | MVP / später |
| **W04-05** Reise verlassen/gelöscht | Rückkehr mit Ergebnis | Karte: Fade + `scale-enter`; nachrückende Karten per FLIP. Toast (G-04). | `fast` + FLIP `slow` | Fade, Layout springt | E2 | MVP+ |
| **W04-06** Leerzustand | keine Reisen | `empty-trips.svg`: Ebenen-Eintritt einmal (wie W01-01, kürzer, ≤ 700 ms); Text + CTA sofort. | `moderate` | statisch | E2 | MVP+ |
| **W04-07** „Vergangene Reisen (3)“ | auf-/zuklappen | G-14 | | | | MVP |

### W05 – Reise anlegen (`/trips/new`) · ruhig (Formular)

| ID | Auslöser | Ablauf | Dauer / Easing | Reduziert | Stufe | Prio |
|---|---|---|---|---|---|---|
| **W05-01** „Mehr Optionen“ | aufklappen | G-14 | | | E0 | MVP |
| **W05-02** Stepper Nächte | `−`/`+` | Zahl wechselt sofort; optional gleitet die neue Zahl 6 px aus der Richtung (+ von unten, − von oben). Klartext „= 6 Tage …“ ohne Animation. | `fast` · `standard` | sofort | E1 | später |
| **W05-03** Schnellwahl-Chips Zeitraum | Tipp | Chip gewählt (G-12-Logik); Datumsfelder wechseln sofort. | `fast` | sofort | E1 | MVP |
| **W05-04** Absenden ohne Login | Tipp „Reise anlegen“ | Formular überblendet zur Zusammenfassungszeile; Auth-Schritte erscheinen wie W02-01. | `base` | Fade | E0 | MVP |
| **W05-05** Reise angelegt → W06 | Server OK | G-01; Überschrift „Deine Reise ist angelegt!“ mit kleinem ✓-Siegel (spring-soft, klein – kein Konfetti). | `moderate` · `spring-soft` | statisch | E3 | MVP |

### W06 – Einladen & Teilen-Sheet (F-002, F-007, F-015)

| ID | Auslöser | Ablauf | Dauer / Easing | Reduziert | Stufe | Prio |
|---|---|---|---|---|---|---|
| **W06-01** Teilen-Sheet | öffnen | G-05 | | | E2 | MVP |
| **W06-02** Text-Sprache DE \| EN | Umschalten | Segment-Indikator gleitet; Text im Feld überblendet. | Indikator `fast` · `standard`; Text `fast` | sofort / Fade | E1 | MVP |
| **W06-03** Link kopieren / Text kopieren | Tipp | G-11 | | | E1 | MVP |
| **W06-04** „Teilen …“ (Web Share) | Tipp | G-03; danach System-Dialog (keine eigene Animation). | | | E1 | MVP |
| **W06-05** Platzhalter anlegen/entfernen | Tipp | Neue Zeile: Fade + `translateY(−distance-sm → 0)`; entfernen: Fade, Rest per FLIP. | `base` / FLIP `slow` | Fade | E2 | MVP+ |

### W07 – Reise-Rahmen & Übersicht (F-007, F-012, F-015)

| ID | Auslöser | Ablauf | Dauer / Easing | Reduziert | Stufe | Prio |
|---|---|---|---|---|---|---|
| **W07-01** Tabs | Wechsel | G-02 | | | E2 | MVP |
| **W07-02** Phase im Cockpit (Phasen-Punkt + Kennzahl-Ring je Phase: P1 Abgabe-Ring, P2 Abstimmungs-Ring + Frist, P3 Mini-Vorfreude-Ring) | Phase hat sich seit dem letzten Besuch geändert (`localStorage` je Reise) | Phasen-Text überblendet, der Phasen-Punkt wechselt die Farbe sofort und ploppt einmal (`scale-pop → 1`); der Kennzahl-Ring zeichnet sich neu (G-20). In der Ergebnis-Karte wächst der Balken „Steht fest“ (W11-02). Sonst statisch. | Punkt `base` · `spring-soft`; Ring `moderate` | sofort | E2 | MVP+ |
| **W07-03** Nächster-Schritt-Karte | Inhalt ändert sich | Überblenden des Inhalts; G-15 für den Fortschritt. | `base` | Fade | E2 | MVP |
| **W07-04** „Wer ist dabei?“ | neues Mitglied seit letztem Besuch | Zeile bekommt kurz eine Tönung (Overlay `opacity` 1 → 0 über 1,2 s) + Chip „neu“. | 1200 ms · `standard` | nur Chip | E1 | später |
| **W07-05** Reisemenü „⋯“ | öffnen | G-05 | | | E2 | MVP |
| **W07-06** Cockpit voll → kompakt (B-3) | Scrollen | Kennzahl-Box scrollt mit dem Inhalt weg; der kompakte Kopf (104 px) bleibt kleben – **keine Höhen-Animation**, nur Schatten blendet ein (W01-06-Technik). Querformat < 480 px: kompakter Kopf gleitet raus/rein (`translateY(−100%)`, ux-spec §2). | Schatten `fast`; Kopf `base` · `standard` | sofort | E1 | MVP |

### W08 – Meine Tage (F-005, F-016) · Kernmoment 1 · 🎬 a

| ID | Auslöser | Ablauf | Dauer / Easing | Reduziert | Stufe | Prio |
|---|---|---|---|---|---|---|
| **W08-01** Tag antippen | `pointerdown` auf Zelle | **Zustand sofort** (Fläche + Muster). Zelle drückt sich auf `scale-cell` (0,94) und federt beim Loslassen zurück. Symbol-Plakette (✕/◐): springt von `scale-pop` auf 1. Zurück auf „Geht“: Plakette schrumpft + Fade (kürzer). Ansage in Live-Region. | runter `instant`; zurück `base` · `spring-soft`; Plakette `fast` · `spring-soft` / raus `instant` · `exit` | nur Zustandswechsel | E1 | **MVP** |
| **W08-02** Ziehen über Tage | horizontaler Start > 10 px oder 300 ms halten (B.2) | Vorschau-Zellen zeigen **sofort** Fläche/Muster des Pinsels (ohne Plakette), gestrichelter Umriss je Zeilensegment erscheint (Fade). Label „13.–19. Mai · 7 Tage“ schwebt über der aktuellen Zelle (folgt per `transform`, am Rasterrand geklemmt). Bei 300-ms-Halten: Startzelle pulsiert einmal (1 → 0,94 → 1) + **Vibration 10 ms** (G-18, eine der zwei Haptik-Stellen; nicht beim waagerechten Start ohne Halten). Kein Nachziehen/Verzögern der Vorschau. | Umriss `instant`; Label folgt per rAF | gleich, ohne Puls, ohne Vibration | E1 | **MVP** |
| **W08-03** Loslassen = Setz-Welle | Ende des Ziehens | Umriss blendet aus. Die Zellen des Bereichs federn **in Datumsreihenfolge** einmal nach (0,94 → 1) und bekommen ihre Plaketten – wie Tinte, die einzieht. Staffel `stagger-cell`, gedeckelt auf `stagger-max`. Snackbar „7 Tage auf ‚geht nicht‘ gesetzt · Rückgängig“ (G-04). | je Zelle `base` · `spring-soft`; Umriss `fast` | Zustand sofort, keine Welle | E2 | **MVP** |
| **W08-04** Bereichsmodus „Zeitraum“ | 1. Tipp | Startzelle bekommt Doppelrahmen (sofort), Ankerpunkt springt ein (`scale-pop` → 1). Hinweiszeile „Jetzt das Ende antippen.“ gleitet über der Leiste ein (`distance-sm`). | Anker `base` · `spring-soft`; Hinweis `base` · `enter` | sofort / Fade | E1 | **MVP** |
| **W08-05** Bereichsmodus 2. Tipp | Ende gewählt | wie W08-03 (Setz-Welle vom Start- zum Endtag); Anker + Hinweis blenden aus. Abbrechen (Esc/„Abbrechen“): Anker schrumpft, Hinweis Fade. | wie W08-03 | sofort | E2 | **MVP** |
| **W08-06** Pinsel wechseln (M-D7) | Tipp auf Segment / Taste 1–3 | **Ein** Indikator (weiße Fläche + 2 px `selected` + `shadow-selected`, Punkt-Marke 8 px oben rechts **im** Indikator) gleitet unter das neue Segment (`translateX` + `scaleX`, gemessen); Label-Fettung und Farbe wechseln **sofort**; Mini-Feld des neuen Pinsels nickt einmal (1 → 1,12 → 1). | Indikator `base` · `standard`; Mini-Feld `base` · `spring-soft` | sofort | E1 | **MVP** |
| **W08-07** Rückgängig | Tipp ↶ / Strg+Z / Snackbar | Betroffene Zellen wechseln sofort zurück und federn **rückwärts** (vom letzten zum ersten Tag) nach; ↶-Icon dreht sich einmal −90° → 0. Ansage „Rückgängig: 7 Tage zurückgesetzt“. Liegt der Bereich außerhalb des Viewports: kein Scrollen, nur Ansage + Toast. | wie W08-03; Icon `base` · `spring-soft` | sofort | E1 | **MVP** |
| **W08-08** Schnellaktionen | Auswahl im Sheet | Sheet schließt (G-05b), dann Welle über alle betroffenen **sichtbaren** Zellen (z. B. alle Werktage), Staffel 6 ms, gedeckelt auf `stagger-max`; unsichtbare Zellen ohne Animation. Snackbar mit Rückgängig. | wie W08-03 | sofort | E2 | **MVP** |
| **W08-09** Speicherstatus | Speichern läuft/fertig/Fehler | „Speichert …“ erst nach 400 ms (Spinner 12 px). „Gespeichert“: Text überblendet, ✓ springt ein. „Nicht gespeichert“: Warn-Icon + Text per Fade, **kein** Wackeln. | `fast`; ✓ `base` · `spring-soft` | Fade | E1 | **MVP** |
| **W08-10** „Fertig – abgeben“ | Server: abgegeben | Button zeigt Ladezustand (G-03). Danach: Werkzeugleiste wird kompakt (Layout springt), Primärbutton weg, Status „✓ Abgegeben · 14:32“ blendet ein. Erfolgs-Sheet „Danke, Kemal! Deine Tage sind drin.“ (G-05) mit `submitted.svg`: `plate` + `calendar` blenden ein, **`seal` (Minze) springt kräftig ein** (G-21), `sparks` einmal (400 ms). **Keine Vibration.** Danach → Tab Gruppe (G-02). | Sheet `slow`; Siegel `celebrate` · `spring-bouncy`; Funken `moderate` | Sheet Fade, Siegel statisch, keine Funken | E3 | **MVP** |
| **W08-11** Monats-Sprung-Chips | Tipp | G-08 zum Monat; Chip-Auswahl wie G-12. Fixierte Monatsüberschrift bekommt Schatten, sobald sie klebt (W01-06-Technik). | | | E2 | MVP |
| **W08-12** Auto-Scroll beim Ziehen am Rand | Finger im oberen/unteren Randbereich (48 px) | Seite scrollt proportional zur Eindringtiefe (max. 12 px/Frame). Keine Animation im engeren Sinn – muss in Reduced Motion erhalten bleiben (Bedienfunktion). | rAF | gleich | – | **MVP** |
| **W08-13** Legende „So funktioniert’s“ | Zuklappen nach Abgabe | G-14 | | | E1 | MVP |
| **W08-14** Phase 3 schreibgeschützt | Termin festgelegt | Werkzeugleiste überblendet zum Hinweis „Der Termin steht fest – deine Tage sind gesperrt.“ Zellen ohne Druck-Feedback. | `base` | Fade | E0 | MVP |
| **W08-15** Willkommens-Hinweis & Geste | erster Besuch | W03-06, W03-07 | | | | MVP |

### W09 – Gruppe: Vorschläge, Heatmap, Tagesdetail (F-008, F-009, F-016) · Kernmoment 2 · 🎬 b

| ID | Auslöser | Ablauf | Dauer / Easing | Reduziert | Stufe | Prio |
|---|---|---|---|---|---|---|
| **W09-01** Segment „Vorschläge \| Kalender“ | Tipp | Segment-Indikator gleitet; Inhalt kommt aus der Richtung des Segments (Kalender von rechts, Vorschläge von links) mit `distance-lg` + Fade. URL-wirksam (ux-spec §7.4). | `base` · `standard` / `enter` | sofort / Fade | E2 | **MVP** |
| **W09-02** Vorschläge erscheinen | erstes Laden/Berechnung fertig | Ggf. Kurz-Skelett (G-07). Gruppenüberschrift „Alle dabei (2)“ blendet ein, das Strich-Häkchen zeichnet sich nicht, sondern springt ein. Karten: Fade + `translateY(distance → 0)`, gestaffelt; erst Gruppe 1, dann Gruppe 2. Max. 3 Karten je Gruppe animiert. | Karten `slow` · `emphasized`, `stagger-card`; Icon `base` · `spring-soft` | Fade | E2 | **MVP** |
| **W09-03** „Alle 7 anzeigen“ | Tipp | Neue Karten unterhalb: Fade + `translateY(distance-sm)`, `stagger-item`. Fokus auf erste neue Karte. | `base` · `enter` | Fade | E2 | MVP |
| **W09-04** Filter ändern (Dauer, Darf fehlen, Personen ausblenden) | Wert geändert | Neuberechnung lokal. Bleibende Karten gleiten per **FLIP** an ihre neue Position; wegfallende: Fade + `scale-enter`; neue: Fade + `translateY(distance-sm)`, `stagger-item`. Heatmap: Flächen überblenden 140 ms (Farbwechsel-Ausnahme, motion-system §7), **Zahlen springen**. Chip: G-13. Hinweis „Nur für dich …“ blendet ein. | FLIP `slow` · `standard`; raus `fast` · `exit`; Heatmap `fast` | Fade, Layout springt | E2 | **MVP** |
| **W09-05** Heatmap-Aufbau | erstes Öffnen der Kalenderansicht in der Sitzung | Zellen im Viewport erscheinen als **diagonale Welle** von oben links (Index = Zeile + Spalte): Fade + `scale(0.92 → 1)`, 24 ms je Diagonale (2 × `stagger-cell`, gedeckelt auf `stagger-max`). Danach springen die ✓-Badges der „alle“-Tage nacheinander ein – der Blick wird zu den besten Tagen geführt. Zahlen sind mit der Zelle sofort lesbar. Zellen außerhalb des Viewports: sofort. **Nur beim ersten Öffnen über das Segment in der Sitzung (M-U8)** – nicht bei „Im Kalender zeigen“ (dann hat das Band W09-06 Vorrang, nur eine E3-Bewegung gleichzeitig) und nicht beim Blättern in der Vorschlag-Leiste (W09-13). | Zelle `base` · `enter`; ✓ `base` · `spring-soft`, `stagger-item` | sofort | E2 | **MVP** |
| **W09-06** „Im Kalender zeigen“ | Tipp auf Vorschlagskarte | 1) Segment wechselt (W09-01), 2) Smooth-Scroll, bis der erste Tag des Zeitraums im oberen Drittel steht (G-08), 3) **Vorschlag-Band zeichnet sich** in Datumsreihenfolge: je Zeilensegment `scaleX(0 → 1)` (Ursprung links), Segmente nacheinander, Endkappen springen am An- und Abreisetag ein; 4) Umriss um den Zeitraum blendet ein, Label „Vorschlag 1 · 5.–10. Mai“ gleitet über der Startzelle ein. Hervorhebung bleibt **4 s oder bis zur nächsten Interaktion**, dann Umriss + Label Fade; **das Band bleibt, solange der Vorschlag in der Vorschlag-Leiste gewählt ist** – also bis man blättert oder die Ansicht verlässt (M-U7). Ansage „Zeitraum 5. bis 10. Mai hervorgehoben“. Desktop: kein Segmentwechsel, Klick/Hover auf Karte zeichnet das Band. Band-Farbe B0: Indigo (hell) / Minze (dunkel), 4 px in der Zeilenfuge. | Band gesamt `moderate` · `standard`; Kappen `fast` · `spring-soft`; Umriss/Label `base` | Sprung statt Scroll; Band, Umriss, Label sofort; gleiche Haltezeit | E3 | **MVP** |
| **W09-07** Tagesdetail öffnen | Tipp auf Zelle | Zelle bekommt Doppelrahmen (sofort), Sheet halb (G-05). Desktop: Seitenpanel gleitet von rechts (`distance-lg`) + Fade. | G-05 | G-05 | E2 | **MVP** |
| **W09-08** Tag blättern ‹ › / Wischen | Tipp oder horizontales Wischen im Sheet | Inhalt gleitet in Blätterrichtung (`distance-lg`) + Fade; Wischen folgt dem Finger, Schwelle 25 % oder Geschwindigkeit; Doppelrahmen im Kalender springt auf den neuen Tag. | `base` · `standard` | Fade | E2 | MVP |
| **W09-09** Kennzahl-Box im Cockpit (ersetzt Statusband, S-1) | Abgabe-Stand geändert / „Alle haben abgegeben“ neu | Ring 52 px wächst auf den neuen Wert (G-20), Satz „6 von 7 haben abgegeben“ **springt** (G-16, ggf. Überblenden). Bei „alle“: Siegel 20 px ploppt neben dem Satz (G-21), Orga-Taste „Abstimmung starten“ blendet ein; „Erinnern“ blendet aus. | Ring `moderate`; Text `fade`; Siegel `moderate` · `spring-bouncy` | sofort / Fade | E2 | MVP |
| **W09-10** Orga wählt „Zur Abstimmung“ | Checkbox | G-12; Karte bekommt `primary`-Rahmen (sofort). Bei der ersten Auswahl gleitet die fixierte Leiste „2 ausgewählt · Abstimmung erstellen“ von unten ein, bei 0 wieder raus. Zahl springt. | Leiste `base` · `enter`/`exit` | Fade | E1 | MVP |
| **W09-11** Leerzustände | keine Daten / keine Treffer | Illustration (`empty-nobody.svg`, `no-matches.svg`) blendet ein; Lösungs-Buttons („Mit 4 statt 5 Nächten …“) gestaffelt. Tipp auf Lösung → W09-04. | `base`, `stagger-item` | Fade | E2 | MVP |
| **W09-12** Hover Vorschlag (Desktop) | Maus über Karte | Band-Vorschau in der Heatmap (W09-06 ohne Scroll, ohne Label); Verlassen: Fade. | `base` | sofort | E1 | MVP+ |
| **W09-13** Vorschlag-Leiste (B-6, < 960 px) | Kalender direkt geöffnet / Tipp ‹ › | **Direkt geöffnet (M-U7):** Leiste steigt von unten ein (G-04-Muster), zeigt Vorschlag 1; dessen Band ist sofort da (ohne Zeichnen, ohne Umriss/Label, **ohne Scroll-Sprung**). **Blättern ‹ ›:** Inhalt der Leiste gleitet in Blätterrichtung (`distance-lg`) + Fade; altes Band blendet aus, neues zeichnet sich (W09-06 Schritt 3, ohne Umriss/Label); liegt der Zeitraum außerhalb des Viewports, Smooth-Scroll dorthin (G-08). Kein Heatmap-Aufbau. Ende erreicht: Pfeil wird `aria-disabled` (Farbwechsel, keine Bewegung). | Leiste `base` · `enter`; Inhalt `base` · `standard`; Band `moderate` | Fade; Band sofort; Sprung statt Scroll | E2 | MVP |

### W10 – Abstimmung erstellen & abstimmen (F-010, F-011, F-017) · Kernmoment 3 · 🎬 c

| ID | Auslöser | Ablauf | Dauer / Easing | Reduziert | Stufe | Prio |
|---|---|---|---|---|---|---|
| **W10-01** Option verschieben ‹ früher / später › | Tipp | Datumszeile überblendet und gleitet 8 px in Verschiebe-Richtung; Verfügbarkeitszeile überblendet. | `fast` · `standard` | Fade | E1 | MVP |
| **W10-02** Option entfernen / hinzufügen | Tipp | Entfernen: Karte Fade + `scale-enter`, Rest per FLIP. Hinzufügen (aus Sheet „Eigener Zeitraum“): neue Karte gleitet unten ein, kurzer Rahmen-Akzent (Overlay `opacity` 1 → 0). | `fast` / FLIP `slow` / rein `slow` · `emphasized` | Fade | E2 | MVP |
| **W10-03** „Abstimmung starten“ | Server OK | Teilen-Sheet öffnet (G-05) mit Kopf „Abstimmung läuft!“; die Lavendel-Icon-Kachel (Abstimmung) ploppt einmal. Kein Siegel (Siegel nur Beitritt/Abgabe/alle abgestimmt). | Kachel `moderate` · `spring-soft` | statisch | E2 | MVP |
| **W10-04** Stimme abgeben (Ja/Vielleicht/Nein, 60 px, Icon über Label) | Tipp auf Option | **Auswahl sofort** (Indigo-Fläche, weißer Inhalt, Fettung). Die Indigo-Fläche wächst aus der Mitte (`scale(0.92 → 1)`), Icon springt ein, die **Häkchen-Ecke** (Minze, 22 px) ploppt 60 ms später; vorher gewählte Option verliert Fläche per Fade. Gespeichert wird optimistisch. | Fläche `base` · `spring-soft`; Icon `fast` · `spring-soft`; Ecke `base` · `spring-soft`; alt `fast` | sofort | E1 | **MVP** |
| **W10-05** Ergebnis-Enthüllung | erste eigene Stimme zu **dieser** Option (D-18) | Zeile „Stimm ab, um das Ergebnis zu sehen.“ blendet aus; Ergebnis-Balken (12 px, Pille, Lücke 4) wächst von links: Ja, dann Vielleicht, dann Nein (`scaleX`, `stagger-item`); Zahlen „✓ 4 · ◐ 1 · ✕ 0“ blenden mit ein (**springen, zählen nicht hoch**). Rang-Chip „Platz 1“ (Sonne, Kopfzeile) springt ein. Karte springt nur um die Balkenhöhe (Layout). Orga: keine Enthüllung, Balken passen sich bei Änderungen per FLIP (`translateX` + `scaleX`) an. | Balken `base` · `standard`; Chip `base` · `spring-soft` | Fade | E2 | **MVP** |
| **W10-06** Vorschlag bestätigen (Geister-Optik) | Tipp auf gestrichelte Option („Ja?“) | Gestrichelter Rahmen weicht der Fläche (W10-04), sichtbares „?“ fällt weg (Text springt), Zeile „Vorschlag aus deinen Tagen“ blendet aus. | wie W10-04 | sofort | E1 | **MVP** |
| **W10-07** „Alle Vorschläge übernehmen“ | Tipp | Vorschläge werden **kartenweise nacheinander** bestätigt (sichtbare Karten, `stagger-card`), jeweils mit W10-05. Hinweisbox blendet danach aus (Layout springt). | `stagger-card` | alles sofort | E2 | **MVP** |
| **W10-08** Alle Optionen beantwortet | letzte offene Stimme | Statuszeile überblendet zu „✓ Danke, deine Stimmen sind gespeichert …“, ✓ springt ein (`spring-soft`); Kennzahl-Kachel „5 von 7“ springt (G-16). **Kein Umsortieren, solange man auf der Seite ist (M-U3, UX-Entscheidung)** – „Platz 1“ steht schon an der Karte. Nach Rang sortiert wird beim **nächsten Öffnen** des Tabs (neuer Seitenaufruf bzw. Tab-Wechsel), dann ohne Umsortier-Bewegung (Karten-Eintritt W10 nur einmal pro Sitzung). | ✓ `base` · `spring-soft` | Statuszeile Fade | E1 | **MVP** |
| **W10-09** „Wer hat wie gestimmt?“ | aufklappen | G-14; Avatare ohne Staffel. | | | E1 | MVP |
| **W10-10** Frist „noch 1 Tag“ | Anzeige | **Keine** pulsierende Warnung (Dauerbewegung). Statische Warnfarbe + Icon. | – | – | – | Regel |
| **W10-11** Leerzustände (Phase 1) | Laden | `vote-waiting.svg`: Ebenen-Eintritt einmal (Sanduhr/Uhr-Ebene kippt 1×), Text sofort. | `moderate` | statisch | E2 | MVP+ |

### W11 – Termin festlegen & Ergebnis (F-012) · der Feier-Moment · 🎬 c

| ID | Auslöser | Ablauf | Dauer / Easing | Reduziert | Stufe | Prio |
|---|---|---|---|---|---|---|
| **W11-01** Dialog „Termin festlegen“ | Tipp „Abstimmung beenden & festlegen“ | G-05; Radio-Auswahl G-12. Gleichstand-Hinweis blendet ein. | | | E2 | **MVP** |
| **W11-02** **„Es geht los!“ – Feier mit dem Vorfreude-Ring** (`countdown-ring.svg` im Cockpit + Ergebnis-Karte) | **Orga:** Server bestätigt Festlegung (t = 0). **Mitglied:** erstes Öffnen der **Übersicht** nach der Festlegung (bzw. über Banner „Ansehen“ / Konflikt-Banner W14-03) – einmal pro Person **und Festlegung**, **serverseitig** je Mitgliedschaft gemerkt, Merker wird beim sichtbaren Start gesetzt (M-U6) | Zeitleiste siehe **[Tabelle W11-02](#w11-02--zeitleiste-der-feier)** unten. Kurz: Karte und Text stehen sofort, die Countdown-Zahl steht sofort (zählt nie hoch); der Sonnenpunkt läuft eine **Ehrenrunde** um den Ring und zieht die Füllung bis zum echten Anteil mit, der Schein hellt einmal auf, 12 Konfetti-Teilchen fallen an ihren Platz; beim Einrasten (≈ 780 ms) kleiner Puff + Vibration (Android); Kern ≤ 1 s, Ausklang ≤ 2,6 s. **Fokus (M-U10):** Orga → **sofort** auf h1 „Es geht los!“ (`tabindex="-1"`, `aria-describedby` → Datumszeile, keine zusätzliche Live-Ansage); Mitglied → normaler Seitenaufruf, **kein** Fokussprung. Konfetti-Ebene `aria-hidden`, `pointer-events: none`, liegt **im Cockpit** unter Kopf-Text und Countdown, nie über der Ergebnis-Karte. **Jede Interaktion** (Tipp, Scroll/Rad, Taste) und `visibilitychange` beenden die Feier sofort im Endzustand. 🎬 c | siehe Tabelle | **nur Überblenden:** Cockpit (Ring im Endzustand) und Ergebnis-Karte blenden 140 ms ein; keine Ehrenrunde, kein Fallen, kein Puff, keine Vibration. | **E4** | **MVP** |
| **W11-03** Wiederholen (Easter Egg) | Tipp auf den Vorfreude-Ring | Kleiner Puff (12 Teilchen) vom Sonnenpunkt. Nutzer-ausgelöst, bei reduzierter Bewegung aus, keine Vibration. | `confetti` × 0,7 | aus | E3 | später |
| **W11-04** Spätere Besuche | Öffnen der Übersicht in Phase 3 (Merker gesetzt) | Cockpit mit statischem Vorfreude-Ring (Endzustand der Datei), Ergebnis-Karte statisch, Countdown springt täglich. Keine Feier. Ruhende Konfetti-Teilchen/Funkel: siehe [abstimmung.md](abstimmung.md) M-D11. | – | – | E0 | **MVP** |
| **W11-05** „Zum Kalender hinzufügen ▾“ | Tipp | Menü: `scale-enter → 1` + Fade, Ursprung am Button. Download: Label überblendet „✓ Heruntergeladen“ (wie G-11). | `fast` · `enter` | Fade | E1 | MVP |
| **W11-06** „Allen Bescheid geben“ | Tipp | Teilen-Sheet (G-05). | | | E2 | MVP |
| **W11-07** Festlegung aufheben | Bestätigung | Ruhig: Ergebnis-Karte und Ring blenden aus, Phase-2-Inhalt blendet ein, Schritt-Balken springen zurück. Kein „Rückwärts-Konfetti“, Ring läuft nicht rückwärts. | `base` | Fade | E0 | MVP |

#### W11-02 – Zeitleiste der Feier

t = 0: Orga = Server-OK der Festlegung (das Sheet schließt gleichzeitig, G-05b, `base` · `exit`); Mitglied = erster Frame der Übersicht. `p` = Füllgrad des Rings in % (vergangene Vorfreude-Zeit Festlegung → Abreise, **mindestens 4 %**, design-system §9.12). Ebenen-Namen = `data-anim` in `countdown-ring.svg`; `backdrop` wird inline weggelassen, das Cockpit liefert den Grund.

| t (ms) | Ebene / Element | Bewegung | Dauer · Easing | Phase |
|---|---|---|---|---|
| 0 | Ergebnis-Karte (h1, Datum, Meta mit Countdown-Text, Tasten) | Fade + `translateY(distance → 0)`; **ab 0 bedienbar, ab 220 ms voll sichtbar** (≤ 300 ms) | `base` · `enter` | Kern |
| 0 | `track`, Countdown-HTML „noch / 209 / Tage“, Cockpit-Kopf | **stehen sofort**, keine Bewegung; Zahl zählt **nie** hoch | – | – |
| 60 | `glow` | einmal aufhellen: Deckkraft 0 → 1, `scale(0.7 → 1)` (Ursprung Ringmitte) | `moderate` · `spring-soft` | Kern |
| 80–780 | `ring` + `knob` | **Ehrenrunde:** Der Sonnenpunkt läuft eine volle Runde **plus** `p` (Kopf 0 → 100 + p %), die Füllung folgt als Schweif mit 12 % Verzug (Schwanz 0 → 100 %) und endet genau beim Anteil `p` ab 12 Uhr. Technik: `stroke-dasharray = L (100 − L)` (Periode = Pfadlänge 100 → läuft über 12 Uhr nahtlos), `stroke-dashoffset = −Schwanz`, äußere `knob`-Gruppe `rotate(Kopf · 3,6° − p · 3,6°)` um 195/236; beide aus **denselben** vorberechneten Keyframes (Kurve `standard`, 28 Stützstellen, linear dazwischen) → Punkt und Ring bleiben verriegelt. Endzustand = Attribute der Datei (`dasharray "p 100"`, `dashoffset 0`, innere Gruppe `rotate(p · 3,6)`). | 700 · `standard` | Kern |
| 120 + i · 40 | `confetti` (`data-piece` 1–12) | jedes Teilchen fällt 90–160 px von oben an seinen Platz, dreht sich dabei 120–240° zurück, Deckkraft 0 → 1 im ersten Viertel | 1100–1500 · `standard`, Staffel `stagger-item` | Ausklang (bis ≈ 2060) |
| 300 | Ergebnis-Karte: Schritt-Balken „Steht fest“ | wächst `scaleX(0 → 1)` (Sonne) | `moderate` · `standard` | Kern |
| 780 | `knob` (Kreis) | rastet ein: `scale 1 → 1,35 → 1` | `base` · `spring-soft` → fertig bei 1000 | **Kern-Ende ≤ 1000** |
| 780 | – | **Vibration 15 ms** (nur Android, nicht reduziert; G-18) | – | – |
| 780 | Puff (eigene `aria-hidden`-Ebene im Cockpit) | ≤ 24 Teilchen mobil / ≤ 40 ab 600 px vom Sonnenpunkt, Fächer nach oben ± 75°, Schwerkraft, Drehung, Ausblenden ab 70 %; Formen M-D5, Farben `--ww-confetti-1…5` | 1200–1700 · `linear` (Physik vorberechnet) | Ausklang (bis ≈ 2540) |
| 800 + i · 60 | `sparkles` (3) | ploppen `scale(0 → 1)` + Deckkraft | `base` · `spring-soft` | Ausklang (bis ≈ 1140) |
| 2600 | alles | hartes Ende (`CELEBRATION_MAX_MS`): laufende Animationen springen in den Endzustand, Puff blendet aus (`fast`) | – | Ende |

**Abbruch:** `pointerdown`, `wheel`, `touchmove`, `keydown` (capture, passiv) und `visibilitychange` → alle Animationen `finish()` (Endzustand), Puff-Ebene blendet in `fast` aus. Programmatisches Scrollen zählt nicht als Interaktion. **Reduziert:** Cockpit und Karte je 140 ms Überblenden, sonst nichts. **i18n:** Ring, Countdown und Karte haben keine Textbewegung; lange DE-Texte („Zum Kalender hinzufügen“) brechen in der Karte um, ohne die Zeitleiste zu beeinflussen.

### W12 – Reise bearbeiten & Verwaltung · ruhig

| ID | Auslöser | Ablauf | Dauer / Easing | Reduziert | Stufe | Prio |
|---|---|---|---|---|---|---|
| **W12-01** Formular | Änderungen, Speichern | G-10, G-03; „Gespeichert“ per Toast (G-04). | | | E0 | MVP |
| **W12-02** Destruktive Dialoge (Reise löschen, Mitglied entfernen, Orga übergeben) | öffnen | G-06 ohne Feder; Löschen-Button wird aktiv (Name korrekt eingetippt): nur Farbwechsel, keine Bewegung. | `base` · `enter` | Fade | E0 | MVP |
| **W12-03** Reise gelöscht | Server OK | G-01 nach „Meine Reisen“ + Toast; keine Illustration-Animation. | | | E0 | MVP |

### W13 – Konto (F-041–F-043, F-046) · ruhig

| ID | Auslöser | Ablauf | Dauer / Easing | Reduziert | Stufe | Prio |
|---|---|---|---|---|---|---|
| **W13-01** Schalter „Bewegung reduzieren“ (Karte „Darstellung“, Q17 / M-U1) | Tipp | Schalter-Knopf gleitet (G-12), Häkchen im Knopf ploppt; Wirkung **sofort** (`data-motion="reduce"` am `<html>`, Konto + `localStorage`), ohne Neuladen; Snackbar „Gespeichert“ (G-04). Beim Einschalten wirkt die Reduktion schon auf den Knopf selbst (er springt). **Gerät reduziert:** Schalter steht „an“, nicht bedienbar (Schloss + Grund), keine Hover-/Druck-Bewegung. | `fast` · `spring-soft` | sofort | E1 | **MVP** |
| **W13-02** E-Mail ändern, Passwort, Konto löschen | Formulare/Dialoge | G-10, G-06, W02-Code-Komponente. | | | E0 | MVP |
| **W13-03** Konto gelöscht | Server OK | `goodbye.svg` blendet ein, **keine** verspielte Bewegung (Abschied, Vertrauen). | `base` | Fade | E0 | MVP |

### W14 – System- & Fehlerzustände

| ID | Auslöser | Ablauf | Dauer / Easing | Reduziert | Stufe | Prio |
|---|---|---|---|---|---|---|
| **W14-01** Fehlerseiten (404, ungültiger Link, 5xx) | Laden | Inhalt Fade; `error.svg` statisch. Kein Wackeln, kein Humor-Effekt. | `base` | Fade | E0 | MVP |
| **W14-02** Offline-Banner | Verbindung weg/da | G-09; beim Wiederverbinden: Text überblendet „Wieder online – gespeichert ✓“, dann Banner raus nach 2 s. | `base` | Fade | E0 | MVP |
| **W14-03** Konflikt-Banner („Lena hat den Termin inzwischen festgelegt“) | Server-Konflikt | G-09; „Ansehen“ führt zu W11 – dort zählt die Feier als „erstes Öffnen“ (W11-02). | | | E0 | MVP |

### W15 – Hilfe/FAQ · ruhig

| ID | Auslöser | Ablauf | Dauer / Easing | Reduziert | Stufe | Prio |
|---|---|---|---|---|---|---|
| **W15-01** FAQ aufklappen | Tipp | G-14 | | | E0 | MVP |
| **W15-02** Sprung zu Frage (Anker aus anderer Seite) | Laden mit `#anker` | G-08; Zielfrage bekommt kurze Tönung (Overlay `opacity` 1 → 0 über 1,2 s), damit man sie findet. | 1200 ms | Tönung bleibt 2 s statisch, dann aus | E1 | MVP+ |

---

## 3. Feature-Index (Feature → Bewegungen)

| Feature | IDs |
|---|---|
| F-001 Reise anlegen | W05-01 … W05-05 |
| F-002 Einladen/Teilen | W06-01 … W06-05, G-11 |
| F-003 Beitreten | W03-01 … W03-08 |
| F-004/F-013 Rollen, Verlassen, Löschen | W12-02, W12-03, W04-05 |
| F-005 Verfügbarkeit | W08-01 … W08-15 |
| F-007 Teilnahmestatus | W07-02, W07-03, W07-04, W09-09, G-15, G-20 |
| F-008 Heatmap | W09-04, W09-05, W09-07, W09-08 |
| F-009 Vorschläge | W09-02, W09-03, W09-06, W09-11, W09-12, W09-13 |
| F-010 Abstimmung erstellen | W10-01 … W10-03 |
| F-011 Abstimmen | W10-04 … W10-09 |
| F-012 Festlegen | W11-01 … W11-07 (Zeitleiste W11-02), W04-03 |
| F-052 / G-16 Kein Hochzählen | G-16 (Regel) |
| Q17 Konto-Schalter, Haptik | W13-01, G-18 |
| F-015 Erinnern | G-05, W06-03 |
| F-016 Feiertage/Wochenenden | keine eigene Bewegung (statische Markierungen) |
| F-017 Fristen | W10-10 (Regel: keine Dauerbewegung) |
| F-040/F-041 Registrierung/Login (Code) | W02-01 … W02-08 |
| F-043 Konto löschen | W13-03 |
| F-044 Meine Reisen | W04-01 … W04-07 |
| F-046 Sprache | G-19, motion-system §5.9 |
| F-051 Hilfe | W15-01, W15-02 |

## 4. Prüfliste für Review (Motion)
- [ ] Jede Animation hat eine Reduced-Motion-Variante gemäß Tabelle; Playwright-Lauf mit `reducedMotion: 'reduce'` **und** mit `<html data-motion="reduce">` zeigt keine `transform`-Animationen (`document.getAnimations()`).
- [ ] Nichts läuft automatisch > 5 s (Feier ≤ 2,6 s, Geste ≤ 2,8 s, Skelett, Caret).
- [ ] Keine Zahl zählt hoch (Kennzahl, Stimmen, Countdown im Ring und in der Karte).
- [ ] `navigator.vibrate` wird nur an zwei Stellen aufgerufen (W08-02, W11-02), nie bei reduzierter Bewegung.
- [ ] Abstimmungskarten werden nicht umsortiert, solange der Tab offen ist (W10-08).
- [ ] Feier: Orga-Fokus sofort auf h1, Mitglied ohne Fokussprung; Feier je Person und Festlegung nur einmal (Server-Merker), Abbruch durch jede Interaktion.
- [ ] Tipp-Feedback ≤ 100 ms (Performance-Panel: `pointerdown` → erster Frame).
- [ ] Nur `transform`/`opacity` (Ausnahme: Farbwechsel kleiner Elemente ≤ 140 ms).
- [ ] Fokus springt nie durch Animationen; Sheets geben Fokus zurück.
- [ ] Texte/CTA sind ohne Warten auf Animation lesbar (Landing, Ergebnis-Karte, Vorschau-Karte).
- [ ] DE-Pseudo-Locale (+40 %): Indikatoren, Labels über Zellen, Buttons mit Ladezustand brechen sauber um.
- [ ] In-App-Browser (iOS WhatsApp/Instagram, Android Instagram): Sheet-Ziehen kollidiert nicht mit Seiten-Scroll (`overscroll-behavior: contain`).

## Changelog
- 2026-10-08 **v1.0:** Abgleich mit Design-System v1.0 (B/B0) und Antworten M-D/M-U: W11-02 neu als Vorfreude-Ring-Feier mit Zeitleiste; G-02 Cockpit-Pille; G-16 inkl. Countdown; G-18 nur 2 Stellen; neu G-20 (Ring), G-21 (Siegel Minze), W09-13 (Vorschlag-Leiste); W01-01/03 nach `hero.svg` v1.0; W01-05 entfällt (M-U4); W02-01 optimistischer Code-Schritt (M-U5); W03-01 Reisekarte; W03-06 ohne Avatar-Reihe; W03-07 Reduziert ohne Zeitlimit (M-U9); W08-06 Pinsel-Indikator (M-D7); W09-05 nur erstes Öffnen (M-U8); W09-06 Band bleibt (M-U7); W09-09 Kennzahl-Box; W10-04/05 Optik B; W10-08 kein Umsortieren (M-U3); W13-01 entschieden.
- 2026-10-08 v0.1: Erstfassung.
