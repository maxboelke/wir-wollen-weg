# Promo-Video – Aufnahme

Stand: 2026-10-23 (v2 – drei Stile) · Verantwortlich: Motion Designer · Konzept: [storyboard.md](storyboard.md) §9

## Versionen
| Stil | Datei | Dauer (`__promoDuration`) | Bilder bei 30 fps | Szenen (`?scene=`) |
|---|---|---|---|---|
| **A „Clean Product“** – hell, ruhig, Handy im Mittelpunkt | [a-clean/index.html](a-clean/index.html) | **28 000 ms** | 841 | 0 Hook · 1 Tage · 2 Kalender · 3 Abstimmen · 4 Feier · 5 Unterkunft · 6 Kosten · 7 Verrechnen · 8 Endkarte |
| **B „Kinetic Type“** – Farbflächen, Takt-Schnitte, Zooms | [b-kinetic/index.html](b-kinetic/index.html) | **29 000 ms** | 871 | 0 Hook · 1 Schritt 1 · 2 Tage · 3 Kalender · 4 Abstimmen · 5 Feier · 6 Schritt 2 · 7 Unterkunft · 8 Schritt 3 · 9 Kosten · 10 Schritt 4 · 11 Verrechnen · 12 Endkarte |
| **C „Reise-Abenteuer“** – Kartenpapier, Route, Sticker | [c-abenteuer/index.html](c-abenteuer/index.html) | **30 000 ms** | 901 | 0 Hook · 1 Tage · 2 Kalender · 3 Abstimmen · 4 Feier · 5 Unterkunft · 6 Kosten · 7 Verrechnen · 8 Endkarte |
| ~~v1~~ | [index.html](index.html) | 28 000 ms | – | **überholt** (alte Texte „malt“, „bezahlt“, „ausgeglichen“) – nicht mehr aufnehmen |

Gemeinsame Teile: [`shared/promo-core.js`](shared/promo-core.js) (Easing, Konfetti, Abspieler, API), [`shared/promo-screens.js`](shared/promo-screens.js) (Screens + Texte DE/EN), [`shared/promo-screens.css`](shared/promo-screens.css). **Texte und Beträge der Screens nur dort ändern** – alle drei Stile ziehen sie von dort.

| | |
|---|---|
| Auflösung | **1080 × 1920** (Bühne 360 × 640 CSS-px; skaliert per CSS `zoom` auf das Fenster) |
| Ziel | MP4, H.264, **30 fps**, `yuv420p`, ohne Ton |
| Sprache | DE Standard, EN mit `?lang=en` |
| Abhängigkeiten | Google Fonts (Figtree, Plus Jakarta Sans); ohne Netz Systemschrift. Bilder per relativem Pfad aus `docs/design/assets/unterkuenfte/` und (Stil C) `docs/design/assets/illustrations/` – **Repo-Struktur beibehalten** (Datei per `file://` öffnen oder Repo-Wurzel per HTTP ausliefern) |

## URL-Parameter (alle drei Stile)
| Parameter | Wirkung |
|---|---|
| `?lang=en` | englische Texte („When do we go?“) |
| `?scene=n` | Start bei Szene n (Tabelle oben) |
| `?t=12345` | Start bei Millisekunde |
| `?pause=1` | Standbild (mit `t`/`scene`) |
| `?loop=1` | Endlosschleife (Vorschau) |
| `?debug=1` | Zeitanzeige + sichere Ränder (rot: Reels-/TikTok-Kopf, Beschriftung, Aktions-Icons) – **nicht für die Aufnahme** |
| `?scale=3` | feste Skalierung statt „ins Fenster einpassen“ |

Tastatur in der Vorschau: Leertaste Pause/Weiter · ←/→ ±1 s (mit Umschalt ±100 ms) · 0–9 Szene · R neu starten.

