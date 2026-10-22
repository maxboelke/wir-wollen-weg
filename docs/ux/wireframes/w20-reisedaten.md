# W20 – Persönliche Reisedaten: Anfrage, Einwilligung, Ausfüllen, Status

Stand: 2026-10-20 · UI/UX · Status: Entwurf (Ausbaustufe R, Inkrement 11; echte Daten erst nach Gate **G1b**) · Features **F-054**, **F-056**, Q28–Q31 · Routen `/trips/{id}/travel-data`, `/travel-data/new`, `/travel-data/{requestId}`
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
