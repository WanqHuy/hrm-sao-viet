const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

exports.sendEmail = async ({ to, subject, html }) => {
  try {
    // Không ném lỗi làm dừng API nếu chưa cấu hình đúng mail thật
    if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_email@gmail.com') {
      console.log(`[Email Mocked] Gửi tới: ${to} | Tiêu đề: ${subject}`);
      return;
    }
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html
    });
  } catch (error) {
    console.error('[Nodemailer Error]', error.message);
  }
};