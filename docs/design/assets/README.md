# Assets – Wir wollen weg

Stand: 2026-10-08 · Verantwortlich: Designer · Spezifikation: [../design-system.md](../design-system.md) · Tokens: [../tokens.css](../tokens.css)

Alle Grafiken sind handgeschriebenes SVG (valide, `xmlns`, `viewBox`, `<title>`; Illustrationen zusätzlich `<desc>`). Keine Bitmaps, keine externen Fonts außer Figtree in der Wortmarke (siehe unten).

## Ordner

| Ordner | Inhalt |
|---|---|
| `logo/` | Bildmarken A/B/C, Wortmarken DE/EN, Favicon, App-Icon |
| `icons/` | Icon-Sprite (`icons.svg`, 41 Symbole) + Einzeldateien des Kernsets zur Ansicht |
| `heatmap/` | Muster (Patterns), Legenden Heatmap/Verfügbarkeit, Markierungen – Referenzgrafiken für Entwicklung und Review |
| `illustrations/` | 11 Illustrationen für Leerzustände und Momente |

## Logo (`logo/`)

| Datei | Zweck | Hinweise |
|---|---|---|
| `logo-mark-a-sonnenkalender.svg` | **Empfohlene Bildmarke** – Kalenderblatt mit Sonne über dem Meer | Grundlage für Favicon, App-Icon, Wortmarke |
| `logo-mark-b-weghaken.svg` | Alternative B – Häkchen wird zur Route | eignet sich als Sekundärzeichen (Erfolg) |
| `logo-mark-c-treffpunkt.svg` | Alternative C – drei Wege treffen sich an der Sonne | erst ab ~48 px lesbar |
| `logo-wordmark.svg` | Wortmarke DE („Wir wollen **weg**") | `<text>` mit Figtree → vor Produktion in Pfade umwandeln |
| `logo-wordmark-en.svg` | Wortmarke + EN-Untertitel „Find dates for your group trip" | Marke bleibt deutsch (Empfehlung, Auftraggeber entscheidet) |
| `favicon.svg` | Favicon (32er Raster, vereinfachte Marke A) | `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`; zusätzlich PNG 32/180 (apple-touch-icon) daraus exportieren |
| `app-icon.svg` | App-/PWA-Icon 512 px, vollflächig, maskable-tauglich | Inhalt in der sicheren Zone (Radius 40 %); PNG 192/512 exportieren; `theme_color` = `#0E6A68`, `background_color` = `#FBF8F3` |

Wortmarken enthalten `prefers-color-scheme`-Styles für helle/dunkle Umgebung. Wird das Theme per `[data-theme]` erzwungen, die Wortmarke **inline** einbinden (dann greifen die Seitenfarben) oder die passende Variante per `<picture>` wählen.

## Icons (`icons/`)

- **Sprite:** `icons.svg` mit `<symbol id="ww-icon-…">`. Einbindung: `<svg width="20" height="20" aria-hidden="true"><use href="/icons.svg#ww-icon-calendar"/></svg>`.
- Stil: 24er Raster, 2 px Strich (Check/Kreuz 2,5 px), runde Enden, `currentColor`. Größen 16/20/24 px.
- Barrierefreiheit: Icons neben Text → `aria-hidden="true"`. Icon-Buttons → zugänglicher Name am `<button>` (`aria-label`), nicht im SVG.
- `ww-icon-all-available`: Häkchen-Aussparung über `--ww-icon-knockout` (auf die Zellfarbe setzen, z. B. `--ww-icon-knockout: var(--ww-hm-all-bg)`). Die Einzeldatei `all-available.svg` nutzt dafür eine Maske.

| ID (`ww-icon-…`) | Bedeutung | ID | Bedeutung |
|---|---|---|---|
| `calendar` | Kalender | `info` | Info |
| `share` | Teilen | `warning` | Hinweis/Warnung (Amber) |
| `vote` | Abstimmung | `success` | Erledigt |
| `crown` | Orga (immer mit Label) | `comment` | Kommentar |
| `check` | Ja / Geht | `filter` | Filter |
| `maybe` | Vielleicht / Zur Not | `eye` | Anzeigen / Passwort zeigen |
| `cross` | Nein / Geht nicht | `eye-off` | Ausblenden / Passwort verbergen |
| `language` | Sprache | `remind` | Erinnern (Megafon) |
| `calendar-download` | ICS / zum Kalender | `mail` | E-Mail / Code gesendet |
| `copy` | Kopieren | `lock` | Gesperrt / schreibgeschützt |
| `holiday` | Feiertag | `clock` | Frist |
| `link` | Einladungslink | `nights` | Nächte |
| `all-available` | Alle können (Badge) | `users` | Gruppe |
| `arrow-left` | Zurück | `user` | Person / Avatar-Fallback |
| `chevron-left` / `chevron-right` | Blättern | `edit` | Bearbeiten |
| `more` | Mehr (⋯) | `trash` | Löschen |
| `close` | Schließen | `logout` | Abmelden |
| `plus` / `minus` | Stepper | `help` | Hilfe |
| `undo` | Rückgängig | `range` | Bereichsmodus (Zeitraum) |
| `quick-actions` | Schnellaktionen | | |

Einzeldateien (Kernset, mit `<title>` zur Ansicht): `calendar.svg`, `share.svg`, `vote.svg`, `crown.svg`, `check.svg`, `maybe.svg`, `cross.svg`, `language.svg`, `calendar-download.svg`, `copy.svg`, `holiday.svg`, `link.svg`, `all-available.svg`. Maßgeblich für die Entwicklung ist das Sprite.

## Heatmap (`heatmap/`)

| Datei | Inhalt |
|---|---|
| `heatmap-legend.svg` | Sechs Heatmap-Stufen (keine Daten · niemand · wenige · einige · viele · alle) in Light und Dark, mit Zahl, Pegel, ◐ und ✓ – Referenz für Entwicklung und Barrierefreiheits-Review |
| `heatmap-markers.svg` | Wochenende (Spur), Feiertag (Eselsohr), Heute (Ring), Ausgewählt (Doppelrahmen), Fokus (Ring mit Abstand), Vorschlag (Band mit Endkappen) – Light und Dark |
| `availability-legend.svg` | Eigene Verfügbarkeit: Geht / Zur Not / Geht nicht (Works / If needed / Can't) – Symbol + Muster + Farbe |
| `heatmap-patterns.svg` | `<pattern>`-Definitionen: Schraffur „niemand", Streifen „Zur Not", Kreuzschraffur „Geht nicht" (Light/Dark). In der App bevorzugt die CSS-Gradients `--ww-pattern-*` aus tokens.css verwenden. |

Hinweis: Die Referenzgrafiken zeigen Desktop-Zellen (64 px) mit Pegel; mobil (52 px Höhe) entfällt der Pegel, ✓ sitzt unten rechts, ◐ unten links (design-system §6.1).

## Illustrationen (`illustrations/`)

Farben über CSS-Klassen mit `var(--ww-illu-*, Fallback)` und eigener Dark-Variante via `prefers-color-scheme`. **Inline** eingebunden übernehmen sie die Token-Farben der Seite (auch bei erzwungenem `[data-theme]`); als `<img>` gelten die eingebauten Fallbacks. Alle dekorativ (`alt=""` bzw. `aria-hidden="true"`), mobil max. 160 px hoch.

| Datei | Einsatz |
|---|---|
| `hero.svg` | Startseite (W01) |
| `invite.svg` | Einladungs-Vorschau (W03, F-003) |
| `code-sent.svg` | Code gesendet (W02/W03, F-040/F-041) |
| `empty-trips.svg` | Meine Reisen leer (W04, F-044) |
| `empty-nobody.svg` | Noch niemand eingetragen (W07/W09, F-007/F-008) |
| `no-matches.svg` | Keine Treffer in Vorschlägen (W09, F-009) |
| `submitted.svg` | Tage abgegeben (W08, F-005) |
| `vote-waiting.svg` | Abstimmung noch nicht gestartet (W10) |
| `vote-done.svg` | Termin festgelegt (W11, F-012) |
| `error.svg` | Link ungültig / nicht gefunden / Serverfehler (W14) |
| `goodbye.svg` | Konto gelöscht (W14, F-043) |

## Hinweise für die Einbindung
- Beim **Inline**-Einbinden mehrerer SVGs auf einer Seite die IDs (`t`, `d`, `clipPath`-/`pattern`-IDs) eindeutig machen, z. B. per SVGO-Plugin `prefixIds`; `<title>` bei dekorativen Grafiken entfernen oder `aria-hidden="true"` setzen.
- SVGO-Optimierung ist erlaubt, aber `viewBox` behalten (`removeViewBox: false`) und Klassen/Styles der Illustrationen nicht zusammenführen (Dark-Mode-Regeln).

## Schrift
Figtree (SIL Open Font License 1.1) **selbst hosten** – kein Google-Fonts-CDN (DSGVO). Ein variables WOFF2, Subset Latin + Latin Extended, Gewichte 600–800. Lizenzdatei (OFL.txt) mit ausliefern. Details: design-system §5.
