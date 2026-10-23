# W20 – Persönliche Reisedaten: Anfrage, Einwilligung, Ausfüllen, Status

Stand: 2026-10-23 · UI/UX · Status: **baureif für Inkrement 11 – es gilt Abschnitt H (Inkrement-11-Schnitt), er geht A–G vor**; A–G bleiben als Entwurf/Verlauf stehen (echte Daten erst nach Gate **G1b**) · Features **F-054**, **F-056**, Q28–Q31 · Routen `/trips/{id}/travel-data`, `/travel-data/new`, `/travel-data/{requestId}`
Prototyp: [`#/data`](../mockups/reise-managen/index.html) (als Max: Anfrage beantworten; als Lena: Stand, Anzeigen/Kopieren, neue Anfrage). Tipp: als Max freigeben, dann auf Lena umschalten, „Anzeigen“ tippen, zurück zu Max → Zugriffsprotokoll.

## Grundregeln (PM-Empfehlungen übernommen)
- **Anfrage → Freigabe.** Daten werden nur auf konkrete Anfrage einer Person mit Markierung **„bucht“** (F-056, max. 3, Standard Orga) erfasst und **nur an diese Person** freigegeben. Orga ohne „bucht“ und alle anderen sehen **nur den Status**.
- **Erst nach der Festlegung** (Phase 3). Standardfelder: **Name laut Ausweis + Geburtsdatum**. Weitere Felder nur, wenn „bucht“ sie ausdrücklich anfragt (Dokumentnummer mit Warnhinweis). **Nie:** Scans/Fotos, Adresse, Freitext.
- Nur pro Reise (Q30), verschlüsselt, Löschung **7 Tage nach Reiseende** bzw. sofort bei Widerruf/Verlassen/Entzug „bucht“/„Erledigt – Daten löschen“.
- In Demo/Vorschau überall der Hinweis **«Demo – bitte keine echten Ausweisdaten eingeben.»**

## A. Mitglied – offene Anfrage (Einstieg aus „Für dich zu tun“ oder Kachel)
```
┌────────────────────────────────────┐
│▓(←) Kroatien 2027                 ▓│
│▓    Reisedaten                    ▓│
╰▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╯
│ ┌────────────────────────────────┐ │
│ │ (LE) [bucht] · 28. April       │ │
│ │ Lena bucht „Flüge München –    │ │  h2
│ │ Split“                         │ │
│ │ Lena bittet um:                │ │
│ │  • Name laut Ausweis           │ │
│ │  • Geburtsdatum                │ │
│ │ 🛡 Nur Lena sieht deine Angaben.│ │  Info-Hinweis
│ │   Automatisch gelöscht am      │ │
│ │   Sa., 26. Juni.               │ │
│ │ [      Angaben eingeben      ] │ │  Hauptaktion
│ │   Ich kläre das direkt mit Lena│ │  Text-Taste, ohne Begründung
│ └────────────────────────────────┘ │
│ (i) Wer sieht was?             ▾   │  <details>: Regeln in 4 Sätzen
└────────────────────────────────────┘
```

## B. Ausfüllen – Schritt 1 von 2 „Angaben“
```
│▓    Reisedaten für Lena           ▓│
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓ ░░░░░░░░░░░░░        │  Schritt-Balken, aria-hidden
│ Schritt 1 von 2 · Angaben          │
│ ⚠ Demo – bitte keine echten        │
│   Ausweisdaten eingeben.           │
│ Schreib alles genau wie im Ausweis,│
│ inklusive zweiter Vornamen – sonst │
│ kann die Airline das Ticket        │
│ ablehnen.                          │
│ Vorname(n) laut Ausweis            │
│ [                                ] │  autocomplete=given-name
│ Nachname(n) laut Ausweis           │
│ [                                ] │  autocomplete=family-name
│ Geburtsdatum                       │
│ [TT.MM.JJJJ                      ] │  inputmode=numeric, autocomplete=bday
│ Format TT.MM.JJJJ, z. B. 07.04.1995│
├────────────────────────────────────┤
│ [             Weiter             ] │
└────────────────────────────────────┘
```
Zusatzfelder (nur wenn angefragt): Anrede laut Ausweis (Radio w/m/x), Staatsangehörigkeit (Auswahl Länderliste), Dokumentart (Reisepass/Personalausweis) + Dokumentnummer (Großbuchstaben, ohne Leerzeichen), Ablaufdatum, Ausstellungsland. Hinweis **nur für die Person selbst**, wenn das Dokument vor Reiseende abläuft: «Dein Dokument läuft vor der Rückreise ab.» (Amber).
Validierung: alle angefragten Felder Pflicht; Datum `TT.MM.JJJJ` und plausibel (nicht in der Zukunft). Meldungen: «Bitte gib deine Vornamen ein.» · «Bitte im Format TT.MM.JJJJ eingeben.»

## C. Schritt 2 von 2 „Freigeben“ (Einwilligung, Art. 6 Abs. 1 lit. a)
```
│ Schritt 2 von 2 · Freigeben        │
│ ┌────────────────────────────────┐ │
│ │ Das gibst du frei              │ │
│ │ Vorname(n)   Max               │ │
│ │ Nachname(n)  Mustermann        │ │
│ │ Geburtsdatum 07.04.1995        │ │
│ │ Angaben ändern                 │ │  zurück zu Schritt 1, Werte bleiben
│ └────────────────────────────────┘ │
│ ┌────────────────────────────────┐ │
│ │ [ ] Ich gebe diese Angaben für │ │  Checkbox NICHT vorangekreuzt
│ │ „Flüge München – Split“ an Lena│ │
│ │ frei. Sie werden verschlüsselt │ │
│ │ gespeichert, nur Lena sieht    │ │
│ │ sie, und sie werden am         │ │
│ │ Sa., 26. Juni automatisch      │ │
│ │ gelöscht. Ich kann die Freigabe│ │
│ │ jederzeit zurückziehen.        │ │
│ └────────────────────────────────┘ │
├────────────────────────────────────┤
│ [ 🛡 An Lena freigeben          ] │  aktiv; ohne Häkchen → Fehler unter der Checkbox
│   Ich kläre das direkt mit Lena    │
└────────────────────────────────────┘
```
Ohne Häkchen: «Bitte bestätige die Freigabe – oder kläre es direkt mit Lena.» (Fokus auf Checkbox). Nach Freigabe: zurück zu W20, Snackbar «Freigegeben an Lena», Kachel/To-do aktualisiert.

## D. Mitglied – Status nach Freigabe
```
│ ┌────────────────────────────────┐ │
│ │ (✓) Freigegeben an Lena        │ │  Siegel klein
│ │     Für „Flüge München – Split“│ │
│ │ Vorname(n)   Max               │ │  eigene Daten im Klartext (nur für sich selbst)
│ │ Nachname(n)  Mustermann        │ │
│ │ Geburtsdatum 07.04.1995        │ │
│ │ 🛡 Wird am Sa., 26. Juni        │ │
│ │   automatisch gelöscht.        │ │
│ │ Zugriffe                       │ │  Zugriffsprotokoll (ohne Inhalte)
│ │ 👁 Lena hat deine Angaben heute │ │
│ │   angesehen.                   │ │
│ │ 👁 Lena hat „Geburtsdatum“ heute│ │
│ │   kopiert.                     │ │
│ │ [Angaben ändern]  Freigabe     │ │
│ │                   zurückziehen │ │  destruktiv leise → Bestätigung
│ └────────────────────────────────┘ │
```
- **Ändern:** Formular vorbelegt; „bucht“ sieht «geändert am …».
- **Zurückziehen:** Sheet «Freigabe zurückziehen? Lena sieht deine Angaben dann nicht mehr – sie werden sofort gelöscht.» `[Abbrechen]` `[Zurückziehen]` (Standardfokus Abbrechen). Danach wieder Zustand A.
- **Abgelehnt („kläre es direkt“):** Karte «Du klärst das direkt mit Lena» + «Lena sieht nur „klärt es direkt“, keinen Grund.» + `[Doch freigeben]`.
- **Freigabe erloschen** (Lena nicht mehr „bucht“ / hat die Reise verlassen): Karte «Lena bucht nicht mehr – deine Angaben wurden gelöscht.»

## E. Sicht „bucht“ (Lena)
```
│▓(←) Kroatien 2027      [+ Anfrage]▓│
│▓    Reisedaten                    ▓│
│ 🛡 Du bist als „bucht“ markiert. Du │  Verantwortungs-Hinweis (Info)
│   siehst nur, was dir jemand       │
│   ausdrücklich freigibt. Was du    │
│   außerhalb der App damit machst … │
│   bitte nicht in Chats weiterleiten│
│ ┌────────────────────────────────┐ │
│ │ Deine Anfrage · 28. April      │ │
│ │ Flüge München – Split          │ │
│ │ Name laut Ausweis · Geburtsdatum│ │
│ │ 2 von 4 haben freigegeben      │ │
│ │ ▓▓▓▓▓▓▓░░░░░░░                 │ │
│ └────────────────────────────────┘ │
│ ┌ (KE) Kemal          [✓ freigegeben]┐
│ │ Vorname(n)  K•••            [⧉]│ │  maskiert; Kopieren je Feld (44 px)
│ │ Nachname(n) Y•••            [⧉]│ │
│ │ Geburtsdatum ••.••.••••     [⧉]│ │
│ │ [👁 Anzeigen]                  │ │  aria-pressed; jede Anzeige/Kopie wird protokolliert
│ └────────────────────────────────┘ │
│ ┌ (JO) Jonas               [◷ offen]┐
│ ┌ (MI) Mia        [noch nicht dabei]┐  «Bekommt die Anfrage, sobald Mia beitritt.»
│ [🔔 Max, Jonas erinnern]  Erledigt – Daten löschen │
```
- Maskierung standardmäßig; «Anzeigen» gilt für diese Person bis Verlassen der Seite. **Kopieren** schreibt in die Zwischenablage, Snackbar «Kopiert – bitte nicht in Chats weiterleiten.»
- **Re-Authentifizierung** vor dem ersten Anzeigen fremder **Dokumentnummern** in einer Sitzung, wenn letzte Anmeldung > 12 h (Code-Sheet wie W02).
- Kein Sammel-Export, kein CSV, kein Druck-Layout.
- **Erinnern:** Teilen-Text «Hey! Lena bucht die Flüge für Kroatien 2027 und braucht noch deine Reisedaten. Hier geht's direkt hin: <Link>» (Link ohne Daten, nur Route).
- **Erledigt – Daten löschen:** Bestätigung «Anfrage abschließen? Alle freigegebenen Angaben dieser Anfrage werden sofort gelöscht. Hast du alles gebucht?»
- Orga **ohne** „bucht“: sieht nur Karte mit «2 von 4 haben freigegeben» und Status-Chips, keine Felder, keine Anzeigen-Taste.

