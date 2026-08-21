// extractText.js
// Extracts readable text from a file.
// PDF files → pdf-parse
// Image files (PNG, JPG, JPEG) → Tesseract.js OCR

import fs from 'fs';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import Tesseract from 'tesseract.js';

/**
 * Extracts text from a PDF file using pdf-parse.
 * @param {string} filePath - absolute path to the PDF file
 * @returns {string} - the extracted text
 */
async function extractFromPDF(filePath) {
  // Read the file into memory as a Buffer
  const fileBuffer = fs.readFileSync(filePath);

  // pdf-parse reads the buffer and returns an object with a .text property
  const pdfData = await pdfParse(fileBuffer);

  const text = pdfData.text.trim();

  // If no text was found, the PDF is probably a scanned image inside a PDF
  if (!text || text.length < 20) {
    throw new Error(
      'This PDF appears to be scanned or image-based. ' +
      'Please export it as an image (PNG or JPG) and upload that instead.'
    );
  }

  return text;
}

/**
 * Extracts text from an image file using Tesseract.js OCR.
 * @param {string} filePath - absolute path to the image file
 * @returns {string} - the extracted text
 */
async function extractFromImage(filePath) {
  // Tesseract.js processes the image and returns recognized text
  // 'eng' means we are reading English text
  const result = await Tesseract.recognize(filePath, 'eng', {
    // Suppress Tesseract's own console logs to keep our terminal clean
    logger: () => {},
  });

  const text = result.data.text.trim();

  // If OCR found nothing meaningful, let the user know
  if (!text || text.length < 20) {
    throw new Error(
      "We couldn't extract readable text from this image. " +
      'Make sure the image is clear and contains printed text.'
    );
  }

  return text;
}

/**
 * Main function — decides which extractor to use based on file type.
 * @param {string} filePath - absolute path to the uploaded file
 * @param {string} mimeType - the file's MIME type (e.g. 'application/pdf')
 * @returns {{ text: string, method: string }} - extracted text and method used
 */
async function extractText(filePath, mimeType) {
  const isPDF = mimeType === 'application/pdf';
  const isImage = ['image/png', 'image/jpeg', 'image/jpg'].includes(mimeType);

  if (isPDF) {
    const text = await extractFromPDF(filePath);
    return { text, method: 'pdf' };
  }

  if (isImage) {
    const text = await extractFromImage(filePath);
    return { text, method: 'ocr' };
  }

  // If neither, reject it
  throw new Error('Unsupported file type. Please upload a PDF, PNG, JPG or JPEG.');
}

export default extractText;
