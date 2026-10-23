# Beta-Anleitung – geschlossene Freundes-Beta (Gate G0) auf Vercel + Neon

Stand: 2026-10-23 (v1.0) · Gepflegt von: Operations Manager · Zielgruppe: Teil A Auftraggeber (Windows-PC + iPhone, keine Programmierkenntnisse nötig), Teil B Developer/Reviewer, Teil C alle · Entscheidung: CEO + Auftraggeber 2026-10-23 („Stufe B“, Gate **G0 Beta**) · Oberfläche und Texte: [W23 – Beta & Installation](../ux/wireframes/w23-beta-und-installation.md) · Technik im Detail: [deployment.md §0.12](deployment.md) · Recht: [compliance-checklist.md §13](compliance-checklist.md) · Gate: [go-live.md – Gate G0](go-live.md)

Mit dieser Anleitung bekommt die App eine **eigene Adresse** (z. B. `https://app.deine-domain.de`), verschickt **echte Login-Mails** und lässt sich auf dem iPhone **wie eine App auf den Home-Bildschirm legen**. Deine Freundinnen und Freunde registrieren sich mit einem **Beta-Code**, den nur ihr kennt. Die bestehende Vorschau (Demo-Daten, Zugangspasswort) bleibt unverändert daneben bestehen.

**Gut zu wissen**

- **Kosten: ca. 5 € pro Jahr** für die Domain. Mail-Dienst (Lettermint „Developer“), Vercel „Hobby“ und Neon „Free“ kosten 0 €. Bezahlen musst du nur die Domain.
- **Echte Daten – aber nur im Freundeskreis.** In der Beta tragen echte Menschen echte Namen, E-Mail-Adressen, freie Tage und Kosten ein. Deshalb gibt es einen kurzen **Datenschutzhinweis mit deinem Namen**, und jede Person stimmt bei der Registrierung zu. Ausweis-/Passdaten („Reisedaten“) sind in der Beta **ausgeschaltet**.
- **Kein Versprechen „am Ende löschen wir alles“.** Es gelten die normalen Löschfristen der App (Reisen 90 Tage nach Reiseende, Konten nach 24 Monaten ohne Anmeldung, jede Person kann ihr Konto jederzeit selbst löschen).
- **Reihenfolge:** Kapitel 1–3 (Domain, Mail, Datenbank) kannst du **sofort** erledigen. Kapitel 4–7 (Vercel) erst, **wenn das Team Bescheid gibt**, dass der Beta-Modus fertig und geprüft ist (Status-Board: P1-B0). Kapitel 8 (Freunde einladen) erst nach der gemeinsamen Durchsicht von Gate G0 mit dem CEO.
- **Zeitbedarf:** ca. 60–90 Minuten, verteilt auf zwei Termine. Dazwischen kann die Prüfung der Mail-Domain einige Minuten bis wenige Stunden dauern.
- Oberflächen ändern sich gelegentlich: Heißt ein Knopf etwas anders, nimm den mit der ähnlichsten Beschriftung.
- **Geheime Werte** (alles in der Tabelle in Kapitel 4 mit „geheim: ja“) **nie** in Chats, Mails oder Screenshots teilen – auch nicht mit dem Team. Einzige Ausnahme: der **Beta-Code**, den du bewusst an Testpersonen weitergibst.
- Diese Anleitung ist keine Rechtsberatung (siehe [compliance-checklist.md](compliance-checklist.md)).

### Was du kaufen bzw. anlegen musst

| # | Was | Wo (Empfehlung) | Kosten (Stand 2026-10-23, vor Kauf prüfen) | Kapitel |
|---|---|---|---|---|
| 1 | Domain, z. B. `wirwollenweg.de` (Verfügbarkeit prüfen) | **INWX** (Berlin) – Alternative **Hetzner** | INWX: 5,02 €/Jahr (Angebot auf der INWX-Seite; Verlängerung laut Preisvergleich ca. 4–5 €) · Hetzner: 5,38 €/Jahr | 1 |
| 2 | Konto beim Mail-Dienst | **Lettermint** (Niederlande), Tarif „Developer“ | 0 € (300 Mails/Monat, ohne Kreditkarte); falls mehr nötig: Starter 10 €/Monat | 2 |
| 3 | Eigenes Neon-Projekt für die Beta | Neon (dein bestehendes Konto) | 0 € | 3 |
| 4 | Zweites Vercel-Projekt für die Beta | Vercel (dein bestehendes Konto, „Hobby“) | 0 € (Entscheidung E-G0-1: alternativ „Pro“ 20 $/Monat, Teil C) | 5 |
| 5 | Festlegen: Beta-Code, dein Name + Kontakt-Mail, WhatsApp-Nummer/Mail für Feedback | – | – | 4 |

### Checkliste zum Abhaken

- [ ] Domain gekauft, Zwei-Faktor-Anmeldung beim Registrar an (Kapitel 1)
- [ ] Lettermint-Konto, AVV (DPA) gespeichert, Absender-Domain **verifiziert** (SPF, DKIM, DMARC), Tracking aus, SMTP-Token notiert (Kapitel 2)
- [ ] Neon-Projekt `wir-wollen-weg-beta` (Frankfurt, Postgres 18), zwei Adressen kopiert (Kapitel 3)
- [ ] **Team sagt: Beta-Modus ist fertig** (P1-B0 gemergt, Zweig `beta` existiert)
- [ ] Zufallswerte, Beta-Code, Name/Kontakt, Feedback-Kontakt in der Notiz (Kapitel 4)
- [ ] Vercel: KI-Training abgeschaltet, Projekt `wir-wollen-weg-beta` mit Variablen angelegt, Zweig `beta` eingestellt (Kapitel 5)
- [ ] `app.<deine-domain>` mit Vercel verbunden, `.vercel.app`-Adresse leitet um (Kapitel 6)
- [ ] Eigener Test: über `/beta` registriert, Mail kam an, am iPhone auf dem Home-Bildschirm angemeldet (Kapitel 7)
- [ ] CEO hat das Gate G0 mit dir durchgesehen ([go-live.md](go-live.md)) – **erst dann** Freunde einladen (Kapitel 8)

---

# Teil A – Einrichtung durch den Auftraggeber

## 1. Domain kaufen (INWX)

Warum INWX: deutscher Anbieter (Berlin), günstige `.de`-Domains, DNS-Verwaltung inklusive, Zwei-Faktor-Anmeldung, DNSSEC, kein Paketzwang. Gleichwertige Alternative: **Hetzner** (`.de` 5,38 €/Jahr; praktisch, falls der spätere Echtbetrieb ohnehin zu Hetzner geht). Bitte **nicht** über Vercel oder andere US-Anbieter kaufen (DNS läge dann nicht in der EU), und Vorsicht bei Lockpreisen im ersten Jahr (IONOS, Strato: danach deutlich teurer).

