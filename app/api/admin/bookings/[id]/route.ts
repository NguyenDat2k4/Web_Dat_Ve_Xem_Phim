import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Booking from '@/models/Booking'
import { getSession } from '@/lib/auth'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { status } = await req.json()

    await dbConnect()

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )

    if (!updatedBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json(updatedBooking)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await dbConnect()

    const deletedBooking = await Booking.findByIdAndDelete(id)

    if (!deletedBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Booking deleted successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
