# Vorschau-Anleitung – private Live-Vorschau auf Vercel + Neon

Stand: 2026-10-20 · Gepflegt von: Operations Manager · Zielgruppe: Auftraggeber (Windows-PC + Handy, keine Programmierkenntnisse nötig) · Entscheidung: PRD Q25 · Technische Referenz: [deployment.md §0.7](deployment.md)

Mit dieser Anleitung bekommt die App eine **feste Internet-Adresse** (z. B. `https://wir-wollen-weg.vercel.app`), die du am PC und am Handy öffnen kannst – ohne Download, ohne Docker. Die Adresse ist mit einem **Zugangspasswort** geschützt, das du selbst festlegst.

**Gut zu wissen**

- **Kosten: 0 €.** Vercel „Hobby“ und Neon „Free“ sind kostenlos, es wird keine Kreditkarte gebraucht. Vercel Hobby ist nur für **private, nicht-kommerzielle** Nutzung gedacht – für eine Vorschau im Freundeskreis passt das.
- **Nur Demo-Daten.** Es gibt noch kein echtes Impressum und keinen echten Datenschutztext. Bitte nur ausgedachte Adressen wie `anna@demo.test` verwenden – nie echte Namen, Adressen oder Termine. Die echte Nutzung kommt erst mit dem Go-Live (Gate G1, [go-live.md](go-live.md)).
- **Es werden keine echten E-Mails verschickt.** Alle Mails (Login-Codes, Hinweise) landen im eingebauten **Demo-Postfach** der App.
- **Zeitbedarf:** ca. 20–30 Minuten, davon ca. 3–6 Minuten Wartezeit beim ersten Aufbau.
- Wo hier „Klicke auf …“ steht, ist die Beschriftung auf der Webseite gemeint. Vercel und Neon ändern ihre Oberflächen gelegentlich – wenn ein Knopf etwas anders heißt, nimm den mit der ähnlichsten Beschriftung.

---

## 0. Wichtig vorab

1. **Erst starten, wenn das Team Bescheid gibt, dass der Vorschau-PR auf `main` gemergt ist.** Vercel baut nur den Stand von `main`. Vorher fehlt dort der Vorschau-Modus, und der Aufbau schlägt fehl.
2. Du brauchst:
   - dein **Vercel-Konto** (Anmeldung mit GitHub) – hast du schon,
   - dein **Neon-Projekt** „wispy-tooth-98738747“ (Frankfurt, Postgres 18, Branch „production“) – hast du schon,
   - Zugriff auf das GitHub-Repository `maxboelke/wir-wollen-weg`,
   - am Windows-PC das Programm **PowerShell** (ist vorinstalliert),
   - einen Ort für Passwörter (Passwort-Manager oder ein Zettel, der zu Hause bleibt).
3. **Geheime Werte nie in Chats, Mails oder Screenshots teilen** (auch nicht mit dem Team). Einzige Ausnahme: das Zugangspasswort, das du bewusst an Testpersonen weitergibst (Kapitel 6).

### Checkliste zum Abhaken

- [ ] Vorschau-PR ist auf `main` gemergt (Team fragen)
- [ ] Zwei Datenbank-Adressen aus Neon kopiert (Kapitel 1)
- [ ] Zugangspasswort ausgedacht, zwei Zufallswerte erzeugt (Kapitel 2)
- [ ] Repository in Vercel importiert, Variablen **vor** dem ersten Aufbau eingetragen (Kapitel 3)
- [ ] Erster Aufbau grün (Kapitel 4)
- [ ] Haupt-Adresse geöffnet, als `anna@demo.test` angemeldet – am PC und am Handy (Kapitel 5)

---

## 1. Datenbank-Adressen aus Neon holen

Die App braucht zwei Adressen deiner Neon-Datenbank: eine „gebündelte“ (**pooled**) für den normalen Betrieb und eine „direkte“ (**unpooled**) für den Aufbau. Beide enthalten ein Passwort – also wie ein Passwort behandeln.

