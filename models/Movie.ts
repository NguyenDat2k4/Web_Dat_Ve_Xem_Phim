import mongoose from 'mongoose'

const MovieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for this movie.'],
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  image: {
    type: String,
    required: [true, 'Please provide an image URL for this movie.'],
  },
  rating: {
    type: Number,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  totalRatingValue: {
    type: Number,
    default: 0,
  },
  duration: {
    type: String,
    required: [true, 'Please provide the duration (e.g., 120 mins)'],
  },
  genre: {
    type: String,
    required: [true, 'Please provide the genre'],
  },
  trailerUrl: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  isComingSoon: {
    type: Boolean,
    default: false,
  },
  releaseDate: {
    type: String,
  },
  featured: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
})

// Clear cached model to ensure fresh schema
if (mongoose.models.Movie) {
  mongoose.deleteModel('Movie')
}

const MovieModel = mongoose.model('Movie', MovieSchema)
export default MovieModel
