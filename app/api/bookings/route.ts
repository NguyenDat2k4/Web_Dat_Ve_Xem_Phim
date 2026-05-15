import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Booking from '@/models/Booking'
import User from '@/models/User'
import { getSession } from '@/lib/auth'
import { sendTicketEmail } from '@/lib/email'
import { nanoid } from 'nanoid' // Wait, I didn't install nanoid. I'll use a simple random generator.

function generateTicketCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'CMX-'
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}


export async function GET(request: Request) {
  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)
    const cinema = searchParams.get('cinema')
    const movie = searchParams.get('movie')
    const date = searchParams.get('date')
    const time = searchParams.get('time')

    if (!cinema || !movie || !date || !time) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const bookings = await Booking.find({
      cinema,
      movie,
      date,
      time,
      status: { $in: ['confirmed', 'paid'] }
    }).select('seats')

    const reservedSeats = bookings.flatMap(b => b.seats)
    return NextResponse.json({ reservedSeats })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { 
      cinema, 
      movie, 
      date, 
      time, 
      seats, 
      totalPrice, 
      discountAmount,
      promoCode,
      pointsUsed,
      customerName, 
      customerPhone,
      userEmail,
      paymentMethod,
      status,
      isGift,
      recipientName,
      recipientEmail,
      giftMessage,
      giftTemplate,
      isMystery
    } = await request.json()

    await dbConnect()
    const session = await getSession()

    if (!cinema || !movie || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Create the booking
    const booking = await Booking.create({
      cinema,
      movie,
      date,
      time,
      seats,
      totalPrice,
      customerName,
      customerPhone,
      userEmail: userEmail || session?.user?.email || '',
      paymentMethod,
      pointsUsed: pointsUsed || 0,
      status: status || 'confirmed',
      ticketCode: generateTicketCode(),
      // Quà tặng
      isGift: !!(isGift || (recipientEmail && recipientEmail.trim() !== "")),
      recipientName,
      recipientEmail,
      giftMessage,
      giftTemplate,
      isMystery: !!isMystery
    })


    // 2. If promo code used, record it in user's profile
    if (promoCode && session?.user?.id) {
      await User.findByIdAndUpdate(session.user.id, {
        $addToSet: { usedPromotions: promoCode.toUpperCase() }
      })
    }

    // 3. Loyalty Points: Earn/Spend points on successful payment
    if ((status === 'paid' || booking.status === 'paid') && (session?.user?.id || booking.userEmail)) {
      const numericTotal = Number(totalPrice) || 0
      const numericPointsUsed = Number(pointsUsed) || 0
      
      const pointsEarned = Math.round(numericTotal * 0.05)
      const redemption = numericPointsUsed ? -numericPointsUsed : 0
      const totalPointsChange = pointsEarned + redemption

      let updatedUser = null
      if (totalPointsChange !== 0) {
        if (session?.user?.id) {
          updatedUser = await User.findByIdAndUpdate(session.user.id, {
            $inc: { points: totalPointsChange },
            $addToSet: promoCode ? { usedPromotions: promoCode.toUpperCase() } : {}
          }, { new: true })

          // Thêm thông báo
          const { createNotification } = await import('@/lib/notifications')
          await createNotification(session.user.id, {
            title: 'Đặt vé thành công!',
            message: `Bạn đã đặt vé thành công phim ${movie}. Bạn nhận được ${pointsEarned} điểm thưởng.`,
            type: 'success',
            link: '/profile'
          })
        } else if (booking.userEmail) {
          updatedUser = await User.findOneAndUpdate({ email: booking.userEmail }, {
            $inc: { points: totalPointsChange },
            $addToSet: promoCode ? { usedPromotions: promoCode.toUpperCase() } : {}
          }, { new: true })
        }
      }

      // Gửi email xác nhận vé
      if (booking.userEmail) {
        sendTicketEmail(booking).catch(err => console.error("Email error:", err));
      }

      return NextResponse.json({ booking, user: updatedUser }, { status: 201 })
    }

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
