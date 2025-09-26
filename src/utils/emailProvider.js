import nodemailer from "nodemailer";
const htmlTemplate = (name, otp) => `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #fdf9f6; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e0d6cc; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
      
      <!-- Header -->
      <div style="background: #c4a484; padding: 20px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold; letter-spacing: 1px;">
          💎 Gemora Studios
        </h1>
        <p style="margin: 5px 0 0; font-size: 14px; color: #fdf9f6; letter-spacing: 0.5px;">
          Elevating Jewelry Visualization
        </p>
      </div>

      <!-- Body -->
      <div style="padding: 30px; color: #565254;">
        <p style="font-size: 16px; margin-bottom: 15px;">
          Dear <b>${name}</b>,
        </p>
        <p style="font-size: 16px; margin-bottom: 20px; line-height: 1.6;">
          Welcome to <b>Gemora Studios</b>! To complete your account setup and start exploring our jewelry visualization platform, please verify your email with the One-Time Password (OTP) below:
        </p>

        <!-- OTP Showcase -->
        <div style="text-align: center; margin: 30px 0;">
          <div style="
            display: inline-block;
            background: linear-gradient(135deg, #e0d6cc, #fdf9f6);
            color: #565254;
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 6px;
            padding: 18px 35px;
            border-radius: 10px;
            border: 2px solid #c4a484;
            box-shadow: 0 3px 12px rgba(196,164,132,0.3);
          ">
            ${otp}
          </div>
        </div>

        <p style="font-size: 14px; margin-bottom: 20px; color: #777; text-align: center;">
          ⏳ This OTP is valid for <b>5 minutes</b>. Please do not share it with anyone for your security.
        </p>
      </div>

      <!-- Footer -->
      <div style="background: #e0d6cc; text-align: center; padding: 15px; font-size: 12px; color: #565254;">
        <p style="margin: 0;">© ${new Date().getFullYear()} Gemora Studios. All rights reserved.</p>
        <p style="margin: 5px 0 0;">Crafting Digital Luxury for Jewelry Enthusiasts</p>
      </div>
    </div>
  </div>
`;

export const sendOtpEmail = async (email, name, otp) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    auth: {
      user: "apikey", // literally the word "apikey"
      pass: process.env.SENDGRID_API, // your SendGrid API key
    },
  });

  await transporter.sendMail({
    from: "rudraviradiya002@gmail.com",
    to: email,
    subject: "Account Verification - OTP",
    html: htmlTemplate(name, otp),
  });
};
