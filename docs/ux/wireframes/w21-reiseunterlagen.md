# W21 – Reiseunterlagen: Liste, hochladen, Sichtbarkeit, herunterladen

Stand: 2026-10-20 · UI/UX · Status: Entwurf (Ausbaustufe R, Inkrement 12; echte Dateien erst nach Gate **G1b**) · Feature **F-055**, Q31, Q32, Q36 · Routen `/trips/{id}/documents`, `/documents/upload`
Prototyp: [`#/docs`](../mockups/reise-managen/index.html), [`#/docs/upload`](../mockups/reise-managen/index.html) (echte Dateiauswahl wird nur lokal geprüft – nichts wird hochgeladen – oder „Beispieldatei verwenden“).

## Grundregeln
- **Alle Mitglieder** dürfen hochladen (Q32); je Unterlage sichtbar für **alle in der Reise** (Standard) oder **nur ausgewählte Personen** (persönliche Bordkarte). Hochladende und Orga können löschen.
- Dateitypen PDF, JPG, PNG, HEIC; max. 10 MB/Datei; 100 MB bzw. 50 Dateien pro Reise (Free). Virenscan vor Freigabe; Bilder ohne EXIF; keine öffentlichen URLs.
- Löschung automatisch **30 Tage nach Reiseende** (19. Juli 2027 im Beispiel).

## A. Liste
```
┌────────────────────────────────────┐
│▓(←) Kroatien 2027      [⇪ Hochladen]▓│
│▓    Unterlagen                    ▓│
╰▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╯
│ Als Nächstes                       │  h2 – Unterlagen mit Datum ≥ heute, nächste zuerst
│ ┌────────────────────────────────┐ │
│ │(✈) Flug München → Split (Hin…)›│ │  ganze Zeile = Button → Detail-Sheet
│ │    Sa., 12. Juni · PDF · 412 KB│ │
│ │    ⚇ Für alle                  │ │  Sichtbarkeit immer als Text + Icon
│ │(✈) Bordkarte Max (Hinflug)    ›│ │
│ │    Sa., 12. Juni · PNG · 1,2 MB│ │
│ │    🔒 Nur für dich und Lena     │ │
│ │(✈) Fähre Split → Stari Grad   ›│ │
│ │(✦) Bootstour Bucht von Hvar [neu]›│ Chip «neu» bis zum ersten Öffnen
│ │(✈) Flug Split → München (Rück…)›│ │
│ └────────────────────────────────┘ │
│ Erledigt / ohne Datum              │  h2
│ ┌────────────────────────────────┐ │
│ │(📄) Mietwagen Bestaetigung    ›│ │
│ │    ◌ Wird geprüft …            │ │  Virenscan läuft (Spinner + Text)
│ └────────────────────────────────┘ │
│ 3,1 von 100 MB        5 von 50 Dateien│
│ ⓘ Demo – bitte keine echten Tickets│
│   hochladen. Dateien sind nie      │
│   öffentlich; Download nur nach    │
│   Anmeldung.                       │
└────────────────────────────────────┘
```
- Unterlagen, die man nicht sehen darf, erscheinen nicht (Need-to-know; Orga-Variante siehe W16 UX-4).
- **Leer:** «Noch keine Unterlagen – Lade Tickets und Buchungsbestätigungen hoch – dann hat sie unterwegs jede:r griffbereit.» + Primär `[Unterlage hochladen]`.
- **Teilphase „Danach“:** Warnbanner (Amber) oben «Am Mo., 19. Juli werden alle Unterlagen gelöscht (30 Tage nach der Reise). Speichere, was du behalten willst.»; Kachel im Cockpit «Werden am 19. Juli gelöscht – jetzt sichern».
- **Unterwegs:** Kennzahl-Box im Cockpit zeigt die nächste Unterlage; `[Tickets]` springt hierher.

