# W19 – Kosten teilen: Ausgaben, Ausgabe hinzufügen, Salden & Ausgleich

Stand: 2026-10-23 · UI/UX · Status: **Überarbeitung nach Auftraggeber-Feedback zu Inkrement 10 – maßgeblich ist Abschnitt E** (gilt vor D; D gilt weiter, wo E nichts ändert; A–C bleiben als Entwurf vom 2026-10-20 stehen) · Features **F-035 + F-036**, Q35, Q36 · Routen `/trips/{id}/costs`, `/costs/balances`, `/costs/new`, `/costs/{eid}/edit` · Cockpit-Anbindung: [W16 v2.17](w16-cockpit.md) (vorher v2.15) · Vorher/Nachher-Mockup: [`../mockups/kosten-v2/index.html`](../mockups/kosten-v2/index.html)
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

---

## D. Inkrement-10-Schnitt und Präzisierungen (2026-10-23, gilt vor A–C)

**Abgrenzung:** Datenmodell, Rechte-Prüfung, Rechenregeln (Cent, Rundung, Ausgleichsvorschlag), Export/Löschung und Demo-Seed regelt [`features.md` R.8](../../product/features.md) (PM, 2026-10-23). Dieser Abschnitt regelt **UI, Abläufe, Zustände und Texte** und ist an R.8 sowie die CEO-Entscheidungen vom 2026-10-23 angeglichen: **(a)** die Orga markiert **keine** Ausgleiche zwischen zwei Mitgliedern mit Konto; **(b)** Abschließen sperrt Ausgaben **und** das Markieren. Die UI sagt nie „minimal“. Verbleibende UX-Ergänzungen zu R.8 stehen in D.15. Cockpit (Kachel, A1, D1, Kopf-Tasten, Erinnern): [W16 v2.15](w16-cockpit.md). Optik/Motion-Bitten: [`../abstimmung-design.md` §15](../abstimmung-design.md).

### D.0 Was sich gegenüber A–C ändert
| Thema | A–C (Entwurf) | **gilt jetzt** | Grund |
|---|---|---|---|
| Währung | «eine Währung (EUR)» | **Währung der Reise** (`trip.currency`, 12 erlaubte Codes, R.8 Regel 8), Orga kann sie ändern, **solange es keine Ausgabe und keinen Ausgleich gibt** (D.4.4) | R.8 I10-08; Reisen in GB/CH/DK … |
| Betrag-Eingabe | Komma/Punkt «je Region» | Preis-Parser aus I9-02 (Trenner nach Sprache), **erweitert um einen Fall**: ein einzelner „falscher“ Trenner mit 1–2 Ziffern am Ende gilt als Dezimaltrenner (D.5.2) | Android-Tastaturen zeigen bei `inputmode=decimal` oft nur «.» – «12.50» auf DE darf nicht scheitern |
| Kategorie | Essen vorausgewählt | **keine Vorauswahl**, erneutes Tippen hebt auf (D.5.4) | optional heißt optional |
| Notiz | fehlt | **optional, ≤ 200**, hinter Text-Taste «+ Notiz» (D.5.1) | Auftrag CEO; Formular bleibt kurz |
| „Gleich“-Vorschau | Liste je Person | **eine Zeile** «Je Person 10,00 €» (+ Rundungshinweis) | 360 px, Formular kürzer |
| Speichern | optimistisch | **Taste im Ladezustand, dann Liste** (D.5.6) + Idempotenz-Schlüssel (R.8 I10-02); optimistisch bleiben Löschen (weich, Rückgängig) und „als bezahlt markieren“ | keine Phantom-Buchungen bei Geld |
| Ausgleich-Ansicht | eine Liste | **«Deine Ausgleiche»** zuerst, dann «Weitere Ausgleiche» (D.7) | „Was muss ich tun?“ zuerst |
| Markieren | ein Wort für beide | Zahlende: «Als bezahlt markieren» · Empfangende: «Als erhalten markieren»; **immer der Betrag der Vorschlagszeile** (Teilzahlung später, R.8) (D.8) | Perspektive |
| Bestätigung durch Empfänger | – | **keine Pflicht-Bestätigung**; Transparenz + Zurücknehmen durch beide (D.8.3) | Freunde, kein Zahlungsverkehr; zweiter Schritt würde Salden tagelang „hängen“ lassen |
| Abschließen | sperrt alles | sperrt Ausgaben **und** Ausgleiche (CEO b); jederzeit möglich, empfohlen ab *Danach*; mit offenen Salden nur nach Warnung; wieder öffnen (D.9) | R.8 I10-08 |
| Zahlungsinfo | ein Freitext | **zwei Felder:** IBAN (geprüft, maskiert, `[Anzeigen]`/`[Kopieren]`) + «Anderer Weg» (Freitext ≤ 100, keine Links) (D.8.4) | R.8 I10-07 |
| Platzhalter / ehemalige Mitglieder | Platzhalter-Chip | markiert wird von der Gegenseite, die Orga nur, wenn **keine** Seite ein Mitglied mit Konto ist (CEO a); ehemalige nummeriert; Platzhalter mit Ausgaben nicht löschbar (D.8.2, D.10) | R.8 I10-04 |

### D.1 Verfügbarkeit (Phasen-Regeln)
| Lage | `/costs`, `/costs/balances`, `/costs/new`, `/costs/{eid}/edit` |
|---|---|
| Phase 1/2 (auch nach „Festlegung aufheben“) | Weiterleitung (307) auf `/trips/{id}`, ohne Meldung – wie Unterkünfte (W18 E.1, CEO a). Ausgaben, Zahlungen, Zahlungsinfos bleiben gespeichert und sind nach der nächsten Festlegung unverändert da. „Reise verlassen“ warnt auch in Phase 2 bei offenem Saldo (D.10). |
| Phase `fixed` – *Vorbereitung* | voll nutzbar (Anzahlungen, Fähre, Unterkunft). Cockpit: Kachel + A1 ab 50 €. |
| *Unterwegs* | voll nutzbar; Cockpit-Kopf `[+ Ausgabe]`. |
| *Danach* | voll nutzbar (Nachträge sind normal). Cockpit: D1. Gelöscht mit der Reise (90 Tage, Q31). |
| Abrechnung abgeschlossen (jede Teilphase) | nur lesen + eigene Zahlungsinfo ändern. **Keine** Ausgaben anlegen/ändern/löschen, **kein** Markieren/Zurücknehmen (CEO b). `/costs/new` und `/edit` → Weiterleitung auf `/costs` + Snackbar «Die Abrechnung ist abgeschlossen.». Orga kann wieder öffnen. |
| Nicht-Mitglied / falsche Reise / unbekannte Ausgabe | gleiche 404 wie andere Reise-Unterseiten |

### D.2 Rechte – was die Oberfläche je Rolle zeigt
| Element | Mitglied | Orga |
|---|---|---|
| Ausgaben, Salden, Ausgleiche, Zahlungsinfos aller ansehen | ✔ | ✔ |
| Ausgabe anlegen (auch für/von Platzhaltern) | ✔ | ✔ |
| Ausgabe bearbeiten/löschen | wenn **angelegt von mir** oder **bezahlt von mir** | alle |
| Ausgleich markieren | wenn ich **Zahlende:r oder Empfangende:r** bin (ist die andere Seite Platzhalter/ehemalig, markiere ich allein) | wie Mitglied; **zusätzlich nur**, wenn **keine** der beiden Seiten ein Mitglied mit Konto ist (Platzhalter/ehemalig ↔ Platzhalter/ehemalig). **Nie** für zwei Mitglieder mit Konto (CEO a) |
| Ausgleichszahlung zurücknehmen | Zahlende, Empfangende oder wer markiert hat | ✔ |
| Eigene Zahlungsinfo (IBAN, anderer Weg) | ✔ jederzeit, auch abgeschlossen | ✔ nur eigene |
| Währung ändern (keine Ausgabe, kein Ausgleich), abschließen/wieder öffnen | – | ✔ |
| Platzhalter löschen | – | gesperrt, solange er in Ausgaben/Ausgleichen vorkommt (D.10) |
Rechte gelten serverseitig (R.8). Abgeschlossen sperrt alle Schreibaktionen außer Zahlungsinfo. Fehlt ein Recht, fehlt die Taste – bei Ausgaben steht stattdessen ein Satz, wer es kann (D.4.3), bei Ausgleichen «Markieren können Jonas oder Kemal.» bzw. «Markieren kann die Orga.».

### D.3 Bereich `/costs` – Aufbau (mobil, von oben)
Kopf wie W18 E.3/W22 C: ← (zum Cockpit, Fokus zurück auf Herkunfts-Kachel/-Station) · Reisename klein + h1 «Kosten» · rechts Kontur-Taste `[Teilen]` (44 px; Container < 400 px nur Icon mit Namen «Abrechnung teilen»; nur bei ≥ 1 Ausgabe). `<title>` «Kosten · {Reise} · Wir wollen weg» bzw. «Ausgleich · {Reise} · …» auf `/balances`.

```
┌────────────────────────────────────┐
│▓(←) Kroatien 2027        [⇪ Teilen]▓│
│▓    Kosten                        ▓│  h1
╰▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╯
│ ┌────────────────────────────────┐ │  „Dein Stand“ (section, aria-labelledby)
│ │ DEIN STAND                     │ │
│ │ Du schuldest 86,00 €           │ │  Saldo-Satz 26/800, tabular
│ │ Dein Anteil 112,00 € · bezahlt │ │  erklärt den Saldo (bezahlt − Anteil)
│ │ 26,00 €                        │ │
│ │ Ausgaben gesamt 456,00 €       │ │
│ │ So gleichst du aus ›           │ │  Link → /costs/balances (nur Saldo ≠ 0)
│ └────────────────────────────────┘ │
│ [ Ausgaben ][ Ausgleich ]          │  Segment = 2 Links, aria-current="page"
│ Sa., 1. Mai              210,00 €  │  h2 Tag + Tagessumme
│ ┌────────────────────────────────┐ │
│ │(✦) Bootstour          150,00 € │ │  ganze Zeile = Button → Detail-Sheet
│ │    Lena hat bezahlt · für alle │ │
│ │    6         dein Anteil 25,00 €│ │
│ ├────────────────────────────────┤ │
│ │(🍴) Pizza am Hafen      60,00 € │ │
│ │    Du hast bezahlt · für Lena, │ │
│ │    dich, Kemal  dein Anteil 20,00│ │
│ └────────────────────────────────┘ │
│ Fr., 30. April           246,00 €  │
│ …                                  │
│ Alle Beträge in Euro. Wir über-    │  Fußzeile 13 px
│ weisen nichts – wir zeigen nur,    │
│ wer wem was schuldet.              │
├────────────────────────────────────┤
│ [ +  Ausgabe hinzufügen          ] │  fixierte Aktionsleiste = einzige Primär-Taste
└────────────────────────────────────┘
```

| # | Block | sichtbar, wenn |
|---|---|---|
| 1 | Hinweis **«Abrechnung abgeschlossen»** (Info + Schloss): «{Orga} hat die Abrechnung am {Datum} abgeschlossen. Ausgaben und Ausgleiche lassen sich nicht mehr ändern.» · Orga: Text-Taste «Abrechnung wieder öffnen» | abgeschlossen |
| 2 | Hinweis **„an dich bezahlt“** (Info, einmal je Zahlung, D.8.3) | jemand hat seit meinem letzten Besuch einen Ausgleich an mich markiert |
| 3 | **Dein Stand** (D.6) – auf beiden Ansichten gleich | ≥ 1 Ausgabe oder Zahlung |
| 4 | Segment **Ausgaben · Ausgleich** (< 960 px) | ≥ 1 Ausgabe |
| 5 | **Ausgabenliste** (D.4) | ≥ 1 Ausgabe |
| 6 | **Leerzustand** (D.4.4) | 0 Ausgaben (dann entfallen 3, 4, Teilen) |
| 7 | Fußzeile «Alle Beträge in {Währungsname}. …» | immer |
| 8 | Aktionsleiste `[+ Ausgabe hinzufügen]` (Primär) | nicht abgeschlossen; im Leerzustand steht die Primär-Taste im Leerzustand, die Leiste entfällt |

**Segment-Name:** «Ausgleich» statt «Salden & Ausgleich» (Zeichenbudget 2 × ≤ 12 bei 360 px und 200 %; die Seite trägt h2 «Salden» trotzdem). EN «Expenses · Settle up».

### D.4 Ausgabenliste
#### D.4.1 Ordnung, Summen, Filter
- **Neueste zuerst nach Datum der Ausgabe**, innerhalb eines Tages nach Anlage-Zeitpunkt (neueste oben). Tagesgruppe = `<h2>` «Sa., 1. Mai» + Tagessumme rechts («210,00 €», sr «Summe 210,00 €»).
- **Summen:** gesamt und eigener Anteil in „Dein Stand“; je Tag in der Überschrift; je Zeile Betrag + «dein Anteil …». Ausgleichszahlungen zählen **nicht** zu „Ausgaben gesamt“ und erscheinen **nicht** in der Liste (nur unter Ausgleich › „Bereits bezahlt“).
- **Kein Filter in Stufe 1.** Begründung: Eine Reise hat typischerweise 20–80 Einträge; Tagesgruppen + Suche des Browsers reichen; jeder Filter bräuchte Leer- und Zurücksetz-Zustände. Statistik nach Kategorie/Person: später (F-035 „später“).
- **Lange Listen:** die ersten 100 Einträge (R.8: Salden immer über alle), darunter `[Ältere Ausgaben anzeigen ({n})]` (Sekundär, lädt alle; Fokus bleibt auf der Taste, die Taste verschwindet, Fokus auf die erste neue Zeile).

#### D.4.2 Zeile (`<li>`, ganze Zeile ein `<button>` → Detail-Sheet)
Icon-Kachel 36 (Kategorie, ohne Kategorie `receipt`) · Titel 16/700 (1 Zeile, „…“) · Zeile 2 (14, `text-muted`, max. 2 Zeilen): «{Zahler} hat bezahlt · für {wen}» · rechts Betrag 16/800 tabular, darunter 13 px «dein Anteil {x}» bzw. «nicht beteiligt».
- `{Zahler}`: «Du hast bezahlt» / «Lena hat bezahlt» / «Mia hat bezahlt» + Chip «Platzhalter» / «Ehemaliges Mitglied hat bezahlt» (bei mehreren «Ehemaliges Mitglied 2 hat bezahlt»).
- `{wen}`: alle aktuellen Reisenden → «für alle {n}»; bis 3 Personen → Namen («für Lena, dich und Kemal»); mehr → «für 5 Personen».
- Nach Beträgen aufgeteilt: Zusatz-Chip klein «nach Beträgen» (nur Wort, kein Icon).
- Notiz vorhanden: Icon `comment` 16 hinter dem Titel (`aria-hidden`; sr-Zusatz «mit Notiz»).
- Zugänglicher Name: «{Titel}, {Betrag}. {Zahler} hat bezahlt, für {wen}. Dein Anteil {x}.»

