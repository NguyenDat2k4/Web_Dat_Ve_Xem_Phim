import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { createVNPayUrl } from '@/lib/vnpay';
import { getSession } from '@/lib/auth';

function generateTicketCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'CMX-'
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { amount, bookingData, ipAddr = '127.0.0.1' } = body;
        console.log("==========================================");
        console.log(">>> [VNPAY RECEIVE] DATA FROM CLIENT:");
        console.log("- isGift:", bookingData.isGift);
        console.log("- recipientEmail:", bookingData.recipientEmail);
        console.log("- recipientName:", bookingData.recipientName);
        console.log("==========================================");

        await dbConnect();
        const session = await getSession();

        // Gia cố: Nếu có email người nhận thì chắc chắn là quà tặng
        const finalIsGift = !!(bookingData.isGift || (bookingData.recipientEmail && bookingData.recipientEmail.trim() !== ""));

        // 1. Tạo bản ghi booking với trạng thái pending
        const booking = await Booking.create({
            movie: bookingData.movie,
            cinema: bookingData.cinema,
            date: bookingData.date,
            time: bookingData.time,
            seats: bookingData.seats,
            totalPrice: bookingData.totalPrice,
            customerName: bookingData.customerName,
            customerPhone: bookingData.customerPhone,
            combos: bookingData.combos,
            userEmail: bookingData.userEmail || session?.user?.email || '',
            paymentMethod: 'vnpay',
            status: 'pending',
            ticketCode: generateTicketCode(),
            // Quà tặng
            isGift: finalIsGift,
            recipientName: bookingData.recipientName,
            recipientEmail: bookingData.recipientEmail,
            giftMessage: bookingData.giftMessage,
            giftTemplate: bookingData.giftTemplate
        });

        // 2. Cấu hình các thông số VNPay
        const tmnCode = process.env.VNP_TMN_CODE || '';
        const secretKey = process.env.VNP_HASH_SECRET || '';
        const vnpUrl = process.env.VNP_URL || '';
        const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/vnpay-callback`;

        const orderId = booking._id.toString();
        const orderInfo = `Thanh toan ve xem phim: ${booking.movie}`;

        // 3. Tạo URL thanh toán
        const paymentUrl = createVNPayUrl({
            amount,
            ipAddr,
            orderId,
            orderInfo,
            returnUrl,
            tmnCode,
            secretKey,
            vnpUrl
        });

        // 4. Lưu lại paymentId nếu cần (ở đây orderId chính là BookingId)
        booking.paymentId = orderId;
        await booking.save();

        return NextResponse.json({ url: paymentUrl });
    } catch (error: any) {
        console.error('VNPay payment error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
