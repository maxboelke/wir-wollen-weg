# W23 – Geschlossene Freundes-Beta „Stufe B“ & App-Installation (PWA auf dem iPhone)

Stand: 2026-10-23 · Verantwortlich: UI/UX · Status: **baureif (Konzept)**, Designer-Punkte D-72 – D-80 offen (nicht blockierend, außer D-72/D-73) · Gate: G0
Bezug: [W01 Landing](01-landing.md), [W02 Anmelden](02-anmelden.md), [W03 Einladung](03-einladung.md), [W04 Meine Reisen](04-meine-reisen.md), [W14 System](14-system-und-fehler.md), [W15 Hilfe](15-hilfe.md), [W20 H.1](w20-reisedaten.md) (Reisedaten aus), [user-flows A.4](../user-flows.md) (In-App-Browser), [ux-spec §2, §3, §11, §15](../ux-spec.md), [sitemap §3, §5](../sitemap.md), [abstimmung-design §17](../abstimmung-design.md)

**CEO-Vorgaben (entschieden):** Beta-Code bei der Registrierung statt Basic Auth · Anmeldung per 6-stelligem Code (Magic Link öffnet auf iOS Safari statt der App → in der App den Code-Weg in den Vordergrund) · kurzer Datenschutzhinweis mit Zustimmung · kein Demo-Postfach · Reisedaten (F-054) aus. Zielgerät: **iPhone, App als Web-App vom Home-Bildschirm**; Android/Desktop müssen funktionieren, sind aber nicht Abnahmeziel.

**Geltungsbereich:** Alles in diesem Dokument gilt nur im **Beta-Modus** (Schalter, Name legen Operations/Developer fest, im Folgenden „Beta-Modus“), außer den mit **[immer]** markierten PWA-Regeln (Teil C) – die sind auch ohne Beta richtig und bleiben nach der Beta.

---

## 0. Kurzüberblick & UX-Empfehlungen

| Nr. | Frage | Empfehlung UX | Begründung |
|---|---|---|---|
| **B-E1** | Wo wird der Beta-Code abgefragt? | Eigene Einstiegsseite **`/beta`** (Beta-Code → Datenschutz-Zustimmung → E-Mail → Code → Name). Der Code wird **vor** der E-Mail geprüft. Bestehende Konten melden sich ganz normal über `/login` an – **kein** Beta-Code beim Login. | Tester wissen sofort, ob ihr Code stimmt; die Anmeldung bleibt der bekannte W02-Ablauf; kein Raten, ob eine E-Mail schon ein Konto hat (keine Konto-Aufzählung). |
| **B-E2** | Beta-Code auch beim Weg über einen **Reise-Einladungslink**? | **Nein – eine gültige Einladung ersetzt den Beta-Code.** Wer über `/i/{token}` kommt, registriert sich ohne Beta-Code; nur die Datenschutz-Zustimmung kommt dazu (im Schritt „Name“). | Der Kernablauf der App ist „Link in die Gruppe, alle machen mit“ (PRD §4). Ein zweiter Code, den nur der Auftraggeber kennt, würde genau die Freunde der Tester abschrecken. Wer einen Einladungslink hat, wurde von einem Beta-Mitglied eingeladen – das *ist* die geschlossene Freundesgruppe. Missbrauch begrenzt: Einladung ist widerrufbar bzw. neu erzeugbar (F-004), Konto-Anlage zählt nur zusammen mit dem Beitritt, ein Gesamtlimit der Beta-Konten (Ops-Entwurf `BETA_MAX_ACCOUNTS`) gilt auch hier, und Fremde sehen nur die eine Reise. **Alternative (streng)** für den Fall, dass der CEO/Auftraggeber anders entscheidet: s. A.8 „Variante streng“. |
| **B-E3** | Reihenfolge Registrierung ↔ Installation | **Erst registrieren (im Browser), dann installieren.** Danach in der App **einmal mit Code anmelden** – und das offen ankündigen. | Auf dem iPhone hat die Web-App einen **eigenen Speicher**; ob die Anmeldung aus Safari mitgenommen wird, ist je iOS-Version unterschiedlich (nicht verlässlich dokumentiert). Wir planen für den schlechteren Fall und freuen uns, wenn es den Schritt nicht braucht. Erst-installieren wäre ein Hürde vor dem ersten Nutzen und würde den Beta-Code im getrennten Speicher wieder verlieren. Auf Android (Chrome) teilt die App die Anmeldung – kein zweiter Login. |
| **B-E4** | Install-Hinweis – wann? | **Einmal** als eigener Schritt direkt nach der ersten Registrierung bzw. dem ersten Beitritt (überspringbar „Später“). Danach nie wieder automatisch – dauerhaft erreichbar über Avatar-Menü/Reisemenü „App installieren“ und Hilfe. In der installierten App: nirgends. | „Nicht nervig“ (CEO). Der Moment direkt nach der Anmeldung ist der einzige, an dem die Person ohnehin „einrichtet“. |
| **B-E5** | Magic Link | Mail enthält in der Beta **zuerst den Code**, der Link steht als zweite Möglichkeit „im Browser“. In der App (standalone) steht auf Schritt Code ein Hinweis, dass der Link Safari öffnet. Die Magic-Link-Landeseite in Safari erkennt „Anforderung kam aus der App“ und rät zum Code. | Ein Tipp auf den Link meldet in Safari an, nicht in der App – klassische Sackgasse („Ich hab doch geklickt!“). |
| **B-E6** | Einladungslinks / Mail-Links bei installierter App | In der App unter „Meine Reisen“: **„Einladungslink einfügen“** (nur in der installierten App sichtbar). | Die iPhone-Web-App hat keine Adresszeile; Links aus WhatsApp/Mail öffnen immer Safari. Ohne diesen Weg kommt man mit einem neuen Einladungslink nicht in die App. |
| **B-E7** | Pull-to-refresh | **Nicht bauen.** Stattdessen Daten automatisch auffrischen, wenn die App wieder in den Vordergrund kommt (C.7). | Kollidiert mit Tage-Malen (W08) und Swipen (W18); iOS-Web-Apps haben keins, ein selbst gebautes fühlt sich fremd an. |
| **B-E8** | Beta-Kennzeichnung & Feedback | Kleines Etikett „Beta“ neben der Wortmarke/im Cockpit-Kopf-Menü; Eintrag **„Feedback geben“** im Avatar-Menü, Reisemenü und in der Hilfe → **WhatsApp an den Auftraggeber** mit vorausgefülltem Text (ohne Reisedaten), Ausweich-Weg E-Mail. | Freunde nutzen WhatsApp ohnehin; Screenshots lassen sich dort direkt anhängen; kein Formular, kein Backend. |

### 0.1 Abgleich mit `docs/ops/beta-anleitung.md` (Operations, Entwurf vom selben Tag)

Die Ops-Anleitung beschreibt denselben Ablauf mit anderen Annahmen. Damit Entwickler und Auftraggeber ein Bild haben, gilt für **Oberfläche und Texte W23**; Operations gleicht die Anleitung an (über den CEO):

| Punkt | Ops-Entwurf | W23 | Auflösung |
|---|---|---|---|
| Ort der Beta-Code-Eingabe | `/login` → „Zum ersten Mal hier?“ → E-Mail + Beta-Code + Häkchen → „Code senden“ | eigene Seite `/beta` (Code → Zustimmung → E-Mail) | **Kompatibel:** Der Link „Zum ersten Mal hier?“ / „First time here?“ auf `/login` Schritt E-Mail führt nach `/beta` (W23 A.5). Die Ops-Schrittfolge „Anmelden → Zum ersten Mal hier?“ bleibt damit richtig. |
| Falscher Beta-Code | keine Mail, „Meldung trotzdem dieselbe“ | **sofortige, klare Meldung am Feld** (A.10) | W23. Ein Beta-Code verrät nichts über Konten; ein stilles Scheitern lässt Tester ratlos („Mail kommt nicht“) und erzeugt Support. Schutz: Rate-Limit. |
| Einladungslink | „jede neue Person braucht beim ersten Mal den Beta-Code (Entscheidungsstand 2026-10-23)“ | Empfehlung B-E2: Einladung ersetzt Beta-Code | **CEO entscheidet.** Bleibt es beim Beta-Code-Zwang, gilt A.8 „Variante streng“ (vollständig spezifiziert). |
| Anmeldung in der App nach Installation | „iOS übernimmt beim Hinzufügen die Anmeldung aus Safari“ | nicht verlässlich → App zeigt bei Bedarf A.7 | Gerätetest G-2 entscheidet; W23 funktioniert in beiden Fällen. Ops-Satz bitte als „meist“ formulieren. |
| Einladung in der App | „in der App den Einladungscode eingeben, falls die Einladung einen anzeigt“ | „Einladungslink einfügen“ (C.8) | W23 – einen Einladungscode gibt es nicht. |
| WhatsApp-Vorlage | Adresse `https://app.<domain>` + Code separat | Link direkt auf `/beta` (A.1) | Beides funktioniert; `/beta` spart den Umweg über „Anmelden“. |

---

## A. Ablauf Erstkontakt

### A.0 Übersicht (Flow)

