# Demo-Drehbuch M0.5 – „Wir wollen weg“ in 20 Minuten

Stand: 2026-10-16 · Gepflegt von: Operations Manager · Für: Auftraggeber (Demo-Abnahme M0.5) · Voraussetzung: Demo läuft nach [demo-anleitung.md](demo-anleitung.md)

Dieses Drehbuch führt einmal durch den kompletten Weg **vom Gruppenchat zum festen Reisetermin** – abwechselnd aus Sicht der **Orga** (wer die Reise plant) und eines **Mitglieds** (wer eingeladen wird). Die Schritte wurden am 2026-10-16 in der Demo-Umgebung einmal komplett durchgespielt (Laptop-Browser als Orga, Handy-Ansicht über die WLAN-Adresse als Mitglied).

Am Ende steht eine **Feedback-Checkliste**. Am besten hältst du sie beim Durchklicken offen und notierst spontan, was dir auffällt – auch Kleinigkeiten.

---

## Vorbereitung (2 Minuten)

1. Demo starten: `bash scripts/demo.sh start` (siehe Anleitung). Vor einer Vorführung für andere vorher `bash scripts/demo.sh seed` – dann ist alles frisch.
2. Drei Fenster bzw. Geräte bereitlegen:

| Rolle | Wo | Adresse |
|---|---|---|
| **Orga „Max“** | Laptop, normales Browserfenster | <http://localhost:3000> |
| **Mitglied „Lea“** | **Handy** (gleiches WLAN, Handy-Adresse aus dem Startkasten) – oder am Laptop ein **privates Fenster** (`⌘ + Umschalt + N`) | z. B. `http://192.168.178.20:3000` |
| **Postfach** | Laptop, zweiter Tab | <http://localhost:8025> (Mailpit) |

3. Ausgedachte Adressen verwenden: **`max@demo.test`** und **`lea@demo.test`**. (Echte Adressen bekommen ohnehin keine Mail – alles landet in Mailpit.)

> Wenn irgendwo „Bitte warte kurz …“ erscheint: `bash scripts/demo.sh unlock` im Terminal, dann weiter.

---

## Teil 1 – Die Orga legt eine Reise an (ca. 4 Min.) · Laptop, Max

| # | Was du tust | Worauf du achtest |
|---|---|---|
| 1.1 | <http://localhost:3000> öffnen. Startseite „Vom Gruppenchat zum festen Reisetermin.“ | Erster Eindruck, gelber Demo-Balken oben (gehört nur zur Demo) |
| 1.2 | **„Reise planen“** klicken – du bist noch **nicht** angemeldet | Man kann ohne Konto loslegen |
| 1.3 | Name: **„Sommerhaus Dänemark“**, Zeitraum: Schnellwahl **„Nächste 3 Monate“**, Dauer: mindestens **4 Nächte** (mit + / −). Optional „Mehr Optionen“: Beschreibung, Feiertage, Frist | Verständlichkeit der Fragen, „= 5 Tage inkl. An- und Abreise“ |
| 1.4 | **„Reise anlegen“** → Frage „Fast fertig – mit welcher E-Mail willst du planen?“ → `max@demo.test` → **„Code senden“** | |
| 1.5 | In **Mailpit** die Mail „…ist dein Code für Wir wollen weg“ öffnen, 6-stelligen Code in der App eintippen | Gestaltung der Mail, Tempo; Code wird nach 6 Ziffern automatisch geprüft |
| 1.6 | „Fast geschafft! Wie sollen dich die anderen nennen?“ → **Max** → „Reise anlegen“ | |
| 1.7 | Seite **„Deine Reise ist angelegt!“**: fertiger Text für den Gruppenchat (DE/EN umschaltbar), Knöpfe WhatsApp/Telegram/E-Mail, **„Link kopieren“** | Ist klar, was jetzt zu tun ist? |
| 1.8 | Optional unter „Wer soll dabei sein?“ einen **Platzhalter** anlegen (z. B. „Tom“) – jeder Platzhalter bekommt einen persönlichen Link | Sinn von Platzhaltern verständlich? |
| 1.9 | **„Link kopieren“** – und den Link zum Mitglied bringen: Handy per **AirDrop / Notizen / Nachricht an dich selbst**; privates Fenster: einfügen | Der Link beginnt mit der WLAN-Adresse, damit er auch am Handy klappt |