#### D.4.3 Detail-Sheet (Desktop: Dialog)
h2 Titel · Betrag 26/800 · Zeile «{Kategorie} · {Datum lang} · {Zahler} hat bezahlt» · Notiz (falls vorhanden, volle Länge) · h3 «Aufteilung» (`<ul>` je Person: Avatar · Name · Betrag; «Gleich aufgeteilt» bzw. «Nach Beträgen») · 13 px «Angelegt von Kemal am 1. Mai» bzw. «Angelegt von Kemal am 1. Mai · zuletzt geändert von Lena am 2. Mai».
Aktionen (wenn berechtigt und nicht abgeschlossen): `[Bearbeiten]` (Sekundär) → `/costs/{eid}/edit` · `[Löschen]` (Text, destruktiv) → **sofort** (weiches Löschen, R.8 I10-03), Sheet schließt, Snackbar «„Pizza am Hafen“ gelöscht.» + «Rückgängig» (6 s, ux-spec §4.3; Strg/Cmd+Z), Fokus auf die nächste Zeile bzw. die Tagesüberschrift. Kein Dialog – Rückgängig reicht. Nach Ablauf der Snackbar gibt es kein Wiederherstellen in der Oberfläche (endgültig nach 24 h durch den Löschjob). Version abweichend (jemand hat sie inzwischen geändert) → kein Löschen, Banner wie D.5.7 «Lena hat diese Ausgabe gerade geändert.» + Sheet zeigt den neuen Stand.
Ohne Recht: «Ändern können Kemal und die Orga.» (bzw. «Kemal, Sara und die Orga.», wenn Anlegende ≠ Zahlende; ehemalige Mitglieder werden nicht genannt → «Ändern kann die Orga.»). Abgeschlossen: «Die Abrechnung ist abgeschlossen.»

#### D.4.4 Leerzustand
Illustration `empty-costs` (D-60) · h2 «Noch keine Ausgaben» · «Wer etwas für die Gruppe bezahlt, trägt es hier ein – wir rechnen aus, wer wem was schuldet.» · Primär `[Ausgabe hinzufügen]` · darunter Zeile «Währung: Euro (EUR)» – **Orga** mit Text-Taste «Ändern» → Sheet h2 „Währung der Reise“ (Radioliste der 12 erlaubten Währungen, R.8 Regel 8: aktuelle zuerst, dann EUR, GBP, CHF, USD, DKK, SEK, NOK, PLN, CZK, HUF, CAD, AUD – Anzeige «Euro (EUR)» über `Intl.DisplayNames`; `[Abbrechen]` `[Speichern]`; Hilfe «Geht nur, solange es keine Ausgaben gibt. Preise bei Unterkünften bleiben in ihrer Währung.»). Snackbar «Währung: Britisches Pfund (GBP).». Ablehnung durch den Server (inzwischen hat jemand eine Ausgabe angelegt) → Sheet zeigt «Die Währung lässt sich nur ändern, solange es keine Ausgaben gibt.», Taste gesperrt. Ab der ersten Ausgabe oder Ausgleichszahlung nur noch die Fußzeile, kein «Ändern» (auch nach Löschen aller Ausgaben wieder möglich, sobald keine Ausgleichszahlung existiert).

### D.5 Ausgabe hinzufügen / bearbeiten (`/costs/new`, `/costs/{eid}/edit`)
Eigene Seite (kein Sheet – Tastatur, 200 %, Zurück-Taste). Kopf: ← · h1 «Ausgabe hinzufügen» / «Ausgabe bearbeiten». Aktionsleiste: Primär `[Speichern]` («Ausgabe speichern» / «Änderungen speichern»).

```
│▓(←) Ausgabe hinzufügen            ▓│
│ Betrag                             │
│ ┌────────────────────────────────┐ │
│ │ 60,00                       €  │ │  56 px hoch, 28/800, inputmode=decimal
│ └────────────────────────────────┘ │  Autofokus nur bei „neu“
│ Wofür?                             │
│ [z. B. Abendessen am Hafen       ] │
│ Kategorie (optional)               │
│ (🛏 Unterkunft)(✈ Anreise)(🍴 Essen)│  Einfachauswahl, keine Vorauswahl
│ (✦ Aktivitäten)(🏷 Sonstiges)       │
│ Bezahlt von                        │
│ [Ich (Max)                     ▾ ] │  natives <select>
│ Für wen?  6 von 6  [Alle abwählen] │  Zähler + Text-Taste
│ (LE Lena ✓)(MA Ich ✓)(KE Kemal ✓)  │  Checkbox-Chips ≥ 44 px
│ (SA Sara ✓)(JO Jonas ✓)            │
│ (MI Mia · Platzhalter ✓)           │
│ Aufteilung                         │
│ (● Gleich)(○ Nach Beträgen)        │  Radiogruppe als Segment
│ Je Person 10,00 €                  │  Live-Zeile
│ Datum                              │
│ [So., 2. Mai 2027              ▣ ] │  natives date
│ + Notiz                            │  Text-Taste, klappt Feld auf
├────────────────────────────────────┤
│ [        Ausgabe speichern       ] │
└────────────────────────────────────┘
```

#### D.5.1 Felder, Vorbelegung, Reihenfolge
**Schnellweg:** Betrag → Wofür? → Speichern (drei Handgriffe; alles andere ist sinnvoll vorbelegt).
| Feld | Vorbelegung | Regel | Fehlertext DE / EN |
|---|---|---|---|
| **Betrag** (Pflicht) | leer (bearbeiten: Wert ohne Tausenderpunkt, «1840,50») | > 0, ≤ 1 000 000, max. 2 Nachkommastellen, intern Cent (D.5.2) | leer: «Bitte gib einen Betrag ein.» / «Please enter an amount.» · Format: «Bitte einen Betrag wie 12,50 eingeben.» / «Please enter an amount like 12.50.» · zu groß: «Bitte höchstens 1.000.000 eingeben.» / «Please enter 1,000,000 or less.» |
| **Wofür?** (Pflicht) | leer | 1–60 Zeichen nach Trim; Zähler ab 50 | «Bitte gib an, wofür das war.» / «Please say what it was for.» |
| **Kategorie** (optional) | keine | eine oder keine (D.5.4) | – |
| **Bezahlt von** (Pflicht) | ich | genau eine Person: Mitglieder + Platzhalter; ehemalige Mitglieder nur, wenn die Ausgabe sie schon hat (bearbeiten) | – |
| **Für wen?** (Pflicht) | alle aktuellen Reisenden: Mitglieder **und** Platzhalter (auch „ohne App“, Q35) | ≥ 1 Person | «Wähle mindestens eine Person.» / «Pick at least one person.» |
| **Aufteilung** | Gleich | Nach Beträgen: Summe = Betrag (D.5.3) | «Die Beträge ergeben noch nicht die Summe.» / «The amounts don't add up yet.» |
| **Datum** (Pflicht) | heute (Zeitzone der Reise, `APP_TIME_ZONE`) | Anreise − 365 Tage bis Abreise + 90 Tage (R.8; `min`/`max` am Feld) | leer: «Bitte wähle ein Datum.» / «Please pick a date.» · außerhalb: «Bitte ein Datum zwischen {von} und {bis} wählen.» / «Please pick a date between {from} and {to}.» |
| **Notiz** (optional) | zugeklappt hinter «+ Notiz» (bearbeiten mit Notiz: offen) | ≤ 200, Zähler ab 160 | «Höchstens 200 Zeichen.» / «200 characters max.» |
Reihenfolge der Personen (Chips, Select, Aufteilung, Salden): **ich zuerst**, dann alle übrigen nach `seq` (R.8 – Anlage-Reihenfolge). Die Rundung verteilt den Rest-Cent nach `seq` **ohne** „ich zuerst“ – die Live-Zeile nennt deshalb die Namen (D.5.3).

#### D.5.2 Betrag-Eingabe DE / EN
- `<input type="text" inputmode="decimal" autocomplete="off" enterkeyhint="next">`, Label «Betrag» mit zugänglichem Namen «Betrag in Euro» (Währungsname aus `Intl.DisplayNames`); Symbol als Deko (`aria-hidden`) – **Position nach Sprache**: DE Suffix «60,00 €», EN Präfix «€60.00» bzw. «£60.00» (über `Intl.NumberFormat#formatToParts`). Platzhalter «0,00» / «0.00».
- **Lesen:** vorhandener Preis-Parser aus I9-02 (`parsePrice`, R.8 Regel 1) mit **einer Erweiterung** (gilt dann auch für W17): Enthält die Eingabe nur **einen** Trenner und ist es der „andere“ (DE «.», EN «,») mit **1–2 Ziffern am Ende**, gilt er als Dezimaltrenner – DE «12.5» = 12,50, EN «12,50» = 12.50. Mit **genau 3 Ziffern** bleibt er Tausender («1.840» = 1 840 / «1,840» = 1 840). Grund: viele Android-Tastaturen zeigen bei `inputmode=decimal` nur «.». Mehr als 2 Nachkommastellen → Format-Fehler (nicht runden).
- **Beim Verlassen des Felds** wird normalisiert angezeigt («12,5» → «12,50»; «1840» → «1.840,00» nur bei Anzeige, im Feld ohne Tausenderpunkt: «1840,00»). Kein Umformatieren während des Tippens.
- Validierung nach ux-spec §5.1 (beim Verlassen nach erster Eingabe und beim Absenden).

#### D.5.3 Aufteilung
- **Gleich:** eine Live-Zeile (14/600) «Je Person 10,00 €»; mit Rundungsrest «Je Person 3,33 € – Lena zahlt 1 Cent mehr.» bzw. «… – Lena und du zahlen je 1 Cent mehr.» (Rest nach `seq`, R.8 Regel 3: 100,00 € auf 3 → 33,34 · 33,33 · 33,33). Ohne gültigen Betrag: «Je Person –». `aria-live="polite"`, 500 ms entprellt.
- **Nach Beträgen:** je ausgewählter Person eine Zeile Avatar · Name (`<label>`) · Betragsfeld (gleiche Lese-Regeln, Label «Betrag für Lena», 44 px, rechtsbündig). Leeres Feld = 0; eine Person mit 0 ist beim Speichern **nicht beteiligt** (R.8 Regel 4 – Hinweis unter der Live-Zeile «Personen ohne Betrag sind nicht beteiligt.», nur wenn es solche gibt). Darunter die **Live-Zeile** (`aria-live="polite"`, entprellt):
  - Rest > 0: «Noch 12,00 € zu verteilen» (Amber-Text + Info-Icon, **nicht Rot**) + Text-Taste «Auf leere Felder verteilen» (nur wenn es leere Felder gibt; verteilt den Rest gleich, Cent-Rest nach Reihenfolge)
  - Rest < 0: «3,00 € zu viel verteilt» (Amber)
  - Rest = 0: «✓ Passt genau» (Minze-Text)
- Wechsel Gleich ↔ Nach Beträgen behält die eingegebenen Einzelbeträge bis zum Speichern (zurückwechseln stellt sie wieder her). Ändert sich der Gesamtbetrag, bleiben Einzelbeträge stehen, die Live-Zeile rechnet neu (nichts wird heimlich umskaliert).
- Person abgewählt → ihr Feld verschwindet, ihr Betrag zählt nicht mehr (Live-Zeile aktualisiert sich).

#### D.5.4 Kategorie
Gruppe `role="group"` «Kategorie (optional)» aus Umschalt-Chips (`<button aria-pressed>`, Einfachauswahl: Tippen auf einen anderen Chip wechselt, erneutes Tippen hebt auf). Chips: Unterkunft (`bed`) · Anreise (`plane`) · Essen (`food`, neu D-58) · Aktivitäten (`sparkle`) · Sonstiges (`tag`, neu D-58). Ohne Kategorie zeigt die Liste `receipt` (neu D-58). Keine automatische Kategorie aus dem Titel (wäre Rätselraten).

#### D.5.5 Für wen?
Legende «Für wen?» + Zähler «{n} von {total}» (sr: «{n} von {total} ausgewählt») + Text-Taste «Alle abwählen» / «Alle auswählen» (wechselt je nach Lage). Chips = native Checkboxen im `<label>` (Avatar 24 · Name · ggf. «· Platzhalter»), ≥ 44 px, umbrechend. Bei 30 Personen bleibt es ein umbrechendes Chip-Feld (kein Akkordeon). **Ehemalige Mitglieder** erscheinen nur beim Bearbeiten einer Ausgabe, an der sie beteiligt sind – als Chip «ehemaliges Mitglied (2)» angehakt, abwählbar, nicht wieder anwählbar (Hinweis darunter «Ehemalige Mitglieder lassen sich nur entfernen.»). Ein **ehemaliger Zahler** steht im Select als «Ehemaliges Mitglied» (nur solange gewählt) und bleibt, bis eine aktive Person gewählt wird (R.8 I10-03).

#### D.5.6 Speichern, Abbrechen, Fehler
- **Absenden:** Validierung → mit Fehlern: Fehlerzusammenfassung oben (`role="alert"`, > 3 Felder, ux-spec §5.1) mit Sprunglinks, Fokus auf die Zusammenfassung; „Nach Beträgen“ falsch: Fokus auf das erste Betragsfeld der Aufteilung + Ansage «Die Beträge ergeben noch nicht die Summe.».
- **Ohne Fehler:** Taste im Ladezustand («Speichert …», gesperrt gegen Doppeltippen; Server zusätzlich idempotent über ein Formular-Token, R.8). Nach Erfolg:
  - von der Liste gekommen → `/costs`, Snackbar «60,00 € gespeichert – Salden sind aktualisiert.» (4 s), Fokus auf die h1, neue Zeile kurz hervorgehoben (D.13);
  - vom Cockpit gekommen (`/costs/new?date=today&from=cockpit`, Kopf-Taste `[+ Ausgabe]`) → **zurück ins Cockpit**, gleiche Snackbar mit Aktion «Ansehen» (→ `/costs`), Fokus auf `[+ Ausgabe]`;
  - bearbeiten → `/costs`, Snackbar «Änderungen gespeichert.», Fokus auf die Zeile.
- **Serverfehler / offline:** Eingaben bleiben stehen, Fehler-Banner über der Aktionsleiste «Konnte nicht speichern. Deine Eingaben sind noch da. [Nochmal versuchen]» (offline: Text aus ux-spec §6). Kein lokales Zwischenspeichern über das Seitenende hinaus.
- **Zurück mit Eingaben:** Dialog «Ausgabe verwerfen?» · «Deine Eingaben gehen verloren.» · `[Weiter bearbeiten]` `[Verwerfen]` (ux-spec §3 – explizites Speichern).

