import mongoose from 'mongoose';
import Game from '../models/Game.js';
import updateGameMetadata from '../utils/fetchMetadata.js';
import dotenv from 'dotenv';
import axios from 'axios'

dotenv.config();

const run = async () => {
  try {

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    const gamesToUpdate = await Game.find({ 
      $or: [{ description: "" }, { description: { $exists: false } }] 
    });

    console.log(`🔍 Se encontraron ${gamesToUpdate.length} juegos para procesar...`);

    for (const game of gamesToUpdate) {
      const searchTitle = game.title.replace(/_/g, ' '); 
      
      console.log(`⏳ Procesando: ${searchTitle} (${game.platform})...`);

      try {
        const response = await axios.get(`https://api.rawg.io/api/games`, {
          params: {
            key: process.env.RAWG_API_KEY,
            search: searchTitle,
            platforms: game.platformId,
            page_size: 1
          }
        });

        if (response.data.results.length > 0) {
          const gameData = response.data.results[0];
          
          const detailResp = await axios.get(`https://api.rawg.io/api/games/${gameData.id}?key=${process.env.RAWG_API_KEY}`);
          const detail = detailResp.data;
          const externalRating = detail.rating || 0; 

          await Game.findByIdAndUpdate(game._id, {
            $set: {
              description: detail.description_raw || "Descripcion no dispnible",
              image: detail.background_image,
              releaseYear: detail.released ? detail.released.split('-')[0] : 'N/A',
              genre: detail.genres?.map(g => g.name) || [],
              developer: detail.developers?.[0]?.name || 'Unknown',
              "rating.external": externalRating
            }
          });

          console.log(`${searchTitle} actualizado con éxito.`);
        } else {
          console.log(`No se encontró nada para: "${searchTitle}" (ID Plataforma: ${game.platformId})`);
        }

        await new Promise(resolve => setTimeout(resolve, 600));

      } catch (err) {
        console.error(`Error con ${game.title}:`, err.message);
      }
    }
    console.log("¡Proceso finalizado!");
  } catch (error) {
    console.error("Error general:", error);
  }
};

run();