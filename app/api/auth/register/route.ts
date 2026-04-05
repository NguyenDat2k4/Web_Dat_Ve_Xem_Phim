import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { login } from '@/lib/auth'
import bcryptjs from 'bcryptjs'

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

    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword,
      role: email === 'admin@cinemax.com' ? 'admin' : 'user'
    })
    
    // Auto-login after registration
    const userData = { id: user._id, name: user.name, email: user.email, role: user.role }
    await login(userData)

    return NextResponse.json(userData, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
