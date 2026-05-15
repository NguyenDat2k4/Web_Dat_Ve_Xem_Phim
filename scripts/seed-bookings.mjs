import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const BookingSchema = new mongoose.Schema({
  cinema: String,
  movie: String,
  date: String,
  time: String,
  seats: [String],
  totalPrice: Number,
  status: { type: String, default: 'paid' },
  ticketCode: { type: String, unique: true },
  createdAt: Date
});

const MovieSchema = new mongoose.Schema({ title: String });
const CinemaSchema = new mongoose.Schema({ name: String });

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "");
    console.log("Connected to MongoDB...");

    const Booking = mongoose.model('Booking', BookingSchema);
    const Movie = mongoose.model('Movie', MovieSchema);
    const Cinema = mongoose.model('Cinema', CinemaSchema);

    const movies = await Movie.find({});
    const cinemas = await Cinema.find({});

    if (movies.length === 0 || cinemas.length === 0) {
      console.log("Cần có ít nhất 1 phim và 1 rạp trong DB để tạo dữ liệu.");
      return;
    }

    console.log(`Đang tạo 50 đơn hàng mẫu...`);

    const fakeBookings = [];
    const now = new Date();

    for (let i = 0; i < 50; i++) {
      const randomMovie = movies[Math.floor(Math.random() * movies.length)].title;
      const randomCinema = cinemas[Math.floor(Math.random() * cinemas.length)].name;
      
      const randomDate = new Date();
      randomDate.setMonth(now.getMonth() - Math.floor(Math.random() * 6));
      randomDate.setDate(Math.floor(Math.random() * 28) + 1);

      fakeBookings.push({
        cinema: randomCinema,
        movie: randomMovie,
        date: randomDate.toISOString().split('T')[0],
        time: "19:00",
        seats: ["A1", "A2"],
        totalPrice: Math.floor(Math.random() * 200000) + 90000,
        status: 'paid',
        ticketCode: `SEED-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now()}-${i}`,
        createdAt: randomDate
      });
    }

    await Booking.insertMany(fakeBookings);
    console.log("Đã tạo thành công 50 đơn hàng mẫu!");
    
    await mongoose.disconnect();
  } catch (error) {
    console.error("Lỗi khi seed dữ liệu:", error);
  }
}

seed();
