import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import News from '@/models/News'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')
    const featured = searchParams.get('featured') === 'true'

    await dbConnect()
    
    let query: any = { isActive: true }
    if (category && category !== 'All') {
      query.category = category
    }
    const q = searchParams.get('q')
    if (q) {
      query.title = { $regex: q, $options: 'i' }
    }

    const pageParam = searchParams.get('page')
    
    if (pageParam) {
      const pageNum = parseInt(pageParam)
      const limitNum = parseInt(searchParams.get('limit') || '12')
      const skip = (pageNum - 1) * limitNum

      const [news, total] = await Promise.all([
        News.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
        News.countDocuments(query)
      ])

      return NextResponse.json({
        news,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      })
    } else {
      const news = await News.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(searchParams.get('limit') || '20'))

      return NextResponse.json(news)
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
