import mongoose from 'mongoose'
import bcryptjs from 'bcryptjs'

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name.'],
    trim: true,
  },
  avatar: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    required: [true, 'Please provide your email.'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: false, // Optional for social login
    minlength: 6,
    select: false,
  },
  provider: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local',
  },
  providerId: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'staff'],
    default: 'user',
  },
  usedPromotions: {
    type: [String],
    default: [],
  },
  points: {
    type: Number,
    default: 0,
  },
  rank: {
    type: String,
    enum: ['Silver', 'Gold', 'Diamond'],
    default: 'Silver',
  },
  totalSpent: {
    type: Number,
    default: 0,
  },
  watchlist: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Movie',
    default: [],
  },
  notifications: [{
    title: String,
    message: String,
    type: { type: String, enum: ['info', 'success', 'promo', 'rank'], default: 'info' },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    link: String
  }],
  redeemedRewards: [{
    reward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reward'
    },
    code: String,
    redeemedAt: {
      type: Date,
      default: Date.now
    },
    isUsed: {
      type: Boolean,
      default: false
    }
  }],
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, {
  timestamps: true,
})

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string) {
  return await bcryptjs.compare(candidatePassword, this.password)
}

// Clear cached model to ensure fresh schema during development
if (mongoose.models.User) {
  mongoose.deleteModel('User')
}

const UserModel = mongoose.model('User', UserSchema)
export default UserModel
