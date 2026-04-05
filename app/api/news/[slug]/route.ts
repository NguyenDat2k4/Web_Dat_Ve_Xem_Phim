import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import News from '@/models/News'
import { getSession } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    await dbConnect()
    
    // Increment view count
    const news = await News.findOneAndUpdate(
      { slug, isActive: true },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('comments.user', 'name')

    if (!news) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    return NextResponse.json(news)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Post comment to news article
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập để bình luận' }, { status: 401 })
    }

    const { content } = await request.json()
    if (!content) {
      return NextResponse.json({ error: 'Nội dung bình luận không được để trống' }, { status: 400 })
    }

    await dbConnect()
    const news = await News.findOne({ slug })

    if (!news) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const newComment = {
      user: session.user.id,
      userName: session.user.name,
      content: content,
    }

    news.comments.push(newComment)
    await news.save()

    return NextResponse.json({ message: 'Đã gửi bình luận thành công', comment: newComment }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
