// Verify/emailVerify.js

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_EMAIL,
    pass: process.env.BREVO_SMTP_KEY,
  },
});

const verifyEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-account/${token}`;
  await transporter.sendMail({
    from: `"Sarkar" <${process.env.BREVO_EMAIL}>`,
    to: email,
    subject: "Verify Your Account",
    html: `
      <h2>Welcome to Sarkar</h2>
      <p>Please verify your account by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Account</a>
    `,
  });
};

export default verifyEmail;
