import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Combo from '@/models/Combo'
import { getSession } from '@/lib/auth'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, price, description, image, isActive } = await request.json()

    await dbConnect()
    const combo = await Combo.findByIdAndUpdate(
      id,
      { name, price, description, image, isActive },
      { new: true }
    )

    if (!combo) {
      return NextResponse.json({ error: 'Combo not found' }, { status: 404 })
    }

    return NextResponse.json(combo)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const combo = await Combo.findByIdAndDelete(id)

    if (!combo) {
      return NextResponse.json({ error: 'Combo not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Combo deleted successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
