import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  
  // FIXED: Changed required to false and provided a clean default fallback
  radius: { type: Number, default: 500 } 
});

RoomSchema.index({ location: '2dsphere' });

const Room = mongoose.model('Room', RoomSchema);
export default Room;