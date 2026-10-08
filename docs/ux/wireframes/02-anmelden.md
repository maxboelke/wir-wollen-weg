# W02 – Anmelden / Registrieren (`/login`, `/login/reset`)

Features: F-040, F-041, F-042, F-046 · Flow: [H](../user-flows.md#h-anmelden-abmelden-zugang-wiederherstellen-f-041-f-042), Code-Details [A.2](../user-flows.md#a2-fehlerfälle-code) · Regeln: [ux-spec §4.4, §5](../ux-spec.md)

Die Code-Komponente (Schritt 2) ist **identisch** im Einladungsflow (W03), bei Reise anlegen (W05), E-Mail ändern und Konto löschen (W13) – einmal bauen, überall nutzen.

## Schritt 1 – E-Mail (mobil)

```
┌────────────────────────────────────┐
│ [Logo]                  ⊕ English  │
├────────────────────────────────────┤
│  Anmelden oder registrieren        │  h1
│                                    │
│  Gib deine E-Mail ein. Wir         │
│  schicken dir einen Code – ein     │
│  Passwort brauchst du nicht.       │
│                                    │
│  E-Mail                            │
│  ┌──────────────────────────────┐  │  type=email, autocomplete=email
│  │ kemal@beispiel.de            │  │
│  └──────────────────────────────┘  │
│  ☑ Angemeldet bleiben              │  Standard an – bestätigt (Auftraggeber 2026-10-08)
│                                    │
│  ┌──────────────────────────────┐  │
│  │        Code senden           │  │  primär
│  └──────────────────────────────┘  │
│                                    │
│  Mit Passwort anmelden             │  Textlink → Variante 1b
│                                    │
│  Neu hier? Einfach E-Mail          │
│  eingeben – wir legen dein Konto   │
│  automatisch an.                   │
│                                    │
│  Mit dem Fortfahren akzeptierst du │  Kleintext
│  die Nutzungsbedingungen und hast  │
│  den Datenschutzhinweis gelesen.   │
└────────────────────────────────────┘
```

### Variante 1b – Passwort
```
│  E-Mail   [kemal@beispiel.de    ]  │
│  Passwort [••••••••••       (o) ]   │  autocomplete=current-password, Anzeigen-Schalter
│  Passwort vergessen?               │  → /login/reset
│  [        Anmelden             ]   │
│  Lieber mit Code anmelden          │  zurück zu 1
│  Kein Passwort gesetzt? Melde dich │
│  einfach mit einem Code an.        │
```
Fehler: «E-Mail oder Passwort stimmt nicht. Du kannst dich auch mit einem Code anmelden. [Code senden]»

## Schritt 2 – Code (mobil)

```
┌────────────────────────────────────┐
│ ← Zurück                ⊕ English  │  Zurück = Schritt 1, E-Mail bleibt
├────────────────────────────────────┤
│  Schau in dein Postfach            │  h1
│                                    │
│  Wir haben einen 6-stelligen Code  │
│  an kemal@beispiel.de geschickt.   │
│  Andere E-Mail?                    │  Textlink → Schritt 1
│                                    │
│  6-stelliger Code                  │
│  ┌──────────────────────────────┐  │  EIN Feld, inputmode=numeric,
│  [1][2][3]  [4][5][6]              │  autocomplete=one-time-code; 6 Kästchen
│                                    │  rein visuell (design-system §9.2), technisch 1 Feld
│  Gültig 15 Minuten                 │
│                                    │
│  [         Bestätigen          ]   │  Fallback, Auto-Submit bei 6 Ziffern
│                                    │
│  Keine Mail? Schau im Spam-Ordner. │
│  Neuen Code senden (in 0:27)       │  Textbutton mit Countdown
│                                    │
│  ℹ Tipp: Lass dieses Fenster offen │  nur bei erkanntem In-App-Browser
│  und komm mit dem Code zurück.     │
└────────────────────────────────────┘
```

**Fehlerzustand:**
```
│  ┌──────────────────────────────┐  │  roter Rahmen + Symbol
│  │  1  2  3  4  5  7            │  │  Inhalt markiert (schnell überschreiben)
│  └──────────────────────────────┘  │
│  ⚠ Dieser Code stimmt nicht.       │  aria-live
│    Noch 3 Versuche.                │
```

**Gesperrt / abgelaufen:**
```
│  ⚠ Zu viele Versuche. Wir schicken │
│    dir einen neuen Code.           │
│  [       Neuen Code senden      ]  │  wird zum Primärbutton
```

**Nach 60 s ohne Eingabe – Hilfe klappt auf:**
```
│  Noch nichts da?                   │
│  1. Spam/Werbung prüfen            │
│  2. Stimmt die Adresse?            │
│     kemal@beispiel.de  [Ändern]    │
│  3. [Neuen Code senden]            │
│  Weitere Hilfe                     │
```

## Schritt 3 – Profil (nur neues Konto)

```
┌────────────────────────────────────┐
│  Willkommen!                       │  h1
│  Wie sollen dich die anderen       │
│  nennen?                           │
│                                    │
│  Dein Name                         │  autocomplete=nickname
│  ┌──────────────────────────────┐  │
│  │ Kemal                        │  │
│  └──────────────────────────────┘  │
│  Sehen alle in deinen Reisen.      │
│                                    │
│  ▸ Passwort festlegen (optional)   │  eingeklappt (F-040)
│                                    │
│  [            Los geht's        ]  │  → next bzw. /trips
└────────────────────────────────────┘
```

## Passwort vergessen (`/login/reset`)

```
│  Passwort zurücksetzen             │
│  ℹ Du kannst dich auch ohne        │
│    Passwort mit Code anmelden.     │
│    [Mit Code anmelden]             │
│  E-Mail [kemal@beispiel.de      ]  │  vorbelegt
│  [        Code senden          ]   │
│  → Schritt Code (Komponente)       │
│  → Neues Passwort [          (o) ]  │  autocomplete=new-password, ≥ 10 Zeichen
│     Mindestens 10 Zeichen.         │
│  [     Passwort speichern      ]   │
```
Erfolg: Snackbar «Passwort geändert. Auf anderen Geräten wurdest du abgemeldet.» → /trips.

## Magic-Link-Landeseite (`/auth/magic?token=…&next=…`) – Flow [H.5](../user-flows.md)

Ziel des Links aus der Mail. Token wird erst beim Tippen per **POST** eingelöst (Schutz vor Mail-Scannern). Gleiche zentrierte Karte wie Schritt 1.

```
┌────────────────────────────────────┐
│ [Logo]                  ⊕ English  │
├────────────────────────────────────┤
│  Fast geschafft!                   │  h1
│  Tippe auf den Button, um dich in  │
│  diesem Browser anzumelden.        │
│  ┌──────────────────────────────┐  │  nur mit next=/i/{token}:
│  │ Du trittst „Lissabon 2027“   │  │  Reise-Hinweis (role=note)
│  │ bei.                         │  │
│  └──────────────────────────────┘  │
│  ⓘ Du bist gerade als Anna         │  nur wenn anderes Konto
│    angemeldet. …                   │  angemeldet (H.5 3d)
│                                    │
│  [        Jetzt anmelden        ]  │  <form method=post>, Primär,
│                                    │  autofocus nicht nötig
│  Lieber mit Code? Anmelden         │  Sekundärlink → /login?next=…
└────────────────────────────────────┘
```

Fehlerzustand nach dem POST (abgelaufen/benutzt/ungültig, gleiche URL; Muster W14, `error.svg`):
```
│  Dieser Anmeldelink funktioniert   │  h1, erhält Fokus
│  nicht mehr                        │
│  Er ist 15 Minuten gültig und      │
│  funktioniert nur einmal. Hol dir  │
│  einfach einen neuen Code.         │
│  [     Neuen Code anfordern     ]  │  → /login?next=… bzw. /i/{token},
│                                    │    E-Mail vorbelegt (falls bekannt)
```

| Element | DE | EN |
|---|---|---|
| Seitentitel | Anmelden · Wir wollen weg | Sign in · When do we go? |
| h1 | Fast geschafft! | Almost there! |
| Text | Tippe auf den Button, um dich in diesem Browser anzumelden. | Tap the button to sign in on this browser. |
| Reise-Hinweis | Du trittst „{Reise}“ bei. | You're joining "{trip}". |
| Anderes Konto | Du bist gerade als {Name} angemeldet. Mit diesem Link meldest du dich als jemand anderes an. | You're currently signed in as {name}. This link will sign you in as someone else. |
| Button | Jetzt anmelden | Sign in now |
| Button lädt | Einen Moment … | One moment … |
| Sekundärlink | Lieber mit Code? Anmelden | Prefer a code? Sign in |
| Fehler h1 | Dieser Anmeldelink funktioniert nicht mehr | This sign-in link no longer works |
| Fehler Text | Er ist 15 Minuten gültig und funktioniert nur einmal. Hol dir einfach einen neuen Code. | It's valid for 15 minutes and works only once. Just get a new code. |
| Fehler Button | Neuen Code anfordern | Get a new code |
| Netzwerkfehler | Das hat nicht geklappt. Bitte versuch es nochmal. | That didn't work. Please try again. |

A11y: Button ist echtes `<button type="submit">` in `<form method="post">` (funktioniert auch ohne JS); Ladezustand `aria-busy="true"` + `disabled`; Fehler per Fokus auf h1 angesagt.

## Desktop
Zentrierte Karte, max. 440 px breit, gleicher Inhalt; links daneben (≥ 960 px) optional dekorative Illustration (Designer). Kein anderes Verhalten.
