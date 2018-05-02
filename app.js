require('dotenv').config();

const bot = require('./bot');

bot.start(process.env.PORT || 9000);
