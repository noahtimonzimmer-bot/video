"""Regenerate reference/library.md from templates/scenes/**/*.js. Run from anywhere after the upgrade step.
Add a one-line note for any NEW file to NOTES below."""
import re, glob, os
SK = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); SC = os.path.join(SK, 'templates/scenes')
NOTES = {
 'aerial.js': '3D-Welt-Baukasten (three-kit): stage/finish, Boden, Wasser, Gebäude (house, timberHouse, cathedral, templeKeep, wall, stoneBridge), Bäume/Wolken/Gipfel, 2D-Menschen (addPeople statisch, livePerson animiert), liveFire.',
 'world3d.js': 'Low-level 3D: Terrain, Fluss, Felder, Dorf, Palmen, Ziggurat, Schiff, Stadtmauer, Zelt, Canvas-Texturen, paintify (gemalter Look), sprite (2D-Billboard).',
 'props.js': 'Gezeichnete Props als Billboards: scatter(st, kind, n, place(r,i)->[x,y,z]|null, size, {seed,vars,fog}) und wallProp(st, kind, x,y,z, size, rotY, v).',
 'toon.js': '2D-Figuren toonFigure + CAST, 2D-Wolke/Baum/Wiese/Burg, paper()-Textur.',
 'sets/ill.js': 'Gemalte 2D-Hintergründe (Eden, Wüste, Ägypten, Himmelsthron, Tyrus, Patmos, Golgatha, Mesopotamien, Flut, Arche, Ararat, Kanaan, Pergament, Kosmos).',
 'creatures.js': 'Schlange, Seraph, Cherub, Bronzeschlange; Info-Karten: verse, scripture, hebrewCard, verdict, familyScroll, lifeChart, clayTablet, calendar.',
 'lib.js': "Shot-Registrierung S(id, meta, draw|{kind:'3d'…}), Kamera cam, closeup/card/person.",
 'lib2.js': 'actor, closeUp, label (Titel-Text), rings, finish (Papierkorn).',
 'cast.js': 'Outfit-Definitionen (Studio-Rig).',
 'sky.js': 'PFLICHT für Außenszenen: SKY.stage(T, preset, {az}) statt A.stage — gemalter 2D-Himmel (sunset/golden/dusk/night/fire): Sonne mit Strahlen, beleuchtete Wolken, Sterne, Mond; driftet.',
 'life.js': 'PFLICHT: L.tick(st, t) in jedem 3D-draw (oder S3-Wrapper) — Wind in Bäumen/Gras, Wolken, Rauch, Vögel, Menschen atmen, Fahnen, Wasser. L.glide(cam, t, keys) = flüssige Spline-Kamera ohne Stopps; L.follow().',
 'city.js': 'Moderne US-Kleinstadt: town() (Straßen, Gehwege, Fassaden, Burger-Laden mit BURGERS-Schild, Parkplatz, Gasse mit Containern, Verkehr), building, car, streetLamp, trafficLight, dumpster, dorm() Studentenzimmer + paintMonitor, japan() (Fuji, Tokio, Pagode, Sakura), plane3D.',
 'rus.js': 'Kiewer Rus / Wikinger-Holzwelt: izba, terem, palisade, hillTown (natürlicher Plateau-Hügel + Findlinge), steppe, kurgan, longboat, burialPit, banya, siegeCamp (gestreifte Zelte), logHall, sharedFires (billig, beliebig viele), flock (Vögel, auch brennend).',
 'horror/cast.js': 'Horror-Cast (HERO mit rotem Hoodie, EMMA).',
 'horror/lib.js': 'Horror „My Shadow“: lebender Schatten an Wand/Boden, Messer, Riss-Grinsen.',
 'horror/sets/sets.js': 'Horror-Sets (Wohnung, Büro, Aufzug, Dach, Spiegelraum …).',
}
out = ['# Vorlagen-Katalog (templates/scenes)', '', 'Generiert von `scripts/gen_library.py` — nicht von Hand pflegen, Notizen dort ergänzen.', '']
for f in sorted(glob.glob(SC + '/**/*.js', recursive=True) + glob.glob(SK + '/templates/horror/**/*.js', recursive=True)):
    rel = os.path.relpath(f, SC) if f.startswith(SC) else 'horror/' + os.path.relpath(f, SK + '/templates/horror'); s = open(f).read()
    out += ['## ' + rel, '', NOTES.get(rel, '(Notiz in gen_library.py ergänzen)'), '']
    for m in re.finditer(r'^export (?:function (\w+)\(([^)]*)\)|const (\w+) = (\([^)]*\)|\{))', s, re.M):
        if m.group(1): out.append(f'- `{m.group(1)}({m.group(2)})`')
        else: out.append(f'- `{m.group(3)} = {m.group(4) if m.group(4) != "{" else "{…}"}`')
    if rel == 'props.js': out.append('- Prop-Typen: ' + ', '.join(re.findall(r'^  (\w+): \[', s, re.M)))
    if rel == 'toon.js': i = s.find('export const CAST'); out.append('- CAST: ' + ', '.join(re.findall(r'^  (\w+): \{', s[i:], re.M)))
    out.append('')
open(os.path.join(SK, 'reference/library.md'), 'w').write('\n'.join(out)); print(len(out), 'lines')
