# UX-Spezifikation – Wir wollen weg (MVP)

Stand: 2026-10-20 (Feedback-Runde 1, §14; davor Runde 3: Look & Feel 2.0 Richtung B „Reise-Cockpit“, Q17 Motion/Haptik) · Verantwortlich: UI/UX · Bezug: [sitemap.md](sitemap.md), [user-flows.md](user-flows.md), [Wireframes](wireframes/README.md), [abstimmung-design.md](abstimmung-design.md), [PRD](../product/PRD.md) §8

Dieses Dokument legt verbindliche Interaktionsregeln fest. Optik (Farben, Typo, Abstände, Radien, Icons) kommt vom Designer (`docs/design/`). Bei Widersprüchen gilt: Struktur/Verhalten → dieses Dokument; Aussehen → Design-System; Konflikte klärt der CEO.

---

## 1. Grundsätze

1. **Eine Hauptaktion pro Bildschirm.** Genau ein primärer Button; alles andere sekundär oder Textlink.
2. **Nichts geht verloren.** Eingaben überleben Neuladen, Sprachwechsel, App-Wechsel und Login (Flows A, G).
3. **Sofort sichtbar, verlässlich gespeichert.** Optimistisches UI für Tage und Stimmen; klarer Speicherstatus.
4. **Erklären statt blockieren.** Deaktivierte Buttons haben immer einen sichtbaren Grund daneben.
5. **Nie nur Farbe.** Jeder Zustand hat zusätzlich Symbol, Muster oder Text.
6. **Daumenzone.** Mobile Hauptaktionen unten, mind. 44 × 44 px.

## 2. Breakpoints & Layout

Breakpoints identisch mit dem Design-System (`docs/design/tokens.css`: 360 Basis · 600 md · 960 lg · 1200 xl), Media Queries mobile-first mit `min-width`.

| Name | Breite | Layout-Regeln |
|---|---|---|
| Basis (`sm`) | 320–599 px | Entwurfsbreite **360 px**. Einspaltig, Seitenrand 16 px. **Kalender:** Seitenrand 8 px (`--ww-size-cal-inset-sm`), Fuge 4 px (`--ww-size-cal-gap`) → Zelle **45,7 × 52 px** bei 360 px (CEO-Entscheidung U-1). 7 Spalten volle Breite, ein Monat untereinander. Heatmap-Zelle ohne Pegel, Zählwert „x/n“ bis n ≤ 9, sonst „x“. Fixierte Aktionsleiste unten. Dialoge als Bottom-Sheets. |
| `md` | 600–959 px | Einspaltig, max. Inhaltsbreite 640 px (`--ww-size-content-narrow`) zentriert; Meine Reisen zweispaltige Kartenliste; Dialoge zentriert (max. 480 px); Kalender-Seitenrand 16 px (`--ww-size-cal-inset`), Zellen 64 px hoch (`--ww-size-cal-cell-h-lg`), Heatmap mit Pegel (4 Segmente) und „x/n“ immer (U-3). Werkzeugleiste Meine Tage bleibt unten fixiert. |
| `lg` | 960–1199 px | Reise: Inhalt + Seitenspalte (Gruppe: Heatmap links, Vorschläge rechts 340 px). Kalender 2 Monate nebeneinander. Werkzeugleiste Meine Tage oben über dem Kalender (sticky). Tagesdetail als Seitenpanel. |
| `xl` | ≥ 1200 px | Max. Inhaltsbreite 1040 px (`--ww-size-content-wide`) für Kalender, 1200 px gesamt. Meine Tage: 3 Monate nebeneinander; Gruppe: 2 Monate + Seitenspalte. |

In den Wireframes steht „Desktop“ für `lg`/`xl` (≥ 960 px).

- **Mindestens bedienbar ab 320 px** ohne horizontales Scrollen (WCAG 1.4.10 Reflow). Bei 320 px sinkt die Kalenderzelle auf ≈ 41 px Breite (zulässig, ≥ 24 px Minimum, s. §7.2).
- **Höhe:** Fixierte Leisten (kompakter Cockpit-Kopf + Tabs oben, Aktionsleiste unten) zusammen ≤ 40 % der Viewport-Höhe bei 640 px Höhe – Richtung B: Kopf ≈ 104 px + Werkzeugleiste W08 ≤ 150 px = 254 px; bei Querformat mit < 480 px Höhe wird der Reise-Kopf beim Scrollen nach unten ausgeblendet und bei Scroll nach oben wieder eingeblendet.
- **Safe Areas:** `env(safe-area-inset-*)` für fixierte Leisten (iPhone, In-App-Browser-Toolbars).
- **Viewport:** `width=device-width, initial-scale=1`; **kein** `maximum-scale`/`user-scalable=no` (Zoom muss erlaubt sein). Eingabefelder ≥ 16 px Schrift, damit iOS nicht automatisch zoomt.
- **Dynamische Viewport-Höhe:** Bottom-Sheets und Vollbild-Ansichten mit `dvh`, damit In-App-Browser-Leisten nichts verdecken.

## 3. Navigation & Seitenverhalten

- Struktur siehe [sitemap.md](sitemap.md) §5. Tabs der Reise sind **Links** (eigene URLs, Zurück-Taste funktioniert), keine reinen JS-Tabs; `aria-current="page"` auf dem aktiven Tab (Muster: Navigationsleiste, nicht `role="tablist"`, da Seitenwechsel).
- **Zurück-Taste:** Jeder Flow-Schritt (E-Mail → Code → Name), jedes geöffnete Bottom-Sheet mit Inhalt (Tagesdetail, Teilen) und die Ansicht Vorschläge/Kalender erzeugen History-Einträge. Zurück schließt zuerst das Sheet, dann den Schritt.
- **Scrollposition** wird beim Zurückkehren wiederhergestellt; beim Tab-Wechsel beginnt der neue Tab oben – außer Meine Tage, der zum ersten Monat mit ungeklärten Tagen bzw. zum heutigen Monat springt.
- **Seitentitel** (`<title>`): «Meine Tage · Lissabon 2027 · Wir wollen weg» / «My dates · Lisbon 2027 · When do we go?» – Ansicht zuerst (Screenreader, Tab-Leiste), Produktname immer **am Ende** (dadurch steht das Fragezeichen des EN-Namens nie mitten im Titel, s. §10.6). Landing: «Wir wollen weg – Gemeinsam den Urlaubstermin finden» / «When do we go? Find dates for your group trip».
- **Reise-Kopf „Cockpit“ (Richtung B, §4.10):** In Reise-Ansichten gibt es keinen globalen Header; der Indigo-Kopf beginnt mit Zeile 1 `[← Meine Reisen]` · Reisename (1 Zeile, „…“) + **Phasenzeile** · `[⋯]` und der Tab-Leiste. **Sticky ist nur dieser kompakte Kopf (≈ 104 px).** Darunter liegende Kopf-Inhalte (Kennzahl-Box W09, Vorfreude-Ring W11, Phase-Kennzahl W07) scrollen mit dem Inhalt weg – keine Einklapp-Animation, kein Layout-Sprung.
- **Ungespeicherte Änderungen** (nur Formulare mit explizitem Speichern: Reise bearbeiten, Konto-Profil): Bestätigungsdialog beim Verlassen.

## 4. Komponenten-Verhalten

### 4.1 Buttons
- Varianten: primär (1 pro Ansicht), sekundär, Text, destruktiv. Beschriftung = Verb + Objekt («Reise anlegen», «Code senden»), max. 3 Wörter wo möglich.
- **Ladezustand:** Spinner im Button + Text bleibt (z. B. «Code senden …»), Button gesperrt gegen Doppelklick, Breite bleibt stabil. Ab 10 s: Hinweis unter dem Button «Dauert länger als üblich …».
- **Deaktiviert:** nur wenn der Grund danebensteht; sonst lieber aktiv lassen und bei Klick validieren.

### 4.2 Dialoge & Bottom-Sheets
- Mobil (< 600 px): Bottom-Sheet mit Griff, schließbar per Wischen nach unten, Tipp auf Hintergrund, `Esc`, Zurück-Taste. Desktop: zentrierter modaler Dialog.
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` = Überschrift; Fokus beim Öffnen auf die Überschrift (bei Bestätigungsdialogen) bzw. auf das erste Feld; Fokusfalle; beim Schließen Fokus zurück auf den Auslöser.
- **Fokus nach „Termin festlegen“ (F-012):** Das Sheet schließt, der Fokus geht **sofort** (im selben Ereignis, nicht nach der Animation) auf die h1 «Es geht los!» der Ergebnis-Karte (`tabindex="-1"`, `aria-describedby` → Datumszeile). Ausnahme von „Fokus zurück auf den Auslöser“, weil der Auslöser (Tab Abstimmen) nicht mehr existiert. (M-U10)
- **Destruktive Bestätigung:** Überschrift als Frage, Folgen in einem Satz, Buttons `[Abbrechen]` (sekundär, links/oben) und `[<Verb>]` (destruktiv). Standardfokus auf `[Abbrechen]`.
- Tagesdetail (Heatmap) ist **nicht modal** auf Desktop (Seitenpanel), damit man parallel im Kalender navigieren kann.

### 4.3 Snackbar (Toast)
- Position: unten, **über** der fixierten Aktionsleiste (nie verdeckend), Desktop unten links. Technik (U-7): Das Layout misst die fixierte Leiste per `ResizeObserver` und setzt `--ww-sticky-bar-h` am Seitencontainer (ohne Leiste `0px`); Snackbar `bottom: calc(var(--ww-sticky-bar-h) + var(--ww-size-toast-gap) + env(safe-area-inset-bottom))`. Dieselbe Variable speist `scroll-padding-bottom` (§7.2, WCAG 2.4.11).
- Dauer: 6 s bei Aktion (Rückgängig), 4 s ohne; pausiert bei Hover/Fokus. Maximal eine gleichzeitig (neue ersetzt alte).
- `role="status"` (höflich). Fehler, die Handeln erfordern, **nicht** als Snackbar, sondern inline oder als Banner.
- Aktion in der Snackbar ist per Tastatur erreichbar (Kurzbefehl Strg/Cmd+Z für Rückgängig zusätzlich), WCAG 2.2.1: Zeit reicht, weil Rückgängig auch über die Werkzeugleiste dauerhaft erreichbar ist.

### 4.4 Code-Eingabe (F-040, F-041)
- **Ein** `<input>`: `type="text"`, `inputmode="numeric"`, `autocomplete="one-time-code"`, `pattern="[0-9]*"`, `maxlength` 6 (nach Bereinigung), `autocapitalize="off"`, `spellcheck="false"`. **Keine** sechs Einzelfelder (brechen Einfügen, Autofill, Screenreader, Korrektur).
- Optik segmentiert (design-system §9.2: 6 Kästchen, Lücke nach der 3. Ziffer, Zustände leer/Fokus/gefüllt/Fehler/Prüfen/gesperrt/Erfolg), technisch bleibt es ein Feld (Overlay-Variante). Copy der Zustände gilt aus user-flows A.2 (z. B. «Dieser Code stimmt nicht. Noch 3 Versuche.»); im gesperrten Zustand ist `[Neuen Code senden]` die **primäre** Aktion (einzige sinnvolle Handlung).
- Einfügen: Leerzeichen, Bindestriche und Nicht-Ziffern entfernen; bei genau 6 Ziffern automatisch absenden.
- Label sichtbar: «6-stelliger Code»; Beschreibung (aria-describedby): «Gesendet an kemal@… · gültig 15 Minuten».
- Fehler: Feld markieren, Text darunter, Inhalt **markiert lassen** (schnelles Überschreiben), Fokus bleibt.
- «Code erneut senden»: Textbutton mit Countdown «Neuer Code in 0:27» (Countdown wird für Screenreader nicht sekündlich angesagt; nur „Jetzt verfügbar“ einmal).
- «Angemeldet bleiben»: Standard **an** (*bestätigt (Auftraggeber 2026-10-08)*) (Zielgruppe nutzt eigene Handys; In-App-Browser verlieren Sitzungen sonst oft). Im Login-Formular sichtbar, im Einladungsflow nur als Textzeile «Du bleibst auf diesem Gerät angemeldet. [Ändern]», um das Formular schlank zu halten.

### 4.5 Teilen-Sheet (F-002, F-010, F-012, F-015, F-046)
- Inhalt: Vorschau-Textfeld (editierbar, mehrzeilig, Auto-Höhe), Sprachumschalter `DE | EN` (Radiogruppe; Wechsel ersetzt den Text – wenn bearbeitet, vorher Rückfrage «Deine Änderungen am Text gehen verloren»), Link als eigene Zeile mit `[Kopieren]`. Der Produktname im Text folgt der **Textsprache** (DE-Text „Wir wollen weg“, EN-Text „When do we go?“; §9, §10.6).
- Aktionen: primär `[Teilen …]` (Web Share API, `navigator.share({text})` – Link ist im Text enthalten, nicht doppelt als `url`); wenn nicht verfügbar (häufig in In-App-Browsern, Desktop): primär `[Text kopieren]` + Zeile Direkt-Links «WhatsApp · Signal · Telegram · E-Mail» (`wa.me/?text=`, `sgnl://` nicht zuverlässig → Signal nur auf Mobil zeigen, `t.me/share/url`, `mailto:`).
- Kopieren-Bestätigung: Button-Text wechselt 2 s zu «Kopiert ✓» + `role="status"`-Ansage.
- **Ausnahme Erinnern (§14.2):** Im Erinnern-Sheet (`RemindSheet`) ist «Per WhatsApp senden» (`wa.me/?text=`) primär; [Teilen …] und [Text kopieren] sind sekundär.

### 4.6 Stepper (Nächte, Toleranz)
- `−` Wert `+`, Wert als `<input type="number">` direkt editierbar; Buttons ≥ 44 px; Grenzen deaktivieren den jeweiligen Button; Ansage des neuen Werts (`aria-live="polite"` am Wert bzw. natives Number-Input).
- Unter dem Nächte-Stepper immer Klartext: «= 6 Tage inkl. An- und Abreise».

### 4.7 Datumsfelder
- Native `<input type="date">` für Formularfelder (Suchzeitraum, Frist): robust, barrierefrei, mobil mit System-Picker. Anzeige der gewählten Daten zusätzlich im App-Format daneben («Sa., 1. Mai 2027»), weil der native Picker die OS-Sprache nutzt.
- Zeitraumwahl im Kalender (Abstimmungs-Option) über die Kalender-Komponente im Bereichsmodus (Flow B.2).

### 4.8 Karten
- Ganze Karte klickbar über einen Link im Titel mit erweiterter Klickfläche (Pseudo-Element) – genau **ein** Fokusstopp je Karte plus separat fokussierbare Sekundäraktionen.

### 4.9 Heatmap-Zelle, Legende, Feiertagsliste (F-008, F-016)
Optik und Maße: design-system §6.1–§6.5. Verhalten/Inhalt verbindlich hier:
- **Zell-Anatomie (feste Orte):** Datum + Heute-Ring oben links · Feiertag (Eselsohr) Ecke oben rechts · Zählwert Mitte · ◐ unten links (ab 600 px mit Anzahl „◐2“) · ✓ unten rechts · Pegel (4 Segmente) nur ≥ 600 px · Ausgewählt = Doppelrahmen innen · Fokus = Ring außen (`--ww-focus-ring-isolated`) · Vorschlag = Band in der Fuge darunter (Kappen nur an An-/Abreisetag, am Zeilen-/Monatsende offen). (CEO-Entscheidung U-2.)
- **Zählwert** = Anzahl „Geht“ / abgegebene Mitglieder (F-008); mobil „x/n“ bis n ≤ 9, sonst „x“ (n im Statusband); ≥ 600 px immer „x/n“. „Zur Not“ zählt nicht in der Zahl, nur in der Intensität (½) und über ◐.
- **✓ „Alle: Geht“** erscheint genau dann, wenn alle Abgegebenen „Geht“ haben (x = n, = Stufe „alle“). Tage ohne „Geht nicht“, aber mit „Zur Not“ zeigen **nur ◐**, kein ✓. ✓ und ◐ kommen nie gemeinsam vor. (CEO-Entscheidung U-4.)
- **Begriffe trennen:** Die Vorschlagsgruppe „niemand hat ‚Geht nicht‘“ (F-009) heißt **„Alle dabei“**; sie kann Tage ohne ✓ enthalten – deshalb trägt ihre Überschrift das Strich-Icon `ww-icon-check`, nicht das Abzeichen `ww-icon-all-available`, und Karten mit Zur-Not-Tagen den Chip «◐ 2× zur Not». (CEO-Entscheidung U-14.)
- **Ausgeblendete Personen** (Was-wäre-wenn-Filter) verringern n lokal; kein eigener Zellzustand, nur aktiver Filter-Chip «✓ 1 ausgeblendet ▾».
- **Legende (U-6):** Komponente mit echten Mini-Zellen (Stufen „–, 0, 2, 3, 4, 5 ✓“ mit Beispielzahlen der aktuellen Gruppe), danach Zeile «4/5 = 4 von 5 haben „Geht“ · ✓ Alle: Geht · ◐ Jemand nur „Zur Not“ · ◥ Feiertag · Band = Vorschlag». Umsetzung als `<details>`/`<summary>` („Legende“). **Zustand:** mobil beim ersten Besuch der Kalenderansicht aufgeklappt; sobald die Person sie einmal zuklappt, bleibt sie zu (gemerkt pro Gerät, `localStorage`, kein Cookie). ≥ 960 px immer sichtbar in der Filterzeile (genug Platz). Meine Tage: Legende „So funktioniert’s“ aufgeklappt bis zur ersten Abgabe, danach zugeklappt (B.1).
- **Feiertagsliste (U-11):** unter jedem Monat mit Feiertagen eine Liste (`<ul aria-label="Feiertage im Mai">`), je Eintrag kleines Eselsohr-Dreieck (dekorativ, `aria-hidden`) + «1.5. Tag der Arbeit»; 13 px `--ww-color-text-muted`. Monate ohne Feiertag: keine Zeile. Gleich in Meine Tage, Heatmap und Mini-Kalender (W10).
- **Mini-Streifen auf Vorschlagskarten (U-10): nicht im MVP** (Information steht als Text auf der Karte; „Im Kalender zeigen“ übernimmt die Wiedererkennung). Kandidat nach Beta-Feedback. Die „Tages-Balken“ aus Richtung B sind dieselbe Idee: **MVP+**, nur dekorativ (`aria-hidden`).

