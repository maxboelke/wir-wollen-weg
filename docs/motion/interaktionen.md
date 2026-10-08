# Interaktions-Katalog (Motion) – pro Ansicht und Feature

Stand: 2026-10-08 · Verantwortlich: Motion Designer · Status: v0.1 (Entwurf)
Bezug: [motion-system.md](motion-system.md) (Tokens, Energie-Stufen E0–E4, Regeln) · Wireframes [W01–W15](../ux/wireframes/README.md) · [user-flows.md](../ux/user-flows.md) · [ux-spec.md](../ux/ux-spec.md) · [design-system.md](../design/design-system.md) · Prototypen: [prototypes/](prototypes/README.md)

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
| 4 | **„Es geht los!“** – Siegel, Kalenderblatt, Konfetti, einmal pro Person | W11-02 | Der eine große Feier-Moment (F-012) 🎬 c |
| 5 | **Code richtig → „Du bist dabei!“** – Erfolgs-Welle über die Kästchen, Siegel im Willkommens-Hinweis | W02-05, W03-06 | Erster Eindruck für Eingeladene, Beitrittsquote (F-040/F-003) 🎬 e |

---

## 1. Global & Komponenten

| ID | Auslöser | Ablauf | Dauer / Easing | Reduziert | Stufe | Prio |
|---|---|---|---|---|---|---|
| **G-01** Seitenwechsel (Route) | Navigation zu neuer Seite (nicht Tabs) | Alte Seite verschwindet sofort (kein Austritt, damit nichts wartet). Neuer Hauptinhalt (`<main>`): Deckkraft 0 → 1 + `translateY(distance-sm → 0)`. Header bleibt stehen. Zurück-Navigation: **keine** Animation, Scrollposition wird wiederhergestellt (ux-spec §3). | `base` · `enter` | Fade | E2 | MVP |
| **G-02** Tab-Wechsel Reise (Übersicht · Meine Tage · Gruppe · Abstimmen) | Tipp auf Tab-Link | 1) Unterstrich-Indikator gleitet zur neuen Position und passt seine Breite an (ein Element, `translateX` + `scaleX`, gemessen an der Label-Breite – funktioniert bei zweizeiligen/langen Labels). 2) Neuer Tab-Inhalt kommt aus der Richtung des Tabs: rechts liegender Tab `translateX(+distance-lg → 0)`, links liegender `−distance-lg`, plus Fade. Richtung aus vorigem Tab-Index (`sessionStorage`). Tab-Leiste scrollt den aktiven Tab bei Überbreite sanft in Sicht. | Indikator `base` · `standard`; Inhalt `base` · `enter` | Indikator springt; Inhalt Fade | E2 | MVP |
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
| **G-15** Fortschrittsbalken (`<progress>`-Optik, „5 von 7“) | erstes Erscheinen in der Sitzung | Füllung wächst von 0 auf den Wert (`scaleX`, Ursprung links). Text „5 von 7“ steht sofort da. Bei späteren Wertänderungen: von alt auf neu. | `moderate` · `standard` | sofort | E2 | MVP+ |
| **G-16** Zahlen | jede Änderung (Zähler, x/n, Stimmen) | **Keine Animation** (kein Hochzählen) – Lesbarkeit, design-system §8. | – | – | – | Regel |
| **G-17** Hover (nur Zeigegeräte) | `@media (hover:hover)` | Karten heben sich `translateY(−2px)`, Schatten über Pseudo-Element (`opacity`). | `fast` · `standard` | nur Schatten | E1 | MVP+ |
| **G-18** Haptik | Ziehen startet nach 300 ms Halten (B.2), Siegel F-012 | `navigator.vibrate(10)` bzw. `[12, 40, 12]`, nur wenn verfügbar (iOS: nie). Fällt bei Reduced Motion weg. | – | aus | E1 | MVP+ |
| **G-19** Sprache umschalten | Tipp auf „English“/„Deutsch“ | Keine Animation (Seite lädt neu, Fokus bleibt auf Umschalter, user-flows F.3). | – | – | E0 | Regel |

---

## 2. Ansichten

### W01 – Landing (`/de`, `/en`) · Scroll-Effekte · 🎬 d

