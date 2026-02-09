import axios from 'axios';
import Game from '../models/Game.js'

const updateGameMetadata = async (gameId, gameTitle, platformId) => {
  try {
    const response = await axios.get(`https://api.rawg.io/api/games`, {
      params: {
        key: process.env.RAWG_API_KEY,
        search: gameTitle,
        page_size: 5,
        platform: platformId
      }
    });

    if (response.data.results.length > 0) {
      const data = response.data.results[0];
      
      const detailResp = await axios.get(`https://api.rawg.io/api/games/${data.id}?key=${process.env.RAWG_API_KEY}`);
      const detail = detailResp.data;
      const textTranslated = translateDescription(detail.description_raw)

      await Game.findByIdAndUpdate(gameId, {
        description: textTranslated,
        releaseYear: detail.released ? detail.released.split('-')[0] : 'N/A',
        developer: detail.developers?.[0]?.name || 'Retro Classic',
        genre: detail.genres?.map(g => g.name) || [],
        image: detail.background_image
      });
      
      console.log(`Metadatos actualizados para: ${gameTitle}`);
    }
  } catch (error) {
    console.error(`Error con ${gameTitle}:`, error.message);
  }
};

const translateDescription = async (textEN) => {
  try {
    const res = await fetch("https://libretranslate.de/translate", {
      method: "POST",
      body: JSON.stringify({
        q: textEN,
        source: "en",
        target: "es",
        format: "text"
      }),
      headers: { "Content-Type": "application/json" }
    });

    const data = await res.json();
    return data.translatedText;
  } catch (error) {
    console.error("Error traduciendo:", error);
    return textEN;
  }
}

export default updateGameMetadata