#### D.5.7 Konflikte
| Fall | Verhalten |
|---|---|
| Jemand hat die Ausgabe geändert, während ich bearbeite (`version` weicht ab, R.8 I10-03 – Server ändert nichts) | Banner (Amber, `role="alert"`, Fokus darauf) «Lena hat diese Ausgabe gerade geändert.» + darunter kompakt **ihr aktueller Stand** («Jetzt: 64,00 € · Lena hat bezahlt · für alle 6»). Tasten `[Ihre Fassung übernehmen]` (lädt die aktuellen Werte ins Formular, meine Eingaben gehen verloren – keine Rückfrage nötig, der Satz sagt es) und `[Meine trotzdem speichern]` (sendet meine Eingaben mit der **neuen** Version, überschreibt bewusst). Bis zur Wahl bleiben meine Eingaben stehen. |
| Ausgabe inzwischen gelöscht | Banner «Diese Ausgabe wurde inzwischen gelöscht.» + `[Als neue Ausgabe speichern]` · `[Zur Liste]` |
| Abrechnung inzwischen abgeschlossen | Banner «{Orga} hat die Abrechnung gerade abgeschlossen – Ausgaben lassen sich nicht mehr ändern.» + `[Zur Liste]`; Speichern gesperrt. |
| Beteiligte Person hat die Reise inzwischen verlassen | Speichern klappt; die Person erscheint als «ehemaliges Mitglied» (kein Fehler). |
| Platzhalter ist inzwischen beigetreten | Speichern klappt; Name aktualisiert sich (gleiche Person). |

### D.6 „Dein Stand“ – Saldo-Regeln (verbindlich überall)
- **Saldo** = bezahlt − eigener Anteil + gesendete Ausgleiche − empfangene Ausgleiche (R.8 „Begriffe“).
- **Wortlaut, nie nur Farbe oder Vorzeichen:**

