import dbConnect from "@/lib/mongodb";
import Movie from "@/models/Movie";
import Showtime from "@/models/Showtime";
import Cinema from "@/models/Cinema";

/**
 * Lấy danh sách phim đang chiếu hoặc sắp chiếu
 */
export async function getMovies() {
  await dbConnect();
  const movies = await Movie.find({}).sort({ releaseDate: -1 }).limit(10);
  return movies.map(m => ({
    title: m.title,
    genre: m.genre,
    duration: m.duration,
    rating: m.rating,
    isComingSoon: m.isComingSoon,
    description: m.description,
    id: m._id.toString()
  }));
}

/**
 * Tìm kiếm lịch chiếu của một phim cụ thể
 */
export async function getShowtimes(movieTitle: string) {
  await dbConnect();
  // Tìm phim theo tiêu đề (không phân biệt hoa thường)
  const movie = await Movie.findOne({ title: { $regex: movieTitle, $options: 'i' } });
  if (!movie) return { error: "Không tìm thấy phim này." };

  const showtimes = await Showtime.find({ movie: movie._id })
    .populate('cinema', 'name address')
    .sort({ date: 1 });

  return showtimes.map(s => ({
    cinema: (s.cinema as any).name,
    address: (s.cinema as any).address,
    date: s.date,
    times: s.times,
    price: s.price
  }));
}

/**
 * Lấy danh sách rạp chiếu phim
 */
export async function getCinemas() {
  await dbConnect();
  const cinemas = await Cinema.find({});
  return cinemas.map(c => ({
    name: c.name,
    address: c.address,
    openTime: c.openTime,
    phone: c.phone
  }));
}

// Định nghĩa khai báo hàm cho Gemini
export const aiTools = [
  {
    name: "getMovies",
    description: "Lấy danh sách các bộ phim đang chiếu hoặc sắp chiếu tại rạp CineMax.",
    parameters: {
      type: "OBJECT",
      properties: {},
    },
  },
  {
    name: "getShowtimes",
    description: "Tìm kiếm lịch chiếu (ngày, giờ, giá vé) của một bộ phim cụ thể.",
    parameters: {
      type: "OBJECT",
      properties: {
        movieTitle: {
          type: "STRING",
          description: "Tên bộ phim cần tìm lịch chiếu.",
        },
      },
      required: ["movieTitle"],
    },
  },
  {
    name: "getCinemas",
    description: "Lấy danh sách các cụm rạp CineMax kèm địa chỉ và thông tin liên hệ.",
    parameters: {
      type: "OBJECT",
      properties: {},
    },
  },
];
