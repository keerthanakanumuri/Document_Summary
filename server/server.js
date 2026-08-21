// server.js — Main entry point for the backend
// This file starts the Express server and connects all the routes.

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import summarizeRoute from './routes/summarize.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allow requests from our React frontend
// In development we allow any localhost port because Vite picks an available port
// In production this will be your deployed frontend URL
const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL]
  : [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:5177',
      'http://localhost:5178',
    ];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. Postman, curl) or from allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));

// Parse incoming JSON requests
app.use(express.json());

// Health check route — useful for deployment platforms to verify the server is running
app.get('/', (req, res) => {
  res.json({ message: 'Document Summary Assistant API is running.' });
});

// Main summarize route — handles file upload + AI summary
app.use('/api', summarizeRoute);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
