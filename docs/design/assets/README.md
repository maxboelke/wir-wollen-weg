# Assets – Wir wollen weg / When do we go?

Stand: 2026-10-08 · **v1.0 (Richtung B „Reise-Cockpit“, Palette B0 „Indigo & Minze“)** · Verantwortlich: Designer · Spezifikation: [../design-system.md](../design-system.md) · Tokens: [../tokens.css](../tokens.css)

Alle Grafiken sind handgeschriebenes SVG (valide, `xmlns`, `viewBox`, `<title>`/`<desc>`). Keine Bitmaps, keine externen Fonts außer Plus Jakarta Sans/Figtree in den Wortmarken (siehe unten). Die Entwürfe in `../richtungen/` sind Archiv; maßgeblich ist dieser Ordner.

## Ordner

| Ordner | Inhalt |
|---|---|
| `logo/` | Bildmarke hell und auf Indigo/Dunkel, Wortmarken DE/EN (hell + auf Indigo), Favicon 32 und 16, App-Icon 512 |
| `icons/` | Icon-Sprite `icons.svg` (50 Symbole, Duoton) + Einzeldateien des Kernsets zur Ansicht |
| `heatmap/` | Referenzgrafiken: Heatmap-Stufen, Verfügbarkeit, Markierungen, Muster (je hell + dunkel) |
| `illustrations/` | Leerzustände, Momente, Hero, Reisekarte, Vorfreude-Ring (Feier), Siegel |

## Logo (`logo/`)

| Datei | Zweck | Hinweise |
|---|---|---|
| `logo-mark.svg` | **Bildmarke „Sonnenkalender“ B0** für helle Flächen: Indigo-Blatt, Sonne, Minze-Wellen, Lavendel-Ringe | sprachneutral; Ebenen `data-anim="sun"` / `"waves"` für den Ladezustand |
| `logo-mark-on-brand.svg` | Bildmarke für Indigo-Flächen (Cockpit, Reisekarte) und Dunkelmodus: Blatt Violett, Ringe weiß | gleiche Ebenen |
| `logo-wordmark.svg` | Wortmarke DE „Wir wollen **weg**“, 320 × 72, „weg“ Lavendel `#5A3FD0` (6,1 auf Nebel), dunkel Minze | `prefers-color-scheme` eingebaut; Mindestbreite 128 px |
| `logo-wordmark-en.svg` | Wortmarke EN „When do we **go?**“, gleiche Box | „go?“ als Einheit in Markenfarbe (D-19); Mindestbreite 136 px |
| `logo-wordmark-en-tagline.svg` | EN + „Find dates for your group trip“, 320 × 84, ≥ 300 px | nur W01, OG-Bild EN, Mail-Kopf |
| `logo-wordmark-on-brand.svg` / `logo-wordmark-en-on-brand.svg` | Wortmarken für das Indigo-Cockpit der Startseite: Schrift weiß (13,7), Hervorhebung Minze (8,7) | ohne Farbwechsel im Dunkelmodus |
| `favicon.svg` | Favicon 32er Raster, vereinfacht (ohne Schein, eine Welle), dunkle Browserleiste: Violett/Weiß | `<link rel="icon" href="/favicon.svg" type="image/svg+xml">` |
| `favicon-16.svg` | 16er Raster auf ganze Pixel gesetzt (gerade Minze-Kante statt Welle) | daraus `favicon.ico` (16/32) exportieren |
| `app-icon.svg` | App-/PWA-Icon 512, vollflächig Indigo mit Lichtflecken, maskable (Inhalt ≤ 185 px von der Mitte, sichere Zone 205 px) | PNG 192/512 + apple-touch-icon 180 exportieren; Manifest `theme_color` `#2B2266`, `background_color` `#F4F2FB` |
| `logo-mark-a-sonnenkalender.svg` | **veraltet** – Inhalt = `logo-mark.svg` (B0), nur damit alte Verweise nicht brechen | kann entfernt werden |
| `logo-mark-b-weghaken.svg`, `logo-mark-c-treffpunkt.svg` | **Archiv** (v0.x, nicht gewählt, alte Palette) | nicht verwenden; kann entfernt werden |

Wortmarken liegen als `<text>` in **Plus Jakarta Sans 800, 28 px, −0,02 em** vor → **vor Produktion in Pfade umwandeln**, dann Mindestbreiten nachmessen. Welche Wortmarke: immer die der UI-Sprache (design-system §3). Wird das Theme per `[data-theme]` erzwungen, Wortmarke inline einbinden oder per `<picture>` wählen.

## Icons (`icons/`)

