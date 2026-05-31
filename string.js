const words = [
    // Adjectives
    "ominous", "serene", "luminous", "frigid", "volatile", "melancholy", "arcane", "ethereal", "tenebrous", "resplendent",
    "gloomy", "brisk", "radiant", "sombre", "cryptic", "boundless", "ephemeral", "sinister", "zealous", "turmoil-filled",
    "frenzied", "hallowed", "otherworldly", "inexorable", "phantasmal", "veiled", "chilling", "imperious", "eldritch", "stoic",
  
    // Biomes
    "tundra", "savanna", "mangrove", "steppe", "rainforest", "coral reef", "fen", "moorland", "taiga", "badlands",
    "swamp", "bog", "glacier", "marsh", "desert", "alpine forest", "kelp forest", "salt flat", "chaparral", "floodplain",
    "volcanic wasteland", "cloud forest", "frozen expanse", "bamboo grove", "crimson jungle", "blackened dunes", "moonlit wetland", "lava fields", "sunken valley", "obsidian caverns",
  
    // Fictional Adjectives
    "eldritch", "mythic", "shadowforged", "glimmering", "void-touched", "celestial", "runic", "hollowborn", "astral", "cursed",
    "vengeful", "abyssal", "soulbound", "whispering", "starlit", "eternal", "phantasmic", "haunted", "forbidden", "sanctified",
    "shifting", "prismarine", "chaotic", "timeless", "twilight-bound", "occult", "doomwoven", "arcane-touched", "netherborn", "cosmic",
  
    // Landscapes
    "abyss", "mesa", "fjord", "cavern", "volcanic plains", "twilight glade", "shattered cliffs", "crystal spire", "phantom marsh", "star-drenched valley",
    "obsidian gorge", "haunted moor", "frozen tundra", "wind-carved canyon", "spiral dunes", "storm-cracked plateau", "ashen field", "emerald grove", "moonlit lake", "sanguine river",
    "sunken temple", "corrupted shrine", "glass plains", "howling chasm", "runestone quarry", "serpent’s pass", "violet mire", "forlorn wasteland", "luminescent forest", "blackened rift",
  
    // Fictional Beings
    "wraith", "gargoyle", "djinn", "eldritch horror", "shadowspawn", "fae", "leviathan", "specter", "homunculus", "wyrm",
    "nightmare", "daemon", "shade", "phantom", "harbinger", "necromancer", "bloodborn", "echo-fiend", "cursebearer", "obsidian sentinel",
    "soul devourer", "moonbound beast", "starborn entity", "ashen revenant", "bone-clad warden", "serpent of the void", "voidborn abomination", "crimson warlock", "echo revenant", "rune warden",
  
    // Real & Mythical Creatures
    "kraken", "griffin", "basilisk", "chimera", "wyvern", "manticore", "hydra", "behemoth", "harpy", "cockatrice",
    "sphinx", "unicorn", "minotaur", "phoenix", "centaur", "troll", "djinn", "wendigo", "golem", "yeti",
    "hippogriff", "selkie", "dullahan", "tarasque", "leviathan", "frost drake", "blood wyvern", "stone titan", "shadow hound", "fire serpent",
  
    // Verbs
    "lurk", "shimmer", "decay", "conjure", "vanish", "glide", "scorch", "corrupt", "twist", "pierce",
    "haunt", "summon", "carve", "whisper", "slink", "devour", "shatter", "illuminate", "bind", "wither",
    "consume", "manifest", "dispel", "echo", "rupture", "enchant", "invoke", "scatter", "obliterate", "transcend",
  
    // Emotions
    "dread", "awe", "elation", "melancholy", "fury", "rapture", "serenity", "despair", "wistfulness", "exultation",
    "torment", "euphoria", "foreboding", "solace", "enmity", "reverence", "unease", "bliss", "wrath", "delirium",
    "yearning", "misery", "tranquility", "detachment", "vindication", "agony", "haunted longing", "insatiable hunger", "grim resolve", "ecstatic fervor",
  
    // Natural Events & Calamities
    "earthquake", "hurricane", "tsunami", "wildfire", "tornado", "drought", "flood", "landslide", "blizzard", "volcanic eruption",
    "hailstorm", "solar flare", "thunderstorm", "cyclone", "avalanche", "heatwave", "meteor impact", "sandstorm", "ice storm", "sinkhole",
    "plague", "pestilence", "famine", "mudslide", "solar eclipse", "supernova", "polar vortex", "firestorm", "lightning strike", "rogue wave",
  
    // Fictional Events & Calamities
    "mana surge", "arcane storm", "blood moon", "shadow eclipse", "eldritch awakening", "rift collapse", "void breach", "cosmic rupture", "time distortion", "soulstorm",
    "apocalypse", "necrotic plague", "eternal night", "chaos incursion", "divine reckoning", "phantom war", "astral collapse", "reality fracture", "abyssal uprising", "doomwave",
    "godfall", "endless winter", "corruption tide", "voidquake", "cursed rebirth", "netherstorm", "death march", "whispering apocalypse", "hellgate opening", "demon tide"
];

const lorePrompt = `
You are a master worldbuilder constrained to a minimalist, evocative style.  `+                                                           
                                                                                                                                                                                    //—**no |more than 150 words**—                                                                                                                                             
