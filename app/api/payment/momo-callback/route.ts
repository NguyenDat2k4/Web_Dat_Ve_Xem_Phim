import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { verifyMoMoSignature } from '@/lib/momo';
import { sendTicketEmail } from '@/lib/email';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const params: any = {};
    searchParams.forEach((value, key) => {
        params[key] = value;
    });

    const secretKey = process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    const isVerified = verifyMoMoSignature(params, secretKey);

    if (isVerified) {
        const resultCode = params['resultCode'];
        const bookingId = params['orderId'];

        await dbConnect();
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?status=error&message=BookingNotFound`);
        }

        if (resultCode === '0' || resultCode === 0) {
            // Thanh toán thành công
            booking.status = 'paid';
            await booking.save();

            console.log("------------------------------------------");
            console.log(">>> [MOMO CALLBACK] SUCCESSFUL PAYMENT FOR:", bookingId);
            console.log("RecipientEmail in DB:", booking.recipientEmail);
            console.log("IsGift in DB:", booking.isGift);
            console.log("------------------------------------------");

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

            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?status=success&bookingId=${bookingId}&method=momo`);
        } else {
            // Thanh toán thất bại hoặc người dùng hủy
            booking.status = 'cancelled';
            await booking.save();
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?status=failed&message=MoMoPaymentFailed`);
        }
    } else {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?status=error&message=InvalidSignatureMoMo`);
    }
}
