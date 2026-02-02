import Comment from '../models/Comment.js';
import Game from '../models/Game.js';

export const addComment = async (req, res) => {
  try {
    const { gameId, author, body, rating } = req.body;

    const previousVote = await Comment.findOne({ gameId, author, rating: { $ne: null } });
    
    const canVote = !previousVote && rating !== null && rating > 0;

    const newComment = await Comment.create({
      gameId,
      author,
      body,
      rating: canVote ? rating : null,
      isFirstReview: canVote
    });

    if (canVote) {
      const game = await Game.findById(gameId);
      if (game) {
        const currentAvg = game.rating.average || 0;
        const currentCount = game.rating.count || 0;

        const newCount = currentCount + 1;
        const newAverage = ((currentAvg * currentCount) + rating) / newCount;

        game.rating.average = Number(newAverage.toFixed(1));
        game.rating.count = newCount;
        await game.save();
      }
    }

    res.status(201).json(newComment);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getCommentsByGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    
    const comments = await Comment.find({ gameId }).sort({ createdAt: -1 }).lean();

    const reviews = await Comment.find({ gameId, isFirstReview: true }).lean();

    const enrichedComments = comments.map(comment => {
      const userVote = reviews.find(r => r.author === comment.author);
      return {
        ...comment,
        userGameRating: userVote ? userVote.rating : null
      };
    });

    res.json(enrichedComments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};