## JS-Schnittstelle (unverändert zu v1)
- `window.__promoReady === true` – Schriften und Bilder geladen (max. 4 s Wartezeit), Zeitleiste läuft ab jetzt.
- `window.__promoDone === true` – Ende erreicht (letzter Zustand bleibt stehen).
- `window.__promoDuration` – Länge in ms (A 28 000 · B 29 000 · C 30 000).
- `window.__promoRender(ms)` – hält die Wiedergabe an und zeichnet **exakt** den Zustand bei `ms` (rein aus der Zeit berechnet, Konfetti mit festem Seed → jede Aufnahme ist identisch, auch rückwärts/springend).

## Empfohlen: Einzelbilder + ffmpeg (bildgenau, scharf)
Viewport 360 × 640 mit `deviceScaleFactor: 3` ergibt 1080 × 1920-Screenshots in voller Schärfe. Skizze (Playwright, Node), Aufruf `node record.js a-clean de`:

```js
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
(async () => {
  const style = process.argv[2] || 'a-clean';   // a-clean | b-kinetic | c-abenteuer
  const lang = process.argv[3] || 'de';
  const out = `frames-${style}-${lang}`;
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, colorScheme: 'light' });
  const url = 'file://' + path.resolve(`docs/motion/promo/${style}/index.html`) + '?pause=1&t=0&lang=' + lang;
  await page.goto(url);
  await page.waitForFunction(() => window.__promoReady === true);
  const dur = await page.evaluate(() => window.__promoDuration);
  const fps = 30, total = Math.round(dur / 1000 * fps);
  for (let f = 0; f <= total; f++) {
    await page.evaluate(ms => window.__promoRender(ms), f * 1000 / fps);
    await page.screenshot({ path: `${out}/${String(f).padStart(4, '0')}.png` });
  }
  await browser.close();
})();
```
(Frames gehören nicht ins Repo. `colorScheme: 'light'`, damit die Sticker-Illustrationen in Stil C ihre helle Variante zeigen.)

```bash
ffmpeg -framerate 30 -i frames-a-clean-de/%04d.png -c:v libx264 -pix_fmt yuv420p -crf 18 -preset slow \
       -movflags +faststart promo-a-de.mp4
```
Dateinamen-Vorschlag: `promo-a-de.mp4`, `promo-a-en.mp4`, `promo-b-de.mp4` … (6 Dateien).

## Alternative: Echtzeit-Aufnahme mit `recordVideo`
Wie v1 (weniger scharf, abhängig von der Rechenleistung): Kontext mit `viewport` und `recordVideo.size` 1080 × 1920, Seite **ohne** `pause` öffnen, auf `__promoDone` warten (Timeout 60 s), Kontext schließen; Vorlauf bis `__promoReady` mit `ffmpeg -ss … -t <Dauer>` abschneiden (`-t 28` / `29` / `30`).

## Prüfliste vor dem Hochladen
- [ ] Schriften geladen (Jakarta mit runden „a“/„g“ – nicht Systemschrift)?
- [ ] Bilder der Unterkünfte (alle Stile) und Sticker (Stil C) sichtbar? Sonst Pfad/Repo-Struktur prüfen.
- [ ] Mit `?debug=1` einmal durchsehen: Untertitel nicht in roten Zonen.
- [ ] **Lesbarkeit (Feedback 5):** je Szene ein Standbild in der Mitte der Szene (`?scene=n&pause=1`, dann ~1,5 s vor) – Texte voll deckend, nichts halb eingeblendet.
- [ ] DE und EN getrennt rendern.
- [ ] Cover-Bild: A `?t=12900&pause=1` · B `?t=13600&pause=1` · C `?t=13200&pause=1` (Konfetti + Ring) oder die Endkarte (A `?t=27500` · B `?t=28500` · C `?t=29500`).
- [ ] Musik erst auf der Plattform hinzufügen (storyboard §6). Akzente: Konfetti A 12,55 s · B 13,25 s · C 12,85 s; Logo A 24,9 s · B 26,3 s · C 27,25 s.
