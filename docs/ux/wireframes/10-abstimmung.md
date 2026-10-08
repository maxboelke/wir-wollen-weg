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
│ │ ⚠ Jonas kann nicht             │ │  Warnung mit Symbol + Text
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
│ │ ┌────────┬──────────┬────────┐ │ │  Radiogruppe, je ≥ 44 px
│ │ │ ✓ Ja ● │Vielleicht│  Nein  │ │ │  gewählt = gefüllt
│ │ └────────┴──────────┴────────┘ │ │
│ │ Ja 4 ████████ Vielleicht 1 ██  │ │  Ergebnisse (nach eigener Stimme)
│ │ Nein 0         Platz 1         │ │
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

Zustand „alle Optionen beantwortet“: Statuszeile «✓ Danke, deine Stimmen sind gespeichert. Du kannst sie bis zum Ende ändern.» Karten sortieren sich ab jetzt nach Rang (vorher Erstellungsreihenfolge).

**Leerzustände Tab Abstimmen (Phase 1):**
```
Mitglied                              Orga
┌──────────────────────────────┐      ┌──────────────────────────────┐
│ [Illustration: Urne/Daumen]  │      │ Bereit für die Abstimmung?   │
│ Noch keine Abstimmung.       │      │ Wähle 2–6 Zeiträume aus den  │
│ Lena startet sie, sobald     │      │ Vorschlägen.                 │
│ genug Tage eingetragen sind. │      │ ⓘ Noch offen: Kemal, Sara    │
│ [Vorschläge ansehen]         │      │ [Abstimmung erstellen]       │
└──────────────────────────────┘      └──────────────────────────────┘
```

## Desktop
Erstellen: Optionen-Liste links (max. 640 px), Mini-Heatmap rechts zur Orientierung. Abstimmen: Karten in einer Spalte (max. 720 px), Ergebnisbalken rechts in der Karte; „Wer hat wie gestimmt?“ als Tabelle (Zeilen = Personen, Spalten = Optionen, Zellen = Ja/Vielleicht/Nein als Text + Symbol) – auf Desktop standardmäßig aufgeklappt.
