import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Movie from "@/models/Movie";
import Cinema from "@/models/Cinema";

/**
 * Phân tích doanh thu theo thời gian và rạp
 */
export async function getRevenueData() {
  await dbConnect();
  
  // Lấy dữ liệu 6 tháng gần nhất
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const bookings = await Booking.find({
    status: { $in: ['paid', 'confirmed'] },
    createdAt: { $gte: sixMonthsAgo }
  }).sort({ createdAt: 1 });

  console.log(`Found ${bookings.length} bookings for analytics.`);

  // Nhóm theo tháng (dùng định dạng YYYY-MM để dễ sắp xếp)
  const monthlyRevenue: Record<string, number> = {};
  // Nhóm theo rạp
  const cinemaRevenue: Record<string, number> = {};
  // Nhóm theo phim
  const movieRevenue: Record<string, number> = {};

  bookings.forEach(b => {
    const month = new Date(b.createdAt).toLocaleString('vi-VN', { month: 'long' });
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + b.totalPrice;
    cinemaRevenue[b.cinema] = (cinemaRevenue[b.cinema] || 0) + b.totalPrice;
    movieRevenue[b.movie] = (movieRevenue[b.movie] || 0) + b.totalPrice;
  });

  return {
    monthlyRevenue: Object.entries(monthlyRevenue).map(([name, value]) => ({ name, value })),
    cinemaRevenue: Object.entries(cinemaRevenue).map(([name, value]) => ({ name, value })),
    movieRevenue: Object.entries(movieRevenue).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 5),
    totalRevenue: bookings.reduce((sum, b) => sum + b.totalPrice, 0),
    totalBookings: bookings.length
  };
}

/**
 * Lấy tỷ lệ lấp đầy rạp (giả định dựa trên số ghế đã đặt / tổng số ghế - tính toán đơn giản)
 */
export async function getOccupancyStats() {
  await dbConnect();
  // Trong thực tế sẽ cần join với Showtime và Room để có tổng số ghế
  // Ở đây chúng ta trả về số lượng vé bán ra theo từng rạp để AI phân tích mật độ
  const stats = await Booking.aggregate([
    { $match: { status: 'paid' } },
    { $group: { 
        _id: "$cinema", 
        totalTickets: { $sum: { $size: "$seats" } },
        avgOrderValue: { $avg: "$totalPrice" }
      } 
    }
  ]);

  return stats.map(s => ({
    cinema: s._id,
    ticketsSold: s.totalTickets,
    avgRevenuePerOrder: Math.round(s.avgOrderValue)
  }));
}

export const adminAiTools = [
  {
    name: "getRevenueData",
    description: "Lấy dữ liệu doanh thu chi tiết theo tháng, theo rạp và theo phim trong 6 tháng qua.",
    parameters: { type: "OBJECT", properties: {} }
  },
  {
    name: "getOccupancyStats",
    description: "Lấy thống kê về số lượng vé bán ra và giá trị đơn hàng trung bình của từng rạp.",
    parameters: { type: "OBJECT", properties: {} }
  }
];
