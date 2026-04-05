import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Review from '@/models/Review'
import Movie from '@/models/Movie'
import { getSession } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const movieId = searchParams.get('movieId')

    if (!movieId) {
      return NextResponse.json({ error: 'Movie ID required' }, { status: 400 })
    }

    await dbConnect()
    const reviews = await Review.find({ movie: movieId })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
    
    return NextResponse.json(reviews)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { movieId, rating, comment } = await request.json()
    await dbConnect()

    // Normalize user ID to string just in case
    const userId = session.user.id.toString()

    // 1. Check if user already reviewed
    const existingReview = await Review.findOne({ user: userId, movie: movieId })
    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this movie' }, { status: 400 })
    }

    // 2. Create review
    const review = await Review.create({
      user: userId,
      movie: movieId,
      rating,
      comment
    })

    // 3. Update Movie rating and count
    const movie = await Movie.findById(movieId)
    if (movie) {
      const newNumReviews = (movie.numReviews || 0) + 1
      const newTotalRatingValue = (movie.totalRatingValue || 0) + rating
      const newRating = parseFloat((newTotalRatingValue / newNumReviews).toFixed(1))

      await Movie.findByIdAndUpdate(movieId, {
        numReviews: newNumReviews,
        totalRatingValue: newTotalRatingValue,
        rating: newRating
      })
    }

    return NextResponse.json(review, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
