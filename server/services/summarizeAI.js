// summarizeAI.js
// Sends extracted text to Groq (Llama 3) and returns a structured summary.
// The prompt changes based on the user's chosen summary length.

import Groq from 'groq-sdk';

// We do NOT create the client here at the top level.
// The reason: in ES modules, top-level code in imported files runs before
// dotenv.config() in server.js has a chance to load the .env file.
// So we create the client lazily inside the function instead.

let groqClient = null;

function getGroqClient() {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

/**
 * Builds the prompt we send to the AI.
 * We ask it to return JSON so we can easily parse the summary and key points.
 *
 * @param {string} text - the extracted document text
 * @param {string} length - 'short', 'medium', or 'long'
 * @returns {string} - the full prompt string
 */
function buildPrompt(text, length) {
  const lengthInstructions = {
    short:  'Write a SHORT summary of 3 to 5 sentences. Be very concise.',
    medium: 'Write a MEDIUM summary of 1 to 2 paragraphs. Cover the main ideas.',
    long:   'Write a LONG and detailed summary. Cover all important points thoroughly.',
  };

  const instruction = lengthInstructions[length] || lengthInstructions.medium;

  return `
You are a document summarization assistant.

Analyze the following document text and respond with ONLY a valid JSON object.
Do not include any explanation, markdown, or text outside the JSON.

The JSON must follow this exact format:
{
  "summary": "the summary text here",
  "keyPoints": [
    "first key point",
    "second key point",
    "third key point",
    "fourth key point",
    "fifth key point"
  ]
}

Rules:
- ${instruction}
- Extract 4 to 6 key points. Each key point must be a single clear sentence.
- If the document is too short or unclear, do your best with what is available.
- Return ONLY the JSON object. Nothing else.

Document text:
"""
${text.slice(0, 12000)}
"""
  `.trim();
}

/**
 * Calls the Groq API and parses the response as JSON.
 *
 * @param {string} text - extracted document text
 * @param {string} summaryLength - 'short', 'medium', or 'long'
 * @returns {{ summary: string, keyPoints: string[] }}
 */
async function summarizeWithAI(text, summaryLength) {
  const prompt = buildPrompt(text, summaryLength);

  const groq = getGroqClient();

  // Use groq/compound-mini — fast and available on free tier
  const completion = await groq.chat.completions.create({
    model: 'groq/compound-mini',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.3, // lower = more focused, consistent output
  });

  // Extract the text from the response
  const rawText = completion.choices[0].message.content.trim();

  // Strip markdown code fences if the model wrapped the JSON
  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  // Try to parse the response as JSON
  try {
    const parsed = JSON.parse(cleaned);

    if (!parsed.summary || !Array.isArray(parsed.keyPoints)) {
      throw new Error('Unexpected response structure from AI.');
    }

    return {
      summary: parsed.summary,
      keyPoints: parsed.keyPoints,
    };

  } catch {
    // If parsing fails, return the raw text as the summary
    console.error('Failed to parse Groq response as JSON. Raw:', rawText);

    return {
      summary: rawText || 'The AI returned a response that could not be parsed.',
      keyPoints: ['Unable to extract key points. Please try again.'],
    };
  }
}

export default summarizeWithAI;
