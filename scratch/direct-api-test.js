const mongoose = require('mongoose');

async function directApiTest() {
    try {
        await mongoose.connect('mongodb://localhost:27017/movietickets');
        
        const BookingSchema = new mongoose.Schema({}, { strict: false });
        const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema, 'bookings');

        // Giả lập dữ liệu mà Client gửi lên
        const mockBookingData = {
            movie: "Dune: Part Two (Direct Test)",
            cinema: "CineMax Test",
            date: "2026-04-25",
            time: "20:00",
            seats: ["A1"],
            totalPrice: 100000,
            customerName: "Tester",
            customerPhone: "0999999999",
            userEmail: "admin@cinemax.com",
            isGift: true,
            recipientName: "Người Nhận May Mắn",
            recipientEmail: "bas761116@gmail.com",
            giftMessage: "Món quà từ API Test!",
            giftTemplate: "birthday"
        };

        // Giả lập logic trong app/api/payment/vnpay/route.ts
        const booking = await Booking.create({
            movie: mockBookingData.movie,
            cinema: mockBookingData.cinema,
            date: mockBookingData.date,
            time: mockBookingData.time,
            seats: mockBookingData.seats,
            totalPrice: mockBookingData.totalPrice,
            customerName: mockBookingData.customerName,
            customerPhone: mockBookingData.customerPhone,
            userEmail: mockBookingData.userEmail,
            paymentMethod: 'vnpay',
            status: 'pending',
            ticketCode: 'TEST-DIRECT-API',
            // Quà tặng
            isGift: mockBookingData.isGift,
            recipientName: mockBookingData.recipientName,
            recipientEmail: mockBookingData.recipientEmail,
            giftMessage: mockBookingData.giftMessage,
            giftTemplate: mockBookingData.giftTemplate
        });

        console.log("------------------------------------------");
        console.log("CREATED BOOKING VIA DIRECT API:");
        console.log("ID:", booking._id);
        console.log("IsGift:", booking.isGift);
        console.log("RecipientEmail:", booking.recipientEmail);
        console.log("------------------------------------------");

        await mongoose.connection.close();
    } catch (error) {
        console.error("Error:", error);
    }
}

directApiTest();
