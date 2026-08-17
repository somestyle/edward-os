/**
 * Fire-and-forget conversation logging to Supabase.
 *
 * Uses PostgREST over plain fetch rather than @supabase/supabase-js: one less
 * dependency in the serverless bundle and a faster cold start for two inserts.
 *
 * Every failure here is swallowed. A paused free-tier project, a missing env
 * var, or a network blip must never surface to someone chatting on the site.
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Phrases the twin uses when it cannot answer. Logged as a flag so gaps in the
// system prompt can be found by filtering, instead of by reading every thread.
const DEFLECTION_PATTERNS = [
  /i don'?t (share|have)/i,
  /best discussed live/i,
  /happy to (talk|walk) (it |you )?through/i,
  /in a live conversation/i,
  /i keep .* private/i,
];

const looksLikeDeflection = (text) =>
  DEFLECTION_PATTERNS.some((pattern) => pattern.test(text));

export const loggingEnabled = () => Boolean(SUPABASE_URL && SERVICE_KEY);

/**
 * Insert one conversation turn. Returns a promise that never rejects.
 * Callers may await it (to keep the function alive until the write lands) or
 * ignore it entirely.
 */
export async function logTurn({ sessionId, role, message }) {
  if (!loggingEnabled() || !message) return;

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/chat_logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        session_id: sessionId,
        role,
        message,
        no_answer: role === 'twin' ? looksLikeDeflection(message) : false,
      }),
    });
  } catch (err) {
    console.error('chat-log: insert failed:', err.message);
  }
}

/**
 * Pull the assistant's text out of a Gemini SSE chunk so the reply can be
 * logged without buffering the stream. Returns '' for keep-alives and partials.
 */
export function extractTextFromSSE(chunk) {
  let text = '';
  for (const line of chunk.split('\n')) {
    if (!line.startsWith('data:')) continue;
    const payload = line.slice(5).trim();
    if (!payload || payload === '[DONE]') continue;
    try {
      text += JSON.parse(payload).candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch {
      // JSON split across chunk boundaries: the missing text costs us a few
      // characters in the log, which is not worth reassembling buffers for.
    }
  }
  return text;
}
