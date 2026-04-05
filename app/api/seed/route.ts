import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Movie from '@/models/Movie';
import Cinema from '@/models/Cinema';
import Promotion from '@/models/Promotion';

const featuredMovies = [
  {
    title: "Người Nhện: Vũ Trụ Mới",
    genre: "Hành động, Phiêu lưu",
    duration: "140 phút",
    rating: 8.9,
    releaseDate: "2026",
    image: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=1920&q=80",
    description: "Một cuộc phiêu lưu xuyên đa vũ trụ với những anh hùng mới và thử thách chưa từng có.",
    featured: true
  },
  {
    title: "Bí Mật Đại Dương",
    genre: "Khoa học viễn tưởng",
    duration: "125 phút",
    rating: 8.5,
    releaseDate: "2026",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&q=80",
    description: "Khám phá những bí ẩn dưới đáy đại dương với công nghệ tương lai.",
    featured: true
  },
  {
    title: "Cuộc Chiến Vì Tình Yêu",
    genre: "Tình cảm, Hài hước",
    duration: "110 phút",
    rating: 8.2,
    releaseDate: "2026",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80",
    description: "Câu chuyện tình yêu lãng mạn giữa hai người từ hai thế giới khác biệt.",
    featured: true
  }
];

const nowPlayingMovies = [
  {
    title: "Người Nhện: Vũ Trụ Mới",
    image: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600&q=80",
    rating: 8.9,
    duration: "140 phút",
    genre: "Hành động",
    description: "Phim hành động siêu anh hùng hấp dẫn."
  },
  {
    title: "Bí Mật Đại Dương",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80",
    rating: 8.5,
    duration: "125 phút",
    genre: "Sci-Fi",
    description: "Khám phá thế giới đại dương bí ẩn."
  },
  {
    title: "Cuộc Chiến Vì Tình Yêu",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80",
    rating: 8.2,
    duration: "110 phút",
    genre: "Tình cảm",
    description: "Câu chuyện tình đầy cảm động."
  },
  {
    title: "Vương Quốc Bóng Tối",
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80",
    rating: 8.7,
    duration: "135 phút",
    genre: "Kinh dị",
    description: "Phim kinh dị rùng rợn."
  },
  {
    title: "Hành Trình Kỳ Diệu",
    image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&q=80",
    rating: 8.4,
    duration: "118 phút",
    genre: "Phiêu lưu",
    description: "Chuyến phiêu lưu đầy bất ngờ."
  },
  {
    title: "Gia Đình Siêu Nhân",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&q=80",
    rating: 8.1,
    duration: "105 phút",
    genre: "Hoạt hình",
    description: "Phim hoạt hình dành cho cả gia đình."
  }
];

const comingSoonMovies = [
  {
    title: "Chiến Binh Bóng Đêm",
    image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=600&q=80",
    rating: 9.0,
    duration: "150 phút",
    genre: "Hành động",
    releaseDate: "15/05/2026",
    isComingSoon: true,
    description: "Sự trỗi dậy của chiến binh bóng đêm."
  },
  {
    title: "Tình Yêu Vượt Thời Gian",
    image: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=600&q=80",
    rating: 8.8,
    duration: "120 phút",
    genre: "Tình cảm",
    releaseDate: "22/05/2026",
    isComingSoon: true,
    description: "Mối tình vượt qua không gian và thời gian."
  },
  {
    title: "Vũ Trụ Song Song",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80",
    rating: 8.6,
    duration: "145 phút",
    genre: "Sci-Fi",
    releaseDate: "01/06/2026",
    isComingSoon: true,
    description: "Những bí ẩn của vũ trụ song song."
  },
  {
    title: "Đảo Hoang Huyền Bí",
    image: "https://images.unsplash.com/photo-1559583985-c80d8ad9b29f?w=600&q=80",
    rating: 8.3,
    duration: "128 phút",
    genre: "Phiêu lưu",
    releaseDate: "10/06/2026",
    isComingSoon: true,
    description: "Khám phá hòn đảo huyền bí giữa biển khơi."
  }
];

const cinemas = [
  {
    name: "CineMax Vincom Bà Triệu",
    address: "Tầng 7, TTTM Vincom Center, 191 Bà Triệu, Hai Bà Trưng, Hà Nội",
    image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&q=80",
    rating: 4.8,
    screens: 8
  },
  {
    name: "CineMax Aeon Mall Long Biên",
    address: "Tầng 3, TTTM Aeon Mall, 27 Cổ Linh, Long Biên, Hà Nội",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80",
    rating: 4.7,
    screens: 10
  },
  {
    name: "CineMax Landmark 81",
    address: "Tầng B1, Landmark 81, 720A Điện Biên Phủ, Bình Thạnh, TP.HCM",
    image: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=800&q=80",
    rating: 4.9,
    screens: 12
  }
];

const promotions = [
  {
    title: "Thứ 3 Vui Vẻ",
    description: "Giảm 50% giá vé vào tất cả các ngày thứ 3 trong tuần",
    iconName: "Ticket",
    colorClass: "bg-primary/20 text-primary"
  },
  {
    title: "Combo Ưu Đãi",
    description: "Mua vé kèm combo bắp nước giảm ngay 30%",
    iconName: "Gift",
    colorClass: "bg-accent/20 text-accent"
  },
  {
    title: "Thanh Toán Online",
    description: "Giảm 10% khi thanh toán qua ví điện tử MoMo, ZaloPay",
    iconName: "CreditCard",
    colorClass: "bg-chart-2/20 text-chart-2"
  }
];

export async function GET() {
  try {
    await dbConnect();

    // Clear existing data
    await Movie.deleteMany({});
    await Cinema.deleteMany({});
    await Promotion.deleteMany({});

    // Combine all movies
    const allMovies = [
      ...featuredMovies,
      ...nowPlayingMovies.filter(m => !featuredMovies.find(fm => fm.title === m.title)),
      ...comingSoonMovies
    ];

    // Seed data
    await Movie.insertMany(allMovies);
    await Cinema.insertMany(cinemas);
    await Promotion.insertMany(promotions);

    return NextResponse.json({ message: 'Seeding successful!' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