**Welcher Name?** Die Domain soll später auch für den echten Start (Go-Live G1) taugen. Vorschläge: `wirwollenweg.de`, `wir-wollen-weg.de`. Die Markenprüfung beider Namen (PRD Q11) bleibt Pflicht vor dem öffentlichen Start – für die private Beta reicht die Domain.

1. Öffne <https://www.inwx.de> → oben im Suchfeld den Wunschnamen eingeben (z. B. `wirwollenweg`) → **„Suchen“**.
2. Ist die `.de`-Domain frei: **„In den Warenkorb“** → **„Zur Kasse“**. Vorher den angezeigten **Verlängerungspreis** ansehen (sollte im Bereich 4–6 €/Jahr liegen).
3. Konto anlegen (Name, Anschrift, E-Mail, Zahlungsart). Deine Anschrift ist für die Registrierung Pflicht; bei `.de`-Domains veröffentlicht die DENIC sie **nicht** öffentlich – ein kostenpflichtiger „Whois-Schutz“ ist daher **nicht** nötig.
4. Bei den Optionen: **keine** Zusatzpakete (Webhosting, E-Mail-Paket, SSL-Zertifikat, Whois-Privacy) – brauchen wir nicht. Nameserver: **INWX-Standard** lassen.
5. Kauf abschließen. Nach einigen Minuten steht die Domain unter **„Domains“** in deinem Konto.
6. **Zwei-Faktor-Anmeldung einschalten:** **„Konto“** (bzw. Profil) → **„Sicherheit“** → **„Zwei-Faktor-Authentifizierung“** → mit einer Authenticator-App (z. B. Microsoft/Google Authenticator) einrichten. Wiederherstellungscodes sicher ablegen.
7. Optional, empfohlen: In der Domain-Verwaltung **„DNSSEC“** aktivieren (falls dort angeboten, ein Klick).

**So trägst du später DNS-Einträge ein** (brauchst du in Kapitel 2 und 6): **„Domains“** → bei deiner Domain **„DNS“** (bzw. „Nameserver-Einträge“) → **„Eintrag hinzufügen“** → **Typ** wählen (`TXT`, `CNAME` …) → **Name** und **Inhalt/Wert** einfügen → **„Speichern“**.

> **Wichtigste Falle:** Ins Feld **„Name“** gehört nur der Teil **vor** deiner Domain. Zeigt der Mail-Dienst z. B. `lm1._domainkey.mail.wirwollenweg.de`, dann trägst du bei INWX `lm1._domainkey.mail` ein – INWX hängt `wirwollenweg.de` selbst an. Sonst entstünde `….wirwollenweg.de.wirwollenweg.de`.

---

## 2. Mail-Dienst einrichten (Lettermint) – inkl. SPF, DKIM, DMARC

Warum Lettermint: niederländische Firma ohne US-Mutter, Mails laut Anbieter nur in der EU, auf Login-/Service-Mails spezialisiert, kostenloser Tarif **„Developer“ mit 300 Mails pro Monat** ohne Kreditkarte (die frühere Grenze von 10 Mails pro Tag gibt es nicht mehr), AVV (DPA) als Teil der Bedingungen. Für 10–30 Testpersonen reicht das (Schätzung 50–150 Mails/Monat: Registrierung 1 Mail, danach bleibt man meist 90 Tage angemeldet). Derselbe Dienst ist für den späteren Echtbetrieb geplant – kein Umbau nötig. Ausweichoptionen (Brevo, Scaleway): [deployment.md §0.12.1](deployment.md).

Wir verschicken von einer **Unteradresse** `mail.<deine-domain>` (z. B. `login@mail.wirwollenweg.de`). Das schützt den Ruf der Hauptdomain.

**Was die drei Abkürzungen bedeuten** (du musst sie nur eintragen, nicht verstehen):

| Eintrag | Wofür | Wer liefert den Wert |
|---|---|---|
| **SPF** (`TXT`) | „Lettermint darf für diese Domain Mails verschicken.“ | Lettermint zeigt ihn an (oft am Return-Path-Eintrag) |
| **DKIM** (`TXT` oder `CNAME`, Name enthält `_domainkey`) | digitale Unterschrift jeder Mail – Empfänger sehen, dass sie echt ist | Lettermint zeigt ihn an |
| **DMARC** (`TXT`, Name `_dmarc`) | sagt Gmail, iCloud & Co., was mit gefälschten Mails passieren soll | du trägst ihn selbst ein (Schritt 7) |

Ohne diese Einträge landen Login-Mails im Spam oder kommen gar nicht an.

1. Öffne <https://lettermint.co> → **„Sign up“ / „Kostenlos starten“** → Konto anlegen (am besten mit deiner normalen E-Mail-Adresse). Tarif **„Developer“ (Free)** wählen.
2. **Zwei-Faktor-Anmeldung** in den Konto-Einstellungen einschalten (falls angeboten).
3. **AVV sichern:** Öffne <https://lettermint.co/dpa>, speichere die Seite als PDF (Strg+P → „Als PDF speichern“) mit Datum im Dateinamen in einem Ordner **außerhalb** des Projekts (z. B. „Beta – Verträge“). Falls Lettermint im Konto „DPA unterzeichnen“ anbietet: unterzeichnen und das PDF ebenso ablegen.
4. **Projekt anlegen** (falls Lettermint danach fragt), Name z. B. `wir-wollen-weg-beta`.
5. **Domain hinzufügen:** **„Domains“** → **„Add domain“** → `mail.<deine-domain>` eingeben (z. B. `mail.wirwollenweg.de`).
6. Lettermint zeigt jetzt eine Liste von **DNS-Einträgen** (typisch: ein oder zwei **DKIM**-Einträge, ein **Return-Path**-Eintrag als `CNAME`, ein **SPF**-Eintrag als `TXT`). Trage **jeden** davon bei INWX ein (Kapitel 1, „So trägst du DNS-Einträge ein“) – Typ, Name (nur der Teil vor deiner Domain!) und Wert genau kopieren.
7. **DMARC** eintragen (falls Lettermint ihn nicht schon vorgibt): Typ `TXT`, Name `_dmarc.mail`, Wert `v=DMARC1; p=none; adkim=s; aspf=r`. Nach 2–4 Wochen ohne Zustellprobleme sagt dir das Team, ob du `p=none` auf `p=quarantine` änderst.
8. Zurück bei Lettermint: **„Verify“ / „Prüfen“** klicken. Es kann **einige Minuten bis wenige Stunden** dauern, bis alle Einträge grün sind. Einfach später erneut prüfen.
9. **Tracking ausschalten:** In den Projekt- bzw. Domain-Einstellungen **Öffnungs-Tracking („Open tracking“)** und **Klick-Tracking („Click tracking“)** ausschalten, falls vorhanden. Login-Mails dürfen nicht verfolgt werden.
10. **SMTP-Zugang (Token) erzeugen:** **„SMTP“** bzw. **„API tokens“** → neues Token für das Projekt anlegen → den angezeigten Wert **sofort** in deine Notiz schreiben (`SMTP_PASSWORD=…`). Benutzername ist laut Lettermint-Doku `lettermint`, Server `smtp.lettermint.co`.
11. **Testmail:** Sobald die Beta läuft (Kapitel 7), schickst du dir je einen Login-Code an eine Gmail-, eine iCloud- und eine GMX/web.de-Adresse (falls vorhanden). Das Team sagt dir, wie du den „Original-Quelltext“ öffnest – darin muss `spf=pass`, `dkim=pass`, `dmarc=pass` stehen.

