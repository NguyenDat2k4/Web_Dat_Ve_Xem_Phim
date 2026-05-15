import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { login } from '@/lib/auth'
import bcryptjs from 'bcryptjs'
import crypto from 'crypto'
import { sendVerificationEmail } from '@/lib/mail'

export async function POST(request: Request) {
  try {
    await dbConnect()
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    const salt = await bcryptjs.genSalt(10)
    const hashedPassword = await bcryptjs.hash(password, salt)

    const verificationTokenRaw = crypto.randomBytes(32).toString('hex')
    const verificationToken = crypto.createHash('sha256').update(verificationTokenRaw).digest('hex')
    
    await User.create({ 
      name, 
      email, 
      password: hashedPassword,
      role: email === 'admin@cinemax.com' ? 'admin' : 'user',
      verificationToken,
      isVerified: false
    })

    // Gửi email xác thực với token CHƯA mã hóa
    try {
      await sendVerificationEmail(email, verificationTokenRaw)
    } catch (err) {
      console.error("Verify email error:", err)
    }

    return NextResponse.json({ message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.' }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
