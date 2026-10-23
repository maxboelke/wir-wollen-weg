# Go-Live-Gate – Wir wollen weg / When do we go?

Stand: 2026-10-23 · Verantwortlich: Operations Manager · Status: v1.4 (v1.4: **Gate G1b – persönliche Reisedaten** (Inkrement 11) + Prüfpunkt „Reisedaten in Produktion aus“; v1.3: CSP Stufe 2, Egress-Härtung, Datenschutz-Abschnitt „Unterkünfte & Link-Vorschau“ – Inkrement 9; gilt ab Auftraggeber-Entscheidung Q14–Q16 vom 2026-10-08; v1.1: Entscheidungspunkt HIBP-Check; v1.2: R-037 Tokens in Logs)

Bezug: [deployment.md](deployment.md) (§0 Offline-Demo, §2–§7 Betrieb ab Go-Live) · [compliance-checklist.md](compliance-checklist.md) · [status.md](status.md) · [PRD §12](../product/PRD.md) (Q11, Q14–Q16)

> **Auftrag an den CEO:** Bevor die App für irgendjemanden außerhalb des Teams **dauerhaft über das Internet erreichbar** wird (Staging für Testpersonen, Beta M1, Launch M2), legt der CEO dem Auftraggeber diese Checkliste vor und erinnert ihn an die zurückgestellten Entscheidungen Q14 (Betreiber/Impressum), Q15 (Domain, Hosting-/Mail-Konten) und Q16 (Rechtstexte-Weg). **Ohne Freigabe aller Pflichtpunkte von Stufe 1 und 2 kein Go-Live.**
>
> **Wann erinnern?** Spätestens **6 Wochen vor dem gewünschten Beta-Start**, sonst automatisch beim ersten dieser Auslöser: (a) Inkrement 5 (Abstimmung & Festlegung, P1-5) ist begonnen, (b) jemand möchte Testpersonen außerhalb des eigenen WLANs einladen, (c) der In-App-Browser-Gerätetest (T2) soll über eine dauerhafte Staging-URL laufen.
>
> Diese Checkliste ersetzt keine Rechtsberatung (siehe Hinweis in [compliance-checklist.md](compliance-checklist.md)).

## Warum 6 Wochen Vorlauf?

| Punkt | Typische Vorlaufzeit |
|---|---|
| Markenrecherche beide Namen, ggf. Namensänderung | 1–2 Wochen (Recherche), bei Kollision deutlich länger |
| Rechtstexte per Anwalt bzw. Generator einrichten | 1–4 Wochen (Anwalt) / 1–2 Tage (Generator) |
| Domain registrieren, DNS, Mail-Domain verifizieren | 1–2 Tage |
| DMARC von `p=none` über `quarantine` auf `reject` (deployment.md §7) | 2–4 Wochen Beobachtung |
| Server-Einrichtung, Staging, Backups, Restore-Test (OPS-1, OPS-3, OPS-4) | ca. 1 Woche Arbeit Operations |

---

## Stufe 1 – vor dem ersten öffentlich erreichbaren Server (Staging, nur synthetische Daten)

| ☐ | Pflichtpunkt | Wer entscheidet / liefert | Bezug |
|---|---|---|---|
| ☐ | **Domain(s) festgelegt und registriert** (EU-Registrar, DNSSEC) – mind. eine Domain für die App; Empfehlung: DE- und EN-Name prüfen (z. B. `wirwollenweg.de` / `wir-wollen-weg.de` und eine Domain für „When do we go?“, z. B. `.app`/`.com`) | Auftraggeber (Q15) | deployment.md §7.1 |
| ☐ | **Hosting-Konto** (Empfehlung Hetzner, DE) auf den Betreiber, 2FA, Zahlungsmittel; **AVV in der Console** abgeschlossen | Auftraggeber (Vertragspartner), Operations richtet ein | deployment.md §5.1, compliance §3 |
| ☐ | **Mail-Konto** (Empfehlung Lettermint, NL) auf den Betreiber, 2FA; **AVV/DPA** abgeschlossen; Tracking-Pixel/Klick-Tracking deaktiviert | Auftraggeber, Operations | tech-stack.md §6, compliance §3, §11 |
| ☐ | **Postfach** für Kontakt/Impressum/DMARC-Berichte (z. B. mailbox.org, Posteo) inkl. AVV | Auftraggeber | deployment.md §2.2 |
| ☐ | **SPF, DKIM, DMARC** (`p=none` zum Start), Custom Return-Path; Prüfung mit Mail-Tester | Operations (OPS-2) | deployment.md §7.2 |
| ☐ | Staging hinter Basic-Auth, `noindex`, Mailpit-UI mit Passwort | Operations (OPS-1) | deployment.md §3 |
| ☐ | **R-037 – keine Tokens in Logs (Staging):** Caddy-Log-Baustein `access_log_redacted` aktiv; Abnahmetest mit Einladungs- und Magic-Link durchgeführt (kein `/i/<token>`, kein `token=`, kein `Referer` im Zugriffslog, auch nicht in Caddy-Fehler-/Docker-Logs) | Operations (OPS-1), Reviewer | deployment.md §5.4, Finding R-037 |
| ☐ | Off-site-Backup-Ziel + `age`-Schlüsselpaar (privater Schlüssel offline beim Betreiber) | Auftraggeber (Schlüssel), Operations | deployment.md §6.1 |