```
WhatsApp vom Auftraggeber (Link + Beta-Code)
        │  Tipp auf Link
        ▼
 ┌─ öffnet sich in … ───────────────────────────────────────────────┐
 │ Safari / Chrome            WhatsApp-Vorschau (iOS) / In-App-Browser │
 │      │                        │  B.4: „In Safari öffnen“ (Hinweis,   │
 │      │                        │       kein Zwang – Registrierung      │
 │      │                        │       klappt auch hier)               │
 └──────┼────────────────────────┼──────────────────────────────────┘
        ▼                        ▼
  /beta  Schritt 1 „Beta-Code“  ── falsch → Fehlermeldung am Feld (A.10)
        │ gültig
        ▼
  /beta  Schritt 2 „Kurz zum Datenschutz“ + Zustimmung (Pflicht)
        ▼
  /login Schritt E-Mail → Code (Mail) → Name   (W02, Beta-Abweichungen A.5)
        │                     └─ E-Mail hat schon ein Konto → normal angemeldet, kein Name-Schritt
        ▼
  /install  „Hol dir die App auf den Home-Bildschirm“ (einmalig, B)
        │ [Später] oder „Fertig, ist drauf“
        ▼
  /trips  Meine Reisen (Leerzustand W04: „Reise planen“)

  … Tester öffnet das neue App-Symbol (iPhone):
  App-Start → keine Anmeldung im App-Speicher? → /login im App-Modus (A.7)
           → E-Mail → Code → /trips   (kein Beta-Code, kein Name, keine Zustimmung)
```

### A.1 Vorlage für die WhatsApp-Nachricht (Auftraggeber → Tester)

Nicht Teil der App, aber Teil der Erfahrung. Die Nachricht stellt die Erwartungen ein (Beta, Safari, Code).

> **DE:** Hey {Name}! Ich teste gerade eine kleine App, mit der man als Gruppe einen Urlaubstermin findet: „Wir wollen weg“. Magst du mitmachen?
> 1. Öffne den Link am besten in **Safari**: {URL}/beta
> 2. Beta-Code: **{BETA-CODE}**
> 3. Danach kannst du sie auf den Home-Bildschirm legen – die App erklärt dir, wie.
> Feedback einfach hier in den Chat. Danke!

> **EN:** Hey {name}! I'm testing a little app for finding dates for a group trip: "When do we go?". Want to try it?
> 1. Best open the link in **Safari**: {URL}/beta
> 2. Beta code: **{BETA-CODE}**
> 3. Afterwards you can add it to your Home Screen – the app shows you how.
> Just send feedback here in the chat. Thanks!

Optional kann der Link den Code vorbelegen: `{URL}/beta#code=SONNE27` (Fragment → landet nicht in Server-Logs; das Feld wird vorbelegt, **nicht** automatisch abgeschickt). Der Code steht trotzdem lesbar in der Nachricht (Abtippen als Ausweg).

### A.2 Landing `/de`, `/en` im Beta-Modus (Abweichung von W01)

- Primäre Taste im Hero: **«Ich habe einen Beta-Code»** → `/beta`. Sekundär (Textlink): «Schon dabei? Anmelden» → `/login`.
- «Reise planen» ohne Anmeldung (W05) führt im Beta-Modus nach `/beta?next=/trips/new` (keine Reise-Anlage ohne Konto, sonst scheitert die Registrierung am Ende).
- Unter dem Hero eine Zeile (`role="note"`): «Wir sind gerade in einer geschlossenen Beta. Den Beta-Code bekommst du von uns.» / «We're in a closed beta right now. You'll get the beta code from us.»
- `/` ohne Anmeldung → wie bisher Landing; **in der installierten App** (standalone) → direkt `/login` im App-Modus (A.7), nicht die Marketing-Seite.

### A.3 `/beta` – Schritt 1 „Beta-Code“ (mobil 360 px)

Gleiche zentrierte Karte wie W02 (Header mit Logo + Beta-Etikett + Sprachumschalter).

```
┌────────────────────────────────────┐
│ [Logo] [Beta]           ⊕ English  │
├────────────────────────────────────┤
│  (Illustration klein, optional D-77)│
│                                    │
│  Willkommen in der Beta!           │  h1
│                                    │
│  Mit Wir wollen weg findet eure    │
│  Gruppe den Termin für den         │
│  gemeinsamen Urlaub. Gib den       │
│  Beta-Code aus deiner Einladung    │
│  ein.                              │
│                                    │
│  Beta-Code                         │
│  ┌──────────────────────────────┐  │  1 Feld, autocapitalize=characters,
│  │ SONNE27                      │  │  autocomplete=off, spellcheck=false,
│  └──────────────────────────────┘  │  inputmode=text; Groß/klein, Leer-
│  Steht in der Nachricht, mit der   │  zeichen und „-“ egal
│  du den Link bekommen hast.        │  Hilfetext (aria-describedby)
│                                    │
│  [            Weiter            ]  │  primär
│                                    │
│  Schon ein Konto? Anmelden         │  → /login
│                                    │
│  ┌ ⓘ ──────────────────────────┐   │  nur iOS + nicht standalone +
│  │ Tipp: Öffne diese Seite in   │   │  erkannter In-App-Browser (B.4)
│  │ Safari, dann kannst du sie   │   │
│  │ später als App installieren. │   │
│  │ [So geht's]                  │   │  → Sheet B.4
│  └──────────────────────────────┘   │
└────────────────────────────────────┘
```

Verhalten:
- Prüfung **serverseitig** beim Absenden (rate-limitiert pro IP, Werte Operations). Gültig → signierter, httpOnly-Cookie „Beta-Pass“ (Gültigkeit 24 h, enthält nur „Code ok“ + Zeitpunkt, **nicht** den Code) → Schritt 2 (`?step=privacy`, History-Eintrag).
- Ist schon ein gültiger Beta-Pass vorhanden → direkt Schritt 2; ist man schon angemeldet → `/trips`.
- `next=` (intern, Open-Redirect-Schutz wie sitemap §4) wird durchgereicht.

### A.4 `/beta?step=privacy` – Schritt 2 „Kurz zum Datenschutz“

```
┌────────────────────────────────────┐
│ ← Zurück      [Beta]    ⊕ English  │  Zurück = Schritt 1
├────────────────────────────────────┤
│  Kurz zum Datenschutz              │  h1
│                                    │
│  ✓ Wir speichern nur, was die App  │  Liste (ul), Häkchen = Icon
│    braucht: E-Mail, deinen Namen   │  ww-icon-check, dekorativ
│    und was du in Reisen einträgst. │
│  ✓ Deine Angaben sehen nur die     │
│    Leute in deinen Reisen.         │
│  ✓ Keine Werbung, kein Tracking.   │
│  ✓ Server in der EU. {Hosting-     │  Zeile füllt Operations
│    Zeile, Operations}              │  (Anbieter/Region), max. 1 Satz
│  ✓ Es ist eine Test-Version: Am    │
│    Ende der Beta löschen wir alle  │
│    Daten. Du kannst dein Konto     │
│    jederzeit selbst löschen.       │
│                                    │
│  Alles Weitere: Datenschutzhinweis │  Link → /de/datenschutz (gleiches
│                                    │  Fenster, Zustand bleibt, C.5)
│  ┌──────────────────────────────┐  │
│  │ ☐ Ich habe das gelesen und   │  │  echte Checkbox, ganze Zeile
│  │   bin einverstanden.         │  │  tippbar (≥ 44 px), NICHT vorbelegt
│  └──────────────────────────────┘  │
│                                    │
│  [            Weiter            ]  │  immer aktiv (ux-spec §5.1)
└────────────────────────────────────┘
```

- Ohne Haken → Fehler am Feld: «Bitte bestätige kurz, dass du einverstanden bist.» Fokus auf die Checkbox.
- Mit Haken → Zustimmung (Version + Zeitpunkt) wird im Beta-Pass vermerkt und **bei Konto-Anlage** am Konto gespeichert → `/login?next=…&from=beta` (Schritt E-Mail, W02).
- Texte sind **UX-Entwurf**; die inhaltliche Prüfung gegen den Platzhalter-Datenschutzhinweis macht Operations (compliance-checklist). Das Löschversprechen „am Ende der Beta“ muss Operations bestätigen oder streichen.
- Die bisherige Zeile «Mit dem Fortfahren akzeptierst du …» (W02 Schritt 1) entfällt im Beta-Modus auf `/login` nicht – sie ist dort für bestehende Konten weiter richtig; bei `from=beta` wird sie ausgeblendet (Zustimmung schon gegeben).

### A.5 `/login` im Beta-Modus (Abweichungen von W02)

**Schritt E-Mail:** unverändert, plus Textlink unter der Taste «Zum ersten Mal hier? Mit Beta-Code registrieren» / «First time here? Sign up with a beta code» → `/beta?next=…` (ersetzt im Beta-Modus den Satz «Neu hier? Einfach E-Mail eingeben – wir legen dein Konto automatisch an.»). Bei `from=beta` Überschrift «Deine E-Mail» statt «Anmelden oder registrieren»; Hilfetext «Wir schicken dir einen 6-stelligen Code. Ein Passwort brauchst du nicht.»

**Schritt Code – „Code-Weg im Vordergrund“:**
- Text: «Wir haben dir einen 6-stelligen Code an kemal@… geschickt. **Gib ihn hier ein.**»
- `autocomplete="one-time-code"` bleibt: Auf dem iPhone schlägt die Tastatur den Code aus Mail oft direkt vor („Aus Mail“) – das ist der schnellste Weg und funktioniert auch in der installierten App.
- **In der installierten App** (standalone, C.1) zusätzlich unter dem Feld, klein (`role="note"`):
  «Bitte den **Code** eingeben – der Link in der Mail öffnet Safari statt der App.»
