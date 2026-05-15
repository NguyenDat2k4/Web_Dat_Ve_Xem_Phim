import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Promotion from '@/models/Promotion'
import { getSession } from '@/lib/auth'

async function checkAdmin() {
  const session = await getSession()
  return session && session.user.role === 'admin'
}

export async function GET() {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  try {
    await dbConnect()
    const promotions = await Promotion.find({}).sort({ createdAt: -1 })
    return NextResponse.json(promotions)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const data = await request.json()
    await dbConnect()
    const promotion = await Promotion.create(data)
    return NextResponse.json(promotion, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    await dbConnect()
    await Promotion.findByIdAndDelete(id)
    return NextResponse.json({ message: 'Deleted successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
