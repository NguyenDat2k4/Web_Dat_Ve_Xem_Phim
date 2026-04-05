import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Booking from '@/models/Booking'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    await dbConnect()
    const session = await getSession()

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookings = await Booking.find({ userEmail: session.user.email })
      .sort({ createdAt: -1 }) // Newest first

    return NextResponse.json(bookings)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