- Im Browser bleibt der bisherige Hinweis aus user-flows A.4 Regel 5.
- Der Satz „Tipp: Lass dieses Fenster offen …“ (In-App-Browser) bleibt.

**Mail (Beta-Fassung von `access`, Reihenfolge Code → Link):**

| Schlüssel | DE | EN |
|---|---|---|
| `codeIntro` | Dein Code – gib ihn in der App oder im Browser ein: | Your code – enter it in the app or your browser: |
| `linkIntro` | Du bist im Browser (nicht in der App vom Home-Bildschirm)? Dann geht es auch mit diesem Link: | In a browser (not the app on your Home Screen)? Then this link works too: |
| `linkText` | Im Browser anmelden | Sign in in browser |

Betreff unverändert («{code} ist dein Code für Wir wollen weg») – der Code im Betreff ist auf dem Sperrbildschirm sichtbar und wird von iOS für das Ausfüllen erkannt.

**Schritt Name (nur neues Konto):** unverändert, danach **→ `/install?next=…`** (B.5) statt direkt `/trips`.

**Neue E-Mail ohne Beta-Pass und ohne Einladung** (jemand landet direkt auf `/login`): Konto-Anlage wird **nach** der Code-Prüfung abgelehnt (erst dann wissen wir, dass die Person die Adresse besitzt – keine Konto-Aufzählung):

```
│  Fast – dir fehlt noch der         │  h1, Fokus
│  Beta-Code                         │
│  Zu kemal@… gibt es noch kein      │
│  Konto. Gerade sind wir in einer   │
│  geschlossenen Beta – dafür        │
│  brauchst du einen Beta-Code.      │
│  [      Beta-Code eingeben      ]  │  → /beta?email=… (E-Mail wird
│                                    │    später in /login vorbelegt)
│  Du hast einen Einladungslink zu   │
│  einer Reise? Öffne einfach den.   │
```
Danach muss die Person nach `/beta` einen neuen Code anfordern (ein zusätzlicher Mail-Versand – seltener Weg, bewusst einfach gehalten).

### A.6 Magic-Link-Landeseite `/auth/magic` im Beta-Modus (Abweichung von W02)

Wurde die Anforderung **aus der installierten App** gestellt (Server merkt sich bei der Code-Anforderung `standalone=true`, vom Client mitgeschickt), zeigt die Landeseite in Safari **vor** der Taste:

```
│  ┌ ⓘ ──────────────────────────┐   │  role="note"
│  │ Du nutzt die App auf dem     │   │
│  │ Home-Bildschirm? Dann gib    │   │
│  │ dort lieber den 6-stelligen  │   │
│  │ Code aus der Mail ein. Dieser│   │
│  │ Link meldet dich nur hier in │   │
│  │ Safari an.                   │   │
│  └──────────────────────────────┘   │
│  [  Trotzdem hier anmelden      ]  │  sekundär (statt primär)
```
Den Code selbst zeigt die Seite **nicht** an (Mail-Scanner rufen Links auf).

### A.7 Erster Start der installierten App (iPhone)

`start_url` `/` → keine Sitzung im App-Speicher → `/login` im App-Modus:

```
┌────────────────────────────────────┐
│ (Statusleiste, C.3)                │
│ [Logo] [Beta]           ⊕ English  │
├────────────────────────────────────┤
│  Schön, dass du die App hast!      │  h1
│  Melde dich hier einmal an – mit   │
│  deiner E-Mail und einem Code.     │
│                                    │
│  E-Mail                            │
│  [kemal@beispiel.de            ]   │
│  [          Code senden         ]  │
│                                    │
│  Neu hier? Beta-Code eingeben      │  → /beta
│  Einladungslink einfügen           │  → Sheet C.8
└────────────────────────────────────┘
```

- Text nur im App-Modus; «Mit Passwort anmelden» bleibt als Textlink darunter (W02).
- „Angemeldet bleiben“ ist im App-Modus **immer an** und wird nicht angezeigt (die App ist ein persönliches Gerät; ein Abmelden durch Sitzungsende würde bei jedem App-Start erneut den Code-Weg erzwingen).
- Ist die Anmeldung aus Safari mitgekommen (je nach iOS-Version), startet die App direkt in `/trips` – kein Sonderfall nötig.

### A.8 Weg über einen Reise-Einladungslink (Empfehlung B-E2)

**Standard (empfohlen):** `/i/{token}` wie W03 – **kein** Beta-Code. Abweichungen im Beta-Modus:
1. **Z1 Vorschau:** zusätzliche Zeile unter der Reisekarte: «{Lena} hat dich zur Beta eingeladen – du brauchst keinen Beta-Code.» (`role="note"`) – damit Leute, die von „Beta-Code“ gehört haben, nicht suchen.
2. **Z4a Name (neues Konto):** über der Taste «Beitreten» die **Datenschutz-Kurzfassung als aufklappbarer Abschnitt** („Kurz zum Datenschutz ▸“, Inhalt = A.4-Liste) + **Pflicht-Checkbox** wie A.4. Ohne Haken: gleiche Fehlermeldung. Bei bestehendem Konto (Z4b) keine Checkbox.
3. **Nach dem Beitritt:** `/install?next=/trips/{id}/days` (einmalig, B.5), danach wie bisher „Meine Tage“ mit Willkommens-Hinweis (W03 Z5). Der Hinweis aus user-flows A.4 Regel 8 („Später in deinem Browser weitermachen?“) entfällt im Beta-Modus – der Install-Schritt ersetzt ihn.
4. Serverseitig gilt: Konto-Anlage ist erlaubt, wenn **entweder** ein gültiger Beta-Pass **oder** eine gültige Einladung (Reise oder Platzhalter-Link, F-007) mit `intent=join` vorliegt. Wird die Einladung zwischen Code-Anforderung und Beitritt widerrufen → bestehender Fehlerfall W03 „Einladung ungültig“; das Konto wird dann nicht angelegt.

**Variante streng (nur falls CEO/Auftraggeber so entscheiden – Stand Ops-Entwurf):**
- Z1 Vorschau: statt `beta.invite.noCode` die Zeile «Neu hier? Für die Beta brauchst du einen Beta-Code – frag {Lena} danach.» / «New here? You need a beta code for the beta – ask {Lena} for it.»
- Z2 E-Mail: unter dem E-Mail-Feld Schalter-Link «Zum ersten Mal hier?» → klappt das Feld „Beta-Code“ (Text, Hilfe, Fehler wie A.3/A.10) **und** die Datenschutz-Kurzfassung + Checkbox (A.4) direkt im Formular auf; Prüfung des Beta-Codes beim Absenden, **vor** dem Mailversand, Fehler am Feld. Bestehende Konten lassen den Schalter zu.
- Vergisst jemand den Schalter (neue E-Mail, ohne Code): nach der Code-Prüfung Zustand A.5 „Fast – dir fehlt noch der Beta-Code“, Taste führt zurück zu Z2 mit aufgeklapptem Feld.
- Z4a: keine zweite Checkbox (Zustimmung schon gegeben).
- Nachteil: Jede eingeladene Person braucht vorher eine Nachricht vom Auftraggeber oder vom Orga – die Gruppe kann nicht ohne Weiteres selbst einladen, und der Beta-Code wandert zwangsläufig in Gruppenchats. UX rät ab.

**Tester hat die App schon installiert und bekommt einen neuen Einladungslink:** Der Link öffnet Safari (nicht die App). Auf der Einladungsseite im Browser steht – nur iOS, nicht standalone, nicht angemeldet – ein einklappbarer Hinweis:

```
│  ┌ ⓘ ──────────────────────────┐   │
│  │ Du hast die App schon auf    │   │
│  │ dem Home-Bildschirm?         │   │
│  │ [Link kopieren] und in der   │   │  Kopieren → Snackbar „Link kopiert“
│  │ App unter „Meine Reisen →    │   │
│  │ Einladungslink einfügen“     │   │
│  │ einfügen.                    │   │
│  └──────────────────────────────┘   │
```
Beitreten im Browser funktioniert natürlich trotzdem (Anmeldung per Code); die Reise erscheint danach auch in der App.

### A.9 Leer- und Folgezustände

- Nach Registrierung über `/beta`: Meine Reisen im Leerzustand (W04) – unverändert, CTA «Reise planen».
- Demo-Elemente gibt es im Beta-Modus **nicht**: kein Demo-Banner, kein Link „Demo-Postfach“, kein „Demo zurücksetzen“, kein `DEMO`-Präfix in Mails.
- Reisedaten (F-054) sind aus: Verhalten exakt wie [W20 H.1](w20-reisedaten.md) („keine Teaser“). W16/W20 bleiben unverändert.

### A.10 Fehlerfälle

