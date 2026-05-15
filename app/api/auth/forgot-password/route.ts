import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import crypto from 'crypto'
import { sendResetPasswordEmail } from '@/lib/mail'

export async function POST(req: Request) {
  try {
    await dbConnect()
    const { email } = await req.json()

    const user = await User.findOne({ email })
    if (!user) {
      // Vì lý do bảo mật, không cho biết email có tồn tại hay không
      return NextResponse.json({ message: 'Nếu email tồn tại, một hướng dẫn đã được gửi đi.' })
    }

    // Tạo token ngẫu nhiên
    const resetToken = crypto.randomBytes(32).toString('hex')
    
    // Lưu token đã hash vào database
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    user.resetPasswordExpires = new Date(Date.now() + 3600000) // 1 giờ

    await user.save()

    // Gửi email với token CHƯA hash
    try {
      await sendResetPasswordEmail(email, resetToken)
      return NextResponse.json({ message: 'Email đặt lại mật khẩu đã được gửi.' })
    } catch (error) {
      user.resetPasswordToken = undefined
      user.resetPasswordExpires = undefined
      await user.save()
      console.error("Mail error:", error)
      return NextResponse.json({ error: 'Không thể gửi email. Vui lòng thử lại sau.' }, { status: 500 })
    }

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
