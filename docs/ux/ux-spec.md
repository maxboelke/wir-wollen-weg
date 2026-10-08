# UX-Spezifikation – Wir wollen weg (MVP)

Stand: 2026-10-08 · Verantwortlich: UI/UX · Bezug: [sitemap.md](sitemap.md), [user-flows.md](user-flows.md), [Wireframes](wireframes/README.md), [abstimmung-design.md](abstimmung-design.md), [PRD](../product/PRD.md) §8

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
| Basis (`sm`) | 320–599 px | Entwurfsbreite **360 px**. Einspaltig, Seitenrand 16 px (Kalender: 12 px, s. abstimmung-design.md D-3). Kalender 7 Spalten volle Breite, ein Monat untereinander. Fixierte Aktionsleiste unten. Dialoge als Bottom-Sheets. |
| `md` | 600–959 px | Einspaltig, max. Inhaltsbreite 640 px (`--ww-size-content-narrow`) zentriert; Meine Reisen zweispaltige Kartenliste; Dialoge zentriert (max. 480 px); Kalenderzellen 64 px hoch. Werkzeugleiste Meine Tage bleibt unten fixiert. |
| `lg` | 960–1199 px | Reise: Inhalt + Seitenspalte (Gruppe: Heatmap links, Vorschläge rechts 340 px). Kalender 2 Monate nebeneinander. Werkzeugleiste Meine Tage oben über dem Kalender (sticky). Tagesdetail als Seitenpanel. |
| `xl` | ≥ 1200 px | Max. Inhaltsbreite 1040 px (`--ww-size-content-wide`) für Kalender, 1200 px gesamt. Meine Tage: 3 Monate nebeneinander; Gruppe: 2 Monate + Seitenspalte. |

In den Wireframes steht „Desktop“ für `lg`/`xl` (≥ 960 px).

- **Mindestens bedienbar ab 320 px** ohne horizontales Scrollen (WCAG 1.4.10 Reflow). Bei 320 px sinkt die Kalenderzelle auf ≈ 41 px Breite (zulässig, ≥ 24 px Minimum, s. §7.2).
- **Höhe:** Fixierte Leisten (Header + Tabs oben, Aktionsleiste unten) zusammen ≤ 40 % der Viewport-Höhe bei 640 px Höhe; bei Querformat mit < 480 px Höhe wird der Reise-Header beim Scrollen nach unten ausgeblendet und bei Scroll nach oben wieder eingeblendet.
- **Safe Areas:** `env(safe-area-inset-*)` für fixierte Leisten (iPhone, In-App-Browser-Toolbars).
- **Viewport:** `width=device-width, initial-scale=1`; **kein** `maximum-scale`/`user-scalable=no` (Zoom muss erlaubt sein). Eingabefelder ≥ 16 px Schrift, damit iOS nicht automatisch zoomt.
- **Dynamische Viewport-Höhe:** Bottom-Sheets und Vollbild-Ansichten mit `dvh`, damit In-App-Browser-Leisten nichts verdecken.

## 3. Navigation & Seitenverhalten

- Struktur siehe [sitemap.md](sitemap.md) §5. Tabs der Reise sind **Links** (eigene URLs, Zurück-Taste funktioniert), keine reinen JS-Tabs; `aria-current="page"` auf dem aktiven Tab (Muster: Navigationsleiste, nicht `role="tablist"`, da Seitenwechsel).
- **Zurück-Taste:** Jeder Flow-Schritt (E-Mail → Code → Name), jedes geöffnete Bottom-Sheet mit Inhalt (Tagesdetail, Teilen) und die Ansicht Vorschläge/Kalender erzeugen History-Einträge. Zurück schließt zuerst das Sheet, dann den Schritt.
- **Scrollposition** wird beim Zurückkehren wiederhergestellt; beim Tab-Wechsel beginnt der neue Tab oben – außer Meine Tage, der zum ersten Monat mit ungeklärten Tagen bzw. zum heutigen Monat springt.
- **Seitentitel** (`<title>`): «Meine Tage · Lissabon 2027 · Wir wollen weg» – Ansicht zuerst (Screenreader, Tab-Leiste).
- **Ungespeicherte Änderungen** (nur Formulare mit explizitem Speichern: Reise bearbeiten, Konto-Profil): Bestätigungsdialog beim Verlassen.

## 4. Komponenten-Verhalten

