import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { generateMoMoSignature } from '@/lib/momo';
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
        const { amount, bookingData } = body;
        console.log("==========================================");
        console.log(">>> [SERVER RECEIVE] DATA FROM CLIENT:");
        console.log("- isGift:", bookingData.isGift);
        console.log("- recipientEmail:", bookingData.recipientEmail);
        console.log("- recipientName:", bookingData.recipientName);
        console.log("==========================================");

        await dbConnect();
        const session = await getSession();

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
            paymentMethod: 'momo',
            status: 'pending',
            ticketCode: generateTicketCode(),
            // Quà tặng
            isGift: finalIsGift,
            recipientName: bookingData.recipientName,
            recipientEmail: bookingData.recipientEmail,
            giftMessage: bookingData.giftMessage,
            giftTemplate: bookingData.giftTemplate
        });

        // 2. Cấu hình các thông số MoMo (Sử dụng bộ Key Sandbox người dùng cung cấp)
        const partnerCode = process.env.MOMO_PARTNER_CODE || 'MOMO';
        const accessKey = process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85';
        const secretKey = process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
        const endpoint = "https://test-payment.momo.vn/v2/gateway/api/create";
        
        // Đảm bảo URL không có dấu / ở cuối
        const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
        
        const orderId = booking._id.toString();
        const requestId = orderId + "_" + Date.now();
        const orderInfo = "Thanh toan CineMax";
        const redirectUrl = `${appUrl}/api/payment/momo-callback`;
        const ipnUrl = `${appUrl}/api/payment/momo-callback`; 
        const requestType = "captureWallet";
        const extraData = ""; 

        // 3. Tạo chữ ký
        const signature = generateMoMoSignature({
            accessKey,
            amount,
            extraData,
            ipnUrl,
            orderId,
            orderInfo,
            partnerCode,
            redirectUrl,
            requestId,
            requestType,
            secretKey
        });

        // 4. Gửi yêu cầu sang MoMo
        const momoResponse = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify({
                partnerCode,
                partnerName: "CineMax",
                storeId: "CineMaxStore",
                requestId,
                amount,
                orderId,
                orderInfo,
                redirectUrl,
                ipnUrl,
                lang: "vi",
                requestType,
                autoCapture: true,
                extraData,
                signature
            })
        });

        const data = await momoResponse.json();

        if (data.payUrl) {
            return NextResponse.json({ url: data.payUrl });
        } else {
            console.error("MoMo Error:", data);
            return NextResponse.json({ error: data.message || "Lỗi khởi tạo MoMo" }, { status: 400 });
        }

    } catch (error: any) {
        console.error('MoMo API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
