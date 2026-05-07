import { SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER } from "@/config/env";
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  service: "gmail",
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export const sendMail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    await transporter.sendMail({
      from: `Rivo <${SMTP_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
