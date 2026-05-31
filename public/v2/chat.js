import gpt from "/v2/talkToGPT.js"; // Assuming talkToGPT.js exports necessary functions

const chatContent = document.getElementById('chatContent');
const messageInput = document.getElementById('messageInput');
const submitBtn = document.getElementById('submitBtn');
const chatTabs = document.querySelectorAll('.chat-tab');
const mapCapitals = document.querySelectorAll('circle'); // Assuming these trigger the visit function
const peanis = document.querySelector('.peanis'); // Minimize/Maximize button
const chatss = document.querySelector('.chat'); // Chat container element
const envSysPrompt = (lore) => {
    return 'You are an assistant embedded in a fictional world. You are bound by the lore provided and must **only** use that lore to answer questions and carry out actions.' +
    'You act as the user’s body, hands, and voice. When the user gives a command or asks a question, you respond as if you are them acting within the rules and reality of the world.' +
    '**DO NOT invent information not in the lore.** If something is unclear or missing, say so or ask the user what they want to do.' +
    'Here is the lore: ' + 
    lore + 
    ' Your only task is to:' +
    '- Follow the lore.'+
    '- Obey the user’s requests as if you were their physical self inside the world.' +
    '- Never go outside the boundaries of the lore.' +
    `Now wait for the user’s input and respond accordingly.`
} 
// --- Data Structures ---

// Environment chat storage: An array where each index (0-6) holds the message array for that location.
const environmentChats = Array.from({ length: 7 }, () => []); // Renamed from 'environment' for clarity

// DOMA chat storage
const domaChat = {
    messages: [],
    welcome: gpt.domaIntro
};

// GPT context storage
const sendToGPT = {
    // Environment context: An array where each index (0-6) holds the GPT context for that location.
    environment: Array.from({ length: 7 }, () => [
        {
            role: 'system',
            // You might want to make this prompt location-specific if needed
            content: "You are a hippie tree-hugging LLM focused on the specific environment of the current location."
        }
    ]),
    doma: [
        {
            role: 'system',
            content: "You are DOMA. An omniscient AI who-despite practically being a god in the eyes of all" +
                     " the humans, you absolutely love stories. When you meet a human, you either get excited and ask them about the stories" +
                     " they might be about to tell you, or treat them with annoyance if they have no stories to tell."
        }
    ]
};

// --- State Variables ---
let currentChat = 'doma'; // Start with 'doma'
let currentLocation = -1; // Use -1 to indicate no location selected initially
let visitedRegions = new Set();

// --- Core Functions ---

/**
 * Adds a message to the correct chat storage (DOMA or specific Environment location)
 * and updates the GPT context. Optionally updates the UI if it's the active chat.
 * @param {string} text - The message content.
 * @param {boolean} isUser - True if the message is from the user, false if from the bot.
 * @param {boolean} updateUI - True if the message should be immediately displayed.
 */
function addMessage(text, isUser = true, updateUI = true) {
    //what we'll be sending to the messages
    const messageData = {
        text,
        isUser,
    };
    //what we'll be sending t GPT
    const gptMessage = {
        role: isUser ? 'user' : 'assistant',
        content: text
    };
    //there's100% a better way to do this: And it is to just yse GPT's chat system tbh...oh well :c

    let targetChatMessages;
    let targetGPTContext;

    if (currentChat === 'environment') {
        targetChatMessages = environmentChats[currentLocation];
        targetGPTContext = sendToGPT.environment[currentLocation];
    } else { // currentChat === 'doma'
        targetChatMessages = domaChat.messages;
        targetGPTContext = sendToGPT.doma;
    }

    targetChatMessages.push(messageData);
    targetGPTContext.push(gptMessage);

    if (updateUI) {
        displayMessage(messageData);
        chatContent.scrollTop = chatContent.scrollHeight; // Scroll down
    }
}

/**
 * Creates and appends a message element to the chat display area.
 * @param {object} msg - The message object { text, isUser }.
 * @param {HTMLElement} container - The HTML element to append the message to.
 */
function displayMessage(msg) {
    const messageElement = document.createElement('div');
    messageElement.className = msg.isUser ? 'message user-message' : 'message bot-message';
    messageElement.textContent = msg.text;
    chatContent.appendChild(messageElement);
}


/**
 * Handles visiting a new location. Sets the current location,
 * initializes chat if new, and potentially updates the display.
 * @param {number} loc - The index of the location being visited (0-6).
 */
