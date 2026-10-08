# W14 – System- & Fehlerzustände, Hilfe

Features: F-003 (Link ungültig), F-041 (kein Zugriff), F-043 (Konto gelöscht), F-013 · Regeln: [ux-spec §6](../ux-spec.md)

Gemeinsames Muster (mobil, zentriert, Desktop max. 480 px):
```
┌────────────────────────────────────┐
│ [Logo]                  ⊕ English  │
├────────────────────────────────────┤
│      [error.svg | goodbye.svg]     │  dekorativ, alt=""; goodbye nur /goodbye
│ Überschrift (h1)                   │
│ Ein bis zwei Sätze: was ist los,   │
│ was kannst du tun.                 │
│ [ Primäraktion ]                   │
│ Sekundärlink                       │
└────────────────────────────────────┘
```

| Zustand | Überschrift | Text | Primär / Sekundär |
|---|---|---|---|
| Einladungslink ungültig/erneuert/Reise gelöscht | Dieser Link funktioniert nicht mehr | Vielleicht wurde er erneuert. Frag im Gruppenchat nach dem aktuellen Link. | Meine Reisen (angemeldet) bzw. Eigene Reise planen / Startseite |
| Reise nicht gefunden / kein Zugriff (`/trips/{id}`) | Reise nicht gefunden | Entweder gibt es sie nicht mehr oder du bist (noch) kein Mitglied. Für den Beitritt brauchst du den Einladungslink. | Meine Reisen / – |
| Nicht angemeldet auf `/trips/{id}` | → Weiterleitung `/login?next=…` | «Bitte melde dich an – danach geht es direkt weiter.» | – |
| Magic-Link abgelaufen/benutzt | Dieser Anmeldelink ist abgelaufen | Er ist 15 Minuten gültig und funktioniert nur einmal. | Neuen Code anfordern (E-Mail vorbelegt) |
| Konto gelöscht (`/goodbye`) | Dein Konto ist gelöscht | Wir haben dir eine Bestätigung geschickt. Danke, dass du dabei warst. | Zur Startseite |
| 404 | Diese Seite gibt es nicht | Vielleicht ein Tippfehler im Link? | Zur Startseite / Meine Reisen |
| Serverfehler (Seite) | Da ist etwas schiefgelaufen | Deine Daten sind sicher. Bitte lade die Seite neu. | Neu laden / Hilfe |
| Offline | (Banner, keine Seite) | Keine Verbindung. Änderungen werden gespeichert, sobald du wieder online bist. | – |
| Wartungs-/Rate-Limit global | Gerade ist viel los | Bitte versuch es in ein paar Minuten nochmal. | Neu laden |

## Hilfe (`/de/hilfe`, `/en/help`)
→ eigenes Wireframe **[W15](15-hilfe.md)** (MVP-Seite, bestätigt (Auftraggeber 2026-10-08)). Fragenliste (Kurzfassung):
1. Mein Code kommt nicht an. (Spam, Adresse prüfen, neu senden nach 30 s, Absender-Adresse nennen)
2. Ich habe den Einladungslink verloren. (Im Gruppenchat fragen; wer schon Mitglied ist: einfach anmelden → Meine Reisen)
3. Ich habe die Seite in WhatsApp/Instagram geöffnet – geht das? (Ja; Code im selben Fenster eingeben; später im Browser mit E-Mail anmelden)
4. Wie ändere ich meine Tage? / Wie stimme ich ab?
5. Wer sieht meine Angaben? (nur Mitglieder der Reise; keine Termindetails)
6. Wie lösche ich meine Daten? (Reise verlassen / Konto löschen)
7. Kontakt: <Adresse> (→ Operations)
