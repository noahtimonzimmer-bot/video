# Vorlagen-Katalog (templates/scenes)

Generiert von `scripts/gen_library.py` — nicht von Hand pflegen, Notizen dort ergänzen.

## horror/cast.js

Horror-Cast (HERO mit rotem Hoodie, EMMA).

- `HERO = {…}`
- `EMMA = {…}`
- `PASSER = {…}`

## horror/lib.js

Horror „My Shadow“: lebender Schatten an Wand/Boden, Messer, Riss-Grinsen.

- `silOf = (of)`
- `shadow(g, o)`
- `wavePose = (t)`
- `knock = (t, start = 0, n = 3)`
- `flicker = (t, seed = 1, rate = 7)`
- `S(id, meta, draw)`
- `cam = (t, info, o = {})`
- `rimOf = (M, dir = [0.8, -0.4])`
- `person(g, t, M, o)`
- `closeup(g, t, info, o)`
- `card(g, t, info, str, o = {})`
- `bigHand(g, x, y, s, ang, o = {})`

## horror/sets/sets.js

Horror-Sets (Wohnung, Büro, Aufzug, Dach, Spiegelraum …).

- `GY0 = ()`
- `roof(g, t, cam, o = {})`
- `apt(g, t, cam, o = {})`
- `mirrorFrame(g, m, M)`
- `photo(g, x, y, s = 1, emma = 1, o = {})`
- `street(g, t, cam, o = {})`
- `hallway(g, t, cam, o = {})`
- `scratch(g, x, y, k = 1, t = 0, size = 56)`
- `office(g, t, cam, o = {})`
- `stairs(g, t, cam, o = {})`
- `mirrorRoom(g, t, cam, o = {})`
- `cracks(g, x, y, k, seed = 9)`

## aerial.js

3D-Welt-Baukasten (three-kit): stage/finish, Boden, Wasser, Gebäude (house, timberHouse, cathedral, templeKeep, wall, stoneBridge), Bäume/Wolken/Gipfel, 2D-Menschen (addPeople statisch, livePerson animiert), liveFire.

- `sandTex = (T, base = '#e8c48a', rep = [40, 40])`
- `rockTex = (T, base = '#a8907a', rep = [30, 30])`
- `seaTex = (T, rep = [60, 60])`
- `roofTex = (T, base = '#d85a4a')`
- `stage(T, o = {})`
- `finish(T, st, o = {})`
- `addTrees(st, n, place, o = {})`
- `addClouds(st, n, o = {})`
- `addPeaks(st, o = {})`
- `addSprites(st, kind, n, place, size, o = {})`
- `addPeople(st, list, o = {})`
- `house(st, x, y, z, w, d, h, o = {})`
- `stoneBridge(st, x, y, z, len, rotY = 0, o = {})`
- `wall(st, cx, cz, rad, o = {})`
- `flatGround(st, size, tex, y = 0)`
- `waterStrip(st, pts, width, o = {})`
- `livePerson(st, w = 2.6, who = 'adam', o = {})`
- `liveFire(st, w = 6, h = 8)`
- `timberTex = (T, base = '#efe2c4')`
- `tileFloor = (T, a = '#c8b896', b = '#a89878', rep = [20, 20])`
- `bannerTex = (T, col = '#2a4a9a', emblem = 'lily')`
- `timberHouse(st, x, y, z, w, d, h, o = {})`
- `cathedral(st, x, y, z, s = 1, rot = 0)`
- `templeKeep(st, x, y, z, s = 1)`

## cast.js

Outfit-Definitionen (Studio-Rig).

- `ADAM = {…}`
- `EVE = {…}`
- `ADAM_SKIN = {…}`
- `EVE_SKIN = {…}`
- `MOSES = {…}`
- `JOSEPH = {…}`
- `ISAIAH = {…}`
- `KING = {…}`
- `JOHN = {…}`
- `PAUL = {…}`
- `ISRAELITE = (i)`

## city.js

Moderne US-Kleinstadt: town() (Straßen, Gehwege, Fassaden, Burger-Laden mit BURGERS-Schild, Parkplatz, Gasse mit Containern, Verkehr), building, car, streetLamp, trafficLight, dumpster, dorm() Studentenzimmer + paintMonitor, japan() (Fuji, Tokio, Pagode, Sakura), plane3D.

- `asphalt = (T, rep = [40, 4])`
- `pavement = (T, base = '#c8c0b4', rep = [60, 2])`
- `lotTex = (T, rep = [4, 2])`
- `facade = (T, o = {})`
- `building(st, x, z, w, d, h, o = {})`
- `car(st, x, z, o = {})`
- `streetLamp(st, x, z, o = {})`
- `trafficLight(st, x, z)`
- `burgerJoint(st, x, z, o = {})`
- `dumpster(st, x, z, o = {})`
- `town(st, o = {})`
- `dorm(st, o = {})`
- `paintMonitor(m, t, phase = 'code', o = {})`
- `japan(st, o = {})`
- `plane3D(st, o = {})`

