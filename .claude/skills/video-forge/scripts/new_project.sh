#!/usr/bin/env bash
# Legt ein Studio-Projekt aus einem fertigen Voice-Ordner an und kopiert die neuesten Vorlagen hinein.
# usage: bash new_project.sh NAME "Title" ASPECT(16:9|9:16) STYLE(pale|eden|chronicle|…) [captions:true|false]
# erwartet /home/user/video/NAME/{voice.wav,script.json}  (aus templates/voice/build_voice.py)
set -e
NAME=$1; TITLE=$2; ASPECT=${3:-16:9}; STYLE=${4:-eden}; CAP=${5:-false}
SK=$(cd "$(dirname "$0")/.." && pwd); ROOT=$(cd "$SK/../../.." && pwd); ST=$ROOT/aitrends-2d-studio; P=$ST/projects/$NAME
cd "$ST"
python3 tools/new_project.py --name "$NAME" --voice "$ROOT/$NAME/voice.wav" --aspect "$ASPECT" --resolution 1080p --title "$TITLE" | tail -1
cp "$ROOT/$NAME/voice.wav" "$P/input/voiceover.wav"; cp "$ROOT/$NAME/script.json" "$P/input/script.json"
mkdir -p "$P/scenes/sets" "$P/scenes/shots" "$P/input/sfx"
cp "$SK"/templates/scenes/*.js "$P/scenes/"; cp "$SK"/templates/scenes/sets/*.js "$P/scenes/sets/"
# Horror (Stil pale): lib.js + cast.js mit HERO/EMMA/PASSER und Horror-Sets (gleiche S()/Kamera-API)
[ "$STYLE" = pale ] && cp "$SK/templates/horror/lib.js" "$SK/templates/horror/cast.js" "$P/scenes/" && cp "$SK/templates/horror/sets/sets.js" "$P/scenes/sets/"; cp "$SK/templates/make_shots.py" "$P/"; [ -e "$P/scenes/shots/01_main.js" ] || sed "s/<TITLE>/$TITLE/" "$SK/templates/shots_starter.js" > "$P/scenes/shots/01_main.js"
python3 - "$P" "$STYLE" "$CAP" <<'PY'
import json, subprocess, sys
p, style, cap = sys.argv[1:]; c = json.load(open(p + '/config.json'))
c.update(style=style, voiceover='input/voiceover.wav', captions=cap == 'true', duration=float(subprocess.check_output(['soxi', '-D', p + '/input/voiceover.wav']).decode()))
json.dump(c, open(p + '/config.json', 'w'), indent=1)
json.dump({'title': c.get('title', ''), 'duration': 1, 'shots': [], 'music': [], 'sfx': []}, open(p + '/story/shots.json', 'w'))
print('duration', c['duration'], 'style', style)
PY
python3 tools/parse_script.py --project "projects/$NAME" --script "projects/$NAME/input/script.json" | tail -1
grep -q "^  $STYLE:" engine/styles.js || echo "!! Stil '$STYLE' fehlt in engine/styles.js — anlegen (siehe reference/style.md)"
echo "Projekt: $P  → Shots in scenes/shots/*.js schreiben, dann: cd $P && python3 make_shots.py"
