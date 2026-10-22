# W19 – Kosten teilen: Ausgaben, Ausgabe hinzufügen, Salden & Ausgleich

Stand: 2026-10-20 · UI/UX · Status: Entwurf (Ausbaustufe R, Inkrement 10) · Features **F-035 + F-036**, Q35, Q36 · Routen `/trips/{id}/costs`, `/costs/balances`, `/costs/new`, `/costs/{id}/edit`
Prototyp: [`#/costs`](../mockups/reise-managen/index.html), [`#/costs/new`](../mockups/reise-managen/index.html), [`#/costs/balances`](../mockups/reise-managen/index.html) – Salden und Ausgleich werden im Prototyp **echt berechnet** (Cent-Ganzzahlen, Greedy-Ausgleich).

## Grundregeln
- Verfügbar ab Phase 3; **eine Währung** pro Reise (EUR); **unbegrenzte Ausgaben**; keine Zahlungsabwicklung – «Wir überweisen nichts – wir zeigen nur, wer wem was schuldet.»
- **Saldo-Wortlaut verbindlich:** «du bekommst 42,00 €» · «du schuldest 23,50 €» · «ausgeglichen ✓»; für andere «bekommt …» / «schuldet …». Nie nur Farbe oder Vorzeichen. Plus-Saldo zusätzlich in Minze-Text, Minus neutral in Tinte (Schulden sind kein Fehler → nie Rot).
- **Platzhalter** (Mia) können beteiligt sein und stehen in Salden/Ausgleich mit Chip «Platzhalter».

## A. Ausgaben (Standardansicht)
```
┌────────────────────────────────────┐
│▓(←) Kroatien 2027         [Teilen]▓│  Teilen = Abrechnungstext
│▓    Kosten                        ▓│  h1
╰▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╯
│ ┌────────────────────────────────┐ │
│ │ Dein Stand                     │ │
│ │ Du schuldest 86,00 €           │ │  Jakarta 26/800, tabular
│ │ Gesamt 456,00 € · dein Anteil  │ │
│ │ 86,00 €                        │ │
│ └────────────────────────────────┘ │
│ [ Ausgaben ][ Salden & Ausgleich ] │  Segment = 2 Links (eigene URLs), aria-current
│ Sa., 1. Mai                        │  Tagesgruppe, neueste zuerst
│ ┌────────────────────────────────┐ │
│ │(✦) Bootstour (Reservierung)    │ │  ganze Zeile = Button → Detail-Sheet
│ │    Lena hat bezahlt · für alle 6│ │
│ │                       150,00 € │ │
│ │               dein Anteil 25,00│ │
│ └────────────────────────────────┘ │
│ Fr., 30. April …                   │
├────────────────────────────────────┤
│ [ +  Ausgabe hinzufügen          ] │  fixierte Aktionsleiste (Hauptaktion)
└────────────────────────────────────┘
```
- Zeile: Kategorie-Icon-Kachel · Titel · «Kemal hat bezahlt · für alle 6» bzw. «für Lena, du, Kemal, Sara» · Betrag rechts · «dein Anteil 31,00 €» bzw. «nicht beteiligt».
- **Detail-Sheet:** Betrag groß, Kategorie · Datum · Zahler, Aufteilung je Person, «Gleich aufgeteilt · angelegt von Kemal»; `[Bearbeiten]` `[Löschen]` für Anlegende, Zahlende und Orga, sonst Hinweis «Bearbeiten können Kemal und die Orga.». Löschen sofort mit Snackbar «„Pizza“ gelöscht · Rückgängig» (6 s).
- **Leer:** Illustration + «Noch keine Ausgaben» + «Wer etwas für die Gruppe bezahlt, trägt es hier ein – wir rechnen aus, wer wem was schuldet.»
- **Abgeschlossen:** Chip «🔒 Abrechnung abgeschlossen» in „Dein Stand“, Aktionsleiste entfällt, Detail-Sheets ohne Bearbeiten.

