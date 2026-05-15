import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Movie from '@/models/Movie'

export async function GET(request: Request) {
  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')
    const comingSoon = searchParams.get('comingSoon')
    const q = searchParams.get('q')
    const genre = searchParams.get('genre')
    const rating = searchParams.get('rating')
    const status = searchParams.get('status') // now-playing, coming-soon

    const trending = searchParams.get('trending')

    let query: any = {}
    if (featured === 'true') query.featured = true
    
    if (status === 'now-playing') query.isComingSoon = { $ne: true }
    else if (status === 'coming-soon') query.isComingSoon = true
    else {
        if (comingSoon === 'true') query.isComingSoon = true
        if (comingSoon === 'false') query.isComingSoon = { $ne: true }
    }
    
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { genre: { $regex: q, $options: 'i' } }
      ]
    }

    if (genre && genre !== 'All') {
        query.genre = { $regex: genre, $options: 'i' }
    }

    if (rating) {
        query.rating = { $gte: Number(rating) }
    }

    let sort: any = { rating: -1 }
    if (trending === 'true') {
      sort = { numReviews: -1, rating: -1 }
    }

    // Xử lý phân trang
    const page = searchParams.get('page')
    const limit = searchParams.get('limit') || '12'

    if (page) {
      const pageNum = parseInt(page)
      const limitNum = parseInt(limit)
      const skip = (pageNum - 1) * limitNum

      const [movies, total] = await Promise.all([
        Movie.find(query).sort(sort).skip(skip).limit(limitNum),
        Movie.countDocuments(query)
      ])

      return NextResponse.json({
        movies,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      })
    } else {
      // Tương thích ngược: Nếu không có page, trả về mảng như cũ
      const movies = await Movie.find(query).sort(sort)
      return NextResponse.json(movies)
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
