import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { login } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    await dbConnect()
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const isMatch = await (user as any).comparePassword(password)
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const userData = { id: user._id.toString(), name: user.name, email: user.email, role: (user as any).role }
    await login(userData)

    return NextResponse.json(userData)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