- **Sprite** `icons.svg` mit `<symbol id="ww-icon-…">`. Einbindung: `<svg width="20" height="20" aria-hidden="true"><use href="/icons.svg#ww-icon-calendar"/></svg>`.
- Stil B: 24er Raster, 2 px Strich (Häkchen/Kreuz 2,6 px, Chevrons 2,25 px), runde Enden, `currentColor`, **weiche Duoton-Füllung** (16 % der Strichfarbe) bei Flächen-Icons. Größen 16/20/24 px; in Kacheln 22 px.
- **Alle IDs aus v0.5 bleiben gültig** (kein Umbau im Code nötig). Neu in v1.0: `chevron-down`, `arrow-right`, `calendar-plus`, `sun`, `star`, `sparkle`, `chart`, `plane`, `login` (D-29). Geändert: `filter` ist jetzt ein Regler-Symbol (drei Linien) statt Trichter.
- `ww-icon-all-available` = Heatmap-Siegel „Alle: Geht“ (nur bei x = n, U-4). Farben per CSS: `color` = Kreis, `--ww-icon-knockout` = Häkchen, `--ww-icon-ring` = Ring. Hell: `color: var(--ww-hm-seal-bg); --ww-icon-knockout: var(--ww-hm-seal-fg); --ww-icon-ring: var(--ww-hm-seal-ring)`; dunkel schalten die Tokens automatisch (Mitternacht-Kreis, Minze-Haken, ohne Ring).
- Barrierefreiheit: Icons neben Text `aria-hidden="true"`; Icon-Buttons → Name am `<button>`.

| ID (`ww-icon-…`) | Bedeutung | ID | Bedeutung |
|---|---|---|---|
| `calendar` / `calendar-plus` | Kalender / Reise planen | `info` | Info |
| `share` | Teilen | `warning` | Hinweis (Amber) |
| `vote` | Abstimmung | `success` | Erledigt |
| `crown` | Orga (immer mit Label) | `comment` | Kommentar |
| `check` | Ja / Geht | `filter` | Filter |
| `maybe` | Vielleicht / Zur Not | `eye` / `eye-off` | Anzeigen / Ausblenden |
| `cross` | Nein / Geht nicht | `remind` | Erinnern (Megafon) |
| `language` | Sprache | `mail` | E-Mail |
| `calendar-download` | ICS | `lock` | Gesperrt |
| `copy` | Kopieren | `clock` | Frist |
| `holiday` | Feiertag | `nights` | Nächte |
| `link` | Einladungslink | `users` / `user` | Gruppe / Person |
| `all-available` | Siegel „Alle: Geht“ | `edit` / `trash` | Bearbeiten / Löschen |
| `arrow-left` / `arrow-right` | Zurück / Weiter | `logout` / `login` | Abmelden / Anmelden |
| `chevron-left/-right/-down` | Blättern / Aufklappen | `help` | Hilfe |
| `more` | Mehr (⋯) | `range` | Zeitraum wählen |
| `close` | Schließen | `quick-actions` | Schnellaktionen |
| `plus` / `minus` | Stepper | `undo` | Rückgängig |
| `sun` | Urlaubstage / Sonne | `star` | Platz 1 |
| `sparkle` | Vorschlag | `chart` | Übersicht / Kennzahl |
| `plane` | Reise | | |

Einzeldateien (Ansicht, gleiche Formen): `calendar`, `share`, `vote`, `crown`, `check`, `maybe`, `cross`, `language`, `calendar-download`, `copy`, `holiday`, `link`, `all-available`. Maßgeblich ist das Sprite.

## Heatmap (`heatmap/`)

| Datei | Inhalt |
|---|---|
| `heatmap-legend.svg` | sechs Stufen der **Indigo-Rampe** hell + dunkel, Zahl „x/n“, ◐ unten links, Siegel unten rechts (nur „alle“) |
| `availability-legend.svg` | Meine Tage: Geht (glatt, Minze), Zur Not (Sonnenstreifen + ◐-Plakette), Geht nicht (Kreuzschraffur + ✕-Plakette), dazu Pinsel-Mini-Felder – hell + dunkel |
| `heatmap-markers.svg` | Feiertag (Eselsohr mit Kerbe), Heute (Ring), Ausgewählt (Doppelrahmen), Fokus (Ring mit Hof), Vorschlag-Band in der Zeilenfuge, Wochenend-Spur – hell + dunkel |
| `heatmap-patterns.svg` | `<pattern>`-Definitionen (IDs `ww-pat-…`); in der App die CSS-Verläufe `--ww-pattern-*` verwenden |

## Illustrationen (`illustrations/`)

