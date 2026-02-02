import Ranking from '../models/Ranking.js'
import PendingRanking from '../models/PendingRanking.js'
import bcrypt from 'bcrypt'

export const addRanking = async (req, res) => {
  try {
    const { gameId, username, score, password } = req.body;

    if (!gameId || !username || score === undefined || !password) {
      return res.status(400).json({ msg: 'Faltan datos' });
    }

    const newScore = new Ranking({
      gameId,
      username,
      score,
      password
    });

    await newScore.save();
    res.status(201).json(newScore);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

export const addPendingRanking = async (req, res) => {
  try {
        const { username, score, password, screenshot, gameId, slug } = req.body;
        const existingEntry = await Ranking.findOne({ username });

        if (!username || !score || !screenshot ||  !slug || !password) {
            return res.status(400).json({ msg: "Faltan datos críticos." });
        }

        if (existingEntry) {
          const isMatch = await bcrypt.compare(password, existingEntry.password);
          
            if (!isMatch) {
                return res.status(400).json({ 
                  error: "Password incorrecto. Si eres nuevo, usa otro nombre..." 
                });
              }
        }
        
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newSubmission = new PendingRanking({
            username,
            score: parseInt(score),
            password: hashedPassword,
            screenshot,
            gameId,
            slug
        });

        await newSubmission.save();
        res.status(201).json({ msg: "Récord enviado a revisión." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al procesar el envío." });
    }
}

export const getRankingsByGame = async (req, res) => {
  try {
    const rankings = await Ranking.find({ gameId: req.params.gameId })
      .sort({ score: -1 })
      .limit(20);
    res.json(rankings);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