## Stufe 2 – vor Go-Live mit echten Nutzern (Beta M1)

### 2a. Recht & Betreiber (Q14, Q16)

| ☐ | Pflichtpunkt | Wer | Bezug |
|---|---|---|---|
| ☐ | **Betreiber festgelegt** (Privatperson/Einzelunternehmer oder Gesellschaft) und **echte Impressumsangaben** (Name, ladungsfähige Anschrift, E-Mail + zweiter Kontaktweg) | Auftraggeber (Q14) | compliance §0, §1 |
| ☐ | **Weg für Rechtstexte entschieden** (Generator-Abo mit Abmahnschutz *oder* Anwalt) und umgesetzt: Impressum + Datenschutzerklärung DE live | Auftraggeber (Q16), Operations (Entwurf OPS-5) | compliance §1, §2 |
| ☐ | **Alle Platzhalter entfernt:** keine `[PLATZHALTER …]`-Marker mehr in Impressum, Datenschutz, Mail-Footer, `security.txt`; Startschutz greift (deployment.md §0.6) | Developer, Reviewer prüft | compliance §0a |
| ☐ | **Markenprüfung für beide Namen** „Wir wollen weg“ und „When do we go?“: Identitäts-/Ähnlichkeitsrecherche in DPMA (DPMAregister), EUIPO (eSearch/TMview) und WIPO (Global Brand Database) für relevante Klassen (v. a. 9 Software, 42 SaaS, ggf. 39 Reiseorganisation) sowie App-Stores und Domains; Ergebnis dokumentieren. Eigene Markenanmeldung optional (Kosten ca.: DPMA ab ca. 290 € für bis zu 3 Klassen, EUIPO ab ca. 850 € für 1 Klasse – vor Anmeldung aktuell prüfen) | Auftraggeber (ggf. mit Anwalt), Operations recherchiert vor | PRD Q11 |
| ☐ | **AVV-Liste vollständig** (Hosting, Mail, Postfach, ggf. Backup-Speicher), Ablage außerhalb des Repos | Operations | compliance §3 |
| ☐ | VVT angelegt, Löschkonzept final, Schwellwertanalyse DSFA dokumentiert | Operations (OPS-6) | compliance §5, §6 |
| ☐ | **Entscheidung: HIBP-Check einschalten?** (`PASSWORD_BREACH_CHECK=hibp`) – neue Passwörter zusätzlich online gegen „Have I Been Pwned“ prüfen (k-Anonymität: nur 5 Zeichen des SHA-1-Hashs verlassen den Server; kein Konto, keine Kosten, fail-open). **Ja (Empfehlung Operations):** bessere Passwortqualität; Datenschutzerklärung muss die Übermittlung nennen, Server braucht ausgehende HTTPS-Verbindung zu `api.pwnedpasswords.com`. **Nein:** nur Offline-Liste (Ist-Stand Demo) | Auftraggeber, Operations setzt Env-Variable | tech-stack.md §3.2, deployment.md (Env-Variablen), compliance §2 |
| ☐ | **Datenschutzerklärung um „Unterkünfte & Link-Vorschau“ ergänzt** (Abruf fremder Seiten durch unseren Server ohne Daten der Person, Bilder nicht gespeichert, Notizen für die Reise sichtbar; Urheberrecht Vorschaubilder geprüft) | Operations (Entwurf), Rechtsprüfung | compliance §2a, features.md R.7 I9-10 |
| ☐ | Registrierungshinweis mit Links auf Datenschutz (und ab M2 Nutzungsbedingungen), Mindestalter 16 | Developer, Reviewer | compliance §9 |

