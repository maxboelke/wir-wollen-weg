# Compliance-Checkliste (DE/EU) – Wir wollen weg

Stand: 2026-10-08 · Verantwortlich: Operations Manager · Status: Entwurf v0.2 (Offline-Demo-Modus, Platzhalter-Regel §0a)

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
| ☐ | **Passwort-Leak-Prüfung** (Have I Been Pwned, k-Anonymität: nur 5 Zeichen eines Hashwerts werden übermittelt, kein Personenbezug) erwähnen | M1 |
| ☐ | **Transaktionsmails** (Code, Reset, E-Mail-Änderung, Lösch-/Inaktivitätshinweise) – kein Tracking, Empfänger: Mail-Anbieter (AVV) | M1 |
| ☐ | **Hosting** (Hetzner, Deutschland), **Mail-Anbieter** (z. B. Lettermint, Niederlande), **Backup-Speicher**, **Fehler-Tracking** (selbst gehostet) als Empfänger/Auftragsverarbeiter | M1 |
| ☐ | **Keine Drittlandübermittlung** (bei Umsetzung gemäß deployment.md); sonst Abschnitt mit Rechtsgrundlage (DPF/SCC) ergänzen | M1 |
| ☐ | **Cookies/Endgerätezugriff**: nur technisch notwendige (Session, Sprache, ggf. `pending_invite`, `sessionStorage` für Formularentwurf) – Rechtsgrundlage § 25 Abs. 2 Nr. 2 TDDDG (siehe §4) | M1 |
| ☐ | **Statistik**: cookielose, aggregierte Ereigniszählung ohne Personenbezug beschreiben (PRD §4) | M1 |
| ☐ | **Speicherdauer** gemäß Löschkonzept (§6), inkl. „Backups bis zu 30 Tage“ | M1 |
| ☐ | Betroffenenrechte Art. 15–21 (Auskunft im MVP per E-Mail, F-043), Widerspruch gegen lit. f-Verarbeitungen, Beschwerderecht bei Aufsichtsbehörde (zuständige Behörde nach Sitz des Betreibers nennen) | M1 |
| ☐ | Pflicht zur Bereitstellung: E-Mail ist für das Konto erforderlich; ohne Konto keine Teilnahme (Q2) | M1 |
| ☐ | Keine automatisierte Entscheidung i. S. d. Art. 22 (Kandidaten-Vorschläge sind unverbindliche Vorschläge, die Gruppe entscheidet) | M1 |
| ☐ | Hinweis für Organisatoren: Platzhalter-Namen (F-007) sind Daten Dritter → Hinweis „nur Vornamen/Spitznamen verwenden“ in UI und Erklärung | M1 |
| ☐ | Englische Fassung mit Hinweis „Translation – the German version is legally binding“ | M2 |
| ☐ | Kurzfassung („Datenschutz auf einen Blick“) auf Registrierungs- und Beitrittsseite verlinkt (F-013) | M1 |
| ☐ | **v1-Ergänzungen vor Release:** Kalender-Import (nur frei/belegt, Rohdaten nur im Arbeitsspeicher, F-006/F-047), verschlüsselte Speicherung von Kalender-URLs/CalDAV-Passwörtern (F-019/F-048), Google/Microsoft/Apple als Login- bzw. Kalenderanbieter (F-045, F-020, F-021 – Drittland!), E-Mail-Benachrichtigungen mit Einwilligung (F-014) | v1 |

Erstellung (Entscheidung zurückgestellt bis Go-Live, Q16): Generator mit Aktualisierungsservice (z. B. Anbieter mit Abmahnschutz/Haftungsübernahme, ca. 10–30 €/Monat, Schätzung) **oder** einmalige anwaltliche Erstellung/Prüfung (Schätzung ca. 500–1 500 €). Entscheidung Auftraggeber.

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
| ☐ | Ablage aller AVVs (PDF + Datum) außerhalb des Repos; Liste hier pflegen | – | – | M1 |

## 4. Cookies & Endgerätezugriff (§ 25 TDDDG) – Banner nötig?

Seit 14.05.2024 heißt das TTDSG **TDDDG**. § 25 erfasst jedes Speichern/Auslesen auf dem Endgerät (Cookies, localStorage, sessionStorage, Fingerprinting).

