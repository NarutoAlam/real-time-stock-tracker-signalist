import { WELCOME_EMAIL_TEMPLATE } from '@/lib/nodemailer/templates';
import nodemailer from "nodemailer"

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

// Optional verification
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter configuration error:", error);
  } else {
    console.log("✅ Email transporter is ready to send messages", success);
  }

});

export const sendWelcomeEmail = async ({email, name, intro}: WelcomeEmailData) => {
    const htmlTemplate = WELCOME_EMAIL_TEMPLATE
    .replace("{{name}}", name)
    .replace("{{intro}}", intro);

    const mailOptions = {
        from: `"Signalist" <info@hiddenleafvillage.fun>`,
        to: email,
        subject: 'Welcome to Signalist - your way to make informed investment decisions',
        text: 'Thanks for joining Signalist.',
        html: htmlTemplate
    };

    await transporter.sendMail(mailOptions);
}
