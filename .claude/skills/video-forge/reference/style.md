# Stil-Regeln

## Grundlook
- **Standard-Stil `vivid`** (hell, satt, clean, neutrales Tonemapping, Belichtung 1.3, keine Vignette/Korn/Papier). Düstere Stile (`chronicle`, `pale`) nur auf ausdrücklichen Wunsch.
- Himmel: `SKY.stage` mit den hellen Presets (sunset = pink/orange/gold leuchtend). Gras: sattes Grün, weiche Büschel.
- **Figuren immer 2D** (toonFigure: Outline, großer Kopf, Ausdrücke). In 3D-Szenen als Billboard (`A.livePerson` animiert, `A.addPeople` statisch).
- **Umgebung gemalt-3D**: `W.paintify` (Lambert, flache Schatten), Outline-Hüllen, Canvas-Texturen (Gras, Feld, Stein, Putz, Fachwerk, Dachziegel, Fliesen, Wasser). Kein Low-Poly-, kein Plastik-Look.
- **2D/3D-Mix**: Wolken, Bäume, Büsche, Gras, Props, Rauch, Vögel = gezeichnete Sprites mit Rand (wirken 3D, kosten nichts).
- Farbe pro Kanal: Horror/What If → `pale` (weiße Figuren, kalt). Bibel → `eden` (gelb, warm golden). Mittelalter/Geschichte → `chronicle` (gelb, Fackellicht, dunkle Schatten). Römer → neuer Stil (z. B. `imperial`: Marmor, Purpur, Gold) — dann hier eintragen.

## Dichte-Budget (pro 3D-Welt, MINDESTENS)
| Szene | Mindestens |
|---|---|
| Stadt/Luftbild | 150+ Häuser, 500+ Gras-Büschel, 80+ Bäume, Stände/Fässer/Kisten/Karren je 20–70, Tiere, Rauch aus Kaminen, Vögel, Boote am Fluss, 60–90 Menschen |
| Halle/Innenraum | Banner, Wandschilde + Schwerter, Regale mit Büchern, Rüstungen, **jeder Tisch gedeckt** (Kerzen, Becher, Brot, Obst, Schriftrollen), Kronleuchter mit Punktlicht, Kisten/Fässer in Ecken |
| Kerker | Stroh, Eimer, Ratten, Gitter, Ketten, Fackeln |
| Land | Felder mit Textur, Wege, Burgen am Horizont, 300 Bäume, 600 Gras, Blumenbeete, Büsche, Steine, Pferde, Karren, Vögel |
| Platz/Menge | Marktstände, Laternen, 2 Häuserreihen, 50+ Menschen in 2 Tiefenstaffeln |
Faustregel: wenn man im Still leere Flächen > 20 % des Bildes sieht → mehr `scatter`.

## Kamera & Schnitt (Regel seit Olga-Short)
- **Sequenzen statt Einzel-Shots**: 1 Shot = 2–4 Cues, Short ≈ 10–12 Shots. Ereignisse/Texte im Shot per `rel(c0, c)` (Cue-Zeit relativ zum Shot-Start). Muster: `examples/shots/olga_sequences.js`.
- Kamera folgt der Hauptfigur (`L.glide` mit Keys an den Cue-Zeiten); große Flüge nur für Hook, Reveal, Finale.
- Jede Außenszene: `SKY.stage(T, 'sunset'|'golden'|...)` — Sonne möglichst im Bild (az so wählen, dass sie hinter dem Motiv steht).
- Jede 3D-Szene: `life.tick` — nichts steht still.
- Kamera nie in Hügeln/Zelten: Kamerapfad frei halten (skip-Zonen für scatter/siegeCamp).
- Jede Einstellung bewegt sich (`T.dolly` Start→Ende, leichter Push-in oder Drift). Short: Schnitt alle 1.5–3 s.
- Erstes Bild = spektakulärstes Motiv (Hook). Letztes Bild = Loop-fähig zurück zum Anfang (Short).
- 2D-Close-ups (`closeUp`) für Emotionen und Dokumente (Schuldschein, versiegelter Brief, Kalender) zwischen 3D-Totalen.

## Text
- Titel-Label `big()` im oberen Drittel (y ≈ 0.13–0.2·H), Gelb `#ffd47e` / Creme `#fff2c8`, dicker Stroke.
- 9:16: Captions mittig unten (config `captions: true`), keine Labels in diesen Bereich legen; nichts über Labels (Rauch, Partikel).

## Sound
- Eigenes Kit pro Video, passend zur Epoche (Mittelalter: Glocken, Kriegstrommeln, Mönchschor-Drone, Orgel; Horror: Drones, Herzschlag, Ticken; Bibel: Chor, Harfe, Wind, Donner). Nicht die Studio-Standard-Whooshes.
- Musik −14 dB unter Stimme, Mix −14 LUFS.

## QC-Checkliste vor dem Render
- [ ] Dichte-Budget erfüllt in jeder 3D-Welt
- [ ] Figuren erkennbar, nicht verdeckt, Gesichter zur Kamera
- [ ] Labels/Captions frei und lesbar
- [ ] keine kurzen Shots < 0.5 s (make_shots warnt)
- [ ] Hook-Bild in den ersten 1 s
- [ ] keine Fehler in der Render-Ausgabe (`grep -i error`)

## Stil-Definitionen (engine/styles.js, falls sie fehlen)
```js
  pale: {
    name: 'Pale Horror', desc: 'White stick figures with dark features, cold midnight grade, ink-black living shadows.',
    ink: '#eeeaf2', inkFar: '#b4aec2', feature: '#120e18', rimWidth: 4, ui: { ...UI, accent: '#ff4a4a', gold: '#ffd47e' },
    grade: { contrast: 1.08, sat: 0.85, lift: [0.0, 0.01, 0.05], gamma: [0.95, 0.98, 1.06], gain: [0.95, 0.97, 1.08], vignette: 0.7, grain: 0.065, bloom: 0.6 },
    moods: { dusk: { sky: ['#1c1838', '#4a3060', '#a0485a', '#e8885a'] } },
  },
  eden: {
    name: 'Golden Scripture', desc: 'Yellow stick figures with dark features, warm golden grade, rich 3D landscapes.',
    ink: '#f2c21a', inkFar: '#c4920c', feature: '#1a1206', rimWidth: 4, ui: { ...UI, gold: '#ffd47e', accent: '#ff5a3a', cream: '#fff1dc' },
    grade: { contrast: 1.05, sat: 1.08, lift: [0.02, 0.012, 0.0], gamma: [1.02, 1.0, 0.97], gain: [1.05, 1.0, 0.92], vignette: 0.5, grain: 0.045, bloom: 0.65 },
    moods: { night: { sky: ['#0b1028', '#1d2550', '#3a3570'], rim: '#ffe2a8' } },
  },
  chronicle: {
    name: 'Dark Chronicle', desc: 'Medieval storybook: warm torchlight, deep shadows, rich contrast.',
    ink: '#f2c21a', inkFar: '#c4920c', feature: '#1a1206', rimWidth: 4, ui: { ...UI, gold: '#ffd47e', accent: '#e0302a', cream: '#fff1dc' },
    grade: { contrast: 1.12, sat: 1.05, lift: [0.015, 0.008, 0.02], gamma: [1.0, 0.97, 0.95], gain: [1.06, 0.98, 0.9], vignette: 0.75, grain: 0.05, bloom: 0.7 },
    moods: {},
  },
```
