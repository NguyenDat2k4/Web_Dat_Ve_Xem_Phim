import mongoose from 'mongoose'

const CinemaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide the cinema name.'],
  },
  address: {
    type: String,
    required: [true, 'Please provide the cinema address.'],
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  openTime: {
    type: String,
    default: "08:00 - 23:00",
  },
  image: {
    type: String,
    required: [true, 'Please provide an image URL for the cinema.'],
  },
  rating: {
    type: Number,
    default: 0,
  },
  screens: {
    type: Number,
    default: 1,
  },
}, {
  timestamps: true,
})

export default mongoose.models.Cinema || mongoose.model('Cinema', CinemaSchema)
