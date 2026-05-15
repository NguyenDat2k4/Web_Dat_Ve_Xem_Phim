const mongoose = require('mongoose');

async function findSpecificBooking() {
    try {
        // Sử dụng đúng URI từ file .env
        await mongoose.connect('mongodb://localhost:27017/movietickets');
        
        const BookingSchema = new mongoose.Schema({}, { strict: false });
        const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema, 'bookings');

        // Tìm chính xác đơn hàng vừa tạo trong test
        const targetId = '69eba5c608e4afa8980b4f36';
        const booking = await Booking.findById(targetId);
        
        console.log("------------------------------------------");
        if (booking) {
            console.log("FOUND BOOKING IN 'movietickets':", targetId);
            console.log("Movie:", booking.movie);
            console.log("IsGift:", booking.isGift);
            console.log("RecipientEmail:", booking.recipientEmail);
            console.log("RecipientName:", booking.recipientName);
            console.log("UserEmail:", booking.userEmail);
        } else {
            console.log("BOOKING NOT FOUND IN 'movietickets':", targetId);
            // Tìm đơn mới nhất để xem tên ID
            const latest = await Booking.findOne().sort({ _id: -1 });
            if (latest) {
                console.log("LATEST ID IN DB:", latest._id);
                console.log("LATEST RecipientEmail:", latest.recipientEmail);
            }
        }
        console.log("------------------------------------------");

        await mongoose.connection.close();
    } catch (error) {
        console.error("Error:", error);
    }
}

findSpecificBooking();
