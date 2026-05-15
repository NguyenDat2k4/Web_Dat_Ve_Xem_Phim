import dbConnect from '../lib/mongodb'
import Reward from '../models/Reward'

const rewards = [
  {
    title: 'Voucher 50k - Tất cả phim',
    description: 'Giảm ngay 50.000 VNĐ cho bất kỳ giao dịch đặt vé nào tại CineMax.',
    pointsRequired: 500,
    image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=800&q=80',
    type: 'voucher',
    value: 50000,
    stock: 50
  },
  {
    title: 'Combo Bắp Nước Solo',
    description: '01 Bắp lớn (Vị ngọt/mặn) + 01 Nước ngọt lớn tùy chọn.',
    pointsRequired: 350,
    image: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80',
    type: 'combo',
    value: 0,
    stock: 100
  },
  {
    title: 'Voucher 20% - Toàn hệ thống',
    description: 'Giảm 20% tổng hóa đơn đặt vé (tối đa 100k). Áp dụng cho mọi cụm rạp.',
    pointsRequired: 800,
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80',
    type: 'voucher',
    value: 20,
    stock: 30
  },
  {
    title: 'Combo Cặp Đôi Hoàn Hảo',
    description: '01 Bắp khổng lồ + 02 Nước ngọt lớn + 01 Snack khoai tây.',
    pointsRequired: 600,
    image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=800&q=80',
    type: 'combo',
    value: 0,
    stock: 40
  }
]

async function seedRewards() {
  try {
    await dbConnect()
    await Reward.deleteMany({})
    await Reward.insertMany(rewards)
    console.log('✅ Seeded rewards successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding rewards:', error)
    process.exit(1)
  }
}

seedRewards()
