import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const createEmailTransporter = () => {
  const config = {
    service: process.env.EMAIL_SERVICE,
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized:
        process.env.NODE_ENV === "production" &&
        process.env.EMAIL_REJECT_UNAUTHORIZED !== "false",
    },
  };

  return nodemailer.createTransport(config);
};

export const sendEmailVerification = async (email, token) => {
  try {
    const transporter = createEmailTransporter();

    const verificationUrl = `${process.env.UI_URL}/verify-email?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Voting email verification",
      html: await buildEmailVerificationHtml(verificationUrl),
    });
  } catch (error) {
    throw error;
  }
};

export const sendForgotPasswordEmail = async (email, token) => {
  try {
    const transporter = createEmailTransporter();

    const resultUrl = `${process.env.UI_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "vote reset password verification",
      html: await buildResetPasswordHtml(resultUrl),
    });
  } catch (error) {
    throw error;
  }
};

export const buildEmailVerificationHtml = async (verificationUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
        <h2 style="color: #2c3e50; margin-top: 0;">Email Verification</h2>
        <p>Thank you for registering with our Online Voting System. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email Address</a>
        </div>
        <p style="font-size: 12px; color: #666;">If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="font-size: 12px; color: #666; word-break: break-all;">${verificationUrl}</p>
        <p style="font-size: 12px; color: #666; margin-top: 20px;">This link will expire in 24 hours.</p>
      </div>
    </body>
    </html>
  `;
};

export const buildResetPasswordHtml = async (resultUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
        <h2 style="color: #2c3e50; margin-top: 0;">Password Reset Request</h2>
        <p>You have requested to reset your password for your Online Voting System account. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resultUrl}" style="background-color: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <p style="font-size: 12px; color: #666;">If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="font-size: 12px; color: #666; word-break: break-all;">${resultUrl}</p>
        <p style="font-size: 12px; color: #666; margin-top: 20px;">If you didn't request a password reset, please ignore this email. This link will expire in 1 hour.</p>
      </div>
    </body>
    </html>
  `;
};
