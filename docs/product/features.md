# Features – Wir wollen weg / When do we go?

Stand: 2026-10-22 (v0.6, Ausbaustufe „Reise managen“ entschieden, Inkrement 8 zugeschnitten; Entscheidungen Q1–Q6, Q11–Q36, UX-1, UX-2, UX-8, UX-9 eingearbeitet) · Verantwortlich: Product Manager · Bezug: [PRD.md](PRD.md), [roadmap.md](roadmap.md), [W16 v2](../ux/wireframes/w16-cockpit.md)

Priorisierung nach MoSCoW **bezogen auf das MVP**: **M** = Must, **S** = Should, **C** = Could (v1), **W** = Won't (jetzt nicht, später). Spalte „Phase“ siehe Roadmap. Spalte „Tarif“: geplante Zuordnung im Freemium-Modell (PRD §6) – **Free** = dauerhaft kostenlos, **Premium?** = Kandidat für Premium, Entscheidung offen (Q8). Im MVP ist alles kostenlos.

**Änderungen v0.2:** Neu F-040–F-050 (Konto, Sprachen, Apple-Kalender, Premium). F-003, F-004, F-001, F-007, F-013 auf Konto-Modell umgestellt (keine persönlichen Links/Admin-Links mehr). F-006 ICS-Import MVP → v1. F-014 E-Mail-Benachrichtigungen MVP-Should → v1. F-016 Feiertage Should → Must (DE/EN). F-018 durch F-040–F-044 ersetzt. E-Mail-Bezüge in F-010, F-012, F-015, F-017 entfernt.

**Änderungen v0.3 (2026-10-08, Auftraggeber-Entscheidungen Q11–Q13, UX-Abstimmung):** Neu **F-051 Hilfe-/FAQ-Seite** (Must, MVP; Q13 e). F-011: Ergebnis einer Option erst nach eigener Stimme sichtbar, Orga sieht immer alles (Q13 a). F-002/F-004: alle Mitglieder dürfen den Einladungslink teilen, solange der Beitritt offen ist (Q13 b). F-004: UI-Rollenname „Orga“ / „Organizer“ (Q13 c). F-041: „Angemeldet bleiben“ standardmäßig an (Q13 d). F-046: sprachabhängiger Produktname „Wir wollen weg“ / „When do we go?“ (Q11). F-008: Zählregel präzisiert (U-4). F-009: Gruppennamen „Alle dabei“ / „Fast alle dabei“ (U-14). F-040/F-003: Name erst nach dem Code (UX-Abweichung bestätigt). F-015: kein „@“ vor Namen im Erinnerungstext (UX-Abweichung bestätigt).

**Änderungen v0.4 (2026-10-08, Auftraggeber-Entscheidungen Q17/Q18):** Neu **F-052 Bewegung, Animationen & Haptik** (Must, MVP; Querschnitts-Feature) mit Schalter „Bewegung reduzieren“ im Konto zusätzlich zur Systemeinstellung (Q17 a), Reduced-Motion-Regeln, Performance-Leitplanken und dezenter Android-Vibration (Q17 c); Detailkatalog: [docs/motion/interaktionen.md](../motion/interaktionen.md). F-012: Feier „Es geht los!“ für **alle** Mitglieder beim ersten Öffnen nach Festlegung, einmal pro Person (Q17 b). F-043: Abschnitt „Darstellung“ in den Kontoeinstellungen. Look & Feel 2.0 (Q18, Richtung B „Reise-Cockpit“, Palette „Indigo & Minze“) betrifft alle UI-Features optisch, ändert aber keine Akzeptanzkriterien – umgesetzt im Roadmap-Schritt „UI-Fundament“.

