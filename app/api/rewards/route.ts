import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Reward from '@/models/Reward'
import User from '@/models/User'
import { getSession } from '@/lib/auth'
import { nanoid } from 'nanoid' // Wait, I'll use a random generator if nanoid is not available

function generateRewardCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'GIFT-'
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function GET() {
  try {
    await dbConnect()
    const rewards = await Reward.find({ isActive: true, stock: { $gt: 0 } })
    return NextResponse.json(rewards)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { rewardId } = await request.json()
    await dbConnect()

    const user = await User.findById(session.user.id)
    const reward = await Reward.findById(rewardId)

    if (!reward || !reward.isActive || reward.stock <= 0) {
      return NextResponse.json({ error: 'Reward not available' }, { status: 404 })
    }

    if (user.points < reward.pointsRequired) {
      return NextResponse.json({ error: 'Not enough points' }, { status: 400 })
    }

    // Process redemption
    const rewardCode = generateRewardCode()
    
    // Update User
    user.points -= reward.pointsRequired
    user.redeemedRewards.push({
      reward: reward._id,
      code: rewardCode,
      redeemedAt: new Date(),
      isUsed: false
    })

    // Update Notification
    user.notifications.push({
      title: 'Đổi quà thành công!',
      message: `Bạn đã đổi thành công ${reward.title}. Mã ưu đãi của bạn là: ${rewardCode}`,
      type: 'promo',
      createdAt: new Date()
    })

    await user.save()

    // Update Reward stock
    reward.stock -= 1
    await reward.save()

    return NextResponse.json({ 
        success: true, 
        message: 'Redeemed successfully', 
        code: rewardCode,
        remainingPoints: user.points
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
