import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { ticketCode } = await request.json();

        if (!ticketCode) {
            return NextResponse.json({ error: 'Mã vé không hợp lệ' }, { status: 400 });
        }

        await dbConnect();

        // Tìm vé theo mã và kiểm tra trạng thái thanh toán
        const booking = await Booking.findOne({ ticketCode });

        if (!booking) {
            return NextResponse.json({ error: 'Không tìm thấy thông tin vé này' }, { status: 404 });
        }

        if (booking.status !== 'paid') {
            return NextResponse.json({ 
                error: 'Vé này chưa được thanh toán', 
                booking 
            }, { status: 400 });
        }

        if (booking.checkInStatus) {
            return NextResponse.json({ 
                error: 'Vé này đã được sử dụng (Check-in) trước đó', 
                booking,
                checkInAt: booking.checkInAt
            }, { status: 400 });
        }

        // Cập nhật trạng thái check-in
        booking.checkInStatus = true;
        booking.checkInAt = new Date();
        await booking.save();

        return NextResponse.json({ 
            message: 'Check-in thành công!', 
            booking 
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
