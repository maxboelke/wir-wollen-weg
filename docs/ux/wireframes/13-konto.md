# W13 – Konto (`/account`, `/account/email`, `/account/password`, `/account/delete`)

Features: F-041, F-042, F-043, F-046, F-016 (Region) · Flows: [I](../user-flows.md#i-konto-verwalten--löschen-f-043-f-042), [F](../user-flows.md#f-sprachumschaltung-f-046), [H.2](../user-flows.md#h2-abmelden)

## Kontoeinstellungen (mobil)

```
┌────────────────────────────────────┐
│ [Logo]                       (KM)  │
├────────────────────────────────────┤
│ Konto                              │  h1
│                                    │
│ Profil                             │  Karte
│ Dein Name  [Kemal              ]   │
│ Gilt in allen Reisen (außer dort,  │
│ wo du einen eigenen Namen hast).   │
│ [Speichern]                        │
│                                    │
│ Sprache & Region                   │  Karte, speichert sofort
│ Sprache   (•) Deutsch ( ) English  │
│ Land      [Deutschland        ▾]   │
│ Bundesland [Bayern            ▾]   │  nur DE/AT/CH/UK
│ Woche beginnt am                   │
│  (•) Automatisch (Montag)          │
│  ( ) Montag  ( ) Sonntag           │
│ Vorschau: Fr., 3. Juli 2027        │
│                                    │
│ Anmeldung                          │
│ E-Mail  kemal@beispiel.de [Ändern] │
│ Passwort  Nicht gesetzt – du mel-  │
│ dest dich mit Code an.             │
│ [Passwort festlegen]               │
│                                    │
│ Sitzungen                          │
│ [Auf allen Geräten abmelden]       │
│                                    │
│ Daten & Datenschutz                │
│ Datenschutzerklärung               │
│ Deine Daten anfordern: schreib an  │
│ datenschutz@…                      │
│ Konto löschen                      │  Textbutton Warnfarbe → /account/delete
│                                    │
│ [Abmelden]                         │
└────────────────────────────────────┘
```

## E-Mail ändern (`/account/email`)
```
│ E-Mail ändern                      │
│ Schritt 1: Bestätige, dass du es   │
│ bist – Code an kemal@beispiel.de   │  (oder Passwort)
│ [Code-Komponente W02]              │
│ Schritt 2: Neue E-Mail [        ]  │
│ [Code an neue Adresse senden]      │
│ Schritt 3: [Code-Komponente]       │
│ ✓ Deine E-Mail ist jetzt …. Wir    │
│   haben deine alte Adresse infor-  │
│   miert.                           │
```

## Passwort (`/account/password`)
Setzen/Ändern: «Neues Passwort» (`new-password`, Anzeigen-Schalter, ≥ 10 Zeichen, Leak-Hinweis) → `[Speichern]`. Entfernen: Dialog «Passwort entfernen? Du meldest dich dann nur noch mit Code an.» `[Passwort entfernen]`.

## Konto löschen (`/account/delete`)

```
┌────────────────────────────────────┐
│ ← Konto        Konto löschen       │
├────────────────────────────────────┤
│ Was wird gelöscht?                 │
│ Dein Name, deine E-Mail, deine     │
│ Tage und Stimmen in allen Reisen.  │
│ Das kann nicht rückgängig gemacht  │
│ werden.                            │
│                                    │
│ Du organisierst diese Reisen:      │  nur wenn zutreffend
│ ┌────────────────────────────────┐ │
│ │ Lissabon 2027 (7 Mitglieder)   │ │
│ │ (•) Orga übergeben an [Sara ▾] │ │  Vorbelegung: am längsten dabei
│ │ ( ) Reise für alle löschen     │ │
│ └────────────────────────────────┘ │
│ Diese Reisen werden mitgelöscht    │
│ (nur du bist Mitglied): Test-Reise │
│                                    │
│ Bestätige, dass du es bist         │
│ [Code senden] → [Code-Komponente]  │
│                                    │
│ [      Konto endgültig löschen   ] │  destruktiv, aktiv nach Re-Auth
└────────────────────────────────────┘
```
→ letzter Dialog «Konto endgültig löschen?» → `/goodbye` (W14).

## Desktop
Einspaltig, max. 640 px; Abschnitte als Karten. Optional linke Unternavigation (Profil · Sprache & Region · Anmeldung · Datenschutz) ab 1024 px.
