import mongoose from 'mongoose'

const SuggestionSchema = new mongoose.Schema({
  gameTitle: String,
  description: String,
  platform: String,
  userEmail: String,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Suggestion', SuggestionSchema);