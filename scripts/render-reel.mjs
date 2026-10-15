// Renders reel/index.html frame by frame into an MP4 with its soundtrack, then
// writes the web encode and poster the Projects page uses (public/reel/).
// Usage: node scripts/render-reel.mjs [--stills 0.5,3.2,...] [--fps 60]
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const page_url = pathToFileURL(path.join(root, 'reel/index.html')).href + '?render=1';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const fps = Number(opt('--fps', 60));
const stills = opt('--stills', null);
const out = opt('--out', path.join(root, 'reel/edward-chu-showreel.mp4'));
const ffmpeg = process.env.FFMPEG || 'ffmpeg';
const exe = [process.env.CHROMIUM, '/opt/pw-browsers/chromium'].find((p) => p && existsSync(p));

const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await page.goto(page_url);
await page.evaluate(() => window.__ready());

if (stills) {
  const dir = opt('--dir', '.');
  for (const s of stills.split(',')) {
    await page.evaluate((t) => window.__seek(t), Number(s));
    await page.screenshot({ path: path.join(dir, `still-${s}.jpg`), type: 'jpeg', quality: 80 });
  }
  await browser.close();
  process.exit(0);
}

const audio = path.join(root, 'reel/assets/soundtrack.mp3');
const ff = spawn(ffmpeg, [
  '-y', '-loglevel', 'error',
  '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
  ...(existsSync(audio) ? ['-i', audio] : []),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
  ...(existsSync(audio) ? ['-c:a', 'aac', '-b:a', '192k', '-shortest'] : []),
  '-movflags', '+faststart', out,
], { stdio: ['pipe', 'inherit', 'inherit'] });

const total = Math.round((await page.evaluate(() => window.__DUR)) * fps);
for (let f = 0; f < total; f++) {
  await page.evaluate((t) => window.__seek(t), f / fps);
  const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  if (f % 60 === 0) process.stdout.write(`frame ${f}/${total}\n`);
}
ff.stdin.end();
await new Promise((r) => ff.on('close', r));
await browser.close();
console.log('wrote', out);

// The site plays a lighter encode with a poster frame from the Projects page.
const run = (args) => new Promise((r) => spawn(ffmpeg, ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' }).on('close', r));
await run(['-i', out, '-c:v', 'libx264', '-crf', '24', '-preset', 'slow', '-vf', 'scale=1600:-2', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', path.join(root, 'public/reel/edward-chu-showreel-web.mp4')]);
await run(['-ss', '1.6', '-i', out, '-frames:v', '1', '-vf', 'scale=1280:-2', '-q:v', '4', path.join(root, 'public/reel/poster.jpg')]);
console.log('wrote public/reel/edward-chu-showreel-web.mp4 and poster.jpg');
