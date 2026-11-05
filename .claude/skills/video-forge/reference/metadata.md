# Metadaten-Vorlagen (Titel, Beschreibung, Tags, Thumbnail)

## Formel
- **Titel:** Behauptung/Mythos in CAPS-Wort + Auflösungsversprechen in Klammern oder nach "…". 3–4 Varianten liefern, 1 empfehlen, 1 für A/B-Test.
  - Bibel: `The Serpent in Eden WASN'T a Snake… (Here's What It Really Was)` · `Did People in the Bible Really Live 900 Years… or Is It a Mistranslation?`
  - What If: `What If Your Shadow Started Living Its Own Life?`
  - Short: Hook-Frage, max. ~50 Zeichen: `Why Is Friday the 13th Unlucky?`
- **Beschreibung:** 1. Satz = Hook neu formuliert · 2. Absatz = was das Video zeigt (Keywords natürlich einbauen) · Kapitel aus `script.json`-Cue-Zeiten (erste 0:00) · Bibelstellen-Liste (Bibel-Kanal, Übersetzung nennen) · Kommentar-Frage · Abo-Satz · 5–8 Hashtags OHNE Leerzeichen.
- **Tags:** ~20, Mischung aus Suchphrasen ("was the serpent a snake"), Eigennamen, Kanal-Genre ("bible animation").
- **Thumbnail:** ein Motiv aus dem Video, übertriebener Ausdruck, max. 3–4 Wörter Text, sagt etwas, das der Titel NICHT sagt. Frame aus dem Render nehmen (`--stills`) und Text drauf.
- Kapitelzeiten: `python3 -c "import json;[print(f\"{int(c['start']//60)}:{int(c['start']%60):02d} {c['text'][:40]}\") for c in json.load(open('script.json'))]"`


---

Hier das komplette Paket für das Schlangenvideo. Die Kapitelzeiten habe ich aus dem Timing der Stimme übernommen.

## Titel (einen auswählen)

1. **The Serpent in Eden WASN'T a Snake… (Here's What It Really Was)** ← dein Originaltitel
2. **The Serpent in Eden WASN'T a Snake (The Hebrew Word Proves It)**
3. **What Was the Serpent in Eden REALLY? The Answer Is Terrifying**
4. **The Serpent in Genesis 3 Was NOT a Snake… and NO ONE Talks About It**

**Mein Favorit ist Nr. 1.** Der Teil in Klammern verspricht eine Antwort, und genau dafür klicken Leute. Nr. 2 ist gut zum A/B-Testen, weil das Hebräisch-Argument Glaubwürdigkeit gibt.

## Beschreibung

```
Everyone knows the story: a garden, a tree, a woman… and a talking snake. But what if the creature in Eden was never a snake at all?

In this video we go back to the original Hebrew of Genesis 3 and follow the word "nachash" through the Bible — from Joseph's divination cup and the bronze serpent of Moses, to the burning seraphim around God's throne in Isaiah 6, and the shining cherub of Ezekiel 28 who was "in Eden, the garden of God." Then we let Scripture answer the question itself.

At the end, we separate what the Bible actually confirms from what is only speculation.

⏱️ CHAPTERS
0:00 Everyone Knows the Story
0:25 The Serpent in Eden
0:27 The Garden
1:06 Something Walks Into the Story
1:33 The Hebrew Word "Nachash"
2:17 The Shining Serpents (Seraphim)
2:57 Ezekiel 28: The Cherub in Eden
3:36 The Curse: Did It Lose Its Legs?
4:16 Who Was the Serpent?
4:37 Bible vs. Myth
5:16 The First Promise of the Gospel

📖 SCRIPTURES IN THIS VIDEO
Genesis 2–3 · Genesis 44:5 · Numbers 21:6–9 · Isaiah 6:1–3 · Ezekiel 28:12–17 · Psalm 72:9 · Micah 7:17 · Revelation 12:9 · 2 Corinthians 11:14 · John 3:14
(Scripture quotations from the ESV)

💬 Do you think the serpent was a real snake, or something more? Tell me in the comments.
🔔 Subscribe for more hidden Bible mysteries every week.

#bible #genesis #bibleanimation #serpent #garden ofeden #biblestudy #christian #biblemysteries
```

