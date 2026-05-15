import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import crypto from 'crypto'
import bcryptjs from 'bcryptjs'

export async function POST(req: Request) {
  try {
    await dbConnect()
    const { token, password } = await req.json()

    // Hash token nhận được để so khớp với database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    })

    if (!user) {
      return NextResponse.json({ error: 'Token không hợp lệ hoặc đã hết hạn' }, { status: 400 })
    }

    // Hash mật khẩu mới
    const salt = await bcryptjs.genSalt(10)
    user.password = await bcryptjs.hash(password, salt)
    
    // Xóa các trường token
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined

    await user.save()

    return NextResponse.json({ message: 'Mật khẩu đã được cập nhật thành công.' })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
