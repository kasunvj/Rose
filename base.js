const TelegramBot = require('node-telegram-bot-api');
const { open } = require('lmdb-store');
const fs = require('fs');
const path = require('path');

const db = open({
  path: './my-lmdb-database', // Path to the database directory
  compression: true,          // Enable compression (optional)
  maxReaders: 100,            // Maximum number of readers (optional)
  mapSize: 2 * 1024 * 1024 * 1024 // Maximum database size (optional, default is 1TB)
});


const filePath = path.join(__dirname, 'token.json');
const savedmessagePath = path.join(__dirname, 'msg.json');
const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const savedmessage = JSON.parse(fs.readFileSync(savedmessagePath , 'utf8'));
const token = jsonData.token;

function splitAndTrim(input) {
  return input.split(',').map(str => str.trim());
}
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var userWordsArr = [];
var userMeaningArr = [];
const attributesInit = {
  'vocab':{'words':[],
           'meanings':[],
           'lastCheckWord':'',
           'lastCheckMeaning':''}
}

main(token)

async function main(token){
    console.log("bot started")
    const bot = new TelegramBot(token, {polling: true});

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text.toLowerCase();
        const textarray = splitAndTrim(text);
        console.log("---")
        console.log("user input texts",textarray);
        console.log("user db ",await db.get(chatId))
        
      
        switch (textarray[0]){
          /*Helping */
          case 'help':
            console.log(savedmessage.help);
            bot.sendMessage(chatId, savedmessage.help);
            break;

          /*Register*/
          case 'reg':
            try{
              await db.remove(chatId);
              console.log("Existing user removed, New user added")
              await db.put(chatId,attributesInit)
            }
            catch{
              console.log("No existing user, New user added");
              await db.put(chatId,attributesInit)
            }
            break;
          
          /*Adding new word*/
          case 'add':
            userWordsArr = (await db.get(chatId)).vocab.words;
            userMeaningArr = (await db.get(chatId)).vocab.meanings;
            console.log("word array ",userWordsArr);
            console.log("menaing array ",userMeaningArr);
            
            if(textarray.length == 3){
              userWordsArr.push(textarray[1]);
              userMeaningArr.push(textarray[2]);

              var exietingData = await db.get(chatId);
              if(exietingData){
                exietingData.vocab.words = userWordsArr;
                exietingData.vocab.meanings = userMeaningArr;

                await db.put(chatId,exietingData)
              }
              else{
                console.log("No data found");
              }
              
            }
            else{
              console.log("Array length missmatch");
            }
            break;

          /*testing vocab*/
          case 'test':
            userWordsArr = (await db.get(chatId)).vocab.words;
            userMeaningArr = (await db.get(chatId)).vocab.meanings;

            var exietingData = await db.get(chatId);
            var randmN = getRandomNumber(0,userMeaningArr.length);

            if(exietingData){
              exietingData.vocab.lastCheckWord = userWordsArr[randmN];
              exietingData.vocab.lastCheckMeaning = userMeaningArr[randmN];

              await db.put(chatId,exietingData)
            }
            else{
              console.log("No data found");
            }

            bot.sendMessage(chatId, userMeaningArr[randmN]);
            break;
          
          case 'check':
            var exietingData = await db.get(chatId);
            if(exietingData){
              if(textarray[1] == exietingData.vocab.lastCheckWord){
                bot.sendMessage(chatId, "Correct");
              }
              else{
                bot.sendMessage(chatId,"Wrong");
              }
            }
            break;

          case 'show':
            var exietingData = await db.get(chatId);
            if(exietingData){
              bot.sendMessage(chatId, exietingData.vocab.words.toString());
              
            }
            break;
          
          default:
            bot.sendMessage(chatId, "Wrong Command");
            


        }

       console.log(await db.get(chatId));

      })
}