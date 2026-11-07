"""Real recorded CC0 sound effects from BigSoundBank (https://bigsoundbank.com, 'Royalty-Free Sound License (CC0-like)').
Needs the environment host 'bigsoundbank.com' (environment 'video').

  python3 fetch_sfx.py search "sword"                     # list id | title | length
  python3 fetch_sfx.py get OUTDIR name=ID [name=ID ...]   # download ids as OUTDIR/name.wav (48k stereo)
  python3 fetch_sfx.py auto OUTDIR name="query" ...       # take the best (first) search hit per query

Keep a credits/ids list in the project (sfx_sources.txt is written automatically)."""
import sys, re, html, os, subprocess, urllib.request, urllib.parse, tempfile
UA = {'User-Agent': 'Mozilla/5.0 (video-forge sfx fetcher)'}
def fetch(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30).read()
def search(q, pages=1):
    out = []
    for pg in range(1, pages + 1):
        s = fetch('https://bigsoundbank.com/search?q=' + urllib.parse.quote(q) + ('&page=%d' % pg if pg > 1 else '')).decode('utf8', 'ignore')
        for b in s.split("<div class='resultat_")[1:]:
            m = re.search(r"<h2[^>]*><a href='/[^']*-s(\d+)\.html'>([^<]+)<", b)
            if not m: continue
            d = re.search(r"</div></div><div>(.*?)</div>", b, re.S); ln = re.search(r'Length:\s*([0-9:]+)', b)
            desc = html.unescape(re.sub(r'<[^>]+>', '', d.group(1)))[:80] if d else ''
            out.append((m.group(1), html.unescape(m.group(2)).strip(), ln.group(1) if ln else '?', desc))
    return out
def get(outdir, name, sid):
    os.makedirs(outdir, exist_ok=True); data = fetch('https://bigsoundbank.com/UPLOAD/ogg/%s.ogg' % sid)
    with tempfile.NamedTemporaryFile(suffix='.ogg', delete=False) as f: f.write(data); tmp = f.name
    dst = os.path.join(outdir, name + '.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-ar', '48000', '-ac', '2', dst], check=True); os.unlink(tmp)
    with open(os.path.join(outdir, 'sfx_sources.txt'), 'a') as f: f.write(f'{name}.wav <- BigSoundBank #{sid} https://bigsoundbank.com/s{sid}.html (CC0-like)\n')
    return dst
if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'search':
        for i, t, l, d in search(' '.join(sys.argv[2:])): print(i, '|', t, '|', l, '|', d)
    elif cmd in ('get', 'auto'):
        out = sys.argv[2]
        for a in sys.argv[3:]:
            name, v = a.split('=', 1)
            sid = v if cmd == 'get' else (search(v) or [(None,)])[0][0]
            if not sid: print('no hit', name, v); continue
            print(name, '<-', sid, get(out, name, sid))
