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

    // 2. Revenue calculation (Actual)
    const bookings = await Booking.find({ status: 'paid' })
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)

    // 3. Real Revenue Aggregation (Last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const revenueByDay = await Booking.aggregate([
      { 
        $match: { 
          status: 'paid',
          createdAt: { $gte: sevenDaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // Format for Chart (Ensuring names like "Thứ 2" etc. or dates)
    const chartData = revenueByDay.map(d => ({
        day: new Date(d._id).toLocaleDateString('vi-VN', { weekday: 'short' }),
        date: d._id,
        revenue: d.revenue
    }))

    // 4. Movie Popularity Aggregation (By Seat Count or Booking Count)
    const movieSales = await Booking.aggregate([
        { $match: { status: 'paid' } },
        {
          $group: {
            _id: "$movie",
            value: { $sum: 1 }, // Number of bookings
            revenue: { $sum: "$totalPrice" }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 }
    ]).then(res => res.map(m => ({ name: m._id, value: m.revenue })))

    // 5. Recent Bookings
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(8)

    return NextResponse.json({
      stats: {
        totalMovies,
        totalUsers,
        totalBookings,
        totalRevenue
      },
      chartData,
      movieSales,
      recentBookings
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
