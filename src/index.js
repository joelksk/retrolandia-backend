import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import {createProxyMiddleware} from 'http-proxy-middleware'
import gameRouter from './routes/gameRoutes.js'
import rankingRoutes from './routes/rankingRoutes.js'
import commentRoutes from './routes/commentRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import userRouter from './routes/userRoutes.js'
import suggestionRouter from './routes/suggestionRoutes.js'
import reportRouter from './routes/reportRoutes.js'


dotenv.config();
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL
}));
app.use(express.json());

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('¡Conectado exitosamente a MongoDB Atlas!');
  } catch (error) {
    console.error(' Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
};

connectDB();

app.use('/proxy-rom', createProxyMiddleware({
  target: 'https://archive.org',
  changeOrigin: true,
  followRedirects: true,
  onProxyRes: function (proxyRes) {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    // Permitite que elemulador pida partes especificas del archivo
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Range';
    proxyRes.headers['Access-Control-Expose-Headers'] = 'Content-Range, Content-Length, Accept-Ranges';
  }
}));

app.get('/', (req, res) => {
  res.send('Servidor de Mundo Retro Gamer funcionando 🎮');
});


app.use('/api/games', gameRouter);
app.use('/api/rankings', rankingRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', userRouter);
app.use('/api/reports', reportRouter);
app.use('/api/suggestions', suggestionRouter);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});