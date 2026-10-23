# Compliance-Checkliste (DE/EU) – Wir wollen weg

Stand: 2026-10-23 · Verantwortlich: Operations Manager · Status: Entwurf v0.9 (Offline-Demo-Modus, Platzhalter-Regel §0a; v0.9: **Reiseunterlagen/Dateien (F-055)** – G1b-Prüfpunkte §12.8 (Speicher, Virenscan, Upload-Härtung, DSA-Meldeweg, Datenschutz-Abschnitt), Beta-Entscheidung E-G0-10 §13.7, Einträge §3/§6 – Technik deployment.md §0.13; v0.8: §13 an W23 angeglichen – Kurzfassung §13.6, Beta-/Einladungs-Pass-Cookies, Feedback, kein Lösch-Versprechen zum Beta-Ende; v0.7: **Gate G0 – geschlossene Freundes-Beta §13** (Pflichtpunkte, Kurzbewertung Vercel/Neon/Lettermint, Impressum-Einschätzung, Entwurf Beta-Datenschutzhinweis, Speicher/Löschung PWA), Einträge §3; v0.6: **Gate G1b – persönliche Reisedaten §12** (Abnahme, DSFA, PAuswG/PassG, Datenschutz-Abschnitt, Löschregeln, Log-Regeln, DEMO-Präfix), Einträge §2/§3/§5/§6/§7 – Inkrement 11, F-054/F-056; v0.5: Kosten teilen & Zahlungsinfo §2b, Speicher-/Lösch-/TOM-Einträge – Inkrement 10, F-035/F-036; v0.4: Unterkünfte & Link-Vorschau §2a, Speicher-/Lösch-/TOM-Einträge – Inkrement 9, F-031; v0.3: Ausnahme Einladungs-Token im Klartext §7a, Logs ohne Tokens, R-037)

> **Wichtiger Hinweis:** Diese Checkliste ist eine strukturierte Arbeitsgrundlage aus Betriebssicht und **ersetzt keine Rechtsberatung**. Vor dem öffentlichen Launch (M2) – spätestens vor Einführung von Bezahlfunktionen (F-050) – sollten Impressum, Datenschutzerklärung, Nutzungsbedingungen/AGB und die Bewertung von BFSG/TDDDG durch eine fachkundige Person (Anwalt/Anwältin für IT- und Datenschutzrecht oder ein seriöser Rechtstexte-Dienst mit Haftungsübernahme) geprüft werden.

Bezug: [PRD §6, §8, §10, §12](../product/PRD.md) · [features.md](../product/features.md) (F-013, F-040–F-046) · [deployment.md](deployment.md) · [tech-stack.md](tech-stack.md) · [**go-live.md – Go-Live-Gate**](go-live.md)

