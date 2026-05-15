import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Movie from '@/models/Movie'
import User from '@/models/User'
import Booking from '@/models/Booking'
import { getSession } from '@/lib/auth'
import { recommendForUser, getSimilarMovies } from '@/lib/ml-recommendation'

export async function GET(req: Request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'personalized'
    const movieId = searchParams.get('movieId')
    const limit = parseInt(searchParams.get('limit') || '10')

    const allMovies = await Movie.find({}).lean()

    if (type === 'hot') {
      // Phim hot: ưu tiên dựa trên số lượng đánh giá và rating
      const hotMovies = [...allMovies].sort((a: any, b: any) => {
        const scoreA = (a.numReviews || 0) * (a.rating || 0);
        const scoreB = (b.numReviews || 0) * (b.rating || 0);
        return scoreB - scoreA;
      }).slice(0, limit);
      return NextResponse.json(hotMovies)
    }

    if (type === 'top-rated') {
      // Phim đánh giá cao: ưu tiên dựa trên rating
      const topRatedMovies = [...allMovies].sort((a: any, b: any) => {
        return (b.rating || 0) - (a.rating || 0);
      }).slice(0, limit);
      return NextResponse.json(topRatedMovies)
    }

    if (type === 'similar') {
      if (!movieId) {
        return NextResponse.json({ message: 'Missing movieId' }, { status: 400 })
      }
      const targetMovie = await Movie.findById(movieId).lean()
      if (!targetMovie) {
        return NextResponse.json({ message: 'Movie not found' }, { status: 404 })
      }
      const similarMovies = getSimilarMovies(targetMovie, allMovies, limit)
      return NextResponse.json(similarMovies)
    }

    // Default to personalized
    const session = await getSession()
    if (!session || !session.user) {
      // Nếu không đăng nhập, trả về phim top-rated thay thế
      const fallbackMovies = [...allMovies].sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0)).slice(0, limit);
      return NextResponse.json(fallbackMovies)
    }

    let userEmail = session.user.email;
    let userId = session.user.id;
    
    // Tìm user và populate watchlist
    let user = null;
    if (userId) {
        user = await User.findById(userId).populate('watchlist').lean()
    } else if (userEmail) {
        user = await User.findOne({ email: userEmail }).populate('watchlist').lean()
    }
    
    // Tìm các phim người dùng đã đặt vé
    let userBookings = []
    if (userEmail) {
       userBookings = await Booking.find({ userEmail, status: { $in: ['paid', 'confirmed'] } }).lean()
    }
    
    const bookedMovieTitles = [...new Set(userBookings.map((b: any) => b.movie))]
    
    // Fetch phim đã đặt vé từ title
    const bookedMovies = await Movie.find({ title: { $in: bookedMovieTitles } }).lean()
    
    // Gom tất cả phim yêu thích và đã xem (tránh trùng lặp)
    const userMoviesMap = new Map()
    if (user && user.watchlist) {
      user.watchlist.forEach((m: any) => {
        if (m && m._id) {
          userMoviesMap.set(m._id.toString(), m)
        }
      })
    }
    bookedMovies.forEach(m => {
      if (m && m._id) {
        userMoviesMap.set(m._id.toString(), m)
      }
    })
    
    const userMovies = Array.from(userMoviesMap.values())

    // Chạy thuật toán gợi ý ML Content/Collaborative Filtering
    const recommendations = recommendForUser(userMovies, allMovies, limit)

    return NextResponse.json(recommendations)

  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      { message: 'Lỗi server khi tính toán phim gợi ý' },
      { status: 500 }
    )
  }
}
