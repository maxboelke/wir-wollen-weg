# Features – Wir wollen weg

Stand: 2026-10-08 (v0.2, Entscheidungen Q1–Q6 eingearbeitet) · Verantwortlich: Product Manager · Bezug: [PRD.md](PRD.md), [roadmap.md](roadmap.md)

Priorisierung nach MoSCoW **bezogen auf das MVP**: **M** = Must, **S** = Should, **C** = Could (v1), **W** = Won't (jetzt nicht, später). Spalte „Phase“ siehe Roadmap. Spalte „Tarif“: geplante Zuordnung im Freemium-Modell (PRD §6) – **Free** = dauerhaft kostenlos, **Premium?** = Kandidat für Premium, Entscheidung offen (Q8). Im MVP ist alles kostenlos.

**Änderungen v0.2:** Neu F-040–F-050 (Konto, Sprachen, Apple-Kalender, Premium). F-003, F-004, F-001, F-007, F-013 auf Konto-Modell umgestellt (keine persönlichen Links/Admin-Links mehr). F-006 ICS-Import MVP → v1. F-014 E-Mail-Benachrichtigungen MVP-Should → v1. F-016 Feiertage Should → Must (DE/EN). F-018 durch F-040–F-044 ersetzt. E-Mail-Bezüge in F-010, F-012, F-015, F-017 entfernt.

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

**MVP-Umfang (Must):** F-001, F-002, F-003, F-004, F-005, F-007, F-008, F-009, F-010, F-011, F-012, F-013, F-016, F-040, F-041, F-042, F-043, F-044, F-046 · **Should:** F-015, F-017.

**Bewusst ausgeschlossen (kein Plan):** In-App-Chat, Buchung, Abwicklung von Zahlungen zwischen Reisenden, Schreibzugriff auf Nutzerkalender, stundengenaue Terminplanung, Ranking-/Präferenzwahl, Werbung, Gast-Teilnahme ohne Konto (Rückfallplan siehe PRD Q10).

### Begriffe
- **Konto**: Anzeigename, E-Mail (verifiziert), optional Passwort, Sprache, Region (für Datum/Wochenstart/Feiertage).
- **Reise**: Planungsobjekt mit Suchzeitraum, Dauer, Mitgliedern (max. 30).
- **Mitglied**: Konto, das einer Reise beigetreten ist; Rolle Organisator oder Mitglied.
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
- [ ] Pflichtangaben: Anzeigename (1–40 Zeichen) und E-Mail-Adresse. Keine weiteren Pflichtfelder. Zustimmung zu Datenschutzhinweis/Nutzungsbedingungen per Hinweistext mit Link (kein vorangekreuztes Häkchen für Marketing; es gibt kein Marketing-Opt-in im MVP).
- [ ] Standardweg **passwortlos**: Nach Absenden wird eine Transaktionsmail mit **6-stelligem Code und Magic-Link** gesendet. Code-Eingabe im selben Fenster (`autocomplete="one-time-code"`, Einfügen aus Zwischenablage); der Magic-Link funktioniert in jedem Browser und führt über die gespeicherte Rücksprungadresse zurück zur Reise.
- [ ] Optional kann direkt bei der Registrierung oder später ein Passwort gesetzt werden (F-042); E-Mail-Verifizierung per Code/Link ist trotzdem einmalig nötig.
- [ ] Code/Link: 15 Min. gültig, einmalig verwendbar, max. 5 Fehlversuche; „Code erneut senden“ nach 30 s; Hinweis „Spam-Ordner prüfen“.
- [ ] Existiert die E-Mail bereits, wird ohne Hinweis auf die Existenz derselbe Code-Ablauf als Login durchgeführt (keine Konto-Enumeration, kein Fehler „E-Mail schon vergeben“).
- [ ] Sprache und Region werden aus Browser-Einstellungen vorbelegt (F-046) und im Konto gespeichert.
- [ ] Mail in der Sprache der Oberfläche; Betreff enthält den Code („123456 ist dein Code für Wir wollen weg“).
- [ ] Mobil inkl. In-App-Browser (WhatsApp, Instagram) ohne Kontextverlust nutzbar; Median-Dauer Start → verifiziert ≤ 60 s (Messung, PRD §4).

### F-041 Anmelden & Abmelden
**Als** Mitglied **möchte ich** mich auf jedem Gerät anmelden und wieder abmelden können, **damit** ich meine Reisen überall erreiche und auf fremden Geräten sicher bin.