## Teil 2 – Das Mitglied tritt bei (ca. 3 Min.) · Handy, Lea

| # | Was du tust | Worauf du achtest |
|---|---|---|
| 2.1 | Einladungslink öffnen → Karte „Gruppenreise – Sommerhaus Dänemark – von Max“, Eckdaten, „Max ist schon dabei“ | Wirkt die Einladung vertrauenswürdig und einladend? |
| 2.2 | **„Mitmachen“** → `lea@demo.test` → „Code senden“ | |
| 2.3 | Code in Mailpit ablesen (Laptop) und am Handy eintippen | Eingabe auf der Handy-Tastatur |
| 2.4 | Name **„Lea“** → **„Beitreten“** | Du landest direkt in **„Meine Tage“** |

## Teil 3 – Tage eintragen (ca. 4 Min.) · erst Lea (Handy), dann Max (Laptop)

| # | Was du tust | Worauf du achtest |
|---|---|---|
| 3.1 | Lea: Unten den Pinsel **„Geht nicht“** wählen und einige Tage **antippen** oder mit dem Finger **darüberwischen** (z. B. eine Woche im November) | Macht das „Malen“ Spaß? Reagiert es flüssig? Animation beim Markieren |
| 3.2 | Pinsel **„Zur Not“** ausprobieren; **Rückgängig** (Pfeil); Knopf **Zeitraum** (Start und Ende antippen); **Schnellaktionen** (Zauberstab, z. B. „Alle Werktage auf ‚zur Not‘“) | Sind die Werkzeuge ohne Erklärung verständlich? |
| 3.3 | Feiertage beachten (rotes Eck, Liste unter dem Monat), oben „Entwurf“ / „Gespeichert“ | Automatisches Speichern verständlich? |
| 3.4 | **„Fertig – abgeben“** → Dialog „Danke, Lea! Deine Tage sind drin.“ mit kurzer Umfrage zum Kalender-Import (beantworten oder „Überspringen“) | |
| 3.5 | Max (Laptop): Tab **„Meine Tage“** → andere Tage auf „Geht nicht“ setzen (Desktop: Klicken und Ziehen mit der Maus) → **„Fertig – abgeben“** | Desktop-Ansicht: mehrere Monate nebeneinander |

> Für eine lebendigere Gruppe: im dritten Fenster als `anna@demo.test` anmelden, den Einladungslink öffnen, beitreten und auch Tage abgeben.

## Teil 4 – Gruppe, Kalender, Vorschläge (ca. 2 Min.) · Max

| # | Was du tust | Worauf du achtest |
|---|---|---|
| 4.1 | Tab **„Übersicht“**: „Nächster Schritt – Alle haben abgegeben! Zeit für die Abstimmung.“, Liste „Wer ist dabei?“ mit Status | Ist der Fortschritt klar? |
| 4.2 | Tab **„Gruppe“** → Ansicht **„Vorschläge“**: Gruppen „Alle dabei“ und „Fast alle dabei (ohne …)“, je mit Nächten und ca. Urlaubstagen | Sind die Vorschläge verständlich und nützlich? |
| 4.3 | Umschalten auf **„Kalender“** (Heatmap): Farbe = wie viele können; „Was bedeuten die Farben?“ öffnen; einen Tag antippen | Ist die Heatmap ohne Erklärung lesbar? |
| 4.4 | Filter **„Dauer“**, **„Darf fehlen“**, **„Personen ausblenden“** ausprobieren (gelten nur für dich) | |

## Teil 5 – Abstimmung (ca. 3 Min.)

