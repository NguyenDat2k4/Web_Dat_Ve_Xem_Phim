import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Movie from '@/models/Movie'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await params
    
    if (!id) {
      return NextResponse.json({ error: 'Movie ID is required' }, { status: 400 })
    }

    const movie = await Movie.findById(id)
    
    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 })
    }

    return NextResponse.json(movie)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
