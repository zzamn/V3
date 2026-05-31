import express from 'express'
import path, { resolve } from 'path'
import gpt from './gpt.js';
import string from './string.js';

const app = express();
app.use(express.json());
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'public')));

app.listen(6969, 'localhost', () => {
    console.log('listening on 6969 :D');
});

/*
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public','blog', 'index.html')); // No 'public' here
});*/

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'public', 'v2', 'index.html'));  // No 'public' here
});

app.post('/chatgpt', async (req,res) => {
    let ai = await gpt.chatGPT(req.body.msg)
    res.json({reply:ai});
});

app.post('/user', async (req,res) => {
    let ans = req.body.msg;
    let bruh = await gpt.userMod(ans)
    res.json({reply:bruh})
})

app.post('/initEnv', async (_,res) => {
    let ans = await gpt.loreAndDesc();
    res.json(ans); //{lore:..., desc:...}
})

app.post('/strike', async (req,res) => {
    let msg = req.body.msg;
    let x = [
        {
            role: 'system',
            content: string.domaNegative
        },
        {
            role: 'user',
            content: msg
        }
    ]
    let aiResponse = await gpt.chatGPT(x);
    res.json({reply: aiResponse});
});

app.post('/noStrike', async (req,res) => {
    let msg = req.body.msg;
    let x = [
        {
            role: 'system',
            content: string.domaStory
        }, 
        {
            role: 'user',
            content: msg
        }
    ]

    let aiResponse = await gpt.chatGPT(x);
    res.json({reply: aiResponse});

});