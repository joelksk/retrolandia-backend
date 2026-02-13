import Game from '../models/Game.js'
import axios from 'axios'
import slugify from 'slugify'
import dotenv from 'dotenv'
import { translate } from '@vitalets/google-translate-api';

dotenv.config();

const PLATFORMS = [
    {
        library: 'retro-score-ksk-segaMD',
        ext: '.smd',
        platform: 'Sega Genesis',
        platformId: 167,
        system: 'segaMD'
    },
    {
        library: 'retro-score-ksk-nes',
        ext: '.nes',
        platform: 'NES',
        platformId: 49,
        system: 'nes'
    },
    {
        library: 'retro-score-ksk-snes',
        ext: '.snes',
        platform: 'SNES',
        platformId: 79,
        system: 'snes'
    }
]

//Upload Roms in Bd
export const uploadGameRoms = async (req, res) => {
  try { 
    let totalCount = 0;

    for (const platform of PLATFORMS) {
        const count = await loadRoms(platform);
        totalCount += count;
    }

    res.json({ mensaje: `Sincronización finalizada. ${totalCount} juegos nuevos agregados.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const loadRoms = async (platform) => {
    const itemID = platform.library;
    const url = `https://archive.org/metadata/${itemID}`;
    const response = await axios.get(url);
    
    // Filtramos ROMs
    const roms = response.data.files.filter(f => f.name.endsWith(platform.ext));

    let count = 0;
    
    // Procesamos uno por uno o en lotes
    for (const rom of roms) {
        const fileName = rom.name.split('/').pop();
        const tituloLimpio = fileName
            .replace(platform.ext, '')
            .replace(/\(.*\)/g, '')
            .trim();

        const newSlug = slugify(tituloLimpio.replace(/_/g, ' '), { 
            lower: true, 
            strict: true, 
            replacement: '-' 
        }) + '-' + platform.system;

        const result = await Game.updateOne(
            { slug: newSlug, system: platform.system }, 
            { 
                $setOnInsert: {
                    title: tituloLimpio,
                    platform: platform.platform,
                    platformId: platform.platformId,
                    system: platform.system,
                    firstLetter: tituloLimpio.charAt(0).toUpperCase(),
                    romUrl: `/proxy-rom/download/${itemID}/${encodeURIComponent(rom.name)}`,
                }
            }, 
            { upsert: true }
        );

        if (result.upsertedCount > 0) {
            count++;
        }
    }

    return count;
}

export const uploadDataRawg = async (req, res) => {
  try {
    const gamesToUpdate = await Game.find({ 
      $or: [{ description: "" }, { description: { $exists: false } }] 
    });

    let count = 0;
    for (const game of gamesToUpdate) {
      const searchTitle = game.title.replace(/_/g, ' '); 

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
          const textTranslated = await translateDescription(detail.description_raw)

          await Game.findByIdAndUpdate(game._id, {
            $set: {
              description: textTranslated || "Descripcion no dispnible",
              image: detail.background_image,
              releaseYear: detail.released ? detail.released.split('-')[0] : 'N/A',
              genre: detail.genres?.map(g => g.name) || [],
              developer: detail.developers?.[0]?.name || 'Unknown',
              "rating.external": externalRating
            }
          });
          console.log(`${searchTitle} actualizado con éxito.`);
          count++;
        } else {
          console.log(`No se encontró nada para: "${searchTitle}" (ID Plataforma: ${game.platformId})`);
        }

        await new Promise(resolve => setTimeout(resolve, 600));

      } catch (err) {
        console.error(`Error con ${game.title}:`, err.message);
      }
    }
        res.json({ message: `Sincronización finalizada. ${count} juegos actualizados.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const translateDescription = async (textEN) => {
  try {
    const { text } = await translate(textEN, { to: 'es' });
    return text;
  } catch (error) {
    console.error("Error en Google Translate:", error);
    return textEN;
  }
}