### 2b. Betrieb (Q15)

| ☐ | Pflichtpunkt | Wer | Bezug |
|---|---|---|---|
| ☐ | Produktion eingerichtet (VM, Caddy/TLS, Firewall, Härtung), `deploy.yml` mit manueller Freigabe | Operations (OPS-1, OPS-3) | deployment.md §5 |
| ☐ | **Backups** laufen (stündlich `pg_dump`, verschlüsselt, off-site; Server-Backups) **und Restore-Test erfolgreich dokumentiert** | Operations (OPS-4) | deployment.md §6.1 |
| ☐ | **Monitoring:** Uptime-Alarm und Fehler-Alarm (Bugsink) kommen nachweislich beim Betreiber an; Disk-/Container-Alarm | Operations (OPS-4) | deployment.md §6.2 |
| ☐ | **R-037 – Logs ohne Tokens (Produktion), Pflicht:** (1) Caddy-Zugriffslog mit Filter §5.4, Abnahmetest wiederholt; (2) **Bugsink/Fehler-Tracking:** `sendDefaultPii: false`, `beforeSend`/`beforeBreadcrumb` scrubben **URLs** (`request.url`, Query, Breadcrumbs, Transaktionsnamen: `/i/[redacted]`, `/auth/[redacted]`) und **Header** (`Referer`, `Cookie`, `Authorization` entfernen) – Test: Fehler auf `/i/<token>` provozieren, Ereignis in Bugsink enthält keinen Token; (3) Ausnahme „Einladungs-Token im Klartext“ in VVT/TOM übernommen | Operations (OPS-1, OPS-4), Developer (SDK-Konfiguration), Reviewer | deployment.md §5.4, §6.2; compliance §7, §7a |
| ☐ | SPF/DKIM/DMARC grün, Zustellung an Gmail/Outlook/GMX/web.de/iCloud getestet (nicht im Spam) | Operations | deployment.md §7 |
| ☐ | Retention-Job (F-013/F-043) läuft täglich, Testlauf auf Staging | Developer, Operations | compliance §6 |
| ☐ | Security-Header geprüft, TLS A/A+, `noindex` auf Reiseseiten, Rate-Limits aktiv (`RATE_LIMIT_ENABLED=true`), `/.well-known/security.txt` mit echtem Kontakt | Operations, Reviewer | deployment.md §4, tech-stack.md §8 |
| ☐ | **CSP Stufe 2 (Nonce, `strict-dynamic`) scharf geschaltet**, vorher ≥ 1 Inkrement Report-Only ohne Verstöße in E2E; Bild-Proxy mit `default-src 'none'; sandbox` | Developer, Reviewer | deployment.md §0.9 |
| ☐ | **Egress-Härtung** des App-Containers (nur `tcp/443` ins Internet, interne Netze + Metadaten `169.254.169.254` gesperrt); SSRF-Tests der Link-Vorschau grün | Operations (OPS-1), Reviewer | deployment.md §0.8, §5.1 |
| ☐ | **In-App-Browser-Gerätetest T2** (WhatsApp, Instagram; iOS + Android) über Staging bestanden | Developer + Reviewer | tech-stack.md §11 |
| ☐ | Demo-Seed-Daten **nicht** in Produktion (Seed-Skript verweigert `APP_ENV=production`) | Developer, Reviewer | deployment.md §0.4 |
| ☐ | **Persönliche Reisedaten in Produktion aus** (`TRAVEL_DATA_ENABLED` leer bzw. `false`), solange G1b nicht freigegeben ist – Route `/trips/{id}/travel-data` liefert 404 | Operations, Reviewer | deployment.md §0.11.1, Gate G1b unten |
| ☐ | Reviewer-Freigabe ✅ für alle Features des Meilensteins (DE und EN) | Reviewer | CLAUDE.md |

## Stufe 3 – zusätzlich vor öffentlichem Launch (M2)

