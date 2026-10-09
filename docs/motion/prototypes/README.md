# Motion-Prototypen

Stand: 2026-10-08 (v1.0, Look & Feel B0) · Verantwortlich: Motion Designer · Bezug: [motion-system.md](../motion-system.md), [interaktionen.md](../interaktionen.md), [abstimmung.md](../abstimmung.md)

Klickbare, eigenständige HTML-Dateien (CSS/JS inline, **keine externen Abhängigkeiten**, kein Build). Einfach im Browser öffnen – am besten auf dem Handy oder in den DevTools mit Gerätesimulation **390 × 844** (iPhone 14/15). Auf dem Desktop erscheint die App als 390 px breite Spalte.

> **Optik = Richtung B „Reise-Cockpit“, Palette B0 „Indigo & Minze“.** Farben, Radien, Schatten und Schriftrollen sind aus `docs/design/tokens.css` v1.0 (Light) **inline übernommen**, damit jede Datei eigenständig bleibt – bei Token-Änderungen gilt tokens.css, nicht der Prototyp. Schriften: Plus Jakarta Sans / Figtree werden nur genutzt, wenn sie lokal installiert sind (kein CDN), sonst Systemschrift – Abstände können deshalb leicht abweichen. Dark Mode ist in den Prototypen nicht umgesetzt. Bewertet werden soll die **Bewegung** (Timing, Federung, Reihenfolge, Reduced-Motion-Variante).

## Übersicht

| Datei | Zeigt | Katalog-IDs | Ausprobieren |
|---|---|---|---|
| [a-tage-markieren.html](a-tage-markieren.html) | Meine Tage (W08, F-005): Cockpit-Kopf, Tippen, Ziehen, Bereichsmodus, **gleitender Pinsel-Indikator (M-D7)**, Rückgängig, Snackbar, Speicherstatus in der Werkzeugleiste (150 px), Abgabe mit **Minze-Siegel**, Geste-Hinweis, Willkommens-Siegel | W08-01 … W08-10, W03-06, W03-07, G-04, G-05, G-21 | Tag antippen · über mehrere Tage **waagerecht** wischen (Handy) bzw. mit gedrückter Maus ziehen · auf dem Handy **300 ms halten**, dann ziehen (einzige Vibration hier) · Zeitraum-Kachel → Start und Ende antippen · ↶ bzw. „Rückgängig“ · Pinsel wechseln · „Fertig – abgeben“ · Tastatur: Pfeile, Leertaste, 1/2/3, Strg+Z · reduziert: Geste-Skizze bleibt stehen, bis der Hinweis geschlossen wird (M-U9) |
| [b-heatmap-vorschlaege.html](b-heatmap-vorschlaege.html) | Gruppe (W09, F-008/F-009): Cockpit mit **Kennzahl-Box** (Ring wächst, Zahl springt), Vorschläge gestaffelt, Segment-Wechsel, Heatmap-Aufbau als Welle (**Indigo-Rampe**, Siegel „Alle: Geht“ in Minze), „Im Kalender zeigen“ zeichnet das Indigo-Band in der Zeilenfuge, Filter mit FLIP, Tagesdetail-Sheet mit Ziehen/Rasten und Tag-Blättern | W09-01 … W09-09, G-05a, G-20 | „Kalender“ antippen (Welle) · zurück zu „Vorschläge“, „Im Kalender zeigen“ · Chip „Jonas ausblenden“ · „Darf fehlen: 1“ · Tag antippen → Sheet am Griff ziehen, ‹ › oder seitlich wischen · „Aufbau neu abspielen“ |
| [c-abstimmen-feier.html](c-abstimmen-feier.html) | Abstimmen (W10, F-011) und **„Es geht los!“ mit dem Vorfreude-Ring** (W11, F-012): Geister-Vorschläge („Ja?“), Stimme mit Indigo-Fläche + Häkchen-Ecke, Ergebnis-Enthüllung nach eigener Stimme, **kein Umsortieren auf der Seite (M-U3)**, Festlegen-Sheet, **Ring-Feier** (inline aus `countdown-ring.svg`): Ehrenrunde des Sonnenpunkts, Schein, 12 fallende Teilchen, Puff, Funkel; Countdown steht sofort | W10-04 … W10-08, W11-01 … W11-05, G-16, G-18 | Ja/Vielleicht/Nein antippen · „Alle Vorschläge übernehmen“ · „Abstimmen neu öffnen“ = nächster Besuch, jetzt nach Rang sortiert · **Rolle Orga:** „Abstimmung beenden & festlegen“ → „Termin festlegen“ (Fokus springt sofort auf „Es geht los!“) · **Rolle Mitglied:** „Feier zeigen“ (= erstes Öffnen der Übersicht, kein Fokussprung) · **Ring-Anteil** 4 % / 35 % / 96,5 % vergleichen · während der Feier tippen/scrollen/Taste = sofort Endzustand |
| [d-startseite-scroll.html](d-startseite-scroll.html) | Landing (W01): Cockpit mit Headline + Minze-CTA (stehen sofort), **`hero.svg` v1.0** baut sich auf (Ebenen plate, calendar, ring, friends, cells, band, sun, seal), Kopfzeilen-Schatten, „So geht’s“-Kacheln (Container-Query 21,5 em) mit Mini-Demos, Demo-Heatmap mit Band, Parallax der Sonne, **Wiederholung „Reise planen“ am Ende statt Sticky-CTA (M-U4)** | W01-01 … W01-06 | Langsam scrollen · Leiste zeigt, ob der Browser Scroll-Timelines kann – ohne Unterstützung bleibt die Sonne stehen (gewollt) |
| [e-code-beitritt.html](e-code-beitritt.html) | Einladung als **Reisekarte** (`trip-card-motif.svg`) → E-Mail → **Code-Schritt sofort (M-U5)** → Name → „Du bist dabei!“ (W03/W02, F-003/F-040) – **passt zu Inkrement 1** | W03-01 … W03-06, W02-01 … W02-08 | „Mitmachen“ · „Code senden“ → Code-Schritt erscheint sofort, Status «Code wird gesendet …» → «Code an kemal@… gesendet» · Schalter **„Senden schlägt fehl“** → zurück zum E-Mail-Schritt mit Meldung, Fokus im E-Mail-Feld · Code **123456** (Erfolgs-Welle + Siegel 20 px) · falscher Code: Wackeln + Restversuche · 5 × falsch: gesperrt |

