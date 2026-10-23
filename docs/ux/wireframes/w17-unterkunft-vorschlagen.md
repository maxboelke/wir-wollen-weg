# W17 – Unterkunft vorschlagen

Stand: 2026-10-23 · UI/UX · Status: **baureif für Inkrement 9** – Präzisierungen, Bearbeiten und Inkrement-9-Schnitt: **Abschnitt F (gilt vor den Abschnitten darüber)** · Feature **F-031** (Stufe 1), Q34 · Routen `/trips/{id}/stays/new`, `/trips/{id}/stays/{sid}/edit` · Daten/Sicherheit: [`features.md` R.7](../../product/features.md)
Prototyp: [`../mockups/reise-managen/index.html#/stay/new`](../mockups/reise-managen/index.html) · Einstieg: W18 Kopf-Taste `[+ Vorschlagen]`

## Ablauf (Flow R-1)
1. Mitglied tippt in W18 `[+ Vorschlagen]` (Kopf rechts, sichtbar solange keine Unterkunft festgelegt ist; max. 30 Vorschläge – danach Taste `aria-disabled` + «Maximal 30 Vorschläge pro Reise»).
2. Link einfügen → Server lädt Vorschau (best effort, ≤ 5 s). Währenddessen Ladezeile, **Formular bleibt bedienbar**.
3. Vorschau da → Karte mit Bild (über unseren Bild-Proxy) + Domain; **Titel wird vorbelegt**. Keine Vorschau (Portal blockt, Zeitlimit) → **Platzhalterkarte** «Keine Vorschau – das Portal lässt keinen Abruf zu. Kein Problem: Gib unten einen Titel ein, der Link funktioniert trotzdem.», Fokus springt ins leere Titel-Feld.
4. Optional Gesamtpreis (live «≈ 307 € pro Person (6 Reisende inkl. Platzhalter Mia)») und Notiz.
5. `[Vorschlag hinzufügen]` → zurück zu W18, Snackbar «Vorschlag hinzugefügt – er liegt jetzt im Swipe-Stapel.»; der neue Vorschlag ist auch im **eigenen** Stapel (alle bewerten alles).

## Wireframe mobil
```
┌────────────────────────────────────┐
│▓(←)  Kroatien 2027                ▓│  kompakter Kopf, Zurück → W18
│▓     Unterkunft vorschlagen       ▓│  h1
╰▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╯
│ Füge den Link aus Booking, Airbnb  │
│ & Co. ein – Titel und Bild holen   │
│ wir automatisch, wenn das Portal   │
│ es zulässt.                        │
│ Link zur Unterkunft                │
│ [https://…                       ] │  type=url, inputmode=url
│ ┌────────────────────────────────┐ │  Vorschau (aria-live=polite)
│ │ ░░░░░ Bild (Proxy) ░░░░░░░░░░░ │ │
│ │ [Vorschau · booking.com]       │ │
│ │ Haus Galeb – Meerblick …       │ │
│ │ Titel übernommen – du kannst   │ │
│ │ ihn unten ändern.              │ │
│ └────────────────────────────────┘ │
│ Titel                              │
│ [Haus Galeb – Meerblick & Terrasse]│
│ Gesamtpreis (optional)             │
│ [1.840                        € ]  │  inputmode=decimal
│ ≈ 307 € pro Person (6 Reisende …)  │  Live-Hilfe
│ Notiz (optional)                   │
│ [                                ] │
│ Alle in der Reise können das lesen.│        0/200
├────────────────────────────────────┤
│ [      Vorschlag hinzufügen      ] │  fixierte Aktionsleiste
│ Danach landet er bei allen im      │
│ Swipe-Stapel – auch bei dir.       │
└────────────────────────────────────┘
```