| Speicherung | Zweck | Bewertung |
|---|---|---|
| Session-Cookie (Better Auth) | Anmeldung | unbedingt erforderlich (§ 25 Abs. 2 Nr. 2) |
| „Angemeldet bleiben“ (90 Tage) | vom Nutzer aktiv gewählt | erforderlich für den gewünschten Dienst |
| `NEXT_LOCALE` (Sprache) | vom Nutzer gewählte Sprache | erforderlich (Nutzerwunsch) |
| Theme-Wahl hell/dunkel (`data-theme`, Designer-Tokens) – Cookie oder localStorage | vom Nutzer gewählte Darstellung | erforderlich (Nutzerwunsch); ohne Wahl folgt die App dem System, nichts wird gespeichert |
| `pending_invite` (30 Min.) | Einladung über Login hinweg erhalten | erforderlich |
| `sessionStorage` Formularentwurf (F-001) | Reisedaten vor Login nicht verlieren | erforderlich |
| Statistik | **serverseitig**, ohne Endgerätezugriff | nicht von § 25 erfasst |

**Ergebnis:** Bei Umsetzung wie geplant (keine Tracker, keine Werbung, keine eingebetteten Drittinhalte, Schriften selbst gehostet, keine externen Karten/Videos) ist **kein Einwilligungs-Banner nötig** (deckt sich mit F-013). Pflicht bleibt die **Information** in der Datenschutzerklärung.

| ☐ | Regel | Fällig |
|---|---|---|
| ☐ | Reviewer prüft je Release: keine neuen Cookies/Storage-Schlüssel ohne Eintrag in obiger Tabelle; keine Drittanbieter-Ressourcen (Netzwerk-Tab/CSP) | laufend |
| ☐ | Google-Kalender-Link (F-012) ist ein normaler Link (kein Einbetten) → ok | M1 |
| ☐ | Bei späterer Einführung von Analytics mit Endgerätezugriff, Social-Login-Buttons mit SDK oder Zahlungs-Widgets: Neubewertung | v1/P |

## 5. Verzeichnis von Verarbeitungstätigkeiten (Art. 30 DSGVO)

Die Ausnahme für < 250 Beschäftigte greift **nicht**, weil die Verarbeitung regelmäßig erfolgt → **VVT anlegen** (außerhalb des Repos oder als `docs/ops/vvt.md` ohne personenbezogene Daten).

| ☐ | Verarbeitungstätigkeit | Fällig |
|---|---|---|
| ☐ | Kontoverwaltung & Anmeldung (F-040–F-043) | M1 |
| ☐ | Reiseplanung: Reisen, Mitgliedschaften, Verfügbarkeiten, Abstimmungen (F-001–F-013) | M1 |
| ☐ | Versand von Transaktionsmails | M1 |
| ☐ | Sicherheit: Rate-Limiting, Logs, Fehler-Tracking | M1 |
| ☐ | Backups | M1 |
| ☐ | Bearbeitung von Betroffenen- und Kontaktanfragen | M1 |
| ☐ | Aggregierte Nutzungsstatistik (ohne Personenbezug – dokumentieren, warum) | M1 |
| ☐ | Je Tätigkeit: Zweck, Kategorien Betroffener/Daten, Empfänger, Drittland (nein), Löschfristen (§6), TOMs (§7) | M1 |

**DSFA (Art. 35):** Für das MVP voraussichtlich nicht erforderlich (keine besonderen Kategorien, kein Profiling, keine systematische Überwachung) – Schwellwertanalyse kurz dokumentieren. **Neu bewerten vor F-048** (Speicherung von Drittanbieter-Zugangsdaten) und vor OAuth-Kalenderanbindungen.

## 6. Löschkonzept (F-013, F-043, PRD §8)

