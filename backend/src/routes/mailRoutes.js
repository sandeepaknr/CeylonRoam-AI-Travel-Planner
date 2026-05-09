const router = require("express").Router();
const sendMail = require("../middleware/mailer");

router.post("/send-custom-email", async (req, res) => {
  const { receiver, subject, body } = req.body;

  if (!receiver || !subject || !body) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const result = await sendMail(receiver, subject, body);

  if (result.success) {
    res.status(200).json({ message: "Email sent successfully!" });
  } else {
    res.status(500).json({ message: "Failed to send email" });
  }
});

module.exports = router;