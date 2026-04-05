import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Room from '@/models/Room'
import { getSession } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const cinemaId = searchParams.get('cinemaId')

    await dbConnect()

    const filter = cinemaId ? { cinema: cinemaId } : {}
    const rooms = await Room.find(filter).populate('cinema', 'name')

    return NextResponse.json(rooms)
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
    await dbConnect()

    const room = await Room.create(body)
    return NextResponse.json(room, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
