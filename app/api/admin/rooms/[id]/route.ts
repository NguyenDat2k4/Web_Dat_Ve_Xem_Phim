import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Room from '@/models/Room'
import { getSession } from '@/lib/auth'

export async function GET(
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

    const room = await Room.findById(id).populate('cinema', 'name')
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 })

    return NextResponse.json(room)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

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
    const body = await req.json()

    await dbConnect()

    const room = await Room.findByIdAndUpdate(id, body, { new: true })
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 })

    return NextResponse.json(room)
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
    await Room.findByIdAndDelete(id)

    return NextResponse.json({ message: 'Room deleted' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
