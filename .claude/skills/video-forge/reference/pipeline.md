# Pipeline — alle Befehle

Pfade: `ROOT=/home/user/video`, Studio `ROOT/aitrends-2d-studio`, Skill `ROOT/.claude/skills/video-forge` (= `SK`).

## 0. Setup (frischer Container)
```bash
bash $SK/scripts/setup.sh $HOME/kokoro      # sox, kokoro-onnx, npm install, Kokoro-Modell+Stimmen über npm
export CHROMIUM_PATH=/opt/pw-browsers/chromium KOKORO=$HOME/kokoro
```
Prüfen, dass `render.mjs` `process.env.CHROMIUM_PATH` nutzt und `engine/styles.js` die Stile `pale/eden/chronicle` hat (sind im Repo; sonst aus `style.md` einfügen).

## 1. Skript → Stimme
`$ROOT/<name>/narration.txt`: eine Zeile = ein Cue/Untertitel-Satz. `## X` = Abschnitt (Pause 0.4–0.8 s), `!` am Zeilenanfang = große Pause danach. Zahlen ausschreiben ("thirteen-oh-seven", "forty-story").
```bash
cp $SK/templates/voice/build_voice.py $ROOT/<name>/
python3 $ROOT/<name>/build_voice.py $KOKORO/model_q8.onnx $KOKORO/voices.npz am_michael
```
Tempo im Skript: `SPEED` (Short 1.08, Langvideo 1.0), `GAP, BIG, SECTION` (Short 0.22/0.8/0.4, Lang 0.32/1.0/0.8).
Stimme nachträglich ersetzen ohne Neu-Render: `templates/voice/retime_voice_kokoro.py` (hält Cue-Startzeiten, beschleunigt pro Zeile nur wenn nötig), danach nur neu muxen.

## 2. Projekt
```bash
bash $SK/scripts/new_project.sh <name> "<Title>" 9:16 chronicle true    # Short mit Captions
bash $SK/scripts/new_project.sh <name> "<Title>" 16:9 eden false        # Langvideo
```

## 3. Sound-Kit (eigenes pro Video)
`templates/sound/make_sounds_medieval.py` als Basis kopieren, Instrumente/Effekte anpassen (andere Seeds, Tonarten, Instrumente pro Video!):
```bash
python3 make_sounds.py $ST/projects/<name>/input/sfx <dauer+2>
```
Erzeugt Effekte (`bell, drum, gallop, seal, sword, chains, fire, door, crowd, whoosh2, quill, boom`) + `score.wav`. In config: `"music": {"enabled": true, "file": "input/sfx/score.wav", "gainDb": -14}`.
Alternative: Studio-Musik/SFX (`aitrends-2d-studio:video-sound`) — aber Lana will **nicht** die immer gleichen erkennbaren Sounds.

## 4. Shots schreiben
Datei `scenes/shots/01_<name>.js`, Muster: `examples/shots/friday13_short.js` (9:16, 3D+2D), `serpent_00_worlds3d.js` (Luftbilder), `lifespan_01_hook.js` (Hook mit Karten).
```js
S('004', {"cue": 4, "dt": 0.0, "bars": "none", "in": "dip", "sfx": [["input/sfx/bell.wav", 0.2, -8]], "scene": "…"}, {
  kind: '3d',
  init(T) { const st = A.stage(T, {...}); /* Welt + scatter(...) */ return { stage: A.finish(T, st), p: A.livePerson(st, 2.6, 'templar') }; },
  draw(s, t, info, T) { s.p.update(t, { pose: walkPose(t*10), facing: 1, expr: 'angry' }); T.dolly(s.stage.camera, t, [[0, {pos, look, fov}], [info.dur, {...}]]); },
  overlay: (g, t) => big(g, t, 'TITEL', E.H * 0.15),
});
S('005', {...}, (g, t, info) => { /* reines 2D */ });
```
- Meta = **striktes JSON**. `cue` default = int(id[:3]); `dt` = Sek. nach Cue-Start; `in`: cut|dip|fade; sfx `[pfad, at, gainDb, (pitch)]`; `amb [name, gain]`.
- Shot-Wechsel ca. alle 1.5–3 s (Short) bzw. 2–5 s (Lang). Zusätzliche Shots innerhalb eines Cues mit Suffix (`008b`, `dt`).
```bash
cd $ST/projects/<name> && python3 make_shots.py     # zeigt Anzahl/median/kurze Shots
```

## 5. QC vor dem Render (Pflicht)
```bash
cd $ST && node render.mjs --project projects/<name> --sheet --scale 0.5             # Contact-Sheet aller Shots
node render.mjs --project projects/<name> --stills 1.5,9,18,35 --scale 0.5         # gezielte Zeitpunkte
```
`build/sheets/*.png` bzw. `build/stills/sheet_01.png` mit Read ansehen. Checkliste in `style.md` durchgehen (Dichte! Labels frei! Figuren sichtbar!). Lana die Sheet-Vorschau zeigen, bevor man 20+ Minuten rendert, wenn größere Änderungen.

## 6. Render + Mix (Hintergrund)
```bash
cd $ST && node render.mjs --project projects/<name> --workers 4 --format jpeg > render.log 2>&1 && python3 audio/mix.py --project projects/<name>
```
Short 63 s ≈ 24 min, Langvideo 6 min ≈ 1 h. Ergebnis `projects/<name>/out/<Title>.mp4`.

## 7. Auslieferung
```bash
ffprobe -v error -show_entries format=duration:stream=codec_type,width,height -of compact OUT.mp4
ffmpeg -v error -i OUT.mp4 -vf "select='eq(n\,300)+eq(n\,1100)+eq(n\,1500)',scale=270:-1,tile=3x1" -frames:v 1 qc.png
cp OUT.mp4 $ROOT/out/<Sprechender_Name>.mp4
```
Dann SendUserFile (display render), Metadaten anbieten, Upgrade-Schritt, commit + push.