## creatures.js

Schlange, Seraph, Cherub, Bronzeschlange; Info-Karten: verse, scripture, hebrewCard, verdict, familyScroll, lifeChart, clayTablet, calendar.

- `snake(g, x, y, s, t, o = {})`
- `shining(g, x, y, s, t, o = {})`
- `cherub(g, x, y, s, t, o = {})`
- `bronzePole(g, x, y, s, t, o = {})`
- `verse(g, t, str, o = {})`
- `scripture(g, t, lines, o = {})`
- `hebrewCard(g, t, k = 0, o = {})`
- `verdict(g, t, rows, o = {})`
- `familyScroll(g, t, rows, k, o = {})`
- `lifeChart(g, t, data, n, o = {})`
- `clayTablet(g, t, rows, k, o = {})`
- `calendar(g, t, num, unit, o = {})`

## lib.js

Shot-Registrierung S(id, meta, draw|{kind:'3d'…}), Kamera cam, closeup/card/person.

- `silOf = (of)`
- `shadow(g, o)`
- `wavePose = (t)`
- `knock = (t, start = 0, n = 3)`
- `flicker = (t, seed = 1, rate = 7)`
- `S(id, meta, draw)`
- `cam = (t, info, o = {})`
- `rimOf = (M, dir = [0.8, -0.4])`
- `person(g, t, M, o)`
- `closeup(g, t, info, o)`
- `card(g, t, info, str, o = {})`
- `bigHand(g, x, y, s, ang, o = {})`

## lib2.js

actor, closeUp, label (Titel-Text), rings, finish (Papierkorn).

- `cam = (t, info, o = {})`
- `talkAt = (t, span)`
- `actor(g, t, o)`
- `closeUp(g, t, info, o)`
- `finish(g, t)`
- `rings(g, x, y, t, col = '#ffffff')`
- `label(g, t, str, x, y, o = {})`

## life.js

PFLICHT: L.tick(st, t) in jedem 3D-draw (oder S3-Wrapper) — Wind in Bäumen/Gras, Wolken, Rauch, Vögel, Menschen atmen, Fahnen, Wasser. L.glide(cam, t, keys) = flüssige Spline-Kamera ohne Stopps; L.follow().

- `tick(st, t)`
- `glide(cam, t, keys)`
- `follow(cam, p, off = [0, 4, 14], lookOff = [0, 2.5, 0], fov = 52)`

## props.js

Gezeichnete Props als Billboards: scatter(st, kind, n, place(r,i)->[x,y,z]|null, size, {seed,vars,fog}) und wallProp(st, kind, x,y,z, size, rotY, v).

- `PROPS = {…}`
- `scatter(st, kind, n, place, size, o = {})`
- `wallProp(st, kind, x, y, z, size, rotY = 0, v = 0)`
- Prop-Typen: grass, bush, rock, barrel, crate, sack, cart, stall, well, lantern, candle, goblet, bread, fruit, books, scroll, inkwell, coins, shield, swords, armor, shelf, straw, bucket, rat, chicken, dog, horse, smoke, bird, boat, tree, haystack, fence, logpile, shovel, spears, fur, roast, jug, pigeon, sparrow, cage, birch, pine, trashbag, cup, hydrant, bench, cone, sakura, petals, bill, flowerbed

## rus.js

Kiewer Rus / Wikinger-Holzwelt: izba, terem, palisade, hillTown (natürlicher Plateau-Hügel + Findlinge), steppe, kurgan, longboat, burialPit, banya, siegeCamp (gestreifte Zelte), logHall, sharedFires (billig, beliebig viele), flock (Vögel, auch brennend).

- `logTex = (T, base = '#8a5a32', rep = [1, 1])`
- `thatchTex = (T, base = '#c8a050', rep = [1, 1])`
- `earthTex = (T, base = '#6a4a2e', rep = [6, 6])`
- `tridentBanner = (T, col = '#a81a22')`
- `izba(st, x, y, z, w = 7, d = 6, h = 4.2, o = {})`
- `terem(st, x, y, z, s = 1)`
- `palisade(st, cx, cz, rad, o = {})`
- `hillTown(st, cx, cz, o = {})`
- `steppe(st, o = {})`
- `kurgan(st, x, z, rad = 16, h = 7)`
- `longboat(st, x, y, z, s = 1, rot = 0, o = {})`
- `burialPit(st, x, z, w = 22, d = 9, o = {})`
- `banya(st, x, z, o = {})`
- `campTent(st, x, z, s = 1, i = 0)`
- `siegeCamp(st, cx, cz, rIn, rOut, o = {})`
- `sharedFires(st, pts, w = 4, h = 5, o = {})`
- `flock(st, n, path, o = {})`
- `logHall(T, o = {})`

## sets/ill.js

