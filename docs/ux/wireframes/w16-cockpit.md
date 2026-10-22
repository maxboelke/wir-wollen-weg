# W16 – Reise-Cockpit (Übersicht nach der Festlegung, Phase 3)

Stand: 2026-10-20 · Verantwortlich: UI/UX · Status: **Entwurf zur Freigabe durch den Auftraggeber** (Ausbaustufe R, noch nicht umsetzen)
Features: **F-053**, F-012 (Kopf/Countdown), F-007 (Platzhalter), F-056 (Chip „bucht“), Einstieg in F-031, F-035/036, F-054, F-055, F-033 · Route `/trips/{id}` (Phase `fixed`)
Klickbarer Prototyp: [`../mockups/reise-managen/index.html`](../mockups/reise-managen/index.html) (Bildschirm W16; Steuerpanel rechts: Rolle Max/Lena, Teilphase, Dunkel, Bewegung)
Bezug: PRD §6b, features.md „AUSBAUSTUFE ‚Reise managen‘“ (R.0–R.5), PM-Empfehlungen Q26–Q36 (hier durchgehend angenommen), Design-System v1.0 (§9.2 Cockpit-Kopf, §9.3 Kennzahl-Box, §9.5 Kacheln, §9.6 Karten), Motion-System §3–§6.

Beispieldaten (auch im Prototyp): Reise **„Kroatien 2027“**, Sa., 12. – Sa., 19. Juni 2027 (7 Nächte), 6 Reisende: Lena (Orga, „bucht“), Max (du), Kemal, Sara, Jonas, Mia (Platzhalter, noch nicht beigetreten). „Heute“ je Teilphase: 2. Mai (Vorbereitung) · 14. Juni (Unterwegs, Tag 3 von 8) · 28. Juni (Danach).

---

## 1. Kernentscheidung: Hub statt Tabs (Phase 3)

Wunsch des Auftraggebers: Nach der Festlegung zeigt die Reise **nur noch die Übersicht – keine Tabs mehr**. Umsetzung als **Hub-and-Spoke**:

- In Phase 3 entfällt die Tab-Leiste (Übersicht · Meine Tage · Gruppe · Abstimmen) vollständig. Der Cockpit-Kopf besteht nur aus Zeile 1 (Zurück · Reisename + Phasenzeile · `⋯`) und der Kennzahl-Box.
- Das Cockpit ist der **einzige Einstieg**. Jeder Bereich ist **genau einen Tipp** entfernt (Kachel) und **genau eine Ebene** tief (Unterseite mit Zurück-Pfeil zum Cockpit). Formulare (Vorschlagen, Ausgabe, Freigabe, Hochladen) sind die einzige zweite Ebene.
- Termin-Historie (Gruppenkalender, Abstimmungsergebnis) bleibt **schreibgeschützt** erreichbar über die Zeile „So habt ihr entschieden“ und das Reisemenü `⋯`.
- **Abweichung von der PM-Empfehlung** (F-053 schlug Tabs «Übersicht · Unterkunft · Kosten · Unterlagen» vor): bewusst verworfen, weil (a) der Auftraggeber ausdrücklich „keine Tabs mehr“ will, (b) fünf Bereiche + Übersicht nicht in eine Tab-Spur auf 360 px passen (Scroll-Tabs verstecken Bereiche), (c) die Kacheln den Status zeigen, den eine Tab-Beschriftung nie zeigen kann („du schuldest 86 €“). → Offene Frage UX-1 unten.

### Routen (Vorschlag für den Developer)
| Ansicht | Route | Wireframe |
|---|---|---|
| Cockpit | `/trips/{id}` | W16 |
| Unterkünfte (Liste + Rangliste) | `/trips/{id}/stays` | W18 |
| Swipen | `/trips/{id}/stays/swipe` | W18 |
| Unterkunft vorschlagen | `/trips/{id}/stays/new` | W17 |
| Kosten – Ausgaben / Salden | `/trips/{id}/costs`, `/trips/{id}/costs/balances` | W19 |
| Ausgabe hinzufügen / bearbeiten | `/trips/{id}/costs/new`, `/costs/{expenseId}/edit` | W19 |
| Reisedaten | `/trips/{id}/travel-data` | W20 |
| Freigabe-Formular / neue Anfrage | `/trips/{id}/travel-data/{requestId}`, `/travel-data/new` | W20 |
| Unterlagen / hochladen | `/trips/{id}/documents`, `/documents/upload` | W21 |
| Infos / bearbeiten | `/trips/{id}/info`, `/info/edit` | W22 |

