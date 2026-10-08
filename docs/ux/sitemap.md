# Sitemap & Informationsarchitektur – Wir wollen weg (MVP)

Stand: 2026-10-08 · Verantwortlich: UI/UX · Bezug: [PRD](../product/PRD.md) §6, [features.md](../product/features.md), [user-flows.md](user-flows.md), [ux-spec.md](ux-spec.md), [Wireframes](wireframes/README.md)

---

## 1. Grundprinzipien der Informationsarchitektur

1. **Die Reise ist der Mittelpunkt.** Alles Wesentliche passiert innerhalb einer Reise; außerhalb gibt es nur Einstieg (Landing, Einladung, Login), „Meine Reisen“ (F-044) und das Konto (F-043).
2. **Eine Reise = vier feste Bereiche (Tabs).** Übersicht · Meine Tage · Gruppe · Abstimmen. Die Tabs sind in jeder Phase gleich (stabile Orientierung); was sich je Phase ändert, ist der Inhalt und der Standard-Tab beim Öffnen.
3. **Verwaltung ist Nebensache.** Organisator-Funktionen (F-004, F-013) liegen im „⋯“-Menü der Reise und auf einer Einstellungsseite – nicht im Hauptweg der Mitglieder.
4. **Flach und kurz.** Maximale Tiefe: Meine Reisen → Reise → Tab → (Bottom-Sheet/Dialog). Keine dritte Navigationsebene.

## 2. Phasenmodell einer Reise (bestimmt Inhalte und Standard-Tab)

| Phase | Interner Status | Sichtbar als (DE / EN) | Ende der Phase |
|---|---|---|---|
| 1 | `collecting` | „Tage sammeln“ / „Collecting dates“ | Organisator startet Abstimmung (F-010) |
| 2 | `voting` | „Abstimmung läuft“ / „Voting open“ | Organisator legt Ergebnis fest (F-012) |
| 3 | `fixed` | „Steht fest: 5.–10. Mai“ / „It's on: 5–10 May“ | Festlegung aufheben → zurück zu 2 |
| – | `past` | „Vergangen“ / „Past“ (nur in F-044) | automatische Löschung (F-013) |

**Standard-Tab beim Öffnen einer Reise** (gilt für Links aus „Meine Reisen“ und nach dem Beitritt):

| Situation des Betrachters | Landet auf |
|---|---|
| Phase 1, eigene Verfügbarkeit nicht abgegeben | **Meine Tage** |
| Phase 2, eigene Stimme fehlt | **Abstimmen** |
| sonst (inkl. Phase 3) | **Übersicht** |

Direkte URLs auf einen Tab werden immer respektiert (kein Umleiten).

## 3. Sitemap (MVP)

```
Öffentlich (ohne Login)
├── Landing                          /de · /en            (/ leitet weiter)
├── Einladung / Reise-Vorschau       /i/{inviteToken}     F-002, F-003, F-007 (Platzhalter)
│   └── eingebettet: E-Mail → Code → Name → Beitritt      F-040, F-041
├── Anmelden / Registrieren          /login               F-040, F-041
│   ├── Schritt E-Mail
│   ├── Schritt Code                 (gleiche URL, History-Eintrag ?step=code)
│   ├── Schritt Passwort (optional)  (?step=password)
│   └── Schritt Profil (nur neue Konten: Name)  (?step=profile)
├── Magic-Link-Ziel                  /auth/magic?token=…  F-040, F-041
├── Passwort vergessen               /login/reset         F-042
├── Hilfe (Kurz-FAQ)                 /de/hilfe · /en/help    (Empfehlung UX, s. §6)
├── Datenschutz                      /de/datenschutz · /en/privacy   F-013, F-046
└── Impressum                        /de/impressum · /en/imprint     F-046

Angemeldet
├── Meine Reisen (Start)             /trips               F-044
├── Neue Reise planen                /trips/new           F-001 (auch ohne Login startbar)
│   └── Einladen (nach Anlage)       /trips/{id}/invite   F-002
├── Reise                            /trips/{id}          Tab „Übersicht“ (F-007, F-012-Ergebnis, F-015)
│   ├── Tab Meine Tage               /trips/{id}/days     F-005, F-016
│   ├── Tab Gruppe                   /trips/{id}/group    F-008, F-009, F-016
│   │   ├── Ansicht Vorschläge       ?view=list (Standard mobil)
│   │   └── Ansicht Kalender         ?view=calendar
│   │       └── Tagesdetail          Bottom-Sheet / Seitenpanel (?day=2027-05-06)
│   ├── Tab Abstimmen                /trips/{id}/poll     F-011, F-012, F-017
│   │   └── Abstimmung erstellen     /trips/{id}/poll/new F-010, F-017 (nur Orga)
│   ├── Einladen & Teilen            /trips/{id}/invite   F-002, F-007 (Platzhalter), F-015
│   ├── Reise-Einstellungen          /trips/{id}/settings F-001 (bearbeiten), F-004, F-013 (nur Orga)
│   └── Dialoge (ohne eigene URL):   Reise verlassen, Mitglied entfernen, Rolle übergeben,
│                                    Reise löschen, Festlegung aufheben, Name in dieser Reise ändern
└── Konto                            /account             F-041, F-042, F-043, F-046
    ├── E-Mail ändern                /account/email       F-042
    ├── Passwort                     /account/password    F-042
    └── Konto löschen                /account/delete      F-043

Systemseiten
├── Einladung ungültig               (Zustand von /i/{token})
├── Reise nicht gefunden / kein Zugriff   (Zustand von /trips/{id}, 404-Semantik)
├── Konto gelöscht                   /goodbye
├── 404                              *
└── Offline/Fehler                   (Banner/Zustand, keine Seite)
```

