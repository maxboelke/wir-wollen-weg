# User Flows – Wir wollen weg / When do we go? (MVP)

Stand: 2026-10-08 (Runde 3: Richtung B „Reise-Cockpit“, Q17 Motion/Haptik) · Verantwortlich: UI/UX · Bezug: [sitemap.md](sitemap.md), [ux-spec.md](ux-spec.md), [Wireframes](wireframes/README.md), [features.md](../product/features.md)

Notation: `[Button]` = Aktion, `«Text»` = sichtbarer Text (DE; EN-Fassung in [ux-spec.md](ux-spec.md) §10), `◆` = Entscheidung, `⚠` = Fehlerfall, `∅` = Leerzustand, `→` = nächster Schritt. Wireframe-Nummern in Klammern, z. B. (W03).

Inhalt:
- [A Einladung → Vorschau → Code-Registrierung → Beitritt → Verfügbarkeit](#a-einladung--vorschau--registrierung-per-code--beitritt--verfügbarkeit-f-002-f-003-f-040-f-041-f-007) (Schwerpunkt)
- [B Tage markieren (Tippen, Wischen, Bereich, Tastatur)](#b-tage-markieren-f-005-f-016-f-046)
- [C Heatmap & Vorschläge](#c-heatmap--vorschläge-f-008-f-009-f-016)
- [D Abstimmung erstellen, abstimmen, festlegen, verkünden](#d-abstimmung-f-010-f-011-f-017--festlegung-f-012)
- [E Meine Reisen](#e-meine-reisen-f-044)
- [F Sprachumschaltung](#f-sprachumschaltung-f-046)
- [G Reise anlegen & einladen](#g-reise-anlegen--einladen-f-001-f-002)
- [H Anmelden, Abmelden, Zugang wiederherstellen](#h-anmelden-abmelden-zugang-wiederherstellen-f-041-f-042)
- [I Konto verwalten & löschen](#i-konto-verwalten--löschen-f-043-f-042)
- [J Reise verlassen, Mitglied entfernen, Rolle übergeben, Reise löschen](#j-reise-verlassen--mitglied-entfernen--rolle-übergeben--reise-löschen-f-004-f-013)
- [K Nachzügler erinnern](#k-nachzügler-erinnern-f-015)

---

## A Einladung → Vorschau → Registrierung per Code → Beitritt → Verfügbarkeit (F-002, F-003, F-040, F-041, F-007)

**Persona:** Kemal, öffnet den Link aus WhatsApp im In-App-Browser, hat kein Konto. **Ziel:** ≤ 4 Min. bis Verfügbarkeit abgegeben, Registrierung ≤ 60 s (PRD §4).

### A.0 Leitentscheidungen

1. **Code ist der Primärweg, Magic-Link der Zweitweg.** Die Mail enthält beide; die Oberfläche spricht nur vom Code («Wir haben dir einen 6-stelligen Code geschickt»). Der Link steht in der Mail als «Oder hier klicken» darunter.
2. **E-Mail zuerst, Name erst nach dem Code – und nur für neue Konten.** Wer ein Konto hat, wird nie nach dem Namen gefragt. Das hält das erste Formular auf **ein** Feld, verhindert Konto-Enumeration (wir zeigen vor der Verifizierung keinen Unterschied zwischen „neu“ und „bekannt“, F-040) und vermeidet, dass Bestandsnutzer ihren Namen versehentlich überschreiben. Der Namensschritt ist gleichzeitig der Beitrittsschritt – es entsteht kein zusätzlicher Bildschirm.
   *Abweichung zur Persona-Beschreibung im PRD („Name + E-Mail → Code“) – inhaltlich gleich, nur Reihenfolge. Bitte durch PM bestätigen lassen.*
3. **Alles auf einer URL, ohne Seitenwechsel.** Vorschau, E-Mail, Code und Name sind Zustände von `/i/{token}`. Die Reise-Kopfkarte (Reisename, „Lena lädt dich ein“) bleibt in jedem Schritt sichtbar (F-040: Kontext bleibt sichtbar).
4. **Der Einladungskontext überlebt alles:** Neuladen, App-Wechsel, Tab-Verlust durch den In-App-Browser, Öffnen des Magic-Links in einem anderen Browser (siehe A.4).

### A.1 Hauptfluss (nicht angemeldet, neues Konto)

| # | Bildschirm (W03) | Nutzer | System |
|---|---|---|---|
| 1 | Reise-Vorschau | öffnet `/i/{token}` aus WhatsApp | ◆ Token gültig? Reise voll? Beitritt gesperrt? Angemeldet? Schon Mitglied? (s. A.3). Zeigt: Reisename, «Lena lädt dich ein», Suchzeitraum, Dauer («4–5 Nächte»), «7 sind schon dabei», Beschreibung (falls vorhanden). Keine Namen, Daten, Stimmen. Sprache: Cookie → Browser. |
| 2 | Vorschau | tippt `[Mitmachen]` | Formular klappt **unter der Reise-Karte** auf (kein Seitenwechsel), Fokus ins E-Mail-Feld, Tastatur öffnet sich. Text: «Mit deiner E-Mail bist du in Sekunden dabei. Kein Passwort nötig.» |
| 3 | Schritt E-Mail | gibt E-Mail ein, `[Code senden]` | Client-Validierung (Format). Server: Rate-Limit, Code + Magic-Link erzeugen, **Rücksprung = `/i/{token}` + Aktion „beitreten“ wird in der Code-Anforderung gespeichert**. Lokal: `sessionStorage` + `localStorage` speichern `{inviteToken, email, step:"code", requestedAt}` (s. A.4). → Schritt Code. History-Eintrag `?step=code`. **Optimistischer Wechsel (M-U5):** Ist das E-Mail-Format gültig, wechselt die Ansicht **sofort im Tipp-Ereignis** zum Schritt Code und setzt den Fokus synchron ins Code-Feld (sonst öffnet iOS die Tastatur nicht). Statuszeile (`role="status"`) «Code wird gesendet …» → nach Server-OK «Code an kemal@… gesendet»; der Countdown „Neuen Code senden“ startet erst nach Server-OK. ⚠ Rate-Limit/Netz/Server: zurück zum Schritt E-Mail per `history.replaceState` (kein toter Zurück-Eintrag), E-Mail bleibt stehen, Meldung am Feld, Fokus ins E-Mail-Feld. |
| 4 | Schritt Code | wechselt in die Mail-App, liest Code (oft schon aus der Mitteilungsvorschau – der Code steht im **Betreff**), kehrt zurück | Anzeige: «Code an kemal@… gesendet» + `[Andere E-Mail]`. Ein Eingabefeld, `inputmode="numeric"`, `autocomplete="one-time-code"`. Hinweis «Keine Mail? Schau im Spam-Ordner.» `[Code erneut senden]` nach 30 s aktiv (Countdown sichtbar). |
| 5 | Schritt Code | tippt/fügt 6 Ziffern ein (iOS/Android schlagen den Code ggf. über der Tastatur vor) | Bei 6 Ziffern **automatisch absenden** (kein Button nötig, Button bleibt als Fallback). Leerzeichen/Bindestriche beim Einfügen werden entfernt. ◆ Code korrekt? (Fehler s. A.2) |
| 6 | Schritt Name (nur neues Konto) | sieht «Fast geschafft! Wie sollen dich die anderen nennen?»; Feld Anzeigename (bei Platzhalter-Link vorbelegt, F-007); Hinweistext Datenschutz/Nutzungsbedingungen mit Links | Konto ist ab Code-Bestätigung angelegt (E-Mail verifiziert); Sprache + Region aus Browser gespeichert (F-046). |
| 7 | Schritt Name | `[Beitreten]` | ◆ Name in dieser Reise schon vergeben? → Inline-Hinweis mit Vorschlag «Kemal B.» (F-003), ein Tipp übernimmt. Beitritt, Session gesetzt („angemeldet bleiben“ Standard an, s. ux-spec §4.4). Lokale Flow-Daten löschen. |
| 8 | Reise → Tab Meine Tage | – | Willkommens-Hinweis (einmalig, schließbar): «Du bist dabei! Tippe die Tage an, an denen du **nicht** kannst. Alles andere zählt als ‚geht‘.» → weiter mit Flow B. |
| 9 | Meine Tage | markiert, `[Fertig – abgeben]` | Status *abgegeben* (F-007). Erfolgsmeldung + einmalige Feedback-Frage Kalender-Import (F-005). Danach → Tab Gruppe (Vorschläge) mit Hinweis «Danke! So sieht es gerade für die Gruppe aus.» |

**Bekanntes Konto (nicht angemeldet):** Schritte 1–5 identisch. Nach Code-Bestätigung **kein** Namensschritt, sondern Bestätigungszeile «Du trittst als **Kemal** bei. [Name für diese Reise ändern]» + `[Beitreten]`. Grund für den zusätzlichen Tipp: Der Beitritt soll eine bewusste Handlung sein (jemand könnte sich nur anmelden wollen, um zu schauen). ◆ Ist die Person schon Mitglied → direkt in die Reise (kein Beitritts-Schritt).

**Passwort-Nutzer:** Im Schritt E-Mail gibt es den Link `[Mit Passwort anmelden]` → Passwortfeld unter der E-Mail (gleicher Bildschirm). Danach weiter wie „bekanntes Konto“. Fehler: generisch «E-Mail oder Passwort stimmt nicht. Du kannst dich auch mit einem Code anmelden.» + `[Code senden]`.

### A.2 Fehlerfälle Code

| ⚠ Fall | Verhalten | Text (DE) |
|---|---|---|
| Ungültiges E-Mail-Format | Inline am Feld nach Absenden/Verlassen | «Bitte gib eine gültige E-Mail-Adresse ein, z. B. name@beispiel.de.» |
| Tippfehler-Verdacht in Domain (`gmial.com`, `gmx.dee`) | Nicht blockierend, Vorschlag mit Ein-Tipp-Korrektur | «Meintest du kemal@gmail.com?» `[Ja, korrigieren]` |
| Code falsch (Versuch 1–4) | Feld bleibt gefüllt + markiert, Fokus bleibt, Text vorlesbar (`aria-live`) | «Dieser Code stimmt nicht. Noch 3 Versuche.» (Restversuche ab dem 2. Fehlversuch anzeigen) |
| 5. Fehlversuch | Feld deaktiviert, primärer Button wird `[Neuen Code senden]` | «Zu viele Versuche. Wir schicken dir einen neuen Code.» |
| Code abgelaufen (> 15 Min.) | wie oben | «Dieser Code ist abgelaufen. Fordere einfach einen neuen an.» |
| Neu senden | Countdown 30 s; nach Senden: Hinweis, dass **nur der neueste Code** gilt | «Neuer Code ist unterwegs. Ältere Codes gelten nicht mehr.» |
| Rate-Limit (zu viele Anforderungen) | Button gesperrt mit Wartezeit | «Bitte warte kurz (2 Min.), bevor du einen neuen Code anforderst.» |
| Mail kommt nicht an (nach 60 s noch auf Schritt Code) | Hilfebereich klappt automatisch auf | «Noch nichts da? 1. Spam/Werbung prüfen · 2. Adresse prüfen: kemal@… [Ändern] · 3. [Code erneut senden]» + Link Hilfe |
| Netzwerkfehler beim Senden/Prüfen | Eingaben bleiben erhalten, Retry | «Keine Verbindung. Deine Eingaben sind noch da – [Nochmal versuchen].» |
| Code in falsches Fenster eingegeben (z. B. alter Tab) | Server prüft gegen E-Mail + Anforderung; falsche Anforderung = „Code stimmt nicht“ | – |

### A.3 Entscheidungen & Sonderzustände der Vorschau

| ◆ Zustand beim Öffnen von `/i/{token}` | Anzeige | Primäraktion |
|---|---|---|
| Nicht angemeldet, Beitritt möglich | Vorschau (A.1) | `[Mitmachen]` |
| Angemeldet, nicht Mitglied | Vorschau + «Du bist angemeldet als **Lena** (lena@…)» + `[Nicht du? Abmelden]` + Zeile «Du trittst als Lena bei [ändern]» | `[Mitmachen]` → Beitritt mit einem Tipp → Meine Tage |
| Angemeldet, schon Mitglied | **keine** Vorschau, direkte Weiterleitung zur Reise (Standard-Tab, sitemap §2) | – |
| Reise voll (30 inkl. Platzhalter) | Vorschau ohne CTA, Hinweisbox | «Diese Reise ist voll (30 von 30). Frag Lena, ob sie Platz machen kann.» Sekundär: `[Eigene Reise planen]` |
| Beitritt gesperrt (F-004) | wie oben | «Lena hat den Beitritt gerade geschlossen. Frag sie im Gruppenchat.» |
| Reise in Phase 2/3 | Vorschau zeigt Phase als Hinweis; Beitritt bleibt möglich | Phase 2: «Die Abstimmung läuft schon – du kannst noch mitmachen.» Phase 3: «Der Termin steht schon: 5.–10. Mai. Du kannst trotzdem beitreten.» (Verfügbarkeit dann schreibgeschützt, Landung auf Übersicht) |
| Token ungültig, neu erzeugt oder Reise gelöscht | Systemzustand (W14) – **ein** gemeinsamer Text, um nichts zu verraten | «Dieser Einladungslink funktioniert nicht mehr. Vielleicht wurde er erneuert. Bitte frag im Gruppenchat nach dem aktuellen Link.» `[Meine Reisen]` (angemeldet) bzw. `[Eigene Reise planen]` |
| Platzhalter-Link, Platzhalter frei | Vorschau personalisiert «Hallo Kemal! Lena hat dich eingeladen.»; Name im Namensschritt vorbelegt, Platzhalter wird übernommen (F-007) | `[Mitmachen]` |
| Platzhalter-Link, Platzhalter bereits übernommen | Hinweis + normaler Beitritt ohne Vorbelegung | «Dieser persönliche Link wurde schon verwendet. Du kannst trotzdem normal beitreten.» |
| Rate-Limit Beitritt (F-003) | Fehler am Button | «Gerade sind sehr viele Beitritte. Bitte versuch es in ein paar Minuten nochmal.» |

### A.4 Kontext erhalten: In-App-Browser, App-Wechsel, anderer Browser

**Problem:** WhatsApp/Instagram/Facebook/Telegram öffnen Links in einer eingebetteten WebView. Beim Wechsel in die Mail-App kann (v. a. Instagram/Facebook, Android bei Speicherdruck) die WebView neu geladen werden; ein Magic-Link aus der Mail öffnet den **Standardbrowser** – ohne Session und ohne Einladungskontext.

**Regeln:**
1. **Doppelte Sicherung des Flows:**
   - Server: Die Code-/Link-Anforderung speichert `returnTo=/i/{token}` und `intent=join`.
   - Client: `sessionStorage` **und** `localStorage` (`www.pendingAuth`, max. 30 Min., enthält Einladungs-Token, E-Mail, Schritt, Zeitpunkt – **niemals den Code**).
2. **Wiederherstellung beim Laden von `/i/{token}`:** Gibt es ein passendes `pendingAuth` (< 30 Min.), springt die Seite direkt in **Schritt Code** mit der E-Mail-Anzeige und Hinweis «Willkommen zurück – gib einfach den Code aus der Mail ein.» Kein erneutes Senden nötig.
3. **Wiederherstellung auf anderen Seiten:** Lädt der In-App-Browser stattdessen die Startseite o. Ä., zeigt jede Seite bei vorhandenem `pendingAuth` ein Banner «Du warst gerade dabei, „Lissabon 2027“ beizutreten. [Weiter]».
4. **Magic-Link in anderem Browser:** `/auth/magic?token=…` → **Landeseite mit Button „Jetzt anmelden“** (W02 „Magic-Link-Landeseite“; Einlösen per **POST**, s. H.5) → Session in *diesem* Browser → Ausführung von `intent` (Beitritt-Schritt mit Name bzw. Bestätigung) → Reise. Kein automatisches Einloggen des ursprünglichen In-App-Fensters (Sicherheitsgrund: sonst könnte ein Angreifer, der die Anforderung ausgelöst hat, durch den Klick des Opfers eingeloggt werden).
5. **Hinweis im ursprünglichen Fenster:** Auf Schritt Code steht klein: «Du hast auf den Link in der Mail getippt? Dann geht es im anderen Browser weiter. Hier kannst du stattdessen den Code eingeben.»
6. **Magic-Link schon benutzt / abgelaufen:** (Prüfung erst beim POST, nicht beim Seitenaufruf) «Dieser Anmeldelink funktioniert nicht mehr» + «Er ist 15 Minuten gültig und funktioniert nur einmal. Hol dir einfach einen neuen Code.» `[Neuen Code anfordern]` (Texte s. W02) – E-Mail vorbelegt, `returnTo` bleibt erhalten (aus dem Link-Token serverseitig lesbar, solange nicht abgelaufen; sonst Einladung muss neu geöffnet werden).
7. **In-App-Browser-Erkennung (User-Agent, best effort):** Kein Blocken und **kein** Zwang, „im Browser zu öffnen“. Nur auf Schritt Code ein zusätzlicher Satz: «Tipp: Lass dieses Fenster offen, hol den Code aus deiner Mail-App und komm hierher zurück.»
8. **Session im In-App-Browser:** In-App-Browser teilen Cookies nicht mit Safari/Chrome. Nach dem Beitritt einmalig (schließbar) in Meine Reisen/Reise: «Später in deinem Browser weitermachen? Melde dich dort einfach mit deiner E-Mail an.» – kein Zwang.

### A.5 Leerzustände & Randfälle

- ∅ Reise ohne Beschreibung → Zeile entfällt, keine Platzhalterzeile.
- ∅ «0 sind schon dabei» kann nicht vorkommen (Orga ist Mitglied); bei 1: «Lena ist schon dabei».
- Nutzer schließt die Seite zwischen Schritt 6 und 7 (Konto angelegt, nicht beigetreten): Beim nächsten Öffnen des Links ist er angemeldet → Zustand „angemeldet, nicht Mitglied“. In „Meine Reisen“ (leer) zeigt der Leerzustand zusätzlich «Du wolltest „Lissabon 2027“ beitreten. [Jetzt beitreten]» (aus `pendingAuth`, falls vorhanden).
- Beitritt in Phase 3: Landung auf Übersicht mit Ergebnis; Meine Tage schreibgeschützt.

---

## B Tage markieren (F-005, F-016, F-046)

**Ziel:** Jonas trägt 2 Monate in < 2 Min. ein. **Grundidee: Pinsel + Tippen/Ziehen.** Unmarkierte Tage gelten nach Abgabe als *geht*; man markiert also hauptsächlich Ausnahmen.

### B.1 Bausteine (W08)

- **Werkzeugleiste (unten fixiert, mobil / oben über dem Kalender, Desktop):** Pinsel als Auswahlgruppe (genau einer aktiv):
  1. «Geht nicht» (Standard-Pinsel beim ersten Öffnen – häufigste Eingabe)
  2. «Zur Not»
  3. «Geht» (= Zurücksetzen auf Standard)
  
  Daneben: `[Zeitraum]`-Schalter (Bereichsmodus), `[↶ Rückgängig]`, `[⋯ Schnellaktionen]`. Darunter bzw. daneben der primäre Button `[Fertig – abgeben]` bzw. nach Abgabe der Speicherstatus.
  **Richtung B (ux-spec §4.12):** mobil drei Kachel-Tasten als Icons (Name als `aria-label` + Tooltip) in einer Zeile mit `[Fertig – abgeben]`, Statuszeile oben, kein sichtbares Pinsel-Label, kein Griff; Leiste ≤ 150 px. Die Legende „So funktioniert's“ erklärt das Zeitraum-Icon in Textform.
- **Kalender:** Monate des Suchzeitraums untereinander (mobil, Endlos-Scroll mit fixierter Monatsüberschrift) bzw. 2–3 Monate nebeneinander (Desktop ≥ 960 px). Oben Sprung-Chips je Monat («Mai · Juni»). Wochenstart nach Region/Konto (Mo oder So); Wochenend-Spalten = Sa/So unabhängig vom Wochenstart.
- **Tag außerhalb des Suchzeitraums / vergangen:** sichtbar (zur Orientierung), ausgegraut, nicht bedienbar.
- **Feiertag (F-016):** Eselsohr oben rechts in der Zelle + Liste «1.5. Tag der Arbeit · 6.5. Christi Himmelfahrt …» unter jedem Monat mit Feiertagen (je Eintrag kleines Eselsohr vorn, ux-spec §4.9) (Namen in Sprache des Betrachters). Region = Konto-Region; Zusatzoption (Schnellaktion-Menü): «Auch Feiertage der Reise zeigen (Bayern)», falls abweichend.
- **Legende** „So funktioniert’s“ über dem Kalender: aufgeklappt bis zur ersten Abgabe, danach zugeklappt (wieder aufklappbar): Zustände mit Mini-Feld (Fläche + Muster + Symbol) + «Nicht markierte Tage zählen als ‚Geht‘».

### B.2 Interaktionen

| Eingabe | Verhalten |
|---|---|
| **Tippen** auf Tag | Tag bekommt den Zustand des aktiven Pinsels. **Hat er ihn schon → zurück auf „geht“** (Umschalten). |
| **Ziehen/Wischen** (Maus gedrückt halten bzw. Finger) | Bereich vom Starttag bis zum aktuellen Tag **in Datumsreihenfolge** (wie Textauswahl, auch über Zeilen- und Monatsgrenzen) wird als Vorschau angezeigt (Zellen zeigen schon Fläche/Muster des Pinsels, gestrichelter Umriss je Zeilensegment, Ansage «13.–19. Mai · 7 Tage»); beim Loslassen wird angewendet. Regel „erster Tag entscheidet“: War der Starttag bereits im Pinsel-Zustand, setzt der Zug den Bereich auf „geht“ zurück – sonst auf den Pinsel. |
| **Touch-Gestenkonflikt** (Scrollen vs. Ziehen) | Vertikales Wischen = Seite scrollen. Ziehen startet, wenn die Bewegung **zuerst horizontal** ist (> 10 px, Winkel < 30°) **oder** nach **Gedrückthalten 300 ms** (dann Vibration 10 ms – nur Android/Vibrations-API, best effort, aus bei reduzierter Bewegung; ux-spec §7.5); danach folgt die Auswahl dem Finger in jede Richtung, Scrollen ist für diese Geste gesperrt. Am oberen/unteren Rand scrollt die Ansicht beim Ziehen automatisch. |
| **Bereichsmodus** `[Zeitraum]` (barrierefreie Alternative, WCAG 2.5.7) | Erster Tipp = Start (Doppelrahmen + Ankerpunkt, Hinweiszeile über der Leiste «Jetzt das Ende antippen. [Abbrechen]»), Scrollen erlaubt, zweiter Tipp = Ende → Pinsel wird auf alle Tage dazwischen angewendet. Modus bleibt aktiv, bis er ausgeschaltet wird. `Esc` / erneuter Tipp auf Start bricht ab. |
| **Shift + Klick** (Desktop) | Bereich vom zuletzt geänderten Tag bis zum geklickten Tag. |
| **Tastatur** | Siehe ux-spec §7.3 (Pfeile, Leertaste, Shift+Pfeile, 1/2/3 für Pinsel, Strg/Cmd+Z). |
| **Rückgängig** | Jede Aktion (Tipp, Zug, Bereich, Schnellaktion) ist ein Schritt; Verlauf der Sitzung bis 20 Schritte. Bei Aktionen mit ≥ 2 Tagen zusätzlich Snackbar «8 Tage auf ‚geht nicht‘ gesetzt · [Rückgängig]» (6 s). |
| **Schnellaktionen** `[⋯]` | «Alle Werktage Mo–Fr auf ‚zur Not‘» · «Alle Wochenenden auf ‚geht‘» · «Feiertage auf ‚geht‘ setzen» · «Alles zurücksetzen» (mit Bestätigung, weil > 20 Tage betroffen sein können; trotzdem rückgängig machbar). Werktage = Mo–Fr unabhängig vom Wochenstart (F-046). Feiertage ausgenommen bei „Werktage“. |
| **Kommentar** | Feld unter dem Kalender «Möchtest du etwas dazu sagen? (optional)», ≤ 200 Zeichen, Zeichenzähler ab 160. Speichert bei Verlassen des Feldes. |

### B.3 Speichern & Abgabe

1. Jede Änderung wird **optimistisch** sofort angezeigt und gebündelt gespeichert (Debounce 600 ms). Statusanzeige neben dem Button: «Gespeichert» / «Speichert …» / «Nicht gespeichert – [Erneut versuchen]».
2. **Vor der ersten Abgabe** sind Markierungen ein Entwurf (gespeichert, zählt aber nicht). Kopfzeile: «Entwurf – zählt erst, wenn du abgibst».
3. `[Fertig – abgeben]`: ◆ Keine einzige Markierung? → Rückfrage «Du hast keine Tage markiert. Heißt das, du kannst im ganzen Zeitraum? [Ja, ich kann immer] [Noch markieren]». Sonst sofort abgegeben.
4. Nach Abgabe: Erfolg «Danke, Kemal! Deine Tage sind drin.» + Feedback-Frage (einmalig, überspringbar, F-005) als Bottom-Sheet → danach Tab Gruppe.
5. **Nach Abgabe** wirken Änderungen sofort (kein erneutes Abgeben). Der Button wird zum Status «Abgegeben · zuletzt geändert 14:32».
6. **Phase 3:** Kalender schreibgeschützt, Werkzeugleiste ersetzt durch «Der Termin steht fest – deine Tage sind gesperrt.»
7. **Abstimmung läuft (Phase 2):** Änderungen erlaubt; Hinweis «Die Abstimmung läuft schon. Änderungen wirken auf die Vorschläge, nicht auf bereits abgegebene Stimmen.»

### B.4 Fehler- & Leerzustände

- ⚠ Offline: Änderungen bleiben lokal, Banner «Offline – wir speichern, sobald du wieder verbunden bist.» `[Fertig – abgeben]` deaktiviert mit Erklärung.
- ⚠ Speichern dauerhaft fehlgeschlagen (3 Versuche): Zustand bleibt sichtbar, Snackbar mit `[Erneut versuchen]`; beim Verlassen der Seite Warnung «Nicht gespeicherte Änderungen».
- ⚠ Suchzeitraum wurde vom Orga geändert, während man markiert: beim nächsten Speichern Hinweis «Lena hat den Zeitraum geändert. Tage außerhalb wurden ausgeblendet.» (Daten außerhalb bleiben gespeichert, zählen aber nicht.)
- ∅ Erster Besuch: Willkommens-Hinweis (A.1 Schritt 8) + kurze Geste-Animation «Tippen oder über mehrere Tage wischen» (M-U9): startet 600 ms nach dem Hinweis, Finger wischt 2 × über vier Tage einer Woche, ≤ 2,8 s, jede Berührung/Scroll/Taste stoppt sie, die Tage werden **nicht** verändert; nur beim ersten Besuch. Reduzierte Bewegung: statische Skizze im Willkommens-Hinweis, **ohne Zeitlimit**, bis der Hinweis geschlossen wird.

---

## C Heatmap & Vorschläge (F-008, F-009, F-016)

### C.1 Aufbau Tab „Gruppe“ (W09)

- **Mobil:** Segment-Schalter oben `[Vorschläge] [Kalender]`, Standard **Vorschläge** (der Algorithmus ist der Kernnutzen; die Heatmap ist das Werkzeug zum Nachvollziehen).
- **Desktop (≥ 960 px):** zweispaltig – links Heatmap (2 Monate), rechts Vorschlagsliste (sticky). Auswahl eines Vorschlags hebt den Zeitraum in der Heatmap hervor.
- **Kennzahl-Box im Cockpit-Kopf (Richtung B, ersetzt das Statusband; ux-spec §4.10):** Ring + «5 von 7 haben abgegeben» + «Noch offen: Kemal, Sara – das Ergebnis kann sich noch ändern.» Orga: `[Erinnern]` (→ Flow K). Wenn alle abgegeben: «Alle haben abgegeben.» + Orga: `[Abstimmung starten]`. Die Box scrollt mit dem Inhalt weg (kein Einklappen); sticky bleibt nur der kompakte Kopf mit der Phasenzeile «Tage sammeln · 5/7 fertig». Desktop: Box im Kopf über beiden Spalten.
- **Filterzeile** (Chips, wirken nur lokal für den Betrachter, F-008/F-009): `Dauer: 5 Nächte ▾` (Stepper, Standard = Wunschdauer, Untergrenze 1) · `Darf fehlen: 1 ▾` (0–3) · `Personen ausblenden ▾` (Mehrfachauswahl). Aktive Filter sichtbar hervorgehoben + `[Filter zurücksetzen]`. Hinweis, wenn aktiv: «Nur für dich – die Gruppe sieht die Standardansicht.»

### C.2 Vorschlagsliste (F-009)

1. Zwei Gruppen mit Überschrift und Anzahl: **«Alle dabei (2)»** (niemand hat „Geht nicht“, F-009) und **«Fast alle dabei (3)»** (1 bis k fehlen). *Begriff „Alle dabei“ statt „Alle können“: CEO-Entscheidung U-14 vom 2026-10-08* – trennt die Gruppe sprachlich vom ✓ „Alle: Geht“ im Kalender, denn ein „Alle dabei“-Zeitraum kann Zur-Not-Tage ohne ✓ enthalten.
2. Karte je maximaler Zeitspanne:
   - Zeile 1: «Mi., 5. Mai – Mo., 10. Mai» (Format nach Region)
   - Zeile 2: «bis zu 5 Nächte möglich · ca. 3 Urlaubstage¹» (¹ eigene Feiertage/Region, F-016; Fußnote/Info-Tooltip „Werktage Mo–Fr abzüglich deiner Feiertage“)
   - Zeile 3 (falls zutreffend), Chips: «◐ 2× zur Not» (Zur-Not-Personentage im Zeitraum) · «✕ ohne Jonas» (fehlende Personen namentlich) · «inkl. Christi Himmelfahrt»
   - Aktionen: `[Im Kalender zeigen]`; Orga zusätzlich Checkbox «Zur Abstimmung» (Mehrfachauswahl → fixierte Leiste «2 ausgewählt · [Abstimmung erstellen]»).
3. Sortierung gemäß F-009 (keine Nutzer-Sortierung im MVP).
4. Lange Listen: je Gruppe erst 3 Karten, dann `[Alle 7 anzeigen]`.

**Leer-/Sonderzustände:**
- ∅ Niemand hat abgegeben (außer ggf. Betrachter nicht): «Noch keine Vorschläge – sobald die ersten ihre Tage eingetragen haben, rechnen wir los.» + `[Meine Tage eintragen]` bzw. `[Freunde einladen]`.
- ∅ Nur 1 Person abgegeben: Vorschläge werden berechnet, aber Hinweis «Bisher nur deine Angaben – noch nicht aussagekräftig.»
- ∅ Keine Treffer: konkrete Lösungsvorschläge als Buttons, die den lokalen Filter setzen (F-009): «Mit 4 statt 5 Nächten gäbe es 3 Optionen [Anzeigen]» · «Wenn 1 Person fehlen darf: 2 Optionen [Anzeigen]». Orga zusätzlich: «Suchzeitraum erweitern [Reise bearbeiten]».
- Filter „Personen ausblenden“ aktiv: Karte zeigt «(ohne Sara gerechnet)».

### C.3 Heatmap (F-008)

- Jede Zelle (Anatomie ux-spec §4.9): Tagesnummer (oben links, Ring = heute), Zählwert „x/n“ = Anzahl „Geht“ / abgegeben (mobil ab n ≥ 10 nur „x“), Intensitätsstufe nach Anteil (Zur Not = halb), **✓ unten rechts nur bei x = n** („Alle: Geht“), **◐ unten links** bei mind. einer Person „Zur Not“ (ab 600 px mit Anzahl), Feiertag als Eselsohr oben rechts, Wochenend-Spur. ✓ und ◐ schließen sich aus (CEO-Entscheidung U-4).
- **Legende** (Komponente mit Mini-Zellen) über dem Kalender: mobil beim ersten Besuch aufgeklappt, nach dem ersten Zuklappen gemerkt; ab 960 px immer sichtbar (U-6).
- **Große Schrift (≥ ca. 175 %):** Heatmap wird zur Tagesliste (ux-spec §7.1, U-5).
- **Antippen eines Tages → Tagesdetail** (mobil Bottom-Sheet, ½ Höhe, nach oben ziehbar; Desktop Seitenpanel/Popover am Tag):
  - Kopf: «Do., 6. Mai · Christi Himmelfahrt» + Zählzeile wie in der Zelle «5 von 5: Geht» + Zusammenfassung: x = n → «✓ Alle: Geht»; kein „Geht nicht“, aber Zur Not → «◐ Alle dabei – 1 nur zur Not»; sonst «✕ Nicht: Jonas» (max. 3 Namen, sonst «4 können nicht»).
  - Gruppen: **Geht (5)** Namen · **Zur Not (1)** Namen · **Geht nicht (1)** Namen · **Noch offen (2)** Namen (`text-muted`, Avatar mit gestricheltem Ring wie Teilnahmestatus F-007, U-13). Kommentar-Symbol bei Personen mit Kommentar; Antippen zeigt den Kommentar.
  - Navigation `[‹ Vortag] [Folgetag ›]` im Sheet (wischen links/rechts auch möglich) – man kann Tag für Tag durchgehen, ohne das Sheet zu schließen.
  - Orga in Phase 1/2: `[Ab hier als Option vorschlagen]` → Abstimmung-Erstellung mit vorgewähltem Starttag (D.1).
- **Vorschlag im Kalender zeigen:** springt in Ansicht Kalender, scrollt zum Monat, umrandet den Zeitraum (Umriss + Beschriftung, nicht nur Farbe) für 4 s bzw. bis zur nächsten Interaktion; Screenreader-Ansage «Zeitraum 5. bis 10. Mai hervorgehoben». Danach verschwinden Umriss und Beschriftung, **das Band bleibt**, solange dieser Vorschlag in der Vorschlag-Leiste gewählt ist (M-U7).
- **Vorschlag-Leiste (Richtung B, < 960 px, ux-spec §4.11):** fixiert unten in der Kalender-Ansicht, `[‹]` Vorschlag `[›]`. Beim direkten Öffnen der Ansicht ist Vorschlag 1 gewählt und sein Band sichtbar (ohne Umriss/Beschriftung, ohne Scroll-Sprung). Blättern setzt das Band neu und scrollt zum Anreisetag; Ansage «Vorschlag 2 von 5: …». Tipp auf die Mitte → Ansicht Vorschläge, Fokus auf diese Karte. Keine Orga-Auswahl in der Leiste. ∅ Keine Treffer: «Gerade kein passender Zeitraum. [Tipps ansehen]».
- **Aufbau-Animation der Heatmap** (Motion W09-05) nur beim ersten direkten Öffnen der Kalender-Ansicht in der Sitzung – nicht über „Im Kalender zeigen“ und nicht beim Blättern in der Leiste (M-U8).
- **Personen-Status:** unter der Heatmap aufklappbar «Wer hat abgegeben?» (Liste wie Übersicht).

---

## D Abstimmung (F-010, F-011, F-017) & Festlegung (F-012)

### D.1 Abstimmung erstellen (nur Orga, `/trips/{id}/poll/new`, W10)

Einstiege: Statusband „Alle haben abgegeben“ · Auswahl in Vorschlagsliste · Tagesdetail „Ab hier vorschlagen“ · Tab Abstimmen (Leerzustand Orga) · To-do in Meine Reisen.

| # | Schritt | Details |
|---|---|---|
| 1 | Optionen prüfen | Vorbelegt: Top 3 aus F-009 als konkrete Zeiträume in Wunschdauer (bzw. vorher in der Liste gewählte). Je Option Karte: «Mi., 5. Mai – Mo., 10. Mai · 5 Nächte», Verfügbarkeit «7 können · 1 zur Not» bzw. «⚠ Jonas kann nicht». Ist die zugrundeliegende Spanne länger als die Wunschdauer: `[‹ früher] [später ›]` verschiebt den Zeitraum tageweise innerhalb der Spanne; Dauer-Stepper ändert die Nächte. `[Entfernen]` je Option. |
| 2 | Option hinzufügen | `[+ Eigenen Zeitraum]` → Bottom-Sheet mit Mini-Kalender (Heatmap-Färbung), Auswahl Anreise → Abreise (Bereichsmodus wie B.2). ◆ Personen können nicht → Warnhinweis «Sara und Jonas können an mindestens einem Tag nicht.» (erlaubt, F-010). |
| 3 | Frist (optional, F-017) | «Abstimmen bis» Datum, Standard leer; Schnellwahl «in 3 Tagen · in 1 Woche». |
| 4 | Validierung | 2–6 Optionen; doppelte Zeiträume werden verhindert («Diesen Zeitraum gibt es schon»). Button deaktiviert mit Erklärung, wenn < 2: «Mindestens 2 Optionen». |
| 5 | `[Abstimmung starten]` | Reise → Phase 2. Sofort **Teilen-Sheet** (W06) mit Text «Abstimmung läuft» (F-002/F-010). Danach Tab Abstimmen. To-do «Abstimmen» erscheint bei allen in Meine Reisen. |

Nach dem Start: Optionen können nur **hinzugefügt** werden (`[+ Option hinzufügen]` im Tab Abstimmen, Orga). Ändern/Löschen nicht möglich (F-010) – Erklärung im Hinzufügen-Dialog: «Bestehende Optionen bleiben unverändert, damit abgegebene Stimmen gültig bleiben.»

### D.2 Abstimmen (alle Mitglieder, `/trips/{id}/poll`, W10)

1. Kopf: h1 «Abstimmung läuft», darunter **Kennzahl-Kacheln** (Richtung B, ux-spec §4.10): «noch 3 Tage / bis Fr., 14. Mai» (nur mit Frist) und «4 von 7 / haben abgestimmt». Tipp auf die Beteiligungs-Kachel → Sheet «Wer hat abgestimmt?» (Abgestimmt / Noch offen, nur Status; Orga zusätzlich `[Erinnern]`).
2. Je Option eine Karte: Zeitraum, Nächte, Urlaubstage, «laut Kalender: 7 können · ohne Jonas» („können“ = kein „Geht nicht“ im Zeitraum, Glossar). Darunter **Segment-Schalter** `[Ja] [Vielleicht] [Nein]` (Radiogruppe, ≥ 48 px hoch; unter 400 px Breite Icon über Label, 56 px hoch – U-8).
3. **Vorbelegung (F-011):** aus Verfügbarkeit abgeleiteter Vorschlag wird **gestrichelt/hell** angezeigt + Label «Vorschlag aus deinen Tagen». Er zählt erst, wenn bestätigt: Tipp auf den Vorschlag oder `[Alle Vorschläge übernehmen]` (oben, nur sichtbar, wenn es unbestätigte Vorschläge gibt).
4. Jede Stimme speichert sofort (optimistisch). Statuszeile: «Noch 1 Option offen» → wenn alle beantwortet: «Danke, deine Stimmen sind gespeichert. Du kannst sie bis zum Ende ändern.» Status „abgestimmt“ (F-007/F-011) erst, wenn **alle** Optionen eine bestätigte Stimme haben.
5. **Ergebnisse** einer Option werden erst angezeigt, nachdem man **zu dieser Option selbst** abgestimmt hat (vermeidet Mitläufer-Effekt, Transparenz bleibt: danach namentlich sichtbar). Die **Orga sieht immer alles** (braucht den Überblick zum Festlegen). Vor der eigenen Stimme steht an der Stelle des Balkens «Stimm ab, um das Ergebnis zu sehen.» *bestätigt (Auftraggeber 2026-10-08).* Darstellung je Option: Balken Ja/Vielleicht/Nein mit Zahlen, Rang-Abzeichen «Platz 1» / «Top choice» (nur Platz 1; bei Gleichstand alle Erstplatzierten), «ohne Jonas» bei Nein-Stimmen, `[Wer hat wie gestimmt?]` klappt Namensliste auf.
6. Sortierung der Karten: in Erstellungsreihenfolge, solange man noch nicht vollständig abgestimmt hat (keine springenden Karten beim Abstimmen); danach nach Rang – **erst beim nächsten Öffnen des Tabs**, nie während man auf der Seite ist (M-U3: kein FLIP-Umsortieren; Fokus- und Lesereihenfolge bleiben stabil, Korrekturen an der eben benutzten Karte bleiben einfach).

**Leer-/Sonderzustände Tab Abstimmen:**
- ∅ Phase 1, Mitglied: «Noch keine Abstimmung. Lena startet sie, sobald genug Tage eingetragen sind. Bis dahin: [Vorschläge ansehen]».
- ∅ Phase 1, Orga: «Bereit für die Abstimmung? Wähle 2–6 Zeiträume aus den Vorschlägen.» `[Abstimmung erstellen]`; Hinweis, falls noch nicht alle abgegeben haben.
- Frist abgelaufen (F-017): Banner für Orga «Die Frist ist abgelaufen. Zeit, den Termin festzulegen. [Ergebnis festlegen]»; für Mitglieder «Die Frist ist abgelaufen – Lena legt den Termin bald fest. Du kannst noch abstimmen.» (keine automatische Entscheidung).

### D.3 Ergebnis festlegen (nur Orga, F-012, W11)

1. `[Abstimmung beenden & Termin festlegen]` (Tab Abstimmen, unten) → Dialog/Bottom-Sheet.
2. ◆ Haben alle abgestimmt? Nein → Hinweisbox im Dialog «Noch nicht abgestimmt: Kemal, Sara.» (kein Blocker, F-012).
3. Optionsliste als Radiogruppe mit Ergebnis-Kurzinfo. **Vorauswahl = Platz 1.** ◆ Gleichstand auf Platz 1 → **keine Vorauswahl**, Hinweis «Gleichstand – du entscheidest.», Button erst aktiv nach Auswahl.
4. `[Termin festlegen]` → Phase 3. Sheet schließt, **Fokus sofort auf h1 «Es geht los!»** (`aria-describedby` → Datum; M-U10). Erfolgsansicht (Übersicht, groß) mit **Feier** (Vorfreude-Ring, Konfetti; Kern ≤ 1 s, Ausklang ≤ 2,6 s, Text/Tasten ab ≤ 300 ms bedienbar; Vibration Android best effort; reduziert ohne Bewegung – ux-spec §7.5): «Es geht los! Mi., 5. Mai – Mo., 10. Mai 2027 · 5 Nächte · 7 dabei · noch 23 Tage» + Aktionen:
   - `[Allen Bescheid geben]` → Teilen-Sheet Text „Ergebnis“ (F-012).
   - `[Zum Kalender hinzufügen ▾]` → «Kalenderdatei (Apple, Outlook …)» (ICS-Download, ganztägig An- bis Abreisetag) · «Google Kalender» (öffnet Link in neuem Tab).
5. Alle Mitglieder sehen beim nächsten Öffnen dieselbe Ergebnis-Karte mit „Zum Kalender hinzufügen“; Meine Tage + Abstimmen schreibgeschützt. **Feier für alle (Q17 b):** Jedes Mitglied erlebt die Feier **einmal** beim ersten Öffnen der Übersicht nach der Festlegung (serverseitig je Mitgliedschaft und Festlegung gemerkt, geräteübergreifend; gesetzt, sobald sie sichtbar startet). ◆ Direkt einen anderen Tab geöffnet → Banner «Der Termin steht fest! [Ansehen]» → Übersicht → Feier. Kein Fokus-Sprung bei Mitgliedern. Spätere Besuche statisch. ◆ Festlegung aufgehoben und **anderer** Zeitraum festgelegt → Feier erneut; gleicher Zeitraum → nicht. Beitritt in Phase 3 → Feier einmal.
6. **Festlegung aufheben** (Reisemenü, Orga): Bestätigungsdialog «Termin wieder offen machen? Die Abstimmung wird wieder geöffnet, alle Stimmen bleiben erhalten. Bereits geteilte Termine musst du im Gruppenchat selbst korrigieren.» `[Termin aufheben]` → Phase 2.

**ICS-Hinweis iOS:** In iOS-In-App-Browsern ist Datei-Download oft eingeschränkt. Fallback: Bei erkanntem In-App-Browser zusätzlich Hinweis «Klappt der Download nicht? Öffne die Seite in Safari/Chrome (⋯ → Im Browser öffnen).» Der ICS-Link ist eine normale URL (`/trips/{id}/event.ics`, nur für angemeldete Mitglieder) und funktioniert dort nach Login.

---

## E Meine Reisen (F-044)

### E.1 Aufbau (W04)

1. Kopf: «Meine Reisen» + `[+ Neue Reise planen]` (mobil: volle Breite unter der Überschrift; Desktop rechts).
2. **Abschnitt „Zu tun“** (nur wenn vorhanden): Karten mit hervorgehobenem To-do-Satz und Direktaktion:
   - «Deine Tage fehlen noch» → `[Tage eintragen]` (→ Meine Tage)
   - «Jetzt abstimmen» → `[Abstimmen]`
   - Orga: «Alle haben abgegeben – Abstimmung starten?» → `[Abstimmung erstellen]`
   - Orga: «Frist abgelaufen – Termin festlegen?» (F-017)
   - Orga: «Diese Reise wird am 20.1. automatisch gelöscht» (F-013, 14 Tage vorher) → `[Mehr erfahren]`
3. **Abschnitt „Laufende Reisen“** – sortiert nach nächstem Ereignis (Frist, dann Reisebeginn, dann zuletzt aktiv).
4. **Abschnitt „Vergangene Reisen (3)“** – eingeklappt.

**Reisekarte:** Reisename (max. 2 Zeilen) · Rolle als Abzeichen «Orga» (nur bei eigener Orga-Rolle; „Mitglied“ wird nicht extra angezeigt – weniger Rauschen) · **Phasen-Chip** mit Symbol + Text: «Tage sammeln» / «Abstimmung läuft» / «Steht fest: 5.–10. Mai» / «Vergangen» · Fortschritt: Phase 1 «5/7 haben Tage eingetragen» (Mini-Fortschrittsbalken), Phase 2 «4/7 haben abgestimmt», Phase 3 «in 23 Tagen» · ganze Karte ist ein Link (ein Fokusziel); die To-do-Aktion ist ein zweites, separates Ziel.

### E.2 Leerzustände

- ∅ **Keine Reisen (neues Konto ohne Einladung):** Illustration + «Noch keine Reise geplant. Leg eine an und schick den Link in euren Gruppenchat – oder öffne den Einladungslink, den du bekommen hast.» `[Neue Reise planen]`.
- ∅ **Nur vergangene Reisen:** Abschnitt „Laufende“ zeigt «Zeit für die nächste Reise?» `[Neue Reise planen]`.
- ∅ **Offener Beitritt aus `pendingAuth`:** Hinweiskarte ganz oben «Du wolltest „Lissabon 2027“ beitreten. [Jetzt beitreten]».
- Ladezustand: 3 Skelett-Karten.

---

## F Sprachumschaltung (F-046)

### F.1 Bestimmung der Sprache (Priorität absteigend)

1. **Angemeldet:** Kontosprache.
2. **Nicht angemeldet:** Cookie `lang` (gesetzt durch ausdrückliche Wahl; technisch notwendig, 12 Monate).
3. `Accept-Language`: `de-*` → `de`; alles andere → `en`.
4. Öffentliche Seiten mit Präfix (`/de`, `/en`) zeigen die Sprache des Präfixes; Umschalter wechselt auf das Gegenstück (`/de/datenschutz` ↔ `/en/privacy`).

**Region** (Datumsformat, Wochenstart, Feiertage) ist **getrennt** von der Sprache: Vorbelegung aus `Accept-Language`-Region (`de-AT` → AT, `en-US` → US); ohne Region: `de` → DE, `en` → GB. Region wird bei der Registrierung nicht abgefragt (Tempo), sondern still gespeichert und in Kontoeinstellungen änderbar; Hinweis beim ersten Öffnen von Meine Tage, falls Region geraten wurde: «Feiertage für: Deutschland (bundesweit) [Ändern]» – Ein-Tipp-Auswahl inkl. Bundesland.

### F.2 Wo wird umgeschaltet

| Ort | Form | Sichtbar für |
|---|---|---|
| Header | Direkter Umschalter in der **Zielsprache**: «English» bzw. «Deutsch» (mit `lang`-Attribut, Icon `ww-icon-language` davor, ein Tipp, kein Menü, kein Sprachcode „DE/EN“) | nicht angemeldet (inkl. Einladungs-Vorschau und Login – wichtig für englischsprachige Eingeladene in deutschen Gruppen) |
| Avatar-Menü | Eintrag «Sprache: Deutsch ▸» → Auswahl | angemeldet |
| Kontoeinstellungen | Radiogruppe Deutsch / English | angemeldet |
| Footer | Segment-Umschalter «Deutsch \| English» (aktuelle Sprache markiert, ein Tipp; design-system §9.8) | alle |
| Teilen-Sheet | Umschalter `DE | EN` nur für den **Text** (ändert nicht die Oberfläche) | alle |

Bei nur zwei Sprachen ist ein direkter Umschalt-Link schneller als ein Dropdown (ein Tipp statt zwei). Bei einer dritten Sprache wird er zum Menü.

### F.3 Verhalten & Persistenz

- Umschalten lädt die aktuelle Seite in der neuen Sprache neu **ohne Zustandsverlust** (Formulareingaben, Flow-Schritt, Scrollposition bleiben; im Einladungsflow über `pendingAuth`).
- Nicht angemeldet: setzt Cookie `lang`.
- Angemeldet: speichert in Konto (gilt geräteübergreifend) + Cookie.
- **Beim Login:** Die zuletzt **ausdrücklich** getroffene Wahl gewinnt. Hat jemand vor dem Login in diesem Browser umgeschaltet, wird die Kontosprache darauf aktualisiert; sonst gilt die Kontosprache. Neue Konten übernehmen die aktuell angezeigte Sprache.
- Transaktionsmails: in der Sprache, in der die Oberfläche beim Auslösen angezeigt wurde (beim ersten Code), danach Kontosprache.
- Bestätigung nach Umschalten: keine Meldung nötig (Wechsel ist selbsterklärend); Fokus bleibt auf dem Umschalter.
- **Produktname wechselt mit:** DE „Wir wollen weg“ ↔ EN „When do we go?“ in Header-Wortmarke, Seitentitel, Footer und allen Texten (Bildmarke bleibt gleich). Teilen-Texte tragen den Namen in der Sprache des Senders bzw. der im Sheet gewählten Textsprache; Mails in der Mailsprache (ux-spec §9, §10.6).

---

## G Reise anlegen & einladen (F-001, F-002)

1. Einstieg: Landing `[Reise planen]` · Meine Reisen `[+ Neue Reise planen]` → `/trips/new` (W05). **Funktioniert ohne Login** – das Konto kommt am Ende (Wert vor Hürde).
2. Formular (eine Seite):
   - Reisename* («z. B. Lissabon 2027, Skiurlaub, JGA Tim»)
   - Zeitraum für die Suche* – Von / Bis (native Datumsfelder) + Schnellwahl-Chips «Nächste 3 Monate · 6 Monate · Sommer 2027»
   - Wie lang soll die Reise sein?* – Stepper «mindestens [4] Nächte» + optional «am liebsten [5] Nächte»; Hilfetext «4 Nächte = 5 Tage inkl. An- und Abreise»
   - `▸ Mehr Optionen` (eingeklappt): Beschreibung (≤ 500), Feiertage der Reise (Standard: eigene Region), Frist für das Eintragen (F-017)
3. Validierung: s. ux-spec §5 (Startdatum ≥ heute, Länge ≤ 12 Monate, Zeitraum ≥ Mindestdauer + 1 Tag, Wunsch ≥ Mindest).
4. `[Reise anlegen]`:
   - ◆ angemeldet → anlegen.
   - ◆ nicht angemeldet → Formular bleibt sichtbar (zusammengeklappt als Zusammenfassung «Lissabon 2027 · 1. Mai – 30. Juni · 4–5 Nächte [Bearbeiten]»), darunter Auth-Schritte wie A.1 (E-Mail → Code → ggf. Name) mit `intent=createTrip`; Formulardaten in `pendingAuth` gesichert. Danach automatisch anlegen.
5. → `/trips/{id}/invite` (W06): «Deine Reise ist angelegt! Jetzt die Gruppe einladen.» Teilen-Sheet inline (Text editierbar, Sprache umschaltbar, `[Teilen …]`, `[Link kopieren]`), darunter optional «Wer soll dabei sein? Platzhalter anlegen» (F-007), dann `[Weiter: Meine Tage eintragen]`.
6. ⚠ Fehler beim Anlegen: Formular bleibt, Fehlermeldung oben + `[Nochmal versuchen]`.

---

## H Anmelden, Abmelden, Zugang wiederherstellen (F-041, F-042)

### H.1 Anmelden / Registrieren (`/login`, W02)

- **Ein Formular für beides.** Überschrift «Anmelden oder registrieren»; Text «Gib deine E-Mail ein. Wir schicken dir einen Code – ein Passwort brauchst du nicht.»
- Schritte wie A.1 (E-Mail → Code → [nur neu: Name]) ohne Reise-Karte, inkl. optimistischem Wechsel zum Code-Schritt (A.1 Schritt 3, M-U5). Danach → `next` bzw. Meine Reisen.
- Checkbox «Angemeldet bleiben» (Standard an – *bestätigt (Auftraggeber 2026-10-08)*) unter dem E-Mail-Feld. Hilfetext bei Fokus/Info: «Auf fremden Geräten abwählen.»
- `[Mit Passwort anmelden]` blendet Passwortfeld ein; dort `[Passwort vergessen?]`.
- Hinweis unter dem Passwortfeld (F-042): «Kein Passwort gesetzt? Melde dich einfach mit einem Code an.»
- Bereits angemeldet und `/login` aufgerufen → Weiterleitung `next`/Meine Reisen.
- Session abgelaufen auf geschützter Seite → `/login?next=…` mit Hinweis «Bitte melde dich erneut an – danach geht es dort weiter, wo du warst.»

### H.5 Magic-Link einlösen (`/auth/magic?token=…&next=…`, W02) – *Entscheidung UI/UX 2026-10-08 (spike-auth §2, R-006)*

**Entscheidung:** Der Link aus der Mail loggt **nicht** direkt ein, sondern öffnet eine Landeseite mit einem Button. Der Token wird erst beim Tippen verbraucht, und zwar per **POST** (Formular/Server Action), nie per GET. **Keine** automatische Weiterleitung per JS: Manche Scanner führen JS aus, und ein Auto-Submit nimmt dem Tipp seinen Sinn.
*Begründung:* Mail-Scanner (Outlook Safe Links, Firmen-Gateways) rufen Links vorab per GET auf. Ein direkter Link wäre danach verbraucht, die Person sähe „abgelaufen“ – schlimmer als ein Tipp mehr. Der Link ist ohnehin der Zweitweg (A.0), der Code bleibt der Primärweg.

| # | Schritt | Verhalten |
|---|---|---|
| 1 | GET `/auth/magic?token=…&next=…` | Seite wird angezeigt, Token wird **nicht** geprüft und nicht verbraucht (keine Aussage über gültig/ungültig vor dem Tippen). Im Einladungskontext (`next=/i/{token}`) steht zusätzlich der Reisename aus der Einladung. Kein Logo-Link zu externen Seiten, `noindex`. |
| 2 | Tipp auf „Jetzt anmelden“ | POST mit dem Token (verstecktes Feld). Button → Ladezustand «Einen Moment …» (`aria-busy`), doppelt absenden gesperrt. |
| 3a | Erfolg | Session in *diesem* Browser („Angemeldet bleiben“ = an, wie Standard H.1) → Weiterleitung auf `next` (nur interne Pfade) bzw. Meine Reisen. Neues Konto → erst Schritt Profil (Name), dann `next`. Im Einladungskontext → Beitritt wie A.1. |
| 3b | Token abgelaufen / schon benutzt / ungültig | Gleiche Seite, Fehlerzustand (W02/W14): Überschrift «Dieser Anmeldelink funktioniert nicht mehr», Text «Er ist 15 Minuten gültig und funktioniert nur einmal. Hol dir einfach einen neuen Code.» Primär `[Neuen Code anfordern]` → `/login?next=…` (bzw. `/i/{token}` im Einladungskontext) mit vorbelegter E-Mail, falls serverseitig bekannt, und direktem Sprung in Schritt Code nach dem Senden. Fokus auf die Überschrift. |
| 3c | Bereits mit **demselben** Konto angemeldet | Nach dem POST einfach weiter zu `next` (kein Fehler). |
| 3d | Mit einem **anderen** Konto angemeldet | Vor dem Button Hinweis «Du bist gerade als {Name} angemeldet. Mit diesem Link meldest du dich als jemand anderes an.» Button bleibt; nach Erfolg ersetzt die neue Session die alte. |
| 3e | Netzwerk-/Serverfehler | Inline-Fehler über dem Button «Das hat nicht geklappt. Bitte versuch es nochmal.», Button wieder aktiv (Token noch nicht verbraucht). |

### H.2 Abmelden

- Avatar-Menü → `[Abmelden]` (keine Rückfrage) → Landing mit Snackbar «Du bist abgemeldet.»
- Konto → «Auf allen Geräten abmelden» → Bestätigungsdialog «Du wirst überall abgemeldet, auch hier.» → Login-Seite.

### H.3 Passwort vergessen (`/login/reset`)

1. E-Mail (vorbelegt) → `[Code senden]` → neutrale Antwort (keine Enumeration).
2. Code eingeben → neues Passwort (min. 10 Zeichen, Stärke-Hinweis, Anzeigen-Schalter) → `[Passwort speichern]`.
3. Erfolg: «Passwort geändert. Auf anderen Geräten wurdest du abgemeldet.» → angemeldet weiter.
4. Hinweis oben: «Du kannst dich auch ohne Passwort mit einem Code anmelden. [Mit Code anmelden]» – oft der schnellere Weg.

### H.4 Zugang zur E-Mail verloren

Nicht im Self-Service. Hilfe-Seite: «Kein Zugriff mehr auf deine E-Mail? Schreib uns an <Kontakt>.» Mitglieder können der Reise alternativ mit einem neuen Konto erneut beitreten; der Orga kann das alte Mitglied entfernen.

---

## I Konto verwalten & löschen (F-043, F-042)

### I.1 Kontoeinstellungen (`/account`, W13)

Abschnitte (jeweils eigene Karte, Änderungen pro Abschnitt speichern):
1. **Profil:** Anzeigename (wirkt in allen Reisen, Hinweis dazu; reisespezifische Namen bleiben bestehen) → `[Speichern]`.
2. **Sprache & Region:** Sprache (Deutsch/English) · Region (Land + bei DE/AT/CH/UK Bundesland/Kanton/Landesteil für Feiertage) · Wochenbeginn (Automatisch nach Region / Montag / Sonntag) · Vorschau «So sehen Daten aus: Fr., 3. Juli 2027». Sofort speichern bei Änderung (Snackbar «Gespeichert»).
3. **Darstellung** (neu, Q17 a): Schalter «Bewegung reduzieren» (Standard aus = folgt dem Gerät), speichert sofort (Snackbar «Gespeichert»), wirkt ohne Neuladen; meldet das Gerät schon „reduzieren“, ist er an und nicht bedienbar mit Grund (Texte ux-spec §7.5). Kein Theme-Schalter (Dark Mode folgt dem System).
4. **Anmeldung:** E-Mail (mit `[Ändern]` → `/account/email`) · Passwort: «Nicht gesetzt – du meldest dich mit Code an» `[Passwort festlegen]` bzw. «Gesetzt» `[Ändern]` `[Entfernen]`.
5. **Sitzungen:** `[Auf allen Geräten abmelden]`.
6. **Daten & Datenschutz:** Link Datenschutzerklärung · «Deine Daten anfordern: schreib an <Kontakt>» · `[Konto löschen]` (Textbutton in Warnfarbe, ganz unten).

### I.2 E-Mail ändern (`/account/email`)

Re-Authentifizierung (Code an **alte** Adresse oder Passwort) → neue Adresse → Code an **neue** Adresse → Erfolg «Deine E-Mail ist jetzt kemal@neu.de. Wir haben deine alte Adresse informiert.» ⚠ Neue Adresse = alte: Inline-Fehler. ⚠ Adresse schon vergeben: **neutral** behandeln – Code an neue Adresse wird nicht zugestellt bzw. Mail dort erklärt „Es gibt schon ein Konto“ (keine Enumeration in der Oberfläche).

### I.3 Konto löschen (`/account/delete`)

1. Erklärung, was gelöscht wird: «Dein Name, deine E-Mail, deine Tage und Stimmen in allen Reisen. Das kann nicht rückgängig gemacht werden.»
2. ◆ Bin ich Orga von Reisen **mit weiteren Mitgliedern**? → Je Reise eine Zeile: «Lissabon 2027 (7 Mitglieder)» mit Radiogruppe: «Orga übergeben an [Sara ▾]» (Vorbelegung: am längsten dabei) / «Reise für alle löschen». Pflicht für jede Reise. Reisen ohne weitere Mitglieder: Liste «Diese Reisen werden mitgelöscht: …».
3. Re-Authentifizierung: Code an E-Mail (bzw. Passwort) – gleiche Code-Komponente.
4. Letzter Dialog: «Konto endgültig löschen?» `[Abbrechen]` `[Konto löschen]` (Warnfarbe).
5. → `/goodbye` (abgemeldet): «Dein Konto ist gelöscht. Wir haben dir eine Bestätigung geschickt. Danke, dass du dabei warst.» `[Zur Startseite]`.
⚠ Re-Auth fehlgeschlagen → wie A.2. ⚠ Serverfehler → nichts gelöscht, Meldung + erneut versuchen.

---

## J Reise verlassen · Mitglied entfernen · Rolle übergeben · Reise löschen (F-004, F-013)

Alle als Dialoge (W12). Destruktive Buttons benennen die Handlung, nie „OK“.

| Aktion | Wer | Ablauf | Danach |
|---|---|---|---|
| **Reise verlassen** | Mitglied | Reisemenü → Dialog «„Lissabon 2027“ verlassen? Deine Tage, Stimmen und dein Kommentar in dieser Reise werden gelöscht. Dein Konto bleibt.» `[Reise verlassen]` | → Meine Reisen, Snackbar «Du hast „Lissabon 2027“ verlassen.» (kein Undo – Daten sind gelöscht; Wiedereintritt nur per Einladungslink) |
| Reise verlassen | Orga | Dialog erklärt: «Als Orga musst du die Reise zuerst übergeben oder löschen.» `[Orga übergeben]` `[Reise löschen]` `[Abbrechen]` ◆ einziges Mitglied → nur „Reise löschen“ | – |
| **Orga übergeben** | Orga | Mitglied auswählen (Radioliste) → «Sara wird Orga. Du bleibst Mitglied.» `[Übergeben]` | Rollenabzeichen aktualisiert, Snackbar |
| **Mitglied entfernen** | Orga | Übersicht → Mitglied → `⋯` → «Kemal entfernen? Seine Tage und Stimmen werden gelöscht. Er kann nur mit einem Einladungslink wieder beitreten.» Checkbox optional «Einladungslink danach erneuern» `[Entfernen]` | Neuberechnung, Snackbar |
| **Platzhalter entfernen** | Orga | wie oben, ohne Datenhinweis | – |
| **Einladungslink erneuern** | Orga | /invite → «Neuen Link erzeugen? Der bisherige Link funktioniert dann nicht mehr.» `[Neuen Link erzeugen]` | neuer Link + Teilen-Sheet |
| **Beitritt sperren/öffnen** | Orga | Schalter auf /invite «Neue Mitglieder können beitreten» | sofort, Snackbar |
| **Reise löschen** | Orga | /settings → Gefahrenbereich → Dialog: «Reise für alle löschen? Alle Tage, Stimmen und Mitglieder werden sofort gelöscht.» Feld: «Tippe zur Bestätigung den Reisenamen: Lissabon 2027» – Button erst aktiv bei Übereinstimmung (Groß-/Kleinschreibung und Leerzeichen am Rand ignorieren) | → Meine Reisen, Snackbar; andere Mitglieder sehen die Reise nicht mehr (beim Öffnen: „nicht gefunden“) |
| Automatische Löschung | System | 14 Tage vorher Banner in Meine Reisen + Reise (Orga) «Wird am 20. Jan. gelöscht (90 Tage nach Reiseende).» | – |

---

## K Nachzügler erinnern (F-015)

1. Einstiege (Orga): Übersicht → Fortschritt «5 von 7» → `[Erinnern]` · Statusband in Gruppe · Reisemenü «Gruppe erinnern». In Phase 2 bezieht sich „Erinnern“ auf **Abstimmung** (Fehlende = noch nicht abgestimmt).
2. Teilen-Sheet mit vorbereitetem Text inkl. Namen der Fehlenden (ux-spec §10.3), Sprache umschaltbar, editierbar.
3. Auswahl der Personen: Liste mit Checkboxen (alle Fehlenden vorausgewählt), Text aktualisiert sich.
4. `[Teilen …]` / `[Text kopieren]`. Nach dem Teilen: Hinweis «Zuletzt erinnert: heute, 14:20» an der Fortschrittsanzeige (nur Orga sichtbar) – verhindert Mehrfach-Spam.
5. ∅ Niemand fehlt → Button entfällt; stattdessen «Alle haben abgegeben → [Abstimmung starten]».
6. Nicht-Orga: kein Erinnern-Button (sozial heikel); aber `[Freunde einladen]` – alle Mitglieder dürfen den Einladungslink teilen, solange der Beitritt offen ist (*bestätigt (Auftraggeber 2026-10-08)*).

---

## Änderungen
- 2026-10-08 (Runde 3, Richtung B + Q17): A.1/H.1 optimistischer Code-Schritt (M-U5); B.1 Werkzeugleiste B, B.2 Vibration, B.4 Geste-Hinweis (M-U9); C.1 Kennzahl-Box statt Statusband; C.3 Vorschlag-Leiste, Band bleibt (M-U7), Heatmap-Aufbau (M-U8); D.2 Kennzahl-Kacheln, Umsortieren erst beim nächsten Öffnen (M-U3); D.3 Fokus (M-U10) und Feier für alle (Q17 b); I.1 Abschnitt Darstellung (Q17 a).
- 2026-10-08 (Abstimmungsrunde 2): B.1/B.2 Legende, Feiertagsliste, Zieh-Vorschau, Bereichs-Anker; C.1–C.3 „Alle dabei / Fast alle dabei“ (U-14), Zell-Semantik ✓/◐ (U-4), Legende (U-6), Tagesdetail-Kopf und „Noch offen“ (U-13), Tagesliste bei großer Schrift (U-5); D.2 Ergebnis-Sichtbarkeit, Segmente < 400 px, „Platz 1 / Top choice“; F.2 Sprachumschalter Header/Footer; H.1, K: CEO-Entscheidungen markiert.
- 2026-10-08 (Auftraggeber-Entscheidungen): F.3 Produktname je Sprache („When do we go?“ für EN); CEO-Vermerke in H.1, K, D.2 auf „bestätigt (Auftraggeber 2026-10-08)“ umgestellt.
- 2026-10-08 (Review-Nacharbeit R-006/R-008): A.4 Regel 4/6 und neuer Abschnitt H.5 – Magic-Link-Landeseite mit Button, Einlösen per POST, Fehlerfall → Code-Weg.