Akzeptanzkriterien:
- [ ] Login per E-Mail + Code/Magic-Link (Standard) oder E-Mail + Passwort (falls gesetzt).
- [ ] Nach Login Weiterleitung zur ursprünglich aufgerufenen Seite (z. B. Reise, Einladungslink), sonst „Meine Reisen“ (F-044).
- [ ] „Angemeldet bleiben“: Session rollierend 90 Tage (httpOnly, Secure, SameSite); ohne Haken endet die Session mit dem Browser.
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
- [ ] Kontoeinstellungen: Anzeigename, Sprache, Region (Datumsformat, Wochenstart, Standard-Feiertagsregion), E-Mail (F-042), Passwort (F-042), Abmelden überall (F-041).
- [ ] Namensänderung wirkt in allen Reisen.
- [ ] „Konto löschen“: Re-Authentifizierung (Code oder Passwort) und Bestätigungsdialog; löscht sofort Konto, Sessions, Name, E-Mail, Verfügbarkeiten und Stimmen in allen Reisen; Berechnungen der betroffenen Reisen aktualisieren sich.
- [ ] Ist die Person **Organisator** einer Reise mit weiteren Mitgliedern, muss sie vor dem Löschen je Reise eine Person als neuen Organisator bestimmen (Vorschlag: am längsten beigetretenes Mitglied) oder die Reise löschen; Reisen ohne weitere Mitglieder werden mitgelöscht.
- [ ] Bestätigungsmail „Dein Konto wurde gelöscht“ (Transaktionsmail); danach keine weiteren Mails.
- [ ] Inaktive Konten (24 Monate ohne Login) werden nach Hinweis-Transaktionsmail 30 Tage vorher automatisch gelöscht (gleiche Regeln wie oben, Organisatorrolle geht an das am längsten beigetretene Mitglied).
- [ ] Auskunft (Art. 15 DSGVO) im MVP auf Anfrage über die Kontakt-Adresse; Self-Service-Export (JSON) ist Kandidat für v1.

### F-044 „Meine Reisen“-Übersicht
**Als** Organisatorin und Mitglied mehrerer Gruppen **möchte ich** alle meine Reisen an einem Ort sehen, **damit** ich weiß, wo ich noch etwas tun muss.

Akzeptanzkriterien:
- [ ] Startseite nach Login: Liste aller Reisen, in denen ich Mitglied bin, mit Name, Rolle (Organisator/Mitglied), Phase (Verfügbarkeit offen / Abstimmung läuft / festgelegt: Datum) und Fortschritt („5/7 abgegeben“).
- [ ] Hervorgehobene To-dos: „Deine Verfügbarkeit fehlt noch“, „Jetzt abstimmen“ bzw. für Organisatoren „Alle haben abgegeben – Abstimmung starten?“.
- [ ] Sortierung: Reisen mit offenen To-dos zuerst, dann nach nächstem Ereignis/Datum; vergangene Reisen in einem eingeklappten Bereich.
- [ ] Button „Neue Reise planen“ (F-001).
- [ ] Leerzustand mit kurzer Erklärung und CTA.

### F-046 Sprachen Deutsch & Englisch
**Als** Mitglied einer gemischtsprachigen Gruppe **möchte ich** die App auf Deutsch oder Englisch nutzen, **damit** alle in ihrer Sprache mitmachen können.

Akzeptanzkriterien:
- [ ] Gesamte Oberfläche, Fehlermeldungen, Teilen-Texte, Transaktionsmails, Datenschutzhinweise und Open-Graph-Vorschau in `de` und `en`; keine fest verdrahteten Texte (Build/Test schlägt bei fehlendem Übersetzungsschlüssel fehl).
- [ ] Sprache: Vorbelegung aus `Accept-Language` (Fallback Englisch für nicht-deutschsprachige Browser, Deutsch für `de-*`); Umschalter im Header/Footer (auch ohne Login) und in den Kontoeinstellungen; Wahl wird im Konto gespeichert und gilt geräteübergreifend.
- [ ] Jede Person sieht die Reise in **ihrer** Sprache; nutzergenerierte Inhalte (Reisename, Kommentare) werden nicht übersetzt.
- [ ] Teilen-Texte (F-002, F-012, F-015) werden in der Sprache des Teilenden erzeugt; vor dem Teilen ist die Sprache des Textes umschaltbar (für Gruppen mit anderer Sprache).
- [ ] Datums- und Zahlenformate über die Region des Kontos (`de-DE`, `de-AT`, `de-CH`, `en-GB`, `en-US` …), z. B. „Fr., 3. Juli 2027“ vs. „Fri, 3 July 2027“ vs. „Fri, July 3, 2027“.
- [ ] **Wochenstart** im Kalender nach Region (Montag für DE/AT/CH/UK, Sonntag für US), im Konto überschreibbar; Schnellaktion „Mo–Fr“ (F-005) bleibt unabhängig vom Wochenstart korrekt.
- [ ] Rechtstexte: Impressum DE; Datenschutzerklärung DE (verbindlich) + EN.

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
**Als** Organisatorin **möchte ich** einen Link in unseren Gruppenchat teilen, **damit** alle ohne Umwege mitmachen.

Akzeptanzkriterien:
- [ ] Jede Reise hat einen Einladungslink mit nicht erratbarem Token (≥ 128 Bit).
- [ ] Buttons: „Link kopieren“ (mit Bestätigung), „Teilen“ (native Web-Share-API, Fallback: WhatsApp-, Signal-, E-Mail-Link).
- [ ] Vorformulierter Teilen-Text, z. B. „Wir wollen weg! Trag bis <Datum> ein, wann du kannst: <Link>“ / „We want to get away! Add your dates by <date>: <link>“, editierbar und sprachumschaltbar vor dem Teilen (F-046).
- [ ] Teilen-Texte sind der einzige Benachrichtigungsweg für Reise-Ereignisse im MVP (Einladung, Abstimmung gestartet, Erinnerung, Ergebnis).
- [ ] Link-Vorschau (Open-Graph) zeigt Reisename und App-Namen, **keine** Mitgliedernamen oder Daten.
- [ ] Reiseseiten sind mit `noindex` gekennzeichnet.

