import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import extractText from '../services/extractText.js'
import summarizeWithAI from '../services/summarizeAI.js'

const router = express.Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const uploadDir = path.join(__dirname, '..', 'uploads')

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {recursive: true})
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },

  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e6,
    )}${path.extname(file.originalname)}`

    cb(null, uniqueName)
  },
})

function fileFilter(req, file, cb) {
  const allowed = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
  ]

  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(
      new Error(
        'Please upload a PDF, PNG, JPG or JPEG file.',
      ),
      false,
    )
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
})

function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  } catch (err) {
    console.error(
      'Could not delete temp file:',
      err.message,
    )
  }
}

router.post(
  '/summarize',
  upload.single('document'),
  async (req, res) => {
    const uploadedFile = req.file

    if (!uploadedFile) {
      return res.status(400).json({
        error: 'Please select a document first.',
      })
    }

    const filePath = uploadedFile.path
    const mimeType = uploadedFile.mimetype
    const summaryLength =
      req.body.summaryLength || 'medium'

    console.log(
      `Processing: ${uploadedFile.originalname} | ${mimeType}`,
    )

    try {
      let result
      let method

      // IMAGE → Groq Vision directly
      if (mimeType.startsWith('image/')) {
        console.log(
          'Image detected. Sending directly to Vision AI...',
        )

        result = await summarizeWithAI(
          '',
          summaryLength,
          filePath,
          mimeType,
        )

        method = 'vision'
      }

      // PDF → extract text → Groq
      else if (mimeType === 'application/pdf') {
        console.log(
          'PDF detected. Extracting text...',
        )

        const {text} = await extractText(
          filePath,
          mimeType,
        )

        console.log(
          `Text extracted. Characters: ${text.length}`,
        )

        result = await summarizeWithAI(
          text,
          summaryLength,
        )

        method = 'pdf'
      } else {
        throw new Error(
          'Unsupported file type.',
        )
      }

      deleteFile(filePath)

      console.log(
        'Summary generated successfully.',
      )

      return res.json({
        summary: result.summary,
        keyPoints: result.keyPoints,
        method,
      })
    } catch (err) {
      deleteFile(filePath)

      console.error(
        'Error processing document:',
        err.message,
      )

      return res.status(500).json({
        error:
          err.message ||
          'Something went wrong. Please try again.',
      })
    }
  },
)

router.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error:
        'File is too large. Maximum size is 10MB.',
    })
  }

  if (err.message) {
    return res.status(400).json({
      error: err.message,
    })
  }

  next(err)
})

export default router