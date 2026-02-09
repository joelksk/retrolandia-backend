import Game from '../models/Game.js'
import axios from 'axios'
import slugify from 'slugify'

const BASE_URL = process.env.API_BASE || 'http://localhost:5000'

const RETRO_PLATFORMS = [
  { id: 49,  name: "NES", slug: "nintendo-nes", system: "nes" },
  { id: 7,   name: "SNES", slug: "nintendo-snes", system: "snes" },
  { id: 83,  name: "Nintendo 64", slug: "nintendo-64", system: "n64" },
  { id: 105, name: "GameCube", slug: "nintendo-gamecube", system: "gc" },
  { id: 26,  name: "Game Boy", slug: "game-boy", system: "gb" },
  { id: 43,  name: "Game Boy Color", slug: "game-boy-color", system: "gbc" },
  { id: 24,  name: "Game Boy Advance", slug: "game-boy-advance", system: "gba" },
  { id: 9,   name: "Nintendo DS", slug: "nintendo-ds", system: "nds" },
  { id: 167, name: "Sega Genesis", slug: "sega-genesis", system: "segaMD" },
  { id: 107, name: "Sega Saturn", slug: "sega-saturn", system: "saturn" },
  { id: 106, name: "Sega Dreamcast", slug: "sega-dreamcast", system: "dreamcast" },
  { id: 77,  name: "Game Gear", slug: "sega-game-gear", system: "gamegear" },
  { id: 27,  name: "PlayStation 1", slug: "playstation1", system: "psx" },
  { id: 15,  name: "PlayStation 2", slug: "playstation2", system: "ps2" },
  { id: 17,  name: "PSP", slug: "psp", system: "psp" },
  { id: 21,  name: "Arcade", slug: "arcade", system: "arcade" },
  { id: 119, name: "Neo Geo", slug: "neo-geo", system: "neogeo" },
  { id: 28,  name: "Atari 2600", slug: "atari-2600", system: "atari2600" }
];


