---
name: video-forge
description: Lanas eigene Video-Fabrik für faceless YouTube-Videos und Shorts (Bibel-Mythen, What If, Geschichte/Mittelalter, Horror-Storys). Benutzen, wenn ein neues Video oder Short gebaut, gerendert, vertont, mit Titel/Beschreibung/Tags/Thumbnail versehen oder eine Video-Idee recherchiert werden soll ("mach ein Video über…", "1 min Short über…", "Titel und Beschreibung für…", "neue Ideen für meinen Bibel-Kanal"). Enthält Workflow, Stil-Regeln, alle wiederverwendbaren 3D/2D-Vorlagen, Stimme (Kokoro), Sound-Synthese, Recherche und ein Lern-Logbuch, das nach JEDEM Video erweitert wird.
---

# Video Forge

Baut auf dem **aiTrends 2D Studio** auf (`/home/user/video/aitrends-2d-studio`, Plugin-Skills `aitrends-2d-studio:*`). Dieser Skill ist die Schicht darüber: Lanas Stil, die eigenen Vorlagen und alles, was bei bisherigen Videos gelernt wurde.

**Pflicht bei jedem Einsatz:**
1. Zuerst `LEARNINGS.md` lesen (Regeln + Fehler, die nicht wieder passieren dürfen).
2. Am Ende den **Upgrade-Schritt** ausführen (unten). Der Skill soll mit jedem Video besser werden.

## Dateien
| Pfad | Inhalt |
|---|---|
| `LEARNINGS.md` | Nutzer-Vorlieben, harte Regeln, Fehler+Fixes, Changelog. **Immer lesen, immer ergänzen.** |
| `reference/pipeline.md` | Alle Befehle Schritt für Schritt (Setup, Stimme, Projekt, Shots, Stills, Render, Mix). |
| `reference/style.md` | Look-Regeln: 2D-Figuren in detaillierten gemalten 3D-Welten, Dichte-Budget, Kamera, Text, Sound. |
| `reference/library.md` | Katalog aller Vorlagen-Funktionen (Welten, Gebäude, Props, Figuren, Karten, Texturen). |
| `reference/metadata.md` | Titel/Beschreibung/Tags/Thumbnail-Formel + echte Beispiele. |
| `reference/research.md` | Viral-Strategie, Nischen, Konkurrenz-Analyse (Bible Animations etc.). |
| `reference/ideas.md` | Ideen-Backlog (Bibel-Mythen, Shorts-Geschichten) mit Status. |
| `templates/scenes/` | Neueste Version aller Szenen-Bibliotheken → in jedes neue Projekt kopieren. |
| `templates/horror/` | Horror-Variante (lebende Schatten, HERO/EMMA, Horror-Sets) — nur bei Stil `pale`. |
| `templates/shots_starter.js` | Start-Shotdatei (Imports, `big()`, Welt-Gerüst, Hook-Shot) — wird automatisch als `scenes/shots/01_main.js` angelegt. |
| `templates/voice/`, `templates/sound/`, `templates/make_shots.py` | Stimme, Sound-Kit, Shot-Timing. |
| `examples/shots/`, `examples/narration_*.txt` | Fertige Shot-Dateien und Skripte bisheriger Videos als Muster. |
| `scripts/setup.sh`, `scripts/new_project.sh` | Umgebung einrichten (Kokoro, Chromium) und Projekt anlegen. |

## Workflow (Kurzfassung — Details in `reference/pipeline.md`)
1. **Idee & Titel**: aus `ideas.md` oder Recherche (WebSearch). Prüfen, ob es das Video schon gibt; Titel nah an bekannten Suchtiteln + eigener Twist.
2. **Skript** schreiben → `<name>/narration.txt` (eine Zeile = ein Cue; `## ABSCHNITT`, `!` = lange Pause danach). Hook in Satz 1 (Frage/Behauptung), offene Schleife, Wow-Ende. Short ≈ 140–160 Wörter für ~60 s; Langvideo ≈ 150 Wörter/Minute.
3. **Stimme**: Kokoro `am_michael` (Standard, Serpent-Stimme); `bm_george` ist TABU (siehe LEARNINGS) → `voice.wav` + `script.json`.
4. **Projekt** anlegen (`scripts/new_project.sh`), Stil wählen/anlegen, Vorlagen kopieren.
5. **Sound**: eigenes Sound-Kit pro Video synthetisieren (nicht immer die gleichen Standard-Sounds!).
6. **Shots** bauen in `scenes/shots/*.js` mit `S('NNN', {meta}, …)`. Erst Stills/Contact-Sheet prüfen und selbst kritisch ansehen → nachbessern → **erst dann** voll rendern.
7. **Render** (`--workers 4 --format jpeg`) im Hintergrund, dann `audio/mix.py`.
8. **QC**: ffprobe + 3 Frames ansehen, nach `/home/user/video/out/` kopieren, mit SendUserFile schicken.
9. **Metadaten** (Titel-Varianten, Beschreibung mit Kapiteln, Tags, Thumbnail-Idee) nach `reference/metadata.md` anbieten.
10. Commit + Push (Branch der Session).

## Upgrade-Schritt (nach jedem Video, Pflicht)
1. `LEARNINGS.md`: neue Nutzer-Feedbacks (wörtlich kurz), neue Fehler+Fix, neue Regeln eintragen; Changelog-Zeile mit Datum + Video.
2. Neue oder verbesserte Bibliotheks-Funktionen aus dem Projekt zurück nach `templates/scenes/` kopieren (nur Obermengen — nie Funktionen verlieren) und in `reference/library.md` eintragen.
3. Die beste Shot-Datei des Videos nach `examples/shots/` kopieren, Skript nach `examples/`.
4. `ideas.md`: Status aktualisieren, neue Ideen ergänzen. Neue Recherche → `research.md`.
5. `python3 scripts/gen_library.py` ausführen (Katalog aktualisieren).
6. Wenn ein Ablauf wiederholt Handarbeit war → als Skript in `scripts/` oder `templates/` automatisieren.
7. Mitcommiten.