| ID | Auslöser | Ablauf | Dauer / Easing | Reduziert | Stufe | Prio |
|---|---|---|---|---|---|---|
| **W01-01** Hero-Eintritt | Laden (einmal pro Sitzung) | **Text, Headline und „Reise planen“ stehen sofort** (LCP!). Nur die Illustration baut sich auf, Ebenen gestaffelt: Teller blendet ein → Sonne steigt 12 px auf → Kalender kippt von −8° auf −4° und landet (Feder) → Heatmap-Felder füllen sich als Welle → Vorschlag-Band zeichnet sich von links → drei Freunde springen nacheinander ein. Gesamt ≤ 1,1 s. | je Ebene `moderate`; Felder `stagger-cell`; Freunde `stagger-card` · `spring-soft` | statisch | E3 | MVP+ |
| **W01-02** „So geht’s“ – Reveal | Schritt-Karten kommen in den Viewport (IntersectionObserver, 20 %) | Karte: Fade + `translateY(distance → 0)`, gestaffelt; Nummern-Kreis ①②③ springt mit Feder ein. Einmalig. **Nur unterhalb des ersten Viewports**; ohne JS/IO: sofort sichtbar. | `slow` · `enter`, `stagger-card` | sichtbar ohne Bewegung | E2 | MVP |
| **W01-03** Parallax Sonne | Scrollen | Sonne der Hero-Illustration bewegt sich langsamer als die Seite (max. 24 px), Meer-Welle minimal schneller (max. 8 px). Rein dekorativ, per `animation-timeline: scroll()` in `@supports`. | scroll-gebunden, `linear` | entfällt | E2 | MVP+ |
| **W01-04** Mini-Demos in „So geht’s“ | Schritt im Viewport | ② „Tage antippen“: drei Mini-Zellen werden nacheinander markiert (einmal, 900 ms) · ③ „Abstimmen & fix“: kleines Häkchen-Siegel springt ein. Keine Schleife. | `stagger-item`, `spring-soft` | statischer Endzustand | E2 | später |
| **W01-05** Sticky „Reise planen“ | Hero-CTA scrollt aus dem Bild (mobil) | Fixierte Leiste unten mit CTA gleitet ein (`translateY(100% → 0)`), beim Zurückscrollen wieder raus. **Abhängig von UI/UX** (M-U4). | `base` · `enter`/`exit` | Fade | E2 | später |
| **W01-06** Sticky-Header-Schatten | Seite gescrollt > 0 | Schatten unter dem Header blendet ein (Pseudo-Element, `opacity`), per Scroll-Timeline oder IO-Sentinel. | `fast` | sofort | E1 | MVP+ |

### W02 – Anmelden, Code, Profil (`/login`) · ruhig (E0) · 🎬 e

| ID | Auslöser | Ablauf | Dauer / Easing | Reduziert | Stufe | Prio |
|---|---|---|---|---|---|---|
| **W02-01** Schrittwechsel E-Mail → Code → Name | Absenden erfolgreich | Alter Schritt: Fade raus. Neuer Schritt: Fade + `translateX(+distance-sm → 0)` (zurück: von links). **Fokus wird synchron im Tipp-Ereignis gesetzt**, nicht nach der Animation – sonst öffnet iOS die Tastatur nicht. | raus `fast` · `exit`; rein `base` · `enter` | Fade | E0 | **MVP (Ink. 1)** |
| **W02-02** Ziffer erscheint | Eingabe/Löschen | Ziffer im Kästchen: `scale(0.8 → 1)` + Fade. Aktives Kästchen wechselt sofort (Rahmen). Löschen: ohne Animation. | `instant` · `standard` | sofort | E1 | **MVP (Ink. 1)** |
| **W02-03** Einfügen / Autofill | 6 Ziffern auf einmal | Ziffern erscheinen von links nach rechts gestaffelt (insgesamt ≤ 120 ms), danach Zustand „Prüfe Code …“. Absenden startet **sofort**, nicht nach der Staffel. | `instant`, Staffel 20 ms | sofort | E1 | **MVP (Ink. 1)** |
| **W02-04** Code falsch | Server: falsch (Versuch 1–4) | Alle Kästchen: einmal horizontal wackeln (0 → −4 → 4 → −2 → 0 px), Rahmen sofort `danger`, Fehlertext blendet ein, Wert bleibt markiert, Fokus bleibt. | `base` · `standard` | **kein Wackeln**, nur Rahmen + Text | E0 | **MVP (Ink. 1)** |
| **W02-05** Code richtig | Server: OK | Kästchen werden von links nach rechts `primary-tint` (Fläche sofort je Kästchen, kleine Skalierung 1 → 1,06 → 1), danach ✓ springt rechts neben dem Feld ein. Navigation läuft parallel; Weiterleitung spätestens 450 ms nach OK (`SUCCESS_HOLD_MAX_MS`). | `stagger-item` je Kästchen, `fast`; ✓ `base` · `spring-soft` | Fläche + ✓ sofort | E1 | **MVP (Ink. 1)** |
| **W02-06** Gesperrt (5. Versuch) | Server: gesperrt | Kästchen blenden in den gesperrten Zustand (gestrichelt), Schloss + Text blenden ein, Primärbutton wechselt per Fade. Kein Wackeln. | `base` | Fade | E0 | **MVP (Ink. 1)** |
| **W02-07** Caret & Countdown | Fokus im Feld | Caret-Strich blinkt 1 Hz, **max. 5 s**, dann statisch. Countdown „Neuer Code in 0:27“ ohne Animation. | 1000 ms `steps(1)` | statisch | E0 | **MVP (Ink. 1)** |
| **W02-08** „Prüfe Code …“ | nach 6. Ziffer | Spinner 16 px blendet ein (erst nach 400 ms Wartezeit). | `fast` | drei statische Punkte | E0 | **MVP (Ink. 1)** |

