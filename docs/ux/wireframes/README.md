# Wireframes – Index

Stand: 2026-10-08 (Runde 3: Look & Feel 2.0 Richtung B „Reise-Cockpit“, Q17) · Verantwortlich: UI/UX · Mobile first (Entwurfsbreite 360 px), Desktop-Variante je Datei (≥ 960 px, Breakpoints s. [ux-spec §2](../ux-spec.md)).

**Lesehinweise**
- Wireframes zeigen Struktur, Inhalte, Reihenfolge und Zustände – **keine Optik**. Farben, Typo, Icons und Illustrationen kommen aus `docs/design/` (Tokens, Assets).
- Symbole in ASCII-Skizzen sind Platzhalter für Icons aus `docs/design/assets/icons/icons.svg` (`ww-icon-…`): `✕` cross · `◐` maybe · `✓` check (Strich) bzw. Abzeichen all-available (in Zellen) · `◥` Feiertag-Eselsohr · `⚇` users · `ⓘ` info · `⚠` warning · `⋯` more · `↶` undo · `⇤⇥` range · `[Kal]` calendar. Illustrationen sind mit Dateinamen aus `assets/illustrations/` benannt.
- Texte sind deutsche Arbeitsfassungen nach den Copy-Richtlinien ([ux-spec §10](../ux-spec.md)); EN-Fassungen entstehen im i18n-Schritt, Glossar ist verbindlich.
- **Produktname:** Wo „Wir wollen weg“ in einer Skizze steht (Wortmarke W01, W03, W04, W15), steht auf EN **„When do we go?“** (bestätigt (Auftraggeber 2026-10-08); Regeln [ux-spec §10.6](../ux-spec.md)). Gleiche Länge, kein Layout-Sonderfall.
- **Richtung B (Q18):** Wireframes mit Abschnitt „Richtung B“ (W01, W03, W07, W08, W09, W10, W11, W13) – dieser Abschnitt ist **maßgeblich**, wo er von älteren Skizzen derselben Datei abweicht (Cockpit-Kopf, Kennzahl-Box/-Kacheln, Vorschlag-Leiste, Werkzeugleiste, Vorfreude-Ring). Optik: `docs/design/richtungen/b/` bzw. Design-System v1.0. Entscheidungen: [abstimmung-design §8–§9](../abstimmung-design.md). Die HTML-Skizzen 08/09 sind noch Stand Runde 2 (Grid, Zelle, Tastatur, ARIA weiter gültig; Leisten/Kopf siehe md).
- Verhalten, Fehlerfälle und Leerzustände stehen ausführlich in [user-flows.md](../user-flows.md); die Wireframes verweisen darauf.
- Beispieldaten durchgehend: Reise „Lissabon 2027“, Suchzeitraum 1. Mai – 30. Juni 2027, 4–5 Nächte, Region Bayern, Orga Lena.

| Nr. | Datei | Ansicht / Route | Features | Flow | Status |
|---|---|---|---|---|---|
| W01 | [01-landing.md](01-landing.md) | Landing `/de`, `/en` | F-046, Einstieg F-001 | G, F | fertig |
| W02 | [02-anmelden.md](02-anmelden.md) | Anmelden/Registrieren, Code, Profil, Passwort vergessen `/login` | F-040, F-041, F-042 | H, A.2 | fertig |
| W03 | [03-einladung.md](03-einladung.md) | Einladung & Beitritt `/i/{token}` inkl. aller Sonderzustände | F-002, F-003, F-007, F-040, F-041 | A | fertig |
| W04 | [04-meine-reisen.md](04-meine-reisen.md) | Meine Reisen `/trips` inkl. Leerzustand | F-044, F-013, F-017 | E | fertig |
| W05 | [05-reise-anlegen.md](05-reise-anlegen.md) | Neue Reise `/trips/new` (auch ohne Login) | F-001, F-016, F-017 | G | fertig |
| W06 | [06-einladen-teilen.md](06-einladen-teilen.md) | Einladen `/trips/{id}/invite` + Teilen-Sheet (Komponente) | F-002, F-004, F-007, F-015 | G, K | fertig |
| W07 | [07-reise-uebersicht.md](07-reise-uebersicht.md) | Reise-Rahmen (Header, Tabs, Menü) + Tab Übersicht | F-004, F-007, F-012, F-015, F-017 | J, K | fertig |
| W08 | [08-meine-tage.md](08-meine-tage.md) · **[HTML](08-meine-tage.html)** | Tab Meine Tage `/trips/{id}/days` | F-005, F-016, F-046 | B | fertig |
| W09 | [09-gruppe-heatmap-vorschlaege.md](09-gruppe-heatmap-vorschlaege.md) · **[HTML](09-gruppe-heatmap.html)** | Tab Gruppe: Vorschläge, Heatmap, Tagesdetail `/trips/{id}/group` | F-008, F-009, F-016 | C | fertig |
| W10 | [10-abstimmung.md](10-abstimmung.md) | Abstimmung erstellen `/poll/new`, abstimmen `/poll` | F-010, F-011, F-017 | D.1, D.2 | fertig |
| W11 | [11-ergebnis.md](11-ergebnis.md) | Termin festlegen (Dialog), Ergebnis (Phase 3) | F-012 | D.3 | fertig |
| W12 | [12-reise-einstellungen.md](12-reise-einstellungen.md) | Reise bearbeiten `/settings` + Verwaltungsdialoge | F-001, F-004, F-013 | J | fertig |
| W13 | [13-konto.md](13-konto.md) | Konto, E-Mail ändern, Passwort, Konto löschen `/account…` | F-041, F-042, F-043, F-046 | I, F | fertig |
| W14 | [14-system-und-fehler.md](14-system-und-fehler.md) | System-/Fehlerzustände | F-003, F-041, F-043 | – | fertig |
| W15 | [15-hilfe.md](15-hilfe.md) | Hilfe/FAQ `/de/hilfe`, `/en/help` (MVP – bestätigt (Auftraggeber 2026-10-08)) | – (WCAG 3.2.6) | A.2, H.4 | fertig |