1. Öffne <https://console.neon.tech> und melde dich an.
2. Klicke auf dein Projekt **„wispy-tooth-98738747“**.
3. Kurz prüfen (Projekt-Übersicht oder **„Settings“**): Region **AWS Europe Central 1 (Frankfurt)** und **Postgres 18**. Postgres 18 ist Pflicht – ältere Versionen funktionieren mit der App nicht.
4. Klicke oben rechts auf **„Connect“**. Es öffnet sich ein Fenster „Connect to your database“.
5. Prüfe die Auswahlfelder: Branch **„production“**, Database **„neondb“** (oder der vorgeschlagene Name), Role **„neondb_owner“** (oder die vorgeschlagene Rolle). Nichts ändern, wenn nur ein Eintrag angeboten wird.
6. **Adresse 1 – pooled:**
   1. Der Schalter **„Connection pooling“** muss **eingeschaltet** sein.
   2. Falls das Passwort als `****` angezeigt wird: Klicke auf **„Show password“** (bzw. das Augen-Symbol).
   3. Klicke auf **„Copy snippet“** (bzw. das Kopier-Symbol neben der Adresse).
   4. Füge die Adresse in eine leere Notiz ein (z. B. Editor/Notepad) und schreibe davor `DATABASE_URL=`.
   5. Kontrolle: Die Adresse beginnt mit `postgresql://`, im Teil nach dem `@` steht **`-pooler`** (z. B. `ep-…-pooler.eu-central-1.aws.neon.tech`), und sie enthält **`sslmode=require`**.
7. **Adresse 2 – direkt (unpooled):**
   1. Schalte **„Connection pooling“** **aus**.
   2. Kopiere die Adresse wieder und füge sie in die Notiz ein, davor `DATABASE_URL_UNPOOLED=`.
   3. Kontrolle: Diesmal steht **kein** `-pooler` im Hostnamen, `sslmode=require` ist enthalten.
8. Fenster schließen. Die Notiz **nicht speichern**, sondern nach Kapitel 3 wieder schließen (oder im Passwort-Manager ablegen).

> **Hinweis:** Steht in der Adresse zusätzlich `&channel_binding=require`, lass es einfach stehen – das funktioniert (vom Team geprüft).

**Alternative (nur zur Info, nicht empfohlen):** Vercel bietet unter **„Storage“** bzw. **„Integrations“** eine Neon-Integration an, die die Adressen automatisch einträgt. Sie legt dabei aber möglicherweise ein **neues** Neon-Projekt an (dann Region Frankfurt und **Postgres 18** prüfen). Da dein Projekt schon fertig ist, ist das Kopieren von Hand hier einfacher.

---

## 2. Passwort und Zufallswerte vorbereiten

Du brauchst drei Werte. Schreib sie in dieselbe Notiz wie die Datenbank-Adressen.

### 2.1 Zugangspasswort (für dich und deine Testpersonen)

- Denk dir ein Passwort mit **mindestens 10 Zeichen** aus, das du gut weitergeben kannst – z. B. vier Wörter und eine Zahl: `Koffer-Mango-Wolke-17` (bitte **nicht** genau dieses nehmen).
- Keine Umlaute oder Sonderzeichen außer `-` verwenden – manche Handys tun sich damit im Passwort-Fenster schwer.
- In die Notiz: `PREVIEW_ACCESS_PASSWORD=<dein Passwort>`

### 2.2 Zwei Zufallswerte erzeugen (am Windows-PC)

Diese Werte musst du dir **nicht merken** und nie weitergeben – sie werden nur einmal in Vercel eingetragen.

1. Drücke die **Windows-Taste**, tippe `PowerShell` und klicke auf **„Windows PowerShell“** (keine Administrator-Rechte nötig).
2. Kopiere diese Zeile, füge sie im blauen bzw. schwarzen Fenster mit **Rechtsklick** (oder Strg+V) ein und drücke **Enter**:

   ```powershell
   $b = New-Object byte[] 20; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); -join ($b | ForEach-Object { $_.ToString('x2') })
   ```

