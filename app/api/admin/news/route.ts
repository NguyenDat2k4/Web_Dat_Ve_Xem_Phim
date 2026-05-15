import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import News from '@/models/News'
import { getSession } from '@/lib/auth'
import slugify from 'slugify'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const news = await News.find({}).sort({ createdAt: -1 })
    return NextResponse.json(news)
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

    const { title, content, thumbnail, videoUrl, category } = await request.json()

    if (!title || !content || !thumbnail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await dbConnect()

    // Generate unique slug
    let slug = slugify(title, { lower: true, strict: true, locale: 'vi' })
    let slugExists = await News.findOne({ slug })
    let counter = 1
    const originalSlug = slug
    while (slugExists) {
      slug = `${originalSlug}-${counter}`
      slugExists = await News.findOne({ slug })
      counter++
    }

    const news = await News.create({
      title,
      slug,
      content,
      thumbnail,
      videoUrl,
      category,
      author: session.user.name,
    })

    return NextResponse.json(news, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