## 4. Routen-Konzept: sprachneutrale App-URLs, Sprachpräfix nur für öffentliche Inhaltsseiten

**Entscheidung:**
- **App- und Einladungsrouten sind sprachneutral** (`/trips/…`, `/i/…`, `/login`, `/account`) mit englischen, technischen Pfadsegmenten. Die Sprache kommt aus dem Konto bzw. – ohne Login – aus Cookie `lang` → `Accept-Language` (Details: [user-flows.md](user-flows.md) Flow F).
- **Öffentliche Inhaltsseiten haben ein Sprachpräfix** (`/de`, `/en`, `/de/datenschutz`, `/en/privacy`) mit `hreflang`-Verweisen.

**Begründung:**
1. **Gemischtsprachige Gruppen (F-046):** Ein Einladungslink wird in *einen* Gruppenchat gepostet und von Deutsch- *und* Englischsprachigen geöffnet. Ein Präfix `/de/i/…` würde allen die Sprache der Organisatorin aufzwingen. Ohne Präfix sieht jede Person die Reise in ihrer Sprache – exakt die Anforderung „Jede Person sieht die Reise in **ihrer** Sprache“.
2. **Kein Sprachwechsel durch Link-Teilen:** Links zwischen Geräten/Personen (Magic-Link, Tab-Links) bleiben gültig, egal welche Sprache eingestellt ist.
3. **SEO nur dort, wo es zählt:** Reiseseiten sind ohnehin `noindex` (F-002). Nur Landing und Rechtstexte werden indexiert – dort sind Präfixe + `hreflang` Standard und sauber.
4. **Rechtstexte:** DE ist verbindlich, EN Übersetzung – getrennte, eindeutig adressierbare URLs sind hier gewünscht.

**Weitere Routen-Regeln:**
- `/` → angemeldet: `/trips`; nicht angemeldet: `/de` oder `/en` (Cookie `lang` → `Accept-Language` → Fallback `en`, `de-*` → `de`).
- `{id}` der Reise ist eine kurze, nicht sprechende ID (z. B. 10 Zeichen). Sie ist **kein** Geheimnis – Zugriff nur für angemeldete Mitglieder. Nichtmitglieder erhalten dieselbe Seite wie bei nicht existierenden Reisen („Reise nicht gefunden oder kein Zugriff“), damit keine Existenz verraten wird.
- `{inviteToken}` ≥ 128 Bit (z. B. 22 Zeichen base64url), für Reise-Einladung und Platzhalter-Einladung (F-007) dieselbe Route – der Server erkennt den Typ.
- Rücksprungadresse: `?next=` nur für relative, interne Pfade (Open-Redirect-Schutz). Im Einladungsflow wird die Rücksprungadresse zusätzlich serverseitig in der Code-/Magic-Link-Anforderung gespeichert (s. Flow A).
- Alle Seiten unter `/trips`, `/i`, `/account`, `/auth`, `/login`: `noindex, nofollow`; `Referrer-Policy: no-referrer` für `/i/…` und `/auth/…`, damit Tokens nicht abfließen.
- Open-Graph-Vorschau von `/i/{token}` (F-002) in der **Sprache der Reise-Anlage** (Sprache des Organisators zum Zeitpunkt der Anlage), da Link-Crawler (WhatsApp etc.) keine Sprachpräferenz senden. Inhalt: Reisename + App-Name, keine Namen/Daten.

## 5. Globale Navigation

| Element | Nicht angemeldet | Angemeldet |
|---|---|---|
| Logo (links) | → Landing | → Meine Reisen |
| Sprachumschalter | **im Header sichtbar** („English“ / „Deutsch“) | im Avatar-Menü + Konto; im Footer |
| Rechts | „Anmelden“ | Avatar (Initialen) → Menü: Meine Reisen · Konto · Sprache · Abmelden |
| Footer | Hilfe · Datenschutz · Impressum · Sprache | identisch (Footer auf Reiseseiten auf Mobil nur am Seitenende, nicht fixiert) |

**In der Reise** (unter dem globalen Header, sticky):
- Zeile 1: „← Meine Reisen“ (Icon-Button mit Text auf Desktop) · Reisename (1 Zeile, gekürzt) · „⋯“ (Reisemenü)
- Zeile 2: Tabs `Übersicht | Meine Tage | Gruppe | Abstimmen` (auf Mobil horizontal scrollbar, falls Texte nicht passen; aktiver Tab immer sichtbar).

