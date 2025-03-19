import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

/**
 * Sends an email notification.
 * @param {string | string[]} to - Recipient email or an array of emails.
 * @param {string} subject - Email subject.
 * @param {string} text - Plain text version of the email.
 * @param {string} html - HTML version of the email.
 * @returns {Promise<void>} Resolves if email is sent successfully, otherwise throws an error.
 */
const sendEmail = async (to: string | string[], subject: string, text: string, html: string): Promise<void> => {
  try {
    const recipients = Array.isArray(to) ? to.join(", ") : to;

    const mailOptions = {
      from: `"Skin Affairs" <${process.env.GMAIL_USER}>`,
      to: recipients, 
      subject,
      text,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to: ${recipients}`, result.response);
  } catch (error:any) {
    console.error(`❌ Failed to send email to: ${to}`, error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

export default sendEmail;