## Felder & Validierung (ux-spec §5)
| Feld | Regel | Fehlermeldung (inline, Icon + Text, `aria-invalid`) |
|---|---|---|
| Link | Pflicht, `https://`, gültige Domain | «Bitte füge einen Link ein.» / «Bitte einen vollständigen Link mit https:// einfügen.» |
| Titel | Pflicht, ≤ 80 Zeichen, vorbelegt aus Vorschau | «Bitte gib einen Titel ein.» |
| Gesamtpreis | optional, > 0, max. 2 Nachkommastellen, Währung der Reise | «Bitte einen Betrag wie 1.840 oder 1840,50 eingeben.» |
| Notiz | optional, ≤ 200, Zähler | – |
Validierung beim Absenden; danach live je Feld. Fokus auf das erste fehlerhafte Feld. Link prüfen auch bei `paste`/`change` (Vorschau starten).

## Zustände
- **Vorschau lädt:** Spinner + «Lade Vorschau von booking.com …» (erst nach 300 ms sichtbar). Absenden ist erlaubt – dann wird der Vorschlag ohne Bild gespeichert und das Bild später nachgeladen.
- **Vorschau fehlgeschlagen / blockiert:** Platzhalterkarte (gestreiftes Feld + Bett-Icon + Domain), nie Fehlerrot – das ist ein normaler Fall.
- **Doppelter Link:** Hinweis (Amber) «Diese Unterkunft hat Kemal schon vorgeschlagen.» + Text-Taste «Ansehen» – Absenden bleibt möglich? → **Nein**, Taste deaktiviert mit diesem Grund.
- **Unterkunft bereits festgelegt:** Route leitet auf W18 um, Snackbar «Die Unterkunft steht schon fest.»
- **Ungespeicherte Eingaben** beim Zurück: Bestätigung «Vorschlag verwerfen?» (ux-spec §3).

## Datenschutz/Technik (aus F-031, Q34)
Bilder nie direkt vom Portal in den Browser, sondern über den Bild-Proxy (kurzer Cache ≤ 7 Tage); Domain sichtbar auf jeder Karte; Link öffnet in neuem Tab mit `rel="noopener noreferrer"` + sichtbarem «↗» und sr-only «(öffnet neuen Tab)». Eigene Screenshots erst Stufe 2 (Inkrement 12).

## Desktop
Formular `content-narrow` 640 px, Vorschau-Karte rechts neben den Feldern ab 960 px (Raster 1fr 280 px).

---

## F. Inkrement-9-Schnitt und Präzisierungen (2026-10-23, gilt vor den Abschnitten oben)

Daten, Grenzen, SSRF-Schutz, Bild-Proxy, Token und Rate-Limits: [`features.md` R.7](../../product/features.md) I9-02 – I9-04 (gilt). Hier: Oberfläche, Abläufe, Texte. Bereich, Rechte und Phasen: [W18 E](w18-unterkunft-swipen.md).

### F.1 Ablauf Vorschlagen (ersetzt „Ablauf (Flow R-1)“ Schritt 2–3)
1. Einstieg: W18 Kopf-Taste `[+ Vorschlagen]` oder Leerzustand `[Unterkunft vorschlagen]`. Route nur in Phase `fixed`, keine Unterkunft festgelegt, < 30 Vorschläge – sonst Weiterleitung `/stays` mit Snackbar («Die Unterkunft steht schon fest.» bzw. Limit-Text W18 E.10). Fokus beim Öffnen auf h1 (kein Autofokus ins Feld – die Tastatur soll nicht ungefragt aufgehen; mobil tippt man ohnehin ins Feld).
2. Link einfügen/eingeben. **Vorschau startet** bei `paste` sofort, sonst bei `change`/Verlassen des Felds bzw. 600 ms nach der letzten Eingabe – jeweils nur, wenn der Link die Syntax-Prüfung besteht (F.2). Ein neuer Link bricht die laufende Vorschau ab. **Das Formular bleibt die ganze Zeit bedienbar.**
3. Vorschau-Ergebnis (Bereich `aria-live="polite"`, einmal je Ergebnis):

