import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "DevStash <onboarding@resend.dev>";

export async function sendVerificationEmail(to: string, verifyUrl: string) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Verify your DevStash email",
    html: `
      <p>Welcome to DevStash! Confirm your email address to finish setting up your account.</p>
      <p><a href="${verifyUrl}">Verify my email</a></p>
      <p>This link expires in 24 hours. If you didn't create a DevStash account, you can ignore this email.</p>
    `,
  });
}
