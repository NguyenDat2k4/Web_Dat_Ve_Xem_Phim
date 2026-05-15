import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Promotion from '@/models/Promotion'
import User from '@/models/User'
import { getSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập để sử dụng mã' }, { status: 401 })
    }

    const { code, totalAmount } = await request.json()
    if (!code) {
      return NextResponse.json({ error: 'Mã không được để trống' }, { status: 400 })
    }

    await dbConnect()

    // 1. Find promotion
    const promotion = await Promotion.findOne({ code: code.toUpperCase(), isActive: true })
    if (!promotion) {
      return NextResponse.json({ error: 'Mã giảm giá không tồn tại hoặc đã hết hạn' }, { status: 404 })
    }

    // 2. Check expiry
    if (new Date(promotion.expiryDate) < new Date()) {
      return NextResponse.json({ error: 'Mã giảm giá đã hết hạn' }, { status: 400 })
    }

    // 3. Check min amount
    if (totalAmount < (promotion.minAmount || 0)) {
      return NextResponse.json({ 
        error: `Mã này chỉ áp dụng cho đơn hàng từ ${promotion.minAmount.toLocaleString()}đ trở lên` 
      }, { status: 400 })
    }

    // 4. Check if user already used this code (One-time use)
    const user = await User.findById(session.user.id)
    if (user && user.usedPromotions && user.usedPromotions.includes(code.toUpperCase())) {
      return NextResponse.json({ error: 'Bạn đã sử dụng mã này cho lần đặt trước đó' }, { status: 400 })
    }

    // Calculate discount
    let discountAmount = 0
    if (promotion.discountType === 'percentage') {
      discountAmount = Math.round((totalAmount * promotion.value) / 100)
    } else {
      discountAmount = promotion.value
    }

    return NextResponse.json({
      code: promotion.code,
      discountType: promotion.discountType,
      value: promotion.value,
      discountAmount,
      newTotal: Math.max(0, totalAmount - discountAmount)
    })

  } catch (error: any) {
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}