| Zustand | Anzeige | Titel-Feld |
|---|---|---|
| leer (noch kein gültiger Link) | kein Vorschau-Bereich | – |
| lädt (Spinner erst nach 300 ms) | Karte mit Spinner «Lade Vorschau von {domain} …» | unverändert |
| **ok** mit Bild | Karte: Bild (über unseren Proxy, per Token) · Chip «Vorschau · {Site-Name}» · Titel · «Titel übernommen – du kannst ihn unten ändern.» | wird **nur vorbelegt, wenn leer oder noch unverändert vorbelegt** (nie Eigenes überschreiben) |
| ok ohne Bild | Platzhalterfeld + Chip «Vorschau · {Site-Name}» + Titel + Satz wie oben | wie oben |
| ok ohne Titel | wie oben, Satz «Vorschau geladen – bitte gib unten einen Titel ein.» | bleibt leer |
| **keine Vorschau** (jeder Fehler: blockiert, Zeitlimit, Limit, unsicher – R.7 einheitlich) | **Platzhalterkarte** (gestreift + Bett-Icon + Domain): «Keine Vorschau – {domain} lässt keinen Abruf zu oder ist gerade langsam. Kein Problem: Gib unten einen Titel ein, der Link funktioniert trotzdem.» Neutraler Ton, **nie Fehlerrot**, **kein Fokussprung**. | bleibt, wie es ist |

4. Optional Gesamtpreis (Live-Hilfe «≈ 307 € pro Person ({n} Reisende)»; nennt Platzhalter, falls welche mitzählen: «(6 Reisende inkl. Mia)») und Notiz.
5. `[Vorschlag hinzufügen]` (Ladezustand in der Taste). Läuft die Vorschau noch oder kam keine: Absenden ist trotzdem erlaubt; der Server holt die Vorschau im Hintergrund nach (R.7 I9-02), bis dahin zeigt die Karte das Platzhalterfeld.
6. Erfolg → zurück zu `/stays`, Snackbar «Vorschlag hinzugefügt – er liegt jetzt im Swipe-Stapel.», Fokus auf die Swipe-Aufforderung (h2). Der eigene Vorschlag liegt auch im eigenen Stapel.

### F.2 Felder und Validierung (ersetzt die Tabelle oben, Grenzen aus R.7)
| Feld | Eingabe | Regel | Fehlermeldung (inline, Icon + Text, `aria-invalid`, `aria-describedby`) |
|---|---|---|---|
| Link zur Unterkunft | `type=url`, `inputmode=url`, `autocomplete=off`, `autocapitalize=off` | Pflicht; `https://`; ≤ 2 048; gültiger Hostname; keine Zugangsdaten, keine IP-Adresse. Eingaben ohne Schema (`booking.com/…`) werden beim Verlassen still zu `https://…` ergänzt. `http://` → Fehler. | «Bitte füge einen Link ein.» · «Bitte einen vollständigen Link mit https:// einfügen.» · «Dieser Link lässt sich nicht verwenden – kopier ihn am besten aus der Adresszeile des Portals.» (IP, Zugangsdaten, zu lang) |
| Titel | Text | Pflicht, ≤ 80; Zähler ab 70 | «Bitte gib einen Titel ein.» · «Höchstens 80 Zeichen.» |
| Gesamtpreis (optional) | `inputmode=decimal`, Währungssymbol als Suffix (Währung der Reise, R.7) | > 0, ≤ 1 000 000, max. 2 Nachkommastellen; Trennzeichen **nach Sprache der Oberfläche** (DE: «1.840» = 1840, «1840,50»; EN: «1,840», «1840.50»). Hilfe darunter: «Für alle Nächte und alle zusammen.» | DE «Bitte einen Betrag wie 1.840 oder 1840,50 eingeben.» · EN «Please enter an amount like 1,840 or 1840.50.» · «Bitte höchstens 1.000.000 eingeben.» |
| Notiz (optional) | Textfeld 2–4 Zeilen | ≤ 200, Zähler ab 160; Hilfe «Alle in der Reise können das lesen.» | «Höchstens 200 Zeichen.» |

Validierung beim Verlassen und beim Absenden, danach live je Feld; beim Absenden Fokus auf das erste fehlerhafte Feld (ux-spec §5). Server prüft alles erneut.