3. Es erscheint eine Zeile mit **40 Zeichen** aus Ziffern und den Buchstaben a–f, z. B. `8002f388dd8dd9bb2c2ada571eabf271b90955e7` (Beispiel – nicht verwenden).
4. Markiere sie mit der Maus (Doppelklick auf die Zeile), kopiere sie (Strg+C oder Rechtsklick) und schreibe sie in die Notiz: `BETTER_AUTH_SECRET=<Wert>`
5. Drücke im PowerShell-Fenster die **Pfeil-nach-oben-Taste** und **Enter** – es kommt ein **neuer, anderer** Wert. In die Notiz: `CRON_SECRET=<Wert>`
6. PowerShell schließen.

Deine Notiz sieht jetzt ungefähr so aus (Werte gekürzt):

```text
APP_ENV=preview
MAIL_TRANSPORT=inbox
PREVIEW_ACCESS_PASSWORD=Koffer-Mango-Wolke-17
BETTER_AUTH_SECRET=8002f388dd8dd9bb2c2a…
CRON_SECRET=3b9e01c7a4…
DATABASE_URL=postgresql://neondb_owner:…@ep-…-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://neondb_owner:…@ep-….eu-central-1.aws.neon.tech/neondb?sslmode=require
```

Ergänze die ersten zwei Zeilen (`APP_ENV=preview`, `MAIL_TRANSPORT=inbox`) genau so – sie sind nicht geheim.

**Bitte nicht eintragen:** `APP_URL`, `BETTER_AUTH_URL`, `AUTH_IP_HEADER`, `AUTH_TRUSTED_PROXIES`, `RETENTION_TOKEN`, `RATE_LIMIT_ENABLED` und alles mit `SMTP_…` – die Standardwerte passen. Optional: `CONTACT_EMAIL` (Kontaktadresse auf der Hilfe-Seite; ohne Eintrag steht dort ein Platzhalter).

---

## 3. Repository in Vercel importieren und Variablen eintragen

> **Wichtig:** Die Variablen müssen **vor** dem ersten Aufbau eingetragen sein. Wenn du doch zuerst auf „Deploy“ klickst, ist das nicht schlimm – siehe Kapitel 8, Fall A.

1. Öffne <https://vercel.com> und melde dich an (**„Continue with GitHub“**).
2. Klicke oben rechts auf **„Add New…“** → **„Project“**.
3. Unter **„Import Git Repository“** erscheint eine Liste deiner GitHub-Repositories.
   - Steht `wir-wollen-weg` **in der Liste**: weiter mit Schritt 4.
   - Steht es **nicht** in der Liste: Klicke auf **„Adjust GitHub App Permissions“** (bzw. „Configure GitHub App“). Es öffnet sich GitHub. Unter **„Repository access“** entweder „All repositories“ wählen oder bei **„Only select repositories“** das Repository `maxboelke/wir-wollen-weg` hinzufügen → **„Save“**. Zurück im Vercel-Tab erscheint es in der Liste (ggf. Seite neu laden).
4. Klicke neben `wir-wollen-weg` auf **„Import“**.
5. Es erscheint die Seite **„Configure Project“** (bzw. „New Project“):
   - **Project Name:** `wir-wollen-weg` lassen (daraus wird die Adresse `wir-wollen-weg.vercel.app`, falls frei – sonst hängt Vercel etwas an).
   - **Framework Preset:** unverändert lassen (Next.js).
   - **Root Directory:** unverändert lassen (`./`).
   - **Build and Output Settings:** **nicht** aufklappen bzw. nichts ändern – das Team hat alles in der Datei `vercel.json` hinterlegt.
6. Klicke auf **„Environment Variables“**, um den Bereich aufzuklappen.
7. Trage die **sieben Variablen** aus deiner Notiz ein:
   - **Schnellweg:** Markiere in der Notiz alle sieben Zeilen, kopiere sie und füge sie in das erste Feld **„Key“** ein (Strg+V). Vercel erkennt das Format `NAME=Wert` und legt alle Zeilen auf einmal an.
   - **Einzeln:** Links bei **„Key“** den Namen (z. B. `APP_ENV`), rechts bei **„Value“** den Wert (z. B. `preview`) eintragen, dann **„Add“** bzw. **„Add More“** – für jede Zeile.
