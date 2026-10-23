# Promo-Video – Aufnahme

Stand: 2026-10-23 · Verantwortlich: Motion Designer · Konzept: [storyboard.md](storyboard.md) · Komposition: [index.html](index.html)

## Kurzfassung
| | |
|---|---|
| Dauer | **28 000 ms** (`window.__promoDuration`) |
| Auflösung | **1080 × 1920** (Bühne 360 × 640 CSS-px; skaliert per CSS `zoom` auf das Fenster) |
| Ziel | MP4, H.264, **30 fps**, `yuv420p`, ohne Ton |
| Sprache | DE Standard, EN mit `?lang=en` |
| Abhängigkeiten | Google Fonts (Figtree, Plus Jakarta Sans); ohne Netz Systemschrift. Bilder per relativem Pfad aus `docs/design/assets/unterkuenfte/` – **Repo-Struktur beibehalten** (Datei direkt per `file://` öffnen oder Repo-Wurzel per HTTP ausliefern) |

## URL-Parameter
| Parameter | Wirkung |
|---|---|
| `?lang=en` | englische Texte („When do we go?“) |
| `?scene=0…7` | Start bei Szene (0 Hook · 1 Tage · 2 Heatmap · 3 Abstimmen · 4 Feier · 5 Swipen · 6 Kosten · 7 Endkarte) |
| `?t=12345` | Start bei Millisekunde |
| `?pause=1` | Standbild (mit `t`/`scene`), z. B. Cover: `?t=16000&pause=1` |
| `?loop=1` | Endlosschleife (Vorschau) |
| `?debug=1` | Zeitanzeige + sichere Ränder (rot: Reels-/TikTok-Kopf, Beschriftung, Aktions-Icons) – **nicht für die Aufnahme** |
| `?scale=3` | feste Skalierung statt „ins Fenster einpassen“ |

Tastatur in der Vorschau: Leertaste Pause/Weiter · ←/→ ±1 s (mit Umschalt ±100 ms) · 0–7 Szene · R neu starten.

## JS-Schnittstelle
- `window.__promoReady === true` – Schriften und Bilder geladen (max. 4 s Wartezeit), Zeitleiste läuft ab jetzt.
- `window.__promoDone === true` – Ende erreicht (t = 28 000 ms; letzter Zustand bleibt stehen).
- `window.__promoRender(ms)` – hält die Wiedergabe an und zeichnet **exakt** den Zustand bei `ms` (rein aus der Zeit berechnet, Konfetti mit festem Seed → jede Aufnahme ist identisch).

## Empfohlen: Einzelbilder + ffmpeg (bildgenau, scharf)
Viewport 360 × 640 mit `deviceScaleFactor: 3` ergibt 1080 × 1920-Screenshots in voller Schärfe. Skizze (Playwright, Node):

```js
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const lang = process.argv[2] || 'de';
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3 });
  const url = 'file://' + path.resolve('docs/motion/promo/index.html') + '?pause=1&t=0&lang=' + lang;
  await page.goto(url);
  await page.waitForFunction(() => window.__promoReady === true);
  const fps = 30, total = Math.round(28000 / 1000 * fps); // 840 Bilder
  for (let f = 0; f <= total; f++) {
    await page.evaluate(ms => window.__promoRender(ms), f * 1000 / fps);
    await page.screenshot({ path: `frames-${lang}/${String(f).padStart(4, '0')}.png` });
  }
  await browser.close();
})();
```
(Ordner `frames-de/` vorher anlegen; Frames gehören nicht ins Repo.)

```bash
ffmpeg -framerate 30 -i frames-de/%04d.png -c:v libx264 -pix_fmt yuv420p -crf 18 -preset slow \
       -movflags +faststart promo-de.mp4
```
Ergebnis: 841 Bilder = 28,03 s. Für Instagram/TikTok genügt `-crf 18`; Datei < 15 MB.

## Alternative: Echtzeit-Aufnahme mit `recordVideo`
Schneller, aber weniger scharf (WebM/VP8) und abhängig von der Rechenleistung (Ruckler möglich):
```js
const context = await browser.newContext({
  viewport: { width: 1080, height: 1920 },
  recordVideo: { dir: 'video/', size: { width: 1080, height: 1920 } } // size MUSS gesetzt sein, sonst 800 px
});
const page = await context.newPage();
await page.goto(url_ohne_pause);           // z. B. …/index.html?lang=de
await page.waitForFunction(() => window.__promoDone === true, null, { timeout: 60000 });
await page.waitForTimeout(300);
await context.close();                      // Video wird beim Schließen geschrieben
```
Die Aufnahme beginnt mit dem Öffnen der Seite, die Zeitleiste erst bei `__promoReady` → Vorlauf abschneiden und in MP4 umwandeln:
```bash
ffmpeg -ss 0.8 -i video/<datei>.webm -t 28 -r 30 -c:v libx264 -pix_fmt yuv420p -crf 18 -movflags +faststart promo-de.mp4
```
(Den Vorlauf `-ss` an der ersten Bewegung der Untertitel ablesen.)

## Prüfliste vor dem Hochladen
- [ ] Schriften geladen (Jakarta mit runden „a“/„g“ – nicht Systemschrift)? Sonst Netz prüfen oder Schriften lokal installieren.
- [ ] Bilder der Unterkünfte sichtbar (Szene 5)? Sonst Pfad/Repo-Struktur prüfen.
- [ ] Mit `?debug=1` einmal durchsehen: keine Texte in roten Zonen.
- [ ] DE und EN getrennt rendern (`promo-de.mp4`, `promo-en.mp4`).
- [ ] Cover-Bild: `?t=16000&pause=1` oder `?t=27000&pause=1` als Screenshot.
- [ ] Musik erst auf der Plattform hinzufügen (siehe storyboard §6).
