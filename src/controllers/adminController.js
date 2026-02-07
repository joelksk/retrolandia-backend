import PendingRanking from '../models/PendingRanking.js';
import Ranking from '../models/Ranking.js';
import Report from '../models/Report.js'
import Suggestion from '../models/Suggestion.js'


export const getPendingScores = async (req, res) => {
    try {
        const scores = await PendingRanking.find().sort({ createdAt: 1 });
        res.json(scores);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const approveScore = async (req, res) => {
    try {
        const { id } = req.params;
        const pending = await PendingRanking.findById(id);

        if (!pending) return res.status(404).json({ message: "Solicitud no encontrada" });

        const existingRecord = await Ranking.findOne({ 
            username: pending.username, 
            gameId: pending.gameId 
        });

        if (!existingRecord) {
            const newEntry = new Ranking({
                username: pending.username,
                score: pending.score,
                gameId: pending.gameId,
                password: pending.password
            });

        await newEntry.save();
        } else if (pending.score > existingRecord.score) {
            existingRecord.score = pending.score;
            existingRecord.updatedAt = Date.now();
            await existingRecord.save();
        }

        await PendingRanking.findByIdAndDelete(id);
        res.json({ msg: "Score aprobado con éxito" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const rejectScore = async (req, res) => {
    try {
        await PendingRanking.findByIdAndDelete(req.params.id);
        res.json({ message: "Solicitud rechazada y eliminada" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getReports = async (req, res) => {
    try {
        const reports = await Report.find().sort({ createdAt: 1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteReport = async (req, res) => {
    try {
        await Report.findByIdAndDelete(req.params.id);
        res.json({ message: "Reporte eliminado" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getSuggestions = async (req, res) => {
    try {
        const suggestions = await Suggestion.find().sort({ createdAt: 1 });
        res.json(suggestions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteSuggestion = async (req, res) => {
    try {
        await Suggestion.findByIdAndDelete(req.params.id);
        res.json({ message: "Reporte eliminado" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}