## Schalter „Bewegung reduzieren“
Jeder Prototyp hat oben den Schalter. Er startet mit der **Systemeinstellung** (`prefers-reduced-motion`) und lässt sich zum Vergleich in **beide** Richtungen umschalten; die Wahl gilt für alle Prototypen dieses Tabs (sessionStorage).
- Im **Produkt** wirkt: Systemeinstellung **oder** Konto-Schalter „Bewegung reduzieren“ (Q17, W13-01) – der Konto-Schalter kann Bewegung nur *reduzieren*; meldet das Gerät „reduzieren“, steht er auf „an“ und ist gesperrt ([motion-system §6.3](../motion-system.md)).
- Reduziert heißt: keine Skalierung, kein Gleiten, keine Staffeln, kein Konfetti, keine Parallaxe, keine Vibration; Überblenden (140 ms) bleibt; Ziehen folgt weiter dem Finger. Die Feier ist dann nur ein Überblenden in den statischen Ring.

## Hinweise für den Test
- **Ziehen auf dem Handy (a):** Senkrechtes Wischen scrollt die Seite; Ziehen startet bei waagerechtem Beginn oder nach 300 ms Halten (user-flows B.2). Am oberen/unteren Rand scrollt die Seite beim Ziehen mit.
- **Vibration:** nur Android-Browser und nur an zwei Stellen – (a) Ziehen nach 300 ms Halten, (c) Sonnenpunkt rastet ein. iOS vibriert nie.
- **iOS-Tastatur (e):** Nach „Mitmachen“ und nach „Code senden“ wird das Feld **synchron** im Tipp-Ereignis fokussiert – die Tastatur bleibt offen, auch während der Code noch gesendet wird (M-U5).
- **Ring-Feier (c):** Ring und Sonnenpunkt laufen aus denselben vorberechneten Keyframes (`ringFrames`). Browser ohne Animation von `stroke-dasharray` zeigen den Ring sofort im Endzustand – kein Fehler.
- **Federn:** Browser mit CSS-`linear()` (Chrome 113+, Safari 17.2+, Firefox 112+) zeigen die echten Federkurven, ältere eine `cubic-bezier`-Näherung.
- **Parallax (d)** braucht Scroll-Timelines (Chrome/Edge, Safari 26); in Firefox stabil (Stand 10/2026) statisch.
- Die Prototypen enthalten Beispiel-ARIA (Live-Region, Radiogruppen, Dialog-Rollen), sind aber keine vollständige Barrierefreiheits-Referenz – maßgeblich bleiben ux-spec §7 und die Wireframes.
- Kein Produktivcode: Struktur und Namen der JS-Helfer (`play`, `enter`, `leave`, `reduced`, `ringFrames`, `celebrate`) entsprechen dem Vorschlag `src/lib/motion.ts` ([motion-system §8.2](../motion-system.md#82-struktur-vorschlag-für-den-developer-kein-produktivcode)).

## Bekannte Grenzen
- Keine Desktop-Layouts (≥ 960 px), keine Tab-Navigation zwischen den Prototypen (Tabs sind Attrappen).
- Teilen-Sheet, Kalender-Download und Seitenwechsel werden nur angedeutet (Toast).
- (a) Rückgängig umfasst 20 Schritte, „Wiederholen“ fehlt; Schnellaktionen sind nicht gebaut.
- (b) Vorschlag-Leiste (W09-13) ist nicht gebaut; Tagesdetail-Inhalt scrollt erst in der „fast voll“-Stellung sinnvoll.
- (c) Kennzahl-Kacheln und Schritt-Balken sind vereinfacht; Easter Egg W11-03 nicht gebaut.
- Kein Browser-Test durch den Motion Designer (keine Browser-Umgebung) – bitte Fehler an den Motion Designer zurückmelden.