8. Kontrolliere die Liste: genau diese sieben Namen, ohne Leerzeichen am Anfang oder Ende der Werte:

   | Name (Key)                | Wert (Value)                                       |
   | ------------------------- | -------------------------------------------------- |
   | `APP_ENV`                 | `preview`                                          |
   | `MAIL_TRANSPORT`          | `inbox`                                            |
   | `PREVIEW_ACCESS_PASSWORD` | dein Zugangspasswort (mind. 10 Zeichen)            |
   | `BETTER_AUTH_SECRET`      | Zufallswert 1 (40 Zeichen)                         |
   | `CRON_SECRET`             | Zufallswert 2 (40 Zeichen)                         |
   | `DATABASE_URL`            | Neon-Adresse **mit** `-pooler`                     |
   | `DATABASE_URL_UNPOOLED`   | Neon-Adresse **ohne** `-pooler`                    |

9. Klicke auf **„Deploy“**.
10. Schließe danach die Notiz **ohne zu speichern** (bzw. lege die Werte im Passwort-Manager ab). Das Zugangspasswort solltest du behalten.

---

## 4. Erster Aufbau – warten und kurz prüfen

1. Vercel zeigt jetzt eine Seite mit laufendem Protokoll („Building“). Der erste Aufbau dauert **ca. 3–6 Minuten**.
2. Im Protokoll siehst du nacheinander (grob):
   - `pnpm install` – Programmbausteine werden geladen (dauert am längsten),
   - `[vercel-build] migrations` – die Tabellen in deiner Neon-Datenbank werden angelegt,
   - `[vercel-build] demo data` – Anna, Ben & Co. mit ihren Demo-Reisen werden angelegt (nur beim allerersten Mal),
   - `[vercel-build] next build` – die App wird gebaut.
   - Gelbe Warnungen (z. B. zu `sslmode`, „deprecated“) sind normal und können ignoriert werden.
3. **Fertig**, wenn Vercel „Congratulations!“ bzw. den Status **„Ready“** (grüner Punkt) zeigt. Klicke dann auf **„Continue to Dashboard“** (bzw. „Go to Dashboard“).
4. **Rot / „Error“?** Klicke auf das fehlgeschlagene Deployment und lies die **letzten roten Zeilen** im Protokoll. Die häufigsten Ursachen:

   | Steht im Protokoll …                                              | Bedeutung                                         | Lösung                                                                                                                             |
   | ----------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
   | `DATABASE_URL is missing`                                         | Datenbank-Adresse fehlt                           | Variable nachtragen → neu aufbauen (Kapitel 8, Fall A)                                                                             |
   | `APP_ENV=… this build is only for APP_ENV=preview`                | `APP_ENV` falsch geschrieben                      | Wert auf genau `preview` setzen → neu aufbauen                                                                                     |
   | `migrations failed`, `connect`, `password authentication failed`, `ENOTFOUND` | Datenbank nicht erreichbar oder Adresse falsch kopiert | Adressen aus Neon neu kopieren (Kapitel 1), in Vercel ersetzen → neu aufbauen (Kapitel 8, Fall F)                                   |
   | `function uuidv7() does not exist`                                | Datenbank ist älter als Postgres 18               | Neon-Projekt mit **Postgres 18** verwenden (dein Projekt hat 18 – Adresse prüfen)                                                  |
   | eine andere pnpm-Version als `12.10.1`, `ERR_PNPM_…`, `Unsupported engine` | falsche pnpm-Version                       | Variable `ENABLE_EXPERIMENTAL_COREPACK` mit Wert `1` ergänzen → neu aufbauen                                                       |
   | `VERCEL_ENV=preview: only the production deployment …`            | Es wurde ein anderer Zweig als `main` gebaut      | Nichts tun – nur Aufbauten von `main` zählen. Schlägt auch `main` so fehl: Team fragen                                             |
   | `next build` mit Fehlern im Programmcode                          | Fehler im Code                                    | Screenshot **nur der Fehlerzeilen** (ohne Variablen-Seite) ans Team                                                                |

   Schlägt ein Aufbau fehl, bleibt die vorherige funktionierende Version online. Beim allerersten Mal gibt es noch keine – dann ist die Adresse bis zum ersten erfolgreichen Aufbau nicht erreichbar.