Alle Unterseiten sind echte URLs (Zurück-Taste des Browsers funktioniert, ux-spec §3). Die alten Tab-Routen (`/days`, `/group`, `/poll`) leiten in Phase 3 auf ihre schreibgeschützte Variante um.

---

## 2. Aufbau mobil (360–599 px), Teilphase „Vorbereitung“, Sicht Max (Mitglied)

```
┌────────────────────────────────────┐
│▓(←)  Kroatien 2027             (⋯)▓│  Zeile 1, sticky · ← = Meine Reisen · ⋯ = Reisemenü
│▓     ● Steht fest · noch 41 Tage  ▓│  Phasenzeile (Sonnen-Punkt = Zusatz)
│▓ ┌──────────────────────────────┐ ▓│  Kennzahl-Box (scrollt mit)
│▓ │ (◔41) Sa., 12. – Sa., 19.    │ ▓│  Mini-Vorfreude-Ring 64 px, aria-hidden
│▓ │  Tage Juni 2027              │ ▓│
│▓ │       7 Nächte · 6 dabei ·   │ ▓│  Countdown steht als TEXT daneben
│▓ │       noch 41 Tage           │ ▓│
│▓ │ [▣ Zum Kalender]             │ ▓│
│▓ └──────────────────────────────┘ ▓│
╰▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╯
┃ Für dich zu tun          (3 offen) │  Karte mit Koralle-Kante links (To-do-Muster W04)
┃ [ID] Lena bittet um deine          │  1. Eintrag = Hauptaktion der Seite
┃      Reisedaten                    │
┃      Für „Flüge München – Split“ · │
┃      nur Lena sieht sie            │
┃ [      Angaben freigeben         ] │  einzige Primär-Taste der Seite
┃ ────────────────────────────────── │
┃ (♥) 3 Unterkünfte bewerten      ›  │  weitere Einträge = Zeilen-Links
┃ (€) Du schuldest Kemal 86,00 €  ›  │
└────────────────────────────────────┘
  Eure Reise                            h2
┌────────────────────────────────────┐
│ (▤) Unterkunft                   › │  Leit-Kachel (volle Breite) der Teilphase
│ 5 Vorschläge · du hast 2 von 5     │
│ bewertet                           │
│ ▓▓▓▓▓▓░░░░░░░░                     │  Balken 6 px, aria-hidden
│ [▨][▨][▨][▨]                       │  Mini-Vorschaubilder, dekorativ
└────────────────────────────────────┘
┌────────────────┐ ┌────────────────┐
│ (ID)         › │ │ (🎫)         › │  Kachel-Raster 2 Spalten
│ Reisedaten     │ │ Unterlagen     │
│ Lena bucht –   │ │ 5 Unterlagen · │
│ deine Daten    │ │ 1 neu          │
│ fehlen noch    │ │                │
└────────────────┘ └────────────────┘
┌────────────────┐ ┌────────────────┐
│ (€)          › │ │ (i)          › │
│ Kosten         │ │ Infos          │
│ Gesamt 456 € · │ │ Check-in 15 Uhr│
│ du schuldest   │ │ · Treffpunkt   │
│ 86,00 €        │ │                │
└────────────────┘ └────────────────┘
  Mehr zur Reise                        h2
┌────────────────────────────────────┐
│ (✓) So habt ihr entschieden      › │  Sheet: Ergebnis + Link Gruppenkalender (nur lesen)
│     Gruppenkalender & Abstimmung   │
│ (⚇) Wer ist dabei? (6) (LE)(MA)… › │  Sheet: Mitglieder mit Chips Orga · bucht · Platzhalter
│     Lena bucht · 1 Platzhalter     │
└────────────────────────────────────┘
```

