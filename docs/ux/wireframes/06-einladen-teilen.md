# W06 – Einladen & Teilen-Sheet (`/trips/{id}/invite` + Komponente)

Features: F-002, F-007 (Platzhalter), F-004 (Link erneuern, Beitritt sperren), F-010/F-012/F-015 (gleiche Komponente), F-046 · Flows: [G](../user-flows.md#g-reise-anlegen--einladen-f-001-f-002), [K](../user-flows.md#k-nachzügler-erinnern-f-015) · Regeln: [ux-spec §4.5, §10.3](../ux-spec.md)

## Seite „Einladen“ (mobil), direkt nach dem Anlegen

```
┌────────────────────────────────────┐
│ ← Lissabon 2027                ⋯   │
├────────────────────────────────────┤
│  ✓ Deine Reise ist angelegt!       │  nur direkt nach Anlage; sonst h1 „Freunde einladen“
│  Jetzt die Gruppe einladen.        │
│                                    │
│  Nachricht für euren Gruppenchat   │
│  Sprache des Textes:  (•)DE ( )EN  │  Radiogruppe, ändert nur den Text
│  ┌──────────────────────────────┐  │
│  │ Wir wollen weg: Lissabon     │  │  editierbar, Auto-Höhe
│  │ 2027! Trag ein, wann du      │  │
│  │ kannst – dauert 2 Minuten:   │  │
│  │ https://wirwollenweg.app/i/… │  │
│  └──────────────────────────────┘  │
│  [          Teilen …            ]  │  primär: Web Share API
│  [        Text kopieren         ]  │  sekundär
│  WhatsApp · Signal · Telegram ·    │  nur wenn Web Share fehlt
│  E-Mail                            │
│                                    │
│  Nur der Link                      │
│  wirwollenweg.app/i/x7Kp…  [Kopieren]
│                                    │
│  ▸ Wer soll dabei sein?            │  Platzhalter (F-007), eingeklappt
│  ┊ Leg Namen an, damit alle sehen, │
│  ┊ wer noch fehlt.                 │
│  ┊ Name [            ] [Hinzufüg.] │
│  ┊ Kemal   (fehlt noch) [Link] [⋯] │  eigener Link je Platzhalter
│  ┊ Sara    (fehlt noch) [Link] [⋯] │
│                                    │
│  ── nur Orga ──────────────────    │
│  Neue Mitglieder können beitreten  │
│                          [● an ]   │  Switch (F-004)
│  Link erneuern                     │  Textbutton → Bestätigungsdialog
│                                    │
│  [ Weiter: Meine Tage eintragen ]  │  nur direkt nach Anlage
└────────────────────────────────────┘
```

## Komponente Teilen-Sheet (Bottom-Sheet mobil / Dialog Desktop)

Wird geöffnet für: Abstimmung gestartet (F-010), Ergebnis (F-012), Erinnern (F-015), Platzhalter-Link.

```
┌────────────────────────────────────┐
│ ───── (Griff)                      │
│  Gruppe erinnern             [×]   │  Überschrift je Anlass
│                                    │
│  Wen erinnern?                     │  nur bei Erinnern
│  ☑ Kemal   ☑ Sara                  │
│                                    │
│  Sprache des Textes:  (•)DE ( )EN  │
│  ┌──────────────────────────────┐  │
│  │ Kemal und Sara, ihr fehlt    │  │
│  │ noch bei Lissabon 2027!      │  │
│  │ Tragt kurz eure Tage ein,    │  │
│  │ dann können wir planen:      │  │
│  │ https://…/i/x7Kp…            │  │
│  └──────────────────────────────┘  │
│  [          Teilen …            ]  │
│  [        Text kopieren         ]  │  → „Kopiert ✓“ (2 s)
│  Zuletzt erinnert: heute, 14:20    │  nur Orga, nur Erinnern
└────────────────────────────────────┘
```

## Desktop
Seite „Einladen“: zweispaltig – links Text + Aktionen, rechts Platzhalter-Liste und Orga-Einstellungen. Teilen-Sheet als Dialog (max. 480 px). Web Share ist auf Desktop meist nicht verfügbar → primär „Text kopieren“.

## Regeln
- Textänderung + Sprachwechsel: Rückfrage «Deine Änderungen am Text gehen verloren.»
- Sprachwechsel des Textes tauscht auch den Produktnamen: DE «Wir wollen weg: Lissabon 2027! Trag ein, wann du kannst – dauert 2 Minuten: {link}» ↔ EN «When do we go? Lisbon 2027 – add the dates that work for you, takes 2 minutes: {link}» (Name in der Sprache des Senders/Textes, ux-spec §10.3, §10.6). Vorbelegung = Oberflächensprache des Senders.
- „Link erneuern“ (Dialog): «Neuen Link erzeugen? Der bisherige Link funktioniert dann nicht mehr – auch für Platzhalter.» `[Abbrechen]` `[Neuen Link erzeugen]`.
- Beitritt gesperrt → Teilen-Bereich ersetzt durch Hinweis «Der Beitritt ist geschlossen. Öffne ihn, um neue Leute einzuladen.»
- Mitglieder (nicht Orga) sehen nur Text/Teilen/Link, keine Platzhalter-Verwaltung und keine Orga-Schalter.
