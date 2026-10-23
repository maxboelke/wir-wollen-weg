# Beta-Anleitung – geschlossene Freundes-Beta (Gate G0) auf Vercel + Neon

Stand: 2026-10-23 · Gepflegt von: Operations Manager · Zielgruppe: Auftraggeber (Windows-PC + iPhone, keine Programmierkenntnisse nötig) · Entscheidung: CEO + Auftraggeber 2026-10-23 („Stufe B“, Gate **G0 Beta**) · Technische Referenz: [deployment.md §0.12](deployment.md) · Recht: [compliance-checklist.md §13](compliance-checklist.md) · Gate: [go-live.md – Gate G0](go-live.md)

Mit dieser Anleitung bekommt die App eine **eigene Adresse** (z. B. `https://app.deine-domain.de`), verschickt **echte Login-Mails** und lässt sich auf dem iPhone **wie eine App auf den Home-Bildschirm legen**. Deine Freundinnen und Freunde registrieren sich mit einem **Beta-Code**, den nur ihr kennt. Die bestehende Vorschau (Demo-Daten, Zugangspasswort) bleibt unverändert daneben bestehen.

**Gut zu wissen**

- **Kosten: ca. 5 € pro Jahr** für die Domain. Mail-Dienst (Lettermint „Developer“), Vercel „Hobby“ und Neon „Free“ kosten 0 €. Kreditkarte brauchst du nur für die Domain (bzw. PayPal/Lastschrift, je nach Registrar).
- **Echte Daten – aber nur im Freundeskreis.** In der Beta tragen echte Menschen echte Namen, E-Mail-Adressen, freie Tage und Kosten ein. Deshalb gibt es einen kurzen **Datenschutzhinweis mit deinem Namen** und jede Person stimmt bei der Registrierung zu. Ausweis-/Passdaten („Reisedaten“) sind in der Beta **ausgeschaltet**.
- **Reihenfolge:** Kapitel 1–3 (Domain, Mail, Datenbank) kannst du **sofort** erledigen. Kapitel 4–7 (Vercel) erst, **wenn das Team Bescheid gibt**, dass der Beta-Modus fertig und geprüft ist (Status-Board: P1-B0).
- **Zeitbedarf:** ca. 60–90 Minuten, verteilt auf zwei Termine. Dazwischen kann die Prüfung der Mail-Domain einige Minuten bis wenige Stunden dauern.
- Oberflächen ändern sich gelegentlich: Heißt ein Knopf etwas anders, nimm den mit der ähnlichsten Beschriftung.
- **Geheime Werte** (alles in der Tabelle in Kapitel 4 mit „geheim: ja“) **nie** in Chats, Mails oder Screenshots teilen – auch nicht mit dem Team. Einzige Ausnahme: der **Beta-Code**, den du bewusst an Testpersonen weitergibst.
- Diese Anleitung ist keine Rechtsberatung (siehe [compliance-checklist.md](compliance-checklist.md)).

### Was du kaufen bzw. anlegen musst

| # | Was | Wo (Empfehlung) | Kosten | Kapitel |
|---|---|---|---|---|
| 1 | Domain, z. B. `wirwollenweg.de` (Verfügbarkeit prüfen) | **INWX** (Berlin) – Alternative Hetzner | ca. 5 €/Jahr | 1 |
| 2 | Konto beim Mail-Dienst | **Lettermint** (Niederlande), Tarif „Developer“ | 0 € (300 Mails/Monat) | 2 |
| 3 | Zweites Neon-Projekt für die Beta | Neon (dein bestehendes Konto) | 0 € | 3 |
| 4 | Zweites Vercel-Projekt für die Beta | Vercel (dein bestehendes Konto) | 0 € | 5 |
| 5 | Beta-Code ausdenken, deinen Namen + Kontakt-Mail festlegen | – | – | 4 |

### Checkliste zum Abhaken

