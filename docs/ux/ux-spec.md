# UX-Spezifikation – Wir wollen weg (MVP)

Stand: 2026-10-08 (Runde 3: Look & Feel 2.0 Richtung B „Reise-Cockpit“, Q17 Motion/Haptik) · Verantwortlich: UI/UX · Bezug: [sitemap.md](sitemap.md), [user-flows.md](user-flows.md), [Wireframes](wireframes/README.md), [abstimmung-design.md](abstimmung-design.md), [PRD](../product/PRD.md) §8

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
| Kennzahl-Box Gruppe (B) | 5 von 7 haben abgegeben · Alle haben abgegeben. | 5 of 7 have submitted · Everyone has submitted. |
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

## Änderungen
- 2026-10-08 (Runde 3, Richtung B + Q17): §2 Höhenbudget mit Cockpit-Kopf; §3 kompakter sticky Kopf, kein globaler Header in Reisen; §4.2 Fokus nach Festlegen (M-U10); neu §4.10 Cockpit-Kopf & Kennzahlen (Kennzahl-Box W09, Kacheln W10), §4.11 Vorschlag-Leiste W09, §4.12 Werkzeugleiste W08; §6 Erfolgsmomente ≤ 1 s / Feier ≤ 2,6 s (M-U2); §7.1 Bewegung; neu §7.5 Schalter „Bewegung reduzieren“, Feier für alle, Vibration (Q17); §10.2/§10.4 Glossar und Budgets für B. Entscheidungen: abstimmung-design §8–§9.
- 2026-10-08 (Auftraggeber-Entscheidungen): EN-Produktname „When do we go?“ (§3 Seitentitel, §4.5, §9, §10.2, EN-Teilen-Text Einladung §10.3, Mail-Betreff/Absender §10.5, neue Schreibregeln §10.6); Vermerke „vorbehaltlich Auftraggeber“ → „bestätigt (Auftraggeber 2026-10-08)“.
- 2026-10-08 (Abstimmungsrunde 2): Kalender-Maße 8 px / 4 px / 45,7 × 52 px (U-1), Zell-Anatomie und ✓/◐-Semantik (U-2, U-4, §4.9), Begriff „Alle dabei“ (U-14), Legende/Feiertagsliste (U-6, U-11), Snackbar-Variable `--ww-sticky-bar-h` (U-7), Tagesliste bei großer Schrift (U-5), Abstimmen-Segmente < 400 px und „Platz 1 / Top choice“ (U-8, U-9), Dark Mode nur System, Glossar ergänzt (zugängliche Namen „x von n Geht, k Zur Not“). CEO-Entscheidungen vorbehaltlich Auftraggeber sind markiert.
- 2026-10-10 (Inkrement 4): neu §12 – Bewertung der Abweichungen R-049, W09, Filter „Dauer“, Q20; §7.1 U-5 Tagesliste auf „vor Go-Live“ verschoben, Mindest-Fallback definiert.
- 2026-10-10 (Inkrement 5): neu §13 – Bewertung der Abweichungen B1–B9 (Datumsfelder statt Mini-Kalender, Fokus nach Festlegen per Weiterleitung, Stimmenliste, Frist/Erinnern, Mindestnächte, „Platz 1“, Teilen-Text, Vorfreude-Ring, Status-Reset) und Empfehlungen zu „Abstimmung abbrechen“ und Suchzeitraum in Phase 2/3; §10.3 Teilen-Text „Abstimmung“ ohne Frist ergänzt.
