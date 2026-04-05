import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Seat from '@/models/Seat'

export async function GET(
    req: Request,
    { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params
    await dbConnect()

    const seats = await Seat.find({ room: roomId }).sort({ row: 1, number: 1 })

    return NextResponse.json(seats)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