### 4.1 Buttons
- Varianten: primär (1 pro Ansicht), sekundär, Text, destruktiv. Beschriftung = Verb + Objekt («Reise anlegen», «Code senden»), max. 3 Wörter wo möglich.
- **Ladezustand:** Spinner im Button + Text bleibt (z. B. «Code senden …»), Button gesperrt gegen Doppelklick, Breite bleibt stabil. Ab 10 s: Hinweis unter dem Button «Dauert länger als üblich …».
- **Deaktiviert:** nur wenn der Grund danebensteht; sonst lieber aktiv lassen und bei Klick validieren.

### 4.2 Dialoge & Bottom-Sheets
- Mobil (< 600 px): Bottom-Sheet mit Griff, schließbar per Wischen nach unten, Tipp auf Hintergrund, `Esc`, Zurück-Taste. Desktop: zentrierter modaler Dialog.
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` = Überschrift; Fokus beim Öffnen auf die Überschrift (bei Bestätigungsdialogen) bzw. auf das erste Feld; Fokusfalle; beim Schließen Fokus zurück auf den Auslöser.
- **Destruktive Bestätigung:** Überschrift als Frage, Folgen in einem Satz, Buttons `[Abbrechen]` (sekundär, links/oben) und `[<Verb>]` (destruktiv). Standardfokus auf `[Abbrechen]`.
- Tagesdetail (Heatmap) ist **nicht modal** auf Desktop (Seitenpanel), damit man parallel im Kalender navigieren kann.

### 4.3 Snackbar (Toast)
- Position: unten, **über** der fixierten Aktionsleiste (nie verdeckend), Desktop unten links.
- Dauer: 6 s bei Aktion (Rückgängig), 4 s ohne; pausiert bei Hover/Fokus. Maximal eine gleichzeitig (neue ersetzt alte).
- `role="status"` (höflich). Fehler, die Handeln erfordern, **nicht** als Snackbar, sondern inline oder als Banner.
- Aktion in der Snackbar ist per Tastatur erreichbar (Kurzbefehl Strg/Cmd+Z für Rückgängig zusätzlich), WCAG 2.2.1: Zeit reicht, weil Rückgängig auch über die Werkzeugleiste dauerhaft erreichbar ist.

### 4.4 Code-Eingabe (F-040, F-041)
- **Ein** `<input>`: `type="text"`, `inputmode="numeric"`, `autocomplete="one-time-code"`, `pattern="[0-9]*"`, `maxlength` 6 (nach Bereinigung), `autocapitalize="off"`, `spellcheck="false"`. **Keine** sechs Einzelfelder (brechen Einfügen, Autofill, Screenreader, Korrektur).
- Optik darf segmentiert wirken (Designer: Zeichenabstand/Hintergrundkästen), technisch bleibt es ein Feld.
- Einfügen: Leerzeichen, Bindestriche und Nicht-Ziffern entfernen; bei genau 6 Ziffern automatisch absenden.
- Label sichtbar: «6-stelliger Code»; Beschreibung (aria-describedby): «Gesendet an kemal@… · gültig 15 Minuten».
- Fehler: Feld markieren, Text darunter, Inhalt **markiert lassen** (schnelles Überschreiben), Fokus bleibt.
- «Code erneut senden»: Textbutton mit Countdown «Neuer Code in 0:27» (Countdown wird für Screenreader nicht sekündlich angesagt; nur „Jetzt verfügbar“ einmal).
- «Angemeldet bleiben»: Standard **an** (Zielgruppe nutzt eigene Handys; In-App-Browser verlieren Sitzungen sonst oft). Im Login-Formular sichtbar, im Einladungsflow nur als Textzeile «Du bleibst auf diesem Gerät angemeldet. [Ändern]», um das Formular schlank zu halten.

### 4.5 Teilen-Sheet (F-002, F-010, F-012, F-015, F-046)
- Inhalt: Vorschau-Textfeld (editierbar, mehrzeilig, Auto-Höhe), Sprachumschalter `DE | EN` (Radiogruppe; Wechsel ersetzt den Text – wenn bearbeitet, vorher Rückfrage «Deine Änderungen am Text gehen verloren»), Link als eigene Zeile mit `[Kopieren]`.
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
| Erfolg großer Meilenstein | Eigene Erfolgsansicht/-karte: Beitritt, Abgabe, Abstimmung gestartet, Termin festgelegt. Dezente Animation (≤ 600 ms, entfällt bei `prefers-reduced-motion`). |
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
- **Bewegung:** `prefers-reduced-motion` → keine Animationen außer Opazität; nichts blinkt.
- **Textvergrößerung** 200 % und Textabstände (1.4.12) ohne Abschneiden; Zellen wachsen in der Höhe, Labels umbrechen.
- **Dark Mode** (falls Designer ihn liefert): alle obigen Kontrastregeln gelten auch dort.

### 7.2 Zielgrößen & Fokus
- **Ziel 44 × 44 px** für alle Bedienelemente auf Touch (Kalenderzellen bei 360 px ≈ 46 × 52 px, s. abstimmung-design.md D-3). **Minimum 24 × 24 px** (SC 2.5.8) nur für sekundäre Inline-Elemente (z. B. Info-Icon im Fließtext) mit ausreichend Abstand.
- Abstand zwischen benachbarten Zielen ≥ 4 px **oder** Zellen grenzen ohne Lücke an, sind aber ≥ 44 px (Kalender).
- **Fokus sichtbar** auf allen Elementen: Fokusring ≥ 2 px, Kontrast ≥ 3:1 gegen Hintergrund **und** gegen Zellfarbe (Heatmap); `:focus-visible`.
- **Fokus nicht verdeckt (2.4.11):** `scroll-padding-top/bottom` = Höhe der fixierten Leisten, damit fokussierte Kalendertage nie unter Header/Werkzeugleiste liegen.
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
- **Zugänglicher Name** je Tag: Wochentag, Datum, ggf. «heute», «Wochenende», «Feiertag <Name>», Zustand. Heatmap: «6 von 7 können, 1 zur Not, alle können» bzw. «… nicht: Jonas» (Namen max. 3, sonst Anzahl). Die sichtbare Zahl ist Teil der Beschreibung, nicht alleiniger Name.
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

**Hilfe (3.2.6):** «Hilfe» im Footer und im Avatar-Menü an gleicher Stelle auf allen Seiten.

### 7.4 Weitere ARIA-Muster
- Tabs der Reise: `<nav aria-label="Reise">` mit Links, `aria-current="page"`.
- Segment Vorschläge/Kalender: zwei Links/Buttons mit `aria-pressed` bzw. `aria-current`, da URL-wirksam.
- Abstimmen Ja/Vielleicht/Nein: Radiogruppe je Option, `aria-labelledby` = Zeitraum der Option; unbestätigter Vorschlag: Radio **nicht** ausgewählt, Beschreibung «Vorschlag: Nein – aus deinen Tagen».
- Fortschritt: `<progress>` mit sichtbarem Text «5 von 7».
- Phasen-Chip: Text, kein reines Icon.
- Snackbar `role="status"`; kritische Fehler `role="alert"`.
- Bilder: Illustrationen in Leerzuständen dekorativ (`alt=""`); informative Icons ohne Text bekommen `aria-label` (z. B. Kommentar-Symbol «Kommentar von Kemal»).

## 8. Interaktions-Details nach Ansicht (Kurzreferenz)

| Ansicht | Kernregeln | Flow |
|---|---|---|
| Einladung | Ein URL-Zustandsautomat, Kontext-Karte immer sichtbar, `pendingAuth` | A |
| Meine Tage | Pinsel, Tippen = Umschalten, Ziehen = Datumsbereich, Bereichsmodus, Undo, Autosave, Abgabe | B |
| Gruppe | Vorschläge zuerst (mobil), lokale Filter, Tagesdetail mit Tag-für-Tag-Navigation | C |
| Abstimmen | Vorbelegung bestätigen, Sofortspeichern, Ergebnisse nach eigener Stimme | D |
| Meine Reisen | To-dos zuerst, Karten mit Phase + Fortschritt | E |

**Zeit & Datum:** Alle Tage sind Kalendertage in der Zeitzone der Reise (PRD §8); die UI zeigt nie Uhrzeiten, außer «zuletzt geändert 14:32» (lokale Zeit des Betrachters).

**Zeitraum-Schreibweise:** Anreise–Abreise mit Halbgeviertstrich, Nächte explizit: «Mi., 5. Mai – Mo., 10. Mai · 5 Nächte». Gleicher Monat kurz: «5.–10. Mai». Jahr nur, wenn nicht das aktuelle Jahr oder wenn der Zeitraum den Jahreswechsel kreuzt.

## 9. Internationalisierung (F-046)

- Sprache und Region getrennt (Flow F). Formate über `Intl.DateTimeFormat` mit Konto-Region (`de-DE`, `de-AT`, `de-CH`, `en-GB`, `en-US`).
- **Wochenstart:** Region (Mo für DE/AT/CH/GB, So für US), überschreibbar im Konto. Wochenende = Sa+So immer (alle unterstützten Regionen).
- **Text-Expansion:** Layouts für **DE + 30 %** auslegen (DE ist in der Regel die längere Sprache; EN-Strings können in Einzelfällen länger sein, z. B. „If needed“ vs. „Zur Not“). Keine fixen Breiten für Texte; Buttons dürfen unter 600 px auf zwei Zeilen umbrechen, außer Kalenderzellen und Tabs (dort Zeichenbudget §10.4).
- Pluralformen über ICU MessageFormat («{count, plural, one {# Nacht} other {# Nächte}}»).
- Namen (nutzergeneriert) nie übersetzen, nie kürzen ohne Tooltip/Volltext im Detail.
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
| App-Name | Wir wollen weg | Wir wollen weg (nicht übersetzen; EN-Unterzeile laut Designer-Wortmarke: „Find dates for your group trip“) |
| Reise | Reise | Trip |
| Suchzeitraum | Zeitraum (für die Suche) | Date range |
| Mindestdauer / Wunschdauer | mindestens … Nächte / am liebsten … Nächte | at least … nights / ideally … nights |
| Tageszustand geht | Geht | Works |
| ginge zur Not | Zur Not | If needed |
| geht nicht | Geht nicht | Can't |
| abgeben (Verfügbarkeit) | Tage abgeben / eintragen | Submit dates / add your dates |
| Heatmap | Kalender (der Gruppe) | Group calendar |
| Kandidaten | Vorschläge | Suggestions |
| alle können / fast alle | Alle können / Fast alle können | Everyone's free / Almost everyone |
| Abstimmung | Abstimmung / abstimmen | Vote / voting |
| Ja / Vielleicht / Nein | Ja / Vielleicht / Nein | Yes / Maybe / No |
| festlegen | Termin festlegen | Lock in dates |
| Organisator | Orga | Organizer |
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
- EN: «We want to get away: {trip}! Add your dates by {deadline} – takes 2 minutes: {link}»
  - ohne Frist: «We want to get away: {trip}! Add the dates that work for you – takes 2 minutes: {link}»

**Abstimmung gestartet (F-010)**
- DE: «Abstimmung für {trip} läuft! Es gibt {count} Vorschläge – stimm bis {deadline} ab: {link}»
- EN: «Voting for {trip} is open! {count} options to choose from – vote by {deadline}: {link}»

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
| Kalenderzelle | nur Ziffern/Symbole | – |
| Snackbar | ≤ 60 + Aktion ≤ 12 | „8 Tage auf ‚geht nicht‘ gesetzt“ · „Rückgängig“ / „Undo“ |
| Überschrift h1 mobil | ≤ 28 je Zeile, max. 2 Zeilen | – |
| Reisename (Nutzer) | bis 80; Anzeige gekürzt mit „…“ in Header (1 Zeile), Karten (2 Zeilen), vollständig auf Übersicht | – |
| Anzeigename (Nutzer) | bis 40; Listen 1 Zeile mit „…“ und Volltext in Detail | – |

### 10.5 Transaktionsmails (Kurzfassung für Operations/Developer)
- Betreff DE: «{code} ist dein Code für Wir wollen weg» · EN: «{code} is your Wir wollen weg code» (Code im Betreff → sichtbar in Mitteilungs-Vorschau, kein App-Wechsel nötig).
- Body: Code groß und als erstes; darunter «Oder tippe hier, um dich anzumelden: [Anmelden]»; Hinweis «Gültig für 15 Minuten. Du hast das nicht angefordert? Dann ignoriere diese Mail.» Im Einladungskontext erste Zeile: «Du trittst „{trip}“ bei.» Keine Tracking-Links (F-042).
- Plain-Text-Teil enthält Code in eigener Zeile (für OS-Code-Erkennung).

## 11. Datenschutz in der Oberfläche
- Einladungs-Vorschau zeigt nie Namen außer Orga-Vorname (F-003).
- Hinweis Datenschutz/Nutzungsbedingungen als Satz unter dem Namensfeld bzw. E-Mail-Feld: «Mit dem Fortfahren akzeptierst du die [Nutzungsbedingungen] und hast den [Datenschutzhinweis] gelesen.» – Links öffnen in neuem Tab (Flow bleibt erhalten).
- Kommentar-Feld: Hinweis «Alle in der Reise können das lesen.»
- Keine Tracker, kein Cookie-Banner (F-013); Sprache-Cookie ist technisch notwendig.
