import mongoose from 'mongoose'

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a user for this review.'],
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: [true, 'Please provide a movie for this review.'],
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating (1-5).'],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: [true, 'Please provide a comment.'],
    maxlength: [500, 'Comment cannot be more than 500 characters'],
  },
}, {
  timestamps: true,
})

// Prevent multiple reviews from the same user for the same movie
ReviewSchema.index({ user: 1, movie: 1 }, { unique: true })

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema)
