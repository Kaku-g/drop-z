const express = require("express");
const db = require("./config/db");
const path = require("path");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3000;
app.use(express.static("public"));
app.use(express.json());
db();

//cors

const corsOptions = {
  origin: process.env.ALLOWED_CLIENTS.split(","),
};

//template engine

app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");

//ROUTES

app.use("/api/files", require("./routes/files"));
//app.use('api/files',require("./routes/files"));
app.use("/files", require("./routes/show"));
app.use("/files/download", require("./routes/download"));

app.listen(PORT, () => {
  console.log("running server");
});
