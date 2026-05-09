const nodemailer = require("nodemailer");

const sendMail = async (receiver, subject, body) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Travel System" <${process.env.EMAIL_USER}>`,
      to: receiver,
      subject: subject,
      html: `<div>${body}</div>`, 
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return { success: true };
  } catch (error) {
    console.error("Mail Error: ", error);
    return { success: false, error };
  }
};

module.exports = sendMail;