## F. Neue Anfrage (nur „bucht“)
```
│▓    Reisedaten anfragen           ▓│
│ Wofür brauchst du die Daten?       │
│ [z. B. Fähre Split – Hvar        ] │  Pflicht, ≤ 60, alle Gefragten sehen den Zweck
│ ┌ Welche Angaben? ───────────────┐ │
│ │ Name laut Ausweis   🔒 [■■ an] │ │  immer an, nicht abschaltbar
│ │ Geburtsdatum           [■■ an] │ │  Standard an
│ │ Anrede laut Ausweis    [□□ aus]│ │
│ │ Staatsangehörigkeit    [□□ aus]│ │
│ │ Dokumentart + -nummer  [□□ aus]│ │  an → Warnhinweis + nächste zwei Schalter werden bedienbar
│ │ ⚠ Nur anfragen, wenn die Buchung│ │
│ │   sie wirklich verlangt – inner-│ │
│ │   halb Europas genügt meist der │ │
│ │   Name. …                       │ │
│ │ Ablaufdatum            [□□ aus]│ │  deaktiviert mit Grund «Nur zusammen mit der Dokumentnummer»
│ │ Ausstellungsland       [□□ aus]│ │
│ └────────────────────────────────┘ │
│ Wen fragst du?                     │
│ (MA Max ✓)(KE Kemal ✓)(SA Sara ✓)  │  Standard: alle Reisenden
│ (JO Jonas ✓)(MI Mia · bekommt es nach Beitritt ✓)│
│ Nie abgefragt: Ausweisfotos/-scans,│
│ Adresse, Freitext. …               │
├────────────────────────────────────┤
│ [         Anfrage senden         ] │
└────────────────────────────────────┘
```
Schalter: `input type=checkbox role=switch`, ganze Zeile ≥ 56 px, Label links. Nach dem Senden: Snackbar «Anfrage an 5 Personen gesendet»; die Gefragten sehen das To-do im Cockpit (Mails erst mit F-014 und nur «Lena bittet um deine Reisedaten»).

## G. Danach
Nach dem 26. Juni: Leerzustand «Reisedaten gelöscht – Am Sa., 26. Juni – 7 Tage nach der Reise, wie angekündigt. Auch das Zugriffsprotokoll ist gelöscht.» Kachel «Gelöscht am 26. Juni».

## Barrierefreiheit & Datenschutz in der Oberfläche
Masken-Text hat zugänglichen Namen «verborgen» (sr-only) statt Punkte vorzulesen; Kopieren-Tasten mit Namen «Geburtsdatum von Kemal kopieren»; Einwilligungstext ist das Label der Checkbox; keine sensiblen Werte in `<title>`, URLs, Snackbars, Mails oder Logs; Felder `autocomplete` nur für die eigene Eingabe, im „bucht“-Blick `autocomplete=off`; Seite nicht vom Browser-Cache wiederherstellen (`Cache-Control: no-store`, Developer).

## Desktop
Mitglied: Karte max. 640 px. „bucht“: Personen-Karten in 2 Spalten ab 960 px.

---

## H. Inkrement-11-Schnitt – „Bucht“ + persönliche Reisedaten (2026-10-23, gilt vor A–G)

Grundlage: PRD Q28–Q31, Q36, UX-2, NFR „Sensible Reisedaten“ (§8), `features.md` F-054/F-056 und R.4/R.5. Daten, Rechte, Lebenszyklus, Verschlüsselung und Grenzen regelt `features.md` **R.9** (PM, 2026-10-23) – dort gilt R.9. Dieser Abschnitt regelt **Oberfläche, Abläufe, Zustände und Texte**; die sieben „Hinweise an UI/UX“ aus R.9 sind eingearbeitet (Nachweis H.17). Rest-Punkt an PM/CEO: H.17. Cockpit-Anbindung: [W16 v2.16](w16-cockpit.md). „Bucht“-Rechte in anderen Bereichen: [W22 E](w22-infoseite.md), [W18 E.16](w18-unterkunft-swipen.md).

Beispiel wie oben: Kroatien 2027, Sa., 12. – Sa., 19. Juni, Lena = Orga + „Bucht“, Sara = „Bucht“ (Fähre), Max = du, Mia = Platzhalter. Löschdatum = Abreisetag + 7 Tage = **Sa., 26. Juni**.

### H.0 Was sich gegenüber A–G ändert

| Thema | A–G (Entwurf) | **gilt jetzt** | Grund |
|---|---|---|---|
| Geburtsdatum | ein Textfeld `TT.MM.JJJJ` | **drei Felder Tag · Monat · Jahr** in einem `fieldset` (Reihenfolge nach Region, `en-US` Monat zuerst) | Regionen `en-US`/`en-GB` machen «07/04/1995» mehrdeutig; Muster für bekannte Daten (GOV.UK), funktioniert mit Ziffernblock, Autofill (`bday-day/-month/-year`) und Screenreader; kein Kalender-Widget (Jahrzehnte zurückblättern) |
| Anrede | Radio w/m/x «Anrede laut Ausweis» | **«Geschlecht laut Ausweis»** mit F / M / X (wie im Pass), Hilfe «Airlines fragen das als Anrede ab.» | Pass zeigt „Geschlecht“, nicht „Anrede“; Kürzel F/M/X sind das, was man abtippt |
| Station V4 „bucht“ ohne Anfrage | als Nächstes | **immer „später“, zählt nicht im Weg-Meta, nie Aufgabe** (W16 v2.16; Demo-Seed R.9 „als Nächstes“ entsprechend lesen) | Datensparsamkeit: Die App drängt niemanden, Ausweisdaten einzusammeln |
| V4 „bucht“: alle beantwortet | dran bis «Erledigt – Daten löschen» | **dran, bis „Bucht“ die Angaben einmal angesehen oder kopiert hat**, dann erledigt; Abschließen bleibt freiwillig | sonst steht wochenlang eine Aufgabe unter „Heute“, die man vor der Reise nicht erledigen will (Fähre-Check-in braucht die Namen evtl. noch) |
| Kachel „Reisedaten“ | nur „Bucht“ | **„Bucht“ mit Daten und jede Person mit eigener gespeicherter Freigabe** (R.9 I11-03) | Widerruf und Zugriffsprotokoll so leicht erreichbar wie die Freigabe (Art. 7 Abs. 3 DSGVO) |
| Platzhalter | «bekommt es nach Beitritt» | bleibt – **keine Daten für Platzhalter, auch nicht durch die Orga** (H.10) | Einwilligung kann nur die Person selbst geben |
| Erinnern-Text | eigener Text in E | **ein** Text: Anlass `travel-data` (H.7.6 = W16 v2.16) | eine Quelle |
| Anfrage ändern | – | **Zweck und Felder nie ändern** (Einwilligung gilt je Anfrage); nur **Personen hinzufügen/entfernen** und **abschließen** (R.9 I11-04, I11-09) | geänderte Felder bräuchten neue Einwilligung aller |
| Festlegung aufgehoben / Termin geändert | – | **wie R.9 I11-10:** Daten bleiben höchstens 30 Tage ohne neue Festlegung; bei neuem Zeitraum wandert das Löschdatum mit, Hinweis an Gefragte und „Bucht“ (H.11). Darum nennt die Einwilligung **Regel + aktuelles Datum** | Einwilligung deckt Terminänderungen ab |
| Demo-Hinweis | ein Satz im Formular | **nicht wegklickbarer Hinweis an vier Stellen, Dokumentnummer muss mit `DEMO` beginnen, Taste «Fantasiedaten einsetzen»** (H.12, CEO + R.9 I11-12) | G1b: in der Vorschau sollen echte Ausweisdaten gar nicht erst entstehen |

### H.1 Verfügbarkeit und Rollen

| Lage | `/travel-data`, `/travel-data/new`, `/travel-data/{requestId}` |
|---|---|
| Phase 1/2 (auch nach „Festlegung aufheben“) | Weiterleitung (307) auf `/trips/{id}`, ohne Meldung (wie `/stays`, `/info`). |
| Phase `fixed`, *Vorbereitung* und *Unterwegs* | nutzbar nach Rechten unten. |
| Phase `fixed`, *Danach* | Anzeigen, Widerruf, Abschließen ja; **keine neue Anfrage** (`[+ Anfrage]` fehlt, `/new` → Weiterleitung auf `/travel-data`). |
| Nach der Löschung (Abreise + 7 Tage) | nur Leerzustand H.9. |
| Nicht-Mitglied / falsche Reise / fremde `requestId` | gleiche 404 wie andere Reise-Unterseiten – auch wenn die Anfrage existiert (keine Auskunft, ob es sie gibt). |
| `TRAVEL_DATA_ENABLED` aus (Standard in `staging`/`production` bis G1b, R.9 I11-12) | Bereich ist **aus**: Routen 404, keine Station, keine Kachel, keine Erwähnung („keine Teaser“), kein Satzteil in Hilfe-/Leertexten. Die Markierung „Bucht“ mit ihren übrigen Rechten (Infos, gebucht) bleibt an; der Einleitungssatz im Schritt „Wer bucht?“ nennt dann keine Reisedaten (Text H.16 `booking.sheet.introNoData`). |

| Was die Oberfläche zeigt | Mitglied | „Bucht“ | Orga ohne „Bucht“ |
|---|---|---|---|
| Anfragen an mich beantworten, eigene Angaben sehen/ändern, widerrufen, Zugriffsprotokoll | ✔ | ✔ (Anfragen anderer „Bucht“-Personen an sie) | ✔ |
| `[+ Anfrage]`, eigene Anfragen: Status je Person, maskierte Werte, Anzeigen/Kopieren, Erinnern, Personen hinzufügen, abschließen | – | ✔ nur **eigene** Anfragen | – |
| Anfragen **anderer** „Bucht“-Personen | nur eigene Antwort, wenn an mich gerichtet; sonst nichts (Mitglieder sehen von anderen nur Zahlen, nie Status je Person) | Zählkarte «Sara sammelt Reisedaten · 2 von 4» + Status-Chips je Person (R.9: Status aller Anfragen), **nie** Werte, kein Erinnern | dto. |
| Markierung „Bucht“ vergeben/entziehen | – | – | ✔ (H.2) |