| Datenkategorie | Löschregel | Umsetzung | ☐ |
|---|---|---|---|
| Konto (Name, E-Mail, Passwort-Hash, Sprache, Region) | sofort bei Konto-Löschung (F-043); nach 24 Monaten ohne Login, Hinweis-Mail 30 Tage vorher | Retention-Job täglich; Organisatorrolle geht vorher über (F-043) | ☐ |
| Sessions | Ablauf (Browser-Ende bzw. 90 Tage rollierend), bei Logout/„überall abmelden“, Passwort-Reset, Konto-Löschung | DB-Cleanup täglich | ☐ |
| Codes / Magic-Link-Tokens | nach Verwendung bzw. 15 Min.; Cleanup täglich | gehasht gespeichert | ☐ |
| Rate-Limit-Einträge | nach Ablauf des Zeitfensters (Minuten bis 24 h) | Cleanup | ☐ |
| Reise inkl. Mitgliedschaften, Verfügbarkeiten, Kommentare, Abstimmungen | Organisator löscht (sofort); automatisch 90 Tage nach festgelegtem Reiseende bzw. 12 Monate nach letzter Aktivität; Hinweis-Mail 14 Tage vorher (F-013) | `ON DELETE CASCADE` + Retention-Job | ☐ |
| Mitgliedsdaten in einer Reise | sofort bei „Reise verlassen“ oder Entfernen durch Organisator (F-004, F-013) | Cascade | ☐ |
| Platzhalter (F-007) | mit Reise bzw. bei Übernahme/Entfernen | Cascade | ☐ |
| Server-/Proxy-Logs mit IP | 7 Tage | Log-Rotation | ☐ |
| Fehler-Tracking-Ereignisse | 30 Tage, ohne E-Mail/Token | Bugsink-Retention | ☐ |
| Backups | rollierend max. 30 Tage → gelöschte Daten spätestens dann auch aus Backups entfernt; bei Restore: Löschungen der letzten 30 Tage erneut anwenden (Lösch-Protokoll nur mit IDs, ohne Inhalte) | Backup-Rotation, Runbook | ☐ |
| Mail-Anbieter-Logs | gemäß Anbieter (Aufbewahrung im AVV prüfen, möglichst ≤ 30 Tage einstellen) | Anbieter-Einstellung | ☐ |
| Kontakt-/Betroffenenanfragen | 3 Jahre nach Abschluss (Nachweis), danach löschen – Frist prüfen lassen | Postfach | ☐ |
| Aggregierte Statistik | unbegrenzt (kein Personenbezug) | – | ☐ |
| *v1:* Kalender-Rohdaten | nie speichern, nur im Arbeitsspeicher (F-006) | Code-Review | ☐ |
| *v1:* gespeicherte Kalender-URLs/CalDAV-Passwörter | bei Trennen, Festlegung der Reise (Sync-Ende), Konto-Löschung | verschlüsselt, Cascade | ☐ |

Test: Retention-Job hat Unit- und E2E-Tests (Uhrzeit simuliert); Lauf wird geloggt (nur Anzahlen).

## 7. Technische und organisatorische Maßnahmen (Art. 32 DSGVO) – Kurzliste

| ☐ | Maßnahme | Fällig |
|---|---|---|
| ☐ | TLS überall, HSTS; DB nur im internen Netz; Firewall | M1 |
| ☐ | Zugang Server/Hosting/Mail/GitHub nur mit 2FA; SSH nur per Schlüssel | M1 |
| ☐ | Passwörter Argon2id; Codes/Tokens gehasht; Rate-Limits; keine Konto-Enumeration (tech-stack.md §3) | M1 |
| ☐ | Verschlüsselte Backups (`age`), Restore-Test monatlich | M1 |
| ☐ | Least Privilege für Organisator-/Mitgliedsrechte, serverseitig geprüft (F-004) | M1 |
| ☐ | Keine personenbezogenen Daten in Logs/CI/Issues | laufend |
| ☐ | **Datenpannen-Prozess** (Art. 33/34): Erkennen → bewerten → Meldung an Aufsichtsbehörde binnen 72 h → ggf. Betroffene informieren; Kontaktdaten der Behörde notieren | M2 |
| ☐ | `security.txt` mit Kontakt für Sicherheitsmeldungen | M2 |

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

## Quellen (Abruf 2026-10-08)

- BFSG/Kleinstunternehmen: [IHK – Barrierefreiheitsstärkungsgesetz](https://www.ihk.de/karlsruhe/fachthemen/recht/internetrecht/fallback1433495812828/bfsg-6348406), [Händlerbund – Ausnahme Kleinstunternehmen](https://ohn.haendlerbund.de/recht/rechtsfragen/kleinstunternehmen-bfsg-ausnahme), [e-recht24 – BFSG](https://www.e-recht24.de/ecommerce/13236-barrierefreiheitsstaerkungsgesetz.html)
- Widerrufsbutton: [Noerr – Umsetzungsgesetz veröffentlicht](https://www.noerr.com/de/insights/umsetzungsgesetz-zum-widerrufsbutton-veroeffentlicht), [Bitkom-Praxisleitfaden](https://www.bitkom.org/sites/main/files/2026-05/bitkom-praxisleitfaden-zur-umsetzung-des-widerrufsbuttons.pdf), [EVZ – Widerrufsbutton](https://www.evz.de/themen/einkaufen-digitales/online-handel/widerrufsbutton/)
- Übrige Angaben (DDG, TDDDG, DSGVO, BDSG, OS-Plattform) aus Fachwissen, nicht tagesaktuell recherchiert – bei der rechtlichen Prüfung bestätigen lassen.
