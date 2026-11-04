import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getExportQueuePosition } from '@/lib/exportQueue';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing Job ID' });
  }

  const tempDir = os.tmpdir();
  const statusPath = path.join(tempDir, `status_${id}.json`);

  if (!fs.existsSync(statusPath)) {
    return res.status(404).json({ error: 'Job not found' });
  }

  try {
    const statusContent = fs.readFileSync(statusPath, 'utf8');
    const statusData = JSON.parse(statusContent);
    if (statusData.status === 'queued') {
      const position = getExportQueuePosition(id);
      if (position !== undefined) statusData.queuePosition = position;
    }
    return res.status(200).json(statusData);
  } catch (error: unknown) {
    console.error('Error reading status:', error);
    return res.status(500).json({ error: 'Failed to read status' });
  }
}