Zählbasis überall: **Mitglieder mit Konto, die gefragt sind** (ohne Platzhalter, ohne die anfragende Person selbst).

### H.2 Markierung „Bucht“ vergeben (F-056)

**Ort (Entscheidung UX):** im Sheet **„Wer ist dabei?“** (Cockpit, „Mehr zur Reise“ und Crew im Ticket) als Unterschritt **„Wer bucht?“** – dort, wo man die Personen sieht. Zusätzlich für die Orga ein Menüpunkt **«Wer bucht? …»** im Reisemenü `⋯` (zwischen «Freunde einladen» und «So habt ihr entschieden»), der **denselben** Schritt direkt öffnet. Kein eigener Bereich, keine Einstellungsseite. Begründung: Personen-Zuständigkeit gehört zur Personenliste; das Reisemenü macht die Funktion für die Orga auffindbar, ohne einen zweiten Bedienort zu bauen.

**Sheet „Wer ist dabei?“ (alle):** je Person Zeile mit Avatar · Name · Chips «Orga» (Krone) und **«Bucht»** (Icon `id-card` + Text, D-64) · Platzhalter wie bisher. Unter der Liste:
- Mitglied: 13 px «{Namen} {count, plural, one {bucht} other {buchen}} für euch und {count, plural, one {darf} other {dürfen}} Reisedaten anfragen.» (niemand: Satz entfällt).
- Orga: Text-Taste **«Wer bucht? ändern ›»** → Schritt „Wer bucht?“.
Die Zeile „Wer ist dabei?“ in „Mehr zur Reise“ bekommt als Statuszeile «{Namen} bucht» bzw. «{Namen} buchen» (vor dem bisherigen Text, max. 2 Zeilen).