### F-003 Beitreten mit Konto im Einladungsflow
**Als** Nachzügler **möchte ich** über den Link in wenigen Schritten beitreten, auch wenn ich noch kein Konto habe, **damit** ich ohne Umwege dabei bin.

Akzeptanzkriterien:
- [ ] Der Einladungslink zeigt auch ohne Login eine **Reise-Vorschau**: Reisename, Vorname des Organisators, Suchzeitraum, Dauer, Anzahl Mitglieder („7 sind schon dabei“) – **keine** Namensliste, Verfügbarkeiten oder Stimmen.
- [ ] CTA „Mitmachen“: 
  - angemeldet → Beitritt mit einem Klick (Anzeigename aus Konto, für diese Reise einmalig anpassbar);
  - nicht angemeldet → Registrierung/Login (F-040/F-041) **auf derselben Seite bzw. im selben Fenster**, danach automatischer Beitritt und Weiterleitung zur Verfügbarkeitseingabe (F-005) – ohne erneutes Öffnen des Links.
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
- [ ] Nur der Organisator kann: Reisedaten ändern (F-001), Mitglieder entfernen, Platzhalter verwalten (F-007), Einladungslink neu erzeugen (alter Link wird ungültig), Beitritt sperren/öffnen, Abstimmung erstellen/schließen (F-010, F-012), Organisatorrolle an ein anderes Mitglied übergeben, Reise löschen (F-013).
- [ ] Mitglieder können: eigene Verfügbarkeit bearbeiten, abstimmen, eigenen Anzeigenamen in der Reise ändern, Reise verlassen, alles Gemeinsame ansehen.
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
- [ ] Kalenderansicht des Suchzeitraums (Wochenstart/Datumsformat gemäß F-046); jeder Tag zeigt die Anzahl `geht` / Anzahl abgegebener Mitglieder (z. B. „6/7“) und eine Farbintensität entsprechend dem Anteil; `ginge zur Not` zählt halb in der Intensität und wird separat ausgewiesen.
- [ ] Tage, an denen alle können, sind zusätzlich zur Farbe durch ein Symbol markiert.
- [ ] Antippen eines Tages zeigt, wer kann / zur Not / nicht kann (Namen, keine Gründe außer freiwilligem Kommentar).
- [ ] Filter: „Person X ausblenden“ (Was-wäre-wenn), wirkt nur lokal auf die Ansicht und die Berechnung (F-009) für den Betrachter.
- [ ] Hinweisbanner, solange nicht alle abgegeben haben: „Noch offen: Kemal, Sara – Ergebnis kann sich ändern“.
- [ ] Ansicht aktualisiert sich bei Neuladen; Live-Update ist nicht erforderlich.

### F-009 Kandidaten-Zeiträume berechnen
**Als** Organisatorin **möchte ich** automatisch die besten möglichen Reisezeiträume vorgeschlagen bekommen, **damit** ich sie nicht selbst aus dem Kalender herauslesen muss.

Akzeptanzkriterien:
- [ ] Eingaben: Suchzeitraum, Mindestdauer *m* Nächte, Wunschdauer *w* (Standard = *m*), Toleranz *k* fehlende Personen (Standard 1, einstellbar 0–3), nur abgegebene Mitglieder.
- [ ] Ein Fenster aus *d* Nächten belegt *d+1* aufeinanderfolgende Tage. Ein Mitglied **kann** ein Fenster, wenn keiner der Tage `geht nicht` ist.
- [ ] Liste **„Alle können“**: alle Fenster mit Länge ≥ *m*, in denen alle Mitglieder können. Überlappende Fenster werden zu **maximalen Zeitspannen** zusammengefasst und angezeigt als „<Start>–<Ende>: bis zu X Nächte möglich“.
- [ ] Liste **„Fast alle können“**: Fenster, in denen 1 bis *k* Personen nicht können; die fehlenden Personen werden namentlich genannt.
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
- [ ] Stimmen sind namentlich für alle Mitglieder sichtbar (Transparenz wie bei Doodle).
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
- [ ] Organisator kann die Festlegung wieder aufheben (Abstimmung wird wieder geöffnet, Stimmen bleiben erhalten).

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

## SHOULD – MVP, wenn Zeit bleibt

### F-015 Nachzügler erinnern (Teilen-Text)
**Als** Organisatorin **möchte ich** säumige Mitglieder mit einem Klick erinnern, **damit** ich nicht selbst hinterherschreiben muss.

Akzeptanzkriterien:
- [ ] Button „Erinnern“ erzeugt einen Teilen-Text mit den Namen der Fehlenden („@Kemal @Sara, ihr fehlt noch: <Link>“) zum Posten im Gruppenchat; Sprache umschaltbar (F-046).
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
