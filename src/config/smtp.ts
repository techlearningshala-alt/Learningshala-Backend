import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Gmail SMTP configuration
const smtpConfig = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // Gmail App Password
  },
};

// Create transporter
export const transporter = nodemailer.createTransport(smtpConfig);

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP connection error:", error);
  } else {
    console.log("✅ SMTP server is ready to send emails");
  }
});

// Email sending function
export const sendOtpEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || `"LearningShala" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Your Login OTP - LearningShala",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a2e;">Login Verification Code</h2>
        <p style="color: #333; font-size: 16px;">Your OTP for login is:</p>
        <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #1a1a2e; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h1>
        </div>
        <p style="color: #666; font-size: 14px;">This code will expire in 5 minutes.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} LearningShala. All rights reserved.</p>
      </div>
    `,
    text: `Your login OTP is: ${otp}. This code will expire in 5 minutes.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ OTP email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    throw error;
  }
};
