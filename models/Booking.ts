import mongoose from 'mongoose'

const BookingSchema = new mongoose.Schema({
  cinema: {
    type: String,
    required: [true, 'Please provide the cinema.'],
  },
  movie: {
    type: String,
    required: [true, 'Please provide the movie.'],
  },
  date: {
    type: String,
    required: [true, 'Please provide the date.'],
  },
  time: {
    type: String,
    required: [true, 'Please provide the time.'],
  },
  seats: {
    type: [String],
    default: [],
  },
  totalPrice: {
    type: Number,
    default: 0,
  },
  customerName: {
    type: String,
    default: '',
  },
  customerPhone: {
    type: String,
    default: '',
  },
  userEmail: {
    type: String,
    default: '', // Store the logged-in user's email if available
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'confirmed',
  },
}, {
  timestamps: true,
})

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema)