---

## 5. Vorschau öffnen und anmelden

### 5.1 Die richtige Adresse finden

1. Im Vercel-Dashboard deines Projekts steht unter **„Domains“** die **Haupt-Adresse**, z. B. `wir-wollen-weg.vercel.app` (auch unter **„Settings“ → „Domains“**).
2. **Nur diese Adresse benutzen.** Vercel zeigt zusätzlich Adressen mit Zufallsanhang, z. B. `wir-wollen-weg-a1b2c3-maxboelke.vercel.app` oder `…-git-main-….vercel.app`. Diese sind gesperrt bzw. die Anmeldung funktioniert dort nicht.
3. Speichere die Haupt-Adresse als Lesezeichen.

### 5.2 Am PC

1. Öffne `https://<deine-haupt-adresse>` (z. B. `https://wir-wollen-weg.vercel.app`).
2. Der Browser zeigt ein kleines Fenster **„Anmelden“** (bzw. „Sign in“):
   - **Benutzername:** beliebig, z. B. `demo`,
   - **Passwort:** dein Zugangspasswort aus Kapitel 2.1.
3. Der Browser merkt sich das Passwort, bis du ihn ganz schließt. Danach fragt er erneut.
4. Der erste Aufruf nach einer Pause dauert **1–3 Sekunden länger** (die Datenbank „schläft“ nach 5 Minuten ohne Zugriffe). Das ist normal.
5. In der App: **„Anmelden“** → E-Mail `anna@demo.test` eintragen → **„Code senden“**.
6. Auf der Code-Seite klicke auf **„Demo-Postfach öffnen“**. Es öffnet sich ein neuer Tab mit den Mails an Anna. Ganz oben steht die neueste Mail mit einem großen 6-stelligen Code.
7. Klicke auf **„Code kopieren“**, wechsle zurück in den ersten Tab und füge den Code ein (oder tippe ihn ab).
8. Du bist als Anna angemeldet. Welche Demo-Person was zeigt, steht in der Tabelle in [demo-anleitung.md](demo-anleitung.md) (§3.2 „Demo-Personen“) und im Klick-Drehbuch [demo-drehbuch.md](demo-drehbuch.md) – Namen und Reisen sind dieselben.

Das Demo-Postfach erreichst du jederzeit auch über den Link im gelben Demo-Balken oben auf jeder Seite.

### 5.3 Am Handy

1. Öffne dieselbe Haupt-Adresse im Handy-Browser (Safari bzw. Chrome) – z. B. als Lesezeichen per Mail an dich selbst oder abgetippt.
2. Benutzername beliebig, Zugangspasswort eingeben.
3. Anmelden wie am PC: **„Code senden“** → **„Demo-Postfach öffnen“** (öffnet einen zweiten Tab) → **„Code kopieren“** → zurück zum ersten Tab → einfügen.
4. **Zum Home-Bildschirm hinzufügen** (wirkt dann wie eine App):
   - **iPhone (Safari):** Teilen-Symbol (Quadrat mit Pfeil) → **„Zum Home-Bildschirm“** → **„Hinzufügen“**.
   - **Android (Chrome):** Menü **⋮** → **„Zum Startbildschirm hinzufügen“** bzw. **„App installieren“**.
   - Beim Öffnen vom Home-Bildschirm fragt das Handy ggf. **erneut nach dem Zugangspasswort** und du musst dich ggf. noch einmal mit Code anmelden – das ist normal.

---

## 6. Mit Freundinnen und Freunden teilen