### W03 – Einladung & Beitritt (`/i/{token}`, F-003) · 🎬 e

| ID | Auslöser | Ablauf | Dauer / Easing | Reduziert | Stufe | Prio |
|---|---|---|---|---|---|---|
| **W03-01** Vorschau-Karte | Laden | Karte: Fade + `translateY(distance → 0)`. Text sofort lesbar (Karte startet bei Deckkraft 0,01 → max. 320 ms). Illustration `invite.svg`: Ebene „Brief/Flieger“ gleitet 12 px schräg ein (einmal). | Karte `slow` · `emphasized`; Illustration `moderate` | Fade | E2 | MVP |
| **W03-02** „Mitmachen“ → Formular | Tipp | Volle Karte überblendet zur kompakten Karte (Inhalt überblenden, kein Höhen-Morph); das E-Mail-Formular kommt von unten (`distance-sm`) + Fade. Fokus sofort ins E-Mail-Feld (synchron). | `base` · `enter` | Fade | E0 | MVP |
| **W03-03** Schritte E-Mail → Code → Name | wie W02-01 | wie W02-01; die Kontext-Karte bleibt stehen (Anker). | wie W02-01 | Fade | E0 | MVP |
| **W03-04** Code-Zustände | wie W02-02 … W02-08 | identische Komponente | | | | MVP |
| **W03-05** Name doppelt | Hinweis erscheint | Hinweis blendet ein; Tipp auf „Übernehmen“: Feldwert überblendet, kurzer ✓-Pop. | `fast` | Fade | E0 | MVP |
| **W03-06** Beitritt geschafft → Meine Tage | Server: beigetreten | Seitenwechsel (G-01). Willkommens-Hinweis „Du bist dabei!“ gleitet von oben ein (`distance-sm`), sein ✓-Siegel springt kräftig ein (einziges Siegel im Flow). Die eigene Initiale reiht sich in die Avatar-Reihe der Gruppe ein (falls dort sichtbar: `translateX(distance → 0)` mit Feder). | Hinweis `base` · `enter`; Siegel `moderate` · `spring-bouncy` | Hinweis + Siegel statisch | E3 | MVP |
| **W03-07** Geste-Hinweis „Tippen oder wischen“ | 600 ms nach W03-06, nur beim ersten Besuch | Halbtransparenter Finger-Punkt wischt über 4 Zellen einer Woche; die Zellen zeigen die gestrichelte Vorschau (werden **nicht** geändert). Max. 2 Durchläufe, ≤ 3 s, stoppt bei jeder Berührung. Text darunter bleibt stehen. 🎬 a | 2 × 1200 ms · `standard` | statische Skizze + Text | E2 | MVP |
| **W03-08** Sonderzustände (voll, gesperrt, ungültig) | Laden | Nur Fade. `error.svg` ohne Bewegung. | `fast` | Fade | E0 | MVP |

### W04 – Meine Reisen (`/trips`, F-044)

