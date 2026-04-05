import mongoose from 'mongoose'
import bcryptjs from 'bcryptjs'

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name.'],
    trim: true,
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
    required: [true, 'Please provide a password.'],
    minlength: 6,
    select: false, // Don't return password by default
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
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
