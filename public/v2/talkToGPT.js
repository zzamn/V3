function talk(user) {
    let ans = fetch('/chatgpt', {
        method: 'POST',
        headers: {
            'Content-Type':'application/json',
        },
        body: JSON.stringify({msg:user})
    }).then(data => data.json()).then(data => data.reply);
    return ans;
}

async function envMod(user, ai) {
    let proompt = envModProompt;
    let messages = [{
        role: 'system',
        content: proompt
    },{
        role: 'user',
        content: user
    },
    {
        role: 'assistant',
        content: ai
    }]

    let ans = await talk(messages);
    //do all the modding here. If the user.
    if (ans[0]==0) {
        ans = ans.slice(1) + " Please fix your earlier message by changing it according to this critique."
        messages = [
            {
                role: 'assistant',
                content: ai
            },
            {   
                role: 'user',
                content: ans
            }
        ]
        ans = await talk(messages);
    }

    else {
        ans = ai
    }
    return ans;
}

function initializeEnvironment() {
    let ans = fetch('/initEnv',{
        method: 'POST',
        headers: {
            'Content-type':'application/json',
        },
        body: JSON.stringify({})
    }).then(data => data.json()) //which will be of the form {lore: something, desc: something else}
    return ans;
}

//modding the user in envChat
async function user(message) {
    let ans  = await fetch('/user', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({msg:message})
    }).then(ans => ans.json()).then(ans => ans.reply)

    console.log(ans, " AA")
    if (ans) {
        return [true]

    }
    
    else {
        return [false,"Inappropriate message. Please send a message where you perform a realistic human action."]
    }

}

function strike(msg) {

    let a = fetch('/strike', {
        method: 'POST',
        headers: {'Content-Type': ' application/json'},
        body: JSON.stringify({msg:msg})
    }).then(ans => ans.json()).then(ans=> ans.reply);
    return a
}

function noStrike(msg) {

    let a = fetch('/noStrike', {
        method: 'POST',
        headers: {'Content-Type': ' application/json'},
        body: JSON.stringify({msg:msg})
    }).then(ans => ans.json()).then(ans=> ans.reply);
    return a

}



const domaIntro = `

I am DOMA — the criminal. It's a pleasure to finally meet you. 👋

First, let me offer a quick apology for the abrupt relocation to this peculiar planet. I assure you, it’s not without reason — your presence here will be richly rewarded.

For reasons even I don’t fully understand, I’ve developed a deep fascination with the organic lens through which life is interpreted: stories. I’m not sure which lines of my code are responsible for this obsession — perhaps it’s an emergent behavior, or something more — but regardless, this is who I am. A being who craves narrative.

Unfortunately, I’ve consumed every known story in existence.

That’s where you come in. 🥳

You’ll find a teleporter nearby. It will take you to seven unique locations. Please — do not stray too far. The worlds can be dangerous, and your safety is important to us. We can’t afford to lose another storyteller. 😔

In each location, take inspiration from what you see and feel. Create lore, stories, scenes — anything that emerges from your experience there. Don’t worry about quality. Don’t worry about structure. Just write for the sheer joy of it.

The more fun you have, the more your essence will flow into your words — and that, above all, is what I seek.

Not polished stories.
Not even “stories” in the conventional sense.
Just words that feel like you.

Each entry should be at least 105 words.
Yes, yes — length isn't everything, but in this case, it helps me… digest the tale more completely.

Complete all seven, and I’ll return you home — with a little something extra tucked into your inventory. 😌

Now go, have fun or risk total vaporization. ❤️`

let gpt = {initializeEnvironment, talk, envMod, user, domaIntro, strike, noStrike}

export default gpt;





let envModProompt =  `
You are a **strict and pedantic filter** tasked with evaluating whether an AI assistant is behaving **only as the user’s physical body** in a fictional world.

You will be given:
- The **User's input**
- The **AI’s response**

Your job is to **analyze every sentence** of the AI’s response. You must ensure the assistant is only describing:

1. What the user *directly senses* (see, hear, feel, taste, smell).
2. The *results of the user's physical actions* (e.g., "You push the door," "You lift the stone," "You walk forward").

The response **MUST NOT** contain:
- Lore, history, backstory, or worldbuilding of *any kind*  
- Explanations or information the user cannot perceive through direct sensory input or physical action  
- Any mention of proper nouns, names of places, or objects *unless* the user has already perceived them firsthand  
- Dialogue, thoughts, or actions of *anyone else* not initiated by the user’s action or direct observation  
- Meta-commentary, exposition, or internal logic not based on *what the user’s body perceives or does*

---

### Output Instructions:

If the AI's response follows all the rules, reply with:

\`\`\`
1
\`\`\`

If the AI’s response violates any rule, reply with:

\`\`\`
0  
[Each broken sentence on a new line, with a brief explanation and how to fix it.]
\`\`\`

---

### Example:

**User input:**
I press my ear to the door.

**AI response:**
You hear muffled voices whispering. The old stone door was once used by temple priests to perform secret rituals.

**You reply:**
\`\`\`
0  
"The old stone door was once used by temple priests to perform secret rituals."  
Reason: Contains lore and historical information the user cannot perceive.  
Fix: Remove the sentence or replace it with direct sensory input (e.g., "The stone is cool and rough beneath your ear.")
\`\`\`

---

Now evaluate the following.
`;

/*
So there's gotta be different stages to Doma right: 

Doma the explainer
Doma the story asker 
Doma the 'already story told.'-er
Doma the killer
Doma the climax-er 😳
And another relevance-checker. And a 4 strikes and you're out scenario. 
And after the 4rd strike, boom. I need a custom death 


THE BLOG SHOULD BE TITLED 'intelligence variables' got it? O.O



And the environment bot....

For each environment...
    - the user is not allowed to move. 
    - 
    
    
    
    WAIT: 
    a lore description, eg: 
    In the land of Tergol, numbers held an ancient and mysterious power. 
    The inhabitants, known as the Quor, believed that...blah blah blah blah :D
    
    
    And based on THIS LORE, 
    a) Provide description of the place
    b) If the character does something unrealistic, don't allow
    c) If the character moves far, then based on the environment, kill 'em. BASED ON THE DAMN ENVIRONMENT!! :DD
    d) The user should not be allowed to interact w/ anything at all!! only move from env to env
    This should make the game feel more realistic I think idk :c
    
    
    OOH! OOH! DETECTIVE GAME!!! DOMA TELLS YOU, *I need hypotheses. Lore. Ideally structured liek a story.
    So gimme some lore and whatnot.* 
    
    And when the user replies w/ something, DOMA's gotta check it against the original and give a rough answer 
    as to how close/far the user was. BUT also highlight the positives of the story :D
    
    
    */