| Fall | Wo | Meldung DE | Meldung EN | Verhalten |
|---|---|---|---|---|
| Feld leer | A.3 | Bitte gib den Beta-Code ein. | Please enter the beta code. | Fokus ins Feld |
| Code falsch | A.3 | Dieser Beta-Code stimmt nicht. Schau nochmal in die Nachricht mit dem Link. | That beta code isn't right. Check the message with the link again. | Inhalt markiert |
| Zu viele Versuche | A.3 | Zu viele Versuche. Bitte versuch es in {min} Minuten nochmal. | Too many attempts. Please try again in {min} minutes. | Taste deaktiviert bis Ablauf, Restzeit nicht sekundengenau |
| Beta voll / Code abgelaufen (falls Operations ein Limit setzt) | A.3 | Die Beta ist gerade voll. Melde dich bei der Person, die dir den Link geschickt hat. | The beta is full right now. Get in touch with the person who sent you the link. | – |
| Beta-Pass abgelaufen (> 24 h zwischen Schritt 2 und Konto-Anlage) | A.5 nach Code | Wie A.5 „Fast – dir fehlt noch der Beta-Code“ | wie A.5 | Code erneut eingeben |
| Zustimmung fehlt | A.4, A.8 | Bitte bestätige kurz, dass du einverstanden bist. | Please confirm that you agree. | Fokus auf Checkbox |
| Keine Verbindung | überall | Snackbar/Banner wie W14 «Keine Verbindung …» | wie W14 | Eingaben bleiben stehen |
| Mail kommt nicht (keine Demo-Postfach-Hilfe mehr!) | Code-Schritt | Bestehende Hilfe W02 (nach 60 s) – Absenderadresse nennen | wie W02 | Hilfe-Anker `#code` |

---

## B. „Zum Home-Bildschirm“ – Installations-Anleitung in der App

### B.1 Erkennung (best effort, nie blockierend)

| Lage | Erkennung | Was wir zeigen |
|---|---|---|
| **Schon installiert** | `matchMedia('(display-mode: standalone)').matches` **oder** `navigator.standalone === true` (iOS) | **Nichts** – kein Hinweis, kein Menüeintrag „App installieren“. |
| iPhone/iPad, Safari | iOS-UA (inkl. iPadOS-Desktop-UA + Touch), kein bekannter In-App-Token | Anleitung **iOS** (B.2) |
| iPhone, Chrome/Edge/Firefox (iOS ≥ 16.4 können das auch) | `CriOS` / `EdgiOS` / `FxiOS` | Anleitung **iOS**, Schritt 1 mit «Teilen-Symbol (oben oder unten)» – Varianten-Hinweis «Findest du es nicht? Öffne die Seite in Safari.» |
| iPhone, erkannter In-App-Browser (Instagram, Facebook, LinkedIn, Snapchat, TikTok, Line …) | UA-Tokens `Instagram`, `FBAN`/`FBAV`, `LinkedInApp`, `Snapchat`, `musical_ly`/`BytedanceWebview`, `Line/` | **„In Safari öffnen“** (B.4) statt Anleitung |
| iPhone, **WhatsApp-Vorschau** | **nicht zuverlässig erkennbar** (WhatsApp nutzt je nach Version die Safari-Vorschau mit identischem UA) | Anleitung iOS mit **Schritt 0** (B.2): «Steht oben „Fertig“ und unten ein Kompass-Symbol? Erst in Safari öffnen.» – Gerätetest G-3 |
| Android, Chrome/Edge/Samsung Internet | Event `beforeinstallprompt` wurde empfangen | Anleitung **Android** mit Taste **[Installieren]** (B.3) |
| Android, ohne `beforeinstallprompt` (Firefox, In-App-Browser, schon abgelehnt) | sonst | Android-Text: «Menü ⋮ → „App installieren“ bzw. „Zum Startbildschirm hinzufügen“»; im erkannten In-App-Browser (`; wv)`, `FBAN`, `Instagram`) → B.4 mit «Im Chrome öffnen» |
| Desktop | kein Touch-Gerät | Kein Install-Schritt nach der Registrierung; nur Hilfe-Eintrag. |

Die Erkennung läuft **nur im Client** (kein Layout-Sprung: Bereich erst nach Hydration einblenden, vorher Platzhalter gleicher Höhe nur auf `/install`).

### B.2 Anleitung iOS (Seite `/install` bzw. Sheet aus dem Menü)

```
┌────────────────────────────────────┐
│ ← Zurück                 [Beta]    │  aus Menü: „← Zurück“; nach Registrierung:
├────────────────────────────────────┤  kein Zurück, nur „Später“ unten
│  (App-Symbol 64 px, D-74)          │  dekorativ
│                                    │
│  Hol dir die App auf den           │  h1
│  Home-Bildschirm                   │
│  Dann startet Wir wollen weg wie   │
│  eine App – ohne Adresszeile, mit  │
│  eigenem Symbol.                   │
│                                    │
│  ┌ Schritt 0 (nur iOS, nicht      ┐ │  zeigen, solange WhatsApp-Vorschau
│  │ sicher Safari):                │ │  nicht auszuschließen ist; eingeklappt
│  │ Steht oben „Fertig“? Dann      │ │  als <details> „Du bist in WhatsApp?“
│  │ tippe unten rechts auf das     │ │
│  │ Kompass-Symbol – die Seite     │ │
│  │ öffnet sich in Safari.         │ │
│  └────────────────────────────────┘ │
│                                    │
│  1  Tippe unten auf  ⋯  und dann   │  <ol>; Icon-Glyphen als Inline-SVG
│     auf  [□↑] Teilen.              │  mit Text daneben (nie Icon allein)
│     (Siehst du  [□↑]  direkt?      │
│      Dann gleich darauf tippen.)   │
│  ┌──────────────────────────────┐  │  Skizze 1 (D-73): Safari-Leiste
│  │  ‹  ┃ wirwollenweg… ┃  ⋯   ←  │  │  unten, ⋯ hervorgehoben
│  └──────────────────────────────┘  │
│  2  Wähle „Zum Home-Bildschirm“    │
│     (evtl. nach unten scrollen     │
│     oder „Mehr“ tippen).           │
│  ┌──────────────────────────────┐  │  Skizze 2: Teilen-Blatt, Zeile
│  │ ⊞  Zum Home-Bildschirm    ←  │  │  „Zum Home-Bildschirm“ hervorgeh.
│  └──────────────────────────────┘  │
│  3  „Als Web-App öffnen“ an        │
│     lassen und oben rechts auf     │
│     „Hinzufügen“ tippen.           │
│  ┌──────────────────────────────┐  │  Skizze 3: Dialog mit Symbol,
│  │ [Symbol] Wir wollen weg      │  │  Name, Schalter „Als Web-App
│  │ Als Web-App öffnen   (●  )   │  │  öffnen“ AN, „Hinzufügen“
│  └──────────────────────────────┘  │
│  4  Öffne die App über das neue    │
│     Symbol und melde dich dort     │
│     einmal mit deinem Code an.     │  (B-E3; entfällt bei Android)
│                                    │
│  [        Fertig – ist drauf    ]  │  primär → next (bzw. /trips)
│  Später                            │  Textbutton → next
└────────────────────────────────────┘
```

- Die Schritte sind **echter Text in einer geordneten Liste**; die Skizzen sind Ergänzung (`alt` je Skizze, s. F). Wer ohne Bilder liest, verliert nichts.
- Wortlaut der iOS-Menüpunkte = deutsche/englische iOS-Begriffe („Teilen“/„Share“, „Zum Home-Bildschirm“/„Add to Home Screen“, „Als Web-App öffnen“/„Open as Web App“, „Hinzufügen“/„Add“). Bei iOS < 26 gibt es Schritt 3 ohne Schalter – der Satz „an lassen“ schadet dort nicht.
- Kein animierter Pfeil, der auf die echte Safari-Leiste zeigt (deren Lage ist je nach Layout „Kompakt/Unten/Oben“ verschieden – ein falscher Pfeil verwirrt mehr als er hilft).
- „Fertig – ist drauf“ setzt nur den Merker „Hinweis gesehen“ – prüfen können wir die Installation aus Safari heraus nicht.

### B.3 Anleitung Android (Chrome)

```
│  Hol dir die App auf den           │  h1 (gleich)
│  Startbildschirm                   │
│  …                                 │
│  [  ⊕  App installieren        ]   │  primär; ruft das gespeicherte
│                                    │  beforeinstallprompt.prompt() auf
│  Später                            │
```
- Ergebnis `accepted` → Snackbar «Die App wird installiert.» → next. `dismissed` → bleibt auf der Seite, Taste weiter verfügbar (Chrome erlaubt erneutes `prompt()` erst nach neuem Event – sonst Text-Anleitung B.1 „Menü ⋮ → App installieren“ einblenden).
- Event `appinstalled` → Merker „installiert“ → Menüeintrag verschwindet.
- Das native Mini-Banner von Chrome nicht zusätzlich unterdrücken oder nachbauen; wir rufen `preventDefault()` auf `beforeinstallprompt` nur, um den Zeitpunkt selbst zu steuern (kein Banner auf der Landing oder beim Malen).

### B.4 „In Safari öffnen“ (In-App-Browser)

Sheet bzw. Kasten (auf `/beta` und `/install`):

```
│  Öffne die Seite in Safari         │  h2
│  Hier in {Instagram} lässt sich    │  {App} nur wenn sicher erkannt,
│  die App nicht installieren.       │  sonst „in dieser Ansicht“
│  1  Tippe auf  ⋯  (oben oder       │
│     unten rechts).                 │
│  2  Wähle „In Safari öffnen“ bzw.  │
│     „Im Browser öffnen“.           │
│  Klappt nicht?                     │
│  [ Link kopieren ]  und in Safari  │  Zwischenablage; Snackbar „Link kopiert“
│  einfügen.                         │
│  Weiter ohne App                   │  Textbutton, schließt
```
- **Kein Zwang**, kein Blocken: Registrieren und Mitmachen funktioniert im In-App-Browser (user-flows A.4 Regel 7 gilt weiter).
- Hinweis an die Person: Die Anmeldung aus dem In-App-Browser kommt **nicht** mit nach Safari – in Safari einmal neu per Code anmelden (eine Zeile: «In Safari meldest du dich einmal neu an – mit Code.»).
- Kein automatisches `window.open` / `x-safari-https://`-Trick (unzuverlässig, wirkt wie Spam).