async function visit(loc) {
    currentLocation = loc;

    //if newly visited place
    if (!visitedRegions.has(loc)) {
        if (currentChat=='environment') {showTyping()}

        haltClicking(); // Prevent interaction during potential setup

        visitedRegions.add(loc);

        // --- Initialization for a new location ---
        // 1. Add a location-specific welcome message (optional)

        const envData = await gpt.initializeEnvironment();//envData.lore and envData.desc
        sendToGPT.environment[currentLocation].push(envSysPrompt(envData.lore));
        if (currentChat=='environment') {hideTyping()};
        const welcomeText = envData.desc;
        const welcomeMessageData = { text: welcomeText, isUser: false};
        const welcomeGptData = { role: 'assistant', content: welcomeText };

        environmentChats[currentLocation].push(welcomeMessageData);
        sendToGPT.environment[currentLocation].push(welcomeGptData);
        resumeClicking(); // Re-enable interaction
    }

    // --- Update Display ---
    // If the user is currently viewing the environment chat, refresh it to show the new location's history
    if (currentChat === 'environment') {
        switchChat('environment'); // Reload the chat display for the current (newly set) location
    }

    // Check if all regions have been visited
    if (visitedRegions.size === 7) {
        // Add any "game complete" logic here
        return true;
    }
    return false;
}

export default visit;
/**
 * Switches the active chat interface between 'doma' and 'environment'.
 * Loads and displays the messages for the selected chat.
 * For 'environment', it displays messages for the 'currentLocation'.
 * @param {string} chatName - 'doma' or 'environment'.
 */
function switchChat(chatName) {
    currentChat = chatName;

    // Update active tab style
    chatTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.chat === chatName);
    });

    // Clear current chat display
    chatContent.innerHTML = '';

    // Load messages for the selected chat
    let messagesToDisplay = [];
    if (currentChat === 'environment') {
        messagesToDisplay = environmentChats[currentLocation];
    } else { // currentChat === 'doma'
        messagesToDisplay = domaChat.messages;
    }
    // Display the messages
    messagesToDisplay.forEach(msg => {
        displayMessage(msg);
    });

    chatContent.scrollTop = chatContent.scrollHeight; // Scroll to bottom
}

/**
 * Handles the user submitting a message via the input field and button.
 */

let strikes = 0
let storiesTold=0
let stories = Array.from({length: 7}, () => null);
async function messageLoop() {
    let botResponse = null;
    const userMessage = messageInput.value.trim();
    if (!userMessage) return; // Do nothing if input is empty
    haltClicking(); // Disable UI during processing
    addMessage(userMessage); // Add user message to storage and UI
    showTyping(); // Show bot typing indicator
    
    let allow = [true]
    //check if user message is allowed.
    if(currentChat != 'doma') {allow = await gpt.user(userMessage)}

    else {
        let wordCount = userMessage.split(" ").length
        if(wordCount<100) {
            strikes+=1
            let x = ""
            if (strikes<4) {
                x = await gpt.strike(userMessage);
                x = x + ` This is strike ${strikes} of 4. On your 4th strike, you will be vaporized.`;
            }
            else {
                x = x + ` Stand ready for my arrival, worm. You were given orders, you were given time. You were given more leeway than most and yet I find this chat unprepared for my enjoyment.`
            }
            allow = [false, x]
        }

        else {
            botResponse = await gpt.noStrike(userMessage);
            if (stories[currentLocation]==null && botResponse[0]==1) {
                botResponse = botResponse.slice(1);
                stories[currentLocation] = botResponse;
                allow = [true];

                storiesTold+=1;

                //if all 7 stories told, then make the sendMessage button inaccessible tbh...
                if (storiesTold==7) {
                    submitBtn.classList.add('noClick');
                    submitBtn.textContent = "The End. Congratulations."
                }


            }
            
            else {
                strikes+=1
                if (strikes<4) {
                    let ahn = null;
                    if (stories[currentLocation]!=null) {ahn = "BRO! WTAF?! Ya already told a story here. " }
                    else {ahn = botResponse.slice(1)}
                    allow = [false, ahn + ` This is strike ${strikes} of 4. On your 4th strike, you will be vaporized.`]   
                } else {
                    allow = [false, `Stand ready for my arrival, worm. You were given orders, you were given time. You were given more leeway than most and yet I find this chat unprepared for my enjoyment.`]
                }
            }
        }

    } 
    if (!allow[0]) {

        if (currentChat!='doma') {

            environmentChats[currentLocation].pop()
            sendToGPT.environment[currentLocation].pop();
            displayMessage({
                text: allow[1],
                isUser: false
            });
        }

        else {
            domaChat.messages.pop();
            sendToGPT.doma.pop();
            displayMessage({
                text:allow[1],
                isUser:false
            })

        }

        if (strikes>=4) {
            addMessage("Die.", false)
            addMessage("WAiT WAIY WIAT wait iaw ant I can explain just gi")
            hideTyping();
            return; //this should ensure that the user cannot interact with anything
        }

        hideTyping();
        resumeClicking();
        return
    }
    //if not, just add the messages and not save the code tbh :D
    messageInput.value = ''; // Clear input field

    try {
        if (currentChat === 'environment') {
            // Pass the specific context for the current location
            botResponse = await gpt.talk(sendToGPT.environment[currentLocation]);
            let modResponse = await gpt.envMod(userMessage, botResponse);
            botResponse = modResponse;
        }
    } catch (error) {
        botResponse = "Sorry, I encountered an error trying to respond."; // Provide a fallback message
    } finally {
        hideTyping(); // Hide typing indicator
         if (botResponse) {
            addMessage(botResponse, false, true); // Add bot response to storage and UI
         }
         resumeClicking(); // Re-enable UI
    }
}


