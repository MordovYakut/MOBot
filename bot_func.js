const { addNote, findNote, deleteNote } = require("./DB_func");
const { weatherAPI } = require("./tokens_apis");
const { getWeather } = require("./weather_func");

const userStates = {};

const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
const timeRegex = /^\d{2}:\d{2}$/;

async function TextMsg(bot, msg) {
  const chatId = msg.chat.id;
  const text = msg.text;
  try {
    if (text == "/start") {
      await bot.sendMessage(chatId, "Бот успешно запущен!", {
        reply_markup: {
          keyboard: [
            ["Заметки", "Погода"],
            ["...", "..."],
          ],
          resize_keyboard: true,
        },
      });
    } else if (text == "/help") {
      const message =
        "*Раздел помощи*\n\n" +
        "Данный бот написан в целях саморазвития, а не для коммерции\n\n" +
        "Автор: [MordovYakut](t.me/LZTMonkeyoff)";
      await bot.sendMessage(chatId, message, {
        parse_mode: "MarkdownV2",
        disable_web_page_preview: true,
      });
    } else if (text == "Заметки") {
      await bot.sendMessage(chatId, "Меню заметок", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Список заметок", callback_data: "listNotes" }],
            [{ text: "Добавить заметку", callback_data: "addNote" }],
            [{ text: "Закрыть Меню", callback_data: "closeMenu" }],
          ],
        },
        reply_to_message_id: msg.message_id,
      });
    } else if (text == "Погода") {
      await bot.sendMessage(chatId, "Выберите город", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Москва", callback_data: "city_moscow" }],
            [
              {
                text: "Нижний Новгород",
                callback_data: "city_nizhny novgorod",
              },
            ],
            [{ text: "Саранск", callback_data: "city_saransk" }],
            [{ text: "Смоленск", callback_data: "city_smolensk" }],
            [{ text: "Владимир", callback_data: "city_vladimir" }],
            [{ text: "Закрыть Меню", callback_data: "closeMenu" }],
          ],
        },
        reply_to_message_id: msg.message_id,
      });
    } else if (userStates[chatId]) {
      const step = userStates[chatId].step;
      const data = userStates[chatId].data;

      switch (step) {
        case 0:
          if (dateRegex.test(text)) {
            data.date = text;
            userStates[chatId].step = 1;
            await bot.sendMessage(
              chatId,
              "Шаг 2: Укажите время заметки (в формате ЧЧ:ММ)",
              {
                reply_markup: {
                  inline_keyboard: [
                    [{ text: "Отмена", callback_data: "cancelAddNote" }],
                  ],
                },
              }
            );
            break;
          } else {
            await bot.sendMessage(chatId, "Формат даты: ДД.ММ.ГГГГ");
            break;
          }
        case 1:
          if (timeRegex.test(text)) {
            data.time = text;
            userStates[chatId].step = 2;
            await bot.sendMessage(chatId, "Шаг 3: Напишите заметку", {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "Отмена", callback_data: "cancelAddNote" }],
                ],
              },
            });
            break;
          } else {
            await bot.sendMessage(chatId, "Формат времени: ЧЧ:ММ");
            break;
          }
        case 2:
          data.note = text;

          const date = data.date;
          const time = data.time;
          const note = data.note;

          userStates[chatId] = undefined;

          await bot.sendMessage(
            chatId,
            `Дата: ${date}\nВремя: ${time}\nЗаметка: ${note}`
          );

          await addNote(bot, chatId, date, time, note);

          await bot.sendMessage(chatId, "Заметка успешно добавлена");
          break;
      }
    } else {
      await bot.sendMessage(chatId, "Неизвестная команда");
    }
  } catch (err) {
    console.log(err);
  }
}

async function CallbackMsg(bot, ctx) {
  try {
    const chatId = ctx.message.chat.id;
    const action = ctx.data;
    if (action == "closeMenu") {
      await bot.deleteMessage(chatId, ctx.message.message_id);
      await bot.deleteMessage(
        ctx.message.reply_to_message.chat.id,
        ctx.message.reply_to_message.message_id
      );
    } else if (action == "addNote") {
      userStates[chatId] = { step: 0, data: {} };
      await bot.sendMessage(
        chatId,
        "Шаг 1: Укажите дату заметки (в формате ДД.ММ.ГГГГ)",
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Отмена", callback_data: "cancelAddNote" }],
            ],
          },
        }
      );
    } else if (action == "cancelAddNote") {
      await bot.deleteMessage(chatId, ctx.message.message_id);
      if (ctx.message.reply_to_message) {
        await bot.deleteMessage(
          ctx.message.reply_to_message.chat.id,
          ctx.message.reply_to_message.message_id
        );
      }
      userStates[chatId] = undefined;
      await bot.sendMessage(chatId, "Добавление заметки отменено");
    } else if (action == "listNotes") {
      const result = await findNote(chatId);
      if (result.length === 0) {
        await bot.sendMessage(chatId, "Список заметок пуст");
      } else {
        for (const note of result) {
          const message = `Дата: ${note.date}\nВремя: ${note.time}\nЗаметка: ${note.note}`;
          const keyboard = {
            inline_keyboard: [
              [{ text: "Удалить", callback_data: `deleteNote_${note._id}` }],
            ],
          };
          await bot.sendMessage(chatId, message, { reply_markup: keyboard });
        }
      }
    } else if (action.startsWith("deleteNote_")) {
      const noteId = action.split("_")[1];
      await deleteNote(chatId, noteId);
      await bot.deleteMessage(chatId, ctx.message.message_id);
    } else if (action.startsWith("city_")) {
      const city = action.split("_")[1];
      const weatherData = await getWeather(weatherAPI, city);
      const weatherMessage = `Информация о погоде в городе ${weatherData.name}\nТемпература: ${weatherData.main.temp} °C\nОписание: ${weatherData.weather[0].description}`;
      await bot.sendMessage(chatId, weatherMessage);
    }
  } catch (err) {
    console.log(err);
  }
}

module.exports = { CallbackMsg, TextMsg };
