import mongoose from 'mongoose'

const PromotionSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please provide a promotion code.'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description.'],
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Please provide a discount type.'],
  },
  value: {
    type: Number,
    required: [true, 'Please provide a discount value.'],
  },
  minAmount: {
    type: Number,
    default: 0,
  },
  expiryDate: {
    type: Date,
    required: [true, 'Please provide an expiry date.'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

// Clear cached model to ensure fresh schema
if (mongoose.models.Promotion) {
  mongoose.deleteModel('Promotion')
}

export default mongoose.model('Promotion', PromotionSchema)