- [ ] Domain gekauft, Zwei-Faktor-Anmeldung beim Registrar an (Kapitel 1)
- [ ] Lettermint-Konto, AVV (DPA) gespeichert, Absender-Domain **verifiziert**, Tracking aus, SMTP-Token notiert (Kapitel 2)
- [ ] Neon-Projekt `wir-wollen-weg-beta` (Frankfurt, Postgres 18), zwei Adressen kopiert (Kapitel 3)
- [ ] **Team sagt: Beta-Modus ist fertig** (P1-B0 gemergt, Zweig `beta` existiert)
- [ ] Zufallswerte, Beta-Code, Name/Kontakt in der Notiz (Kapitel 4)
- [ ] Vercel: KI-Training abgeschaltet, Projekt `wir-wollen-weg-beta` mit Variablen angelegt, Zweig `beta` eingestellt (Kapitel 5)
- [ ] `app.<deine-domain>` mit Vercel verbunden, `.vercel.app`-Adresse leitet um (Kapitel 6)
- [ ] Eigener Test: registriert, Mail kam an, am iPhone auf dem Home-Bildschirm angemeldet (Kapitel 7)
- [ ] CEO hat das Gate G0 mit dir durchgesehen ([go-live.md](go-live.md)) – **erst dann** Freunde einladen (Kapitel 8)

---

## 1. Domain kaufen (INWX)

Warum INWX: deutscher Anbieter (Berlin), günstige `.de`-Domains (Werbepreis auf der INWX-Seite: 5,02 €/Jahr, Stand Abruf 2026-10-23 – vor dem Kauf den **Verlängerungspreis** prüfen), DNS-Verwaltung inklusive, Zwei-Faktor-Anmeldung, DNSSEC. Gleichwertige Alternative: **Hetzner** (`.de` 5,38 €/Jahr über konsoleH). Bitte **nicht** über Vercel kaufen (US-Anbieter, DNS wäre dann dort).

**Welcher Name?** Die Domain soll später auch für den echten Start (Go-Live G1) taugen. Vorschläge: `wirwollenweg.de`, `wir-wollen-weg.de`. Die Markenprüfung beider Namen (PRD Q11) bleibt Pflicht vor dem öffentlichen Start – für die private Beta reicht die Domain.

1. Öffne <https://www.inwx.de> → oben im Suchfeld den Wunschnamen eingeben (z. B. `wirwollenweg`) → **„Suchen“**.
2. Ist die `.de`-Domain frei: **„In den Warenkorb“** → **„Zur Kasse“**.
3. Konto anlegen (Name, Anschrift, E-Mail, Zahlungsart). Deine Anschrift ist für die Registrierung Pflicht; bei `.de`-Domains veröffentlicht die DENIC sie **nicht** öffentlich.
4. Bei den Optionen: **keine** Zusatzpakete (Webhosting, E-Mail-Paket, SSL-Zertifikat) – brauchen wir nicht. Nameserver: **INWX-Standard** lassen.
5. Kauf abschließen. Nach einigen Minuten steht die Domain unter **„Domains“** in deinem Konto.
6. **Zwei-Faktor-Anmeldung einschalten:** **„Konto“** (bzw. Profil) → **„Sicherheit“** → **„Zwei-Faktor-Authentifizierung“** → mit einer Authenticator-App (z. B. Microsoft/Google Authenticator) einrichten. Wiederherstellungscodes sicher ablegen.
7. Optional, empfohlen: In der Domain-Verwaltung **„DNSSEC“** aktivieren (falls dort angeboten, ein Klick).

**So trägst du später DNS-Einträge ein** (brauchst du in Kapitel 2 und 6): **„Domains“** → bei deiner Domain **„DNS“** (bzw. „Nameserver-Einträge“) → **„Eintrag hinzufügen“** → **Typ** wählen (`TXT`, `CNAME` …) → **Name** und **Inhalt/Wert** einfügen → **„Speichern“**.

> **Wichtigste Falle:** Ins Feld **„Name“** gehört nur der Teil **vor** deiner Domain. Zeigt der Mail-Dienst z. B. `lm1._domainkey.mail.wirwollenweg.de`, dann trägst du bei INWX `lm1._domainkey.mail` ein – INWX hängt `wirwollenweg.de` selbst an. Steht bei INWX schon die volle Domain im Namen, entstünde sonst `….wirwollenweg.de.wirwollenweg.de`.

---

## 2. Mail-Dienst einrichten (Lettermint)

Warum Lettermint: niederländische Firma ohne US-Mutter, Server in der EU, auf Login-/Service-Mails spezialisiert, kostenloser Tarif **„Developer“ mit 300 Mails pro Monat** ohne Kreditkarte, AVV (DPA) als Teil der Bedingungen. Für 10–30 Testpersonen reicht das (Schätzung: Registrierung 1 Mail, danach bleibt man meist angemeldet). Vergleich und Alternativen: [deployment.md §0.12.1](deployment.md).

