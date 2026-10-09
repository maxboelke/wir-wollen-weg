# Abstimmung Motion ↔ Design, UI/UX, Entwicklung

Stand: 2026-10-08 (Runde 2) · Verantwortlich: Motion Designer · Status: **M-D1–M-D9 und M-U1–M-U11 geklärt**; neu offen: M-D10–M-D12, M-U12, M-X6–M-X7
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

## Entscheidungen des Auftraggebers (2026-10-08, Q17)
- Schalter „Bewegung reduzieren“ im Konto (W13) zusätzlich zur Systemeinstellung: **ja**.
- Feier für **alle** Mitglieder, einmal pro Person und Festlegung (F-012): **ja**.
- Vibration auf Android (best effort, aus bei reduzierter Bewegung, kein Ton) **nur** beim Ziehen nach Halten und beim Feier-Abschluss: **ja**.

## CEO-Entscheidungen (2026-10-08)
- Zahlen zählen **nie** hoch – auch der Countdown nicht.
- Die Feier F-012 ist der **Vorfreude-Ring** (`countdown-ring.svg`), nicht Siegel + Kalenderblatt.

## Changelog
- 2026-10-08 Runde 2: Status aller M-Punkte nach den Antworten von Designer (abstimmung-ux §6) und UI/UX (abstimmung-design §9) gesetzt; neu M-D10–M-D12, M-U12, M-X6–M-X7.
- 2026-10-08 Runde 1: Erstfassung M-D1–M-D9, M-U1–M-U11, M-X1–M-X5.

## CEO-Entscheidungen (2026-10-08, nach Motion v1.0)
- **M-D10:** Bei der Festlegung startet der Ring mit dem Mindestwert (ca. 4 %) und füllt sich bis zur Abreise; die SVG mit 96,5 % zeigt nur einen späteren Zustand. Kommentar in der SVG korrigiert der Designer bei nächster Gelegenheit.
- **M-D11:** Liegende Konfetti und Funkel werden bei späteren Besuchen ausgeblendet.
- **M-D12:** Vibration nur an zwei Stellen (Ziehen nach Halten, Feier-Abschluss); „/das Siegel“ in design-system §8.3 Nr. 5 entfällt (Designer streicht).
- **M-U12:** Nach „Termin festlegen“ wechselt die App für die Orga in die Übersicht, wo der Ring sitzt (UI/UX trägt es in user-flows D.3 ein).
- **M-X6/M-X7:** an Developer (Feier-Merker pro Mitgliedschaft+Festlegung serverseitig; Ring ohne WAAPI-Unterstützung steht sofort fertig).