| ID | Auslöser | Ablauf | Dauer / Easing | Reduziert | Stufe | Prio |
|---|---|---|---|---|---|---|
| **W04-01** Karten-Eintritt | erstes Laden in der Sitzung | „Zu tun“-Karten zuerst, dann laufende Reisen: Fade + `translateY(distance → 0)`, gestaffelt (max. 5 Karten, Rest gleichzeitig). Zurück-Navigation: keine Staffel. | `slow` · `enter`, `stagger-card` | Fade | E2 | MVP |
| **W04-02** To-do-Zeile | Karte erscheint | Pfeil „→“ nickt einmal 4 px nach rechts (nach dem Eintritt) – Hinweis „hier bist du dran“. Einmal, keine Schleife. | 2 × `base` | entfällt | E1 | MVP+ |
| **W04-03** Fortschritt „5 von 7“ | Karte erscheint | G-15 | | | | MVP+ |
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
| **W07-02** Phasen-Leiste ① ② ③ | Phase hat sich seit dem letzten Besuch geändert (`localStorage` je Reise) | Verbindungslinie zum neuen Schritt füllt sich (`scaleX`), der neue Schritt-Kreis springt mit Feder ein, erledigter Schritt bekommt ✓-Pop. Sonst statisch. | Linie `moderate` · `standard`; Kreis `base` · `spring-soft` | sofort | E3 | MVP+ |
| **W07-03** Nächster-Schritt-Karte | Inhalt ändert sich | Überblenden des Inhalts; G-15 für den Fortschritt. | `base` | Fade | E2 | MVP |
| **W07-04** „Wer ist dabei?“ | neues Mitglied seit letztem Besuch | Zeile bekommt kurz eine Tönung (Overlay `opacity` 1 → 0 über 1,2 s) + Chip „neu“. | 1200 ms · `standard` | nur Chip | E1 | später |
| **W07-05** Reisemenü „⋯“ | öffnen | G-05 | | | E2 | MVP |
| **W07-06** Header bei Querformat < 480 px | Scroll ab/auf | Header gleitet raus/rein (`translateY(−100%)`) (ux-spec §2). | `base` · `standard` | sofort | E1 | MVP |

### W08 – Meine Tage (F-005, F-016) · Kernmoment 1 · 🎬 a

