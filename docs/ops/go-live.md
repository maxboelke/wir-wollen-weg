# Go-Live-Gate – Wir wollen weg / When do we go?

Stand: 2026-10-09 · Verantwortlich: Operations Manager · Status: v1.1 (gilt ab Auftraggeber-Entscheidung Q14–Q16 vom 2026-10-08; v1.1: Entscheidungspunkt HIBP-Check)

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
| ☐ | Registrierungshinweis mit Links auf Datenschutz (und ab M2 Nutzungsbedingungen), Mindestalter 16 | Developer, Reviewer | compliance §9 |

### 2b. Betrieb (Q15)

| ☐ | Pflichtpunkt | Wer | Bezug |
|---|---|---|---|
| ☐ | Produktion eingerichtet (VM, Caddy/TLS, Firewall, Härtung), `deploy.yml` mit manueller Freigabe | Operations (OPS-1, OPS-3) | deployment.md §5 |
| ☐ | **Backups** laufen (stündlich `pg_dump`, verschlüsselt, off-site; Server-Backups) **und Restore-Test erfolgreich dokumentiert** | Operations (OPS-4) | deployment.md §6.1 |
| ☐ | **Monitoring:** Uptime-Alarm und Fehler-Alarm (Bugsink) kommen nachweislich beim Betreiber an; Disk-/Container-Alarm | Operations (OPS-4) | deployment.md §6.2 |
| ☐ | SPF/DKIM/DMARC grün, Zustellung an Gmail/Outlook/GMX/web.de/iCloud getestet (nicht im Spam) | Operations | deployment.md §7 |
| ☐ | Retention-Job (F-013/F-043) läuft täglich, Testlauf auf Staging | Developer, Operations | compliance §6 |
| ☐ | Security-Header geprüft, TLS A/A+, `noindex` auf Reiseseiten, Rate-Limits aktiv (`RATE_LIMIT_ENABLED=true`), `/.well-known/security.txt` mit echtem Kontakt | Operations, Reviewer | deployment.md §4, tech-stack.md §8 |
| ☐ | **In-App-Browser-Gerätetest T2** (WhatsApp, Instagram; iOS + Android) über Staging bestanden | Developer + Reviewer | tech-stack.md §11 |
| ☐ | Demo-Seed-Daten **nicht** in Produktion (Seed-Skript verweigert `APP_ENV=production`) | Developer, Reviewer | deployment.md §0.4 |
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

## Freigabe

| Stufe | Freigegeben durch Auftraggeber am | Notiz |
|---|---|---|
| 1 – Staging | – | |
| 2 – Beta (M1) | – | |
| 3 – Launch (M2) | – | |

Der CEO trägt die Freigabe hier und im [Status-Board](status.md) ein.