**Änderungen v0.5 (2026-10-20, Auftraggeber-Wunsch „Reise managen“, Planung – Entscheidungen Q26–Q36 offen):** Neue **Ausbaustufe „Reise managen“** (nach „Termin finden“) mit detaillierten Steckbriefen im neuen Abschnitt **AUSBAUSTUFE „Reise managen“** (vor „WON'T“): neu **F-053 Reise-Cockpit (Übersicht Phase 3)**, **F-054 Persönliche Reisedaten**, **F-055 Reiseunterlagen (Dateien)**, **F-056 Zuständigkeit „Bucht“**; **F-031** (Unterkünfte per Swipe), **F-033** (Reise-Infoseite, jetzt ohne Dateien – Dateien → F-055), **F-035 + F-036** (Kosten teilen, zusammen als ein Modul) detailliert und aus „Won't“ in die Ausbaustufe gehoben; F-037 bleibt „später“. Einordnung gegenüber v1 (Kalender-Import) und Reihenfolge: PRD Q26/Q27 (beantwortet Q7 und Q19 mit).

**Änderungen v0.6 (2026-10-22, Auftraggeber „Ja zu allem“):** **Q26–Q36 entschieden wie empfohlen** – alle „(Q…)“-Angaben in der Ausbaustufe gelten jetzt als entschieden. **UX-1:** Phase 3 ohne Tabs, Cockpit als Hub. **UX-2:** Reisedaten eigener Bereich (F-054, F-055 angepasst). **F-053 neu gefasst nach W16 v2 „Reiseverlauf“** (Ticket-Kopf, Weg mit Stationen V1–V6/T/D, „Heute“ statt „Für dich zu tun“, Kacheln „Immer griffbereit“, Mehr zur Reise) inkl. **UX-8** (kleine Feier am Abreisetag) und **UX-9** („ohne App erledigt“ durch die Orga). F-031/F-035/F-055: „Tab“ → Station/Kachel + Bereichs-Unterseite. F-033: Bearbeiten in Inkrement 8 nur Orga („Bucht“ ab Inkrement 11). Neu **R.6 Zuschnitt Inkrement 8** mit User Stories, Akzeptanzkriterien, Abgrenzung und Datenhaltung. F-015 und F-017: Umsetzungsstand nachgetragen (Inkrement 7 wird aufgelöst, roadmap.md).

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

Akzeptanzkriterien (Stufe 1 – Inkrement 9):
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

Akzeptanzkriterien F-035 Ausgaben (Stufe 1 – Inkrement 10):
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
- [ ] **Ausgleichsvorschlag:** minimale Zahl von Überweisungen (Greedy: größter Schuldner an größten Gläubiger; deterministisch, reine Funktion, testbar; 30 Personen < 100 ms). Darstellung «Kemal → Lena: 23,50 €».
- [ ] **«Als bezahlt markieren»** durch Zahlende **oder** Empfangende → wird als Ausgleichszahlung gebucht (rückgängig machbar); der Saldo aktualisiert sich.
- [ ] **Zahlungshinweis (optional, Q35):** Jedes Mitglied kann für diese Reise freiwillig eine Zahlungsinfo hinterlegen (Freitext ≤ 100 Zeichen, z. B. PayPal-Name oder IBAN), sichtbar für Mitglieder der Reise, Hinweis «Alle in der Reise können das lesen»; Kopier-Button. **Keine** Zahlungsabwicklung, keine Bank-/PayPal-Anbindung.
- [ ] **Abrechnung abschließen** (Orga, ab Teilphase *Danach* empfohlen): Kosten werden schreibgeschützt; Wiederöffnen möglich.
- [ ] Teilen-Text «Abrechnung <Reise>: Kemal → Lena 23,50 € …» (für den Gruppenchat).
- [ ] **Datenschutz & Löschung:** Ausgaben werden mit der Reise gelöscht (F-013, 90 Tage nach Reiseende). Hat die Reise **offene Salden**, nennt die Lösch-Hinweismail an die Orga dies ausdrücklich. **Reise verlassen mit offenem Saldo:** Warnung mit Betrag; nach Bestätigung bleiben die Ausgaben für die Gruppe korrekt erhalten, die Person erscheint darin als «ehemaliges Mitglied» (Name wird entfernt) (Q35).

MVP-Schnitt: **Stufe 1** = eine Währung, ein Zahler, gleich/individuelle Beträge, Platzhalter, Salden, Ausgleichsvorschlag, als bezahlt markieren, Abschluss. **Später:** Aufteilung nach Anteilen/Prozent, mehrere Zahler pro Ausgabe, **Belegfotos** (braucht F-055-Speicher; Premium-Kandidat), **Fremdwährungen F-037** (Premium-Kandidat), Export CSV/PDF (Premium-Kandidat), wiederkehrende Ausgaben, Budget (F-034), Statistik nach Kategorie, Ausgaben schon vor Phase 3 (Anzahlungen) – bei Bedarf.
Abhängigkeiten: F-053, F-007 (Platzhalter), F-046 (Zahlen-/Währungsformate). Kein Dateispeicher, keine sensiblen Daten → **nicht** an Gate G1b gebunden.
Aufwand: **M–L** (≈ 1,5 Inkremente; Schwerpunkt Rechenlogik + Tests, Formular-UX).

### F-056 Zuständigkeit „Bucht“ (buchende Person)
**Als** Orga **möchte ich** festlegen, wer für die Gruppe bucht, **damit** diese Person die nötigen Reisedaten bekommt – und nur sie.

Akzeptanzkriterien:
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

Akzeptanzkriterien (Stufe 1 – Inkrement 11):
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
