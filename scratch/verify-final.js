const mongoose = require('mongoose');

async function verifyFinalBooking() {
    try {
        await mongoose.connect('mongodb://localhost:27017/movietickets');
        
        const BookingSchema = new mongoose.Schema({}, { strict: false });
        const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema, 'bookings');

        // Tìm đơn hàng bằng Ticket Code
        const booking = await Booking.findOne({ ticketCode: 'CMX-QYBQSJ' });
        
        console.log("------------------------------------------");
        if (booking) {
            console.log("SUCCESS! FOUND BOOKING WITH TICKET CODE: CMX-QYBQSJ");
            console.log("Recipient Email:", booking.recipientEmail);
            console.log("Is Gift:", booking.isGift);
            console.log("Recipient Name:", booking.recipientName);
            console.log("Message:", booking.giftMessage);
        } else {
            console.log("BOOKING NOT FOUND WITH CODE: CMX-QYBQSJ");
            // Thử tìm theo ID mới nhất
            const latest = await Booking.findOne().sort({ _id: -1 });
            console.log("LATEST ID IN DB:", latest ? latest._id : "None");
            console.log("LATEST TicketCode:", latest ? latest.ticketCode : "N/A");
            console.log("LATEST RecipientEmail:", latest ? latest.recipientEmail : "N/A");
        }
        console.log("------------------------------------------");

        await mongoose.connection.close();
    } catch (error) {
        console.error("Error:", error);
    }
}

verifyFinalBooking();
