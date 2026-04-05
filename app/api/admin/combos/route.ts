import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Combo from '@/models/Combo'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const combos = await Combo.find({}).sort({ createdAt: -1 })
    return NextResponse.json(combos)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, price, description, image } = await request.json()

    if (!name || !price || !description || !image) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await dbConnect()
    const combo = await Combo.create({
      name,
      price,
      description,
      image,
    })

    return NextResponse.json(combo, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
