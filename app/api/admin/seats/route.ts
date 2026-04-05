import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Seat from '@/models/Seat'
import Room from '@/models/Room'
import { getSession } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const roomId = searchParams.get('roomId')

    if (!roomId) return NextResponse.json({ error: 'Room ID required' }, { status: 400 })

    await dbConnect()

    const seats = await Seat.find({ room: roomId }).sort({ row: 1, number: 1 })

    return NextResponse.json(seats)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { roomId, seats: seatLayout } = body

    if (!roomId || !seatLayout) return NextResponse.json({ error: 'Missing data' }, { status: 400 })

    await dbConnect()

    // Bulk action: Clear old seats and insert new ones
    await Seat.deleteMany({ room: roomId })
    
    const formattedSeats = seatLayout.map((s: any) => ({
      ...s,
      room: roomId
    }))

    const newSeats = await Seat.insertMany(formattedSeats)
    
    // Update room capacity
    await Room.findByIdAndUpdate(roomId, { capacity: newSeats.length })

    return NextResponse.json(newSeats, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
