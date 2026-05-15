import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Review from '@/models/Review'
import Movie from '@/models/Movie'
import Booking from '@/models/Booking'
import { getSession } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const movieId = searchParams.get('movieId')

    if (!movieId) {
      return NextResponse.json({ error: 'Movie ID required' }, { status: 400 })
    }

    await dbConnect()
    
    // Tìm phim để lấy title phục vụ việc check booking
    const movieDoc = await Movie.findById(movieId);
    
    const reviews = await Review.find({ movie: movieId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
    
    // Thêm flag hasPurchased cho từng review
    const reviewsWithStatus = await Promise.all(reviews.map(async (review) => {
      const booking = await Booking.findOne({
        userEmail: review.user.email,
        movie: movieDoc?.title,
        status: 'paid'
      });
      return {
        ...review.toObject(),
        hasPurchased: !!booking
      };
    }));
    
    return NextResponse.json(reviewsWithStatus)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Bạn cần đăng nhập để đánh giá' }, { status: 401 })
    }

    const { movieId, rating, comment, images } = await request.json()
    await dbConnect()

    const userId = session.user.id

    // 1. Kiểm tra xem đã đánh giá chưa
    const existingReview = await Review.findOne({ user: userId, movie: movieId })
    if (existingReview) {
      return NextResponse.json({ error: 'Bạn đã đánh giá phim này rồi' }, { status: 400 })
    }

    // 2. Tạo đánh giá
    const review = await Review.create({
      user: userId,
      movie: movieId,
      rating,
      comment,
      images: images || []
    })

    // 3. Cập nhật điểm và số lượng đánh giá cho Phim
    const movie = await Movie.findById(movieId)
    if (movie) {
      const allReviews = await Review.find({ movie: movieId });
      const numReviews = allReviews.length;
      const totalRatingValue = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = parseFloat((totalRatingValue / numReviews).toFixed(1));

      await Movie.findByIdAndUpdate(movieId, {
        numReviews: numReviews,
        rating: avgRating
      });
    }

    return NextResponse.json(review, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
