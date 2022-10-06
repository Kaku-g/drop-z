require("dotenv").config();
const mongoose = require("mongoose");

function connectDB() {
  mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("mongoDB is connected"))
    .catch((err) => console.log(err));
}

module.exports = connectDB;