**Warum Tabs oben statt Bottom-Navigation:** Auf „Meine Tage“ und „Abstimmen“ braucht es eine fixierte Aktionsleiste unten (Werkzeuge, „Fertig“). Zwei fixierte Leisten unten auf 360 px kosten zu viel Höhe und kollidieren mit der unteren Werkzeugleiste der In-App-Browser (WhatsApp/Instagram auf iOS).

**Reisemenü „⋯“:**

| Eintrag | Orga | Mitglied |
|---|---|---|
| Freunde einladen (→ /invite) | ✔ | ✔ (solange Beitritt offen) |
| Mein Name in dieser Reise | ✔ | ✔ |
| Reise bearbeiten (→ /settings) | ✔ | – |
| Gruppe erinnern (F-015) | ✔ | – |
| Festlegung aufheben (Phase 3) | ✔ | – |
| Reise verlassen | ✔ (erst nach Rollenübergabe) | ✔ |
| Reise löschen | ✔ | – |

## 6. Zuordnung Features → Seiten

| Feature | Seite(n) / Ansicht | Wireframe |
|---|---|---|
| F-001 Reise anlegen | /trips/new, /trips/{id}/settings | [05](wireframes/05-reise-anlegen.md), [12](wireframes/12-reise-einstellungen.md) |
| F-002 Einladungslink & Teilen-Texte | /trips/{id}/invite, Teilen-Sheet | [06](wireframes/06-einladen-teilen.md) |
| F-003 Beitreten im Einladungsflow | /i/{token} | [03](wireframes/03-einladung.md) |
| F-004 Rollen & Verwaltung | Reisemenü, /settings, Übersicht (Mitglieder) | [07](wireframes/07-reise-uebersicht.md), [12](wireframes/12-reise-einstellungen.md) |
| F-005 Verfügbarkeit | /trips/{id}/days | [08](wireframes/08-meine-tage.md), [HTML](wireframes/08-meine-tage.html) |
| F-007 Status & Platzhalter | Übersicht, /invite | [07](wireframes/07-reise-uebersicht.md), [06](wireframes/06-einladen-teilen.md) |
| F-008 Heatmap | /trips/{id}/group?view=calendar | [09](wireframes/09-gruppe-heatmap-vorschlaege.md), [HTML](wireframes/09-gruppe-heatmap.html) |
| F-009 Kandidaten | /trips/{id}/group?view=list | [09](wireframes/09-gruppe-heatmap-vorschlaege.md) |
| F-010 Abstimmung erstellen | /trips/{id}/poll/new | [10](wireframes/10-abstimmung.md) |
| F-011 Abstimmen | /trips/{id}/poll | [10](wireframes/10-abstimmung.md) |
| F-012 Ergebnis | Dialog in /poll, Übersicht Phase 3 | [11](wireframes/11-ergebnis.md) |
| F-013 Verlassen/Löschen | Reisemenü-Dialoge, /settings | [12](wireframes/12-reise-einstellungen.md) |
| F-015 Erinnern | Übersicht, Gruppe-Banner, Reisemenü | [06](wireframes/06-einladen-teilen.md), [07](wireframes/07-reise-uebersicht.md) |
| F-016 Feiertage/Wochenenden | Meine Tage, Gruppe, Vorschläge | [08](wireframes/08-meine-tage.md), [09](wireframes/09-gruppe-heatmap-vorschlaege.md) |
| F-017 Frist | /trips/new (Mehr Optionen), /poll/new, Banner | [05](wireframes/05-reise-anlegen.md), [10](wireframes/10-abstimmung.md) |
| F-040/F-041 Registrierung/Login | /login, eingebettet in /i/{token} und /trips/new | [02](wireframes/02-anmelden.md) |
| F-042 Wiederherstellung, E-Mail | /login/reset, /account/email, /account/password | [02](wireframes/02-anmelden.md), [13](wireframes/13-konto.md) |
| F-043 Konto & Löschen | /account, /account/delete | [13](wireframes/13-konto.md) |
| F-044 Meine Reisen | /trips | [04](wireframes/04-meine-reisen.md) |
| F-046 Sprachen | Header, Footer, Konto, Teilen-Sheet | [13](wireframes/13-konto.md), [ux-spec §9](ux-spec.md) |
| Hilfe (UX-Empfehlung) | /de/hilfe, /en/help | [14](wireframes/14-system-und-fehler.md) |

**Hinweis Hilfe-Seite:** Nicht als Feature in features.md geführt. Empfehlung UX: kleine statische FAQ („Code kommt nicht an“, „Ich habe die Einladung verloren“, „Wie lösche ich meine Daten?“) mit Kontaktadresse – erfüllt WCAG 2.2 SC 3.2.6 „Consistent Help“ und fängt die häufigste Supportfrage (Mail im Spam) ab. Aufwand gering. → Bestätigung durch CEO/PM.
