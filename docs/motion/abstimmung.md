# Abstimmung Motion ↔ Design, UI/UX, Entwicklung

Stand: 2026-10-08 · Verantwortlich: Motion Designer · Status: offen (erste Runde)
Bezug: [motion-system.md](motion-system.md) · [interaktionen.md](interaktionen.md) · [prototypes/](prototypes/README.md)

Der Motion Designer ändert keine Dateien in `docs/design/` oder `docs/ux/`. Wünsche stehen hier; Antworten bitte direkt in die Spalte „Antwort“ (Designer/UI/UX) bzw. über den CEO.

---

## 1. An den Designer

| # | Thema | Bitte / Vorschlag | Begründung | Antwort |
|---|---|---|---|---|
| **M-D1** | **Neue Motion-Tokens in `tokens.css`** | Ergänzen (Werte in motion-system §3): `--ww-duration-moderate` 480 ms, `--ww-duration-confetti` 1800 ms, `--ww-duration-fade` 140 ms · `--ww-ease-emphasized` · `--ww-ease-spring-soft` und `--ww-ease-spring-bouncy` (als `linear()` im `@supports`-Block, Fallback `cubic-bezier`) · `--ww-motion-distance-sm` 8 px, `--ww-motion-distance-lg` 24 px · `--ww-motion-scale-cell` 0,94, `--ww-motion-scale-enter` 0,96, `--ww-motion-scale-pop` 0,6 · `--ww-stagger-cell/-item/-card/-max` 12/40/60/400 ms. Reduced-Motion-Werte gemäß §3.7, zusätzlich unter `:root[data-motion="reduce"]` (gleiches Muster wie `data-theme`). | Prototypen nutzen genau diese Namen; Developer braucht eine Quelle. | |
| **M-D2** | **`--ww-duration-fade` bleibt bei Reduced Motion bei 140 ms** | tokens.css §5 setzt heute *alle* Dauern auf 0,01 ms. Bitte das neue Token davon ausnehmen; Komponenten nutzen es für reines Überblenden. | ux-spec §7.1: „keine Animationen außer Opazität“ – ein sanftes Überblenden ist erlaubt und angenehmer als harte Sprünge (Sheet, Toast). | |
| **M-D3** | **Animierbare Illustrationen** | In den SVGs bitte Ebenen als Gruppen mit `data-anim` auszeichnen: `hero.svg` (`plate`, `sun`, `sea`, `calendar`, `cells`, `band`, `friends`), `vote-done.svg` (`range`, `band`, `seal`, `confetti`), `submitted.svg` (`calendar`, `seal`, `sparks`), `invite.svg` (`letter`, `plane`), `empty-trips.svg`, `vote-waiting.svg`, `no-matches.svg` (je 1–2 Ebenen). Regeln: (1) Gruppen, die bereits ein `transform`-Attribut haben, in eine **zusätzliche** äußere Gruppe legen (CSS-Transform überschreibt sonst das Attribut), (2) keine Texte, (3) der statische Endzustand ist die fertige Komposition (für Reduced Motion), (4) IDs (`clipPath`) eindeutig präfixen, weil mehrere Inline-SVGs auf einer Seite stehen können. | Bewegung nur beim Eintritt, einmal (motion-system §5.5); Prototyp d/c zeigen das an Kopien von hero/vote-done. | |
| **M-D4** | **Siegel als Komponente** | Ein „Siegel“ (Kreis `--ww-color-sun` + Häkchen) in 3 Größen (20 / 40 / 64 px) als wiederverwendbares Element für Beitritt (W03-06), Abgabe (W08-10), Festlegung (W11-02). | Ein wiedererkennbares Belohnungs-Symbol statt vieler Effekte; Federung `spring-bouncy` nur hier. | |
| **M-D5** | **Konfetti-Material je Richtung** | Für die neue visuelle Richtung bitte festlegen: 3–5 Konfetti-Formen (z. B. Rechteck 8 × 4, Kreis 6, „Sonnenstrahl“ 11 × 2,5) und Farben als semantische Tokens, z. B. `--ww-confetti-1 … -4` (Light **und** Dark, Kontrast egal, aber keine großflächigen Hell-Dunkel-Wechsel). | Prototyp c nimmt heute `accent`, `sun`, `primary`, `teal-400`; motion-system §3.6. | |
| **M-D6** | **Regler der neuen Richtung** | In `docs/design/richtungen/` je Richtung kurz angeben: Tempo-Faktor (0,85–1,2), Federung (eher straff/weich), Konfetti-Material. | Damit das Motion-System ohne Neuentwurf auf die gewählte Richtung passt. | |
| **M-D7** | **Pinsel-Leiste mit gleitendem Indikator** | design-system §9.13 beschreibt das aktive Segment (Fläche + 2-px-Rahmen + Marke). Vorschlag: diese Optik als **ein** Indikator-Element, das zwischen den Segmenten gleitet (Prototyp a). Bitte bestätigen, dass Punkt-Marke ● entfallen oder ins Label wandern darf. | Bewegung erklärt den Wechsel; nur `transform`. | |
| **M-D8** | **design-system §8 verweisen** | §8 „Motion“ um einen Verweis auf `docs/motion/motion-system.md` ergänzen; Werte dort bleiben gültig. Bitte die Regel „Heatmap-Flächen blenden 140 ms über“ ausdrücklich als Farbwechsel-Ausnahme markieren (motion-system §7 Regel 1). | Eine Quelle für Bewegung, keine Widersprüche. | |
| **M-D9** | **Hover-Schatten** | Karten-Hover (`shadow-2`) bitte als Pseudo-Element-Schatten spezifizieren, dessen `opacity` wechselt (statt `box-shadow`-Übergang). | Performance-Regel: kein `box-shadow` animieren. | |

