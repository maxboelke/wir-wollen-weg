# Features – Wir wollen weg / When do we go?

Stand: 2026-10-08 (v0.4, Entscheidungen Q1–Q6 und Q11–Q18 eingearbeitet) · Verantwortlich: Product Manager · Bezug: [PRD.md](PRD.md), [roadmap.md](roadmap.md)

Priorisierung nach MoSCoW **bezogen auf das MVP**: **M** = Must, **S** = Should, **C** = Could (v1), **W** = Won't (jetzt nicht, später). Spalte „Phase“ siehe Roadmap. Spalte „Tarif“: geplante Zuordnung im Freemium-Modell (PRD §6) – **Free** = dauerhaft kostenlos, **Premium?** = Kandidat für Premium, Entscheidung offen (Q8). Im MVP ist alles kostenlos.

**Änderungen v0.2:** Neu F-040–F-050 (Konto, Sprachen, Apple-Kalender, Premium). F-003, F-004, F-001, F-007, F-013 auf Konto-Modell umgestellt (keine persönlichen Links/Admin-Links mehr). F-006 ICS-Import MVP → v1. F-014 E-Mail-Benachrichtigungen MVP-Should → v1. F-016 Feiertage Should → Must (DE/EN). F-018 durch F-040–F-044 ersetzt. E-Mail-Bezüge in F-010, F-012, F-015, F-017 entfernt.

**Änderungen v0.3 (2026-10-08, Auftraggeber-Entscheidungen Q11–Q13, UX-Abstimmung):** Neu **F-051 Hilfe-/FAQ-Seite** (Must, MVP; Q13 e). F-011: Ergebnis einer Option erst nach eigener Stimme sichtbar, Orga sieht immer alles (Q13 a). F-002/F-004: alle Mitglieder dürfen den Einladungslink teilen, solange der Beitritt offen ist (Q13 b). F-004: UI-Rollenname „Orga“ / „Organizer“ (Q13 c). F-041: „Angemeldet bleiben“ standardmäßig an (Q13 d). F-046: sprachabhängiger Produktname „Wir wollen weg“ / „When do we go?“ (Q11). F-008: Zählregel präzisiert (U-4). F-009: Gruppennamen „Alle dabei“ / „Fast alle dabei“ (U-14). F-040/F-003: Name erst nach dem Code (UX-Abweichung bestätigt). F-015: kein „@“ vor Namen im Erinnerungstext (UX-Abweichung bestätigt).

**Änderungen v0.4 (2026-10-08, Auftraggeber-Entscheidungen Q17/Q18):** Neu **F-052 Bewegung, Animationen & Haptik** (Must, MVP; Querschnitts-Feature) mit Schalter „Bewegung reduzieren“ im Konto zusätzlich zur Systemeinstellung (Q17 a), Reduced-Motion-Regeln, Performance-Leitplanken und dezenter Android-Vibration (Q17 c); Detailkatalog: [docs/motion/interaktionen.md](../motion/interaktionen.md). F-012: Feier „Es geht los!“ für **alle** Mitglieder beim ersten Öffnen nach Festlegung, einmal pro Person (Q17 b). F-043: Abschnitt „Darstellung“ in den Kontoeinstellungen. Look & Feel 2.0 (Q18, Richtung B „Reise-Cockpit“, Palette „Indigo & Minze“) betrifft alle UI-Features optisch, ändert aber keine Akzeptanzkriterien – umgesetzt im Roadmap-Schritt „UI-Fundament“.

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
| F-015 | Nachzügler erinnern (Teilen-Text) | S | MVP | Free |
| F-016 | Feiertage & Wochenenden einblenden (DE/AT/CH/UK/US) | **M** (hochgestuft) | MVP | Free |
| F-017 | Abstimmungsfrist | S | MVP | Free |
| ~~F-018~~ | ~~Optionales Konto & Reiseübersicht~~ – **ersetzt durch F-040–F-044** | – | – | – |
| F-019 | Kalender-Abo-Sync (ICS-URL automatisch aktualisieren) | C | v1 | Premium? |
| F-020 | Google-Kalender-Anbindung (OAuth, Free/Busy) | C | v1 | Free/Premium? |
| F-021 | Microsoft-/Outlook-Anbindung (OAuth) | C | v1 | Free/Premium? |
| F-022 | Co-Organisatoren | C | v1 | Premium? |
| F-023 | Pflicht- und optionale Teilnehmer | C | v1 | Premium? |
| F-024 | Urlaubstage-Optimierung (Brückentage) | C | v1 | Premium? |
| F-030 | Zielfindung (Vorschläge & Abstimmung) | W | später | Free |
| F-031 | Unterkünfte sammeln & abstimmen | W | später | Premium? |
| F-032 | Aufgaben & Packliste | W | später | Premium? |
| F-033 | Reise-Infoseite (Adresse, Anreise, Dokumente) | W | später | Free (Dateien: Premium?) |
| F-034 | Budget-Abfrage (anonym) | W | später | Free |
| F-035 | Ausgaben erfassen | W | später (Priorität offen, Q7) | Free |
| F-036 | Salden & Ausgleichsvorschlag (Verrechnung) | W | später (Priorität offen, Q7) | Free |
| F-037 | Mehrere Währungen | W | später (Priorität offen, Q7) | Premium? |
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

