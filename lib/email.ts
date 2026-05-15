import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendTicketEmail(booking: any) {
  try {
    // 1. Generate QR Code as Buffer for attachment
    const qrData = JSON.stringify({
      id: booking._id,
      code: booking.ticketCode,
      movie: booking.movie
    });
    
    // Tạo QR code dưới dạng Buffer để đính kèm
    const qrBuffer = await QRCode.toBuffer(qrData);

    // GIA CỐ LOGIC: Nếu có email người nhận thì chắc chắn là quà tặng
    const isGift = booking.isGift === true || (booking.recipientEmail && booking.recipientEmail.trim() !== "");
    const recipientEmail = isGift ? booking.recipientEmail : booking.userEmail;
    
    // Nếu cả 2 đều không có (trường hợp cực hiếm), fallback về email người mua
    const finalToEmail = recipientEmail || booking.userEmail;

    console.log(`[EMAIL ENGINE] Sending to: ${finalToEmail}, IsGift: ${isGift}`);

    // Get Template Config
    const getTemplateConfig = (id: string) => {
      switch(id) {
        case 'love':
          return {
            color: '#ff4d4d',
            secondary: '#fff5f5',
            icon: '💝',
            title: 'MÓN QUÀ TÌNH YÊU',
            messageBg: '#ffe6e6',
            gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2I4ZmYyZGI5YjljNWRiOGI4Zjk4Zjk4Zjk4Zjk4Zjk4Zjk4Zjk4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l41JWZ59PGRoahXW0/giphy.gif' // Hearts
          };
        case 'thankyou':
          return {
            color: '#10b981',
            secondary: '#f0fdf4',
            icon: '🌟',
            title: 'LỜI CẢM ƠN CHÂN THÀNH',
            messageBg: '#d1fae5',
            gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYmQ5Zjk4Zjk4Zjk4Zjk4Zjk4Zjk4Zjk4Zjk4Zjk4Zjk4Zjk4Zjk4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKSjPZQD1O8S9O/giphy.gif' // Flowers/Sparkles
          };
        default: // birthday
          return {
            color: '#3b82f6',
            secondary: '#eff6ff',
            icon: '🎉',
            title: 'CHÚC MỪNG SINH NHẬT',
            messageBg: '#dbeafe',
            gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZjk4Zjk4Zjk4Zjk4Zjk4Zjk4Zjk4Zjk4Zjk4Zjk4Zjk4Zjk4Zjk4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/26tOZ42Mg6pbTUPHW/giphy.gif' // Fireworks
          };
      }
    };

    const config = getTemplateConfig(booking.giftTemplate);

    // 2. Prepare Email Content
    const mailOptions = {
      from: `"CineMax Gift" <${process.env.EMAIL_USER}>`,
      to: finalToEmail,
      subject: isGift 
        ? `🎁 Gửi tới ${finalToEmail}: ${booking.customerName} tặng bạn một món quà!` 
        : `Xác nhận đặt vé thành công: ${booking.movie}`,
      html: isGift ? `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
          <!-- Hiệu ứng động Header -->
          <div style="width: 100%; height: 200px; overflow: hidden; position: relative; background-color: ${config.color};">
            <img src="${config.gifUrl}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.8;" />
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; width: 100%;">
                <div style="font-size: 60px; margin-bottom: 0;">${config.icon}</div>
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">${config.title}</h1>
            </div>
          </div>

          <!-- Lời chúc -->
          <div style="padding: 40px 30px; background-color: #ffffff; text-align: center;">
            <p style="color: #64748b; font-size: 16px; margin-bottom: 5px;">Thân chào <b style="color: #1e293b;">${booking.recipientName}</b>,</p>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 0;">Bạn nhận được một món quà từ <b style="color: #1e293b;">${booking.customerName}</b></p>
            
            <div style="margin: 30px 0; padding: 30px; background-color: ${config.secondary}; border-radius: 20px; border: 2px dashed ${config.color}; position: relative;">
              <span style="font-size: 40px; position: absolute; top: -20px; left: 20px; opacity: 0.2;">"</span>
              <p style="color: ${config.color}; font-size: 20px; font-weight: bold; margin: 0; line-height: 1.6;">
                ${booking.giftMessage || "Chúc bạn có những giây phút xem phim tuyệt vời nhất tại CineMax!"}
              </p>
              <span style="font-size: 40px; position: absolute; bottom: -40px; right: 20px; opacity: 0.2;">"</span>
            </div>
          </div>

          <!-- Thông tin vé -->
          <div style="padding: 0 30px 40px;">
            <div style="background-color: #f8fafc; border-radius: 20px; padding: 25px;">
              <h3 style="margin-top: 0; color: #1e293b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px;">Thông tin vé xem phim</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Phim:</td>
                  <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #1e293b;">${booking.movie}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Rạp:</td>
                  <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #1e293b;">${booking.cinema}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Suất chiếu:</td>
                  <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #1e293b;">${booking.time} | ${booking.date}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Ghế:</td>
                  <td style="padding: 8px 0; font-weight: bold; color: ${config.color}; text-align: right;">${booking.seats.join(', ')}</td>
                </tr>
              </table>
            </div>

            <!-- QR Code Section -->
            <div style="text-align: center; margin-top: 40px;">
              <p style="margin-bottom: 15px; font-weight: bold; color: #1e293b; letter-spacing: 1px; font-size: 12px;">QUÉT MÃ ĐỂ NHẬN VÉ TẠI QUẦY</p>
              <div style="display: inline-block; padding: 15px; border: 2px solid #f1f5f9; border-radius: 24px; background-color: #ffffff;">
                <img src="cid:qrcode" alt="QR Code" style="width: 200px; height: 200px; display: block;" />
              </div>
              <p style="margin-top: 15px; font-size: 12px; color: #94a3b8;">Mã vé: <b style="color: #1e293b;">${booking.ticketCode}</b></p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #1e293b; color: #94a3b8; padding: 40px 20px; text-align: center; font-size: 12px;">
            <img src="https://img.icons8.com/color/96/000000/movie-projector.png" style="width: 40px; margin-bottom: 10px; opacity: 0.5;" />
            <p style="color: #ffffff; font-weight: bold; font-size: 18px; margin: 0;">CineMax</p>
            <p style="margin: 5px 0 20px;">Trải nghiệm điện ảnh đỉnh cao</p>
            <p>© 2026 CineMax Vietnam. Chúc bạn một ngày tốt lành!</p>
          </div>
        </div>
      ` : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #ef4444; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">CineMax</h1>
            <p style="margin: 5px 0 0;">Chúc mừng bạn đã đặt vé thành công!</p>
          </div>
          
          <div style="padding: 30px;">
            <h2 style="color: #333; margin-top: 0;">Thông tin vé của bạn</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #666;">Phim:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; text-align: right;">${booking.movie}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #666;">Rạp:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; text-align: right;">${booking.cinema}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #666;">Suất chiếu:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; text-align: right;">${booking.time} | ${booking.date}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #666;">Ghế:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #ef4444; text-align: right;">${booking.seats.join(', ')}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #666;">Tổng tiền:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; text-align: right;">${booking.totalPrice.toLocaleString()}đ</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #666;">Mã vé:</td>
                <td style="padding: 10px 0; font-weight: bold; font-size: 20px; color: #ef4444; text-align: right;">${booking.ticketCode}</td>
              </tr>
            </table>

            <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
              <p style="margin-bottom: 15px; font-weight: bold; color: #333;">MÃ QR NHẬN VÉ</p>
              <img src="cid:qrcode" alt="QR Code" style="width: 200px; height: 200px;" />
              <p style="margin-top: 15px; font-size: 12px; color: #999;">Vui lòng đưa mã này cho nhân viên tại rạp để nhận vé vật lý.</p>
            </div>
          </div>

          <div style="background-color: #f0f0f0; color: #999; padding: 20px; text-align: center; font-size: 12px;">
            <p>© 2026 CineMax Vietnam. Tất cả quyền được bảo lưu.</p>
            <p>Email này được gửi tự động, vui lòng không phản hồi.</p>
          </div>
        </div>
      `,
      attachments: [{
        filename: 'qrcode.png',
        content: qrBuffer,
        cid: 'qrcode' // Cần khớp với src="cid:qrcode" trong HTML
      }]
    };

    // 3. Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