| Lage | eigene Sicht DE / EN | über andere DE / EN |
|---|---|---|
| > 0 | Du bekommst 42,00 € / You're owed €42.00 | bekommt 42,00 € / is owed €42.00 |
| < 0 | Du schuldest 86,00 € / You owe €86.00 | schuldet 86,00 € / owes €86.00 |
| = 0 | Du bist ausgeglichen ✓ / You're all square ✓ | ausgeglichen ✓ / all square ✓ |
In Fließtext/Kachel klein geschrieben («du schuldest 86,00 €», «bei dir ausgeglichen ✓» / «you owe €86.00», «you're all square ✓»).
- **Farbe:** bekommt = Minze-Text (`accent-text`), schuldet = **Tinte** (`text`), ausgeglichen = Minze-Text + Häkchen. **Nie Rot, nie Koralle, kein Minus-Zeichen** – Schulden sind kein Fehler.
- **Beträge immer exakt** (Cent, `Intl.NumberFormat` mit 2 Nachkommastellen in Salden/Ausgleich; Kachel darf ganze Beträge ohne „,00“ zeigen wie `formatMoney`). Kein Runden auf „ausgeglichen“ – 0,01 € ist eine (kleine) Schuld.
- Zeilen in „Dein Stand“: Saldo-Satz · «Dein Anteil {a} · bezahlt {b}» (erklärt den Saldo; mit Ausgleichen: «· Ausgleiche {c}» als dritte Angabe) · «Ausgaben gesamt {t}» · Link «So gleichst du aus ›» (nur auf `/costs`, nur bei Saldo ≠ 0).

### D.7 Ausgleich (`/costs/balances`)
```
│ DEIN STAND …                       │  wie D.6
│ [ Ausgaben ][ Ausgleich ]          │
│ Deine Ausgleiche                   │  h2 (nur wenn ich beteiligt bin)
│ ┌────────────────────────────────┐ │
│ │ Du → Kemal            86,00 €  │ │  sr: «Du an Kemal: 86,00 €»
│ │ IBAN DE89 •••• … 3000          │ │  Zahlungsinfo des Empfängers (maskiert)
│ │      [Anzeigen] [Kopieren]     │ │
│ │ PayPal: kemal.b    [Kopieren]  │ │  „anderer Weg“, reiner Text
│ │ [ Als bezahlt markieren ]      │ │  Primär (erste eigene Schuld), sonst Sekundär
│ ├────────────────────────────────┤ │
│ │ Sara → Du             42,00 €  │ │
│ │ [Als erhalten markieren] [🔔 Sara erinnern]│
│ └────────────────────────────────┘ │
│ Weitere Ausgleiche                 │  h2
│ Mit 4 Überweisungen ist alles      │
│ erledigt.                          │
│ │ Jonas → Kemal         14,00 €  │ │  ohne Taste: «Markieren können Jonas oder Kemal.»
│ │ Mia [Platzhalter] → Lena 22,00 €│ │  «Markieren kann Lena.»
│ Bereits bezahlt (3)            ▾   │  Button aria-expanded, eingeklappt
│ Salden                             │  h2
│ (MA) Du          du schuldest 86,00 €│  ich zuerst
│ (LE) Lena          bekommt 64,00 € │  dann nach seq
│ (KE) Kemal         bekommt 42,00 € │
│ (MI) Mia [Platzhalter] schuldet 22,00 €│
│ Deine Zahlungsinfo (freiwillig)    │  h2-Karte (D.8.4)
│ IBAN DE12 •••• … 0042  [Ändern]    │
│ [ Abrechnung abschließen ]         │  nur Orga, Sekundär (D.9)
```
- **Deine Ausgleiche** (h2): Vorschläge, in denen ich Zahlende:r oder Empfangende:r bin – Schulden zuerst. Entfällt, wenn ich nicht beteiligt bin.
- **Weitere Ausgleiche** (h2, bzw. «So gleicht ihr aus», wenn ich nicht beteiligt bin) + Satz «Mit {n} Überweisungen ist alles erledigt.» (Gesamtzahl aller offenen Vorschläge, auch meine).
- **Vorschlag** = `settleUp()` (exakte Paare + Greedy, deterministisch, R.8 Regel 6) aus den **aktuellen** Salden – ändert sich nach jeder Ausgabe/Zahlung. Die UI sagt **nie** „minimal“/„so wenig wie möglich“, nur «Mit {n} Überweisungen ist alles erledigt.». Darstellung immer «Zahler → Empfänger · Betrag»; Pfeil `arrow-right` `aria-hidden`, sr-Text «an».
- **Alles ausgeglichen:** statt der Vorschläge Karte mit kleinem Siegel «Alles ausgeglichen ✓» + «Niemand schuldet jemandem etwas.» (Orga, nicht abgeschlossen: darunter `[Abrechnung abschließen]` sekundär).
- **Bereits bezahlt ({n})**, eingeklappt: Zeilen «Max → Kemal: 86,00 €» + 13 px «markiert von Max, 3. Mai» (Orga für zwei Nicht-Konto-Seiten: «markiert von Lena (Orga), 3. Mai»); Text-Taste «Zurücknehmen» für Zahlende, Empfangende und wer markiert hat (nicht bei abgeschlossener Abrechnung) → sofort, Snackbar «Zahlung zurückgenommen.» + «Rückgängig».
- **Salden** (h2): `<ul>` aller aktiven Personen (auch 0 = «ausgeglichen ✓») und aller ehemaligen mit Saldo ≠ 0; **ich zuerst, dann nach `seq`** (R.8 I10-05 – stabile Reihenfolge, Personen springen nicht). Platzhalter mit Chip «Platzhalter», ehemalige als «Ehemaliges Mitglied» bzw. «Ehemaliges Mitglied 2». Optional Balken je Person (`aria-hidden`, Designer D-57).

### D.8 Als bezahlt / erhalten markieren, Zahlungsinfo
#### D.8.1 Markieren
- **Wer:** Zahlende **oder** Empfangende. Ist die andere Seite Platzhalter oder ehemaliges Mitglied, markiert die Seite mit Konto allein («Mia → Lena»: Lena tippt «Als erhalten markieren»). Die **Orga** markiert für andere **nur**, wenn **keine** Seite ein Mitglied mit Konto ist (z. B. «Mia → ehemaliges Mitglied»); **nie** zwischen zwei Mitgliedern mit Konto (CEO a – ob Geld zwischen Kemal und Lena geflossen ist, wissen nur die beiden). Für alle anderen keine Taste, sondern «Markieren können {A} oder {B}.» / «Markieren kann {A}.» / «Markieren kann die Orga.».
- **Betrag:** immer der Betrag der Vorschlagszeile (Teilzahlung/freie Zahlung später, R.8). Wer nur einen Teil überwiesen hat, markiert erst, wenn alles da ist.
- **Ablauf:** Tippen bucht **sofort** (optimistisch) eine Ausgleichszahlung. Die Zeile bleibt an ihrem Platz und wird zu «✓ Bezahlt» (Chip, Minze) + Text-Taste «Zurücknehmen»; „Dein Stand“ und Salden aktualisieren sich sofort (Text-Wechsel, D.13). Snackbar «Als bezahlt markiert: Du → Kemal, 86,00 €.» + «Rückgängig» (6 s). Beim nächsten Laden (oder nach Verlassen der Ansicht) steht die Zahlung unter „Bereits bezahlt“ – das „Wandern“ ist ein Motion-Punkt (UM-15), Ergebnis muss motion-system §5.10 (nichts verschwindet unter dem Finger) einhalten.
- **Server lehnt ab** (Salden inzwischen anders, R.8 I10-06 – auch beim Doppeltipp auf zwei Geräten) → Zeile zurück, Banner «Die Abrechnung hat sich gerade geändert – hier ist der aktuelle Stand.» + Ansicht lädt neu. Netzwerkfehler → Zeile zurück, Banner mit `[Nochmal versuchen]` (kein stilles Wiederholen bei Geld).
- **Abgeschlossen:** keine Markieren-/Zurücknehmen-Tasten; Zeilen ohne Taste mit Satz «Die Abrechnung ist abgeschlossen.» einmal über der Liste (nicht je Zeile).

#### D.8.2 Platzhalter und ehemalige Mitglieder
Tritt Mia über ihren Platzhalter-Link bei, übernimmt sie Ausgaben, Saldo und Zahlungen (R.8 I10-04) – die Oberfläche zeigt einfach ihren Namen ohne Chip. Platzhalter haben **keine** Zahlungsinfo; ehemalige Mitglieder verlieren sie beim Austritt. Tritt ein ehemaliges Mitglied erneut bei, ist es eine neue Person in der Abrechnung (kein Zusammenführen – kein UI-Hinweis nötig).

#### D.8.3 Keine Pflicht-Bestätigung durch Empfangende – aber Transparenz
- Jede Zahlung zeigt, **wer** sie markiert hat und wann.
- Markiert jemand einen Ausgleich **an mich**, sehe ich beim nächsten Öffnen von Kosten (beide Ansichten) einmal den Hinweis (Info, oben): «Max hat 86,00 € an dich als bezahlt markiert. Nicht angekommen? Du kannst es unter „Bereits bezahlt“ zurücknehmen.» + Schließen 44 px. Merker „gesehen“ je Zahlung im `localStorage` (nur IDs, keine Beträge); mehrere → «Max und Jonas haben 100,00 € an dich als bezahlt markiert. …».
- Beide Seiten können zurücknehmen (solange nicht abgeschlossen). Ein zweiter Bestätigungsschritt würde Salden tagelang „hängen“ lassen und zusätzliche Zustände („wartet auf Bestätigung“) in Kachel, A1 und D1 erzeugen – für eine Freundesgruppe ohne Zahlungsverkehr unverhältnismäßig.

#### D.8.4 Zahlungsinfo (freiwillig, je Reise; R.8 I10-07)
**Karte «Deine Zahlungsinfo (freiwillig)»** auf `/balances` (nur Mitglieder mit Konto): leer «Noch nichts hinterlegt – z. B. IBAN oder PayPal-Name.» + `[Hinterlegen]`; gefüllt: IBAN maskiert und/oder anderer Weg + 13 px «zuletzt geändert {Datum}» + `[Ändern]`.

**Sheet h2 «Deine Zahlungsinfo»** (Desktop Dialog), zwei optionale Felder:
| Feld | Eingabe | Regel / Meldung DE · EN |
|---|---|---|
| **IBAN** (optional) | `type="text"`, `inputmode="text"`, `autocapitalize="characters"`, `autocomplete="off"`, `spellcheck="false"`; Leerzeichen erlaubt, beim Verlassen Anzeige in Vierergruppen | Prüfung nach R.8 (Format, Länge je Land, Mod 97) beim Verlassen und Absenden: «Diese IBAN stimmt nicht – bitte prüf die Eingabe.» · «This IBAN doesn't look right – please check it.» |
| **Anderer Weg** (optional) | einzeilig, ≤ 100, Zähler ab 80, Beispiel «z. B. PayPal: max.m» | «Höchstens 100 Zeichen.» · «100 characters max.» – Links werden **nicht** verlinkt (nur Text) |
Hilfetext über den Tasten: «**Alle in dieser Reise können das lesen.** Wird gelöscht, wenn du die Reise verlässt.» · Tasten `[Abbrechen]` `[Speichern]`; gefüllt zusätzlich Text-Taste «Zahlungsinfo löschen» (sofort, Snackbar «Zahlungsinfo gelöscht.» + «Rückgängig»). Beide Felder leer speichern = löschen.

**Anzeige** – nur in Ausgleichszeilen, in denen die Person **Empfänger:in** ist (für alle Mitglieder sichtbar, Q35):
- **IBAN maskiert:** «IBAN DE89 •••• •••• •••• •••• 3000» (Ländercode + Prüfziffer + letzte 4); sr «IBAN von Kemal, endet auf 3000». Text-Tasten (44 px): `[Anzeigen]` → volle IBAN in Vierergruppen bis zum Verlassen der Seite, Taste wird zu `[Verbergen]` (`aria-pressed`) · `[Kopieren]` → volle IBAN **ohne Leerzeichen**, Taste 2 s «Kopiert ✓» + Ansage «IBAN kopiert» (ux-spec §4.5). Zugängliche Namen «IBAN von Kemal anzeigen» / «… kopieren». Bei 360 px brechen die Tasten unter die IBAN.
- **Anderer Weg:** reiner Text (nie Link, nie HTML) + `[Kopieren]` («Zahlungsinfo von Kemal kopieren»).
- **Keine** Zahlungsinfo beim Empfänger und ich bin Zahlende:r: «Kemal hat keine Zahlungsinfo hinterlegt – frag am besten direkt.»
- Nicht im Teilen-Text, nicht in Erinnern-Texten, nicht in Mails (R.8).

### D.9 Abrechnung abschließen / wieder öffnen (nur Orga)
- `[Abrechnung abschließen]` (Sekundär, **nie** Primär, U-30) steht für die Orga am Ende von `/balances` – **jederzeit**, empfohlen ab *Danach* (vorher mit 13 px darunter «Üblich ist das nach der Reise.»). Im Cockpit erscheint es nur als D1-Taste, wenn alles ausgeglichen ist (W16 v2.15).
- Dialog (ux-spec §4.2): h2 «Abrechnung abschließen?»
  - alles ausgeglichen: «Danach kann niemand mehr Ausgaben oder Ausgleiche ändern. Du kannst sie wieder öffnen.» · `[Abbrechen]` `[Abschließen]`
  - **offene Ausgleiche** (Warnung, Amber-Icon): «Noch {n} Ausgleiche sind offen – trotzdem abschließen? Danach kann niemand mehr Ausgaben ändern oder Ausgleiche als bezahlt markieren, bis du wieder öffnest.» · `[Abbrechen]` `[Trotzdem abschließen]` (Standard-Fokus Abbrechen)
- Danach: Hinweis «Abrechnung abgeschlossen» (D.3 Block 1) mit Siegel 20, Snackbar «Abrechnung abgeschlossen.», Aktionsleiste und alle Schreib-Tasten entfallen; Cockpit-Kopf `[Ausgleichen]` entfällt.
- **Wieder öffnen:** Text-Taste «Abrechnung wieder öffnen» im Hinweis → sofort, Snackbar «Abrechnung wieder offen.» + «Rückgängig».

### D.10 Verlassen, entfernen, löschen mit offenem Saldo (Q35, R.8 I10-04)
| Auslöser | Ergänzung im bestehenden Dialog (vor den Tasten) |
|---|---|
| **Reise verlassen** (Mitglied), Saldo < 0, nicht abgeschlossen | «Du schuldest noch 86,00 €. Wenn du gehst, bleiben deine Ausgaben für die Gruppe erhalten und du erscheinst darin als „ehemaliges Mitglied“ – gleich am besten vorher aus.» + Text-Link «Zum Ausgleich» · Tasten `[Abbrechen]` `[Trotzdem verlassen]` (destruktiv; Standard-Fokus Abbrechen) |
| dto., Saldo > 0 | «Du bekommst noch 42,00 €. Wenn du gehst, bleiben deine Ausgaben als „ehemaliges Mitglied“ erhalten, und die anderen markieren ihre Zahlungen an dich selbst.» + «Zum Ausgleich» · `[Trotzdem verlassen]` |
| zusätzlich, wenn ich eine Zahlungsinfo hinterlegt habe (jeder Saldo) | «Deine Zahlungsinfo für diese Reise wird gelöscht.» |
| Saldo = 0 oder abgeschlossen | keine zusätzliche Warnung (bestehender Dialog, Taste «Reise verlassen») – außer dem Zahlungsinfo-Satz |
| **Mitglied entfernen** (Orga) mit Saldo ≠ 0 | «{Name} schuldet noch 23,50 €.» bzw. «{Name} bekommt noch 42,00 €.» + «Die Ausgaben bleiben erhalten; {Name} erscheint darin als „ehemaliges Mitglied“.» |
| **Platzhalter löschen** (Orga), Platzhalter kommt in Ausgaben/Ausgleichen vor | **gesperrt**: statt des Lösch-Dialogs ein Info-Dialog h2 «{Name} kann nicht gelöscht werden» · «{Name} kommt in {n} Ausgaben vor – erst dort entfernen.» (mit Ausgleichen: «… in {n} Ausgaben oder Ausgleichen vor …») · `[Zu den Kosten]` (Sekundär) `[OK]`. Die Lösch-Taste bleibt sichtbar (Ursache wird erklärt, ux-spec §4.1). Hinweis: weich gelöschte Ausgaben zählen 24 h mit (R.8). |
| **Konto löschen** (F-043, W13) | im Warn-Schritt zusätzlich: «In {n} Reisen ist bei dir noch nicht alles ausgeglichen:» + Liste «Kroatien 2027 – du schuldest 86,00 €» (Links zu den Ausgleich-Seiten). Blockiert nicht. |
Mehrere ehemalige Mitglieder in einer Reise: «Ehemaliges Mitglied 1», «… 2» (Nummer nach Austrittszeitpunkt, R.8); nur eines → ohne Nummer. Avatar neutral (D-59). Kleinschreibung im Satzinneren («… an ehemaliges Mitglied 2»).

### D.11 Teilen und Erinnern im Bereich
- **Teilen** (Kopf, Teilen-Sheet ux-spec §4.5): DE «Abrechnung {trip}:\n{Zahler} → {Empfänger}: {Betrag}\n…\nDetails: {link}» · alles ausgeglichen: «Abrechnung {trip}: Alles ausgeglichen ✓ {link}» · EN «Expenses for {trip}:\n{from} → {to}: {amount}\n…\nDetails: {link}» / «Expenses for {trip}: all square ✓ {link}». Namen: Anzeigenamen, ich als mein Name (nicht „Du“), ehemalige als «ehemaliges Mitglied». **Ohne** Zahlungsinfos, ohne Einzelausgaben. `{link}` = `/trips/{id}/costs/balances`.
- **Erinnern** (`[{Name} erinnern]`, Sekundär klein mit `remind`-Icon, nur in „Deine Ausgleiche“ bei Zeilen **an mich**, nicht bei ehemaligen Mitgliedern, nicht abgeschlossen): RemindSheet-Anlass `settle` (W16 v2.15). Schuldet ein **Platzhalter**: derselbe Text, `{link}` = sein persönlicher Link (R.8 I10-09, wie V2).

### D.12 Weitere Zustände
| Fall | Verhalten |
|---|---|
| Laden | Skelett ab 300 ms: „Dein Stand“-Umriss + 3 Zeilen |
| Ladefehler | ux-spec §6 Seitenfehler; Cockpit-Kachel «Stand gerade nicht verfügbar» (W16 v2.7) |
| Offline | Offline-Banner; Hinzufügen, Bearbeiten, Löschen, Markieren, Zahlungsinfo, Abschließen deaktiviert mit Hinweis (ux-spec §6) – Ansehen geht mit letztem Stand |
| Rate-Limit erreicht (R.8) | bestehende Limit-Meldung als Banner im Formular bzw. Snackbar; Eingaben bleiben |
| Nur ich in der Reise | alles nutzbar; Vorschläge leer → «Alles ausgeglichen ✓» |
| Ausgabe nur für mich, von mir bezahlt | erlaubt (Saldo unverändert) – Zeile «Du hast bezahlt · nur für dich» |
| Sehr lange Titel/Namen | Liste 1 Zeile + „…“, Detail-Sheet vollständig (`overflow-wrap: anywhere`) |
| Reise wird bald gelöscht (F-013) | wie Reise; Lösch-Hinweismail an die Orga nennt offene Salden (R.8) |

### D.13 Motion (Punkte an Motion Designer: `../abstimmung-design.md` §15.2)
| Moment | Volle Bewegung | Reduziert |
|---|---|---|
| Neue Ausgabe in der Liste (nach Speichern) | Zeile mit kurzer Tönung (Minze-Hauch → Fläche, `slow`), **kein** Einfliegen | statisch |
| Saldo / Summen ändern sich | **kein Hochzählen, keine rollenden Ziffern** (G-16) – Text wechselt, ganzer Satz `fade` 140 ms | sofort |
| Als bezahlt markiert | Häkchen-Pop am Chip «✓ Bezahlt» (`fast`, `spring-soft`); späteres Wandern nach „Bereits bezahlt“: UM-15 | sofort |
| **Eigener Saldo wird 0** (durch meine Aktion) | „Dein Stand“: Siegel 20 ploppt neben «Du bist ausgeglichen ✓» (`celebrate`, `spring-bouncy`) – der **Ausgleich-Moment** | Überblenden 140 ms |
| **Alle ausgeglichen** (letzte Zahlung der Gruppe, durch meine Aktion) | Karte «Alles ausgeglichen ✓» mit kleinem Siegel ploppt; **kein Konfetti** (bleibt Termin, Abreisetag, Ring) | statisch (Überblenden) |
| Löschen | Zeile klappt zu (`fast`), Rückgängig klappt wieder auf | sofort |
| Live-Zeile „zu verteilen“ | Farb-/Textwechsel ohne Bewegung | – |
| Vibration | keine (Q17) | – |
Momente nur bei **eigener** Aktion im Client, nie beim Laden von Server-HTML (sonst „feiert“ jeder Besuch).

### D.14 Responsive, 200 %, Dark Mode, Barrierefreiheit
- **360 × 640:** Formular: Betrag + Wofür? + Kategorie sichtbar über der Tastatur-Kante (Betragsfeld 56 px). Liste: Betrag rechts, max. 2 Zeilen links.
- **320 px / Container < 22 em und 200 %:** Listenzeile wird zweizeilig: Betrag unter den Titel (links), «dein Anteil» als eigene Zeile; Ausgleichszeile: Betrag unter die Namen, Tasten untereinander volle Breite; Segment-Labels bleiben einzeilig (≤ 12 Zeichen); Kopf-Taste Teilen nur Icon. Kein horizontales Scrollen (1.4.10).
- **600–959 px:** max. 640 px zentriert.
- **≥ 960 px:** `/costs` und `/costs/balances` zeigen **dieselbe zweispaltige Seite**: links Ausgabenliste (≈ 600 px), rechts sticky „Dein Stand“ + Ausgleich + Salden + Zahlungsinfo (320–360 px); Segment entfällt; `/balances` setzt den Fokus auf h2 «Deine Ausgleiche» bzw. «So gleicht ihr aus» (DOM: Dein Stand → Liste → Ausgleich, damit die mobile Reihenfolge gilt). Formular als Seite max. 640 px, Aktionsleiste nicht fixiert; Detail-Sheet als Dialog.
- **Dark Mode:** Minze-Text/Tinte aus Tokens (≥ 4,5 : 1), Amber-Live-Zeile ≥ 4,5 : 1, Siegel und Kategorie-Kacheln aus Tokens.
- **Beträge vorlesbar:** immer als formatierter Text mit Währung («86,00 €» → «86 Komma 00 Euro»), nie nur Ziffern in getrennten Elementen; Saldo als Satz; Pfeil `aria-hidden` + sr «an»; Balken `aria-hidden`; `tabular-nums`.
- **Eingabe:** `inputmode="decimal"`, sichtbares Label, Währungsname im zugänglichen Namen, Fehler mit `aria-invalid` + `aria-describedby`; Live-Zeilen `aria-live="polite"` entprellt (keine Ansage je Tastendruck).
- **Struktur:** h1 Kosten · h2 Tage (Liste) bzw. h2 Deine Ausgleiche / Weitere / Salden / Zahlungsinfo; Listen als `<ul>`; Segment = Links mit `aria-current="page"`; Kategorie-Chips `aria-pressed`; Für-wen = native Checkboxen; Aufteilung = Radiogruppe.
- **Fokus:** nach Speichern h1 der Liste (bzw. Kopf-Taste im Cockpit); nach Löschen nächste Zeile; nach Markieren bleibt er auf der (jetzt) «Zurücknehmen»-Taste; Sheets nach ux-spec §4.2.
- Tippflächen ≥ 44 px (Chips, Text-Tasten, Kopieren, Zurücknehmen).

### D.15 Abgleich mit R.8 – UX-Ergänzungen (Developer bitte beachten; PM/CEO zur Kenntnis)
R.8 ist eingearbeitet. Ergänzungen dieser Spec, die R.8 nicht widersprechen, aber dort nicht stehen:
1. **Parser-Erweiterung** D.5.2 (ein „anderer“ Trenner mit 1–2 Ziffern = Dezimal) – R.8 Regel 1 nennt den Parser aus I9-02; die Erweiterung gilt für beide Stellen (Kosten und W17) und braucht Tests.
2. **Notiz** zur Ausgabe (optional, ≤ 200) ist in R.8 nicht im Datenmodell – **entweder** Spalte `note` an `trip_expense` ergänzen **oder** die Notiz entfällt in Inkr. 10 (dann entfallen «+ Notiz», Notiz-Icon und die Notiz im Detail-Sheet; sonst nichts). Empfehlung UX: aufnehmen (kleiner Aufwand, häufiger Wunsch: «inkl. Trinkgeld», «Anzahlung 50 %»). **CEO entscheidet.**
3. Hinweis „an dich bezahlt“ (D.8.3) – nur `localStorage`-Merker, keine Daten.
4. Datum außerhalb des R.8-Fensters: Meldung D.5.1.
5. Segment-Label «Ausgleich» (R.8 I10-01 schreibt „Salden & Ausgleich“ – Wortlaut ist UX-Sache; zu lang für 360 px/200 %).
6. Saldo-Wortlaut eigene Sicht = 0: «Du bist ausgeglichen ✓» (R.8: «Ausgeglichen ✓») – UX-Wortlaut gilt.

### D.16 Texte DE / EN (Bereich; Cockpit in W16 v2.15)
| Schlüssel (Vorschlag) | DE | EN |
|---|---|---|
| `costs.title` / `.titleBalances` | Kosten · Ausgleich | Expenses · Settle up |
| `costs.share` / Name | Teilen · Abrechnung teilen | Share · Share the balances |
| `costs.tabs` | Ausgaben · Ausgleich | Expenses · Settle up |
| `costs.mine.label` | Dein Stand | Where you stand |
| `costs.mine.owed` / `.owe` / `.square` | Du bekommst {amount} · Du schuldest {amount} · Du bist ausgeglichen ✓ | You're owed {amount} · You owe {amount} · You're all square ✓ |
| `costs.mine.detail` | Dein Anteil {share} · bezahlt {paid} | Your share {share} · paid {paid} |
| `costs.mine.detailPayments` | · Ausgleiche {amount} | · settled {amount} |
| `costs.mine.total` | Ausgaben gesamt {total} | Total spent {total} |
| `costs.mine.toBalances` | So gleichst du aus | How to settle up |
| `costs.day.sum` (sr) | Summe {amount} | Total {amount} |
| `costs.row.paidMe` / `.paid` | Du hast bezahlt · {name} hat bezahlt | You paid · {name} paid |
| `costs.row.forAll` / `.forNames` / `.forCount` / `.forMe` | für alle {count} · für {names} · für {count} Personen · nur für dich | for all {count} · for {names} · for {count} people · just for you |
| `costs.row.share` / `.notIn` | dein Anteil {amount} · nicht beteiligt | your share {amount} · not included |
| `costs.row.custom` | nach Beträgen | custom split |
| `costs.more` | Ältere Ausgaben anzeigen ({count}) | Show older expenses ({count}) |
| `costs.footer` | Alle Beträge in {currency}. Wir überweisen nichts – wir zeigen nur, wer wem was schuldet. | All amounts in {currency}. We don't move any money – we just show who owes whom. |
| `costs.empty.*` | Noch keine Ausgaben · Wer etwas für die Gruppe bezahlt, trägt es hier ein – wir rechnen aus, wer wem was schuldet. · Ausgabe hinzufügen | No expenses yet · Whoever pays for the group adds it here – we'll work out who owes whom. · Add an expense |
| `costs.currency.*` | Währung: {name} ({code}) · Ändern · Währung der Reise · Geht nur, solange es keine Ausgaben gibt. Preise bei Unterkünften bleiben in ihrer Währung. · Währung: {name} ({code}). · Die Währung lässt sich nur ändern, solange es keine Ausgaben gibt. | Currency: {name} ({code}) · Change · Trip currency · Only possible while there are no expenses. Prices of places to stay keep their currency. · Currency: {name} ({code}). · The currency can only be changed while there are no expenses. |
| `costs.add` | Ausgabe hinzufügen | Add an expense |
| `costs.closed.note` | {orga} hat die Abrechnung am {date} abgeschlossen. Ausgaben und Ausgleiche lassen sich nicht mehr ändern. · Abrechnung wieder öffnen | {orga} closed the expenses on {date}. Expenses and payments can't be changed any more. · Reopen expenses |
| `costs.closed.redirect` | Die Abrechnung ist abgeschlossen. | The expenses are closed. |
| `costs.detail.*` | Aufteilung · Gleich aufgeteilt · Nach Beträgen · Angelegt von {name} am {date} · zuletzt geändert von {name} am {date} · Bearbeiten · Löschen | Split · Split equally · Custom amounts · Added by {name} on {date} · last changed by {name} on {date} · Edit · Delete |
| `costs.detail.who` | Ändern können {names} und die Orga. · Ändern kann die Orga. | {names} and the organizer can change this. · Only the organizer can change this. |
| `costs.deleted` | „{title}“ gelöscht. · Rückgängig | “{title}” deleted. · Undo |
| `costForm.titleNew` / `.titleEdit` | Ausgabe hinzufügen · Ausgabe bearbeiten | Add an expense · Edit expense |
| `costForm.amount` / sr | Betrag · Betrag in {currency} | Amount · Amount in {currency} |
| `costForm.what` / `.whatHint` | Wofür? · z. B. Abendessen am Hafen | What for? · e.g. Dinner at the harbour |
| `costForm.category` | Kategorie (optional) | Category (optional) |
| `costForm.cat.*` | Unterkunft · Anreise · Essen · Aktivitäten · Sonstiges | Place to stay · Travel · Food · Activities · Other |
| `costForm.payer` / `.me` | Bezahlt von · Ich ({name}) | Paid by · Me ({name}) |
| `costForm.for` / `.count` / `.none` / `.all` | Für wen? · {count} von {total} · Alle abwählen · Alle auswählen | For whom? · {count} of {total} · Deselect all · Select all |
| `costForm.placeholder` | Platzhalter | placeholder |
| `costForm.formerOnly` | Ehemalige Mitglieder lassen sich nur entfernen. | Former members can only be removed. |
| `costForm.zeroHint` | Personen ohne Betrag sind nicht beteiligt. | People without an amount aren't included. |
| `costForm.error.dateRange` | Bitte ein Datum zwischen {from} und {to} wählen. | Please pick a date between {from} and {to}. |
| `costForm.split` / `.equal` / `.custom` | Aufteilung · Gleich · Nach Beträgen | Split · Equally · Custom amounts |
| `costForm.perPerson` | Je Person {amount} · Je Person {amount} – {names} {count, plural, one {zahlt 1 Cent mehr} other {zahlen je 1 Cent mehr}}. | {amount} each · {amount} each – {names} {count, plural, one {pays 1 cent more} other {pay 1 cent more each}}. |
| `costForm.customFor` | Betrag für {name} | Amount for {name} |
| `costForm.remain` / `.over` / `.ok` / `.fill` | Noch {amount} zu verteilen · {amount} zu viel verteilt · ✓ Passt genau · Auf leere Felder verteilen | {amount} left to split · {amount} too much · ✓ Adds up · Split across empty fields |
| `costForm.date` / `.note` / `.addNote` | Datum · Notiz (optional) · + Notiz | Date · Note (optional) · + Note |
| `costForm.save` / `.saveEdit` / `.saving` | Ausgabe speichern · Änderungen speichern · Speichert … | Save expense · Save changes · Saving … |
| `costForm.saved` / `.savedEdit` / `.view` | {amount} gespeichert – Salden sind aktualisiert. · Änderungen gespeichert. · Ansehen | {amount} saved – balances are up to date. · Changes saved. · View |
| `costForm.error.*` | s. Tabelle D.5.1 · Die Beträge ergeben noch nicht die Summe. · Konnte nicht speichern. Deine Eingaben sind noch da. · Nochmal versuchen | see D.5.1 · The amounts don't add up yet. · Couldn't save. Your entries are still here. · Try again |
| `costForm.discard.*` | Ausgabe verwerfen? · Deine Eingaben gehen verloren. · Weiter bearbeiten · Verwerfen | Discard this expense? · Your entries will be lost. · Keep editing · Discard |
| `costForm.conflict.*` | {name} hat diese Ausgabe gerade geändert. · Jetzt: {summary} · Ihre Fassung übernehmen · Meine trotzdem speichern · Diese Ausgabe wurde inzwischen gelöscht. · Als neue Ausgabe speichern · Zur Liste · {orga} hat die Abrechnung gerade abgeschlossen – Ausgaben lassen sich nicht mehr ändern. | {name} just changed this expense. · Now: {summary} · Use their version · Save mine anyway · This expense has been deleted. · Save as new expense · Back to the list · {orga} just closed the expenses – they can't be changed any more. |
| `balances.yours` / `.others` / `.othersOnly` | Deine Ausgleiche · Weitere Ausgleiche · So gleicht ihr aus | Your payments · Other payments · How you settle up |
| `balances.count` | Mit {count, plural, one {einer Überweisung} other {# Überweisungen}} ist alles erledigt. | {count, plural, one {One payment} other {# payments}} and you're all done. |
| `balances.to` (sr) | {from} an {to}: {amount} | {from} to {to}: {amount} |
| `balances.markPaid` / `.markReceived` | Als bezahlt markieren · Als erhalten markieren | Mark as paid · Mark as received |
| `balances.whoMarks` | Markieren können {a} oder {b}. · Markieren kann {a}. · Markieren kann die Orga. | {a} or {b} can mark this. · {a} can mark this. · The organizer can mark this. |
| `balances.closed` | Die Abrechnung ist abgeschlossen. | The expenses are closed. |
| `balances.paidChip` / `.undoPay` | ✓ Bezahlt · Zurücknehmen | ✓ Paid · Take back |
| `balances.marked` | Als bezahlt markiert: {from} → {to}, {amount}. · Rückgängig | Marked as paid: {from} → {to}, {amount}. · Undo |
| `balances.unmarked` | Zahlung zurückgenommen. | Payment taken back. |
| `balances.changed` | Die Abrechnung hat sich gerade geändert – hier ist der aktuelle Stand. | The expenses just changed – here's the latest. |
| `balances.allSquare.*` | Alles ausgeglichen ✓ · Niemand schuldet jemandem etwas. | All square ✓ · Nobody owes anybody anything. |
| `balances.done` / `.doneMeta` / `.doneOrga` | Bereits bezahlt ({count}) · markiert von {name}, {date} · markiert von {name} (Orga), {date} | Already paid ({count}) · marked by {name}, {date} · marked by {name} (organizer), {date} |
| `balances.list` | Salden | Balances |
| `balances.other.owed` / `.owes` / `.square` | bekommt {amount} · schuldet {amount} · ausgeglichen ✓ | is owed {amount} · owes {amount} · all square ✓ |
| `balances.former` | Ehemaliges Mitglied · Ehemaliges Mitglied {n} | Former member · Former member {n} |
| `balances.paidToYou` | {names} {count, plural, one {hat} other {haben}} {amount} an dich als bezahlt markiert. Nicht angekommen? Du kannst es unter „Bereits bezahlt“ zurücknehmen. | {names} marked {amount} as paid to you. Didn't arrive? You can take it back under “Already paid”. |
| `balances.remind` | {name} erinnern | Remind {name} |
| `payInfo.*` | Deine Zahlungsinfo (freiwillig) · Noch nichts hinterlegt – z. B. IBAN oder PayPal-Name. · Hinterlegen · Ändern · zuletzt geändert {date} · IBAN (optional) · Anderer Weg (optional) · z. B. PayPal: max.m · Alle in dieser Reise können das lesen. Wird gelöscht, wenn du die Reise verlässt. · Speichern · Zahlungsinfo löschen · Zahlungsinfo gelöscht. | Your payment details (optional) · Nothing added yet – e.g. IBAN or PayPal name. · Add · Change · last changed {date} · IBAN (optional) · Other way (optional) · e.g. PayPal: max.m · Everyone on this trip can see this. It's deleted when you leave the trip. · Save · Delete payment details · Payment details deleted. |
| `payInfo.error.iban` / `.note` | Diese IBAN stimmt nicht – bitte prüf die Eingabe. · Höchstens 100 Zeichen. | This IBAN doesn't look right – please check it. · 100 characters max. |
| `payInfo.iban.*` | IBAN · Anzeigen · Verbergen · Kopieren · IBAN von {name}, endet auf {last4} (sr) · IBAN von {name} anzeigen / kopieren (sr) · IBAN kopiert | IBAN · Show · Hide · Copy · {name}'s IBAN, ending in {last4} · Show / copy {name}'s IBAN · IBAN copied |
| `payInfo.copy` / sr / `.copied` | Kopieren · Zahlungsinfo von {name} kopieren · Kopiert ✓ | Copy · Copy {name}'s payment details · Copied ✓ |
| `payInfo.missing` | {name} hat keine Zahlungsinfo hinterlegt – frag am besten direkt. | {name} hasn't added payment details – best to ask directly. |
| `close.*` | Abrechnung abschließen · Üblich ist das nach der Reise. · Abrechnung abschließen? · Danach kann niemand mehr Ausgaben oder Ausgleiche ändern. Du kannst sie wieder öffnen. · Noch {count, plural, one {ein Ausgleich ist} other {# Ausgleiche sind}} offen – trotzdem abschließen? Danach kann niemand mehr Ausgaben ändern oder Ausgleiche als bezahlt markieren, bis du wieder öffnest. · Abschließen · Trotzdem abschließen · Abrechnung abgeschlossen. · Abrechnung wieder offen. | Close the expenses · This usually happens after the trip. · Close the expenses? · After that nobody can change expenses or payments. You can reopen them. · {count, plural, one {One payment is} other {# payments are}} still open – close anyway? After that nobody can change expenses or mark payments as paid until you reopen. · Close · Close anyway · Expenses closed. · Expenses reopened. |
| `leave.costs.owe` | Du schuldest noch {amount}. Wenn du gehst, bleiben deine Ausgaben für die Gruppe erhalten und du erscheinst darin als „ehemaliges Mitglied“ – gleich am besten vorher aus. · Zum Ausgleich · Trotzdem verlassen | You still owe {amount}. If you leave, your expenses stay for the group and you'll show up as “former member” – best to settle up first. · Settle up · Leave anyway |
| `leave.costs.owed` | Du bekommst noch {amount}. Wenn du gehst, bleiben deine Ausgaben als „ehemaliges Mitglied“ erhalten, und die anderen markieren ihre Zahlungen an dich selbst. | You're still owed {amount}. If you leave, your expenses stay as “former member”, and the others mark their payments to you themselves. |
| `leave.costs.payInfo` | Deine Zahlungsinfo für diese Reise wird gelöscht. | Your payment details for this trip will be deleted. |
| `remove.costs` | {name} schuldet noch {amount}. · {name} bekommt noch {amount}. · Die Ausgaben bleiben erhalten; {name} erscheint darin als „ehemaliges Mitglied“. | {name} still owes {amount}. · {name} is still owed {amount}. · The expenses stay; {name} will show up as “former member”. |
| `placeholder.deleteBlocked.*` | {name} kann nicht gelöscht werden · {name} kommt in {count, plural, one {einer Ausgabe} other {# Ausgaben}} vor – erst dort entfernen. · {name} kommt in {count, plural, one {einer Ausgabe oder einem Ausgleich} other {# Ausgaben oder Ausgleichen}} vor – erst dort entfernen. · Zu den Kosten · OK | {name} can't be deleted · {name} is in {count, plural, one {one expense} other {# expenses}} – remove them there first. · {name} is in {count, plural, one {one expense or payment} other {# expenses or payments}} – remove them there first. · Go to expenses · OK |
| `account.delete.costs` | In {count, plural, one {einer Reise} other {# Reisen}} ist bei dir noch nicht alles ausgeglichen: | You're not all square on {count, plural, one {one trip} other {# trips}} yet: |
| `costs.shareText` | Abrechnung {trip}:\n{lines}\nDetails: {link} · Abrechnung {trip}: Alles ausgeglichen ✓ {link} | Expenses for {trip}:\n{lines}\nDetails: {link} · Expenses for {trip}: all square ✓ {link} |

### D.17 Nicht in Inkrement 10
Fremdwährungen (F-037), Belegfotos, Export CSV/PDF, Anteile/Prozent, mehrere Zahler, **Teilzahlung / freie Ausgleichszahlung**, IBAN im Teilen-Text, GiroCode-QR, `paypal.me`-Links, wiederkehrende Ausgaben, Budget (F-034), Statistik/Filter, Duplikat-Warnung, „zuletzt erinnert“, Live-Updates, Ausgaben vor Phase 3. **Could (R.8):** auf „Eure Unterkunft“ nach «gebucht ✓» mit Preis eine Text-Taste «Als Ausgabe eintragen» / «Add as an expense» → `/costs/new?stay={sid}` (Titel, Betrag, Kategorie Unterkunft vorbelegt, Bezahlt von = ich, Hinweis über dem Formular «Aus der Unterkunft übernommen – prüf den Betrag.»). Nur wenn die Unterkunftswährung = Reisewährung. Empfehlung UX: **ja, falls im Inkrement Luft ist**.

### D.18 Abnahme UX Inkrement 10
360 × 640, 390 × 844, 320 px, 200 %, Dark Mode, DE/EN (Komma/Punkt, «12.5» auf DE), ≥ 960 px · Leerzustand Mitglied/Orga (Währung ändern) · Schnellweg Betrag + Wofür + Speichern aus Liste und aus Cockpit-Kopf (zurück ins Cockpit) · Gleich mit Cent-Rest (10 € / 3) · Nach Beträgen: zu wenig/zu viel/passt, „Auf leere Felder verteilen“, Absenden falsch → Fokus/Ansage · Platzhalter als Zahler und Beteiligte · Bearbeiten-Recht (Anlegende, Zahlende, Orga, sonst Satz) · Löschen + Rückgängig · Konflikt geändert/gelöscht · Salden-Wortlaut alle drei Fälle, nie Rot · Markieren (beide Seiten, Doppeltipp = eine Buchung), Rückgängig, Zurücknehmen, Hinweis „an dich bezahlt“ · Mia → Lena: Lena markiert; Orga sieht bei Kemal → Lena **keine** Taste; Orga markiert Platzhalter → ehemaliges Mitglied · IBAN gültig/ungültig, maskiert/anzeigen/kopieren (ohne Leerzeichen), anderer Weg nicht verlinkt, löschen · Währung ändern ohne/mit Ausgaben · Abschließen mit (Warnung)/ohne offene Ausgleiche, danach keine Markieren-Tasten, `/new` gesperrt, wieder öffnen · Verlassen mit Schuld/Forderung/0, Zahlungsinfo-Satz · Platzhalter mit Ausgaben löschen → gesperrt · mehrere ehemalige Mitglieder nummeriert · Konto löschen mit offenem Saldo · Teilen-Text · Ausgleich-Moment eigener Saldo 0 / alle 0 (und reduziert) · VoiceOver/TalkBack: Beträge, Pfeil „an“, Live-Zeilen nicht geschwätzig.

---

## E. Überarbeitung nach Auftraggeber-Feedback (2026-10-23, gilt vor D)

**Anlass:** Feedback des Auftraggebers zum gebauten Inkrement 10 (Screenshots `inc10/01–17`):
1. Kosten müssen **nach Reisebeginn einfacher erreichbar** sein – unterwegs der meistgenutzte Bereich.
2. Die Kosten-Seite ist **überladen**; Informationen müssen **klar getrennt** und die **Begriffe unmissverständlich** sein („bezahlt“, „Ausgaben gesamt“ lassen Fragen offen).
3. Beim **Ausgleich** reichen die Überweisungen **mit meiner Person** ausführlich. **Präzisierung (2026-10-23):** Die Beträge der anderen ruhig zeigen – „spannend“ –, aber **nicht detailreich**: kompakte, ruhige Liste «A → B · Betrag» mit Status, ohne Aktionen, ohne Zahlungsinfo, ohne Detail-Ansicht, eingeklappt.

**Geltung:** E ersetzt in D die Abschnitte D.3 (Aufbau), D.6 (Dein Stand), D.7 (Ausgleich), die Wortwahl in D.4/D.5/D.8/D.16 und das Segment. **Unverändert aus D:** Rechte (D.2, außer Sichtbarkeit E.6), Phasen (D.1), Rechenregeln (R.8), Formular-Logik (D.5.1–D.5.7 außer Texten), Konflikte, Abschließen-Logik (D.9), Verlassen/Löschen (D.10), Zustände (D.12), Barrierefreiheit (D.14, ergänzt in E.10). Cockpit-Teil (Kosten-Leiste unterwegs, Danach): [W16 v2.17](w16-cockpit.md). Klickbarer Vorher/Nachher-Vergleich: [`../mockups/kosten-v2/index.html`](../mockups/kosten-v2/index.html).

### E.0 Diagnose (was am gebauten Stand nicht funktioniert)
| # | Befund (Screenshot) | Ursache | Lösung |
|---|---|---|---|
| 1 | „Dein Stand“ zeigt vier Zahlen auf einmal: Saldo, «Dein Anteil», «bezahlt», «Ausgaben gesamt» (01, 05, 12) | Erklärung und Ergebnis gleich laut; drei Zahlen ohne Bezug zueinander | **ein Satz** + Rechenweg nur auf Wunsch («So rechnen wir», E.4) |
| 2 | «bezahlt 150,00 €» – an wen? zurückgezahlt? für mich? | „bezahlt“ steht für Ausgabe **und** für Ausgleich | zwei getrennte Wortfamilien: **ausgelegt** (Ausgabe) vs. **zurückzahlen / überweisen** (Ausgleich), E.2 |
| 3 | «Ausgaben gesamt 340,00 €» in *meiner* Karte – meine oder alle? | Gruppenzahl steht im persönlichen Block | Gruppenzahl wandert zur Gruppenliste: «Die Gruppe hat bisher 340,00 € ausgegeben.» |
| 4 | Ausgleich-Seite: Deine Ausgleiche + Weitere Ausgleiche (mit IBAN der anderen!) + Bereits bezahlt + Salden mit Balken + Zahlungsinfo + Abschließen (02, 05, 12) | alles für alle gleichzeitig offen | eigene Überweisungen ausführlich; andere kompakt + eingeklappt; Salden-Liste entfällt (E.5) |
| 5 | Unterwegs: Kosten = Kachel ganz unten + kleine Kontur-Taste im Kopf (07, 11) | Kachel-Regel „Bereiche ohne Ende unter den Weg“ passt nicht zum häufigsten Bereich unterwegs | **Kosten-Leiste** unten, immer im Daumenbereich (W16 v2.17) |
| 6 | Zwei Wege zum Ausgleich auf `/costs` (Link «So gleichst du aus» **und** Segment) | doppelte Navigation | Segment entfällt; ein Einstieg aus „Dein Stand“ |
| 7 | (Nebenbefund, kein UX-Thema) Gardasee/Felix zeigt «EUR 630.00», «1'200.00» (12, 13) | Zahlformat-Locale offenbar nicht `de-DE` (Schweizer bzw. Code-Anzeige) | **an Reviewer/Developer:** `formatExact`/`formatMoney` mit App-Sprache `de-DE`/`en-GB` statt Konto-/Browser-Region prüfen |

### E.1 Leitlinien der Überarbeitung
1. **Drei Ebenen, drei Fragen, optisch getrennt:** (a) **Ich** – „Wie stehe ich?“ (getönte Karte, oben) · (b) **Gruppe** – „Was haben wir ausgegeben?“ (neutrale Liste) · (c) **Ausgleichen** – „Wer überweist wem?“ (eigene Seite, eine Ebene tiefer).
2. **Ein Satz statt vier Zahlen.** Ergebnis groß, Herleitung nur auf Wunsch (progressive disclosure).
3. **Ein Wort, eine Bedeutung** (Glossar E.2). Verbotene Wörter in der UI: „bezahlt“ (außer im festen Ausdruck „bezahlt von“ – auch der entfällt), „Saldo/Salden“, „Ausgaben gesamt“, „Schulden“ als Substantiv.
4. **Eigenes ausführlich, Fremdes kompakt.** Aktionen, Zahlungsinfo und Erinnern nur bei Überweisungen mit mir. Die der anderen: eine Zeile «A → B · Betrag · Status», eingeklappt.
5. **Weniger Zahlen je Zeile:** Tagessummen, Chip «nach Beträgen» und Salden-Balken entfallen.

### E.2 Glossar – Vorher / Nachher (verbindlich für alle Kosten-Texte, Cockpit, Mails, Erinnern)
| Begriff (Bedeutung) | Vorher DE | **Nachher DE** | Vorher EN | **Nachher EN** | Warum |
|---|---|---|---|---|---|
| Bereich | Kosten | **Kosten** (unverändert) | Expenses | **Expenses** | eindeutig |
| Eintrag (jemand hat für die Gruppe Geld ausgegeben) | Ausgabe | **Ausgabe** | expense | **expense** | eindeutig, bleibt |
| Wer das Geld für die Ausgabe gegeben hat | «Lena hat bezahlt» · Feld «Bezahlt von» | **«Lena hat ausgelegt»** · Feld **«Wer hat ausgelegt?»** | «Lena paid» · «Paid by» | **«Lena paid»** · **«Who paid?»** | „ausgelegt“ = vorgestreckt für andere; nicht verwechselbar mit „zurückgezahlt“. EN „paid“ bleibt, weil EN den Ausgleich mit „send/sent“ benennt (keine Kollision mehr). |
| Mein Teil an einer Ausgabe | «dein Anteil 25,00 €» · «nicht beteiligt» | **«auf dich 25,00 €»** · **«ohne dich»** | «your share …» · «not included» | **«your part …»** · **«not you»** | kurz, direkt unter dem Betrag lesbar wie „davon auf dich“ |
| Summe meiner Teile über alle Ausgaben | «Dein Anteil 112,00 €» | **«Auf dich entfällt 214,00 €»** (nur im Rechenweg) | «Your share» | **«Your part of all expenses»** | |
| Summe, die ich ausgelegt habe | «bezahlt 26,00 €» | **«Du hast ausgelegt 150,00 €»** (nur im Rechenweg) | «paid» | **«You paid»** | |
| Was alle zusammen ausgegeben haben | «Ausgaben gesamt 456,00 €» · Kachel «{x} gesamt» | **«Die Gruppe hat bisher 340,00 € ausgegeben.»** (nur über der Liste; nicht mehr in „Dein Stand“, nicht mehr auf der Kachel) | «Total spent» | **«The group has spent €340.00 so far.»** | sagt, *wessen* Summe |
| Mein Ergebnis > 0 | «Du bekommst 42,00 €» | **«Du bekommst noch 42,00 € zurück.»** | «You're owed €42.00» | **«You get €42.00 back.»** | „zurück“ erklärt, *warum* |
| Mein Ergebnis < 0 | «Du schuldest 86,00 €» | **«Du zahlst noch 86,00 € zurück.»** | «You owe €86.00» | **«You owe €86.00.»** | gleiche Wortfamilie wie die Aktion; kein „Schulden“-Gefühl |
| Mein Ergebnis = 0 | «Du bist ausgeglichen ✓» | **«Du bist quitt ✓»** | «You're all square ✓» | **«You're all square ✓»** | Alltagswort, nicht verwechselbar mit „Ausgleich“ als Vorgang |
| Alle = 0 | «Alles ausgeglichen ✓ – Niemand schuldet jemandem etwas.» | **«Alle sind quitt ✓»** – «Niemand muss mehr etwas überweisen.» | «All square ✓» | **«Everyone's square ✓»** – «Nobody needs to send anything.» | |
| Vorgang am Ende (Bereich, Seite, Kopf-Taste) | «Ausgleich», «Salden & Ausgleich», «So gleichst du aus» | **«Ausgleichen»** (Verb, Seiten-h1 und Taste) | «Settle up» | **«Settle up»** | ein Name für die Seite |
| Eine Geldbewegung zwischen zwei Personen (Vorschlag) | «Ausgleich» · «Du → Kemal» | **«Überweisung»** · Zeile **«An Kemal · 86,00 €»** / **«Von Ben · 63,34 €»** (eigene), **«Jonas → Kemal · 90,00 €»** (andere) | «payment» | **«transfer»** · «To Kemal» / «From Ben» | „Überweisung“ = konkrete Handlung; „bar oder PayPal“ deckt der Fußsatz ab |
| Markieren durch Zahlende | «Als bezahlt markieren» | **«Hab ich überwiesen»** | «Mark as paid» | **«I've sent it»** | Ich-Perspektive, keine Doppeldeutigkeit |
| Markieren durch Empfangende | «Als erhalten markieren» | **«Ist angekommen»** | «Mark as received» | **«I've got it»** | |
| Markieren durch Orga (Platzhalter ↔ ehemalig) | «Als bezahlt markieren» | **«Als erledigt markieren»** | «Mark as paid» | **«Mark as done»** | Orga war nicht beteiligt |
| Zustand nach Markieren | Chip «✓ Bezahlt» · Liste «Bereits bezahlt (n)» | Chip **«✓ Erledigt»** · Liste **«Erledigt (n)»** | «✓ Paid» · «Already paid» | **«✓ Done»** · **«Done (n)»** | |
| Zurücknehmen | «Zurücknehmen» | **«Zurücknehmen»** (bleibt) | «Take back» | **«Undo»** | |
| Liste aller Personen mit Plus/Minus | «Salden» (+ Balken) | **entfällt** (E.5.5) | «Balances» | – | Fachwort, Overload |
| Hinweis an Empfangende | «Greta hat 175,00 € an dich als bezahlt markiert …» | **«Greta hat 175,00 € an dich als überwiesen markiert. Noch nicht angekommen? Unter „Erledigt“ kannst du es zurücknehmen.»** | «… marked … as paid to you» | **«Greta marked €175.00 as sent to you. Not there yet? You can undo it under “Done”.»** | |
| Zahlungsinfo | «Deine Zahlungsinfo (freiwillig)» | **«Wohin soll das Geld?»** (Karte, nur wenn ich etwas bekomme) / **«Deine Zahlungsinfo»** (sonst, eingeklappt) | «Your payment details» | **«Where should the money go?»** / **«Your payment details»** | Zweck statt Fachwort |
| Abschließen | «Abrechnung abschließen» | **«Abrechnung abschließen»** (bleibt, nur Orga) | «Close the expenses» | **«Close the expenses»** | |
| Fußsatz | «Alle Beträge in Euro. Wir überweisen nichts – wir zeigen nur, wer wem was schuldet.» | **«Alle Beträge in Euro. Die App bewegt kein Geld – überweist selbst, bar oder per PayPal.»** | «… we just show who owes whom» | **«All amounts in euros. The app doesn't move money – send it yourselves, in cash or via PayPal.»** | erklärt „Überweisung“ für Bargeld mit |

**Prüfregel Mehrdeutigkeit (für alle neuen Texte):** Jeder Satz mit Betrag beantwortet *wer* · *an/von wem* bzw. *wofür* · *Richtung* (ausgelegt / zurück / an / von). Kein Betrag ohne Bezugswort.

### E.3 Bereich `/costs` – neuer Aufbau (mobil, von oben)
```
┌────────────────────────────────────┐
│▓(←) Kroatien 2027              (⋯)▓│  Kopf: ← · Reisename + h1 «Kosten»; KEIN Teilen mehr hier
│▓    Kosten                        ▓│
╰▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╯
│ ╔════════════════════════════════╗ │  (1) DEIN STAND – getönte Karte (Ich-Ebene)
│ ║ DEIN STAND                     ║ │      Ton: zahlst zurück = neutral, bekommst = Minze-Hauch
│ ║ Du zahlst noch                 ║ │      Satz 24–26/800, Betrag tabular
│ ║ 64,00 € zurück.                ║ │
│ ║ An Lena.                       ║ │      Empfänger-Kurzsatz (≤ 2 Namen, sonst «An 3 Personen.»)
│ ║ [   Ausgleichen  ›           ] ║ │      Sekundär-Taste volle Breite → /balances (nur ≠ 0 oder andere offen)
│ ║ So rechnen wir  ▾              ║ │      Text-Taste, aria-expanded, Rechenweg E.4
│ ╚════════════════════════════════╝ │
│                                    │  deutlicher Abstand (space-8) = Ebenenwechsel
│ Ausgaben der Gruppe                │  (2) h2 – Gruppen-Ebene, neutral, keine Tönung
│ Die Gruppe hat bisher 1.017,00 €   │      14/600 muted
│ ausgegeben.                        │
│ MO., 14. JUNI                      │  Tages-Trenner (h3, 13/800 Versal), OHNE Tagessumme
│ ┌────────────────────────────────┐ │
│ │(✦) Bootstour          150,00 € │ │  Zeile wie D.4.2, Texte neu:
│ │    Du hast ausgelegt  auf dich │ │  «{Wer} hat ausgelegt · für {wen}»
│ │    · für alle 6        25,00 € │ │  rechts: Betrag + «auf dich 25,00 €» / «ohne dich»
│ ├────────────────────────────────┤ │
│ │(🍴) Pizza am Hafen     60,00 € │ │
│ │    Sara hat ausgelegt  auf dich│ │
│ │    · für Lena, dich, Kemal 20,00│ │
│ └────────────────────────────────┘ │
│ …                                  │
│ Alle Beträge in Euro. Die App      │  Fußsatz E.2
│ bewegt kein Geld – …               │
├────────────────────────────────────┤
│ [ +  Ausgabe eintragen           ] │  fixierte Aktionsleiste = einzige Primär-Taste (unverändert)
└────────────────────────────────────┘
```
| # | Block | sichtbar, wenn | Änderung ggü. D.3 |
|---|---|---|---|
| 1 | Hinweis «Abrechnung abgeschlossen» | abgeschlossen | Text unverändert (D.3) |
| 2 | Hinweis „an dich überwiesen“ (E.2) | wie D.8.3 | **nur noch auf `/balances`**, auf `/costs` als einzeilige Zusatzzeile in „Dein Stand“: «Greta hat 175,00 € als überwiesen markiert ›» (→ `/balances`) |
| 3 | **Dein Stand** (E.4) | ≥ 1 Ausgabe oder Überweisung | ein Satz + Empfänger-/Absender-Kurzsatz + `[Ausgleichen ›]` + «So rechnen wir» |
| 4 | ~~Segment Ausgaben · Ausgleich~~ | – | **entfällt** (Einstieg nur über `[Ausgleichen ›]`; Desktop zweispaltig, E.10) |
| 5 | **Ausgaben der Gruppe** (h2 + Gruppensatz + Liste) | ≥ 1 Ausgabe | Gruppensumme hierher; Tagessummen und Chip «nach Beträgen» entfallen |
| 6 | Leerzustand | 0 Ausgaben | wie D.4.4, Text «Wer etwas für die Gruppe auslegt, trägt es hier ein – wir rechnen aus, wer wem was zurückzahlt.» |
| 7 | Fußsatz | immer | Text E.2 |
| 8 | Aktionsleiste `[+ Ausgabe eintragen]` | nicht abgeschlossen | nur Text («eintragen» statt «hinzufügen») |

**Teilen** (Abrechnungstext) wandert vom Kopf ans Ende von `/balances` (E.5, Text-Taste «Übersicht teilen»), Kopf rechts wieder das Reisemenü-Muster ohne Zusatz-Taste – ein Kopf-Element weniger.

### E.4 „Dein Stand“ – ein Satz, Rechenweg auf Wunsch
**Hauptsatz** (h2-Ersatz: Karte ist `<section aria-labelledby>` mit Eyebrow «Dein Stand» als h2; der Satz ist ein `<p>` 24/800 Jakarta, `tabular-nums`):
| Lage | DE | EN | Kurzsatz darunter (14/600) DE / EN |
|---|---|---|---|
| < 0 | Du zahlst noch {amount} zurück. | You owe {amount}. | An {name}. · An {name1} und {name2}. · An {count} Personen. / To {name}. · To {name1} and {name2}. · To {count} people. |
| > 0 | Du bekommst noch {amount} zurück. | You get {amount} back. | Von {name}. · Von {name1} und {name2}. · Von {count} Personen. / From … |
| = 0, andere offen | Du bist quitt ✓ | You're all square ✓ | Bei den anderen sind noch {count} Überweisungen offen. / {count} transfers still open between the others. |
| = 0, alle 0 | Alle sind quitt ✓ | Everyone's square ✓ | – |
| 0 Ausgaben | (Karte entfällt, Leerzustand) | | |
Farben wie D.6 (zurück bekommen = `cost-get-fg`, zurückzahlen = `cost-owe-fg` Tinte, quitt = `cost-even-fg` + Siegel 20). Nie Rot, kein Minus. Kurzsatz nennt **Namen**, keine Beträge (die stehen auf `/balances`).

**Taste** `[Ausgleichen ›]` (Sekundär, volle Breite, 48 px) – nur, wenn mein Ergebnis ≠ 0 **oder** andere offen sind; bei „Alle sind quitt“ statt der Taste nichts (Orga: Text-Link «Abrechnung abschließen ›» → `/balances#close`). Ziel `/costs/balances`.

**«So rechnen wir ▾»** (Text-Taste 44 px, `aria-expanded`, `aria-controls`; eingeklappt Standard; Zustand nicht gespeichert):
```
  Du hast für die Gruppe ausgelegt      150,00 €
  Auf dich entfällt                   − 214,00 €
  Schon zurückgezahlt                 +  20,00 €   ← nur wenn ≠ 0 («Schon zurückbekommen − x»)
  ─────────────────────────────────────────────
  Du zahlst noch zurück                  44,00 €
  „Auf dich entfällt“ = deine Teile an allen Ausgaben, bei denen du dabei bist.
```
`<dl>` mit Zeilen (Begriff links, Betrag rechts tabular), Rechenzeichen als Text (sr liest «minus», «plus»), Summenzeile 700. Die Gruppensumme steht **nicht** im Rechenweg (gehört zur Gruppen-Ebene).

### E.5 `/costs/balances` „Ausgleichen“ – neuer Aufbau
Kopf: ← (Herkunft: Cockpit-Leiste/D1 → zurück ins Cockpit, sonst `/costs`) · Reisename + h1 **«Ausgleichen»**. Kein Segment. `<title>` «Ausgleichen · {Reise} · Wir wollen weg».

```
Sicht Max (Mitglied, zahlt)                Sicht Lena (Orga, bekommt)
┌──────────────────────────────────┐       ┌──────────────────────────────────┐
│ DEIN STAND                       │ (1)   │ DEIN STAND                       │
│ Du zahlst noch 64,00 € zurück.   │       │ Du bekommst noch 206,00 € zurück.│
│ So rechnen wir ▾                 │       │ So rechnen wir ▾                 │
╞══════════════════════════════════╡       ╞══════════════════════════════════╡
│ Deine Überweisung            h2  │ (2)   │ Das bekommst du              h2  │
│ ┌──────────────────────────────┐ │       │ ┌──────────────────────────────┐ │
│ │ (LE) An Lena       64,00 €   │ │       │ │ (SA) Von Sara     134,00 €   │ │
│ │ IBAN DE89 •••• … 3000        │ │       │ │ [Ist angekommen] Sara erinnern│ │
│ │ [Kopieren] [Anzeigen]        │ │       │ ├──────────────────────────────┤ │
│ │ PayPal: lena.k   [Kopieren]  │ │       │ │ (MA) Von Max       64,00 €   │ │
│ │ [✓ Hab ich überwiesen     ]  │ │ Primär│ │ [Ist angekommen] Max erinnern │ │
│ └──────────────────────────────┘ │       │ ├──────────────────────────────┤ │
│                                  │       │ │ (JO) Von Jonas      8,00 €   │ │
│                                  │       │ │ [Ist angekommen] Jonas erinnern│
│                                  │       │ └──────────────────────────────┘ │
│                                  │       │ Wohin soll das Geld?         h2  │ (3)
│                                  │       │ IBAN DE12 •••• 0042  [Ändern]    │
│ Erledigt (0) – entfällt bei 0    │ (4)   │ Für dich als Orga            h2  │ (5)
│                                  │       │ Mia [Platzhalter] → ehem. Mitgl. │
│                                  │       │ 20,00 €  [Als erledigt markieren]│
│ Ausgleiche der anderen (4)  ▾    │ (6)   │ Ausgleiche der anderen (2)  ▾    │
│ Insgesamt noch 5 Überweisungen   │       │ Insgesamt noch 5 Überweisungen   │
│ offen, bis alle quitt sind.      │       │ offen, bis alle quitt sind.      │
│ ── aufgeklappt: ──               │       │                                  │
│ Sara → Lena       134,00 € offen │       │                                  │
│ Jonas → Kemal      90,00 € offen │       │                                  │
│ Jonas → Lena        8,00 € offen │       │                                  │
│ Mia → ehem. Mitgl. 20,00 € offen │       │                                  │
│ Deine Zahlungsinfo ▸         (3) │       │ [Abrechnung abschließen]     (7) │
│ Übersicht teilen ›           (8) │       │ Übersicht teilen ›           (8) │
└──────────────────────────────────┘       └──────────────────────────────────┘
```

| # | Block | Inhalt / Regel |
|---|---|---|
| 1 | **Dein Stand** | wie E.4, **ohne** Kurzsatz und ohne `[Ausgleichen]` (man ist schon da); «So rechnen wir» bleibt. Hinweis „an dich überwiesen“ (E.2) als Info-Banner **über** der Karte. |
| 2 | **Eigene Überweisungen** – h2 je Richtung: **«Deine Überweisung»** / **«Deine Überweisungen»** (ich zahle) bzw. **«Das bekommst du»** (ich bekomme). Wegen `settleUp` zahlt eine Person nur **oder** empfängt – es erscheint immer höchstens **eine** der beiden Gruppen. | Karte je Überweisung: Avatar · «An Lena» / «Von Sara» (Platzhalter-Chip, «ehemaliges Mitglied») · Betrag 17/800. **Ich zahle:** Zahlungsinfo der Empfängerin (IBAN maskiert, `[Kopieren]` zuerst, `[Anzeigen]`; anderer Weg + `[Kopieren]`; ohne: «Lena hat keine Zahlungsinfo hinterlegt – frag am besten direkt.») + Taste **«Hab ich überwiesen»** (Primär für die erste, weitere Sekundär). **Ich bekomme:** Taste **«Ist angekommen»** (Sekundär) + Text-Taste **«{Name} erinnern»** (nicht bei ehemaligen). Nach Markieren: Chip «✓ Erledigt» + «Zurücknehmen» an Ort und Stelle (D.8.1), Snackbar «Erledigt: an Lena, 64,00 €.» / «Erledigt: von Sara, 134,00 €.» + «Rückgängig». |
| 3 | **Zahlungsinfo** | **Ich bekomme etwas** (Ergebnis > 0) und habe keine hinterlegt → offene Karte **«Wohin soll das Geld?»** direkt unter Block 2: «Hinterleg IBAN oder PayPal-Name – dann sehen Sara, Max und Jonas sie bei ihrer Überweisung an dich.» + `[Hinterlegen]` (Sekundär). Ich bekomme und habe hinterlegt → kompakte Zeile «Wohin soll das Geld? · IBAN DE12 •••• 0042 · [Ändern]». **Sonst** (zahle oder quitt) → eingeklappte Zeile **«Deine Zahlungsinfo ▸»** am Ende (vor Teilen). Sheet und Regeln unverändert D.8.4; Hilfetext neu: «**Nur wer an dich überweist, sieht das.** Wird gelöscht, wenn du die Reise verlässt.» (E.6). |
| 4 | **Erledigt ({n})** – nur **meine** erledigten Überweisungen | eingeklappt (`aria-expanded`), entfällt bei 0. Zeile «An Lena · 64,00 €» + 13 px «von dir markiert am 3. Mai» / «von Lena markiert am 3. Mai» + Text-Taste «Zurücknehmen» (Rechte wie D.2). |
| 5 | **Für dich als Orga** (nur Orga, nur wenn es Überweisungen gibt, die **nur** die Orga markieren darf: Platzhalter/ehemalig ↔ Platzhalter/ehemalig, R.8) | h2 + Satz «Hier ist niemand mit App beteiligt – du kannst es abhaken, wenn du weißt, dass es erledigt ist.» · Zeilen kompakt «Mia [Platzhalter] → ehemaliges Mitglied · 20,00 €» + Text-Taste **«Als erledigt markieren»**. Offen (nicht eingeklappt) – es ist eine Aufgabe. Diese Zeilen erscheinen **nicht** zusätzlich in Block 6. |
| 6 | **Ausgleiche der anderen ({n})** – alle Überweisungen ohne mich (offen **und** erledigt, außer Block 5) | **eingeklappt** (Button h2-Ersatz `aria-expanded`); darunter **immer sichtbar** der neutrale Satz: «Insgesamt noch {open} Überweisungen offen, bis alle quitt sind.» (alle offenen, inkl. meiner) bzw. «Alle sind quitt ✓». Aufgeklappt: `<ul>` kompakte Zeilen **«Sara → Lena · 134,00 €»** + Status-Text rechts **«offen»** (muted) / **«✓ erledigt»** (Minze); Avatare 20 px, eine Zeile, 44 px hoch. **Keine** Tasten, **keine** Zahlungsinfo, **kein** „markiert von“, **nicht** antippbar. Reihenfolge: offen zuerst (Vorschlags-Reihenfolge), dann erledigt (neueste zuerst). Bei 0 Zeilen entfällt der Block (nur der Satz bleibt, falls eigene offen). |
| 7 | **Abrechnung abschließen** (nur Orga) | Sekundär, wie D.9 (Dialoge unverändert, Wort «Ausgleiche» → «Überweisungen»: «Noch 3 Überweisungen sind offen – trotzdem abschließen? …»). |
| 8 | **Übersicht teilen ›** (alle) | Text-Taste, Teilen-Sheet mit Text D.11 (ohne Zahlungsinfo). Wortlaut: «Ausgleichen {trip}:\n{from} → {to}: {amount}\n…\nDetails: {link}» / «Settle up – {trip}: …». |
| – | **Salden-Liste + Balken** | **entfällt für alle** (auch Orga). Begründung: Die Liste wiederholt dieselbe Information wie die Überweisungen in abstrakter Form (Plus/Minus je Person) – der Auftraggeber will „wer an wen“, nicht Kontostände. Wer den Stand einer Person wissen will, sieht ihre Zeilen in Block 6. |
| – | **Alle quitt** | statt 2–6: Karte «Alle sind quitt ✓» + «Niemand muss mehr etwas überweisen.» (Siegel 40) · darunter «Erledigt ({n}) ▸» (meine) und «Ausgleiche der anderen ({n}) ▸» (Historie) · Orga: `[Abrechnung abschließen]`. |
| – | **Abgeschlossen** | Hinweis wie D.3 Block 1; keine Tasten; Blöcke 2/4/6 lesbar; Satz «Die Abrechnung ist abgeschlossen.» einmal oben. |

**Reihenfolge Orga, die selbst zahlt:** Block 2 «Deine Überweisung» → 5 → 6 → Zahlungsinfo ▸ → 7 → 8.

### E.6 Sichtbarkeit – wer sieht was (ändert R.8 „Bereich ansehen“, Hinweis an PM)
| Information | Mitglied | Orga | Vorher (R.8) |
|---|---|---|---|
| Alle Ausgaben (Liste, Detail-Sheet mit Aufteilung) | ✔ | ✔ | ✔ (unverändert – gemeinsame Kasse) |
| Eigenes Ergebnis + Rechenweg | ✔ | ✔ | ✔ |
| Eigene Überweisungen mit Aktionen | ✔ | ✔ | ✔ |
| Überweisungen der anderen: **Namen, Betrag, offen/erledigt** | ✔ kompakt, eingeklappt | ✔ dto. | ✔ mit Details |
| … „markiert von“, Zeitpunkt, Zurücknehmen, Erinnern | ✘ | ✘ (nur Block 5) | ✔ |
| Ergebnis (Saldo) **je Person** als Liste | ✘ | ✘ | ✔ |
| Zahlungsinfo (IBAN / anderer Weg) anderer | **nur** von Personen, an die **ich** laut Vorschlag überweise | dto. | alle Mitglieder (Q35 „sichtbar für die Reise“) |
**Technik (Developer):** Der Server liefert die Zahlungsinfo **nur** für die Empfänger meiner offenen Überweisungen aus (nicht nur ausblenden). Für Block 6 genügen `{from, to, cents, done}`; `markedBy/at` nur für eigene Zeilen. Ergebnisse anderer Personen werden nicht an den Client gegeben (Cockpit-Adapter `costStatus()` braucht sie nicht). Der Teilen-Text darf weiterhin alle offenen Überweisungen nennen (gleiche Informationstiefe wie Block 6).

**Sonderfall Zahlungsinfo:** Wird jemand durch eine neue Ausgabe vom Empfänger zum Zahler, verschwindet seine Zahlungsinfo bei den anderen sofort – das ist gewollt (nur wer an ihn überweisen muss, braucht sie).

### E.7 Formular „Ausgabe eintragen“ (D.5) – nur Texte
| Stelle | Vorher | Nachher DE | Nachher EN |
|---|---|---|---|
| h1 / Taste | Ausgabe hinzufügen · Ausgabe speichern | **Ausgabe eintragen** · **Ausgabe speichern** | Add an expense · Save expense |
| Feld Zahler | Bezahlt von · «Ich (Max)» | **Wer hat ausgelegt?** · «Ich (Max)» | **Who paid?** · «Me (Max)» |
| Für wen | Für wen? · {n} von {total} | **Für wen war es?** · {n} von {total} | **Who was it for?** |
| Aufteilung | Aufteilung · Gleich · Nach Beträgen | **Wie aufteilen?** · **Gleich** · **Eigene Beträge** | **How to split?** · **Equally** · **Own amounts** |
| Live-Zeile | Je Person 10,00 € | **Je Person 10,00 €** (bleibt) | {amount} each |
| Snackbar | 60,00 € gespeichert – Salden sind aktualisiert. | **Gespeichert. Du zahlst jetzt noch 44,00 € zurück.** / **… bekommst jetzt noch 42,00 € zurück.** / **… bist jetzt quitt ✓** (neues Ergebnis als Satz – zeigt die Wirkung) | **Saved. You now owe €44.00.** / **… now get €42.00 back.** / **… you're now all square ✓** |
Schnellweg, Validierung, Konflikte unverändert.

### E.8 Detail-Sheet (D.4.3) – Texte
«{Kategorie} · {Datum} · **Lena hat ausgelegt**» · h3 **«So wird geteilt»** (statt «Aufteilung») · je Person «Lena 25,00 €» (ich: «Du 25,00 €») · Fuß «**Gleich geteilt** / **Eigene Beträge** · eingetragen von Kemal am 1. Mai» · Rechte-Satz «Ändern können Kemal und die Orga.» (bleibt).

### E.9 Kachel, Hinweise, Erinnern (Wortlaut-Angleich)
- **Kachel „Kosten“** (W16 v2.17 regelt *wann*; *Unterwegs*/*Danach* zusätzlich Link-Zeile **«Alle Ausgaben ansehen ›»** / «See all expenses ›», Fassung 2): Status nur noch das eigene Ergebnis, ohne Gruppensumme: «Noch keine Ausgaben» · «Du zahlst noch {amount} zurück» · «Du bekommst noch {amount} zurück» · «Du bist quitt ✓» · «Alle sind quitt ✓» · abgeschlossen: «Abgeschlossen · alle quitt ✓» / «Abgeschlossen · du zahlst noch {amount} zurück». EN: «No expenses yet» · «You owe {amount}» · «You get {amount} back» · «You're all square ✓» · «Everyone's square ✓» · «Closed · …».
- **Erinnern-Texte** (D.11, W16 v2.15): «Hey {name}, bei {trip} bekomme ich laut App noch {amount} von dir zurück. Danke! {link}» · EN unverändert. Orga `settle-all`: «… sind noch {count} Überweisungen offen …».
- **Verlassen-Dialog** (D.10): «Du zahlst noch 86,00 € zurück. …» / «Du bekommst noch 42,00 € zurück. …»; «Zum Ausgleich» → «Zum Ausgleichen».
- **Konto löschen** (D.10): «In {n} Reisen bist du noch nicht quitt:» + «Kroatien 2027 – du zahlst noch 86,00 € zurück».

### E.10 Responsive, Barrierefreiheit (Ergänzung zu D.14)
- **≥ 960 px:** `/costs` zweispaltig: links „Ausgaben der Gruppe“, rechts sticky „Dein Stand“ (mit «So rechnen wir») + eigene Überweisungen kompakt (Block 2 ohne Zahlungsinfo, Taste «Ausgleichen ›»). `/balances` einspaltig 640 px (eine Aufgabe, keine zweite Spalte nötig).
- **Ebenen-Trennung** nicht nur über Farbe: Eyebrow «Dein Stand» + Tönung **und** Abstand `space-8` + h2 «Ausgaben der Gruppe».
- Überschriften `/balances`: h1 Ausgleichen · h2 Dein Stand · h2 Deine Überweisung(en) / Das bekommst du · h2 Wohin soll das Geld? · h2 Für dich als Orga · Button „Ausgleiche der anderen“ in h2 · Button „Erledigt“ in h2.
- Kompaktzeile Block 6: zugänglicher Text «Sara an Lena, 134,00 €, offen»; Pfeil `aria-hidden`.
- «So rechnen wir»: Rechenzeichen als Text; Summenzeile mit `<strong>`.
- Fokus: nach «Hab ich überwiesen» bleibt er auf «Zurücknehmen» (D.14); Aufklappen setzt keinen Fokus um.
- 320 px / 200 %: „Dein Stand“-Satz bricht frei um; Kompaktzeile darf zweizeilig werden (Betrag + Status in Zeile 2).

### E.11 Motion (Delta zu D.13)
Unverändert bis auf: Aufklappen «So rechnen wir» / «Ausgleiche der anderen» / «Erledigt» = Standard-Akkordeon (`base`, reduziert sofort). Ausgleich-Moment (UM-16) feiert jetzt «Du bist quitt ✓»; UM-17 «Alle sind quitt ✓». Salden-Balken-Animation entfällt.

### E.12 Texte DE / EN (ersetzt die betroffenen Schlüssel in D.16)
| Schlüssel (Vorschlag) | DE | EN |
|---|---|---|
| `costs.add` | Ausgabe eintragen | Add an expense |
| `costs.mine.owe` / `.owed` / `.square` / `.allSquare` | Du zahlst noch {amount} zurück. · Du bekommst noch {amount} zurück. · Du bist quitt ✓ · Alle sind quitt ✓ | You owe {amount}. · You get {amount} back. · You're all square ✓ · Everyone's square ✓ |
| `costs.mine.to` / `.from` | An {names}. · An {count} Personen. · Von {names}. · Von {count} Personen. | To {names}. · To {count} people. · From {names}. · From {count} people. |
| `costs.mine.othersOpen` | Bei den anderen {count, plural, one {ist noch eine Überweisung} other {sind noch # Überweisungen}} offen. | {count, plural, one {One transfer is} other {# transfers are}} still open between the others. |
| `costs.mine.settle` | Ausgleichen | Settle up |
| `costs.calc.*` | So rechnen wir · Du hast für die Gruppe ausgelegt · Auf dich entfällt · Schon zurückgezahlt · Schon zurückbekommen · Du zahlst noch zurück · Du bekommst noch zurück · Quitt · „Auf dich entfällt“ = deine Teile an allen Ausgaben, bei denen du dabei bist. | How we work it out · You paid for the group · Your part of all expenses · Already sent · Already received · You still owe · You still get back · Square · “Your part” = your parts of all expenses you're in. |
| `costs.group.title` / `.total` | Ausgaben der Gruppe · Die Gruppe hat bisher {total} ausgegeben. | Group expenses · The group has spent {total} so far. |
| `costs.row.paidMe` / `.paid` | Du hast ausgelegt · {name} hat ausgelegt | You paid · {name} paid |
| `costs.row.share` / `.notIn` | auf dich {amount} · ohne dich | your part {amount} · not you |
| `costs.footer` | Alle Beträge in {currency}. Die App bewegt kein Geld – überweist selbst, bar oder per PayPal. | All amounts in {currency}. The app doesn't move money – send it yourselves, in cash or via PayPal. |
| `costs.empty.text` | Wer etwas für die Gruppe auslegt, trägt es hier ein – wir rechnen aus, wer wem was zurückzahlt. | Whoever pays for the group adds it here – we'll work out who pays back whom. |
| `balances.title` | Ausgleichen | Settle up |
| `balances.mineOut` / `.mineOutMany` / `.mineIn` | Deine Überweisung · Deine Überweisungen · Das bekommst du | Your transfer · Your transfers · What you get |
| `balances.to` / `.from` | An {name} · Von {name} | To {name} · From {name} |
| `balances.sent` / `.received` / `.orgaDone` | Hab ich überwiesen · Ist angekommen · Als erledigt markieren | I've sent it · I've got it · Mark as done |
| `balances.doneChip` / `.undo` | ✓ Erledigt · Zurücknehmen | ✓ Done · Undo |
| `balances.markedOut` / `.markedIn` | Erledigt: an {name}, {amount}. · Erledigt: von {name}, {amount}. | Done: to {name}, {amount}. · Done: from {name}, {amount}. |
| `balances.done` / `.doneMeta` | Erledigt ({count}) · von {name} markiert am {date} · von dir markiert am {date} | Done ({count}) · marked by {name} on {date} · marked by you on {date} |
| `balances.orga.*` | Für dich als Orga · Hier ist niemand mit App beteiligt – du kannst es abhaken, wenn du weißt, dass es erledigt ist. | For you as organizer · Nobody with the app is involved here – tick it off once you know it's done. |
| `balances.others` / `.open` / `.doneState` | Ausgleiche der anderen ({count}) · offen · ✓ erledigt | Other people's transfers ({count}) · open · ✓ done |
| `balances.groupOpen` | Insgesamt {count, plural, one {noch eine Überweisung} other {noch # Überweisungen}} offen, bis alle quitt sind. | {count, plural, one {One transfer} other {# transfers}} left until everyone's square. |
| `balances.othersRow` (sr) | {from} an {to}, {amount}, {state} | {from} to {to}, {amount}, {state} |
| `balances.allSquare.*` | Alle sind quitt ✓ · Niemand muss mehr etwas überweisen. | Everyone's square ✓ · Nobody needs to send anything. |
| `balances.paidToYou` | {names} {count, plural, one {hat} other {haben}} {amount} an dich als überwiesen markiert. Noch nicht angekommen? Unter „Erledigt“ kannst du es zurücknehmen. | {names} marked {amount} as sent to you. Not there yet? You can undo it under “Done”. |
| `balances.share` | Übersicht teilen | Share overview |
| `payInfo.whereTitle` / `.whereText` | Wohin soll das Geld? · Hinterleg IBAN oder PayPal-Name – dann sehen {names} sie bei ihrer Überweisung an dich. | Where should the money go? · Add an IBAN or PayPal name – {names} will see it when sending you money. |
| `payInfo.title` / `.hint` | Deine Zahlungsinfo · Nur wer an dich überweist, sieht das. Wird gelöscht, wenn du die Reise verlässt. | Your payment details · Only people sending you money see this. It's deleted when you leave the trip. |
| `costForm.payer` / `.for` / `.split` / `.equal` / `.custom` | Wer hat ausgelegt? · Für wen war es? · Wie aufteilen? · Gleich · Eigene Beträge | Who paid? · Who was it for? · How to split? · Equally · Own amounts |
| `costForm.saved.*` | Gespeichert. Du zahlst jetzt noch {amount} zurück. · Gespeichert. Du bekommst jetzt noch {amount} zurück. · Gespeichert. Du bist jetzt quitt ✓ | Saved. You now owe {amount}. · Saved. You now get {amount} back. · Saved. You're now all square ✓ |
| `costs.detail.*` | So wird geteilt · Gleich geteilt · Eigene Beträge · eingetragen von {name} am {date} | How it's split · Split equally · Own amounts · added by {name} on {date} |
| `close.open` | Noch {count, plural, one {eine Überweisung ist} other {# Überweisungen sind}} offen – trotzdem abschließen? … | {count, plural, one {One transfer is} other {# transfers are}} still open – close anyway? … |
Entfallen: `costs.tabs`, `costs.mine.detail*`, `costs.mine.total`, `costs.day.sum`, `costs.row.custom`, `balances.list`, `balances.other.*`, `balances.whoMarks` (andere Zeilen haben keine Tasten mehr; Block 5 erklärt sich selbst), `balances.yours/others/othersOnly/count`.

### E.13 Abweichungen von R.8 und Aufwand (Hinweis an PM/CEO/Developer)
1. **Sichtbarkeit** (E.6): R.8 „Bereich ansehen: alle Salden, Ausgleichsvorschlag, Zahlungsinfos“ → neu: Salden anderer **nicht**; Ausgleichsvorschlag der anderen **kompakt** (Namen, Betrag, Status); Zahlungsinfos **nur** der eigenen Empfänger. Q35 („Zahlungsinfo sichtbar für die Reise“) wird enger – Datenschutz-Gewinn, kein Funktionsverlust.
2. **Salden-Liste** (R.8 I10-01/Umfang „Salden je Person“) entfällt.
3. **Segment „Ausgaben | Salden & Ausgleich“** (R.8 I10-01) entfällt; Einstieg über „Dein Stand“.
4. **Teilen** wandert vom Kopf auf `/balances`.
5. Rechte, Rechenregeln, Datenhaltung: **unverändert**.
**Aufwand (Schätzung UX):** überwiegend Texte (i18n) und Umbau von `costs-view.tsx` (Blöcke umsortieren, Segment/Salden raus, Akkordeons rein), Server-Filter in `load.ts` (Zahlungsinfo/Salden), Snackbar mit neuem Ergebnis. Keine Migration.

### E.14 Abnahme UX (zusätzlich zu D.18, ersetzt dort Salden/Segment-Punkte)
Max zahlt (eine Überweisung, Primär «Hab ich überwiesen», IBAN Kopieren) · Lena bekommt von 3 (Sekundär-Tasten, Erinnern, Karte «Wohin soll das Geld?» ohne/mit Zahlungsinfo) · Orga-Block nur bei Platzhalter ↔ ehemalig · „Ausgleiche der anderen“ eingeklappt, Satz immer sichtbar, Zeilen ohne Tasten/IBAN · Netzwerk-Tab: keine fremden Zahlungsinfos/Salden für Mitglieder · «So rechnen wir» mit/ohne Überweisungen, Summe = Hauptsatz · Glossar: kein «bezahlt», «Salden», «Ausgaben gesamt», «schuldest» mehr in DE-Oberfläche (Suche in `de.json`) · Snackbar nach Speichern nennt neues Ergebnis · Alle quitt / abgeschlossen · 320 px, 200 %, Dark Mode, DE/EN.

### E.15 Offene Fragen an den Auftraggeber (über den CEO)
- ~~K-1 Kosten-Leiste unterwegs~~ – **entschieden (2026-10-23): Variante C**, mit Änderungen des Auftraggebers → W16 v2.17 „Fassung 2“: Leiste ist nur **Abkürzung**, blendet aus, sobald die Kachel „Kosten“ (mit «Alle Ausgaben ansehen ›») unten sichtbar wird; linke Hälfte «Kosten · Verlauf ›» als eigenes, deutlich tippbares Ziel; Taste rechts kompakter.
- ~~K-2 „quitt“~~ – **bestätigt** vom Auftraggeber (2026-10-23).
- Neu, aus derselben Runde: **App startet in der laufenden Reise** → W16 v2.18.
