# W04 – Meine Reisen (`/trips`)

Features: F-044, F-013 (Löschhinweis), F-017 (Frist) · Flow: [E](../user-flows.md#e-meine-reisen-f-044)

## Mobil (360 px) – mit Reisen

```
┌────────────────────────────────────┐
│ [Logo]                       (KM)  │  Avatar-Menü: Meine Reisen · Konto ·
├────────────────────────────────────┤  Sprache · Hilfe · Abmelden
│  Meine Reisen                      │  h1
│  [ + Neue Reise planen          ]  │  sekundär, volle Breite
│                                    │
│  Zu tun (2)                        │  h2
│  ┌──────────────────────────────┐  │
│  │ ● Deine Tage fehlen noch     │  │  To-do-Zeile hervorgehoben (Akzent)
│  │ Lissabon 2027                │  │  Titel = Link auf Reise (ganze Karte)
│  │ [Tage sammeln]  5/7 ▓▓▓▓▓░░  │  │  Phasen-Chip + Fortschritt
│  │ [   Tage eintragen   ]       │  │  separates Ziel → /days
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │ ● Alle haben abgegeben –     │  │  Orga-To-do
│  │   Abstimmung starten?        │  │
│  │ Skiurlaub      [Orga]        │  │
│  │ [Tage sammeln]  6/6 ▓▓▓▓▓▓▓  │  │
│  │ [ Abstimmung erstellen ]     │  │
│  └──────────────────────────────┘  │
│                                    │
│  Laufende Reisen                   │  h2
│  ┌──────────────────────────────┐  │
│  │ JGA Tim              [Orga]  │  │
│  │ [Steht fest: 5.–10. Mai]     │  │
│  │ in 23 Tagen                  │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │ Familientreffen Harz         │  │
│  │ [Abstimmung läuft] 4/9 ab-   │  │
│  │ gestimmt · noch 2 Tage       │  │
│  └──────────────────────────────┘  │
│                                    │
│  ▸ Vergangene Reisen (3)           │  eingeklappt (Disclosure-Button)
└────────────────────────────────────┘
```

Löschhinweis (F-013, nur Orga, 14 Tage vorher) als Banner **über** „Zu tun“:
```
│ ⓘ „Malle 2026“ wird am 20. Jan.    │
│   automatisch gelöscht (90 Tage    │
│   nach Reiseende). Mehr erfahren   │
```

## Mobil – Leerzustand

```
┌────────────────────────────────────┐
│ [Logo]                       (KM)  │
├────────────────────────────────────┤
│  Meine Reisen                      │
│                                    │
│      [ Illustration: Koffer /      │  Designer (Leerzustand 1)
│        Kalender mit Fragezeichen ] │
│                                    │
│  Noch keine Reise geplant          │  h2
│  Leg eine an und schick den Link   │
│  in euren Gruppenchat – oder öffne │
│  den Einladungslink, den du        │
│  bekommen hast.                    │
│                                    │
│  [     Neue Reise planen        ]  │  primär
└────────────────────────────────────┘
```
Variante mit offenem Beitritt (Flow A.5): Karte oben «Du wolltest „Lissabon 2027“ beitreten. [Jetzt beitreten]».

## Desktop (≥ 768 px)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [Logo] Wir wollen weg                                            (KM) ▾ │
├─────────────────────────────────────────────────────────────────────────┤
│ Meine Reisen                                      [ + Neue Reise planen ] │
│ Zu tun                                                                    │
│ ┌──────────────────────────────┐ ┌──────────────────────────────┐         │
│ │ ● Deine Tage fehlen noch     │ │ ● Abstimmung starten?        │         │
│ │ Lissabon 2027                │ │ Skiurlaub [Orga]             │         │
│ │ Tage sammeln · 5/7           │ │ Tage sammeln · 6/6           │         │
│ │ [Tage eintragen]             │ │ [Abstimmung erstellen]       │         │
│ └──────────────────────────────┘ └──────────────────────────────┘         │
│ Laufende Reisen                                                           │
│ ┌──────────────────────────────┐ ┌──────────────────────────────┐         │
│ │ JGA Tim … Steht fest …       │ │ Familientreffen … läuft …    │         │
│ └──────────────────────────────┘ └──────────────────────────────┘         │
│ ▸ Vergangene Reisen (3)                                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

## Regeln
- Sortierung: Zu tun → laufend nach nächstem Ereignis (Frist, Reisebeginn, letzte Aktivität) → vergangen (eingeklappt).
- Rollenabzeichen nur „Orga“ (eigene Rolle). Phasen-Chip immer mit Text.
- Ein Fokusziel pro Karte (Titel-Link) + To-do-Button.
- Laden: 3 Skelett-Karten.
