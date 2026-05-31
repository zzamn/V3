const chatContent = document.getElementById('chatContent');
const messageInput = document.getElementById('messageInput');
const submitBtn = document.getElementById('submitBtn');
const chatTabs = document.querySelectorAll('.chat-tab');
const mapCapitals = document.querySelectorAll('circle')
import gpt from "./talkToGPT.js";


//environment chat
let environmentChat = Array.from({length: 7}, () => {return []});//takes in 7 values 
let currentLocation= 0
let visitedRegions = new Set();
async function visit(loc) {
    currentLocation = loc;
    if (environmentChat[loc].length==0) {
        haltClicking();
        //unvisited place
        visitedRegions.add(loc);
        //now trigger an AI response tbh 🤷
        //let ans = await gpt.initializeEnvironment();
        environmentChat[loc].push(99)
        resumeClicking();

    }

    else {
        //already visited place

    }



    if (visitedRegions.size==7) {
        console.log("All done :D")
        return true;
    }
    return false;
}
export default visit;

//If you visit a new area, AND the user clicks on the environment button, then go to the 




// Chat storage  ⿻
const chats = {
    environment: {
        messages: [],
        welcome: "Welcome to Environment chat! How can I help with environmental questions?"
    },
    doma: {
        messages: [],
        welcome: "Welcome, human!!!"
    }
};

const sendToGPT = {
    environment:[
        {
            role: 'system',
            content: "You are a hippie tree-hugging LLM."
        }
    ],
    doma:[
        {
            role: 'system',
            content: "You are DOMA. An omniscient AI who-despite practically being a god in the eyes of all" +
            " the humans, you absolutely love stories. When you meet a human, you either get excited and ask them about the stories" +
            " they might be about to tell you, or treat them with annoyance if they have no stories to tell."
        }
    ]
}

let currentChat = 'environment';

// Function to add message to chat...should be to just add it to the chat array.
//why tf is this sthing handling visibility as well??! either remove this function or the other thanks
function addMessage(text, isUser = true, isCurrentChat = true) {
    //stop ALL submission options!

    let chat = currentChat;

    const messageElement = document.createElement('div');
    messageElement.textContent = text;
    if (isUser) { messageElement.className = 'message user-message';}
    else { messageElement.className = 'message bot-message';}


    if (!isCurrentChat) {chat = currentChat == 'doma' ? 'environment' : 'doma';}

    chats[chat].messages.push({
        text,
        isUser,
        timestamp: new Date()
    });

    sendToGPT[chat].push({
        role:isUser ? 'user' : 'assistant',
        content:text
    })

    if (isCurrentChat) {
        chatContent.appendChild(messageElement);
        //more like scroll down tbh... scroll top 0 should take ya to the toppies. But this one 
        chatContent.scrollTop = chatContent.scrollHeight;
    
    }
    //alr start all submission options!

}


// Show typing indicator
function showTyping() {
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.id = 'typingIndicator';
    typingIndicator.innerHTML = `
        <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    chatContent.appendChild(typingIndicator);
    chatContent.scrollTop = chatContent.scrollHeight;
}

// Hide typing indicator
function hideTyping() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

function haltClicking() {
    //make the entire fucking page non interactable and add a loading button
    /*submitBtn.classList.add("noClick");

    chatTabs.forEach(tab => {
        tab.classList.add('noClick');
    });

    mapCapitals.forEach(tab => {
        tab.classList.add('noClick');
    });*/
    document.body.classList.add('noClick');


}

function resumeClicking() {
    //make the entire page interactable again
    /*submitBtn.classList.remove("noClick");

    chatTabs.forEach(tab => {
        tab.classList.remove('noClick');
    });
    mapCapitals.forEach(tab => {
        tab.classList.remove('noClick');
    });*/
    document.body.classList.remove('noClick');

}

// Switch between chats
function switchChat(chatName) {
    currentChat = chatName;
    
    // Basically, toggle the active for both when called. Smart...yet risky kinda ;D
    //coulda just made it toggle on for active and off for inactive eh?
    chatTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.chat === chatName);
    });
    /*if (currentChat='environment) {then activate active for env and deactivate for the other thingy :D} */
    
    // Clear current chat display
    chatContent.innerHTML = '';
    
    // Load messages for this chat
    // Replay all messages for this chat
    chats[chatName].messages.forEach(msg => {
        const messageElement = document.createElement('div');
        messageElement.className = msg.isUser ? 'message user-message' : 'message bot-message';
        messageElement.textContent = msg.text;
        chatContent.appendChild(messageElement);
    });
    chatContent.scrollTop = chatContent.scrollHeight;
}

// Handle message submission
submitBtn.addEventListener('click', messageLoop);


async function messageLoop() {
    //removes and reveices the message sent  by the user on submit
    const userMessage = messageInput.value.trim();
    if (userMessage) {

        haltClicking();

        addMessage(userMessage, true);
        //addMessage(message.replace(/\n/g, '<br>'), true);
        messageInput.value = '';
        
        // Simulate bot response after a delay
        showTyping();
        
        let ams="HAHA GOT UR PEANITS!! :DD";
        //if (currentChat== 'environment') {ams = await gpt.environmentBot(/*userMessage*/sendToGPT[currentChat]);}
        //else {ams = await gpt.domaBot(sendToGPT[currentChat]);}
        
        addMessage(ams, false);
        hideTyping();
        resumeClicking();
        
    }
}

// Set up tab click handlers
chatTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        switchChat(tab.dataset.chat);
    });
});

// Initialize with the first chat
switchChat('doma'); // Starting with doma as requested
addMessage(chats['doma'].welcome, false);
addMessage(chats['environment'].welcome, false, false);



//now for minimizing
let peanis = document.querySelector('.peanis')
let chatss = document.querySelector('.chat')
function maxmin() {

    if(peanis.textContent == '🗖') {
        chatss.classList.add('makeItBeeg');
        chatss.classList.remove('makeItSmol');
        peanis.textContent='⿻';

    }

    else {
        chatss.classList.add('makeItSmol');
        chatss.classList.remove('makeItBeeg');
        peanis.textContent='🗖';
    }

}

peanis.addEventListener('click', maxmin);

/*
Ok now that the environment chat brings up a new location and stuff for every area you visit,
It's gotta allow me to interact w/ the area, SAVE the interactions AND not allow me to write some dogshit. So, a user mod bot.
I don't wanna focus on the other nonsense. Just feed the env bot with the chat History and stuff tbh. We'll worry about the other memory
storage methods later. With the homies hopefully :c

And for the DOMA bot..I'd like the DOMA bot to explain the game to the user as DOMA. Then be like, "Oget great :D" annd then tell
the user to go, find inspiration and make stories for it. And if the user acts too goofy...3 chances. On the 4th time the user
sas some nonsense, kill em :D

Aaaannd...yeah 🤷 i think that'll be enough for the blog post. It'll give a good idea as to a new method of memory stoage:
spatial storage..for games, basically. Or even objects honestly. Maybe it'll have some uses in the 3-d world too, eh? IDK! :c



OKay so now that the game is...kinda somewhat barely ready and super buggy af and all that, let's worry about the finishing
touches later and just focus on making the blog post rn...

Ok so we gotta make a header 

Aand also a blog post page. And an image at the start which takes you to a testing ground area thingy of that place 🤷‍♂️
And after that...you've gotta add this code to the title page and the blogpost.



CHANGES FOR LATER: 
Tinker w/ the prompt, as prompt engineering seems to be one of the most important things you gotta do lol :c
Maybe randomly generate the prompt w/ every message or smth :(
*/