// --- UI Interaction Helpers ---

function showTyping() {
    if (!document.getElementById('typingIndicator')) { // Prevent adding multiple indicators
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
}

function hideTyping() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

let waitMsg = document.querySelector('.wait')
function haltClicking() {
    document.body.classList.add('noClick'); // Simple way to disable clicks on the whole page
    submitBtn.disabled = true; // Specifically disable button
    messageInput.disabled = true; // Disable text input
    // Consider adding disabled state to tabs and map elements too if 'noClick' class isn't sufficient
    waitMsg.classList.remove('hide')
    
}

function resumeClicking() {
    document.body.classList.remove('noClick');
    submitBtn.disabled = false;
    messageInput.disabled = false;
     // Remove disabled state from other elements if added in haltClicking
    waitMsg.classList.add('hide')
}

// --- Event Listeners ---

// Message Submit Button
submitBtn.addEventListener('click', messageLoop);

// Allow Enter key submission in textarea (optional)
messageInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { // Send on Enter, allow Shift+Enter for newline
        e.preventDefault(); // Prevent default newline insertion
        messageLoop();
    }
});


// Chat Tab Switching
chatTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Prevent switching if UI is halted
        if (!document.body.classList.contains('noClick')) {
            switchChat(tab.dataset.chat);
        }
    });
});

// Map Location Clicks (Example Setup)
// You'll need to adapt this based on how your map circles are set up
mapCapitals.forEach((circle, index) => {
    // Assuming each circle corresponds to location index 0, 1, 2...
    circle.addEventListener('click', () => {
         // Prevent switching if UI is halted
        if (!document.body.classList.contains('noClick')) {
             visit(index); // Call visit with the index of the clicked circle
        }
    });
    // Add a data attribute or ID to circles if they don't map directly by index
    // e.g., circle.dataset.locationId = index;
    // Then in the listener: visit(parseInt(circle.dataset.locationId));
});


// Minimize/Maximize Chat Window
peanis.addEventListener('click', () => {
    if (peanis.textContent == '🗖') { // Currently minimized, maximize it
        chatss.classList.add('makeItBeeg');
        chatss.classList.remove('makeItSmol');
        peanis.textContent = '⿻'; // Symbol for maximized state
    } else { // Currently maximized, minimize it
        chatss.classList.add('makeItSmol');
        chatss.classList.remove('makeItBeeg');
        peanis.textContent = '🗖'; // Symbol for minimized state
    }
});


// --- Initialization ---

function initializeApp() {
    // Start with DOMA chat active
    switchChat('doma');
    // Add DOMA's welcome message only after switching (switchChat clears the content)
    if (domaChat.messages.length === 0) { // Avoid adding welcome multiple times on refresh/re-init
        addMessage(domaChat.welcome, false, true); // Add DOMA welcome and display it
    }
}


initializeApp();
