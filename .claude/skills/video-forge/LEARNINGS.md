# Learnings — wird nach jedem Video erweitert

## Nutzerin & Kanäle
- Lana (Deutsch, schreibt schnell/mit Tippfehlern — Sinn erschließen, nicht nachfragen, wenn klar). Antworten auf Deutsch, Videos auf Englisch.
- Kanäle: **What If** (Strichfiguren), **Römische Geschichte** ("What Romans actually got paid"), **Bibel** (Mythen aufklären/widerlegen, geheimnisvoll, kontroverse Titel), dazu **1-min Shorts** (Gefängnisausbrüche, Verrat, Mittelalter-Strategien).
- Ihr eigener PC braucht ~3 h für ein 2D-Video; hier im Chat gehen 4 Worker + JPEG deutlich schneller.

## Stil-Vorlieben (wörtliches Feedback → Regel)
- "die figuren sollen weiss sein" (Horror/What If) → Stil `pale`. Bibel/Geschichte → **gelbe** Figuren (`eden`, `chronicle`).
- RicksClips-Screenshots: "alles genau in dem style du siehst weniger 3d dafür krass detailliert und die figuren immer 2d" → **Figuren immer 2D**, Umgebung gemalt-3D (Lambert + Outlines + Canvas-Texturen), nie Low-Poly-Look.
- "wolken sind 2d aber so gezeichnet dass sie wegen den rändern 3d aussehen … schlaue mischung" → Wolken, Bäume, Büsche, Gras, Props, Menschen als **2D-Billboards** in der 3D-Szene.
- "nicht an den details sparen, ich kann die selben scenen später noch brauchen" → Welten als wiederverwendbare Funktionen bauen, in `templates/` zurückführen.
- "befor du renderst 3 mal so viele details … gras, bäume, sachen auf den tischen" → **Dichte-Budget** in `reference/style.md` ist Pflicht, BEVOR Stills gezeigt/gerendert werden. Tische nie leer, Böden nie kahl.
- "verwende andere sounds anstelle deiner typischen wiedererkennbaren sounds" → pro Video eigenes synthetisiertes Sound-Kit + eigene Musik (`templates/sound/`).
- **"mehr sonnenuntergänge, strahlender himmel (kann auch 2d sein)"** → jede Außenszene bekommt einen gemalten 2D-Himmel (`sky.js`: Sonne mit Strahlen, beleuchtete Wolken, Abendrot). Tageslicht-Blau ohne Stimmung = Fehler.
- **"menschen sollen sich bewegen, wind weht, bäume wackeln, vögel fliegen … beim letzten video war das null"** → `life.js`: JEDE 3D-Szene lebt (Bäume/Gras/Büsche wiegen, Wolken ziehen, Rauch steigt, Vögel fliegen, Wasser glitzert, Fahnen wehen, Menschen atmen/gehen/gestikulieren). Kein Standbild-3D mehr.
- **"zu viele kameraflüge … kamera folgt hauptfiguren, weniger schnitte, wie ein ganzes flüssiges video"** → Sequenzen statt Einzel-Shots: 1 Shot deckt 2–4 Cues ab (Short ≈ 10–12 Shots/min statt 25), Kamera folgt der Hauptfigur (Tracking), Flüge nur für Hook/Reveal/Finale. Texte/Ereignisse innerhalb des Shots per Cue-Zeit (`at(cue)`).
- **Iskorosten-Hügel "stimmt nicht"** (braune Scheibe mit Stein-Textur) → Hügel/Felsen natürlich bauen: Gras-Hügel + 3D-Findlinge/Felsklippen, keine gestreckte Textur-Kuppel.
- **Erzählstil (Skript):** "kein meet chris, kein his dream — besser erzählt" → wie ein Freund, der eine Geschichte erzählt: "See, Chris is a broke computer science student who wants to study in Japan. But he's broke as hell. One day, a burger contest caught his attention…" Fließende Sätze mit Verbindungswörtern (See, But, So, And, Because, Then). KEINE Steckbrief-/Schlagwort-Sätze ("Meet X.", "His dream: …", "His bank account: …").
- **LOOK-REGEL: "zu düster — helle, satte Farben, cleanes Aussehen, Gras wie aus alten Computerspielen, ich will moderne satte Farben, leuchtende Sonnenuntergänge"** → Stil `vivid` (kaum Vignette, kein Korn/Papier, hohe Sättigung, helle Belichtung), helles sattes Gras ohne Pixel-Rauschen, Gras-Büschel als weiche runde Blattformen (kein Strich-Gras), Himmel-Presets leuchtend (Pink/Orange/Gold statt Lila-Dunkel). Düstere Grade nur, wenn ausdrücklich gewünscht.
- **Übergänge wie im Olga-Video beibehalten** ("die cleanen übergänge wie im olga video sollen bleiben"): Sequenzen mit L.glide-Kamera, weiche dip/fade-Übergänge zwischen Orten, sonst durchgehende Kamerafahrt — gilt auch mit dem neuen hellen `vivid`-Look.
- **SKRIPT-MUSTER (von Lana als perfekt bestätigt, Burger-Short):**
  1. HOOK: 1–2 Sätze, direkt die krasse Behauptung, nichts davor ("This guy took $150,000 from a fast food giant… and it was completely legal.").
  2. Dann sofort "See, <Name> is a … who wants to …. But …" — erzählt wie ein Freund, Verbindungswörter (See / But / One day / Instead / So / And / After …).
  3. Keine unnötigen Details (keine Kontostände, kein "days passed, nothing", keine Uhrzeiten, kein Technik-Gelaber) — nur was die Geschichte vorantreibt.
  4. Auflösung (wie es funktioniert hat) erst am Ende, dann Ergebnis + ein starker Schlusssatz.
  Beispiel: `examples/narration_burger.txt`.
