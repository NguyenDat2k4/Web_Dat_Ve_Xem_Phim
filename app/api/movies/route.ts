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

    let query: any = {}
    if (featured === 'true') query.featured = true
    if (comingSoon === 'true') query.isComingSoon = true
    if (comingSoon === 'false') query.isComingSoon = { $ne: true }
    
    if (q) {
      query.title = { $regex: q, $options: 'i' }
    }

    const movies = await Movie.find(query).sort({ rating: -1 })
    return NextResponse.json(movies)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
