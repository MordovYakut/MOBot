const { connectToDB } = require("./config");
const { ObjectId } = require("mongodb");
const { scheduleNotification } = require("./notification_func");

async function addNote(bot, chatId, date, time, note) {
  try {
    const client = await connectToDB();
    const db = client.db("MOBot");
    const notesCollection = db.collection(`user_${chatId}`);
    const result = await notesCollection.insertOne({
      date: date,
      time: time,
      note: note,
    });
    scheduleNotification(bot, chatId, date, time, note);
    await client.close();
  } catch (err) {
    console.log("Ошибка при сохранении заметки в базе данных: ", err);
  }
}

async function findNote(chatId) {
  try {
    const client = await connectToDB();
    const db = client.db("MOBot");
    const notesCollection = db.collection(`user_${chatId}`);
    const result = await notesCollection.find().toArray();
    await client.close();
    return result;
  } catch (err) {
    console.log(err);
  }
}

async function deleteNote(chatId, noteId) {
  try {
    const client = await connectToDB();
    const db = client.db("MOBot");
    const notesCollection = db.collection(`user_${chatId}`);
    const noteIdObject = new ObjectId(noteId);
    const result = await notesCollection.deleteOne({ _id: noteIdObject });
  } catch (err) {
    console.log(err);
  }
}

module.exports = { addNote, findNote, deleteNote };