- **Vorschau NUR als Standbilder** (Contact-Sheet + Einzelbilder). NIEMALS ein Low-Res-Vorschauvideo schicken ("ich will nie das low video sehen").
- **Skript zuerst zeigen:** Vor Stimme/Szenen das komplette Skript im Chat schicken und auf OK warten.
- Hook muss "krass" sein: Satz 1 = Frage oder schockierende Behauptung, erstes Bild sofort spektakulär.
- **Stimmen-Regel:** "die stimme des ersten shorts ist tabu" → `bm_george` (Friday-13-Short) NIE mehr verwenden. Lieblingsstimme: `am_michael` (Serpent-Video, "nimm die stimme aus dem schlangen bibel video") → Standard für neue Videos. Verfügbar: am_eric, am_echo, am_fenrir, am_adam, am_puck, am_liam, am_onyx, am_santa, bm_daniel, bm_lewis, bm_fable. Benutzte Stimme im Changelog notieren.
- Stimme: Kokoro ("etwas mit k") statt RHVoice. Ersetzen ohne Neu-Render geht mit `retime_voice_kokoro.py` (hält Cue-Startzeiten).

## Harte technische Regeln
- 3D-Shot `init(T)` muss `{ stage: st, ... }` zurückgeben (nicht `{ st }`).
- Meta in `S('NNN', {...})` muss **strikt JSON** sein (make_shots.py parst es): keine Funktionsaufrufe wie `SX('bell')`, sondern `"input/sfx/bell.wav"`.
- Chromium: `CHROMIUM_PATH=/opt/pw-browsers/chromium` setzen; nie `playwright install`.
- Prozesse beenden mit `ps -eo pid,comm` + `kill`; **kein `pkill -f`** mit Mustern, die die eigene Shell treffen.
- `fftconvolve` in Sound-Synthese → Länge auffüllen (siehe `verb()` in make_sounds).
- Smoke-/Partikel-Sprites nie über Titel-Labels platzieren (oberes Bilddrittel in 9:16 freihalten). Labels nicht unter Letterbox-Balken.
- Kamera: in three-kit ist y nach oben; Tiefe von 2D-Sprite-Ebenen mit 3D-Objekten abgleichen (Bäume standen sonst vor/hinter falschen Dingen).
- Kurze Lambdas für Positionen: kein `reduce`-Trick, explizit `{ const c = …; return [x, y, z]; }`.
- Netzwerk: HuggingFace, GitHub-Releases, youtube.com, edge-tts, outlierkit **blockiert**. npm + PyPI gehen → Modelle über npm-Pakete holen (siehe pipeline.md). WebSearch geht.
- Das Studio importiert **jede** `scenes/*.js`-Datei eines Projekts → keine fremden/unpassenden Libs ins Projekt kopieren (Import-Fehler bricht alles). Horror-Vorlagen liegen deshalb separat in `templates/horror/`.
- `out/` und `*.mp4` sind gitignored → Videos liegen nur im Container; Nutzerin per SendUserFile schicken.

## Fehler-Historie (kurz)
| Problem | Fix |
|---|---|
| edge-tts/HF blockiert | RHVoice → später Kokoro über npm (`kokoro-q8-shards`, `kokoro-js` voices) |
| Erster Serpent-3D wirkte Low-Poly | Bibliothek neu gebaut: paintify (Lambert), Outline-Hüllen, Canvas-Texturen, 2D-Billboards |
| Friday-13 zu leer | `props.js` (33 Prop-Typen) + `scatter`/`wallProp`; ~700 Gras, Stände, Tische gedeckt |
| Rauch verdeckt "JACQUES DE MOLAY" | Rauch hinter Häuser seitlich verschoben |
| rig2d worried/angry Brauen vertauscht | Vorzeichen getauscht in engine/rig2d.js |

## Changelog
- 2026-11 · My Shadow Started Living Its Own Life (6:38, 16:9, `pale`, 261 Shots) — erste Pipeline, RHVoice → Kokoro-Ersatz.
- 2026-11 · The Serpent in Eden WASN'T a Snake (16:9, `eden`) — toon.js, ill.js, aerial.js, world3d.js, creatures.js entstanden.
- 2026-11 · Did People in the Bible Really Live 900 Years (16:9, `eden`) — Mesopotamien, Arche, Ararat, lifeChart, clayTablet, calendar.
- 2026-11 · Friday the 13th (1307) Short (63 s, 9:16, `chronicle`, Captions) — props.js, timberHouse, cathedral, templeKeep, livePerson, liveFire, eigenes Mittelalter-Sound-Kit.
- 2026-11 · Skill `video-forge` angelegt.