| ID | Auslöser | Ablauf | Dauer / Easing | Reduziert | Stufe | Prio |
|---|---|---|---|---|---|---|
| **W08-01** Tag antippen | `pointerdown` auf Zelle | **Zustand sofort** (Fläche + Muster). Zelle drückt sich auf `scale-cell` (0,94) und federt beim Loslassen zurück. Symbol-Plakette (✕/◐): springt von `scale-pop` auf 1. Zurück auf „Geht“: Plakette schrumpft + Fade (kürzer). Ansage in Live-Region. | runter `instant`; zurück `base` · `spring-soft`; Plakette `fast` · `spring-soft` / raus `instant` · `exit` | nur Zustandswechsel | E1 | **MVP** |
| **W08-02** Ziehen über Tage | horizontaler Start > 10 px oder 300 ms halten (B.2) | Vorschau-Zellen zeigen **sofort** Fläche/Muster des Pinsels (ohne Plakette), gestrichelter Umriss je Zeilensegment erscheint (Fade). Label „13.–19. Mai · 7 Tage“ schwebt über der aktuellen Zelle (folgt per `transform`, am Rasterrand geklemmt). Bei 300-ms-Halten: Startzelle pulsiert einmal (1 → 0,94 → 1) + Haptik (G-18). Kein Nachziehen/Verzögern der Vorschau. | Umriss `instant`; Label folgt per rAF | gleich, ohne Puls | E1 | **MVP** |
| **W08-03** Loslassen = Setz-Welle | Ende des Ziehens | Umriss blendet aus. Die Zellen des Bereichs federn **in Datumsreihenfolge** einmal nach (0,94 → 1) und bekommen ihre Plaketten – wie Tinte, die einzieht. Staffel `stagger-cell`, gedeckelt auf `stagger-max`. Snackbar „7 Tage auf ‚geht nicht‘ gesetzt · Rückgängig“ (G-04). | je Zelle `base` · `spring-soft`; Umriss `fast` | Zustand sofort, keine Welle | E2 | **MVP** |
| **W08-04** Bereichsmodus „Zeitraum“ | 1. Tipp | Startzelle bekommt Doppelrahmen (sofort), Ankerpunkt springt ein (`scale-pop` → 1). Hinweiszeile „Jetzt das Ende antippen.“ gleitet über der Leiste ein (`distance-sm`). | Anker `base` · `spring-soft`; Hinweis `base` · `enter` | sofort / Fade | E1 | **MVP** |
| **W08-05** Bereichsmodus 2. Tipp | Ende gewählt | wie W08-03 (Setz-Welle vom Start- zum Endtag); Anker + Hinweis blenden aus. Abbrechen (Esc/„Abbrechen“): Anker schrumpft, Hinweis Fade. | wie W08-03 | sofort | E2 | **MVP** |
| **W08-06** Pinsel wechseln | Tipp auf Segment / Taste 1–3 | Auswahl-Fläche gleitet als **ein** Indikator unter das neue Segment (`translateX` + `scaleX`, gemessen), Mini-Feld des neuen Pinsels nickt einmal (1 → 1,12 → 1). | Indikator `base` · `standard`; Mini-Feld `base` · `spring-soft` | sofort | E1 | **MVP** |
| **W08-07** Rückgängig | Tipp ↶ / Strg+Z / Snackbar | Betroffene Zellen wechseln sofort zurück und federn **rückwärts** (vom letzten zum ersten Tag) nach; ↶-Icon dreht sich einmal −90° → 0. Ansage „Rückgängig: 7 Tage zurückgesetzt“. Liegt der Bereich außerhalb des Viewports: kein Scrollen, nur Ansage + Toast. | wie W08-03; Icon `base` · `spring-soft` | sofort | E1 | **MVP** |
| **W08-08** Schnellaktionen | Auswahl im Sheet | Sheet schließt (G-05b), dann Welle über alle betroffenen **sichtbaren** Zellen (z. B. alle Werktage), Staffel 6 ms, gedeckelt auf `stagger-max`; unsichtbare Zellen ohne Animation. Snackbar mit Rückgängig. | wie W08-03 | sofort | E2 | **MVP** |
| **W08-09** Speicherstatus | Speichern läuft/fertig/Fehler | „Speichert …“ erst nach 400 ms (Spinner 12 px). „Gespeichert“: Text überblendet, ✓ springt ein. „Nicht gespeichert“: Warn-Icon + Text per Fade, **kein** Wackeln. | `fast`; ✓ `base` · `spring-soft` | Fade | E1 | **MVP** |
| **W08-10** „Fertig – abgeben“ | Server: abgegeben | Button zeigt Ladezustand (G-03). Danach: Werkzeugleiste wird kompakt (Layout springt), Primärbutton weg, Status „✓ Abgegeben · 14:32“ blendet ein. Erfolgs-Sheet „Danke, Kemal! Deine Tage sind drin.“ (G-05) mit `submitted.svg`: Kalenderblatt blendet ein, **Siegel springt kräftig ein**, drei kleine Funken (einmal, 400 ms). Danach → Tab Gruppe (G-02). | Sheet `slow`; Siegel `celebrate` · `spring-bouncy`; Funken `moderate` | Sheet Fade, Siegel statisch, keine Funken | E3 | **MVP** |
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
| **W09-05** Heatmap-Aufbau | erstes Öffnen der Kalenderansicht in der Sitzung | Zellen im Viewport erscheinen als **diagonale Welle** von oben links (Index = Zeile + Spalte): Fade + `scale(0.92 → 1)`, `stagger-cell` je Diagonale (gedeckelt ≤ 400 ms). Danach springen die ✓-Badges der „alle“-Tage nacheinander ein – der Blick wird zu den besten Tagen geführt. Zahlen sind mit der Zelle sofort lesbar. Zellen außerhalb des Viewports: sofort. Später in der Sitzung: kein Aufbau. | Zelle `base` · `enter`; ✓ `base` · `spring-soft`, `stagger-item` | sofort | E2 | **MVP** |
| **W09-06** „Im Kalender zeigen“ | Tipp auf Vorschlagskarte | 1) Segment wechselt (W09-01), 2) Smooth-Scroll, bis der erste Tag des Zeitraums im oberen Drittel steht (G-08), 3) **Vorschlag-Band zeichnet sich** in Datumsreihenfolge: je Zeilensegment `scaleX(0 → 1)` (Ursprung links), Segmente nacheinander, Endkappen springen am An- und Abreisetag ein; 4) Umriss um den Zeitraum blendet ein, Label „Vorschlag 1 · 5.–10. Mai“ gleitet über der Startzelle ein. Hervorhebung bleibt **4 s oder bis zur nächsten Interaktion**, dann Umriss + Label Fade (Band bleibt bis Verlassen). Ansage „Zeitraum 5. bis 10. Mai hervorgehoben“. Desktop: kein Segmentwechsel, Klick/Hover auf Karte zeichnet das Band. | Band gesamt `moderate` · `standard`; Kappen `fast` · `spring-soft`; Umriss/Label `base` | Sprung statt Scroll; Band, Umriss, Label sofort; gleiche Haltezeit | E3 | **MVP** |
| **W09-07** Tagesdetail öffnen | Tipp auf Zelle | Zelle bekommt Doppelrahmen (sofort), Sheet halb (G-05). Desktop: Seitenpanel gleitet von rechts (`distance-lg`) + Fade. | G-05 | G-05 | E2 | **MVP** |
| **W09-08** Tag blättern ‹ › / Wischen | Tipp oder horizontales Wischen im Sheet | Inhalt gleitet in Blätterrichtung (`distance-lg`) + Fade; Wischen folgt dem Finger, Schwelle 25 % oder Geschwindigkeit; Doppelrahmen im Kalender springt auf den neuen Tag. | `base` · `standard` | Fade | E2 | MVP |
| **W09-09** Statusband | Zustand „Alle haben abgegeben“ neu | Text überblendet, ✓ springt ein; Orga-Button „Abstimmung starten“ blendet ein. | `base`; ✓ `spring-soft` | Fade | E2 | MVP |
| **W09-10** Orga wählt „Zur Abstimmung“ | Checkbox | G-12; Karte bekommt `primary`-Rahmen (sofort). Bei der ersten Auswahl gleitet die fixierte Leiste „2 ausgewählt · Abstimmung erstellen“ von unten ein, bei 0 wieder raus. Zahl springt. | Leiste `base` · `enter`/`exit` | Fade | E1 | MVP |
| **W09-11** Leerzustände | keine Daten / keine Treffer | Illustration (`empty-nobody.svg`, `no-matches.svg`) blendet ein; Lösungs-Buttons („Mit 4 statt 5 Nächten …“) gestaffelt. Tipp auf Lösung → W09-04. | `base`, `stagger-item` | Fade | E2 | MVP |
| **W09-12** Hover Vorschlag (Desktop) | Maus über Karte | Band-Vorschau in der Heatmap (W09-06 ohne Scroll, ohne Label); Verlassen: Fade. | `base` | sofort | E1 | MVP+ |