## B. Detail-Sheet
```
│ Flug München → Split (Hinflug) [×] │
│ (✈) Flug/Anreise · Sa., 12. Juni   │
│     PDF · 412 KB · hochgeladen von │
│     Lena                           │
│ ⚇ Für alle                         │
│ [ ⤓ Herunterladen               ] │  Primär
│ [ 👁 Ansehen                     ] │  öffnet im geschützten Viewer/neuen Tab
│ Wird am Mo., 19. Juli automatisch  │
│ gelöscht (30 Tage nach der Reise). │
│ 🗑 Unterlage löschen               │  nur Hochladende/Orga → Bestätigung
```
Löschen: «Unterlage löschen? Sie wird sofort für alle gelöscht – auch aus dem Speicher.» `[Abbrechen]` `[Löschen]`.
Download: kurzlebiger Link (≤ 60 s), `Content-Disposition: attachment`; auf iOS Hinweis «In Dateien sichern» über das System-Teilen-Menü. Echtes Offline-Caching erst mit PWA (F-038).

## C. Hochladen
```
│▓    Unterlage hochladen           ▓│
│ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ │
│ │        (⇪)                     │ │  ganze Fläche = Label der Dateiauswahl
│ │   Datei auswählen              │ │  (Kamera/Fotos/Dateien je nach Gerät)
│ │   PDF, JPG, PNG oder HEIC ·    │ │
│ │   bis 10 MB                    │ │  → nach Wahl: «Mietwagen_Bestaetigung.pdf · 225 KB»
│ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │
│ Titel                              │
│ [Mietwagen Bestaetigung          ] │  vorbelegt aus Dateiname
│ Art                                │
│ (✈ Flug/Anreise ✓)(▤ Unterkunft)   │
│ (✦ Aktivität)(📄 Sonstiges)         │
│ Datum (optional – sortiert „Als    │
│ Nächstes“)                         │
│ [TT.MM.JJJJ                      ] │  + optional Uhrzeit (W16 UX-5)
│ Wer darf sie sehen?                │
│ [ Alle in der Reise ][ Nur ausgewählte ]│
│ (LE Lena)(MA Ich ✓🔒)(KE Kemal) …   │  nur bei „ausgewählte“; ich selbst immer dabei
│ ⚠ Tickets enthalten oft Buchungs-  │
│   code + Nachname – damit kann man │
│   eine Buchung ändern. Teile       │
│   persönliche Tickets nur mit der  │
│   Person.                          │
├────────────────────────────────────┤
│ [ ⇪ Hochladen                    ] │
└────────────────────────────────────┘
```
| Fall | Meldung |
|---|---|
| Keine Datei | «Bitte wähle zuerst eine Datei.» |
| Falscher Typ (auch bei falscher Endung, Prüfung serverseitig über Inhalt) | «Diese Dateiart geht nicht. Erlaubt sind PDF, JPG, PNG und HEIC.» |
| Zu groß | «Die Datei ist 14,2 MB groß – erlaubt sind 10 MB.» |
| Kontingent voll | Taste `aria-disabled` + «Speicher dieser Reise ist voll (100 MB). Lösche alte Unterlagen.» |
| Virus gefunden | Unterlage verschwindet aus der Liste; Banner nur für Hochladende «„X“ wurde nicht gespeichert, weil die Prüfung ein Problem gefunden hat.» |
| Upload-Abbruch/Netz | Fortschrittsbalken + «Erneut versuchen»; Formular bleibt ausgefüllt. |
Ablauf nach `[Hochladen]`: Fortschritt in der Taste («Lädt hoch … 64 %»), dann zurück zur Liste mit Status «Wird geprüft …», Snackbar «Hochgeladen – wird kurz auf Viren geprüft.» und nach Abschluss «„Mietwagen Bestaetigung“ ist bereit.»

## Reise verlassen (F-055)
Dialog-Zusatz «Deine 3 Unterlagen für die Gruppe behalten oder löschen?» (Radio; Standard: löschen, wenn nur für einen selbst sichtbar).

## Barrierefreiheit
Dateiauswahl über echtes `<input type=file>` mit sichtbarem Label (Drop-Zone), Tastatur erreichbar; Status «Wird geprüft …» als Text (Spinner `aria-hidden`), Statuswechsel per Live-Region; Sichtbarkeit nie nur Icon; Detail-Sheet mit Fokusfalle, Esc, Zurück.

## Desktop
Liste 640 px; Drag & Drop zusätzlich auf die Drop-Zone (Zeigegeräte), Auswahl per Klick bleibt.
