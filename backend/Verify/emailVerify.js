// Verify/emailVerify.js

const verifyEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-account/${token}`;

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: "Sarkar", email: process.env.BREVO_EMAIL },
      to: [{ email }],
      subject: "Verify Your Account",
      htmlContent: `
        <h2>Welcome to Sarkar</h2>
        <p>Please verify your account by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Account</a>
      `,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to send verification email");
  }
};

export default verifyEmail;
