import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { getSession } from '@/lib/auth'

export async function PATCH(req: Request) {
  try {
    await dbConnect()
    const session = await getSession()
    const currentUser = session?.user

    if (!currentUser) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
    }

    const { name, avatar } = await req.json()

    const user = await User.findByIdAndUpdate(
      currentUser.id,
      { name, avatar },
      { new: true }
    )

    if (!user) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 })
    }

    // Trả về dữ liệu người dùng mới (không bao gồm password)
    const updatedUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      points: user.points,
      rank: user.rank
    }

    return NextResponse.json(updatedUser)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
