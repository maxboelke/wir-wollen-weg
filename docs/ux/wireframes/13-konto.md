# W13 – Konto (`/account`, `/account/email`, `/account/password`, `/account/delete`)

Features: F-041, F-042, F-043, F-046, F-016 (Region), F-052 (Bewegung) · Flows: [I](../user-flows.md#i-konto-verwalten--löschen-f-043-f-042), [F](../user-flows.md#f-sprachumschaltung-f-046), [H.2](../user-flows.md#h2-abmelden)

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
│ Darstellung                        │  Karte, speichert sofort (Q17 a, F-052)
│ Bewegung reduzieren        [  ○ ]  │  role="switch", Standard aus
│ Weniger Animationen, kein Konfetti,│  Hilfetext (aria-describedby)
│ keine Vibration. Inhalte blenden   │
│ nur noch sanft ein.                │
│ Aus: Wir richten uns nach der Ein- │  Zustandszeile
│ stellung deines Geräts.            │
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
Einspaltig, max. 640 px; Abschnitte als Karten. Optional linke Unternavigation (Profil · Sprache & Region · Darstellung · Anmeldung · Datenschutz) ab 960 px.

## Karte „Darstellung“ – Schalter „Bewegung reduzieren“ (Q17 a, F-052)

Regeln und Texte: [ux-spec §7.5](../ux-spec.md). Reihenfolge: Profil · Sprache & Region · **Darstellung** · Anmeldung · Sitzungen · Daten & Datenschutz.

| Zustand | Schalter | Zeile unter dem Schalter (DE / EN) |
|---|---|---|
| Standard (Gerät normal) | aus, bedienbar | «Aus: Wir richten uns nach der Einstellung deines Geräts.» / «Off: we follow your device setting.» |
| eingeschaltet | an, bedienbar | – (Hilfetext genügt) |
| Gerät meldet „reduzieren“ | **an, nicht bedienbar** (`aria-disabled="true"`, Kontrast ≥ 3:1) | «Ist an, weil dein Gerät Bewegung reduziert. Ändern kannst du das in den Einstellungen deines Geräts.» / «On because your device reduces motion. You can change this in your device settings.» |

- Label «Bewegung reduzieren» / «Reduce motion»; Hilfetext «Weniger Animationen, kein Konfetti, keine Vibration. Inhalte blenden nur noch sanft ein.» / «Fewer animations, no confetti, no vibration. Content simply fades in.»; Kartentitel «Darstellung» / «Appearance».
- Umschalten wirkt **sofort** ohne Neuladen; Snackbar «Gespeichert» / «Saved»; Fokus bleibt auf dem Schalter. Gespeichert im Konto + `localStorage`.
- Leertaste/Enter schalten; Schalter-Daumen gleitet nur bei normaler Bewegung (G-12).
- Hilfe-Seite verlinkt hierher (W15 `#bewegung`).

**Dark Mode:** kein Schalter im MVP – die App folgt der Systemeinstellung (*bestätigt (Auftraggeber 2026-10-08)*). Kommt später einer, gehört er als „Farbschema: System · Hell · Dunkel“ in die Karte „Darstellung“.
