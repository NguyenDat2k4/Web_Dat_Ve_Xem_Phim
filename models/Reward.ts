import mongoose from 'mongoose'

const RewardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for the reward.'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description.'],
  },
  pointsRequired: {
    type: Number,
    required: [true, 'Please provide points required.'],
  },
  image: {
    type: String,
    required: [true, 'Please provide an image URL.'],
  },
  type: {
    type: String,
    enum: ['voucher', 'combo', 'gift'],
    default: 'voucher',
  },
  value: {
    type: Number, // Discount value (percent or amount)
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  stock: {
    type: Number,
    default: 100,
  }
}, {
  timestamps: true,
})

// Clear cached model to ensure fresh schema
if (mongoose.models.Reward) {
  mongoose.deleteModel('Reward')
}

export default mongoose.models.Reward || mongoose.model('Reward', RewardSchema)
