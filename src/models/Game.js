import mongoose from 'mongoose';


const gameSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: {type: String, unique: true, required: true},
  description: {type: String, default: ''},
  platform: { type: String, required: true },
  platformId: {type: String, required: true},
  system: { type: String, required: true },
  image: { type: String, default: ''},
  romUrl: { type: String, required: true },
  genres: [String], default: [],
  firstLetter: String,
  developer: String,
  releaseYear: Number,
  playCount: { type: Number, default: 0 },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    external: { type: Number, default: 0 }
  },
  rankingType: { 
  type: String, 
  enum: ['score', 'time', 'none'], 
  default: 'none' 
  },
  isActiveRanking: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Game', gameSchema);