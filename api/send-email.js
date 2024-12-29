const nodemailer = require("nodemailer");
const cors = require("cors");

const corsMiddleware = cors({ origin: "*", methods: ["POST"] });

module.exports = async (req, res) => {
  corsMiddleware(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    try {
      console.log("Request body:", req.body);
      console.log("Environment variables:", {
        emailHost: process.env.EMAIL_HOST,
        clientId: process.env.Client_ID,
        clientSecret: process.env.Client_Secret,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN,
      });

      const { name, email, subject, message } = req.body;

    
    
      // To validate the Input
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "All fields are required." });
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "Invalid email address." });
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

      await transporter.verify();
      console.log("Transporter is configured correctly.");

      const mailOptions = {
        from: `"${name}" <${email}>`,
        to: process.env.EMAIL_RECIEVE,
        replyTo: email,
        subject,
        text: message,
        html: `<div>
                <h1>Name: ${name}</h1>
                <p>Email: ${email}</p>
                <p>Subject: ${subject}</p>
                <p>Message: ${message}</p>
                <p><i>Message from Exesenergy Website</i></p>
               </div>`,
      };

      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully.");

      return res
        .status(200)
        .json({ status: "success", message: "Email sent successfully." });
    } catch (error) {
      console.error("Error:", error.message);
      return res
        .status(500)
        .json({ error: "Internal Server Error", details: error.message });
    }

  });
};