*(Achtung: bei `#garden ofeden` vor dem Hochladen das Leerzeichen entfernen → `#gardenofeden`.)*

## Tags

```
serpent in eden, was the serpent a snake, nachash, nachash meaning, garden of eden, genesis 3, adam and eve, satan in the garden, seraphim, ezekiel 28, cherub in eden, bronze serpent, bible animation, bible mysteries, bible explained, animated bible story, what was the serpent in eden, shining one, revelation 12:9, genesis 3:15
```

## Thumbnail

- **Bild:** links die grüne Cartoon-Schlange im Baum, nur halb sichtbar, rechts das leuchtende Wesen mit sechs Flügeln. Dazwischen ein weißer Pfeil vom einen zum anderen.
- **Text (2–3 Wörter):** **"NOT A SNAKE?"** oder **"WHAT IS IT?"**
- **Gute Standbilder aus dem Video:**
  - ~0:08: die Schlange flackert und das Leuchtwesen erscheint
  - ~2:15: "A SHINING ONE" mit Flügeln

## Angepinnter Kommentar

```
Be honest: before this video, did you think the serpent was just a snake? 🐍 Or something more? 👀
```

## Shorts-Ideen

- **"The Serpent in Eden WASN'T a Snake"** (1:33–2:17, das hebräische Wort)
- **"The Bronze Snake Moses Lifted Up"** (2:17–2:57)
- **"Did the Serpent Lose Its Legs?"** (3:36–4:16)

Soll ich das Thumbnail im gemalten Stil des Videos generieren?
---

Hier What-If-Varianten von "My Shadow Started Living Its Own Life":

**Titel:**
1. **What If Your Shadow Started Living Its Own Life?** ← nah am Original, klar What-If
2. **What If Your Shadow Could See the Future?**
3. **What If Your Shadow Saved Your Life… Then Pulled a Knife?**
4. **What If Your Shadow Wasn't Really Yours?** ← passt zum Twist am Ende

**Meine Empfehlung: Nr. 1.** Sie behält deinen Originaltitel und passt ins What-If-Format deines Kanals. Nr. 3 ist die reißerischere Alternative zum A/B-Testen in YouTube Studio.

**Beschreibung (Anfang angepasst, Rest wie vorher):**
```
What if one morning your shadow waved at you… and you weren't waving?

At first it saves your life. Then it warns you about the people you love. Then it shows you something about the day you almost died… And three days later you're standing on the roof of a 40-story building, holding your girlfriend's hand over the edge — while your shadow raises a knife.

Watch until the end. The last 30 seconds change everything.

⏱️ CHAPTERS
0:00 The Hook
0:15 Day One – Your Shadow Waves
0:51 The First Warning
1:36 It Knows the Future
2:13 The Other Shadow
2:53 The Rules
3:31 You Were Never Supposed to Wake Up
4:07 The City of Shadows
4:46 The Truth
5:29 Back to the Roof
6:04 The Final Twist

💬 What would YOU do if your shadow came alive? Tell me in the comments.
🔔 Subscribe for a new "What If" every week.

#whatif #animation #horrorstory #animatedstory #shadow #plottwist #storytime
```

**Tags:**
```
what if, what if your shadow, what if your shadow came alive, what if scenario, my shadow started living its own life, living shadow, animated horror story, animated story, creepy what if, plot twist, storytime animation, horror animation
```

**Angepinnter Kommentar:**
```
What if YOUR shadow did this? Would you trust it… or run? 👀
```

**Thumbnail-Text:** **"WHAT IF IT'S NOT YOU?"** oder kurz **"IT MOVED."**