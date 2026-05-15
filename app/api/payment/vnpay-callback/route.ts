import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { verifyVNPaySignature } from '@/lib/vnpay';
import { sendTicketEmail } from '@/lib/email';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const params: any = {};
    searchParams.forEach((value, key) => {
        params[key] = value;
    });

    const secretKey = process.env.VNP_HASH_SECRET || '';
    const isVerified = verifyVNPaySignature(params, secretKey);

    if (isVerified) {
        const responseCode = params['vnp_ResponseCode'];
        const bookingId = params['vnp_TxnRef'];

        await dbConnect();
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?status=error&message=BookingNotFound`);
        }

        if (responseCode === '00') {
            // Thanh toán thành công
            booking.status = 'paid';
            await booking.save();

            // Cộng điểm thưởng và cập nhật hạng thành viên
            if (booking.userEmail) {
                const { processLoyaltyUpdate } = await import('@/lib/loyalty');
                await processLoyaltyUpdate(
                    booking.userEmail, 
                    booking.totalPrice || 0, 
                    Number(booking.pointsUsed) || 0
                );
            }

            // Gửi email xác nhận (Hàm này đã tự xử lý gửi cho người mua hoặc người nhận quà)
            sendTicketEmail(booking).catch(err => console.error("Email error:", err));

            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?status=success&bookingId=${bookingId}`);
        } else {
            // Thanh toán thất bại hoặc người dùng hủy
            booking.status = 'cancelled';
            await booking.save();
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/booking/${booking.movie}?status=failed&code=${responseCode}`);
        }
    } else {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?status=error&message=InvalidSignature`);
    }
}
