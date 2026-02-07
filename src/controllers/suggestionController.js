import Suggestion from '../models/Suggestion.js'

export const createSuggestion = async (req, res) => {
try {
    const { gameTitle, description, platform, userEmail} = req.body;

    console.log("Cuerpo del pedido: " ,req.body);

    if (!description ) {
      return res.status(400).json({ msg: 'Completa la descripcion por favor.' });
    }

    const newSuggestion = new Suggestion({
      gameTitle,
      description,
      platform,
      userEmail
    });

    await newSuggestion.save();
    res.status(201).json(newSuggestion);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
}