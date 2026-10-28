"""Synthesize narration.txt line by line with RHVoice, add a dark narrator treatment,
and write voice.wav plus script.json ([{start,end,text}]) for tools/parse_script.py."""
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
VOICE = sys.argv[1] if len(sys.argv) > 1 else "alan"
TEMPO = float(sys.argv[2]) if len(sys.argv) > 2 else 1.0
GAP, BIG, SECTION = 0.14, 0.85, 0.6
SR = 48000
tmp = os.path.join(HERE, "tmp"); os.makedirs(tmp, exist_ok=True)

def dur(p):
    return float(subprocess.check_output(["soxi", "-D", p]).decode())

lines = [l.rstrip("\n") for l in open(os.path.join(HERE, "narration.txt"), encoding="utf-8") if l.strip()]
parts, cues, t, pending = [], [], 0.6, 0.0
silence = lambda s, name: (subprocess.run(["sox", "-n", "-r", str(SR), "-c", "1", name, "trim", "0", f"{s:.3f}"], check=True), name)[1]
parts.append(silence(0.6, os.path.join(tmp, "lead.wav")))
for i, line in enumerate(lines):
    if line.startswith("##"):
        pending = max(pending, SECTION); continue
    big = line.startswith("!")
    text = line.lstrip("!").strip()
    if pending:
        parts.append(silence(pending, os.path.join(tmp, f"p{i}.wav"))); t += pending
    raw, out = os.path.join(tmp, f"r{i}.wav"), os.path.join(tmp, f"l{i}.wav")
    spoken = text.replace('"', "").replace("…", "...")
    subprocess.run(["RHVoice-test", "-p", VOICE, "-o", raw], input=spoken.encode(), check=True)
    # trim edge silence, lower pitch a touch, slow down slightly, mono 48k
    subprocess.run(["sox", raw, "-r", str(SR), "-c", "1", out, "silence", "1", "0.02", "0.3%", "reverse", "silence", "1", "0.02", "0.3%", "reverse",
                    "pitch", "-120", "tempo", "-s", str(TEMPO)], check=True)
    d = dur(out)
    cues.append({"start": round(t, 3), "end": round(t + d, 3), "text": text.replace("…", "...")})
    parts.append(out); t += d
    pending = BIG if big else GAP
    if text.endswith(("…", ":")): pending = max(pending, 0.6)
parts.append(silence(2.0, os.path.join(tmp, "tail.wav"))); t += 2.0
dry = os.path.join(tmp, "dry.wav")
subprocess.run(["sox", *parts, dry], check=True)
final = os.path.join(HERE, "voice.wav")
subprocess.run(["sox", dry, final, "bass", "+4", "200", "treble", "-1", "reverb", "18", "50", "60", "100", "0", "0", "norm", "-1"], check=True)
json.dump(cues, open(os.path.join(HERE, "script.json"), "w"), indent=1, ensure_ascii=False)
print(f"{len(cues)} cues, {dur(final):.1f}s")
