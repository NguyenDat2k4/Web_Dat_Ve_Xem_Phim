import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Movie from '@/models/Movie'
import { getSession } from '@/lib/auth'

// GET: Get user's watchlist
export async function GET() {
    try {
        await dbConnect()
        const session = await getSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await User.findById(session.user.id).populate('watchlist')
        return NextResponse.json(user?.watchlist || [])
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST: Toggle movie in watchlist
export async function POST(request: Request) {
    try {
        await dbConnect()
        const session = await getSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { movieId } = await request.json()
        if (!movieId) {
            return NextResponse.json({ error: 'Movie ID required' }, { status: 400 })
        }

        const user = await User.findById(session.user.id)
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const index = user.watchlist.indexOf(movieId)
        let added = false

        if (index > -1) {
            user.watchlist.splice(index, 1)
        } else {
            user.watchlist.push(movieId)
            added = true
        }

        await user.save()

        return NextResponse.json({ 
            success: true, 
            added, 
            message: added ? 'Đã thêm vào danh sách yêu thích' : 'Đã xóa khỏi danh sách yêu thích' 
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
