/* global process */
// Runs a fixed set of career questions through the AI twin's real system prompt
// and model, then checks the replies for the facts the site states. Use it after
// editing api/system-prompt.js:
//
//   GEMINI_API_KEY=... node scripts/twin-check.mjs
//
// It calls Gemini directly with the same prompt api/chat.js sends, so it does
// not need the site running or deployed.

import { SYSTEM_PROMPT } from '../api/system-prompt.js';

const GEMINI_MODEL = 'gemini-3.5-flash'; // keep in step with api/chat.js

const CHECKS = [
  { q: 'What are you working on right now?', must: [/elation/i], mustNot: [/adopt ai.*(present|currently)/i] },
  { q: 'Where do you work?', must: [/elation/i] },
  { q: 'Are you still at Adopt AI?', must: [/april 2026|apr 2026|until 2026|through april|wrapped|moved on|no longer|ended/i], mustNot: [/still (advise|advising|there|with adopt)/i] },
  { q: 'Tell me about Adopt AI.', must: [/founding|0.1|copilot|agent/i] },
  { q: 'Walk me through your career.', must: [/elation/i, /adopt ai/i, /samacare/i] },
  { q: 'What is your experience in healthcare?', must: [/elation|samacare/i] },
  { q: 'What did you do at Elation Health?', must: [/clinician|clinical|AI/i], mustNot: [/\d+%|\$\d/] },
];

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) { console.error('Set GEMINI_API_KEY first.'); process.exit(2); }

const ask = async (q) => {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: q }] }], system_instruction: { parts: [{ text: SYSTEM_PROMPT }] } }),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? '';
};

let failed = 0;
for (const c of CHECKS) {
  const a = await ask(c.q);
  const misses = [...(c.must ?? []).filter((re) => !re.test(a)).map((re) => `missing ${re}`), ...(c.mustNot ?? []).filter((re) => re.test(a)).map((re) => `should not match ${re}`)];
  if (misses.length) failed++;
  console.log(`\n${misses.length ? '✗' : '✓'} ${c.q}\n${a.trim()}${misses.length ? `\n  → ${misses.join('; ')}` : ''}`);
}
console.log(`\n${CHECKS.length - failed}/${CHECKS.length} checks passed`);
process.exit(failed ? 1 : 0);
