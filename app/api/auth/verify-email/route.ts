import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    await dbConnect()
    const { token } = await req.json()

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const user = await User.findOne({
      verificationToken: hashedToken,
      isVerified: false
    })

    if (!user) {
      return NextResponse.json({ error: 'Token không hợp lệ hoặc tài khoản đã được xác thực.' }, { status: 400 })
    }

    user.isVerified = true
    user.verificationToken = undefined
    await user.save()

    return NextResponse.json({ message: 'Tài khoản đã được xác thực thành công.' })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