### W10 – Abstimmung erstellen & abstimmen (F-010, F-011, F-017) · Kernmoment 3 · 🎬 c

| ID | Auslöser | Ablauf | Dauer / Easing | Reduziert | Stufe | Prio |
|---|---|---|---|---|---|---|
| **W10-01** Option verschieben ‹ früher / später › | Tipp | Datumszeile überblendet und gleitet 8 px in Verschiebe-Richtung; Verfügbarkeitszeile überblendet. | `fast` · `standard` | Fade | E1 | MVP |
| **W10-02** Option entfernen / hinzufügen | Tipp | Entfernen: Karte Fade + `scale-enter`, Rest per FLIP. Hinzufügen (aus Sheet „Eigener Zeitraum“): neue Karte gleitet unten ein, kurzer Rahmen-Akzent (Overlay `opacity` 1 → 0). | `fast` / FLIP `slow` / rein `slow` · `emphasized` | Fade | E2 | MVP |
| **W10-03** „Abstimmung starten“ | Server OK | Teilen-Sheet öffnet (G-05) mit Kopf „Abstimmung läuft!“ und kleinem Siegel (`vote-waiting`/Abstimmungs-Icon) mit Feder. | Siegel `moderate` · `spring-soft` | statisch | E3 | MVP |
| **W10-04** Stimme abgeben (Ja/Vielleicht/Nein) | Tipp auf Segment | **Auswahl sofort** (Fläche, Rahmen, Icon gefüllt). Die Auswahl-Fläche wächst aus dem Tipp-Punkt (`scale(0.92 → 1)`), Icon springt ein; vorher gewähltes Segment verliert Fläche per Fade. Gespeichert wird optimistisch. | Fläche `base` · `spring-soft`; Icon `fast` · `spring-soft`; alt `fast` | sofort | E1 | **MVP** |
| **W10-05** Ergebnis-Enthüllung | erste eigene Stimme zu **dieser** Option (D-18) | Zeile „Stimm ab, um das Ergebnis zu sehen.“ blendet aus; Ergebnis-Balken wächst von links: Ja-Segment, dann Vielleicht, dann Nein (`scaleX`, Ursprung links, `stagger-item`); Zahlen „✓ 4 ◐ 1 ✕ 0“ blenden mit ein (kein Hochzählen). „Platz 1“-Abzeichen springt ein. Karte springt nur um die Balkenhöhe (Layout). Orga: keine Enthüllung, Balken passen sich bei Änderungen per `scaleX` an. | Balken `base` · `standard`; Abzeichen `base` · `spring-soft` | Fade | E2 | **MVP** |
| **W10-06** Vorschlag bestätigen (Geister-Optik) | Tipp auf gestricheltes Segment | Gestrichelter Rahmen überblendet zum durchgezogenen, Fläche wächst wie W10-04, Label „Vorschlag aus deinen Tagen“ blendet aus. | wie W10-04 | sofort | E1 | **MVP** |
| **W10-07** „Alle Vorschläge übernehmen“ | Tipp | Vorschläge werden **kartenweise nacheinander** bestätigt (sichtbare Karten, `stagger-card`), jeweils mit W10-05. Hinweisbox blendet danach aus (Layout springt). | `stagger-card` | alles sofort | E2 | **MVP** |
| **W10-08** Alle Optionen beantwortet | letzte offene Stimme | Statuszeile überblendet zu „✓ Danke, deine Stimmen sind gespeichert …“, ✓ springt ein (`spring-soft`). Danach (600 ms Pause) **Umsortieren nach Rang per FLIP**; die Karte, auf der der Finger/Fokus ist, bleibt im Viewport verankert (Scroll-Ausgleich). → Abstimmung mit UI/UX M-U3. | ✓ `base`; FLIP `slow` · `standard`, `stagger-item` | Statuszeile Fade; Umsortieren ohne Bewegung (Layout springt) | E3 | **MVP** |
| **W10-09** „Wer hat wie gestimmt?“ | aufklappen | G-14; Avatare ohne Staffel. | | | E1 | MVP |
| **W10-10** Frist „noch 1 Tag“ | Anzeige | **Keine** pulsierende Warnung (Dauerbewegung). Statische Warnfarbe + Icon. | – | – | – | Regel |
| **W10-11** Leerzustände (Phase 1) | Laden | `vote-waiting.svg`: Ebenen-Eintritt einmal (Sanduhr/Uhr-Ebene kippt 1×), Text sofort. | `moderate` | statisch | E2 | MVP+ |