### F-017 Abstimmungsfrist
**Als** Organisatorin **möchte ich** eine Frist setzen, **damit** die Entscheidung nicht ewig offen bleibt.

Akzeptanzkriterien:
- [ ] Optionales Fristdatum für Verfügbarkeitsabgabe und für Abstimmung; Anzeige „noch 3 Tage“; Frist wird in Teilen-Texte übernommen.
- [ ] Nach Fristablauf wird nicht automatisch entschieden; der Organisator wird per Banner in der Reise und in „Meine Reisen“ aufgefordert, abzuschließen (E-Mail erst mit F-014).

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

## WON'T (jetzt) – spätere Ausbaustufen

Nur grob beschrieben; werden vor Umsetzung detailliert.

| ID | Feature | Kern-User-Story | Notizen |
|---|---|---|---|
| F-030 | Zielfindung | Als Gruppe wollen wir Reiseziele vorschlagen und darüber abstimmen, damit wir uns auf ein Ziel einigen. | Gleiche Abstimmungsmechanik wie F-011 wiederverwenden (Optionen = Ziele mit Link/Bild). |
| F-031 | Unterkünfte | Als Mitglied will ich Unterkunfts-Links (Airbnb, Booking …) sammeln und bewerten, damit wir gemeinsam auswählen. | Link-Vorschau, Preis pro Person, Abstimmung; keine Buchung. Premium-Kandidat. |
| F-032 | Aufgaben & Packliste | Als Organisator will ich Aufgaben verteilen („Mietwagen buchen“), damit Arbeit fair verteilt ist. | Zuständige, Fälligkeit, Abhaken. Premium-Kandidat. |
| F-033 | Reise-Infoseite | Als Mitglied will ich alle Infos (Adresse, Anreise, Check-in) an einem Ort, damit ich nicht im Chat suchen muss. | Freitext + Links Free; Dateiupload später (Datenschutz), Premium-Kandidat. |
| F-034 | Budget-Abfrage | Als Mitglied will ich anonym meine Budgetspanne angeben, damit niemand unter Druck gerät. | Nur aggregiert anzeigen (Min/Median), ab 3 Antworten. |
| F-035 | Ausgaben erfassen | Als Mitreisender will ich Ausgaben eintragen (wer hat bezahlt, für wen, wie aufgeteilt), damit wir den Überblick behalten. | Aufteilung gleich/Anteile/Beträge; Belegfoto später (Premium-Kandidat). Vorbild Tricount. **Priorität offen (Q7).** |
| F-036 | Salden & Verrechnung | Als Gruppe wollen wir sehen, wer wem wie viel schuldet, mit möglichst wenigen Überweisungen. | Greedy-Schuldenvereinfachung; Ausgleich als „bezahlt“ markieren; PayPal/IBAN-Hinweis, keine Zahlungsabwicklung. **Priorität offen (Q7).** |
| F-037 | Mehrere Währungen | Als Reisender im Ausland will ich Ausgaben in Fremdwährung erfassen. | Tageskurs oder manueller Kurs; Basiswährung pro Reise. Premium-Kandidat. **Priorität offen (Q7).** |
| F-038 | PWA / Push | Als Mitglied will ich die App aufs Handy legen und Push erhalten. | Erst nach Nachweis, dass Teilen-Texte/E-Mail nicht reichen. Hinweis: Eine PWA erhält auf iOS **keinen** Kalenderzugriff – kein Ersatz für F-049. |
| F-049 | Apple-/iOS-Kalender Stufe 3: On-Device-Weg | Als iPhone-Nutzer will ich alle Kalender auf meinem Gerät (iCloud, Exchange, Google) mit einem Tipp übernehmen, ohne etwas öffentlich zu machen oder Passwörter einzugeben. | **Spike in v1**, Umsetzung später. Option A: von uns bereitgestellter **iOS-Kurzbefehl** („Shortcuts“), der lokal per „Kalenderereignisse suchen“ die Termine im Suchzeitraum liest, daraus nur belegte Tage berechnet und diese (ohne Titel) an die Reise übergibt (URL mit signiertem, kurzlebigem Token). Option B: native iOS-App bzw. App Clip mit EventKit (nur bei nachgewiesenem Bedarf, A7). Entscheidung nach Spike + v1-Kennzahlen. |
| F-050 | Premium-Tarif & Bezahlung | Als Organisator will ich Komfortfunktionen freischalten, damit Planung noch weniger Aufwand ist – während meine Gruppe kostenlos mitmacht. | Freemium (Q4). Abrechnungseinheit/Preis offen (Q8; Tendenz Reise-Pass, optional Jahresabo). Kandidaten: F-019, F-048-Auto-Sync, F-022, F-023, F-024, F-031, F-032, Dateien in F-033, F-037, Exporte, personalisierte Reiseseite. Kern (alle MVP-Features, einmaliger Import) bleibt Free. Voraussetzungen: Zahlungsanbieter, USt/OSS, AGB, Widerruf (→ Operations). |
