import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendEmailVerification = async (email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const verificationUrl = `${process.env.UI_URL}/verify-email?token=${token}`;

    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Voting email verification",
      html: buildEmailVerificationHtml(verificationUrl),
    });
  } catch (error) {
    throw error;
  }
};

export const sendForgortPasswordEmail = async (email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const resultUrl = `${process.env.UI_URL}/reset-password?token=${token}`;

    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "vote reset password verification",
      html: buildResetPasswordHtml(resultUrl),
    });
  } catch (error) {
    throw error;
  }
};

export const buildEmailVerificationHtml = async (verificationUrl) => {
  return ``;
};

export const buildResetPasswordHtml = async (resultUrl) => {};