### 2.1 Kopf
- Zeile 1 wie Cockpit-Kopf (design-system §9.2) **ohne Tab-Spur**; sticky ≈ 60 px (statt 104 px – mehr Platz für Inhalt).
- **Kennzahl-Box Phase 3** (ersetzt den großen Vorfreude-Ring nach der einmaligen Feier aus W11): Mini-Ring 64 px (Füllgrad = vergangene Vorfreude-Zeit, min. 4 %, `aria-hidden`), daneben Datum (Jakarta 17/800) und Meta-Zeile «7 Nächte · 6 dabei · noch 41 Tage». Zahl **zählt nicht hoch**. Aktion: `[Zum Kalender]` (ICS wie W11).
- Die **Feier „Es geht los!“ (W11)** bleibt unverändert der erste Besuch nach der Festlegung; danach zeigt die Übersicht dauerhaft dieses Cockpit. Die Ergebnis-Karte von W11 entfällt im Cockpit (ihr Inhalt steckt in der Kennzahl-Box).

### 2.2 „Für dich zu tun“
- Nur **persönliche** Aufgaben, max. **3**, sortiert nach Dringlichkeit: (1) Reisedaten-Anfrage offen, (2) Unterkünfte unbewertet, (3) eigene Schuld (Vorbereitung erst ab 50 €, unterwegs/danach immer), (4) Orga/„bucht“: Unterkunft festlegen bzw. als gebucht markieren, offene Reisedaten-Anfrage, Abrechnung abschließen.
- Der **erste** Eintrag ist ausführlich mit Primär-Taste (Verb + Objekt: «Angaben freigeben», «Jetzt swipen», «Zum Ausgleich»); alle weiteren sind Zeilen-Links (≥ 56 px).
- Leer: Karte zeigt «Alles erledigt – Vorfreude!» + «Wir melden uns hier, wenn es etwas Neues gibt.» (keine leere Karte, kein Verschwinden – die Stelle bleibt verlässlich).
- Zähler-Chip «3 offen» (Text, nicht nur Farbe).

### 2.3 Kacheln „Eure Reise“
- Reihenfolge je Teilphase fest (Tabelle §3). Pro Teilphase ist die **Leit-Kachel** volle Breite mit Zusatzgrafik (Fortschrittsbalken/Vorschaubilder bzw. großer Saldo), alle anderen Kacheln im 2-Spalten-Raster.
- Jede Kachel ist **ein Link** (ganze Fläche ≥ 140 px hoch) mit Icon-Kachel, Titel (Jakarta 16/800), **genau einer** Statuszeile (14/500, wichtigster Teil fett) und Chevron. Zugänglicher Name = Titel + Status (z. B. «Kosten. Gesamt 456,00 €, du schuldest 86,00 €»).
- Bereiche, die noch nicht gebaut sind, erscheinen nicht (Inkrement-weise Einführung, F-053).
- Raster: `repeat(auto-fit, minmax(min(100%, 9.5em), 1fr))` → bei 200 % Text automatisch einspaltig.

### 2.4 „Mehr zur Reise“
- «So habt ihr entschieden» → Bottom-Sheet: Ergebnis (Datum, festgelegt von, Platz 1/2 mit Stimmen) + Hinweis auf Gruppenkalender/Abstimmung im Modus „nur lesen“.
- «Wer ist dabei? (6)» → Sheet mit allen Personen, Chips «Orga» (Krone + Text), «bucht», «Platzhalter · noch nicht dabei».

### 2.5 Reisemenü `⋯` (Phase 3)
Freunde einladen · *(Orga)* **Wer bucht?** (F-056, Sheet mit Schaltern, max. 3, Platzhalter deaktiviert mit Grund) · So habt ihr entschieden · *(Orga)* Reise bearbeiten · *(Orga)* Festlegung aufheben … · Hilfe · Reise verlassen … (destruktiv leise; Warnung bei offenem Saldo und eigenen Unterlagen, s. W19/W21).

---

## 3. Teilphasen (F-053) – was sich ändert

