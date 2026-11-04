import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import prisma from '@/lib/prisma';
import ffmpegPath from 'ffmpeg-static';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

const execPromise = util.promisify(exec);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/** Guest transcription limits roll over every day instead of lasting forever. */
const USAGE_WINDOW_MS = 24 * 60 * 60 * 1000;
const withinWindow = (lastUsedAt: Date | null | undefined): boolean =>
  Boolean(lastUsedAt && Date.now() - lastUsedAt.getTime() < USAGE_WINDOW_MS);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // Rate Limiting Logic (adapted from checkGuestLimit)
  try {
    let ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
    // Behind the site proxy the real client IP is the LAST X-Forwarded-For entry.
    if (typeof ip === 'string' && ip.includes(',')) ip = ip.split(',').pop()?.trim() || 'unknown';
    if (Array.isArray(ip)) ip = ip[ip.length - 1];
    
    const fingerprint = req.headers['x-device-fingerprint'] || 'unknown';
    const maxLimit = 3;

    if (ip !== 'unknown' && ip !== '127.0.0.1' && ip !== '::1') {
      const ipUsage = await prisma.guestUsage.upsert({
        where: { identifier: `IP:${ip}` },
        update: {},
        create: { identifier: `IP:${ip}`, type: 'IP' }
      });
      if (withinWindow(ipUsage.lastUsedAt) && ipUsage.usageCount >= maxLimit) {
        return res.status(429).json({ error: 'IP address usage limit reached.' });
      }
    }

    if (fingerprint !== 'unknown') {
      const fpUsage = await prisma.guestUsage.upsert({
        where: { identifier: `FP:${fingerprint}` },
        update: {},
        create: { identifier: `FP:${fingerprint}`, type: 'FINGERPRINT' }
      });
      if (withinWindow(fpUsage.lastUsedAt) && fpUsage.usageCount >= maxLimit) {
        return res.status(429).json({ error: 'Device usage limit reached.' });
      }
    }
  } catch (err) {
    console.error("Rate limit check failed:", err);
  }

  const tempDir = os.tmpdir();
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  
  const id = Date.now().toString();
  const tempVideoPath = path.join(tempDir, `transcribe_in_${id}.mp4`);
  const tempAudioPath = path.join(tempDir, `transcribe_out_${id}.mp3`);

  try {
    // Collect the raw stream into a buffer (bodyParser is disabled)
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', resolve);
      req.on('error', reject);
    });
    const buffer = Buffer.concat(chunks);
    console.log(`Received ${buffer.length} bytes (${(buffer.length / 1024 / 1024).toFixed(2)} MB). Writing to ${tempVideoPath}...`);
    if (buffer.length === 0) {
      return res.status(400).json({ error: 'No file data received.' });
    }
    fs.writeFileSync(tempVideoPath, buffer);

    console.log("Video fully uploaded. Extracting audio on server using FFmpeg...");
    if (!ffmpegPath) throw new Error('FFmpeg is not available on this server.');
    const ffmpegCmd = ffmpegPath;
    // Use -fflags +genpts and allow seeking to handle files with moov atom at the end
    const command = `"${ffmpegCmd}" -y -fflags +genpts+igndts -i "${tempVideoPath}" -vn -acodec libmp3lame -q:a 2 "${tempAudioPath}"`;
    await execPromise(command);

    console.log("Audio extracted successfully. Sending to OpenAI Whisper API...");
    const stat = fs.statSync(tempAudioPath);
    if (stat.size === 0) throw new Error("Extracted audio is empty.");

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempAudioPath),
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['word'],
    });

    // Increment Usage
    try {
      let ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
      if (typeof ip === 'string' && ip.includes(',')) ip = ip.split(',')[0].trim();
      if (Array.isArray(ip)) ip = ip[0];
      const fingerprint = req.headers['x-device-fingerprint'] || 'unknown';

      if (ip !== 'unknown' && ip !== '127.0.0.1' && ip !== '::1') {
        const identifier = `IP:${ip}`;
        const row = await prisma.guestUsage.findUnique({ where: { identifier } });
        if (!row) {
          await prisma.guestUsage.create({ data: { identifier, type: 'IP', usageCount: 1, lastUsedAt: new Date() } });
        } else if (withinWindow(row.lastUsedAt)) {
          await prisma.guestUsage.update({ where: { identifier }, data: { usageCount: { increment: 1 }, lastUsedAt: new Date() } });
        } else {
          await prisma.guestUsage.update({ where: { identifier }, data: { usageCount: 1, lastUsedAt: new Date() } });
        }
      }
      if (fingerprint !== 'unknown') {
        const identifier = `FP:${fingerprint}`;
        const row = await prisma.guestUsage.findUnique({ where: { identifier } });
        if (!row) {
          await prisma.guestUsage.create({ data: { identifier, type: 'FINGERPRINT', usageCount: 1, lastUsedAt: new Date() } });
        } else if (withinWindow(row.lastUsedAt)) {
          await prisma.guestUsage.update({ where: { identifier }, data: { usageCount: { increment: 1 }, lastUsedAt: new Date() } });
        } else {
          await prisma.guestUsage.update({ where: { identifier }, data: { usageCount: 1, lastUsedAt: new Date() } });
        }
      }
    } catch (err) {
      console.error("Failed to increment usage:", err);
    }

    res.status(200).json({ transcription });
  } catch (error: unknown) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Transcription failed' });
  } finally {
    try {
      if (fs.existsSync(tempVideoPath)) fs.unlinkSync(tempVideoPath);
      if (fs.existsSync(tempAudioPath)) fs.unlinkSync(tempAudioPath);
    } catch {}
  }
}