Wir verschicken von einer **Unteradresse** `mail.<deine-domain>` (z. B. `login@mail.wirwollenweg.de`). Das schützt den Ruf der Hauptdomain und ist mit dem späteren Echtbetrieb identisch.

1. Öffne <https://lettermint.co> → **„Sign up“ / „Kostenlos starten“** → Konto anlegen (am besten mit deiner normalen E-Mail-Adresse). Tarif **„Developer“ (Free)** wählen.
2. **Zwei-Faktor-Anmeldung** in den Konto-Einstellungen einschalten (falls angeboten).
3. **AVV sichern:** Die Auftragsverarbeitung (DPA) ist Teil der Lettermint-Bedingungen. Öffne <https://lettermint.co/dpa>, speichere die Seite als PDF (Strg+P → „Als PDF speichern“) mit Datum im Dateinamen in einem Ordner **außerhalb** des Projekts (z. B. „Beta – Verträge“). Falls Lettermint im Konto ein „DPA unterzeichnen“ anbietet: unterzeichnen und das PDF ebenso ablegen.
4. **Projekt anlegen** (falls Lettermint danach fragt), Name z. B. `wir-wollen-weg-beta`.
5. **Domain hinzufügen:** **„Domains“** → **„Add domain“** → `mail.<deine-domain>` eingeben (z. B. `mail.wirwollenweg.de`).
6. Lettermint zeigt jetzt eine Liste von **DNS-Einträgen** (typischerweise: ein oder zwei **DKIM**-Einträge, ein Eintrag für den **Return-Path/Bounces** als `CNAME`, ein **SPF**-Eintrag als `TXT`). Trage **jeden** davon bei INWX ein (Kapitel 1, „So trägst du DNS-Einträge ein“) – Typ, Name (nur der Teil vor deiner Domain!) und Wert genau kopieren.
7. **Zusätzlich DMARC** eintragen (falls Lettermint ihn nicht schon vorgibt):
   - Typ `TXT`, Name `_dmarc`, Wert: `v=DMARC1; p=none; adkim=s; aspf=r`
   - Nach 2–4 Wochen ohne Zustellprobleme sagt dir das Team, ob du `p=none` auf `p=quarantine` änderst.
8. Zurück bei Lettermint: **„Verify“ / „Prüfen“** klicken. Es kann **einige Minuten bis wenige Stunden** dauern, bis alle Einträge grün sind. Einfach später erneut prüfen.
9. **Tracking ausschalten:** In den Projekt- bzw. Domain-Einstellungen **Öffnungs-Tracking („Open tracking“)** und **Klick-Tracking („Click tracking“)** ausschalten, falls vorhanden. Login-Mails dürfen nicht verfolgt werden.
10. **SMTP-Zugang (Token) erzeugen:** **„SMTP“** bzw. **„API tokens“** → neues Token für das Projekt anlegen → den angezeigten Wert **sofort** kopieren und in deine Notiz schreiben: `SMTP_PASSWORD=<Token>`. Der Benutzername ist laut Lettermint-Doku immer `lettermint`, der Server `smtp.lettermint.co`.

> Lettermint kann neue Konten vor dem ersten Versand kurz prüfen. Falls ein Hinweis wie „Account under review“ erscheint: abwarten bzw. die Rückfrage von Lettermint beantworten (Zweck: „Login-Codes für eine private Web-App, ca. 100–300 Mails/Monat“).

---

## 3. Eigene Datenbank für die Beta (Neon)

**Empfehlung: ein eigenes Neon-Projekt** – nicht nur ein „Branch“ im Vorschau-Projekt. Gründe: eigene Zugangsdaten (wer die Vorschau-Adresse kennt, kommt nicht an echte Daten), „Demo zurücksetzen“ und Demo-Daten der Vorschau können die Beta nie berühren, eigenes Kontingent (Neon Free: 0,5 GB Speicher und 100 Rechenstunden **pro Projekt** und Monat, bis zu 100 Projekte), und am Ende der Beta löschst du einfach das ganze Projekt.

