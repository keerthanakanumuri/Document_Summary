// summarizeAI.js
// Handles both text documents and images using Groq.
// Text/PDF → text summarization
// Image → Groq Vision

import Groq from 'groq-sdk'
import fs from 'fs'

let groqClient = null

function getGroqClient() {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is missing.')
    }

    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    })
  }

  return groqClient
}

function getLengthInstruction(length) {
  const instructions = {
    short: 'Write a SHORT summary of 3 to 5 sentences.',
    medium: 'Write a MEDIUM summary of 1 to 2 paragraphs.',
    long: 'Write a LONG and detailed summary covering all important information.',
  }

  return instructions[length] || instructions.medium
}

// ------------------------------------
// TEXT SUMMARY
// ------------------------------------

function buildTextPrompt(text, length) {
  return `
You are a professional document summarization assistant.

Analyze the document text below.

${getLengthInstruction(length)}

Return ONLY valid JSON in this exact format:

{
  "summary": "summary here",
  "keyPoints": [
    "important point 1",
    "important point 2",
    "important point 3",
    "important point 4",
    "important point 5"
  ]
}

Rules:
- Stay strictly based on the provided document.
- Do not invent information.
- Extract 4 to 6 important key points.
- Each key point must be one clear sentence.
- Return ONLY JSON.
- Do not include <think> tags.
- Do not include markdown code fences.

Document text:
"""
${text.slice(0, 12000)}
"""
`.trim()
}

// ------------------------------------
// IMAGE SUMMARY
// ------------------------------------

async function summarizeImage(filePath, mimeType, length) {
  const groq = getGroqClient()

  const imageBuffer = fs.readFileSync(filePath)

  const base64Image = imageBuffer.toString('base64')

  const prompt = `
You are an image and document understanding assistant.

Carefully analyze the uploaded image.

${getLengthInstruction(length)}

IMPORTANT RULES:
- Understand the actual visual content of the image.
- If it contains text, read and understand the visible text.
- If it is a photograph, describe and summarize what is actually visible.
- Do NOT invent text.
- Do NOT treat random shapes, railings, objects, or patterns as letters.
- Do NOT claim that an image contains a document if it does not.
- Base the answer ONLY on the image.
- Do not include <think> tags.
- Do not include markdown.
- Do not include explanations outside the JSON.

Return ONLY valid JSON in this exact format:

{
  "summary": "accurate summary of the image",
  "keyPoints": [
    "important visual point 1",
    "important visual point 2",
    "important visual point 3",
    "important visual point 4",
    "important visual point 5"
  ]
}
`.trim()

  const completion = await groq.chat.completions.create({
    model: 'qwen/qwen3.6-27b',

    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt,
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
            },
          },
        ],
      },
    ],

    temperature: 0.2,
    max_completion_tokens: 1500,
  })

  return parseAIResponse(
    completion.choices[0].message.content,
  )
}

// ------------------------------------
// JSON PARSER
// ------------------------------------

function parseAIResponse(rawText) {
  let cleaned = rawText.trim()

  // Remove <think>...</think> reasoning
  cleaned = cleaned
    .replace(
      /<think>[\s\S]*?<\/think>/gi,
      '',
    )
    .trim()

  // Remove markdown code fences
  cleaned = cleaned
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()

  // Find the JSON object if the model
  // returned extra text around it.
  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')

  if (
    firstBrace !== -1 &&
    lastBrace !== -1 &&
    lastBrace > firstBrace
  ) {
    cleaned = cleaned.slice(
      firstBrace,
      lastBrace + 1,
    )
  }

  try {
    const parsed = JSON.parse(cleaned)

    if (
      !parsed.summary ||
      !Array.isArray(parsed.keyPoints)
    ) {
      throw new Error(
        'Unexpected AI response structure.',
      )
    }

    return {
      summary: parsed.summary,
      keyPoints: parsed.keyPoints,
    }
  } catch (error) {
    console.error(
      'Failed to parse AI response:',
      rawText,
    )

    return {
      summary:
        'The AI returned an invalid response. Please try again.',
      keyPoints: [],
    }
  }
}

// ------------------------------------
// MAIN FUNCTION
// ------------------------------------

async function summarizeWithAI(
  text,
  summaryLength,
  filePath = null,
  mimeType = null,
) {
  // Image → Groq Vision
  if (
    filePath &&
    mimeType &&
    mimeType.startsWith('image/')
  ) {
    return await summarizeImage(
      filePath,
      mimeType,
      summaryLength,
    )
  }

  // PDF/text → Groq text model
  const groq = getGroqClient()

  const prompt = buildTextPrompt(
    text,
    summaryLength,
  )

  const completion =
    await groq.chat.completions.create({
      model: 'groq/compound-mini',

      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],

      temperature: 0.3,
    })

  return parseAIResponse(
    completion.choices[0].message.content,
  )
}

export default summarizeWithAI