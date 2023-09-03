const schedule = require("node-schedule");

async function sendNotification(bot, chatId, msg) {
  try {
    await bot.sendMessage(chatId, msg);
  } catch (err) {
    console.log("Ошибка при отправке уведомления:", err);
  }
}

const scheduledNotifications = {};

function getNotificationKey(noteId, type) {
  return `${noteId}:${type}`;
}

function scheduleNotification(bot, chatId, date, time, note) {
  currentDate = new Date();

  const [day, month, year] = date.split(".").map((num) => parseInt(num, 10));
  const [hours, minutes] = time.split(":").map((num) => parseInt(num, 10));

  const oneDayBefore = new Date(year, month - 1, day - 1, hours, minutes);
  const oneHourBefore = new Date(year, month - 1, day, hours - 1, minutes);

  const oneDayBeforeKey = getNotificationKey(note, "oneDayBefore");
  const oneHourBeforeKey = getNotificationKey(note, "oneHourBefore");

  if (!scheduledNotifications[chatId]) {
    scheduledNotifications[chatId] = {};
  }

  if (!scheduledNotifications[chatId][oneDayBeforeKey]) {
    schedule.scheduleJob(oneDayBefore, () => {
      sendNotification(bot, chatId, `Остался 1 день до заметки:\n${note}`);
      scheduledNotifications[chatId][oneDayBeforeKey] = true;
    });
  }

  if (!scheduledNotifications[chatId][oneHourBeforeKey]) {
    schedule.scheduleJob(oneHourBefore, () => {
      sendNotification(bot, chatId, `Остался 1 час до заметки:\n${note}`);
      scheduledNotifications[chatId][oneHourBeforeKey] = true;
    });
  }
}

module.exports = { scheduleNotification };
