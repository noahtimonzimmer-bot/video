"""Build story/shots.json from the S('NNN', {meta}, ...) calls in scenes/shots/*.js and the cue timings.
meta keys: cue (default int(id[:3])), dt (s after cue start), bars, in, sfx [[name, at, gain, (pitch)]], amb [name, gain], scene."""
import glob, json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
cues = json.load(open(os.path.join(HERE, 'input/script.json')))
dur = json.load(open(os.path.join(HERE, 'config.json')))['duration']
shots = []
for f in sorted(glob.glob(os.path.join(HERE, 'scenes/shots/*.js'))):
    src = open(f).read()
    for m in re.finditer(r"\bS\('(\w+)',\s*", src):
        i = m.end(); depth = 0; j = i
        while True:
            c = src[j]; depth += c == '{'; depth -= c == '}'; j += 1
            if depth == 0: break
        meta = json.loads(src[i:j]); sid = m.group(1)
        cue = meta.get('cue', int(sid[:3])); st = cues[cue]['start'] + meta.get('dt', 0) - 0.12
        shots.append((max(0, st), sid, meta))
shots.sort(key=lambda s: s[0]); shots[0] = (0.0,) + shots[0][1:]
out = []
for k, (st, sid, meta) in enumerate(shots):
    end = shots[k + 1][0] if k + 1 < len(shots) else round(dur + 1.5, 3)
    line = ' '.join(c['text'] for c in cues if st - 0.05 <= c['start'] < end - 0.05)
    tr = meta.get('in', 'cut'); tr = tr if isinstance(tr, dict) else {'type': tr, 'dur': 0.5 if tr in ('dip', 'fade') else 0.3}
    sh = {'id': 'c' + sid, 'start': round(st, 3), 'end': round(end, 3), 'line': line, 'scene': meta.get('scene', ''), 'bars': meta.get('bars'), 'in': tr,
          'sfx': [{'at': s[1], 'name': s[0], 'gain': s[2], **({'pitch': s[3]} if len(s) > 3 else {})} for s in meta.get('sfx', [])]}
    if 'amb' in meta: sh['amb'] = {'name': meta['amb'][0], 'gain': meta['amb'][1]}
    out.append(sh)
prev = json.load(open(os.path.join(HERE, 'story/shots.json')))
doc = {'title': 'My Shadow Started Living Its Own Life', 'duration': round(dur + 1.5, 3), 'shots': out, 'music': prev.get('music', []), 'sfx': prev.get('sfx', [])}
json.dump(doc, open(os.path.join(HERE, 'story/shots.json'), 'w'), indent=1)
lens = sorted(s['end'] - s['start'] for s in out)
print(f"{len(out)} shots, median {lens[len(lens)//2]:.2f}s, min {lens[0]:.2f}s, max {lens[-1]:.2f}s")
for s in out:
    if s['end'] - s['start'] < 0.5: print('  short:', s['id'], round(s['end'] - s['start'], 2))
