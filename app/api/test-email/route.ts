import { NextRequest, NextResponse } from 'next/server';
import { sendTicketEmail } from '@/lib/email';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const targetEmail = searchParams.get('to') || 'ndat50591@gmail.com';
    
    console.log("------------------------------------------");
    console.log("DEBUG: ĐANG GỬI EMAIL TEST TỚI:", targetEmail);
    console.log("------------------------------------------");

    const mockBooking = {
        _id: new mongoose.Types.ObjectId(),
        ticketCode: `TEST-${Math.floor(Math.random() * 9000) + 1000}`,
        movie: 'Wicked (Bản sửa lỗi gửi mail)',
        cinema: 'CineMax Hà Nội',
        date: '2026-04-25',
        time: '19:30',
        seats: ['A1', 'A2'],
        totalPrice: 200000,
        customerName: 'Kỹ thuật CineMax',
        isGift: true,
        recipientName: 'Bạn của An',
        recipientEmail: targetEmail,
        giftMessage: `Chào bạn! Đây là bản tin thử nghiệm gửi tới chính xác địa chỉ: ${targetEmail}`,
        giftTemplate: 'birthday'
    };

    try {
        const result = await sendTicketEmail(mockBooking);
        return NextResponse.json({ 
            success: true, 
            sentTo: targetEmail,
            message: `Hệ thống báo đã gửi thành công tới ${targetEmail}. Hãy kiểm tra hòm thư này!`
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message });
    }
}
