# W10 – Abstimmung: erstellen & abstimmen (`/trips/{id}/poll/new`, `/trips/{id}/poll`)

Features: F-010, F-011, F-017, F-007 (Status „abgestimmt“) · Flow: [D.1, D.2](../user-flows.md#d-abstimmung-f-010-f-011-f-017--festlegung-f-012)

## A) Abstimmung erstellen – nur Orga (mobil)

```
┌────────────────────────────────────┐
│ ← Abbrechen   Abstimmung erstellen │
├────────────────────────────────────┤
│ Wähle 2–6 Zeiträume, über die die  │
│ Gruppe abstimmt.                   │
│                                    │
│ Option 1                           │
│ ┌────────────────────────────────┐ │
│ │ Mi., 5. Mai – Mo., 10. Mai     │ │
│ │ 5 Nächte · ca. 3 Urlaubstage   │ │
│ │ 5 können · 2× zur Not          │ │
│ │ [‹ früher] [später ›]  (inakt.)│ │  nur wenn Spanne > Dauer
│ │ Nächte [−] 5 [+]    [Entfernen]│ │
│ └────────────────────────────────┘ │
│ Option 2                           │
│ ┌────────────────────────────────┐ │
│ │ Sa., 12. Juni – Do., 17. Juni  │ │  Wunschdauer 5 aus Spanne 12.–19.6.
│ │ 5 Nächte · ca. 4 Urlaubstage   │ │
│ │ 5 können · 2× zur Not          │ │
│ │ [‹ früher] [später ›]          │ │
│ │ Nächte [−] 5 [+]    [Entfernen]│ │
│ └────────────────────────────────┘ │
│ Option 3                           │
│ ┌────────────────────────────────┐ │
│ │ Do., 13. Mai – Di., 18. Mai    │ │
│ │ ⚠ Jonas kann nicht             │ │  Warnung Amber (ww-icon-warning), nie Rot
│ │ …                              │ │
│ └────────────────────────────────┘ │
│ [ + Eigenen Zeitraum ]             │  → Sheet mit Mini-Heatmap, Bereichswahl
│                                    │
│ Abstimmen bis (optional)           │  F-017
│ [            ]  in 3 Tagen · 1 Woche│
│                                    │
├────────────────────────────────────┤
│ [      Abstimmung starten       ]  │  fixiert; danach Teilen-Sheet (W06)
└────────────────────────────────────┘
```

Sheet „Eigener Zeitraum“: Mini-Kalender mit Heatmap-Färbung, Bereichsmodus aktiv («Anreise antippen» → «Abreise antippen»), Zusammenfassung «Fr., 21. Mai – Di., 25. Mai · 4 Nächte · ⚠ Lena, Paul können nicht» `[Hinzufügen]`.

## B) Abstimmen (alle; mobil)

### Richtung B (Q18) – Kopf mit Kennzahl-Kacheln (maßgeblich ab Look & Feel 2.0)
Entscheidung [abstimmung-design §8.1 B-4](../abstimmung-design.md), Regeln [ux-spec §4.10](../ux-spec.md). Ersetzt die drei Kopfzeilen der Skizze unten; die Karten bleiben inhaltlich gleich.
```
│▓(←)  Lissabon 2027             (⋯)▓│  kompakter Kopf, Phasenzeile
│▓     ● Abstimmung läuft · 4/7 fertig│  „4/7 fertig“ (sr: „4 von 7 fertig“)
│▓(Übersicht)(Meine Tage)(Gruppe)(Ab│  keine Kennzahl im Kopf dieses Tabs
╰▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╯
│ Abstimmung läuft                   │  h1
│ ┌───────────────┐ ┌──────────────┐ │  Kennzahl-Kacheln (je ½ Breite, 2 Zeilen erlaubt;
│ │[⏱] noch 3 Tage│ │[▥] 4 von 7  ›│ │  große Schrift: untereinander)
│ │ bis Fr., 14.  │ │ haben abge-  │ │  rechte Kachel = Button → Sheet „Wer hat abgestimmt?“
│ │ Mai           │ │ stimmt       │ │  ohne Frist: nur rechte Kachel, volle Breite
│ └───────────────┘ └──────────────┘ │  Frist vorbei: „Frist abgelaufen“ + Warn-Icon (Amber)
```
Sheet «Wer hat abgestimmt?»: «Abgestimmt (4)» Lena, Jonas, Tim, Anna · «Noch offen (3)» Kemal, Sara, Paul (gestrichelter Avatar-Ring) · nur Status, **keine** Stimmen · Orga: `[Erinnern]` (→ Flow K). Die Avatar-Reihe im Kopf entfällt.

**Ab 2026-10-20 (Feedback-Runde 1, [ux-spec §14.2](../ux-spec.md)):** Das Sheet ist das gemeinsame Erinnern-Sheet (`RemindSheet`, Phase 2). Reihenfolge «Fehlt noch (3)» zuerst, dann «Abgestimmt (4)». **Jede fehlende Person** hat [Erinnern] → „{Name} erinnern“ mit Text «Hey Kemal, deine Stimme fehlt noch bei Lissabon 2027! Stimm kurz ab: {link}» und [Per WhatsApp senden]. Das gilt für **alle Mitglieder**, nicht nur die Orga. Ab 2 Fehlenden zusätzlich [Alle erinnern (n)]. Eigene Zeile: [Abstimmen] statt [Erinnern]. Weiterhin nur Status, **keine** Stimmen. Die Regel aus ux-spec §13 B4 („`[Erinnern]` entfällt“) ist damit aufgehoben.

- Karten: „Platz 1“-Chip in der Kopfzeile der Karte (bricht das Datum um, nicht sich selbst); Segmente 60 px mit Icon über Label (≥ U-8).
- Geister-Stimme: sichtbar „Nein?“, zugänglicher Name „Nein“ + Beschreibung „Vorschlag aus deinen Tagen“ (D-34).
- **Sortierung (M-U3):** Nach der letzten offenen Stimme sortieren sich die Karten **nicht** sofort um; Rang-Reihenfolge erst beim nächsten Öffnen des Tabs.
- Zahlen in Kacheln und Ergebniszeilen wechseln sofort (kein Hochzählen); Balken dürfen wachsen.

### Struktur (Arbeitsstand Runde 2)

```
┌────────────────────────────────────┐
│ ←  Lissabon 2027               ⋯   │
│ Übersicht│Meine Tage│Gruppe│Abstimmen│
├────────────────────────────────────┤
│ Abstimmung läuft                   │  h1
│ noch 3 Tage (bis Fr., 14. Mai)     │  F-017
│ 4 von 7 haben abgestimmt           │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ ⓘ Wir haben deine Stimmen aus  │ │  nur wenn unbestätigte Vorschläge
│ │ deinen Tagen vorbereitet.      │ │
│ │ [Alle Vorschläge übernehmen]   │ │
│ └────────────────────────────────┘ │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ Mi., 5. Mai – Mo., 10. Mai     │ │
│ │ 5 Nächte · ca. 3 Urlaubstage   │ │
│ │ laut Kalender: alle können     │ │
│ │ ┌────────┬──────────┬────────┐ │ │  Radiogruppe, ≥ 48 px; < 400 px:
│ │ │   ✓    │    ◐     │   ✕    │ │ │  Icon über Label, 56 px (U-8)
│ │ │  Ja  ● │Vielleicht│  Nein  │ │ │  gewählt = Fläche + 2-px-Rahmen + Icon gefüllt
│ │ └────────┴──────────┴────────┘ │ │
│ │ ████████▌██  ✓ 4  ◐ 1  ✕ 0     │ │  Ergebnis erst nach eigener Stimme zu dieser
│ │ (Platz 1)                      │ │  Option; Orga sieht immer alles (bestätigt,
│ │                                │ │  Auftraggeber 2026-10-08). Abzeichen „Platz 1“/„Top choice“
│ │ ▸ Wer hat wie gestimmt?        │ │
│ └────────────────────────────────┘ │
│ ┌────────────────────────────────┐ │
│ │ Do., 13. Mai – Di., 18. Mai    │ │
│ │ laut Kalender: ohne Jonas      │ │
│ │ ┌┄┄┄┄┄┄┄┄┬┄┄┄┄┄┄┄┄┄┄┬┄┄┄┄┄┄┄┄┐ │ │  gestrichelt = unbestätigter
│ │ ┆   Ja   ┆Vielleicht┆ Nein?  ┆ │ │  Vorschlag „Nein“
│ │ └┄┄┄┄┄┄┄┄┴┄┄┄┄┄┄┄┄┄┄┴┄┄┄┄┄┄┄┄┘ │ │
│ │ Vorschlag aus deinen Tagen:    │ │
│ │ Nein – bitte bestätigen        │ │
│ │ Stimm ab, um das Ergebnis zu   │ │  Platzhalter statt Balken (nicht Orga)
│ │ sehen.                         │ │
│ └────────────────────────────────┘ │
│ …                                  │
│ Noch 1 Option offen.               │  Statuszeile (role=status)
│                                    │
│ ── nur Orga ──                     │
│ [ + Option hinzufügen ]            │
│ [ Gruppe erinnern ]                │
├────────────────────────────────────┤
│ [Abstimmung beenden & festlegen]   │  fixiert, nur Orga
└────────────────────────────────────┘
```

Zustand „alle Optionen beantwortet“: Statuszeile «✓ Danke, deine Stimmen sind gespeichert. Du kannst sie bis zum Ende ändern.» Karten bleiben in der aktuellen Reihenfolge; **beim nächsten Öffnen** des Tabs nach Rang (vorher Erstellungsreihenfolge) – M-U3.

**Leerzustände Tab Abstimmen (Phase 1):**
```
Mitglied                              Orga
┌──────────────────────────────┐      ┌──────────────────────────────┐
│ [vote-waiting.svg]           │      │ Bereit für die Abstimmung?   │
│ Noch keine Abstimmung.       │      │ Wähle 2–6 Zeiträume aus den  │
│ Lena startet sie, sobald     │      │ Vorschlägen.                 │
│ genug Tage eingetragen sind. │      │ ⓘ Noch offen: Kemal, Sara    │
│ [Vorschläge ansehen]         │      │ [Abstimmung erstellen]       │
└──────────────────────────────┘      └──────────────────────────────┘
```

## Phase 3 – Unterseite „Abstimmungsergebnis“ (ab 2026-10-20, [ux-spec §14.4](../ux-spec.md))
```
│▓(←)  Lissabon 2027             (⋯)▓│  ← = zurück zur Übersicht; keine Tabs
│▓     Abstimmungsergebnis          ▓│  Untertitel statt Phasenzeile
╰▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╯
│ ✓ Termin steht fest: Mi., 5. Mai – │  vorhandenes fixedBanner + Link «Zur Übersicht»
│   Mo., 10. Mai 2027                │
│ [Karten schreibgeschützt, alle     │  wie heute phase="fixed": gewählte Option markiert,
│  Ergebnisse sichtbar]              │  alle Balken sichtbar, keine Orga-Aktionen
```
- Erreichbar über die Kachel „Abstimmungsergebnis“ der Übersicht (Phase 3) und über alte Links auf `/poll`.
- Ist die Feier für die Person noch fällig, geht es per Weiterleitung auf die Übersicht. `/poll/new` leitet in Phase 3 immer auf die Übersicht.
- `/poll?fix=1` (Orga, Phase 2) öffnet das Sheet „Termin festlegen“ direkt (Einstieg aus der Nächster-Schritt-Karte N2-6/N2-7).

## Desktop
Erstellen: Optionen-Liste links (max. 640 px), Mini-Heatmap rechts zur Orientierung. Abstimmen: Karten in einer Spalte (max. 720 px), Ergebnisbalken rechts in der Karte; „Wer hat wie gestimmt?“ als Tabelle (Zeilen = Personen, Spalten = Optionen, Zellen = Ja/Vielleicht/Nein als Text + Symbol) – auf Desktop standardmäßig aufgeklappt.