| # | Wer | Was du tust | Worauf du achtest |
|---|---|---|---|
| 5.1 | Max | In „Gruppe“ **„Abstimmung erstellen“** → die App schlägt 3 Zeiträume vor (mit „Früher“/„Später“ verschiebbar, „Eigener Zeitraum“ möglich) → „Abstimmen bis“: **in 1 Woche** → **„Abstimmung starten“** | Verständlich, dass die Orga die Optionen auswählt? |
| 5.2 | Max | Seite „Abstimmung läuft!“ mit Text zum Teilen (es wird **keine** E-Mail verschickt) | |
| 5.3 | Lea | Reise öffnen → Tab **„Abstimmen“**. Bei jeder Option „Laut Kalender: alle können“ und Ja / Vielleicht / Nein. **Das Ergebnis einer Option erscheint erst, wenn du dort selbst abgestimmt hast** („Stimm ab, um das Ergebnis zu sehen.“) | Ist das nachvollziehbar oder irritierend? |
| 5.4 | Lea | Alle drei Optionen bewerten (z. B. Nein / Ja / Vielleicht) → „Danke, deine Stimmen sind gespeichert.“, „Platz 1“-Markierung | Animation der Auswahl, Tempo |
| 5.5 | Max | Ebenfalls abstimmen → „Alle haben abgestimmt“ | |

## Teil 6 – Termin festlegen und feiern (ca. 2 Min.) · Max, dann Lea

| # | Was du tust | Worauf du achtest |
|---|---|---|
| 6.1 | Max: **„Abstimmung beenden & festlegen“** → Dialog „Termin festlegen“ mit Platz 1 vorausgewählt → **„Termin festlegen“** | Hinweis „Danach sind Tage und Stimmen gesperrt …“ verständlich? |
| 6.2 | Feier **„Es geht los!“**: Konfetti, Countdown-Ring „noch … Tage“ | Freude-Moment gelungen? Zu viel / zu wenig? |
| 6.3 | **„Zum Kalender hinzufügen“** → „Kalenderdatei (Apple, Outlook …)“ → die heruntergeladene `.ics`-Datei doppelklicken → landet im Mac-Kalender (ganztägig, An- bis Abreisetag) | Klappt der Import in deinen Kalender? |
| 6.4 | „Allen Bescheid geben“ → fertiger Text „Fix! …“ | |
| 6.5 | Lea (Handy): Reise öffnen → sieht die Feier ebenfalls (einmalig) und kann den Termin in den Kalender übernehmen (iPhone: Kalenderdatei öffnen → „Hinzufügen“) | Wie wirkt die Feier am Handy? |

## Teil 7 – Konto, Sprache, Datenschutz (ca. 2 Min.) · beliebige Person

| # | Was du tust | Worauf du achtest |
|---|---|---|
| 7.1 | Avatar-Menü oben rechts → **„Konto“**: Name, Sprache, Land/Bundesland (Feiertage), Wochenbeginn, **„Bewegung reduzieren“**, E-Mail ändern, Passwort (optional), „Auf allen Geräten abmelden“ | Verständlich, vollständig? |
| 7.2 | **Englisch** umschalten (Konto → Sprache oder oben „English“) und ein paar Seiten ansehen – App-Name dann „When do we go?“ | Englische Texte natürlich? |
| 7.3 | **„Meine Daten herunterladen (JSON)“** | (technisches Format – für Datenschutz-Auskunft gedacht) |
| 7.4 | Fußzeile: **Hilfe**, **Datenschutz**, **Impressum** | Rechtstexte sind bewusst **Platzhalter** bis zum Go-Live |
| 7.5 | Optional **„Konto löschen“** – am besten mit `ida@demo.test` (siehe Abkürzungen) | Ist der Ablauf klar und sicher genug? |
| 7.6 | Optional **Dunkelmodus**:  → Systemeinstellungen → Erscheinungsbild → „Dunkel“ (die App folgt dem System) | Lesbarkeit, Wirkung |

---

## Abkürzungen mit den vorbereiteten Demo-Reisen

Ohne selbst etwas anzulegen, kannst du jeden Zustand sofort zeigen. Anmelden mit der genannten Adresse, Code aus Mailpit. Ein Klick auf eine Reise in „Meine Reisen“ führt direkt zum nächsten sinnvollen Schritt.

