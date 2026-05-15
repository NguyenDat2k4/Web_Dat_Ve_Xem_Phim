import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';
import Booking from '@/models/Booking';
import { getSession } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const { id } = params;

        const reviews = await Review.find({ movie: id })
            .populate('user', 'name')
            .populate('replies.user', 'name')
            .sort({ createdAt: -1 });

        return NextResponse.json(reviews);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Bạn cần đăng nhập để bình luận' }, { status: 401 });
        }

        const { id } = params;
        const { rating, comment, images } = await request.json();

        if (!rating || !comment) {
            return NextResponse.json({ error: 'Vui lòng cung cấp điểm đánh giá và bình luận' }, { status: 400 });
        }

        await dbConnect();

        // 1. Kiểm tra xem user đã bình luận chưa
        const existingReview = await Review.findOne({ 
            user: session.user.id, 
            movie: id 
        });

        if (existingReview) {
            return NextResponse.json({ error: 'Bạn đã đánh giá bộ phim này rồi' }, { status: 400 });
        }

        // 2. Kiểm tra xem user đã từng mua vé phim này chưa (Verify Purchase)
        // Lưu ý: Trong Booking model, movie là String (title), nên chúng ta cần lấy title của Movie trước
        const Movie = (await import('@/models/Movie')).default;
        const movieDoc = await Movie.findById(id);
        
        let hasPurchased = false;
        if (movieDoc) {
            const booking = await Booking.findOne({
                userEmail: session.user.email,
                movie: movieDoc.title,
                status: 'paid'
            });
            if (booking) hasPurchased = true;
        }

        const review = await Review.create({
            user: session.user.id,
            movie: id,
            rating,
            comment,
            images: images || [],
            hasPurchased
        });

        return NextResponse.json(review, { status: 201 });

    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Bạn đã đánh giá bộ phim này rồi' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
