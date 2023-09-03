const TelegramBot = require("node-telegram-bot-api");
const { TGTOKEN } = require("./tokens_apis");
const { CallbackMsg, TextMsg } = require("./bot_func");

const bot = new TelegramBot(TGTOKEN, { polling: true });

const commands = [
  {
    command: "/start",
    description: "Перезапуск бота",
  },
  {
    command: "/help",
    description: "Раздел помощи",
  },
];

bot.on("text", (msg) => TextMsg(bot, msg));

bot.on("callback_query", (ctx) => CallbackMsg(bot, ctx));

bot.setMyCommands(commands);

bot.on("polling_error", (err) => console.log(err.data.error.message));
