import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import News from '@/models/News'
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

    const { title, content, thumbnail, videoUrl, category, isActive } = await request.json()

    await dbConnect()
    const news = await News.findByIdAndUpdate(
      id,
      { title, content, thumbnail, videoUrl, category, isActive },
      { new: true }
    )

    if (!news) {
      return NextResponse.json({ error: 'News not found' }, { status: 404 })
    }

    return NextResponse.json(news)
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
    const news = await News.findByIdAndDelete(id)

    if (!news) {
      return NextResponse.json({ error: 'News not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'News deleted successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
