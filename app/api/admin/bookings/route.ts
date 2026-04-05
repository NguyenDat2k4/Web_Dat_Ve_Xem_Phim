import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Booking from '@/models/Booking'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const bookings = await Booking.find()
      .sort({ createdAt: -1 })

    return NextResponse.json(bookings)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
