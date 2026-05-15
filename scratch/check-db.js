const mongoose = require('mongoose');

async function checkLatestBooking() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/cinemax');
        
        const BookingSchema = new mongoose.Schema({}, { strict: false });
        const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema, 'bookings');

        const latest = await Booking.findOne().sort({ createdAt: -1 });
        
        console.log("------------------------------------------");
        console.log("LATEST BOOKING IN DATABASE:");
        if (latest) {
            console.log("ID:", latest._id);
            console.log("Movie:", latest.movie);
            console.log("IsGift:", latest.isGift);
            console.log("RecipientEmail:", latest.recipientEmail);
            console.log("UserEmail:", latest.userEmail);
        } else {
            console.log("No booking found.");
        }
        console.log("------------------------------------------");

        await mongoose.connection.close();
    } catch (error) {
        console.error("Error:", error);
    }
}

checkLatestBooking();