**Seit Inkrement 11a (W16 v2.18):** Wer gerade in genau **einer** laufenden Reise ist, landet nach dem Anmelden (ohne Ziel-Link) direkt in deren Übersicht – bei Anna, Ben, Carla und Emma ist das „Roadtrip Schottland“ (läuft ab heute). Einmalig erscheint der Hinweis „Deine laufende Reise ist direkt geöffnet …“; „Meine Reisen“ erreichst du über ← oben links. `/trips` öffnet immer „Meine Reisen“.

| Zeigen möchte ich … | Anmelden als | Reise | Was man sieht |
|---|---|---|---|
| „Meine Reisen“ mit allem: Zu tun, laufende, vergangene Reisen, Lösch-Hinweis | `anna@demo.test` | – | Bereiche „Zu tun (3)“, „Laufende Reisen“, „Vergangene Reisen (2)“; bei „Kroatien Segeln“: „Wird am … gelöscht“ |
| Tage malen mit Entwurf | `anna@demo.test` | **Lissabon 2027** | Annas Tage sind noch ein Entwurf → „Fertig – abgeben“ |
| Gruppenkalender mit klaren Vorschlägen, Platzhalter | `anna@demo.test` (Orga) | **Lissabon 2027** → „Gruppe“ | „Alle dabei“ und „Fast alle dabei (ohne Ben / David / Greta)“, „5 von 9“ inkl. Platzhalter Mia und Tom |
| **Abstimmung läuft**, Ergebnis erst nach eigener Stimme | `anna@demo.test` | **JGA Tim** | Ergebnis nur bei der ersten Option sichtbar, bei den anderen „Stimm ab, um das Ergebnis zu sehen.“; „Wir haben deine Stimmen aus deinen Tagen vorbereitet“ |
| Abstimmung aus Orga-Sicht, **englische Oberfläche** | `carla@demo.test` | **JGA Tim** | Optionen hinzufügen, beenden & festlegen – alles auf Englisch |
| **Termin steht fest** + Feier „Es geht los!“ | `hanna@demo.test` oder `greta@demo.test` | **Familientreffen Harz** | Feier beim ersten Öffnen, Countdown, Kalender-Export (Anna hat die Feier schon gesehen) |
| Abgebrochene Abstimmung | `anna@demo.test` | **Skiurlaub Arlberg** → „Abstimmen“ | einmaliger Hinweis „Ben hat die Abstimmung abgebrochen. Eine neue folgt.“ |
| Beitritt geschlossen, Platzhalter, Kommentar | `anna@demo.test` | **Wanderwoche Dolomiten** → „Übersicht“ | „Beitritt ist geschlossen – frag die Orga.“, Platzhalter „Jule · fehlt noch“, Emmas Kommentar „Only in September“ |
| **Konto löschen** mit Orga-Übergabe | `ida@demo.test` | Städtetrip Wien, Idas Testreise | Löschen verlangt erst Übergabe der Orga-Rolle oder Löschen der Reise; Solo-Reise wird mitgelöscht; Bestätigungsmail in Mailpit |

Danach alles wieder auf Anfang: `bash scripts/demo.sh seed`.

---

## Feedback-Checkliste für die Abnahme M0.5

Bitte zu jedem Punkt kurz: **passt** / **kleine Änderung** / **muss anders** – plus Stichwort. Es gibt keine falschen Antworten; gerade spontane Irritationen sind wertvoll.

### A. Verständlichkeit