### W11 – Termin festlegen & Ergebnis (F-012) · der Feier-Moment · 🎬 c

| ID | Auslöser | Ablauf | Dauer / Easing | Reduziert | Stufe | Prio |
|---|---|---|---|---|---|---|
| **W11-01** Dialog „Termin festlegen“ | Tipp „Abstimmung beenden & festlegen“ | G-05; Radio-Auswahl G-12. Gleichstand-Hinweis blendet ein. | | | E2 | **MVP** |
| **W11-02** **„Es geht los!“ – Feier** | Server bestätigt Festlegung (Orga sofort; jedes Mitglied beim **ersten Öffnen** danach, einmal je Person und Reise) | Zeitleiste (t = 0 = Bestätigung): **0 ms** Sheet schließt (`base` · `exit`); Ergebnis-Karte ist im DOM, Fokus auf h1 „Es geht los!“. **120 ms** Ergebnis-Karte: `scale-enter → 1` + Fade (`celebrate` · `spring-soft`) – Headline, Datum und Buttons sind ab hier lesbar und bedienbar. **200 ms** Kalenderblatt in `vote-done.svg`: Zeitraum-Felder füllen sich von links (`stagger-item`), Band zeichnet sich. **360 ms** **Siegel** springt ein (`scale(0 → 1)` + `rotate(−20° → 0)`, `celebrate` · `spring-bouncy`), Haptik (G-18). **420 ms** **Konfetti** schießt vom Siegel/Kartenkopf: ≤ 60 Teilchen (Desktop ≤ 100), Formen und Farben aus der Richtung (motion-system §3.6), Flugbahn mit Schwerkraft, Drehung, Ausblenden am Ende; je Teilchen `confetti` ± 400 ms. **≈ 700 ms** Phasen-Leiste: Schritt ③ füllt sich, ✓-Pop (W07-02). **≤ 2600 ms** alles vorbei. Jede Berührung/Scrollen beendet das Konfetti (Fade `fast`). Konfetti liegt in einer `aria-hidden`-Ebene über dem Inhalt mit `pointer-events: none`. | siehe Ablauf | **kein Konfetti, keine Skalierung**: Karte + Siegel per Fade (140 ms), Phasen-Leiste sofort. Text „Es geht los!“ trägt den Moment. | **E4** | **MVP** |
| **W11-03** Wiederholen (Easter Egg) | Tipp auf das Siegel | Kleiner Konfetti-Puff (20 Teilchen) vom Siegel. Nutzer-ausgelöst, aber bei Reduced Motion aus. | `confetti` × 0,7 | aus | E3 | später |
| **W11-04** Spätere Besuche | Öffnen der Übersicht in Phase 3 | Ergebnis-Karte statisch, Siegel statisch. Keine Feier. | – | – | E0 | **MVP** |
| **W11-05** „Zum Kalender hinzufügen ▾“ | Tipp | Menü: `scale-enter → 1` + Fade, Ursprung am Button. Download: Label überblendet „✓ Heruntergeladen“ (wie G-11). | `fast` · `enter` | Fade | E1 | MVP |
| **W11-06** „Allen Bescheid geben“ | Tipp | Teilen-Sheet (G-05). | | | E2 | MVP |
| **W11-07** Festlegung aufheben | Bestätigung | Ruhig: Ergebnis-Karte blendet aus, Phase-2-Inhalt blendet ein, Phasen-Leiste springt zurück. Kein „Rückwärts-Konfetti“. | `base` | Fade | E0 | MVP |

