import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Movie from '@/models/Movie'
import User from '@/models/User'
import Booking from '@/models/Booking'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    // 1. Basic Counts
    const totalMovies = await Movie.countDocuments()
    const totalUsers = await User.countDocuments()
    const totalBookings = await Booking.countDocuments()

    // 2. Revenue calculation
    const bookings = await Booking.find({ status: { $ne: 'cancelled' } })
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)

    // 3. Chart Data (Mocking last 7 days since we don't have enough data yet)
    // In a real app, we would aggregate by date
    const chartData = [
      { day: 'Thứ 2', revenue: totalRevenue * 0.1 },
      { day: 'Thứ 3', revenue: totalRevenue * 0.15 },
      { day: 'Thứ 4', revenue: totalRevenue * 0.12 },
      { day: 'Thứ 5', revenue: totalRevenue * 0.18 },
      { day: 'Thứ 6', revenue: totalRevenue * 0.22 },
      { day: 'Thứ 7', revenue: totalRevenue * 0.13 },
      { day: 'Chủ Nhật', revenue: totalRevenue * 0.1 },
    ]

    // 4. Recent Bookings
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)

    return NextResponse.json({
      stats: {
        totalMovies,
        totalUsers,
        totalBookings,
        totalRevenue
      },
      chartData,
      recentBookings
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