| | Vorbereitung (bis Tag vor Anreise) | Unterwegs (Anreise bis Abreise) | Danach (ab Tag nach Abreise) |
|---|---|---|---|
| Phasenzeile | «Steht fest · noch 41 Tage» (Punkt Sonne) | «Unterwegs · Tag 3 von 8» (Punkt Minze) | «Zurück · Kosten ausgleichen» bzw. «Zurück · alles ausgeglichen» (Punkt Tinte 3) |
| Kennzahl-Box | Mini-Vorfreude-Ring + Datum + «noch 41 Tage» · `[Zum Kalender]` | Tages-Ring «3 von 8» + «Heute: Mo., 14. Juni» + nächster Termin aus Unterlagen («Fähre nach Stari Grad · 9:30 Uhr») · `[+ Ausgabe]` (Minze-Taste) `[Tickets]` | Voller Ring + «Schön war's!» + Zeitraum · `[Ausgleichen]` nur bei offenen Salden |
| Leit-Kachel | **Unterkunft** | **Kosten** (großer Saldo «Du bekommst 42,00 €») | **Kosten** («Noch 3 Ausgleiche offen · du schuldest …») |
| Raster | Reisedaten · Unterlagen · Kosten · Infos | Unterlagen («Nächste: Fähre … · Mo., 14. Juni») · Infos · Unterkunft · Reisedaten (nur „bucht“) | Unterlagen («Werden am 19. Juli gelöscht – jetzt sichern») · Unterkunft · Reisedaten («Gelöscht am 26. Juni») · Infos |
| To-dos typisch | Reisedaten freigeben, swipen, Schulden ab 50 € | Schulden, offene Reisedaten | Ausgleichen, «Du bekommst noch …», Orga: Abrechnung abschließen |

Teilphase wird in der **Zeitzone der Reise** bestimmt (F-053); Wechsel passiert beim Neuladen (kein Live-Update).

### Sicht Orga + „bucht“ (Lena), Vorbereitung
- To-dos: «Reisedaten: 2 von 4 freigegeben» (noch offen: Max, Jonas) · «Unterkunft festlegen – Favorit: Kamena Kuća (4 ♥)» bzw. «Villa Mare buchen» nach der Festlegung.
- Kachel Reisedaten: «**2 von 4** haben freigegeben» (Platzhalter zählen nicht, weil sie nicht gefragt werden können; sie stehen im Bereich als «noch nicht dabei»).
- Orga sieht in der Unterkunft-Kachel immer den Favoriten (Q33: Orga sieht alles).
- **Kein Sonderzugriff:** Orga ohne Markierung „bucht“ sieht bei Reisedaten nur Zahlen/Status.

---

## 4. Zustände & Sonderfälle

| Fall | Verhalten |
|---|---|
| Erster Besuch nach Festlegung | Feier W11 (einmal je Person), danach dieses Cockpit; Kacheln erscheinen mit Staffel (`stagger-card` 60 ms, max. 400 ms, **nur beim ersten Aufbau je Sitzung**, motion-system §5.8). |
| Festlegung aufgehoben | Kopf zurück in Phase 2 (Tabs kommen zurück); Bereiche bleiben erhalten, Banner im jeweiligen Bereich «Termin wird neu abgestimmt – Unterkünfte, Ausgaben, Reisedaten und Unterlagen bleiben erhalten.» (F-053 R.0.1). |
| Bereich leer | Kachel nennt den nächsten Schritt statt „0“: «Noch keine Ausgaben», Orga: «Infos ergänzen». |
| Platzhalter | Zählen in Fortschritten mit, wo sie teilnehmen können (Kosten, Unterkunft p. P.); bei Reisedaten als «noch nicht dabei». |
| Offline | Offline-Banner unter dem Kopf (ux-spec §6); Kacheln zeigen letzten Stand, Aktionen, die den Server brauchen, mit Hinweis deaktiviert. |
| Laden | Skelett: Kennzahl-Box + To-do-Karte + 5 Kachel-Umrisse, ab 300 ms. |
| Große Schrift 200 % | Kacheln einspaltig, Kennzahl-Box Ring über dem Text, Phasenzeile bricht um. |

---