## 2. An UI/UX

| # | Thema | Bitte / Vorschlag | Begründung | Antwort |
|---|---|---|---|---|
| **M-U1** | **In-App-Schalter „Bewegung reduzieren“** | In W13 (Konto) Abschnitt „Darstellung“ mit Schalter „Bewegung reduzieren“ / „Reduce motion“ (Standard aus = System folgen). Wirkt sofort, speichert im Konto + `localStorage`. Kann Bewegung nur reduzieren. → **Frage an Auftraggeber** (Bericht CEO). | WCAG 2.3.3 (Projekt-Leitplanke „Animation durch Interaktion abschaltbar“); Systemeinstellung ist in In-App-Browsern schwer zu finden. | |
| **M-U2** | **Dauer großer Erfolgsmomente** | ux-spec §6 sagt „Dezente Animation (≤ 600 ms)“. Vorschlag: „Kernanimation ≤ 1 s; nur bei F-012 Ausklang (Konfetti) bis 2,6 s; Text und Buttons sind ab spätestens 300 ms lesbar und bedienbar; jede Interaktion beendet die Animation.“ | Das Siegel mit Feder braucht ≈ 700 ms, die Feier lebt vom Konfetti; WCAG 2.2.2 bleibt erfüllt (< 5 s). | |
| **M-U3** | **Umsortieren der Abstimmungskarten** (user-flows D.2 Schritt 6) | Vorschlag: 600 ms nach der letzten offenen Stimme sortieren sich die Karten per FLIP; die zuletzt benutzte Karte bleibt im Viewport an Ort und Stelle (Scroll-Ausgleich), Fokus bleibt auf dem Segment; Ansage „Optionen nach Rang sortiert“. Alternative: erst beim nächsten Öffnen sortieren. Bitte entscheiden (Prototyp c zeigt Variante 1). | „Keine springenden Karten“ (D.2) bleibt gewahrt, weil die Karte unter dem Finger stehen bleibt. | |
| **M-U4** | **Sticky „Reise planen“ auf der Landing** (W01-05, später) | Fixierte CTA-Leiste unten, sobald der Hero-CTA aus dem Bild scrollt. Strukturentscheidung – nur zur Kenntnis/Bewertung. | Hauptaktion bleibt beim Scrollen erreichbar; Bewegung erklärt ihr Auftauchen. | |
| **M-U5** | **Code-Schritt optimistisch zeigen** (W02/W03) | Nach Tipp auf „Code senden“ sofort zum Code-Schritt wechseln (Status „Code wird gesendet …“), Feld synchron fokussieren; bei Fehler zurück zum E-Mail-Schritt mit Meldung. | iOS öffnet die Tastatur nur bei Fokus **im** Tipp-Ereignis; nach der Serverantwort muss Kemal sonst erneut ins Feld tippen (Beitrittsquote). | |
| **M-U6** | **Feier auch für Mitglieder** | Bestätigen: Jedes Mitglied erlebt „Es geht los!“ (W11-02) **einmal** beim ersten Öffnen nach der Festlegung (Merker pro Gerät in `localStorage`; serverseitiger Merker pro Konto wäre genauer – Developer entscheidet). Spätere Besuche statisch. | Gemeinsames Erfolgserlebnis der Gruppe, nicht nur der Orga. | |
| **M-U7** | **Vorschlag im Kalender – was bleibt?** (C.3) | Vorschlag: Umriss + Label verschwinden nach 4 s bzw. bei nächster Interaktion; das **Band bleibt**, bis man die Ansicht verlässt oder einen anderen Vorschlag zeigt. | Wiedererkennung beim Weiterscrollen; Inhalt nie nur während einer Animation sichtbar. | |
| **M-U8** | **Heatmap-Aufbau nur über das Segment** | Die Aufbau-Welle (W09-05) läuft nur, wenn man „Kalender“ direkt öffnet – nicht bei „Im Kalender zeigen“. | Eine E3-Bewegung zur Zeit; das Band ist dort die Botschaft. | |
| **M-U9** | **Geste-Hinweis** (B.4) | Ausgestaltung: 600 ms nach dem Willkommens-Hinweis, Finger wischt 2 × über vier Tage einer Woche, ≤ 2,8 s, jede Berührung stoppt ihn, Tage werden nicht verändert. Reduziert: statische Skizze 2,5 s. Bitte bestätigen. | user-flows B.4 „kurze Geste-Animation ≤ 3 s, einmalig“. | |
| **M-U10** | **Fokus bei der Feier** | Beim Festlegen springt der Fokus **sofort** auf die h1 „Es geht los!“ der Ergebnis-Karte (Sheet ist dann geschlossen). Bitte in ux-spec §4.2/D.3 aufnehmen. | Fokus nie durch Animation verlieren; Screenreader hört das Ergebnis zuerst. | |
| **M-U11** | **Tab-Richtung** | Inhalte neuer Tabs gleiten aus der Tab-Richtung ein (G-02). Weil Tabs Links mit eigener URL sind, merkt sich die App den vorigen Tab-Index in `sessionStorage`. Kein Einwand erwartet – zur Kenntnis. | Orientierung „wo bin ich in der Reise“. | |

