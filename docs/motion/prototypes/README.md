# Motion-Prototypen

Stand: 2026-10-08 · Verantwortlich: Motion Designer · Bezug: [motion-system.md](../motion-system.md), [interaktionen.md](../interaktionen.md)

Klickbare, eigenständige HTML-Dateien (CSS/JS inline, **keine externen Abhängigkeiten**, kein Build). Einfach im Browser öffnen – am besten auf dem Handy oder in den DevTools mit Gerätesimulation **390 × 844** (iPhone 14/15). Auf dem Desktop erscheint die App als 390 px breite Spalte.

> **Optik = Platzhalter.** Farben und Formen stammen aus den aktuellen Tokens (`docs/design/tokens.css`, Light). Bewertet werden soll die **Bewegung** (Timing, Federung, Reihenfolge, Reduced-Motion-Variante) – sie ist so gebaut, dass sie auf jede neue visuelle Richtung passt. Dark Mode ist in den Prototypen nicht umgesetzt.

## Übersicht

| Datei | Zeigt | Katalog-IDs | Ausprobieren |
|---|---|---|---|
| [a-tage-markieren.html](a-tage-markieren.html) | Meine Tage (W08, F-005): Tippen, Ziehen, Bereichsmodus, Pinsel-Wechsel, Rückgängig, Snackbar, Speicherstatus, Abgabe mit Siegel, Geste-Hinweis, Willkommens-Siegel | W08-01 … W08-10, W03-06, W03-07, G-04, G-05 | Tag antippen · über mehrere Tage **waagerecht** wischen (Handy) bzw. mit gedrückter Maus ziehen · auf dem Handy auch **300 ms halten**, dann in jede Richtung ziehen · „Zeitraum“ → Start und Ende antippen · ↶ bzw. „Rückgängig“ in der Snackbar · Pinsel wechseln · „Fertig – abgeben“ · Tastatur: Pfeile, Leertaste, 1/2/3, Strg+Z |
| [b-heatmap-vorschlaege.html](b-heatmap-vorschlaege.html) | Gruppe (W09, F-008/F-009): Vorschläge erscheinen gestaffelt, Segment-Wechsel, Heatmap-Aufbau als Welle, „Im Kalender zeigen“ zeichnet das Band, Filter mit FLIP-Umgruppierung, Tagesdetail-Sheet mit Ziehen/Rasten und Tag-Blättern | W09-01 … W09-08, G-05a | „Kalender“ antippen (Welle) · zurück zu „Vorschläge“, bei einer Karte „Im Kalender zeigen“ · Chip „Jonas ausblenden“ (Karte wandert in „Alle dabei“) · „Darf fehlen: 1“ (Gruppe verschwindet) · Tag in der Heatmap antippen → Sheet am Griff hoch-/runterziehen, ‹ › oder seitlich wischen · „Aufbau neu abspielen“ |
| [c-abstimmen-feier.html](c-abstimmen-feier.html) | Abstimmen (W10, F-011) und „Es geht los!“ (W11, F-012): Geister-Vorschläge bestätigen, Stimme mit Feder, Ergebnis-Enthüllung nach eigener Stimme, Umsortieren nach Rang (FLIP mit Scroll-Anker), Festlegen-Sheet, **Feier mit Siegel + Konfetti** | W10-04 … W10-08, W11-01, W11-02, W11-05 | Ja/Vielleicht/Nein antippen · „Alle Vorschläge übernehmen“ · nach der letzten Stimme sortieren sich die Karten · „Abstimmung beenden & festlegen“ → „Termin festlegen“ · Schalter **Konfetti** aus/an · „Feier wiederholen“ · beim Konfetti irgendwo tippen = Feier stoppt · Siegel antippen = kleiner Puff |
| [d-startseite-scroll.html](d-startseite-scroll.html) | Landing (W01): Hero baut sich auf (Text steht sofort), Kopfzeilen-Schatten beim Scrollen, Scroll-Reveal der Schritte mit Mini-Demos, Demo-Heatmap mit Band, Parallax der Sonne | W01-01 … W01-04, W01-06 | Langsam scrollen · Leiste zeigt, ob der Browser Scroll-Timelines kann (Parallax) – ohne Unterstützung bleibt die Sonne stehen (gewollt) |
| [e-code-beitritt.html](e-code-beitritt.html) | Einladung → E-Mail → **Code** → Name → „Du bist dabei!“ (W03/W02, F-003/F-040) – **passt zu Inkrement 1** | W03-01 … W03-06, W02-01 … W02-08 | „Mitmachen“ · „Code senden“ · Code **123456** eintippen oder einfügen (Erfolgs-Welle) · falscher Code: Wackeln + Restversuche · 5 × falsch: gesperrt → „Neuen Code senden“ |

