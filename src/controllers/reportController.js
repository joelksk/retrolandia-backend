import Report from '../models/Report.js'

export const createReport = async (req, res) => {
try {
    const { gameTitle, errorType, description, } = req.body;

    if (!description ) {
      return res.status(400).json({ msg: 'Faltan datos' });
    }

    const newReport = new Report({
      gameTitle,
      description,
      errorType
    });

    await newReport.save();
    res.status(201).json(newReport);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
}