### B.5 Wann der Hinweis erscheint (Regeln „nicht nervig“)

1. **Automatisch genau einmal pro Konto:** als Zwischenschritt `/install?next=…` direkt nach (a) Konto-Anlage über `/beta` oder (b) erstem Beitritt mit neuem Konto über `/i/{token}`. Nicht nach normalen Logins.
2. **Nicht**, wenn: standalone · Desktop · Merker „gesehen“ gesetzt (serverseitig am Konto, weil Safari und App getrennte Speicher haben; zusätzlich `localStorage` gegen Flackern).
3. „Später“ und „Fertig – ist drauf“ setzen beide den Merker. **Keine** spätere Erinnerung, keine Karte auf Meine Reisen, kein Zähler.
4. **Dauerhaft erreichbar** (nur wenn nicht standalone):
   - Avatar-Menü (W04): Eintrag **„App installieren“** über „Hilfe“.
   - Reisemenü „⋯“ (sitemap §5): kein eigener Eintrag (Menü ist lang genug) – über „Hilfe“.
   - Hilfe W15: neue Frage **„Wie lege ich die App auf den Home-Bildschirm?“** (Anker `#app`) mit der Kurzfassung und Taste «Anleitung öffnen» → `/install`.
5. Aus dem Menü öffnet `/install` als normale Seite mit „← Zurück“ (zurück zur vorherigen Seite), ohne „Später“.

### B.6 Nach der Installation

- Erster App-Start: A.7. Danach normaler Start in `/trips` (bzw. der letzten Reise? → **nein**, immer `/trips`; Grund: vorhersehbar, Reise-Karte zeigt den nächsten Schritt).
- In der App: kein Install-Menüeintrag, keine Install-Frage in der Hilfe hervorgehoben (Frage bleibt im FAQ, Antwort beginnt mit «Du nutzt die App schon vom Home-Bildschirm – alles erledigt.» wenn standalone).

---

## C. PWA-Verhalten [immer]

### C.1 Manifest & Start

| Punkt | Festlegung |
|---|---|
| `display` | `standalone` (wie heute). |
| `start_url` | `/` (Weiterleitung entscheidet: angemeldet → `/trips`, sonst A.7). Kein Tracking-Parameter. |
| `id` | `/` ergänzen (stabile App-Identität, auch wenn sich `start_url` ändert). |
| `scope` | `/` – damit sind `/de/hilfe`, Rechtstexte und `/i/…` „in der App“. |
| Sprache | Manifest je Sprache bleibt (U-16). iOS nimmt Namen/Symbol zum Zeitpunkt der Installation. |
| `orientation` | nicht setzen (Hoch- und Querformat erlaubt, WCAG 1.3.4). |
| Name unter dem Symbol | „Wir wollen weg“ / „When do we go?“ – **kein** „Beta“ im Namen (würde nach der Beta falsch auf den Home-Bildschirmen stehen bleiben). |
| iOS-Meta | `apple-mobile-web-app-capable` nicht mehr nötig (Manifest reicht), `apple-mobile-web-app-title` = Produktname je Sprache, `apple-mobile-web-app-status-bar-style` s. C.3. |

### C.2 Start ohne Netz – Offline-Seite statt weißer Seite

**Voraussetzung:** ein kleiner Service Worker. Umfang bewusst minimal:
- **Vorab gespeichert:** nur die Offline-Seite (`/offline`, beide Sprachen in einer Datei, Sprache per `navigator.language` bzw. Cookie), Logo-SVG, Schriften (latin), `tokens`-CSS.
- **Seitenaufrufe:** immer Netz zuerst; scheitert das Netz → `/offline`. **Keine** Reise- oder Personendaten im Cache (Datenschutz, Beta, geteilte Geräte).
- Statische Next-Assets dürfen nach Standard gecacht werden (Hash-Dateinamen).
- Updates: neuer Service Worker übernimmt beim nächsten Start; kein „Neue Version – neu laden?“-Dialog (Seiten kommen ohnehin aus dem Netz).

```
┌────────────────────────────────────┐
│ (Statusleiste)                     │
│ [Logo]                              │
├────────────────────────────────────┤
│    (offline.svg / Wolke, D-76)     │  dekorativ, alt=""
│                                    │
│  Keine Verbindung                  │  h1, Fokus beim Laden
│  Wir wollen weg braucht Internet,  │
│  um eure Reisen zu zeigen. Prüf    │
│  WLAN oder mobile Daten.           │
│                                    │
│  [        Nochmal versuchen     ]  │  location.reload(); Ladezustand
│                                    │  „Einen Moment …“ (aria-busy)
│  Sobald du wieder online bist,     │  role="status"; bei Event `online`
│  geht es automatisch weiter.       │  automatisch neu laden
└────────────────────────────────────┘
```

- Verliert die App **während** der Nutzung das Netz, gilt weiter der Banner aus W14 («Keine Verbindung. Änderungen werden gespeichert, sobald du wieder online bist.») – keine Offline-Seite mitten in der Arbeit. Server Actions, die offline scheitern, zeigen die bestehenden Fehlermeldungen; Autosave (W08) wiederholt wie spezifiziert.

### C.3 Statusleiste & Theme-Farbe (hell/dunkel)

- **iOS:** `apple-mobile-web-app-status-bar-style = black-translucent` → Inhalt läuft unter die Statusleiste; Statusleisten-Schrift ist **immer weiß**. Regel daher: **Der Bereich hinter der Statusleiste (`env(safe-area-inset-top)`) ist auf jeder Seite in der App eine dunkle Markenfläche** (`--ww-cockpit-bg` hell, Dark-Mode-Pendant dunkel). Reise-Ansichten haben das durch den Indigo-Cockpit-Kopf ohnehin; helle Seiten (Login, Meine Reisen, Konto, Hilfe, Rechtstexte, Offline) bekommen ein **Indigo-Band in Höhe der Safe Area** (nur standalone). → Designer D-75 (Optik des Bands, ggf. Meine Reisen-Kopf in Indigo).
  - Alternative `default` (dunkle Schrift auf hellem Grund) wäre auf Cockpit-Seiten unlesbar bzw. würde einen weißen Balken über dem Indigo-Kopf erzeugen – verworfen.
- **Android/Chrome:** zwei `theme-color`-Meta-Angaben mit `media="(prefers-color-scheme: light|dark)"`: hell `#2B2266` (wie heute), dunkel = Hintergrund des Cockpit-Kopfs im Dark Mode (Designer D-75 nennt den Wert).
- `background_color` im Manifest (Startbild Android, Startfläche iOS): siehe D-76; im Dark Mode darf beim Start kein heller Blitz entstehen → Wert so wählen, dass er in beiden Modi nicht grell wirkt (Vorschlag: Indigo statt `#F4F2FB`).

### C.4 Safe Areas (Notch/Dynamic Island, Home-Indikator)

- Viewport-Meta um **`viewport-fit=cover`** ergänzen (sonst sind `env(safe-area-inset-*)` auf dem iPhone 0). Weiterhin **kein** `maximum-scale`/`user-scalable=no` (ux-spec §2).
- Oben: Cockpit-Kopf und globaler Header bekommen `padding-top: env(safe-area-inset-top)` (sticky Teil wächst um die Safe Area; Höhenbudget ux-spec §2 rechnet **ohne** Safe Area).
- Unten: alle fixierten Leisten (Werkzeugleiste W08, Abstimm-Leiste W10, Swipe-Tasten W18, „Speichern“-Leisten W19, Bottom-Sheets, Snackbar-Abstand `--ww-sticky-bar-h`) `padding-bottom: max(12px, env(safe-area-inset-bottom))`. Tippziele dürfen **nicht** im Bereich des Home-Indikators liegen.
- Seitlich (Querformat): `padding-inline: max(16px, env(safe-area-inset-left/right))` für Seitenränder; Kalender-Inset (8 px) ebenfalls mit `max()`.
- Nicht standalone (Safari): Werte sind ohnehin klein/0 → kein Sonderfall.

### C.5 Zurück-Navigation ohne Browser-Taste

Regel: **Jede Seite hat einen sichtbaren Weg zurück oder nach oben** – die Wischgeste vom linken Rand ist in der iPhone-Web-App nicht verlässlich und nicht auffindbar. Android hat die System-Zurück-Taste (History muss stimmen, ux-spec §3 gilt weiter).

