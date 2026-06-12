/**
 * Vercel Serverless Function: Proxy to Gemini API
 * Keeps GEMINI_API_KEY server-side only. Set in Vercel: Project → Settings → Environment Variables.
 * Streams the model reply through as SSE so the client can render tokens as they arrive.
 */

const GEMINI_MODEL = 'gemini-3.5-flash';

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

    // Gemini requires the first message in 'contents' to be from the 'user'
    const validatedContents = contents[0]?.role === 'model'
      ? contents.slice(1)
      : contents;

    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: validatedContents,
          system_instruction: systemInstruction
        })
      }
    );

    if (!upstream.ok) {
      const data = await upstream.json().catch(() => ({ error: 'Upstream error' }));
      console.error(`Gemini API Error (${GEMINI_MODEL}):`, JSON.stringify(data, null, 2));
      return res.status(upstream.status).json(data);
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    const reader = upstream.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
    return res.end();
  } catch (err) {
    console.error('Backend Crash:', err.message);
    if (res.headersSent) return res.end();
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const config = {
  supportsResponseStreaming: true,
};