1. Gib **zwei Dinge** weiter: die **Haupt-Adresse** und das **Zugangspasswort** (Benutzername beliebig). Am besten getrennt, z. B. Adresse per Nachricht, Passwort mündlich.
2. Sag dazu: **„Bitte nur ausgedachte Daten eingeben.“** Zum Anmelden die Demo-Personen nutzen (z. B. `ben@demo.test`) oder ein neues Konto mit einer ausgedachten Adresse wie `lisa@freunde.test` anlegen. **Nicht** `@demo.test` für eigene Konten verwenden: „Demo zurücksetzen“ löscht alle `@demo.test`-Konten und jede Reise, in der eines davon Mitglied ist.
3. **Warum keine echten Daten:**
   - Wer das Zugangspasswort hat, sieht **das ganze Demo-Postfach** – also alle Codes – und kann sich damit **als jede Adresse** anmelden. Für eine Demo ist das gewollt, für echte Daten nicht.
   - Es gibt noch kein echtes Impressum und keinen echten Datenschutztext; Vercel ist ein US-Anbieter. Echte Nutzung ist erst nach dem Go-Live (Gate G1) erlaubt.
4. **WhatsApp & Co.:** Ein Link in WhatsApp, Instagram oder Signal zeigt **keine Vorschau** (kein Bild, kein Titel), und der eingebaute Browser dieser Apps fragt ebenfalls nach dem Passwort. Tipp: Link lange drücken → **„In Safari/Chrome öffnen“**.
5. **Einladungen ausprobieren:** Eine in der App erzeugte Einladung (`…/i/…`) funktioniert genauso – die eingeladene Person braucht zusätzlich das Zugangspasswort.

---

## 7. Pflege im Alltag

| Was                                  | Wie                                                                                                                                                                                                                                                        |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Neue Versionen**                   | Kommen **automatisch**: Jedes Mal, wenn das Team etwas auf `main` mergt, baut Vercel die Vorschau neu (wieder ca. 3–6 Min.). Du musst nichts tun. Deine Demo-Daten bleiben dabei erhalten.                                                                  |
| **Demo zurücksetzen**                | Demo-Postfach öffnen → ganz unten **„Demo zurücksetzen“** aufklappen → Häkchen **„Ja, Demo-Daten zurücksetzen“** → **„Demo zurücksetzen“**. Legt Anna & Co. mit allen Demo-Reisen neu an (Termine passend zum heutigen Datum). Konten mit anderen Adressen bleiben. Gut vor jeder Vorführung. |
| **Zugangspasswort ändern**           | Vercel → Projekt → **„Settings“** → **„Environment Variables“** → bei `PREVIEW_ACCESS_PASSWORD` **„⋯“** → **„Edit“** → neuen Wert → **„Save“**. Danach **neu aufbauen** (Kapitel 8, Fall A, Schritte 3–5) – erst dann gilt das neue Passwort.                    |
| **Vorschau kurz schließen**          | Zugangspasswort ändern (siehe oben) und niemandem sagen.                                                                                                                                                                                                    |
| **Kosten**                           | **0 €.** Bei Vercel Hobby und Neon Free gibt es keine Rechnung; werden die monatlichen Freikontingente überschritten, wird die Vorschau gebremst oder pausiert, nicht berechnet. Für eine Freundes-Vorschau reichen die Kontingente bei Weitem.                                      |
| **Ganz abschalten**                  | Vercel → Projekt → **„Settings“** → **„General“** → ganz unten **„Delete Project“**. Neon → Projekt → **„Settings“** → ganz unten **„Delete project“** (löscht alle Demo-Daten). Beides lässt sich mit dieser Anleitung später neu einrichten.                     |

Nichts zu tun gibt es für den **täglichen Aufräum-Job** (löscht alte Mails und abgelaufene Demo-Reisen): Vercel startet ihn jede Nacht automatisch.

---

## 8. Wenn etwas nicht klappt

### Fall A – Variable vergessen, falsch oder geändert → neu aufbauen

Vercel übernimmt geänderte Variablen **erst beim nächsten Aufbau**.

1. Vercel → Projekt → **„Settings“** → **„Environment Variables“**.
2. Fehlende Variable mit **„Add New“** (bzw. „Add Environment Variable“) anlegen oder bestehende über **„⋯“** → **„Edit“** korrigieren. Als Umgebung (**„Environments“**) muss **„Production“** angehakt sein. **„Save“**.
3. Oben auf **„Deployments“** klicken.
4. Beim obersten Eintrag rechts auf **„⋯“** → **„Redeploy“**.
5. Im Fenster nochmal **„Redeploy“** klicken. Nach ca. 2–5 Minuten ist die neue Version online.

