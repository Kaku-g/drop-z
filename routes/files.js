const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const File = require("../models/file");
const { v4: uuid4 } = require("uuid");

let storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;

    cb(null, uniqueName);
  },
});

let upload = multer({
  storage,
  limit: { fileSize: 1000000 * 100 },
}).single("myfile");

router.post("/", (req, res) => {
  //store file
  try {
    upload(req, res, async () => {
      //validate request

      if (!req.file) {
        return res.json({ error: "file is not selected" });
      }

      // store into database

      const file = new File({
        filename: req.file.filename,
        uuid: uuid4(),
        path: req.file.path,
        size: req.file.size,
      });

      const response = await file.save();
      return res.json({
        file: `${process.env.BASE_APP_URL}/files/${response.uuid}`,
      });
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }

  //send download link
});

router.post("/send", async (req, res) => {
  const { uuid, emailTo, emailFrom } = req.body;

  if (!uuid || !emailTo || !emailFrom) {
    return res.status(422).send({ error: "all fields are required" });
  }

  //get data from db

  const file = await File.findOne({ uuid: uuid });

  if (file.sender) {
    return res.status(422).send({ error: "Email already sent" });
  }

  file.sender = emailFrom;
  file.receiver = emailTo;
  const response = await file.save();

  //send email
  const sendMail = require("../services/emailService");

  sendMail({
    from: emailFrom,
    to: emailTo,
    subject: "air drop file sharing",
    text: `${emailFrom} shared a file with you`,
    html: require("../services/emailTemplate")({
      emailFrom: emailFrom,
      downloadLink: `${process.env.BASE_APP_URL}/files/${file.uuid}`,
      size: parseInt(file.size / 1000) + "KB",
      expires: "24 hours",
    }),
  });

  return res.send({ success: true });
});

module.exports = router;
