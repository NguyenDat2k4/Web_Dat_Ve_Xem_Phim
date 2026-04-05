import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Booking from '@/models/Booking'
import { getSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    await dbConnect()
    const { cinema, movie, date, time, seats, totalPrice, customerName, customerPhone } = await request.json()
    const session = await getSession()

    if (!cinema || !movie || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const booking = await Booking.create({
      cinema,
      movie,
      date,
      time,
      seats,
      totalPrice,
      customerName,
      customerPhone,
      userEmail: session?.user?.email || '',
      status: 'confirmed'
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    await dbConnect()
    const bookings = await Booking.find({}).sort({ createdAt: -1 })
    return NextResponse.json(bookings)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