### 4.10 Cockpit-Kopf & Kennzahlen (Richtung B, Q18)
Optik: Design-System v1.0 / `richtungen/b`. Verhalten verbindlich hier (abstimmung-design §8.1):
- **Aufbau:** Zeile 1 (48 px): runde Icon-Taste Zurück (44 px, `aria-label` «Meine Reisen»), Reisename (h-Stil, 1 Zeile mit „…“, voller Name auf Übersicht), darunter **Phasenzeile**, runde Taste `⋯` (`aria-label` «Reisemenü»). Zeile 2: Tab-Leiste (Pillen ≥ 44 px, Spur 48 px; < 375 px horizontal scrollbar mit Verlaufskante, aktiver Tab in Sicht). Diese beiden Zeilen sind sticky.
- **Phasenzeile:** «Tage sammeln · 5/7 fertig» · «Abstimmung läuft · 4/7 fertig» · «Steht fest · 7 dabei» (EN §10.2). „5/7“ hat sr-only-Text «5 von 7». Farbiger Punkt ist Zusatz. Bei großer Schrift Umbruch auf 2 Zeilen, nie gekürzt.
- **Höchstens eine Kennzahl pro Cockpit**, unterhalb der Tabs, scrollt mit:
  | Tab | Kennzahl im Kopf |
  |---|---|
  | Übersicht (W07) | Phase 1: Ring + «5 von 7 haben abgegeben» · Phase 2: Ring + «4 von 7 haben abgestimmt» + Frist · Phase 3: Vorfreude-Ring mit Countdown (W11) |
  | Meine Tage (W08) | keine (Platz für den Kalender) |
  | Gruppe (W09) | **Kennzahl-Box** (ersetzt das Statusband): Ring + «5 von 7 haben abgegeben» + «Noch offen: Kemal, Sara – das Ergebnis kann sich noch ändern.» + Orga `[Erinnern]` (Minze-Taste, ≥ 44 px). Alle abgegeben: «Alle haben abgegeben.» + Orga `[Abstimmung starten]`. |
  | Abstimmen (W10) | keine im Kopf; **Kennzahl-Kacheln** im Inhalt (s. u.) |
- **Geändert durch §14.2 (2026-10-20):** In Übersicht und Gruppe ist die Kennzahl-Box in Phase 1/2 ein Button (Chevron) → Sheet „Wer hat eingetragen?/abgestimmt?“ mit Erinnern. Die Minze-Taste [Erinnern] in der Box entfällt. Begriff „eingetragen“ statt „abgegeben“. In Phase 3 hat der Kopf keine Tabs (§14.4).
- **Ringe und Balken sind `aria-hidden`**, die Werte stehen als Text daneben. Zahlen wechseln **sofort** (kein Hochzählen, G-16); nur Ring/Balken dürfen wachsen (§7.5).
- **Kennzahl-Kacheln (W10):** zwei Karten nebeneinander (je halbe Breite, Text zweizeilig erlaubt; bei großer Schrift untereinander per `minmax(9.5em, 1fr)`): Frist «noch 3 Tage / bis Do., 15. April» und Beteiligung «4 von 7 / haben abgestimmt». Ohne Frist nur die Beteiligungs-Kachel (volle Breite). Frist abgelaufen: «Frist abgelaufen» + Warn-Icon (Amber). Die **Beteiligungs-Kachel ist ein Button** → Bottom-Sheet «Wer hat abgestimmt?» mit «Abgestimmt (4)» / «Noch offen (3)» (nur Status, keine Stimmen) und für die Orga `[Erinnern]`. Die Avatar-Reihe im Kopf entfällt.

### 4.11 Vorschlag-Leiste in der Kalender-Ansicht (W09, < 960 px)
- **Fixierte Leiste unten** in der Ansicht Kalender (nicht in Vorschläge, nicht ≥ 960 px – dort Seitenspalte). Kein Griff, nicht ziehbar. Höhe ≤ 120 px + Safe Area; setzt `--ww-sticky-bar-h` (Snackbar, `scroll-padding-bottom`).
- **Inhalt:** `[‹ Vorheriger Vorschlag]` (44 px) · Mitte · `[Nächster Vorschlag ›]` (44 px). Mitte: Rang + Gruppe + Position («1 · Alle dabei · 1 von 5»), Zeitraum («Mi., 5. Mai – Mo., 10. Mai»), «bis zu 5 Nächte · ca. 3 Urlaubstage», höchstens **eine** Chip-Zeile ohne Umbruch (Überlauf als «+1»). Reihenfolge = Vorschlagsliste (F-009, „Alle dabei“ vor „Fast alle dabei“).
- **Verhalten:** Beim Betreten der Ansicht ist Vorschlag 1 gewählt (bzw. der per „Im Kalender zeigen“ gewählte) und sein **Band** steht im Kalender. Blättern wählt den nächsten Vorschlag, das Band wechselt, die Seite scrollt so, dass der Anreisetag im oberen Drittel steht (Smooth-Scroll, reduziert: Sprung). Kein Umlauf an den Enden; Pfeil `aria-disabled` mit sichtbarem Zustand (≥ 3:1). Ansage (polite): «Vorschlag 2 von 5: Sa., 12. Juni – Sa., 19. Juni, Alle dabei». Fokus bleibt auf dem Pfeil.
- **Mitte ist ein Button** (zugänglicher Name: Zeitraum + «in der Liste zeigen») → wechselt zur Ansicht Vorschläge und fokussiert die Karte. Dort liegen Details und die Orga-Checkbox „Zur Abstimmung“. **Keine Orga-Auswahl in der Leiste** (eine fixierte Leiste je Ansicht; die Auswahlleiste „2 ausgewählt · Abstimmung erstellen“ gibt es nur in der Listenansicht).
- **Keine Treffer / niemand abgegeben:** Leiste zeigt eine Zeile «Gerade kein passender Zeitraum.» + `[Tipps ansehen]` (→ Liste, Leerzustand mit Filter-Vorschlägen) bzw. entfällt, wenn noch niemand abgegeben hat.
- **DOM-Reihenfolge:** vor dem Kalender (nach Filterzeile und Legende); Skip-Link «Zum Kalender». Das Tagesdetail-Sheet liegt darüber (modal).

### 4.12 Werkzeugleiste „Meine Tage“ (Richtung B)
Ergänzt §7.3 und W08. Mobil fixiert, **≤ 150 px ohne Safe Area**, kein Griff:
- Statuszeile 16 px: links «Entwurf» (vor 1. Abgabe) bzw. leer, rechts Speicherstatus «Gespeichert» / «Speichert …» / «Nicht gespeichert – Erneut versuchen».
- Pinsel-Leiste (Radiogruppe, `aria-label` «Was markierst du?» – **kein** sichtbares Label), ≤ 58 px.
- Werkzeugzeile 48 px: drei Kachel-Tasten **44 × 48 px** unter 400 px (sonst 48 × 48), Lücke 6 px – `[Zeitraum]` (Icon, `aria-pressed`), `[Rückgängig]`, `[Schnellaktionen]` – und `[Fertig – abgeben]` (primär, 48 px hoch, einzeilig) im Rest. Nach Abgabe ersetzt «✓ Abgegeben · 14:32» den Primärbutton.
- **Icon-only unter 600 px** zulässig, weil: Name als `aria-label` **und** Tooltip (Hover/Fokus); `[Zeitraum]` gedrückt = gefüllte Kachel + Hinweiszeile «Jetzt den Start antippen.» über der Leiste; die Legende „So funktioniert's“ erklärt das Zeitraum-Icon in Textform. Ab 600 px Icon + Text.

## 5. Formulare & Validierung

### 5.1 Regeln
- Labels immer sichtbar über dem Feld (keine Platzhalter als Label). Platzhalter nur als Beispiel («z. B. Lissabon 2027»).
- Pflichtfelder sind die Regel; **optionale** Felder werden mit «(optional)» markiert (weniger Rauschen als Sternchen).
- **Wann validieren:** beim Absenden und beim Verlassen eines bereits bearbeiteten Feldes; Fehler verschwinden live, sobald korrigiert. Nicht während der ersten Eingabe meckern.
- **Fehlertext:** am Feld, unter dem Feld, mit Symbol; `aria-invalid="true"` + `aria-describedby`. Formulierung: was ist falsch + wie korrigieren.
- **Absenden mit Fehlern:** Fokus auf erstes fehlerhaftes Feld; bei Formularen mit > 3 Feldern zusätzlich Fehlerzusammenfassung oben (`role="alert"`) mit Sprunglinks.
- **Kein Datenverlust** bei Serverfehlern; Eingaben bleiben stehen.
- Autocomplete-Attribute: E-Mail `email`, Name `nickname` (Anzeigename, nicht bürgerlicher Name), Passwort `current-password` / `new-password`, Code `one-time-code`.
- WCAG 3.3.7 (Redundante Eingabe): E-Mail wird in Folgeschritten nie neu abgefragt (Code, Reset, Re-Auth: vorbelegt/angezeigt).
- WCAG 3.3.8 (Barrierefreie Authentifizierung): Einfügen in Code- und Passwortfeld erlaubt, Passwortmanager-kompatibel, kein CAPTCHA mit Rätsel (Missbrauchsschutz über Rate-Limits).

### 5.2 Feldregeln (MVP)

| Feld | Regel | Fehlertext (DE) |
|---|---|---|
| E-Mail | Format (pragmatisch: `x@y.z`), max. 254 | «Bitte gib eine gültige E-Mail-Adresse ein, z. B. name@beispiel.de.» |
| Code | genau 6 Ziffern | «Der Code hat 6 Ziffern.» / «Dieser Code stimmt nicht. Noch 3 Versuche.» |
| Anzeigename | 1–40 Zeichen nach Trim | «Bitte gib einen Namen ein.» / «Höchstens 40 Zeichen.» |
| Name doppelt in Reise | Hinweis, kein Fehler | «Es gibt schon einen Kemal in dieser Reise. Wie wäre es mit „Kemal B.“? [Übernehmen]» |
| Passwort | ≥ 10 Zeichen; Leak-Prüfung (Hinweis) | «Mindestens 10 Zeichen.» / «Dieses Passwort taucht in bekannten Datenlecks auf. Bitte wähle ein anderes.» |
| Reisename | 1–80 | «Gib deiner Reise einen Namen.» |
| Suchzeitraum Start | ≥ heute | «Der Zeitraum kann frühestens heute beginnen.» |
| Suchzeitraum Ende | > Start; Länge ≤ 12 Monate; Länge ≥ Mindestdauer + 1 Tag | «Das Ende muss nach dem Start liegen.» / «Höchstens 12 Monate.» / «Für 4 Nächte braucht der Zeitraum mindestens 5 Tage.» |
| Mindestdauer | 1–30 Nächte | «Zwischen 1 und 30 Nächten.» |
| Wunschdauer | ≥ Mindestdauer, ≤ 30 | «Mindestens so lang wie die Mindestdauer (4 Nächte).» |
| Beschreibung | ≤ 500 | Zähler ab 400: «420/500» |
| Kommentar Verfügbarkeit | ≤ 200 | Zähler ab 160 |
| Abstimmungsoptionen | 2–6, keine Duplikate | «Wähle mindestens 2 Zeiträume.» / «Diesen Zeitraum gibt es schon.» |
| Reise löschen – Name | stimmt mit Reisename überein (trim, case-insensitive) | Button bleibt inaktiv, Hilfetext «Tippe „Lissabon 2027“ zur Bestätigung.» |

## 6. Feedback: Laden, Erfolg, Fehler

| Situation | Muster |
|---|---|
| Seitenaufbau | Skelett der echten Struktur (Kartenumrisse, Kalendergitter) ab 300 ms; davor nichts (kein Flackern). Ziel: erste Ansicht < 2 s auf 4G (PRD §8). |
| Aktion < 1 s erwartet (Tage, Stimmen) | **Optimistisch**: sofort anzeigen, im Hintergrund speichern, Statustext «Gespeichert» / «Speichert …». Fehler: Rollback nur, wenn Server ablehnt; bei Netzwerkfehler lokal halten + Retry (3×, exponentiell) + Banner. |
| Aktion mit Wartezeit (Code senden, Reise anlegen, Löschen) | Button-Ladezustand (§4.1). |
| Berechnung Vorschläge | Kurz-Skelett der Liste; Ergebnis < 500 ms (F-009). |
| Erfolg kleiner Aktion | Snackbar (§4.3) oder Inline-Bestätigung. |
| Erfolg großer Meilenstein | Eigene Erfolgsansicht/-karte: Beitritt, Abgabe, Abstimmung gestartet, Termin festgelegt. Kernanimation **≤ 1 s**; nur „Es geht los!“ (F-012) mit Ausklang (Konfetti) bis **2,6 s**. Text und Tasten sind ab spätestens **300 ms** lesbar und bedienbar; jede Interaktion und `visibilitychange` beendet die Animation; nichts wiederholt sich. Bei reduzierter Bewegung (§7.5): Überblenden ≤ 140 ms bzw. sofort. (M-U2) |
| Feldfehler | Inline (§5). |
| Seitenfehler (Server 5xx) | Inline-Fehlerbereich anstelle des Inhalts: «Da ist etwas schiefgelaufen. [Neu laden]» + Hinweis, dass Daten nicht verloren sind (wo zutreffend). |
| Offline | Banner oben (unter Header), `role="status"`: «Keine Verbindung. Änderungen werden gespeichert, sobald du wieder online bist.» Aktionen, die Server brauchen (Code senden, Abstimmung starten), deaktiviert mit Hinweis. |
| Zugriff verloren (Session abgelaufen) | Weiterleitung `/login?next=…` (H.1); bei ungespeicherten Tagen: lokal halten und nach Login speichern. |
| Konflikt (z. B. Abstimmung inzwischen beendet) | Banner mit Erklärung + Neuladen-Aktion: «Lena hat den Termin inzwischen festgelegt. [Ansehen]». |

## 7. Barrierefreiheit (Ziel: WCAG 2.2 AA)

> Hinweis: Das PRD nennt WCAG 2.1 AA. Wir spezifizieren gegen **2.2 AA** (Obermenge; zusätzlich u. a. 2.4.11 Fokus nicht verdeckt, 2.5.7 Ziehbewegungen, 2.5.8 Zielgröße, 3.2.6 konsistente Hilfe, 3.3.7, 3.3.8). → PM bitte PRD §8 anpassen.

### 7.1 Allgemein
- Semantisches HTML zuerst (Buttons sind `<button>`, Links `<a>`, Überschriften-Hierarchie je Seite mit genau einer `h1`).
- `lang` am `<html>` je Sprache; fremdsprachige Einzelwörter (Umschalter «English») mit eigenem `lang`.
- **Skip-Link** «Zum Inhalt springen» als erstes Element; in Meine Tage zusätzlich «Zum Kalender» und «Zu den Werkzeugen».
- **Kontraste:** Text ≥ 4,5:1 (groß ≥ 3:1), UI-Komponenten und Zustandsgrafiken (Heatmap-Stufen gegen Nachbarn, Rahmen, Fokus) ≥ 3:1. Heatmap-Zahlen auf allen Intensitätsstufen ≥ 4,5:1 (Designer, s. abstimmung-design.md).
- **Nie nur Farbe** (1.4.1): Zustände Tag (Symbol/Muster), Heatmap (Zahl + Symbol „alle“), Stimmen (Text), Fehler (Symbol + Text).
- **Bewegung:** reduzierte Bewegung (System `prefers-reduced-motion` **oder** Konto-Schalter, §7.5) → keine Animationen außer Überblenden ≤ 140 ms; nichts blinkt; Bedienfunktionen (Auto-Scroll beim Ziehen) bleiben.
- **Textvergrößerung** 200 % und Textabstände (1.4.12) ohne Abschneiden; Labels umbrechen. **Kalender bei großer Schrift (U-5):** Umschaltung per Container-Query in `em` (nicht `px`), damit sie auf die Schriftgröße reagiert: Ist die Zelle schmaler als **3,25 em** (bei 360 px ab ca. 175 % Textgröße), wird die **Heatmap** zur **Tagesliste** (je Tag eine Zeile: Datum mit Wochentag · „4 von 5: Geht“ · Abzeichen ◐ n Zur Not / ✓ alle / Feiertag / Vorschlag n; gleiche Reihenfolge, Monatsüberschriften bleiben, Antippen/Enter öffnet das Tagesdetail, Wochenenden über „Sa./So.“ im Datum). **Meine Tage** bleibt ein Raster (Malen braucht die Fläche): Zellen wachsen in der Höhe, Symbol rutscht unter die Datumszahl, Datumszahl wird nie gekürzt. Kein manueller Umschalter im MVP. **Stand Inkrement 4 (2026-10-10):** Tagesliste der Heatmap auf „vor Go-Live“ verschoben; bis dahin gilt der Mindest-Fallback aus §12 (A2).
- **Dark Mode:** Im MVP folgt die App **nur dem System** (`prefers-color-scheme`), kein Schalter in Konto/Menü (*bestätigt (Auftraggeber 2026-10-08)*). Alle obigen Kontrastregeln gelten auch dort.