## HTML-Skizzen
- **[08-meine-tage.html](08-meine-tage.html)** (v2) – im Browser öffnen; mobil + Desktop nebeneinander. Interaktiv: Pinsel wählen, Tag antippen (Umschalten), über mehrere Tage ziehen (gestrichelte Vorschau je Zeilensegment), Bereichsmodus (zwei Tipps, Ankerpunkt + Hinweiszeile), Rückgängig (deaktiviert, wenn leer), Snackbar über der Leiste via `--ww-sticky-bar-h`, Tastatur (Pfeile, Leertaste, 1/2/3, Strg+Z, Esc). Die mobile Touch-Gestenlogik (horizontal starten bzw. 300 ms halten) ist nicht nachgebaut.
- **[09-gruppe-heatmap.html](09-gruppe-heatmap.html)** (v2) – statisch; mobil Vorschläge, mobil Kalender (Legende, Vorschlag-Band, Feiertagsliste), mobil Tagesdetail, mobil Tagesliste bei 200 % Text, Desktop dreispaltig mit Pegel. Zell-Anatomie nach design-system §6.1, ✓/◐ nach CEO-Entscheidung U-4, Gruppen „Alle dabei / Fast alle dabei“ (U-14). Heatmap-Werte und Vorschläge sind aus denselben Beispieldaten berechnet und damit konsistent (gute Testdaten-Vorlage für F-009).
- Beide Dateien sind Wireframes (Graustufen, kein Produktivcode); sie enthalten Beispiel-ARIA (Grid, Gridcell-Buttons, Roving Tabindex, Live-Region) als Referenz für ux-spec §7.3.

## Seitenübergreifende Komponenten (einmal bauen)
| Komponente | Definiert in | Verwendet in |
|---|---|---|
| Code-Eingabe | W02, ux-spec §4.4 | W02, W03, W05, W13 |
| Teilen-Sheet | W06, ux-spec §4.5 | W06, W07, W09, W10, W11 |
| Kalender-Grid (3 Modi: eingeben / Heatmap / Zeitraum wählen) | W08, W09, ux-spec §7.3 | W08, W09, W10 (eigener Zeitraum) |
| Reise-Rahmen (Cockpit-Kopf, Phasenzeile, Tabs, Reisemenü) | W07, ux-spec §4.10 | W07–W12 |
| Kennzahl-Box / Kennzahl-Kacheln | ux-spec §4.10 | W07, W09, W10 |
| Vorschlag-Leiste | ux-spec §4.11 | W09 |
| Schalter „Bewegung reduzieren“ | ux-spec §7.5 | W13 |
| Bestätigungsdialog destruktiv | ux-spec §4.2, W12 | W06, W11, W12, W13 |
| Stepper (Nächte, Toleranz) | ux-spec §4.6 | W05, W09, W10, W12 |

_Hinweis: Die HTML-Skizzen wurden in Runde 2 per Skript neu erzeugt (keine Handpflege der langen Tabellenzeilen nötig); ein Browser-Screenshot-Test lag in dieser Umgebung nicht vor – Sichtprüfung im Browser empfohlen._
