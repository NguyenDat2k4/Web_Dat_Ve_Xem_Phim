import mongoose from 'mongoose'

const ShowtimeSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: [true, 'Please provide a movie for this showtime.'],
  },
  cinema: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cinema',
    required: [true, 'Please provide a cinema for this showtime.'],
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Please provide a room for this showtime.'],
  },

  date: {
    type: String,
    required: [true, 'Please provide a date (YYYY-MM-DD)'],
  },
  times: {
    type: [String],
    required: [true, 'Please provide at least one showtime (HH:MM)'],
    default: []
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price for this showtime.'],
    default: 80000
  }
}, {
  timestamps: true,
})

// Clear cached model to ensure fresh schema
if (mongoose.models.Showtime) {
  mongoose.deleteModel('Showtime')
}

export default mongoose.model('Showtime', ShowtimeSchema)
