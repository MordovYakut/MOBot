const MongoClient = require("mongodb").MongoClient;
const { DBTOKEN } = require("./tokens_apis");

async function connectToDB() {
  try {
    const client = new MongoClient(DBTOKEN, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    return client;
  } catch (err) {
    console.log("Database connection error!");
  }
}

module.exports = { connectToDB };
