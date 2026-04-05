import mongoose from 'mongoose'

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide the room name.'],
  },
  cinema: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cinema',
    required: [true, 'Please provide the cinema for this room.'],
  },
  type: {
    type: String,
    enum: ['2D', '3D', 'IMAX', '4DX', 'Gold Class'],
    default: '2D',
  },
  capacity: {
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
if (mongoose.models.Room) {
  mongoose.deleteModel('Room')
}

export default mongoose.models.Room || mongoose.model('Room', RoomSchema)