> Lettermint kann neue Konten vor dem ersten Versand kurz prüfen. Falls ein Hinweis wie „Account under review“ erscheint: abwarten bzw. die Rückfrage beantworten (Zweck: „Login-Codes für eine private Web-App, ca. 100–300 Mails/Monat“).

---

## 3. Eigene Datenbank für die Beta (Neon)

**Empfehlung: ein eigenes Neon-Projekt** – nicht nur ein „Branch“ im Vorschau-Projekt.

| | Eigenes Projekt *(Empfehlung)* | Branch im Vorschau-Projekt |
|---|---|---|
| Zugangsdaten | eigene – wer die Vorschau kennt, kommt nicht an echte Daten | teilt Konto/Rollen mit der Vorschau |
| „Demo zurücksetzen“ / Demo-Daten der Vorschau | können die Beta nie berühren | Verwechslungsgefahr |
| Kontingent (Neon Free) | eigene 0,5 GB + 100 Rechenstunden pro Monat | teilt sich das Kontingent der Vorschau |
| Aufräumen später | ein Projekt löschen | Branch löschen, Rest bleibt |

1. <https://console.neon.tech> → **„New Project“**.
2. **Name:** `wir-wollen-weg-beta` · **Postgres-Version: 18** (Pflicht) · **Region: AWS Europe Central 1 (Frankfurt)** → **„Create“**.
3. Die zwei Adressen kopieren **genau wie in der Vorschau-Anleitung Kapitel 1** ([vorschau-anleitung.md](vorschau-anleitung.md#1-datenbank-adressen-aus-neon-holen)) – aber aus dem **neuen** Projekt:
   - `DATABASE_URL=` (mit `-pooler`)
   - `DATABASE_URL_UNPOOLED=` (ohne `-pooler`)
4. **AVV sichern:** Öffne <https://neon.com/dpa> und lege die Seite als PDF in deinen Ordner „Beta – Verträge“.
5. Falls noch nicht geschehen: Bei Neon **Zwei-Faktor-Anmeldung** einschalten (bzw. per GitHub anmelden und dort 2FA nutzen).

> **Nicht** die Vorschau-Datenbank für die Beta verwenden.

---

## 4. Notiz mit allen Werten vorbereiten (erst nach „Beta-Modus ist fertig“)

Öffne eine leere Notiz (Editor) und lege diese **Namen** an. Rechts vom `=` setzt du deine Werte ein (spitze Klammern weglassen). Feste Werte (`beta`, `smtp`, `smtp.lettermint.co` …) genau so übernehmen.

```text
APP_ENV=beta
APP_URL=https://app.<deine-domain>
MAIL_TRANSPORT=smtp
SMTP_HOST=smtp.lettermint.co
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=lettermint
SMTP_PASSWORD=<Lettermint-Token>
MAIL_FROM=login@mail.<deine-domain>
MAIL_REPLY_TO=<deine normale Mail-Adresse>
CONTACT_EMAIL=<deine Kontakt-Adresse>
LEGAL_OPERATOR_NAME=<Vorname Nachname>
BETA_ACCESS_CODES=<dein Beta-Code>
TRAVEL_DATA_ENABLED=false
FEEDBACK_WHATSAPP_NUMBER=<deine Handynummer, nur Ziffern, mit 49 vorne>
FEEDBACK_EMAIL=<Adresse für Feedback>
BETTER_AUTH_SECRET=<neuer Zufallswert>
CRON_SECRET=<neuer Zufallswert>
DATABASE_URL=<aus Kapitel 3, mit -pooler>
DATABASE_URL_UNPOOLED=<aus Kapitel 3, ohne -pooler>
```

| Name | Was eintragen | geheim |
|---|---|---|
| `APP_ENV` | genau `beta` | nein |
| `APP_URL` | `https://app.` + deine Domain (kein `/` am Ende) | nein |
| `MAIL_TRANSPORT` | genau `smtp` | nein |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER` | genau wie oben (`smtp.lettermint.co`, `465`, `true`, `lettermint`) | nein |
| `SMTP_PASSWORD` | Lettermint-Token aus Kapitel 2, Schritt 10 | **ja** |
| `MAIL_FROM` | `login@mail.` + deine Domain | nein |
| `MAIL_REPLY_TO` | wohin Antworten auf Login-Mails gehen – z. B. deine normale Adresse (optional, Zeile darf fehlen) | nein |
| `CONTACT_EMAIL` | deine Kontakt-Adresse für Datenschutzhinweis und Hilfe (Testpersonen sehen sie) | nein |
| `LEGAL_OPERATOR_NAME` | **dein Vor- und Nachname** – erscheint als Verantwortlicher im Datenschutzhinweis. Steht absichtlich **nicht** im (öffentlichen) GitHub-Repository | nein |
| `BETA_ACCESS_CODES` | dein **Beta-Code** (siehe unten) | **ja** (nur an Testpersonen) |
| `TRAVEL_DATA_ENABLED` | genau `false` | nein |
| `FEEDBACK_WHATSAPP_NUMBER` | deine Handynummer für „Feedback geben“ per WhatsApp, **nur Ziffern** mit Ländervorwahl ohne `+` und ohne führende 0 (aus `0151 1234567` wird `491511234567`). Optional – ohne Zeile gibt es keine WhatsApp-Taste | nein (Testpersonen sehen sie) |
| `FEEDBACK_EMAIL` | Adresse für „Feedback geben“ per Mail; darf gleich `CONTACT_EMAIL` sein. Optional | nein |
| `BETTER_AUTH_SECRET` | **neuer** Zufallswert (nicht der aus der Vorschau!) | **ja** |
| `CRON_SECRET` | **neuer** Zufallswert | **ja** |
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED` | aus Kapitel 3 (Beta-Projekt!) | **ja** |

**Zufallswerte erzeugen:** wie in der [Vorschau-Anleitung Kapitel 2.2](vorschau-anleitung.md#22-zwei-zufallswerte-erzeugen-am-windows-pc) (PowerShell-Zeile, zweimal ausführen). **Neue** Werte nehmen, nicht die der Vorschau.

**Beta-Code festlegen:**

- **Ein gemeinsamer Code** für alle Testpersonen (einfach weiterzugeben).
- Mindestens **12 Buchstaben/Ziffern** (Bindestriche und Leerzeichen zählen nicht mit), gut abzutippen, z. B. zwei Wörter und eine Zahl: `Sonne-Koffer-27` (bitte **nicht** genau diesen nehmen). Die App startet nicht mit einem kürzeren Code.
- Groß-/Kleinschreibung, Leerzeichen und Bindestriche spielen bei der Eingabe keine Rolle – trotzdem keine Umlaute.
- Den Code nur **direkt** an Testpersonen geben, nicht in große Gruppen posten.
- **Code wechseln** (z. B. wenn er weitergegeben wurde): Kapitel 9.

**Bitte nicht eintragen:** `PREVIEW_ACCESS_PASSWORD`, `BETTER_AUTH_URL`, `AUTH_IP_HEADER`, `AUTH_TRUSTED_PROXIES`, `RETENTION_TOKEN`, `RATE_LIMIT_ENABLED`, `TRAVEL_DATA_KEYS`. **Nur wenn das Team es sagt:** `BETA_MAX_ACCOUNTS` (Höchstzahl Konten, Standard 50), `BETA_INVITE_SIGNUP` (Notschalter Einladungen, Kapitel 9), `PWA_SW_ENABLED`, `PASSWORD_BREACH_CHECK`, `APP_TIME_ZONE`, `MAIL_FROM_NAME_DE`/`_EN`.

---

## 5. Vercel: zweites Projekt für die Beta

### 5.1 Einmalig: KI-Training mit deinen Daten abschalten

Bei Vercel „Hobby“ ist laut Vercel-Bedingungen (Stand März 2026) standardmäßig erlaubt, Inhalte zum Training von KI-Modellen zu nutzen. Für echte Daten von Freunden **muss das aus**:

1. <https://vercel.com> → oben links dein Konto/Team auswählen → **„Settings“**.
2. **„Data Preferences“** (bzw. „Privacy“) → Schalter für **KI-/Modell-Training („Allow … to train …“)** und das **Teilen mit Dritten zu Trainingszwecken** **ausschalten** → speichern.
3. Falls es dieselbe Einstellung zusätzlich pro Projekt gibt: nach Schritt 5.2 auch im Beta-Projekt ausschalten.
4. Zwei-Faktor-Anmeldung: Vercel nutzt deinen GitHub-Login – bei GitHub **2FA** einschalten (GitHub → Settings → Password and authentication).

### 5.2 Projekt importieren

1. **„Add New…“** → **„Project“** → bei `wir-wollen-weg` auf **„Import“** (dasselbe Repository wie die Vorschau – das ist richtig so).
2. **Project Name:** `wir-wollen-weg-beta`. Framework, Root Directory, Build-Einstellungen **nicht ändern**.
3. **„Environment Variables“** aufklappen → alle Zeilen deiner Notiz aus Kapitel 4 auf einmal in das erste **„Key“**-Feld einfügen (Strg+V) – Vercel legt sie einzeln an.
4. Kontrolle: Es sind **20 Variablen** (18, wenn du die beiden `FEEDBACK_…` weglässt; eine weniger ohne `MAIL_REPLY_TO`), ohne Leerzeichen am Anfang/Ende, keine `<…>` mehr. Bietet Vercel bei einer Variable den Schalter **„Sensitive“** an, schalte ihn bei allen „geheim: ja“-Werten ein.
5. **„Deploy“** klicken. **Dieser erste Aufbau wird übersprungen oder schlägt fehl – das ist erwartet**, weil er den Zweig `main` nimmt. Weiter mit 5.3.

### 5.3 Zweig `beta` einstellen

Die Beta bekommt nicht jede Änderung sofort, sondern nur Stände, die das Team nach Prüfung in den Zweig **`beta`** übernimmt.

1. Projekt `wir-wollen-weg-beta` → **„Settings“** → **„Environments“** → **„Production“** → **„Branch Tracking“** (bei älterer Oberfläche: **„Settings“ → „Git“ → „Production Branch“**).
2. Zweig auf **`beta`** ändern → **„Save“**.
3. **„Deployments“** → **„Create Deployment“** (bzw. oben **„⋯“ → „Redeploy“**) → Zweig `beta` wählen → starten. Falls es diesen Knopf nicht gibt: dem Team Bescheid geben, es löst den Aufbau mit einem kleinen Push auf `beta` aus.
4. Warten (ca. 3–6 Min.). Im Protokoll siehst du `[vercel-build] migrations` und `next build` – **keine** „demo data“ (richtig so: in der Beta gibt es keine Demo-Personen).
5. Grün („Ready“) → weiter mit Kapitel 6. Rot → Kapitel 10, Fall B.

---

## 6. Eigene Adresse `app.<deine-domain>` verbinden

1. Vercel → Projekt `wir-wollen-weg-beta` → **„Settings“** → **„Domains“** → **„Add“** (bzw. „Add Domain“).
2. `app.<deine-domain>` eingeben (z. B. `app.wirwollenweg.de`) → **„Add“**. Fragt Vercel nach einer Umleitung von/zu `www`: **nein** bzw. **„Add domain only“**.
3. Vercel zeigt **„Invalid Configuration“** und darunter einen Eintrag vom Typ **`CNAME`** mit Name `app` und einem **Wert** (z. B. `cname.vercel-dns.com` oder ein längerer projekteigener Wert). **Diesen Wert** kopieren.
4. Bei INWX: Eintrag hinzufügen → Typ **`CNAME`**, Name **`app`**, Wert = kopierter Vercel-Wert → speichern.
5. Zurück in Vercel: nach einigen Minuten wechselt der Status auf **„Valid Configuration“**; das https-Zertifikat stellt Vercel selbst aus (kann bis zu ca. 30 Minuten dauern).
6. **Alte Adresse umleiten:** In derselben Domain-Liste steht auch `wir-wollen-weg-beta.vercel.app` (oder ähnlich). Dort **„Edit“** → **„Redirect to“** → `app.<deine-domain>` → **„Save“**. (Die App leitet zusätzlich selbst um.)
7. Die Hauptdomain selbst (`wirwollenweg.de` ohne `app.`) brauchst du für die Beta **nicht**. Bitte **keinen** `CAA`-Eintrag anlegen (der könnte Vercel das Zertifikat verbieten).
8. Hat sich `APP_URL` geändert oder hattest du sie anders eingetragen: korrigieren und **neu aufbauen** (Kapitel 10, Fall A).

---

## 7. Selbst testen – am PC und am iPhone

### 7.1 Am PC

1. `https://app.<deine-domain>` öffnen – **kein** Passwort-Fenster (anders als in der Vorschau), **kein** gelber Demo-Balken, neben dem Logo ein kleines **„Beta“**, auf der Startseite die Taste **„Ich habe einen Beta-Code“**.
2. **Datenschutz** öffnen: Dort steht **dein Name** als Verantwortlicher und deine Kontakt-Adresse. Steht dort `[PLATZHALTER …]`, sofort dem Team melden.
3. `https://app.<deine-domain>/beta` öffnen (oder „Ich habe einen Beta-Code“) → **Beta-Code** eingeben → **„Weiter“**.
   - Tippe absichtlich einmal einen **falschen** Code: Es muss sofort „Dieser Beta-Code stimmt nicht …“ erscheinen.
4. **„Kurz zum Datenschutz“** lesen → Häkchen setzen → **„Weiter“**.
5. Deine echte E-Mail-Adresse → **„Code senden“**. Die Mail kommt innerhalb von ca. 1 Minute von `login@mail.<deine-domain>` – **oben steht der 6-stellige Code**. **Nicht da?** Im **Spam-Ordner** nachsehen (Kapitel 10, Fall C).
6. Code eingeben → Namen eingeben → es erscheint einmal **„Hol dir die App auf den Home-Bildschirm“** (am PC einfach **„Später“**). Lege eine Test-Reise an.

### 7.2 Am iPhone (als App auf dem Home-Bildschirm)

1. In **Safari** `https://app.<deine-domain>` öffnen und **zuerst in Safari anmelden** (mit dem Code aus der Mail – du hast ja schon ein Konto).
2. **Teilen-Symbol** (Quadrat mit Pfeil, ggf. erst **„⋯“**) → **„Zum Home-Bildschirm“** → „Als Web-App öffnen“ an lassen → **„Hinzufügen“**. Die App erklärt das auch selbst unter Avatar-Menü → **„App installieren“**.
3. Vom Home-Bildschirm öffnen: Die App startet ohne Safari-Leiste. **Meist** bist du schon angemeldet – iOS übernimmt die Anmeldung aus Safari aber **nicht in jeder Version zuverlässig**. Siehst du „Schön, dass du die App hast!“, meldest du dich dort **einmal** mit E-Mail + Code an. Das ist normal.
4. **Später in der App neu anmelden?** Immer den **6-stelligen Code** eingeben (oft schlägt die Tastatur ihn „Aus Mail“ direkt vor). **Nicht auf den Link in der Mail tippen** – der öffnet Safari statt der App, und du wärst nur dort angemeldet.
5. **Einladungslinks** aus WhatsApp öffnen auf dem iPhone immer Safari. Entweder dort beitreten (mit Code anmelden) – oder den Link **kopieren** und in der App unter **„Meine Reisen“ → „Einladungslink einfügen“** einfügen.
6. **Offline-Test:** Flugmodus an → App öffnen → es erscheint „Keine Verbindung“. Flugmodus aus → die App lädt von selbst weiter. Deine Daten werden nicht auf dem Handy zwischengespeichert – ohne Netz sieht man nur diesen Hinweis.
7. **Feedback-Test:** Avatar-Menü → **„Feedback geben“** → „Per WhatsApp schreiben“ öffnet WhatsApp mit einem vorausgefüllten Text an deine Nummer.

Android (Chrome): Die App bietet nach der Registrierung **„App installieren“** an (oder Menü **⋮** → **„App installieren“**). Dort bleibt man in der App angemeldet; Code und Link funktionieren beide.

---

## 8. Testpersonen einladen

**Erst nach der Durchsicht von Gate G0 mit dem CEO** ([go-live.md](go-live.md)).

1. **Nachricht schicken** – am besten einzeln, nicht in eine große Gruppe (Vorlage aus W23 A.1, ergänzt um zwei Datenschutz-Sätze; `{…}` ersetzen):

   > Hey {Name}! Ich teste gerade eine kleine App, mit der man als Gruppe einen Urlaubstermin findet: „Wir wollen weg“. Magst du mitmachen?
   > 1. Öffne den Link am besten in **Safari**: https://app.{deine-domain}/beta
   > 2. Beta-Code: **{BETA-CODE}**
   > 3. Danach kannst du sie auf den Home-Bildschirm legen – die App erklärt dir, wie.
   > Feedback einfach hier in den Chat. Danke!
   >
   > Kurz zum Datenschutz: Das ist eine private Test-Version. Die Daten liegen in Frankfurt, die App läuft bei Vercel (US-Anbieter), Mails kommen über Lettermint (NL). Bitte keine Ausweis- oder Gesundheitsdaten in Notizen. Du kannst dein Konto jederzeit in der App löschen – Details unter „Datenschutz“.

   Englische Fassung: W23 A.1. Bequemer (optional): Link mit vorausgefülltem Code `https://app.{deine-domain}/beta#code={BETA-CODE}` – der Code steht trotzdem lesbar in der Nachricht.
2. **Wer weitere Freunde in eine Reise holt**, nutzt wie gewohnt den Einladungslink der Reise. Ob diese Neulinge **zusätzlich** den Beta-Code brauchen, entscheidest du (E-G0-2, Status-Board):
   - **Variante B – Einladungslink ersetzt den Beta-Code** *(Empfehlung UX, Operations trägt mit)*: Wer einen Einladungslink bekommt, registriert sich direkt dabei (nur Datenschutz-Häkchen). Die Höchstzahl an Konten (Standard 50) gilt trotzdem; bei Missbrauch gibt es einen Notschalter (Kapitel 9).
   - **Variante A – jeder braucht den Beta-Code**: Neulinge brauchen vorher eine Nachricht von dir oder der Orga mit dem Code; der Code wandert dadurch eher in Gruppenchats.
3. Rückmeldungen kommen über „Feedback geben“ per WhatsApp/Mail bei dir an. Sammle sie an einer Stelle und gib sie dem CEO (ohne Namen der Tester, wenn nicht nötig).

---

## 9. Pflege im Alltag

| Was | Wie |
|---|---|
| **Neue Versionen** | Das Team übernimmt geprüfte Stände in den Zweig `beta`; Vercel baut dann automatisch neu (3–6 Min.). Du musst nichts tun. Daten bleiben erhalten. |
| **Vor großen Updates (1 Klick, wenn der CEO darum bittet)** | Neon → Projekt `wir-wollen-weg-beta` → **„Branches“** → **„Create branch“** → Name z. B. `sicherung-2026-11-01` → **„Create“**. Das ist eine Sicherungskopie. Nach spätestens 30 Tagen wieder löschen (Neon Free erlaubt nur wenige Branches; Löschfristen). |
| **Beta-Code wechseln** | Vercel → Projekt → **„Settings“** → **„Environment Variables“** → `BETA_ACCESS_CODES` → **„Edit“** → **neuen Code vorne**, Komma, alter Code dahinter (`<neu>,<alt>`) → speichern → neu aufbauen (Kapitel 10, Fall A). Nach ein paar Tagen den alten Code entfernen und nochmals neu aufbauen. Wer schon ein Konto hat, merkt davon nichts. |
| **Beta für neue Leute schließen** | Bei `BETA_ACCESS_CODES` einen langen Zufallswert eintragen, den niemand kennt, und (bei Variante B) `BETA_INVITE_SIGNUP=false` hinzufügen → neu aufbauen. Bestehende Konten funktionieren weiter. |
| **Notschalter Einladungen** (nur Variante B) | Ist ein Einladungslink in fremde Hände geraten: Variable `BETA_INVITE_SIGNUP` mit Wert `false` anlegen → neu aufbauen. Dann brauchen auch Eingeladene wieder den Beta-Code. Zusätzlich kann die Orga in der Reise den Einladungslink neu erzeugen. |
| **Mehr als 50 Konten nötig** | Dem CEO Bescheid geben; er sagt dir den neuen Wert für `BETA_MAX_ACCOUNTS` (Mail-Kontingent im Blick behalten). |
| **Mail-Kontingent** | Lettermint → Dashboard zeigt die Mails des Monats. Ab ca. 250 von 300: dem CEO Bescheid geben (Optionen: Lettermint „Starter“ 10 €/Monat oder Wechsel des Dienstes, ohne Code-Änderung). |
| **Täglicher Aufräum-Job** | Läuft nachts automatisch (löscht abgelaufene Reisen, inaktive Konten, gelöschte Ausgaben nach Frist). Nichts zu tun. |
| **Kosten** | Domain ca. 5 €/Jahr (Verlängerung bei INWX automatisch – Zahlungsart aktuell halten). Sonst 0 €. Werden Freikontingente überschritten, wird gebremst, nicht berechnet. |
| **Beta beenden** | Mit dem CEO klären – es gibt **kein** Versprechen, am Ende alles zu löschen; es gelten die normalen Löschfristen. Weg 1: **Umzug in den Echtbetrieb** (G1, EU-Hosting) – vorher an alle ankündigen, wer nicht mit will, löscht sein Konto. Weg 2: **Abschalten** – vorher mit Frist ankündigen (Datenexport in der App möglich), danach Vercel-Projekt, Neon-Projekt und Lettermint-Projekt `wir-wollen-weg-beta` löschen. Domain in beiden Fällen behalten. |

---

## 10. Wenn etwas nicht klappt

### Fall A – Variable geändert oder vergessen → neu aufbauen

Wie in der [Vorschau-Anleitung Kapitel 8, Fall A](vorschau-anleitung.md#fall-a--variable-vergessen-falsch-oder-geändert--neu-aufbauen) – aber im Projekt **`wir-wollen-weg-beta`**. Beim „Redeploy“ muss der oberste Eintrag ein Aufbau von **`beta`** sein.

### Fall B – Aufbau rot bzw. „Start refused“

Klicke auf das rote Deployment und lies die letzten roten Zeilen. Die App startet in der Beta absichtlich **nicht**, wenn eine Pflicht-Einstellung fehlt. Typische Meldungen:

| Steht im Protokoll … | Bedeutung | Lösung |
|---|---|---|
| `this build is only for …` bzw. `skipped: branch main` | Aufbau von `main` im Beta-Projekt | normal (Kapitel 5.2 Schritt 5) – Zweig `beta` einstellen (5.3) |
| `APP_ENV=beta needs an https:// base URL` | `APP_URL` fehlt oder beginnt nicht mit `https://` | `APP_URL` korrigieren → Fall A |
| `BETA_ACCESS_CODES` | Beta-Code fehlt oder ist kürzer als 12 Zeichen | Code verlängern → Fall A |
| `BETA_MAX_ACCOUNTS` | Wert ist keine Zahl zwischen 1 und 500 | korrigieren oder Zeile löschen → Fall A |
| `LEGAL_OPERATOR_NAME` / `CONTACT_EMAIL` | Name oder Kontakt-Adresse fehlt | eintragen → Fall A |
| `MAIL_TRANSPORT` / `SMTP_` | Mail-Einstellungen fehlen oder zeigen auf das Demo-Postfach | Kapitel 4 prüfen → Fall A |
| `CRON_SECRET` | Aufräum-Job nicht eingerichtet | Zufallswert eintragen → Fall A |
| `TRAVEL_DATA_ENABLED` | Reisedaten eingeschaltet | genau `false` eintragen → Fall A |
| `migrations failed`, `ENOTFOUND`, `password authentication failed` | Datenbank-Adresse falsch | Adressen aus dem **Beta**-Neon-Projekt neu kopieren → Fall A |

(Fehlt nur die Feedback-Nummer oder ist sie falsch geschrieben, startet die App trotzdem – dann fehlt lediglich die WhatsApp-Taste.)

### Fall C – Die Login-Mail kommt nicht an

1. **Spam-Ordner** prüfen. Wenn sie dort liegt: „Kein Spam“ markieren und dem Team Bescheid geben (dann prüfen wir SPF/DKIM/DMARC).
2. Lettermint → **„Domains“**: Sind alle Einträge **grün/verifiziert**? Wenn nicht: Einträge bei INWX vergleichen (häufigster Fehler: doppelte Domain im Namen, Kapitel 1).
3. Lettermint → **„Logs“/„Activity“**: Taucht die Mail auf? Steht dort „bounced“, war die Adresse falsch geschrieben.
4. Monatskontingent (300) erreicht? → Kapitel 9, „Mail-Kontingent“.
5. „Bitte warte kurz …“ in der App: höchstens 5 Codes pro Stunde und Adresse – warten.

### Fall D – Eine neue Person kommt nicht rein

| Sie sieht … | Grund | Was tun |
|---|---|---|
| „Dieser Beta-Code stimmt nicht …“ | Code vertippt oder alter Code (nach einem Wechsel) | aktuellen Code schicken |
| „Zu viele Versuche …“ | mehrfach falsch eingegeben | die genannten Minuten warten |
| „Die Beta ist gerade voll …“ | Höchstzahl Konten erreicht | CEO fragen (Kapitel 9) |
| „Fast – dir fehlt noch der Beta-Code“ (nach dem Code aus der Mail) | sie ist direkt über „Anmelden“ statt über `/beta` gekommen (oder hat > 24 h zwischen Beta-Code und Mail-Code gebraucht) | Taste „Beta-Code eingeben“ antippen und den Schritten folgen |

### Fall E – Vercel zeigt bei der Domain „Invalid Configuration“

- 10–30 Minuten warten (DNS braucht etwas).
- Bei INWX prüfen: Typ `CNAME`, Name genau `app`, Wert genau der von Vercel – ohne Leerzeichen.
- Gibt es für `app` zusätzlich einen `A`-Eintrag (z. B. von INWX vorbelegt)? Diesen löschen.

### Fall F – Am iPhone ständig abgemeldet bzw. „Bitte erneut anmelden“

- In der Home-Bildschirm-App immer den **Code** eingeben (nicht den Link) – Kapitel 7.2.
- iOS kann den Speicher einer Web-App löschen, die **lange nicht geöffnet** wurde – dann einfach erneut per Code anmelden.
- Hilft nichts: App vom Home-Bildschirm löschen, in Safari anmelden, erneut „Zum Home-Bildschirm“.

### Fall G – Jemand hat den Beta-Code weitergegeben bzw. eine fremde Person ist registriert

Beta-Code wechseln (Kapitel 9), bei Variante B ggf. Notschalter Einladungen, und dem CEO Bescheid geben – das Team kann das fremde Konto entfernen. Fremde Personen sehen **keine** Reisen, zu denen sie nicht eingeladen sind.

Wenn nichts davon hilft: dem Team schreiben, **was** du gemacht hast, **welche Adresse** du geöffnet hast und **welche Meldung** kam – gerne mit Screenshot der Meldung, aber **nie** mit der Variablen-Seite von Vercel, dem Connect-Fenster von Neon oder dem Token von Lettermint.

---

# Teil B – Vorgaben für Developer und Reviewer (P1-B0)

Kurzfassung; verbindliche Details in [deployment.md §0.12](deployment.md), Oberfläche/Texte in [W23](../ux/wireframes/w23-beta-und-installation.md). Bei Widerspruch gilt für Oberfläche und Texte W23, für Sicherheit/Betrieb deployment.md.

| # | Thema | Vorgabe | Detail |
|---|---|---|---|
| B1 | `APP_ENV=beta` + Startschutz | `beta` ∈ `APP_ENVS`, `HTTPS_ENVS`; nicht lokal-only. Start verweigert bei: fehlendem `https://`-`APP_URL`, `MAIL_TRANSPORT` ≠ `smtp` bzw. lokalem SMTP/Platzhalter-Absender, fehlenden/zu kurzen `BETA_ACCESS_CODES`, fehlendem `LEGAL_OPERATOR_NAME`/`CONTACT_EMAIL`, fehlendem `CRON_SECRET`/`RETENTION_TOKEN`, `TRAVEL_DATA_ENABLED=true`, `RATE_LIMIT_ENABLED=false`, ungültigem `BETA_MAX_ACCOUNTS`, `[PLATZHALTER` in Beta-Texten. Kanonischer Host (308 auf `APP_URL`, außer Cron/Health), kein Basic Auth, `noindex`, keine Demo-Funktionen, kein Seed | §0.12.4 |
| B2 | Env-Liste | Pflicht: `APP_ENV`, `APP_URL`, `BETTER_AUTH_SECRET`, `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `MAIL_TRANSPORT`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM`, `CONTACT_EMAIL`, `LEGAL_OPERATOR_NAME`, `BETA_ACCESS_CODES`, `CRON_SECRET`, `TRAVEL_DATA_ENABLED=false`. Optional: `MAIL_REPLY_TO`, `MAIL_FROM_NAME_DE/_EN`, `BETA_MAX_ACCOUNTS`, `BETA_INVITE_SIGNUP`, `FEEDBACK_WHATSAPP_NUMBER`, `FEEDBACK_EMAIL`, `PWA_SW_ENABLED`, `PASSWORD_BREACH_CHECK`, `APP_TIME_ZONE`. `.env.example` um die neuen Namen ergänzen (ohne Werte) | §0.12.3, §4 |
| B3 | Beta-Code serverseitig | Eigene Seite `/beta`: Code wird **vor** jedem Mailversand geprüft, klare Fehlermeldung (verrät nichts über Konten). Normalisierung + zeitkonstanter Vergleich gegen alle Codes; Codes nie loggen/an Client. Signiertes httpOnly-Cookie `ww_beta_pass` (24 h, HKDF aus `BETTER_AUTH_SECRET`, `kid` → Rotation beendet offene Pässe). Durchsetzung ausschließlich in `databaseHooks.user.create.before` (fail closed) inkl. `BETA_MAX_ACCOUNTS`; Zustimmung (`betaConsentVersion`, `betaConsentAt`, `betaSignupVia`) am Konto | §0.12.5 Nr. 1–6 |
| B4 | Rate-Limit + Rotation | `/beta`: 5 Fehlversuche/15 Min. und 20/Tag pro IP (/64), global 200/Tag → 1 h zu; Mails an Adressen ohne Konto und ohne Pass max. 30/Tag global. Rotation über Reihenfolge in `BETA_ACCESS_CODES` (erster = aktuell, bis 5 Einträge) | §0.12.5 Nr. 4, 7, 8 |
| B5 | Einladungsweg | Entscheidung E-G0-2 offen beim Auftraggeber; Hook so bauen, dass Variante A ↔ B eine Bedingung ist. Variante B: `ww_invite_pass` + Prüfung „Einladung noch gültig“, Notschalter `BETA_INVITE_SIGNUP=false`. Variante A: UI W23 A.8 „Variante streng“ | §0.12.5 Nr. 9 |
| B6 | PWA | Manifest `id: "/"`, `start_url: "/"`, `scope: "/"`, Name ohne „Beta“, kein `orientation`; `appleWebApp` mit `statusBarStyle: "black-translucent"` + Safe-Area-Band; `apple-touch-icon` 180×180 ohne Transparenz (vorhanden); `viewport-fit=cover`; `theme-color` hell/dunkel; Routen **`/beta`** (nur beta), **`/install`**, **`/offline`**; „Einladungslink einfügen“ nur im App-Modus; Login in der App per 6-stelligem Code, „Angemeldet bleiben“ immer an | §0.12.6, W23 B, C |
| B7 | Service Worker | `/sw.js`, nur in `beta`/`production`, Notschalter `PWA_SW_ENABLED=false`. Precache **nur** `/offline` + Logo, Schriften, Tokens-CSS; `/_next/static/*` cache-first; Navigationen Netz zuerst, Fallback `/offline`; **nichts sonst** beantworten oder cachen (kein HTML, kein RSC, keine Server Actions, kein `/api`, `/auth`, `/i`, `/trips`, `/account`). **Keine personenbezogenen Daten im Cache** – E2E-Test prüft den Cache-Inhalt. Abmelden/Konto löschen: `Clear-Site-Data: "cache"` | §0.12.6 |
| B8 | CSP | Stufe 1 um `worker-src 'self'` und `manifest-src 'self'` ergänzen; keine externen Quellen; `Permissions-Policy` nicht um `clipboard-read` einschränken | §0.12.7 |
| B9 | Mail-Transport | SMTP über bestehenden Nodemailer-Transport: `smtp.lettermint.co:465` implizites TLS (Fallback 587 + `requireTLS`), Timeouts 10/10/20 s, kein Pooling, Versand über `after()`; Fehler nur als Zähler. Beta-Mailtext: Code zuerst, Link „im Browser“ als zweite Option; Footer ohne Platzhalter. Fallback Lettermint-HTTP-API nur, falls SMTP von Vercel scheitert | §0.12.9, W23 A.5 |
| B10 | Rechtstexte + Feedback | Beta-Datenschutzhinweis `beta-1` (compliance §13.4), Kurzfassung compliance §13.6 (ersetzt W23 p4/p5), Seite „Anbieter & Kontakt“; Feedback-Sheet nur mit gesetzten `FEEDBACK_*`, vorausgefüllter Text ohne Reisenamen/IDs/Namen/E-Mail | §0.12.8, W23 D |
| B11 | Build/Release | Vercel-Projekt `wir-wollen-weg-beta`, Production-Branch `beta`, `ignoreCommand` (Projekt baut nur seinen Zweig), Build ohne Seed, Migrationen rückwärtskompatibel | §0.12.2 |
| B12 | Tests | Unit-Tests je Startschutz-Regel; E2E-Projekt `beta-chromium` (Beta-Code gültig/falsch/leer, Rate-Limit, Beta voll, Zustimmung, Einladungsweg nach Variante, direkter `/login`-Weg ohne Pass → kein Konto, Service-Worker-Cache-Inhalt, Notschalter); Gerätetests W23 G-1 – G-14 | §0.12.4, §0.12.6 |

---

# Teil C – Datenschutz-Kurzbewertung Vercel / Neon / Lettermint (keine Rechtsberatung)

Ausführlich in [compliance-checklist.md §13.2](compliance-checklist.md). Kurz:

- **Gilt die DSGVO?** Für eine Web-App mit externen Dienstleistern, Einladungslinks und späteren Produktplänen sollte man **so handeln, als gelte sie** (die „Haushaltsausnahme“ wird eng ausgelegt). Du bist als Privatperson der **Verantwortliche**; Vercel, Neon und Lettermint sind Auftragsverarbeiter.
- **Vercel (USA, Hosting):** Funktionen laufen in Frankfurt, das CDN weltweit → Drittlandbezug; Vercel ist laut eigener Angabe unter dem EU-US Data Privacy Framework zertifiziert. **Lücke:** Das Vercel-DPA nennt als Geltungsbereich Pro/Enterprise; für Hobby ist ein AVV unklar, und Hobby erlaubt standardmäßig KI-Training mit Inhalten (Opt-out Pflicht, Kapitel 5.1). **Entscheidung E-G0-1:** A Hobby + Maßnahmen (0 €, Empfehlung für eine kleine, befristete Beta) · B Pro (20 $/Monat, DPA gilt ausdrücklich) · C Beta gleich auf EU-Hosting (10–40 €/Monat + ca. 1 Woche Arbeit).
- **Neon (USA/Databricks, Datenbank):** Speicherort Frankfurt (AWS); DPA laut Neon in die Bedingungen einbezogen und zum Download – PDF ablegen; DPF-Listung von Neon/Databricks vor dem Start auf dataprivacyframework.gov prüfen (sonst Standardvertragsklauseln aus dem DPA). **Vertretbar.**
- **Lettermint (NL, Mails):** EU-Anbieter, DPA Teil der Bedingungen, Tracking abschalten. **Gut.**
- **Maßnahmen, die das Restrisiko klein halten:** Reisedaten (Ausweise) technisch aus, Hinweis „keine Ausweis-/Gesundheitsdaten in Notizen“, Kontenobergrenze, App loggt keine Adressen/Tokens/Inhalte, keine Personendaten im Service-Worker-Cache, 2FA überall, normale Löschfristen + Konto jederzeit löschbar, ehrlicher Hinweis an die Tester (Kapitel 8).
- **Impressum:** Für eine private, unentgeltliche, geschlossene Beta nach Betriebssicht eher nicht Pflicht; empfohlen ist eine Seite „Anbieter & Kontakt“ mit Name + Mail ohne Anschrift (compliance §13.3). Ein volles Impressum ist Pflicht vor dem öffentlichen Start (G1).

---

## Quellen (Abruf 2026-10-23 über Websuche; Anbieterseiten vor dem Kauf live prüfen)

- Lettermint: [Preise (Developer 300 Mails/Monat, Starter 10 €/Monat)](https://lettermint.co/pricing), [Changelog – Developer-Tarif ohne Tageslimit](https://lettermint.co/changelog/developer-plan-now-without-daily-limit), [DPA](https://lettermint.co/dpa), [SMTP-Doku](https://docs.lettermint.co/guides/send-email-with-smtp), [Sitz NL (Vergleichsseite)](https://lettermint.co/compare/amazon-ses-alternative)
- Domains: [INWX – .de für 5,02 €](https://www.inwx.de/en/de-domain), [domainoffer.net – INWX .de (Verlängerung)](https://domainoffer.net/tld/de/inwx), [Hetzner – .de-Preissenkung (5,38 €)](https://www.hetzner.com/de/news/de-domain-pricedrop/)
- Vercel: [Data Privacy Framework](https://vercel.com/kb/guide/is-vercel-certified-under-dpf), [DPA](https://vercel.com/legal/dpa), [ToS-Update März 2026 (KI-Training Hobby)](https://vercel.com/changelog/updates-to-terms-of-service-march-2026)
- Neon: [DPA](https://neon.com/dpa), [GDPR bei Neon](https://neon.com/blog/gdpr-compliance-and-neon)
- Weitere Quellen und Alternativen (Brevo, Scaleway TEM, netcup): [deployment.md – Quellen](deployment.md)
