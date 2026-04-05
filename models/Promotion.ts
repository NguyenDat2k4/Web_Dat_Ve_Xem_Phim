import mongoose from 'mongoose'

const PromotionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide the promotion title.'],
  },
  description: {
    type: String,
    required: [true, 'Please provide the description.'],
  },
  iconName: {
    type: String,
    required: [true, 'Please provide the icon name (lucide-react).'],
  },
  colorClass: {
    type: String,
    default: 'bg-primary/20 text-primary',
  },
}, {
  timestamps: true,
})

export default mongoose.models.Promotion || mongoose.model('Promotion', PromotionSchema)
