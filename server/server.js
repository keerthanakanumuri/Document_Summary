import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import summarizeRoute from './routes/summarize.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


const allowedOrigins = [
  'https://document-summary-x6c2.vercel.app',
  'https://document-summary-nine.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:5178',
];


app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked origin: ${origin}`));
      }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })
);

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Document Summary Assistant API is running.',
  });
});

app.use('/api', summarizeRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});