- [ ] Startseite: Ist sofort klar, wofür die App da ist?
- [ ] Reise anlegen: Fragen, Zeitraum, Nächte – ohne Nachdenken ausfüllbar?
- [ ] Anmelden per Code statt Passwort: angenehm oder ungewohnt?
- [ ] Einladung am Handy: Würde ein Freund ohne Erklärung mitmachen?
- [ ] „Meine Tage“: Pinsel, Wischen, Zeitraum, Schnellaktionen – selbsterklärend?
- [ ] „Nicht markierte Tage zählen als ‚Geht‘“ – verständlich?
- [ ] Gruppe: Sind Vorschläge und Heatmap-Farben ohne Legende lesbar?
- [ ] Abstimmung: Ist klar, warum man das Ergebnis erst nach der eigenen Stimme sieht?
- [ ] Termin festlegen: Ist klar, was danach gesperrt ist?
- [ ] Weiß man auf jeder Seite, was der nächste Schritt ist?

### B. Optik („Reise-Cockpit“, Indigo & Minze)

- [ ] Gesamteindruck: ansprechend, nicht mehr „spartanisch“?
- [ ] Farben, Schrift, Illustrationen (Sonne, Wellen, Logo)
- [ ] Desktop-Ansicht vs. Handy-Ansicht
- [ ] Dunkelmodus (über Mac-/iPhone-Einstellung)
- [ ] Gibt es Stellen, die noch leer, technisch oder unfertig wirken?

### C. Tempo

- [ ] Ladezeiten beim Seitenwechsel
- [ ] Dauer vom Öffnen des Einladungslinks bis zur Abgabe der Tage (Ziel: ca. 2 Minuten)
- [ ] Wie lange kommt der Code gefühlt? (In der Demo sofort – im Echtbetrieb kommen echte Mails, Sekunden bis selten Minuten.)

### D. Handy-Bedienung

- [ ] Knöpfe groß genug, gut mit dem Daumen erreichbar?
- [ ] Tage-Malen mit dem Finger: präzise genug, Scrollen vs. Malen unterscheidbar?
- [ ] Untere Werkzeugleiste und „Fertig – abgeben“ immer erreichbar?
- [ ] Code-Eingabe auf der Handy-Tastatur
- [ ] Hoch- und Querformat

### E. Animationen und Bewegung

- [ ] Markieren von Tagen, Umschalten der Ansichten, Abstimmen – angenehm oder störend?
- [ ] Feier „Es geht los!“ (Konfetti, Countdown-Ring) – passend dosiert?
- [ ] Mit „Bewegung reduzieren“ (Konto → Darstellung) – wirkt die App dann noch gut?
- [ ] Hinweis: Vibration (Haptik) und weitere Bewegungen kommen erst mit Inkrement 7.

### F. Texte Deutsch / Englisch

- [ ] Ton der deutschen Texte (Du-Form, locker) – passt?
- [ ] Englische Texte (z. B. als `carla@demo.test` oder Umschalter „English“) – natürlich?
- [ ] Name „When do we go?“ für die englische Version – passt?
- [ ] Texte für den Gruppenchat (Einladung, Abstimmung, „Fix!“) – würdest du sie so verschicken?
- [ ] E-Mails in Mailpit (Code, Hinweise) – Ton und Gestaltung

### G. Gesamturteil

- [ ] Würdest du die App mit deiner eigenen Freundesgruppe nutzen?
- [ ] Was fehlt am meisten? Was ist überflüssig?
- [ ] **Entscheidung:** M0.5 abgenommen (ggf. mit Änderungswünschen) → **Go-Live-Gate G1 vorbereiten** ja / noch nicht

---

## Was die Demo bewusst (noch) nicht zeigt

| Thema | Warum | Wann |
|---|---|---|
| Echte E-Mails ins eigene Postfach (z. B. iCloud) | Offline-Demo, alle Mails landen in Mailpit | Go-Live (Mail-Anbieter, Domain) |
| Vorschau des Einladungslinks in WhatsApp, „Teilen“-Menü des Handys | braucht eine echte `https://`-Adresse | Go-Live bzw. optionaler Tunnel-Test |
| Erinnerungen an die Gruppe, Fristen-Automatik, Haptik | Inkrement 7 | nach der Demo-Abnahme |
| Kalender-Import (Apple/Google) | Phase 2 („v1“) | später |
| Echte Rechtstexte (Impressum, Datenschutz) | Platzhalter bis Go-Live (Q14/Q16) | Go-Live-Gate G1 |
