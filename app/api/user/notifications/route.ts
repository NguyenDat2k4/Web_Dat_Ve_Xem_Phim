import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { getSession } from '@/lib/auth'

export async function GET() {
    try {
        await dbConnect()
        const session = await getSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await User.findById(session.user.id).select('notifications')
        const sortedNotifications = user?.notifications.sort((a: any, b: any) => b.createdAt - a.createdAt) || []
        
        return NextResponse.json(sortedNotifications)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        await dbConnect()
        const session = await getSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { notificationId, markAll } = await request.json()

        if (markAll) {
            await User.updateOne(
                { _id: session.user.id },
                { $set: { "notifications.$[].isRead": true } }
            )
        } else if (notificationId) {
            await User.updateOne(
                { _id: session.user.id, "notifications._id": notificationId },
                { $set: { "notifications.$.isRead": true } }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