**Doppelter Link** (Normalisierung R.7): Hinweis (Amber) unter dem Link-Feld «Diese Unterkunft hat {Name} schon vorgeschlagen.» bzw. «Diese Unterkunft hast du schon vorgeschlagen.» + Text-Taste «Ansehen» (→ `/stays`, Fokus auf die Zeile). `[Vorschlag hinzufügen]` ist dann `aria-disabled` mit diesem Grund (`aria-describedby`). Geprüft beim Vorschau-Start und beim Absenden.

**Live-Hilfe pro Person:** erscheint, sobald ein gültiger Preis steht; Rundung und Anzahl nach R.7 / W18 E.6.2. Ohne Preis keine Zeile.

### F.3 Wireframe mobil (gilt, ersetzt den oberen nur in diesen Punkten)
- Kein Ortsfeld (CEO d).
- Platzhalterkarte ohne Fokussprung (s. F.1).
- Fixierte Aktionsleiste unten nur, solange die Tastatur zu ist; bei offener Tastatur steht die Taste am Formularende (kein Überdecken des aktiven Felds, 2.4.11).

### F.4 Bearbeiten (`/stays/{sid}/edit`)
- Wer: Urheber:in oder Orga; nicht nach «gebucht» für die festgelegte Unterkunft (R.7). Sonst Weiterleitung `/stays` ohne Fehlermeldung.
- Kopf: ← (Dialog «Änderungen verwerfen?» bei ungespeicherten Änderungen) · h1 «Vorschlag bearbeiten».
- Oben die Vorschau-Karte (nur Anzeige). **Link schreibgeschützt** als Text mit Hilfe «Den Link kannst du nicht ändern – lösch den Vorschlag und schlag die Unterkunft neu vor.».
- Felder Titel, Gesamtpreis, Notiz wie F.2. `[Speichern]` → `/stays`, Snackbar «Gespeichert.», Fokus auf die Zeile. Bewertungen bleiben (kein neues Bewerten nötig).
- Unten Text-Taste «Vorschlag löschen …» (Dialog W18 E.4) – fehlt bei der festgelegten Unterkunft.
- Konflikt (gleichzeitig bearbeitet): letzte Speicherung gewinnt; kein Hinweis nötig (selten, kleine Daten).

### F.5 Zurück / Abbrechen
Ungespeicherte Eingaben (irgendein Feld nicht leer) beim ← oder Browser-Zurück: Dialog «Vorschlag verwerfen?» · «Deine Eingaben gehen verloren.» · `[Weiter bearbeiten]` `[Verwerfen]`.