### Fall B – Das Passwort-Fenster kommt immer wieder (401)

- Zugangspasswort genau prüfen (Groß-/Kleinschreibung, keine Leerzeichen am Ende). Der Benutzername ist egal.
- Das Passwort wurde in Vercel geändert, aber nicht neu aufgebaut? → Fall A, Schritte 3–5. Bis dahin gilt das **alte** Passwort.
- Browser hat ein falsches Passwort gespeichert: Browser ganz schließen und neu öffnen, oder ein privates Fenster (Inkognito) verwenden.

### Fall C – „Preview not configured“ bzw. Fehler 503

Die Variable `PREVIEW_ACCESS_PASSWORD` fehlt oder ist **kürzer als 10 Zeichen**. Die Vorschau bleibt dann absichtlich geschlossen. → Variable korrigieren, Fall A.

### Fall D – Vercel zeigt eine eigene Anmeldeseite oder die App-Anmeldung scheitert

Du bist wahrscheinlich auf einer **Deployment-Adresse mit Zufallsanhang** statt auf der Haupt-Adresse. → Haupt-Adresse aus **„Domains“** verwenden (Kapitel 5.1).

### Fall E – Der Code kommt nicht an

- Im Demo-Postfach auf **„Aktualisieren“** tippen (oder Seite neu laden). Ganz oben steht die neueste Mail.
- Ist das Postfach gefiltert (z. B. „Nur Mails an anna@demo.test“), prüfen, ob die Adresse genau stimmt – oder **„Alle Mails zeigen“**.
- Code abgelaufen (nach 15 Minuten) → in der App **„Neuen Code senden“**.
- „Bitte warte kurz …“ oder „Zu viele Versuche“: Pro Adresse sind nur **5 Codes pro Stunde** erlaubt (Schutz gegen Missbrauch, bleibt auch im Echtbetrieb). In der Vorschau gibt es dafür keinen Entsperr-Knopf – einfach eine **andere Demo-Person** nehmen (z. B. `ben@demo.test`) oder die angezeigte Zeit abwarten.

### Fall F – Fehler mit der Datenbank

- Erster Aufruf nach einer Pause dauert länger oder zeigt einmal einen Fehler → nach ein paar Sekunden **neu laden** (die Datenbank wacht gerade auf).
- Bleibt der Fehler bzw. scheitert der Aufbau bei `migrations`: Beide Adressen in Neon neu kopieren (Kapitel 1) – auf `-pooler` bei `DATABASE_URL`, kein `-pooler` bei `DATABASE_URL_UNPOOLED` und `sslmode=require` achten – in Vercel ersetzen (Fall A).
- Hilft das nicht und die Adressen enthalten `&channel_binding=require`: diesen Teil (inklusive `&`) aus **beiden** Adressen entfernen, Fall A, und dem Team Bescheid geben.
- Neon zeigt im Dashboard, dass das Monatskontingent aufgebraucht ist → bis zum Monatswechsel warten oder Team fragen.

### Fall G – Die Seite ist veraltet bzw. eine Änderung des Teams fehlt

Vercel → **„Deployments“**: Läuft gerade ein Aufbau („Building“), ein paar Minuten warten. Ist der oberste Eintrag rot, Fall „Rot / Error?“ in Kapitel 4.

### Fall H – Termine der Demo-Reisen passen nicht mehr (z. B. Abstimmung längst vorbei)

Die Demo-Daten werden beim ersten Aufbau angelegt und altern dann mit. → **„Demo zurücksetzen“** (Kapitel 7).

Wenn nichts davon hilft: dem Team schreiben, **was** du gemacht hast, **welche Adresse** du geöffnet hast und **welche Meldung** kam – gerne mit Screenshot der Meldung, aber **nie** mit der Variablen-Seite von Vercel oder dem Connect-Fenster von Neon.