1. <https://console.neon.tech> → **„New Project“**.
2. **Name:** `wir-wollen-weg-beta` · **Postgres-Version: 18** (Pflicht) · **Region: AWS Europe Central 1 (Frankfurt)** → **„Create“**.
3. Die zwei Adressen kopieren **genau wie in der Vorschau-Anleitung Kapitel 1** ([vorschau-anleitung.md](vorschau-anleitung.md#1-datenbank-adressen-aus-neon-holen)) – aber aus dem **neuen** Projekt:
   - `DATABASE_URL=` (mit `-pooler`)
   - `DATABASE_URL_UNPOOLED=` (ohne `-pooler`)
4. **AVV sichern:** Neon nimmt die Auftragsverarbeitung (DPA) laut eigener Aussage in seine Nutzungsbedingungen auf; zusätzlich gibt es sie zum Herunterladen. Öffne <https://neon.com/dpa> und lege die Seite als PDF in deinen Ordner „Beta – Verträge“.
5. Falls noch nicht geschehen: Bei Neon **Zwei-Faktor-Anmeldung** einschalten (bzw. per GitHub anmelden und dort 2FA nutzen).

> **Nicht** die Vorschau-Datenbank „wispy-tooth-98738747“ für die Beta verwenden.

---

## 4. Notiz mit allen Werten vorbereiten (erst nach „Beta-Modus ist fertig“)

Öffne eine leere Notiz (Editor). Am Ende soll sie so aussehen (Werte gekürzt, **Beispiele nicht verwenden**):

```text
APP_ENV=beta
APP_URL=https://app.wirwollenweg.de
MAIL_TRANSPORT=smtp
SMTP_HOST=smtp.lettermint.co
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=lettermint
SMTP_PASSWORD=lm_…
MAIL_FROM=login@mail.wirwollenweg.de
MAIL_REPLY_TO=deine.adresse@beispiel.de
CONTACT_EMAIL=deine.adresse@beispiel.de
LEGAL_OPERATOR_NAME=Vorname Nachname
BETA_ACCESS_CODES=Sonne-Koffer-Bergsee-42
TRAVEL_DATA_ENABLED=false
BETTER_AUTH_SECRET=8002f388dd8dd9bb2c2a…
CRON_SECRET=3b9e01c7a4…
DATABASE_URL=postgresql://…-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://….eu-central-1.aws.neon.tech/neondb?sslmode=require
```

| Name | Was eintragen | geheim |
|---|---|---|
| `APP_ENV` | genau `beta` | nein |
| `APP_URL` | `https://app.` + deine Domain (kein `/` am Ende) | nein |
| `MAIL_TRANSPORT` | genau `smtp` | nein |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER` | genau wie oben (`smtp.lettermint.co`, `465`, `true`, `lettermint`) | nein |
| `SMTP_PASSWORD` | Lettermint-Token aus Kapitel 2, Schritt 10 | **ja** |
| `MAIL_FROM` | `login@mail.` + deine Domain | nein |
| `MAIL_REPLY_TO` | wohin Antworten auf Login-Mails gehen sollen – z. B. deine normale Mail-Adresse (optional) | nein |
| `CONTACT_EMAIL` | deine Kontakt-Adresse für Datenschutzhinweis und Hilfe-Seite (Testpersonen sehen sie) | nein |
| `LEGAL_OPERATOR_NAME` | **dein Vor- und Nachname** – erscheint als Verantwortlicher im Datenschutzhinweis. Steht absichtlich **nicht** im (öffentlichen) GitHub-Repository | nein |
| `BETA_ACCESS_CODES` | dein **Beta-Code** (siehe unten) | **ja** (nur an Testpersonen) |
| `TRAVEL_DATA_ENABLED` | genau `false` | nein |
| `BETTER_AUTH_SECRET` | **neuer** Zufallswert (nicht der aus der Vorschau!) | **ja** |
| `CRON_SECRET` | **neuer** Zufallswert | **ja** |
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED` | aus Kapitel 3 (Beta-Projekt!) | **ja** |

**Zufallswerte erzeugen:** wie in der [Vorschau-Anleitung Kapitel 2.2](vorschau-anleitung.md#22-zwei-zufallswerte-erzeugen-am-windows-pc) (PowerShell-Zeile, zweimal ausführen). **Neue** Werte nehmen, nicht die der Vorschau.

**Beta-Code festlegen:**

- Mindestens **12 Zeichen**, gut weiterzugeben, z. B. drei bis vier Wörter und eine Zahl mit Bindestrich: `Sonne-Koffer-Bergsee-42` (bitte **nicht** genau diesen nehmen).
- Groß-/Kleinschreibung, Leerzeichen und Bindestriche spielen bei der Eingabe keine Rolle (die App gleicht sie an) – trotzdem keine Umlaute.
- Den Code nur **direkt** an Testpersonen geben, nicht in Gruppen posten, die größer sind als die Beta.
- **Code wechseln** (z. B. wenn er weitergegeben wurde): siehe Kapitel 9.

**Bitte nicht eintragen:** `PREVIEW_ACCESS_PASSWORD`, `BETTER_AUTH_URL`, `AUTH_IP_HEADER`, `AUTH_TRUSTED_PROXIES`, `RETENTION_TOKEN`, `RATE_LIMIT_ENABLED`, `TRAVEL_DATA_KEYS`. Optional (nur wenn das Team es sagt): `BETA_MAX_ACCOUNTS` (Höchstzahl Konten, Standard 50), `PASSWORD_BREACH_CHECK`, `APP_TIME_ZONE`.

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
4. Kontrolle: Es sind **18 Variablen**, ohne Leerzeichen am Anfang/Ende. Bietet Vercel bei einer Variable den Schalter **„Sensitive“** an, schalte ihn bei allen „geheim: ja“-Werten ein (dann kann man sie später nicht mehr auslesen, nur ersetzen).
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
6. **Alte Adresse umleiten:** In derselben Domain-Liste steht auch `wir-wollen-weg-beta.vercel.app` (oder ähnlich). Dort **„Edit“** → **„Redirect to“** → `app.<deine-domain>` → **„Save“**. So landet niemand versehentlich auf der Vercel-Adresse (dort würde die Anmeldung scheitern).
7. Die Hauptdomain selbst (`wirwollenweg.de` ohne `app.`) brauchst du für die Beta **nicht**. Bitte **keinen** `CAA`-Eintrag anlegen (der könnte Vercel das Zertifikat verbieten).
8. Hat sich `APP_URL` geändert oder hattest du sie anders eingetragen: korrigieren und **neu aufbauen** (Kapitel 10, Fall A).

---

## 7. Selbst testen – am PC und am iPhone

### 7.1 Am PC

1. `https://app.<deine-domain>` öffnen – **kein** Passwort-Fenster mehr (anders als in der Vorschau), **kein** gelber Demo-Balken, unten Links „Datenschutz“ und „Kontakt“.
2. **Datenschutz** öffnen: Dort steht **dein Name** als Verantwortlicher und deine Kontakt-Adresse. Steht dort `[PLATZHALTER …]`, sofort dem Team melden.
3. **„Anmelden“** → **„Zum ersten Mal hier?“** → deine echte E-Mail-Adresse, den Beta-Code und das Häkchen beim Datenschutzhinweis → **„Code senden“**.
4. Mail kommt innerhalb von ca. 1 Minute von `login@mail.<deine-domain>`. **Nicht da?** Im **Spam-Ordner** nachsehen (Kapitel 10, Fall C).
5. 6-stelligen Code eingeben → du bist angemeldet. Lege eine Test-Reise an.

### 7.2 Am iPhone (als App auf dem Home-Bildschirm)

1. In **Safari** `https://app.<deine-domain>` öffnen und **zuerst in Safari anmelden** (Beta-Code beim ersten Mal, dann Code aus der Mail).
2. **Teilen-Symbol** (Quadrat mit Pfeil) → **„Zum Home-Bildschirm“** → Name prüfen → **„Hinzufügen“**.
3. Vom Home-Bildschirm öffnen: Die App startet ohne Safari-Leiste, und du bist **bereits angemeldet** (iOS übernimmt beim Hinzufügen die Anmeldung aus Safari – darum Schritt 1 zuerst).
4. **Später in der App neu anmelden?** Immer den **6-stelligen Code** aus der Mail **abtippen** (bzw. den Vorschlag über der Tastatur antippen). **Nicht auf den Link in der Mail tippen** – der öffnet Safari statt der App, und du wärst nur dort angemeldet.
5. **Einladungslinks** aus WhatsApp öffnen auf dem iPhone ebenfalls Safari. Entweder dort beitreten (mit Code anmelden) – oder in der App den **Einladungscode** eingeben, falls die Einladung einen anzeigt.
6. **Offline-Test:** Flugmodus an → App öffnen → es erscheint ein freundlicher Hinweis „Keine Verbindung“. Flugmodus aus → neu laden. Deine Daten werden nicht auf dem Handy gespeichert – ohne Netz sieht man nur diesen Hinweis.

Android (Chrome): Menü **⋮** → **„App installieren“** bzw. **„Zum Startbildschirm hinzufügen“** – dort klappt auch der Link aus der Mail, der Code ist aber genauso gut.

---

## 8. Testpersonen einladen

**Erst nach der Durchsicht von Gate G0 mit dem CEO** ([go-live.md](go-live.md)).

1. Gib **zwei Dinge** weiter, am besten getrennt: die **Adresse** `https://app.<deine-domain>` und den **Beta-Code** (z. B. mündlich oder in einer Einzelnachricht).
2. Vorlage für die Nachricht (anpassen):

   > Hey! Ich teste gerade „Wir wollen weg“ – eine kleine App, mit der wir gemeinsam freie Tage für den nächsten Urlaub finden. Ist noch eine **private Test-Version** nur für unseren Freundeskreis.
   > 1. Öffne https://app.<deine-domain> in Safari (iPhone) bzw. Chrome.
   > 2. „Anmelden“ → „Zum ersten Mal hier?“ → deine Mail-Adresse + Beta-Code (schick ich dir separat) → Code aus der Mail eingeben.
   > 3. iPhone: danach Teilen → „Zum Home-Bildschirm“. Später immer den Code aus der Mail abtippen, nicht den Link antippen.
   > Kurz zum Datenschutz: Die App läuft bei Vercel (USA, Server u. a. in Frankfurt) und Neon (Datenbank in Frankfurt), die Mails verschickt Lettermint (NL). Details stehen unter „Datenschutz“ in der App. Bitte trag keine sensiblen Sachen in Notizen ein (z. B. Gesundheit, Ausweisnummern). Du kannst dein Konto jederzeit in der App löschen.

3. Reise anlegen und Freunde wie gewohnt per Einladungslink einladen – **jede neue Person braucht beim ersten Mal den Beta-Code** (Entscheidungsstand 2026-10-23).
4. Rückmeldungen sammelst du am besten an einer Stelle (z. B. eine Notiz oder Gruppe) und gibst sie dem CEO.

---

## 9. Pflege im Alltag

| Was | Wie |
|---|---|
| **Neue Versionen** | Das Team übernimmt geprüfte Stände in den Zweig `beta`; Vercel baut dann automatisch neu (3–6 Min.). Du musst nichts tun. Daten bleiben erhalten. |
| **Vor großen Updates (optional, 1 Klick)** | Kündigt der CEO eine Datenbank-Umstellung an: Neon → Projekt `wir-wollen-weg-beta` → **„Branches“** → **„Create branch“** → Name z. B. `sicherung-2026-11-01` → **„Create“**. Das ist eine Sicherungskopie. Neon Free erlaubt 10 Branches – alte Sicherungen nach ein paar Wochen löschen. |
| **Beta-Code wechseln** | Vercel → Projekt → **„Settings“** → **„Environment Variables“** → `BETA_ACCESS_CODES` → **„Edit“** → **neuen Code vorne**, Komma, alter Code dahinter (z. B. `Neu-Code-…,Alt-Code-…`) → speichern → neu aufbauen (Kapitel 10, Fall A). Nach ein paar Tagen den alten Code entfernen und nochmals neu aufbauen. Wer schon ein Konto hat, merkt davon nichts. |
| **Beta für neue Leute schließen** | Bei `BETA_ACCESS_CODES` einen langen Zufallswert eintragen, den niemand kennt → neu aufbauen. Bestehende Konten funktionieren weiter. |
| **Mail-Kontingent** | Lettermint → Dashboard zeigt die Mails des Monats. Ab ca. 250 von 300: dem CEO Bescheid geben (Optionen: Lettermint „Starter“ 10 €/Monat oder Wechsel des Dienstes, ohne Code-Änderung). |
| **Täglicher Aufräum-Job** | Läuft nachts automatisch (löscht abgelaufene Reisen, inaktive Konten, gelöschte Ausgaben nach Frist). Nichts zu tun. |
| **Kosten** | Domain ca. 5 €/Jahr (Verlängerung bei INWX automatisch – Zahlungsart aktuell halten). Sonst 0 €. Werden Freikontingente überschritten, wird gebremst, nicht berechnet. |
| **Beta beenden** | Mit dem CEO klären: Daten löschen **oder** (nach Ankündigung an alle Testpersonen) in den Echtbetrieb (Gate G1) übernehmen. Löschen: Vercel-Projekt `wir-wollen-weg-beta` löschen, Neon-Projekt `wir-wollen-weg-beta` löschen, Lettermint-Projekt löschen. Domain behalten (für G1). |

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
| `LEGAL_OPERATOR_NAME` / `CONTACT_EMAIL` | Name oder Kontakt-Adresse fehlt | eintragen → Fall A |
| `MAIL_TRANSPORT` / `SMTP_` | Mail-Einstellungen fehlen oder zeigen auf das Demo-Postfach | Kapitel 4 prüfen → Fall A |
| `CRON_SECRET` | Aufräum-Job nicht eingerichtet | Zufallswert eintragen → Fall A |
| `TRAVEL_DATA_ENABLED` | Reisedaten eingeschaltet | genau `false` eintragen → Fall A |
| `migrations failed`, `ENOTFOUND`, `password authentication failed` | Datenbank-Adresse falsch | Adressen aus dem **Beta**-Neon-Projekt neu kopieren → Fall A |

### Fall C – Die Login-Mail kommt nicht an

1. **Spam-Ordner** prüfen. Wenn sie dort liegt: „Kein Spam“ markieren und dem Team Bescheid geben (dann prüfen wir SPF/DKIM/DMARC).
2. Lettermint → **„Domains“**: Sind alle Einträge **grün/verifiziert**? Wenn nicht: Einträge bei INWX vergleichen (häufigster Fehler: doppelte Domain im Namen, Kapitel 1).
3. Lettermint → **„Logs“/„Activity“**: Taucht die Mail auf? Steht dort „bounced“, war die Adresse falsch geschrieben.
4. Monatskontingent (300) erreicht? → Kapitel 9, „Mail-Kontingent“.
5. „Bitte warte kurz …“ in der App: höchstens 5 Codes pro Stunde und Adresse – warten.
6. **Neue Person ohne Konto bekommt keine Mail?** Beim ersten Mal muss sie **„Zum ersten Mal hier?“** wählen und den **Beta-Code** eingeben. Ohne gültigen Code verschickt die App absichtlich keine Mail (Schutz vor Missbrauch) – die Meldung in der App ist trotzdem dieselbe.

### Fall D – Vercel zeigt bei der Domain „Invalid Configuration“

- 10–30 Minuten warten (DNS braucht etwas).
- Bei INWX prüfen: Typ `CNAME`, Name genau `app`, Wert genau der von Vercel – ohne Leerzeichen.
- Gibt es für `app` zusätzlich einen `A`-Eintrag (z. B. von INWX vorbelegt)? Diesen löschen.

### Fall E – Am iPhone ständig abgemeldet bzw. „Bitte erneut anmelden“

- In der Home-Bildschirm-App immer den **Code** eingeben (nicht den Link) – Kapitel 7.2.
- Beim Anmelden „Angemeldet bleiben“ aktiviert lassen.
- Hilft nichts: App vom Home-Bildschirm löschen, in Safari anmelden, erneut „Zum Home-Bildschirm“.

### Fall F – Jemand hat den Beta-Code weitergegeben bzw. eine fremde Person ist registriert

Beta-Code wechseln (Kapitel 9) und dem CEO Bescheid geben – das Team kann das fremde Konto entfernen. Fremde Personen sehen **keine** Reisen, zu denen sie nicht eingeladen sind.

Wenn nichts davon hilft: dem Team schreiben, **was** du gemacht hast, **welche Adresse** du geöffnet hast und **welche Meldung** kam – gerne mit Screenshot der Meldung, aber **nie** mit der Variablen-Seite von Vercel, dem Connect-Fenster von Neon oder dem Token von Lettermint.

---

Quellen und Preise: [deployment.md §0.12 und „Quellen“](deployment.md) (Abruf 2026-10-23, vor dem Kauf live prüfen).
