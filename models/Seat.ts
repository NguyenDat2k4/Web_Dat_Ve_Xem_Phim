import mongoose from 'mongoose'

const SeatSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Please provide a room for this seat.'],
  },
  row: {
    type: String,
    required: [true, 'Please provide the seat row.'],
  },
  number: {
    type: Number,
    required: [true, 'Please provide the seat number.'],
  },
  type: {
    type: String,
    enum: ['regular', 'vip', 'couple'],
    default: 'regular',
  },
  status: {
    type: String,
    enum: ['active', 'maintenance'],
    default: 'active',
  },
  x: {
    type: Number,
    default: 0, // X position in grid (optional, for visual map)
  },
  y: {
    type: Number,
    default: 0, // Y position in grid (optional)
  }
}, {
  timestamps: true,
})

// Clear cached model to ensure fresh schema
if (mongoose.models.Seat) {
  mongoose.deleteModel('Seat')
}

export default mongoose.models.Seat || mongoose.model('Seat', SeatSchema)
