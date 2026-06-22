// Verify/emailVerify.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const verifyEmail = async (email, token) => {
  const frontendUrl = process.env.FRONTEND_URL;
  if (!frontendUrl) throw new Error("FRONTEND_URL is not defined in .env");

  const verificationLink = `${frontendUrl}/verify-email/${token}`;

  await resend.emails.send({
    from: "eKart <onboarding@resend.dev>",  // use this until you add a domain
    to: email,
    subject: "Verify your Sarkar account",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e5e5;border-radius:12px;">
        <h2 style="color:#2c2c2a;">Welcome to Sarkar 👋</h2>
        <p style="color:#555;">Click the button below to verify your email address.</p>
        <a href="${verificationLink}"
          style="display:inline-block;margin-top:16px;padding:12px 28px;background:#2c2c2a;color:#fff;border-radius:999px;text-decoration:none;font-size:14px;">
          Verify Email
        </a>
        <p style="margin-top:24px;font-size:12px;color:#aaa;">
          This link expires in 24 hours. If you didn't create an account, ignore this email.
        </p>
      </div>
    `,
  });

  console.log(`✅ Verification email sent to ${email}`);
};

export default verifyEmail;