| Seite / Route | Soll-Weg zurück | Stand (Code-Sichtung, Developer prüft am Gerät) |
|---|---|---|
| `/trips` | Startseite – kein Zurück nötig; Avatar-Menü | ok |
| `/trips/{id}` und Tabs, Phase-3-Hub | Cockpit „← Meine Reisen“ | ok |
| `/trips/{id}/days`, `/group`, `/poll` | Cockpit „← Meine Reisen“ + Tabs | ok |
| `/trips/{id}/poll/new`, `/invite`, `/settings` | „← Zurück“ zur Reise (bzw. Abbrechen) | prüfen |
| Module `/stays`, `/stays/new`, `/stays/{sid}/edit`, `/stays/swipe`, `/costs`, `/costs/new`, `/costs/{eid}/edit`, `/costs/balances`, `/info`, `/info/edit` | „← {Elternseite}“ laut W17–W22 | weitgehend vorhanden, prüfen |
| `/trips/new` | „← Meine Reisen“ bzw. Abbrechen | prüfen |
| `/account` | „← Meine Reisen“ (bisher nur Logo) | **ergänzen** |
| `/account/email`, `/password`, `/delete` | „← Konto“ | ok |
| `/login` Schritte, `/login/reset` | „← Zurück“ je Schritt; Reset „← Anmelden“ | prüfen (Reset) |
| `/beta` Schritte, `/install` (aus Menü) | „← Zurück“ | neu |
| `/de/hilfe`, `/en/help`, Datenschutz, Impressum | **„← Zurück“** (vorherige Seite, sonst `/trips` bzw. Landing) – im App-Modus links im Header statt nur Logo | **ergänzen** (Logo führt heute auf die Landing – in der App ein Irrweg) |
| `/i/{token}` (in der App über „Einladungslink einfügen“) | „← Meine Reisen“, wenn angemeldet | **ergänzen** |
| `/auth/magic` | öffnet in Safari, nicht in der App | – |
| `/goodbye`, 404, „Reise nicht gefunden“ | Taste zur Startseite (vorhanden bei Reise-404) | prüfen |
| `/offline` | „Nochmal versuchen“ | neu |

- „← Zurück“ (generisch) nutzt `history.back()`, **wenn** der vorige Eintrag zur eigenen Origin gehört; sonst festes Ziel (Spalte „Soll“). Nie ins Leere zurück (App-Start ohne History).
- **Interne Links nie `target="_blank"` in der App:** Datenschutz-/Nutzungsbedingungen-Links aus Formularen (ux-spec §11 „neuer Tab“) öffnen im App-Modus im **selben** Fenster; Formularzustand (Beta-Schritte, Name, Haken) bleibt per `sessionStorage` erhalten; „← Zurück“ bringt zurück. Im Browser bleibt „neuer Tab“.

### C.6 Links nach außen

| Ziel | Verhalten in der App | Umsetzung |
|---|---|---|
| Unterkunfts-Links (W17/W18), Links in Infoseite (W22), Karten-Webseiten | iOS öffnet Links außerhalb `scope` automatisch in einer Safari-Ansicht über der App („Fertig“ führt zurück) – gewünscht. | `target="_blank" rel="noopener noreferrer"` wie bisher; Icon „extern“ + Text bleibt (Nutzer soll wissen, dass es die App verlässt). |
| WhatsApp (`wa.me`), Signal, Telegram | öffnet die jeweilige App | unverändert (ux-spec §4.5, §14.2) |
| Karten (Adresse) | Apple Karten auf iOS, Google Maps sonst | `https://maps.apple.com/?q=…` auf iOS, `https://www.google.com/maps/search/?api=1&query=…` sonst (beide öffnen die native App, falls installiert) |
| `mailto:` | Mail-App | unverändert |
| Teilen | Web Share API funktioniert in der App | unverändert |
| **ICS-Download** (W11) | in der iPhone-Web-App unsicher (Datei-Downloads) | **Gerätetest G-9.** Fallback, falls er scheitert: im App-Modus Text «Kalendereintrag klappt hier nicht? Öffne die Reise in Safari.» + [Link kopieren] – Developer meldet Ergebnis, UX passt dann W11 an. |
| Feedback (D) | WhatsApp bzw. Mail-App | s. D |

### C.7 Aktualisieren statt Pull-to-refresh

- **Kein** Pull-to-refresh (B-E7). Im CSS `overscroll-behavior-y: contain` auf dem App-Container, damit Android-Chrome im App-Modus nicht versehentlich neu lädt und iOS kein Gummiband über dem Statusleisten-Band zeigt (nur Hauptcontainer, nicht in Sheets).
- **Automatisch frisch:** Kommt die App nach ≥ 30 s im Hintergrund wieder in den Vordergrund (`visibilitychange` → `visible`), werden die Daten der aktuellen Seite still neu geholt (ohne Scrollsprung, ohne Lade-Overlay; nur Seiten ohne offene Eingabe – nicht während Malen/Formular).
- Fehler beim Auffrischen → kein Hinweis (der nächste Versuch kommt mit der nächsten Aktion); bei Offline greift C.2/W14.

### C.8 „Einladungslink einfügen“ (nur in der installierten App)

Auf Meine Reisen (W04) unter der Liste bzw. im Leerzustand unter «Reise planen» als Textbutton; außerdem auf A.7.

```
┌ Sheet ─────────────────────────────┐
│  Einladungslink einfügen           │  h2, Fokus ins Feld
│  Links aus WhatsApp öffnen sich in │
│  Safari. Kopier den Link und füg   │
│  ihn hier ein.                     │
│  Link                              │
│  ┌──────────────────────────────┐  │  type=url, inputmode=url
│  │ https://…/i/Xy7…             │  │
│  └──────────────────────────────┘  │
│  [ Einfügen ]                      │  liest Zwischenablage (iOS fragt
│                                    │  „Einsetzen erlauben?“), optional
│  [          Öffnen              ]  │  primär → /i/{token} in der App
└────────────────────────────────────┘
```
- Akzeptiert: vollständige URL der **eigenen** Origin mit Pfad `/i/{token}` (auch mit Text drumherum – die erste passende URL wird herausgesucht, z. B. wenn der ganze WhatsApp-Text eingefügt wird). Alles andere: «Das ist kein Einladungslink von Wir wollen weg.» / «That's not an invite link from When do we go?.»
- Gleicher Mechanismus taugt für Links aus Mails (Erinnerungen, Abstimmung): Pfade `/trips/{id}…` werden ebenfalls angenommen und intern geöffnet. Beschriftung bleibt „Einladungslink“ (häufigster Fall); Hilfetext erwähnt «… oder einen anderen Link aus einer Mail».

### C.9 Sonstiges

- **Text auswählen/zoomen** bleibt erlaubt (keine `user-select: none` auf Inhalten, nur auf Mal-Grid und Swipe-Karte, wie bisher).
- **Sitzungsdauer:** Die App-Sitzung soll möglichst lange halten (ux-spec §4.4 „Angemeldet bleiben“). iOS kann den Speicher einer Web-App löschen, die **lange nicht geöffnet** wurde – dann führt A.7 einfach erneut durch den Code-Weg. Kein Sonderhinweis.
- **Keine Push-Benachrichtigungen** in der Beta (würde eine Berechtigungsabfrage und Backend brauchen; Erinnerungen laufen über WhatsApp/Mail).
- **Haptik/Bewegung:** unverändert (ux-spec §7.5).

---

## D. Beta-Kennzeichnung & Feedback

### D.1 Etikett „Beta“

- **Globaler Header** (Landing, Login, Meine Reisen, Konto, Hilfe, Beta, Install): kleines Etikett „Beta“ direkt rechts neben der Wortmarke/Logo, nicht interaktiv. Zugänglicher Name: Wortmarke-Link «Wir wollen weg – Beta, zu Meine Reisen». Ab 320 px darf die Wortmarke in den Kurzmodus (nur Bildmarke) gehen, das Etikett bleibt.
- **Cockpit-Kopf (Reisen):** **kein** zusätzliches Etikett (Platz, Ruhe); die Kennzeichnung steckt im Reisemenü (D.2).
- **Konto** (W13), ganz unten: «Version {x.y} (Beta) · {Build-Kurzzeichen}» – hilft bei Feedback.
- Etikett-Optik: Designer D-72 (Chip, Kontrast ≥ 4,5 : 1, kein reines Farbsignal – Text „Beta“ trägt die Bedeutung).

### D.2 „Feedback geben“

**Wo:** Avatar-Menü (vor „Hilfe“) · Reisemenü „⋯“ (vor „Hilfe“) · Hilfe W15 (oben, eigener Kasten «Du testest die Beta – danke! [Feedback geben]») · Offline-Seite **nicht**.

**Was passiert:** kleines Sheet statt sofortigem Absprung (damit klar ist, wohin die Nachricht geht):

```
┌ Sheet ─────────────────────────────┐
│  Feedback geben                    │  h2
│  Was ist dir aufgefallen? Schreib  │
│  uns direkt – gern mit Screenshot. │
│  [ ◉ Per WhatsApp schreiben     ]  │  primär → wa.me/{Nummer}?text=…
│  [   Per E-Mail schreiben       ]  │  sekundär → mailto:{Adresse}?subject=…&body=…
│  Wir sehen dabei nur, was du       │
│  selbst schickst.                  │
└────────────────────────────────────┘
```
- Nummer/Adresse aus Umgebungsvariablen (Operations, **nicht** im Repo). Fehlt eine davon → Taste ausblenden; fehlen beide → Menüeintrag ausblenden.
- **Vorausgefüllter Text** (Sprache der Oberfläche) – enthält **keine** Reisenamen, IDs, E-Mail oder Namen:
  - DE: «Feedback zu Wir wollen weg (Beta)\nBereich: {Bereich}\nGerät: {iPhone|Android|Computer} · App installiert: {ja|nein} · Version {x.y}\n\n» 
  - EN: «Feedback on When do we go? (beta)\nArea: {area}\nDevice: {iPhone|Android|Computer} · Installed app: {yes|no} · Version {x.y}\n\n»
  - `{Bereich}` = Name der Ansicht aus dem Seitentitel ohne Reisename („Meine Tage“, „Gruppe“, „Kosten“ …).
- E-Mail-Betreff: «Feedback zur Beta» / «Beta feedback».

---

## E. Texte DE/EN (Schlüssel-Vorschlag `beta.*`, `install.*`, `pwa.*`)

