import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import morgan from 'morgan';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import logger from './src/utils/logger.js';
import recipeRoutes from './src/routes/v1/recipe.js';

dotenv.config();
const app = express();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info('Connected to mongoDB');
  })
  .catch((err) => {
    logger.error(`Error connecting to mongoDB ${err}`);
  });

app.use(bodyParser.json());
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

const corsOptions = {
  origin: process.env.CORS_ORIGINS.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Access-Control-Allow-Credentials',
  ],
};
app.use(cors(corsOptions));
app.use('/api/v1/recipe', recipeRoutes);

app.listen(process.env.PORT || 5001, () => {
  logger.info(`Server running on port ${process.env.PORT}`);
});
