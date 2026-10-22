# W07 – Reise: Tab „Übersicht“ (`/trips/{id}`)

Features: F-007, F-004, F-012 (Ergebnis-Karte), F-015, F-017, F-001 (Kopfdaten) · Stand: 2026-10-20 (Feedback-Runde 1) · Flows: [J](../user-flows.md#j-reise-verlassen--mitglied-entfernen--rolle-übergeben--reise-löschen-f-004-f-013), [K](../user-flows.md#k-nachzügler-erinnern-f-015)

Diese Datei zeigt auch den **Reise-Rahmen** (Header + Tabs), der für W08–W11 gilt.

## Reise-Rahmen (mobil)

```
┌────────────────────────────────────┐
│ [Logo]                       (KM)  │  globaler Header (kann beim Scrollen
├────────────────────────────────────┤  nach unten ausblenden, s. ux-spec §2)
│ ←  Lissabon 2027               ⋯   │  sticky; ← = Meine Reisen; ⋯ = Reisemenü
│ Übersicht│Meine Tage│Gruppe│Abstimmen│  sticky Tabs (Links, aria-current)
└────────────────────────────────────┘
```
Reisemenü „⋯“ (Bottom-Sheet): Freunde einladen · Mein Name in dieser Reise · *(Orga:)* Reise bearbeiten · Gruppe erinnern · Festlegung aufheben · Reise löschen · Reise verlassen · Hilfe.

## Reise-Rahmen Richtung B „Cockpit“ (Q18) – maßgeblich ab Look & Feel 2.0

Ersetzt den Rahmen oben (kein globaler Header in Reisen). Regeln: [ux-spec §3, §4.10](../ux-spec.md), Entscheidungen [abstimmung-design §8.1](../abstimmung-design.md).

```
┌────────────────────────────────────┐
│▓(←)  Lissabon 2027             (⋯)▓│  48 px · sticky · runde Icon-Tasten 44 px
│▓     ● Tage sammeln · 5/7 fertig  ▓│  Phasenzeile (Text trägt die Phase, Punkt = Zusatz;
│▓(Übersicht)(Meine Tage)(Gruppe)(Ab│  sr-only „5 von 7 fertig“) · Tab-Pillen ≥ 44 px, Spur 48 px,
│▓                                  ▓│  < 375 px scrollbar mit Verlaufskante · sticky
│▓ ┌──────────────────────────────┐ ▓│  ── ab hier NICHT sticky, scrollt mit ──
│▓ │ (◔) 5 von 7 haben abgegeben  │ ▓│  höchstens EINE Kennzahl je Tab (Tabelle unten)
│▓ │     Noch offen: Kemal, Sara  │ ▓│
│▓ │                  [Erinnern]  │ ▓│  nur Orga
│▓ └──────────────────────────────┘ ▓│
╰▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╯  Unterkante gerundet
```

| Tab | Kennzahl unter den Tabs (scrollt mit) |
|---|---|
| Übersicht | Phase 1: Ring + «5 von 7 haben abgegeben» (+ Orga `[Erinnern]`) · Phase 2: Ring + «4 von 7 haben abgestimmt» + Frist · Phase 3: Vorfreude-Ring + Countdown (W11) |
| Meine Tage | keine |
| Gruppe | Kennzahl-Box (W09) |
| Abstimmen | keine (Kennzahl-Kacheln im Inhalt, W10) |

- Phasenzeile: «Tage sammeln · 5/7 fertig» · «Abstimmung läuft · 4/7 fertig» · «Steht fest · 7 dabei» (EN «Collecting dates · 5/7 done» · «Voting open · 4/7 done» · «It's on · 7 going»).
- Die „Nächster Schritt“-Karte (unten) bleibt im Inhalt; ihr Fortschrittsbalken entfällt, wenn der Ring im Kopf dieselbe Zahl zeigt (keine Doppelung) – Text und Aktion bleiben.
- Reisemenü „⋯“ zusätzlich mit «Hilfe» als letztem Eintrag (sitemap §5).
- **Ab 2026-10-20 (ux-spec §14):** Kennzahl-Box in Phase 1/2 = Button → Sheet „Wer hat eingetragen?/abgestimmt?“; `[Erinnern]` steht nicht mehr in der Box. «Gruppe erinnern» im Reisemenü für **alle** Mitglieder (Phase 1/2). In Phase 3 **keine Tab-Leiste**.
- Querformat < 480 px Höhe: kompakter Kopf blendet beim Scrollen nach unten aus.

## Feedback-Runde 1 (2026-10-20) – maßgeblich

Regeln und alle Texte DE/EN: [ux-spec §14](../ux-spec.md). Dieser Abschnitt geht den Skizzen weiter unten vor (Nächster-Schritt-Varianten, Liste „Wer ist dabei?“, Phase 3).

### Phase 1, Sicht Mitglied – alle haben eingetragen (N1-9)
```
┌────────────────────────────────────┐
│▓(←)  Lissabon 2027             (⋯)▓│
│▓     ● Tage sammeln · 9/9 fertig  ▓│
│▓(Übersicht)(Meine Tage)(Gruppe)(Ab│
│▓ ┌──────────────────────────────┐ ▓│  alle fertig → Box ist KEIN Button
│▓ │ (●) 9 von 9 haben eingetragen│ ▓│
│▓ │     Alle haben eingetragen.  │ ▓│
│▓ └──────────────────────────────┘ ▓│
╰▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╯
│ ┌────────────────────────────────┐ │
│ │ Nächster Schritt               │ │  h2
│ │ Alle haben ihre Tage einge-    │ │
│ │ tragen. Jetzt ist Lena dran    │ │  „Wer ist dran?“ immer mit Namen
│ │ und startet die Abstimmung.    │ │
│ │ [ Vorschläge ansehen ]         │ │  sekundär (keine Primäraktion für Wartende)
│ │ Lena Bescheid geben            │ │  Text-Taste → Erinnern-Sheet Schritt „orga“
│ └────────────────────────────────┘ │
```

### Phase 1, Sicht Mitglied – ich fertig, andere offen (N1-12)
```
│▓ ┌──────────────────────────────┐ ▓│  Box = Button (ganze Fläche) → Sheet „Wer hat eingetragen?“
│▓ │ (◔) 5 von 9 haben eingetragen│ ▓│
│▓ │     Noch offen: Kemal, Sara, │ ▓│
│▓ │     Mia und Tom            › │ ▓│  Chevron; keine Minze-Taste mehr in der Box
│▓ └──────────────────────────────┘ ▓│
│ ┌────────────────────────────────┐ │
│ │ Nächster Schritt               │ │
│ │ Danke, deine Tage sind drin!   │ │
│ │ Sobald alle eingetragen haben, │ │
│ │ startet Lena die Abstimmung.   │ │
│ │ [ Erinnern ] [Vorschläge ans.] │ │  beide sekundär; Erinnern → Sheet „status“
│ └────────────────────────────────┘ │  (bei genau 1 offener Person direkt „single“)
```

### Liste „Wer ist dabei?“ in Phase 1/2 – gruppiert
```
│  Wer ist dabei? (7 + 2 Platzhalter)│  h2
│  ┌──────────────────────────────┐  │
│  │ Fehlt noch (4)               │  │  h3 – immer vollständig
│  │ (┄KE┄) Kemal       [Erinnern][⋯]│ ⋯ nur Orga
│  │   ◷ noch nicht eingetragen   │  │
│  │ (┄SA┄) Sara        [Erinnern][⋯]│
│  │   ◷ noch nicht eingetragen   │  │
│  │ (┄MI┄) Mia         [Erinnern]│  │  Platzhalter: Orga → persönlicher Link;
│  │   ◷ noch nicht beigetreten   │  │  Mitglied → Schritt „orga“ (Lena Bescheid geben)
│  │ (┄TO┄) Tom         [Erinnern]│  │
│  │   ◷ noch nicht beigetreten   │  │
│  │ ──────────────────────────── │  │
│  │ Eingetragen (5)              │  │  h3
│  │ (LE)✓ Lena [Orga]            │  │  Minze-Siegel am Avatar + Text
│  │   ✓ eingetragen · 12. Mai    │  │
│  │ (JO)✓ Jonas                  │  │
│  │   ✓ eingetragen · 10. Mai    │  │
│  │ (TI)✓ Tim „Juli nur mit Kids“│  │  Kommentar wie bisher
│  │ …  Alle 5 anzeigen           │  │  „Eingetragen“ klappt ab 6 auf 5 ein
│  └──────────────────────────────┘  │
│  Platzhalter verwalten             │  nur Orga, solange Platzhalter offen (A4)
│  [ + Freunde einladen ]            │
```
- Eigene Zeile steht in „Fehlt noch“ zuletzt: «Kai (du)» mit [Tage eintragen] statt [Erinnern].
- Phase 2: Gruppen «Fehlt noch» / «Abgestimmt», nur Mitglieder. Die Platzhalter stehen darunter separat wie bisher («noch nicht beigetreten»).
- Phase 3 / Vergangen: einfache Liste ohne Status (unverändert).

### Phase 3 – Reise-Hub ohne Tabs (ux-spec §14.4)
```
┌────────────────────────────────────┐
│▓(←)  Lissabon 2027             (⋯)▓│  nur Zeile 1 – KEINE Tab-Leiste
│▓     ● Steht fest · 7 dabei       ▓│
│▓          ╭──────────╮            ▓│  Vorfreude-Ring (scrollt mit), Feier wie W11
│▓          │ noch 23  │            ▓│
│▓          │   Tage   │            ▓│
│▓          ╰──────────╯            ▓│
│ ┌────────────────────────────────┐ │
│ │ ✓ Termin steht fest            │ │  Ergebnis-Karte (W11) inkl.
│ │ Es geht los!                   │ │  Drei-Schritte-Fortschritt
│ │ Mi., 5. Mai – Mo., 10. Mai 2027│ │
│ │ ☾ 5 Nächte · ⚇ 7 dabei · noch  │ │
│ │ 23 Tage                        │ │
│ │ [ Zum Kalender hinzufügen ▾ ]  │ │
│ │ [ Allen Bescheid geben       ] │ │
│ │ (✓ Tage)(✓ Abstimmen)(☀ Fix)   │ │
│ └────────────────────────────────┘ │
│ „Sonne, Pastéis, Surfen …“         │  Beschreibung (falls vorhanden)
│                                    │
│ Als Nächstes                       │  h2 – ANDOCKFLÄCHE: im MVP leer → gar nicht
│ ┌────────────────────────────────┐ │  gerendert. Später z. B.:
│ │[▦] Unterkünfte              ›  │ │  «3 von 7 haben bewertet» (To-do-Kante, wenn
│ │    3 von 7 haben bewertet      │ │  ich dran bin)
│ └────────────────────────────────┘ │
│ ┌────────────────────────────────┐ │
│ │[€] Kosten teilen            ›  │ │
│ └────────────────────────────────┘ │
│                                    │
│ So habt ihr entschieden            │  h2
│ ┌───────────────┐ ┌──────────────┐ │  nebeneinander ab Container ≥ 21,5 em,
│ │[✓] Abstim-    │ │[Kal] Kalender│ │  sonst untereinander
│ │ mungsergebnis›│ │ der Gruppe  ›│ │  → /poll (Unterseite)  → /group?view=calendar
│ │ 7 von 7 haben │ │ Wer wann     │ │
│ │ abgestimmt    │ │ konnte       │ │
│ └───────────────┘ └──────────────┘ │
│ Gesucht wurde: 1. Mai – 30. Juni   │  13 px text-muted
│ 2027 · 4–5 Nächte                  │
│                                    │
│ Wer ist dabei? (7)                 │  Liste ohne Status
│ …                                  │
│ [ + Freunde einladen ]             │
└────────────────────────────────────┘
```
- Desktop: links Ergebnis-Karte, Als Nächstes, So habt ihr entschieden; rechts „Wer ist dabei?“.
- Festlegung aufheben → Tabs kommen zurück, Fokus auf h1, Snackbar «Termin aufgehoben – die Abstimmung läuft wieder.» (ux-spec §14.4).

## Phase 1 „Tage sammeln“ (mobil, Sicht Orga)

_Ältere Skizze – Nächster-Schritt-Texte, Liste und Phase 3: ersetzt durch den Abschnitt „Feedback-Runde 1“ oben._

```
│  Lissabon 2027                     │  h1 (voller Name)
│  1. Mai – 30. Juni 2027 · 4–5 N.   │
│  „Sonne, Pastéis, Surfen …“        │
│                                    │
│  ① Tage sammeln ─ ② Abstimmen ─ ③ Fix │  Phasen-Leiste (Text + Nummer, aktiv hervorgehoben)
│                                    │
│  ┌──────────────────────────────┐  │  „Nächster Schritt“-Karte (kontextabhängig)
│  │ Nächster Schritt             │  │
│  │ 5 von 7 haben ihre Tage      │  │
│  │ eingetragen.                 │  │
│  │ ▓▓▓▓▓▓▓▓▓▓░░░░               │  │  <progress>
│  │ Noch offen: Kemal, Sara      │  │
│  │ Frist: Fr., 14. Mai (in 3 T.)│  │  F-017, falls gesetzt
│  │ [ Erinnern ]  [Vorschläge]   │  │  Orga: Erinnern; Mitglied: nur Vorschläge
│  └──────────────────────────────┘  │
│                                    │
│  Wer ist dabei? (7 + 1 Platzhalter)│  h2
│  ┌──────────────────────────────┐  │
│  │ (LE) Lena  [Orga]  ✓ abgegeben│ │  Status mit Symbol + Text
│  │ (JO) Jonas         ✓ abgegeben│ │
│  │ (KE) Kemal         ○ noch offen│ │
│  │ (SA) Sara          ○ noch offen│ │
│  │ (TI) Tim  „Juli nur mit Kids“ │  │  Kommentar (gekürzt, tippbar)
│  │      ✓ abgegeben              │  │
│  │ ( ?) Mia (Platzhalter) fehlt  │  │  F-007
│  │      noch                     │  │
│  │ … Alle 8 anzeigen             │  │  ab 6 Einträgen einklappen
│  └──────────────────────────────┘  │
│  Orga: je Zeile [⋯] → Entfernen, Orga übergeben
│                                    │
│  [ + Freunde einladen ]            │  → /invite
```

Nächster-Schritt-Karte – Varianten (**veraltet** – vollständige Matrix N1-1 … N2-12 mit DE/EN-Texten: [ux-spec §14.1](../ux-spec.md)):

| Situation | Inhalt | Aktion |
|---|---|---|
| eigene Tage fehlen | «Trag deine Tage ein – dauert 2 Minuten.» | `[Tage eintragen]` |
| Orga, alle abgegeben | «Alle haben abgegeben! Zeit für die Abstimmung.» | `[Abstimmung erstellen]` |
| Mitglied, abgegeben, Phase 1 | «Danke! Jetzt warten wir auf Kemal und Sara.» | `[Vorschläge ansehen]` |
| Phase 2, eigene Stimme fehlt | «Die Abstimmung läuft – stimm ab.» | `[Abstimmen]` |
| Phase 2, Orga | «4 von 7 haben abgestimmt.» + Frist | `[Erinnern]` `[Termin festlegen]` |
| Phase 3 | Ergebnis-Karte (s. W11) | `[Zum Kalender hinzufügen]` `[Allen Bescheid geben]` |

## Desktop (≥ 960 px)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [Logo]                                                           (KM) ▾ │
├─────────────────────────────────────────────────────────────────────────┤
│ ← Meine Reisen   Lissabon 2027                                     ⋯    │
│ Übersicht   Meine Tage   Gruppe   Abstimmen                              │
├───────────────────────────────────────────────┬─────────────────────────┤
│ Lissabon 2027                                 │ Wer ist dabei? (7 + 1)  │
│ 1. Mai – 30. Juni 2027 · 4–5 Nächte           │ Lena [Orga] ✓           │
│ ① Tage sammeln ─ ② Abstimmen ─ ③ Fix          │ Jonas ✓                 │
│ ┌───────────────────────────────────────────┐ │ Kemal ○ noch offen      │
│ │ Nächster Schritt: 5 von 7 …  [Erinnern]   │ │ …                       │
│ └───────────────────────────────────────────┘ │ [+ Freunde einladen]    │
└───────────────────────────────────────────────┴─────────────────────────┘
```