### F.6 Texte DE / EN
| Schlüssel (Vorschlag) | DE | EN |
|---|---|---|
| `stayForm.title` / `.editTitle` | Unterkunft vorschlagen · Vorschlag bearbeiten | Suggest a place · Edit suggestion |
| `stayForm.intro` | Füge den Link aus Booking, Airbnb & Co. ein – Titel und Bild holen wir automatisch, wenn das Portal es zulässt. | Paste the link from Booking, Airbnb & co. – we'll fetch the title and photo if the site allows it. |
| `stayForm.link` | Link zur Unterkunft | Link to the place |
| `stayForm.name` | Titel | Title |
| `stayForm.price` / `.priceHelp` | Gesamtpreis (optional) · Für alle Nächte und alle zusammen. | Total price (optional) · For all nights, everyone together. |
| `stayForm.perPerson` | ≈ {amount} pro Person ({count} Reisende) · mit Platzhaltern: ≈ {amount} pro Person ({count} Reisende inkl. {names}) | ≈ {amount} per person ({count} travellers) · ≈ {amount} per person ({count} travellers incl. {names}) |
| `stayForm.note` / `.noteHelp` | Notiz (optional) · Alle in der Reise können das lesen. | Note (optional) · Everyone on the trip can read this. |
| `stayForm.preview.loading` | Lade Vorschau von {domain} … | Loading preview from {domain} … |
| `stayForm.preview.ok` / `.chip` | Titel übernommen – du kannst ihn unten ändern. · Vorschau · {site} | Title filled in – you can change it below. · Preview · {site} |
| `stayForm.preview.noTitle` | Vorschau geladen – bitte gib unten einen Titel ein. | Preview loaded – please add a title below. |
| `stayForm.preview.none` | Keine Vorschau – {domain} lässt keinen Abruf zu oder ist gerade langsam. Kein Problem: Gib unten einen Titel ein, der Link funktioniert trotzdem. | No preview – {domain} doesn't allow it or is slow right now. No problem: add a title below, the link still works. |
| `stayForm.error.linkMissing` / `.linkInvalid` / `.linkUnusable` | Bitte füge einen Link ein. · Bitte einen vollständigen Link mit https:// einfügen. · Dieser Link lässt sich nicht verwenden – kopier ihn am besten aus der Adresszeile des Portals. | Please paste a link. · Please paste a full link starting with https://. · This link can't be used – best copy it from the site's address bar. |
| `stayForm.error.titleMissing` / `.tooLong` | Bitte gib einen Titel ein. · Höchstens {max} Zeichen. | Please add a title. · {max} characters max. |
| `stayForm.error.price` / `.priceMax` | Bitte einen Betrag wie 1.840 oder 1840,50 eingeben. · Bitte höchstens 1.000.000 eingeben. | Please enter an amount like 1,840 or 1840.50. · Please enter 1,000,000 or less. |
| `stayForm.duplicate` / `.duplicateOwn` / `.view` | Diese Unterkunft hat {name} schon vorgeschlagen. · Diese Unterkunft hast du schon vorgeschlagen. · Ansehen | {name} has already suggested this place. · You've already suggested this place. · View |
| `stayForm.submit` / `.submitHelp` | Vorschlag hinzufügen · Danach landet er bei allen im Swipe-Stapel – auch bei dir. | Add suggestion · It'll land in everyone's swipe stack – yours too. |
| `stayForm.added` | Vorschlag hinzugefügt – er liegt jetzt im Swipe-Stapel. | Suggestion added – it's now in the swipe stack. |
| `stayForm.linkLocked` | Den Link kannst du nicht ändern – lösch den Vorschlag und schlag die Unterkunft neu vor. | You can't change the link – delete the suggestion and suggest the place again. |
| `stayForm.save` / `.saved` / `.delete` | Speichern · Gespeichert. · Vorschlag löschen … | Save · Saved. · Delete suggestion … |
| `stayForm.discard.*` | Vorschlag verwerfen? · Deine Eingaben gehen verloren. · Weiter bearbeiten · Verwerfen | Discard suggestion? · What you've entered will be lost. · Keep editing · Discard |
| `stayForm.fixedAlready` | Die Unterkunft steht schon fest. | The place to stay is already picked. |

### F.7 Responsive, 200 %, Dark Mode, Barrierefreiheit
- 360 px einspaltig; ≥ 960 px Formular 640 px mit Vorschau-Karte rechts (Raster `1fr 280px`, DOM: Felder zuerst, Vorschau danach – Live-Region bleibt wirksam).
- 200 %: Vorschau-Bild entfällt unter 20 em Containerbreite (Chip + Titel bleiben); Suffix «€» bleibt im Feld (kein Abschneiden).
- Dark Mode: Platzhalterkarte nach D-48; Proxy-Bild ohne Filter.
- Labels sichtbar über den Feldern; Hilfe- und Fehlertexte per `aria-describedby`; Zähler nur visuell, ab Grenze-10 zusätzlich sr-Ansage «Noch 10 Zeichen» (polite, einmal).
- Motion: Vorschau-Karte erscheint mit Fade + `distance-sm` (`base`); Platzhalter ebenso – kein Wackeln, kein Rot. Reduziert: Fade 140 ms.

### F.8 Abnahme UX
Booking-Link mit Vorschau · Airbnb-Link (häufig blockiert → Platzhalter, kein Fokussprung) · Absenden während „lädt“ · Link ohne `https://` (still ergänzt) · `http://` (Fehler) · Duplikat eigen/fremd · Preis DE/EN-Format · 30er-Grenze (Weiterleitung) · Bearbeiten als Urheber/Orga, nach „gebucht“ gesperrt · Zurück mit Eingaben → Dialog · 360 px, 200 %, Dark, VoiceOver (Vorschau-Ansage einmal).
