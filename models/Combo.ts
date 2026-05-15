import mongoose from 'mongoose'

const ComboSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide the combo name.'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Please provide the combo price.'],
  },
  description: {
    type: String, // e.g., "1 Bắp + 1 Nước"
    required: [true, 'Please provide a description.'],
  },
  image: {
    type: String,
    required: [true, 'Please provide an image URL.'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

// Clear cached model to ensure fresh schema
if (mongoose.models.Combo) {
  mongoose.deleteModel('Combo')
}

export default mongoose.models.Combo || mongoose.model('Combo', ComboSchema)