### W12 – Reise bearbeiten & Verwaltung · ruhig

| ID | Auslöser | Ablauf | Dauer / Easing | Reduziert | Stufe | Prio |
|---|---|---|---|---|---|---|
| **W12-01** Formular | Änderungen, Speichern | G-10, G-03; „Gespeichert“ per Toast (G-04). | | | E0 | MVP |
| **W12-02** Destruktive Dialoge (Reise löschen, Mitglied entfernen, Orga übergeben) | öffnen | G-06 ohne Feder; Löschen-Button wird aktiv (Name korrekt eingetippt): nur Farbwechsel, keine Bewegung. | `base` · `enter` | Fade | E0 | MVP |
| **W12-03** Reise gelöscht | Server OK | G-01 nach „Meine Reisen“ + Toast; keine Illustration-Animation. | | | E0 | MVP |

### W13 – Konto (F-041–F-043, F-046) · ruhig

| ID | Auslöser | Ablauf | Dauer / Easing | Reduziert | Stufe | Prio |
|---|---|---|---|---|---|---|
| **W13-01** Schalter „Bewegung reduzieren“ (falls freigegeben, M-U1) | Tipp | Schalter-Daumen gleitet (G-12); Wirkung **sofort** (`data-motion` am `<html>`), ohne Neuladen. | `fast` | sofort | E1 | MVP (wenn freigegeben) |
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
| F-007 Teilnahmestatus | W07-03, W07-04, G-15 |
| F-008 Heatmap | W09-04, W09-05, W09-07, W09-08 |
| F-009 Vorschläge | W09-02, W09-03, W09-06, W09-11, W09-12 |
| F-010 Abstimmung erstellen | W10-01 … W10-03 |
| F-011 Abstimmen | W10-04 … W10-09 |
| F-012 Festlegen | W11-01 … W11-07 |
| F-015 Erinnern | G-05, W06-03 |
| F-016 Feiertage/Wochenenden | keine eigene Bewegung (statische Markierungen) |
| F-017 Fristen | W10-10 (Regel: keine Dauerbewegung) |
| F-040/F-041 Registrierung/Login (Code) | W02-01 … W02-08 |
| F-043 Konto löschen | W13-03 |
| F-044 Meine Reisen | W04-01 … W04-07 |
| F-046 Sprache | G-19, motion-system §5.9 |
| F-051 Hilfe | W15-01, W15-02 |

## 4. Prüfliste für Review (Motion)
- [ ] Jede Animation hat eine Reduced-Motion-Variante gemäß Tabelle; Playwright-Lauf mit `reducedMotion: 'reduce'` zeigt keine `transform`-Animationen (`document.getAnimations()`).
- [ ] Nichts läuft automatisch > 5 s (Konfetti, Geste, Skelett, Caret).
- [ ] Tipp-Feedback ≤ 100 ms (Performance-Panel: `pointerdown` → erster Frame).
- [ ] Nur `transform`/`opacity` (Ausnahme: Farbwechsel kleiner Elemente ≤ 140 ms).
- [ ] Fokus springt nie durch Animationen; Sheets geben Fokus zurück.
- [ ] Texte/CTA sind ohne Warten auf Animation lesbar (Landing, Ergebnis-Karte, Vorschau-Karte).
- [ ] DE-Pseudo-Locale (+40 %): Indikatoren, Labels über Zellen, Buttons mit Ladezustand brechen sauber um.
- [ ] In-App-Browser (iOS WhatsApp/Instagram, Android Instagram): Sheet-Ziehen kollidiert nicht mit Seiten-Scroll (`overscroll-behavior: contain`).
