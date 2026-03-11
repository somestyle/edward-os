/**
 * Vercel Serverless Function: Proxy to Gemini API
 * Keeps GEMINI_API_KEY server-side only. Set in Vercel: Project → Settings → Environment Variables.
 */

export default async function handler(req, res) {
  // CORS Headers for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { contents, systemInstruction } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("Server Error: GEMINI_API_KEY is missing.");
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Gemini 3.1 Flash requires the first message in 'contents' to be from the 'user'
    const validatedContents = contents[0]?.role === 'model'
      ? contents.slice(1)
      : contents;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: validatedContents,
          // Use 'system_instruction' for Gemini 2.x/3.x series
          system_instruction: systemInstruction
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini 3.1 API Error:', JSON.stringify(data, null, 2));
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Backend Crash:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
