# Features – Wir wollen weg / When do we go?

Stand: 2026-10-23 (v0.9, Inkrement 11 „Bucht“ + Reisedaten zugeschnitten – R.9; v0.8: Inkrement 10 „Kosten teilen“ zugeschnitten – R.8; v0.7: Inkrement 9 „Unterkünfte“ zugeschnitten – R.7; v0.6: Ausbaustufe „Reise managen“ entschieden, Inkrement 8 zugeschnitten; Entscheidungen Q1–Q6, Q11–Q36, UX-1, UX-2, UX-8, UX-9 eingearbeitet) · Verantwortlich: Product Manager · Bezug: [PRD.md](PRD.md), [roadmap.md](roadmap.md), [W16 v2](../ux/wireframes/w16-cockpit.md)

Priorisierung nach MoSCoW **bezogen auf das MVP**: **M** = Must, **S** = Should, **C** = Could (v1), **W** = Won't (jetzt nicht, später). Spalte „Phase“ siehe Roadmap. Spalte „Tarif“: geplante Zuordnung im Freemium-Modell (PRD §6) – **Free** = dauerhaft kostenlos, **Premium?** = Kandidat für Premium, Entscheidung offen (Q8). Im MVP ist alles kostenlos.

**Änderungen v0.2:** Neu F-040–F-050 (Konto, Sprachen, Apple-Kalender, Premium). F-003, F-004, F-001, F-007, F-013 auf Konto-Modell umgestellt (keine persönlichen Links/Admin-Links mehr). F-006 ICS-Import MVP → v1. F-014 E-Mail-Benachrichtigungen MVP-Should → v1. F-016 Feiertage Should → Must (DE/EN). F-018 durch F-040–F-044 ersetzt. E-Mail-Bezüge in F-010, F-012, F-015, F-017 entfernt.

**Änderungen v0.3 (2026-10-08, Auftraggeber-Entscheidungen Q11–Q13, UX-Abstimmung):** Neu **F-051 Hilfe-/FAQ-Seite** (Must, MVP; Q13 e). F-011: Ergebnis einer Option erst nach eigener Stimme sichtbar, Orga sieht immer alles (Q13 a). F-002/F-004: alle Mitglieder dürfen den Einladungslink teilen, solange der Beitritt offen ist (Q13 b). F-004: UI-Rollenname „Orga“ / „Organizer“ (Q13 c). F-041: „Angemeldet bleiben“ standardmäßig an (Q13 d). F-046: sprachabhängiger Produktname „Wir wollen weg“ / „When do we go?“ (Q11). F-008: Zählregel präzisiert (U-4). F-009: Gruppennamen „Alle dabei“ / „Fast alle dabei“ (U-14). F-040/F-003: Name erst nach dem Code (UX-Abweichung bestätigt). F-015: kein „@“ vor Namen im Erinnerungstext (UX-Abweichung bestätigt).

**Änderungen v0.4 (2026-10-08, Auftraggeber-Entscheidungen Q17/Q18):** Neu **F-052 Bewegung, Animationen & Haptik** (Must, MVP; Querschnitts-Feature) mit Schalter „Bewegung reduzieren“ im Konto zusätzlich zur Systemeinstellung (Q17 a), Reduced-Motion-Regeln, Performance-Leitplanken und dezenter Android-Vibration (Q17 c); Detailkatalog: [docs/motion/interaktionen.md](../motion/interaktionen.md). F-012: Feier „Es geht los!“ für **alle** Mitglieder beim ersten Öffnen nach Festlegung, einmal pro Person (Q17 b). F-043: Abschnitt „Darstellung“ in den Kontoeinstellungen. Look & Feel 2.0 (Q18, Richtung B „Reise-Cockpit“, Palette „Indigo & Minze“) betrifft alle UI-Features optisch, ändert aber keine Akzeptanzkriterien – umgesetzt im Roadmap-Schritt „UI-Fundament“.

