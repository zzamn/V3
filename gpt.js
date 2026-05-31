import { ChatOpenAI } from '@langchain/openai';
import dotenv from 'dotenv';
import string from './string.js';
dotenv.config();

const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
    openAIApiKey: process.env.openai
    // other params...
});

function chatGPT(history) {
    let p= llm.invoke(history).then(ans => {return ans.content})
    return p
}


async function userMod(msg) {
    const a = [
        {role: 'system', content: string.modPrompt},
        {role: 'user', content: msg}
    ]
    let p= await chatGPT(a);
    if (p==0) {return false}
    else {return true};
}



async function loreAndDesc() {
    let  words = string.randomWords(); //returns a,b,c
    let userReply = words.join(',')
    let lore =await chatGPT([
        {
            role: "system",
            content: string.lorePrompt
        },
        {
            role: "user",
            content: userReply
        }
    ])

    let keyword = words[0];
    const descUserPrompt = "Lore: "+ lore + " Keyword: " + keyword
    let desc = await chatGPT([
        {
            role:"system",
            content: string.viewPrompt
        },
        {
            role: "user",
            content: descUserPrompt
        }
    ]);
    return {
        lore: lore, 
        desc: desc};
}




let gpt = { chatGPT, loreAndDesc, userMod}

export default gpt;