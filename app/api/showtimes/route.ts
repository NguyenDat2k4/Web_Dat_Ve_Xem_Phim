import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Showtime from '@/models/Showtime'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const movieId = searchParams.get('movieId')
    const cinemaId = searchParams.get('cinemaId')
    const date = searchParams.get('date')

    await dbConnect()

    let query: any = {}
    if (movieId) query.movie = movieId
    if (cinemaId) query.cinema = cinemaId
    if (date) query.date = date

    const showtimes = await Showtime.find(query)
      .populate('movie', 'title image genre duration')
      .populate('cinema', 'name address')
      .populate('room', 'name type isActive')
      .sort({ date: 1 })


    return NextResponse.json(showtimes)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