### 7.2 Zielgrößen & Fokus
- **Ziel 44 × 44 px** für alle Bedienelemente auf Touch (Kalenderzellen bei 360 px 45,7 × 52 px, bei 320 px 41 × 52 px – U-1). **Minimum 24 × 24 px** (SC 2.5.8) nur für sekundäre Inline-Elemente (z. B. Info-Icon im Fließtext) mit ausreichend Abstand.
- Gilt ausdrücklich auch für Richtung-B-Elemente: Tab-Pillen, Segment Vorschläge/Kalender, Monats-Sprung-Chips, Filter-Chips, „Erinnern“, „Anmelden“, Kachel-Tasten (abstimmung-design D-20).
- Abstand zwischen benachbarten Zielen ≥ 4 px **oder** Zellen grenzen ohne Lücke an, sind aber ≥ 44 px (Kalender).
- **Fokus sichtbar** auf allen Elementen: Fokusring ≥ 2 px, Kontrast ≥ 3:1 gegen Hintergrund **und** gegen Zellfarbe (Heatmap); `:focus-visible`. Standard `--ww-focus-ring`; in dichten Rastern (Kalender, Segmente) `--ww-focus-ring-isolated` (Hof 2 px + Ring 3 px + Hof 2 px), fokussierte Zelle `z-index: 1`. **Auf Indigo-Flächen (Cockpit, B):** weißer Ring 3 px mit 2 px Indigo-Hof – auch um die weiße aktive Tab-Pille (D-22).
- **Fokus nicht verdeckt (2.4.11):** `scroll-padding-top/bottom` = Höhe der fixierten Leisten (`--ww-sticky-bar-h`, §4.3), damit fokussierte Kalendertage nie unter Header/Werkzeugleiste liegen.
- Fokusreihenfolge = visuelle Reihenfolge. Fixierte Werkzeugleiste unten steht im DOM **vor** dem Kalender (wird zuerst erreicht) – visuelle Position unten ist zulässig, weil Skip-Links beide Ziele erreichbar machen. (Alternative bei Review-Bedenken: DOM nach Kalender + Skip-Link „Zu den Werkzeugen“.)

### 7.3 Kalender-Grid (Meine Tage, Heatmap, Mini-Kalender)

**Struktur (je Monat):**
```html
<section aria-labelledby="m-2027-05">
  <h2 id="m-2027-05">Mai 2027</h2>
  <table role="grid" aria-labelledby="m-2027-05" aria-describedby="cal-help" aria-multiselectable="false">
    <thead><tr><th scope="col" abbr="Montag">Mo</th> …</tr></thead>
    <tbody>
      <tr>
        <td role="gridcell" aria-disabled="true"><span>26</span></td>   <!-- außerhalb -->
        <td role="gridcell">
          <button tabindex="-1" data-date="2027-05-06"
            aria-label="Donnerstag, 6. Mai 2027, Feiertag Christi Himmelfahrt, geht nicht">6</button>
        </td> …
```
- Natives `<table>` mit `role="grid"`; je Zelle ein `<button>` (Klickziel). Außerhalb des Suchzeitraums/vergangen: kein Button, `aria-disabled="true"`, aber vorgelesen («nicht im Zeitraum»).
- **Ein Tab-Stopp für den gesamten Kalender** (Roving Tabindex über alle Monate hinweg): Der zuletzt fokussierte bzw. erste wählbare Tag hat `tabindex="0"`.
- **Zugänglicher Name** je Tag: Wochentag, Datum, ggf. «heute», «Wochenende», «Feiertag <Name>», Zustand. Meine Tage: «…, geht nicht». Heatmap: Muster und Beispiele in §10.2 (Zeile „Zugänglicher Name Heatmap-Zelle“), z. B. «Montag, 10. Mai 2027, 4 von 5 Geht, 1 Zur Not, Teil von Vorschlag 1» bzw. «Donnerstag, 6. Mai 2027, Feiertag Christi Himmelfahrt, 5 von 5 Geht – alle». Die sichtbare Zahl ist Teil der Beschreibung, nicht alleiniger Name.
- Zustand zusätzlich als `aria-describedby` auf eine kurze Legende (`#cal-help`: «Pfeiltasten zum Bewegen, Leertaste zum Markieren, Umschalt+Pfeil für Zeiträume»).
- **Ansagen** (eine `aria-live="polite"`-Region pro Seite): nach jeder Änderung «6. Mai: geht nicht» bzw. «3. bis 10. Mai: 8 Tage auf geht nicht gesetzt»; Rückgängig: «Rückgängig: 8 Tage zurückgesetzt».

**Tastatur – Meine Tage:**

| Taste | Wirkung |
|---|---|
| ← → | Vortag / Folgetag (über Wochen- und Monatsgrenzen) |
| ↑ ↓ | gleiche Spalte Vorwoche / Folgewoche (über Monatsgrenzen) |
| Home / End | Wochenanfang / Wochenende (gemäß Wochenstart) |
| Bild ↑ / Bild ↓ | gleicher Tag Vormonat / Folgemonat (am Rand des Zeitraums: nächster wählbarer Tag) |
| Strg/Cmd + Home / End | erster / letzter Tag des Suchzeitraums |
| Leertaste / Enter | Pinsel auf den Tag anwenden (Umschalten wie Tippen) |
| Shift + Pfeil | Bereich ab Anker erweitern (Vorschau sichtbar und angesagt: «Auswahl 3. bis 7. Mai, 5 Tage») |
| Leertaste/Enter bei aktiver Auswahl | Pinsel auf Bereich anwenden |
| Esc | Bereichsauswahl/Bereichsmodus abbrechen |
| 1 / 2 / 3 | Pinsel „Geht nicht“ / „Zur Not“ / „Geht“ (nur wenn Fokus im Kalender; im Hilfetext dokumentiert; abschaltbar nicht nötig, da nur bei Fokus aktiv – erfüllt 2.1.4) |
| Strg/Cmd + Z, Strg/Cmd + Shift + Z | Rückgängig / Wiederholen |

**Tastatur – Heatmap:** gleiche Navigation; Enter/Leertaste öffnet Tagesdetail; im Detail ← → wechselt den Tag; Esc schließt und setzt den Fokus auf den Tag zurück.

**Pinsel-Auswahl:** `role="radiogroup"` mit `aria-label="Was möchtest du markieren?"`, Optionen als `role="radio"`/native Radios, Pfeiltasten wechseln. Bereichsmodus: `<button aria-pressed>`.

**Ziehen (2.5.7):** Jede Zieh-Funktion hat eine Ein-Zeiger-Alternative ohne Ziehen: Tippen einzeln, Bereichsmodus (zwei Tipps). Bottom-Sheets haben neben Wischen immer einen Schließen-Button.

**Hilfe (3.2.6):** «Hilfe» im Footer und im Avatar-Menü an gleicher Stelle auf allen Seiten; Ziel ist die Hilfe-/FAQ-Seite `/de/hilfe` · `/en/help` (MVP-Seite, W15 – *bestätigt (Auftraggeber 2026-10-08)*).

### 7.4 Weitere ARIA-Muster
- Tabs der Reise: `<nav aria-label="Reise">` mit Links, `aria-current="page"`.
- Segment Vorschläge/Kalender: zwei Links/Buttons mit `aria-pressed` bzw. `aria-current`, da URL-wirksam.
- Abstimmen Ja/Vielleicht/Nein: Radiogruppe je Option, `aria-labelledby` = Zeitraum der Option; unbestätigter Vorschlag: Radio **nicht** ausgewählt, Beschreibung «Vorschlag: Nein – aus deinen Tagen». Unter 400 px Viewport-Breite Icon **über** Label, Segmenthöhe 56 px (U-8). Rang-Abzeichen nur für Platz 1 (bei Gleichstand alle Erstplatzierten): «Platz 1» / «Top choice» (U-9).
- Fortschritt: `<progress>` mit sichtbarem Text «5 von 7».
- Phasen-Chip: Text, kein reines Icon.
- Snackbar `role="status"`; kritische Fehler `role="alert"`.
- Bilder: Illustrationen in Leerzuständen dekorativ (`alt=""`); informative Icons ohne Text bekommen `aria-label` (z. B. Kommentar-Symbol «Kommentar von Kemal»).

### 7.5 Bewegung, Feier & Haptik (F-052, Q17)
Motion-Details: `docs/motion/interaktionen.md`. UX-Regeln:

**Schalter „Bewegung reduzieren“ (W13, Karte „Darstellung“)**
- Echter Schalter `<button role="switch" aria-checked>` mit sichtbarem Label, Standard **aus = folgt dem Gerät**. An = reduzierte Bewegung unabhängig vom Gerät. Kann Bewegung nur reduzieren.
- Speichert **sofort** (wie „Sprache & Region“, Snackbar «Gespeichert»), im Konto (geräteübergreifend) und im Cookie `ww-motion` auf diesem Gerät (Wert `reduce`; der Server setzt `data-motion` schon im ersten HTML – erster Frame nach dem Laden korrekt, auch nach Abmelden auf diesem Gerät). *(Korrigiert 2026-10-09: vorher `localStorage`; Cookie ist gleichwertig und wirkt schon serverseitig – Hinweis Review Inkrement 1, Freigabe CEO.)* Wirkt ohne Neuladen über `data-motion="reduce"` am `<html>`.
- **Gerät meldet bereits „reduzieren“:** Schalter wird **an** angezeigt und ist nicht bedienbar (`aria-disabled="true"`), Grund steht darunter (Regel §1.4). Nicht angemeldet: Gerät bzw. die im Cookie `ww-motion` gespeicherte Wahl.
- Texte: Label «Bewegung reduzieren» / «Reduce motion» · Hilfetext «Weniger Animationen, kein Konfetti, keine Vibration. Inhalte blenden nur noch sanft ein.» / «Fewer animations, no confetti, no vibration. Content simply fades in.» · Zustand aus: «Aus: Wir richten uns nach der Einstellung deines Geräts.» / «Off: we follow your device setting.» · Gerät reduziert: «Ist an, weil dein Gerät Bewegung reduziert. Ändern kannst du das in den Einstellungen deines Geräts.» / «On because your device reduces motion. You can change this in your device settings.»
- **Wirkung:** keine Skalierung, kein Gleiten, kein Konfetti, keine Wellen/Staffeln, kein Wackeln (Code-Feld), kein Smooth-Scroll (Sprung), kein blinkender Caret, keine Geste-Animation (statische Skizze), **keine Vibration**. Unverändert: Zustände, Texte, Fokus, Auto-Scroll beim Ziehen, Ladezustände.

**Feier „Es geht los!“ (F-012)**
- Orga: sofort nach `[Termin festlegen]` (Fokus §4.2). Mitglieder: beim **ersten Öffnen der Übersicht** nach der Festlegung (Standard-Tab in Phase 3). Öffnet jemand direkt einen anderen Tab, steht dort ein Banner «Der Termin steht fest! [Ansehen]» → Übersicht → Feier. Konflikt-Banner (W14) ebenso.
- **Einmal pro Person und Festlegung**, serverseitig je Mitgliedschaft gemerkt (geräteübergreifend); der Merker wird gesetzt, sobald die Feier sichtbar startet (`visibilityState = visible`). Spätere Besuche: Ergebnis-Karte statisch. Neue Festlegung mit **anderem** Zeitraum → erneut; gleicher Zeitraum → nicht. Wer in Phase 3 beitritt, sieht sie einmal.
- Kein Fokus-Sprung bei Mitgliedern (normaler Seitenaufruf). Konfetti-Ebene `aria-hidden`, `pointer-events: none`, beendet bei Tipp/Scroll/Taste.
- Countdown steht als **Text** in der Ergebnis-Karte (W11), Ring ist Dekoration.

**Vibration (Haptik)**
- Nur zwei Stellen: (1) Ziehen startet nach 300 ms Halten (Meine Tage, B.2) – 10 ms; (2) Ring/Siegel der Feier schließt sich – kurzes Muster (≈ 12-40-12 ms).
- Nur mit `navigator.vibrate` (praktisch Android); iOS nie. **Best effort:** Fehler/fehlende Nutzer-Aktivierung still ignorieren (beim Öffnen per Chat-Link vibriert die Mitglieder-Feier daher oft nicht – gewollt). Aus bei reduzierter Bewegung. Nie Töne. Nie einzige Rückmeldung (es gibt immer eine sichtbare).

## 8. Interaktions-Details nach Ansicht (Kurzreferenz)

| Ansicht | Kernregeln | Flow |
|---|---|---|
| Einladung | Ein URL-Zustandsautomat, Kontext-Karte immer sichtbar, `pendingAuth` | A |
| Meine Tage | Pinsel, Tippen = Umschalten, Ziehen = Datumsbereich, Bereichsmodus, Undo, Autosave, Abgabe | B |
| Gruppe | Vorschläge zuerst (mobil), Kennzahl-Box im Kopf, lokale Filter, Vorschlag-Leiste im Kalender (§4.11), Tagesdetail mit Tag-für-Tag-Navigation | C |
| Abstimmen | Vorbelegung bestätigen, Sofortspeichern, Ergebnisse erst nach eigener Stimme (Orga sieht immer alles; *bestätigt (Auftraggeber 2026-10-08)*) | D |
| Meine Reisen | To-dos zuerst, Karten mit Phase + Fortschritt | E |

**Zeit & Datum:** Alle Tage sind Kalendertage in der Zeitzone der Reise (PRD §8); die UI zeigt nie Uhrzeiten, außer «zuletzt geändert 14:32» (lokale Zeit des Betrachters).

**Zeitraum-Schreibweise:** Anreise–Abreise mit Halbgeviertstrich, Nächte explizit: «Mi., 5. Mai – Mo., 10. Mai · 5 Nächte». Gleicher Monat kurz: «5.–10. Mai». Jahr nur, wenn nicht das aktuelle Jahr oder wenn der Zeitraum den Jahreswechsel kreuzt.

## 9. Internationalisierung (F-046)