Stil B: flach, **ohne Kontur**, Kachel (abgerundetes Quadrat, Radius 32) statt Teller, max. 5 Palettenfarben, Lichtflecken als halbtransparente Kreise, keine Figuren, **keine Texte**. Farben über Klassen `wi-*` mit `var(--ww-illu-*, Fallback)` und Dunkel-Fallback per `prefers-color-scheme`. **Alle Dateien definieren gleichnamige Klassen identisch** – mehrere Inline-SVGs auf einer Seite stören sich nicht. Alle dekorativ (`aria-hidden="true"` am Wurzelelement; als `<img>` mit `alt=""`). Mobil max. 160 px hoch (Hero ausgenommen).

**Animierbare Ebenen (M-D3):** Gruppen mit `data-anim="…"`; Gruppen, die ein `transform`-Attribut brauchen, liegen **in** einer äußeren `data-anim`-Gruppe (CSS-Transform überschreibt sonst das Attribut). Der statische Zustand der Datei ist der Endzustand (Reduced Motion). IDs sind je Datei präfixiert (`wwhero-`, `wwcr-`, …).

| Datei | Einsatz | `data-anim`-Ebenen |
|---|---|---|
| `hero.svg` (358 × 210) | Startseite W01 – Übersichtskarte, ragt aus dem Cockpit | `plate`, `calendar`, `ring`, `friends`, `cells`, `band`, `sun`, `seal` |
| `countdown-ring.svg` (390 × 352) | **Feier W11 / F-012 = Vorfreude-Ring** im Cockpit, Countdown als HTML in der Mitte | `backdrop`, `glow`, `confetti` (Teilchen `data-piece` 1–12), `track`, `ring` (`pathLength` 100), `knob` (dreht um 195/236), `sparkles` |
| `vote-done.svg` | kompakter Vorfreude-Ring ohne Cockpit (Meine Reisen, Mail, Teilen-Bild) | `backdrop`, `glow`, `confetti`, `track`, `ring`, `knob` |
| `trip-card-motif.svg` | Hintergrund der Einladungs-Reisekarte W03 (Text als HTML oben links, keine Initialen) | `backdrop`, `rings`, `sun`, `waves`, `sparkles` |
| `seal.svg` | Siegel-Komponente (M-D4) 20/40/64 px: Beitritt, Abgabe, „alle haben abgestimmt“ | `disc`, `check` (`pathLength` 1), `sparks` |
| `invite.svg` | Einladung ohne Reisekarte (Mail, Fallback) | `letter`, `plane` |
| `code-sent.svg` | Code gesendet W02/W03 (klein) | `plate`, `letter`, `seal`, `sparks` |
| `empty-trips.svg` | Meine Reisen leer W04 | `plate`, `sun`, `sea`, `suitcase` |
| `empty-nobody.svg` | noch niemand eingetragen W07/W09 | `plate`, `calendar`, `friends` |
| `no-matches.svg` | keine Treffer W09 | `plate`, `ranges`, `search` |
| `submitted.svg` | Tage abgegeben W08 | `plate`, `calendar`, `seal`, `sparks` |
| `vote-waiting.svg` | Abstimmung noch nicht gestartet W10 | `plate`, `cards`, `clock` |
| `error.svg` | Fehlerseiten W14 | `plate`, `calendar`, `cloud` |
| `goodbye.svg` | Konto gelöscht W14 | `plate`, `sun`, `sea`, `plane` |

## Hinweise für die Einbindung
- **XML-Wohlgeformtheit (Prüfstand v1.0, 2026-10-08):** in Kommentaren kein doppelter Bindestrich (Token-Namen ohne Präfix-Striche schreiben); `&` als `&amp;`; IDs je Datei einmalig; `url(#…)`-Bezüge zeigen auf vorhandene IDs. In `<style>` und `style`-Attributen (`var(--ww-…)`) sind doppelte Bindestriche erlaubt.
- SVGO erlaubt, aber `viewBox`, `data-anim`, `data-piece`, `pathLength` und die `wi-*`-Klassen behalten (`removeViewBox: false`, `cleanupIds` mit Präfix).

## Schriften
**Plus Jakarta Sans** (Titel, Zahlen, Wortmarke) und **Figtree** (UI, Fließtext), beide SIL OFL 1.1, **selbst gehostet** – kein Google-Fonts-CDN (DSGVO). Je ein variables WOFF2, Subset Latin + Latin Extended (Plus Jakarta wght 500–800 ≈ 40–50 KB, Figtree wght 400–800 ≈ 35 KB). `OFL.txt` mit ausliefern. `@font-face`-Vorgabe: design-system §5.1.