export const getGames = async (req, res) => {
    try {
        const { char, platform, genre, limit, sort } = req.query;
        let query = {};

        if (char) query.firstLetter = char.toUpperCase();
        if (platform) query.platform = platform;
        if (genre) query.genre = genre;

        let apiQuery = Game.find(query);

        if (sort === 'playCount') {
          apiQuery = apiQuery.sort({ playCount: -1 });
        } else {
          apiQuery = apiQuery.sort({ title: 1 });
        }

        if (limit) {
          apiQuery = apiQuery.limit(parseInt(limit));
        }

        const games = await apiQuery;
        res.json(games);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export const getGameBySlug = async (req, res) => {
    try {
        const game = await Game.findOne({ slug: req.params.slug });
        if (!game) return res.status(404).json({ msg: "No existe el juego" });
        
        res.json({ game, rankings: [] });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export const incrementPlayCount = async (req, res) => {
  try {
    const { id } = req.params;
    const game = await Game.findByIdAndUpdate(
      id, 
      { $inc: { playCount: 1 } }, 
      { new: true }
    );
    res.json({ success: true, playCount: game.playCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const rateGame = async (req, res) => {
  try {
    const { id } = req.params;
    const { userRating } = req.body;

    const game = await Game.findById(id);
    if (!game) return res.status(404).json({ message: "Game not found" });

    const totalVotes = game.rating.count + 1;
    const newAverage = ((game.rating.average * game.rating.count) + userRating) / totalVotes;

    game.rating.average = newAverage;
    game.rating.count = totalVotes;

    await game.save();
    res.json({ success: true, average: game.rating.average });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//Upload games in Bd of SegaMD
export const uploadGamesSega = async (req, res) => {
  try { 
    const itemID = 'retro-score-ksk-segaMD';
    const url = `https://archive.org/metadata/${itemID}`;
    const response = await axios.get(url);
    
    const roms = response.data.files.filter(f => 
      f.name.endsWith('.smd')
    ).slice(0, 20);

    const juegosNuevos = roms.map(rom => {
      const fileName = rom.name.split('/').pop();
      const tituloLimpio = fileName
        .replace('.smd', '')
        .replace(/\(.*\)/g, '')
        .trim();

      return {
        title: tituloLimpio,
        platform: 'Sega Genesis',
        platformId: '167',
        system: 'segaMD',
        slug: slugify(tituloLimpio.replace(/_/g, ' '), { lower: true, strict: true, replacement: '-' }),
        firstLetter: tituloLimpio.charAt(0).toUpperCase(),
        romUrl: `/proxy-rom/download/${itemID}/${encodeURIComponent(rom.name)}`,
      };
    });

    let count = 0;
    for (const juego of juegosNuevos) {
      const exist = await Game.find({slug: juego.slug});
      if(exist.length == 0) {
      await Game.updateOne({ title: juego.title }, { $set: juego }, { upsert: true });
      count ++
      }else {
        console.log("El juego: " + juego.title + ", ya esxiste");
      }
    }

    res.json({ mensaje: `Sincronizados ${count} juegos de Sega.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const uploadGamesNes = async (req, res) => {
  try {
    const itemID = 'retro-score-ksk-nes';
    const url = `https://archive.org/metadata/${itemID}`;
    const response = await axios.get(url);
    
    const roms = response.data.files.filter(f => 
      f.name.endsWith('.neogeo')
    ).slice(0, 20);

    const juegosNuevos = roms.map(rom => {
      const fileName = rom.name.split('/').pop();
      const tituloLimpio = fileName
        .replace('.nes', '')
        .replace(/\(.*\)/g, '')
        .trim();

      return {
        title: tituloLimpio,
        platform: 'NES',
        platformId: '49',
        system: 'nes',
        slug: slugify(tituloLimpio.replace(/_/g, ' '), { lower: true, strict: true, replacement: '-' }),
        firstLetter: tituloLimpio.charAt(0).toUpperCase(),
        romUrl: `/proxy-rom/download/${itemID}/${encodeURIComponent(rom.name)}`,
      };
    });

    let count = 0;
    for (const juego of juegosNuevos) {
      const exist = await Game.find({slug: juego.slug});
        if(exist.length == 0) {
        await Game.updateOne({ title: juego.title }, { $set: juego }, { upsert: true });
        count ++
        }else {
          console.log("El juego: " + juego.title + ", ya esxiste");
      }
    }

    res.json({ mensaje: `Sincronizados ${juegosNuevos.length} juegos de Nintendo.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

export const uploadGamesSnes = async (req, res) => {
  try {
    const itemID = 'retro-score-ksk-snes';
    const url = `https://archive.org/metadata/${itemID}`;
    const response = await axios.get(url);
    
    const roms = response.data.files.filter(f => 
      f.name.endsWith('.snes')
    ).slice(0, 20);

    const juegosNuevos = roms.map(rom => {
      const fileName = rom.name.split('/').pop();
      const tituloLimpio = fileName
        .replace('.snes', '')
        .replace(/\(.*\)/g, '')
        .trim();

      return {
        title: tituloLimpio,
        platform: 'SNES',
        platformId: '7',
        system: 'snes',
        slug: slugify(tituloLimpio.replace(/_/g, ' '), { lower: true, strict: true, replacement: '-' }),
        firstLetter: tituloLimpio.charAt(0).toUpperCase(),
        romUrl: `/proxy-rom/download/${itemID}/${encodeURIComponent(rom.name)}`,
      };
    });

    let count = 0;
    for (const juego of juegosNuevos) {
      const exist = await Game.find({slug: juego.slug});
        if(exist.length == 0) {
        await Game.updateOne({ title: juego.title }, { $set: juego }, { upsert: true });
        count ++
        }else {
          console.log("El juego: " + juego.title + ", ya esxiste");
      }
    }

    res.json({ mensaje: `Sincronizados ${juegosNuevos.length} juegos de Nintendo.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
