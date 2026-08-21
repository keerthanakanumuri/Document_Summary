// routes/summarize.js
// Handles POST /api/summarize
// Flow: receive file → extract text → AI summary → return JSON → delete temp file

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import extractText from '../services/extractText.js';
import summarizeWithAI from '../services/summarizeAI.js';

const router = express.Router();

// __dirname is not available in ES modules, so we recreate it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The folder where uploaded files are temporarily saved
const uploadDir = path.join(__dirname, '..', 'uploads');

// --- Multer configuration ---
// Multer handles multipart/form-data (file uploads)

const storage = multer.diskStorage({
  // Save files to the uploads/ folder
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  // Keep the original file extension so pdf-parse and Tesseract work correctly
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Only allow PDF and image files
function fileFilter(req, file, cb) {
  const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true); // accept the file
  } else {
    cb(new Error('Please upload a PDF, PNG, JPG or JPEG file.'), false);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

// --- Helper: delete a file safely ---
// We call this after processing to keep the uploads folder clean
function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    // Not a critical error — just log it
    console.error('Could not delete temp file:', err.message);
  }
}

// --- POST /api/summarize ---
router.post('/summarize', upload.single('document'), async (req, res) => {
  // multer puts the uploaded file info in req.file
  // req.body contains the other form fields (summaryLength)

  const uploadedFile = req.file;

  // If no file was received
  if (!uploadedFile) {
    return res.status(400).json({ error: 'Please select a document first.' });
  }

  const filePath = uploadedFile.path;
  const mimeType = uploadedFile.mimetype;
  const summaryLength = req.body.summaryLength || 'medium';

  console.log(`Processing: ${uploadedFile.originalname} | type: ${mimeType} | length: ${summaryLength}`);

  try {
    // Step 1: Extract text from the file
    console.log('Extracting text...');
    const { text, method } = await extractText(filePath, mimeType);
    console.log(`Text extracted via ${method}. Characters: ${text.length}`);

    // Step 2: Send text to Gemini for summarization
    console.log('Calling Gemini AI...');
    const { summary, keyPoints } = await summarizeWithAI(text, summaryLength);
    console.log('Summary generated successfully.');

    // Step 3: Delete the temp file — we no longer need it
    deleteFile(filePath);

    // Step 4: Send the result back to the frontend
    return res.json({
      summary,
      keyPoints,
      method, // 'pdf' or 'ocr' — useful for debugging
    });

  } catch (err) {
    // Clean up the file even if something went wrong
    deleteFile(filePath);

    console.error('Error processing document:', err.message);

    // Send a friendly error message — never expose stack traces to the frontend
    return res.status(500).json({
      error: err.message || 'Something went wrong. Please try again.',
    });
  }
});

// --- Error handler for multer-specific errors ---
// (e.g. file too large, wrong type)
router.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File is too large. Maximum size is 10MB.' });
  }
  if (err.message) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

export default router;
