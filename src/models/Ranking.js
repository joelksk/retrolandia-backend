import mongoose from 'mongoose'

const rankingSchema = new mongoose.Schema({
  gameId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Game', 
    required: true 
  },
  username: { type: String, required: true },
  password: { type: String, required: true },
  score: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now }
});

rankingSchema.index({ game: 1, score: -1 });

export default mongoose.model('Ranking', rankingSchema);