| ☐ | Pflichtpunkt | Bezug |
|---|---|---|
| ☐ | Datenschutzerklärung EN, Nutzungsbedingungen DE + EN, Lizenzseite | compliance §1, §2, §9 |
| ☐ | Anwaltliche Prüfung bzw. Generator mit Haftungsübernahme für alle Rechtstexte | compliance (Hinweis oben) |
| ☐ | DMARC `p=reject` | deployment.md §7.2 |
| ☐ | Datenpannen-Prozess dokumentiert, Kontakt Aufsichtsbehörde notiert | compliance §7 |
| ☐ | Screenreader-Test Kernfluss (VoiceOver, TalkBack), BFSG-Einordnung dokumentiert | compliance §8 |

---

## Gate G1b – persönliche Reisedaten (F-054/F-056, ab Inkrement 11)

**Zusätzlich zu Stufe 1 + 2**, unabhängig von Stufe 3. Solange G1b nicht freigegeben ist, läuft die App in Produktion **ohne** den Bereich Reisedaten (`TRAVEL_DATA_ENABLED` aus); Markierung „Bucht“, Infoseite, Unterkünfte und Kosten funktionieren trotzdem. Details und Abhak-Listen: [compliance-checklist.md §12](compliance-checklist.md), Schlüssel: [deployment.md §0.11](deployment.md). Dateibezogene Punkte (F-055, Inkrement 12) werden ergänzt.

| ☐ | Pflichtpunkt | Wer | Bezug |
|---|---|---|---|
| ☐ | **DSFA** (schlanke Datenschutz-Folgenabschätzung, Art. 35) für Reisedaten abgeschlossen und abgelegt | Operations → Rechtsprüfung | compliance §12.2 |
| ☐ | **Rechtliche Prüfung PAuswG/PassG** (Speicherung von Ausweis-/Passnummern) dokumentiert; falls unzulässig: Feld Dokumentnummer in Produktion deaktiviert | Rechtsprüfung (Q16) | compliance §12.3 |
| ☐ | **Datenschutzerklärung** um Abschnitt „Persönliche Reisedaten“ ergänzt (Einwilligung, nur anfragende Person, Verschlüsselung, Zugriffsprotokoll, Fristen, Widerruf), Einwilligungstext DE/EN mit Version; VVT + TOM ergänzt | Operations (Entwurf), Rechtsprüfung | compliance §12.3, §5, §7 |
| ☐ | **Löschkonzept** Reisedaten getestet: Widerruf, Entzug „Bucht“, Verlassen/Entfernen, Konto löschen, Reiseende + 7 Tage, Festlegung aufgehoben + 30 Tage; Löschjob täglich in Produktion | Reviewer, Operations | compliance §6, §12.4 |
| ☐ | **Log-Regeln:** Logs/Fehler-Tracking enthalten nur anonyme Zähler, keine IDs/Werte – Suchtest mit Demo-Werten auf Staging bestanden | Reviewer, Operations | compliance §12.5 |
| ☐ | **Schlüssel:** eigener `TRAVEL_DATA_KEYS` für Produktion, getrennt von DB-Zugang und Backups abgelegt, Sicherungskopie beim Betreiber; Startschutz, Rotation und Runbook A auf Staging geübt | Operations, Auftraggeber | deployment.md §0.11 |
| ☐ | **Security-Review Reisedaten** (Rechte, Löschung, Re-Authentifizierung, keine Werte in Logs/Mails/URLs) bestanden | Reviewer | features.md R.9 „Sicherheit“ |
| ☐ | **Prüfpunkt Vorschau:** Dokumentnummern ohne `DEMO`-Präfix werden in der Vorschau abgelehnt; Hinweis „keine echten Ausweisdaten“ sichtbar | Reviewer, CEO | compliance §12.6 |
| ☐ | Datenpannen-Prozess (Art. 33/34) inkl. Runbook B „Schlüsselleck“ steht | Operations | compliance §7, deployment.md §0.11.8 |

Erst nach Freigabe (Tabelle unten) setzt Operations `TRAVEL_DATA_ENABLED=true` in Produktion und startet die App neu.

---

## Freigabe

| Stufe | Freigegeben durch Auftraggeber am | Notiz |
|---|---|---|
| 1 – Staging | – | |
| 2 – Beta (M1) | – | |
| 3 – Launch (M2) | – | |
| G1b – persönliche Reisedaten | – | erst danach `TRAVEL_DATA_ENABLED=true` in Produktion |

Der CEO trägt die Freigabe hier und im [Status-Board](status.md) ein.