## Schalter „Bewegung reduzieren“
Jeder Prototyp hat oben den Schalter. Er startet mit der **Systemeinstellung** (`prefers-reduced-motion`) und lässt sich zum Vergleich in **beide** Richtungen umschalten; die Wahl gilt für alle Prototypen dieses Tabs (sessionStorage).
- Im **Produkt** wirkt dagegen: Systemeinstellung **und** – falls freigegeben – ein In-App-Schalter, der Bewegung nur *reduzieren* kann ([motion-system §6.3](../motion-system.md#63-in-app-schalter-empfehlung-frage-an-auftraggeber)).
- Reduziert heißt: keine Skalierung, kein Gleiten, keine Staffeln, kein Konfetti, keine Parallaxe; Überblenden (140 ms) bleibt; Ziehen folgt weiter dem Finger.

## Hinweise für den Test
- **Ziehen auf dem Handy (a):** Senkrechtes Wischen scrollt die Seite; Ziehen startet bei waagerechtem Beginn oder nach 300 ms Halten (user-flows B.2). Am oberen/unteren Rand scrollt die Seite beim Ziehen mit.
- **iOS-Tastatur (e):** Nach „Mitmachen“ wird das E-Mail-Feld synchron fokussiert (Tastatur öffnet). Nach „Code senden“ kommt der Code-Schritt erst nach der simulierten Serverantwort – iOS öffnet die Tastatur dann nicht automatisch; im Produkt identisch, deshalb der Hinweis in [abstimmung.md](../abstimmung.md) M-U5.
- **Federn:** Browser mit CSS-`linear()` (Chrome 113+, Safari 17.2+, Firefox 112+) zeigen die echten Federkurven, ältere eine `cubic-bezier`-Näherung.
- **Parallax (d)** braucht Scroll-Timelines (Chrome/Edge, Safari 26); in Firefox stabil (Stand 10/2026) statisch.
- Die Prototypen enthalten Beispiel-ARIA (Live-Region, Radiogruppen, Dialog-Rollen), sind aber keine vollständige Barrierefreiheits-Referenz – maßgeblich bleiben ux-spec §7 und die Wireframes W08/W09.
- Kein Produktivcode: Struktur und Namen der JS-Helfer (`play`, `enter`, `leave`, `reduced`) entsprechen dem Vorschlag `src/lib/motion.ts` ([motion-system §8.2](../motion-system.md#82-struktur-vorschlag-für-den-developer-kein-produktivcode)).

## Bekannte Grenzen
- Keine Desktop-Layouts (≥ 960 px), keine Tab-Navigation zwischen den Prototypen (Tabs sind Attrappen).
- Teilen-Sheet, Kalender-Download und Seitenwechsel werden nur angedeutet (Toast).
- (a) Rückgängig umfasst 20 Schritte, „Wiederholen“ fehlt; Schnellaktionen sind nicht gebaut.
- (b) Tagesdetail-Inhalt scrollt erst in der „fast voll“-Stellung sinnvoll.
- Kein Browser-Test durch den Motion Designer (keine Browser-Umgebung) – bitte Fehler an den Motion Designer zurückmelden.
