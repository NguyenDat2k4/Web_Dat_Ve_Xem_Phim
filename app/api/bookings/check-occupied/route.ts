import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Booking from '@/models/Booking'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cinema = searchParams.get('cinema')
    const movie = searchParams.get('movie')
    const date = searchParams.get('date')
    const time = searchParams.get('time')

    if (!cinema || !movie || !date || !time) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    await dbConnect()

    // Find all successful bookings for this showtime
    const existingBookings = await Booking.find({
      cinema,
      movie,
      date,
      time,
      status: { $in: ['paid', 'confirmed'] }
    }).select('seats')

    // Flatten all seats into a single array
    const occupiedSeats = existingBookings.reduce((acc: string[], b: any) => {
      return [...acc, ...b.seats]
    }, [])

    return NextResponse.json({ occupiedSeats: Array.from(new Set(occupiedSeats)) })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