- Sprache und Region getrennt (Flow F). Formate über `Intl.DateTimeFormat` mit Konto-Region (`de-DE`, `de-AT`, `de-CH`, `en-GB`, `en-US`).
- **Wochenstart:** Region (Mo für DE/AT/CH/GB, So für US), überschreibbar im Konto. Wochenende = Sa+So immer (alle unterstützten Regionen).
- **Text-Expansion:** Layouts für **DE + 30 %** auslegen (DE ist in der Regel die längere Sprache; EN-Strings können in Einzelfällen länger sein, z. B. „If needed“ vs. „Zur Not“). Keine fixen Breiten für Texte; Buttons dürfen unter 600 px auf zwei Zeilen umbrechen, außer Kalenderzellen und Tabs (dort Zeichenbudget §10.4).
- Pluralformen über ICU MessageFormat («{count, plural, one {# Nacht} other {# Nächte}}»).
- Namen (nutzergeneriert) nie übersetzen, nie kürzen ohne Tooltip/Volltext im Detail.
- **Produktname je Sprache** (Auftraggeber 2026-10-08): DE „Wir wollen weg“, EN „When do we go?“; die Bildmarke (Logo A) ist sprachneutral. Schreibregeln §10.6.
  - **Sprachwechsel:** Schaltet jemand die Oberflächensprache um, wechselt der angezeigte Produktname überall mit – Wortmarke im Header, `<title>`, Footer, Hilfe-/Rechtstexte, Leer- und Systemzustände. Kein Mischbetrieb: eine DE-Oberfläche zeigt nie „When do we go?“ und umgekehrt (einzige Ausnahme: Impressum/Datenschutz nennen einmalig beide Namen, damit klar ist, dass es derselbe Dienst ist – «Wir wollen weg (englisch: „When do we go?“)» / «When do we go? (German: “Wir wollen weg”)»).
  - **Teilen-Texte:** Name in der Sprache des **Senders** bzw. der im Sheet gewählten Textsprache – nie in der (unbekannten) Sprache der Empfänger. Die Empfänger sehen nach dem Öffnen des Links die Oberfläche in ihrer eigenen Sprache, ggf. also den anderen Namen; die gleiche Bildmarke stellt den Wiedererkennungswert sicher.
  - **Mails:** Name (inkl. Absendername) in der Mailsprache (Flow F.3). **Open-Graph-Vorschau** `/i/{token}`: `og:site_name` und Name im `og:title` in der Sprache der Reise-Anlage (sitemap §4).
- Teilen-Texte: Sprache des Teilenden, umschaltbar im Sheet; Daten im Teilen-Text im Format der **gewählten Textsprache** (de → `de-DE`-Format bzw. Region des Teilenden, wenn deutschsprachig; en → `en-GB`, außer Teilender hat `en-US`).

## 10. Copy-Richtlinien DE/EN

### 10.1 Ton
- **Deutsch: Du-Form**, locker, freundlich, knapp – wie eine gut organisierte Freundin im Gruppenchat. Keine Ausrufezeichen-Ketten, kein Marketing-Sprech, keine Ironie in Fehlermeldungen.
- **Englisch: „you“, casual**, britische Schreibweise als Basis (`en`), US-Datumsformat nur über Region. Keine wörtliche Übersetzung – idiomatisch formulieren.
- **Geschlechtergerecht ohne Sonderzeichen:** umformulieren statt gendern («organisiert von Lena», Rollenabzeichen «Orga»). Rollenbezeichnungen: DE «Orga» / EN «Organizer».
- Aktiv, Gegenwart, Ergebnis zuerst: «Deine Tage sind drin.» statt «Die Verfügbarkeit wurde erfolgreich gespeichert.»
- Zahlen als Ziffern; Datum immer mit Wochentag in Zeitraum-Angaben.
- Keine Emojis in UI-Texten im MVP (Darstellung in In-App-Browsern/Screenreadern uneinheitlich); in Teilen-Texten optional, Entscheidung beim Designer/PM (Vorschlag unten ohne Emojis).

### 10.2 Glossar (verbindlich)

| Konzept | DE | EN |
|---|---|---|
| Produktname | Wir wollen weg · Untertitel (optional) „Gemeinsam den Urlaubstermin finden“ | **When do we go?** (eigener Name, keine Übersetzung von „Wir wollen weg“) · Untertitel (optional) „Find dates for your group trip“ – *bestätigt (Auftraggeber 2026-10-08)*; Schreibregeln §10.6 |
| Reise | Reise | Trip |
| Suchzeitraum | Zeitraum (für die Suche) | Date range |
| Mindestdauer / Wunschdauer | mindestens … Nächte / am liebsten … Nächte | at least … nights / ideally … nights |
| „können“ (nur in Vorschlägen/Optionen, F-009/F-010) | kann = hat im Zeitraum kein „Geht nicht“ («8 können · ohne Kemal») | can («8 can · without Kemal») |
| Tageszustand geht | Geht | Works |
| ginge zur Not | Zur Not | If needed |
| geht nicht | Geht nicht | Can't |
| abgeben (Verfügbarkeit) | Tage abgeben / eintragen | Submit dates / add your dates |
| Heatmap | Kalender (der Gruppe) | Group calendar |
| Kandidaten | Vorschläge | Suggestions |
| Vorschlagsgruppen (F-009: niemand bzw. 1–k Personen mit „Geht nicht“) | **Alle dabei** / **Fast alle dabei** | **Everyone's in** / **Almost everyone's in** |
| ✓-Abzeichen Heatmap (alle Abgegebenen haben „Geht“, x = n) | Alle: Geht | Everyone: works |
| ◐-Hinweis Heatmap (mind. 1 × „Zur Not“) | Zur Not | If needed |
| Heatmap-Zählwert (Zelle, Tagesdetail) | „4/5“ · Kopf „4 von 5: Geht“ | „4/5“ · “4 of 5: works” |
| Zugänglicher Name Heatmap-Zelle | «<Datum>[, heute][, Feiertag <Name>], x von n Geht[, k Zur Not][, nicht: <Namen ≤ 3> \| m können nicht][, Teil von Vorschlag i]»; bei x = n «x von n Geht – alle» | «<date>[, today][, holiday <name>], x of n works[, k if needed][, can't: <names> \| m can't][, part of suggestion i]»; x = n: «x of n works – everyone» |
| Tagesdetail-Zusammenfassung | x = n: «Alle: Geht» · kein „Geht nicht“, aber Zur Not: «Alle dabei – k nur zur Not» · sonst «Nicht: Jonas» | «Everyone: works» · «Everyone's in – k only if needed» · «Can't: Jonas» |
| Zusatz-Chips Vorschlagskarte | «◐ 2× zur Not» · «✕ ohne Jonas» · «inkl. Pfingstmontag» | «◐ 2× if needed» · «✕ without Jonas» · «incl. Whit Monday» |
| Abstimmung | Abstimmung / abstimmen | Vote / voting |
| Ja / Vielleicht / Nein | Ja / Vielleicht / Nein | Yes / Maybe / No |
| festlegen | Termin festlegen | Lock in dates |
| Organisator (Rolle) | Orga | Organizer – *bestätigt (Auftraggeber 2026-10-08)* |
| Rang-Abzeichen Abstimmung | Platz 1 | Top choice |
| Phasenzeile im Reise-Kopf (B) | Tage sammeln · 5/7 fertig · Abstimmung läuft · 4/7 fertig · Steht fest · 7 dabei | Collecting dates · 5/7 done · Voting open · 4/7 done · It's on · 7 going |
| Kennzahl-Box Gruppe (B) | 5 von 7 haben eingetragen · Alle haben eingetragen. (bis 2026-10-20: „abgegeben“, §14) | 5 of 7 have added their dates · Everyone has added their dates. |
| Personen-Status (§14.2) | Fehlt noch · Eingetragen · Abgestimmt · noch nicht eingetragen · noch nicht beigetreten · Erinnern · Alle erinnern | Still missing · Dates added · Voted · no dates yet · hasn't joined yet · Remind · Remind all |
| Kennzahl-Kacheln Abstimmen (B) | noch 3 Tage / bis Do., 15. April · 4 von 7 / haben abgestimmt · Frist abgelaufen | 3 days left / until Thu, 15 April · 4 of 7 / have voted · Deadline passed |
| Countdown Ergebnis | noch 23 Tage · noch 1 Tag · Heute geht's los! · Gute Reise! | 23 days to go · 1 day to go · It's today! · Have a great trip! |
| Konto-Abschnitt / Schalter | Darstellung · Bewegung reduzieren | Appearance · Reduce motion |
| Mitglied | Mitglied | Member |
| Platzhalter | Platzhalter („fehlt noch“) | Placeholder („not joined yet“) |
| Einladungslink | Einladungslink | Invite link |
| Konto | Konto | Account |
| Code | Code | Code |
| Urlaubstage | Urlaubstage | Days off |

### 10.3 Teilen-Texte (F-002, F-010, F-012, F-015) – Standardfassungen

Platzhalter: `{trip}` Reisename, `{orga}` Vorname Orga, `{link}`, `{deadline}` Frist, `{names}` Liste, `{range}` Zeitraum mit Wochentagen, `{nights}`.

**Einladung (F-002)**
- DE: «Wir wollen weg: {trip}! Trag bis {deadline} ein, wann du kannst – dauert 2 Minuten: {link}»
  - ohne Frist: «Wir wollen weg: {trip}! Trag ein, wann du kannst – dauert 2 Minuten: {link}»
- EN: «When do we go? {trip} – add your dates by {deadline}, takes 2 minutes: {link}»
  - ohne Frist: «When do we go? {trip} – add the dates that work for you, takes 2 minutes: {link}»
  - Begründung: Der Produktname ist selbst die Frage, um die es geht, und steht wie im DE-Text („Wir wollen weg: …“) als Einstieg – gleiche Wiedererkennung wie Bildmarke/Link-Vorschau. Das Fragezeichen schließt den ersten Satz ab; danach folgt kein weiteres Satzzeichen (§10.6). „We want to get away“ entfällt (wirkte wie eine Übersetzung des DE-Namens und hätte einen dritten Namen eingeführt).

**Abstimmung gestartet (F-010)**
- DE: «Abstimmung für {trip} läuft! Es gibt {count} Vorschläge – stimm bis {deadline} ab: {link}»
- EN: «Voting for {trip} is open! {count} options to choose from – vote by {deadline}: {link}»
- ohne Frist (F-017 ist optional): DE «Abstimmung für {trip} läuft! Es gibt {count} Vorschläge – stimm jetzt ab: {link}» · EN «Voting for {trip} is open! {count} options to choose from – vote now: {link}» (ergänzt 2026-10-10, Inkrement 5). `{count}` = aktuelle Anzahl der Optionen beim Teilen (nach „Option hinzufügen“ also die neue Zahl).

**Erinnerung Tage (F-015)**
- DE: «{names}, ihr fehlt noch bei {trip}! Tragt kurz eure Tage ein, dann können wir planen: {link}» (eine Person: «{name}, du fehlst noch bei {trip}! Trag kurz deine Tage ein: {link}»)
- EN: «{names}, we're still missing your dates for {trip}! Add them quickly so we can plan: {link}» (one: «{name}, we're still missing your dates for {trip}: {link}»)

**Erinnerung Abstimmung (F-015, Phase 2)**
- DE: «{names}, eure Stimme fehlt noch bei {trip}: {link}»
- EN: «{names}, we still need your vote for {trip}: {link}»

**Erinnerung einzelner Personen, „{Orga} Bescheid geben“, Platzhalter-Hinweis (§14.1, §14.2)** – die verbindlichen Fassungen stehen in §14; die Sammel-Texte oben gelten für den Schritt „Alle erinnern“. Link bei Mitgliedern: Phase 1 `/trips/{id}/days`, Phase 2 `/trips/{id}/poll`.

**Ergebnis (F-012)**
- DE: «Fix! {trip}: {range} ({nights} Nächte). Termin in den Kalender: {link}»
- EN: «It's on! {trip}: {range} ({nights} nights). Add it to your calendar: {link}»

Regeln: `{names}` als «Kemal, Sara und Jonas» / «Kemal, Sara and Jonas»; ab 5 Namen «Kemal, Sara, Jonas und 3 weitere». Kein `@` vor Namen (F-015 schlägt „@Kemal“ vor; in WhatsApp-Web-Links erzeugt `@` keine echte Erwähnung, wirkt daher falsch) – *Abweichung, PM bitte bestätigen.* Text ≤ 300 Zeichen inkl. Link (WhatsApp-Vorschau bleibt lesbar).

### 10.4 Längenbudgets (Zeichen, DE und EN müssen beide passen)

| Element | Budget | Beispiel DE / EN |
|---|---|---|
| Tab-Label der Reise | ≤ 11 | „Meine Tage“ / „My dates“ |
| Pinsel-Label | ≤ 10 | „Geht nicht“ / „Can't“ |
| Primärbutton mobil | ≤ 22 | „Fertig – abgeben“ / „Done – submit“ |
| Phasen-Chip | ≤ 22 (+ Datum) | „Abstimmung läuft“ / „Voting open“ |
| Phasenzeile Reise-Kopf (B) | ≤ 30, Umbruch statt Kürzen | „Abstimmung läuft · 4/7 fertig“ / „Voting open · 4/7 done“ |
| Kennzahl-Kachel (B) | Zahl ≤ 12 + Zeile ≤ 22, 2 Zeilen | „noch 3 Tage“ / „bis Do., 15. April“ |
| „So geht's“-Kacheltitel W01 (B) | ≤ 32, max. 3 Zeilen | „2 · Alle tippen ihre freien Tage“ |
| Kalenderzelle | nur Ziffern/Symbole | – |
| Snackbar | ≤ 60 + Aktion ≤ 12 | „8 Tage auf ‚geht nicht‘ gesetzt“ · „Rückgängig“ / „Undo“ |
| Überschrift h1 mobil | ≤ 28 je Zeile, max. 2 Zeilen | – |
| Reisename (Nutzer) | bis 80; Anzeige gekürzt mit „…“ in Header (1 Zeile), Karten (2 Zeilen), vollständig auf Übersicht | – |
| Anzeigename (Nutzer) | bis 40; Listen 1 Zeile mit „…“ und Volltext in Detail | – |

### 10.5 Transaktionsmails (Kurzfassung für Operations/Developer)
- Betreff DE: «{code} ist dein Code für Wir wollen weg» · EN: «{code} – your code for When do we go?» (Code im Betreff zuerst → sichtbar in Mitteilungs-Vorschau, kein App-Wechsel nötig; EN-Name am Ende, damit sein Fragezeichen den Betreff abschließt und kein „?“ mitten im Satz steht).
- Absendername: «Wir wollen weg» bzw. «When do we go?» je Mailsprache (im Header als quoted-string kodieren). Grußzeile am Mailende: «– Wir wollen weg» / «– When do we go?».
- Body: Code groß und als erstes; darunter «Oder tippe hier, um dich anzumelden: [Anmelden]»; Hinweis «Gültig für 15 Minuten. Du hast das nicht angefordert? Dann ignoriere diese Mail.» Im Einladungskontext erste Zeile: «Du trittst „{trip}“ bei.» Keine Tracking-Links (F-042).
- Plain-Text-Teil enthält Code in eigener Zeile (für OS-Code-Erkennung).

### 10.6 Produktname – Schreibregeln (DE „Wir wollen weg“ · EN „When do we go?“)

Bestätigt vom Auftraggeber 2026-10-08. Gilt für UI, Titel, Mails, Teilen-Texte, OG-Daten, Hilfe- und Rechtstexte.

1. **Schreibweise exakt:** „Wir wollen weg“ (ohne Satzzeichen) · „When do we go?“ (nur W groß, **Fragezeichen gehört immer zum Namen** – auch in Wortmarke, Titel, Absender, OG). Nicht: „When Do We Go?“, „When do we go“, „WhenDoWeGo“. Ohne „?“ nur in technischen Kennungen (Domain, Dateinamen, IDs, Slugs) – nie in sichtbaren Texten.
2. **Bevorzugte Position des EN-Namens: allein oder am Ende** – Wortmarke, Titelende («My dates · Lisbon 2027 · When do we go?»), Betreffende, Grußzeile, Satzanfang als eigener Fragesatz (Teilen-Texte). Trenner in Titeln ist « · » bzw. « – », nie ein Satzzeichen.
3. **Kein doppeltes Satzzeichen:** Nach „When do we go?“ folgt nie „.“, „!“, „,“, „:“ oder ein weiteres „?“. Würde ein Satz nach dem Namen weitergehen, umformulieren:
   - ✗ «Welcome to When do we go?!» → ✓ «Welcome to When do we go?»
   - ✗ «When do we go? is free to use.» → ✓ «It's free to use.» / «The app is free.»
   - ✗ «Thanks for using When do we go?.» → ✓ «Thanks for planning with us.»
   - ✗ «When do we go?'s privacy policy» → ✓ «Privacy policy · When do we go?» bzw. «our privacy policy»
4. **Im Fließtext sparsam:** In UI-Sätzen statt des Namens „the app“ / „we“ / „us“ verwenden (die Wortmarke ist ohnehin sichtbar). Wo der Name mitten im Satz unvermeidbar ist (Rechtstexte), in typografische Anführungszeichen setzen: «This service (“When do we go?”) is operated by …» – so ist klar, dass das Fragezeichen zum Namen gehört.
5. **Grammatik EN:** Singular, Pronomen „it“; kein Artikel („When do we go?“, nicht „the When do we go?“); kein Genitiv-’s.
6. **DE:** „Wir wollen weg“ im Fließtext ohne Anführungszeichen, wenn eindeutig (Titel, Betreff, Absender); in Sätzen, in denen er als Satzteil missverstanden werden könnte, mit „…“ («Mit „Wir wollen weg“ findet ihr …») oder umformulieren. Der DE-Teilen-Einstieg «Wir wollen weg: {trip}!» ist gewollt doppeldeutig (Name und Aussage) und bleibt.
7. **Barrierefreiheit:** Zugänglicher Name des Logo-Links = nur Produktname der aktuellen Sprache («Wir wollen weg» / «When do we go?»; Ziel ergibt sich aus dem Link). Bildmarke selbst `alt=""` neben Text-Wortmarke. Screenreader lesen das „?“ als Frageintonation – gewollt.
8. **Längen:** Beide Namen 14 Zeichen – Header-Layouts (Wortmarke + Sprachlink + „Anmelden“/„Sign in“ bei 360 px) passen in beiden Sprachen ohne Sonderregel.
9. **Kein Mischbetrieb** und Sprachwechsel: s. §9.

## 11. Datenschutz in der Oberfläche
- Einladungs-Vorschau zeigt nie Namen außer Orga-Vorname (F-003) – auch keine Initialen in Avatar-Reihen (Reisekarte B: neutrale Punkte + „+1“).
- Hinweis Datenschutz/Nutzungsbedingungen als Satz unter dem Namensfeld bzw. E-Mail-Feld: «Mit dem Fortfahren akzeptierst du die [Nutzungsbedingungen] und hast den [Datenschutzhinweis] gelesen.» – Links öffnen in neuem Tab (Flow bleibt erhalten).
- Kommentar-Feld: Hinweis «Alle in der Reise können das lesen.»
- Keine Tracker, kein Cookie-Banner (F-013); Sprache-Cookie ist technisch notwendig.

## 12. Abweichungen Inkrement 4 – UX-Bewertung (2026-10-10)
Bewertung der vom Developer gemeldeten Abweichungen (Commit d31c977). Diese Festlegungen gehen den älteren Angaben in user-flows.md (B.1, D) und W08/W09 vor.

**A1 – R-049 Meine Tage auf 360 × 640: OK.**
- Legende „So funktioniert’s“ startet immer eingeklappt (statt „offen bis zur 1. Abgabe“, Flow B.1). Tragfähig, weil die Kernregel «Nicht markierte Tage zählen als ‚Geht‘» im Entwurfs-Hinweis steht und die Pinsel sichtbare Text-Labels tragen; das Zeitraum-Icon hat `aria-label` + Tooltip.
- „Feiertage für: …“ in der Legende: OK (seltene Einstellung; Feiertage selbst bleiben im Kalender sichtbar).
- Willkommens-Hinweis (nur einmal nach Beitritt, schließbar, erklärt das Malen) darf die erste Woche unter die Falz schieben.

**A2 – W09-Abweichungen: OK, eine Ausnahme mit Mindest-Anpassung.**
- Tagesdetail ab 960 px als Dialog statt Seitenpanel: OK (Fokusführung wie §4.2, Rückfokus auf die Zelle).
- Wischen im Sheet, Label über der Startzelle des Vorschlags, Hover-Vorschau (MVP+): OK – Band/Abzeichen und zugänglicher Name «Teil von Vorschlag n» tragen die Information.
- FLIP beim Filtern → gestaffeltes Einblenden: OK (ruhiger, reduced-motion-tauglich).
- Kommentar im Tagesdetail direkt als Text statt hinter Icon: OK, sogar besser (ein Tipp weniger). Lange Kommentare umbrechen, nicht abschneiden.
- Legende der Gruppe auch ab 960 px aufklappbar, Zustand per Cookie: OK (abweichend von U-6), da Standard beim ersten Besuch „offen“. Cookie ist reine UI-Einstellung (kein Banner nötig, wie Sprache/Motion).
- **U-5 Tagesliste bei großer Schrift: für das MVP-Inkrement nicht zwingend, vor Go-Live (WCAG-Prüfung) nachziehen.** Begründung: Standardansicht der Gruppe sind die Vorschläge (eine Liste, skaliert sauber); jede Zelle hat einen vollständigen zugänglichen Namen und öffnet das Tagesdetail mit allen Werten; ein Kalender-Raster fällt bei Reflow (1.4.10) unter die Ausnahme „zweidimensionales Layout“. **Mindest-Fallback (vor Merge prüfen, 360 px, 200 % Text):** Zellinhalte dürfen nicht überlappen oder in Nachbarzellen ragen. Wird die Zelle zu schmal (< 3,25 em), Nebeninfos ausblenden (◐-Zahl, Pegel), Datum + Zählung „x/n“ behalten; passt auch das nicht, Datum + Stufe (Farbe/Muster) + ✓/◐ – die Zählung steht dann im Tagesdetail. Abschneiden ohne Ersatz ist nicht zulässig.

**A3 – Filter „Dauer“: OK mit Anpassung (nicht blockierend).**
- Dauer = Wunschlänge (Standard = Wunschdauer der Reise), Mindestdauer = min(Reise-Minimum, Dauer) – logisch und deckt sich mit der Karte «bis zu n Nächte».
- Anpassung: Wählt jemand eine Dauer unter dem Reise-Minimum, unter dem Filter einen Hinweis zeigen: «Kürzer als die Orga-Vorgabe (mind. n Nächte).» Gehört in die Filterzeile, nicht in einen Dialog.

**A4 – Q20 Platzhalter im Fortschritt: OK** (Auftraggeber-Entscheidung).
- „3 von 9 · Noch offen: …, Mia, Tom“ – Platzhalter erscheinen wie Personen in „Noch offen“; das erklärt zugleich, warum „Abstimmung starten“ noch fehlt.
- Orga-Aufgabe erst, wenn alle Platzhalter beigetreten oder entfernt sind: OK; die Orga ist nicht blockiert („Abstimmung erstellen“ in den Vorschlägen bleibt nutzbar).
- Anpassung (nicht blockierend, spätestens mit F-015 „Erinnern“): Für die Orga neben „Noch offen“ ein Link «Platzhalter verwalten» bzw. „Link teilen“, solange offene Platzhalter existieren.

## 13. Abweichungen Inkrement 5 – UX-Bewertung (2026-10-10)
Bewertung der vom Developer gemeldeten Abweichungen (Commit e8f645f, F-010/F-011/F-012/F-017). Diese Festlegungen gehen den älteren Angaben in user-flows.md (D.1–D.3), W10, W11 und §4.2 vor. Keine der Abweichungen blockiert den Merge.

**B1 – „Eigener Zeitraum“ / „Option hinzufügen“ mit zwei nativen Datumsfeldern statt Mini-Kalender: OK.**
- Entspricht §4.7 (native Datumsfelder), ist per Tastatur/Screenreader robuster als ein eigenes Raster und erfüllt WCAG 2.5.7 ohne Zusatzmodus. Die Live-Zusammenfassung «… · n Nächte · ⚠ Lena, Paul können nicht» (`role=status`, Warnung Amber + Icon) trägt die entscheidende Information der Heatmap-Färbung.
- Voraussetzung (erfüllt): `min`/`max` auf Suchzeitraum bzw. heute; da einige Browser `min`/`max` im Picker ignorieren, prüft die Zusammenfassung trotzdem (zu kurz, außerhalb, doppelt) und `[Hinzufügen]` meldet den Fehler am Feld.
- Mini-Kalender mit Heatmap-Färbung (Sheet) und Mini-Heatmap rechts am Desktop (W10) → **MVP+**. Bis dahin genügt der Tab „Gruppe“ zur Orientierung.

**B2 – Fokus nach „Termin festlegen“ über Weiterleitung (`?fixed=1`) statt im selben Ereignis: OK.**
- Ziel von M-U10 ist, dass der Fokus nicht verloren geht und **vor** der Feier auf h1 «Es geht los!» landet. Das ist erfüllt, wenn: Fokus beim ersten Rendern (vor Start der Animation) gesetzt wird, nur für die Orga, `?fixed=1` danach aus der URL entfernt wird (kein erneuter Fokus bei Reload/Zurück) und der Seitentitel auf die Übersicht wechselt. Laut Code umgesetzt – Reviewer bitte mit Screenreader/Tastatur gegenprüfen (Fokus darf nicht zuerst auf `body` bzw. dem Kopf landen und dann springen).
- §4.2 „im selben Ereignis“ gilt damit als „beim ersten Rendern der Zielseite“.

**B3 – „Wer hat wie gestimmt?“ auch am Desktop als aufklappbare Liste pro Option statt Tabelle: OK.**
- Eine Liste pro Karte ist leichter zu lesen als eine Matrix bei bis zu 6 Optionen × 20 Personen und reflowt bei großer Schrift. Bedingungen: Gruppierung nach Ja / Vielleicht / Nein mit Text-Label (nicht nur Farbe/Icon), Zähler in der Gruppenüberschrift, `aria-expanded` am Auslöser.
- Abweichung von W10 „Desktop standardmäßig aufgeklappt“: zugeklappt ist zulässig; die Balken mit Zahlen zeigen das Wesentliche. Personen-mal-Option-Tabelle → MVP+ (nur falls Orgas sie vermissen).

**B4 – Frist ohne Pulsieren; „Gruppe erinnern“ (F-015) fehlt: OK.**
- Kein Pulsieren ist ruhiger und vermeidet Diskussionen zu WCAG 2.2.2; die Kachel «noch 3 Tage» bzw. «Frist abgelaufen» + Warn-Icon reicht. Motion Designer informieren (keine Pflicht-Animation).
- „Erinnern“ kommt mit Inkrement 7 (CEO-Entscheidung). Bis dahin: Orga-Button „Abstimmung teilen“ im Tab Abstimmen (vorhanden) ist der Ersatz; im Sheet «Wer hat abgestimmt?» entfällt `[Erinnern]` ersatzlos, keine deaktivierte Attrappe.

**B5 – Optionen müssen ≥ Mindestnächte der Reise haben; kürzere vorgewählte Vorschläge werden beim Erstellen ignoriert: OK mit Anpassung (nicht blockierend).**
- Die Regel selbst ist richtig (die Orga hat die Mindestdauer festgelegt; Fehlertext am Stepper/Sheet «Mindestens n Nächte, wie für diese Reise festgelegt.» ist klar).
- Anpassung: Stilles Verwerfen ist nicht zulässig. Wurden Vorschläge aus der Liste (z. B. nach lokalem Dauer-Filter unter dem Minimum, §12 A3) nicht übernommen, oben auf „Abstimmung erstellen“ einen Hinweis (Info, nicht Fehler) zeigen: DE «1 gewählter Vorschlag ist kürzer als 4 Nächte und wurde nicht übernommen.» / «2 gewählte Vorschläge sind kürzer als 4 Nächte …» · EN «1 selected option is shorter than 4 nights and wasn't added.» / «2 selected options are shorter …». Zusammen mit dem A3-Hinweis umsetzen, spätestens vor Go-Live.

**B6 – „Platz 1“ sehen Mitglieder erst, wenn sie alle Ergebnisse sehen dürfen: OK.**
- Folgerichtig zur bestätigten Regel „Ergebnis erst nach eigener Stimme“ (D.2 #5): Ein Rang-Abzeichen verrät indirekt das Ergebnis noch nicht bewerteter Optionen und würde den Mitläufer-Effekt wieder einführen. Präzisierung: Mitglieder sehen „Platz 1“ erst, wenn sie **zu allen Optionen** bestätigt abgestimmt haben; die Orga immer. Gilt sinngemäß für die Rang-Sortierung (M-U3).

**B7 – Teilen-Text ohne Frist: OK.** In §10.3 ergänzt (DE «… – stimm jetzt ab: {link}», EN «… – vote now: {link}»). Länge ≤ 300 Zeichen eingehalten.

**B8 – Mini-Vorfreude-Ring in „Meine Reisen“ (W04-03) nicht gebaut: OK.** War als MVP+ markiert; die Karte zeigt Phase „Steht fest“ und Datum. Nachziehen nach MVP.

**B9 – „Option hinzufügen“ nach dem Start setzt den Status „abgestimmt“ aller zurück: OK mit Anpassung (nicht blockierend).**
- Folgerichtig zu D.2 #4 („abgestimmt“ erst, wenn **alle** Optionen bestätigt sind) – sonst wäre die Fortschrittsanzeige falsch und die Orga würde zu früh festlegen.
- Anpassung (reine Copy, vor Go-Live): Die Folge muss die Orga **vor** dem Hinzufügen kennen. Hinweis im Sheet ergänzen: DE «Bestehende Optionen bleiben unverändert, damit abgegebene Stimmen gültig bleiben. Alle müssen die neue Option noch bewerten – wer schon fertig war, steht wieder auf ‚offen‘.» · EN «Existing options stay as they are so votes remain valid. Everyone still needs to rate the new option – people who were done will show as ‘open’ again.» Nach dem Hinzufügen Snackbar «Option hinzugefügt. Teil es der Gruppe, damit alle sie bewerten. [Teilen]» (Teilen-Sheet mit aktuellem `{count}`).
- Mitglieder: Die neue Karte steht am Ende (Erstellungsreihenfolge), die Statuszeile zeigt wieder «Noch 1 Option offen». Optional (MVP+) Chip „Neu“ auf der Karte bis zur eigenen Stimme.

### 13.1 Offene Produktfragen des Developers – UX-Empfehlung (Entscheidung CEO/PM)

**(a) Laufende Abstimmung abbrechen (zurück zu „Tage sammeln“)? Empfehlung: Ja, nur Orga – nicht blockierend für Inkrement 5, spätestens mit Inkrement 6/7.**
- Grund: Optionen lassen sich nach dem Start weder ändern noch löschen (F-010). Ohne Abbrechen bleibt bei einer misslungenen Abstimmung (falsche Zeiträume, Gruppe ändert Pläne) nur „Festlegen“ oder „Reise löschen“ – beides falsch.
- Ort: Reisemenü (⋯) im Tab Abstimmen, Eintrag «Abstimmung abbrechen» (nicht als prominenter Button neben „Festlegen“).
- Dialog (destruktiv, §4.2): «Abstimmung abbrechen?» – «Alle Optionen und Stimmen werden gelöscht. Eingetragene Tage bleiben erhalten; die Reise geht zurück zu ‚Tage sammeln‘.» `[Abstimmung behalten]` (Standardfokus) `[Abstimmung abbrechen]` (abweichend vom Standard-„Abbrechen“, damit nicht zweimal „abbrechen“ steht). EN «Cancel the vote?» – «All options and votes will be deleted. Everyone's dates are kept and the trip goes back to ‘Collecting dates’.» `[Keep vote]` `[Cancel vote]`.
- Danach Tab Abstimmen im Leerzustand Orga; Status „abgestimmt“ aller zurückgesetzt; Mitglieder sehen beim nächsten Öffnen des Tabs einen einmaligen Hinweis «Lena hat die Abstimmung abgebrochen. Eine neue folgt.» Nur in Phase 2; in Phase 3 zuerst „Festlegung aufheben“.

**(b) Suchzeitraum in Phase 2/3 änderbar, bestehende Optionen bleiben auch außerhalb? Empfehlung: Ja** – entspricht bereits W12 (Hinweis «Die Abstimmung läuft – bestehende Optionen bleiben unverändert.») und F-001.
- Bestehende Optionen und Stimmen bleiben unverändert, auch wenn sie außerhalb des neuen Zeitraums oder unter einer neuen Mindestdauer liegen; die Karte zeigt dann die Verfügbarkeitszeile nur, soweit Tage im Suchzeitraum liegen, sonst «Liegt außerhalb des aktuellen Suchzeitraums» (Info, kein Fehler).
- Neue Optionen („Option hinzufügen“) nur innerhalb des neuen Zeitraums und ≥ neue Mindestdauer.
- Phase 3: Änderung wirkt nicht auf den festgelegten Termin; Hinweis in den Einstellungen «Der Termin steht schon fest – der Suchzeitraum betrifft nur ‚Meine Tage‘ und die Vorschläge.»

## 14. Feedback-Runde 1 – Test der Live-Vorschau durch den Auftraggeber (2026-10-20)

Vier Verbesserungen aus dem Test der privaten Vorschau. Der Auftraggeber legt besonderen Wert auf eine **ordentliche, intuitive, „richtig schöne“ Übersicht**. Dieser Abschnitt geht älteren Angaben vor: W06, W07, W09, W10, W11, user-flows C.1, C.3, D.3, K, sitemap §1, §2 und §5 sowie §4.10 und §10.3 dieses Dokuments. Optik: Design-System v1.0; offene Optik-Punkte an den Designer: [abstimmung-design §11](abstimmung-design.md) (U-17 bis U-21).

| Nr. | Thema | Features | Wireframes |
|---|---|---|---|
| 14.1 | „Nächster Schritt“ für alle Phasen und Rollen, Aktion „{Orga} Bescheid geben“ | F-007, F-044 | W07 |
| 14.2 | Personen-Status und Erinnern einzelner Personen (F-015 vorgezogen, für alle Mitglieder) | F-007, F-015 | W06, W07, W09, W10 |
| 14.3 | Hinweis „Basiert auf x von n“ bei „Alle dabei“ | F-008, F-009 | W09 |
| 14.4 | Phase 3: nur noch die Übersicht als Reise-Hub, Deep-Links, Festlegung aufheben | F-012 | W07, W09, W10, W11 |

**Begriff (gilt ab jetzt in allen neuen und geänderten Texten):** In Phase 1 heißt der Status «eingetragen» statt «abgegeben» – so formuliert es der Auftraggeber, und es ist alltagsnäher. Betroffen sind Kennzahl-Box, Statuszeilen und Listen. Der Button «Fertig – abgeben» in Meine Tage bleibt (Verb der Handlung). Die Phasenzeile «Tage sammeln · 5/7 fertig» bleibt.

| Schlüssel heute | DE neu | EN neu |
|---|---|---|
| `trip.kpiSubmitted` | {done} von {total} haben eingetragen | {done} of {total} have added their dates |
| `trip.kpiAllDone` | Alle haben eingetragen. | Everyone has added their dates. |
| `trip.status.submitted` / `submittedOn` | eingetragen / eingetragen · {date} | dates added / dates added · {date} |
| `trip.status.open` (Phase 1) | noch nicht eingetragen | no dates yet |
| `trip.status.open` (Phase 2) | noch nicht abgestimmt | hasn't voted yet |
| `trip.status.placeholder` | noch nicht beigetreten | hasn't joined yet |

### 14.1 „Nächster Schritt“ – vollständige Matrix (W07)

**Grundregeln**
1. Die Karte beantwortet in genau dieser Reihenfolge: **Wo stehen wir? → Wer ist jetzt dran? → Was kann ich tun?** Der „Wer ist dran?“-Teil nennt immer eine Person: «du», «{orga}» oder die Fehlenden.
2. Die Namen der Fehlenden stehen schon in der Kennzahl-Box darüber. Die Karte wiederholt die Liste nicht. Ausnahme: Es fehlt nur noch eine Person (die Orga oder man selbst).
3. Es gibt höchstens **eine** Primäraktion. In Warte-Zuständen von Mitgliedern gibt es keine Primäraktion (nur sekundär bzw. Text-Taste) – Mitglieder sollen nicht zu einer Handlung gedrängt werden, die gerade nicht nötig ist. **Ausnahme Kosten-Leiste (2026-10-23, W16 v2.17):** Im Cockpit *Unterwegs* und *Danach* (eigenes Ergebnis ≠ 0) trägt die fixierte Kosten-Leiste die einzige Primär-Taste (`[+ Ausgabe]` bzw. `[Ausgleichen]`); Heute-Karten zeigen ihre Tasten dann sekundär.
4. `{orga}` = Anzeigename der Orga in dieser Reise (wie in der Mitgliederliste). Ist der Betrachter selbst Orga, gilt die Orga-Zeile („du“).
5. „Fertig“ heißt: Phase 1 eingetragen, Phase 2 abgestimmt. „Andere offen“ zählt in Phase 1 **Mitglieder und offene Platzhalter** (Q20), in Phase 2 nur Mitglieder (Platzhalter können nicht abstimmen). Den Betrachter selbst zählt es nie mit.
6. Frist: Phase 1 = `trip.deadline` (Eintragen), Phase 2 = `trip.pollDeadline`. „Vorbei“ heißt: Frist < heute. Eine Frist blockiert nichts.
7. **Auswertung von oben nach unten, die erste passende Zeile gilt.** Umsetzung als reine Funktion `nextStep(phase, viewer, members, placeholders, deadlines, today) → { key, params, actions }` in `src/lib/trip-status.ts`, mit Unit-Tests je Zeile. `viewerTodo` bleibt für „Meine Reisen“ (F-044) unverändert.

**Phase 1 „Tage sammeln“**

| ID | Situation (erste passende) | Text DE | Text EN | Aktionen |
|---|---|---|---|---|
| N1-1 | Ich offen · Frist vorbei | Die Frist ist vorbei – trag deine Tage trotzdem schnell ein. | The deadline has passed – add your dates quickly anyway. | primär [Tage eintragen] / [Add your dates] |
| N1-2 | Ich offen · alle anderen fertig · ich bin Mitglied | Nur deine Tage fehlen noch – dann kann {orga} die Abstimmung starten. | Only your dates are missing – then {orga} can start the vote. | primär [Tage eintragen] |
| N1-3 | Ich offen · alle anderen fertig · ich bin Orga | Nur deine Tage fehlen noch – danach kannst du die Abstimmung starten. | Only your dates are missing – then you can start the vote. | primär [Tage eintragen] |
| N1-4 | Ich offen (sonst) | Trag deine Tage ein – dauert 2 Minuten. | Add your dates – it takes 2 minutes. | primär [Tage eintragen] |
| N1-5 | Orga · alle fertig (inkl. Platzhalter) | Alle haben ihre Tage eingetragen! Zeit für die Abstimmung. | Everyone has added their dates! Time to start the vote. | primär [Abstimmung erstellen] / [Create a vote] |
| N1-6 | Orga · alle Mitglieder fertig · nur Platzhalter offen | Alle Mitglieder haben eingetragen. {names} {count, plural, one {ist} other {sind}} noch nicht beigetreten – du kannst die Abstimmung trotzdem schon starten. | All members have added their dates. {names} {count, plural, one {hasn't} other {haven't}} joined yet – you can start the vote anyway. | primär [Abstimmung erstellen] · sekundär [Erinnern] / [Remind] |
| N1-7 | Orga · Frist vorbei · andere offen | Die Frist zum Eintragen ist vorbei, {count, plural, one {# fehlt} other {# fehlen}} noch. Du kannst die Abstimmung schon mit den eingetragenen Tagen starten. | The deadline for adding dates has passed and {count, plural, one {# person is} other {# people are}} still missing. You can start the vote with the dates you have. | primär [Abstimmung erstellen] · sekundär [Erinnern] |
| N1-8 | Orga · andere offen | Deine Tage sind drin. Sobald alle eingetragen haben, kannst du die Abstimmung starten. | Your dates are in. Once everyone has added theirs, you can start the vote. | primär [Erinnern] · sekundär [Vorschläge ansehen] / [See suggestions] |
| N1-9 | Mitglied · alle fertig (inkl. Platzhalter) | Alle haben ihre Tage eingetragen. Jetzt ist {orga} dran und startet die Abstimmung. | Everyone has added their dates. Now it's {orga}'s turn to start the vote. | sekundär [Vorschläge ansehen] · Text-Taste [{orga} Bescheid geben] / [Let {orga} know] |
| N1-10 | Mitglied · Frist vorbei · andere offen | Die Frist zum Eintragen ist vorbei. Jetzt ist {orga} dran und startet die Abstimmung. | The deadline for adding dates has passed. Now it's {orga}'s turn to start the vote. | sekundär [Vorschläge ansehen] · Text-Taste [{orga} Bescheid geben] |
| N1-11 | Mitglied · nur die Orga ist offen | Danke, deine Tage sind drin! Jetzt fehlen nur noch die Tage von {orga} – danach kann die Abstimmung starten. | Thanks, your dates are in! Only {orga}'s dates are missing – then the vote can start. | sekundär [{orga} erinnern] / [Remind {orga}] · sekundär [Vorschläge ansehen] |
| N1-12 | Mitglied · andere offen | Danke, deine Tage sind drin! Sobald alle eingetragen haben, startet {orga} die Abstimmung. | Thanks, your dates are in! Once everyone has added theirs, {orga} will start the vote. | sekundär [Erinnern] · sekundär [Vorschläge ansehen] |

N1-9 ist der Wortlaut aus dem Auftraggeber-Feedback. Platzhalter, die noch fehlen, fallen bei Mitgliedern unter N1-12. Mitglieder warten ehrlich auf alle; die Orga sieht in N1-6, dass sie trotzdem starten kann.

**Phase 2 „Abstimmung läuft“**

| ID | Situation (erste passende) | Text DE | Text EN | Aktionen |
|---|---|---|---|---|
| N2-1 | Ich nicht abgestimmt · Frist vorbei · Mitglied | Die Frist ist vorbei, aber du kannst noch abstimmen, bis {orga} den Termin festlegt. | The deadline has passed, but you can still vote until {orga} locks in the dates. | primär [Abstimmen] / [Vote] |
| N2-2 | Ich nicht abgestimmt · Frist vorbei · Orga | Die Frist ist vorbei. Stimm noch ab und leg dann den Termin fest. | The deadline has passed. Cast your vote, then lock in the dates. | primär [Abstimmen] |
| N2-3 | Ich nicht abgestimmt · alle anderen fertig · Mitglied | Nur deine Stimme fehlt noch – dann kann {orga} den Termin festlegen. | Only your vote is missing – then {orga} can lock in the dates. | primär [Abstimmen] |
| N2-4 | Ich nicht abgestimmt · alle anderen fertig · Orga | Nur deine Stimme fehlt noch – danach kannst du den Termin festlegen. | Only your vote is missing – then you can lock in the dates. | primär [Abstimmen] |
| N2-5 | Ich nicht abgestimmt (sonst) | Die Abstimmung läuft – stimm ab. + mit Frist: « Abstimmen bis {date}.» | Voting is open – cast your vote. + « Vote by {date}.» | primär [Abstimmen] |
| N2-6 | Orga · alle abgestimmt | Alle haben abgestimmt! Zeit, den Termin festzulegen. | Everyone has voted! Time to lock in the dates. | primär [Termin festlegen] / [Lock in dates] → `/poll?fix=1` |
| N2-7 | Orga · Frist vorbei · andere offen | Die Frist ist abgelaufen – {count, plural, one {# hat} other {# haben}} nicht abgestimmt. Zeit, den Termin festzulegen. | The voting deadline has passed – {count, plural, one {# person hasn't} other {# people haven't}} voted. Time to lock in the dates. | primär [Termin festlegen] · sekundär [Erinnern] |
| N2-8 | Orga · andere offen | Deine Stimme ist drin. Sobald alle abgestimmt haben, legst du den Termin fest – du kannst es auch schon vorher tun. | Your vote is in. Once everyone has voted, you lock in the dates – or do it earlier if you like. | primär [Erinnern] · sekundär [Zur Abstimmung] / [Go to the vote] |
| N2-9 | Mitglied · alle abgestimmt | Alle haben abgestimmt. Jetzt ist {orga} dran und legt den Termin fest. | Everyone has voted. Now it's {orga}'s turn to lock in the dates. | sekundär [Ergebnis ansehen] / [See results] · Text-Taste [{orga} Bescheid geben] |
| N2-10 | Mitglied · Frist vorbei · andere offen | Die Abstimmungsfrist ist vorbei. Jetzt ist {orga} dran und legt den Termin fest. | The voting deadline has passed. Now it's {orga}'s turn to lock in the dates. | sekundär [Ergebnis ansehen] · Text-Taste [{orga} Bescheid geben] |
| N2-11 | Mitglied · nur die Orga ist offen | Danke fürs Abstimmen! Jetzt fehlt nur noch die Stimme von {orga} – danach wird der Termin festgelegt. | Thanks for voting! Only {orga}'s vote is missing – then the dates get locked in. | sekundär [{orga} erinnern] · sekundär [Zur Abstimmung] |
| N2-12 | Mitglied · andere offen | Danke fürs Abstimmen! Sobald alle abgestimmt haben, legt {orga} den Termin fest. + mit Frist: «Danke fürs Abstimmen! Sobald alle abgestimmt haben – spätestens nach der Frist am {date} –, legt {orga} den Termin fest.» | Thanks for voting! Once everyone has voted, {orga} will lock in the dates. + «Thanks for voting! Once everyone has voted – or after the deadline on {date} – {orga} will lock in the dates.» | sekundär [Erinnern] · sekundär [Zur Abstimmung] |

- „Ergebnis ansehen“ führt nach `/poll`. Mitglieder sehen dort nur die Ergebnisse der Optionen, zu denen sie abgestimmt haben (Q13 a). Nach eigener vollständiger Stimme sind das alle.
- `/poll?fix=1` (nur Orga, Phase 2) öffnet das Sheet „Termin festlegen“ direkt. Danach den Parameter per `replaceState` entfernen. Ohne Orga-Rolle oder außerhalb von Phase 2 wird er ignoriert.

**Phase 3 und Vergangen**
- **Phase 3:** keine Nächster-Schritt-Karte. Ergebnis-Karte und Reise-Hub übernehmen (§14.4).
- **Vergangen nach Festlegung:** «Diese Reise ist vorbei. Zeit für die nächste?» / «This trip is over. Time for the next one?» · sekundär [Neue Reise planen] (unverändert).
- **Vergangen ohne Festlegung** (Suchzeitraum abgelaufen): «Der Suchzeitraum ist vorbei, ohne dass ein Termin feststand.» / «The date range has ended without fixed dates.» · Orga: sekundär [Reise bearbeiten] / [Edit trip] (Suchzeitraum verlängern) · alle: sekundär [Neue Reise planen].

**Aktion „{orga} Bescheid geben“ – Entscheidung: ja, aber zurückhaltend.**
- **Warum:** Im MVP gibt es keine Benachrichtigungen (F-014 kommt mit v1). Die Orga erfährt also nur beim Öffnen der App, dass sie dran ist. Ein Tipp, und die Nachricht geht per WhatsApp an die Orga – das schließt genau die Lücke, die der Auftraggeber beschreibt.
- **Wo:** nur für Nicht-Orga, nur in N1-9, N1-10, N2-9 und N2-10. Immer als **Text-Taste** (nie primär) – wer weiß, dass die Orga schon Bescheid weiß, ignoriert sie einfach.
- **Wie:** öffnet das Erinnern-Sheet im Schritt `orga` (§14.2) mit Vorschau-Text, Sprachumschalter DE/EN, [Per WhatsApp senden] (primär), [Teilen …], [Text kopieren]. `{link}` = Übersicht der Reise (`tripLink(tripPath(id))`).
- **Texte:**
  | Anlass | DE | EN |
  |---|---|---|
  | P1 alle eingetragen | Hey {orga}, alle haben ihre Tage für {trip} eingetragen – du kannst jetzt die Abstimmung starten: {link} | Hey {orga}, everyone has added their dates for {trip} – you can start the vote now: {link} |
  | P1 Frist vorbei | Hey {orga}, die Frist für {trip} ist vorbei – magst du die Abstimmung starten? {link} | Hey {orga}, the deadline for {trip} has passed – could you start the vote? {link} |
  | P2 alle abgestimmt | Hey {orga}, alle haben bei {trip} abgestimmt – du kannst jetzt den Termin festlegen: {link} | Hey {orga}, everyone has voted for {trip} – you can lock in the dates now: {link} |
  | P2 Frist vorbei | Hey {orga}, die Abstimmungsfrist für {trip} ist vorbei – magst du den Termin festlegen? {link} | Hey {orga}, the voting deadline for {trip} has passed – could you lock in the dates? {link} |
  | Platzhalter fehlt (Nicht-Orga, §14.2) | Hey {orga}, {name} fehlt noch bei {trip} – schickst du {name} den persönlichen Link? {link} | Hey {orga}, {name} still hasn't joined {trip} – could you send them their personal link? {link} |

**Darstellung:** Karte wie bisher (Info-Karte, h2 «Nächster Schritt» / «Next step»). Zeilenwechsel der Situation → Inhalt blendet über (W07-03). Aktionen untereinander unter 400 px, sonst nebeneinander. Reihenfolge: primär → sekundär → Text-Taste.

### 14.2 Personen-Status und Erinnern (F-007, F-015 vorgezogen)

**Entscheidungen**
1. **Alle Mitglieder dürfen erinnern** – nicht nur die Orga. Das ändert Flow K.6 („Nicht-Orga: kein Erinnern-Button“) auf ausdrücklichen Wunsch des Auftraggebers. Sozial unproblematisch, weil die App nichts selbst verschickt: Die Nachricht geht aus dem eigenen WhatsApp, freundlich formuliert, mit Namen. Sich selbst kann man nicht erinnern.
2. **Eine Komponente für alles:** `RemindSheet` (Bottom-Sheet, ab 600 px Dialog max. 480 px) mit vier Schritten:
   - `status` – Liste „Fehlt noch / Eingetragen“ (Phase 2: „Fehlt noch / Abgestimmt“)
   - `single` – „{Name} erinnern“
   - `all` – „Alle erinnern“ (Sammel-Text, Flow K)
   - `orga` – „{Orga} Bescheid geben“ bzw. Platzhalter-Hinweis für Nicht-Orga
   Die W10-Kachel „Wer hat abgestimmt?“ nutzt dieselbe Komponente (Phase 2). Das heutige „Wer hat abgegeben?“-`<details>` unter der Heatmap entfällt.
3. **Kein „@“ vor Namen** (F-015, unverändert). Begrüßung «Hey {name}» und der Name im Satz erfüllen „namentlich erwähnt“.
4. **WhatsApp ist in diesem Sheet der primäre Kanal** (Auftraggeber-Wunsch, Zielgruppe). Link `https://wa.me/?text=<encodeURIComponent(text)>`, `target="_blank" rel="noopener noreferrer"`. Ohne Telefonnummer öffnet WhatsApp die Chat-Auswahl – man wählt die Person direkt oder den Gruppenchat. Funktioniert auf iOS/Android (App), am Desktop (WhatsApp Web/Desktop) und im WhatsApp-In-App-Browser. Sekundär: [Teilen …] (nur wenn `navigator.share` vorhanden) und [Text kopieren] (immer). Andere Teilen-Sheets (Einladung, Abstimmung, Ergebnis) bleiben vorerst bei §4.5.

**Einstiege**

| Ort | Element | öffnet Schritt |
|---|---|---|
| Übersicht + Gruppe, Phase 1/2 | **Kennzahl-Box** – ganze Box als Button mit Chevron ›, solange jemand offen ist (s. u.) | `status` |
| Übersicht, Liste „Wer ist dabei?“ | Zeile unter „Fehlt noch“ → [Erinnern] | `single` (direkt) bzw. `orga` (Platzhalter, Nicht-Orga) |
| Übersicht, Nächster Schritt | [Erinnern] | genau 1 andere Person offen → `single`, sonst `status` |
| Übersicht, Nächster Schritt | [{orga} erinnern] (N1-11, N2-11) | `single` für die Orga |
| Übersicht, Nächster Schritt | [{orga} Bescheid geben] | `orga` |
| Gruppe, Vorschläge | Hinweis „Basiert auf …“ → Text-Taste [Erinnern] (§14.3) | `status` |
| Gruppe, Kalender | Zeile unter der Heatmap «Wer hat eingetragen? (5/9) ›» (Button, ersetzt `<details>`) | `status` |
| Abstimmen, Phase 2 | Beteiligungs-Kachel «4 von 7 haben abgestimmt ›» | `status` |
| Reisemenü „⋯“ | «Gruppe erinnern» / «Remind the group» – jetzt **für alle Mitglieder**, Phase 1/2, nur wenn mind. 1 andere Person offen ist | `status` |

**Kennzahl-Box (§4.10, geändert):** Ist mind. eine Person offen, ist die ganze Box ein `<button aria-haspopup="dialog">` (Ring + Satz + Zeile «Noch offen: Kemal, Sara, Mia und Tom» + Chevron rechts). Zugänglicher Name: «5 von 9 haben eingetragen. Noch offen: Kemal, Sara, Mia und Tom. Liste öffnen» / «5 of 9 have added their dates. Still missing: … Open list». Die Minze-Taste [Erinnern] in der Box **entfällt** – Erinnern geschieht im Sheet. So gibt es nur ein Ziel und keinen Button im Button. In Gruppe entfällt der Zusatz «– das Ergebnis kann sich noch ändern.»; er geht im Hinweis §14.3 auf. Sind alle fertig, ist die Box kein Button, und die Orga behält in Gruppe [Abstimmung starten].

**Schritt `status` (mobil)**
```
│              ─────                 │
│ Wer hat eingetragen?          [×]  │  h2; Phase 2: «Wer hat abgestimmt?»
│ 5 von 9 haben eingetragen          │  14 text-muted
│                                    │
│ FEHLT NOCH (4)                     │  h3
│ (┄KE┄) Kemal                       │  Avatar 40 gestrichelt + Uhr-Icon in der Statuszeile
│   ◷ noch nicht eingetragen [Erinnern]│  btn-sm sekundär, Icon ww-icon-remind, 44 px
│ (┄SA┄) Sara                        │
│   ◷ noch nicht eingetragen [Erinnern]│
│ (┄MI┄) Mia                         │  Platzhalter
│   ◷ noch nicht beigetreten [Erinnern]│
│ (┄KM┄) Kai (du)                    │  man selbst: Link statt Erinnern
│   ◷ noch nicht eingetragen [Tage eintragen]│
│                                    │
│ EINGETRAGEN (5)                    │  h3
│ (LE)✓ Lena  [Orga]                 │  Avatar gefüllt + Minze-Siegel; nicht interaktiv
│   ✓ eingetragen · 12. Mai          │
│ (JO)✓ Jonas  ✓ eingetragen · 10. Mai│
│ …                                  │
├────────────────────────────────────┤
│ [ Alle erinnern (3) ]              │  sekundär, volle Breite; nur bei ≥ 2 offenen
└────────────────────────────────────┘  beigetretenen anderen Mitgliedern
```
- Reihenfolge in „Fehlt noch“: Mitglieder nach Beitritt, dann Platzhalter, **man selbst zuletzt**. In „Eingetragen“ nach Beitritt. Die Orga-Zeile trägt das Abzeichen «Orga».
- Statuszeilen (Symbol + Text, nie nur Farbe): Phase 1 «noch nicht eingetragen» / «no dates yet» · «eingetragen · {date}» / «dates added · {date}» · Platzhalter «noch nicht beigetreten» / «hasn't joined yet». Phase 2 «noch nicht abgestimmt» / «hasn't voted yet» · «abgestimmt» / «voted». Phase 2 listet nur Mitglieder.
- Überschriften: «Fehlt noch ({count})» / «Still missing ({count})» · «Eingetragen ({count})» / «Dates added ({count})» · Phase 2 «Abgestimmt ({count})» / «Voted ({count})». Leere Gruppe → ganz weglassen.
- Zeilen-Buttons: «Erinnern» / «Remind» mit zugänglichem Namen «{name} erinnern» / «Remind {name}». Eigene Zeile: «Tage eintragen» / «Add your dates» (Phase 2 «Abstimmen» / «Vote») als Link. Fußleiste: «Alle erinnern ({count})» / «Remind all ({count})».
- Viele Personen: Das Sheet rastet bei mehr als 8 Zeilen auf „fast voll“ ein und scrollt innen. Die Fußleiste bleibt sichtbar.

**Schritt `single` – „{Name} erinnern“**
```
│ [‹]  Kemal erinnern           [×]  │  ‹ nur, wenn aus `status` geöffnet
│ (┄KE┄) Kemal hat noch keine Tage   │  Kontextzeile (Phase 2: «… hat noch nicht abgestimmt.»)
│        eingetragen.                │
│ Nachricht      Sprache: (•)DE ( )EN│  §4.5
│ ┌──────────────────────────────┐   │
│ │ Hey Kemal, du fehlst noch bei│   │  editierbar, Auto-Höhe
│ │ Lissabon 2027! Trag kurz ein,│   │
│ │ wann du kannst – dauert 2    │   │
│ │ Minuten: https://…/days      │   │
│ └──────────────────────────────┘   │
│ [   Per WhatsApp senden        ]   │  primär
│ [ Teilen … ]   [ Text kopieren ]   │  sekundär; „Teilen …“ nur mit Web Share
│ Schick es Kemal direkt oder in     │  13 text-muted
│ euren Gruppenchat.                 │
```
- Kontextzeile: «{name} hat noch keine Tage eingetragen.» / «{name} hasn't added any dates yet.» · Phase 2: «{name} hat noch nicht abgestimmt.» / «{name} hasn't voted yet.» · Platzhalter (Orga): «{name} ist noch nicht beigetreten – die Nachricht enthält den persönlichen Link.» / «{name} hasn't joined yet – the message includes their personal link.»
- Fußzeile: «Schick es {name} direkt oder in euren Gruppenchat.» / «Send it to {name} directly or to your group chat.»
- Buttons: «Per WhatsApp senden» / «Send via WhatsApp» · «Teilen …» / «Share …» · «Text kopieren» / «Copy text» → 2 s «Kopiert ✓» / «Copied ✓» (G-11).
- **Texte** (≤ 300 Zeichen inkl. Link). „Letzte Person“ = alle anderen sind fertig. „Frist“ nur, wenn sie noch nicht vorbei ist.

  | Fall | Link | DE | EN |
  |---|---|---|---|
  | P1 Mitglied | `/trips/{id}/days` | Hey {name}, du fehlst noch bei {trip}! Trag kurz ein, wann du kannst – dauert 2 Minuten: {link} | Hey {name}, we're still missing your dates for {trip}! Add them quickly – it takes 2 minutes: {link} |
  | P1 Mitglied mit Frist | dto. | Hey {name}, du fehlst noch bei {trip}! Trag bis {deadline} ein, wann du kannst – dauert 2 Minuten: {link} | Hey {name}, we're still missing your dates for {trip}! Add them by {deadline} – it takes 2 minutes: {link} |
  | P1 letzte Person | dto. | Hey {name}, bei {trip} fehlen nur noch deine Tage! Trag sie kurz ein, dann kann's mit der Abstimmung losgehen: {link} | Hey {name}, yours are the last dates we need for {trip}! Add them quickly so we can start the vote: {link} |
  | P1 Platzhalter (nur Orga) | persönlicher Link `/i/{token}` | Hey {name}, du fehlst noch bei {trip}! Hier ist dein persönlicher Link – trag ein, wann du kannst: {link} | Hey {name}, we're still missing you for {trip}! Here's your personal link to add your dates: {link} |
  | P2 Mitglied | `/trips/{id}/poll` | Hey {name}, deine Stimme fehlt noch bei {trip}! Stimm kurz ab: {link} | Hey {name}, we still need your vote for {trip}! Vote here: {link} |
  | P2 mit Frist | dto. | Hey {name}, deine Stimme fehlt noch bei {trip}! Stimm bis {deadline} ab: {link} | Hey {name}, we still need your vote for {trip}! Vote by {deadline}: {link} |
  | P2 letzte Person | dto. | Hey {name}, bei {trip} fehlt nur noch deine Stimme! Stimm kurz ab, dann können wir den Termin festlegen: {link} | Hey {name}, yours is the last vote we need for {trip}! Vote now so we can lock in the dates: {link} |

  `{name}` = Anzeigename der Person in der Reise. `{deadline}` und Datum im Format der Textsprache (§9).

**Platzhalter – wer sieht was**
- **Orga:** Platzhalter-Zeile → `single` mit dem **persönlichen Link** (wer darüber beitritt, übernimmt den Platzhalter, F-007). Der Link „Platzhalter verwalten“ (A4) steht weiter unter der Liste in der Übersicht.
- **Nicht-Orga:** Die Zeile ist sichtbar («noch nicht beigetreten»), [Erinnern] öffnet `orga`. Inhalt: Überschrift «{name} ist noch nicht dabei» / «{name} hasn't joined yet». Text: «Den persönlichen Link für {name} hat nur {orga}. Sag kurz Bescheid – dann kann {orga} ihn weiterschicken.» / «Only {orga} has {name}'s personal link. Give them a nudge so they can pass it on.» Teilen-Text an die Orga: s. Tabelle in §14.1 („Platzhalter fehlt“).
- **Warum nicht der allgemeine Einladungslink?** Namen sind in einer Reise eindeutig (Mitglieder und Platzhalter). Mia käme als „Mia 2“ in die Reise, und der Platzhalter „Mia“ bliebe offen – doppelte Personen, falscher Fortschritt. Persönliche Links bleiben bewusst nur in Orga-Ansichten (Sicherheitsregel, `load.ts`). Server: Texte mit persönlichem Link nur für die Orga rendern, nie im Payload für Mitglieder.

**Schritt `all` – „Alle erinnern“** (Flow K, W06): Checkboxen der offenen **beigetretenen** Mitglieder (ohne man selbst), alle vorausgewählt. Der Text aktualisiert sich (§10.3 „Erinnerung Tage“ bzw. „Erinnerung Abstimmung“, Link wie `single`). Platzhalter sind nicht dabei, weil jeder einen eigenen Link braucht. Hinweiszeile, wenn welche offen sind: Orga «{names} {count, plural, one {ist} other {sind}} noch nicht beigetreten – erinnere sie einzeln mit ihrem persönlichen Link.» / «{names} {count, plural, one {hasn't} other {haven't}} joined yet – remind them one by one with their personal link.» · Nicht-Orga «… – das übernimmt {orga}.» / «… – {orga} will take care of that.» Knöpfe wie `single`.

**Übersicht – Liste „Wer ist dabei?“ in Phase 1/2 (W07)**
- Gruppiert wie `status`: «Fehlt noch (n)» zuerst, dann «Eingetragen (n)» bzw. «Abgestimmt (n)». Gleiche Zeilen (Avatar gestrichelt + Uhr bzw. gefüllt + Minze-Siegel, Statuszeile, Orga-Abzeichen, «(du)»).
- Zeilen unter „Fehlt noch“ haben rechts [Erinnern] (btn-sm sekundär, 44 px, `aria-label` «{name} erinnern»). Bei der Orga folgt daneben weiterhin [⋯] (Entfernen, Orga übergeben). Bei 360 px passen Name (gekürzt mit „…“) + [Erinnern] + [⋯]. Wird es zu eng (große Schrift), bricht die Statuszeile mit dem Button unter den Namen um.
- Einklappen: „Fehlt noch“ immer vollständig. „Eingetragen“ ab 6 Personen auf 5 + «Alle {count} anzeigen».
- Phase 3 und Vergangen: keine Gruppen und keine Statuszeilen (wie heute).

**Optional (MVP+, Entscheidung CEO): „zuletzt erinnert“.** Wer auf WhatsApp/Teilen/Kopieren tippt, speichert serverseitig den Zeitpunkt je Person (`reminded_at` an Mitgliedschaft bzw. Platzhalter). Die Zeile zeigt dann für alle «◷ noch nicht eingetragen · erinnert heute, 14:20» / «… · reminded today, 14:20». Das verhindert, dass fünf Leute dieselbe Person anschreiben. Braucht eine Migration, daher nicht Pflicht für diese Runde.

**Barrierefreiheit:** Sheet nach §4.2 (`role="dialog"`, `aria-labelledby`). Gruppen als `<section>` mit h3 und `<ul>`. Avatare `aria-hidden` (Name steht als Text). Schrittwechsel: Fokus auf die h2 des neuen Schritts (`tabindex="-1"`). [‹] hat `aria-label` «Zurück zur Liste» / «Back to the list» und setzt den Fokus wieder auf den auslösenden Zeilen-Button. Schließen → Fokus auf den ursprünglichen Auslöser (Box, Zeile, Menü). WhatsApp-Link mit sr-Zusatz «(öffnet WhatsApp)» / «(opens WhatsApp)». Kennzahl-Box-Button im Cockpit: Fokus `--ww-focus-ring-on-brand`.

**Bewegung:** Sheet G-05/G-05b. Schrittwechsel: Inhalt gleitet `distance-lg` in Leserichtung (vor = von rechts, zurück = von links) + Fade, `base` · `standard` (wie W09-08); reduziert: Fade. Kopieren G-11, Checkboxen G-12. Kein Siegel und keine Feier beim Erinnern.

**Randfälle:** Jemand trägt ein, während das Sheet offen ist → keine Live-Aktualisierung; beim nächsten Öffnen stimmt die Liste. Person wurde inzwischen entfernt → Teilen klappt trotzdem, keine Fehlermeldung. Lange Namen: in Zeilen einzeilig mit „…“, im Sheet-Titel umbrechen. Beitritt geschlossen: ändert nichts (Mitglieder-Links brauchen keinen Beitritt). Persönliche Platzhalter-Links funktionieren wie bisher (F-007).

### 14.3 Hinweis „Basiert auf x von n“ bei „Alle dabei“ (W09)

- **Zweck:** „Alle dabei“ heißt fachlich „alle, die eingetragen haben“ (F-009). Solange Personen fehlen, muss das sichtbar sein, sonst wirkt der Vorschlag verbindlicher, als er ist.
- **Platz:** Ansicht Vorschläge, **direkt unter der Überschrift «✓ Alle dabei (n)»**, vor der ersten Karte. Auch wenn die Gruppe leer ist (dann über «Gerade kein Zeitraum, in dem alle können.»). Desktop: gleich in der Vorschlagsspalte. Die Gruppe „Fast alle dabei“ bekommt keinen eigenen Hinweis (keine Wiederholung). Ihre Chips «✕ ohne Jonas» beziehen sich wie bisher auf Eingetragene.
- **Optik:** kompakter Info-Hinweis (design-system §9.18 Info, Polster 8/12, Icon `users` 16) – nicht Amber, denn es ist eine Information, keine Warnung. Darin am Ende eine Text-Taste (Trefferfläche ≥ 44 px).
- **Text** (Namen nach §10.3: „und“, ab 5 Namen «und 3 weitere»; Platzhalter zählen mit, Q20):
  - DE «Basiert auf 5 von 9 – noch offen: Kemal, Sara, Mia und Tom.» · EN «Based on 5 of 9 – still waiting for Kemal, Sara, Mia and Tom.»
  - Betrachter selbst offen (steht vorn): DE «Basiert auf 5 von 9 – noch offen: du, Kemal und Sara.» · EN «Based on 5 of 9 – still waiting for you, Kemal and Sara.»
  - Text-Taste: Betrachter fertig → «Erinnern» / «Remind» (→ `status`, §14.2). Betrachter offen → «Deine Tage eintragen» / «Add your dates» (→ Meine Tage).
- **Vorschlag-Leiste (Kalender, < 960 px):** Ist der gewählte Vorschlag aus „Alle dabei“ und fehlt noch jemand, steht als **erster Chip** «Bisher 5 von 9» / «So far 5 of 9» (Info-Ton, Icon `users`; sr: «Basiert auf 5 von 9 Personen» / «Based on 5 of 9 people»). Weitere Chips laufen wie bisher in «+1» über.
- **Wenn alle eingetragen haben:** Hinweis und Chip entfallen ersatzlos. Die Überschrift „Alle dabei“ stimmt dann wörtlich, und die Kennzahl-Box sagt «Alle haben eingetragen.»
- **Sonderfälle:** Niemand hat eingetragen → Leerzustand, kein Hinweis. Nur eine Person eingetragen → der bestehende Hinweis «Bisher nur deine Angaben …» bleibt, der Hinweis hier erscheint zusätzlich. Lokaler Filter „Personen ausblenden“ ändert den Hinweis nicht (er beschreibt die Gruppe, nicht die eigene Sicht). Phase 2: gleiche Regel. Phase 3 (Unterseite, §14.4): kein Hinweis.
- **Barrierefreiheit:** Hinweis als `<p id=…>`, die Gruppe „Alle dabei“ (`<section>`) verweist per `aria-describedby` darauf. Keine Live-Region (ändert sich nur beim Laden).

### 14.4 Phase 3 „Steht fest“: nur noch die Übersicht als Reise-Hub

> **Hinweis 2026-10-22:** Für die Ausbaustufe „Reise managen“ wird der Aufbau der Phase-3-Übersicht durch [W16 v2 „Reiseverlauf“](wireframes/w16-cockpit.md) (Teil A) abgelöst: Ergebnis-Karte → Ticket-Kopf, Andockfläche/`TripModule` → Weg + Kacheln „Immer griffbereit“, Nächster Schritt → Heute-Marker (H-1–H-5). Bis zur Umsetzung von W16 v2 gilt dieser Abschnitt unverändert; Regeln 1–3, Deep-Links, „Festlegung aufheben“ und Reisemenü gelten weiter.

**Regeln**
1. **Keine Tab-Leiste, sobald der Termin festgelegt ist** (gespeicherte Phase `fixed`, auch wenn die Reise schon vorbei ist). Der Cockpit-Kopf besteht nur aus Zeile 1 (← · Reisename + Phasenzeile «Steht fest · 7 dabei» · ⋯). Die Tab-Spur fällt weg. Eine Leiste mit nur „Übersicht“ wäre leere Navigation. Sticky bleibt Zeile 1. Der Vorfreude-Ring scrollt wie bisher mit. Höhe des kompakten Kopfs ohne Tabs: Designer (U-21).
2. **Vergangen ohne Festlegung** (Suchzeitraum abgelaufen) behält die Tabs (unverändert).
3. **Standard-Ziel** in Phase 3 ist immer die Übersicht (wie bisher, sitemap §2).

**Aufbau Übersicht Phase 3 (mobil, von oben)**
1. Cockpit (Zeile 1, keine Tabs) + Vorfreude-Ring mit Countdown (W11, unverändert, Feier unverändert).
2. Ergebnis-Karte «Es geht los!» mit Datum, Meta-Zeile, [Zum Kalender hinzufügen ▾], [Allen Bescheid geben] und Drei-Schritte-Fortschritt (W11, design-system §9.6). Die separate Phasen-Leiste der Seite entfällt in Phase 3 (keine Doppelung).
3. Beschreibung der Reise (falls vorhanden) als Zitatzeile unter der Karte. Die Fakten „Suchzeitraum“ und „Nächte“ wandern nach 5.
4. **Andockfläche «Als Nächstes» / «Up next»** (h2): Liste von Modul-Kacheln für spätere Bereiche (Unterkünfte per Swipe F-031, Kosten teilen, Reisedaten, Dokumente). **Im MVP gibt es keine Module → die Fläche wird nicht gerendert** (keine „Bald verfügbar“-Teaser, keine leeren Versprechen).
5. **«So habt ihr entschieden» / «How you decided»** (h2): zwei Kacheln (klickbare Karten, Icon-Kachel 40 + Titel + Meta + Chevron):
   - «Abstimmungsergebnis» / «Vote results» · Meta «{voted} von {total} haben abgestimmt» / «{voted} of {total} voted» · Icon `vote` (Lavendel) → `/trips/{id}/poll`
   - «Kalender der Gruppe» / «Group calendar» · Meta «Wer wann konnte» / «Who could make it when» · Icon `calendar` (Minze) → `/trips/{id}/group?view=calendar`
   - darunter 13 px `text-muted`: «Gesucht wurde: {range} · {nights}» / «Searched: {range} · {nights}» (z. B. «Gesucht wurde: 1. Mai – 30. Juni 2027 · 4–5 Nächte»).
   - Kacheln nebeneinander, wenn der Container ≥ 21,5 em breit ist, sonst untereinander (gleiche Regel wie W01 „So geht's“).
6. «Wer ist dabei? ({count})» – Liste ohne Status (wie heute) + [Freunde einladen] (solange Beitritt offen).

Desktop (≥ 960 px): Hauptspalte 1–5, Seitenspalte 6 (wie W07).

**Vertrag für die Andockfläche (für spätere Module, jetzt als leerer Slot bauen)**
- `TripModule { id; icon; tone ('lavender'|'mint'|'sun'|'coral'); title; status (eine Zeile, z. B. «3 von 7 haben bewertet»); todo?: boolean; href }`. Die Übersicht rendert `modules.filter(visible)`. Bei leerem Array gibt es keine Überschrift und keinen Abstand.
- Kachel = klickbare Karte (§4.8, design-system §9.6), ein Fokusziel, ≥ 64 px hoch. `todo` = To-do-Kante links (wie F-044) + Sortierung nach vorn, sonst Reihenfolge des Moduls. Mobil eine Spalte, ab 600 px zwei.
- Jedes Modul bekommt eine **Unterseite** `/trips/{id}/<modul>` mit Cockpit ohne Tabs (← zur Übersicht, Untertitel = Modulname) – genau wie die Unterseiten unten. Sollten später mehrere Module dauerhaft genutzt werden, kann Phase 3 wieder Tabs bekommen (z. B. Übersicht · Unterkünfte · Kosten). Die URLs bleiben dann gleich, es ändert sich nur die Navigation. Entscheidung bei der Planung der Module (PM/UX).

**Deep-Links in Phase 3** (alte WhatsApp-Links wie „stimm ab: …/poll“ bleiben im Umlauf)

| URL | Verhalten in Phase 3 |
|---|---|
| `/trips/{id}/days` | Weiterleitung (307) → `/trips/{id}` |
| `/trips/{id}/poll/new` | Weiterleitung → `/trips/{id}` |
| `/trips/{id}/poll` | Feier für diese Person noch fällig → Weiterleitung `/trips/{id}` (die Feier ist der erste Kontakt). Sonst **Unterseite „Abstimmungsergebnis“** (schreibgeschützt, wie heute `phase="fixed"`). |
| `/trips/{id}/group` (inkl. `?view=`) | Feier fällig → `/trips/{id}`. Sonst **Unterseite „Kalender der Gruppe“**: schreibgeschützt – keine Orga-Auswahl „Zur Abstimmung“, kein „Abstimmung erstellen“, kein „Ab hier als Option vorschlagen“, kein Hinweis §14.3, keine Kennzahl-Box. Filter und Tagesdetail bleiben. Band = festgelegter Zeitraum statt Vorschlag 1 (falls einfach umsetzbar, sonst Vorschläge wie bisher). |
| `/trips/{id}/invite`, `/settings` | unverändert |

- Unterseiten nutzen den vorhandenen Cockpit-Modus ohne Tabs (`tab = null`): Zurück-Taste → Übersicht (`aria-label` «Zurück zur Reise»), Untertitel statt Phasenzeile: «Abstimmungsergebnis» / «Vote results» bzw. «Kalender der Gruppe» / «Group calendar». Seitentitel: «Abstimmungsergebnis · Lissabon 2027 · Wir wollen weg» / «Vote results · Lisbon 2027 · When do we go?», «Kalender der Gruppe · …» / «Group calendar · …». Visuell versteckte h1 gleichen Inhalts.
- Durch die Weiterleitungen wird das Banner «Der Termin steht fest! [Ansehen]» in Phase 3 nicht mehr gebraucht (darf im Code bleiben).

**Festlegung aufheben (Orga, Reisemenü)**
- Dialog unverändert (W11). Nach `[Termin aufheben]`: bleibt auf der Übersicht (Neuladen der Daten). Phase 2 → **Tab-Leiste ist wieder da**. Ergebnis-Karte und Ring blenden aus, die Tab-Spur blendet ein (`base`, nur Fade, keine Höhen-Animation, Layout springt; reduziert: sofort) – ruhig, W11-07.
- Fokus auf die h1 der Übersicht (Reisename). Snackbar «Termin aufgehoben – die Abstimmung läuft wieder.» / «Dates unlocked – voting is open again.» Die Nächster-Schritt-Karte zeigt die passende N2-Zeile.
- **Mitglieder (SOLL):** einmaliger Hinweis oben in der Übersicht – gleicher Mechanismus wie beim Abbruch-Hinweis Q21: «{orga} hat den Termin wieder geöffnet. Die Abstimmung läuft wieder.» / «{orga} has reopened the dates. Voting is open again.» [OK]. Wichtig, weil manche den Termin schon im Kalender haben.
- Wird später erneut festgelegt: Tabs verschwinden wieder, Feier nach F-012 (nur bei anderem Zeitraum).

**Reisemenü in Phase 3:** unverändert (Freunde einladen, Mein Name, Orga: Reise bearbeiten, Festlegung aufheben, Reise löschen; Reise verlassen; Hilfe). „Gruppe erinnern“ gibt es in Phase 3 nicht.

**Barrierefreiheit:** Ohne Tabs entfällt die Landmark `nav` „Reise-Bereiche“. Die Seite hat weiterhin Skip-Link, h1 «Es geht los!» (Ergebnis-Karte) bzw. Reisename und eine logische Überschriften-Reihenfolge (h2 Als Nächstes · So habt ihr entschieden · Wer ist dabei?). Kacheln sind Links mit vollständigem Namen («Abstimmungsergebnis – 7 von 7 haben abgestimmt»).

### 14.5 Übergabe an Entwicklung – betroffene Stellen

| Bereich | Datei / Komponente | Änderung |
|---|---|---|
| Logik | `src/lib/trip-status.ts` | neue reine Funktion `nextStep()` (Matrix §14.1) + Tests je ID. Optional Helfer `showTabs(trip)` = `trip.phase !== "fixed"`. |
| Übersicht | `src/app/(app)/trips/[id]/page.tsx` | `NextStep` auf `nextStep()` umstellen. `OverviewKpi` als Button → `RemindSheet`. Aufbau Phase 3 (§14.4): Andock-Slot, „So habt ihr entschieden“, Fakten verschieben, Phasen-Leiste nur außerhalb Phase 3. |
| Liste | `src/features/trips/components/member-list.tsx` | Gruppierung „Fehlt noch / Eingetragen bzw. Abgestimmt“, [Erinnern] je offener Zeile, Platzhalter in „Fehlt noch“. |
| Neu | `src/features/trips/components/remind-sheet.tsx` (Client) | Schritte `status` / `single` / `all` / `orga`, WhatsApp-Link, Teilen, Kopieren; Texte kommen fertig vom Server (beide Sprachen, wie `share-panel`). |
| Texte | `src/features/trips/share-texts.ts`, `messages/de.json`, `messages/en.json` | `remindShareTexts` (P1/P2, Frist, letzte Person, Platzhalter), `orgaNudgeShareTexts`, neue `trip.next.*`-Schlüssel je ID, `remind.*`, Begriff „eingetragen“. |
| Kennzahl-Box | `src/components/ui/cockpit` (`KpiBox`) | Variante als Button mit Chevron; keine Aktions-Taste, solange die Box Button ist. |
| Cockpit | `trip-cockpit.tsx`, `trip-shell.tsx` | Phase `fixed` → keine `TabNav`; Unterseiten-Untertitel. |
| Menü | `src/features/trips/sheet-context.ts`, `trip-sheet.tsx` | «Gruppe erinnern» für alle Mitglieder (Phase 1/2, ≥ 1 anderer offen) → `RemindSheet`. |
| Gruppe | `group/page.tsx`, `group-view.tsx`, `suggestion-card` / Leiste | Kennzahl-Box-Button, Hinweis §14.3, Chip in der Leiste, `<details>` „Wer hat abgegeben?“ → Button. Schreibgeschützter Modus Phase 3. |
| Abstimmen | `poll/page.tsx`, `poll-view.tsx` | Kachel „Wer hat abgestimmt?“ → `RemindSheet` (Phase 2, mit Erinnern). `?fix=1`. Phase 3 als Unterseite. |
| Weiterleitungen | `days/page.tsx`, `poll/new/page.tsx`, `poll/page.tsx`, `group/page.tsx` | Phase-3-Regeln §14.4 (inkl. „Feier fällig → Übersicht“). |
| Sicherheit | `load.ts`, Server-Texte | Persönliche Platzhalter-Links nur in Orga-Ansichten rendern (unverändert gültig). |

**Abnahme durch UX (nach Umsetzung):** 360 × 640 und 200 % Text – Übersicht Phase 1 (Orga, Mitglied, „alle fertig“), Sheet `status` mit 9 Personen inkl. Platzhalter, `single` (WhatsApp öffnet mit Text), Gruppe mit Hinweis, Phase 3 ohne Tabs, Deep-Link `/poll` nach Festlegung, Festlegung aufheben.


## 15. Geschlossene Beta „Stufe B“ & installierte Web-App (PWA) – Verweis (2026-10-23)

Vollständige Spezifikation: **[W23 – Beta & Installation](wireframes/w23-beta-und-installation.md)**. Kurzfassung der verbindlichen Regeln:

- **Beta-Einstieg** `/beta`: Beta-Code → „Kurz zum Datenschutz“ mit Pflicht-Zustimmung → `/login` (E-Mail → Code → Name) → einmalig `/install` → Meine Reisen. Login bestehender Konten ohne Beta-Code. Neue E-Mail ohne Beta-Pass wird erst **nach** der Code-Prüfung abgewiesen (keine Konto-Aufzählung). Über einen gültigen Einladungslink **kein** Beta-Code (Empfehlung B-E2, Bestätigung durch den CEO offen), Zustimmung im Schritt „Name“ (W03 Z4a).
- **Code vor Link:** In der installierten App ist der 6-stellige Code der Anmeldeweg; Hinweis „der Link öffnet Safari“; Mail nennt Code zuerst, Link nur „im Browser“; Magic-Link-Seite rät bei Anforderung aus der App zum Code (W23 A.5, A.6).
- **Install-Hinweis** genau einmal nach Konto-Anlage/erstem Beitritt; danach nur über Avatar-Menü „App installieren“ und Hilfe `#app`; in der installierten App (`display-mode: standalone` / `navigator.standalone`) nie. iOS: Text-Anleitung ⋯ → Teilen → „Zum Home-Bildschirm“ + Skizzen; Android: `beforeinstallprompt`-Taste; erkannte In-App-Browser: „In Safari öffnen“ ohne Zwang (W23 B).
- **PWA [immer]:** `viewport-fit=cover` + Safe Areas für alle fixierten Leisten (ergänzt §2), Statusleiste `black-translucent` mit dunklem Band hinter der Statusleiste, `theme-color` hell/dunkel, minimaler Service Worker nur für die Offline-Seite (keine Reisedaten im Cache), **jede Seite hat einen sichtbaren Zurück-Weg** (ergänzt §3; Audit W23 C.5), interne Links in der App nie `target="_blank"` (ergänzt §11), externe Links öffnen extern, **kein Pull-to-refresh** – stattdessen stilles Auffrischen beim Zurückkehren in die App, „Einladungslink einfügen“ in der installierten App (W23 C).
- **Beta-Kennzeichnung:** Etikett „Beta“ neben der Wortmarke (nicht im Cockpit-Kopf), „Feedback geben“ in Avatar-Menü, Reisemenü und Hilfe → WhatsApp/E-Mail an den Auftraggeber mit vorausgefülltem Text ohne Reiseinhalte (W23 D).
- **Glossar-Ergänzung (§10.2):** „Beta-Code“ / „beta code“; „Home-Bildschirm“ (iOS) / „Home Screen“; „Startbildschirm“ (Android) / „home screen“; „App installieren“ / „Install the app“; „Feedback geben“ / „Give feedback“.
- Im Beta-Modus keine Demo-Elemente (Demo-Banner, Demo-Postfach, „Demo zurücksetzen“); Reisedaten aus = [W20 H.1](wireframes/w20-reisedaten.md).

## Änderungen
- 2026-10-08 (Runde 3, Richtung B + Q17): §2 Höhenbudget mit Cockpit-Kopf; §3 kompakter sticky Kopf, kein globaler Header in Reisen; §4.2 Fokus nach Festlegen (M-U10); neu §4.10 Cockpit-Kopf & Kennzahlen (Kennzahl-Box W09, Kacheln W10), §4.11 Vorschlag-Leiste W09, §4.12 Werkzeugleiste W08; §6 Erfolgsmomente ≤ 1 s / Feier ≤ 2,6 s (M-U2); §7.1 Bewegung; neu §7.5 Schalter „Bewegung reduzieren“, Feier für alle, Vibration (Q17); §10.2/§10.4 Glossar und Budgets für B. Entscheidungen: abstimmung-design §8–§9.
- 2026-10-08 (Auftraggeber-Entscheidungen): EN-Produktname „When do we go?“ (§3 Seitentitel, §4.5, §9, §10.2, EN-Teilen-Text Einladung §10.3, Mail-Betreff/Absender §10.5, neue Schreibregeln §10.6); Vermerke „vorbehaltlich Auftraggeber“ → „bestätigt (Auftraggeber 2026-10-08)“.
- 2026-10-08 (Abstimmungsrunde 2): Kalender-Maße 8 px / 4 px / 45,7 × 52 px (U-1), Zell-Anatomie und ✓/◐-Semantik (U-2, U-4, §4.9), Begriff „Alle dabei“ (U-14), Legende/Feiertagsliste (U-6, U-11), Snackbar-Variable `--ww-sticky-bar-h` (U-7), Tagesliste bei großer Schrift (U-5), Abstimmen-Segmente < 400 px und „Platz 1 / Top choice“ (U-8, U-9), Dark Mode nur System, Glossar ergänzt (zugängliche Namen „x von n Geht, k Zur Not“). CEO-Entscheidungen vorbehaltlich Auftraggeber sind markiert.
- 2026-10-10 (Inkrement 4): neu §12 – Bewertung der Abweichungen R-049, W09, Filter „Dauer“, Q20; §7.1 U-5 Tagesliste auf „vor Go-Live“ verschoben, Mindest-Fallback definiert.
- 2026-10-10 (Inkrement 5): neu §13 – Bewertung der Abweichungen B1–B9 (Datumsfelder statt Mini-Kalender, Fokus nach Festlegen per Weiterleitung, Stimmenliste, Frist/Erinnern, Mindestnächte, „Platz 1“, Teilen-Text, Vorfreude-Ring, Status-Reset) und Empfehlungen zu „Abstimmung abbrechen“ und Suchzeitraum in Phase 2/3; §10.3 Teilen-Text „Abstimmung“ ohne Frist ergänzt.
- 2026-10-20 (Feedback-Runde 1, Auftraggeber-Test der Live-Vorschau): neu §14 – Nächster-Schritt-Matrix N1/N2 inkl. „{Orga} Bescheid geben“ (14.1), Personen-Status + Erinnern für alle Mitglieder mit `RemindSheet` und WhatsApp als primärem Kanal (14.2, F-015 vorgezogen), Hinweis „Basiert auf x von n“ bei „Alle dabei“ (14.3), Phase 3 ohne Tabs als Reise-Hub mit Andockfläche, Deep-Links, Festlegung aufheben (14.4), Übergabeliste (14.5); Begriff „eingetragen“ statt „abgegeben“; Querverweise in §4.5, §4.10, §10.2, §10.3.
- 2026-10-22 (Cockpit Variante C): Hinweis in §14.4 – Aufbau Phase 3 wird mit der Ausbaustufe durch W16 v2 „Reiseverlauf“ abgelöst.
- 2026-10-23 (Inkrement 9, Unterkünfte): baureife Spezifikation in W17 F, W18 E, W16 v2.14 und W22 D (Abläufe, Zustände, Texte DE/EN, Responsive, Motion); Glossar-Ergänzung „Unterkunft / place to stay“, „festlegen (Unterkunft) / pick“, „Gefällt mir / Eher nicht“ = „Like / Pass“ (W18 E.10).
- 2026-10-23 (Geschlossene Beta „Stufe B“, PWA auf dem iPhone): neu §15 – Verweis auf W23 (Beta-Einstieg, Code vor Link, Install-Hinweis, PWA-Regeln Safe Areas/Statusleiste/Offline/Zurück-Wege/externe Links, Beta-Etikett + Feedback, Glossar-Ergänzungen).