## 3. An Developer / Operations (über den CEO)

| # | Thema | Vorschlag |
|---|---|---|
| **M-X1** | Bibliothek | **Keine Animationsbibliothek im MVP.** CSS + Tokens + WAAPI, eigener Helfer `src/lib/motion.ts` (≈ 1–2 KB). Wiedervorlage `motion` (mini 2,3 KB bzw. `m` + `LazyMotion` 4,6 KB + Features 15–25 KB), falls eigener FLIP-/Sheet-Code ausufert. |
| **M-X2** | View Transitions | Next 16 `experimental.viewTransition` + React `<ViewTransition>` sind laut Next-Doku experimentell → **nicht im MVP aktivieren**; Spike nach dem MVP (Tab-Wechsel, Reisekarte → Reise-Kopf). |
| **M-X3** | Tests & Budget | Playwright-Kernflows je einmal mit `reducedMotion: 'reduce'` und `'no-preference'`; Performance-Stichprobe (4× CPU-Drosselung, Long Tasks < 50 ms beim Ziehen/Feiern); sobald Tunnel-Test T2 läuft: Sichtprüfung im WhatsApp-/Instagram-In-App-Browser (iOS + Android). |
| **M-X4** | Feier-Modul | Konfetti/Feier per `import()` erst beim Ereignis laden; `pointer-events: none`, `aria-hidden`, Stopp bei Interaktion und `visibilitychange`. |
| **M-X5** | Inkrement 1 | Für F-040–F-042 die Code-Feld-Bewegungen W02-01 … W02-08 mitbauen (Prototyp e); Aufwand gering, prägt den ersten Eindruck. |

## Entscheidungen des Auftraggebers (2026-10-08)
- Schalter „Bewegung reduzieren“ im Konto (W13) zusätzlich zur Systemeinstellung: **ja**.
- Konfetti-Feier für **alle** Mitglieder beim ersten Öffnen nach Festlegung (F-012): **ja**.
- Dezente Vibration auf Android (best effort, aus bei reduzierter Bewegung, kein Ton): **ja**.
