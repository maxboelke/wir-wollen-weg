# W15 – Hilfe / FAQ (`/de/hilfe`, `/en/help`)

Status: MVP-Seite (*bestätigt (Auftraggeber 2026-10-08)*; kein eigenes F-Feature – PM bitte nachtragen) · Zweck: WCAG 2.2 SC 3.2.6 „Konsistente Hilfe“, häufigste Supportfrage (Code im Spam) abfangen · Erreichbar: Footer und Avatar-Menü auf jeder Seite, Hinweis „Noch nichts da?“ im Code-Schritt (Flow A.2) · Öffentlich, indexierbar, `hreflang` de/en, statischer Inhalt.

## Mobil (360 px)

```
┌────────────────────────────────────┐
│ [Logo] Wir wollen weg   ⊕ English  │  Header wie öffentliche Seiten
├────────────────────────────────────┤
│  Hilfe                             │  h1
│  Kurze Antworten auf die häufigs-  │
│  ten Fragen.                       │
│                                    │
│  ▸ Mein Code kommt nicht an.       │  <details>/<summary>, je ≥ 44 px hoch
│  ▾ Ich habe den Einladungslink     │  aufgeklappt:
│    verloren.                       │
│    Frag im Gruppenchat nach dem    │
│    Link. Bist du schon Mitglied,   │
│    melde dich einfach an – deine   │
│    Reise steht unter „Meine        │
│    Reisen“.  [Anmelden]            │
│  ▸ Ich habe die Seite in WhatsApp  │
│    oder Instagram geöffnet.        │
│  ▸ Wie ändere ich meine Tage?      │
│  ▸ Wie stimme ich ab?              │
│  ▸ Wer sieht meine Angaben?        │
│  ▸ Wie lösche ich meine Daten?     │
│  ▸ Kein Zugriff mehr auf meine     │
│    E-Mail?                         │
│                                    │
│  Noch Fragen?                      │  h2
│  Schreib uns: <Kontaktadresse>     │  mailto-Link (Adresse: Operations)
├────────────────────────────────────┤
│ Hilfe · Datenschutz · Impressum    │  Footer, Sprach-Segment
│ ( Deutsch | English )              │
└────────────────────────────────────┘
```

## Inhalte (Kurzfassung, Copy-Ton ux-spec §10.1)
| Frage | Antwort (Kern) | Verweis |
|---|---|---|
| Mein Code kommt nicht an. | Spam/Werbung prüfen · Adresse prüfen · nach 30 s neu anfordern (nur der neueste Code gilt) · Absender `<Absenderadresse>` | Flow A.2 |
| Einladungslink verloren | Im Gruppenchat fragen; Mitglieder melden sich an → Meine Reisen | Flow A.3 |
| In WhatsApp/Instagram geöffnet | Funktioniert; Code im selben Fenster eingeben; später im Browser mit E-Mail anmelden | Flow A.4 |
| Tage ändern | Tab „Meine Tage“, Änderungen wirken sofort; nach Festlegung gesperrt | Flow B |
| Abstimmen | Tab „Abstimmen“, Ja/Vielleicht/Nein je Zeitraum, bis zum Ende änderbar | Flow D.2 |
| Wer sieht meine Angaben? | Nur Mitglieder der Reise; keine Gründe, nur freiwilliger Kommentar | F-008 |
| Daten löschen | Reise verlassen (löscht Tage/Stimmen dieser Reise) oder Konto löschen | Flows I.3, J |
| Kein Zugriff auf E-Mail | Kontakt schreiben; alternativ neues Konto + erneut beitreten | Flow H.4 |

## Verhalten
- Sprunganker je Frage (`/de/hilfe#code`), damit Hinweise aus der App direkt die passende Frage öffnen (Ziel-`<details>` per Anker aufgeklappt, Fokus auf `<summary>`).
- Desktop: einspaltig, max. 640 px (`--ww-size-content-narrow`).
- Keine Suche, kein Kontaktformular im MVP.
