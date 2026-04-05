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

    const news = await News.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)

    return NextResponse.json(news)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
