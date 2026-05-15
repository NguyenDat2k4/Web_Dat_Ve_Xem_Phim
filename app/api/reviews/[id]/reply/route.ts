import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Review from '@/models/Review'
import { getSession } from '@/lib/auth'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { comment } = await request.json()
        if (!comment) {
            return NextResponse.json({ error: 'Comment required' }, { status: 400 })
        }

        await dbConnect()
        const userId = session.user.id
        
        const review = await Review.findByIdAndUpdate(
            id,
            {
                $push: {
                    replies: {
                        user: userId,
                        comment,
                        createdAt: new Date()
                    }
                }
            },
            { new: true }
        ).populate('replies.user', 'name')

        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 })
        }

        return NextResponse.json(review.replies)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