**Änderungen v0.5 (2026-10-20, Auftraggeber-Wunsch „Reise managen“, Planung – Entscheidungen Q26–Q36 offen):** Neue **Ausbaustufe „Reise managen“** (nach „Termin finden“) mit detaillierten Steckbriefen im neuen Abschnitt **AUSBAUSTUFE „Reise managen“** (vor „WON'T“): neu **F-053 Reise-Cockpit (Übersicht Phase 3)**, **F-054 Persönliche Reisedaten**, **F-055 Reiseunterlagen (Dateien)**, **F-056 Zuständigkeit „Bucht“**; **F-031** (Unterkünfte per Swipe), **F-033** (Reise-Infoseite, jetzt ohne Dateien – Dateien → F-055), **F-035 + F-036** (Kosten teilen, zusammen als ein Modul) detailliert und aus „Won't“ in die Ausbaustufe gehoben; F-037 bleibt „später“. Einordnung gegenüber v1 (Kalender-Import) und Reihenfolge: PRD Q26/Q27 (beantwortet Q7 und Q19 mit).

**Änderungen v0.6 (2026-10-22, Auftraggeber „Ja zu allem“):** **Q26–Q36 entschieden wie empfohlen** – alle „(Q…)“-Angaben in der Ausbaustufe gelten jetzt als entschieden. **UX-1:** Phase 3 ohne Tabs, Cockpit als Hub. **UX-2:** Reisedaten eigener Bereich (F-054, F-055 angepasst). **F-053 neu gefasst nach W16 v2 „Reiseverlauf“** (Ticket-Kopf, Weg mit Stationen V1–V6/T/D, „Heute“ statt „Für dich zu tun“, Kacheln „Immer griffbereit“, Mehr zur Reise) inkl. **UX-8** (kleine Feier am Abreisetag) und **UX-9** („ohne App erledigt“ durch die Orga). F-031/F-035/F-055: „Tab“ → Station/Kachel + Bereichs-Unterseite. F-033: Bearbeiten in Inkrement 8 nur Orga („Bucht“ ab Inkrement 11). Neu **R.6 Zuschnitt Inkrement 8** mit User Stories, Akzeptanzkriterien, Abgrenzung und Datenhaltung. F-015 und F-017: Umsetzungsstand nachgetragen (Inkrement 7 wird aufgelöst, roadmap.md).

**Änderungen v0.7 (2026-10-23):** Neu **R.7 Zuschnitt Inkrement 9 – Unterkünfte (F-031 Stufe 1)** mit User Stories I9-01–I9-11, Rechte-Tabelle (Bucher = Orga bis Inkrement 11), Sicherheit (SSRF-Schutz, Bild-Proxy ohne offene URL, Rate-Limits), Datenhaltung (`trip_stay`, `trip_stay_rating`, Festlegung/gebucht an der Reise, `trip_station_marks`, `trip.currency`), Demo-Seed und Abgrenzung zu 10–12. Festlegungen: Bereich außerhalb Phase 3 nicht erreichbar (Daten bleiben); neue Termin-Festlegung mit anderem Zeitraum setzt «gebucht» zurück; «Aus Unterkunft übernehmen» übernimmt nur den Titel, keine Adresse; ✕ nur als Zahl, ♥ namentlich.

**Änderungen v0.8 (2026-10-23):** Neu **R.8 Zuschnitt Inkrement 10 – Kosten teilen (F-035 + F-036 Stufe 1)** mit User Stories I10-01–I10-11, Rechte-Tabelle, verbindlichen **Rechenregeln** (Cent-Ganzzahlen, Rest-Cent an die ersten Personen in fester Reihenfolge, Ausgleich per „exakte Paare + Greedy“ mit Garantie ≤ n−1 Überweisungen, A1-Schwelle je Währung, erlaubte Währungen), Sicherheit (Konfliktschutz `version`, Idempotenz beim Anlegen, Salden-Prüfung beim Markieren), Datenhaltung (`trip_cost_party` – überlebt das Verlassen –, `trip_expense`, `trip_expense_share`, `trip_settlement`, Zahlungsinfo an `trip_member`), Demo-Seed und Abgrenzung. Festlegungen: Orga darf alle Ausgaben bearbeiten/löschen, markiert Ausgleiche zwischen zwei Konto-Mitgliedern aber nicht für andere; Zahlungsinfo getrennt in **geprüfte IBAN** (maskiert angezeigt) + Freitext ≤ 100; Abschließen auch mit offenen Salden (nach Warnung) sperrt Ausgaben und Ausgleiche; Platzhalter mit Beteiligung nicht löschbar; UI sagt nicht „minimal“. Steckbrief F-035/F-036 verweist auf R.8.

**Änderungen v0.9 (2026-10-23):** Neu **R.9 Zuschnitt Inkrement 11 – „Bucht“ + persönliche Reisedaten (F-056 + F-054 Stufe 1)** mit User Stories I11-01–I11-13, abschließender Feldliste, Rechte-Tabelle (Orga ohne Markierung nie Inhalte), Lebenszyklus-/Löschtabelle, Verschlüsselung (AES-256-GCM mit AAD, `TRAVEL_DATA_KEYS`, Rotation, HKDF-Ableitung nur in Demo/Vorschau), Sicherheit, Rate-Limits, Datenhaltung (Migration 0012), Demo-Seed und Abgrenzung. Festlegungen: Standard-Markierung nur bei der **ersten** Festlegung; Zusatzrechte „Bucht“ für Infoseite und «gebucht ✓» (Festlegen bleibt Orga); Maskierung serverseitig, Klartext nur per protokolliertem Anzeigen/Kopieren; Re-Authentifizierung (12 h, Code/Magic Link) nur für Dokumentnummern; Einwilligung mit Löschregel statt festem Datum (Terminänderung verschiebt das Löschdatum); Kachel Reisedaten auch für Personen mit eigener Freigabe (Widerruf leicht erreichbar); Zugriffsprotokoll lebt so lange wie die Freigabe; **Feature-Schalter `TRAVEL_DATA_ENABLED`** (in Produktion aus bis G1b) und **`DEMO`-Präfix für Dokumentnummern in Demo/Vorschau**. Steckbriefe F-054/F-056 verweisen auf R.9.

## Übersicht

| ID | Feature | Prio | Phase | Tarif |
|---|---|---|---|---|
| F-001 | Reise anlegen | M | MVP | Free |
| F-002 | Einladungslink & Teilen-Texte | M | MVP | Free |
| F-003 | Beitreten mit Konto im Einladungsflow | M | MVP | Free |
| F-004 | Rollen & Reiseverwaltung | M | MVP | Free |
| F-005 | Verfügbarkeit manuell angeben | M | MVP | Free |
| F-006 | Kalender-Import per ICS (Datei/URL, einmalig) | C | **v1** (verschoben aus MVP) | Free |
| F-007 | Teilnahmestatus & Platzhalter | M | MVP | Free |
| F-008 | Gemeinsamer Kalender (Heatmap) | M | MVP | Free |
| F-009 | Kandidaten-Zeiträume berechnen | M | MVP | Free |
| F-010 | Abstimmung erstellen | M | MVP | Free |
| F-011 | Abstimmen (Ja / Vielleicht / Nein) | M | MVP | Free |
| F-012 | Ergebnis festlegen & verkünden | M | MVP | Free |
| F-013 | Datenschutz: Reise verlassen/löschen & Aufbewahrung | M | MVP | Free |
| F-014 | E-Mail-Benachrichtigungen (opt-in) | C | **v1** (verschoben aus MVP) | Free |
| F-015 | Nachzügler erinnern (Teilen-Text) – **gebaut** (Feedback-Runde 1, PR #22) | S | MVP | Free |
| F-016 | Feiertage & Wochenenden einblenden (DE/AT/CH/UK/US) | **M** (hochgestuft) | MVP | Free |
| F-017 | Abstimmungsfrist – **großteils gebaut** (Inkrement 5 + Feedback-Runde 1; Rest s. F-017) | S | MVP | Free |
| ~~F-018~~ | ~~Optionales Konto & Reiseübersicht~~ – **ersetzt durch F-040–F-044** | – | – | – |
| F-019 | Kalender-Abo-Sync (ICS-URL automatisch aktualisieren) | C | v1 | Premium? |
| F-020 | Google-Kalender-Anbindung (OAuth, Free/Busy) | C | v1 | Free/Premium? |
| F-021 | Microsoft-/Outlook-Anbindung (OAuth) | C | v1 | Free/Premium? |
| F-022 | Co-Organisatoren | C | v1 | Premium? |
| F-023 | Pflicht- und optionale Teilnehmer | C | v1 | Premium? |
| F-024 | Urlaubstage-Optimierung (Brückentage) | C | v1 | Premium? |
| F-030 | Zielfindung (Vorschläge & Abstimmung) | W | später | Free |
| F-031 | Unterkünfte sammeln & per Swipe bewerten (Auftraggeber-Idee 2026-10-08) | **R** | **Ausbaustufe „Reise managen“** (Inkrement 9; Screenshots Inkrement 12) – Einordnung Q26 | Free (Basis) · Premium? (mehr Bilder) |
| F-032 | Aufgaben & Packliste | W | später | Premium? |
| F-033 | Reise-Infoseite (Adresse, Treffpunkt, Check-in – Text & Links) | **R** | **Ausbaustufe „Reise managen“** (Inkrement 8) | Free |
| F-034 | Budget-Abfrage (anonym) | W | später | Free |
| F-035 | Ausgaben erfassen (Kosten teilen, Teil 1) | **R** | **Ausbaustufe „Reise managen“** (Inkrement 10) – Q7 → Q26/Q27 | Free (Belegfotos: Premium?) |
| F-036 | Salden & Ausgleichsvorschlag (Kosten teilen, Teil 2) | **R** | **Ausbaustufe „Reise managen“** (Inkrement 10) | Free |
| F-037 | Mehrere Währungen | W | später (nach Kosten-Basis) | Premium? |
| F-038 | PWA / Push-Benachrichtigungen | W | später | Free |
| **F-040** | **Registrierung (passwortlos, optional Passwort)** | **M** | **MVP** | Free |
| **F-041** | **Anmelden & Abmelden (Code/Magic-Link, Passwort, Sessions)** | **M** | **MVP** | Free |
| **F-042** | **Passwort & Zugangswiederherstellung, E-Mail ändern** | **M** | **MVP** | Free |
| **F-043** | **Konto verwalten & löschen (DSGVO)** | **M** | **MVP** | Free |
| **F-044** | **„Meine Reisen“-Übersicht** | **M** | **MVP** | Free |
| **F-045** | **Social Login (Sign in with Apple, Google)** | C | v1 | Free |
| **F-046** | **Sprachen Deutsch & Englisch (i18n, Formate)** | **M** | **MVP** | Free |
| **F-047** | **Apple-/iOS-Kalender Stufe 1: iCloud-Kalenderlink & Mac-Export mit iOS-Assistent** | C | **v1 (v1.0, zusammen mit F-006)** | Free |
| **F-048** | **Apple-/iOS-Kalender Stufe 2: iCloud-CalDAV-Anbindung** | C | **v1 (v1.1)** | Free (Auto-Sync: Premium?) |
| **F-049** | **Apple-/iOS-Kalender Stufe 3: On-Device-Weg (iOS-Kurzbefehl, ggf. native App)** | W | **später** (Spike in v1) | Free |
| **F-050** | **Premium-Tarif & Bezahlung (Freemium)** | W | später | – |
| **F-051** | **Hilfe-/FAQ-Seite** | **M** | **MVP** | Free |
| **F-052** | **Bewegung, Animationen & Haptik (Querschnitt, inkl. Schalter „Bewegung reduzieren“)** | **M** (Basis) | **MVP** (Motion-Prio „MVP+“ vor Beta, „später“ danach) | Free |
| **F-053** | **Reise-Cockpit: Übersicht nach der Festlegung (Phase 3, Hub „Reise managen“)** | **R** | **Ausbaustufe „Reise managen“** (Inkrement 8) | Free |
| **F-054** | **Persönliche Reisedaten (Name laut Ausweis, Geburtsdatum, optional Ausweisdaten) – Abfrage & Freigabe; eigener Bereich (UX-2)** | **R** | **Ausbaustufe „Reise managen“** (Inkrement 11; echte Daten erst nach Gate G1b) | Free |
| **F-055** | **Reiseunterlagen: Tickets & Dokumente sicher teilen (Dateien)** | **R** | **Ausbaustufe „Reise managen“** (Inkrement 12; echte Daten erst nach Gate G1b) | Free bis Kontingent · Premium? (mehr Speicher) |
| **F-056** | **Zuständigkeit „Bucht“ (buchende Person, von der Orga vergeben)** | **R** | **Ausbaustufe „Reise managen“** (Inkrement 11) | Free |

**Prio R** = Ausbaustufe „Reise managen“ (nach dem MVP „Termin finden“; Einordnung gegenüber v1 siehe PRD Q26). Innerhalb der Ausbaustufe gilt je Feature ein eigener MVP-Schnitt („Stufe 1 / später“).

**MVP-Umfang (Must):** F-001, F-002, F-003, F-004, F-005, F-007, F-008, F-009, F-010, F-011, F-012, F-013, F-016, F-040, F-041, F-042, F-043, F-044, F-046, F-051, F-052 · **Should:** F-015, F-017.

**Bewusst ausgeschlossen (kein Plan):** In-App-Chat, Buchung, Abwicklung von Zahlungen zwischen Reisenden, Schreibzugriff auf Nutzerkalender, stundengenaue Terminplanung, Ranking-/Präferenzwahl, Werbung, Gast-Teilnahme ohne Konto (Rückfallplan siehe PRD Q10).

### Begriffe
- **Konto**: Anzeigename, E-Mail (verifiziert), optional Passwort, Sprache, Region (für Datum/Wochenstart/Feiertage), Einstellung „Bewegung reduzieren“ (F-052).
- **Reduzierte Bewegung**: gilt, wenn das System `prefers-reduced-motion: reduce` meldet **oder** der Konto-Schalter „Bewegung reduzieren“ an ist (F-052); technisch `data-motion="reduce"` am `<html>`.
- **Reise**: Planungsobjekt mit Suchzeitraum, Dauer, Mitgliedern (max. 30).
- **Mitglied**: Konto, das einer Reise beigetreten ist; Rolle Organisator oder Mitglied. **UI-Bezeichnung** der Organisator-Rolle: „Orga“ (DE) / „Organizer“ (EN) (Q13 c); in Dokumenten weiter „Organisator“.
- **Produktname**: sprachabhängig – DE „Wir wollen weg“, EN „When do we go?“; eine Marke, eine Bildmarke (Q11, F-046).
- **Tageszustand**: pro Mitglied und Tag `geht` | `ginge zur Not` | `geht nicht`.
- **Abgegeben**: Mitglied hat seine Verfügbarkeit bestätigt; erst dann zählen nicht markierte Tage als `geht`.
- **Kandidat**: zusammenhängender Zeitraum (n Nächte = n+1 Tage) im Suchzeitraum.
- **Transaktionsmail**: vom Nutzer ausgelöste bzw. für das Konto notwendige E-Mail (Code, Magic-Link, Passwort-Reset, E-Mail-Änderung, Lösch-/Inaktivitätshinweis). Keine Benachrichtigung über Reise-Ereignisse.

---

## MUST – MVP

### F-040 Registrierung (passwortlos, optional Passwort)
**Als** eingeladene Person **möchte ich** mir in unter einer Minute ein Konto anlegen, ohne die Einladung aus den Augen zu verlieren, **damit** ich sofort mitplanen kann.

Akzeptanzkriterien:
- [ ] Registrierung ist sowohl direkt (Startseite → „Reise planen“) als auch **eingebettet im Einladungsflow** (F-003) möglich; im Einladungsflow bleiben Reisename und Organisator sichtbar.
- [ ] Pflichtangaben: E-Mail-Adresse und Anzeigename (1–40 Zeichen). Keine weiteren Pflichtfelder.
- [ ] **Reihenfolge (bestätigte UX-Abweichung, user-flows A):** erster Schritt nur E-Mail → Code → **Name erst nach erfolgreicher Verifizierung und nur bei neuem Konto**; bestehende Konten werden nie nach dem Namen gefragt. Im Einladungsflow ist der Namensschritt zugleich der Beitrittsschritt (kein zusätzlicher Bildschirm). Begründung: ein Feld im ersten Formular, keine Konto-Enumeration, kein versehentliches Überschreiben bestehender Namen. Zustimmung zu Datenschutzhinweis/Nutzungsbedingungen per Hinweistext mit Link (kein vorangekreuztes Häkchen für Marketing; es gibt kein Marketing-Opt-in im MVP).
- [ ] Standardweg **passwortlos**: Nach Absenden wird eine Transaktionsmail mit **6-stelligem Code und Magic-Link** gesendet. Code-Eingabe im selben Fenster (`autocomplete="one-time-code"`, Einfügen aus Zwischenablage); der Magic-Link funktioniert in jedem Browser und führt über die gespeicherte Rücksprungadresse zurück zur Reise.
- [ ] Optional kann direkt bei der Registrierung oder später ein Passwort gesetzt werden (F-042); E-Mail-Verifizierung per Code/Link ist trotzdem einmalig nötig.
- [ ] Code/Link: 15 Min. gültig, einmalig verwendbar, max. 5 Fehlversuche; „Code erneut senden“ nach 30 s; Hinweis „Spam-Ordner prüfen“.
- [ ] Existiert die E-Mail bereits, wird ohne Hinweis auf die Existenz derselbe Code-Ablauf als Login durchgeführt (keine Konto-Enumeration, kein Fehler „E-Mail schon vergeben“).
- [ ] Sprache und Region werden aus Browser-Einstellungen vorbelegt (F-046) und im Konto gespeichert.
- [ ] Mail in der Sprache der Oberfläche; Betreff enthält den Code und den sprachabhängigen Produktnamen („123456 ist dein Code für Wir wollen weg“ / „123456 is your code for When do we go?“).
- [ ] Mobil inkl. In-App-Browser (WhatsApp, Instagram) ohne Kontextverlust nutzbar; Median-Dauer Start → verifiziert ≤ 60 s (Messung, PRD §4).

### F-041 Anmelden & Abmelden
**Als** Mitglied **möchte ich** mich auf jedem Gerät anmelden und wieder abmelden können, **damit** ich meine Reisen überall erreiche und auf fremden Geräten sicher bin.

Akzeptanzkriterien:
- [ ] Login per E-Mail + Code/Magic-Link (Standard) oder E-Mail + Passwort (falls gesetzt).
- [ ] Nach Login Weiterleitung zur ursprünglich aufgerufenen Seite (z. B. Reise, Einladungslink), sonst „Meine Reisen“ (F-044).
- [ ] „Angemeldet bleiben“ ist **standardmäßig aktiviert** (Q13 d) und abwählbar: aktiviert → Session rollierend 90 Tage (httpOnly, Secure, SameSite); abgewählt → Session endet mit dem Browser. Begründung: Wiederkehr ohne erneuten Code ist für die Zielgruppe (eigene Handys) wichtiger; für fremde Geräte bleibt das Abwählen und „Auf allen Geräten abmelden“.
- [ ] „Abmelden“ jederzeit im Menü; „Auf allen Geräten abmelden“ in den Kontoeinstellungen beendet alle Sessions.
- [ ] Rate-Limiting für Code-Anforderung und Login (pro E-Mail und pro IP); gleiche Antwortzeiten/Texte unabhängig von der Existenz des Kontos.
- [ ] Nicht angemeldete Aufrufe von Reiseseiten zeigen nur die Reise-Vorschau (F-003) bzw. die Anmeldung – keine Mitgliederdaten.

### F-042 Passwort & Zugangswiederherstellung, E-Mail ändern
**Als** Nutzer **möchte ich** wieder in mein Konto kommen, wenn ich mein Passwort vergesse oder das Gerät wechsle, **damit** ich nie den Zugang zu meinen Reisen verliere.

Akzeptanzkriterien:
- [ ] Passwort setzen/ändern in den Kontoeinstellungen (min. 10 Zeichen, Hinweis bei bekannt geleaktem Passwort wünschenswert); Passwort entfernen ist möglich (zurück zu passwortlos).
- [ ] „Passwort vergessen“: Transaktionsmail mit Code/Link zum Neusetzen; alle anderen Sessions werden danach beendet.
- [ ] Wer kein Passwort hat, braucht keinen Reset – Login per Code genügt (Hinweis im Login-Formular).
- [ ] E-Mail-Adresse ändern: Re-Authentifizierung, Bestätigung per Code an die **neue** Adresse, Info-Mail an die **alte** Adresse.
- [ ] Alle Transaktionsmails in der Kontosprache; keine Tracking-Pixel/Tracking-Links.

### F-043 Konto verwalten & löschen (DSGVO)
**Als** Nutzer **möchte ich** meine Kontodaten ändern und mein Konto vollständig löschen können, **damit** ich die Kontrolle über meine Daten behalte.

Akzeptanzkriterien:
- [ ] Kontoeinstellungen: Anzeigename, Sprache, Region (Datumsformat, Wochenstart, Standard-Feiertagsregion), E-Mail (F-042), Passwort (F-042), Abmelden überall (F-041), Abschnitt **„Darstellung“ mit Schalter „Bewegung reduzieren“ / „Reduce motion“** (Q17 a, Verhalten siehe F-052). Ein Schalter für hell/dunkel gibt es weiterhin **nicht** (Q12, Dark Mode folgt dem System).
- [ ] Namensänderung wirkt in allen Reisen.
- [ ] „Konto löschen“: Re-Authentifizierung (Code oder Passwort) und Bestätigungsdialog; löscht sofort Konto, Sessions, Name, E-Mail, Verfügbarkeiten und Stimmen in allen Reisen; Berechnungen der betroffenen Reisen aktualisieren sich.
- [ ] Ist die Person **Organisator** einer Reise mit weiteren Mitgliedern, muss sie vor dem Löschen je Reise eine Person als neuen Organisator bestimmen (Vorschlag: am längsten beigetretenes Mitglied) oder die Reise löschen; Reisen ohne weitere Mitglieder werden mitgelöscht.
- [ ] Bestätigungsmail „Dein Konto wurde gelöscht“ (Transaktionsmail); danach keine weiteren Mails.
- [ ] Inaktive Konten (24 Monate ohne Login) werden nach Hinweis-Transaktionsmail 30 Tage vorher automatisch gelöscht (gleiche Regeln wie oben, Organisatorrolle geht an das am längsten beigetretene Mitglied).
- [ ] Auskunft (Art. 15 DSGVO) im MVP auf Anfrage über die Kontakt-Adresse; Self-Service-Export (JSON) ist Kandidat für v1.

### F-044 „Meine Reisen“-Übersicht
**Als** Organisatorin und Mitglied mehrerer Gruppen **möchte ich** alle meine Reisen an einem Ort sehen, **damit** ich weiß, wo ich noch etwas tun muss.

Akzeptanzkriterien:
- [ ] Startseite nach Login: Liste aller Reisen, in denen ich Mitglied bin, mit Name, Rolle (Chip „Orga“ / „Organizer“ bei eigener Orga-Rolle, F-004), Phase (Verfügbarkeit offen / Abstimmung läuft / festgelegt: Datum) und Fortschritt („5/7 abgegeben“).
- [ ] Hervorgehobene To-dos: „Deine Verfügbarkeit fehlt noch“, „Jetzt abstimmen“ bzw. für Organisatoren „Alle haben abgegeben – Abstimmung starten?“.
- [ ] Sortierung: Reisen mit offenen To-dos zuerst, dann nach nächstem Ereignis/Datum; vergangene Reisen in einem eingeklappten Bereich.
- [ ] Button „Neue Reise planen“ (F-001).
- [ ] Leerzustand mit kurzer Erklärung und CTA.

### F-046 Sprachen Deutsch & Englisch
**Als** Mitglied einer gemischtsprachigen Gruppe **möchte ich** die App auf Deutsch oder Englisch nutzen, **damit** alle in ihrer Sprache mitmachen können.

Akzeptanzkriterien:
- [ ] **Sprachabhängiger Produktname (Q11):** `de` → „Wir wollen weg“, `en` → „When do we go?“. Der Name ist ein normaler Übersetzungsschlüssel (nie fest verdrahtet) und erscheint in der Sprache der jeweiligen Ausgabe: Header/Wortmarke neben der gemeinsamen Bildmarke (Logo A), `<title>`, Web-Manifest/Open-Graph-Vorschau (Sprache der aufgerufenen URL), Transaktionsmails (Kontosprache, inkl. Absendername), Teilen-Texte (gewählte Textsprache). Die Bildmarke ist in beiden Sprachen identisch.
- [ ] Gesamte Oberfläche, Fehlermeldungen, Teilen-Texte, Transaktionsmails, Datenschutzhinweise, Hilfe-Seite (F-051) und Open-Graph-Vorschau in `de` und `en`; keine fest verdrahteten Texte (Build/Test schlägt bei fehlendem Übersetzungsschlüssel fehl).
- [ ] Sprache: Vorbelegung aus `Accept-Language` (Fallback Englisch für nicht-deutschsprachige Browser, Deutsch für `de-*`); Umschalter im Header/Footer (auch ohne Login) und in den Kontoeinstellungen; Wahl wird im Konto gespeichert und gilt geräteübergreifend.
- [ ] Jede Person sieht die Reise in **ihrer** Sprache; nutzergenerierte Inhalte (Reisename, Kommentare) werden nicht übersetzt.
- [ ] Teilen-Texte (F-002, F-012, F-015) werden in der Sprache des Teilenden erzeugt; vor dem Teilen ist die Sprache des Textes umschaltbar (für Gruppen mit anderer Sprache).
- [ ] Datums- und Zahlenformate über die Region des Kontos (`de-DE`, `de-AT`, `de-CH`, `en-GB`, `en-US` …), z. B. „Fr., 3. Juli 2027“ vs. „Fri, 3 July 2027“ vs. „Fri, July 3, 2027“.
- [ ] **Wochenstart** im Kalender nach Region (Montag für DE/AT/CH/UK, Sonntag für US), im Konto überschreibbar; Schnellaktion „Mo–Fr“ (F-005) bleibt unabhängig vom Wochenstart korrekt.
- [ ] Rechtstexte: Impressum DE; Datenschutzerklärung DE (verbindlich) + EN; beide nennen beide Produktnamen. In der Offline-Demo als gekennzeichnete Platzhalter (Q14/Q16, PRD §6a).

### F-001 Reise anlegen
**Als** Organisatorin **möchte ich** in unter zwei Minuten eine Reiseplanung anlegen, **damit** ich die Gruppe sofort einladen kann.

Akzeptanzkriterien:
- [ ] Reise anlegen erfordert ein Konto; nicht angemeldete Personen durchlaufen zuerst F-040/F-041, die bereits eingegebenen Reisedaten bleiben dabei erhalten.
- [ ] Pflichtfelder: Reisename (1–80 Zeichen), Suchzeitraum (Start- und Enddatum), Mindestdauer in Nächten (1–30). Optional: Wunschdauer (≥ Mindestdauer), Beschreibung (≤ 500 Zeichen), Feiertagsregion der Reise (Standard: Region des Organisators, F-016).
- [ ] Suchzeitraum: Startdatum ≥ heute, Länge ≤ 12 Monate, Länge ≥ Mindestdauer + 1 Tag; sonst verständliche Fehlermeldung am Feld.
- [ ] Nach dem Anlegen sieht die Organisatorin den Einladungslink (F-002); die Reise erscheint in „Meine Reisen“ (F-044). Es gibt **keinen** separaten Admin-Link – Verwaltungsrechte hängen am Konto (F-004).
- [ ] Die Organisatorin ist automatisch erstes Mitglied und kann direkt ihre Verfügbarkeit angeben.
- [ ] Suchzeitraum und Dauer sind nachträglich änderbar; Änderungen lösen eine Neuberechnung aus (F-009).

### F-002 Einladungslink & Teilen-Texte
**Als** Organisatorin (oder Mitglied) **möchte ich** einen Link in unseren Gruppenchat teilen, **damit** alle ohne Umwege mitmachen.

Akzeptanzkriterien:
- [ ] Jede Reise hat einen Einladungslink mit nicht erratbarem Token (≥ 128 Bit).
- [ ] **Teilen dürfen alle Mitglieder** (nicht nur die Orga), **solange der Beitritt offen ist** (Q13 b): Link kopieren/teilen und Teilen-Text sind für alle Mitglieder sichtbar. Ist der Beitritt gesperrt (F-004), sehen Mitglieder statt der Teilen-Buttons den Hinweis „Beitritt ist geschlossen – frag die Orga“; die Orga sieht den Link weiterhin (mit Hinweis „gesperrt“).
- [ ] Link neu erzeugen und Beitritt sperren/öffnen bleibt der Orga vorbehalten (F-004).
- [ ] Buttons: „Link kopieren“ (mit Bestätigung), „Teilen“ (native Web-Share-API, Fallback: WhatsApp-, Signal-, E-Mail-Link).
- [ ] Vorformulierter Teilen-Text, z. B. „Wir wollen weg! Trag bis <Datum> ein, wann du kannst: <Link>“ / „When do we go? Add your dates by <date>: <link>“ (Wortlaut final in ux-spec §10), editierbar und sprachumschaltbar vor dem Teilen (F-046).
- [ ] Teilen-Texte sind der einzige Benachrichtigungsweg für Reise-Ereignisse im MVP (Einladung, Abstimmung gestartet, Erinnerung, Ergebnis).
- [ ] Link-Vorschau (Open-Graph) zeigt Reisename und App-Namen (sprachabhängig, F-046), **keine** Mitgliedernamen oder Daten.
- [ ] Reiseseiten sind mit `noindex` gekennzeichnet.

### F-003 Beitreten mit Konto im Einladungsflow
**Als** Nachzügler **möchte ich** über den Link in wenigen Schritten beitreten, auch wenn ich noch kein Konto habe, **damit** ich ohne Umwege dabei bin.

Akzeptanzkriterien:
- [ ] Der Einladungslink zeigt auch ohne Login eine **Reise-Vorschau**: Reisename, Vorname des Organisators, Suchzeitraum, Dauer, Anzahl Mitglieder („7 sind schon dabei“) – **keine** Namensliste, Verfügbarkeiten oder Stimmen.
- [ ] CTA „Mitmachen“: 
  - angemeldet → Beitritt mit einem Klick (Anzeigename aus Konto, für diese Reise einmalig anpassbar);
  - nicht angemeldet → Registrierung/Login (F-040/F-041) **auf derselben Seite bzw. im selben Fenster** (E-Mail → Code → bei neuem Konto Name = Beitrittsschritt), danach automatischer Beitritt und Weiterleitung zur Verfügbarkeitseingabe (F-005) – ohne erneutes Öffnen des Links.
- [ ] Wird die Verifizierung über den Magic-Link in einem anderen Browser abgeschlossen, landet die Person dort ebenfalls direkt in der Reise (Rücksprungadresse im Token).
- [ ] Doppelte Anzeigenamen in einer Reise werden mit Hinweis und Vorschlag (z. B. „Kemal B.“) abgefangen.
- [ ] Bereits beigetretene Mitglieder, die den Link erneut öffnen, landen direkt in ihrer Reiseansicht.
- [ ] Platzhalter-Einladung (F-007): Über einen Platzhalter-Link beitretende Personen übernehmen den Platzhalter (Name vorbelegt).
- [ ] Beitritt nicht möglich, wenn die Reise 30 Mitglieder hat oder der Beitritt gesperrt ist (verständliche Meldung, Hinweis „frag <Organisator>“).
- [ ] Rate-Limit: max. 20 Beitritte pro Reise und Stunde pro IP.
- [ ] Ziel-Kennzahlen: Beitrittsquote neuer Link-Öffner ≥ 65 %, Link → Verfügbarkeit abgegeben ≤ 4 Min. im Median (PRD §4).

### F-004 Rollen & Reiseverwaltung
**Als** Organisatorin **möchte ich** die Reise verwalten können, **damit** ich bei Problemen (falsche Person, Link geleakt) eingreifen kann.

Akzeptanzkriterien:
- [ ] Rollen: **Organisator** (genau einer im MVP, Co-Organisatoren ab v1, F-022) und **Mitglied**; Rolle ist an das Konto gebunden.
- [ ] **Rollenname in der Oberfläche:** „Orga“ (DE) / „Organizer“ (EN) (Q13 c), z. B. als Chip in der Mitgliederliste und in „Meine Reisen“ (F-044); „Mitglied“ / „Member“ wird nicht extra ausgewiesen.
- [ ] Nur der Organisator kann: Reisedaten ändern (F-001), Mitglieder entfernen, Platzhalter verwalten (F-007), Einladungslink neu erzeugen (alter Link wird ungültig), Beitritt sperren/öffnen, Abstimmung erstellen/schließen (F-010, F-012), Organisatorrolle an ein anderes Mitglied übergeben, Reise löschen (F-013).
- [ ] Mitglieder können: eigene Verfügbarkeit bearbeiten, abstimmen, eigenen Anzeigenamen in der Reise ändern, Reise verlassen, alles Gemeinsame ansehen (Abstimmungsergebnisse gemäß F-011), **den Einladungslink teilen, solange der Beitritt offen ist** (Q13 b, F-002).
- [ ] Entfernen eines Mitglieds entfernt dessen Verfügbarkeit und Stimmen nach Bestätigungsdialog; Berechnung aktualisiert sich; die Person kann nur über einen (ggf. neuen) Einladungslink erneut beitreten.
- [ ] Organisator-Aktionen sind serverseitig über Konto + Rolle abgesichert (nicht nur UI ausgeblendet).
- [ ] Verliert ein Mitglied den Zugang, erfolgt die Wiederherstellung über das Konto (F-042) – der Organisator muss nichts tun.

### F-005 Verfügbarkeit manuell angeben
**Als** Mitreisender **möchte ich** schnell auf einem Kalender antippen, wann ich kann und wann nicht, **damit** meine Verfügbarkeit ohne Kalender-Anbindung erfasst ist.

Hinweis: Im MVP der **einzige** Weg zur Verfügbarkeit (Q1) – Geschwindigkeit der Eingabe hat daher hohe Priorität für UI/UX.

Akzeptanzkriterien:
- [ ] Monatsansicht des Suchzeitraums mit Wochenstart gemäß Region (F-046); Tage außerhalb sind nicht wählbar; Wochenenden und Feiertage sichtbar (F-016).
- [ ] Drei Zustände pro Tag: `geht` (Standard), `ginge zur Not`, `geht nicht`; Werkzeugwahl (Pinsel-Prinzip) und dann Tippen oder Ziehen/Wischen über mehrere Tage; Bereichsauswahl „von–bis“ als barrierefreie Alternative.
- [ ] Schnellaktionen: „alle Werktage Mo–Fr als ‚ginge zur Not‘“, „Feiertage meiner Region als ‚geht‘ belassen/markieren“, „alles zurücksetzen“.
- [ ] Zustände sind nicht nur farblich, sondern auch per Symbol/Muster unterscheidbar.
- [ ] Button „Fertig – Verfügbarkeit abgeben“ setzt den Status *abgegeben* (F-007); spätere Änderungen sind jederzeit möglich und wirken sofort.
- [ ] Optionaler Kommentar pro Mitglied (≤ 200 Zeichen, z. B. „Juli nur mit Kindern“).
- [ ] Auf 360 px Breite ohne horizontales Scrollen bedienbar; Speichern < 1 s spürbar (optimistisches UI).
- [ ] Kurze Feedback-Frage nach Abgabe (einmalig, überspringbar): „Hättest du lieber deinen Kalender importiert? Welchen? (Apple/iCloud, Google, Outlook, anderer)“ – dient der Priorisierung in v1 (A3, A7).

### F-007 Teilnahmestatus & Platzhalter
**Als** Organisatorin **möchte ich** sehen, wer seine Verfügbarkeit schon abgegeben hat, **damit** ich weiß, auf wen wir warten.

Akzeptanzkriterien:
- [ ] Mitgliederliste mit Status: `beigetreten – noch nicht abgegeben`, `abgegeben` (mit Datum der letzten Änderung), später `abgestimmt` (F-011).
- [ ] Fortschrittsanzeige „5 von 7 haben abgegeben“ für alle Mitglieder sichtbar.
- [ ] Organisator kann erwartete, noch nicht beigetretene Personen als Platzhalter anlegen (Name), damit „fehlt noch“ sichtbar ist. Je Platzhalter gibt es einen eigenen Einladungslink; wer darüber beitritt (mit Konto, F-003), übernimmt den Platzhalter. Platzhalter zählen zur Obergrenze von 30.

### F-008 Gemeinsamer Kalender (Heatmap)
**Als** Mitglied **möchte ich** auf einen Blick sehen, wann wie viele aus der Gruppe können, **damit** klar ist, wo ein Urlaub realistisch ist.

Akzeptanzkriterien:
- [ ] Kalenderansicht des Suchzeitraums (Wochenstart/Datumsformat gemäß F-046); jeder Tag zeigt **„x/n“** und eine Farbintensität entsprechend dem Anteil; `ginge zur Not` zählt halb in der Intensität und wird separat ausgewiesen.
- [ ] **Zählregel (präzisiert, U-4):** **x = Anzahl Mitglieder mit `geht`** an diesem Tag, **n = Anzahl Mitglieder, die abgegeben haben**. `ginge zur Not` zählt **nicht** in x. Nicht abgegebene Mitglieder zählen weder in x noch in n. Mobil: „x/n“ solange n ≤ 9, ab 10 nur „x“ (n steht im Statusband).
- [ ] **✓ nur, wenn alle `geht` haben (x = n, n ≥ 1).** **◐** markiert Tage, an denen mindestens eine Person `ginge zur Not` hat (ab 600 px mit Anzahl, z. B. „◐2“); ein Tag ohne `geht nicht`, an dem jemand nur `ginge zur Not` hat, zeigt also ◐ statt ✓. ✓ und ◐ schließen sich aus (Details ux-spec §4.9). Symbole ergänzen die Farbe (nicht nur Farbkodierung).
- [ ] Zugänglicher Name je Tag, z. B. „4 von 5 Geht, 1 Zur Not“ bzw. „5 von 5 Geht – alle“; Legende „4/5 = 4 von 5 haben ‚Geht‘ · ✓ Alle: Geht · ◐ Jemand nur ‚Zur Not‘“.
- [ ] Hinweis zur Abgrenzung: Ein Tag mit ◐ verhindert **keinen** Kandidaten in „Alle dabei“ (F-009) – dort zählt nur das Fehlen von `geht nicht`.
- [ ] Antippen eines Tages zeigt, wer kann / zur Not / nicht kann (Namen, keine Gründe außer freiwilligem Kommentar).
- [ ] Filter: „Person X ausblenden“ (Was-wäre-wenn), wirkt nur lokal auf die Ansicht und die Berechnung (F-009) für den Betrachter.
- [ ] Hinweisbanner, solange nicht alle abgegeben haben: „Noch offen: Kemal, Sara – Ergebnis kann sich ändern“.
- [ ] Ansicht aktualisiert sich bei Neuladen; Live-Update ist nicht erforderlich.

### F-009 Kandidaten-Zeiträume berechnen
**Als** Organisatorin **möchte ich** automatisch die besten möglichen Reisezeiträume vorgeschlagen bekommen, **damit** ich sie nicht selbst aus dem Kalender herauslesen muss.

Akzeptanzkriterien:
- [ ] Eingaben: Suchzeitraum, Mindestdauer *m* Nächte, Wunschdauer *w* (Standard = *m*), Toleranz *k* fehlende Personen (Standard 1, einstellbar 0–3), nur abgegebene Mitglieder.
- [ ] Ein Fenster aus *d* Nächten belegt *d+1* aufeinanderfolgende Tage. Ein Mitglied **kann** ein Fenster, wenn keiner der Tage `geht nicht` ist.
- [ ] Gruppe **„Alle dabei“ / „Everyone's in“** (UI-Name, U-14; fachlich „alle können“): alle Fenster mit Länge ≥ *m*, in denen alle Mitglieder können (kein `geht nicht`; `ginge zur Not` ist erlaubt und wird als Chip „◐ 2× zur Not“ ausgewiesen). Überlappende Fenster werden zu **maximalen Zeitspannen** zusammengefasst und angezeigt als „<Start>–<Ende>: bis zu X Nächte möglich“.
- [ ] Gruppe **„Fast alle dabei“ / „Almost everyone's in“**: Fenster, in denen 1 bis *k* Personen nicht können; die fehlenden Personen werden namentlich genannt („8 können · ohne Kemal“).
- [ ] Das Wort „können“ / „can make it“ wird in der UI nur in Options-/Verfügbarkeitszeilen verwendet (Glossar: „kein ‚Geht nicht‘ im Zeitraum“).
- [ ] Sortierung je Liste: (1) weniger Fehlende, (2) weniger `ginge zur Not`-Personentage, (3) maximale Länge näher an bzw. ≥ Wunschdauer, (4) früheres Startdatum.
- [ ] Gibt es keine Treffer, zeigt die App einen konkreten Hinweis (z. B. „Mit 5 statt 7 Nächten gäbe es 3 Optionen“ / „Toleranz auf 1 erhöhen“).
- [ ] Berechnung ist deterministisch, testbar (reine Funktion), unabhängig von Sprache/Region des Betrachters und für 30 Mitglieder × 365 Tage < 500 ms.
- [ ] Testfälle (für Entwicklung/Review) decken ab: Fenster an den Rändern des Suchzeitraums, Mindestdauer = Suchzeitraum − 1, niemand hat abgegeben, ein Mitglied blockiert alles, Gleichstand in der Sortierung, 30 Mitglieder.

### F-010 Abstimmung erstellen
**Als** Organisatorin **möchte ich** aus den Vorschlägen eine Abstimmung starten, **damit** die Gruppe gemeinsam entscheidet.

Akzeptanzkriterien:
- [ ] Organisator wählt 2–6 Optionen; jede Option ist ein konkreter Zeitraum (Anreise- und Abreisedatum). Vorauswahl: die Top-3 aus F-009, als konkrete Zeiträume in Wunschdauer.
- [ ] Optionen können auch manuell im Kalender gewählt werden (Warnhinweis, wenn Personen an diesen Tagen nicht können).
- [ ] Mit Start der Abstimmung wird der Teilen-Text „Abstimmung läuft: <Link>“ angeboten (F-002); es wird **keine** E-Mail versendet (E-Mail-Benachrichtigungen erst v1, F-014).
- [ ] In „Meine Reisen“ (F-044) erscheint bei allen Mitgliedern das To-do „Abstimmen“.
- [ ] Pro Reise ist höchstens eine Abstimmung gleichzeitig offen; Optionen können nach Start nur hinzugefügt, nicht geändert werden (bestehende Stimmen bleiben gültig).
- [ ] Jede Option zeigt, wer laut Verfügbarkeit kann/nicht kann.

### F-011 Abstimmen (Ja / Vielleicht / Nein)
**Als** Mitglied **möchte ich** zu jedem Vorschlag Ja, Vielleicht oder Nein sagen, **damit** meine Präferenz zählt, auch wenn ich mehreres kann.

Akzeptanzkriterien:
- [ ] Pro Option genau eine Stimme: `Ja`, `Vielleicht`, `Nein`; Vorbelegung aus der Verfügbarkeit (`geht nicht` an einem Tag → `Nein`, `ginge zur Not` → `Vielleicht`, sonst keine Vorbelegung) – Vorbelegung ist sichtbar als Vorschlag und muss bestätigt werden.
- [ ] **Ergebnis-Sichtbarkeit (Q13 a):** Ergebnis und Stimmen einer Option (Zählung und Namen) sieht ein Mitglied **erst, nachdem es selbst zu dieser Option abgestimmt hat** (je Option, nicht erst nach allen Optionen). Vorher steht dort der Platzhalter „Stimm ab, um das Ergebnis zu sehen.“ / „Vote to see the results.“ Ziel: unbeeinflusste Stimmabgabe, kein Mitläufer-Effekt.
- [ ] **Die Orga sieht immer alles** – alle Ergebnisse und Stimmen, unabhängig von der eigenen Stimme (braucht den Überblick zum Nachfassen und Abschließen, F-012).
- [ ] Die Sichtbarkeitsregel wird **serverseitig** durchgesetzt (Ergebnisdaten werden vor der eigenen Stimme nicht ausgeliefert, nicht nur ausgeblendet). Der Teilnahmestatus „abgestimmt“ (F-007) ist unabhängig davon für alle sichtbar.
- [ ] Nach der eigenen Stimme sind Stimmen namentlich sichtbar (Transparenz wie bei Doodle). Nach Festlegung (F-012) sehen alle Mitglieder das vollständige Ergebnis.
- [ ] Ergebnisanzeige: pro Option Anzahl Ja / Vielleicht / Nein, Rang nach (1) Ja, (2) Vielleicht, (3) wenigsten Nein; Option mit Nein einer Person ist als „ohne <Name>“ gekennzeichnet.
- [ ] Stimmen sind bis zum Abschluss änderbar.
- [ ] Status „abgestimmt“ erscheint in der Mitgliederliste (F-007).

### F-012 Ergebnis festlegen & verkünden
**Als** Organisatorin **möchte ich** die Abstimmung abschließen und den Zeitraum festlegen, **damit** alle Klarheit haben und buchen können.

Akzeptanzkriterien:
- [ ] Organisator schließt die Abstimmung und wählt die Gewinner-Option; die App schlägt die bestplatzierte vor, bei Gleichstand muss er aktiv wählen.
- [ ] Abschluss ist auch möglich, wenn nicht alle abgestimmt haben (Bestätigungsdialog mit Namen der Fehlenden).
- [ ] Nach Festlegung zeigt die Reise prominent „Es geht los: <Datum>–<Datum>“ (in der Sprache/im Format des Betrachters); Abstimmen und Verfügbarkeitsänderungen sind gesperrt (Verfügbarkeit wird schreibgeschützt).
- [ ] „Zum Kalender hinzufügen“: ICS-Download (ganztägiger Termin, An- bis Abreisetag; funktioniert auf iPhone/Apple-Kalender, Outlook, Google) sowie Google-Kalender-Link.
- [ ] Teilen-Text „Fix: Wir fahren vom … bis …!“ wird angeboten (keine E-Mail im MVP).
- [ ] Organisator kann die Festlegung wieder aufheben (Abstimmung wird wieder geöffnet, Stimmen bleiben erhalten). Das Aufheben ist bewusst ruhig (kein „Rückwärts-Konfetti“, W11-07).
- [ ] **Feier „Es geht los!“ für alle (Q17 b, Motion W11-02):** Die Orga sieht die Feier direkt nach der Bestätigung; **jedes andere Mitglied beim ersten Öffnen der Reise nach der Festlegung** (auch über das Konflikt-Banner, W14-03) – **einmal pro Person und Reise, geräteübergreifend** (serverseitig je Mitgliedschaft gemerkt, nicht nur im Browser). Spätere Besuche zeigen die Ergebnis-Karte statisch (W11-04). Wird die Festlegung aufgehoben und ein **anderer** Zeitraum festgelegt, gibt es die Feier erneut (PM-Annahme, Bestätigung durch CEO offen); bei erneuter Festlegung desselben Zeitraums nicht.
- [ ] Ablauf: Siegel, Kalenderblatt, Konfetti (mobil ≤ 60, Desktop ≤ 100 Teilchen) in Farben/Formen der Design-Richtung; **spätestens nach 2,6 s vorbei**; jede Berührung/jedes Scrollen beendet das Konfetti sofort. Überschrift „Es geht los!“, Datum und Buttons sind **spätestens nach 120 ms lesbar und bedienbar** – nichts wartet auf die Animation. Der Fokus liegt sofort auf der Überschrift „Es geht los!“ (Screenreader hören zuerst das Ergebnis). Die Konfetti-Ebene ist `aria-hidden` und fängt keine Eingaben ab (`pointer-events: none`).
- [ ] **Reduzierte Bewegung** (`prefers-reduced-motion: reduce` oder Konto-Schalter, F-052): kein Konfetti, keine Skalierung/Drehung; Ergebnis-Karte und Siegel erscheinen per kurzem Überblenden (≤ 140 ms). Der Text „Es geht los!“ trägt den Moment; die Feier gilt trotzdem als „gesehen“.
- [ ] **Haptik** (Q17 c): Beim Erscheinen des Siegels kurze Vibration auf Android, nur wenn verfügbar (best effort, iOS: nie), aus bei reduzierter Bewegung; **kein Ton**.
- [ ] Die Feier verzögert weder das Speichern der Festlegung noch die Seiten-Interaktivität; Konfetti-Code wird erst bei Bedarf geladen (F-052).

### F-013 Datenschutz: Reise verlassen/löschen & Aufbewahrung
**Als** Mitglied **möchte ich** meine Daten aus einer Reise löschen können und wissen, dass nichts ewig gespeichert wird, **damit** ich der App vertraue.

Akzeptanzkriterien:
- [ ] Mitglied kann „Reise verlassen & meine Daten in dieser Reise löschen“ – entfernt Mitgliedschaft, Verfügbarkeit, Stimmen, Kommentar sofort (das Konto bleibt bestehen; Konto löschen siehe F-043). Der Organisator muss vorher die Rolle übergeben oder die Reise löschen.
- [ ] Organisator kann die Reise vollständig löschen (Bestätigung durch Eintippen des Reisenamens).
- [ ] Automatische Löschung von Reisen: 90 Tage nach dem festgelegten Reiseende bzw. 12 Monate nach letzter Aktivität; der Organisator erhält 14 Tage vorher eine Hinweis-Transaktionsmail (Servicehinweis, keine Ereignis-Benachrichtigung) und sieht einen Banner in „Meine Reisen“.
- [ ] Datenschutzhinweis kurz und verständlich (DE/EN) auf Registrierungs- und Beitrittsseite verlinkt.
- [ ] Keine Third-Party-Tracker, keine Werbe-Cookies; nur technisch notwendige Cookies (Session, Sprache) – kein Cookie-Banner nötig.

### F-016 Feiertage & Wochenenden einblenden
**Als** Berufstätiger **möchte ich** Wochenenden und Feiertage im Kalender sehen, **damit** wir Zeiträume mit wenigen Urlaubstagen erkennen.

Hochgestuft zu **Must** (Q5: DE + EN ab MVP).

Akzeptanzkriterien:
- [ ] Wochenenden optisch hervorgehoben (Sa/So; Wochenstart gemäß F-046).
- [ ] Gesetzliche Feiertage für: **Deutschland** (bundesweit + alle 16 Bundesländer), **Österreich**, **Schweiz** (bundesweit + Kantone, soweit Bibliothek zuverlässig), **Vereinigtes Königreich** (England & Wales, Schottland, Nordirland – „bank holidays“) und **USA** (Federal Holidays). Feiertagsnamen in der Sprache des Betrachters, soweit verfügbar.
- [ ] Begründete Lösung: Datenquelle ist eine gepflegte Open-Source-Feiertagsbibliothek (z. B. `date-holidays`) statt eigener Pflege; freigegeben werden nur die oben genannten, getesteten Regionen; weitere Regionen sind ohne Code-Änderung zuschaltbar (Konfiguration). Auswahl → Operations/Developer.
- [ ] Region pro Mitglied (aus Konto, F-043), Standard für die Reise vom Organisator; jedes Mitglied sieht seine eigenen Feiertage, optional zusätzlich die der Reise.
- [ ] Bei Kandidaten (F-009) wird „benötigt ca. X Urlaubstage“ angezeigt (Werktage Mo–Fr minus Feiertage des Betrachters).

### F-051 Hilfe-/FAQ-Seite
**Als** eingeladene Person, deren Code nicht ankommt oder die nicht weiterweiß, **möchte ich** auf jeder Seite an derselben Stelle eine kurze Hilfe finden, **damit** ich ohne Rückfrage im Gruppenchat weiterkomme und nicht abbreche.

Neu in v0.3 (Q13 e, Auftraggeber bestätigt 2026-10-08). Wireframe: [W15](../ux/wireframes/15-hilfe.md); Routen `/de/hilfe`, `/en/help`.

**Prio Must – Begründung:** (1) Vom Auftraggeber ausdrücklich fürs MVP bestätigt (Q13 e). (2) Sie federt das größte MVP-Risiko ab – die Kontopflicht mit Code per Mail (Spam, In-App-Browser, Link verloren) – und stützt damit die Beitrittsquote ≥ 65 % (PRD §4, A2). (3) Sie ist die konsistente Hilfe für WCAG 2.2 SC 3.2.6 (PRD §8). (4) Aufwand gering: statische, übersetzte Inhalte ohne Backend.

Akzeptanzkriterien:
- [ ] Öffentliche, statische Seite in DE und EN (`/de/hilfe`, `/en/help`, `hreflang` de/en), ohne Login erreichbar und indexierbar; Produktname sprachabhängig (F-046).
- [ ] **Konsistente Erreichbarkeit:** Link „Hilfe“ / „Help“ im Footer jeder Seite und im Avatar-Menü (angemeldet), jeweils an gleicher Position und in gleicher Reihenfolge (SC 3.2.6); zusätzlich kontextueller Hinweis „Noch nichts da?“ im Code-Schritt (F-040/F-041), der direkt zur Frage „Mein Code kommt nicht an“ springt.
- [ ] Mindestens diese Fragen mit kurzen Antworten (Ton gemäß ux-spec §10.1):
  - Mein Code kommt nicht an (Spam/Werbung prüfen, Adresse prüfen, nach 30 s neu anfordern – nur der neueste Code gilt, Absenderadresse nennen);
  - Ich habe den Einladungslink verloren (im Gruppenchat fragen; Mitglieder melden sich an → „Meine Reisen“, mit Button „Anmelden“);
  - Ich habe die Seite in WhatsApp/Instagram geöffnet (funktioniert; Code im selben Fenster eingeben; später im Browser mit E-Mail anmelden);
  - Wie ändere ich meine Tage? (Tab „Meine Tage“, wirkt sofort, nach Festlegung gesperrt);
  - Wie stimme ich ab? (Ja/Vielleicht/Nein je Zeitraum, bis zum Abschluss änderbar; Ergebnis nach eigener Stimme sichtbar, F-011);
  - Wer sieht meine Angaben? (nur Mitglieder der Reise; keine Gründe, nur freiwilliger Kommentar);
  - Wie lösche ich meine Daten? (Reise verlassen F-013 oder Konto löschen F-043);
  - Kein Zugriff mehr auf meine E-Mail? (Kontakt schreiben; alternativ neues Konto und erneut beitreten).
- [ ] Jede Frage als aufklappbares Element (`<details>`/`<summary>`, Zielgröße ≥ 44 px) mit **Sprunganker** (z. B. `/de/hilfe#code`); per Anker aufgerufen ist die Frage aufgeklappt und der Fokus liegt auf ihrer Überschrift.
- [ ] Abschnitt „Noch Fragen?“ mit Kontaktadresse als `mailto`-Link (Adresse von Operations; in der Offline-Demo Platzhalter).
- [ ] Mobil ab 360 px ohne horizontales Scrollen, Desktop einspaltig (max. 640 px); Text bis 200 % ohne Funktionsverlust; Dark Mode gemäß System.
- [ ] Nicht im MVP: Suche, Kontaktformular, Chat-Support.
- [ ] Inhalte bleiben mit dem tatsächlichen Verhalten konsistent (Reviewer prüft beide Sprachen vor M1/M2).

### F-052 Bewegung, Animationen & Haptik (Querschnitt)
**Als** Mitglied **möchte ich**, dass die App auf meine Eingaben sofort und lebendig reagiert und wichtige Momente spürbar macht – und Bewegung jederzeit dämpfen kann –, **damit** Planen Spaß macht, ohne mich aufzuhalten, abzulenken oder mir unwohl zu machen.

Neu in v0.4 (Q17 a–c, Q18: „ansprechende App, die Spaß macht, mit Animationen/Motion Graphics“). Querschnitts-Feature: Es liefert die **Motion-Basis** (Tokens, Helfer, Reduced-Motion-Mechanik, Schalter) und die **Regeln**; die einzelnen Bewegungen werden **mit dem jeweiligen Feature** gebaut und abgenommen. Detailkatalog mit IDs (G-xx, Wnn-xx), Dauer, Easing, Reduced-Variante und Priorität: [docs/motion/interaktionen.md](../motion/interaktionen.md); System/Tokens: [docs/motion/motion-system.md](../motion/motion-system.md).

**Prio Must (Basis) – Begründung:** (1) Auftraggeber wünscht ausdrücklich eine App mit Animationen, die Spaß macht (Q18). (2) Reduced Motion und der Schalter sind Barrierefreiheits-Pflicht (WCAG 2.2 AA, PRD §8) – ohne sie dürfte keine Animation live gehen. (3) Basis vor Inkrement 1 ist billiger als Nachrüsten in allen Ansichten.

**Umfang nach Motion-Priorität** (Spalte „Prio“ in interaktionen.md):
| Motion-Prio | Bedeutung | Phase |
|---|---|---|
| **MVP** | wird mit dem jeweiligen Feature gebaut, Teil von dessen Abnahme (Feature-Index interaktionen §3) – inkl. der fünf Kernmomente: Tage malen (W08), Heatmap/Vorschlag-Band (W09-05/-06), Stimme/Ergebnis (W10-04/-05), Feier „Es geht los!“ (W11-02, F-012), Code richtig/„Du bist dabei!“ (W02-05, W03-06) | MVP (bis M0.5) |
| **MVP+** | wenn Kapazität, spätestens vor der Beta (M1); u. a. Hero-Illustration Landing, Fortschrittsbalken, Hover, **Haptik G-18** | MVP vor M1 |
| **später** | nach dem MVP-Launch (z. B. View Transitions, Mini-Demos Landing, Konfetti-Easter-Egg) | v1/später |

Akzeptanzkriterien:
- [ ] **Motion-Basis** vorhanden (UI-Fundament, roadmap.md): Motion-Tokens in `tokens.css`, kleine eigene Hilfsdatei (motion-system §8, z. B. `prefersReducedMotion()`, `animateIfAllowed()`), Reduced-Motion-Mechanik; **keine Animationsbibliothek im MVP** (Lottie/Rive ausgeschlossen).
- [ ] **Zustand sofort, Bewegung als Ausklang:** Jede Eingabe ändert Zustand/Text/Symbol im selben Frame; sichtbares Feedback ≤ 100 ms nach Tipp. Kein Inhalt, Text oder Button wartet auf eine Animation; Navigation und Speichern werden durch Animationen nie verzögert.
- [ ] **Fokus** springt nie durch Animationen und wird synchron gesetzt (z. B. Code-Feld, Ergebnis-Überschrift); Sheets/Dialoge geben den Fokus an den Auslöser zurück.
- [ ] **Reduzierte Bewegung:** Bei `prefers-reduced-motion: reduce` **oder** eingeschaltetem Konto-Schalter verhält sich jede Animation gemäß Spalte „Reduziert“ in interaktionen.md (in der Regel kurzes Überblenden ≤ 140 ms oder sofort): keine Skalierung, kein Gleiten über Strecken, kein Konfetti, keine Wellen/Staffeln, kein Wackeln, kein Smooth-Scroll, keine Parallax, keine Haptik. **Bedienfunktionen bleiben erhalten** (z. B. Auto-Scroll beim Ziehen am Rand, W08-12).
- [ ] **Schalter „Bewegung reduzieren“ / „Reduce motion“ (Q17 a)** in den Kontoeinstellungen, Abschnitt „Darstellung“ (F-043, W13-01):
  - Standard **aus** = der Systemeinstellung folgen. **An** = reduzierte Bewegung unabhängig vom System. Der Schalter kann Bewegung nur **reduzieren**, nie gegen eine System-Reduktion erzwingen.
  - Wirkt **sofort** ohne Neuladen; gespeichert im Konto (gilt geräteübergreifend nach Login) und zusätzlich lokal im Browser, damit schon der erste Frame nach dem Laden korrekt ist (kein kurzes Aufflackern von Animationen).
  - Nicht angemeldete Personen (Landing, Einladungs-Vorschau, Login) folgen der Systemeinstellung bzw. der lokal gespeicherten Wahl.
  - Echter Schalter (`role="switch"`, Beschriftung DE/EN, kurzer Hilfetext „Weniger Animationen, kein Konfetti, keine Vibration.“), per Tastatur bedienbar; Hilfe-Seite (F-051) erwähnt ihn.
- [ ] **Haptik (Q17 c):** Dezente Vibration nur auf Geräten mit Vibrations-API (in der Praxis Android; iOS: nie) und nur an zwei Stellen: Ziehen startet nach Halten (W08-02) und Siegel der Feier (W11-02, F-012). Kurz (≈ 10–60 ms), **best effort** (keine Funktion hängt davon ab, Fehler werden still ignoriert), **aus bei reduzierter Bewegung**. Die App gibt **nie Töne** aus.
- [ ] **Keine Dauerbewegung:** Nichts läuft automatisch länger als 5 s (Konfetti ≤ 2,6 s, Geste-Hinweis ≤ 3 s, Skelett max. 4 Zyklen, Caret max. 5 s); keine Endlosschleifen; nichts blinkt öfter als 3× pro Sekunde (WCAG 2.3.1); Zahlen zählen nicht hoch (G-16); Fristen pulsieren nicht (W10-10).
- [ ] **Performance:** Animationen nutzen nur `transform`/`opacity` (Ausnahme: Farbwechsel kleiner Elemente ≤ 140 ms); Ziel 60 fps auf Mittelklasse-Android im WhatsApp-In-App-Browser, keine Long Tasks > 50 ms während Ziehen/Feier (4× CPU-Drosselung); kein Layout-Shift durch Animationen; Landing/Hero-Text ist ohne Animation sofort da (LCP-Budget „erste Ansicht < 2 s auf 4G“, PRD §8 bleibt unverändert); Konfetti/Feier-Code wird erst bei Bedarf geladen.
- [ ] Moderne CSS-/Browser-Funktionen (z. B. `linear()`, `@starting-style`, Scroll-Timelines, View Transitions) nur als Progressive Enhancement – ohne Unterstützung funktioniert alles, nur ohne Bewegung.
- [ ] **Abnahme:** Reviewer prüft je Feature die Motion-IDs mit Prio „MVP“ und die Prüfliste interaktionen §4; ein automatischer Test mit `reducedMotion: 'reduce'` stellt sicher, dass keine Bewegungs-Animationen laufen, ein weiterer prüft den Konto-Schalter.
- [ ] Datensparsam: Die Einstellung ist ein einfaches Kontofeld; keine Erfassung, wer Animationen sieht oder abschaltet (höchstens aggregierter Anteil „Schalter an“, cookie-frei).

## SHOULD – MVP, wenn Zeit bleibt

### F-015 Nachzügler erinnern (Teilen-Text)
**Als** Organisatorin **möchte ich** säumige Mitglieder mit einem Klick erinnern, **damit** ich nicht selbst hinterherschreiben muss.

Akzeptanzkriterien:
- [ ] Button „Erinnern“ erzeugt einen Teilen-Text mit den Namen der Fehlenden zum Posten im Gruppenchat, z. B. „Kemal und Sara, ihr fehlt noch: <Link>“; Sprache umschaltbar (F-046). Wortlaut/Namensregeln (Aufzählung, ab 5 Namen „und 3 weitere“, ≤ 300 Zeichen inkl. Link) gemäß ux-spec §10.
- [ ] **Kein „@“ vor Namen** (bestätigte UX-Abweichung): Über Teilen-Links erzeugt „@“ in WhatsApp keine echte Erwähnung und wirkt dadurch falsch; wer erwähnen will, kann den Text vor dem Senden bearbeiten.
- [ ] Keine E-Mail im MVP; Erinnerungs-E-Mails folgen mit F-014 (v1).
- [ ] Säumige sehen beim nächsten Besuch das To-do in „Meine Reisen“ (F-044).

**Umsetzungsstand (2026-10-22):** In **Feedback-Runde 1** (ux-spec §14.2, PR #22) vorgezogen und erweitert gebaut: `RemindSheet` (Status · einzeln · alle · Orga), Erinnern für **alle Mitglieder** (nicht nur Orga), WhatsApp als primärer Kanal, Platzhalter-Hinweise, „{Orga} Bescheid geben“. Damit sind die Kriterien oben inhaltlich erfüllt → **Reviewer bestätigt die Abnahme beim nächsten Review** (kein eigenes Inkrement mehr). **Bewusst später (MVP+, CEO-Entscheidung 2026-10-20):** „zuletzt erinnert“ (`reminded_at`, ux-spec §14.2) – nach Beta-Feedback. In Phase 3 nutzt das Cockpit dasselbe `RemindSheet` mit neuen Anlässen (W16 v2.8).

### F-017 Abstimmungsfrist
**Als** Organisatorin **möchte ich** eine Frist setzen, **damit** die Entscheidung nicht ewig offen bleibt.

Akzeptanzkriterien:
- [ ] Optionales Fristdatum für Verfügbarkeitsabgabe und für Abstimmung; Anzeige „noch 3 Tage“; Frist wird in Teilen-Texte übernommen.
- [ ] Nach Fristablauf wird nicht automatisch entschieden; der Organisator wird per Banner in der Reise und in „Meine Reisen“ aufgefordert, abzuschließen (E-Mail erst mit F-014).

**Umsetzungsstand (2026-10-22):** Gebaut in Inkrement 5 und Feedback-Runde 1: beide Fristen (`deadline` Eintragen, `pollDeadline` Abstimmung), Anzeige in Übersicht/Abstimmen/„Meine Reisen“, Frist in Teilen- und Erinnerungstexten, „Frist vorbei“-Zustände im Nächster-Schritt (N1-1/-7/-10, N2-1/-2/-7/-10), Banner im Tab Abstimmen, To-do „Termin festlegen“ in „Meine Reisen“ nach Ablauf der **Abstimmungs**frist, R-040 (abgelaufene Frist blockiert Bearbeiten nicht). **Rest (klein, „Pflege-Paket“ neben Inkrement 8, s. roadmap.md):**
- [ ] „Meine Reisen“: Nach Ablauf der **Eintrage**-Frist sieht die Orga auf der Reisekarte ein To-do «Abstimmung starten» (heute nur, wenn alle eingetragen haben) – analog `fixDates` bei der Abstimmungsfrist.
- Anzeige „noch 3 Tage“: im Tab Abstimmen vorhanden (Kennzahl-Kachel, ux-spec §9); an anderen Stellen genügt das Datum bzw. „Frist vorbei“ – Kriterium gilt als erfüllt.

## COULD – v1

### F-006 Kalender-Import per ICS (Datei/URL, einmalig) – verschoben aus MVP
**Als** Mitreisender mit vollem Kalender **möchte ich** meine Termine importieren, **damit** ich nichts abtippen muss – ohne Details preiszugeben.

Phase v1.0, gemeinsam mit F-047 (Apple-Weg). Akzeptanzkriterien unverändert gegenüber v0.1, ergänzt um Apple-Bezug:
- [ ] Zwei Wege: ICS-Datei hochladen (≤ 5 MB) oder ICS/iCal-URL einfügen (z. B. Google „Geheime Adresse im iCal-Format“, Outlook „Kalender veröffentlichen“, iCloud „Öffentlicher Kalender“ – Details F-047). `webcal://`-Adressen werden akzeptiert und als `https://` abgerufen.
- [ ] Je Anbieter (Google, Outlook/Microsoft 365, Apple iCloud) gibt es eine kurze Schritt-für-Schritt-Anleitung in DE/EN; für Apple siehe F-047.
- [ ] Ausgewertet werden nur Termine im Suchzeitraum; wiederkehrende Termine (RRULE inkl. Ausnahmen) werden korrekt expandiert; Termine mit `TRANSP:TRANSPARENT` bzw. Status „frei“ und abgesagte Termine werden ignoriert.
- [ ] Ableitungsregel (Standard): ganztägiger oder ≥ 4 h belegter Tag → Vorschlag `geht nicht`; kürzere Termine → Tag bleibt `geht` (konfigurierbar: „kurze Termine als ‚ginge zur Not‘ werten“).
- [ ] Vor der Übernahme zeigt eine **Vorschau** die betroffenen Tage (ohne Termintitel); einzelne Tage können vor dem Übernehmen abgewählt werden.
- [ ] Übernahme überschreibt nur Tage, die der Nutzer nicht bereits manuell gesetzt hat (manuelle Eingabe hat Vorrang), sofern nicht „alles ersetzen“ gewählt wird.
- [ ] **Datenschutz:** Gespeichert werden ausschließlich Datum + Tageszustand. Termintitel, Orte, Beschreibungen, Teilnehmer und die Datei/URL werden nicht persistiert und nicht geloggt. Hinweistext erklärt das vor dem Import.
- [ ] Fehlerfälle (ungültige Datei, URL nicht erreichbar/Timeout 10 s, kein ICS-Inhalt) liefern verständliche Meldungen; nur `https`/`webcal`-URLs, Schutz gegen SSRF (keine internen Adressen).
- [ ] Mehrere Kalender nacheinander importierbar (z. B. Job + privat); Ergebnisse werden vereinigt.

### F-047 Apple-/iOS-Kalender Stufe 1: iCloud-Kalenderlink & Mac-Export mit iOS-Assistent
**Als** iPhone-Nutzer **möchte ich** meinen Apple-Kalender ohne Fachwissen importieren, **damit** ich nicht abtippen muss, obwohl Apple keine „Mit Apple verbinden“-Anmeldung für Kalender anbietet.

Phase **v1.0** (gleichzeitig mit F-006, baut auf dessen Import-Engine auf). Hintergrund: iCloud bietet kein OAuth für Kalender; eine Web-App/PWA kann auf iOS nicht auf den Gerätekalender zugreifen. Der einzige Weg ohne native App und ohne Passwort ist ein von iCloud erzeugter Kalenderlink bzw. ein Datei-Export vom Mac.

Akzeptanzkriterien:
- [ ] Auf iPhone/iPad (User-Agent bzw. Auswahl „Ich nutze den Apple-Kalender“) wird ein eigener **Apple-Assistent** angezeigt, Schritt für Schritt mit Screenshots (DE/EN): Kalender-App → „Kalender“ → (i) beim gewünschten iCloud-Kalender → „Öffentlicher Kalender“ aktivieren → „Link teilen“ → „Kopieren“ → zurück zur App → Einfügen. Variante für iCloud.com und für die Kalender-App auf dem Mac.
- [ ] Mac-Variante: Export als `.ics`-Datei („Ablage → Exportieren“) und Upload über F-006.
- [ ] Eingefügte `webcal://p…-caldav.icloud.com/…`-Links werden erkannt, als Apple-Kalender gekennzeichnet und wie F-006 einmalig verarbeitet (Vorschau, nur frei/belegt, keine Speicherung der URL).
- [ ] **Datenschutzhinweis vor und nach dem Import:** Ein öffentlicher iCloud-Kalender ist für jeden mit dem Link einsehbar (inkl. Termindetails). Nach erfolgreichem Import fordert die App ausdrücklich auf, „Öffentlicher Kalender“ wieder zu deaktivieren (mit Anleitung); für dauerhafte Aktualisierung wird auf F-048 verwiesen.
- [ ] Hinweis auf Grenzen: Nur iCloud-Kalender lassen sich so teilen; auf dem iPhone eingebundene Google-/Exchange-Kalender bitte über deren eigene Anleitung (F-006) oder später F-049.
- [ ] Mehrere iCloud-Kalender nacheinander importierbar (z. B. „Privat“, „Familie“).
- [ ] Messung (aggregiert): Start des Apple-Assistenten → erfolgreicher Import; Ziel ≥ 60 % Abschluss.

### F-048 Apple-/iOS-Kalender Stufe 2: iCloud-CalDAV-Anbindung
**Als** iPhone-Nutzer **möchte ich** meinen iCloud-Kalender direkt verbinden, ohne ihn öffentlich zu machen, **damit** meine Verfügbarkeit sicher und (optional) automatisch aktuell ist.

Phase **v1.1** (nach F-006/F-047; vor bzw. parallel zu F-020/F-021).

Akzeptanzkriterien:
- [ ] Verbindung über CalDAV (`caldav.icloud.com`) mit Apple-ID-E-Mail und **app-spezifischem Passwort** (Anleitung zur Erstellung unter account.apple.com, DE/EN); nie das Apple-ID-Hauptpasswort (Hinweis + Erkennung typischer Fehlversuche).
- [ ] Kalenderauswahl (Liste der iCloud-Kalender), Abfrage nur der Termine im Suchzeitraum; Auswertung nur Start/Ende/Transparenz → gleiche Ableitungsregeln und Vorschau wie F-006.
- [ ] Standard: **einmaliger Import**, Zugangsdaten werden nach dem Abruf verworfen. Optional „verbunden lassen und täglich aktualisieren“ (Sync-Logik wie F-019): app-spezifisches Passwort verschlüsselt gespeichert, jederzeit trennbar; Sync endet mit Festlegung des Ergebnisses; Hinweis, dass das Passwort bei Apple widerrufen werden kann.
- [ ] Keine Termindetails gespeichert oder geloggt; Zugangsdaten nie im Klartext in Logs.
- [ ] Sicherheits-/Datenschutzprüfung durch Reviewer und Operations vor Release (Speicherung von Drittanbieter-Zugangsdaten).
- [ ] Tarif: einmaliger Import Free; dauerhafter Auto-Sync Premium-Kandidat (Q8).

### F-019 Kalender-Abo-Sync
**Als** Mitglied **möchte ich**, dass neue Kalendertermine automatisch berücksichtigt werden, **damit** meine Verfügbarkeit aktuell bleibt.
- [ ] Opt-in „URL merken und täglich aktualisieren“ (ICS-URLs aus F-006/F-047; CalDAV siehe F-048); URL wird verschlüsselt gespeichert, jederzeit entfernbar.
- [ ] Automatische Updates ändern nur importierte, nie manuell gesetzte Tage; Änderungen werden dem Mitglied angezeigt.
- [ ] Sync endet mit Festlegung des Ergebnisses.
- [ ] Bei Apple-Links: Hinweis, dass der Kalender dafür öffentlich bleiben muss – Empfehlung F-048 statt dauerhaft öffentlichem Link.
- [ ] Premium-Kandidat (Q8).

### F-020 Google-Kalender-Anbindung (OAuth)
**Als** Google-Nutzer **möchte ich** meinen Kalender mit einem Klick verbinden, **damit** ich keine iCal-Adresse suchen muss.
- [ ] OAuth mit minimalem Scope (`calendar.freebusy`, ggf. `calendar.calendarlist.readonly` zur Kalenderauswahl); Free/Busy-Abfrage für den Suchzeitraum.
- [ ] Gleiche Ableitungsregeln und Vorschau wie F-006; Token widerrufbar, Verbindung trennbar; Verbindung hängt am Konto (F-043) und wird bei Konto-Löschung widerrufen.
- [ ] Voraussetzung: abgeschlossene Google-App-Verifizierung (→ Operations).

### F-021 Microsoft-/Outlook-Anbindung (OAuth)
**Als** Outlook-Nutzer **möchte ich** meinen Kalender verbinden, **damit** auch mein Arbeitskalender berücksichtigt wird.
- [ ] Microsoft Graph mit `Calendars.ReadBasic`; nur Start/Ende/ShowAs werden gelesen.
- [ ] Bei Admin-Consent-Pflicht im Firmenkonto: verständlicher Hinweis + Fallback auf ICS-Anleitung.

### F-014 E-Mail-Benachrichtigungen (opt-in) – verschoben aus MVP
**Als** Mitglied **möchte ich** per E-Mail über wichtige Schritte informiert werden, **damit** ich nichts verpasse, ohne ständig nachzusehen.
- [ ] Opt-in pro Konto und pro Ereignistyp in den Kontoeinstellungen (E-Mail ist durch das Konto bereits verifiziert; kein separates Double-Opt-in nötig, aber ausdrückliche Einwilligung).
- [ ] Ereignisse: Organisator → „alle haben abgegeben“, „neues Mitglied“ (gebündelt max. 1×/Tag); Mitglieder → „Abstimmung gestartet“, „Ergebnis festgelegt“, Erinnerungen (F-015), Fristablauf (F-017).
- [ ] Jede E-Mail enthält einen Link zur Reise (Login per F-041) und einen Ein-Klick-Abmeldelink; Sprache gemäß Konto.
- [ ] Max. 1 E-Mail pro Ereignistyp pro Tag und Person; max. 1 Erinnerung pro Person und 48 h.

### F-045 Social Login (Sign in with Apple, Google)
**Als** Nutzer **möchte ich** mich mit meinem Apple- oder Google-Konto anmelden, **damit** ich gar keine E-Mail-Bestätigung abwarten muss.
- [ ] „Mit Apple anmelden“ (inkl. Unterstützung für „E-Mail-Adresse verbergen“-Relay-Adressen) und „Mit Google anmelden“ als zusätzliche Wege in F-040/F-041, auch im Einladungsflow.
- [ ] Verknüpfung mit bestehendem Konto bei gleicher verifizierter E-Mail nur nach Bestätigung; Trennen möglich, solange ein anderer Anmeldeweg existiert.
- [ ] Social Login gewährt **keinen** Kalenderzugriff (getrennt von F-020/F-048).

### F-022 Co-Organisatoren
- [ ] Organisator kann Mitglieder zu Co-Organisatoren mit gleichen Rechten (außer Reise löschen) machen. Premium-Kandidat.

### F-023 Pflicht- und optionale Teilnehmer
- [ ] Organisator markiert Mitglieder als „muss dabei sein“ (z. B. Geburtstagskind) oder „optional“; F-009 lässt nur optionale Mitglieder in die Toleranz *k* fallen. Premium-Kandidat.

### F-024 Urlaubstage-Optimierung
- [ ] Sortieroption „wenigste Urlaubstage“ für Kandidaten (nutzt F-016, alle Regionen inkl. UK/US); Hinweis auf Brückentage. Premium-Kandidat.

## AUSBAUSTUFE „Reise managen“ (nach „Termin finden“) – Planung 2026-10-20

**Auftraggeber-Wunsch (2026-10-20, sinngemäß):** Nach der Festlegung zeigt die Reise heute nur noch die Übersicht. Aus ihr heraus soll man künftig **die ganze Reise managen**: (1) Unterkünfte per Swipe, (2) Kosten teilen wie Tricount, (3) persönliche Reisedaten (z. B. Ausweisnummern) für die buchende Person – abgefragt **nach der Einigung auf den Zeitraum**, (4) Reiseunterlagen (Flugtickets, Aktivitäten-Tickets) für alle zugänglich.

**Status:** **Entschieden 2026-10-22** (Auftraggeber „Ja zu allem“: PRD §12 Q26–Q36, UX-1, UX-2, Cockpit-Layout Variante C, UX-8, UX-9). Alle Angaben unten mit „(Q…)“ gelten als entschieden. Umsetzung ab **Inkrement 8** (Zuschnitt R.6).

### R.0 Leitplanken der Ausbaustufe
1. **Alles hängt an der festgelegten Reise (Phase 3).** Die neuen Bereiche erscheinen erst, wenn ein Zeitraum feststeht (F-012). Wird die Festlegung aufgehoben, bleiben Unterkünfte, Ausgaben, Reisedaten und Unterlagen erhalten (Hinweis „Termin wird neu abgestimmt“); Fristen, die am Reiseende hängen, werden bei neuer Festlegung neu berechnet.
2. **Ein Hub, kein Menü-Labyrinth – ohne Tabs (UX-1).** Die Übersicht wird zum **Reise-Cockpit** (F-053) im Layout „Reiseverlauf“ (W16 v2): der **Weg** zeigt die Schritte der Reise als Stationen mit „Heute“ als einziger Stelle für „was tun“; Bereiche ohne Ende stehen als Kacheln „Immer griffbereit“ darunter. Jeder Bereich hat genau **einen** Einstieg (Station, solange er ein offenes Ende hat, sonst Kachel) und ist eine Unterseite eine Ebene tief.
3. **Mitmachen bleibt kostenlos** (Prinzip 2): Bewerten, Ausgaben eintragen, eigene Reisedaten freigeben und Unterlagen ansehen sind nie Premium.
4. **Sensible Daten nur mit Schutzpaket.** F-054 und F-055 dürfen mit **echten** Daten erst nach einem zusätzlichen Sicherheits-/Datenschutz-Gate **G1b** genutzt werden (roadmap.md). In Offline-Demo und privater Vorschau sind sie mit Fantasiedaten vorführbar (R.5).
5. **Wiederverwenden statt neu erfinden:** Sichtbarkeitsregel „Ergebnis erst nach eigener Bewertung“ (Q13 a), Teilen-Texte (F-002), Kennzahl-Muster des Cockpits (ux-spec §4.10), Motion-System (F-052).
6. **Kein Zahlungsverkehr, keine Buchung:** Die App zeigt, wer wem was schuldet, überweist aber nichts; sie verlinkt Unterkünfte, bucht aber nicht (bleibt Nicht-Ziel, PRD §7).

### R.1 Rollen & Rechte in der Ausbaustufe

**Ist die „buchende Person“ eine eigene Rolle? – Empfehlung: Nein, eine Zuständigkeit (F-056, Q28).** Rollen bleiben Orga und Mitglied (F-004). Zusätzlich kann die Orga bis zu **3 Mitgliedern die Markierung „Bucht“** geben (Standard: die Orga selbst). Begründung: In Freundesgruppen bucht oft nicht die Orga (eine Person bucht Flüge, eine andere die Unterkunft); eine dritte feste Rolle würde das Rollenmodell und alle Rechteprüfungen verkomplizieren, eine Markierung mit genau einem Zusatzrecht (Reisedaten anfragen/sehen) bleibt schlank und prüfbar.

| Aktion | Mitglied | „Bucht“ | Orga |
|---|---|---|---|
| Cockpit, Infoseite, Unterkünfte, Ausgaben, freigegebene Unterlagen ansehen | ✔ | ✔ | ✔ |
| Unterkunft vorschlagen, swipen; Ausgabe eintragen; Unterlage hochladen (Q32) | ✔ | ✔ | ✔ |
| Eigene Vorschläge/Ausgaben/Unterlagen bearbeiten/löschen | ✔ | ✔ | ✔ (auch fremde) |
| Infoseite bearbeiten (F-033) | – | ✔ | ✔ |
| Unterkunft festlegen / als „gebucht“ markieren (F-031) | – | ✔ „gebucht“ | ✔ beides |
| **Reisedaten anfragen und freigegebene Reisedaten anderer sehen** (F-054) | – | ✔ | nur wenn selbst „Bucht“ |
| Markierung „Bucht“ vergeben/entziehen (F-056) | – | – | ✔ |
| Abrechnung abschließen (F-036) | – | – | ✔ |
| Station „ohne App erledigt“ abhaken / rückgängig (F-053, UX-9) | – | – | ✔ |

Alle Rechte werden **serverseitig** geprüft (wie F-004). Die Orga sieht **nicht automatisch** fremde Reisedaten – nur, wer „Bucht“ trägt und eine Freigabe erhalten hat.

### F-053 Reise-Cockpit: Übersicht nach der Festlegung (Phase 3)
**Als** Mitglied **möchte ich** nach der Festlegung auf einer Seite sehen, was für unsere Reise noch zu tun ist und wie der Stand ist, **damit** ich nicht im Gruppenchat suchen muss und nichts vergessen wird.
**Als** Orga **möchte ich** auf einen Blick sehen, wo die Gruppe hängt (Unterkunft, Reisedaten, Geld), **damit** ich gezielt nachhaken kann.

**Gültige Spezifikation: W16 v2 „Reiseverlauf“** (`docs/ux/wireframes/w16-cockpit.md` Teil A, Auftraggeber-Wahl Variante C, 2026-10-22). Die Akzeptanzkriterien unten sind die produktseitige Zusammenfassung; Texte, Zustandstabellen je Station und Rolle (v2.4) und der Developer-Vertrag (v2.10) stehen in W16 v2. Bei Widerspruch gilt W16 v2.

Akzeptanzkriterien (Stufe 1, gesamt über Inkremente 8–12; Inkrement-8-Schnitt siehe **R.6**):
- [ ] **Hub ohne Tabs (UX-1):** Ab Phase 3 (`fixed`) gibt es keine Tab-Leiste; jeder Bereich ist eine Unterseite eine Ebene tief (Routen W16 Teil B §1), alte Tab-Routen leiten auf die schreibgeschützte Variante um (ux-spec §14.4). Termin-Historie über «So habt ihr entschieden» und das Reisemenü `⋯`.
- [ ] **Aufbau von oben nach unten (W16 v2.1):** (1) Zeile 1 sticky (Zurück · Reisename + Phasenzeile · `⋯`) · (2) **Ticket-Kopf** mit großem Vorfreude-Ring + Countdown, Reisezeitraum, Crew-Button → „Wer ist dabei?“, eine Kopf-Taste je Teilphase · (3) **Weg** «Euer Weg nach {Reisename}» · (4) **Immer griffbereit** (Kacheln) · (5) **Mehr zur Reise** («So habt ihr entschieden», «Wer ist dabei? (n)»).
- [ ] **Ring & Konfetti:** Die große Feier „Es geht los!“ (F-012, W11) bleibt einmal je Person und Festlegung. Danach ist der Ring statisch; **Antippen löst eine kleine Konfetti-Runde aus** (≤ 1,2 s, Sperre 3 s, keine Vibration; reduziert: nur Aufglühen). Countdown steht immer auch als Text (Phasenzeile + `sr-only`).
- [ ] **Weg = Stationen** (Katalog W16 v2.3, feste Reihenfolge): V1 Termin steht · V2 Alle sind dabei · V3 Unterkunft · V4 Reisedaten · V5 Anreise & Tickets · V6 **Ziel „Es geht los!“**; unterwegs Tage mit Terminen (T1…Tn) + Ziel „Heimreise“; danach D1 Kosten ausgleichen · D2 Unterlagen sichern · D3 Reisedaten gelöscht + Ziel „Wohin geht's als Nächstes?“. **Nicht gebaute Bereiche liefern keine Station/Kachel.**
- [ ] **Fünf Zustände** je Station (erledigt · du bist dran · wartet auf andere · als Nächstes · später) + Ziel, ausgewertet nach den Regeln W16 v2.4 je Rolle (Mitglied / „Bucht“ / Orga). Zustand steht immer **als Wort** im Eintrag, nie nur als Marker/Farbe/Linie. Erledigte Stationen sind zu einer Zeile eingeklappt.
- [ ] **„Heute“ ersetzt „Für dich zu tun“ (W16 v2.5):** genau ein Heute-Marker mit Datum (Zeitzone der Reise), **Heute-Satz** H-1–H-5 und darunter alle Einträge im Zustand „du bist dran“ (Stationen + Aufgaben ohne Station A1/A2), sortiert nach Dringlichkeit; max. 3 sichtbar, Rest aufklappbar. Der erste Eintrag trägt die **einzige Primär-Taste** der Seite.
- [ ] **Längen-Budget:** typischer Fall ≤ 2 Bildschirme (390 × 844); Heute-Marker liegt bei 360 × 640 im ersten Bildschirm, die erste Primär-Taste bei 360 × 740 und 390 × 844 (W16 v2.2).
- [ ] **Kacheln „Immer griffbereit“** (W16 v2.6): nur Bereiche **ohne Ende** bzw. mit erledigter Station, feste Reihenfolge Unterkunft · Unterlagen · Kosten · Infos · Reisedaten; je Kachel Titel + **eine** Statuszeile + Link; keine Kachel für Bereiche mit offener Station; ohne Kacheln entfällt die Überschrift.
- [ ] **Teilphasen nach Datum** (Zeitzone der Reise): *Vorbereitung* (bis Tag vor Anreise) · *Unterwegs* (Anreise- bis Abreisetag) · *Danach* (ab Tag nach Abreise); Wechsel beim Neuladen. Phasenzeile «Steht fest · noch 41 Tage» / «Unterwegs · Tag 3 von 8» / «Zurück · …».
- [ ] **Kleine Feier am Abreisetag (UX-8):** am ersten Tag *Unterwegs* einmal je Person kleine Konfetti-Runde automatisch beim Öffnen + Heute-Satz «Heute geht's los – gute Reise!» (Details R.6, I8-07).
- [ ] **„Ohne App erledigt“ (UX-9):** Die Orga kann V2 («{Name} macht ohne App mit»), V3 («Haben wir schon / brauchen wir nicht») und V5 («Jede:r reist selbst an») als erledigt abhaken; für alle sichtbar als «ohne App erledigt», rückgängig machbar in der Erledigt-Gruppe; serverseitig nur Orga. Umsetzung je Station mit ihrem Inkrement (V2: 8, V3: 9, V5: 12).
- [ ] **Erinnern / Bescheid geben** bei „wartet auf andere“ über das vorhandene `RemindSheet` (F-015) mit den Anlässen aus W16 v2.8; Reisedaten-Texte enthalten nie Felder oder Werte.
- [ ] **Rollen:** Mitglieder sehen eigenen Stand + neutrale Gruppenzahlen; Orga zusätzlich Gruppenfortschritt; Orga ohne „Bucht“ sieht bei Reisedaten nie Inhalte (F-054).
- [ ] Platzhalter (F-007) zählen, wo sie teilnehmen können (Kosten, „€ pro Person“), nicht beim Bewerten/Reisedaten; V2 zeigt offene Platzhalter.
- [ ] Statusangaben aktualisieren sich bei Neuladen (kein Live-Update, wie F-008).
- [ ] Mobile 360 px, 320 px, große Schrift (200 %), Dark Mode, DE/EN, Desktop ≥ 960 px zweispaltig; Weg als `<ol>`, Überschriften und Screenreader-Reihenfolge wie W16 v2.9; zugängliche Namen «{Zustand}: {Titel}. {Status}».

**Abgelöst (W16 v1, 2026-10-20):** Die frühere Kachel-Tabelle („Für dich zu tun“ + Kachelraster je Teilphase, Phase-3-Tabs) ist durch W16 v2 ersetzt und bleibt nur als Verlauf stehen:

| Pos. | Vorbereitung (bis Anreise) | Unterwegs | Danach |
|---|---|---|---|
| 0 | Kopf: «Es geht los: 5.–10. Mai» + Countdown-Ring | Kopf: «Tag 2 von 6» | Kopf: «Schön war's!» + Reisezeitraum |
| 1 | **Für dich zu tun** (falls offen) | Für dich zu tun | Für dich zu tun (meist: ausgleichen) |
| 2 | **Unterkunft** – «5 Vorschläge · du hast 3 von 5 bewertet» → «Favorit: Casa Azul (4 ♥)» → festgelegt: Bild + «Casa Azul · gebucht ✓» bzw. «noch nicht gebucht» | **Kosten** – «Gesamt 1.240 € · du bekommst 42,00 €» + `[+ Ausgabe]` | **Kosten** – «Noch 3 Ausgleiche offen · du schuldest Kemal 23,50 €» |
| 3 | **Reisedaten** – Mitglied: «Lena bucht – deine Daten fehlen noch» / «Freigegeben an Lena ✓»; Bucht: «3 von 5 haben freigegeben» | **Unterlagen** – «4 Unterlagen · Flug Rückreise: Fr. 10. Mai» | Unterlagen – «werden am 9. Juni gelöscht» |
| 4 | **Unterlagen** – «2 Flugtickets · 1 Aktivität · 1 neu» | **Infos** – Adresse, Check-in/out, Treffpunkt (Kurzfassung) | Unterkunft (statisch) |
| 5 | **Kosten** – «Noch keine Ausgaben» bzw. «Gesamt 640 € · du bekommst 42 €» | Unterkunft (statisch) | Reisedaten – «gelöscht am 17. Mai» bzw. entfällt |
| 6 | **Infos** (F-033) – «Adresse, Check-in 15 Uhr» / Orga: «Infos ergänzen» | Reisedaten (nur Bucht) | «So habt ihr entschieden» |
| 7 | «So habt ihr entschieden» (Termin-Historie) + Mitglieder | Mitglieder | – |

Saldo-Formulierungen (verbindlich als Inhalt, Wortlaut UX): **«du bekommst 42,00 €»** / **«du schuldest 23,50 €»** / **«ausgeglichen ✓»** – immer mit Wort, nicht nur mit Vorzeichen oder Farbe.

MVP-Schnitt: Stufe 1 = Ticket-Kopf + Weg (Stationen gebauter Bereiche, Heute, Ziel) + Kacheln + Mehr zur Reise + Teilphasen + UX-8 + UX-9. **Später:** Station „Packen“ (mit F-032), Wetter/weitere Countdown-Spielereien, Kachel-Anpassung durch Nutzer, Live-Updates, Push (F-038), „zuletzt erinnert“.
Abhängigkeiten: F-012 (Phase 3, Feier W11), F-007 (Status/Platzhalter), F-015 (`RemindSheet`), F-052 (Motion UM-1–UM-7, Designer D-36–D-45 – `docs/ux/abstimmung-design.md` §12). Wird mit jedem Bereich (F-031 → V3, F-054 → V4, F-055 → V5/T/D2, F-035/036 → A1/D1 + Kachel Kosten) um Station/Kachel/Adapter erweitert (Vertrag W16 v2.10).
Aufwand: **M** (mit F-033 zusammen ≈ 1 Inkrement; gegenüber v1 etwas mehr wegen Weg-Logik `tripRoute()` und UX-8/UX-9).

### F-033 Reise-Infoseite (Text & Links) – präzisiert
**Als** Mitglied **möchte ich** Adresse, Check-in-Zeiten, Treffpunkt und wichtige Links an einem Ort finden, **damit** ich nicht im Chat suchen muss.

Akzeptanzkriterien (Stufe 1):
- [ ] Strukturierte Felder (alle optional): Unterkunftsadresse (übernehmbar aus festgelegter Unterkunft F-031), Check-in/Check-out (Datum/Uhrzeit), Treffpunkt/Anreise, Notfallkontakt **der Unterkunft** (nicht von Personen), freier Text (≤ 2 000 Zeichen, Zeilenumbrüche + automatisch erkannte Links, kein HTML).
- [ ] Bearbeiten: Orga und „Bucht“ (R.1) – **in Inkrement 8 nur Orga**, „Bucht“ kommt mit F-056 (Inkrement 11) dazu; Anzeige: alle Mitglieder. „Zuletzt geändert von <Name>, <Datum>“. Wireframe W22, Routen `/trips/{id}/info`, `/info/edit`; Einstieg im Cockpit über Kachel „Infos“ und Ziel-Station „Es geht los!“ (W16 v2).
- [ ] Adresse mit Link „In Karten öffnen“ (normaler Link zu einem Kartendienst, **keine eingebettete Karte** – keine Drittinhalte, compliance-checklist §4).
- [ ] Hinweis im Feld Freitext: «Keine Ausweis- oder Buchungsnummern hier eintragen – dafür gibt es Reisedaten und Unterlagen.»
- **Dateien** gehören nicht mehr zu F-033, sondern zu **F-055**.

MVP-Schnitt: wie oben. **Später:** mehrere Orte (Rundreise), Tagesplan/Programm, Checkliste (→ F-032).
Abhängigkeiten: F-053. Aufwand: **S**.

### F-031 Unterkünfte sammeln & per Swipe bewerten – Steckbrief
**Als** Mitglied **möchte ich** Unterkünfte per Link vorschlagen, **damit** alle Ideen an einem Ort sind statt verstreut im Chat.
**Als** Mitglied **möchte ich** alle Vorschläge wie Karten durchswipen (gefällt mir / eher nicht), **damit** ich schnell und ohne Diskussion meine Meinung abgebe.
**Als** Orga **möchte ich** eine Rangliste sehen und die Gewinner-Unterkunft festlegen, **damit** gebucht werden kann.

Akzeptanzkriterien (Stufe 1 – Inkrement 9; **Zuschnitt, Rechte, Datenhaltung und Sicherheit siehe R.7** – bei Widerspruch gilt R.7):
- [ ] **Verfügbar ab Phase 3** (Termin steht – Preise und Verfügbarkeit hängen am Datum). Einstieg im Cockpit als **Station V3 „Unterkunft“** (Zustände W16 v2.4), nach «gebucht ✓» als Kachel; Bereich `/trips/{id}/stays` (kein Tab, UX-1). Orga kann V3 „ohne App erledigt“ abhaken («Haben wir schon / brauchen wir nicht», UX-9).
- [ ] **Vorschlagen** (alle Mitglieder): **Link Pflicht** (nur `https://`), Titel Pflicht (wird aus der Link-Vorschau vorbelegt), Gesamtpreis optional (Währung der Reise), Notiz optional (≤ 200 Zeichen, Hinweis «Alle in der Reise können das lesen»). Die App zeigt zusätzlich **«≈ X € pro Person»** (Gesamtpreis ÷ Anzahl Reisende = Mitglieder + Platzhalter; Anzahl von der Orga änderbar). Max. **30 Vorschläge** pro Reise.
- [ ] **Link-Vorschau (best effort):** Der Server lädt Titel, Beschreibung und Vorschaubild (Open Graph) – mit SSRF-Schutz (nur https, nur öffentliche IP-Adressen auch nach Weiterleitungen, max. 3 Weiterleitungen, Zeitlimit 5 s, max. 1 MB HTML, eigener User-Agent, Rate-Limit pro Person). Klappt das nicht (viele Portale blockieren Abrufe), erscheint sofort eine **Platzhalterkarte** (Domain + Titel + Illustration) – das Vorschlagen wird nie blockiert.
- [ ] **Vorschaubilder** werden **nicht dauerhaft gespeichert**, sondern über einen eigenen Bild-Proxy ausgeliefert (Größe begrenzt, kurzer Cache ≤ 7 Tage), damit Browser der Mitglieder **keine Drittserver** kontaktieren (keine IP-Weitergabe, CSP bleibt `self`) und keine fremden Fotos archiviert werden (Urheberrecht; Q34). Quelle/Domain ist auf jeder Karte sichtbar; Karte → Link öffnet das Portal in neuem Tab.
- [ ] **Swipen:** Kartenstapel aller noch nicht bewerteten Vorschläge (auch eigene). **Rechts / ♥ = gefällt mir**, **links / ✕ = eher nicht**; gleichwertige **Buttons** (Pflicht, SC 2.5.7) und Tastatur (← / →); **Rückgängig** für den letzten Swipe; Zähler «3 von 5». Neue Vorschläge erscheinen im Stapel mit Hinweis «2 neue Unterkünfte». Eigene Bewertung bleibt in der Listenansicht änderbar.
- [ ] **Ergebnis-Sichtbarkeit (analog Q13 a, Q33):** Rangliste und Likes anderer sieht ein Mitglied erst, wenn es **alle aktuellen** Vorschläge bewertet hat; vorher «Swipe alle durch, um das Ranking zu sehen». **Orga sieht immer alles.** Serverseitig durchgesetzt (Daten werden vorher nicht ausgeliefert).
- [ ] **Rangliste:** (1) meiste ♥, (2) wenigste ✕, (3) niedrigerer Preis pro Person, (4) früher vorgeschlagen. Nach eigener Bewertung sind ♥ namentlich sichtbar (Transparenz wie F-011).
- [ ] **Festlegen** (Orga): «Das wird's» auf einer Karte → Unterkunft gilt als gewählt (Feier klein, Motion), Teilen-Text «Unsere Unterkunft: <Titel> <Link>»; Swipen endet, Rangliste bleibt sichtbar. Orga oder „Bucht“ markiert später **«gebucht ✓»**; Adresse kann in die Infoseite (F-033) übernommen werden. Festlegung ist aufhebbar.
- [ ] Löschen: eigener Vorschlag oder Orga (mit Bestätigung; Bewertungen dazu werden gelöscht).
- [ ] Datenschutz: Beim Verlassen der Reise (F-013) werden eigene Bewertungen gelöscht; eigene Vorschläge bleiben für die Gruppe, als Urheber erscheint «ehemaliges Mitglied».

MVP-Schnitt: **Stufe 1** = Link + Vorschau/Platzhalter + manuelle Felder + Swipe + Rangliste + Festlegen + «gebucht». **Stufe 2 (mit Dateispeicher, Inkrement 12):** bis zu 3 **eigene Screenshots** je Vorschlag als Rückfall, wenn keine Vorschau kommt. **Später:** Superlike/„Muss ich haben“, Kommentare je Unterkunft, Vergleichsansicht (Preis, Schlafplätze, Lage), mehrere Unterkünfte (Rundreise), Erinnerung „noch nicht bewertet“ per E-Mail (F-014).
Abhängigkeiten: F-053, F-012; Motion Designer (Swipe-Geste, Feder-/Rückhol-Animation, reduzierte Bewegung = Überblenden); Operations (SSRF-sicherer Abruf, Bild-Proxy-Cache).
Aufwand: **M–L** (≈ 1–1,5 Inkremente; Risiko: Swipe-Gesten im In-App-Browser, Link-Vorschau).

### F-035 + F-036 Kosten teilen (wie Tricount) – Steckbrief
**Als** Mitreisende **möchte ich** eine Ausgabe in Sekunden eintragen (wer hat bezahlt, für wen), **damit** wir nach der Reise nicht Kassenzettel und Chatnachrichten zusammensuchen.
**Als** Mitglied **möchte ich** jederzeit meinen Saldo sehen («du bekommst 42 €»), **damit** ich weiß, wo ich stehe.
**Als** Gruppe **wollen wir** am Ende mit möglichst wenigen Überweisungen ausgleichen, **damit** die Abrechnung keinen Streit auslöst.

Akzeptanzkriterien F-035 Ausgaben (Stufe 1 – Inkrement 10; **Zuschnitt, Rechte, Rechenregeln, Datenhaltung und Sicherheit siehe R.8** – bei Widerspruch gilt R.8):
- [ ] **Verfügbar ab Phase 3** (Q35). Einstieg im Cockpit als Kachel „Kosten“, Aufgabe A1 unter „Heute“ (eigene Schuld ≥ 50 €), in *Danach* Station D1 „Kosten ausgleichen“, unterwegs Kopf-Taste `[+ Ausgabe]` (W16 v2); Bereich `/trips/{id}/costs` (kein Tab, UX-1). Jedes Mitglied kann Ausgaben eintragen – **ohne Mengenlimit** (bewusste Abgrenzung zu Splitwise, dessen Gratis-Tarif Einträge pro Tag begrenzt).
- [ ] **Eine Währung pro Reise** (Standard aus der Region der Orga, z. B. EUR; von der Orga änderbar, solange keine Ausgabe existiert). Fremdwährungen → F-037 (später).
- [ ] Ausgabe: **Betrag** (Pflicht, > 0, max. 2 Nachkommastellen, intern in Cent als Ganzzahl), **Titel** (Pflicht, ≤ 60 Zeichen), **bezahlt von** (genau eine Person, Standard: ich), **für wen** (Standard: alle Reisenden; abwählbar), **Datum** (Standard heute bzw. Anreisetag), Kategorie optional (Unterkunft, Anreise, Essen, Aktivitäten, Sonstiges – mit Icon).
- [ ] **Aufteilung:** *gleich* (Standard) oder *individuelle Beträge* (Summe muss dem Gesamtbetrag entsprechen; Live-Anzeige «noch 12,00 € zu verteilen»). Rundungsrest in Cent wird deterministisch verteilt (z. B. an die ersten Personen in fester Reihenfolge), Summe stimmt immer exakt.
- [ ] **Beteiligte:** alle Mitglieder **und Platzhalter** (F-007) – wer nicht in der App ist, kann trotzdem mitgerechnet werden. Tritt eine Person über ihren Platzhalter-Link bei, übernimmt sie dessen Ausgaben und Saldo.
- [ ] Bearbeiten/Löschen: wer die Ausgabe angelegt hat, wer bezahlt hat, und die Orga; jede Ausgabe zeigt «angelegt von / zuletzt geändert von <Name>, <Datum>». Löschen mit Rückgängig (Snackbar).
- [ ] Liste: neueste zuerst, gruppiert nach Tag; Summe gesamt und «davon dein Anteil».
- [ ] Eingabe auf 360 px mit Zahlentastatur (`inputmode="decimal"`), Dezimaltrennzeichen gemäß Region (Komma/Punkt), optimistisches UI (ux-spec §1.3).

Akzeptanzkriterien F-036 Salden & Ausgleich (Stufe 1 – Inkrement 10):
- [ ] **Saldo je Person** = bezahlt − eigener Anteil (+ erhaltene/geleistete Ausgleichszahlungen). Anzeige als Text «bekommt 42,00 €» / «schuldet 23,50 €» / «ausgeglichen ✓» (nie nur Farbe/Vorzeichen); Summe aller Salden = 0 (Test).
- [ ] **Ausgleichsvorschlag:** möglichst wenige Überweisungen (exakte Paare + Greedy: größter Schuldner an größten Gläubiger; höchstens n−1 Überweisungen; deterministisch, reine Funktion, testbar; 30 Personen < 100 ms – Details R.8 Rechenregel 6). Darstellung «Kemal → Lena: 23,50 €».
- [ ] **«Als bezahlt markieren»** durch Zahlende **oder** Empfangende → wird als Ausgleichszahlung gebucht (rückgängig machbar); der Saldo aktualisiert sich.
- [ ] **Zahlungshinweis (optional, Q35):** Jedes Mitglied kann für diese Reise freiwillig eine Zahlungsinfo hinterlegen (R.8: geprüfte **IBAN**, maskiert angezeigt, und/oder Freitext ≤ 100 Zeichen, z. B. PayPal-Name), sichtbar für Mitglieder der Reise, Hinweis «Alle in der Reise können das lesen»; Kopier-Button. **Keine** Zahlungsabwicklung, keine Bank-/PayPal-Anbindung.
- [ ] **Abrechnung abschließen** (Orga, ab Teilphase *Danach* empfohlen): Kosten werden schreibgeschützt; Wiederöffnen möglich.
- [ ] Teilen-Text «Abrechnung <Reise>: Kemal → Lena 23,50 € …» (für den Gruppenchat).
- [ ] **Datenschutz & Löschung:** Ausgaben werden mit der Reise gelöscht (F-013, 90 Tage nach Reiseende). Hat die Reise **offene Salden**, nennt die Lösch-Hinweismail an die Orga dies ausdrücklich. **Reise verlassen mit offenem Saldo:** Warnung mit Betrag; nach Bestätigung bleiben die Ausgaben für die Gruppe korrekt erhalten, die Person erscheint darin als «ehemaliges Mitglied» (Name wird entfernt) (Q35).

MVP-Schnitt: **Stufe 1** = eine Währung, ein Zahler, gleich/individuelle Beträge, Platzhalter, Salden, Ausgleichsvorschlag, als bezahlt markieren, Abschluss. **Später:** Aufteilung nach Anteilen/Prozent, mehrere Zahler pro Ausgabe, **Belegfotos** (braucht F-055-Speicher; Premium-Kandidat), **Fremdwährungen F-037** (Premium-Kandidat), Export CSV/PDF (Premium-Kandidat), wiederkehrende Ausgaben, Budget (F-034), Statistik nach Kategorie, Ausgaben schon vor Phase 3 (Anzahlungen) – bei Bedarf.
Abhängigkeiten: F-053, F-007 (Platzhalter), F-046 (Zahlen-/Währungsformate). Kein Dateispeicher, keine sensiblen Daten → **nicht** an Gate G1b gebunden.
Aufwand: **M–L** (≈ 1,5 Inkremente; Schwerpunkt Rechenlogik + Tests, Formular-UX).

### F-056 Zuständigkeit „Bucht“ (buchende Person)
**Als** Orga **möchte ich** festlegen, wer für die Gruppe bucht, **damit** diese Person die nötigen Reisedaten bekommt – und nur sie.

Akzeptanzkriterien (Inkrement 11; **Zuschnitt, Rechte und Datenhaltung siehe R.9** – bei Widerspruch gilt R.9):
- [ ] Die Orga kann in der Mitgliederliste bis zu **3 Mitgliedern** die Markierung **«Bucht»** geben/entziehen (Standard bei Phase 3: die Orga selbst, entziehbar). Platzhalter können nicht „Bucht“ sein.
- [ ] Die Markierung ist für alle sichtbar (Chip «Bucht» / «Booking») – Transparenz, wer Reisedaten sehen kann.
- [ ] Recht: Reisedaten anfragen und freigegebene Reisedaten sehen (F-054); Infoseite bearbeiten (F-033); Unterkunft als „gebucht“ markieren (F-031).
- [ ] **Entzug** der Markierung oder Verlassen der Reise beendet sofort den Zugriff auf alle Reisedaten (serverseitig); betroffene Mitglieder sehen in ihrer Freigabe-Übersicht, dass die Freigabe an diese Person erloschen ist.
- [ ] Orga-Übergabe (F-004) überträgt die Markierung nicht automatisch.
Aufwand: **S** (mit F-054 zusammen).

### F-054 Persönliche Reisedaten – Abfrage & Freigabe
**Als** buchende Person **möchte ich** die für eine Buchung nötigen Daten aller Mitreisenden an einem Ort abfragen, **damit** ich sie nicht einzeln per Chat einsammeln muss.
**Als** Mitreisender **möchte ich** genau sehen, wer welche meiner Daten wofür bekommt, und die Freigabe jederzeit zurückziehen können, **damit** ich meine Ausweisdaten nicht ungeschützt in einen Gruppenchat schreiben muss.

**Grundprinzip „Anfrage → Freigabe“:** Daten werden **nur auf konkrete Anfrage** einer Person mit „Bucht“ (F-056) erfasst und **nur an diese Person** freigegeben – nicht an die Gruppe, nicht automatisch an die Orga. Zeitpunkt: **erst nach der Festlegung** (Auftraggeber-Wunsch).

Datensparsamkeit – welche Felder? (Q29)

| Feld | Standard in Anfrage | Wofür typischerweise nötig | Empfehlung |
|---|---|---|---|
| Vor- und Nachname(n) **genau wie im Ausweis** | **immer** | jede Flug-/Bahn-/Fährbuchung | Pflicht |
| Geburtsdatum | **an** (abwählbar) | viele Airlines (Kinder-/Jugendtarife), Fähren, Mietwagen | an |
| Geschlecht/Anrede laut Ausweis (w/m/x) | aus | manche Airlines verlangen Anrede | optional anfragbar |
| Staatsangehörigkeit | aus | Fernreisen, Einreise-/APIS-Daten | optional anfragbar |
| Dokumentart (Reisepass/Personalausweis) + **Dokumentnummer** | aus | Fernreisen/APIS (z. B. USA, UK), Fähren, teils Hotels im Ausland | optional anfragbar, **mit Warnhinweis** |
| Ablaufdatum des Dokuments | aus | APIS; Prüfung „gültig bis nach Reiseende“ | optional anfragbar (nur zusammen mit Dokumentnummer) |
| Ausstellungsland | aus | APIS | optional anfragbar (nur zusammen mit Dokumentnummer) |
| **Nicht erhoben:** Ausweisfoto/-scan, Adresse, Größe, Augenfarbe, Ausstellungsbehörde, Zugangs-/CAN-Nummer, Vielfliegernummer, Freitext (Risiko Gesundheits-/Ernährungsangaben = besondere Kategorien Art. 9 DSGVO) | – | – | **nie** in Stufe 1 |

Akzeptanzkriterien (Stufe 1 – Inkrement 11; **Zuschnitt, Rechte, Lebenszyklus, Verschlüsselung und Datenhaltung siehe R.9** – bei Widerspruch gilt R.9):
- [ ] **Eigener Bereich (UX-2, entschieden 2026-10-22):** Reisedaten sind **nicht** Teil der Unterlagen, sondern ein eigener Bereich `/trips/{id}/travel-data` (W20) mit eigener Station **V4** im Weg (Sichtbarkeit/Zustände W16 v2.4) und Kachel (nur „Bucht“, solange Daten da sind); in *Danach* Station D3 «Reisedaten gelöscht».
- [ ] **Anfrage erstellen** (nur „Bucht“, nur Phase 3): Zweck wählen/benennen (z. B. «Flüge Lissabon», ≤ 60 Zeichen), Felder per Schalter wählen (Standard: Name + Geburtsdatum), Empfänger: alle Reisenden (Standard) oder Auswahl. Bei Dokumentnummer erscheint der Hinweis «Nur anfragen, wenn die Buchung sie wirklich verlangt – innerhalb Europas genügt meist der Name.»
- [ ] **Mitglied** sieht im Cockpit «Lena bucht <Zweck> und bittet um: Name laut Ausweis, Geburtsdatum» → Formular → **Freigabe-Schritt mit Einwilligung** (nicht vorangekreuzt): «Ich gebe diese Angaben für <Zweck> an Lena frei. Sie werden verschlüsselt gespeichert, nur Lena sieht sie, und sie werden am <Datum> automatisch gelöscht. Ich kann die Freigabe jederzeit zurückziehen.» Ablehnen ist möglich («Ich kläre das direkt mit Lena»), ohne Begründung.
- [ ] **Sichtbarkeit:** nur die Person selbst und die anfragende „Bucht“-Person. Andere Mitglieder und die Orga (ohne „Bucht“) sehen nur den **Status** («freigegeben / offen / abgelehnt»), nie Inhalte.
- [ ] **Ansicht für „Bucht“:** Liste der Reisenden mit Status; Daten standardmäßig **maskiert** (z. B. «C01X••••7»), «Anzeigen» und «Kopieren» je Feld (zum Übertragen in Buchungsformulare). Kein Sammel-Export, kein CSV, kein Druck-Layout in Stufe 1.
- [ ] **Zugriffsprotokoll:** Jede Anzeige/Kopie durch „Bucht“ wird protokolliert (wer, wann, welches Feld – ohne Inhalt); die betroffene Person sieht «Lena hat deine Angaben am 3. März angesehen». Protokoll wird mit den Daten gelöscht.
- [ ] **Re-Authentifizierung** (Empfehlung): Vor dem ersten Anzeigen fremder Dokumentnummern in einer Sitzung ist eine frische Anmeldung (Code) nötig, wenn die letzte Anmeldung > 12 h zurückliegt.
- [ ] **Widerruf** jederzeit: sofort unsichtbar für „Bucht“ und **sofort gelöscht** (nicht nur ausgeblendet). Bearbeiten der eigenen Angaben jederzeit; „Bucht“ sieht «geändert am …».
- [ ] **Hinweis Plausibilität (Could):** Liegt das Ablaufdatum vor dem Reiseende, sieht **nur die Person selbst** «Dein Dokument läuft vor der Rückreise ab».
- [ ] **Löschung (Q31):** automatisch **7 Tage nach Reiseende** (festgelegtes Abreisedatum), außerdem sofort bei Widerruf, Verlassen der Reise, Entzug „Bucht“ (für diese Anfrage), Reise-/Konto-Löschung. Wird die Festlegung aufgehoben und 30 Tage lang kein neuer Termin festgelegt, werden Reisedaten ebenfalls gelöscht. „Bucht“ kann eine Anfrage vorzeitig als «erledigt – Daten löschen» schließen.
- [ ] **Speicherung:** Felder **anwendungsseitig verschlüsselt** (AES-256-GCM, Schlüssel außerhalb der Datenbank, z. B. Umgebungs-Secret mit Rotation; Datenbank-Backups enthalten nur Chiffrat). Niemals in Logs, Fehler-Tracking, Analytics, URLs oder E-Mails; Mails (ab F-014) sagen nur «Lena bittet um deine Reisedaten».
- [ ] Datenexport (F-043) enthält die **eigenen** Reisedaten der Person; der Export der „Bucht“-Person enthält **keine** fremden Reisedaten.
- [ ] UI-Hinweis für „Bucht“: «Was du außerhalb der App mit den Daten machst (z. B. in ein Buchungsformular eintragen), liegt in deiner Verantwortung – bitte nicht in Chats weiterleiten.»

MVP-Schnitt: **Stufe 1** = Anfrage/Freigabe pro Reise, Felder wie oben, Maskierung, Protokoll, Widerruf, Auto-Löschung. **Später (Q30):** «Für künftige Reisen in meinem Konto merken» (opt-in, eigener Löschpfad, erst nach Sicherheitsreview), Vielfliegernummern, Plausibilitätsprüfung der maschinenlesbaren Prüfziffern, Export für Gruppenbuchungen. **Nie:** Ausweis-Scans/-Fotos.
Abhängigkeiten: F-012, F-053, **F-056**; Operations (Schlüsselverwaltung, Gate G1b), Reviewer (Security-Review). Rechtliche Prüfung vor echten Daten: Verwendungsbeschränkungen für Ausweis-/Passnummern (u. a. Seriennummer nach PAuswG), DSFA-Schwellwertanalyse.
Aufwand: **M** (≈ 1 Inkrement inkl. F-056) + Security-Review.

### F-055 Reiseunterlagen – Tickets & Dokumente sicher teilen
**Als** buchende Person **möchte ich** Flugtickets, Buchungsbestätigungen und Aktivitäten-Tickets in der Reise ablegen, **damit** alle sie unterwegs griffbereit haben.
**Als** Mitreisender **möchte ich** meine Tickets offline auf dem Handy öffnen können, **damit** ich am Gate nicht nach der Mail suchen muss.

Akzeptanzkriterien (Stufe 1 – Inkrement 12):
- [ ] **Verfügbar ab Phase 3.** Bereich `/trips/{id}/documents` (W21, kein Tab, UX-1; **ohne** Reisedaten – eigener Bereich, UX-2) + Cockpit-Kachel „Unterlagen“; Station V5 „Anreise & Tickets“ (Orga kann „Jede:r reist selbst an“ abhaken, UX-9), unterwegs Tage mit Terminen (T1…Tn) aus datierten Unterlagen, in *Danach* Station D2 «Unterlagen sichern».
- [ ] **Hochladen (Q32):** alle Mitglieder. Je Unterlage: Datei, Titel (vorbelegt aus Dateiname), Kategorie (Flug/Anreise, Unterkunft, Aktivität, Sonstiges), optional Datum (für Sortierung «nächste zuerst» und Teilphase *Unterwegs*).
- [ ] **Sichtbarkeit je Unterlage:** *alle in der Reise* (Standard für Gruppenbuchungen) oder *nur ausgewählte Personen* (z. B. persönliche Bordkarte). Hinweis beim Hochladen: «Tickets enthalten oft Buchungscode + Nachname – damit kann man eine Buchung ändern. Teile persönliche Tickets nur mit der Person.»
- [ ] **Dateitypen:** PDF, JPG, PNG, HEIC (wird in JPG umgewandelt). Prüfung über Dateiinhalt (Magic Bytes), nicht nur Endung. **Keine** Office-Dateien, Archive, ausführbaren Dateien, SVG/HTML.
- [ ] **Größen:** max. **10 MB pro Datei**, Kontingent **100 MB pro Reise** in Free (Premium-Kandidat: mehr), max. 50 Dateien pro Reise.
- [ ] **Bilder** werden serverseitig neu kodiert; **Metadaten (EXIF inkl. GPS) werden entfernt**.
- [ ] **Virenscan** jeder Datei vor Freigabe (z. B. ClamAV, selbst gehostet); bis zum Ergebnis Status «wird geprüft»; Fund → Datei verworfen, Hinweis an Hochladende.
- [ ] **Auslieferung** nur nach Login + Mitgliedschafts-/Sichtbarkeitsprüfung, über kurzlebige Download-Links (≤ 60 s) bzw. durch die App gestreamt; **keine öffentlichen Datei-URLs**. Antwort-Header `Content-Disposition`, `X-Content-Type-Options: nosniff`, restriktive CSP/Sandbox für PDFs (kein Ausführen von Skripten im App-Ursprung).
- [ ] **Speicher:** privater, EU-gehosteter Objektspeicher (Empfehlung Go-Live: S3-kompatibler Speicher in Deutschland, z. B. Hetzner Object Storage – gleicher Anbieter/AVV wie Hosting), Verschlüsselung at rest; Backups gemäß Löschkonzept.
- [ ] **Löschung (Q31):** Hochladende und Orga können löschen (sofort, auch aus dem Speicher). Automatisch **30 Tage nach Reiseende**, sonst mit Reise/Konto. Cockpit zeigt in *Danach* «Unterlagen werden am <Datum> gelöscht – jetzt herunterladen». Beim **Verlassen** der Reise fragt die App: «Deine 3 Unterlagen für die Gruppe behalten oder löschen?» (Standard: löschen, wenn nur für einen selbst sichtbar).
- [ ] Ansicht offline: Download/«Auf dem Handy speichern» ist möglich; echtes Offline-Caching in der App erst mit PWA (F-038).

MVP-Schnitt: **Stufe 1** = Upload, zwei Sichtbarkeitsstufen, Kategorien, Scan, Auto-Löschung. **Später:** Wallet-Pässe (.pkpass), Unterlagen per E-Mail-Weiterleitung an eine Reise-Adresse, Vorschau-Thumbnails von PDFs, mehr Speicher (Premium-Kandidat), Belegfotos für F-035 und Screenshots für F-031 (nutzen dieselbe Datei-Infrastruktur – Screenshots F-031 bereits in Inkrement 12).
Abhängigkeiten: F-053, Datei-Infrastruktur (Operations: Speicher, Scan, Kosten), Gate G1b für echte Dateien; Nutzungsbedingungen (keine rechtswidrigen Inhalte, Hochladende verantwortlich) und Meldeweg für Inhalte (DSA-Pflichten für Hosting-Dienste prüfen, Operations).
Aufwand: **L** (≈ 1,5–2 Inkremente inkl. Infrastruktur).

### R.2 Reihenfolge-Empfehlung (Nutzen / Aufwand / Risiko)

| Inkrement | Inhalt | Nutzen | Aufwand | Risiko | Begründung |
|---|---|---|---|---|---|
| **8** | F-053 Reise-Cockpit „Reiseverlauf“ (W16 v2: Ticket-Kopf, Weg-Gerüst mit V1, V2, Heute, Ziel; Teilphasen; UX-8; UX-9 für V2) + F-033 Infoseite (Text/Links) – Zuschnitt **R.6** | hoch (sichtbarer Sprung „Reise managen“) | M (≈ 1) | gering–mittel (Weg-Logik, Längen-Budget) | Rahmen, in den alles Weitere einsteckt; ohne Cockpit hätte jedes Feature eine Insellösung. |
| **9** | F-031 Unterkünfte Stufe 1 (Link, Vorschau, Swipe, Rangliste, Festlegen) | sehr hoch (Auftraggeber-Idee, chronologisch der erste Schritt nach dem Termin, Spaß-Faktor) | M–L (≈ 1–1,5) | mittel (Gesten, Link-Vorschau) | Kommt in der echten Reiseplanung direkt nach der Festlegung; kein Dateispeicher nötig, keine sensiblen Daten. |
| **10** | F-035 + F-036 Kosten teilen Stufe 1 | sehr hoch (Bindung bis nach der Reise, starkes Premium-Umfeld) | M–L (≈ 1,5) | gering–mittel (Rechenlogik, gut testbar) | Großer Nutzen, keine sensiblen Daten, nicht an G1b gebunden → mit echten Gruppen ab Beta nutzbar. |
| **11** | F-056 „Bucht“ + F-054 Reisedaten Stufe 1 | hoch (echtes Ärgernis), aber kleinere Nutzerzahl je Reise | M (≈ 1) + Security-Review | **hoch** (Ausweisdaten) | Braucht Verschlüsselung, Schlüsselverwaltung, rechtliche Prüfung – mit echten Daten erst nach G1b; in Demo/Vorschau voll vorführbar. |
| **12** | F-055 Unterlagen Stufe 1 + Datei-Infrastruktur + F-031 Screenshots | hoch unterwegs | L (≈ 1,5–2) | **hoch** (Dateien, Scan, Kosten) | Größter Infrastruktur-Anteil (Speicher, Virenscan, Header-Härtung); bündelt alle Datei-Funktionen in einem Schritt. |

**Summe: ≈ 6–7 Inkremente** (Bezugsgröße: bisherige Inkremente 1–6). Alternative (Q27): Reisedaten (Inkrement 11) vor Kosten (10) ziehen, falls dem Auftraggeber die Chronologie der echten Reiseplanung wichtiger ist – technisch keine Abhängigkeit.

### R.3 Monetarisierung (Bezug F-050, Q8, Q36)

| Bereich | Free (dauerhaft) | Premium-Kandidat (Reise-Pass, gilt für alle Mitglieder der Reise) |
|---|---|---|
| Cockpit & Infoseite (F-053, F-033) | vollständig | personalisiertes Titelbild/Farbe der Reise |
| Unterkünfte (F-031) | Vorschlagen, Swipen, Rangliste, Festlegen | eigene Screenshots > 1 pro Vorschlag, Vergleichsansicht, Superlike |
| Kosten (F-035/F-036) | **unbegrenzte Ausgaben**, Salden, Ausgleich | Fremdwährungen (F-037), Belegfotos, Export CSV/PDF, Anteile/mehrere Zahler (zu prüfen) |
| Reisedaten (F-054) | **vollständig** (Sicherheitsfunktion – nie hinter Bezahlschranke, sonst wandern Ausweisdaten zurück in den Chat) | – |
| Unterlagen (F-055) | bis 100 MB / 50 Dateien pro Reise | mehr Speicher/größere Dateien, Wallet-Pässe |

Hinweis Kosten: Speicher ist kein Kostentreiber (EU-Objektspeicher ca. 6–7 €/Monat inkl. 1 TB laut Drittquellen 2026, Preis vor Bestellung prüfen; 1 TB ≈ 10 000 Reisen mit vollem 100-MB-Kontingent). Relevanter sind Virenscan (ClamAV braucht ca. 1–1,5 GB RAM → ggf. größere VM) und Betriebsaufwand → Operations bewertet.

### R.4 Datenschutz & Sicherheit – Empfehlungen (Zusammenfassung für Operations/Reviewer)
- **Klassifizierung:** Ausweis-/Passnummern, Geburtsdaten und Tickets mit Namen/Buchungscodes sind personenbezogene Daten mit **hohem Missbrauchsrisiko** (Identitätsdiebstahl, Buchungsmanipulation). Keine besondere Kategorie nach Art. 9 DSGVO – solange **kein Freitext** (Gesundheit/Ernährung/Religion) erhoben wird. Für F-054/F-055 eine **DSFA-Schwellwertanalyse**, voraussichtlich eine schlanke **DSFA**, vor echten Daten.
- **Rechtsgrundlage:** F-054 per **Einwilligung** (Art. 6 Abs. 1 lit. a) je Freigabe, protokolliert, widerrufbar; F-055 und F-035/036 als Teil der Nutzung (Art. 6 Abs. 1 lit. b). Datenschutzerklärung ergänzen (neue Abschnitte, Empfänger Objektspeicher, Virenscan, Löschfristen).
- **Sichtbarkeit:** Need-to-know – Reisedaten nur an die anfragende „Bucht“-Person; Unterlagen „alle“ oder „ausgewählte“; Orga ohne Sonderzugriff auf Inhalte.
- **Verschlüsselung:** TLS; at rest (DB, Objektspeicher, Backups); **zusätzlich anwendungsseitig** für Reisedaten-Felder. Ende-zu-Ende-Verschlüsselung ist für Stufe 1 **nicht** empfohlen: passwortlose Konten haben kein Nutzergeheimnis für Schlüssel, Gerätewechsel/Wiederherstellung würde Daten unlesbar machen – erneut bewerten, falls „im Konto merken“ (Q30) kommt.
- **Löschfristen (Q31):** Reisedaten 7 Tage nach Reiseende · Unterlagen 30 Tage nach Reiseende · übrige Reisedaten (Unterkünfte, Ausgaben) wie bisher 90 Tage (F-013) · Backups max. 30 Tage.
- **Dateien:** Magic-Byte-Prüfung, Typ-Whitelist, Größenlimits, Virenscan, EXIF-Entfernung, keine öffentlichen URLs, Header-Härtung, Rate-Limits für Upload.
- **Link-Vorschau (F-031):** SSRF-Schutz, Bild-Proxy ohne Daueraufbewahrung, keine Drittressourcen im Browser.
- **Logs/Monitoring:** keine Inhalte aus F-054/F-055, keine Dateinamen mit Personenbezug in Logs; Fehler-Tracking scrubbt Felder.
- **Neues Gate G1b** (vor echter Nutzung von F-054/F-055, zusätzlich zu G1): Schlüsselverwaltung + Rotation, EU-Objektspeicher mit AVV, Virenscan in Betrieb, DSFA/Schwellwert dokumentiert, VVT/TOM/Löschkonzept ergänzt, Datenschutzerklärung + Nutzungsbedingungen (Upload-Regeln) ergänzt, rechtliche Prüfung zu Ausweisnummern, Security-Review durch Reviewer bestanden. Details roadmap.md.

### R.5 Was ist in Offline-Demo und privater Vorschau (Q25) vertretbar?
| Feature | Offline-Demo (Docker) | Private Vorschau (Vercel + Neon) |
|---|---|---|
| F-053, F-033, F-031, F-035/036 | ✔ voll (Fantasiedaten) | ✔ voll (Fantasiedaten) |
| F-031 Link-Vorschau | ✔ (Abruf echter Portale ist unkritisch, nur öffentliche Seiten) | ✔, Bild-Proxy mit kurzem Cache |
| F-054 Reisedaten | ✔ mit Fantasiedaten; Verschlüsselung aktiv (zum Testen) | ✔ nur mit Fantasiedaten; **deutlicher Hinweis im Formular „Demo – keine echten Ausweisdaten eingeben“**; „Demo zurücksetzen“ löscht alles |
| F-055 Unterlagen | ✔ lokaler Dateispeicher, Scan optional (EICAR-Test) | ✔ nur Beispieldateien, Limit z. B. 2 MB/Datei, 20 Dateien gesamt; Speicher ohne neues Konto (z. B. in der Datenbank) – Entscheidung Operations; Hinweis „keine echten Tickets hochladen“ |
| Echte Daten (echte Ausweisnummern, echte Tickets) | ✘ | ✘ – erst nach **G1 + G1b** |

Begründung: Vercel ist ein US-Anbieter (Drittlandbezug); für Fantasiedaten unkritisch, für echte Ausweisdaten nicht vertretbar. Für echte Nutzung gilt die Go-Live-Planung (EU-Hosting).

### R.6 Zuschnitt Inkrement 8 – Cockpit „Reiseverlauf“ + Infoseite (2026-10-22)

**Ziel:** Nach der Festlegung sieht jede Person den **Weg ihrer Reise** – was geschafft ist, was heute zu tun ist, worauf die Gruppe wartet und wann es losgeht – und findet Adresse, Check-in und Treffpunkt an einem Ort. Inkrement 8 baut das **vollständige Gerüst von W16 v2** mit den Stationen, die es ohne spätere Bereiche schon gibt; die Bereiche 9–12 docken danach nur noch über Adapter an (Vertrag W16 v2.10).

**Quellen (verbindlich):** W16 v2 (`docs/ux/wireframes/w16-cockpit.md` Teil A) · W22 (`docs/ux/wireframes/w22-infoseite.md`) · Mockup `docs/design/mockups/cockpit-reiseverlauf/index.html` · Optik D-36–D-45 und Motion UM-1–UM-7 (`docs/ux/abstimmung-design.md` §12) · ux-spec §14 (RemindSheet, Deep-Links, Festlegung aufheben).

**Voraussetzung für den Start der Umsetzung:** Designer hat D-36–D-45 und Motion Designer UM-1–UM-7 beantwortet (bzw. CEO hat offene Punkte entschieden). UI/UX ergänzt den Heute-Satz für *Danach* ohne Kosten-Bereich (H-6, s. I8-06).

#### Im Umfang (Übersicht)
| Baustein | W16 v2 | Feature |
|---|---|---|
| Ticket-Kopf mit großem Ring, Countdown, Crew-Button, Kopf-Taste; Ring-Konfetti auf Antippen; Mini-Ring in Zeile 1 | v2.2, v2.8 | F-053, F-052 |
| Weg-Gerüst + reine Funktion `tripRoute()` mit Adaptern (nicht gebaute Bereiche = `null`) | v2.3, v2.4, v2.10 | F-053 |
| Station **V1 „Termin steht“** (Orga: «Allen Bescheid geben») | v2.4 V1 | F-053, F-012 |
| Station **V2 „Alle sind dabei“** inkl. Erinnern und **UX-9** «{Name} macht ohne App mit» | v2.4 V2, v2.7 | F-053, F-007, F-015 |
| **Heute** (Marker, Heute-Satz, „du bist dran“-Liste) inkl. Aufgabe **A2** «Infos eintragen» | v2.5 | F-053 |
| **Ziel „Es geht los!“** (V6) → Infos | v2.4 V6 | F-053, F-033 |
| Teilphasen **Vorbereitung / Unterwegs / Danach** – soweit ohne spätere Bereiche sinnvoll | v2.4 Teilphasen | F-053 |
| **UX-8** kleine Feier am Abreisetag | v2.11, UM-7 | F-053, F-052 |
| Kachel **„Infos“** in „Immer griffbereit“; **Mehr zur Reise** (2 Sheets) | v2.6, v2.1 | F-053 |
| **Infoseite** anzeigen + bearbeiten (Orga) | W22 | F-033 |

#### User Stories & Akzeptanzkriterien

**I8-01 Ticket-Kopf & Ring**
**Als** Mitglied **möchte ich** nach der Festlegung oben sofort sehen, wann es losgeht und wie lange es noch dauert, **damit** die Vorfreude sichtbar bleibt.
- [ ] Phase `fixed`: Zeile 1 sticky (← · Reisename + Phasenzeile · `⋯`), darunter Ticket-Kopf mit Ring `clamp(120px, 21svh, 168px)`, Countdown im Ring (`aria-hidden`), Reisezeitraum, Abriss-Kante (dekorativ), Crew-Button «{n} dabei · {Nächte} Nächte» → Sheet „Wer ist dabei?“, Kopf-Taste je Teilphase (s. I8-06).
- [ ] Zeile 1 + Ticket ≤ 340 px bei 360 × 640; Heute-Marker im ersten Bildschirm bei 360 × 640.
- [ ] Countdown als Text in der Phasenzeile und als `sr-only`-Satz «Noch 41 Tage bis zur Abreise.» nach h1.
- [ ] Große Feier W11 unverändert einmal je Person und Festlegung; danach Ring statisch. **Antippen des Rings** (Button «Vorfreude: noch 41 Tage») → kleine Konfetti-Runde ≤ 1,2 s, Sperre 3 s, keine Vibration; reduzierte Bewegung: Aufglühen 140 ms (UM-1).
- [ ] Verlässt der große Ring den Bildschirm, zeigt Zeile 1 einen Mini-Ring 20 px (IntersectionObserver, Fade 140 ms; UM-6).

**I8-02 Weg-Gerüst & `tripRoute()`**
**Als** Mitglied **möchte ich** die Schritte unserer Reise als Weg sehen, **damit** ich ohne Nachfragen weiß, was geschafft ist und was als Nächstes kommt.
- [ ] Reine Funktion `tripRoute(trip, viewer, areas, today)` in `src/lib/trip-route.ts` gemäß W16 v2.10 (Typen `TripStation`, `TripTile`); Bereiche 9–12 liefern `null` → keine Station, keine Kachel. Unit-Tests **je Zeile** der Tabellen V1, V2 und je Heute-Satz (H-1–H-5 + H-6) sowie je Teilphase.
- [ ] Weg als `<ol>` mit h2 «Euer Weg nach {Reisename}» und Meta «{erledigt} von {alle ohne Ziel} ✓»; Linie/Marker `aria-hidden`, Zustand als sichtbares Wort.
- [ ] Erledigte Stationen eingeklappt zu einer Zeile «(✓) {n} erledigt: {Titel} …» (`aria-expanded`, Zustand bis Sitzungsende); „+ {n} weitere“-Muster für Heute/Läuft/Später vorhanden (auch wenn in Inkrement 8 selten nötig).
- [ ] Ersetzt in `src/app/(app)/trips/[id]/page.tsx` (Phase `fixed`) Ergebnis-Karte, Andock-Slot `TripModule` und Phasen-Leiste. „Festlegung aufheben“ führt wie bisher zurück in Phase 2 (ux-spec §14.4); der Weg verschwindet, Infos bleiben gespeichert.

**I8-03 Station V1 „Termin steht“**
**Als** Orga **möchte ich** direkt nach der Festlegung daran erinnert werden, allen Bescheid zu geben, **damit** die Gruppe den Termin auch außerhalb der App erfährt.
- [ ] Mitglied: V1 immer erledigt, Status «Platz 1 mit {n}× Ja · festgelegt von {Orga}»; Tippen → Sheet „So habt ihr entschieden“.
- [ ] Orga: V1 „du bist dran“ «Sag allen Bescheid, dass der Termin steht.» mit `[Allen Bescheid geben]` (vorhandener Teilen-Text F-012), bis die Orga im Teilen-Sheet WhatsApp/Teilen/Kopieren getippt hat **oder** 7 Tage seit Festlegung vergangen sind – danach erledigt.
- [ ] Neue Festlegung (nach Aufheben) setzt den Merker zurück.

**I8-04 Station V2 „Alle sind dabei“ + „ohne App erledigt“ (UX-9)**
**Als** Orga **möchte ich** sehen, wer noch nicht beigetreten ist, und Personen, die bewusst ohne App mitmachen, abhaken können, **damit** der Weg nicht wochenlang einen offenen Schritt zeigt.
- [ ] Keine offenen Platzhalter → erledigt «Alle {n} sind dabei». Sonst „wartet auf andere“ «{Namen} {ist/sind} noch nicht beigetreten».
- [ ] Mitglied: Text-Taste `[{Orga} Bescheid geben]` (Platzhalter-Text ux-spec §14.1). Orga: `[{Name} erinnern]` (persönlicher Link, RemindSheet `single`; bei mehreren Platzhaltern `status`) und Text-Taste «{Name} macht ohne App mit».
- [ ] **UX-9:** «macht ohne App mit» wird **je Platzhalter** gespeichert (nur Orga, serverseitig geprüft). V2 ist erledigt, wenn jeder offene Platzhalter beigetreten **oder** so markiert ist; Status dann «Alle dabei · {Name} ohne App». Für alle sichtbar; in der aufgeklappten Erledigt-Gruppe und im Sheet „Wer ist dabei?“ kann die Orga es **rückgängig** machen. Ein später neu angelegter Platzhalter öffnet V2 wieder.
- [ ] Der Platzhalter bleibt bestehen (zählt weiter bei Kosten/„€ pro Person“ in späteren Inkrementen; persönlicher Link bleibt gültig). Tritt die Person doch bei, ist der Merker gegenstandslos.

**I8-05 „Heute“**
**Als** Mitglied **möchte ich** an einer einzigen Stelle sehen, ob ich gerade etwas tun muss, **damit** ich nichts übersehe und nicht gedrängt werde, wenn nichts ansteht.
- [ ] Genau ein Heute-Marker (h3 «Heute, {Wochentag}, {Datum}», Zeitzone der Reise) direkt nach der Erledigt-Zeile; Heute-Satz nach W16 v2.5 (H-1 «Du bist dran – …», H-2 «Für dich gerade nichts zu tun. Ihr wartet auf: {…}», H-3 «Alles erledigt – jetzt nur noch Vorfreude!», H-4, H-5/H-6 je Teilphase).
- [ ] Darunter alle „du bist dran“-Einträge, sortiert nach W16 v2.5 (in Inkrement 8: V1 Orga, A2); erster Eintrag ausgeklappt mit der **einzigen Primär-Taste der Seite**.
- [ ] **A2** (Orga): Infos leer (weder Treffpunkt noch Adresse) und ≤ 21 Tage vor Anreise → «Trag Treffpunkt und Adresse in die Infos ein.» → `/info/edit`.

**I8-06 Ziel und Teilphasen**
**Als** Mitglied **möchte ich**, dass sich die Übersicht vor, während und nach der Reise passend verhält, **damit** sie mich die ganze Reise begleitet.
- [ ] **Vorbereitung:** Weg V1 · V2 · Heute · **Ziel V6 „Es geht los!“** (Datum der Anreise; Text = erste Zeile Treffpunkt aus den Infos, sonst Check-in, sonst «Noch {n} Tage»; Link → `/info`). Kopf-Taste `[Kalender]` (ICS wie W11).
- [ ] **Unterwegs** (Anreise- bis Abreisetag): Phasenzeile «Unterwegs · Tag {x} von {y}», Tages-Ring «Tag {x}»; Weg «(✓) Vorbereitung · {n} erledigt ▾» (nicht erledigte V-Stationen heißen dort «nicht genutzt») · Heute (H-4 «Heute steht nichts an – genießt den Tag!», bzw. H-1 bei offenen eigenen Aufgaben) · Ziel **«Heimreise · {Datum}»** → `/info`. Kopf-Taste: `[Infos]` (sekundär), bis Kosten/Unterlagen die Tasten `[+ Ausgabe]`/`[Tickets]` liefern.
- [ ] **Danach** (ab Tag nach Abreise): Ring voll mit «Schön war's!», Weg «(✓) Reise · Vorbereitung und {y} Tage ▾» · Heute mit **H-6** (neu, ohne Kosten-Bezug; Vorschlag DE «Schön war's – danke fürs Mitreisen!» / EN «What a trip – thanks for coming along!», Wortlaut UI/UX) · Ziel «Wohin geht's als Nächstes?» `[Neue Reise planen]` (sekundär) + Hinweis «Diese Reise wird am {Datum} automatisch gelöscht.» (Datum aus F-013). Keine Kopf-Taste. Phasenzeile «Zurück · schön war's» (Wortlaut UI/UX; «Kosten ausgleichen» erst mit Inkrement 10).
- [ ] Teilphase wechselt beim Neuladen; Tests für die Grenztage (Tag vor Anreise, Anreisetag, Abreisetag, Tag danach) in der Zeitzone der Reise.

**I8-07 Kleine Feier am Abreisetag (UX-8)**
**Als** Mitreisende **möchte ich** am Tag der Abreise kurz begrüßt werden, **damit** der Start der Reise ein kleiner Moment ist.
- [ ] Nur am **Anreisetag** (erster Tag *Unterwegs*, Zeitzone der Reise), **einmal je Person** (Server-Merker, geräteübergreifend): beim Öffnen der Übersicht automatisch die kleine Konfetti-Runde (UM-1/UM-7, ≤ 1,2 s, keine Ehrenrunde, keine Vibration) und Heute-Satz «Heute geht's los – gute Reise!» / «Today's the day – have a great trip!».
- [ ] Wer am Anreisetag nicht öffnet, bekommt sie später **nicht** nachgeholt. Läuft am selben Tag die große Feier W11 (Festlegung am Anreisetag), entfällt die kleine Feier (kein doppeltes Konfetti).
- [ ] Reduzierte Bewegung (System oder Konto-Schalter): kein Konfetti, nur der Satz. Kein Ton, keine Mitteilung.
- [ ] Wird die Festlegung geändert, gilt die Feier für das neue Anreisedatum erneut.

**I8-08 Kachel „Infos“ und „Mehr zur Reise“**
- [ ] „Immer griffbereit“ enthält in Inkrement 8 nur die Kachel **Infos**: Status = Check-in-Text bzw. Treffpunkt-Kurzform; leer: Mitglied «Noch leer – {Orga} trägt sie ein», Orga «Infos ergänzen». Zugänglicher Name = Titel + Status.
- [ ] „Mehr zur Reise“: «So habt ihr entschieden ›» (Sheet: Ergebnis, festgelegt von, Platz 1/2 mit Stimmen nach Q13 a, Link auf Gruppenkalender/Abstimmung nur lesen) und «Wer ist dabei? ({n}) ›» (Sheet: Personen mit Chips Orga / Platzhalter · noch nicht dabei / ohne App).

**I8-09 Infoseite anzeigen (F-033)**
**Als** Mitglied **möchte ich** Adresse, Check-in/-out, Treffpunkt und wichtige Links an einem Ort finden, **damit** ich nicht im Chat suchen muss.
- [ ] Route `/trips/{id}/info` (nur Mitglieder, Phase `fixed`; sonst gleiche 404 wie andere Reise-Unterseiten). Karten gemäß W22 (Unterkunft · Treffpunkt & Anreise · Gut zu wissen), je Karte h2, Label/Wert als `<dl>`; leere Felder werden nicht angezeigt; Leerzustand je Rolle.
- [ ] Adresse mit Link «In Karten öffnen ↗» (normaler externer Link, neuer Tab, **keine eingebettete Karte**, keine Drittinhalte beim Laden); Notfallkontakt als `tel:`-Link, wenn als Nummer erkennbar.
- [ ] Freitext mit Zeilenumbrüchen; nur `https://`-Links werden automatisch verlinkt (`rel="noopener noreferrer"`, `target="_blank"`); kein HTML/Markdown.
- [ ] «Zuletzt geändert von {Name}, {Datum}» (gelöschtes Konto → «ehemaliges Mitglied»).

**I8-10 Infoseite bearbeiten (F-033)**
**Als** Orga **möchte ich** die wichtigsten Infos einmal eintragen, **damit** alle sie finden und niemand mehr fragt.
- [ ] Route `/trips/{id}/info/edit`, **nur Orga** (serverseitig; „Bucht“ ab Inkrement 11). Felder alle optional: Adresse der Unterkunft (≤ 200), Check-in (Freitext ≤ 60), Check-out (Freitext ≤ 60), Treffpunkt & Anreise (≤ 300), Notfallkontakt der Unterkunft (≤ 120, Hinweis «Nur Kontakte der Unterkunft – keine privaten Nummern.»), Gut zu wissen (≤ 2 000, Zähler ab 1 800, Hinweis «Keine Ausweis- oder Buchungsnummern …»). Validierung Client + Server (zod), Steuerzeichen entfernt.
- [ ] Expliziter Speichern-Knopf; ungespeicherte Änderungen beim Zurück → «Änderungen verwerfen?»; nach dem Speichern Snackbar «Infos gespeichert – alle sehen sie jetzt.»
- [ ] **Konflikt:** Hat jemand anderes inzwischen gespeichert (Versionsnummer), Hinweis «{Name} hat die Infos inzwischen geändert. [Neu laden]» statt stillem Überschreiben.
- [ ] Rate-Limit pro Person wie andere Schreibaktionen. «Aus Unterkunft übernehmen» entfällt bis Inkrement 9.

**I8-11 Querschnitt (Abnahme)**
- [ ] 360 × 640, 360 × 740, 390 × 844, 320 px, 200 % Schrift (Container < 22 em: ohne Linie, Zustands-Label als Chip), Dark Mode, DE/EN, Desktop ≥ 960 px zweispaltig (Weg links, Kacheln + Mehr rechts; DOM: Weg zuerst).
- [ ] Motion UM-2 (Weg baut sich auf, einmal je Sitzung), UM-3 (Heute-Marker-Puls beim ersten Aufbau), UM-5 (Aufklappen), UM-4 (Siegel-Plopp bei «Neu erledigt», s. u.) – alle mit reduzierter Variante; Prüfliste interaktionen §4.
- [ ] **«Neu erledigt»** (W16 v2.7, Should): Erledigt-Zeile zeigt einmalig «(✓) Neu erledigt: {Titel} · {n} erledigt ▾» anhand des zuletzt gesehenen Stands im Browser (`localStorage` je Reise, nur Stations-IDs).
- [ ] Skelett ab 300 ms (Ticket-Umriss, Heute-Marker, 3 Stations-Umrisse); Offline-Banner; Fehler eines Bereichs-Status → «Stand gerade nicht verfügbar».
- [ ] Rückkehr aus `/info`: Scroll-Position und Fokus auf die Herkunfts-Station/-Kachel (bzw. Heute-Marker, wenn sie die Gruppe gewechselt hat).
- [ ] Screenreader-Durchlauf (VoiceOver/TalkBack) in der Reihenfolge W16 v2.9; Abnahme-Fälle: Max Vorbereitung (Mitglied, Platzhalter offen), Lena Vorbereitung (Orga, V1 offen, A2), alles erledigt (H-3), Unterwegs (Anreisetag mit UX-8, Tag 3), Danach.
- [ ] Demo-Daten (`seed.ts`, „Demo zurücksetzen“): je eine festgelegte Reise in *Vorbereitung* (mit Platzhalter und gefüllten Infos), *Unterwegs* und *Danach*, damit Teilphasen in Demo und Vorschau vorführbar sind.

#### Datenhaltung (Vorgabe für Developer, Bewertung durch Reviewer)
| Was | Wo (Empfehlung) | Löschung / Datenschutz |
|---|---|---|
| Infoseite | neue Tabelle `trip_info` (1:1 zur Reise): `address`, `check_in`, `check_out`, `meeting_point`, `emergency_contact`, `notes` (Längen s. I8-10), `updated_by` (FK Konto, `ON DELETE SET NULL` → «ehemaliges Mitglied»), `updated_at`, `version` (Ganzzahl für Konflikt-Erkennung) | Kaskadierend mit der Reise (F-013, 90 Tage nach Reiseende bzw. Reise löschen); bleibt bei „Festlegung aufheben“ erhalten. Inhalte nie in Logs/Fehler-Tracking. Nicht Teil des persönlichen Datenexports (Reise-Inhalt, kein Profil der exportierenden Person) – Reviewer bestätigt. |
| V1 «Allen Bescheid geben» | `trips.fixed_announced_at` (timestamptz, null) | Zurücksetzen bei neuer Festlegung. |
| UX-9 für V2 | am Platzhalter: `without_app_at` + `without_app_by` (null = nicht markiert) | Mit dem Platzhalter gelöscht; Rückgängig = null. Für V3/V5 (Inkremente 9/12) folgt eine allgemeine Tabelle `trip_station_marks(trip_id, station, set_by, set_at)` – darf schon in Inkrement 8 angelegt werden, wenn das sauberer ist; gelesen wird beides über die Stations-Adapter. |
| UX-8 Abreisetag-Feier | an der Mitgliedschaft: `departure_celebrated_on` (date = gefeiertes Anreisedatum) | Feier zeigen, wenn heute = Anreisedatum und Wert ≠ Anreisedatum; dadurch automatisch neu bei geändertem Termin. Mit der Mitgliedschaft gelöscht. |
| Nur im Browser | Erledigt aufgeklappt (`sessionStorage`), «Neu erledigt» (`localStorage`: Reise-ID → Liste erledigter Stations-IDs), Konfetti-Sperre (Speicher) | Keine personenbezogenen Daten; keine Cookies. |

Migrationen: eine Migration für `trip_info`, `trips.fixed_announced_at`, Platzhalter-Spalten, `departure_celebrated_on` (ggf. `trip_station_marks`). Keine neuen Drittanbieter, kein Dateispeicher, nicht an G1b gebunden.

#### Nicht in Inkrement 8 (Abgrenzung)
| Kommt mit | Inhalt |
|---|---|
| **Inkrement 9** (F-031) | Station V3 „Unterkunft“ inkl. UX-9 «Haben wir schon / brauchen wir nicht», Kachel Unterkunft, RemindSheet-Anlässe `stay-rate`/`stay-fix`/`stay-book`, Infos «Aus Unterkunft übernehmen». |
| **Inkrement 10** (F-035/036) | Kachel Kosten, Aufgabe A1 (Schuld ≥ 50 €), Station D1 „Kosten ausgleichen“, Kopf-Tasten `[+ Ausgabe]` (unterwegs) und `[Ausgleichen]` (danach), Heute-Satz H-5 und Phasenzeile «Zurück · Kosten ausgleichen / alles ausgeglichen», Anlässe `settle`/`settle-all`. |
| **Inkrement 11** (F-056/F-054) | Markierung „Bucht“ (Reisemenü «Wer bucht?», Chips), Infos bearbeiten durch „Bucht“, Station V4 + D3, Kachel Reisedaten, Anlass `travel-data`. |
| **Inkrement 12** (F-055) | Station V5 inkl. UX-9 «Jede:r reist selbst an», Termine des Tages / Tage T1…Tn unterwegs, Ziel „Heimreise“ mit Rückreise-Unterlage, Kopf-Taste `[Tickets]`, Station D2, Kachel Unterlagen. |
| später | Check-in/-out als Datum + Uhrzeit (W22 Stufe 2), mehrere Orte, Station „Packen“ (F-032), „zuletzt erinnert“, Live-Updates. |

Aufwand: **M (≈ 1 Inkrement)**. Risiko: Weg-Logik und Längen-Budget (durch reine Funktion + Tests je Tabellenzeile beherrschbar), Konfetti-Performance auf alten Android-Geräten (vorhandene Feier-Technik wiederverwenden).

### R.7 Zuschnitt Inkrement 9 – Unterkünfte (F-031 Stufe 1) (2026-10-23)

**Ziel:** Nach der Festlegung sammelt die Gruppe Unterkünfte per Link an einem Ort, jede Person bewertet alle Vorschläge unbeeinflusst per Swipe, die Orga legt die Unterkunft fest und markiert sie als gebucht – sichtbar als **Station V3 „Unterkunft“** im Weg und danach als Kachel. Kein Dateispeicher, keine sensiblen Daten → nicht an G1b gebunden (echte Nutzung ab G1).

**Quellen (verbindlich):** F-031 (Steckbrief oben) · PRD §12 **Q33** (Rangliste erst nach eigenem Swipen, Orga sieht alles, Orga legt fest) und **Q34** (Bilder nur über unseren Server, nicht dauerhaft gespeichert; eigene Screenshots erst Inkrement 12) · Q31 (Löschung wie die Reise, 90 Tage) · Q36 (alles Free) · W16 v2.4 **V3**, v2.5 (Heute-Reihenfolge), v2.6 (Kacheln), v2.7 (UX-9), v2.8 (Anlässe `stay-rate`/`stay-fix`/`stay-book`), v2.10 (Adapter) · **W17** (Vorschlagen) und **W18** (Liste, Swipen, Rangliste, Festlegen) – werden von UI/UX parallel baureif gemacht. **Für UI, Texte, Zustände und Layout gilt die UX-Spec (W16/W17/W18); dieser Abschnitt regelt Daten, Rechte, Abgrenzung und Akzeptanz.** Bei Widerspruch in Rechten/Datenhaltung gilt R.7; UI/UX gleicht W17/W18 an.

**Voraussetzung für den Start der Umsetzung:** W17/W18 „baureif“ von UI/UX; Motion Designer liefert Swipe-Geste, Rückfedern, Stempel, Stapel-Ende-Siegel, Festlegen-Siegel (je mit reduzierter Variante); Designer liefert Platzhalterkarte (Bett-Icon, gestreift) und **6–8 eigene Demo-Bilder** für Unterkünfte (selbst erstellt/illustriert, keine fremden Fotos).

#### Im Umfang (Übersicht)
| Baustein | UX-Quelle | Feature |
|---|---|---|
| Bereich `/trips/{id}/stays` (Liste „Alle Vorschläge“, Rangliste/Sperrhinweis, „Eure Unterkunft“) | W18 A, C, D | F-031 |
| Vorschlagen `/trips/{id}/stays/new` mit Link-Vorschau (SSRF-sicher) und Platzhalterkarte | W17 | F-031 |
| Bild-Proxy (keine Drittserver im Browser, keine Daueraufbewahrung) | W17 „Datenschutz/Technik“ | F-031, Q34 |
| Swipen `/trips/{id}/stays/swipe` (Geste + Tasten + Tastatur, Rückgängig) | W18 B | F-031, F-052 |
| Rangliste mit Sichtbarkeitsregel (Q33) | W18 C | F-031 |
| Festlegen (Orga), «gebucht ✓» (Orga), Aufheben, Teilen-Text | W18 D | F-031 |
| Station **V3** + Kachel **Unterkunft** im Cockpit, UX-9 «Haben wir schon / brauchen wir nicht», Erinnern-Anlässe | W16 v2.4 V3, v2.6–v2.8 | F-053 |
| Infos «Aus Unterkunft übernehmen» | W22, W18 D | F-033 |
| Datenexport, Löschung, Demo-Seed | – | F-013, F-043 |

#### Rechte in Inkrement 9 (serverseitig geprüft, Ergänzung zu R.1)
„Bucher“ im Sinne von W16 V3 ist in Inkrement 9 **immer die Orga** (Markierung „Bucht“ kommt mit Inkrement 11). Platzhalter (F-007) handeln nicht.

| Aktion | Mitglied | Orga | Bedingung |
|---|---|---|---|
| Bereich ansehen, Vorschläge sehen | ✔ | ✔ | Mitglied der Reise, Phase `fixed` |
| Unterkunft vorschlagen, Link-Vorschau abrufen | ✔ | ✔ | keine Unterkunft festgelegt; < 30 Vorschläge |
| Bewerten (♥ / ✕), Bewertung ändern/zurücknehmen | ✔ | ✔ | keine Unterkunft festgelegt |
| Rangliste + Bewertungen anderer sehen | nach eigener Bewertung **aller aktuellen** Vorschläge – oder sobald festgelegt | **immer** | Q33 |
| Fortschritt «{x} von {n} haben bewertet» (nur Zahl) | ✔ | ✔ | – (wie Teilnahme-Zahlen F-007) |
| Eigenen Vorschlag bearbeiten (Titel, Preis, Notiz – nicht den Link) | ✔ (eigene) | ✔ (alle) | Should; nicht die festgelegte Unterkunft nach «gebucht» |
| Vorschlag löschen | ✔ (eigene) | ✔ (alle) | nicht die festgelegte Unterkunft (erst Festlegung aufheben) |
| Festlegen «Das wird's» / Festlegung aufheben | – | ✔ | auch wenn noch nicht alle bewertet haben («Schon festlegen») |
| «gebucht ✓» setzen / zurücknehmen | – | ✔ | nur für die festgelegte Unterkunft; „Bucht“ ab Inkrement 11 |
| V3 „ohne App erledigt“ (UX-9) setzen / rückgängig | – | ✔ | – |
| Anzahl Reisende für «≈ € pro Person» ändern | – | ✔ | Should |
| Infos «Aus Unterkunft übernehmen» | – | ✔ | wie Infos bearbeiten (I8-10); „Bucht“ ab Inkrement 11 |

Nicht-Mitglieder und andere Phasen: gleiche 404 wie die übrigen Reise-Unterseiten (I8-09). **Bewusste Festlegung (Abweichung zu W18 „Fehler & Sonderfälle“):** Wird die Termin-Festlegung aufgehoben, ist der Bereich wie die Infoseite **nicht erreichbar** (es gibt außerhalb von Phase 3 keinen Einstieg, UX-1); alle Daten bleiben erhalten und sind nach der nächsten Festlegung wieder da (s. I9-09).

#### User Stories & Akzeptanzkriterien

**I9-01 Bereich „Unterkünfte“ und Einstieg**
**Als** Mitglied **möchte ich** nach der Festlegung einen Ort haben, an dem alle Unterkunfts-Ideen liegen, **damit** sie nicht im Gruppenchat untergehen.
- [ ] Route `/trips/{id}/stays` (nur Mitglieder, nur Phase `fixed`); Aufbau, Leerzustand und Texte nach W18 A/C/D. Einstieg ausschließlich über Station V3 bzw. – sobald V3 erledigt ist – über die Kachel „Unterkunft“ (W16 v2.6); kein Tab (UX-1).
- [ ] „Alle Vorschläge (n)“ in neutraler Reihenfolge (Eingang, älteste zuerst), je Eintrag: Bild (Proxy) oder Platzhalter, Titel, Domain, «von {Name}» (gelöschtes Konto/ausgetreten → «ehemaliges Mitglied»), Preis + «≈ X pro Person» (falls Preis), eigene Bewertung als zwei `aria-pressed`-Tasten. **Ohne** Zahlen oder Namen anderer, solange die Rangliste für die Person gesperrt ist.
- [ ] Jede Karte öffnet das Portal in neuem Tab (`rel="noopener noreferrer"`, sichtbares «↗», sr-only «(öffnet neuen Tab)»); die Domain ist auf jeder Karte sichtbar.
- [ ] Statusangaben aktualisieren sich beim Neuladen (kein Live-Update, wie F-008).

**I9-02 Unterkunft vorschlagen**
**Als** Mitglied **möchte ich** eine Unterkunft mit einem Link vorschlagen, **damit** alle sie mit einem Tipp ansehen und bewerten können.
- [ ] Route `/trips/{id}/stays/new`; Felder: **Link** Pflicht (nur `https://`, ≤ 2 048 Zeichen, gültiger Hostname, keine Zugangsdaten `user:pass@`, keine IP-Literale), **Titel** Pflicht (≤ 80, vorbelegt aus der Vorschau, änderbar), **Gesamtpreis** optional (> 0, ≤ 1 000 000, max. 2 Nachkommastellen, Dezimaltrennzeichen gemäß Sprache, intern Cent als Ganzzahl, Währung der Reise), **Notiz** optional (≤ 200, Hinweis «Alle in der Reise können das lesen»). Validierung Client + Server (zod), Steuerzeichen entfernt, Ausgabe nur als Text (kein HTML/Markdown).
- [ ] **«≈ X pro Person»** = Gesamtpreis ÷ Anzahl Reisende, kaufmännisch auf ganze Währungseinheiten gerundet, immer mit «≈». Anzahl Reisende = Mitglieder + **nicht eingelöste Platzhalter** (auch „ohne App“ markierte, Q35-Logik); *Should:* Orga kann die Zahl überschreiben (1–50, „automatisch“ wiederherstellbar).
- [ ] **Max. 30 Vorschläge** pro Reise (gelöschte zählen nicht), geprüft unter Sperre der Reise; danach Taste deaktiviert mit Grund (W17).
- [ ] **Doppelter Link:** Vergleich über die normalisierte URL (Hostname klein ohne `www.`, ohne Fragment, ohne abschließenden `/`, Query ohne Tracking-Parameter wie `utm_*`, `fbclid`, `gclid`, `aid`/`label` – Liste im Code mit Tests für Booking-, Airbnb- und Ferienhaus-Beispiel-URLs) → Absenden gesperrt mit Hinweis (W17). Datenbank-Eindeutigkeit je Reise; Erkennung ist „best effort“ (Portale mit unterschiedlichen URLs für dieselbe Unterkunft werden nicht erkannt – akzeptiert).
- [ ] Absenden ist auch während laufender oder nach gescheiterter Vorschau möglich (W17): Liegt kein gültiges Vorschau-Ergebnis vor, startet der Server den Abruf nach dem Speichern im Hintergrund (`after()`, wie R-067) und ergänzt Bild/Site-Name; schlägt er fehl, bleibt die Platzhalterkarte.
- [ ] Neuer Vorschlag liegt sofort bei **allen** (auch der vorschlagenden Person) im Swipe-Stapel und sperrt die Rangliste für alle Mitglieder, die ihn noch nicht bewertet haben (W18 Grundregeln).
- [ ] Bei festgelegter Unterkunft: kein Vorschlagen (Route leitet um, W17), Server lehnt ab.

**I9-03 Link-Vorschau (best effort, SSRF-sicher)**
**Als** Mitglied **möchte ich**, dass Titel und Bild automatisch erscheinen, **damit** ich nichts abtippen muss – und nie warten muss, wenn ein Portal blockt.
- [ ] Server-Endpunkt für den Vorschau-Abruf nimmt nur **Mitglieder einer Reise in Phase `fixed`** an (reisebezogen, kein offener Dienst) und liefert Titel (`og:title`, sonst `<title>`), Site-Name (`og:site_name`, sonst Domain) und Bild-URL (`og:image`/`twitter:image`, relativ aufgelöst, muss ebenfalls `https://` sein). Texte: HTML-Entities dekodiert, Steuerzeichen entfernt, auf Feldlänge gekürzt, nur als Text angezeigt.
- [ ] Das Ergebnis geht als **serverseitig verschlüsseltes Vorschau-Token** (AES-256-GCM, Schlüssel per HKDF aus BETTER_AUTH_SECRET; enthält Reise, normalisierte URL, Bild-URL, Site-Name, Ablauf ≤ 30 min) an den Client; beim Speichern übernimmt der Server Bild-URL/Site-Name **nur aus einem gültigen Token** – vom Client gelieferte Bild-URLs werden nie übernommen.
- [ ] **Jeder Fehler** (blockiert, 4xx/5xx, Zeitlimit, zu groß, kein HTML, keine Metadaten, unsichere Adresse) ergibt dieselbe neutrale Antwort „keine Vorschau“ → Platzhalterkarte (W17); keine Fehlerdetails an den Client (kein Werkzeug zum Abtasten von Netzen). Das Vorschlagen wird nie blockiert.
- [ ] SSRF-Schutz und Limits: siehe **Sicherheit** unten (Pflicht, Reviewer prüft mit Tests).

**I9-04 Vorschaubilder über den Bild-Proxy (Q34)**
**Als** Mitglied **möchte ich** Bilder der Unterkünfte sehen, ohne dass mein Browser Kontakt zu fremden Servern aufnimmt, **damit** meine IP-Adresse nicht an Portale und Werbenetzwerke geht.
- [ ] Alle Vorschaubilder werden über einen eigenen Endpunkt ausgeliefert (gleiche Origin). **Kein offener Proxy:** Der Endpunkt nimmt keine frei wählbare URL an, sondern nur die ID eines gespeicherten Vorschlags (mit Mitgliedschaftsprüfung) bzw. ein verschlüsseltes Vorschau-Token (vor dem Speichern).
- [ ] Abruf mit demselben SSRF-Schutz wie I9-03; nur `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/avif`, Typ per **Magic Bytes** geprüft (Header des Fremdservers wird nicht vertraut); **kein SVG**; max. **4 MB** (Vercel-Antwortgrenze 4,5 MB; CEO 2026-10-23); Zeitlimit 5 s.
- [ ] Antwort mit eigenem `Content-Type` (aus Magic Bytes), `X-Content-Type-Options: nosniff`, `Content-Security-Policy: default-src 'none'; sandbox`, `Cache-Control: private, max-age=86400` (Browser-Cache ≤ 7 Tage erlaubt, nie `public` – keine geteilten Caches/CDN).
- [ ] **Keine dauerhafte Speicherung** der Bilddaten: nicht in DB, nicht im Objektspeicher, nicht in Backups. Erlaubt ist höchstens ein **flüchtiger** Server-Zwischenspeicher (Arbeitsspeicher/Temp-Verzeichnis, ≤ 7 Tage, nicht gesichert) – Entscheidung Developer/Operations; auf Vercel genügt der Browser-Cache. Gespeichert wird nur die **Bild-URL** (Verweis).
- [ ] Bild nicht ladbar → Platzhalterbild (dekorativ, `alt=""`); Inhalt steht immer als Text auf der Karte.
- [ ] *Should:* Response-Header `Content-Security-Policy: img-src 'self' data: blob:` für `/trips/*/stays*`, damit versehentliche Drittbilder vom Browser blockiert werden (aktuell gibt es keine globale CSP – Operations/Developer prüfen, ob sie global eingeführt wird).

**I9-05 Swipen**
**Als** Mitglied **möchte ich** alle Vorschläge schnell wie Karten durchswipen, **damit** ich ohne Diskussion meine Meinung abgebe.
- [ ] Route `/trips/{id}/stays/swipe`; Stapel = alle aktuellen Vorschläge **ohne eigene Bewertung** (auch eigene Vorschläge), älteste zuerst; Zähler als Text. Geste, Schwellen, Stempel, Rückfedern, Tasten (✕ / ↶ / ♥, SC 2.5.7), Tastatur ← / →, Strg/Cmd+Z, Live-Region, Stapel-Ende «Geschafft!», In-App-Browser-Schutz und reduzierte Bewegung nach W18 B und Motion-Spec.
- [ ] Jede Bewertung wird sofort gespeichert (optimistisches UI, Retry wie W18 „Fehler & Sonderfälle“); **Rückgängig** nimmt die zuletzt in dieser Sitzung abgegebene Bewertung zurück (Server: Bewertung löschen/auf vorigen Wert setzen).
- [ ] In der Liste (I9-01) bleibt die eigene Bewertung änderbar; erneutes Tippen auf die gedrückte Taste = zurück auf „offen“ (Bewertung gelöscht → Rangliste ggf. wieder gesperrt).
- [ ] Neue Vorschläge während des Swipens werden beim nächsten Laden hinten angehängt (Banner W18); gelöschte verschwinden mit Hinweis.
- [ ] Platzhalter können nicht bewerten; Bewertungen nach Festlegung der Unterkunft lehnt der Server ab (Route zeigt «Die Unterkunft steht schon»).

**I9-06 Rangliste & Sichtbarkeit (Q33)**
**Als** Mitglied **möchte ich** erst nach meiner eigenen Bewertung sehen, was den anderen gefällt, **damit** ich unbeeinflusst entscheide.
**Als** Orga **möchte ich** jederzeit den Stand sehen, **damit** ich weiß, wann ich festlegen kann.
- [ ] „Fertig“ = die Person hat **jeden aktuellen** (nicht gelöschten) Vorschlag bewertet. Ein neuer Vorschlag macht alle, die ihn nicht bewertet haben, wieder „nicht fertig“.
- [ ] **Serverseitig durchgesetzt:** Für nicht fertige Mitglieder liefert der Server **keine** Zählwerte, Namen oder Reihenfolge der Bewertungen anderer aus (weder in HTML/RSC-Payload noch in API-Antworten) – nur eigene Bewertungen und die Fortschrittszahl. Test je Rolle/Zustand. Orga erhält immer alles. Nach Festlegung der Unterkunft sehen **alle** die Rangliste (Swipen ist beendet).
- [ ] Sortierung als reine, getestete Funktion: (1) meiste ♥, (2) wenigste ✕, (3) niedrigerer Preis pro Person (ohne Preis = hinter allen mit Preis), (4) früher vorgeschlagen. Platz 1 nur, wenn mindestens ein ♥ existiert.
- [ ] Nach Freischaltung: je Vorschlag ♥- und ✕-Zahl, ♥ **namentlich** (Transparenz wie F-011); ✕ nur als Zahl (kein Bloßstellen). Ausgetretene Personen zählen nicht mehr (Bewertungen gelöscht).
- [ ] Fortschritt «{x} von {n} haben bewertet»: n = aktuelle Mitglieder (ohne Platzhalter), x = davon „fertig“.

**I9-07 Unterkunft festlegen, gebucht, aufheben**
**Als** Orga **möchte ich** die Gewinner-Unterkunft festlegen und als gebucht markieren, **damit** alle wissen, woran sie sind.
- [ ] «Das wird's» (nur Orga, Bestätigung W18 D) setzt genau **eine** festgelegte Unterkunft je Reise (DB-Eindeutigkeit); Swipen und Vorschlagen enden; kleine Feier ohne Konfetti (Siegel + Snackbar, W18 D); Teilen-Text «Unsere Unterkunft: {Titel} {Link}» (DE/EN) über das vorhandene Teilen-Sheet.
- [ ] «Als gebucht markieren» / Rückgängig (nur Orga in Inkrement 9) speichert Zeitpunkt + Person; sichtbar für alle als «gebucht ✓» bzw. «noch nicht gebucht» (Wort + Icon, nie nur Farbe).
- [ ] «Festlegung aufheben» (nur Orga, Bestätigung) setzt Festlegung **und** «gebucht» zurück; Swipen/Vorschlagen sind wieder möglich, Bewertungen bleiben erhalten.
- [ ] Die festgelegte Unterkunft kann nicht gelöscht werden (erst aufheben). Löschen anderer Vorschläge bleibt möglich.

**I9-08 Station V3, Kachel „Unterkunft“, Erinnern, UX-9 (F-053)**
**Als** Mitglied **möchte ich** im Weg sehen, wo wir bei der Unterkunft stehen und ob ich dran bin, **damit** ich nicht nachfragen muss.
- [ ] Adapter für `tripRoute()` (Vertrag W16 v2.10) liefert Station **V3** mit den Zuständen der Tabelle W16 v2.4 V3 je Rolle (Mitglied / Orga; „bucht“-Spalte entfällt bis Inkrement 11, „Bucher“ = Orga). Unit-Tests **je Zeile** der V3-Tabelle und je Rolle; Heute-Reihenfolge nach W16 v2.5 (V3 festlegen = blockiert andere; V3 buchen = Frist/Datum; V3 bewerten = eigener Beitrag).
- [ ] Erledigt, wenn die festgelegte Unterkunft «gebucht ✓» ist **oder** die Orga V3 „ohne App erledigt“ markiert hat. Danach erscheint die **Kachel „Unterkunft“** in „Immer griffbereit“ (Reihenfolge W16 v2.6) mit einer Statuszeile (Wortlaut UX) → `/stays`.
- [ ] **UX-9:** Orga markiert V3 «Haben wir schon / brauchen wir nicht» (je Reise, für alle sichtbar als «ohne App erledigt», rückgängig in der Erledigt-Gruppe; serverseitig nur Orga). Der Bereich bleibt über die Kachel nutzbar. Wird später eine Unterkunft festgelegt und gebucht, ist der Merker gegenstandslos.
- [ ] Teilphasen: Ist V3 bei Anreise nicht erledigt, wird sie im Vorbereitungs-Block als «nicht genutzt» gezeigt (W16 v2.4); der Bereich bleibt in *Unterwegs*/*Danach* über die Kachel erreichbar, sobald es mindestens einen Vorschlag gibt.
- [ ] Erinnern über das vorhandene `RemindSheet` (F-015) mit den Anlässen **`stay-rate`** (an Mitglieder, die nicht fertig sind), **`stay-fix`** (an die Orga, wenn alle fertig sind), **`stay-book`** (an den Bucher = Orga) – Texte DE/EN nach W16 v2.8; Texte enthalten Reisename, Link zur Reise und ggf. Titel der Unterkunft, nie Notizen oder Preise anderer.
- [ ] Station nie gebaut/genutzt (keine Vorschläge, kein Merker): Zustand nach W16 „Bereich noch nie genutzt“ – keine Aufgabe, kein Erinnern.

**I9-09 Termin-Änderung und Infos übernehmen**
**Als** Mitglied **möchte ich** gewarnt werden, wenn sich der Termin nach dem Sammeln geändert hat, **damit** wir nicht für falsche Daten buchen.
- [ ] Wird die Termin-Festlegung aufgehoben, bleiben Vorschläge, Bewertungen und Festlegung gespeichert (R.0 Nr. 1); der Bereich ist bis zur nächsten Festlegung nicht erreichbar.
- [ ] **Neue Festlegung mit anderem Zeitraum:** «gebucht» wird automatisch zurückgesetzt (die Buchung galt für andere Daten); die Festlegung der Unterkunft bleibt. Im Bereich erscheint ein Hinweis «Euer Termin hat sich geändert – prüft Preise und Verfügbarkeit.» (Wortlaut UX), solange es Vorschläge gibt, die vor der aktuellen Festlegung angelegt wurden, bis die Orga ihn schließt. Gleicher Zeitraum erneut festgelegt → nichts ändert sich.
- [ ] **Infos «Aus Unterkunft übernehmen»** (Orga, in `/info/edit` bzw. als Text-Taste auf „Eure Unterkunft“): übernimmt den **Titel** der festgelegten Unterkunft in `trip_info.stay_name` und öffnet das Bearbeiten-Formular vorbelegt (nicht automatisch speichern). Eine **Adresse** wird nicht übernommen (die Vorschau liefert sie nicht verlässlich; Portale zeigen die genaue Adresse oft erst nach der Buchung) – Hinweis im Feld Adresse (Wortlaut UX).

**I9-10 Datenschutz, Export, Löschung**
**Als** Mitglied **möchte ich**, dass meine Bewertungen und Vorschläge nach denselben Regeln wie die Reise gelöscht werden, **damit** nichts liegen bleibt.
- [ ] Alles zu Unterkünften wird **mit der Reise gelöscht** (F-013, 90 Tage nach Reiseende bzw. „Reise löschen“, Q31) – per Fremdschlüssel-Kaskade; Löschjob muss nichts Zusätzliches tun (Test).
- [ ] **Reise verlassen / entfernt werden:** eigene Bewertungen werden gelöscht; eigene Vorschläge bleiben für die Gruppe, Urheber erscheint als «ehemaliges Mitglied» (Verweis auf die Person entfernt). **Konto löschen (F-043):** ebenso. Festlegung/«gebucht» durch eine gelöschte Person bleiben bestehen, ohne Namen.
- [ ] **Datenexport (F-013, Q23):** je Reise die **eigenen** Vorschläge (Link, Titel, Preis + Währung, Notiz, angelegt am) und **eigenen** Bewertungen (Titel des Vorschlags, ♥/✕, Zeitpunkt). Keine Bewertungen/Notizen anderer, keine Bilder, keine Bild-URLs nötig.
- [ ] Notizen, Titel, Links und Bild-URLs erscheinen nie in Logs, Fehler-Tracking oder Mails (Ausnahme: Teilen-Texte, die die Person selbst auslöst). Vorschau-Abrufe loggen höchstens Hostname + Ergebnis-Kategorie (ok / blockiert / Zeitlimit / unsicher), keinen Pfad, keine Query.
- [ ] Operations ergänzt vor G1 die Datenschutzerklärung (Platzhalter) um den Abschnitt „Unterkünfte & Link-Vorschau“: Abruf fremder Seiten erfolgt durch unseren Server, ohne Daten der Person; Bilder werden nicht gespeichert; Notizen sind für die Reise sichtbar.

**I9-11 Querschnitt (Abnahme)**
- [ ] 360 × 640, 390 × 844, 320 px, 200 % Schrift, Dark Mode, DE/EN, Desktop ≥ 960 px (W17/W18 „Desktop“); Swipe mit Finger, Maus, Tastatur und nur Tasten bedienbar; Screenreader-Durchlauf Vorschlagen → Swipen → Rangliste → Festlegen.
- [ ] In-App-Browser (WhatsApp/Instagram iOS + Android): Swipe kollidiert nicht mit „Zurück wischen“ (W18 B); Tasten funktionieren immer.
- [ ] Reduzierte Bewegung (System oder Konto-Schalter): keine Flugbahn, Überblenden 140 ms; kein Konfetti bei Festlegen der Unterkunft.
- [ ] Abnahme-Fälle: Anna als Mitglied mit offenen Vorschlägen (Rangliste gesperrt, keine fremden Daten im Payload) · Anna fertig (Rangliste sichtbar) · Orga vor/nach „alle fertig“ (V3 dran «Festlegen») · festgelegt, nicht gebucht · gebucht (V3 erledigt, Kachel) · V3 „ohne App erledigt“ · Portal blockiert Vorschau (Platzhalter) · Termin neu festgelegt (Hinweis, «gebucht» zurückgesetzt) · 30er-Grenze · Person verlässt die Reise.

#### Sicherheit (Pflicht – Reviewer prüft mit Tests)
**SSRF-Schutz für jeden ausgehenden Abruf (Seite und Bild)** – als eine gemeinsame, isoliert getestete Server-Funktion (Node-Runtime, nicht Edge):
1. **Nur `https:`**, nur Port 443, nur `GET`; keine Zugangsdaten in der URL; Hostname statt IP-Literal; URL ≤ 2 048 Zeichen.
2. **Nur öffentliche Adressen:** DNS-Auflösung durch uns, **jede** aufgelöste Adresse wird geprüft und **die Verbindung geht an genau die geprüfte Adresse** (DNS-Pinning gegen DNS-Rebinding). Gesperrt u. a.: `0.0.0.0/8`, `10.0.0.0/8`, `100.64.0.0/10`, `127.0.0.0/8`, `169.254.0.0/16` (inkl. Cloud-Metadaten `169.254.169.254`), `172.16.0.0/12`, `192.0.0.0/24`, `192.0.2.0/24`, `192.168.0.0/16`, `198.18.0.0/15`, `198.51.100.0/24`, `203.0.113.0/24`, `224.0.0.0/4`, `240.0.0.0/4`, `255.255.255.255`; IPv6 `::`, `::1`, `fc00::/7`, `fe80::/10`, `ff00::/8`, `2001:db8::/32`, `64:ff9b::/96` u. ä., sowie IPv4-gemappte/-eingebettete IPv6-Adressen (`::ffff:10.0.0.1`) nach Umrechnung. Hostnamen wie `localhost`, `*.local`, `*.internal` werden vorab abgewiesen.
3. **Weiterleitungen:** manuell verfolgt, **max. 3**, jede Ziel-URL durchläuft Regeln 1–2 erneut (auch `https` → `http` wird abgewiesen).
4. **Limits:** Gesamt-Zeitlimit **5 s** je Abruf (inkl. Verbindung und Weiterleitungen); HTML **max. 1 MB**, Bild **max. 4 MB** – Abbruch beim Streamen, nicht erst nach dem Laden; HTML nur bei `text/html`/`application/xhtml+xml`; komprimierte Antworten nur mit Größenprüfung **nach** Dekompression (Schutz vor Kompressionsbomben).
5. **Keine Weitergabe:** keine Cookies (weder senden noch speichern), kein `Authorization`, keine Header der Nutzeranfrage (keine IP, kein `X-Forwarded-For`, keine Sprache der Person über die Reise-Sprache hinaus), kein `Referer`; eigener User-Agent `WirWollenWeg-LinkPreview/1.0` (Kontakt-URL nach G1 ergänzen).
6. **Parsen:** nur Meta-Tags/Title mit einem robusten Parser, kein Ausführen von Skripten, kein Nachladen weiterer Ressourcen außer dem einen Vorschaubild.
7. **Einheitliche Fehlerantwort** (I9-03) – keine Unterscheidung „Port zu“ vs. „blockiert“ nach außen.

**Rate-Limits** (pro **Konto**, gleicher Mechanismus wie `src/server/rate-limit.ts`, Fenster ≤ 1 h; Werte als Vorgabe, Developer darf begründet anpassen):
| Aktion | Limit |
|---|---|
| Link-Vorschau abrufen | 20 / 10 min und 60 / h je Konto |
| Vorschlag anlegen | 10 / 10 min je Konto (zusätzlich Obergrenze 30 je Reise) |
| Bewerten / Rückgängig | 300 / 10 min je Konto |
| Bild-Proxy | 600 / 10 min je Konto (Browser-Cache entlastet) |
| Festlegen / gebucht / UX-9 / Löschen | wie andere Schreibaktionen der Orga |
Überschreitung: Vorschau → Platzhalterkarte (still), übrige Aktionen → bestehende Limit-Meldung. *Could:* app-weit max. 30 Abrufe/min je Ziel-Hostname, damit wir kein Portal belasten.

**Weitere Pflichten:** alle Rechte aus der Tabelle oben serverseitig (Tests je Zeile, inkl. Nicht-Mitglied und falsche Reise-ID für Vorschlag/Bewertung → keine Reise-übergreifenden Zugriffe); Links in der UI nur `https:` (Schema beim Rendern erneut prüfen, kein `javascript:`); Titel/Notizen/Site-Name nur als Text.

#### Datenhaltung (Vorgabe für Developer, Bewertung durch Reviewer)
| Was | Wo (Empfehlung) | Löschung / Datenschutz |
|---|---|---|
| Vorschläge | neue Tabelle `trip_stay`: `id`, `trip_id` (FK, `ON DELETE CASCADE`), `url` (≤ 2 048, `https://`), `url_normalized` (eindeutig je Reise), `title` (≤ 80), `price_cents` (Ganzzahl, null), `currency` (ISO 4217, Währung der Reise beim Anlegen), `note` (≤ 200, null), `preview_image_url` (null, nur `https://`), `preview_site_name` (≤ 80, null), `preview_status` (`pending` / `ok` / `none`), `created_by` (FK Konto, `ON DELETE SET NULL` → «ehemaliges Mitglied»), `created_at`, `updated_at` | Kaskade mit der Reise (90 Tage, F-013). Beim Verlassen der Reise: `created_by` auf null setzen (aktiv im Austritts-Code, da die Mitgliedschaft – nicht das Konto – endet). Inhalte nie in Logs. |
| Bewertungen | neue Tabelle `trip_stay_rating`: `stay_id` (FK `ON DELETE CASCADE`), `trip_id`, `user_id`, `value` (`like` / `nope`), `rated_at`; PK (`stay_id`, `user_id`); zusammengesetzter FK (`trip_id`, `user_id`) → `trip_member` `ON DELETE CASCADE` (wie `availability`) | Verschwindet automatisch beim Verlassen/Entfernen, beim Löschen des Vorschlags und mit der Reise. „Offen“ = keine Zeile. |
| Festlegung & gebucht | an der Reise: `trip.chosen_stay_id` (FK `trip_stay`, `ON DELETE RESTRICT`), `stay_chosen_at`, `stay_chosen_by`, `stay_booked_at`, `stay_booked_by` (FKs Konto `ON DELETE SET NULL`); Alternative: Spalten am Vorschlag mit Teil-Unique-Index „max. eine festgelegte je Reise“ – Developer entscheidet, Hauptsache DB-garantiert eindeutig | Aufheben = null. Neue Termin-Festlegung mit anderem Zeitraum setzt `stay_booked_*` zurück (I9-09). |
| Termin-Hinweis | `trip.stay_date_notice_dismissed_at` (null) oder Ableitung aus `trip_stay.created_at < trip.fixed_at` + Merker | Mit der Reise gelöscht. |
| Anzahl Reisende (Should) | `trip.party_size_override` (1–50, null = automatisch) | Wird in Inkrement 10 für „€ pro Person“ wiederverwendet, nicht für die Kostenaufteilung. |
| Währung der Reise | `trip.currency` (ISO 4217), Standard aus der Feiertagsregion der Reise bzw. Region der Orga (EUR für Euro-Länder, GBP, CHF, USD …); Änderung durch die Orga kommt mit Inkrement 10 (F-035) | Wird von F-035 übernommen – deshalb schon jetzt anlegen, nicht doppelt. |
| UX-9 V3 | `trip_station_marks(trip_id, station, set_by, set_at)` mit `station = 'V3'` (in Inkrement 8 angekündigt, R.6 Datenhaltung) – jetzt anlegen; PK (`trip_id`, `station`) | Kaskade mit der Reise; `set_by` `ON DELETE SET NULL`. |
| Vorschau-Ergebnis vor dem Speichern | **nicht in der DB** – nur im verschlüsselten Token (I9-03) | Läuft nach ≤ 30 min ab. |
| Vorschaubilder | **nirgends dauerhaft** (Q34) – nur Browser-Cache `private` ≤ 7 Tage, optional flüchtiger Server-Cache ≤ 7 Tage | Kein Backup, kein Objektspeicher. |
| Nur im Browser | Stapel-Position, „letzter Swipe“ für Rückgängig (`sessionStorage`), ausstehende Bewertungen bei Netzfehler | Keine Cookies. |

Migrationen: eine Migration (`0010`) für `trip_stay`, `trip_stay_rating`, `trip_station_marks`, Spalten an `trip`. Keine neuen Drittanbieter-Konten, kein Dateispeicher, nicht an G1b gebunden. Neue ausgehende Verbindungen nur durch den Server (Link-Vorschau) → Operations prüft Firewall/Egress der Docker-Demo und Vercel (Node-Runtime).

#### Demo-Seed (`seed.ts`, „Demo zurücksetzen“)
- **Neue Reise in *Vorbereitung*, Anna ist Mitglied (nicht Orga)**, z. B. „Sommerhaus Dänemark“ (Orga Ben, ~5 Mitglieder + 1 Platzhalter, Anreise in ~60 Tagen): 6 Vorschläge, Anna hat 2 bewertet → V3 „du bist dran“, Rangliste gesperrt; einer der Vorschläge ohne Bild (Platzhalterkarte), einer von einem «ehemaligen Mitglied», einer mit Notiz.
- **„Familientreffen Harz“** (Anna Orga): 4 Vorschläge, alle Mitglieder fertig → V3 Orga „du bist dran – Festlegen“, Favorit «Ferienhaus Brockenblick» passend zu den Infos.
- **„Roadtrip Schottland“** (*Unterwegs*): «Glen Coe Cottages» festgelegt und **gebucht** → V3 erledigt, Kachel „Unterkunft“.
- **„Gardasee“** (*Danach*): V3 per UX-9 «Haben wir schon» erledigt (Beispiel „ohne App“).
- Bilder: nur **eigene Demo-Bilder** des Designers (statisch unter `public/`, direkt ausgeliefert, kein Proxy nötig); **keine fremden Fotos, keine echten Portal-Links** – Links auf reservierte Beispiel-Domains (z. B. `https://ferienhaus.example/…`, RFC 2606), damit die Demo nichts Echtes vortäuscht und offline funktioniert. Die Live-Vorschau eines echten Links ist in der Demo trotzdem vorführbar (Abruf echter öffentlicher Seiten ist unkritisch, R.5).

#### Nicht in Inkrement 9 (Abgrenzung)
| Kommt mit | Inhalt |
|---|---|
| **Inkrement 10** (F-035/036) | Änderung der Reise-Währung durch die Orga, Unterkunftspreis als Ausgabe übernehmen (Idee, nicht zugesagt), „€ pro Person“-Logik in Kosten. |
| **Inkrement 11** (F-056/F-054) | Markierung „Bucht“: «gebucht ✓» setzen und Infos übernehmen auch durch „Bucht“; V3-Spalte „bucht“ und Anlass `stay-book` an „Bucht“ statt Orga. |
| **Inkrement 12** (F-055 + F-031 Stufe 2) | Bis zu 3 **eigene Screenshots** je Vorschlag (Dateispeicher, Scan, EXIF), Rückfall bei blockierter Vorschau. |
| später | Superlike, Kommentare je Unterkunft, Vergleichsansicht, mehrere Unterkünfte (Rundreise), Ort/Schlafplätze als Felder, Erinnerung per E-Mail (F-014), Live-Updates, Premium-Extras (R.3). |
| nie (Nicht-Ziel) | Buchung in der App, Preis-/Verfügbarkeitsabfrage bei Portalen, Affiliate-Links. |

Aufwand: **M–L (≈ 1–1,5 Inkremente)**. Risiko: Link-Vorschau (viele Portale blocken → Platzhalter ist Normalfall, nicht Fehler), SSRF-Härtung (gemeinsame Funktion + Tests), Swipe im In-App-Browser (Tasten als gleichwertiger Weg).

### R.8 Zuschnitt Inkrement 10 – Kosten teilen (F-035 + F-036 Stufe 1) (2026-10-23)

**Ziel:** Ab der Festlegung trägt jede Person der Reise Ausgaben in Sekunden ein (wer hat bezahlt, für wen, gleich oder nach Beträgen), alle sehen jederzeit ihren Saldo, und am Ende gleicht die Gruppe mit möglichst wenigen Überweisungen aus – sichtbar im Cockpit als Kachel „Kosten“, Aufgabe **A1** unter „Heute“ und Station **D1 „Kosten ausgleichen“** in *Danach*. **Die App bewegt kein Geld** (R.0 Nr. 6): Sie rechnet und zeigt, wer wem was schuldet; Überweisungen passieren außerhalb. Keine Dateien, keine sensiblen Daten im Sinne von G1b → echte Nutzung ab **G1**.

**Quellen (verbindlich):** F-035/F-036 (Steckbrief oben) · PRD §12 **Q35** (ab Festlegung; eine Währung pro Reise; gleich oder nach Beträgen; Platzhalter rechnen mit; freiwillige Zahlungsinfo sichtbar für die Reise; Verlassen mit offenem Saldo nur nach Warnung, Ausgaben bleiben mit «ehemaliges Mitglied»; Fremdwährungen/Belegfotos/Export/mehrere Zahler später) · **Q36** (unbegrenzte Ausgaben, alles hier Free) · **Q31** (Ausgaben werden mit der Reise gelöscht, 90 Tage) · **UX-3** in der Fassung W16 v2.4 (Schulden-Aufgabe A1 ab 50 € in *Vorbereitung* und *Unterwegs*, in *Danach* übernimmt D1) · W16 v2.1 (Kopf-Tasten `[+ Ausgabe]` / `[Ausgleichen]`), v2.4 (A1, D1-Tabelle, Phasenzeile *Danach*), v2.5 (Heute-Reihenfolge, H-5/H-5b), v2.6 (Kachel Kosten), v2.8 (Anlässe `settle`, `settle-all`), v2.10 (Adapter), v2.12 U-30 (`[Abschließen]` immer sekundär) · **W19** (Ausgaben, Formular, Salden & Ausgleich) – wird von UI/UX parallel baureif gemacht. **Für UI, Texte, Zustände und Layout gilt die UX-Spec (W16/W19); dieser Abschnitt regelt Daten, Rechte, Rechenregeln, Abgrenzung und Akzeptanz.** Bei Widerspruch in Rechten, Rechenregeln oder Datenhaltung gilt R.8; UI/UX gleicht W19 an. R.8 präzisiert den Steckbrief F-035/F-036 (dort u. a. „minimale Zahl von Überweisungen“ und „Zahlungshinweis Freitext“) – bei Widerspruch gilt R.8.

**Voraussetzung für den Start der Umsetzung:** W19 „baureif“ von UI/UX (inkl. Währung ändern, Konfliktmeldung, IBAN-Feld mit Maskierung, Warnung beim Abschließen mit offenen Salden, Platzhalter-Löschsperre, Texte für mehrere ehemalige Mitglieder «ehemaliges Mitglied 1», «… 2»); Designer liefert 5 Kategorie-Icons, Leer-Illustration «Noch keine Ausgaben» und das kleine Siegel «Alles ausgeglichen»; Motion Designer liefert Saldo-Wechsel (Zahl zählt nicht hoch – nur Überblenden, reduziert: sofort), «Als bezahlt markieren» → Eintrag wandert nach „Bereits bezahlt“, Siegel «Alles ausgeglichen» (je mit reduzierter Variante; kein Konfetti).

#### Im Umfang (Übersicht)
| Baustein | UX-Quelle | Feature |
|---|---|---|
| Bereich `/trips/{id}/costs` (Dein Stand, Ausgaben nach Tag, Detail-Sheet, Leer-/Abgeschlossen-Zustand) | W19 A | F-035 |
| Ausgabe hinzufügen/bearbeiten `/costs/new`, `/costs/{expenseId}/edit` (gleich / nach Beträgen, Platzhalter, Kategorie, Datum), Löschen mit Rückgängig | W19 B | F-035 |
| Salden & Ausgleich `/costs/balances` (Ausgleichsvorschlag, «Als bezahlt markieren», „Bereits bezahlt“, Salden je Person) | W19 C | F-036 |
| Zahlungsinfo je Person und Reise (IBAN geprüft + maskiert, Freitext z. B. PayPal-Name) | W19 C | F-036, Q35 |
| Abrechnung abschließen / wieder öffnen (Orga), Teilen-Text «Abrechnung …» | W19 C | F-036 |
| Währung der Reise ändern (Orga, solange keine Ausgabe existiert) | W19 (Ergänzung) | F-035 |
| Cockpit: Kachel **Kosten**, Aufgabe **A1**, Station **D1**, Kopf-Tasten `[+ Ausgabe]` (*Unterwegs*) und `[Ausgleichen]` (*Danach*), Phasenzeile *Danach*, H-5/H-5b, Erinnern-Anlässe `settle`/`settle-all` | W16 v2.1, v2.4–v2.8 | F-053 |
| Reise verlassen / entfernen / Konto löschen mit offenem Saldo (Warnung, «ehemaliges Mitglied») | W19 „Reise verlassen“ | F-013, F-004, F-043, Q35 |
| Platzhalter übernehmen (Saldo geht mit), Platzhalter-Löschsperre | – | F-007 |
| Datenexport, Löschung, Lösch-Hinweismail mit offenen Salden, Demo-Seed | – | F-013, F-043 |
| *Could:* «Als Ausgabe eintragen» bei der gebuchten Unterkunft (Formular vorbelegt) | W18 D (Ergänzung) | F-031 → F-035 |

#### Begriffe
- **Person der Abrechnung** (technisch *Partei*): jede Person, die in Ausgaben oder Ausgleichen vorkommt – **Mitglied** (Konto), **offener Platzhalter** (F-007, nicht eingelöst; auch „ohne App“ markierte) oder **ehemaliges Mitglied** (hat die Reise verlassen, wurde entfernt oder hat das Konto gelöscht). Ehemalige Mitglieder behalten ihre Beträge, aber **keinen Namen**; gibt es mehrere, heißen sie in fester Reihenfolge (Zeitpunkt des Austritts) «ehemaliges Mitglied 1», «… 2».
- **Aktive Personen** = Mitglieder + offene Platzhalter. Nur sie können in **neuen** Ausgaben als Zahler oder Beteiligte gewählt werden.
- **Saldo** einer Person = Summe der von ihr bezahlten Ausgaben − Summe ihrer Anteile + von ihr geleistete Ausgleichszahlungen − von ihr empfangene Ausgleichszahlungen. Positiv = «bekommt», negativ = «schuldet», 0 = «ausgeglichen ✓». **Summe aller Salden = 0** (Invariante, Test).
- **Offen** = mindestens ein Saldo ≠ 0.

#### Rechte in Inkrement 10 (serverseitig geprüft, Ergänzung zu R.1)
„Bucht“ (Inkrement 11) hat bei Kosten **keine** Sonderrechte. Platzhalter und ehemalige Mitglieder handeln nie selbst.

| Aktion | Mitglied | Orga | Bedingung |
|---|---|---|---|
| Bereich ansehen: alle Ausgaben, alle Salden, Ausgleichsvorschlag, Zahlungsinfos | ✔ | ✔ | Mitglied der Reise, Phase `fixed` (Transparenz – Q35: Kosten sind für die Reise sichtbar) |
| Ausgabe anlegen (Zahler und Beteiligte frei wählbar unter den **aktiven** Personen, auch Platzhalter als Zahler) | ✔ | ✔ | nicht abgeschlossen |
| Ausgabe bearbeiten / löschen / Löschen rückgängig | ✔ wenn **angelegt** oder **bezahlt** (Zahler = eigene Person) | ✔ **alle** | nicht abgeschlossen; Konfliktschutz über `version` |
| «Als bezahlt markieren» (Ausgleichszahlung buchen) | ✔ wenn selbst **Zahlende** oder **Empfangende** | ✔ als Zahlende/Empfangende; **zusätzlich**, wenn **keine** der beiden Seiten ein aktives Mitglied mit Konto ist (Platzhalter/ehemaliges Mitglied auf beiden Seiten) | nicht abgeschlossen; Betrag ≤ aktuell offene Schuld (s. I10-06) |
| Ist eine Seite Platzhalter oder ehemaliges Mitglied | die **andere** Seite markiert (W19: «Mia → Lena: Lena markiert den Eingang») | wie links | – |
| Ausgleichszahlung rückgängig | ✔ Zahlende, Empfangende oder wer markiert hat | ✔ | nicht abgeschlossen |
| Eigene Zahlungsinfo hinterlegen / ändern / löschen | ✔ | ✔ | jederzeit, auch abgeschlossen |
| Zahlungsinfo **anderer** ändern | – | – (auch Orga nicht) | nie |
| Währung der Reise ändern | – | ✔ | keine nicht gelöschte Ausgabe und keine Ausgleichszahlung vorhanden |
| Abrechnung abschließen / wieder öffnen | – | ✔ | Abschließen mit offenen Salden nur nach Warnung (I10-08) |
| Erinnern `settle` (eigene Forderung) | ✔ an die eigenen Schuldner laut Vorschlag | ✔ | – |
| Erinnern `settle-all` (alle offenen Ausgleiche) | – | ✔ | – |
| Platzhalter löschen (F-007) | – | ✔ | **gesperrt**, solange der Platzhalter in einer Ausgabe oder Ausgleichszahlung vorkommt (Hinweis mit Anzahl, Wortlaut UX) |

**Orga darf alles bearbeiten/löschen** (R.1 „auch fremde“) – bewusst: In Freundesgruppen pflegt oft eine Person die Kasse nach, und wer nicht in der App ist (Platzhalter), braucht jemanden, der für ihn korrigiert. Ausgleichszahlungen zwischen zwei handlungsfähigen Mitgliedern markiert die Orga dagegen **nicht** für andere – ob Geld zwischen Kemal und Lena geflossen ist, wissen nur die beiden (gleiche Haltung wie W16 D1 „Geld zwischen anderen geht mich nichts an“). Jede Änderung zeigt «angelegt von / zuletzt geändert von {Name}, {Datum}».

Nicht-Mitglieder und andere Phasen: gleiche 404 wie die übrigen Reise-Unterseiten (I8-09). Wird die Termin-Festlegung aufgehoben, ist der Bereich wie Infoseite und Unterkünfte **nicht erreichbar**; alle Daten bleiben erhalten und sind nach der nächsten Festlegung unverändert wieder da (Ausgaben hängen nicht am Reisedatum; R.0 Nr. 1).

#### Rechenregeln (Pflicht – reine, getestete Funktionen in `src/lib/`)
1. **Geld nur als Ganzzahl in Cent** (kleinste Einheit der Reisewährung), nie als Gleitkommazahl – in DB, Server, Client-Logik und Tests. Eingabe-Parsen mit dem vorhandenen Preis-Parser aus I9-02 (Komma/Punkt je Sprache, max. 2 Nachkommastellen); Ausgabe über `formatMoney()`. Summen über viele Ausgaben in JS-`number` (sicher bis 2⁵³) bzw. SQL `bigint` – nie in `int4` aufsummieren.
2. **Grenzen je Ausgabe:** 1 Cent ≤ Betrag ≤ 1 000 000,00 (= 100 000 000 Cent, wie Unterkunftspreis); Anteile je Person ≥ 0; **Summe der Anteile = Betrag** (Server prüft, DB speichert die Anteile ausdrücklich, s. Datenhaltung).
3. **Aufteilung „gleich“:** Basis = ⌊Betrag ÷ n⌋, Rest r = Betrag − n × Basis (0 ≤ r < n). Die **ersten r Beteiligten in fester Reihenfolge** erhalten je 1 Cent mehr. Feste Reihenfolge = Reihenfolge der Personen der Abrechnung nach `seq` (Anlage-Reihenfolge in der Reise, aufsteigend). Beispiel 100,00 € auf 3 → 33,34 · 33,33 · 33,33. Die Anteile werden **beim Speichern berechnet und gespeichert**; spätere Änderungen der Personenliste ändern alte Ausgaben nicht. Bearbeiten einer „gleich“-Ausgabe berechnet neu. (Bewusst einfach: max. n−1 Cent Unterschied je Ausgabe; eine „gerechte Rotation“ des Rest-Cents bringt Nutzern nichts Sichtbares.)
4. **Aufteilung „nach Beträgen“:** je beteiligter Person ein Betrag ≥ 0,01; Summe muss **exakt** dem Gesamtbetrag entsprechen, sonst lehnt der Server ab (Client zeigt live «Noch 12,00 € zu verteilen» / «3,00 € zu viel verteilt» / «✓ Passt genau», W19). Personen mit 0 sind nicht beteiligt.
5. **Saldo** wie unter „Begriffe“; gelöschte (`deleted_at`) Ausgaben zählen nicht.
6. **Ausgleichsvorschlag** `settleUp(balances)` – deterministisch, reine Funktion:
   a. Nur Personen mit Saldo ≠ 0. Schuldner (negativ) und Gläubiger (positiv) jeweils sortiert nach Betrag absteigend, bei Gleichstand nach `seq` aufsteigend.
   b. **Vorstufe exakte Paare:** Für jeden Schuldner in dieser Reihenfolge wird der erste Gläubiger mit **genau gleichem** Betrag gesucht → eine Überweisung, beide raus.
   c. **Greedy:** größter Schuldner zahlt an größten Gläubiger den kleineren der beiden Beträge; Restbetrag bleibt im Spiel, neu sortieren (gleiche Regel), wiederholen bis alle 0.
   d. Ergebnis: Liste «A → B: Betrag» in Entstehungsreihenfolge. **Garantie:** höchstens (Anzahl Personen mit Saldo ≠ 0) − 1 Überweisungen; jede Person zahlt nur **oder** empfängt; gleiche Eingabe → gleiche Ausgabe, unabhängig von der Reihenfolge der Eingabedaten.
   e. **Hinweis zur Formulierung:** Die mathematisch kleinstmögliche Zahl an Überweisungen zu finden ist im allgemeinen Fall ein sehr aufwendiges Suchproblem; Greedy + exakte Paare liefert in Freundesgruppen praktisch immer das Minimum oder eine Überweisung mehr. Die UI sagt deshalb **nicht** „minimal“, sondern «Mit 5 Überweisungen ist alles erledigt.» (W19). Ein exakter Optimierer ist „später“ (nur falls Nutzer es vermissen).
   f. Laufzeit: 30 Personen und 10 000 Ausgaben < 100 ms serverseitig (Test mit Zufallsdaten, fester Seed).
7. **Schwelle A1** (Schulden-Aufgabe im Cockpit, UX-3): eigener Saldo ≤ −Schwelle in der Reisewährung. Schwellen je Währung (Tabelle im Code, Test): **EUR, USD, GBP, CHF, CAD, AUD 50 · DKK, SEK, NOK 500 · PLN 200 · CZK 1 250 · HUF 20 000** (jeweils ganze Einheiten, ≈ 50 €).
8. **Erlaubte Reisewährungen (Stufe 1):** genau die Währungen aus `currencyForCountry()` – EUR, GBP, CHF, USD, DKK, SEK, NOK, PLN, CZK, HUF, CAD, AUD (alle ISO-4217 mit 2 Nachkommastellen). Andere Codes lehnt der Server ab. Keine Umrechnung (F-037 später).

**Pflicht-Tests der Rechenlogik:** Summe Anteile = Betrag für alle n von 1 bis 30 und Beträge 1 Cent … 100 000 000 Cent (Eigenschaftstest); Summe Salden = 0 nach beliebigen Folgen aus Anlegen/Bearbeiten/Löschen/Ausgleichen; `settleUp` gleicht alle Salden aus, ≤ n−1 Überweisungen, deterministisch bei permutierter Eingabe; Beispiele aus W19-Prototyp als feste Fälle.

#### User Stories & Akzeptanzkriterien

**I10-01 Bereich „Kosten“ und Einstieg**
**Als** Mitglied **möchte ich** nach der Festlegung einen Ort für alle Gruppenausgaben haben, **damit** wir nach der Reise nicht Kassenzettel und Chatnachrichten zusammensuchen.
- [ ] Route `/trips/{id}/costs` (nur Mitglieder, nur Phase `fixed`); Aufbau, Leerzustand, Abgeschlossen-Zustand und Texte nach W19 A. Segment „Ausgaben | Salden & Ausgleich“ als zwei Links mit eigenen URLs; ab 960 px zweispaltig (W19 Desktop). Kein Tab (UX-1).
- [ ] **„Dein Stand“**: eigener Saldo als Wort («Du bekommst 42,00 €» / «Du schuldest 86,00 €» / «Ausgeglichen ✓»), «Gesamt {Summe} · dein Anteil {Betrag}». Nie nur Farbe/Vorzeichen; Schulden nie rot (W19).
- [ ] Liste: gruppiert nach Datum (neueste zuerst; innerhalb eines Tages zuletzt angelegte zuerst); je Zeile Kategorie-Icon, Titel, «{Name} hat bezahlt · für alle {n}» bzw. Namen, Betrag, «dein Anteil …» / «nicht beteiligt». Platzhalter mit Chip «Platzhalter», ehemalige Mitglieder als «ehemaliges Mitglied» (bei mehreren nummeriert, s. Begriffe).
- [ ] **Detail-Sheet**: Betrag, Kategorie, Datum, Zahler, Aufteilung je Person (Betrag), Modus («Gleich aufgeteilt» / «Nach Beträgen»), «angelegt von … · zuletzt geändert von …, {Datum}»; Tasten `[Bearbeiten]` `[Löschen]` nur, wenn das Recht besteht, sonst Hinweis «Bearbeiten können {Anlegende/Zahlende} und die Orga.».
- [ ] **Keine Mengengrenze** für Nutzer (Q36). Liste bleibt bei 500 Ausgaben bedienbar (Laden in Seiten à 100 Einträge oder „Mehr anzeigen“ – Developer entscheidet; Salden immer über **alle** Ausgaben).
- [ ] Statusangaben aktualisieren sich beim Neuladen (kein Live-Update, wie F-008); nach eigenen Aktionen sofort (optimistisch).

**I10-02 Ausgabe hinzufügen**
**Als** Mitreisende **möchte ich** eine Ausgabe in Sekunden eintragen, **damit** ich es nicht vergesse.
- [ ] Route `/trips/{id}/costs/new` (optional `?date=today` von der Kopf-Taste `[+ Ausgabe]`); Felder und Meldungen nach W19 B: **Betrag** (Pflicht, Regeln 1–2, `inputmode="decimal"`, Autofokus, Währungszeichen der Reise), **Wofür?** (Pflicht, 1–60 Zeichen nach Trimmen, Steuerzeichen entfernt, nur Text), **Kategorie** optional (`accommodation` · `travel` · `food` · `activities` · `other`), **Bezahlt von** (genau eine aktive Person, Standard: ich), **Für wen?** (≥ 1 aktive Person, Standard: alle aktiven Personen inkl. offener Platzhalter), **Aufteilung** gleich (Standard) / nach Beträgen (Regeln 3–4, Live-Vorschau je Person), **Datum** (Standard heute in der Zeitzone der Reise `APP_TIME_ZONE`; erlaubt: Anreise − 365 Tage bis Abreise + 90 Tage, sonst Meldung).
- [ ] Validierung Client **und** Server (zod); Server prüft zusätzlich, dass Zahler und alle Beteiligten **aktive Personen dieser Reise** sind (keine fremden IDs, keine ehemaligen Mitglieder in neuen Ausgaben).
- [ ] Nach dem Speichern: zurück zur Liste, Snackbar «{Betrag} gespeichert – Salden sind aktualisiert.», Fokus auf h1 (W19). Doppelklick/Netz-Wiederholung erzeugt **keine** Doppelbuchung (Idempotenz-Schlüssel je Formular-Öffnung, vom Client erzeugt, serverseitig 24 h eindeutig je Reise).
- [ ] Abgeschlossene Abrechnung: Route leitet auf die Liste um, Server lehnt ab.

**I10-03 Ausgabe bearbeiten, löschen, rückgängig**
**Als** Person, die eine Ausgabe angelegt oder bezahlt hat, **möchte ich** Fehler korrigieren, **damit** die Abrechnung stimmt – **ohne** dass zwei gleichzeitige Änderungen sich still überschreiben.
- [ ] Route `/trips/{id}/costs/{expenseId}/edit`; Rechte nach Tabelle. Formular wie I10-02, vorbelegt. Enthält die Ausgabe ehemalige Mitglieder, erscheinen sie als nicht wählbarer Chip «ehemaliges Mitglied», der **entfernt**, aber nicht wieder hinzugefügt werden kann; ein ehemaliger Zahler bleibt, bis eine aktive Person gewählt wird.
- [ ] **Konfliktschutz:** Jede Ausgabe hat `version` (Ganzzahl). Bearbeiten und Löschen senden die gelesene Version; weicht sie ab, lehnt der Server mit Konflikt ab (keine Änderung) und das Formular zeigt «{Name} hat diese Ausgabe gerade geändert.» mit den aktuellen Werten (Wortlaut/Verhalten UX). Erfolgreiche Änderung erhöht `version` um 1.
- [ ] **Löschen** sofort (ohne Dialog), Snackbar «„{Titel}“ gelöscht · Rückgängig» (6 s, W19). Technisch **weiches Löschen** (`deleted_at`, `deleted_by`): zählt sofort nicht mehr; Rückgängig stellt sie mit allen Anteilen wieder her (gleiche Rechte, nicht bei abgeschlossener Abrechnung). Endgültige Löschung weich gelöschter Ausgaben nach **24 h** durch den vorhandenen Löschjob (`POST /api/internal/retention`), spätestens mit der Reise.
- [ ] Bearbeiten/Löschen/Wiederherstellen ist bei abgeschlossener Abrechnung gesperrt (Server).

**I10-04 Platzhalter, Beitritt, ehemalige Mitglieder (Q35)**
**Als** Gruppe **wollen wir** auch Leute ohne App mitrechnen und Leute, die gehen, korrekt in der Abrechnung behalten, **damit** die Summe stimmt.
- [ ] Offene Platzhalter (F-007) sind als Zahler und Beteiligte wählbar und stehen in Salden und Ausgleich mit Chip «Platzhalter» (W19).
- [ ] **Platzhalter wird eingelöst** (Beitritt über den persönlichen Link): die Person **übernimmt** alle Ausgaben, Anteile, Ausgleichszahlungen und den Saldo des Platzhalters (gleiche Partei, nun mit Konto). Test.
- [ ] **Platzhalter löschen** ist gesperrt, solange er in einer (auch weich gelöschten) Ausgabe oder Ausgleichszahlung vorkommt; Hinweis «{Name} kommt in {n} Ausgaben vor – erst dort entfernen.» (Wortlaut UX).
- [ ] **Reise verlassen** (F-013) mit Saldo ≠ 0 (und Abrechnung nicht abgeschlossen): Warnung mit Betrag und Richtung nach W19 («Du schuldest noch 86,00 €. …» bzw. «Du bekommst noch 42,00 € …»), Hinweis, dass die eigene Zahlungsinfo gelöscht wird; `[Abbrechen]` `[Trotzdem verlassen]`. Saldo 0: keine zusätzliche Warnung.
- [ ] **Orga entfernt ein Mitglied** (F-004) mit Saldo ≠ 0: entsprechende Warnung an die Orga («Ben bekommt noch 42,00 € …»).
- [ ] **Konto löschen** (F-043): Der Warn-Schritt listet zusätzlich Reisen mit offenem eigenem Saldo (Reisename + «du schuldest/bekommst …»).
- [ ] Nach Verlassen/Entfernen/Konto-Löschung: Die Partei bleibt mit allen Beträgen erhalten, **ohne** Verweis auf das Konto und ohne Namen («ehemaliges Mitglied», bei mehreren nummeriert nach Austrittszeitpunkt); `created_by`/`updated_by`/`marked_by` dieser Person werden zu «ehemaliges Mitglied». Summe der Salden bleibt 0 (Test). Tritt dieselbe Person später erneut bei, ist sie eine **neue** Partei (keine Zusammenführung).

**I10-05 Salden**
**Als** Mitglied **möchte ich** jederzeit sehen, wo jede Person steht, **damit** es keine Diskussion gibt.
- [ ] `/trips/{id}/costs/balances`: Liste aller Personen der Abrechnung mit Saldo ≠ 0 **und** aller aktiven Personen (auch 0 = «ausgeglichen ✓»); eigene Zeile «du schuldest …»/«du bekommst …»; andere «schuldet …»/«bekommt …» (W19). Reihenfolge: eigene Person zuerst, dann nach `seq`.
- [ ] Alles ausgeglichen: «Alles ausgeglichen ✓ – Niemand schuldet jemandem etwas.» + kleines Siegel (Motion, reduziert ohne Bewegung).

**I10-06 Ausgleichsvorschlag und «Als bezahlt markieren»**
**Als** Gruppe **wollen wir** mit möglichst wenigen Überweisungen ausgleichen und abhaken, was erledigt ist, **damit** die Abrechnung keinen Streit auslöst.
- [ ] «So gleicht ihr aus»: Vorschlag nach Rechenregel 6 aus den **aktuellen** Salden (also nach Abzug bereits gebuchter Ausgleichszahlungen); Satz «Mit {n} Überweisungen ist alles erledigt.»; Zeilen «{A} → {B}: {Betrag}», eigene Zeilen zuerst, darunter die Zahlungsinfo des **Empfängers** (maskiert, I10-07) mit `[Kopieren]`.
- [ ] `[✓ Als bezahlt markieren]` nur für Berechtigte (Tabelle); für Unbeteiligte stattdessen «Markieren können {A} oder {B}.» (W19). Markieren bucht eine **Ausgleichszahlung** (von A an B, Betrag = Betrag der Vorschlagszeile); Snackbar mit «Rückgängig»; Eintrag wandert nach „Bereits bezahlt“ («{A} → {B}: {Betrag} · markiert von {Name}, {Datum}»).
- [ ] **Schutz gegen Doppel-/Fehlbuchung (statt Versionsvergleich):** Der Server nimmt die Zahlung nur an, wenn A **aktuell schuldet**, B **aktuell bekommt** und der Betrag ≤ min(|Saldo A|, Saldo B) ist – geprüft unter Sperre der Reise. Sonst Ablehnung «Die Abrechnung hat sich gerade geändert» + neu laden. Damit führen zwei gleichzeitige Klicks auf dieselbe Zeile zu genau einer Buchung, und neue Ausgaben anderer machen das Markieren nicht unnötig ungültig. Test.
- [ ] Rückgängig/Löschen einer Ausgleichszahlung nach Tabelle (hartes Löschen der Zahlung; Salden ändern sich entsprechend).
- [ ] Ausgleichszahlungen mit beliebigem Betrag („Teilzahlung erfassen“) sind **nicht** in Stufe 1 (später).

**I10-07 Zahlungsinfo (freiwillig, Q35)**
**Als** Person, die Geld bekommt, **möchte ich** meine IBAN oder meinen PayPal-Namen einmal hinterlegen, **damit** mich nicht jede:r einzeln danach fragt.
- [ ] Je Person **und Reise** (nicht im Konto – keine Weitergabe an andere Reisen), zwei optionale Felder: **IBAN** und **Anderer Weg** (Freitext ≤ 100 Zeichen, z. B. «PayPal: lena.k» – nur Text, **keine** automatische Verlinkung, kein HTML). Hinweis im Sheet: «Alle in der Reise können das lesen. Wird gelöscht, wenn du die Reise verlässt.» (Wortlaut UX). Speichern, ändern, löschen jederzeit; Anzeige «zuletzt geändert {Datum}».
- [ ] **IBAN-Validierung** (Client + Server, eigene reine Funktion mit Tests): Leerzeichen entfernen, Großbuchstaben; Format `^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$`; **Länge passend zum Ländercode** (Tabelle der IBAN-Länder, mind. alle SEPA-Länder + GB, CH; unbekanntes Land → ablehnen); **Prüfziffer nach ISO 13616 (Mod 97 = 1)**. Gespeichert wird die normalisierte Form; angezeigt in Vierergruppen. Meldungen: «Diese IBAN stimmt nicht – bitte prüf die Eingabe.» (keine Unterscheidung, welche Regel verletzt ist, ist nicht nötig). Kein BIC, kein Kontoinhaber (der Name ist der Name in der Reise).
- [ ] **Maskierung:** In Listen und im Ausgleich wird die IBAN standardmäßig **maskiert** gezeigt – Ländercode + Prüfziffer + letzte 4 Zeichen («DE89 •••• •••• •••• •••• 3000»); `[Anzeigen]` zeigt sie vollständig (nur auf diesem Gerät, bis zum Verlassen der Seite), `[Kopieren]` kopiert die vollständige IBAN **ohne** Leerzeichen und meldet «IBAN kopiert». Screenreader liest maskiert «IBAN endet auf 3000». Zweck: Schutz vor Mitlesen/Screenshots, **kein** Zugriffsschutz – alle Mitglieder der Reise dürfen sie sehen (Q35).
- [ ] Zahlungsinfos erscheinen **nie** in Teilen-Texten, Mails, Logs, Fehler-Tracking oder URLs (Stufe 1; „IBAN im Abrechnungstext“ ist „später“).
- [ ] Platzhalter haben keine Zahlungsinfo (können nichts hinterlegen); ehemalige Mitglieder verlieren sie beim Austritt (gelöscht, nicht ausgeblendet).

**I10-08 Abrechnung abschließen, Währung, Teilen-Text**
**Als** Orga **möchte ich** die Abrechnung nach der Reise abschließen, **damit** niemand mehr versehentlich etwas ändert.
- [ ] `[Abrechnung abschließen]` (nur Orga, jederzeit möglich, empfohlen ab *Danach*; im Cockpit **immer sekundär**, U-30): Bestätigung nach W19; **bei offenen Salden** zusätzlicher Hinweis «Noch {n} Ausgleiche offen – trotzdem abschließen?» (Wortlaut UX). Danach sind Ausgaben **und** Ausgleichszahlungen schreibgeschützt (Server), Chip «Abrechnung abgeschlossen», Aktionsleiste entfällt. `[Abrechnung wieder öffnen]` (Orga) hebt das auf.
- [ ] **Währung ändern** (Orga): Auswahl aus den erlaubten Währungen (Rechenregel 8), nur solange keine nicht gelöschte Ausgabe und keine Ausgleichszahlung existiert (unter Sperre der Reise geprüft; weich gelöschte Ausgaben werden dabei endgültig gelöscht). Unterkunftspreise behalten ihre eigene Währung (R.7). Danach ist die Auswahl gesperrt mit Hinweis «Die Währung lässt sich nur ändern, solange es keine Ausgaben gibt.».
- [ ] **Teilen-Text** (Kopf-Taste `[Teilen]` in W19) über das vorhandene Teilen-Sheet: «Abrechnung {Reise}: {A} → {B}: {Betrag} · … – Details: {Link}» (DE/EN), Platzhalter mit Namen, ehemalige als «ehemaliges Mitglied» (ggf. nummeriert); bei allem ausgeglichen «Abrechnung {Reise}: alles ausgeglichen ✓». **Ohne** IBAN, Titel oder Einzelausgaben.

**I10-09 Cockpit: Kachel Kosten, A1, D1, Kopf-Tasten, Erinnern (F-053)**
**Als** Mitglied **möchte ich** im Cockpit sehen, ob ich jemandem Geld schulde, **damit** ich nicht nachrechnen muss.
- [ ] Adapter für `tripRoute()` (Vertrag W16 v2.10) liefert: **Kachel „Kosten“** (Reihenfolge W16 v2.6; Statuszeile nach W16 – «Noch keine Ausgaben» / «Gesamt 456,00 € · du schuldest 86,00 €» / «ausgeglichen ✓»), **A1** (nur *Vorbereitung* und *Unterwegs*, eigener Saldo ≤ −Schwelle nach Rechenregel 7, Text mit dem ersten Empfänger laut eigenem Vorschlag, Wortlaut UX für mehrere Empfänger), **D1** (nur *Danach*, nur wenn ≥ 1 nicht gelöschte Ausgabe existiert, Zustände exakt nach der D1-Tabelle W16 v2.4 je Rolle; erledigt bei «alle 0» für Mitglieder bzw. «abgeschlossen»). In *Danach* gibt es die Kachel erst, wenn D1 erledigt ist (ein Einstieg je Bereich). Unit-Tests **je Zeile** der D1-Tabelle und je Rolle sowie für A1 an der Schwelle (−49,99 / −50,00 / −50,01 €) und für GBP/DKK.
- [ ] Heute-Reihenfolge nach W16 v2.5 (D1 schulden = Frist/Datum; A1 = eigener Beitrag; D1 abschließen = Freiwilliges, `[Abschließen]` nie primär).
- [ ] **Kopf-Tasten:** *Unterwegs* `[+ Ausgabe]` → `/costs/new?date=today` (vor `[Tickets]`, das erst mit 12 kommt); *Danach* `[Ausgleichen]` → `/costs/balances` **nur** bei offenen Salden und nicht abgeschlossener Abrechnung.
- [ ] **Phasenzeile *Danach*** «Zurück · Kosten ausgleichen» (offen) bzw. «Zurück · alles ausgeglichen» (alle 0 oder abgeschlossen); ohne Ausgaben weiter «Zurück seit {n} Tagen». Heute-Satz **H-5** (Ausgaben vorhanden, alles erledigt) bzw. **H-5b** (keine Ausgaben).
- [ ] **Erinnern** über das vorhandene `RemindSheet` (F-015): `settle` (Gläubiger an einen eigenen Schuldner laut Vorschlag, `single`) und `settle-all` (Orga, `status`) mit den Texten W16 v2.8 (DE/EN); Texte enthalten Reisename, Betrag des eigenen Anspruchs bzw. Anzahl offener Ausgleiche und den Link – **nie** IBAN, Titel oder Beträge zwischen anderen. Platzhalter als Empfänger von `settle` nur über ihren persönlichen Link (wie V2).

**I10-10 Datenschutz, Export, Löschung**
**Als** Mitglied **möchte ich**, dass Ausgaben und meine Zahlungsinfo nach denselben Regeln wie die Reise verschwinden, **damit** nichts liegen bleibt.
- [ ] Alles zu Kosten wird **mit der Reise gelöscht** (F-013, 90 Tage nach Reiseende bzw. „Reise löschen“, Q31) – per Fremdschlüssel-Kaskade (Test). Zusätzlich löscht der Löschjob weich gelöschte Ausgaben nach 24 h.
- [ ] **Lösch-Hinweismail an die Orga** (14 Tage vorher, F-013/Q24): Bei offenen Salden zusätzlicher Satz «Achtung: In der Abrechnung sind noch {n} Ausgleiche offen.» – **ohne** Namen und Beträge.
- [ ] **Zahlungsinfo** wird gelöscht beim Verlassen/Entfernen, beim Konto-Löschen und mit der Reise; die Person kann sie jederzeit selbst löschen.
- [ ] **Datenexport (F-013, Q23)** je Reise: eigene Zahlungsinfo (IBAN vollständig, Freitext); Ausgaben, die man **angelegt** oder **bezahlt** hat (Titel, Datum, Betrag, Währung, Kategorie, Modus); in allen Ausgaben, an denen man beteiligt ist, Titel, Datum und **eigener Anteil**; eigene Ausgleichszahlungen (Richtung, Betrag, Datum); eigener aktueller Saldo. **Keine** Namen, Zahlungsinfos oder Anteile anderer Personen (Gegenseite als «andere Person»).
- [ ] Titel, Beträge, IBAN und Freitext erscheinen **nie** in Logs, Fehler-Tracking, Analytics oder Mails (Ausnahme: Teilen-/Erinnern-Texte, die die Person selbst auslöst, mit den Inhalten aus I10-08/I10-09).
- [ ] Operations ergänzt vor G1 die Datenschutzerklärung (Platzhalter) um „Kosten teilen & Zahlungsinfo“: Zweck, Sichtbarkeit für die Reise, freiwillige Angabe, Löschfristen, **keine** Zahlungsabwicklung, keine Weitergabe an Banken/Zahlungsdienste.

**I10-11 Querschnitt (Abnahme)**
- [ ] 360 × 640, 390 × 844, 320 px, 200 % Schrift, Dark Mode, DE/EN (Zahlen-/Währungsformat je Sprache: «1.234,56 €» / «€1,234.56»), Desktop ≥ 960 px (W19 Desktop); Formular vollständig per Tastatur und Screenreader bedienbar (Barrierefreiheit W19: Live-Zeile `aria-live="polite"`, `tabular-nums`, Pfeil mit Text-Alternative).
- [ ] Reduzierte Bewegung (System oder Konto-Schalter): nur Überblenden, kein Siegel-Effekt; kein Konfetti in diesem Bereich.
- [ ] Abnahme-Fälle: leere Kosten (Kachel «Noch keine Ausgaben») · Ausgabe gleich auf 3 mit Rest-Cent (100,00 → 33,34/33,33/33,33) · nach Beträgen mit Fehlsumme (gesperrt) und passender Summe · Platzhalter zahlt / ist beteiligt · Platzhalter wird eingelöst (Saldo geht mit) · gleichzeitiges Bearbeiten (Konfliktmeldung) · Löschen + Rückgängig · Anna schuldet ≥ 50 € in *Vorbereitung* (A1) und < 50 € (keine Aufgabe) · *Unterwegs* `[+ Ausgabe]` · *Danach* D1 je Rolle/Zeile · Als bezahlt markieren (beide Seiten, Doppelklick = eine Buchung) · Mitglied verlässt die Reise mit Schulden (Warnung, «ehemaliges Mitglied») · Orga schließt mit offenen Salden ab (Warnung, schreibgeschützt) und öffnet wieder · Währung ändern (nur ohne Ausgaben) · IBAN gültig/ungültig, maskiert/anzeigen/kopieren · Datenexport.

#### Sicherheit (Pflicht – Reviewer prüft mit Tests)
1. **Rechte** aus der Tabelle oben serverseitig, Tests je Zeile – inkl. Nicht-Mitglied, falsche Reise-ID für Ausgabe/Partei/Ausgleich (keine reiseübergreifenden Zugriffe, alle IDs werden gegen `trip_id` geprüft), Platzhalter-/ehemalige Partei als „Handelnde“ unmöglich, Orga kann **nicht** Ausgleiche zwischen zwei aktiven Konto-Mitgliedern markieren.
2. **Integrität:** Beträge nur als Ganzzahl im erlaubten Bereich; Summe der Anteile = Betrag (Server + DB-Prüfung per Trigger oder Prüfung im selben Transaktionsschritt); Schreibvorgänge einer Reise unter Zeilensperre der Reise (wie Unterkünfte), damit Salden-Prüfungen (I10-06) und Währungswechsel (I10-08) nicht kollidieren.
3. **Konfliktschutz** `version` für Ausgaben (I10-03), Idempotenz-Schlüssel beim Anlegen (I10-02), Salden-Prüfung beim Markieren (I10-06).
4. **Eingaben nur als Text:** Titel, Freitext der Zahlungsinfo – kein HTML/Markdown, keine Auto-Links, Steuerzeichen entfernt; IBAN nur nach Validierung gespeichert.
5. **Keine Zahlungsabwicklung:** keine Bank-/PayPal-APIs, keine Zahlungslinks mit Betrag, keine neuen ausgehenden Verbindungen, keine neuen Drittanbieter.
6. **Sparsame Ausgabe:** Die Kosten-Seiten liefern nur Daten dieser Reise; Zahlungsinfos nur an Mitglieder der Reise (nicht in öffentliche Reise-Vorschau, Einladungsseite oder Meta-Tags).

**Rate-Limits** (pro **Konto**, gleicher Mechanismus wie `src/server/rate-limit.ts`; Werte als Vorgabe, Developer darf begründet anpassen):
| Aktion | Limit |
|---|---|
| Ausgabe anlegen | 60 / 10 min je Konto |
| Ausgabe bearbeiten / löschen / wiederherstellen | 120 / 10 min je Konto |
| Als bezahlt markieren / rückgängig | 60 / 10 min je Konto |
| Zahlungsinfo speichern | 20 / h je Konto |
| Währung ändern / abschließen / wieder öffnen | wie andere Schreibaktionen der Orga |
Zusätzlich **technische Obergrenze** als Missbrauchsschutz: 10 000 nicht gelöschte Ausgaben je Reise (wird Nutzern nicht als Limit kommuniziert; Q36 „unbegrenzt“ bleibt praktisch wahr – Meldung nur im Grenzfall). Überschreitung: bestehende Limit-Meldung.

#### Datenhaltung (Vorgabe für Developer, Bewertung durch Reviewer)
| Was | Wo (Empfehlung) | Löschung / Datenschutz |
|---|---|---|
| Personen der Abrechnung | neue Tabelle `trip_cost_party`: `id`, `trip_id` (FK `ON DELETE CASCADE`), `seq` (Ganzzahl, aufsteigend je Reise, feste Reihenfolge für Rest-Cent und Gleichstände), `user_id` (FK Konto `ON DELETE SET NULL`, null), `placeholder_id` (FK `trip_placeholder`, null), `former_at` (null), `former_no` (null, Nummer für «ehemaliges Mitglied n»), `created_at`. Eindeutig je Reise: `user_id` (wo nicht null und nicht ehemalig) und `placeholder_id` (wo nicht null). **Kein** zusammengesetzter FK auf `trip_member` (anders als `availability`), damit die Partei das Verlassen überlebt. Anlage **bei erster Verwendung** (Ausgabe/Ausgleich) unter Sperre der Reise. | Kaskade mit der Reise. **Verlassen/Entfernen:** im Austritts-Code `user_id = null`, `former_at`, `former_no` setzen (aktiv, da die Mitgliedschaft – nicht das Konto – endet). **Konto löschen:** ebenso (vor dem Löschen des Kontos, im selben Ablauf). **Platzhalter eingelöst:** `user_id` setzen, `placeholder_id = null`. Name wird nie in der Partei gespeichert (immer live aus Mitgliedschaft/Platzhalter). |
| Ausgaben | neue Tabelle `trip_expense`: `id`, `trip_id` (FK `CASCADE`), `title` (1–60), `amount_cents` (`integer`, 1 … 100 000 000), `currency` (ISO 4217 = Reisewährung beim Anlegen), `category` (null oder Enum), `spent_on` (`date`), `payer_party_id` (FK Partei `RESTRICT`), `split_mode` (`equal` / `amounts`), `created_by`, `updated_by` (FK Konto `SET NULL`), `created_at`, `updated_at`, `version` (int, Start 1), `deleted_at`, `deleted_by` (null), `idempotency_key` (null, eindeutig je Reise) | Kaskade mit der Reise; weich gelöschte nach 24 h endgültig (Löschjob). Index (`trip_id`, `spent_on desc`). Inhalte nie in Logs. |
| Anteile | neue Tabelle `trip_expense_share`: `expense_id` (FK `CASCADE`), `party_id` (FK Partei `RESTRICT`), `share_cents` (`integer` ≥ 0); PK (`expense_id`, `party_id`) | Kaskade mit der Ausgabe. Summe = Betrag (Pflicht-Test + Prüfung beim Schreiben). |
| Ausgleichszahlungen | neue Tabelle `trip_settlement`: `id`, `trip_id` (FK `CASCADE`), `from_party_id`, `to_party_id` (FK Partei `RESTRICT`, verschieden), `amount_cents` (> 0), `marked_by` (FK Konto `SET NULL`), `marked_at` | Kaskade mit der Reise; Rückgängig = Zeile löschen. |
| Abschluss | an der Reise: `trip.costs_closed_at`, `trip.costs_closed_by` (FK Konto `SET NULL`) | Wieder öffnen = null. |
| Währung | vorhandene Spalte `trip.currency` (Migration 0010); Prüfung der erlaubten Codes in der App (Rechenregel 8) | – |
| Zahlungsinfo | an der Mitgliedschaft: `trip_member.payment_iban` (null, normalisiert, max. 34), `trip_member.payment_note` (null, ≤ 100), `trip_member.payment_updated_at` | Verschwindet automatisch mit der Mitgliedschaft (Verlassen, Entfernen, Konto löschen) und mit der Reise. Keine zusätzliche Anwendungsverschlüsselung nötig (IBAN wird freiwillig und bewusst für die Gruppe geteilt; DB/Backups sind ohnehin verschlüsselt, R.4) – nie in Logs. |
| Salden, Vorschlag | **nicht gespeichert** – immer aus Ausgaben, Anteilen und Ausgleichszahlungen berechnet (keine doppelte Wahrheit) | – |
| Nur im Browser | Formular-Entwurf bei Netzfehler, «IBAN angezeigt» (Seitenzustand) | Keine Cookies, kein `localStorage` für IBAN. |

Migrationen: eine Migration (`0011`) für `trip_cost_party`, `trip_expense`, `trip_expense_share`, `trip_settlement`, Spalten an `trip` und `trip_member`. Keine neuen Drittanbieter-Konten, kein Dateispeicher, keine neuen ausgehenden Verbindungen, nicht an G1b gebunden. Löschjob erweitern (weich gelöschte Ausgaben > 24 h); Lösch-Hinweismail um den Satz zu offenen Salden ergänzen.

#### Demo-Seed (`seed.ts`, „Demo zurücksetzen“)
Alle Beträge, Namen und Zahlungsinfos sind Fantasie; IBANs **nur** öffentlich bekannte Beispiel-IBANs (z. B. `DE89 3704 0044 0532 0130 00`, `GB82 WEST 1234 5698 7654 32`) mit Zusatz «(Demo)» im Freitext-Feld – keine echten Konten.
- **„Kroatien 2027“** (*Vorbereitung*, EUR, Orga Ben, Anna Mitglied, Platzhalter Lotte): 3 Ausgaben (Anzahlung Fähre – David, gleich auf alle inkl. Lotte; Mietwagen-Anzahlung – Anna, **nach Beträgen**; Kleinkram 10,00 € auf 3 → Rest-Cent sichtbar). Anna «du bekommst …» in der Kachel, keine A1; Lotte in den Salden mit Chip «Platzhalter».
- **„Roadtrip Schottland“** (*Unterwegs*, **GBP**, Ben Orga): ~8 Ausgaben (Cottage 1 650 £ von Ben vor 35 Tagen, Mietwagen, Tankstelle, Supermarkt, eine Ausgabe nicht für alle). Kopf-Taste `[+ Ausgabe]`; Emma schuldet ≥ 50 £ (A1 bei Emma), Anna bekommt etwas (Kachel). Ben mit Beispiel-IBAN GB, Carla mit Freitext «PayPal: carla.demo».
- **„Gardasee“** (*Danach*, EUR, Felix Orga, Anna, Greta + **ein ehemaliges Mitglied**): Anna schuldet Felix ≥ 50 € → **D1 „du bist dran“** mit `[Zum Ausgleich]`, Kopf-Taste `[Ausgleichen]`, Phasenzeile «Zurück · Kosten ausgleichen»; Greta → Felix bereits «bezahlt» (unter „Bereits bezahlt“); «ehemaliges Mitglied» → Felix offen (Felix kann markieren). Felix mit Beispiel-IBAN DE.
- **„Kroatien Segeln“** (*Danach*, Löschung in 10 Tagen, Anna Orga): alles ausgeglichen und **abgeschlossen** → D1 erledigt, H-5, Kachel «ausgeglichen ✓». Zusätzlich offene Salden-Variante **nicht** nötig; die Hinweismail mit offenen Salden wird per Test geprüft.
- **„Familientreffen Harz“** (*Vorbereitung*, Anna Orga): keine Ausgaben → Kachel «Noch keine Ausgaben», Währung ist änderbar (vorführbar).
- „Malle 2026“ bleibt ohne Ausgaben (Beispiel H-5b).

#### Nicht in Inkrement 10 (Abgrenzung)
| Kommt mit | Inhalt |
|---|---|
| **Inkrement 11** (F-056/F-054) | Nichts zu Kosten – „Bucht“ hat bei Kosten keine Sonderrechte. |
| **Inkrement 12** (F-055) | Datei-Infrastruktur entsteht; **Belegfotos** bleiben trotzdem „später“ (Premium-Kandidat), können sie aber nutzen. |
| später (Premium-Kandidaten, R.3/Q36) | **Fremdwährungen F-037**, **Belegfotos**, **Export CSV/PDF**, Aufteilung nach Anteilen/Prozent, **mehrere Zahler** pro Ausgabe. |
| später (Free, nach Beta-Feedback) | Teilzahlung / freie Ausgleichszahlung erfassen, exakter Minimal-Optimierer für Überweisungen, IBAN/Zahlungsinfo im Teilen-Text, EPC-/GiroCode-QR zum Abscannen in der Banking-App (nur Anzeige, keine Abwicklung), `paypal.me`-Links, wiederkehrende Ausgaben, Budget (F-034), Statistik nach Kategorie, Ausgaben schon vor Phase 3 (Anzahlungen), Kommentare je Ausgabe, Live-Updates, E-Mail-/Push-Erinnerungen (F-014/F-038), Rest-Cent-Rotation. |
| nie (Nicht-Ziel) | Zahlungsabwicklung in der App, Bank-/PayPal-/Open-Banking-Anbindung, Guthaben/Wallet, Zahlungsaufforderungen mit Zahlungsdienst. |

Aufwand: **M–L (≈ 1,5 Inkremente)**. Risiko: gering–mittel – Rechenlogik (durch reine Funktionen + Eigenschaftstests beherrschbar), Partei-Modell beim Verlassen/Einlösen (Tests je Übergang), Formular-UX auf 360 px (Beträge je Person). Kein Datenschutz-Gate, keine neue Infrastruktur.

### R.9 Zuschnitt Inkrement 11 – „Bucht“ + persönliche Reisedaten (F-056 + F-054 Stufe 1) (2026-10-23)

**Ziel:** Die Orga legt fest, wer für die Gruppe bucht (Markierung „Bucht“, bis zu 3 Personen). Diese Personen können die für eine konkrete Buchung nötigen Reisedaten **gezielt anfragen**; jede gefragte Person gibt ihre Angaben **per Einwilligung nur an diese eine Person** frei, sieht, wer wann darauf zugegriffen hat, und kann jederzeit zurückziehen. Alles wird anwendungsseitig verschlüsselt gespeichert und spätestens **7 Tage nach Reiseende** gelöscht. Im Cockpit erscheint Station **V4 „Reisedaten“**, in *Danach* **D3 „Reisedaten gelöscht“**. Damit wandern Ausweisdaten nicht mehr in den Gruppenchat. **Echte Nutzung erst nach G1 + G1b**; bis dahin in Demo und Vorschau nur mit Fantasiedaten und technischer Absicherung (I11-12).

**Quellen (verbindlich):** F-056, F-054 (Steckbriefe oben) · PRD §12 **Q28** (Markierung, keine Rolle; bis 3 Mitglieder, Standard Orga; Zusatzrechte Reisedaten, Infoseite, „gebucht“; Orga sieht fremde Reisedaten nicht automatisch) · **Q29** (Standard Name laut Ausweis + Geburtsdatum; weitere Felder nur auf ausdrückliche Anfrage mit Warnhinweis; nie Scans/Fotos, Adresse, Freitext; Einwilligung nur an die anfragende Person, widerrufbar, Zugriffsprotokoll) · **Q30** (nur pro Reise) · **Q31** (7 Tage nach Reiseende, sofort bei Widerruf/Verlassen) · **Q36** (nie Premium) · **UX-2** (eigener Bereich, Station V4) · PRD §8 NFR „Sensible Reisedaten & Dateien“ · R.1, R.4, R.5 · W16 v2.3 (V4, D3), v2.4 (V4-Tabelle, V3 „Bucher“), v2.5 (Heute-Reihenfolge), v2.6 (Kachel Reisedaten), v2.8 (Anlass `travel-data`), v2.10 (Adapter) · **W20** (Anfrage, Einwilligung, Ausfüllen, Status, Sicht „Bucht“, neue Anfrage, Danach) – wird von UI/UX parallel baureif gemacht. **Für UI, Texte, Zustände und Layout gilt die UX-Spec (W16/W20); dieser Abschnitt regelt Rechte, Lebenszyklus, Verschlüsselung, Datenhaltung, Abgrenzung und Akzeptanz.** Bei Widerspruch in diesen Punkten gilt R.9; UI/UX gleicht W20 an. R.9 präzisiert die Steckbriefe F-054/F-056 – bei Widerspruch gilt R.9.

**Voraussetzung für den Start der Umsetzung:** W20 „baureif“ von UI/UX inkl. der Punkte in „Hinweise an UI/UX“ (unten); Markierung „Bucht“ in „Wer ist dabei?“ (Vergeben/Entziehen, Bestätigung, Grenze 3) im Wireframe; Designer liefert Chip «Bucht», Schild-Icon für Datenschutz-Hinweise, Leer-Illustration «Reisedaten gelöscht»; Motion Designer liefert Maskieren ↔ Anzeigen (nur Überblenden, keine Buchstaben-Animation), Freigabe-Siegel klein (reduziert: ohne Bewegung; kein Konfetti in diesem Bereich). **Operations** liefert vorab: Schlüssel-Konzept (Variable, Format, Rotation, Runbook – Entwurf reicht für Demo/Vorschau) und ergänzt `docs/ops/vorschau-anleitung.md`, falls für die Vorschau eine neue Variable nötig wird (Ziel: **keine**, s. Verschlüsselung Nr. 4).

#### Im Umfang (Übersicht)
| Baustein | UX-Quelle | Feature |
|---|---|---|
| Markierung „Bucht“ vergeben/entziehen (Orga, max. 3, Standard Orga bei der ersten Festlegung), Chip für alle sichtbar | W16 „Wer ist dabei?“ (Ergänzung) | F-056 |
| Übergang Zusatzrechte: Infoseite bearbeiten, Unterkunft «gebucht ✓» markieren/zurücknehmen (bisher nur Orga) | W22, W18, W16 v2.4 V3 | F-056, F-033, F-031 |
| Bereich `/trips/{id}/travel-data` (Mitglied: Anfragen an mich, eigene Freigaben; „Bucht“: eigene Anfragen, Personen, Status) | W20 A, D, E, G | F-054 |
| Neue Anfrage `/travel-data/new` (Zweck, Felder, Empfänger) | W20 F | F-054 |
| Beantworten `/travel-data/{requestId}` (Schritt 1 Angaben, Schritt 2 Freigeben mit Einwilligung, Ablehnen) | W20 B, C | F-054 |
| Eigene Freigabe ansehen, ändern, zurückziehen; Zugriffsprotokoll | W20 D | F-054 |
| Sicht „Bucht“: maskiert, Anzeigen/Kopieren je Feld (protokolliert), Re-Authentifizierung für Dokumentnummern, Empfänger ergänzen, «Erledigt – Daten löschen» | W20 E | F-054 |
| Cockpit: Station **V4**, **D3**, Kachel **Reisedaten**, Heute-Einträge, Erinnern-Anlass `travel-data` | W16 v2.3–v2.8 | F-053 |
| Lebenszyklus: Auto-Löschung 7 Tage nach Reiseende, Widerruf, Verlassen/Entfernen, Entzug „Bucht“, Konto löschen, Festlegung aufgehoben (30 Tage), Termin geändert | – | F-054, F-013, F-043, Q31 |
| Anwendungsseitige Verschlüsselung (AES-256-GCM), Schlüssel außerhalb der DB, Rotation | – | PRD §8, R.4 |
| Datenexport (eigene Reisedaten ja, fremde nie), Demo-/Vorschau-Schutz, Feature-Schalter für G1b, Demo-Seed | – | F-013, F-043, R.5 |

#### Begriffe
- **„Bucht“-Person** (UI-Chip «Bucht» / «Booking», Wortlaut UX): Mitglied mit Konto, dem die Orga die Markierung gegeben hat. Keine Rolle (Rollen bleiben Orga/Mitglied, F-004).
- **Anfrage:** von einer „Bucht“-Person für einen **Zweck** («Flüge München – Split») mit festen **Feldern** an eine Auswahl von **Empfänger:innen** gestellt. Gehört genau der anfragenden Person.
- **Empfänger:in:** Mitglied der Reise (nicht die anfragende Person selbst) oder offener Platzhalter («bekommt die Anfrage nach Beitritt»).
- **Antwort** je Empfänger:in: *offen* · *freigegeben* (Angaben + Einwilligung gespeichert) · *klärt es direkt* (abgelehnt, ohne Begründung) · *erloschen* (Daten gelöscht, weil Anfrage geschlossen, „Bucht“ entzogen, anfragende Person weg oder Frist erreicht).
- **Freigabe** = die verschlüsselt gespeicherten Angaben einer Person für **eine** Anfrage. Gibt dieselbe Person zwei Anfragen frei, sind das zwei Freigaben (Einwilligung je Zweck und Empfänger:in).
- **Löschdatum** einer Freigabe = festgelegtes Abreisedatum (`trip.fixed_end`) + 7 Tage, 23:59 in `APP_TIME_ZONE` (wie I8 „heute“). Ändert sich der Reisezeitraum, ändert sich das Löschdatum mit (I11-10).

#### Felder (Q29 – abschließende Liste Stufe 1)
| Code | Feld (DE) | In der Anfrage | Prüfung (Client + Server, zod) |
|---|---|---|---|
| `legal_name` | Vorname(n) + Nachname(n) laut Ausweis | **immer** (nicht abwählbar) | je 1–100 Zeichen nach Trimmen; Buchstaben aller Schriften inkl. diakritischer Zeichen, Leerzeichen, Bindestrich, Apostroph, Punkt; keine Ziffern, keine Steuerzeichen |
| `birth_date` | Geburtsdatum | Standard **an**, abwählbar | gültiges Datum `TT.MM.JJJJ` (EN-Format laut UX); nicht in der Zukunft; nicht älter als 120 Jahre |
| `sex` | Geschlecht/Anrede laut Ausweis (w/m/x) | aus | genau einer der drei Werte |
| `nationality` | Staatsangehörigkeit | aus | ISO-3166-1-Alpha-2 aus der vorhandenen Länderliste |
| `document` | Dokumentart (Reisepass / Personalausweis) + Dokumentnummer | aus, **mit Warnhinweis** | Art aus Enum; Nummer normalisiert (Großbuchstaben, ohne Leerzeichen), nur `A–Z0–9`, 5–20 Zeichen. **In Demo/Vorschau zusätzlich: muss mit `DEMO` beginnen** (I11-12) |
| `document_expiry` | Ablaufdatum | aus; nur zusammen mit `document` | gültiges Datum; liegt es vor dem Löschdatum der Reise, sieht **nur die Person selbst** «Dein Dokument läuft vor der Rückreise ab» (Should, kein Blocker) |
| `issuing_country` | Ausstellungsland | aus; nur zusammen mit `document` | wie `nationality` |

Alle angefragten Felder sind beim Freigeben **Pflicht**. **Nie** erhoben (auch nicht als Freitext, Kommentar oder Notiz zur Anfrage): Scans/Fotos, Adresse, Größe, Augenfarbe, Behörde, Zugangs-/CAN-Nummer, Vielfliegernummer, Gesundheits-/Ernährungsangaben. Die Anfrage hat **kein** Nachrichtenfeld – nur den Zweck (≤ 60 Zeichen, nur Text).

#### Rechte in Inkrement 11 (serverseitig geprüft, ersetzt für diese Aktionen R.1)
| Aktion | Mitglied | „Bucht“ | Orga ohne „Bucht“ | Bedingung |
|---|---|---|---|---|
| Markierung „Bucht“ vergeben / entziehen (auch sich selbst) | – | – | ✔ (Orga, mit oder ohne eigene Markierung) | Phase `fixed`; Ziel ist Mitglied mit Konto (kein Platzhalter); max. **3** je Reise, geprüft unter Sperre der Reise |
| Infoseite bearbeiten (F-033) | – | ✔ | ✔ | wie R.6 |
| Unterkunft festlegen / Festlegung aufheben (F-031) | – | – | ✔ | unverändert nur Orga (Q33) |
| Unterkunft «gebucht ✓» markieren / zurücknehmen (F-031) | – | ✔ | ✔ | nur die festgelegte Unterkunft (R.7 I9-07) |
| Reisedaten-Anfrage erstellen | – | ✔ | – (nur, wenn selbst „Bucht“) | Phase `fixed`, heute ≤ Abreisetag; max. **3 offene** Anfragen je „Bucht“-Person |
| Empfänger:innen der **eigenen** Anfrage ergänzen / entfernen | – | ✔ | – | Anfrage offen; Entfernen löscht deren Freigabe sofort |
| **Eigene** Anfrage abschließen («Erledigt – Daten löschen») | – | ✔ | – | löscht alle Freigaben der Anfrage sofort |
| Anfrage an mich beantworten: Angaben eingeben, freigeben, ändern, ablehnen, «Doch freigeben», zurückziehen | ✔ | ✔ (wenn selbst gefragt) | ✔ (wenn selbst gefragt) | nur eigene Antwort; Anfrage offen; vor dem Löschdatum |
| Freigegebene **Inhalte** anzeigen / kopieren | – | ✔ **nur** für die **eigenen** Anfragen | – **nie** | Markierung aktiv, Anfrage offen, Antwort *freigegeben*, vor dem Löschdatum; Dokumentnummer nur mit frischer Anmeldung (I11-08) |
| Status je Person sehen (offen / freigegeben / klärt es direkt) | – (nur eigene Antwort + Zahlen «2 von 4») | ✔ alle Anfragen der Reise | ✔ alle Anfragen der Reise | nie Inhalte, nie «geändert am» fremder Anfragen |
| Zugriffsprotokoll sehen | ✔ nur über die **eigenen** Angaben | dto. | dto. | – |
| Erinnern `travel-data` | – | ✔ an offene Empfänger:innen der **eigenen** Anfrage | – | W16 v2.8 |

**Grundsatz (Q28):** Die Orga hat **keinen** Sonderzugriff auf Inhalte – auch nicht über Export, Support-Wege, Admin-Seiten, Server-Actions mit fremder Request-ID oder die Datenbank-Oberfläche der App. Sie kann sich aber selbst die Markierung geben; das ist für alle am Chip sichtbar (Transparenz statt Verbot) und wirkt **nur für neue Anfragen** – bestehende Freigaben gelten weiter nur für die Person, an die sie erteilt wurden. Platzhalter und ehemalige Mitglieder handeln nie selbst. Nicht-Mitglieder und andere Phasen: gleiche 404 wie die übrigen Reise-Unterseiten (I8-09).

#### User Stories & Akzeptanzkriterien

**I11-01 Markierung „Bucht“ vergeben und entziehen (F-056)**
**Als** Orga **möchte ich** festlegen, wer für die Gruppe bucht, **damit** diese Person die nötigen Reisedaten bekommt – und nur sie.
- [ ] In „Wer ist dabei?“ (Sheet aus dem Cockpit, ab Phase `fixed`) hat jede Zeile eines Mitglieds mit Konto für die Orga die Aktion «Bucht markieren» bzw. «Markierung entfernen» (Wortlaut/Ort UX). Der Chip «Bucht» ist für **alle** Mitglieder an der Person sichtbar (auch in W20 und in „Mehr zur Reise“).
- [ ] **Standard (Q28):** Bei der **ersten** Festlegung einer Reise erhält die Orga automatisch die Markierung (danach nie wieder automatisch – auch nicht nach Festlegung aufheben + neu festlegen oder nach eigenem Entzug). **Migration:** Bestehende Reisen in Phase `fixed` ohne Markierung erhalten sie für die aktuelle Orga einmalig.
- [ ] **Grenze 3:** Eine vierte Markierung lehnt der Server ab (unter Sperre der Reise); UI zeigt vorher «Höchstens 3 Personen können buchen – entferne erst eine Markierung.» (Wortlaut UX).
- [ ] **Entziehen** mit Bestätigung, wenn die Person offene Anfragen oder Freigaben hat: «{Name} sieht dann keine Reisedaten mehr – {n} freigegebene Angaben werden sofort gelöscht.» Danach: alle Anfragen dieser Person **erloschen**, alle Freigaben dazu **sofort gelöscht** (I11-10). Ohne offene Anfragen: ohne Bestätigung, Snackbar mit Rückgängig **nur**, solange nichts gelöscht wurde.
- [ ] **Orga-Übergabe (F-004)** überträgt die Markierung **nicht**; die bisherige Orga behält ihre Markierung als Mitglied. **Verlassen/Entfernen/Konto löschen** beendet die Markierung (sie hängt an der Mitgliedschaft).
- [ ] Ohne jede Markierung zeigt „Wer ist dabei?“ der Orga «Noch niemand bucht – markiere, wer Unterkunft und Tickets bucht.» (Could, Wortlaut UX); Mitglieder sehen nichts.
- [ ] Die Markierung bleibt bei «Festlegung aufheben» erhalten (Bereich nicht erreichbar, R.0 Nr. 1).

**I11-02 Zusatzrechte „Bucht“ für Infoseite und Unterkunft (Übergang von „nur Orga“)**
**Als** „Bucht“-Person **möchte ich** die Infos ergänzen und die Unterkunft als gebucht markieren, **damit** ich nach dem Buchen nicht die Orga darum bitten muss.
- [ ] `canEditTripInfo()` erlaubt Orga **oder** „Bucht“ (serverseitig bei jedem Speichern; bisher nur Orga, `src/lib/trip-info.ts`). «Zuletzt geändert von …» unverändert. Infoseite-Leerzustand/Text-Tasten «Infos ergänzen» erscheinen auch für „Bucht“ (W22, W16 A2 – Aufgabe A2 auch für „Bucht“, Wortlaut UX).
- [ ] «Als gebucht markieren» / «Doch nicht gebucht» (W18): Orga **oder** „Bucht“. Festlegen/Aufheben bleibt Orga. `booked_by` speichert die handelnde Person.
- [ ] **Station V3** wertet „Bucher“ nach W16 v2.4 aus: alle „Bucht“-Personen, sonst die Orga. Texte mit mehreren „Bucht“-Personen («Lena und Kemal buchen …», max. 3 Namen) nach UX; Erinnern-Text `stayBook` nennt die „Bucht“-Person(en) statt fest der Orga.
- [ ] Wird die Markierung entzogen, bleiben bereits gesetzte «gebucht ✓» und Info-Änderungen bestehen (nur das Recht endet).
- [ ] Tests je Rolle: Mitglied ohne Markierung kann weder Infos speichern noch «gebucht» setzen (Server lehnt ab), „Bucht“ ohne Orga kann beides, aber **nicht** festlegen.

**I11-03 Bereich „Reisedaten“ und Einstiege im Cockpit (UX-2, F-053)**
**Als** Mitglied **möchte ich** genau einen Ort, an dem ich sehe, wer welche meiner Daten wofür bekommt, **damit** ich den Überblick behalte.
- [ ] Route `/trips/{id}/travel-data` (nur Mitglieder, nur Phase `fixed`); Aufbau nach W20: oben «Anfragen an dich» (offen → A; beantwortet → D bzw. «Du klärst das direkt mit …»; erloschen → Hinweis «… deine Angaben wurden gelöscht»), für „Bucht“ zusätzlich «Deine Anfragen» (E) und Taste `[+ Anfrage]`; für Orga ohne „Bucht“ eine Status-Karte je Anfrage (Zahlen + Chips, keine Felder, keine Anzeigen-Taste). Info-Aufklapper «Wer sieht was?» (W20). Kein Tab (UX-1).
- [ ] **Station V4** (Adapter `tripRoute()`, Vertrag W16 v2.10): Sichtbarkeit und Zustände exakt nach W16 v2.3/v2.4 V4-Tabelle je Rolle; Unit-Tests **je Zeile und Rolle**. Erneute Anfrage nach „erledigt“ öffnet V4 wieder. Mehrere Anfragen: V4 ist für ein Mitglied „dran“, solange **irgendeine** Anfrage an es offen ist; für „Bucht“ zählt die **älteste offene eigene** Anfrage (Text UX).
- [ ] **Heute** (W16 v2.5): «Reisedaten freigeben» steht in der Gruppe „blockiert andere“ an erster Stelle; «Alle Angaben da – jetzt buchen» in der Gruppe „Frist/Datum“.
- [ ] **Kachel „Reisedaten“** (Reihenfolge W16 v2.6, nur wenn V4 erledigt bzw. nicht sichtbar): für „Bucht“, solange eigene Freigaben gespeichert sind («3 Freigaben · gelöscht am 26. Juni»); **zusätzlich für jede Person mit einer eigenen gespeicherten Freigabe** («Freigegeben an Lena · gelöscht am 26. Juni») – Begründung: Widerruf muss so leicht erreichbar sein wie die Erteilung (Art. 7 Abs. 3 DSGVO), auch *Unterwegs*, wenn V4 in der eingeklappten Vorbereitung steckt. *(Abweichung von W16 v2.6 „nur Bucht“ – UI/UX gleicht an.)*
- [ ] **D3** (*Danach*): sichtbar, wenn es für mich Anfragen gab bzw. ich „Bucht“ mit Anfragen war; Zustand „erledigt“ automatisch, sobald alle betroffenen Freigaben gelöscht sind; Ziel = Leerzustand W20 G. Vor dem Löschdatum (Tage 1–7 nach Abreise) Zustand «als Nächstes» mit «Wird am {Datum} gelöscht» (Text UX). Weg-Meta *Danach* zählt D3 mit.
- [ ] Platzhalter zählen in Zahlen («2 von 4») **nicht** mit; sie erscheinen in der „Bucht“-Sicht als «noch nicht dabei» (W16 v2.11).
- [ ] Statusangaben aktualisieren sich beim Neuladen (kein Live-Update, wie F-008).

**I11-04 Anfrage erstellen (nur „Bucht“)**
**Als** „Bucht“-Person **möchte ich** für eine konkrete Buchung genau die nötigen Angaben anfragen, **damit** ich sie nicht einzeln im Chat einsammeln muss.
- [ ] Route `/trips/{id}/travel-data/new` nach W20 F: **Zweck** (Pflicht, 1–60 Zeichen, nur Text, Steuerzeichen entfernt – Hinweis «Alle Gefragten sehen den Zweck»), **Felder** per Schalter (Tabelle oben: Name immer an und gesperrt, Geburtsdatum Standard an, Rest aus; Ablaufdatum/Ausstellungsland nur bedienbar, wenn Dokument an), Warnhinweis bei Dokument (Wortlaut F-054/W20), Liste «Nie abgefragt: …». **Empfänger:innen:** Standard alle Mitglieder außer mir **und** alle offenen Platzhalter; abwählbar; mindestens 1.
- [ ] Server prüft: Markierung aktiv, Phase `fixed`, heute ≤ Abreisetag, ≤ 3 offene eigene Anfragen, Felder nur aus der Liste und Abhängigkeiten (`document_expiry`/`issuing_country` ⇒ `document`), Empfänger:innen sind Mitglieder/offene Platzhalter **dieser** Reise und nicht ich selbst. Idempotenz-Schlüssel je Formular-Öffnung (wie I10-02).
- [ ] Nach dem Senden: Snackbar «Anfrage an {n} Personen gesendet», zurück zu `/travel-data`. Die Gefragten sehen V4 „dran“ im Cockpit. **Keine Mails** in Stufe 1 (erst F-014, und dann nur «{Name} bittet um deine Reisedaten» ohne Zweck-Details/Felder).
- [ ] Felder einer bestehenden Anfrage sind **nicht** änderbar (Einwilligung bezieht sich auf die Felder); für weitere Felder wird eine neue Anfrage gestellt.

**I11-05 Anfrage beantworten – Schritt 1 „Angaben“**
**Als** Mitreisende **möchte ich** meine Angaben schnell und richtig eingeben, **damit** die Buchung nicht am falschen Namen scheitert.
- [ ] Route `/trips/{id}/travel-data/{requestId}` nach W20 B: nur die angefragten Felder, Prüfregeln laut Feldtabelle, Meldungen nach UX, `autocomplete` nur hier (eigene Eingabe). Hinweis «Demo – bitte keine echten Ausweisdaten eingeben.» in Demo/Vorschau (I11-12).
- [ ] **Übernehmen (Should):** Hat die Person in **derselben Reise** schon eine Freigabe mit überschneidenden Feldern, bietet Schritt 1 «Angaben aus deiner Freigabe an {Name} übernehmen» an (Felder vorbelegt, Person prüft). Reiseübergreifend **nie** (Q30).
- [ ] Werte aus Schritt 1 liegen bis zur Freigabe **nur im Browser** (Formularzustand, kein `localStorage`/`sessionStorage`); ohne Freigabe wird **nichts** gespeichert. Verlassen der Seite verwirft die Eingabe.

**I11-06 Schritt 2 „Freigeben“ – Einwilligung oder Ablehnen**
**Als** Mitreisende **möchte ich** bewusst zustimmen, an wen meine Daten gehen und wann sie gelöscht werden, **damit** ich die Kontrolle behalte.
- [ ] W20 C: Zusammenfassung der eigenen Werte (Klartext, nur für die Person selbst) + **Einwilligungs-Checkbox, nicht vorangekreuzt**, deren Label der Einwilligungstext ist. Inhalt (Wortlaut UX, sinngemäß): Zweck, Empfänger:in (Name), verschlüsselte Speicherung, nur diese Person sieht die Angaben, **Löschregel «7 Tage nach der Reise (derzeit {Datum})»** bzw. früher bei Widerruf, jederzeit widerrufbar. *(Regel + aktuelles Datum statt nur Datum, damit eine Terminänderung nicht außerhalb der Einwilligung liegt – I11-10.)*
- [ ] Server speichert nur bei gesetzter Einwilligung: verschlüsselte Werte, `consent_at`, **Version und Sprache des Einwilligungstextes** (Nachweis Art. 7 Abs. 1 DSGVO), Zustand *freigegeben*. Ohne Häkchen: Fehler nach W20, nichts gespeichert.
- [ ] **Ablehnen** («Ich kläre das direkt mit {Name}») in A und C möglich, ohne Begründung, ohne Eingabe. Gespeichert wird nur der Zustand *klärt es direkt*; „Bucht“ und Orga sehen nur diesen Zustand. «Doch freigeben» führt zu Schritt 1.
- [ ] Nach Freigabe: Snackbar «Freigegeben an {Name}» (ohne Werte), zurück zu W20 D; V4 aktualisiert.

**I11-07 Eigene Freigabe ansehen, ändern, zurückziehen; Zugriffsprotokoll**
**Als** Mitreisende **möchte ich** sehen, ob und wann die „Bucht“-Person meine Angaben angesehen hat, und sie jederzeit zurückziehen, **damit** ich ihr nicht blind vertrauen muss.
- [ ] W20 D: eigene Werte im Klartext (nur für die Person selbst), Löschdatum, Liste **Zugriffe** («{Name} hat deine Angaben {Datum/relativ} angesehen.» / «… „{Feld}“ … kopiert.»), neueste zuerst, gruppiert bei Wiederholungen (Wortlaut UX).
- [ ] **Ändern:** Schritt 1 vorbelegt → Schritt 2 mit erneuter Einwilligung (neue `consent_at`). „Bucht“ sieht «geändert am {Datum}» an der Person.
- [ ] **Zurückziehen:** Bestätigung nach W20 → Werte und Zugriffsprotokoll dieser Freigabe werden **sofort hart gelöscht** (kein weiches Löschen, kein Papierkorb); Antwort wieder *offen* (Anfrage bleibt bestehen, V4 wieder „dran“). Snackbar ohne Rückgängig.
- [ ] Zugriffe werden **nur** für Anzeigen/Kopieren durch die „Bucht“-Person protokolliert, nicht für Aufrufe der Person selbst. Das Protokoll enthält: wer, wann, Aktion (`view` / `copy`), bei `copy` der Feld-Code – **nie** Werte.

**I11-08 Sicht „Bucht“: Status, Maskierung, Anzeigen, Kopieren, Re-Authentifizierung**
**Als** „Bucht“-Person **möchte ich** die Angaben aller Freigaben bequem ins Buchungsformular übertragen, **damit** die Buchung schnell geht – ohne dass jemand über meine Schulter mitliest.
- [ ] W20 E: je eigene Anfrage Karte mit Zweck, Feldern, «{n} von {m} haben freigegeben», je Person Status-Chip; Felder **maskiert**. Die Maskierung entsteht **auf dem Server**: Die Seite liefert initial **keine** Klartexte aus (auch nicht versteckt im HTML/RSC-Payload). Maskenregeln: Name erster Buchstabe + «•••»; Datum «••.••.••••»; Dokumentnummer erstes und letztes Zeichen; Länder-/Art-/Geschlechtsfelder dürfen unmaskiert sein (geringes Risiko, Developer kann maskieren).
- [ ] **«Anzeigen»** (je Person) ruft eine Server-Aktion auf, die die Klartexte **dieser** Person liefert und einen Protokolleintrag `view` schreibt; sichtbar bis zum Verlassen der Seite (nur Seitenzustand). **«Kopieren»** (je Feld) holt den Wert serverseitig, schreibt `copy` + Feld-Code und legt ihn in die Zwischenablage; Snackbar «Kopiert – bitte nicht in Chats weiterleiten.» (ohne Wert).
- [ ] **Re-Authentifizierung (F-054):** Anzeigen oder Kopieren einer Person **mit Dokumentnummer** verlangt eine frische Bestätigung, wenn die aktuelle Sitzung nicht innerhalb der letzten **12 h** per **Code oder Magic Link** angemeldet bzw. bestätigt wurde (Passwort-Anmeldung zählt nicht – gleiche Begründung wie `src/server/auth/reauth.ts`). Bestätigung über das vorhandene Code-Sheet (W02/Flow I.2); eigener Marker je Sitzung, gültig 12 h. Ohne Dokumentnummer: keine Re-Authentifizierung.
- [ ] Verantwortungs-Hinweis für „Bucht“ (Wortlaut F-054/W20) oben im Bereich. Kein Sammel-Export, kein CSV, kein Druck-Layout, keine Taste «Alle anzeigen».
- [ ] Antworten des Bereichs mit `Cache-Control: no-store`; Seitentitel, URLs, Snackbars und `aria-live`-Meldungen enthalten **nie** Werte; `autocomplete="off"` in der „Bucht“-Sicht.

**I11-09 Anfrage verwalten, erinnern, abschließen**
**Als** „Bucht“-Person **möchte ich** Nachzügler erinnern und die Anfrage nach dem Buchen abschließen, **damit** die Daten nicht länger als nötig liegen.
- [ ] **Empfänger:innen ergänzen** (z. B. neues Mitglied seit der Anfrage): Liste der noch nicht gefragten Mitglieder/offenen Platzhalter; neue Personen sehen die Anfrage sofort. **Entfernen** einer Person löscht deren Freigabe sofort (Bestätigung, wenn freigegeben). Neue Mitglieder werden **nicht** automatisch hinzugefügt.
- [ ] **Platzhalter** als Empfänger:in: Löst die Person ihren Platzhalter ein (F-007), übernimmt sie die offene Anfrage (V4 „dran“). Wird der Platzhalter gelöscht, entfällt die Empfänger-Zeile.
- [ ] **Erinnern** über das vorhandene `RemindSheet` (F-015), Anlass `travel-data` mit dem Text aus W16 v2.8 (DE/EN): `single` an eine offene Person, `all` an alle offenen; Text enthält Name, Zweck und Link auf `/travel-data` – **nie** Felder oder Werte. Platzhalter nur über ihren persönlichen Link (wie V2).
- [ ] **«Erledigt – Daten löschen»** (W20 E) schließt die Anfrage: Bestätigung, dann alle Freigaben und Protokolle **sofort gelöscht**, Antworten *erloschen*, V4 für „Bucht“ erledigt «Erledigt – Daten gelöscht». Gefragte sehen «{Name} hat fertig gebucht – deine Angaben wurden gelöscht.» (Wortlaut UX).
- [ ] Keine weiteren Erinnern-Anlässe in Stufe 1: Mitglieder erinnern „Bucht“ nicht; Orga ohne „Bucht“ erinnert nicht (die Anfrage gehört „Bucht“, W16 v2.4).

**I11-10 Lebenszyklus & Löschung (Q31)**
**Als** Mitreisende **möchte ich**, dass meine Ausweisdaten automatisch verschwinden, sobald sie niemand mehr braucht, **damit** kein Datenleck Jahre später passieren kann.
- [ ] **Hart gelöscht** (verschlüsselte Werte **und** Zugriffsprotokoll; Antwort *erloschen* bzw. *offen*) – jeweils sofort im auslösenden Vorgang, in derselben Transaktion:
  | Auslöser | Was wird gelöscht |
  |---|---|
  | Widerruf durch die Person | ihre Freigabe für diese Anfrage (Antwort wieder *offen*) |
  | Person wird als Empfänger:in entfernt | ihre Freigabe für diese Anfrage |
  | «Erledigt – Daten löschen» | alle Freigaben der Anfrage |
  | Markierung „Bucht“ entzogen | alle Freigaben aller Anfragen dieser Person; Anfragen *erloschen* |
  | Anfragende Person verlässt die Reise / wird entfernt / löscht ihr Konto | wie Entzug; Anfrage bleibt nur als Hülle (Zweck, Zustand) mit «ehemaliges Mitglied» |
  | Gefragte Person verlässt die Reise / wird entfernt / löscht ihr Konto | alle ihre Freigaben und Antworten in dieser Reise (bzw. allen Reisen) |
  | **Löschdatum erreicht** (Abreise + 7 Tage) | alle Freigaben der Reise; Anfragen *erloschen*; D3 erledigt |
  | Festlegung aufgehoben und **30 Tage** keine neue Festlegung | alle Freigaben der Reise |
  | Reise gelöscht (F-013) | alles (Kaskade) |
- [ ] **Löschjob** (`POST /api/internal/retention`, täglich; Vorschau: Vercel-Cron) löscht fällige Freigaben (Löschdatum, 30-Tage-Regel) und dient als **Sicherheitsnetz** für alle Fälle oben (z. B. Freigaben, deren anfragende Person nicht mehr „Bucht“-Mitglied ist). **Zusätzlich** liefert der Lese-Pfad **nie** Werte nach dem Löschdatum oder ohne aktive Markierung aus, auch wenn der Job noch nicht gelaufen ist (Test).
- [ ] **Termin geändert** (neue Festlegung mit anderem Zeitraum): Freigaben bleiben bestehen, das Löschdatum wird neu berechnet; Gefragte sehen in W20 D das neue Datum und einmalig «Eure Reise hat neue Daten – deine Angaben werden jetzt am {Datum} gelöscht. Du kannst die Freigabe jederzeit zurückziehen.» (Wortlaut UX). „Bucht“ sieht einen Hinweis, dass Buchungen ggf. neu nötig sind (analog R.7 «gebucht» zurückgesetzt). Der Einwilligungstext deckt das über die Regel ab (I11-06).
- [ ] **Festlegung aufgehoben:** Bereich nicht erreichbar (wie Kosten/Unterkünfte), Daten bleiben bis zu 30 Tage; Banner nach W16 «… Reisedaten … bleiben erhalten» ergänzt um «… höchstens 30 Tage» (Wortlaut UX).
- [ ] Anfrage-**Hüllen** (Zweck, Felder-Liste, Zustände, Zeitstempel – ohne Werte, ohne Protokoll) bleiben bis zur Löschung der Reise (90 Tage, F-013), damit D3 und «… wurden gelöscht»-Hinweise funktionieren. Der Zweck ist kein sensibles Datum; Hinweis im UI «Keine persönlichen Daten in den Zweck schreiben» (Wortlaut UX).
- [ ] **Aufbewahrung Zugriffsprotokoll:** genau so lange wie die zugehörige Freigabe (wird mit ihr gelöscht, F-054) – kein getrenntes Sicherheitsprotokoll mit Personenbezug. Betriebs-Logs enthalten höchstens anonyme Zähler (z. B. „travel_data.reveal ok“), **keine** IDs von Personen, Anfragen oder Feldern.

**I11-11 Datenexport, Konto löschen, Reise verlassen**
**Als** Mitglied **möchte ich** meine eigenen Reisedaten exportieren können und sicher sein, dass niemand über den Export an fremde kommt, **damit** meine Rechte gewahrt sind.
- [ ] **Datenexport (F-013/F-043, Q23)** je Reise: eigene **gespeicherte Freigaben** (Zweck, Empfänger:in mit Name – Art. 15 Abs. 1 lit. c, Felder mit **Klartext**, `consent_at`, Löschdatum) und das **Zugriffsprotokoll über die eigenen Angaben**; eigene Antworten *klärt es direkt*. Als „Bucht“: eigene Anfragen (Zweck, Felder, Zeitpunkte, Anzahl Antworten je Zustand) – **keine** Werte, Namen oder Zustände anderer Personen. Die Orga erhält **nichts** Zusätzliches.
- [ ] Enthält der Export eine Dokumentnummer, gilt dieselbe Re-Authentifizierung wie I11-08 (Should – Schutz bei übernommener Sitzung).
- [ ] **Konto löschen (F-043):** Warn-Schritt nennt zusätzlich «Deine freigegebenen Reisedaten werden sofort gelöscht» bzw. für „Bucht“ «Deine offenen Anfragen werden geschlossen und alle Freigaben gelöscht» (Wortlaut UX). Löschung nach I11-10 vor dem Löschen des Kontos, im selben Ablauf.
- [ ] **Reise verlassen / entfernt werden:** Hinweiszeile im bestehenden Bestätigungsdialog, wenn Freigaben oder eigene Anfragen bestehen (Wortlaut UX). Keine zusätzliche Sperre.

**I11-12 Demo-/Vorschau-Schutz und Gate G1b (technisch abgesichert)**
**Als** Betreiber **möchte ich**, dass vor G1b niemand echte Ausweisdaten einträgt und der Bereich in Produktion erst nach G1b aufgeht, **damit** keine echten Ausweisdaten bei einem US-Anbieter oder ohne Schutzpaket landen.
- [ ] **Feature-Schalter** `TRAVEL_DATA_ENABLED`: in `development`, `ci`, `demo`, `preview` standardmäßig **an**; in `staging` und `production` standardmäßig **aus**. Aus = keine V4/D3/Kachel, Routen 404, Server-Aktionen abgelehnt; die Markierung „Bucht“ und ihre Rechte aus I11-02 funktionieren trotzdem. Einschalten in `production` erst nach dokumentierter G1b-Abnahme (`docs/ops/compliance-checklist.md`).
- [ ] **Startschutz** (wie `APP_ENV=production`-Prüfung in `src/lib/app-env.ts`): `TRAVEL_DATA_ENABLED=true` in `staging`/`production` **ohne** eigenen Schlüssel (`TRAVEL_DATA_KEYS`) → Start verweigert. Auf Vercel (immer `preview`) bleibt es bei Fantasiedaten.
- [ ] **Demo und Vorschau:** Hinweis «Demo – bitte keine echten Ausweisdaten eingeben.» (W20) in Schritt 1, Schritt 2, neue Anfrage und „Bucht“-Sicht – nicht wegklickbar; **Dokumentnummern müssen mit `DEMO` beginnen** (Server-Validierung, Meldung «In der Demo nur Fantasie-Nummern, die mit DEMO beginnen.»), damit echte Pass-/Ausweisnummern technisch ausgeschlossen sind. Namen/Geburtsdaten sind nicht technisch unterscheidbar – dafür gelten Hinweis, „Demo zurücksetzen“ (löscht alles) und die normalen Löschfristen.
- [ ] Verschlüsselung ist auch in Demo/Vorschau **aktiv** (derselbe Code-Pfad; nur der Schlüssel-Ursprung unterscheidet sich, s. unten).

**I11-13 Querschnitt (Abnahme)**
- [ ] 360 × 640, 390 × 844, 320 px, 200 % Schrift, Dark Mode, DE/EN (Datumsformat je Sprache), Desktop ≥ 960 px (W20 Desktop); vollständig per Tastatur und Screenreader (Barrierefreiheit W20: Maske hat zugänglichen Namen «verborgen», Kopieren-Tasten «{Feld} von {Name} kopieren», Einwilligungstext = Label, Schalter `role=switch`).
- [ ] Reduzierte Bewegung: nur Überblenden; kein Konfetti in diesem Bereich.
- [ ] Abnahme-Fälle: Orga markiert sich/andere (Grenze 3, Platzhalter nicht markierbar) · „Bucht“ bearbeitet Infos und markiert «gebucht» · Anfrage Name + Geburtsdatum an alle inkl. Platzhalter · Mitglied gibt frei (ohne Häkchen → Fehler) · Mitglied lehnt ab und gibt später doch frei · „Bucht“ zeigt an/kopiert → Protokoll beim Mitglied sichtbar · Anfrage mit Dokumentnummer + Re-Authentifizierung nach > 12 h · Orga ohne „Bucht“ sieht nur Status (auch per direkter Server-Aktion mit fremder Request-ID: abgelehnt) · Widerruf → sofort weg bei „Bucht“ · Entzug der Markierung → Freigaben weg, Hinweis beim Mitglied · Mitglied/„Bucht“ verlässt die Reise · Platzhalter tritt bei und übernimmt die Anfrage · neue Festlegung mit anderem Zeitraum → neues Löschdatum + Hinweis · Löschdatum erreicht → D3 + Leerzustand · Datenexport Mitglied (eigene Werte) und „Bucht“ (keine fremden) · Vorschau: Dokumentnummer ohne `DEMO` abgelehnt.

#### Verschlüsselung & Schlüssel (Pflicht – Reviewer prüft mit Tests)
1. **Verfahren:** AES-256-GCM über Node `crypto` (keine neue Abhängigkeit), je Freigabe **ein** verschlüsselter JSON-Datensatz der angefragten Felder (Feldnamen + Werte), 96-Bit-Zufalls-Nonce je Verschlüsselung (nie wiederverwenden, auch nicht beim Ändern), 128-Bit-Tag. **Zusatzdaten (AAD)** = Reise-ID + Anfrage-ID + Personen-ID + Schema-Version – ein Chiffrat lässt sich so nicht in eine andere Zeile/Person kopieren (Test: vertauschte Zeile → Entschlüsselung schlägt fehl).
2. **Schlüssel außerhalb der DB:** `TRAVEL_DATA_KEYS` als Umgebungs-Secret, Liste `kid:base64(32 Byte)`, erster Eintrag = aktueller Schlüssel. Jede Zeile speichert `key_id`. Getrennt von `BETTER_AUTH_SECRET`, `RETENTION_TOKEN` und der Datenbank-URL; nie im Repository (CLAUDE.md), nie im Client-Bundle (`server-only`).
3. **Rotation:** neuen Schlüssel voranstellen → neue/geänderte Freigaben nutzen ihn → Skript `pnpm travel-data:rotate` verschlüsselt Bestandszeilen um (idempotent, batchweise) → alten Schlüssel entfernen. Runbook bei Schlüsselverlust (Daten unlesbar → alle Freigaben löschen, Anfragen erloschen, Hinweis an Betroffene) und bei Schlüsselleck (rotieren, betroffene Freigaben bewerten, Meldepflicht Art. 33 prüfen) liefert Operations für G1b.
4. **Demo/Vorschau/Entwicklung:** Fehlt `TRAVEL_DATA_KEYS`, wird **nur** in `development`, `ci`, `demo`, `preview` ein Schlüssel per HKDF aus `BETTER_AUTH_SECRET` mit festem Kontext („travel-data-demo-v1“) abgeleitet – damit braucht die Vercel-Vorschau **keine neue Variable** und der Auftraggeber nichts nachzutragen. Fehlt auch das, ist der Bereich aus (fail closed). In `staging`/`production` ist die Ableitung verboten (Startschutz I11-12).
5. **Nie im Klartext außerhalb des Entschlüsselungs-Moments:** keine Werte in Logs, Fehlermeldungen, Fehler-Tracking, Analytics, URLs/Query-Strings, Mails, Teilen-/Erinnern-Texten, Seitentiteln, Snackbars, Cookies, `localStorage`, Server-Caches (`unstable_cache`, `fetch`-Cache) oder im RSC-Payload der Erstansicht. Server-Aktionen loggen keine Argumente. Test: Logs/Antworten eines kompletten Ablaufs werden auf die Demo-Werte durchsucht (keine Treffer außer den erlaubten Antworten).
6. **Zugriffsprüfung vor dem Entschlüsseln:** Entschlüsselt wird nur in zwei Funktionen (eigene Freigabe für die Person selbst; Anzeigen/Kopieren für die anfragende „Bucht“-Person inkl. Protokolleintrag) – beide prüfen Mitgliedschaft, Markierung, Anfrage-Zustand, Löschdatum und ggf. Re-Authentifizierung **in derselben Abfrage/Transaktion**. Alle IDs werden gegen `trip_id` geprüft (keine reiseübergreifenden Zugriffe).

#### Sicherheit (Pflicht – Reviewer prüft mit Tests, Security-Review laut G1b)
1. **Rechte** aus der Tabelle serverseitig, Tests je Zeile – insbesondere: Orga ohne „Bucht“ bekommt über **keinen** Weg Inhalte (Seite, Server-Aktion, Export); „Bucht“ sieht nur **eigene** Anfragen (nicht die einer zweiten „Bucht“-Person); Mitglieder sehen keine Antworten anderer; Platzhalter/ehemalige Mitglieder handeln nie.
2. **Einwilligung** nur mit gesetztem Häkchen serverseitig (nicht nur Client); Einwilligungs-Version + Sprache gespeichert.
3. **Löschung** hart und vollständig (Werte + Protokoll) in jedem Fall aus I11-10 – Test je Zeile der Tabelle; Lese-Pfad liefert nach Fristablauf nichts (Test mit verschobener Uhr).
4. **Eingaben nur als Text:** Zweck und Felder ohne HTML/Markdown, Steuerzeichen entfernt, Normalisierung vor dem Verschlüsseln.
5. **Re-Authentifizierung** für Dokumentnummern (I11-08) – Test „Sitzung älter als 12 h / Passwort-Anmeldung → Code nötig“.
6. **Keine neuen Drittanbieter, keine ausgehenden Verbindungen**, keine Mails in Stufe 1; `Cache-Control: no-store` auf allen Antworten des Bereichs; `Referrer-Policy` mindestens wie bisher.
7. **Fehlerfälle** zeigen generische Meldungen («Das hat nicht geklappt – bitte neu laden.»), nie Inhalte oder Krypto-Details.

**Rate-Limits** (pro **Konto**, Mechanismus `src/server/rate-limit.ts`; Werte als Vorgabe, Developer darf begründet anpassen):
| Aktion | Limit |
|---|---|
| Anfrage erstellen | 10 / h je Konto |
| Empfänger:innen ändern, Anfrage abschließen | 30 / 10 min je Konto |
| Freigeben / ändern / ablehnen / zurückziehen | 30 / 10 min je Konto |
| Anzeigen + Kopieren (zusammen) | 120 / 10 min je Konto (Schutz gegen automatisiertes Absaugen; Überschreitung: bestehende Limit-Meldung) |
| Markierung „Bucht“ ändern | wie andere Schreibaktionen der Orga |
| Re-Authentifizierung (Code) | bestehende Code-Limits (F-041) |
Technische Obergrenzen: 3 offene Anfragen je „Bucht“-Person, 50 Empfänger:innen je Anfrage, Zugriffsprotokoll max. 1 000 Einträge je Freigabe (ältere werden zusammengefasst).

#### Datenhaltung (Vorgabe für Developer, Bewertung durch Reviewer)
| Was | Wo (Empfehlung) | Löschung / Datenschutz |
|---|---|---|
| Markierung „Bucht“ | an der Mitgliedschaft: `trip_member.booker_since` (null = nicht markiert), `trip_member.booker_set_by` (FK Konto `SET NULL`); Grenze 3 in der App unter Sperre der Reise | Endet mit der Mitgliedschaft. |
| Standard-Markierung erledigt | `trip.booker_defaulted_at` (gesetzt bei der ersten Festlegung bzw. Migration) | – |
| Festlegung aufgehoben seit | `trip.unfixed_at` (gesetzt bei «Festlegung aufheben», null bei neuer Festlegung) – falls nicht schon vorhanden | Grundlage der 30-Tage-Regel. |
| Anfragen | neue Tabelle `travel_data_request`: `id`, `trip_id` (FK `CASCADE`), `requester_id` (FK Konto `SET NULL`), `purpose` (1–60), `fields` (`text[]`, nur erlaubte Codes, Prüfung per `check`), `created_at`, `closed_at`, `closed_reason` (`done` · `booker_revoked` · `requester_left` · `expired` · `unfixed`, null = offen), `idempotency_key` | Hülle bleibt bis zur Reise-Löschung (90 Tage); keine Werte. |
| Antworten / Empfänger:innen | neue Tabelle `travel_data_recipient`: `id`, `request_id` (FK `CASCADE`), `trip_id`, `user_id` (null) **oder** `placeholder_id` (null, FK `CASCADE`) – genau eins; zusammengesetzter FK (`trip_id`, `user_id`) → `trip_member` **`ON DELETE CASCADE`** (Verlassen/Entfernen/Konto löschen räumt automatisch ab, wie `availability`); `state` (`open` · `released` · `declined` · `expired`), `responded_at`, `updated_at`; eindeutig (`request_id`, `user_id`) bzw. (`request_id`, `placeholder_id`) | Kaskade mit Anfrage, Mitgliedschaft, Platzhalter. |
| Freigabe (verschlüsselt) | neue Tabelle `travel_data_release`: `recipient_id` (PK + FK `CASCADE`), `ciphertext` (`bytea`), `nonce` (`bytea`, 12 Byte), `key_id`, `schema_version`, `consent_at`, `consent_version`, `consent_locale`, `created_at`, `updated_at` | **Hart** gelöscht nach I11-10; Kaskade mit der Antwort. Backups enthalten nur Chiffrat (R.4: Backups max. 30 Tage). |
| Zugriffsprotokoll | neue Tabelle `travel_data_access`: `id`, `recipient_id` (FK → `travel_data_release` **`CASCADE`**), `actor_id` (FK Konto `SET NULL`), `action` (`view` · `copy`), `field` (null oder Feld-Code), `at` | Lebt genau so lange wie die Freigabe. |
| Re-Authentifizierung 12 h | Marker je Sitzung in `verification` (Muster `reauth.ts`, eigener Bezeichner, TTL 12 h) | Verfällt automatisch. |
| Nur im Browser | Formularwerte Schritt 1/2, angezeigte Klartexte („Anzeigen“) | Kein Speicher im Browser, kein Cache. |

Migrationen: eine Migration (`0012`) für die vier Tabellen, Spalten an `trip_member` und `trip`, einmalige Standard-Markierung für bestehende Reisen in Phase `fixed`. Löschjob erweitern (Löschdatum, 30-Tage-Regel, Sicherheitsnetz verwaiste Freigaben). Neue Umgebungsvariablen (optional in Demo/Vorschau): `TRAVEL_DATA_ENABLED`, `TRAVEL_DATA_KEYS` → `docs/ops/deployment.md` §4 (Operations). Keine neuen Drittanbieter, kein Dateispeicher.

#### Demo-Seed (`seed.ts`, „Demo zurücksetzen“)
Alle Namen, Geburtsdaten und Nummern sind Fantasie; Dokumentnummern beginnen mit `DEMO`. Freigaben werden beim Seed **verschlüsselt** geschrieben (gleicher Code-Pfad).
- **„Kroatien 2027“** (*Vorbereitung*, Ben Orga): Ben gibt die Markierung an **David** und entzieht sie sich selbst → Ben ist **Orga ohne „Bucht“** (sieht nur Status). David fragt «Fähre Split – Hvar» (Name + Geburtsdatum) an alle inkl. Platzhalter Lotte; Carla hat freigegeben, **Anna offen** → bei Anna V4 **«du bist dran»** an erster Stelle unter Heute; Emma «klärt es direkt».
- **„Familientreffen Harz“** (*Vorbereitung*, Anna Orga + Standard-„Bucht“): Anfrage «Bahntickets Hannover – Braunlage» (Name + Geburtsdatum); Hanna **freigegeben** (mit 2 Protokolleinträgen), Greta offen, Opa Klaus «noch nicht dabei» → Anna sieht die „Bucht“-Sicht mit Maskierung, Anzeigen/Kopieren, `[Erinnern]`, «Erledigt – Daten löschen».
- **„Roadtrip Schottland“** (*Unterwegs*, Ben Orga + „Bucht“): Anfrage «Flüge nach Edinburgh» **mit Dokument** (Art + Nummer, Ablaufdatum, Ausstellungsland, Staatsangehörigkeit); Anna und Carla freigegeben, Emma freigegeben mit Ablaufdatum **vor** dem Löschdatum (Hinweis nur bei Emma). Ben braucht beim Anzeigen Re-Authentifizierung (Demo-Sitzung älter als 12 h oder per Passwort – Developer stellt das vorführbar her). Anna sieht die Kachel «Freigegeben an Ben · gelöscht am …» und Bens Zugriffe.
- **„Gardasee“** (*Danach*, Abreise vor 9 Tagen): Felix hatte angefragt, Anna freigegeben → Löschdatum vorbei, **D3 erledigt** «Reisedaten gelöscht», Leerzustand W20 G.
- **„Kroatien Segeln“**, „Malle 2026“: keine Anfragen → V4 für Mitglieder nicht sichtbar, für die Orga (Standard-„Bucht“) «als Nächstes».

#### Hinweise an UI/UX (W20/W16 angleichen)
1. Einwilligungstext mit **Regel + aktuellem Datum** («7 Tage nach der Reise, derzeit am …»), Hinweis bei Terminänderung (I11-06, I11-10).
2. Kachel „Reisedaten“ auch für Personen **mit eigener Freigabe** (I11-03, Art. 7 Abs. 3) – Abweichung von W16 v2.6.
3. D3 vor dem Löschdatum «als Nächstes» mit Datum (I11-03).
4. Mehrere „Bucht“-Personen: Texte V3/V4/Erinnern mit bis zu 3 Namen; zweite Anfrage-Karte in W20 E; Zustand „Orga ohne Markierung, niemand bucht“.
5. Vorschau-Regel `DEMO`-Präfix für Dokumentnummern inkl. Meldung (I11-12).
6. «Markierung entfernen» mit Lösch-Bestätigung; Hinweiszeilen in „Reise verlassen“ und „Konto löschen“ (I11-01, I11-11).
7. Hinweis «Keine persönlichen Daten in den Zweck schreiben» bei der neuen Anfrage (I11-10).

#### Nicht in Inkrement 11 (Abgrenzung)
| Kommt mit | Inhalt |
|---|---|
| **Inkrement 12** (F-055) | Reiseunterlagen/Tickets, Station V5, Datei-Infrastruktur. Reisedaten bleiben **getrennt** (UX-2) – keine Dateien, keine Scans in Reisedaten. |
| **Gate G1b** (vor echter Nutzung) | Produktiv-Schlüssel + Rotation + Runbook, DSFA-Schwellwert/DSFA, VVT/TOM/Löschkonzept, Datenschutzerklärung (Einwilligung F-054, Empfänger, Fristen), rechtliche Kurzprüfung Ausweis-/Passnummern (PAuswG), Security-Review, dann `TRAVEL_DATA_ENABLED=true` in Produktion. |
| v1 (mit F-014) | Mail «{Name} bittet um deine Reisedaten» (ohne Zweck-Details/Felder/Werte, opt-in). |
| später (Q30, nach Sicherheitsreview) | «Für künftige Reisen in meinem Konto merken», reiseübergreifendes Übernehmen, Vielfliegernummern, Prüfziffer-/MRZ-Plausibilisierung, Export für Gruppenbuchungen, automatische Anfrage an später Beitretende, Erinnern durch Mitglieder an „Bucht“, Live-Updates, Push. |
| nie | Ausweis-Scans/-Fotos, Adresse, Freitext-/Gesundheitsangaben, Sonderzugriff der Orga, Reisedaten hinter einer Bezahlschranke (Q36), Ende-zu-Ende-Verschlüsselung in Stufe 1 (R.4 – ohne Nutzergeheimnis nicht sinnvoll). |

Aufwand: **M (≈ 1 Inkrement)** + Security-Review. Risiko: **hoch** (Ausweisdaten) – beherrscht durch Datensparsamkeit, Need-to-know-Rechte mit Tests je Zeile, Verschlüsselung mit AAD, harte Löschung mit Sicherheitsnetz und den Vorschau-Schutz; echte Daten erst nach G1b.

---

## WON'T (jetzt) – spätere Ausbaustufen

Nur grob beschrieben; werden vor Umsetzung detailliert. **F-031, F-033, F-035, F-036 sind seit v0.5 im Abschnitt **AUSBAUSTUFE „Reise managen“** (oben) detailliert; die Zeilen unten bleiben als Historie.**

| ID | Feature | Kern-User-Story | Notizen |
|---|---|---|---|
| F-030 | Zielfindung | Als Gruppe wollen wir Reiseziele vorschlagen und darüber abstimmen, damit wir uns auf ein Ziel einigen. | Gleiche Abstimmungsmechanik wie F-011 wiederverwenden (Optionen = Ziele mit Link/Bild). |
| F-031 | Unterkünfte (Swipe-Voting) | Als Mitglied will ich Unterkünfte beisteuern und alle Vorschläge wie bei Tinder durchswipen und liken, damit wir am Ende die Unterkunft finden, die den meisten gefällt. | **Auftraggeber-Idee (2026-10-08), Ausbaustufe sobald „Termin finden“ steht.** (1) Beisteuern: jedes Mitglied fügt eine Unterkunft hinzu – **Link Pflicht** (zum Wiederfinden: Airbnb, Booking, Ferienhaus-Portal …) plus **Screenshots** hochladen. Bevorzugt: Bilder, Titel und Preis automatisch aus dem Link laden (Link-Vorschau/Open Graph), Screenshots nur als Rückfall, wenn das Portal keine Vorschau liefert. (2) Swipen: Kartenstapel aller Unterkünfte, nach rechts = Like, nach links = Nope (Buttons als barrierefreie Alternative, Rückgängig für den letzten Swipe), eigene Vorschläge ebenfalls bewertbar. (3) Ergebnis: Likes werden gesammelt, Rangliste „gefällt den meisten“ (bei Gleichstand z. B. nach Preis/Anzahl Superlikes); Ergebnis erst sichtbar, wenn man selbst fertig geswipt hat (analog Q13 a); Orga kann die Gewinner-Unterkunft festlegen und teilen. Offen/zu prüfen: Rechtliches und Technik der Link-Vorschau (Portale blockieren teils Abrufe; Bildrechte/Urheberrecht bei Übernahme fremder Fotos – ggf. nur verlinken/als Vorschau anzeigen, nicht speichern), Speicherung und Löschung hochgeladener Screenshots (DSGVO, F-013), Preis pro Person, Wiederverwendung der Abstimmungs-/Motion-Muster (Swipe-Animation → Motion Designer). Premium-Kandidat. |
| F-032 | Aufgaben & Packliste | Als Organisator will ich Aufgaben verteilen („Mietwagen buchen“), damit Arbeit fair verteilt ist. | Zuständige, Fälligkeit, Abhaken. Premium-Kandidat. |
| F-033 | Reise-Infoseite | Als Mitglied will ich alle Infos (Adresse, Anreise, Check-in) an einem Ort, damit ich nicht im Chat suchen muss. | Freitext + Links Free; Dateiupload später (Datenschutz), Premium-Kandidat. |
| F-034 | Budget-Abfrage | Als Mitglied will ich anonym meine Budgetspanne angeben, damit niemand unter Druck gerät. | Nur aggregiert anzeigen (Min/Median), ab 3 Antworten. |
| F-035 | Ausgaben erfassen | Als Mitreisender will ich Ausgaben eintragen (wer hat bezahlt, für wen, wie aufgeteilt), damit wir den Überblick behalten. | Aufteilung gleich/Anteile/Beträge; Belegfoto später (Premium-Kandidat). Vorbild Tricount. **Priorität offen (Q7).** |
| F-036 | Salden & Verrechnung | Als Gruppe wollen wir sehen, wer wem wie viel schuldet, mit möglichst wenigen Überweisungen. | Greedy-Schuldenvereinfachung; Ausgleich als „bezahlt“ markieren; PayPal/IBAN-Hinweis, keine Zahlungsabwicklung. **Priorität offen (Q7).** |
| F-037 | Mehrere Währungen | Als Reisender im Ausland will ich Ausgaben in Fremdwährung erfassen. | Tageskurs oder manueller Kurs; Basiswährung pro Reise. Premium-Kandidat. **Priorität offen (Q7).** |
| F-038 | PWA / Push | Als Mitglied will ich die App aufs Handy legen und Push erhalten. | Erst nach Nachweis, dass Teilen-Texte/E-Mail nicht reichen. Hinweis: Eine PWA erhält auf iOS **keinen** Kalenderzugriff – kein Ersatz für F-049. |
| F-049 | Apple-/iOS-Kalender Stufe 3: On-Device-Weg | Als iPhone-Nutzer will ich alle Kalender auf meinem Gerät (iCloud, Exchange, Google) mit einem Tipp übernehmen, ohne etwas öffentlich zu machen oder Passwörter einzugeben. | **Spike in v1**, Umsetzung später. Option A: von uns bereitgestellter **iOS-Kurzbefehl** („Shortcuts“), der lokal per „Kalenderereignisse suchen“ die Termine im Suchzeitraum liest, daraus nur belegte Tage berechnet und diese (ohne Titel) an die Reise übergibt (URL mit signiertem, kurzlebigem Token). Option B: native iOS-App bzw. App Clip mit EventKit (nur bei nachgewiesenem Bedarf, A7). Entscheidung nach Spike + v1-Kennzahlen. |
| F-050 | Premium-Tarif & Bezahlung | Als Organisator will ich Komfortfunktionen freischalten, damit Planung noch weniger Aufwand ist – während meine Gruppe kostenlos mitmacht. | Freemium (Q4). Abrechnungseinheit/Preis offen (Q8; Tendenz Reise-Pass, optional Jahresabo). Kandidaten: F-019, F-048-Auto-Sync, F-022, F-023, F-024, F-031-Extras (Screenshots, Vergleich), F-032, mehr Speicher in F-055, Belegfotos/Export in F-035/F-036, F-037, personalisierte Reiseseite (Details Abschnitt R.3; Reisedaten F-054 bleiben immer Free). Kern (alle MVP-Features, einmaliger Import) bleibt Free. Voraussetzungen: Zahlungsanbieter, USt/OSS, AGB, Widerruf (→ Operations). |
