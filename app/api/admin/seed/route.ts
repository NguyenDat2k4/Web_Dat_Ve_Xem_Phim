import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Movie from "@/models/Movie";
import Cinema from "@/models/Cinema";

export async function GET() {
  try {
    await dbConnect();
    
    const movies = await Movie.find({});
    const cinemas = await Cinema.find({});

    if (movies.length === 0 || cinemas.length === 0) {
      return NextResponse.json({ error: "Cần có phim và rạp trong DB." });
    }

    const fakeBookings = [];
    const now = new Date();

    for (let i = 0; i < 60; i++) {
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
        totalPrice: Math.floor(Math.random() * 300000) + 100000,
        status: 'paid',
        ticketCode: `AUTO-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${i}`,
        createdAt: randomDate
      });
    }

    await Booking.insertMany(fakeBookings);
    return NextResponse.json({ success: true, message: "Đã tạo 60 đơn hàng mẫu thành công!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
