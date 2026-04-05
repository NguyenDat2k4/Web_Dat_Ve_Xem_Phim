import mongoose from 'mongoose'

const NewsCommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: String,
  content: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
})

const NewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title.'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  content: {
    type: String,
    required: [true, 'Please provide article content.'],
  },
  thumbnail: {
    type: String,
    required: [true, 'Please provide a thumbnail URL.'],
  },
  videoUrl: {
    type: String, // For Trailers (YouTube Embed URL)
    default: '',
  },
  category: {
    type: String,
    enum: ['Khuyến mãi', 'Tin điện ảnh', 'Sự kiện'],
    default: 'Tin điện ảnh',
  },
  author: {
    type: String,
    default: 'CineMax Admin',
  },
  comments: [NewsCommentSchema],
  views: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

// Clear cached model to ensure fresh schema
if (mongoose.models.News) {
  mongoose.deleteModel('News')
}

export default mongoose.model('News', NewsSchema)
