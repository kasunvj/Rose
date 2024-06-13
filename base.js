const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'token.json');

try {
  const data = fs.readFileSync(filePath, 'utf8');
  const jsonData = JSON.parse(data);
  const token = jsonData.token;
  startbot(token)
} catch (err) {
  console.error('Error:', err);
}

function startbot(token){
    const bot = new TelegramBot(token, {polling: true});
    bot.on('message', (msg) => {
        const chatId = msg.chat.id;
      
        // send a message to the chat acknowledging receipt of their message
        bot.sendMessage(chatId, 'Received your message');
      })
}