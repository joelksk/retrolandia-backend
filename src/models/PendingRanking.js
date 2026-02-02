import mongoose from 'mongoose';

const pendingRankingSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true,
        trim: true 
    },
    score: { 
        type: Number, 
        required: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    screenshot: { 
        type: String, 
        required: true 
    },
    gameId: { 
        type: String, 
        required: true 
    },
    slug: {
        type: String,
        required: true
    }
}, { 
    timestamps: true
});
 
export default mongoose.model('PendingRanking', pendingRankingSchema);