import mongoose from 'mongoose'


const ReportSchema = new mongoose.Schema({
  gameTitle: String,
  errorType: { type: String, enum: ['rom_error', 'visual_bug',  'other'] },
  description: String,
  status: { type: String, default: 'unread' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Report', ReportSchema);