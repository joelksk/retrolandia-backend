import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  gameId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Game', 
    required: true,
    index: true
  },
  author: { type: String, required: true },
  body: { type: String, required: true },
  rating: { 
    type: Number, 
    default: null,
    min: 1,
    max: 10
  },
  isFirstReview: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { type: Date, default: Date.now }
});

commentSchema.index({ gameId: 1, author: 1, isFirstReview: 1 });
export default mongoose.model('Comment', commentSchema);