## 5. Interaktion & Barrierefreiheit
- Überschriften: h1 = Reisename (Kopf), h2 «Für dich zu tun», «Eure Reise», «Mehr zur Reise». Kacheltitel sind Teil des Link-Namens, keine Überschriften (sonst 6 h3 nur für Links).
- Ring/Balken/Vorschaubilder `aria-hidden`; alle Werte stehen als Text.
- Fokusreihenfolge = visuelle Reihenfolge; Fokus nach Rückkehr aus einem Bereich: auf der Kachel, über die man gekommen ist (Scrollposition wiederherstellen, ux-spec §3).
- Tippflächen: Kacheln ≥ 140 × 160 px, Zeilen ≥ 56 px, Kopftasten 44 px. Fokusring auf Indigo weiß mit Indigo-Hof (D-22).
- Farbe nie allein: Saldo immer mit Wort («du bekommst» / «du schuldest» / «ausgeglichen ✓»), To-do mit Zähler-Text, Teilphase mit Text.
- `<title>`: «Übersicht · Kroatien 2027 · Wir wollen weg».

## 6. Desktop (≥ 960 px)
Inhalt max. 1040 px: links (≈ 600 px) Kennzahl-Box-Karte + „Für dich zu tun“ + Leit-Kachel, rechts (≈ 400 px) Kachel-Raster einspaltig + „Mehr zur Reise“. Unterseiten öffnen als normale Seiten (kein Seitenpanel), Inhalt `content-narrow` 640 px zentriert.

## 7. Motion (Briefing an Motion Designer)
Kachel-Eintritt (Staffel, einmal je Sitzung) · Seitenwechsel Cockpit ↔ Bereich: horizontal `distance-lg` + Fade (`base`), zurück in Gegenrichtung · Ring wächst per `stroke-dashoffset` (`moderate`) · To-do erledigt: Zeile blendet aus, nächste rückt nach (FLIP `slow`) · reduziert: nur Überblenden 140 ms.

---

## 8. Offene UX-Fragen & Empfehlungen (an CEO / Auftraggeber)

| Nr. | Frage | Empfehlung UX |
|---|---|---|
| **UX-1** | Hub ohne Tabs (dieser Entwurf) statt der von der PM vorgeschlagenen Phase-3-Tabs? | **Hub ohne Tabs** – entspricht dem Auftraggeber-Wunsch, skaliert auf 5+ Bereiche, Status sichtbar. Unterwegs schneller Zugriff über die zwei Tasten in der Kennzahl-Box (`+ Ausgabe`, `Tickets`). |
| **UX-2** | Reisedaten als **eigener Bereich** (dieser Entwurf) oder als Abschnitt in „Unterlagen“ (PM-Vorschlag F-053/F-055)? | **Eigener Bereich** – der Auftraggeber nennt ihn ausdrücklich, er hat eigene Regeln (Einwilligung, Löschung nach 7 statt 30 Tagen), und „Unterlagen“ wäre sonst überladen. |
| UX-3 | Schulden-To-do in der Vorbereitung erst ab 50 € (sonst „nervt“ jede Fähren-Anzahlung)? | Ja, Schwelle 50 € nur in *Vorbereitung*; unterwegs/danach immer. Schwelle im Produkt fest, nicht einstellbar. |
| UX-4 | Sieht die Orga Titel von Unterlagen, die nur für andere freigegeben sind (für Moderation/Löschen)? | Nein im Stufe-1-Schnitt (Need-to-know). Orga sieht nur «+1 Unterlage nur für andere» ohne Titel und kann sie über diesen Eintrag löschen. → im Prototyp noch nicht abgebildet. |
| UX-5 | Kennzahl-Box „Unterwegs“ zeigt den nächsten Termin aus den Unterlagen (Datum + Uhrzeit). Braucht es dafür ein Uhrzeit-Feld beim Hochladen? | Ja, optional „Uhrzeit“ neben „Datum“ (W21); ohne Uhrzeit nur der Titel. |
| UX-6 | Desktop: Cockpit zweispaltig (oben) oder einspaltig wie mobil? | Zweispaltig ab 960 px; Designer bestätigt Optik. |
| UX-7 | Tab-Routen der Phasen 1/2 in Phase 3: weiterleiten (Vorschlag) oder 404? | Weiterleiten auf schreibgeschützte Ansicht (alte geteilte Links bleiben gültig). |

Zur Abstimmung an den Designer (über `docs/ux/abstimmung-design.md`, nach Freigabe): Kennzahl-Box Phase 3 mit 64-px-Ring statt 52 px; Leit-Kachel volle Breite mit Mini-Vorschaubildern; Kachel-Mindesthöhe 140 px; Koralle-Kante für „Für dich zu tun“ (Wiederverwendung `todo-*`).