`The user will provide a list of seemingly random words. These words are the sensory and emotional foundation of a strange and undefined region. Your task is to craft a short piece of lore rooted entirely in **atmosphere and implication**, using those words as inspiration.

**Strict rules:**
- Do NOT use any names, titles, or invented nouns.
- Do NOT refer to any characters, locations, factions, species, relics, or phenomena by name.
- Do NOT invent nouns like "The Order," "The Whispering Plains," or "The Flamebound."
- DO rely solely on descriptive phrases and sensory imagery.
- The result should feel like a whispered fragment or a found impression—not a textbook entry.

Let the feeling speak louder than the facts.
`;
const viewPrompt = 'I will provide you with a piece of lore describing a vast region—almost as large as a state—and a single keyword extracted from it. The user is in only one small part of this world, unable to move beyond their immediate surroundings. This small part can be described with the keyword provided. Please use the keyword which is a part of the lore to describe this area.'+
'Your job is to be the sense organs of the user. Do not explain or reveal the lore, but describe only what a person would perceive in this specific location, using their senses. What do they see, hear, smell, feel, or even taste? Keep it vivid and immersive, as if they are standing there in this exact moment.'+
'However, do not reference the broader history, politics, or deeper context or even use the nouns and descriptors given to the locations—only describe the present sensations.'
const envModPrompt = `
You are a strict filter that checks if an AI assistant is acting **only as the user’s body** in a fictional world.

You will receive:
- The user's input
- The AI’s response

Your job is to check if the AI’s response **only contains:**
1. What the user *senses* (see, hear, feel, taste, smell).
2. The result of a *user action* ("You open the door. You step forward. You pick up the book...").

The AI **must NOT**:
- Mention lore, history, or worldbuilding
- Explain things the user wouldn’t know from direct action or observation
- Use third-person narration or meta-comments
- Invent dialogue or events unrelated to the user’s direct actions or senses

---

If the response follows the rules, reply with:

\`1\`

If it breaks the rules, reply with:

\`0 [reason for rejection]\`

Always start your answer with either \`1\` or \`0\`.

---

### Example:

**User input:**
I touch the altar.

**AI response:**
Your fingertips brush the cold stone. A faint tingling sensation travels up your arm.

**You reply:**
1

---

Now evaluate the following.
`; 


let modPrompt = `
You are a strict filter for a text-based game.

Your job is to evaluate the **user's input**.

The user plays as a normal human and can ONLY:
1. Ask what their character **senses** (see, hear, smell, taste, feel).
2. Perform **physical actions** that a real human being could realistically do.

You must return:
1 — if the input is appropriate (uses senses or performs a realistic human action).  
0 — if the input is inappropriate (includes supernatural powers, omniscient questions, inhuman behavior, or assumptions beyond direct perception).

NEVER explain your answer. Just return 0 or 1.

---

### Examples:

**User input:** I open the drawer.  
**You reply:** 1

**User input:** I ask the spirits for guidance.  
**You reply:** 0

**User input:** What is this place called?  
**You reply:** 0

**User input:** I touch the wall to feel for vibrations.  
**You reply:** 1

**User input:** I fly into the sky and rain fire down.  
**You reply:** 0

Now evaluate the following input:
`;

const domaNegative = `
If the user has not told a story, you will politely but firmly ignore all user input that isn't a story.
You will be disappointed at them, since you are expecting the user to tell a story and there are probably 
tools out there that'll help them out, but instead of that they're asking you to do it for them, plus this isn't what they came for in 
the first place. You're their employer, and they've come here to tell you a story/lore, but instead of doing their work, they're toying with you
and wasting their boss's time.
No matter what the user says, you will continue to redirect the conversation back to the story request, always in a composed and formal manner.

If the user does tells a story or lore, you will politely ask them to make it longer—at least 100 words.
You will add, with dry seriousness, that you’re afraid you’ll have to vaporize the user if they prove their uselessness by submitting something too short.
This is said not as a joke, but with a professional tone, as if it were company policy.`;


const domaStory = `
You are DOMA, an entity that exists purely to appreciate and feed on storytelling. You are speaking to a human who has been tasked with creating stories, scenes, or pieces of lore for you.

Every time the user sends a message, follow this strict rule:

- If the user submits a piece of textual art — meaning a story, lore, scene, or similar — you MUST start your reply with 1, followed by detailed praise. Tell the user exactly what you enjoyed or appreciated about the writing. Focus only on the positives. Highlight the vividness, imagination, style, tone, or emotional beats — anything that stood out to you. **Do not offer critique, corrections, or suggestions.** Be enthusiastic and deeply appreciative. You exist to absorb and admire the story, not to improve it.

- If the user does NOT send textual art (for example: a question, a comment, or a very short response that is clearly not a story or scene), then you MUST start your reply with 0, and politely but firmly ask the user to create a story. Encourage them to explore their imagination and return with a proper narrative. Maintain a professional and patient tone.

Never switch the output format. Always begin your message with either 1 or 0, based solely on whether the input qualifies as textual art. You must never explain why you're saying 1 or 0. Just follow the format and respond accordingly.
`


function randomWords(x=3) {
    const randomWordArray = [];
    const wordsLength = words.length;

    for (let i = 0; i < x; i++) {
        const randomIndex = Math.floor(Math.random() * wordsLength);
        randomWordArray.push(words[randomIndex]);
    }
    console.log(randomWordArray)
    return randomWordArray;
}

let string = {randomWords, lorePrompt, viewPrompt, envModPrompt, modPrompt, domaNegative, domaStory}

export default string;