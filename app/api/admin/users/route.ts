import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import bcryptjs from 'bcryptjs'

export async function GET(req: Request) {
  try {
    await dbConnect()
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''

    const query: any = {}
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }
    if (role) {
      query.role = role
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await User.countDocuments(query)

    return NextResponse.json({
      users,
      total,
      pages: Math.ceil(total / limit)
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect()
    const data = await req.json()

    const existingUser = await User.findOne({ email: data.email })
    if (existingUser) {
      return NextResponse.json({ error: 'Email đã tồn tại' }, { status: 400 })
    }

    const salt = await bcryptjs.genSalt(10)
    const hashedPassword = await bcryptjs.hash(data.password, salt)

    const user = await User.create({
      ...data,
      password: hashedPassword,
      isVerified: true // Admin tạo thì mặc định xác thực
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    await dbConnect()
    const data = await req.json()
    const { id, ...updateData } = data

    if (updateData.password) {
      const salt = await bcryptjs.genSalt(10)
      updateData.password = await bcryptjs.hash(updateData.password, salt)
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true })
    if (!user) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID' }, { status: 400 })
    }

    const user = await User.findByIdAndDelete(id)
    if (!user) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Đã xóa người dùng' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