**Schritt „Wer bucht?“ (nur Orga, nur Phase 3):**
```
┌────────────────────────────────────┐
│ (←)  Wer bucht?                (×) │  Sheet-Kopf, ← zurück zu „Wer ist dabei?“
│ Wer bucht, darf Reisedaten anfragen│  14/500 text-muted
│ und sieht nur, was ihr/ihm jemand  │
│ freigibt – auch die Orga sieht     │
│ sonst nichts. Außerdem: Infos      │
│ bearbeiten, Unterkunft als gebucht │
│ markieren. Höchstens 3; alle sehen,│
│ wer bucht.                         │
│ (LE) Du (Lena) [Orga]       [■■ an]│  Zeile ≥ 56 px, Label = Name, role=switch
│ (MA) Max                    [□□ aus]│
│ (SA) Sara                   [■■ an]│
│ (KE) Kemal                  [□□ aus]│
│ (MI) Mia                    [□□ aus]│  disabled + «Kann erst nach dem Beitritt buchen»
│ 2 von 3 vergeben                   │  Zähler, aria-live=polite
└────────────────────────────────────┘
```
- **Einschalten:** wirkt sofort (Schalter = sofort), Snackbar «Sara bucht jetzt.» / «Sara is booking now.». Bei 3 eingeschalteten sind die übrigen Schalter `aria-disabled` mit Grund darunter «Höchstens 3 – schalte erst jemanden aus.»; Tippen → derselbe Satz als Snackbar.
- **Ausschalten ohne Folgen** (Person hat keine Anfrage und keine Freigaben bekommen): sofort, Snackbar «Kemal bucht nicht mehr.» + «Rückgängig» (6 s).
- **Ausschalten mit Folgen** (Person hat ≥ 1 Anfrage): Schalter bleibt an, bis bestätigt. Dialog **«Sara bucht dann nicht mehr»** · «{name}s {count, plural, one {Anfrage wird} other {# Anfragen werden}} geschlossen, und alle Angaben, die {name} freigegeben wurden ({released, plural, one {von einer Person} other {von # Personen}}), werden **sofort gelöscht**. Das lässt sich nicht rückgängig machen.» · `[Abbrechen]` (Standardfokus) `[Markierung entziehen]` (destruktiv). Danach Snackbar «Sara bucht nicht mehr – ihre Reisedaten sind gelöscht.» (ohne Rückgängig).
- Die Orga darf sich selbst ausschalten (gleiche Regeln). **0 „Bucht“ ist erlaubt** – dann gilt bei der Unterkunft wieder die Orga als Bucher (W18 E.16), und Reisedaten kann niemand anfragen. Die Orga sieht dann in „Wer ist dabei?“ über der Liste die Info-Zeile «Noch niemand bucht – markiere, wer Unterkunft und Tickets bucht.» + Text-Taste «Wer bucht? ›»; Mitglieder sehen nichts.
- Gibt sich eine Orga die Markierung selbst, wirkt das **nur für neue Anfragen** (R.9); der Chip macht es für alle sichtbar.
- **Standard (R.9 I11-01):** Bei der **ersten** Festlegung bekommt die Orga die Markierung, danach nie wieder automatisch; bestehende Phase-3-Reisen bekommen sie einmalig per Migration. Orga-Übergabe überträgt sie nicht. Die Markierung bleibt bei «Festlegung aufheben» erhalten und endet mit der Mitgliedschaft.
- **Für die betroffene Person** gibt es keine Mitteilung außerhalb der App. Beim nächsten Öffnen von `/travel-data` steht einmalig oben der Info-Hinweis «Lena hat dich als „Bucht“ markiert. Du kannst Reisedaten anfragen – du siehst nur, was dir jemand freigibt.» (Merker je Person und Reise, schließbar).
- Zugängliche Namen: Schalter «Sara bucht»; Chip «Bucht» ist Text (kein Icon allein).

### H.3 Bereich `/travel-data` – Aufbau (mobil, von oben)

Kopf wie W22 C: ← (zum Cockpit, Fokus zurück auf die Herkunfts-Station/-Kachel) · Reisename klein + h1 «Reisedaten» · rechts Kontur-Taste `[+ Anfrage]` (44 px; Container < 400 px nur Icon `plus` mit Namen «Reisedaten anfragen») – nur „Bucht“, nicht in *Danach*. `<title>` «Reisedaten · {Reise} · Wir wollen weg». `Cache-Control: no-store` für alle Routen des Bereichs.

| # | Block | sichtbar für / wenn |
|---|---|---|
| 1 | **Demo-Hinweis** (H.12) | Demo/Vorschau |
| 2 | Einmal-Hinweis „Du bist jetzt ‚Bucht‘“ (H.2) · Hinweis „Markierung entzogen“ (H.11) | jeweilige Lage |
| 3 | h2 **«Anfragen an dich»** – je Anfrage eine Karte in Zustand A (offen), D (freigegeben), „klärt es direkt“ oder „erloschen“ (H.6) | ich bin in ≥ 1 Anfrage gefragt. Reihenfolge: offen zuerst, dann neueste |
| 4 | h2 **«Deine Anfragen»** – Verantwortungs-Hinweis (Info, einmal) + je Anfrage Kopfkarte + Personen-Karten (H.7) | „Bucht“ mit ≥ 1 Anfrage |
| 5 | Leerzustand „Bucht“ (H.4) | „Bucht“ ohne eigene Anfrage – **erster** Block nach 1–2, wenn Block 3 fehlt; sonst nach Block 3 als kompakte Zeile «Noch keine eigene Anfrage» + Text-Taste «Reisedaten anfragen ›» |
| 6 | h2 **«Weitere Anfragen»** – Zählkarten «{Name} sammelt Reisedaten für „{Zweck}“ · {released} von {total} haben freigegeben» + Status-Chip je Person | Orga und „Bucht“, für Anfragen **anderer** „Bucht“-Personen (nur Status, nie Werte, keine Anzeigen-Taste) |
| 7 | Leerzustand Mitglied: Illustration (D-67) + h2 «Gerade nichts zu tun» + «Wenn {Namen} für eine Buchung deine Daten {count, plural, one {braucht} other {brauchen}}, fragt sie hier an. Du entscheidest, was du freigibst.» | weder 3 noch 4 noch 6 (z. B. Direktaufruf) |
| 8 | `<details>` **«Wer sieht was?»** (4 Sätze, s. Texte H.16) | immer, außer nach der Löschung |

**Eine Primär-Taste je Ansicht** (Vorrang): Karte A «Angaben eingeben» (erste offene Anfrage an mich) › Leerzustand „Bucht“ «Reisedaten anfragen». Alles andere sekundär/Text.

### H.4 Anfrage erstellen (nur „Bucht“, `/travel-data/new`)

Aufbau wie F. Präzisierungen:

| Element | Regel |
|---|---|
| **Zweck** «Wofür brauchst du die Daten?» | Pflicht, 1–60 Zeichen (R.9), `autocomplete=off`, Zähler ab 50. Hilfe «Alle Gefragten sehen diesen Zweck – z. B. „Flüge München – Split“. Bitte keine persönlichen Daten hineinschreiben.» Fehler leer: «Bitte gib an, wofür du die Daten brauchst.» Kein Auswahl-Menü (Zwecke sind zu verschieden). |
| **Felder** (Schalter-Liste, `fieldset` mit Legende «Welche Angaben?») | Name laut Ausweis: an, gesperrt (Schloss + «Immer dabei»). Geburtsdatum: an. Geschlecht laut Ausweis, Staatsangehörigkeit, Dokument (Art + Nummer): aus. Ablaufdatum, Ausstellungsland: aus und `disabled` mit Grund «Nur zusammen mit der Dokumentnummer». **Dokument an** → Warnhinweis (Amber) direkt unter dem Schalter, per `aria-describedby` am Schalter: «Nur anfragen, wenn die Buchung sie wirklich verlangt – innerhalb Europas genügt meist der Name. Vor dem ersten Anzeigen fragen wir dich nach einem Code.» – Ablaufdatum/Ausstellungsland werden bedienbar (aus). Dokument aus → beide aus und gesperrt. |
| **Wen fragst du?** (`fieldset`, Umschalt-Chips mit Avatar) | Standard: **alle Mitglieder außer mir** + offene Platzhalter mit Zusatz «· bekommt es nach Beitritt». Mindestens 1 Person: «Bitte wähle mindestens eine Person.» Wer später dazukommt, wird **nicht** automatisch gefragt (R.9) – Hinweis 13 px unter der Auswahl: «Kommt später jemand dazu, kannst du die Person nachträglich hinzufügen.» |
| Fußzeile | 13 px «Nie abgefragt: Ausweisfotos oder -scans, Adresse, Freitext. Gelöscht wird automatisch 7 Tage nach der Reise (derzeit am {Löschdatum}).» |
| **Absenden** `[Anfrage senden]` (Primär, unten) | Bestätigung **nur** wenn das Dokument angefragt wird: Sheet «Dokumentnummer wirklich anfragen?» · «{count} Personen sollen dir ihre Ausweis- oder Passnummer geben. Brauchst du sie für „{Zweck}“?» · `[Zurück]` `[Ja, anfragen]`. Danach zurück auf `/travel-data`, Fokus auf h2 der neuen Anfrage, Snackbar «Anfrage an {count, plural, one {eine Person} other {# Personen}} gesendet – sie sehen sie in ihrer Übersicht.» |
| Grenzen | höchstens **3 offene Anfragen je „Bucht“-Person** (R.9); bei 3: `[+ Anfrage]` `aria-disabled`, Tippen → Snackbar «Schließ erst eine Anfrage ab – höchstens 3 gleichzeitig.» Ab dem Tag nach der Abreise keine neue Anfrage (H.1). |
| Verlassen mit Eingaben | Dialog «Anfrage verwerfen?» `[Weiter bearbeiten]` `[Verwerfen]` |

**Nachträglich** (Menü `⋯` an der Kopfkarte der Anfrage, H.7): «Personen hinzufügen …» (gleiche Chip-Auswahl, nur noch nicht Gefragte; neue Personen sehen die Anfrage sofort) · «Person entfernen …» (Liste der Gefragten; bei freigegebener Person Bestätigung «{name} aus der Anfrage nehmen? Die freigegebenen Angaben werden sofort gelöscht.») · «Anfrage abschließen …». Zweck und Felder sind **nicht** änderbar – Hinweis im Menü als 13-px-Zeile: «Andere Angaben nötig? Stell eine neue Anfrage.»

### H.5 Freigabe durch das Mitglied (`/travel-data/{requestId}`)

**Ablauf:** Einstieg (Cockpit-Primär «Angaben freigeben» oder Karte A «Angaben eingeben») → **Schritt 1 „Angaben“** → `[Weiter]` (Prüfung) → **Schritt 2 „Freigeben“** (Zusammenfassung + Einwilligung) → `[An Lena freigeben]` → zurück auf `/travel-data`, Fokus auf h2 der Karte „Freigegeben an Lena“, Siegel (H.15), Snackbar «Freigegeben an Lena.». Alternative jederzeit: Text-Taste «Ich kläre das direkt mit Lena» (H.6).

Beide Schritte sind **eine Route** (Schritt im Client-Zustand, nicht in der URL). `<title>`: «Reisedaten für Lena · Schritt 1 von 2 · …». Wechsel → Fokus auf h1, Ansage über den Titel. ← in Schritt 2 = zurück zu Schritt 1 (Werte bleiben); ← in Schritt 1 mit Eingaben → Dialog «Angaben verwerfen?». **Keine Entwürfe:** Werte liegen nur im Speicher der Seite – kein `localStorage`, kein Autosave, keine Wiederherstellung nach Neuladen (Hinweis in der Hilfe, nicht im Formular).

**Übernehmen (Should, R.9 I11-05):** Hat die Person in **derselben Reise** schon eine Freigabe mit überschneidenden Feldern (z. B. an Lena), steht über den Feldern die Text-Taste «Angaben aus deiner Freigabe an Lena übernehmen» – füllt nur die überschneidenden Felder, nichts wird gespeichert, Fokus auf das erste Feld, Ansage «Angaben übernommen – bitte prüfen.». Nie reiseübergreifend (Q30).

**Kopf in Schritt 1:** Demo-Hinweis (H.12) · Karte «Für „{Zweck}“ · nur Lena sieht deine Angaben» · Satz «Schreib alles genau wie im Ausweis, auch zweite Vornamen – sonst kann die Airline das Ticket ablehnen.» (bei Zweck ohne Flug ebenfalls richtig: «Airline» → **«der Anbieter»**; Text H.16).

**Felder (nur die angefragten, in dieser Reihenfolge):**

| Feld | Eingabe | Prüfung / Meldung |
|---|---|---|
| Vorname(n) laut Ausweis | `type=text`, `autocomplete="given-name"`, `autocapitalize="words"`, `spellcheck=false`, ≤ 100 | Pflicht: «Bitte gib deine Vornamen ein – alle, wie im Ausweis.» |
| Nachname(n) laut Ausweis | `type=text`, `autocomplete="family-name"`, ≤ 100 | Pflicht: «Bitte gib deinen Nachnamen ein, wie im Ausweis.» |
| Geburtsdatum | `fieldset` + `legend` «Geburtsdatum», drei Felder **Tag** (`bday-day`, 2 Stellen) · **Monat** (`bday-month`, Zahl 1–12, kein Auswahlmenü) · **Jahr** (`bday-year`, 4 Stellen), je `type=text inputmode=numeric`, Breiten 4 em / 4 em / 6 em; Hilfe «z. B. 07 04 1995». Reihenfolge `en-US`: Monat · Tag · Jahr. Einfügen eines ganzen Datums ins erste Feld («07.04.1995», «1995-04-07») verteilt es auf alle drei. | eine Meldung für die Gruppe, Fokus auf das erste fehlerhafte Feld: «Bitte gib dein Geburtsdatum vollständig ein.» · «Dieses Datum gibt es nicht – bitte prüf Tag und Monat.» · «Das Geburtsdatum kann nicht in der Zukunft liegen.» · Jahr < heute − 120: «Bitte prüf das Jahr.» |
| Geschlecht laut Ausweis | Radiogruppe «F – weiblich» · «M – männlich» · «X – divers / nicht angegeben»; Hilfe «Airlines fragen das als Anrede ab.» | «Bitte wähle aus, was in deinem Ausweis steht.» |
| Staatsangehörigkeit | natives `<select>`, Länder über `Intl.DisplayNames` in UI-Sprache sortiert, oben die Länder der Mitreisenden-Regionen nicht vorsortieren (keine Annahmen); `autocomplete="off"` | «Bitte wähle deine Staatsangehörigkeit.» |
| Dokument | Radiogruppe «Reisepass» · «Personalausweis» + Feld **Dokumentnummer** `type=text`, `autocomplete="off"`, `autocapitalize="characters"`, `spellcheck=false`, Anzeige in Großbuchstaben, Leerzeichen werden entfernt, 5–20 Zeichen A–Z/0–9 | «Bitte gib die Nummer genau wie im Dokument ein – nur Buchstaben und Ziffern.» · **Demo/Vorschau** zusätzlich: muss mit `DEMO` beginnen, Hilfe unter dem Feld (immer sichtbar) «Vorschau: nur Fantasie-Nummern, die mit DEMO beginnen – z. B. DEMO12345.», Fehler «In der Demo nur Fantasie-Nummern, die mit DEMO beginnen.» / «In the demo, only made-up numbers starting with DEMO.» |
| Ablaufdatum | drei Felder wie Geburtsdatum, `autocomplete="off"` | vollständig/gültig wie oben. Liegt es vor dem Rückreisetag (R.9: vor dem Löschdatum – UX nimmt den Rückreisetag, weil der Satz von der Rückreise spricht; beides „Should“): **kein Fehler**, Hinweis (Amber, nur für die Person) «Dein Dokument läuft vor der Rückreise ab ({Datum}). Prüf, ob du rechtzeitig ein neues bekommst.»; bereits abgelaufen: «Dieses Dokument ist abgelaufen.» |
| Ausstellungsland | `<select>` wie Staatsangehörigkeit; vorbelegt = gewählte Staatsangehörigkeit, falls angefragt | Pflicht |

Prüfung beim Verlassen des Felds und bei `[Weiter]` (ux-spec §5): Fehlerliste oben («2 Angaben fehlen noch») mit Links nur bei ≥ 2 Fehlern; sonst Fokus direkt auf das Feld.

**Schritt 2 „Freigeben“:** Karte «Das gibst du frei» (`<dl>`, Werte **im Klartext** – es sind die eigenen) + Text-Taste «Angaben ändern» (→ Schritt 1). Darunter die **Einwilligung als Karte mit Checkbox** (nicht vorangekreuzt, Label = ganzer Text, Trefferfläche = ganze Karte, D-66): «Ich gebe diese Angaben für „{Zweck}“ an **{Bucht}** frei. Sie werden verschlüsselt gespeichert, nur {Bucht} sieht sie, und sie werden **7 Tage nach der Reise automatisch gelöscht (derzeit am {Löschdatum})**. Ich kann die Freigabe jederzeit zurückziehen.» (Regel + aktuelles Datum, R.9 I11-06 – eine Terminänderung bleibt so innerhalb der Einwilligung. Der Text hat eine Version; der Server speichert Version + Sprache.) + Link «Datenschutzhinweis» (neuer Tab). Fußleiste: Primär `[🛡 An Lena freigeben]` (immer aktiv) · Text-Taste «Ich kläre das direkt mit Lena». Ohne Häkchen: Meldung unter der Karte «Bitte bestätige die Freigabe – oder kläre es direkt mit Lena.», Fokus auf die Checkbox.

**Fehler beim Freigeben** (Server): Banner oben «Das hat nicht geklappt – deine Angaben sind noch nicht freigegeben. Bitte versuch es noch einmal.», Werte bleiben, Häkchen bleibt. Anfrage inzwischen geschlossen/Markierung entzogen/Person nicht mehr in der Reise: Weiterleitung auf `/travel-data` mit Hinweis (Info) «Lena hat die Anfrage inzwischen abgeschlossen – es wurde nichts gespeichert.» bzw. «Lena bucht nicht mehr – es wurde nichts gespeichert.» Unbekannter Serverfehler: generisch «Das hat nicht geklappt – bitte neu laden.» (R.9 Sicherheit Nr. 7).

### H.6 Mitglied – Zustände der Karte „Anfrage an dich“

| Zustand | Inhalt | Tasten |
|---|---|---|
| **A offen** | wie A (Avatar, Chip «Bucht», Datum) · h3 «Lena bucht „{Zweck}“» · «Lena bittet um:» Liste der Felder · Info «Nur Lena sieht deine Angaben. Automatisch gelöscht 7 Tage nach der Reise (derzeit am {Löschdatum}).» · bei Dokument zusätzlich 13 px «Lena fragt auch nach deiner Ausweis- oder Passnummer.» | Primär «Angaben eingeben» · Text-Taste «Ich kläre das direkt mit Lena» |
| **D freigegeben** | Siegel klein · h3 «Freigegeben an Lena» · «Für „{Zweck}“ · am {Datum}» · `<dl>` eigene Werte **im Klartext** (Dokumentnummer maskiert mit «Anzeigen», auch für sich selbst – Schulterblick) · Info «Wird am {Löschdatum} automatisch gelöscht.» · **Zugriffe** (H.8) | sekundär `[Angaben ändern]` (→ Formular vorbelegt, Schritt 2 erneut mit Einwilligung) · Text-Taste destruktiv-leise «Freigabe zurückziehen …» |
| **klärt es direkt** | h3 «Du klärst das direkt mit Lena» · «„{Zweck}“ – Lena sieht nur „klärt es direkt“, keinen Grund.» | sekundär `[Doch freigeben]` |
| **erloschen** | Info-Karte «Lena bucht nicht mehr – deine Angaben für „{Zweck}“ wurden gelöscht.» bzw. «Lena hat fertig gebucht – deine Angaben wurden gelöscht.» (R.9 I11-09) bzw. «Lena ist nicht mehr dabei – deine Angaben wurden gelöscht.» · Zugriffsprotokoll ist mitgelöscht | Text-Taste «Ausblenden» (Merker je Person; sonst bis zum Löschdatum sichtbar) |

- **«Ich kläre das direkt mit Lena»** wirkt sofort, ohne Dialog (nichts geht verloren), Snackbar «Lena sieht: „klärt es direkt“.» + «Rückgängig» (6 s, → wieder offen). Aus Schritt 1/2 heraus: eingegebene Werte werden verworfen (vorher Dialog, wenn Felder gefüllt: «Angaben verwerfen und es direkt mit Lena klären?» `[Zurück]` `[Direkt klären]`).
- **Ändern:** gleicher Ablauf; Schritt 2 Primär «Änderungen freigeben». „Bucht“ sieht danach «geändert am {Datum}» (H.7). Das Löschdatum bleibt.
- **Zurückziehen:** Sheet «Freigabe zurückziehen?» · «Lena sieht deine Angaben dann nicht mehr – sie werden sofort gelöscht, auch das Zugriffsprotokoll.» · `[Abbrechen]` (Standardfokus) `[Zurückziehen]`. Danach Karte wieder **A offen** (Lena kann weiter auf dich warten), Fokus auf deren h3, Snackbar «Freigabe zurückgezogen – deine Angaben sind gelöscht.» (kein Rückgängig – die Daten sind weg).
- Mehrere Anfragen (z. B. Lena „Flüge“, Sara „Fähre“): je Anfrage eine Karte, jede mit eigener Einwilligung. Kein „für alle gleichzeitig freigeben“ (Einwilligung je Zweck und Person). Komfort: «Angaben aus deiner Freigabe an Lena übernehmen» (H.5, nur auf Tipp, nie automatisch).
- **Termin geändert** (neue Festlegung, anderer Zeitraum): Karte D zeigt das neue Löschdatum und einmalig (Info, schließbar) «Eure Reise hat neue Daten – deine Angaben werden jetzt am {Datum} gelöscht. Du kannst die Freigabe jederzeit zurückziehen.»

### H.7 Sicht „Bucht“ – eigene Anfragen

```
│ h2 Deine Anfragen                  │
│ 🛡 Du siehst nur, was dir jemand    │  Info, einmal pro Seite
│   ausdrücklich freigibt. Was du    │
│   außerhalb der App damit machst …,│
│   bitte nicht in Chats weiterleiten│
│ ┌────────────────────────────────┐ │
│ │ Deine Anfrage · 28. April  (⋯) │ │  ⋯ = Personen hinzufügen / Anfrage abschließen
│ │ Flüge München – Split          │ │  h3
│ │ Name laut Ausweis · Geburtsdatum│ │
│ │ 2 von 4 haben freigegeben      │ │  Zahl als Text, Balken aria-hidden
│ │ ▓▓▓▓▓▓▓░░░░░░░                 │ │
│ │ 🛡 Alle Angaben werden am       │ │
│ │   Sa., 26. Juni gelöscht.      │ │
│ └────────────────────────────────┘ │
│ ┌ (KE) Kemal        [✓ freigegeben]┐
│ │ Vorname(n)    K•••         [⧉] │ │  Maske mit sr-Text «verborgen»
│ │ Nachname(n)   Y•••         [⧉] │ │
│ │ Geburtsdatum  ••.••.••••   [⧉] │ │
│ │ [👁 Anzeigen]  geändert am 3. Mai│ │
│ └────────────────────────────────┘ │
│ ┌ (MA) Max                [◷ offen]┐
│ ┌ (JO) Jonas      [klärt es direkt]┐
│ ┌ (MI) Mia        [noch nicht dabei]┐ «Bekommt die Anfrage, sobald Mia beitritt.»
│ [🔔 Erinnern]                       │  sekundär, nur wenn ≥ 1 offen
```
- **Reihenfolge der Personen-Karten:** freigegeben (alphabetisch) · offen · klärt es direkt · noch nicht dabei. Personen-Karten sind `<section>` mit h4 = Name.
- **Maskierung** (Server liefert **nur Masken** im HTML): Namen je Wort Anfangsbuchstabe + «•••» (feste Länge), Datum «••.••.••••», Dokumentnummer erstes Zeichen + «••••» + letztes Zeichen (R.9, z. B. «C••••7»), Dokumentart, Länder und Geschlecht ebenfalls «•••» (R.9 erlaubt unmaskiert – UX maskiert alles gleich: eine Regel, kein Rätseln, welche Zeile schon sichtbar ist). Masken sind `aria-hidden`, daneben sr-only «verborgen».
- **«Anzeigen»** (je Person, `aria-pressed`, `eye`/`eye-off`): holt die Werte per Server-Aktion (protokolliert **einen** Eintrag «angesehen»), zeigt sie bis **Verbergen**, Verlassen der Seite oder **Wechsel in eine andere App/einen anderen Tab** (`visibilitychange` → wieder maskiert, ohne neue Protokollierung beim Wiedereinblenden – man muss erneut tippen). Kein automatisches Zeit-Aus (würde beim Abtippen stören).
- **Kopieren** (je Feld, Icon-Taste 44 px, Name «Geburtsdatum von Kemal kopieren»): holt den Wert per Server-Aktion (protokolliert «{Feld} kopiert»), schreibt in die Zwischenablage, Icon wird 1,2 s zum Häkchen, Snackbar «Kopiert – bitte nicht in Chats weiterleiten.». Funktioniert auch maskiert (man muss nicht erst anzeigen). Geburtsdatum wird im Format der UI-Region kopiert («07.04.1995» / «07/04/1995» / «04/07/1995»), Namen exakt wie eingegeben.
- **Re-Authentifizierung (R.9 I11-08):** nur bei Personen **mit Dokumentnummer**. Wurde die Sitzung nicht innerhalb der letzten 12 h per Code oder Magic Link angemeldet/bestätigt (Passwort zählt nicht), öffnet «Anzeigen»/«Kopieren» zuerst das Code-Sheet (vorhandener `reauth-step`, W13/Flow I.2) mit Einleitung «Zum Schutz der Ausweisnummern: Bitte bestätige kurz per Code, dass du es bist.». Danach wird die ursprüngliche Aktion ausgeführt (kein zweites Tippen). Abbrechen → bleibt maskiert, kein Protokolleintrag. Gültig 12 h je Sitzung.
- **«geändert am {Datum}»** 13 px neben «Anzeigen», wenn die Person nach der ersten Freigabe geändert hat.
- **Erinnern** `[🔔 Erinnern]` (eine Taste unter der Liste, nicht je Person) → RemindSheet Anlass **`travel-data`**: Schritt `status` h2 «Wer fehlt noch?» · Gruppe «Offen ({n})» mit WhatsApp je Person · «Klärt es direkt ({n})» ohne Taste (keine Nachfass-Möglichkeit – Entscheidung respektieren) · Fußleiste «Alle erinnern ({n})». Texte: W16 v2.16. Offene Platzhalter erscheinen in der Gruppe «Noch nicht dabei ({n})» mit WhatsApp über ihren **persönlichen Link** (R.9 I11-09, Text W16 v2.16 `travel-data-join`), nicht in «Alle erinnern».
- **Mehrere „Bucht“-Personen:** Jede sieht nur ihre eigenen Anfragen mit Werten; die der anderen als Zählkarte (H.3 Block 6). Zwei eigene Anfragen = zwei Kopfkarten mit eigenen Personen-Karten, älteste oben.
- **«Anfrage abschließen …»** (Menü `⋯` und – sobald alle geantwortet haben – zusätzlich als sekundäre Taste unter der Liste «Alles gebucht? Anfrage abschließen»): Dialog «Anfrage abschließen?» · «Alle freigegebenen Angaben für „{Zweck}“ werden sofort gelöscht – auch für dich nicht mehr sichtbar. Hast du alles gebucht?» · `[Abbrechen]` `[Abschließen und löschen]` (destruktiv). Danach Kopfkarte «Abgeschlossen am {Datum} – Angaben gelöscht» (ohne Personen-Karten), Snackbar «Anfrage abgeschlossen – die Angaben sind gelöscht.». Abgeschlossene Anfragen stehen bis zum Löschdatum zusammengeklappt unter «Abgeschlossen ({n}) ▾».
- **Kein** Sammel-Export, kein «Alle kopieren», kein Drucklayout (`@media print` blendet Werte aus und zeigt «Reisedaten werden nicht gedruckt.»).

### H.8 Zugriffsprotokoll (nur für die betroffene Person)

- Steht in Karte **D** unter h4 «Wer hat zugegriffen?» als `<ul>`; neueste zuerst; Einträge **ohne Inhalte**: «Lena hat deine Angaben angesehen · heute, 14:32» · «Lena hat „Geburtsdatum“ kopiert · heute, 14:33» · «Lena hat „Dokumentnummer“ kopiert · 3. Mai, 09:10». Zeit relativ bis gestern, danach Datum + Uhrzeit (Zeitzone der Reise, wie überall).
- Leer: «Lena hat deine Angaben noch nicht angesehen.»
- **Wiederholungen gruppiert** (R.9): gleiche Aktion, gleiche Person, gleiches Feld, gleicher Tag → eine Zeile «Lena hat deine Angaben heute 3× angesehen · zuletzt 14:32» / «Lena viewed your details 3 times today · last at 14:32». Mehr als 5 Zeilen: die 5 neuesten + Button «Alle Zugriffe anzeigen» (`aria-expanded`).
- Wird beim Widerruf, Abschließen, Entzug, Verlassen und am Löschdatum **mitgelöscht**. Die betroffene Person bekommt **keine** Benachrichtigung je Zugriff (kein Spam); das Protokoll ist der Ort.
- „Bucht“ sieht kein Protokoll über sich selbst (weiß, was sie getan hat); die Orga sieht keine Protokolle.

### H.9 Löschfrist – wo sie steht und was danach kommt

**Ein Datum** je Reise: Abreisetag + 7 Tage (R.9: 23:59 `APP_TIME_ZONE`), angezeigt lang mit Wochentag («Sa., 26. Juni»), wo Platz ist mit der Regel davor («7 Tage nach der Reise, derzeit am …»). Sichtbar: Karte A · Einwilligungstext · Karte D · Kopfkarte „Bucht“ · Fußzeile beim Anfragen · «Wer sieht was?» · Kachel und Station D3 (W16 v2.16). Bei neuem Reisezeitraum wandert es mit (Hinweis H.6).

Vorzeitige Löschung – Auslöser und Text für die betroffene Person (Karte „erloschen“ H.6) bzw. „Bucht“:

| Auslöser | Mitglied sieht | „Bucht“ sieht |
|---|---|---|
| eigener Widerruf | Karte wieder offen (H.6) | Person «◷ offen» (kein Hinweis auf Widerruf – Status genügt) |
| „Bucht“ schließt ab | «Lena hat fertig gebucht – deine Angaben wurden gelöscht.» | Kopfkarte «Abgeschlossen am …» |
| Markierung entzogen | «Lena bucht nicht mehr – deine Angaben … wurden gelöscht.» | Hinweis oben (Info): «Du bist nicht mehr als „Bucht“ markiert. Deine Anfragen sind geschlossen, alle Angaben gelöscht.» (einmal, schließbar) |
| „Bucht“ verlässt die Reise / wird entfernt / löscht das Konto | «Lena ist nicht mehr dabei – deine Angaben wurden gelöscht.» | – |
| Mitglied verlässt die Reise / wird entfernt | – (Reise weg) | Person-Karte entfällt; Zähler sinkt |
| „Bucht“ nimmt die Person aus der Anfrage | Karte verschwindet (keine Meldung – die Anfrage betrifft sie nicht mehr) | Person-Karte entfällt |
| Festlegung aufgehoben und 30 Tage keine neue | (Bereich nicht erreichbar) – nach späterer Festlegung Karte „erloschen“ «Die Festlegung war länger als 30 Tage aufgehoben – deine Angaben wurden gelöscht.» | Kopfkarte «Erloschen – Angaben gelöscht» + «Neu anfragen ›» (öffnet `/new` vorbelegt mit Zweck, Feldern, Personen) |
| Löschjob am Löschdatum | Leerzustand G (für alle, Mitglied und „Bucht“): Illustration + h2 «Reisedaten gelöscht» + «Am Sa., 26. Juni – 7 Tage nach der Reise, wie angekündigt. Auch das Zugriffsprotokoll ist gelöscht.» | dto. |

Dialoge, die Reisedaten mitlöschen, nennen das **ausdrücklich**: «Reise verlassen» (Mitglied mit Freigaben: «Deine freigegebenen Reisedaten werden sofort gelöscht.»; „Bucht“ mit Anfragen: «Deine Anfragen werden geschlossen und alle an dich freigegebenen Reisedaten sofort gelöscht.») · «Mitglied entfernen» (Orga, analog in 3. Person) · Konto löschen (Flow I.3, Satz in der Liste dessen, was gelöscht wird: «Deine freigegebenen Reisedaten werden sofort gelöscht.» bzw. „Bucht“ «Deine offenen Anfragen werden geschlossen und alle Freigaben gelöscht.») · Reise löschen.

### H.10 Platzhalter und Spätbeitretende (Empfehlung UX)

- **Keine Reisedaten für Platzhalter – auch nicht eingetragen von Orga oder „Bucht“.** Die Einwilligung kann nur die Person selbst geben; eine Orga, die fremde Ausweisdaten einträgt, wäre genau der Chat-Weg, den F-054 ablösen soll, nur mit unserer Haftung. Wer ohne App mitmacht, klärt es direkt mit „Bucht“.
- Platzhalter sind in der Empfängerauswahl wählbar (Zusatz «bekommt es nach Beitritt»), zählen **nicht** im «x von n» und stehen bei „Bucht“ als «noch nicht dabei». Tritt die Person bei (persönlicher Link), steht die Anfrage sofort offen für sie (V4 dran). Platzhalter „ohne App“ (UX-9) erscheinen in der Auswahl nicht.
- **Spätbeitretende** (neue Mitglieder nach dem Senden) werden **nicht** automatisch gefragt (R.9). „Bucht“ sieht unter der Personenliste die Zeile «Neu dabei: {Namen} – noch nicht gefragt.» + Text-Taste «Hinzufügen …» (öffnet «Personen hinzufügen» mit diesen Personen vorausgewählt), solange es solche Mitglieder gibt.
- Platzhalter können nicht „Bucht“ sein (Schalter gesperrt, H.2).

### H.11 Sonder- und Fehlerfälle

| Fall | Verhalten |
|---|---|
| **Markierung entzogen**, während „Bucht“ den Bereich offen hat | nächste Aktion (Anzeigen/Kopieren/Erinnern) → Weiterleitung `/travel-data` mit Hinweis H.9; Werte, die gerade sichtbar waren, sind nach der Weiterleitung weg. |
| **Festlegung aufgehoben** (Phase 2) | Bereich nicht erreichbar, Daten bleiben höchstens 30 Tage (R.9). Der Dialog «Festlegung aufheben?» (Orga) bekommt den Satz «Freigegebene Reisedaten bleiben höchstens 30 Tage gespeichert – steht bis dahin kein neuer Termin, werden sie gelöscht.» Widerruf in dieser Zeit: H.17 Rest-Punkt. |
| **Neu festgelegt, anderer Zeitraum** | Freigaben bleiben, Löschdatum wandert mit (R.9 I11-10). Gefragte: Hinweis in Karte D (H.6). „Bucht“: Hinweis (Amber) über ihren Anfragen: «Euer Termin hat sich geändert ({Zeitraum}) – prüf, ob du neu buchen musst. Die Angaben gelten weiter bis {Löschdatum}.» `×` schließt (nur für sie). |
| Neu festgelegt, gleicher Zeitraum | alles wie vorher, kein Hinweis. |
| Anfrage geschlossen, während das Mitglied ausfüllt | H.5 Fehler-Weiterleitung; nichts gespeichert. |
| Zwei „Bucht“ fragen dasselbe an | erlaubt (getrennte Anfragen, getrennte Freigaben); Karte A zeigt den Zweck – Mitglied entscheidet je Anfrage. Kein Zusammenführen. |
| „Bucht“ ist selbst gefragt (von anderer „Bucht“) | Block „Anfragen an dich“ steht **über** „Deine Anfragen“. |
| Die anfragende Person in der eigenen Empfängerliste | gibt es nicht (sich selbst fragen ist sinnlos). |
| Offline | Offline-Banner (ux-spec §6); Anzeigen/Kopieren/Freigeben/Widerruf deaktiviert mit Grund «Braucht eine Verbindung.» Masken bleiben; nichts wird zwischengespeichert. |
| Anzeigen/Kopieren schlägt fehl | Snackbar «Konnte gerade nicht geladen werden – bitte noch einmal.»; kein Protokolleintrag. |
| Zwischenablage gesperrt (Browser) | Snackbar «Kopieren geht hier nicht – tipp „Anzeigen“ und übertrage es von Hand.» |
| Laden | Skelett ab 300 ms: Kopfkarte + 3 Personen-Umrisse; Masken nie als „lädt“-Text. |
| Reise vorbei, Löschdatum noch nicht erreicht | alles lesbar (Fähre am letzten Tag, Erstattungen); keine neue Anfrage; Widerruf jederzeit. |
| Offene Anfrage an mich in *Danach* | im Bereich weiter beantwortbar (R.9: bis zum Löschdatum), Karte A mit Zusatz «Die Reise ist vorbei – nur nötig, wenn {by} noch etwas nachbuchen muss.»; im Cockpit **keine** Aufgabe (W16 v2.16, keine V4 in *Danach*). |
| Konto-Datenexport (F-043) | enthält die **eigenen** freigegebenen Angaben + Zweck + Empfänger + Protokoll; bei „Bucht“ **keine** fremden Werte, nur «Anfragen: {Zweck}, {Datum}». |

### H.12 Hinweis in Demo und Vorschau (G1b)

Nur bei `isDemo()` (Docker-Demo und private Vorschau). Stil `note demo` (Amber + `warning`, D-65), **nicht wegklickbar** (CEO, R.9 I11-12), an den von R.9 genannten Stellen (Schritt 1, Schritt 2, neue Anfrage, „Bucht“-Sicht):
1. **Bereich oben** (H.3 Block 1, damit auch „Bucht“-Sicht): «Demo – bitte nur **Fantasiedaten** eingeben: keine echten Namen aus dem Ausweis, kein echtes Geburtsdatum, keine echten Ausweisnummern.»
2. **Schritt 1 „Angaben“** über den Feldern: «Demo – bitte keine echten Ausweisdaten eingeben. Ausweisnummern müssen mit DEMO beginnen.» (zweiter Satz nur, wenn das Dokument angefragt ist) + Text-Taste **«Fantasiedaten einsetzen»** (füllt alle angefragten Felder mit erfundenen Werten, z. B. «Erika Maria» / «Musterfrau» / 12.08.1990 / «DEMO48151»; Ansage «Fantasiedaten eingesetzt.»). Macht das Vorführen schneller als echtes Tippen – und echte Daten damit unwahrscheinlicher.
3. **Anfrage erstellen** über dem Zweck: «Demo – hier werden nur Fantasiedaten gesammelt.»
4. **Schritt 2 „Freigeben“** über der Zusammenfassung: «Demo – bitte keine echten Ausweisdaten freigeben. „Demo zurücksetzen“ löscht alles.»
5. **Dokumentnummer** ohne `DEMO`-Anfang: Feldfehler H.5 (Server prüft ebenfalls).
Der globale Demo-Banner (`DemoBanner`) bleibt zusätzlich. Mit `TRAVEL_DATA_ENABLED` aus gibt es den Bereich nicht (H.1).

### H.13 Barrierefreiheit (ergänzt den Abschnitt oben)

- **Überschriften:** h1 «Reisedaten» · h2 «Anfragen an dich» / «Deine Anfragen» · h3 je Anfrage · h4 je Person bzw. «Wer hat zugegriffen?».
- **Autocomplete – bewusst gesetzt:** Name und Geburtsdatum der **eigenen** Person mit `given-name`, `family-name`, `bday-day/-month/-year` (WCAG 2.2 **1.3.5** verlangt das für Angaben über die nutzende Person; Autofill spart Tippfehler). Dokumentnummer, Ablaufdatum, Staatsangehörigkeit, Ausstellungsland: `autocomplete="off"` (kein Autofill-Zweck in der Liste; der Browser soll Ausweisnummern **nicht** speichern). Zweck: `off`. Hinweis in der Hilfe: Autofill kann den Rufnamen statt aller Vornamen einsetzen – deshalb der Satz «auch zweite Vornamen» über den Feldern.
- **Datumseingabe:** `fieldset`/`legend`, drei beschriftete Felder (sichtbare Labels «Tag», «Monat», «Jahr»), eine gemeinsame Fehlermeldung per `aria-describedby` an allen dreien, `aria-invalid` nur an den fehlerhaften; **kein automatischer Fokussprung** zwischen den Feldern (bricht Korrekturen und Screenreader).
- **Einwilligung:** Checkbox-Label ist der vollständige Text; Fehler per `aria-describedby`; Primär-Taste nie `disabled` (sonst unklar, warum).
- **Masken:** `aria-hidden` + sr-only «verborgen»; nach «Anzeigen» Live-Ansage «Angaben von Kemal werden angezeigt.» (einmal, `polite`), nach Verbergen «verborgen». Werte selbst werden nie automatisch vorgelesen.
- **Schalter:** `input type=checkbox role=switch`, ganze Zeile ≥ 56 px klickbar, gesperrte mit sichtbarem Grund (`aria-describedby`).
- **Keine sensiblen Werte** in `<title>`, URL, Snackbar, Live-Region, Teilen-Text, Mail, Log, `localStorage`, Analytics, Fehlerseiten. Snackbars nennen nur Feldnamen.
- Fokus nach Aktionen: Freigabe → h3 der Karte D; Widerruf → h3 der Karte A; Abschließen → h3 der Kopfkarte; Anfrage gesendet → h3 der neuen Anfrage; Dialog-Abbruch → Auslöser.
- Kontrast der Masken (`•`) ≥ 4,5 : 1 auch im Dunkelmodus (D-65).

### H.14 Responsive, 200 %, Dark Mode, Desktop

- **360 px:** alles einspaltig; Personen-Karte: Label über Wert, Kopieren-Taste rechts neben dem Wert; Tasten «Anzeigen» und «geändert am» untereinander, wenn eng.
- **200 % / Container < 22 em:** `<dl>`-Zeilen brechen um (Label oben, Wert + Kopieren darunter); Datumsfelder brechen in zwei Zeilen (Tag Monat / Jahr), Breiten in `em`, nie abgeschnitten; Schalter-Zeilen: Label über dem Schalter; Fußleiste mit Primär + Text-Taste untereinander. Kein horizontales Scrollen.
- **Dark Mode:** Demo-Hinweis, Warnhinweis Dokument und Masken mit Dark-Tokens (D-65); Siegel auf dunkler Fläche wie D-63.
- **600–959 px:** Inhalt max. 640 px zentriert.
- **≥ 960 px:** Mitglied einspaltig 640 px; „Bucht“: Kopfkarte volle Breite, Personen-Karten **2 Spalten**; Formulare einspaltig 640 px, Fußleiste nicht sticky.
- Tastatur auf dem Handy: Fußleiste mit Primär-Taste bleibt über der Tastatur (Muster ux-spec §4.3), `scroll-padding-bottom` passend.

### H.15 Motion (Vorschläge – UM-20 – UM-24, `../abstimmung-design.md` §16)

| Moment | Vorschlag | Reduziert |
|---|---|---|
| Freigegeben | Karte D tritt ein, **Siegel 40 ploppt** (wie Unterkunft festlegen), **kein Konfetti** – es ist ein Vertrauens-, kein Feiermoment | Überblenden |
| Anzeigen / Verbergen | Maske → Wert **Überblenden 140 ms** je Feld; kein „Entschlüsseln“-Effekt (Zeichen-Rauschen wäre verspielt, langsam und für Screenreader unruhig) | sofort |
| Kopieren | Icon `copy` → `check` (Pop `fast`), 1,2 s, zurück | Wechsel ohne Pop |
| Widerruf / Abschließen / Löschung | Karte überblendet in den neuen Zustand; **kein** Schredder-/Auflösungs-Effekt (das Wort „gelöscht“ trägt die Botschaft) | sofort |
| Schalter „Wer bucht?“ | Standard-Schalter-Motion; Chip «Bucht» in der Liste blendet ein/aus | sofort |
| Schritt 1 → 2 | wie andere Zwei-Schritt-Abläufe (Schritt-Balken füllt sich `base`, Inhalt Überblenden) | sofort |
Keine Haptik. Alle Momente nur bei eigener Aktion im Client.

### H.16 Texte DE / EN (Auswahl, Schlüssel als Vorschlag)

| Schlüssel | DE | EN |
|---|---|---|
| `travelData.title` | Reisedaten | Travel details |
| `travelData.chip` | Bucht | Booking |
| `travelData.request.cta` / `.ctaShort` | Reisedaten anfragen · + Anfrage | Request travel details · + Request |
| `travelData.request.purpose` / `.help` | Wofür brauchst du die Daten? · Alle Gefragten sehen diesen Zweck – z. B. „Flüge München – Split“. | What do you need the details for? · Everyone you ask sees this – e.g. “Flights Munich – Split”. |
| `travelData.fields.name` / `.birth` / `.sex` / `.nationality` / `.document` / `.expiry` / `.country` | Name laut Ausweis · Geburtsdatum · Geschlecht laut Ausweis · Staatsangehörigkeit · Ausweis- oder Passnummer · Ablaufdatum des Dokuments · Ausstellungsland | Name as on ID · Date of birth · Sex as on ID · Nationality · ID or passport number · Document expiry date · Issuing country |
| `travelData.request.docWarning` | Nur anfragen, wenn die Buchung sie wirklich verlangt – innerhalb Europas genügt meist der Name. Vor dem ersten Anzeigen fragen wir dich nach einem Code. | Only ask if the booking really needs it – within Europe the name is usually enough. We'll ask you for a code before you first view it. |
| `travelData.request.sent` | Anfrage an {count, plural, one {eine Person} other {# Personen}} gesendet – sie sehen sie in ihrer Übersicht. | Request sent to {count, plural, one {one person} other {# people}} – they'll see it in their overview. |
| `travelData.member.asks` | {name} bucht „{purpose}“ | {name} is booking “{purpose}” |
| `travelData.member.onlyFor` | Nur {name} sieht deine Angaben. Automatisch gelöscht am {date}. | Only {name} sees your details. Deleted automatically on {date}. |
| `travelData.fill.exact` | Schreib alles genau wie im Ausweis, auch zweite Vornamen – sonst kann der Anbieter die Buchung ablehnen. | Enter everything exactly as on your ID, including middle names – otherwise the provider may refuse the booking. |
| `travelData.consent` (Version 1) | Ich gebe diese Angaben für „{purpose}“ an {name} frei. Sie werden verschlüsselt gespeichert, nur {name} sieht sie, und sie werden 7 Tage nach der Reise automatisch gelöscht (derzeit am {date}). Ich kann die Freigabe jederzeit zurückziehen. | I'm sharing these details with {name} for “{purpose}”. They're stored encrypted, only {name} can see them, and they'll be deleted automatically 7 days after the trip (currently on {date}). I can withdraw this at any time. |
| `travelData.datesChanged.member` / `.booker` | Eure Reise hat neue Daten – deine Angaben werden jetzt am {date} gelöscht. Du kannst die Freigabe jederzeit zurückziehen. · Euer Termin hat sich geändert ({range}) – prüf, ob du neu buchen musst. Die Angaben gelten weiter bis {date}. | Your trip has new dates – your details will now be deleted on {date}. You can withdraw at any time. · Your dates have changed ({range}) – check whether you need to rebook. The details stay available until {date}. |
| `travelData.closedByBooker` | {name} hat fertig gebucht – deine Angaben wurden gelöscht. | {name} has finished booking – your details have been deleted. |
| `travelData.demo.docPrefix` / `.docHelp` | In der Demo nur Fantasie-Nummern, die mit DEMO beginnen. · Vorschau: nur Fantasie-Nummern, die mit DEMO beginnen – z. B. DEMO12345. | In the demo, only made-up numbers starting with DEMO. · Preview: only made-up numbers starting with DEMO – e.g. DEMO12345. |
| `travelData.reuse` | Angaben aus deiner Freigabe an {name} übernehmen | Copy from what you shared with {name} |
| `booking.none` | Noch niemand bucht – markiere, wer Unterkunft und Tickets bucht. | Nobody's booking yet – mark who books the place and tickets. |
| `booking.sheet.introNoData` | Wer bucht, darf die Infos bearbeiten und die Unterkunft als gebucht markieren. Höchstens 3; alle sehen, wer bucht. | People who book can edit the info page and mark the place as booked. Up to 3; everyone can see who's booking. |
| `travelData.release` / `.released` | An {name} freigeben · Freigegeben an {name}. | Share with {name} · Shared with {name}. |
| `travelData.decline` / `.declined` | Ich kläre das direkt mit {name} · {name} sieht: „klärt es direkt“. | I'll sort it out with {name} directly · {name} sees: “sorting it out directly”. |
| `travelData.status.released` / `.open` / `.declined` / `.placeholder` | freigegeben · offen · klärt es direkt · noch nicht dabei | shared · open · sorting it out directly · not joined yet |
| `travelData.revoke.title` / `.body` / `.done` | Freigabe zurückziehen? · {name} sieht deine Angaben dann nicht mehr – sie werden sofort gelöscht, auch das Zugriffsprotokoll. · Freigabe zurückgezogen – deine Angaben sind gelöscht. | Withdraw sharing? · {name} won't see your details any more – they'll be deleted right away, including the access log. · Sharing withdrawn – your details are deleted. |
| `travelData.log.viewed` / `.copied` / `.empty` | {name} hat deine Angaben angesehen · {name} hat „{field}“ kopiert · {name} hat deine Angaben noch nicht angesehen. | {name} viewed your details · {name} copied “{field}” · {name} hasn't viewed your details yet. |
| `travelData.reveal` / `.hide` / `.hidden` (sr) | Anzeigen · Verbergen · verborgen | Show · Hide · hidden |
| `travelData.copied` | Kopiert – bitte nicht in Chats weiterleiten. | Copied – please don't forward it in chats. |
| `travelData.booker.note` | Du siehst nur, was dir jemand ausdrücklich freigibt. Was du außerhalb der App damit machst (z. B. in ein Buchungsformular eintragen), liegt in deiner Verantwortung – bitte nicht in Chats weiterleiten. | You only see what people explicitly share with you. What you do with it outside the app (e.g. entering it in a booking form) is your responsibility – please don't forward it in chats. |
| `travelData.close.title` / `.body` / `.done` | Anfrage abschließen? · Alle freigegebenen Angaben für „{purpose}“ werden sofort gelöscht – auch für dich nicht mehr sichtbar. Hast du alles gebucht? · Anfrage abgeschlossen – die Angaben sind gelöscht. | Close this request? · All details shared for “{purpose}” will be deleted right away – you won't see them either. Have you booked everything? · Request closed – the details are deleted. |
| `travelData.deleted.title` / `.body` | Reisedaten gelöscht · Am {date} – 7 Tage nach der Reise, wie angekündigt. Auch das Zugriffsprotokoll ist gelöscht. | Travel details deleted · On {date} – 7 days after the trip, as promised. The access log is gone too. |
| `travelData.demo.area` / `.form` / `.fill` | Demo – bitte nur Fantasiedaten eingeben: keine echten Namen aus dem Ausweis, kein echtes Geburtsdatum, keine echten Ausweisnummern. · Demo – bitte keine echten Ausweisdaten eingeben. · Fantasiedaten einsetzen | Demo – please only enter made-up details: no real names from your ID, no real date of birth, no real ID numbers. · Demo – please don't enter real ID details. · Fill in made-up details |
| `travelData.who.title` / Sätze | Wer sieht was? · Nur die Person, die anfragt (Markierung „Bucht“), sieht deine Angaben – und nur, wenn du freigibst. · Die Orga und andere, die buchen, sehen nur den Status („freigegeben“, „offen“); alle anderen nur Zahlen. · Gespeichert wird verschlüsselt; keine Ausweis-Scans, keine Freitexte. · Gelöscht wird automatisch 7 Tage nach der Reise (derzeit am {date}) – oder sofort, wenn du die Freigabe zurückziehst. | Who sees what? · Only the person asking (marked “Booking”) sees your details – and only if you share them. · The organiser and others who book only see the status (“shared”, “open”); everyone else only sees numbers. · Everything is stored encrypted; no ID scans, no free text. · Deleted automatically 7 days after the trip (currently on {date}) – or right away if you withdraw. |
| `booking.sheet.title` / `.intro` | Wer bucht? · Wer bucht, darf Reisedaten anfragen und sieht nur, was ihr oder ihm jemand freigibt – auch die Orga sieht sonst nichts. Außerdem: Infos bearbeiten, Unterkunft als gebucht markieren. Höchstens 3; alle sehen, wer bucht. | Who's booking? · People who book can request travel details and only see what others share with them – the organiser doesn't see anything otherwise. They can also edit the info page and mark the place as booked. Up to 3; everyone can see who's booking. |
| `booking.on` / `.off` / `.max` / `.placeholder` | {name} bucht jetzt. · {name} bucht nicht mehr. · Höchstens 3 – schalte erst jemanden aus. · Kann erst nach dem Beitritt buchen | {name} is booking now. · {name} isn't booking any more. · Up to 3 – switch someone off first. · Can book once they've joined |
| `booking.revoke.title` / `.body` / `.confirm` | {name} bucht dann nicht mehr · {name}s Anfragen werden geschlossen, und alle Angaben, die {name} freigegeben wurden, werden sofort gelöscht. Das lässt sich nicht rückgängig machen. · Markierung entziehen | {name} won't be booking any more · Their requests will be closed and all details shared with them deleted right away. This can't be undone. · Remove |

Geschlechtsneutral formuliert («{name}s Anfragen …», «die {name} freigegeben wurden») – kein ICU-`select` nach Geschlecht nötig. Namen auf -s/-x/-z: «Jonas’ Anfragen» (Apostroph, Helfer `genitive(name)` in DE).

### H.17 Abgleich mit R.9 und Rest-Punkt

**„Hinweise an UI/UX“ aus R.9 – eingearbeitet:**
| R.9 | Wo |
|---|---|
| 1 Einwilligung mit Regel + aktuellem Datum, Hinweis bei Terminänderung | H.5, H.6, H.9, H.11, H.16 |
| 2 Kachel auch für Personen mit eigener Freigabe | H.0, W16 v2.16 |
| 3 D3 vor dem Löschdatum „als Nächstes“ mit Datum | W16 v2.16 |
| 4 Mehrere „Bucht“: Texte bis 3 Namen, zweite Anfrage-Karte, „niemand bucht“ | H.2, H.3, H.7, W16 v2.16, W18 E.16 |
| 5 `DEMO`-Präfix + Meldung | H.5, H.12, H.16 |
| 6 «Markierung entfernen» mit Lösch-Bestätigung; Zeilen in „Reise verlassen“, „Konto löschen“ | H.2, H.9 |
| 7 «Keine persönlichen Daten in den Zweck schreiben» | H.4 |

**Bewusste UX-Festlegungen innerhalb des R.9-Rahmens:** Markieren im Unterschritt „Wer bucht?“ mit Schaltern statt Aktion je Zeile (R.9: „Ort/Wortlaut UX“) · alle Felder in der „Bucht“-Sicht maskiert (R.9 erlaubt es) · V4 für „Bucht“ ohne Anfrage „später“ statt „als Nächstes“ (Demo-Seed R.9 entsprechend) · V4 „alle da“ erledigt nach dem ersten Anzeigen/Kopieren statt erst nach dem Abschließen.

**Rest-Punkt an PM/CEO (nicht blockierend):** Widerruf, solange die Festlegung aufgehoben ist (bis 30 Tage): Der Bereich ist dann nicht erreichbar, Art. 7 Abs. 3 verlangt aber jederzeitigen Widerruf. **Empfehlung:** im Konto (W13, „Daten & Datenschutz“) je bestehender Freigabe eine Zeile «Reisedaten für {Reise} freigegeben – Freigabe zurückziehen …», nur solange die Reise nicht in Phase 3 ist (in Phase 3 bleibt der Bereich der Ort). Klein, ohne neue Daten.

Keine Frage an den Auftraggeber nötig.

### H.18 Abnahme UX Inkrement 11

360 × 640, 390 × 844, 320 px, 200 %, Dark Mode, DE/EN (inkl. `en-US`-Datumsreihenfolge), ≥ 960 px · Orga vergibt „Bucht“ (an/aus, 3er-Grenze, Platzhalter gesperrt, Entzug mit Daten → Dialog → Löschung sichtbar für Betroffene) · Chip «Bucht» in „Wer ist dabei?“ für alle · „Bucht“ ohne Anfrage (Leerzustand, V4 später) · Anfrage nur Name, mit Dokument (Warnung + Bestätigung) · Mitglied: Ausfüllen mit Autofill, Datum per Einfügen, Fehlerfälle, Einwilligung ohne Häkchen, Freigabe (Siegel), Ändern, Zurückziehen, „klärt es direkt“ + Rückgängig, Doch freigeben · „Bucht“: Masken im Server-HTML (Netzwerk-Tab ohne Klartext), Anzeigen/Verbergen/App-Wechsel, Kopieren maskiert, Re-Auth bei Dokumentnummer (Passwort-Sitzung → Code, danach Aktion ohne zweites Tippen), zweite „Bucht“ sieht fremde Anfrage nur als Zählkarte, Protokoll erscheint beim Mitglied, Erinnern `travel-data`, Abschließen · Orga ohne „Bucht“ sieht nur Zahlen · Platzhalter tritt bei → Anfrage offen · Spätbeitretende («Neu dabei … Hinzufügen») · Person aus Anfrage entfernen · Reise verlassen / Mitglied entfernen (Dialogtexte) · Festlegung aufheben (Dialogsatz 30 Tage) · neu festgelegt mit anderem Zeitraum (Hinweise Mitglied/„Bucht“, neues Datum überall) · Übernehmen aus anderer Freigabe · Danach: keine neue Anfrage, D3, Leerzustand nach Löschjob · Demo-Hinweise an allen Stellen (nicht wegklickbar) + «Fantasiedaten einsetzen» + Dokumentnummer ohne `DEMO` abgelehnt · VoiceOver/TalkBack: Formular, Datum, Einwilligung, Masken.
