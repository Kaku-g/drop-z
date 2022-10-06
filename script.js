const File = require("./models/file");
const fs = require("fs");
const db = require("./config/db");

db();

async function fetchData() {
  const pastDate = new Date(Date.now() - 24 * 1000 * 60 * 60);
  const files = File.find({ createdAt: { $lt: pastDate } });

  if (files.length) {
    for (const file of files) {
      try {
        fs.unlinkSync(file.path);
        await file.remove();
        console.log(`successfully deleted`);
      } catch (error) {
        console.log("error while deleting file");
      }
    }
  }
  console.log("job done");
  //fetch files >24hrs
}

fetchData().then(process.exit);