| Schlüssel | DE | EN |
|---|---|---|
| `beta.badge` | Beta | Beta |
| `beta.title` (Seitentitel) | Beta · Wir wollen weg | Beta · When do we go? |
| `beta.code.heading` | Willkommen in der Beta! | Welcome to the beta! |
| `beta.code.intro` | Mit {product} findet eure Gruppe den Termin für den gemeinsamen Urlaub. Gib den Beta-Code aus deiner Einladung ein. | With {product}, your group finds the dates for your trip together. Enter the beta code from your invite. |
| `beta.code.label` | Beta-Code | Beta code |
| `beta.code.hint` | Steht in der Nachricht, mit der du den Link bekommen hast. | It's in the message you got the link with. |
| `beta.code.submit` | Weiter | Continue |
| `beta.code.haveAccount` | Schon ein Konto? Anmelden | Already have an account? Sign in |
| `beta.code.errorEmpty` | Bitte gib den Beta-Code ein. | Please enter the beta code. |
| `beta.code.errorWrong` | Dieser Beta-Code stimmt nicht. Schau nochmal in die Nachricht mit dem Link. | That beta code isn't right. Check the message with the link again. |
| `beta.code.errorRate` | Zu viele Versuche. Bitte versuch es in {min} Minuten nochmal. | Too many attempts. Please try again in {min} minutes. |
| `beta.code.errorFull` | Die Beta ist gerade voll. Melde dich bei der Person, die dir den Link geschickt hat. | The beta is full right now. Get in touch with the person who sent you the link. |
| `beta.privacy.heading` | Kurz zum Datenschutz | Privacy in short |
| `beta.privacy.p1` | Wir speichern nur, was die App braucht: E-Mail, deinen Namen und was du in Reisen einträgst. | We only store what the app needs: your email, your name and what you add to trips. |
| `beta.privacy.p2` | Deine Angaben sehen nur die Leute in deinen Reisen. | Only the people in your trips see what you add. |
| `beta.privacy.p3` | Keine Werbung, kein Tracking. | No ads, no tracking. |
| `beta.privacy.p4` | {Hosting-Zeile – Operations} | {Hosting line – Operations} |
| `beta.privacy.p5` | Es ist eine Test-Version: Am Ende der Beta löschen wir alle Daten. Du kannst dein Konto jederzeit selbst löschen. | This is a test version: when the beta ends, we delete all data. You can delete your account yourself at any time. |
| `beta.privacy.more` | Alles Weitere: Datenschutzhinweis | All the details: privacy notice |
| `beta.privacy.consent` | Ich habe das gelesen und bin einverstanden. | I've read this and I agree. |
| `beta.privacy.errorConsent` | Bitte bestätige kurz, dass du einverstanden bist. | Please confirm that you agree. |
| `beta.privacy.toggle` (W03 Z4a) | Kurz zum Datenschutz | Privacy in short |
| `beta.invite.noCode` (W03 Z1) | {name} hat dich zur Beta eingeladen – du brauchst keinen Beta-Code. | {name} invited you to the beta – you don't need a beta code. |
| `beta.signup.missingHeading` | Fast – dir fehlt noch der Beta-Code | Almost – you still need a beta code |
| `beta.signup.missingText` | Zu {email} gibt es noch kein Konto. Gerade sind wir in einer geschlossenen Beta – dafür brauchst du einen Beta-Code. | There's no account for {email} yet. We're in a closed beta right now – you need a beta code to join. |
| `beta.signup.missingCta` | Beta-Code eingeben | Enter beta code |
| `beta.signup.missingInvite` | Du hast einen Einladungslink zu einer Reise? Öffne einfach den. | Got an invite link to a trip? Just open that. |
| `beta.login.firstTime` (W02 Schritt E-Mail) | Zum ersten Mal hier? Mit Beta-Code registrieren | First time here? Sign up with a beta code |
| `beta.invite.needCode` (nur Variante streng) | Neu hier? Für die Beta brauchst du einen Beta-Code – frag {name} danach. | New here? You need a beta code for the beta – ask {name} for it. |
| `beta.landing.note` | Wir sind gerade in einer geschlossenen Beta. Den Beta-Code bekommst du von uns. | We're in a closed beta right now. You'll get the beta code from us. |
| `beta.landing.cta` | Ich habe einen Beta-Code | I have a beta code |
| `beta.landing.signIn` | Schon dabei? Anmelden | Already in? Sign in |
| `login.code.pwaNote` | Bitte den Code eingeben – der Link in der Mail öffnet Safari statt der App. | Please enter the code – the link in the email opens Safari, not the app. |
| `login.app.heading` | Schön, dass du die App hast! | Great to have you in the app! |
| `login.app.intro` | Melde dich hier einmal an – mit deiner E-Mail und einem Code. | Sign in here once – with your email and a code. |
| `login.app.newHere` | Neu hier? Beta-Code eingeben | New here? Enter beta code |
| `magic.pwaNote` | Du nutzt die App auf dem Home-Bildschirm? Dann gib dort lieber den 6-stelligen Code aus der Mail ein. Dieser Link meldet dich nur hier in Safari an. | Using the app on your Home Screen? Then enter the 6-digit code from the email there instead. This link only signs you in here in Safari. |
| `magic.pwaButton` | Trotzdem hier anmelden | Sign in here anyway |
| `install.title` (Seitentitel) | App installieren · Wir wollen weg | Install the app · When do we go? |
| `install.heading.ios` | Hol dir die App auf den Home-Bildschirm | Add the app to your Home Screen |
| `install.heading.android` | Hol dir die App auf den Startbildschirm | Add the app to your home screen |
| `install.intro` | Dann startet {product} wie eine App – ohne Adresszeile, mit eigenem Symbol. | Then {product} opens like an app – no address bar, with its own icon. |
| `install.ios.step0` | Du bist in WhatsApp? Steht oben „Fertig“? Dann tippe unten rechts auf das Kompass-Symbol – die Seite öffnet sich in Safari. | In WhatsApp? See "Done" at the top? Tap the compass icon at the bottom right – the page opens in Safari. |
| `install.ios.step1` | Tippe unten auf ⋯ und dann auf „Teilen“. Siehst du das Teilen-Symbol direkt? Dann gleich darauf tippen. | Tap ⋯ at the bottom, then "Share". See the Share icon right away? Just tap it. |
| `install.ios.step2` | Wähle „Zum Home-Bildschirm“ (evtl. nach unten scrollen oder „Mehr“ tippen). | Choose "Add to Home Screen" (you may need to scroll down or tap "More"). |
| `install.ios.step3` | „Als Web-App öffnen“ an lassen und oben rechts auf „Hinzufügen“ tippen. | Leave "Open as Web App" on and tap "Add" at the top right. |
| `install.ios.step4` | Öffne die App über das neue Symbol und melde dich dort einmal mit deinem Code an. | Open the app from the new icon and sign in there once with your code. |
| `install.android.button` | App installieren | Install app |
| `install.android.manual` | Tippe oben rechts auf ⋮ und dann auf „App installieren“ oder „Zum Startbildschirm hinzufügen“. | Tap ⋮ at the top right, then "Install app" or "Add to home screen". |
| `install.android.installing` | Die App wird installiert. | Installing the app. |
| `install.done` | Fertig – ist drauf | Done – it's on my screen |
| `install.later` | Später | Later |
| `install.menu` (Avatar-Menü) | App installieren | Install the app |
| `install.inapp.heading` | Öffne die Seite in Safari | Open this page in Safari |
| `install.inapp.headingAndroid` | Öffne die Seite in Chrome | Open this page in Chrome |
| `install.inapp.text` | Hier in {app} lässt sich die App nicht installieren. | You can't install the app from inside {app}. |
| `install.inapp.textGeneric` | In dieser Ansicht lässt sich die App nicht installieren. | You can't install the app from this view. |
| `install.inapp.step1` | Tippe auf ⋯ (oben oder unten rechts). | Tap ⋯ (top or bottom right). |
| `install.inapp.step2` | Wähle „In Safari öffnen“ bzw. „Im Browser öffnen“. | Choose "Open in Safari" or "Open in browser". |
| `install.inapp.copy` | Link kopieren | Copy link |
| `install.inapp.copyHint` | Klappt nicht? Link kopieren und in Safari einfügen. | Doesn't work? Copy the link and paste it into Safari. |
| `install.inapp.relogin` | In Safari meldest du dich einmal neu an – mit Code. | In Safari you'll sign in once more – with a code. |
| `install.inapp.skip` | Weiter ohne App | Continue without the app |
| `install.inviteHint` (W03, iOS) | Du hast die App schon auf dem Home-Bildschirm? Link kopieren und in der App unter „Meine Reisen → Einladungslink einfügen“ einfügen. | Already have the app on your Home Screen? Copy the link and paste it in the app under "My trips → Paste invite link". |
| `pwa.paste.button` | Einladungslink einfügen | Paste invite link |
| `pwa.paste.intro` | Links aus WhatsApp oder Mails öffnen sich in Safari. Kopier den Link und füg ihn hier ein. | Links from WhatsApp or emails open in Safari. Copy the link and paste it here. |
| `pwa.paste.label` | Link | Link |
| `pwa.paste.paste` | Einfügen | Paste |
| `pwa.paste.open` | Öffnen | Open |
| `pwa.paste.error` | Das ist kein Einladungslink von {product}. | That's not an invite link from {product}. |
| `pwa.offline.title` (Seitentitel) | Keine Verbindung · Wir wollen weg | No connection · When do we go? |
| `pwa.offline.heading` | Keine Verbindung | No connection |
| `pwa.offline.text` | {product} braucht Internet, um eure Reisen zu zeigen. Prüf WLAN oder mobile Daten. | {product} needs the internet to show your trips. Check your Wi-Fi or mobile data. |
| `pwa.offline.retry` | Nochmal versuchen | Try again |
| `pwa.offline.auto` | Sobald du wieder online bist, geht es automatisch weiter. | As soon as you're back online, it continues automatically. |
| `common.back` | Zurück | Back |
| `feedback.menu` | Feedback geben | Give feedback |
| `feedback.heading` | Feedback geben | Give feedback |
| `feedback.intro` | Was ist dir aufgefallen? Schreib uns direkt – gern mit Screenshot. | Noticed something? Message us directly – screenshots welcome. |
| `feedback.whatsapp` | Per WhatsApp schreiben | Message on WhatsApp |
| `feedback.mail` | Per E-Mail schreiben | Send an email |
| `feedback.privacy` | Wir sehen dabei nur, was du selbst schickst. | We only see what you send yourself. |
| `feedback.helpBox` (W15) | Du testest die Beta – danke! | You're testing the beta – thank you! |
| `help.app.q` (W15 `#app`) | Wie lege ich die App auf den Home-Bildschirm? | How do I add the app to my Home Screen? |
| `help.app.a` | iPhone: In Safari auf ⋯ → „Teilen“ → „Zum Home-Bildschirm“. Android: Menü ⋮ → „App installieren“. Danach öffnest du {product} über das Symbol. Auf dem iPhone meldest du dich dort einmal mit Code an. | iPhone: in Safari tap ⋯ → "Share" → "Add to Home Screen". Android: menu ⋮ → "Install app". Then open {product} from the icon. On iPhone, sign in there once with a code. |
| `help.app.installed` | Du nutzt die App schon vom Home-Bildschirm – alles erledigt. | You're already using the app from your Home Screen – all set. |
| `account.version` | Version {version} (Beta) · {build} | Version {version} (beta) · {build} |

