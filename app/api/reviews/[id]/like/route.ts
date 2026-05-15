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

        await dbConnect()
        const userId = session.user.id
        const review = await Review.findById(id)

        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 })
        }

        const likeIndex = review.likes.indexOf(userId)
        if (likeIndex > -1) {
            review.likes.splice(likeIndex, 1)
        } else {
            review.likes.push(userId)
        }

        await review.save()
        return NextResponse.json({ likes: review.likes.length })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
