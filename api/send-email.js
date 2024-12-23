const nodemailer = require("nodemailer");
const cors = require("cors");

const corsMiddleware = cors({
  origin: "https://exes-energy-frontend.vercel.app",
  methods: ["POST"],
});

module.exports = async (req, res) => {
  corsMiddleware(req, res, async () => {
    // Handle OPTIONS preflight requests
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.setHeader(
        "Access-Control-Allow-Origin",
        "https://exes-energy-frontend.vercel.app"
      );
      return res.status(204).end();
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { name, email, subject, message } = req.body;

    // Input validation
    if (!name || !email || !subject || !message) {
      return res
        .status(400)
        .json({ status: "fail", error: "All fields are required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ status: "fail", error: "Invalid email address." });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_HOST,
        pass: process.env.HOST_PASSWORD,
        clientId: process.env.Client_ID,
        clientSecret: process.env.Client_Secret,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN,
      },
    });

    try {
      await transporter.sendMail({
        from: `"${name}" <${email}>`,
        to: process.env.EMAIL_RECIEVE,
        replyTo: `${email}`,
        subject: subject,
        text: message,
        html: `<div>
              <h1>Name: ${name} </h1>
              <p>Email: ${email} </p>
              <p>Subject: ${subject} </p>
              <p>Text: ${message} </p>

              <p><i> Message from Exesenergy Website</i></p>
              </div>`,
      });

      return res
        .status(200)
        .json({ status: "success", message: "Email sent successfully." });
    } catch (error) {
      console.error("Error sending email:", error);
      return res
        .status(500)
        .json({ status: "fail", error: "Failed to send email." });
    }
  });
};
