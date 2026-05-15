import nodemailer from 'nodemailer';

// Cấu hình transporter (Thay đổi thông số này theo dịch vụ email của bạn)
const transporter = nodemailer.createTransport({
  service: 'gmail', // Ví dụ: gmail, outlook...
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: '"CineMax Support" <no-reply@cinemax.com>',
    to: email,
    subject: 'Đặt lại mật khẩu CineMax',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #e11d48; text-align: center;">CineMax - Đặt lại mật khẩu</h2>
        <p>Chào bạn,</p>
        <p>Bạn nhận được email này vì chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Đặt lại mật khẩu
          </a>
        </div>
        <p>Nếu bạn không yêu cầu việc này, hãy bỏ qua email này.</p>
        <p>Đường dẫn này sẽ hết hạn trong 1 giờ.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">Đây là email tự động, vui lòng không trả lời.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: '"CineMax Support" <no-reply@cinemax.com>',
    to: email,
    subject: 'Xác thực tài khoản CineMax',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #e11d48; text-align: center;">Chào mừng bạn đến với CineMax</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại CineMax. Vui lòng xác thực email của bạn để bắt đầu trải nghiệm dịch vụ.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Xác thực tài khoản
          </a>
        </div>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">Đây là email tự động, vui lòng không trả lời.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};
