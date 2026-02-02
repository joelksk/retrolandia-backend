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

      await Game.findByIdAndUpdate(gameId, {
        description: detail.description_raw,
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

export default updateGameMetadata