Längen: alle Tastenbeschriftungen ≤ 28 Zeichen (ux-spec §10.4); `install.done` EN ist die längste (27). Glossar: „Home-Bildschirm“ (iOS-Begriff) / „Startbildschirm“ (Android-Begriff) – beide bewusst je Plattform; „Beta-Code“ / „beta code“ neu im Glossar (ux-spec §15).

---

## F. Barrierefreiheit (WCAG 2.2 AA)

- **Beta-Code-Feld:** sichtbares `<label>`, Hilfetext per `aria-describedby`, Fehler `aria-invalid` + Text am Feld, Fokus bei Fehler ins Feld (ux-spec §5.1). Kein Zeitlimit beim Eintippen (Beta-Pass 24 h ist großzügig; 2.2.1).
- **Zustimmung:** natives `<input type="checkbox">` mit `<label>` über die ganze Zeile (Zielgröße ≥ 44 px), nicht vorbelegt; Fehlermeldung mit `aria-describedby` verknüpft. Die Kurzfassung ist eine echte Liste; der Häkchen-Glyph ist `aria-hidden`.
- **Install-Anleitung:** Schritte als `<ol>`; Icons der iOS-Bedienelemente (⋯, Teilen) **immer mit Wortbezeichnung** im Text. Skizzen: `<img alt>` mit Inhalt, z. B. «Safari-Leiste unten, das Symbol mit drei Punkten rechts ist hervorgehoben.» / «Safari bar at the bottom, the three-dots button on the right is highlighted.» Keine Information nur im Bild (1.1.1). Keine Animation der Skizzen (bzw. nur bei erlaubter Bewegung, Motion-Katalog).
- **Sheets** (Feedback, In-Safari-öffnen, Einladungslink einfügen): wie ux-spec §4.2 – `role="dialog"`, `aria-modal`, Fokus auf Überschrift/Feld, Esc/Zurück schließt, Fokus zurück zum Auslöser.
- **Beta-Etikett:** als Text lesbar, Teil des Link-Namens (D.1); nicht nur Farbe.
- **Offline-Seite:** `<h1>` erhält Fokus; Statuszeile `role="status"`; „Nochmal versuchen“ als echter Button mit `aria-busy` beim Laden; Seite funktioniert ohne JS (Reload per Formular-GET).
- **Statusleisten-Band:** reine Fläche, `aria-hidden`; überdeckt nie Fokus-Rahmen (sticky Kopf mit Safe Area ist Teil von ux-spec §7.2 „Fokus nicht verdeckt“, 2.4.11).
- **Zurück-Wege:** immer als Link/Button mit Text „Zurück“ bzw. Zielname (nicht nur Pfeil); in der Lesereihenfolge zuerst (2.4.3).
- **Ausrichtung:** Hoch- und Querformat (1.3.4); Safe-Area-Ränder seitlich beachtet.
- **Zoom/Text:** 200 % Text auf allen neuen Seiten ohne Abschneiden; Skizzen dürfen mitwachsen (max. Inhaltsbreite).
- **Sprache:** Erkennung der Plattform ändert nur Texte, nie Bedienreihenfolge; `lang` des Dokuments wie gehabt.

---

## G. Gerätetests (Reviewer/Developer, vor Beta-Start)

| Nr. | Test | Gerät | Erwartung |
|---|---|---|---|
| G-1 | `/beta` → Registrierung komplett in Safari | iPhone, aktuelles iOS | A.0 ohne Hänger, `/install` erscheint einmal |
| G-2 | Installieren nach B.2, App starten | iPhone | Symbol + Name korrekt (DE/EN), Start ohne Adresszeile, Statusleiste weiß auf Indigo, A.7 bzw. direkt angemeldet (Ergebnis notieren → B-E3 ggf. vereinfachen) |
| G-3 | Link aus WhatsApp öffnen | iPhone | Klären, ob WhatsApp-Vorschau oder Safari; Schritt 0 passt zur echten Oberfläche (Wortlaut „Fertig“, Kompass) |
| G-4 | Code in der App aus Mail-Vorschlag der Tastatur | iPhone | Code-Vorschlag erscheint, Auto-Absenden bei 6 Ziffern |
| G-5 | Magic Link aus Mail tippen, Anforderung kam aus App | iPhone | Safari öffnet A.6 mit Hinweis |
| G-6 | Flugmodus, App starten | iPhone + Android | Offline-Seite, kein weißer Bildschirm; WLAN an → lädt automatisch |
| G-7 | Safe Areas Hoch/Quer | iPhone mit Dynamic Island + Home-Indikator | keine Taste unter Notch/Indikator, Werkzeugleiste W08 frei |
| G-8 | Zurück-Wege C.5 (jede Route einmal) | iPhone App-Modus | nirgends Sackgasse |
| G-9 | ICS-Download W11 in der App | iPhone App-Modus | Ergebnis an UX (C.6) |
| G-10 | Externe Links (Unterkunft, Karten, WhatsApp, Feedback) | iPhone App-Modus | öffnen extern bzw. Safari-Ansicht, „Fertig“ führt in die App zurück |
| G-11 | Einladungslink einfügen | iPhone App-Modus | Beitritt in der App möglich |
| G-12 | Android Chrome: `/install` → „App installieren“ | Android | nativer Dialog, danach kein Menüeintrag mehr |
| G-13 | Dark Mode: Start, Statusleiste, Theme-Farbe | iPhone + Android | kein heller Blitz, Statusleiste lesbar |
| G-14 | VoiceOver: `/beta`, `/install`, Offline | iPhone | Reihenfolge, Namen, Fehleransage wie F |

---

## H. Übergabe & offene Punkte

**Baureif:** A.0–A.10 (Beta-Einstieg, Datenschutz-Zustimmung, Login-Abweichungen, Einladungsweg nach B-E2), B.1–B.6 (Install-Anleitung, Regeln), C.1–C.9 (PWA-Verhalten), D (Beta-Etikett, Feedback), E (Texte), F, G.

**Abhängig vom Designer (abstimmung-design §17):** D-72 Beta-Etikett, **D-73 Install-Skizzen (blockierend für B.2 in der Endfassung; bis dahin Text-only-Anleitung baubar)**, D-74 App-Symbol-Varianten, D-75 Statusleisten-Band + Theme-Farbe dunkel, D-76 Startbild/`background_color` + Offline-Illustration, D-77 optionale Illustration `/beta`, D-78 Icons (`share-ios`, `plus-square`, `external`, `feedback`), D-79 maskable/monochrome Symbol, D-80 Sichtprüfung `/beta` + `/install` bei 320 px.

**Für den CEO zu entscheiden / bestätigen:**
1. **B-E2** – Einladung ersetzt Beta-Code (Empfehlung) vs. „Variante streng“ (Stand Ops-Entwurf). Danach gleicht Operations `beta-anleitung.md` §7/§8 an (Tabelle 0.1).
2. **Löschversprechen** „Am Ende der Beta löschen wir alle Daten“ (A.4) – mit Operations klären (Termin/Weg) oder Satz streichen.
3. **Feedback-Kanal** – Nummer/Adresse des Auftraggebers als Umgebungsvariable (Operations).
4. Beta-Code: **ein gemeinsamer Code** (Annahme) oder einer pro Person; Limit „Beta voll“ ja/nein (Operations).

**Nicht Teil von W23:** Basic-Auth-Entfernung, Mailversand-Einrichtung, Rate-Limit-Werte, Hosting (Operations); W16/W20 bleiben unverändert (Reisedaten aus = W20 H.1).