## B. Ausgabe hinzufügen / bearbeiten
```
│▓    Ausgabe hinzufügen            ▓│
│ Betrag                             │
│ ┌────────────────────────────────┐ │
│ │ 60,00                        € │ │  großes Feld, inputmode=decimal, Autofokus
│ └────────────────────────────────┘ │
│ Wofür?                             │
│ [z. B. Abendessen am Hafen       ] │  ≤ 60 Zeichen
│ Kategorie (optional)               │
│ (▤ Unterkunft)(🚗 Anreise)(🍴 Essen ✓)│  Radio-Chips ≥ 44 px
│ (✦ Aktivitäten)(🏷 Sonstiges)       │
│ Bezahlt von                        │
│ [Mir (Max)                     ▾ ] │  natives Select, Standard: ich
│ Für wen?                           │
│ (LE Lena ✓)(MA Ich ✓)(KE Kemal ✓)  │  Checkbox-Chips, Standard: alle inkl. Platzhalter
│ (SA Sara ✓)(JO Jonas ✓)(MI Mia · Platzhalter ✓)│
│ Aufteilung                         │
│ [  Gleich  ][ Nach Beträgen ]      │  Segment (Radio)
│ ┌────────────────────────────────┐ │
│ │ (LE) Lena               10,00 €│ │  Gleich: Live-Vorschau je Person
│ │ …                              │ │
│ └────────────────────────────────┘ │  Nach Beträgen: Feld je Person + Live-Zeile
│                                    │  «Noch 12,00 € zu verteilen» / «3,00 € zu viel verteilt» / «✓ Passt genau»
│ Datum                              │
│ [02.05.2027                      ] │  Standard heute (unterwegs) bzw. heute
├────────────────────────────────────┤
│ [       Ausgabe speichern        ] │
└────────────────────────────────────┘
```
| Feld | Regel | Meldung |
|---|---|---|
| Betrag | Pflicht, > 0, max. 2 Nachkommastellen, Komma/Punkt je Region, intern Cent | «Bitte gib einen Betrag ein.» / «Bitte einen Betrag wie 12,50 eingeben.» |
| Wofür? | Pflicht, ≤ 60 | «Bitte gib an, wofür das war.» |
| Für wen? | ≥ 1 Person | «Wähle mindestens eine Person.» |
| Nach Beträgen | Summe = Betrag | Live-Zeile (Amber, nicht Rot), beim Absenden Fokus auf erstes Betragsfeld + Ansage «Die Beträge ergeben noch nicht die Summe.» |
Rundungsrest bei „Gleich“ deterministisch an die ersten Personen der festen Reihenfolge; Summe stimmt immer exakt. Nach dem Speichern: zurück zur Liste, Snackbar «60,00 € gespeichert – Salden sind aktualisiert.» (optimistisch).

## C. Salden & Ausgleich
```
│ [ Ausgaben ][ Salden & Ausgleich ] │
│ So gleicht ihr aus                 │  h2
│ Mit 5 Überweisungen ist alles      │
│ erledigt.                          │
│ ┌────────────────────────────────┐ │
│ │ Du → Kemal              86,00 €│ │
│ │ IBAN DE00 … (Demo)             │ │  Zahlungsinfo des Empfängers (freiwillig)
│ │ [✓ Als bezahlt markieren] Kopieren│
│ │ Jonas → Kemal           14,00 €│ │
│ │ Markieren können Jonas oder    │ │  für Unbeteiligte keine Taste
│ │ Kemal.                         │ │
│ │ Mia → Lena              22,00 €│ │  Platzhalter: Lena markiert den Eingang
│ └────────────────────────────────┘ │
│ Bereits bezahlt                    │
│ Salden                             │  h2
│ (LE) Lena            bekommt 64,00 €│
│ (MA) Du            du schuldest 86,00 €│
│ (MI) Mia [Platzhalter] schuldet 56,00 €│
│ Deine Zahlungsinfo (freiwillig)    │
│ Noch nichts hinterlegt …  [Hinterlegen]│  Sheet: Freitext ≤ 100, «Alle in der Reise können das lesen.»
│ [ Abrechnung abschließen ]         │  nur Orga, empfohlen ab „Danach“
└────────────────────────────────────┘
```
- Ausgleichsvorschlag = minimale Zahl Überweisungen (Greedy, deterministisch). «Als bezahlt markieren» durch Zahlende **oder** Empfangende → wird als Ausgleichszahlung gebucht, Snackbar mit «Rückgängig»; Salden aktualisieren sich sofort; Eintrag wandert in „Bereits bezahlt“.
- **Abschließen** (Orga): Bestätigung «Abrechnung abschließen? Danach kann niemand mehr Ausgaben ändern. Du kannst sie wieder öffnen.» → schreibgeschützt; Text-Taste «Abrechnung wieder öffnen».
- **Teilen** (Kopf): Text «Abrechnung Kroatien 2027: Max → Kemal: 86,00 € …» über das Teilen-Sheet (W06).
- Alles ausgeglichen: «Alles ausgeglichen ✓ – Niemand schuldet jemandem etwas.» (Siegel klein).

## Reise verlassen mit offenem Saldo (Q35)
Dialog «Du schuldest noch 86,00 €. Wenn du gehst, bleiben deine Ausgaben für die Gruppe erhalten und du erscheinst darin als „ehemaliges Mitglied“.» `[Abbrechen]` `[Trotzdem verlassen]`.

## Barrierefreiheit
Segment als Navigationslinks mit `aria-current="page"`; Beträge `tabular-nums`; Live-Zeile „zu verteilen“ `aria-live=polite`; Pfeil «→» in Ausgleichszeilen ist Icon mit Text-Alternative («an»); Zahlenfelder mit sichtbarem Label + Währungs-Suffix `aria-hidden` (Label enthält „€“ im zugänglichen Namen). Fokus nach Speichern auf h1 der Liste.

## Desktop
Zweispaltig ab 960 px: links Ausgabenliste, rechts „Dein Stand“ + Salden & Ausgleich (Segment entfällt). Formular als normale Seite (640 px).