Gemalte 2D-Hintergründe (Eden, Wüste, Ägypten, Himmelsthron, Tyrus, Patmos, Golgatha, Mesopotamien, Flut, Arche, Ararat, Kanaan, Pergament, Kosmos).

- `SKIES = {…}`
- `sky(g, cam, kind = 'day', o = {})`
- `mountains(g, y, col, o = {})`
- `rollingHills(g, y, col, seed = 5, amp = 40, trees = 0, treeLeaf = '#5a9a3a')`
- `palmTree(g, x, y, s = 1, lean = 0.2)`
- `bush(g, x, y, s = 1, col = '#5a9a3a', seed = 1, berries = null)`
- `rock(g, x, y, s = 1, col = '#a89a8a')`
- `edenMeadow(g, t, cam, o = {})`
- `edenGrove(g, t, cam, o = {})`
- `desertCamp(g, t, cam, o = {})`
- `tent(g, x, y, s = 1, seed = 1)`
- `egyptHall(g, t, cam, o = {})`
- `heavenThrone(g, t, cam, o = {})`
- `tyreHarbour(g, t, cam, o = {})`
- `ship2(g, x, y, s, sail, t)`
- `patmosCave(g, t, cam, o = {})`
- `calvaryHill(g, t, cam, o = {})`
- `parchment(g, t, cam, o = {})`
- `cosmic(g, t, cam, o = {})`
- `ziggurat2(g, x, y, s = 1)`
- `mudHouse(g, x, y, s = 1, seed = 1)`
- `mesopotamia(g, t, cam, o = {})`
- `floodSea(g, t, cam, o = {})`
- `ark2(g, x, y, s = 1, t = 0)`
- `ararat(g, t, cam, o = {})`
- `sheep(g, x, y, s = 1, t = 0, seed = 1)`
- `canaan(g, t, cam, o = {})`
- `parlor(g, t, cam, o = {})`

## sky.js

PFLICHT für Außenszenen: SKY.stage(T, preset, {az}) statt A.stage — gemalter 2D-Himmel (sunset/golden/dusk/night/fire): Sonne mit Strahlen, beleuchtete Wolken, Sterne, Mond; driftet.

- `PRESETS = {…}`
- `stage(T, preset = 'sunset', o = {})`
- `update(st, t)`

## toon.js

2D-Figuren toonFigure + CAST, 2D-Wolke/Baum/Wiese/Burg, paper()-Textur.

- `toonFigure(g, o)`
- `CAST = {…}`
- `cloud(g, x, y, s = 1, seed = 1, o = {})`
- `leafyTree(g, x, y, s = 1, seed = 2, o = {})`
- `meadow(g, x0, x1, y0, y1, seed = 3, o = {})`
- `castle(g, x, y, s = 1, o = {})`
- `paper(g, t, a = 0.06)`
- CAST: adam, eve, moses, joseph, isaiah, king, john, methuselah, noah, enoch, abraham, sumer, jeanne, kid, philip, templar, molay, soldier, olga, igor, mal, drevlian, drevlian2, rus, rus2, townsman, townswoman, chris, cleaner, cleaner2, cashier, guy, girl, dad, paul

## world3d.js

Low-level 3D: Terrain, Fluss, Felder, Dorf, Palmen, Ziggurat, Schiff, Stadtmauer, Zelt, Canvas-Texturen, paintify (gemalter Look), sprite (2D-Billboard).

- `heightAt(x, z, o = {})`
- `terrain(T, o = {})`
- `water(T, w, d, y = 0.15, color = '#3a8cc8')`
- `river(T, pts, width = 8, color = '#3f95d0', o = {})`
- `fields(T, x0, z0, cols = 4, rows = 3, cell = 14, o = {})`
- `bridge(T, x, y, z, len = 18, rotY = 0, o = {})`
- `house(T, x, y, z, o = {})`
- `village(T, cx, cz, n = 14, o = {})`
- `palm(T, x, y, z, s = 1, o = {})`
- `fruitTree(T, x, y, z, s = 1, o = {})`
- `forest(T, cx, cz, n, radius, o = {})`
- `ziggurat(T, x, y, z, s = 1, col = '#c8a070')`
- `ship(T, x, z, rot = 0, o = {})`
- `cityWall(T, cx, cz, rad = 40, o = {})`
- `tent(T, x, y, z, s = 1, col = '#a87a4a')`
- `toonify(T, scene, o = {})`
- `sprite(T, key, w, h, fn, o = {})`
- `grassTex = (T, base = '#6cc84a', rep = [40, 40], seed = 1)`
- `fieldTex = (T, base, rows = 'h', seed = 2)`
- `waterTex = (T, rep = [4, 40])`
- `stoneTex = (T, base = '#d8c4a0', rep = [4, 1])`
- `plasterTex = (T, base = '#ead6b0')`
- `paintify(T, scene, o = {})`