> **Aktueller Stand (Auftraggeber 2026-10-08, Q14–Q16):** Betrieb nur als **Offline-Demo** ([deployment.md §0](deployment.md#0-aktueller-betriebsmodus-offline-demo-gültig-seit-2026-10-08)). Betreiber-/Impressumsangaben und Rechtstexte sind **Platzhalter (Privatperson)** – es gilt die Platzhalter-Regel §0a. Alle mit **M1/M2/P** markierten Punkte bleiben gültig und werden über das [Go-Live-Gate](go-live.md) abgearbeitet; der CEO erinnert den Auftraggeber vor Go-Live daran.

Legende: ☐ offen · ◐ in Arbeit · ☑ erledigt · **M1** = vor Beta · **M2** = vor öffentlichem Launch · **P** = vor Bezahlfunktionen

---

## 0. Grundentscheidung: Wer ist Betreiber? (zurückgestellt bis Go-Live – Auftraggeber 2026-10-08, Q14; Pflichtpunkt in [go-live.md](go-live.md))

| ☐ | Punkt | Fällig |
|---|---|---|
| ☐ | Betreiber festlegen: Privatperson (Einzelunternehmer) **oder** Gesellschaft (z. B. UG/GmbH). Betreiber = „Verantwortlicher“ i. S. d. Art. 4 Nr. 7 DSGVO und Anbieter i. S. d. DDG. | M1 |
| ☐ | Ladungsfähige Anschrift für das Impressum klären (Privatadresse wird öffentlich; Alternativen: Geschäftsadresse/Coworking, ggf. Impressums-Service – Zulässigkeit „c/o“-Adresse vorher prüfen lassen). | M1 |
| ☐ | Kontakt-E-Mail-Postfach + zweiter schneller Kontaktweg (Telefon oder Kontaktformular). | M1 |
| ☐ | Datenschutzbeauftragter: in DE i. d. R. erst ab 20 Personen, die ständig mit Datenverarbeitung beschäftigt sind (§ 38 BDSG) → im MVP voraussichtlich **nicht** nötig; Entscheidung dokumentieren. | M1 |
| ☐ | Gewerbeanmeldung/steuerliche Erfassung spätestens mit Gewinnerzielungsabsicht (Freemium) klären (Steuerberatung). | P |

## 0a. Platzhalter-Regel für die Offline-Demo (gilt bis zum Go-Live-Gate)

> Gilt für Demo und Vorschau. Für die **geschlossene Freundes-Beta (G0)** gelten stattdessen die Mindesttexte aus §13 (Beta-Datenschutzhinweis mit echtem Namen, Seite „Anbieter & Kontakt“) – ohne Platzhalter.

Begründung: Solange die App nur lokal (eigener Laptop, eigenes WLAN, ggf. kurzzeitiger Test-Tunnel mit Demo-Daten) läuft, gibt es kein öffentliches Angebot und keine Verarbeitung echter Nutzerdaten. Die Seiten werden trotzdem **gebaut**, damit Struktur, Links und Barrierefreiheit von Anfang an geprüft werden.

| ☐ | Regel | Wer |
|---|---|---|
| ☐ | Seiten **Impressum**, **Datenschutz** (und ab M2 Nutzungsbedingungen, Lizenzen) existieren in DE und EN, sind von jeder Seite inkl. Einladungs- und Login-Flow erreichbar (Footer) – wie im Echtbetrieb | Developer |
| ☐ | Inhalte sind **klar markierte Platzhalter**: jeder fehlende Wert steht als `[PLATZHALTER: …]` im Text (z. B. `[PLATZHALTER: Name Betreiber (Privatperson)]`, `[PLATZHALTER: ladungsfähige Anschrift]`, `[PLATZHALTER: Kontakt-E-Mail]`, `[PLATZHALTER: Hosting-Anbieter]`); oben auf jeder Rechtsseite ein Hinweis „Demo-Version – Platzhaltertext, keine gültigen Rechtsangaben“ | Developer |
| ☐ | **Keine echten personenbezogenen Daten** des Auftraggebers (Name, Privatadresse, Telefon) in Platzhaltern, im Repo, in Seeds oder Screenshots | alle, Reviewer prüft |
| ☐ | Gliederung der Datenschutz-Platzhalterseite folgt §2 (Abschnittsüberschriften schon vorhanden), damit später nur Inhalte ersetzt werden | Developer |
| ☐ | Mail-Footer (Mailpit) verlinkt auf die Platzhalter-Impressumsseite | Developer |
| ☐ | **Demo nicht öffentlich zugänglich machen:** kein dauerhaftes Hosting, keine öffentliche Domain, kein dauerhafter Tunnel/Port-Forwarding am Router; Tunnel nur kurzzeitig für Gerätetests mit Demo-Daten (deployment.md §0.5); Demo-Banner + `noindex` | Operations, alle |
| ☐ | Testpersonen nutzen nur ausgedachte Daten (`…@demo.test`); echte Freundesgruppen erst nach Go-Live | alle |
| ☐ | **Startschutz:** mit `APP_ENV=production` startet die App nicht, solange ein `[PLATZHALTER`-Marker in Rechtstexten/Konfiguration steht (deployment.md §0.6) | Developer, Reviewer |
| ☐ | Vor Go-Live: alle Platzhalter ersetzt, Weg für Rechtstexte (Generator/Anwalt) entschieden → [go-live.md](go-live.md) Stufe 2a | Auftraggeber, CEO erinnert |

## 1. Impressum (§ 5 DDG)

Seit 14.05.2024 gilt das **Digitale-Dienste-Gesetz (DDG)** statt TMG – im Impressum „§ 5 DDG“ zitieren, nicht mehr „§ 5 TMG“. Impressumspflicht besteht für geschäftsmäßige, i. d. R. gegen Entgelt angebotene digitale Dienste; wegen Freemium-Modell ist von einer Pflicht **ab dem ersten öffentlichen Zugang** auszugehen.

| ☐ | Inhalt | Fällig |
|---|---|---|
| ☐ | Name (bei Gesellschaft: Firma, Rechtsform, Vertretungsberechtigte) | M1 |
| ☐ | Ladungsfähige Anschrift (kein Postfach) | M1 |
| ☐ | E-Mail-Adresse + weiterer schneller Kontaktweg | M1 |
| ☐ | Ggf. Handelsregister/Registernummer, USt-IdNr. (falls vorhanden) | M1 |
| ☐ | Ggf. Verantwortlicher für journalistisch-redaktionelle Inhalte (§ 18 Abs. 2 MStV) – nur falls Blog/Magazin | bei Bedarf |
| ☐ | Hinweis Verbraucherstreitbeilegung (§ 36 VSBG) – Pflicht erst bei > 10 Beschäftigten bzw. wenn AGB genutzt werden und Anwendbarkeit gegeben; kurz prüfen lassen | P |
| ☐ | **Keinen** Link mehr auf die EU-OS-Plattform (Plattform wurde 2025 eingestellt) | M1 |
| ☐ | Erreichbar mit höchstens zwei Klicks von jeder Seite (Footer, auch im Einladungs- und Login-Flow, auch ohne Login) | M1 |
| ☐ | Sprache: Deutsch (verbindlich); englische Seite verlinkt auf dieselben Angaben („Legal notice“) | M2 |
| ☐ | Lizenzhinweise/Credits (z. B. `date-holidays`-Daten unter CC-BY-3.0, Schriften) auf eigener Seite „Lizenzen“ | M2 |

## 2. Datenschutzerklärung (Art. 13 DSGVO) – DE (verbindlich) + EN

| ☐ | Inhalt | Fällig |
|---|---|---|
| ☐ | Verantwortlicher mit Kontaktdaten (§0) | M1 |
| ☐ | **Konto** (F-040–F-043): Anzeigename, E-Mail, optional Passwort-Hash, Sprache, Region – Zweck Vertragserfüllung, Rechtsgrundlage Art. 6 Abs. 1 lit. b DSGVO | M1 |
| ☐ | **Reisedaten**: Mitgliedschaft, Rolle, Verfügbarkeiten, Kommentar, Stimmen – sichtbar für andere Mitglieder derselben Reise (Transparenzhinweis „namentlich sichtbar“, F-008/F-011) – Art. 6 Abs. 1 lit. b | M1 |
| ☐ | **Anmeldung per Code/Magic-Link**, Sessions, Rate-Limiting, Sicherheits-Logs mit IP (max. 7 Tage) – Art. 6 Abs. 1 lit. f (Sicherheit), Interessenabwägung kurz begründen | M1 |
| ☐ | **Passwort-Leak-Prüfung** (Have I Been Pwned, k-Anonymität: nur 5 Zeichen eines Hashwerts werden übermittelt, kein Personenbezug) erwähnen – **nur falls `PASSWORD_BREACH_CHECK=hibp`** eingeschaltet wird (Entscheidung im [Go-Live-Gate](go-live.md); in der Offline-Demo aus, dann nur Offline-Liste) | M1 |
| ☐ | **Transaktionsmails** (Code, Reset, E-Mail-Änderung, Lösch-/Inaktivitätshinweise) – kein Tracking, Empfänger: Mail-Anbieter (AVV) | M1 |
| ☐ | **Hosting** (Hetzner, Deutschland), **Mail-Anbieter** (z. B. Lettermint, Niederlande), **Backup-Speicher**, **Fehler-Tracking** (selbst gehostet) als Empfänger/Auftragsverarbeiter | M1 |
| ☐ | **Keine Drittlandübermittlung** (bei Umsetzung gemäß deployment.md); sonst Abschnitt mit Rechtsgrundlage (DPF/SCC) ergänzen | M1 |
| ☐ | **Cookies/Endgerätezugriff**: nur technisch notwendige (Session, Sprache, ggf. `pending_invite`, `sessionStorage` für Formularentwurf) – Rechtsgrundlage § 25 Abs. 2 Nr. 2 TDDDG (siehe §4) | M1 |
| ☐ | **Statistik**: cookielose, aggregierte Ereigniszählung ohne Personenbezug beschreiben (PRD §4) | M1 |
| ☐ | **Speicherdauer** gemäß Löschkonzept (§6), inkl. „Backups bis zu 30 Tage“ | M1 |
| ☐ | Betroffenenrechte Art. 15–21 (Auskunft im MVP per E-Mail, F-043), Widerspruch gegen lit. f-Verarbeitungen, Beschwerderecht bei Aufsichtsbehörde (zuständige Behörde nach Sitz des Betreibers nennen) | M1 |
| ☐ | Pflicht zur Bereitstellung: E-Mail ist für das Konto erforderlich; ohne Konto keine Teilnahme (Q2) | M1 |
| ☐ | Keine automatisierte Entscheidung i. S. d. Art. 22 (Kandidaten-Vorschläge sind unverbindliche Vorschläge, die Gruppe entscheidet) | M1 |
| ☐ | **Unterkünfte & Link-Vorschau** (F-031, Inkrement 9): Abschnitt nach §2a (Platzhaltertext vorgemerkt) | M1 |
| ☐ | **Kosten teilen & Zahlungsinfo** (F-035/F-036, Inkrement 10): Abschnitt nach §2b (Platzhaltertext vorgemerkt) – IBAN/Zahlungsinfo personenbezogen, für die Reise sichtbar, beim Verlassen gelöscht; keine Zahlungsabwicklung | M1 |
| ☐ | **Persönliche Reisedaten** (F-054/F-056, Inkrement 11): Abschnitt nach §12.3 (Platzhaltertext vorgemerkt) – Einwilligung nur an die anfragende „Bucht“-Person, verschlüsselt, Zugriffsprotokoll, Löschung 7 Tage nach Reiseende; **Pflicht erst mit G1b** | G1b |
| ☐ | Hinweis für Organisatoren: Platzhalter-Namen (F-007) sind Daten Dritter → Hinweis „nur Vornamen/Spitznamen verwenden“ in UI und Erklärung | M1 |
| ☐ | Englische Fassung mit Hinweis „Translation – the German version is legally binding“ | M2 |
| ☐ | Kurzfassung („Datenschutz auf einen Blick“) auf Registrierungs- und Beitrittsseite verlinkt (F-013) | M1 |
| ☐ | **v1-Ergänzungen vor Release:** Kalender-Import (nur frei/belegt, Rohdaten nur im Arbeitsspeicher, F-006/F-047), verschlüsselte Speicherung von Kalender-URLs/CalDAV-Passwörtern (F-019/F-048), Google/Microsoft/Apple als Login- bzw. Kalenderanbieter (F-045, F-020, F-021 – Drittland!), E-Mail-Benachrichtigungen mit Einwilligung (F-014) | v1 |

Erstellung (Entscheidung zurückgestellt bis Go-Live, Q16): Generator mit Aktualisierungsservice (z. B. Anbieter mit Abmahnschutz/Haftungsübernahme, ca. 10–30 €/Monat, Schätzung) **oder** einmalige anwaltliche Erstellung/Prüfung (Schätzung ca. 500–1 500 €). Entscheidung Auftraggeber.

## 2a. Vorgemerkt: Abschnitt „Unterkünfte & Link-Vorschau“ (F-031, Inkrement 9 – vor G1)

Quelle: features.md R.7 (I9-03, I9-04, I9-10), PRD Q33/Q34, deployment.md §0.8. Gilt erst mit echter Nutzung (G1); in Demo/Vorschau nur als Platzhalter auf der Datenschutzseite (Gliederung §0a). **Entwurf, keine Rechtsberatung** – Wortlaut bei der Rechtsprüfung (Q16) final festlegen.

| ☐ | Punkt | Wer | Fällig |
|---|---|---|---|
| ☐ | Überschrift „Unterkünfte & Link-Vorschau“ als eigener Abschnitt in der Platzhalter-Datenschutzseite (DE/EN) anlegen, Inhalt = Stichpunkte unten mit `[PLATZHALTER: …]`-Markern | Developer (Inkrement 9) | mit Inkrement 9 |
| ☐ | Endfassung DE (verbindlich) + EN nach Rechtsprüfung | Operations → Rechtsprüfung | M1 (EN: M2) |
| ☐ | **Urheberrecht Vorschaubilder** prüfen lassen: Anzeige des vom Portal selbst bereitgestellten `og:image` als verkleinerte Vorschau mit Quellenangabe (Domain) und Link, ohne dauerhafte Speicherung (Q34) – Risiko aus Betriebssicht gering, aber nicht null; ggf. Lösch-/Beschwerdeweg für Rechteinhaber nennen | Auftraggeber/Rechtsprüfung | M1 |
| ☐ | Prüfen, ob Portal-AGB das automatisierte Abrufen einzelner Seiten verbieten → wir rufen nur **einmal pro Vorschlag** auf Nutzerwunsch ab, eigener User-Agent, keine Umgehung von Sperren, Platzhalter bei Blockade | Rechtsprüfung | M1 |

**Platzhaltertext (Stichpunkte, Entwurf):**

> **Unterkünfte & Link-Vorschau**
> - **Was passiert:** Fügst du in einer Reise einen Link zu einer Unterkunft ein, ruft **unser Server** die öffentlich erreichbare Seite einmal ab, um Titel, Anbietername und ein Vorschaubild zu ermitteln. Der Abruf geht von unserem Server aus `[PLATZHALTER: Hosting-Anbieter, Standort]`, **nicht von deinem Gerät**.
> - **Keine Daten über dich:** Dabei übermitteln wir keine Daten über dich – keine IP-Adresse, keine Cookies, keine Anmeldedaten, keine Kennung. Der aufgerufene Anbieter sieht nur die IP-Adresse unseres Servers, unsere Programmkennung und die Adresse der Seite (den eingefügten Link). Bitte füge keine Links ein, die selbst persönliche Daten enthalten (z. B. Buchungsbestätigungen oder persönliche Freigabe-Links).
> - **Bilder:** Vorschaubilder leiten wir über unseren Server an deinen Browser weiter; dein Browser nimmt dafür **keinen Kontakt** zu den Servern der Portale auf. Die Bilder werden **nicht dauerhaft gespeichert** – höchstens im Zwischenspeicher deines Browsers für bis zu `[PLATZHALTER: 24 Stunden]` `[ggf.: und flüchtig auf unserem Server für höchstens 7 Tage, ohne Sicherung]`. Gespeichert wird nur die Adresse des Bildes.
> - **Was wir speichern:** Link, Titel, optional Gesamtpreis und Notiz, wer den Vorschlag gemacht hat und wann; deine Bewertungen (gefällt / gefällt nicht) mit Zeitpunkt; Festlegung und „gebucht“ durch die Orga.
> - **Wer es sieht:** nur Mitglieder derselben Reise. Vorschläge inkl. **Notiz** und Name der vorschlagenden Person sind für alle Mitglieder sichtbar – bitte keine sensiblen Angaben in Notizen. „Gefällt“ wird **namentlich**, „gefällt nicht“ nur **als Anzahl** gezeigt; die Rangliste siehst du erst, nachdem du selbst alle Vorschläge bewertet hast (die Orga sieht sie immer).
> - **Öffnen eines Links:** Erst wenn du einen Unterkunfts-Link öffnest (neuer Tab), verbindet sich dein Browser mit dem Portal; dort gilt dessen Datenschutzerklärung.
> - **Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO (Bereitstellung der von dir genutzten Funktion). Technisches Protokoll der Abrufe nur mit Hostname und Ergebnis (ohne Pfad, ohne Bezug zu dir, soweit technisch möglich) – Art. 6 Abs. 1 lit. f (Sicherheit, Missbrauchsschutz), Aufbewahrung `[PLATZHALTER: 7 Tage]`.
> - **Löschung:** zusammen mit der Reise (`[PLATZHALTER: 90 Tage nach Reiseende]` bzw. wenn die Orga die Reise löscht). Verlässt du die Reise oder löschst dein Konto, werden deine Bewertungen gelöscht; deine Vorschläge bleiben für die Gruppe **ohne deinen Namen** („ehemaliges Mitglied“).
> - **Auskunft/Export:** Der Datenexport enthält deine eigenen Vorschläge und Bewertungen.

## 2b. Vorgemerkt: Abschnitt „Kosten teilen & Zahlungsinfo“ (F-035/F-036, Inkrement 10 – vor G1)

Quelle: features.md R.8 (I10-03, I10-07, I10-08, I10-09, I10-10), PRD Q35/Q31/Q23, deployment.md §0.10. Gilt erst mit echter Nutzung (G1); in Demo/Vorschau nur als Platzhalter auf der Datenschutzseite (Gliederung §0a, Demo-Seed nur mit öffentlichen Beispiel-IBANs). **Entwurf, keine Rechtsberatung** – Wortlaut bei der Rechtsprüfung (Q16) final festlegen.

| ☐ | Punkt | Wer | Fällig |
|---|---|---|---|
| ☐ | Überschrift „Kosten teilen & Zahlungsinfo“ als eigener Abschnitt in der Platzhalter-Datenschutzseite (DE/EN) anlegen, Inhalt = Stichpunkte unten mit `[PLATZHALTER: …]`-Markern | Developer (Inkrement 10) | mit Inkrement 10 |
| ☐ | Endfassung DE (verbindlich) + EN nach Rechtsprüfung | Operations → Rechtsprüfung | M1 (EN: M2) |
| ☐ | Bestätigen lassen: **keine Zahlungsdienstleistung** (ZAG) und keine Finanzdienstleistung – die App rechnet nur und zeigt Salden, es fließt kein Geld über den Betreiber, keine Anbindung an Banken/Zahlungsdienste (R.0 Nr. 6). Aus Betriebssicht unkritisch; bei späteren Funktionen (EPC-/GiroCode-QR, `paypal.me`-Links, Zahlungsauslösung) neu bewerten | Rechtsprüfung | M1 |
| ☐ | Nutzungsbedingungen (M2, §9): Hinweis „Berechnungen ohne Gewähr, Ausgleich erfolgt zwischen den Mitgliedern“ | Operations → Rechtsprüfung | M2 |

**Platzhaltertext (Stichpunkte, Entwurf):**

> **Kosten teilen & Zahlungsinfo**
> - **Wozu:** Sobald eure Reise festgelegt ist, könnt ihr gemeinsame Ausgaben eintragen. Die App rechnet aus, wer wem wie viel schuldet, und schlägt möglichst wenige Überweisungen vor.
> - **Keine Zahlungsabwicklung:** Über die App fließt **kein Geld**. Wir führen keine Zahlungen aus, verbinden uns mit keiner Bank und keinem Zahlungsdienst und geben keine Daten an Banken oder Zahlungsdienste weiter. Überweisungen macht ihr selbst außerhalb der App.
> - **Was wir speichern:** je Ausgabe Titel, Betrag, Währung, Kategorie, Datum, wer bezahlt hat, für wen und wie aufgeteilt wurde, wer sie angelegt bzw. zuletzt geändert hat; als bezahlt markierte Ausgleichszahlungen (von wem an wen, Betrag, wer markiert hat, wann); Abschluss der Abrechnung durch die Orga.
> - **Zahlungsinfo (freiwillig):** Du kannst je Reise eine **IBAN** und/oder einen kurzen Freitext (z. B. „PayPal: …“) hinterlegen, damit andere dir Geld überweisen können. Die Angabe ist freiwillig; ohne sie funktioniert alles andere genauso. Die IBAN wird auf Gültigkeit geprüft (nur Rechenprüfung, keine Abfrage bei einer Bank). Sie gilt nur für diese Reise und wird nicht in andere Reisen oder dein Konto übernommen.
> - **Wer es sieht:** alle Mitglieder derselben Reise – Ausgaben, Salden, Ausgleichsvorschlag und Zahlungsinfos sind für die Reise transparent. Die IBAN wird standardmäßig gekürzt angezeigt (Schutz vor Mitlesen), kann von Mitgliedern aber vollständig angezeigt und kopiert werden. Bitte trag nur Angaben ein, die die Gruppe sehen darf.
> - **Wo sie nie erscheinen:** IBAN und Zahlungsinfo stehen nie in E-Mails, Teilen- oder Erinnerungs-Texten, Links oder technischen Protokollen. Teilen-Texte, die du selbst auslöst, enthalten nur Namen, Beträge der Ausgleiche und den Link zur Reise.
> - **Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO (Bereitstellung der von dir genutzten Funktion); für die freiwillige Zahlungsinfo zusätzlich deine bewusste Entscheidung, sie der Gruppe zu zeigen `[PLATZHALTER: Einordnung lit. b vs. lit. a – Rechtsprüfung]`.
> - **Löschung:** Alles zu Kosten wird **mit der Reise** gelöscht (`[PLATZHALTER: 90 Tage nach Reiseende]` bzw. wenn die Orga die Reise löscht). Gelöschte Ausgaben kannst du kurz rückgängig machen; endgültig entfernt werden sie `[PLATZHALTER: spätestens nach 2 Tagen]`. Deine **Zahlungsinfo** kannst du jederzeit selbst löschen; sie wird außerdem gelöscht, wenn du die Reise verlässt, entfernt wirst oder dein Konto löschst. Ausgaben und Salden bleiben dann für die Gruppe erhalten, aber **ohne deinen Namen** („ehemaliges Mitglied“) – damit die Abrechnung der anderen stimmt `[PLATZHALTER: berechtigtes Interesse der übrigen Mitglieder, Art. 6 Abs. 1 lit. f – Rechtsprüfung]`. Aus Sicherungskopien verschwinden Daten spätestens nach 30 Tagen.
> - **Platzhalter-Personen:** Für Personen ohne App (Platzhalter) speichern wir nur den von der Orga vergebenen Namen und ihre Beträge – keine Zahlungsinfo.
> - **Auskunft/Export:** Der Datenexport enthält deine Zahlungsinfo, die Ausgaben, die du angelegt oder bezahlt hast, deinen Anteil an weiteren Ausgaben, deine Ausgleichszahlungen und deinen Saldo – ohne Namen oder Zahlungsinfos anderer.

## 3. Auftragsverarbeitung (Art. 28 DSGVO)

| ☐ | Dienstleister | Daten | AVV | Fällig |
|---|---|---|---|---|
| ☐ | Hetzner Online GmbH (Hosting, Backups, ggf. Object Storage) | alle | in der Console abschließen | M1 |
| ☐ | Mail-Anbieter (Empfehlung Lettermint; Alternative Scaleway TEM) | E-Mail, Name, Mailinhalt (Code) | DPA des Anbieters | M1 |
| ☐ | Off-site-Backup-Speicher, falls anderer Anbieter (z. B. Scaleway) | verschlüsselte DB-Dumps | DPA | M1 |
| ☐ | Postfach-Anbieter (Kontakt-E-Mails, Betroffenenanfragen) | Kommunikation | AVV | M1 |
| ☐ | Fehler-Tracking: Bugsink selbst gehostet → **kein** AVV; bei Sentry SaaS: DPA + SCC/DPF | – | – | M1 |
| ☐ | GitHub (Code, CI) – **keine** Nutzerdaten in Repo/CI/Logs (nur synthetische Testdaten) → kein AVV nötig; Regel im Reviewer-Check | – | – | laufend |
| ☐ | Uptime-Dienst – ruft nur Health-Endpunkt auf, keine personenbezogenen Daten | – | – | – |
| ☐ | Airlines, Bahn, Unterkünfte (persönliche Reisedaten, F-054) – **keine Empfänger durch uns**: die „Bucht“-Person überträgt die Angaben selbst außerhalb der App; die App hat keine Buchungsschnittstelle (§12.3) | – | – | – |
| ☐ | Banken/Zahlungsdienste (Kosten teilen, F-035/F-036) – **keine Empfänger**: keine Anbindung, keine Zahlungsabwicklung (§2b); kein AVV | – | – | – |
| ☐ | Unterkunfts-Portale (Link-Vorschau, F-031) – **keine Empfänger** personenbezogener Daten: Abruf durch unseren Server ohne Nutzerdaten (§2a); kein AVV | – | – | – |
| ☐ | **G0 Beta:** Vercel Inc. (Hosting App, USA, DPF) – AVV-Geltung für Hobby unklar, Entscheidung E-G0-1; Neon (DB, Frankfurt, US-Unternehmen) – DPA in AGB + PDF; Lettermint (Mails, NL) – DPA in AGB (§13.2) | alle Beta-Daten | siehe §13.2 | G0 |
| ☐ | **Unterlagen-Speicher Vorschau:** Cloudflare, Inc. (R2, Bucket mit EU-Jurisdiktion; US-Unternehmen, DPF) – nur **Fantasie-Dateien** | keine echten personenbezogenen Daten | Cloudflare-DPA gilt über die Self-Serve-AGB (PDF trotzdem ablegen) | mit Inkrement 12 |
| ☐ | **Unterlagen-Speicher Beta** – nur bei E-G0-10 = B: Cloudflare R2 (EU) **oder** Scaleway SAS (FR) | echte Tickets (Namen, Buchungscodes) | DPA des Anbieters ablegen, Unterauftragsverarbeiter prüfen | G0 (falls B) |
| ☐ | **Unterlagen-Speicher Produktion:** Hetzner Object Storage – vom Hetzner-AVV (erste Zeile) abgedeckt; Prüfen, dass der AVV Object Storage einschließt. ClamAV selbst gehostet → **kein** weiterer Empfänger. Falls stattdessen eine Scan-API (z. B. attachmentAV): eigener AVV + Unterauftragsverarbeiter | Reiseunterlagen | Hetzner-AVV | G1b |
| ☐ | Ablage aller AVVs (PDF + Datum) außerhalb des Repos; Liste hier pflegen | – | – | M1 |

## 4. Cookies & Endgerätezugriff (§ 25 TDDDG) – Banner nötig?

Seit 14.05.2024 heißt das TTDSG **TDDDG**. § 25 erfasst jedes Speichern/Auslesen auf dem Endgerät (Cookies, localStorage, sessionStorage, Fingerprinting).

| Speicherung | Zweck | Bewertung |
|---|---|---|
| Session-Cookie (Better Auth) | Anmeldung | unbedingt erforderlich (§ 25 Abs. 2 Nr. 2) |
| „Angemeldet bleiben“ (90 Tage) | vom Nutzer aktiv gewählt | erforderlich für den gewünschten Dienst |
| `lang` (Sprache, 12 Monate, nur bei expliziter Wahl) | vom Nutzer gewählte Sprache | erforderlich (Nutzerwunsch) |
| Theme-Wahl hell/dunkel (`data-theme`, Designer-Tokens) – Cookie oder localStorage | vom Nutzer gewählte Darstellung | erforderlich (Nutzerwunsch); ohne Wahl folgt die App dem System, nichts wird gespeichert |
| `pending_invite` (30 Min.) | Einladung über Login hinweg erhalten | erforderlich |
| `sessionStorage` Formularentwurf (F-001) | Reisedaten vor Login nicht verlieren | erforderlich |
| `ww-motion` (Cookie, 12 Monate, nur bei expliziter Wahl „Bewegung reduzieren“ im Konto) | vom Nutzer gewählte Darstellung, serverseitig im ersten HTML berücksichtigt | erforderlich (Nutzerwunsch); ohne Wahl nichts gespeichert (Nachtrag Reviewer Inkrement 4) |
| `ww-hm-legend` (Cookie, 12 Monate, nur nach Zuklappen der Legende im Gruppenkalender, Inkrement 4, U-6) | vom Nutzer gewählter Anzeigezustand, serverseitig im ersten HTML berücksichtigt; Wert nur `closed`, keine Kennung | erforderlich (Nutzerwunsch, funktional); Aufklappen löscht das Cookie |
| `sessionStorage` `ww-anim:*`, `ww-tab-from` (Sitzungsende) | Einmal-Animationen nicht wiederholen, Tab-Richtung der Übergänge | erforderlich für die gewünschte Darstellung; keine Kennung, nichts verlässt das Gerät |
| `sessionStorage` Unterkünfte (Inkrement 9, Schlüssel nach Wahl Developer, z. B. `ww-stays:*`): Stapel-Position, letzte Bewertung für „Rückgängig“, ausstehende Bewertungen bei Netzfehler | Swipen ohne Datenverlust, Rückgängig | erforderlich für die gewünschte Funktion; Sitzungsende, keine Kennung, nichts verlässt das Gerät außer der Bewertung selbst |
| Formular-Entwurf Ausgabe (Inkrement 10, nur falls bei Netzfehler im `sessionStorage` gehalten, Schlüssel z. B. `ww-costs:*`) | eingegebene Ausgabe nicht verlieren | erforderlich für die gewünschte Funktion; Sitzungsende, keine Kennung. **IBAN/Zahlungsinfo nie in Cookies, `localStorage` oder `sessionStorage`** – „IBAN anzeigen“ ist reiner Seitenzustand (R.8) |
| Browser-Cache Vorschaubilder (`Cache-Control: private`, ≤ 24 h) | Bilder nicht bei jedem Aufruf neu laden | normales HTTP-Caching, technisch erforderlich; keine Kennung |
| Statistik | **serverseitig**, ohne Endgerätezugriff | nicht von § 25 erfasst |

**Ergebnis:** Bei Umsetzung wie geplant (keine Tracker, keine Werbung, keine eingebetteten Drittinhalte, Schriften selbst gehostet, keine externen Karten/Videos, **Unterkunfts-Bilder nur über den eigenen Bild-Proxy**) ist **kein Einwilligungs-Banner nötig** (deckt sich mit F-013). Pflicht bleibt die **Information** in der Datenschutzerklärung.

| ☐ | Regel | Fällig |
|---|---|---|
| ☐ | Reviewer prüft je Release: keine neuen Cookies/Storage-Schlüssel ohne Eintrag in obiger Tabelle; keine Drittanbieter-Ressourcen (Netzwerk-Tab/CSP) | laufend |
| ☐ | Google-Kalender-Link (F-012) ist ein normaler Link (kein Einbetten) → ok | M1 |
| ☐ | Unterkunfts-Links (F-031) öffnen das Portal nur per Klick in neuem Tab (`noopener noreferrer`); Vorschaubilder nie direkt vom Portal; globale CSP `img-src 'self' data: blob:` als technische Absicherung (deployment.md §0.9) | mit Inkrement 9 |
| ☐ | Bei späterer Einführung von Analytics mit Endgerätezugriff, Social-Login-Buttons mit SDK oder Zahlungs-Widgets: Neubewertung | v1/P |

## 5. Verzeichnis von Verarbeitungstätigkeiten (Art. 30 DSGVO)

Die Ausnahme für < 250 Beschäftigte greift **nicht**, weil die Verarbeitung regelmäßig erfolgt → **VVT anlegen** (außerhalb des Repos oder als `docs/ops/vvt.md` ohne personenbezogene Daten).

| ☐ | Verarbeitungstätigkeit | Fällig |
|---|---|---|
| ☐ | Kontoverwaltung & Anmeldung (F-040–F-043) | M1 |
| ☐ | Reiseplanung: Reisen, Mitgliedschaften, Verfügbarkeiten, Abstimmungen (F-001–F-013); **Reise managen:** Infoseite (F-033), Unterkünfte inkl. Link-Vorschau (F-031), **Kosten teilen inkl. freiwilliger Zahlungsinfo (F-035/F-036)** | M1 |
| ☐ | **Persönliche Reisedaten** (F-054/F-056): eigene Tätigkeit – Zweck Buchung durch eine Person der Gruppe, Rechtsgrundlage Einwilligung (Art. 6 Abs. 1 lit. a, Art. 7), Empfänger nur die anfragende Person, Löschung nach §6/§12.4, TOM §7/§12.5 | G1b |
| ☐ | Versand von Transaktionsmails | M1 |
| ☐ | Sicherheit: Rate-Limiting, Logs, Fehler-Tracking | M1 |
| ☐ | Backups | M1 |
| ☐ | Bearbeitung von Betroffenen- und Kontaktanfragen | M1 |
| ☐ | Aggregierte Nutzungsstatistik (ohne Personenbezug – dokumentieren, warum) | M1 |
| ☐ | Je Tätigkeit: Zweck, Kategorien Betroffener/Daten, Empfänger, Drittland (nein), Löschfristen (§6), TOMs (§7) | M1 |

**DSFA (Art. 35):** Für das MVP voraussichtlich nicht erforderlich (keine besonderen Kategorien, kein Profiling, keine systematische Überwachung) – Schwellwertanalyse kurz dokumentieren. **Neu bewerten vor F-048** (Speicherung von Drittanbieter-Zugangsdaten) und vor OAuth-Kalenderanbindungen. **Für persönliche Reisedaten (F-054) und Reiseunterlagen (F-055): schlanke DSFA durchführen** (Pflichtpunkt G1b, §12.2) – Ausweisnummern sind Daten mit hohem Missbrauchsrisiko (Identitätsdiebstahl).

## 6. Löschkonzept (F-013, F-043, PRD §8)

| Datenkategorie | Löschregel | Umsetzung | ☐ |
|---|---|---|---|
| Konto (Name, E-Mail, Passwort-Hash, Sprache, Region) | sofort bei Konto-Löschung (F-043); nach 24 Monaten ohne Login, Hinweis-Mail 30 Tage vorher | Retention-Job täglich; Organisatorrolle geht vorher über (F-043) | ☐ |
| Sessions | Ablauf (Browser-Ende bzw. 90 Tage rollierend), bei Logout/„überall abmelden“, Passwort-Reset, Konto-Löschung | DB-Cleanup täglich | ☐ |
| Codes / Magic-Link-Tokens | nach Verwendung bzw. 15 Min.; Cleanup täglich | gehasht gespeichert | ☐ |
| Einladungs-Token der Reise | mit der Reise; beim Erneuern durch die Orga sofort ersetzt | **Klartext** – dokumentierte Ausnahme §7a | ☐ |
| Rate-Limit-Einträge | nach Ablauf des Zeitfensters (Minuten bis 24 h) | Cleanup | ☐ |
| Reise inkl. Mitgliedschaften, Verfügbarkeiten, Kommentare, Abstimmungen | Organisator löscht (sofort); automatisch 90 Tage nach festgelegtem Reiseende bzw. 12 Monate nach letzter Aktivität; Hinweis-Mail 14 Tage vorher (F-013) | `ON DELETE CASCADE` + Retention-Job | ☐ |
| Mitgliedsdaten in einer Reise | sofort bei „Reise verlassen“ oder Entfernen durch Organisator (F-004, F-013) | Cascade | ☐ |
| Platzhalter (F-007) | mit Reise bzw. bei Übernahme/Entfernen | Cascade | ☐ |
| Unterkunfts-Vorschläge (F-031: Link, Titel, Preis, Notiz, Bild-**URL**) | mit der Reise (Q31); beim Verlassen/Konto-Löschen bleibt der Vorschlag ohne Urheber („ehemaliges Mitglied“) | `trip_stay` Cascade, `created_by` → null | ☐ |
| Unterkunfts-Bewertungen | mit Reise, Vorschlag oder Mitgliedschaft (Verlassen/Entfernen/Konto löschen) | `trip_stay_rating` Cascade | ☐ |
| Vorschaubilder | **nie dauerhaft** (Q34): nur Browser-Cache `private` ≤ 24 h, optional flüchtiger Server-Cache ≤ 7 Tage ohne Backup | Code-Review, kein Objektspeicher | ☐ |
| Vorschau-Ergebnis vor dem Speichern | nicht gespeichert, nur im verschlüsselten Token (AES-256-GCM, R-076) (≤ 30 Min.) | – | ☐ |
| Protokoll der Vorschau-Abrufe | nur Hostname + Ergebnis-Kategorie; wie Server-Logs 7 Tage | Logger, Reviewer | ☐ |
| Server-/Proxy-Logs mit IP | 7 Tage; **ohne Tokens** in Pfad/Query/`Referer` (deployment.md §5.4, R-037) | Log-Rotation, Caddy-Log-Filter | ☐ |
| Fehler-Tracking-Ereignisse | 30 Tage, ohne E-Mail/Token (URLs, Header, Breadcrumbs gescrubbt, deployment.md §6.2) | Bugsink-Retention, `beforeSend` | ☐ |
| Backups | rollierend max. 30 Tage → gelöschte Daten spätestens dann auch aus Backups entfernt; bei Restore: Löschungen der letzten 30 Tage erneut anwenden (Lösch-Protokoll nur mit IDs, ohne Inhalte) | Backup-Rotation, Runbook | ☐ |
| Mail-Anbieter-Logs | gemäß Anbieter (Aufbewahrung im AVV prüfen, möglichst ≤ 30 Tage einstellen) | Anbieter-Einstellung | ☐ |
| Kontakt-/Betroffenenanfragen | 3 Jahre nach Abschluss (Nachweis), danach löschen – Frist prüfen lassen | Postfach | ☐ |
| Aggregierte Statistik | unbegrenzt (kein Personenbezug) | – | ☐ |
| Ausgaben, Anteile, Ausgleichszahlungen, Personen der Abrechnung (F-035/F-036) | mit der Reise (Q31, 90 Tage bzw. „Reise löschen“); beim Verlassen/Entfernen/Konto-Löschen bleiben die Beträge **ohne Namen und ohne Kontobezug** („ehemaliges Mitglied“) | `trip_expense`, `trip_expense_share`, `trip_settlement`, `trip_cost_party` Cascade; `user_id`/`created_by`/`updated_by`/`marked_by` → null | ☐ |
| Weich gelöschte Ausgaben (`deleted_at`) | endgültig **24 h** nach dem Löschen (praktisch 24–48 h, täglicher Lauf), spätestens mit der Reise | Löschjob `POST /api/internal/retention` (deployment.md §0.10) – **Developer setzt um**, Test mit simulierter Zeit | ☐ |
| Zahlungsinfo (IBAN, Freitext ≤ 100 Zeichen) | sofort bei Verlassen/Entfernen, Konto-Löschung, durch die Person selbst; mit der Reise. Gelöscht, nicht ausgeblendet | Spalten an `trip_member` → verschwinden mit der Mitgliedschaft | ☐ |
| Idempotenz-Schlüssel der Ausgaben-Formulare | 24 h eindeutig je Reise; mit der Ausgabe gelöscht | Spalte `trip_expense.idempotency_key` | ☐ |
| **Persönliche Reisedaten – Freigabe** (verschlüsselte Werte, `travel_data_release`) + **Zugriffsprotokoll** (`travel_data_access`) (F-054) | **hart** gelöscht, jeweils sofort im auslösenden Vorgang: Widerruf durch die Person · Entfernen als Empfänger:in · «Erledigt – Daten löschen» · Entzug der Markierung „Bucht“ · anfragende oder gefragte Person verlässt die Reise / wird entfernt / löscht ihr Konto · **Reiseende + 7 Tage** (23:59 `APP_TIME_ZONE`; Terminänderung verschiebt das Datum) · **Festlegung aufgehoben + 30 Tage** ohne neue Festlegung · Reise gelöscht. Protokoll lebt genau so lange wie die Freigabe | Transaktion im Vorgang + FK-Kaskaden; Löschjob täglich als Sicherheitsnetz; Lese-Pfad liefert nach Frist nie Werte (features.md R.9 I11-10) | ☐ |
| Reisedaten-Anfragen (Hülle: Zweck, Feldliste, Zustände, Zeitstempel – ohne Werte) | mit der Reise (90 Tage, F-013) | `travel_data_request` Cascade | ☐ |
| Markierung „Bucht“ | endet mit der Mitgliedschaft | Spalte an `trip_member` | ☐ |
| Reisedaten in Backups | nur Chiffrat; verschwindet mit der Backup-Rotation (max. 30 Tage); ohne Schlüssel unlesbar (deployment.md §0.11.5) | – | ☐ |
| **Reiseunterlagen** (Dateien + Titel, Kategorie, Datum, Sichtbarkeit; F-055) | sofort beim Löschen durch Hochladende/Orga (Datensatz **und** Objekt im Speicher); beim Verlassen nach Abfrage (Standard: löschen, wenn nur für einen selbst sichtbar); mit Reise/Konto; automatisch **30 Tage nach Reiseende** (Q31, `APP_TIME_ZONE`) mit Cockpit-Hinweis vorher | Transaktion + Speicher-Löschung, Lösch-Auftrag bei Fehler wird wiederholt; Löschjob täglich inkl. Abgleich (Objekte ohne Datensatz, `pending` > 24 h) – deployment.md §0.13.4 Nr. 8 | ☐ |
| Unterlagen: abgebrochene/abgelehnte Uploads (`incoming/`) | abgelehnt → sofort; abgebrochen → Lifecycle-Regel nach 1 Tag | Bucket-Lifecycle + Löschjob | ☐ |
| Unterlagen in Backups | **werden nicht gesichert** (bewusst, deployment.md §0.13.4 Nr. 9); Bucket ohne Versionierung → Löschen ist endgültig | Bucket-Einstellung prüfen | ☐ |
| *v1:* Kalender-Rohdaten | nie speichern, nur im Arbeitsspeicher (F-006) | Code-Review | ☐ |
| *v1:* gespeicherte Kalender-URLs/CalDAV-Passwörter | bei Trennen, Festlegung der Reise (Sync-Ende), Konto-Löschung | verschlüsselt, Cascade | ☐ |

Test: Retention-Job hat Unit- und E2E-Tests (Uhrzeit simuliert); Lauf wird geloggt (nur Anzahlen).

## 7. Technische und organisatorische Maßnahmen (Art. 32 DSGVO) – Kurzliste

| ☐ | Maßnahme | Fällig |
|---|---|---|
| ☐ | TLS überall, HSTS; DB nur im internen Netz; Firewall | M1 |
| ☐ | Zugang Server/Hosting/Mail/GitHub nur mit 2FA; SSH nur per Schlüssel | M1 |
| ☐ | Passwörter Argon2id; Codes/Login-Tokens gehasht (**Ausnahme:** Einladungs-Token im Klartext, §7a); Rate-Limits; keine Konto-Enumeration (tech-stack.md §3) | M1 |
| ☐ | Verschlüsselte Backups (`age`), Restore-Test monatlich | M1 |
| ☐ | Least Privilege für Organisator-/Mitgliedsrechte, serverseitig geprüft (F-004) | M1 |
| ☐ | Keine personenbezogenen Daten in Logs/CI/Issues; **keine Tokens in Zugriffs-/Fehler-Logs** – auch nicht im Pfad (`/i/<token>`, `/auth/*`) oder `Referer` (deployment.md §5.4, §6.2; R-037) | laufend |
| ☐ | **SSRF-Schutz** für ausgehende Abrufe (Link-Vorschau/Bild-Proxy, F-031): nur `https`/443, DNS-Pinning, private Netze gesperrt, Limits, kein offener Proxy (features.md R.7); ab Go-Live zusätzlich Egress-Sperre auf dem Host (deployment.md §0.8, §5.1) | mit Inkrement 9 / M1 |
| ☐ | **Kosten teilen – nichts in Logs/Mails/Teilen-Texten (F-035/F-036, Inkrement 10):** Ausgaben-**Titel**, **Beträge**, **IBAN** und **Freitext der Zahlungsinfo** erscheinen nie in Server-/Zugriffs-Logs, Fehler-Tracking (Bugsink-Scrubbing, keine Formularwerte in Breadcrumbs), Analytics/Statistik, Mails (Lösch-Hinweis nur „{n} Ausgleiche offen“), URLs/Query-Parametern oder Meta-Tags. Teilen-/Erinnern-Texte (I10-08/I10-09) nur mit Namen, Ausgleichsbeträgen und Link – **nie** IBAN, Freitext, Titel oder Einzelausgaben. Prüfpunkt Reviewer: Code-Suche nach `console.*`/Logger-Aufrufen in Kosten-Modulen, Fehlermeldungen ohne Eingabewerte, E2E-Prüfung Teilen-Text und Mail-Inhalt (Demo-Postfach) | mit Inkrement 10 / laufend |
| ☐ | **Kosten teilen – Eingaben & Zugriff:** IBAN nur nach Prüfung (Format, Länderlänge, Mod 97) gespeichert, Freitext/Titel nur als Text (kein HTML, keine Auto-Links); Zahlungsinfo nur an Mitglieder der Reise, nie auf Einladungsseite/Vorschau; Rechte und Abschluss serverseitig geprüft; Konfliktschutz (`version`) und Idempotenz gegen Doppelbuchungen; Rate-Limits nach R.8 | mit Inkrement 10 |
| ☐ | **Persönliche Reisedaten (F-054, Inkrement 11):** anwendungsseitige Feldverschlüsselung AES-256-GCM mit AAD, Schlüssel außerhalb der DB (`TRAVEL_DATA_KEYS`, getrennte Ablage, Rotation, Runbooks – deployment.md §0.11); Rechte serverseitig (Orga ohne „Bucht“ nie Inhalte); Maskierung serverseitig, Klartext nur per protokolliertem Anzeigen/Kopieren; Re-Authentifizierung für Dokumentnummern; `Cache-Control: no-store`; Werte nie in Logs, Mails, URLs, Fehler-Tracking, Browser-Speichern; Betriebs-Logs nur anonyme Zähler (§12.5) | Inkrement 11 / G1b |
| ☐ | **Content-Security-Policy**: Stufe 1 (`img-src 'self'` u. a.) mit Inkrement 9, Stufe 2 (Nonce) vor M1 (deployment.md §0.9) | Inkrement 9 / M1 |
| ☐ | **Datenpannen-Prozess** (Art. 33/34): Erkennen → bewerten → Meldung an Aufsichtsbehörde binnen 72 h → ggf. Betroffene informieren; Kontaktdaten der Behörde notieren; **vorgezogen auf G1b**, falls Reisedaten vor M2 eingeschaltet werden (Runbook B, deployment.md §0.11.8) | M2 / G1b |
| ☐ | `security.txt` mit Kontakt für Sicherheitsmeldungen | M2 |

### 7a. Dokumentierte Ausnahme: Einladungs-Token im Klartext (R-037)

| Punkt | Inhalt |
|---|---|
| Was | `trip.invite_token` (256 Bit Zufall, `randomBytes(32)`) wird **unverschlüsselt und ungehasht** in der Datenbank gespeichert. Alle anderen Geheimnisse (Login-Codes, Magic-Link-Tokens, Passwörter) bleiben gehasht. |
| Warum | Der Einladungslink muss allen Mitgliedern jederzeit **wieder angezeigt** werden (F-002, PRD Q13 b). Ein Hash ist nicht umkehrbar – damit scheidet Hashing aus. |
| Risiko | Wer Lesezugriff auf DB oder Backups erhält, kann jeder Reise beitreten (Name + Verfügbarkeiten der Gruppe sichtbar). Kein Zugriff auf Konten, Passwörter oder Login. |
| Schutzmaßnahmen | (1) Orga kann den Link jederzeit **erneuern** – der alte wird sofort ungültig; (2) Orga kann Beitritte **sperren**, Grenze 30 Mitglieder, Entfernen von Mitgliedern (F-004); (3) DB nur im internen Netz, kein öffentlicher Port (deployment.md §5.2); (4) Backups `age`-verschlüsselt, privater Schlüssel offline (deployment.md §6.1); (5) Token **nie in Logs**: Caddy-Filter (deployment.md §5.4), Bugsink-Scrubbing (§6.2), App-Logs ohne Tokens; (6) Formprüfung vor DB-Zugriff + Rate-Limits gegen Raten; (7) `noindex` und `Referrer-Policy: same-origin` auf `/i/*`. |
| Im Datenpannenfall | Bei DB- oder Backup-Leck: alle Einladungs-Tokens per Migration/Skript neu erzeugen (Runbook OPS-6) und Orgas informieren. |
| Später (optional) | Token at-rest mit App-Schlüssel verschlüsseln (z. B. AES-GCM, Schlüssel per HKDF aus Secret) – schützt bei reinem DB-/Backup-Leck; Entscheidung nach M1. |
| Bewertung | vertretbar (Reviewer R-037, Operations); vor Go-Live im VVT/TOM-Dokument (OPS-6) übernehmen. |

## 8. Barrierefreiheit (BFSG)

**Anwendbarkeit:** Das Barrierefreiheitsstärkungsgesetz gilt seit 28.06.2025 u. a. für „Dienstleistungen im elektronischen Geschäftsverkehr“ – Websites/Apps, über die Verbraucherverträge geschlossen werden.
- **MVP (kostenlos):** Ob die kostenlose Kontoregistrierung mit Nutzungsbedingungen bereits ein Verbrauchervertrag i. S. d. BFSG ist, ist nicht abschließend geklärt → konservativ so behandeln, als ob das BFSG gilt.
- **Freemium (F-050):** Spätestens mit Bezahlfunktionen ist der Anwendungsbereich klar eröffnet.
- **Ausnahme Kleinstunternehmen:** Dienstleister mit < 10 Beschäftigten **und** ≤ 2 Mio. € Jahresumsatz oder Bilanzsumme sind von den Anforderungen ausgenommen (eng auszulegen, gilt nicht für Produkte). Für den Betreiber wahrscheinlich zutreffend – trotzdem Ziel WCAG 2.1 AA (PRD §8), weil Barrierefreiheit Produktqualität ist und das Unternehmen wachsen kann.

| ☐ | Punkt | Fällig |
|---|---|---|
| ☐ | Einordnung Kleinstunternehmen dokumentieren (Beschäftigte, Umsatz) | M2 |
| ☐ | WCAG 2.1 AA als Abnahmekriterium (UX-Spec, Reviewer); axe-Prüfung in E2E (tech-stack.md §2.4) | M1 |
| ☐ | Heatmap nicht nur über Farbe; Tastaturbedienung Kalender; Code-Eingabe `autocomplete="one-time-code"` (PRD §8) | M1 |
| ☐ | Manueller Test mit Screenreader (VoiceOver iOS, TalkBack Android) für Kernfluss | M2 |
| ☐ | Barrierefreiheitserklärung (freiwillig im MVP, Pflicht falls BFSG ohne Ausnahme greift; Inhalte nach Anlage 3 BFSG) | M2 / P |

## 9. Nutzungsbedingungen / AGB / Verbraucherrecht

| ☐ | Punkt | Fällig |
|---|---|---|
| ☐ | **MVP: kurze Nutzungsbedingungen** (kostenloser Dienst, zulässige Nutzung, Verantwortung des Organisators für Einladungen/Platzhalter, Verfügbarkeit ohne Garantie, Haftungsbegrenzung im zulässigen Rahmen, Kündigung/Löschung, Änderungsvorbehalt), DE verbindlich + EN | M2 |
| ☐ | Hinweis bei Registrierung (F-040): Text mit Links zu Nutzungsbedingungen und Datenschutzerklärung, **kein** vorangekreuztes Häkchen, kein Marketing-Opt-in | M1 |
| ☐ | **Altersgrenze:** Mindestalter **16 Jahre** in den Nutzungsbedingungen (deckt Art. 8 DSGVO-Schwelle in DE und Geschäftsfähigkeitsfragen bei kostenlosen Diensten pragmatisch ab); keine Altersverifikation, Hinweistext im Registrierungsformular | M1 |
| ☐ | **Bezahlfunktionen (F-050):** AGB mit Preisen inkl. USt (PAngV), Leistungsbeschreibung Free vs. Premium, Laufzeit/Kündigung | P |
| ☐ | Widerrufsbelehrung + Muster-Widerrufsformular; bei digitalen Leistungen: Zustimmung zum vorzeitigen Leistungsbeginn und Bestätigung des Erlöschens des Widerrufsrechts | P |
| ☐ | **Widerrufs-Button** (elektronische Widerrufsfunktion) für online geschlossene Verbraucherverträge – Pflicht seit 19.06.2026 nach **§ 356a BGB** (Umsetzung RL (EU) 2023/2673, BGBl. 2026 I Nr. 28): ständig verfügbar, gut sichtbar, zweistufig mit Bestätigung, Eingangsbestätigung auf dauerhaftem Datenträger | P |
| ☐ | **Kündigungsbutton** (§ 312k BGB) bei Abos (z. B. Jahresabo, Q8) | P |
| ☐ | Bestell-Button „zahlungspflichtig bestellen“ (§ 312j BGB) | P |
| ☐ | Umsatzsteuer: EU-OSS-Verfahren für B2C-Digitalleistungen in andere EU-Länder; Alternative **Merchant of Record** (Zahlungsanbieter übernimmt USt/Rechnungen) – Vergleich Zahlungsanbieter durch Operations vor F-050 | P |
| ☐ | Rechnungen (Pflichtangaben), Aufbewahrung 8/10 Jahre (Steuerrecht) → Ausnahme im Löschkonzept | P |

## 10. Internationale Aspekte (Q9)

| ☐ | Punkt | Fällig |
|---|---|---|
| ☐ | Gezieltes Ansprechen von **UK**-Nutzern (EN-Marketing, UK-Feiertage): UK GDPR kann anwendbar sein; Pflicht zu einem UK-Vertreter (Art. 27 UK GDPR) prüfen – Ausnahme für gelegentliche Verarbeitung mit geringem Risiko möglich | vor UK-Marketing |
| ☐ | **Schweiz** (DE-Zielgruppe): revDSG – Datenschutzerklärung deckt i. d. R. ab, wenn DSGVO-konform; kurz prüfen | M2 |
| ☐ | **USA**: Bundesstaatliche Datenschutzgesetze (z. B. CCPA) greifen erst ab Umsatz-/Nutzerschwellen → im MVP nicht relevant; bei aktivem US-Marketing neu bewerten | später |

## 11. E-Mail-Versand (rechtlich)

| ☐ | Punkt | Fällig |
|---|---|---|
| ☐ | Nur Transaktionsmails im MVP – keine Werbung, kein Newsletter, daher keine Einwilligung nötig; Inaktivitäts-/Löschhinweise sind Servicehinweise | M1 |
| ☐ | Keine Tracking-Pixel/Klick-Tracking (F-042) – beim Mail-Anbieter **deaktivieren** | M1 |
| ☐ | Absender mit Impressums-Link im Mail-Footer | M1 |
| ☐ | *v1 (F-014):* Benachrichtigungen nur nach ausdrücklicher Einwilligung, Ein-Klick-Abmeldung (`List-Unsubscribe`), Einwilligung protokollieren | v1 |

---

## 12. Gate G1b – persönliche Reisedaten (F-054 Stufe 1 + F-056, Inkrement 11)

Quelle: features.md **R.9** (I11-10, I11-12, „Verschlüsselung & Schlüssel“, „Sicherheit“, „Datenhaltung“), roadmap.md „Gate G1b“, PRD §8 NFR „Sensible Reisedaten & Dateien“, Q28–Q31, Q36. **G1b kommt zusätzlich zu G1** (go-live.md Stufe 2): Erst wenn die App mit echten Daten auf EU-Hosting läuft **und** alle Punkte unten ☑ sind, darf `TRAVEL_DATA_ENABLED=true` in `production` gesetzt werden (deployment.md §0.11.1). Bis dahin: Demo und Vorschau nur mit Fantasiedaten. Die dateibezogenen G1b-Punkte (Objektspeicher, Virenscan, Upload-Härtung, DSA-Meldeweg – F-055, Inkrement 12) stehen in **§12.8**; sie gelten für `DOCUMENTS_ENABLED=true` in `production` (deployment.md §0.13.6).

**Entwurf, keine Rechtsberatung** – die rechtlichen Punkte (§12.2, §12.3) gehören in die Rechtsprüfung (Q16).

### 12.1 Abnahme vor dem Einschalten in Produktion

| ☐ | Pflichtpunkt | Wer | Bezug |
|---|---|---|---|
| ☐ | G1 (go-live.md Stufe 1 + 2) bestanden – Produktion auf EU-Hosting, echte Rechtstexte, Backups mit Restore-Test | Auftraggeber, Operations | go-live.md |
| ☐ | Alle Punkte §12.2–§12.7 ☑ | Operations | – |
| ☐ | **Security-Review Reisedaten** durch den Reviewer bestanden (Rechte je Zeile der R.9-Rechtetabelle, „Orga ohne Bucht nie Inhalte“ auch per direkter Server-Aktion, Löschung je Auslöser mit verschobener Uhr, Re-Authentifizierung, keine Werte in Logs/Antworten – Suchtest mit Demo-Werten) | Reviewer | R.9 „Sicherheit“ |
| ☐ | Test auf **Staging** mit eigenem `TRAVEL_DATA_KEYS` und synthetischen Daten: Startschutz (an ohne Schlüssel → kein Start), eine Rotation `pnpm travel-data:rotate` und Runbook A als Trockenübung durchgespielt, Ergebnis im Status-Board | Operations, Developer | deployment.md §0.11 |
| ☐ | Abnahme durch den Auftraggeber dokumentiert (Freigabe-Tabelle go-live.md, Zeile G1b) – **erst danach** `TRAVEL_DATA_ENABLED=true` in `production` | Auftraggeber, CEO | go-live.md |

### 12.2 Datenschutz-Folgenabschätzung (DSFA, Art. 35 DSGVO)

Einschätzung Operations: Reisedaten sind keine besonderen Kategorien (Art. 9), aber **Ausweis-/Passnummern** sind Daten mit hohem Missbrauchsrisiko (Identitätsdiebstahl, Buchungsbetrug), dazu Geburtsdaten und Staatsangehörigkeit, Verarbeitung innerhalb privater Gruppen. Das trifft mindestens das Kriterium „vertrauliche/höchstpersönliche Daten“ der Art.-29-Leitlinien (WP 248); ob ein zweites Kriterium greift, ist strittig. **Empfehlung: schlanke DSFA durchführen** statt nur Schwellwertanalyse – Aufwand klein, Nutzen hoch (Nachweis, Vertrauen).

| ☐ | Inhalt | Wer |
|---|---|---|
| ☐ | Systematische Beschreibung: Zweck (Buchung durch eine Person der Gruppe), Datenarten (Feldliste R.9), Betroffene (Mitreisende), Empfänger (nur anfragende „Bucht“-Person), Fristen (§12.4), Ablauf Anfrage → Einwilligung → Anzeigen/Kopieren → Löschung | Operations |
| ☐ | Notwendigkeit/Verhältnismäßigkeit: Datensparsamkeit (Standard nur Name laut Ausweis + Geburtsdatum, weitere Felder nur auf ausdrückliche Anfrage mit Warnhinweis, nie Scans/Fotos/Adresse/Freitext – Q29), Einwilligung je Zweck und Empfänger:in, Widerruf jederzeit, kurze Löschfrist | Operations |
| ☐ | Risiken: Leck (DB + Schlüssel), Missbrauch durch die „Bucht“-Person (Weitergabe), Social Engineering (falsche Anfrage in der Gruppe), Kontoübernahme der „Bucht“-Person, Fehlbedienung (falsche Person markiert), Daten in Logs/Backups | Operations |
| ☐ | Maßnahmen je Risiko: Feldverschlüsselung + getrennter Schlüssel, Zugriffsprotokoll für die betroffene Person, Re-Authentifizierung für Dokumentnummern, Rate-Limits gegen Absaugen, Maskierung, Löschregeln, Log-Regeln (§12.5), Backups ≤ 30 Tage | Operations, Developer |
| ☐ | Restrisiko bewertet; ggf. Konsultation der Aufsichtsbehörde (Art. 36) – voraussichtlich nicht nötig | Operations → Rechtsprüfung |
| ☐ | DSFA vor dem Einschalten abgeschlossen, Ablage außerhalb des Repos (oder `docs/ops/dsfa-reisedaten.md` ohne personenbezogene Daten), Überprüfung bei Änderungen (z. B. neue Felder, F-055) | Operations |

### 12.3 Rechtliche Prüfung und Datenschutzerklärung

| ☐ | Punkt | Wer | Fällig |
|---|---|---|---|
| ☐ | **Ausweis- und Passnummern – PAuswG/PassG:** prüfen lassen, ob und wie die Seriennummer (Dokumentnummer) gespeichert werden darf. Nach unserem Verständnis verbieten § 20 PAuswG bzw. § 16 PassG v. a., die Seriennummer zum **Abruf** personenbezogener Daten aus Dateien oder zur **Verknüpfung** von Dateien zu verwenden; das Ablichten/Speichern von Ausweisen ist nur eingeschränkt erlaubt. Unser Entwurf ist darauf ausgerichtet: Nummer nur verschlüsselt im Datensatz der Freigabe, **kein Index, keine Suche, kein Abgleich** zwischen Reisen/Personen, kein Hash zur Wiedererkennung, keine Scans, Zweck nur Buchung, kurze Löschfrist. Ergebnis der Prüfung dokumentieren; falls unzulässig → Feld `document` in `production` deaktivieren (nur Name + Geburtsdatum) | Rechtsprüfung (Q16), Operations bereitet vor | G1b |
| ☐ | **Einwilligung** (Art. 6 Abs. 1 lit. a, Art. 7): Wortlaut DE/EN mit Version; Löschregel statt festem Datum („7 Tage nach der Reise, derzeit {Datum}“) als zulässig bestätigen; Widerruf so leicht wie Erteilung (Kachel, W20 D); Mindestalter 16 (Art. 8) – Registrierung ab 16 deckt das ab | Rechtsprüfung | G1b |
| ☐ | **Datenschutzerklärung:** Abschnitt „Persönliche Reisedaten“ (Platzhaltertext unten) in DE (verbindlich) + EN; bis G1b in Demo/Vorschau nur als Platzhalter-Gliederung (§0a) | Developer (Platzhalter mit Inkrement 11), Operations → Rechtsprüfung (Endfassung) | Platzhalter: Inkrement 11; Endfassung: G1b |
| ☐ | Nutzungsbedingungen (M2, §9): Pflichten der „Bucht“-Person (Daten nur für die angefragte Buchung verwenden, nicht weitergeben, nach Buchung «Erledigt – Daten löschen») | Operations → Rechtsprüfung | G1b bzw. M2 |
| ☐ | VVT-Eintrag (§5) und TOM (§7) ergänzt | Operations | G1b |

**Platzhaltertext (Stichpunkte, Entwurf):**

> **Persönliche Reisedaten (z. B. für Flug- oder Bahntickets)**
> - **Wozu:** Für eine Buchung kann eine Person eurer Gruppe, die die Orga als „Bucht“ markiert hat, bei dir gezielt die nötigen Angaben anfragen – damit sie nicht im Gruppenchat landen.
> - **Welche Angaben:** standardmäßig nur **Name laut Ausweis** und **Geburtsdatum**. Nur wenn die anfragende Person es ausdrücklich auswählt, zusätzlich `[PLATZHALTER: Dokumentart und -nummer, Ablaufdatum, Ausstellungsland, Staatsangehörigkeit – Feldliste final nach Rechtsprüfung PAuswG/PassG]`. Wir speichern **nie** Ausweis-Scans oder -Fotos, keine Adresse und keinen Freitext.
> - **Rechtsgrundlage:** deine **Einwilligung** (Art. 6 Abs. 1 lit. a DSGVO). Du entscheidest je Anfrage, ob du deine Angaben freigibst; ablehnen ist ohne Nachteil möglich („Ich kläre das direkt“).
> - **Wer sie sieht:** **nur** die Person, die angefragt hat – nicht die Orga (sofern sie nicht selbst angefragt hat), nicht die übrigen Mitglieder, nicht wir als Betreiber im normalen Betrieb. Die Angaben werden in der App gekürzt angezeigt; vollständig sieht sie die anfragende Person nur durch bewusstes Anzeigen oder Kopieren. Für Dokumentnummern muss sie sich dafür frisch anmelden.
> - **Zugriffsprotokoll:** Du siehst, wann die anfragende Person deine Angaben angezeigt oder kopiert hat. Das Protokoll wird zusammen mit deinen Angaben gelöscht.
> - **Sicherheit:** Die Angaben werden zusätzlich zur Verschlüsselung der Datenbank **einzeln verschlüsselt** gespeichert; der Schlüssel liegt getrennt von der Datenbank.
> - **Weitergabe:** Wir geben die Angaben an niemanden weiter. Die anfragende Person nutzt sie selbst für die Buchung bei einem Anbieter (z. B. Airline, Bahn, Unterkunft) – für diese Übermittlung ist sie bzw. der Anbieter verantwortlich `[PLATZHALTER: Rollenverteilung/Verantwortlichkeit – Rechtsprüfung]`.
> - **Löschung:** spätestens **7 Tage nach dem Ende der Reise** (ändert sich der Reisezeitraum, verschiebt sich das Datum – du wirst darauf hingewiesen). **Sofort**, wenn du deine Freigabe zurückziehst, die anfragende Person „fertig“ meldet, ihr die Markierung „Bucht“ entzogen wird, du oder sie die Reise verlasst oder das Konto löscht, oder wenn die Reise gelöscht wird; 30 Tage nach einer aufgehobenen Festlegung ohne neuen Termin. Aus Sicherungskopien verschwinden die (verschlüsselten) Daten spätestens nach 30 Tagen.
> - **Widerruf:** jederzeit in der App unter „Reisedaten“ – mit sofortiger Löschung. Die Rechtmäßigkeit der bis dahin erfolgten Verarbeitung bleibt unberührt (Art. 7 Abs. 3).
> - **Auskunft/Export:** Der Datenexport enthält deine eigenen Freigaben im Klartext samt Zugriffsprotokoll; als „Bucht“-Person nur deine Anfragen ohne Angaben anderer.

### 12.4 Löschkonzept Reisedaten – Prüfpunkte (Tabelle §6)

| ☐ | Auslöser | Ergebnis | Nachweis |
|---|---|---|---|
| ☐ | **Widerruf** durch die Person | ihre Freigabe + Protokoll sofort hart gelöscht, Antwort wieder *offen* | Test |
| ☐ | **Entzug** der Markierung „Bucht“ | alle Freigaben aller Anfragen dieser Person gelöscht, Anfragen *erloschen* | Test |
| ☐ | **Verlassen / Entfernen** (anfragende oder gefragte Person) | wie Entzug bzw. alle Freigaben der gefragten Person in der Reise | Test |
| ☐ | **Konto löschen** (F-043) | wie Verlassen, in allen Reisen, vor der Konto-Löschung im selben Ablauf | Test |
| ☐ | **Reiseende + 7 Tage** (23:59 `APP_TIME_ZONE`) | alle Freigaben der Reise; Lese-Pfad liefert schon vor dem Löschjob nichts mehr | Test mit verschobener Uhr |
| ☐ | **Festlegung aufgehoben + 30 Tage** ohne neue Festlegung | alle Freigaben der Reise | Test mit verschobener Uhr |
| ☐ | «Erledigt – Daten löschen», Empfänger:in entfernt, Reise gelöscht | wie §6 | Test |
| ☐ | Löschjob läuft täglich (Produktion: Timer `jobs`, deployment.md §5.2) und braucht keinen Schlüssel | Lauf geloggt nur mit Anzahlen | Staging-Lauf |
| ☐ | Restore-Runbook: nach Restore Löschungen der letzten 30 Tage erneut anwenden – für Reisedaten genügt ein Löschjob-Lauf direkt nach dem Restore (Fristen + Sicherheitsnetz) | Runbook | OPS-4 |

### 12.5 Log-Regeln (nur anonyme Zähler)

| ☐ | Regel | Prüfung |
|---|---|---|
| ☐ | App-/Funktions-Logs zum Bereich enthalten **nur anonyme Zähler** (z. B. `travel_data.release ok`, `travel_data.reveal ok/denied`, `travel_data.decrypt_failed`, `travel_data.retention purged=n`) – **keine** IDs von Personen, Reisen, Anfragen oder Feldern, keine Namen, keine Werte, keinen Zweck-Text | Code-Suche (`console.*`, Logger) in den Modulen; E2E-Lauf mit Demo-Werten, Logs auf die Werte durchsuchen (keine Treffer) |
| ☐ | Server-Aktionen loggen keine Argumente; Fehlermeldungen generisch, ohne Inhalte/Krypto-Details | Review |
| ☐ | Bugsink: keine Request-Bodies/Formularwerte des Bereichs, Breadcrumbs ohne Werte; Pfade `/trips/{id}/travel-data/{requestId}` dürfen IDs enthalten, aber keine Werte | Test-Ereignis |
| ☐ | Caddy-Zugriffslog: nur Pfad (IDs, keine Werte – Werte stehen nie in URLs/Query) | Abnahmetest wie R-037 |
| ☐ | Keine Werte in Mails (Stufe 1: keine Mails des Bereichs), Teilen-/Erinnern-Texten, Seitentiteln, Snackbars, Cookies, `localStorage`/`sessionStorage`, Server-Caches, RSC-Payload der Erstansicht | Review + E2E |
| ☐ | Zugriffsprotokoll ist **kein** Sicherheitslog – es lebt nur so lange wie die Freigabe; kein separates Audit-Log mit Personenbezug | Review |

### 12.6 Demo und Vorschau (bis G1b)

| ☐ | Prüfpunkt | Wer |
|---|---|---|
| ☐ | **DEMO-Präfix in der Vorschau:** Auf der Vercel-Vorschau wird eine Dokumentnummer ohne `DEMO`-Präfix serverseitig abgelehnt («In der Demo nur Fantasie-Nummern, die mit DEMO beginnen.»); gilt auch für Docker-Demo, `development`, `ci`. Test sowohl per UI als auch per direkter Server-Aktion | Reviewer (Abnahmefall R.9), CEO prüft einmal live in der Vorschau |
| ☐ | Hinweis «Demo – bitte keine echten Ausweisdaten eingeben.» nicht wegklickbar in Schritt 1, Schritt 2, neuer Anfrage und „Bucht“-Sicht | Reviewer |
| ☐ | Demo-Seed nur mit Fantasie-Namen/-Geburtsdaten, Dokumentnummern mit `DEMO`; „Demo zurücksetzen“ löscht alle Reisedaten | Reviewer |
| ☐ | In `staging`/`production` ist der Bereich standardmäßig **aus**; Ableitung des Schlüssels aus `BETTER_AUTH_SECRET` dort verboten (Startschutz) | Reviewer (Unit-Tests `app-env`) |
| ☐ | Vorschau-Anleitung enthält die Regel „nur Fantasiedaten, Dokumentnummern mit DEMO“ (vorschau-anleitung.md §6 Nr. 7) | Operations ☑ (2026-10-23) |

### 12.7 Schlüssel und Betrieb

| ☐ | Prüfpunkt | Wer |
|---|---|---|
| ☐ | `TRAVEL_DATA_KEYS` für `production` erzeugt, in `secrets/travel-data.env` (600, nur Dienst `app`) und als Sicherungskopie im Passwort-Manager des Betreibers; nicht im Repo, nicht in GitHub Secrets, nicht im Off-site-Backup | Operations, Auftraggeber |
| ☐ | Rotationsrhythmus (jährlich + anlassbezogen) und Runbooks A (Verlust) / B (Leck) übernommen; Runbook B im Datenpannen-Prozess (§7) verlinkt | Operations |
| ☐ | Zugriff auf Server/Secret-Datei nur für benannte Personen mit 2FA/SSH-Schlüssel | Operations |

### 12.8 Reiseunterlagen – Dateien (F-055 Stufe 1, F-031 Stufe 2, Inkrement 12)

Technik: [deployment.md §0.13](deployment.md). Erst wenn alle Punkte ☑ sind, darf `DOCUMENTS_ENABLED=true` in `production` gesetzt werden (Startschutz verlangt zusätzlich `FILES_SCAN=clamav`).

| ☐ | Prüfpunkt | Wer |
|---|---|---|
| ☐ | **Speicher:** Hetzner Object Storage am Standort der VM, Bucket **privat**, keine öffentliche URL, **keine Versionierung**, CORS nur `APP_URL`, Lifecycle `incoming/` 1 Tag; Verschlüsselung at rest geklärt (falls nicht standardmäßig: SSE-C oder in den TOM begründen); Zugangsschlüssel nur in `/opt/wir-wollen-weg/production/.env` | Operations |
| ☐ | **Virenscan:** `clamd` im Compose, `freshclam`-Updates täglich und überwacht (Alarm bei Signaturen > 48 h alt), fail closed getestet (Scanner gestoppt → Upload abgelehnt), EICAR-Testdatei wird abgelehnt | Operations, Reviewer |
| ☐ | **Upload-Härtung** (Schutzpaket Stufe 1): Typ über Magic Bytes, Bilder neu kodiert (EXIF/GPS weg – Testbild mit GPS), PDF ohne JavaScript/Anhänge/XFA/Launch, Öffnen-Passwort abgelehnt, Größe vom Speicher erzwungen (signiertes `Content-Length`), Kontingent 100 MB/50 Dateien je Reise | Reviewer (Abnahmefälle deployment.md §0.13.4 Nr. 11) |
| ☐ | **Auslieferung:** nur nach Login + Mitgliedschaft + Sichtbarkeit, vorsignierte GET-URL ≤ 60 s von der Speicher-Origin, nie geloggt; ausgeschlossene Person/fremde Reise → 404 | Reviewer |
| ☐ | **Löschung** nach §6 (inkl. 30 Tage nach Reiseende, Verlassen, Konto/Reise) mit verschobener Uhr getestet; nach dem Löschen `HEAD` auf das Objekt → 404 | Reviewer |
| ☐ | **Logs** nur Zähler – keine Dateinamen, Titel, vorsignierten URLs (§12.5 sinngemäß) | Reviewer |
| ☐ | **DSFA (§12.2) um Dateien erweitert:** Tickets enthalten Name + Buchungscode (damit lassen sich Buchungen ändern/stornieren), ggf. Daten Dritter (Mitreisende); Risiken Fehl-Sichtbarkeit, Kontoübernahme, Schadsoftware; Maßnahmen Sichtbarkeit „nur ausgewählte Personen“ + Hinweis beim Hochladen (F-055), Scan, kurze Löschfrist | Operations |
| ☐ | **DSA (Digital Services Act) – Hosting-Dienst:** Wir speichern von Nutzern bereitgestellte Inhalte → Pflichten für Hosting-Dienste prüfen lassen: Kontaktstelle für Behörden und Nutzer (Art. 11, 12), Angaben zur Inhaltemoderation in den Nutzungsbedingungen (Art. 14), **Melde- und Abhilfeverfahren** (Art. 16, z. B. Meldeformular/Mail „Inhalt melden“ mit Begründung), Begründung bei Entfernung (Art. 17), Meldung von Straftaten mit Gefahr für Leib/Leben (Art. 18). Einschätzung Operations: Unterlagen werden nur innerhalb geschlossener Reisegruppen geteilt, nicht öffentlich verbreitet → voraussichtlich **keine „Online-Plattform“** mit deren Zusatzpflichten; Ausnahmen für Klein-/Kleinstunternehmen beachten. **Keine Rechtsberatung** | Rechtsprüfung (Q16), Operations bereitet vor |
| ☐ | **Nutzungsbedingungen** (M2, §9): keine rechtswidrigen Inhalte, Hochladende verantwortlich, nur eigene bzw. für die Gruppe bestimmte Unterlagen; Löschung nach Frist, **kein Backup** – Nutzer sichern selbst | Operations → Rechtsprüfung |
| ☐ | **Datenschutzerklärung:** Abschnitt „Reiseunterlagen“ (Platzhalter unten) DE + EN; bis G1b in Demo/Vorschau nur Platzhalter-Gliederung (§0a); Empfänger Hetzner (Speicher), keine Weitergabe | Developer (Platzhalter), Operations → Rechtsprüfung |
| ☐ | VVT-Eintrag (§5) und TOM (§7: Speicher privat, Scan, Neukodierung, kurzlebige Links, Löschung ohne Backup-Nachlauf) ergänzt | Operations |
| ☐ | Lizenzhinweise (F-051): `heic-to` (LGPL-3.0, eigener Chunk), `sharp`/libvips, `pdfjs-dist`, `file-type`, S3-Bibliothek | Developer, Reviewer |

**Platzhaltertext (Stichpunkte, Entwurf):**

> **Reiseunterlagen (Tickets, Buchungsbestätigungen)**
> - **Wozu:** Mitglieder einer Reise können Unterlagen hochladen, damit die Gruppe sie griffbereit hat.
> - **Was:** die Datei (PDF, JPG, PNG; HEIC wird auf deinem Gerät in JPG umgewandelt), Titel, Kategorie, optional Datum, Sichtbarkeit. Bei Bildern entfernen wir Metadaten wie Aufnahmeort und Kamera. Unterlagen enthalten oft Namen und Buchungscodes – auch von Mitreisenden; lade nur hoch, was die Gruppe braucht, und teile persönliche Tickets nur mit der Person.
> - **Rechtsgrundlage:** Vertrag/Nutzung der App (Art. 6 Abs. 1 lit. b DSGVO); Prüfung auf Schadsoftware zum Schutz aller Nutzer (Art. 6 Abs. 1 lit. f) `[PLATZHALTER: Rechtsprüfung, insb. Daten Dritter auf Tickets]`.
> - **Wer sie sieht:** alle Mitglieder der Reise oder nur die ausgewählten Personen. Abruf nur über kurzlebige, persönliche Links.
> - **Speicherort:** privater Speicher bei `[PLATZHALTER: Hetzner Online GmbH, Deutschland]`.
> - **Löschung:** durch dich oder die Orga jederzeit; automatisch **30 Tage nach Reiseende** (die App erinnert vorher ans Herunterladen), mit der Reise oder deinem Konto. Unterlagen werden **nicht** in Sicherungskopien aufbewahrt.

## 13. Gate G0 – geschlossene Freundes-Beta „Stufe B“ (Vercel + Neon, echte Daten)

Entscheidung CEO + Auftraggeber 2026-10-23: private, nicht-kommerzielle Beta für einen **geschlossenen Freundeskreis** (Beta-Code, Kontenobergrenze) mit **echten** Namen, E-Mail-Adressen, Verfügbarkeiten, Abstimmungen, Unterkünften und Kosten – auf **Vercel Hobby + Neon Free**, Mails über **Lettermint** (NL). Persönliche Reisedaten (F-054) bleiben **aus** (G1b), Inkrement 12 (Dateien) kommt nach der Beta. Technik: [deployment.md §0.12](deployment.md), Einrichtung: [beta-anleitung.md](beta-anleitung.md), Gate: [go-live.md – Gate G0](go-live.md).

**G0 ersetzt G1 nicht.** Die Platzhalter-Regel §0a gilt für Demo und Vorschau weiter; für die Beta gelten die Mindestanforderungen dieses Abschnitts. Alles mit M1/M2 bleibt für den Echtbetrieb auf EU-Hosting offen.

**Entwurf, keine Rechtsberatung.** Die Einschätzungen unten sind eine Betriebssicht für eine kleine private Beta; bei Unsicherheit (insb. §13.2 Vercel-AVV, §13.3 Impressum, Rechtsgrundlage in §13.4) fachkundig prüfen lassen.

### 13.1 Pflichtpunkte vor dem Einladen der ersten Testperson

| ☐ | Pflichtpunkt | Wer |
|---|---|---|
| ☐ | Beta-Modus gebaut und vom Reviewer freigegeben (P1-B0: `APP_ENV=beta`, Startschutz, Beta-Code, Zustimmung mit Version, PWA/Service Worker ohne personenbezogene Daten im Cache, Rechtstexte ohne Platzhalter) | Developer → Reviewer |
| ☐ | **Verantwortlicher benannt:** Auftraggeber (Name in `LEGAL_OPERATOR_NAME`, Kontakt in `CONTACT_EMAIL`) – **nicht** im öffentlichen Repository | Auftraggeber |
| ☐ | **Beta-Datenschutzhinweis** (§13.4) online, mit Name + Kontakt, versioniert; Häkchen bei der Registrierung (`/beta` Schritt 2 bzw. Einladungsweg Z4a, W23 A.4/A.8) speichert Version + Zeitpunkt am Konto | Developer, CEO prüft Text |
| ☐ | **Kurzfassung** auf `/beta` und im Einladungsweg mit den Texten aus §13.6 (insb. **kein** Versprechen „am Ende der Beta löschen wir alle Daten“, ehrliche Hosting-Zeile statt „Server in der EU“) | Developer, CEO prüft |
| ☐ | Seite **„Anbieter & Kontakt“** statt Platzhalter-Impressum (§13.3) | Developer |
| ☐ | **AVV/DPA abgelegt** (PDF mit Datum, außerhalb des Repos): Lettermint, Neon; **Vercel: Entscheidung E-G0-1 dokumentiert** (§13.2) | Auftraggeber |
| ☐ | **Vercel: KI-Training/Weitergabe zu Trainingszwecken abgeschaltet** (Team → Settings → Data Preferences) | Auftraggeber |
| ☐ | **2FA** auf GitHub (= Vercel-Login), Neon, Lettermint, Registrar | Auftraggeber |
| ☐ | Lettermint: Domain verifiziert (SPF, DKIM, Return-Path), DMARC `p=none` gesetzt, **Öffnungs-/Klick-Tracking aus**; Mail-Log-Aufbewahrung beim Anbieter so kurz wie möglich | Auftraggeber, Operations prüft per Testmail (Header: `dkim=pass`, `spf=pass`, `dmarc=pass`) |
| ☐ | Eigene Neon-Datenbank `wir-wollen-weg-beta` (Frankfurt), getrennt von der Vorschau; eigener `BETTER_AUTH_SECRET`/`CRON_SECRET` | Auftraggeber |
| ☐ | `TRAVEL_DATA_ENABLED=false`, Startschutz verweigert `true` | Developer, Reviewer |
| ☐ | Reiseunterlagen: `DOCUMENTS_ENABLED=false` (Standard in beta), **außer** der Auftraggeber entscheidet E-G0-10 = B – dann alle Punkte §13.7 | Developer, Reviewer, Auftraggeber |
| ☐ | Löschjob läuft täglich (Vercel Cron, erster Lauf im Log sichtbar: nur Anzahlen) | Operations, Auftraggeber zeigt Log |
| ☐ | **Hinweis an Tester** verschickt (Vorlage beta-anleitung.md §8, W23 A.1 + Datenschutz-Zeilen): private Beta, US-Hosting-Bezug, keine sensiblen Angaben in Freitexten, Konto jederzeit löschbar, normale Löschfristen | Auftraggeber |
| ☐ | **Feedback-Kanal** nur über Env-Variablen (`FEEDBACK_WHATSAPP_NUMBER`, `FEEDBACK_EMAIL`), nicht im Repo; vorausgefüllter Text ohne Reisenamen/IDs/Namen/E-Mail (W23 D.2) | Auftraggeber, Reviewer prüft Text |
| ☐ | Kurzer **VVT-Eintrag „Freundes-Beta“** (eine Seite, außerhalb des Repos oder `docs/ops/vvt.md` ohne Personenbezug): Zwecke, Kategorien, Empfänger (Vercel, Neon, Lettermint), Drittland USA (DPF/SCC), Fristen §6, TOM §7 | Operations (Entwurf) → Auftraggeber |
| ☐ | **Datenpannen-Mini-Prozess** notiert: wer merkt was, Auftraggeber entscheidet binnen 72 h über Meldung an die Aufsichtsbehörde (Art. 33), Kontakt der zuständigen Landesbehörde (Wohnsitz des Auftraggebers) notiert | Operations → Auftraggeber |
| ☐ | **Kein Lösch-Versprechen zum Beta-Ende** (CEO 2026-10-23): Es gelten die normalen Löschfristen (§6: Reisen 90 Tage nach Reiseende bzw. 12 Monate Inaktivität, Konten 24 Monate ohne Anmeldung, Konto jederzeit selbst löschbar). Ein späterer Umzug in den Echtbetrieb (G1, EU-Hosting) wird **vorher angekündigt** (neuer Dienstleister → neue Hinweis-Version, Widerspruch = Konto löschen). Ein Abschalten ohne Umzug wird mit Frist für den Datenexport angekündigt | CEO + Auftraggeber |

### 13.2 Datenschutz-Kurzbewertung der Dienstleister (Stand 2026-10-23)

**Gilt die DSGVO überhaupt?** Für rein persönliche/familiäre Tätigkeiten gilt die DSGVO nicht (Art. 2 Abs. 2 lit. c, „Haushaltsausnahme“). Eine Web-App für den eigenen Freundeskreis *könnte* darunter fallen – die Ausnahme wird aber eng ausgelegt; hier sprechen Internet-Dienst, Einladungslinks über den engsten Kreis hinaus, externe Dienstleister und die geplante spätere Produktnutzung dagegen. **Empfehlung: so handeln, als gelte die DSGVO** – der Mehraufwand ist klein (dieser Abschnitt).

| Dienstleister | Rolle / Daten | Ort / Drittland | Vertrag (AVV, Art. 28) | Bewertung für G0 |
|---|---|---|---|---|
| **Vercel Inc.** (Hosting App, Funktionen, CDN, Logs) | Auftragsverarbeiter; **alle** Anfragen laufen durch Vercel: IP, Cookies, Seiteninhalte (Namen, Verfügbarkeiten, Kosten, IBAN maskiert/auf Klick), kurzlebige Funktions-Logs mit Pfaden | US-Unternehmen; Funktionen in `fra1` (Frankfurt), CDN global → **Drittlandbezug**. Vercel ist laut eigener Doku unter dem **EU-U.S. Data Privacy Framework** zertifiziert → Übermittlung auf Basis des Angemessenheitsbeschlusses (Art. 45). Zugriff US-Behörden (CLOUD Act) bleibt theoretisch möglich | **Unklar für Hobby:** Die AGB verweisen für die Verarbeitung personenbezogener Daten auf das Vercel-DPA, der DPA-Text nennt aber als Geltungsbereich Kunden in **Pro und Enterprise**. Zusätzlich erlauben die Hobby-Bedingungen (Stand März 2026) standardmäßig die Nutzung von Inhalten für **KI-Training** (Opt-out in den Team-Einstellungen; wirkt nur für die Zukunft) | **Vertretbar für eine kleine private Beta mit Maßnahmen** (Opt-out, Hinweis an Tester, Datenminimierung, keine Ausweisdaten, Beta-Ende), aber **formale Lücke beim AVV** → Entscheidung **E-G0-1** (unten) |
| **Neon** (Neon Inc., Teil von Databricks) – PostgreSQL | Auftragsverarbeiter; **alle** gespeicherten Daten der Beta | US-Unternehmen; Speicherort AWS `eu-central-1` (Frankfurt). DPF-Listung von Neon/Databricks **nicht verifiziert** → auf dataprivacyframework.gov prüfen; sonst greifen die Standardvertragsklauseln des DPA | DPA laut Neon **in die Nutzungsbedingungen einbezogen** und zusätzlich zum Unterzeichnen/Herunterladen; Geltung für den Free-Plan nicht ausdrücklich bestätigt | vertretbar; PDF ablegen, DPF-Status prüfen |
| **Lettermint B.V.** (NL) – Transaktionsmails | Auftragsverarbeiter; E-Mail-Adresse, Mailinhalt (Code, Link, Reisename), Zustell-Logs | EU, eigene Infrastruktur laut Anbieter; einzelne Unterauftragsverarbeiter (Support-/Kommunikationstools) in den USA | DPA Teil der AGB (Fassung 2026-04-09) | **gut** – Tracking abschalten |
| INWX (Registrar) | nur Daten des Auftraggebers (Domain-Inhaber) | DE | kein AVV nötig (eigener Vertrag) | – |
| GitHub | Code, CI – **keine** Nutzerdaten | USA | kein AVV nötig, solange keine Echtdaten in Repo/Issues/CI | Regel bleibt (Reviewer) |

**E-G0-1 – Vercel-Tarif (Entscheidung Auftraggeber, Empfehlung Operations):**

| Option | Kosten | Pro | Contra |
|---|---|---|---|
| **A: Hobby + Maßnahmen** *(Empfehlung für G0)* | 0 € | sofort, keine Kosten; DPF deckt die Übermittlung | AVV-Geltung für Hobby unklar; Hobby nur für private, nicht-kommerzielle Nutzung (passt zur Beta, nicht mehr zu M1/M2) |
| B: Vercel Pro | 20 $/Monat (je Teammitglied) | DPA gilt ausdrücklich; KI-Training standardmäßig aus; höhere Kontingente | laufende Kosten für eine Übergangslösung |
| C: Beta erst auf EU-Hosting (G1-Infrastruktur Hetzner) | ca. 10–40 €/Monat + ~1 Woche Arbeit Operations | kein Drittlandbezug, Plan ohnehin nötig | verzögert die Beta deutlich |

**Maßnahmen bei Option A (Pflicht):** KI-Training-Opt-out; Hinweis an Tester inkl. USA-Bezug; keine Ausweis-/Gesundheitsdaten (Reisedaten aus, Hinweis zu Freitexten); Kontenobergrenze; Beta zeitlich begrenzen; App loggt keine personenbezogenen Daten (bestehende Log-Regeln §7); Vercel-Konto mit 2FA nur beim Auftraggeber.

**Daten mit erhöhter Sensibilität in der Beta:** IBAN/Zahlungsinfo (F-036, freiwillig, maskiert), Freitexte (Notizen, Infoseite, Kommentare). Keine besonderen Kategorien (Art. 9) vorgesehen → Hinweis an Tester „keine Gesundheits- oder Ausweisangaben in Notizen“. Persönliche Reisedaten (F-054) technisch aus.

### 13.3 Impressum bei einer rein privaten Freundes-Beta? (Einschätzung)

§ 5 DDG verlangt ein Impressum für **geschäftsmäßige, in der Regel gegen Entgelt** angebotene digitale Dienste. Eine **private, unentgeltliche, nicht beworbene** Test-Version für einen **geschlossenen** Freundeskreis (Zugang nur mit Beta-Code, `noindex`) ist nach Betriebssicht **eher nicht impressumspflichtig**. Risiken: „geschäftsmäßig“ wird weit ausgelegt, und das Projekt ist auf ein späteres (Freemium-)Angebot angelegt. **Empfehlung:** statt Impressum eine Seite **„Anbieter & Kontakt“** mit Name und E-Mail (ohne Anschrift) – deckt die Transparenz ab, kostet nichts, keine Privatadresse im Netz. Ein vollständiges Impressum (ladungsfähige Anschrift) ist Pflichtpunkt für G1/M1 (§1). Bei Zweifeln vor G0 fachkundig prüfen lassen.

### 13.4 Entwurf Beta-Datenschutzhinweis (DE, Version `beta-1`)

Platzhalter in geschweiften Klammern füllt die App aus Env-Variablen (`{name}` = `LEGAL_OPERATOR_NAME`, `{kontakt}` = `CONTACT_EMAIL`, `{datum}` = Stand des Textes). **Keine** `[PLATZHALTER`-Marker. Developer übernimmt den Text in die i18n-Dateien; EN als Übersetzung mit Hinweis „Translation – the German version applies“ (E-G0-6).

> **Datenschutzhinweis zur privaten Beta von „Wir wollen weg“** (Version beta-1, Stand {datum})
>
> **1. Wer ist verantwortlich?** {name} (Privatperson). Kontakt: {kontakt}. Die Beta ist ein privates, nicht-kommerzielles Testprojekt für einen geschlossenen Freundeskreis.
>
> **2. Welche Daten verarbeiten wir?** *Konto:* E-Mail-Adresse, Anzeigename, Sprache, Region, optional ein Passwort (nur als sicherer Hash). *Reisen:* Mitgliedschaften und Rollen, deine freien und belegten Tage, Kommentare, Stimmen, Inhalte der Infoseite, Unterkunftsvorschläge und Bewertungen, Ausgaben und Salden, freiwillig hinterlegte Zahlungsinfo (z. B. IBAN). *Registrierung:* Zeitpunkt und Version deiner Zustimmung zu diesem Hinweis, ob du über Beta-Code oder Einladung gekommen bist. *Technik:* IP-Adresse, Zeitpunkt und Art der Anfrage in kurzlebigen Server-Protokollen, ein Anmelde-Cookie, während der Registrierung kurz ein Cookie, das den geprüften Beta-Code bzw. die Einladung festhält (ohne den Code selbst).
>
> **3. Wofür und auf welcher Rechtsgrundlage?** Damit die App für dich und deine Reisegruppen funktioniert (Art. 6 Abs. 1 lit. b DSGVO) und um sie vor Missbrauch zu schützen, z. B. durch Begrenzung von Anmeldeversuchen (Art. 6 Abs. 1 lit. f DSGVO). Die Teilnahme ist freiwillig; bei der Registrierung bestätigst du, diesen Hinweis gelesen zu haben.
>
> **4. Wer sieht deine Daten?** Die Mitglieder einer Reise sehen innerhalb dieser Reise deinen Namen, deine Verfügbarkeiten, Stimmen, Vorschläge und Ausgaben – sonst niemand. Keine Werbung, kein Tracking, kein Verkauf von Daten.
>
> **5. Dienstleister:** *Vercel Inc.* (USA) betreibt die App (Server-Region Frankfurt); dabei können Daten in die USA übermittelt werden – Vercel ist unter dem EU-US Data Privacy Framework zertifiziert. *Neon* (USA, Teil von Databricks) speichert die Datenbank in Frankfurt (Amazon Web Services). *Lettermint B.V.* (Niederlande) verschickt die Anmelde-Mails. Diese Dienstleister verarbeiten Daten nur in unserem Auftrag.
>
> **6. Cookies und Speicher auf deinem Gerät:** nur technisch notwendige (Anmeldung, Sprache, Darstellung). Installierst du die App auf dem Home-Bildschirm, speichert sie eine Offline-Seite und Programmdateien – keine persönlichen Daten.
>
> **7. Wie lange?** Dein Konto, bis du es löschst, spätestens nach 24 Monaten ohne Anmeldung (mit Hinweis-Mail vorher). Reisen 90 Tage nach dem Reiseende bzw. 12 Monate nach der letzten Aktivität. Server-Protokolle nur wenige Tage. Diese Fristen gelten auch während und nach der Test-Phase. Ändern wir etwas Wesentliches – etwa einen Umzug zu einem anderen Hosting-Anbieter –, sagen wir dir vorher Bescheid; du kannst dann dein Konto löschen.
>
> **8. Deine Rechte:** Auskunft (auch als Datenexport in der App), Berichtigung, Löschung (Konto löschen in der App), Einschränkung, Widerspruch und Datenübertragbarkeit. Schreib dafür an {kontakt}. Du kannst dich außerdem bei einer Datenschutz-Aufsichtsbehörde beschweren, z. B. der deines Wohnorts.
>
> **9. Pflicht zur Angabe?** Ohne E-Mail-Adresse kein Konto; alles andere ist freiwillig. Es gibt keine automatisierten Entscheidungen.
>
> **10. Feedback:** Wenn du über „Feedback geben“ per WhatsApp oder E-Mail schreibst, siehst du vorher den Text; er enthält Gerät, App-Version und die Ansicht – keine Reisen oder Namen. Für die Übermittlung gelten die Bedingungen von WhatsApp bzw. deines Mail-Anbieters. Wir nutzen Feedback nur, um die App zu verbessern.

Prüfpunkte für den Text: Abschnitte §2a (Link-Vorschau: unser Server ruft die verlinkte Seite ohne deine Daten ab) und §2b (Kosten/Zahlungsinfo) in Kurzform ergänzen, falls die Rechtsprüfung das verlangt; HIBP nur erwähnen, wenn eingeschaltet (für G0 aus).

### 13.5 Ergänzungen Cookies/Speicher (§4) und Löschung (§6) für G0

| Speicherung / Daten | Zweck | Bewertung |
|---|---|---|
| **Service Worker + Cache Storage** `ww-shell-<buildId>` (nur `beta`/`production`) | Offline-Hinweisseite, App-Shell, gehashte Programmdateien (`/_next/static`) | technisch erforderlich für die vom Nutzer gewählte Installation/Offline-Anzeige (§ 25 Abs. 2 Nr. 2 TDDDG); **keine** personenbezogenen Daten, keine Kennung; Abmelden/Konto löschen sendet `Clear-Site-Data: "cache"` |
| Cookie **`ww_beta_pass`** (httpOnly, signiert, ≤ 24 h) | geprüften Beta-Code (nur Kennung, nicht der Code) + Zustimmung bis zur Kontoanlage festhalten (deployment.md §0.12.5 Nr. 2) | technisch erforderlich für die angeforderte Registrierung (§ 25 Abs. 2 Nr. 2 TDDDG); keine E-Mail, kein Code; wird bei Kontoanlage gelöscht |
| Cookie **`ww_invite_pass`** (nur Variante B, httpOnly, signiert, ≤ 24 h) | Einladung (Hash des Tokens, Reise-ID) + Zustimmung bis zur Kontoanlage | wie oben; Token nur als Hash |
| `sessionStorage` (nur App-Modus) | Formularzustand der Beta-Schritte, wenn der Datenschutzhinweis im selben Fenster geöffnet wird (W23 C.5) | technisch erforderlich; endet mit dem Fenster; keine Codes |
| Merker „Install-Hinweis gesehen“: `installHintSeenAt` am Konto + `localStorage` (W23 B.5) | Hinweis nur einmal zeigen | `localStorage`-Wert ohne Personenbezug (nur Zeitstempel/`1`), vom Nutzer veranlasste Funktion; Löschung mit Konto bzw. Abmelden (`Clear-Site-Data`) |
| `standalone`-Kennzeichen an der Code-Anforderung | Hinweis auf der Magic-Link-Seite (W23 A.6) | verfällt mit der Anforderung |
| `betaConsentVersion`, `betaConsentAt`, `betaSignupVia` am Konto | Nachweis der Zustimmung zum Beta-Hinweis, Weg der Registrierung | Löschung mit dem Konto |
| Neon-Sicherungs-Branches (manuell vor Migrationen) | Wiederherstellung | **innerhalb von 30 Tagen löschen** (wie Backup-Rotation §6); bei Konto-/Reiselöschungen in der Zwischenzeit gilt dasselbe wie für Backups |
| Lettermint-Zustell-Logs | Zustellnachweis, Fehleranalyse | Aufbewahrung laut Anbieter, möglichst kurz einstellen |
| Vercel-Funktionslogs | Betrieb | laut Vercel bei Hobby nur kurz aufbewahrt; App schreibt keine Adressen/Tokens/Inhalte hinein |

### 13.6 Kurzfassung für `/beta` Schritt 2 und den Einladungsweg (Operations-Fassung zu W23 A.4 / E)

W23 hat die Kurzfassung als UX-Entwurf geliefert und Operations um die Hosting-Zeile und eine Entscheidung zum Lösch-Versprechen gebeten. Ergebnis (CEO 2026-10-23: **kein** Versprechen „am Ende der Beta löschen wir alle Daten“; es gelten die normalen Löschfristen):

| Schlüssel | DE | EN | Änderung ggü. W23 |
|---|---|---|---|
| `beta.privacy.p1` | Wir speichern nur, was die App braucht: E-Mail, deinen Namen und was du in Reisen einträgst. | We only store what the app needs: your email, your name and what you add to trips. | unverändert |
| `beta.privacy.p2` | Deine Angaben sehen nur die Leute in deinen Reisen. | Only the people in your trips see what you add. | unverändert |
| `beta.privacy.p3` | Keine Werbung, kein Tracking. | No ads, no tracking. | unverändert |
| `beta.privacy.p4` | Die Daten liegen in Frankfurt. Die App läuft bei Vercel, einem US-Anbieter – mehr dazu im Datenschutzhinweis. | Your data is stored in Frankfurt. The app runs on Vercel, a US provider – more in the privacy notice. | ersetzt „Server in der EU. {Hosting-Zeile}“ (Vercel ist US-Anbieter mit weltweitem CDN – „Server in der EU“ wäre nicht ganz richtig) |
| `beta.privacy.p5` | Es ist eine Test-Version. Du kannst dein Konto jederzeit selbst löschen; Reisen löschen wir automatisch 90 Tage nach dem Reiseende. | This is a test version. You can delete your account yourself at any time; we delete trips automatically 90 days after they end. | ersetzt „Am Ende der Beta löschen wir alle Daten …“ |
| `beta.privacy.p6` *(neu)* | Bitte trag keine Ausweis- oder Gesundheitsdaten in Notizen ein. | Please don't put ID or health details in notes. | neu (Datenminimierung, §13.2) |
| `beta.privacy.consent` | Ich habe das gelesen und bin einverstanden. | I've read this and I agree. | unverändert |

Häkchen-Glyph bleibt dekorativ (W23 F). Der Link „Alles Weitere: Datenschutzhinweis“ zeigt auf die Fassung §13.4 (Version `beta-1`). Mail-Footer in beta: „Private Test-Version von Wir wollen weg · Datenschutz: {APP_URL}/datenschutz“ / „Private test version of When do we go? · Privacy: {APP_URL}/privacy“.

### 13.7 Reiseunterlagen in der Beta? (Entscheidung E-G0-10)

Ausgangslage: Unterlagen sind wie Reisedaten an Gate **G1b** gebunden („echte Dateien erst auf EU-Hosting“, PRD §6b/§8); Inkrement 12 wird ohnehin erst nach dem Beta-Start gebaut. Technik und Kosten: deployment.md §0.13.5.

| Option | Kosten | Pro | Contra |
|---|---|---|---|
| **A: aus bis G1b** *(Empfehlung, konsistent mit Reisedaten)* | 0 € | keine echten Tickets bei US-Anbietern, kein Scan-Restrisiko, kein Zusatzaufwand bei G0 | Tester sehen den Bereich nicht (in der Vorschau weiter vorführbar) |
| B: an mit Schutzpaket Stufe 1, ohne Signatur-Scan | 0 € (R2 EU) bzw. < 0,10 €/Monat (Scaleway) | Feedback zu einem Kernnutzen schon in der Beta | **Ausnahme von G1b** nötig; Tickets (Name + Buchungscode) bei einem weiteren Dienstleister; Restrisiko Schadsoftware (deployment.md §0.13.2) |

**Pflichtpunkte nur bei Option B:** Auftraggeber beschließt die Ausnahme schriftlich (Status-Board); Speicher-AVV/DPA abgelegt (§3); Beta-Datenschutzhinweis → Version `beta-2` mit Kurzabschnitt „Reiseunterlagen“ (Platzhaltertext §12.8, Speicherort „Cloudflare (Speicherort EU, US-Unternehmen)“ bzw. „Scaleway (Frankreich)“, „ohne Virenscanner – wir prüfen Dateityp und Inhalt“); Hinweis an Tester „nur Unterlagen hochladen, die ihr auch in WhatsApp teilen würdet“; alle Upload-/Auslieferungs-/Löschpunkte aus §12.8 außer ClamAV und DSA-Prüfung; Ablehnungs-Test mit echten Ticket-PDFs.

## Quellen (Abruf 2026-10-08)

- **Dateien F-055 (Abruf 2026-10-23):** Anbieter-, Preis- und Technikquellen siehe [deployment.md §0.13](deployment.md) (Quellenblock am Ende des Abschnitts); [Cloudflare DPA](https://www.cloudflare.com/dpa). DSA-Pflichten für Hosting-Dienste (Art. 11–18 VO (EU) 2022/2065) aus Fachwissen – bei Rechtsprüfung bestätigen.
- **G0 (Abruf 2026-10-23, über Websuche):** [Vercel – DPF](https://vercel.com/kb/guide/is-vercel-certified-under-dpf), [Vercel DPA](https://vercel.com/legal/dpa), [Vercel Terms](https://vercel.com/legal/terms), [Vercel ToS-Update März 2026 (KI-Training Hobby)](https://vercel.com/changelog/updates-to-terms-of-service-march-2026), [ComplyDog – Vercel DPA nur Pro/Enterprise](https://complydog.com/blog/is-vercel-gdpr-compliant-the-dpa-and-your-deployment), [Neon DPA](https://neon.com/dpa), [Neon – GDPR](https://neon.com/blog/gdpr-compliance-and-neon), [Lettermint DPA](https://lettermint.co/dpa), [Lettermint – Sitz NL](https://lettermint.co/compare/amazon-ses-alternative). Haushaltsausnahme, § 5 DDG, Art. 45 DSGVO/DPF aus Fachwissen – bei Rechtsprüfung bestätigen.

- BFSG/Kleinstunternehmen: [IHK – Barrierefreiheitsstärkungsgesetz](https://www.ihk.de/karlsruhe/fachthemen/recht/internetrecht/fallback1433495812828/bfsg-6348406), [Händlerbund – Ausnahme Kleinstunternehmen](https://ohn.haendlerbund.de/recht/rechtsfragen/kleinstunternehmen-bfsg-ausnahme), [e-recht24 – BFSG](https://www.e-recht24.de/ecommerce/13236-barrierefreiheitsstaerkungsgesetz.html)
- Widerrufsbutton: [Noerr – Umsetzungsgesetz veröffentlicht](https://www.noerr.com/de/insights/umsetzungsgesetz-zum-widerrufsbutton-veroeffentlicht), [Bitkom-Praxisleitfaden](https://www.bitkom.org/sites/main/files/2026-05/bitkom-praxisleitfaden-zur-umsetzung-des-widerrufsbuttons.pdf), [EVZ – Widerrufsbutton](https://www.evz.de/themen/einkaufen-digitales/online-handel/widerrufsbutton/)
- Übrige Angaben (DDG, TDDDG, DSGVO, BDSG, OS-Plattform, PAuswG, PassG, Art.-29-Leitlinien WP 248 zur DSFA) aus Fachwissen, nicht tagesaktuell recherchiert – bei der rechtlichen Prüfung bestätigen lassen.
