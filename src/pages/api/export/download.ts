import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Video exports are routinely larger than Next.js's default API warning limit.
// This route streams the file; it never buffers a whole export in memory.
export const config = {
  api: { responseLimit: false },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing Job ID' });
  }

  const tempDir = os.tmpdir();
  const finalPath = path.join(tempDir, `final_${id}.mp4`);

  if (!fs.existsSync(finalPath)) {
    return res.status(404).json({ error: 'File not found or expired' });
  }

  try {
    const stat = fs.statSync(finalPath);
    
    res.writeHead(200, {
      'Content-Type': 'video/mp4',
      'Content-Length': stat.size,
      'Content-Disposition': `attachment; filename="export_${id}.mp4"`,
      'Cache-Control': 'no-store',
    });
    res.flushHeaders();
    
    const readStream = fs.createReadStream(finalPath);
    readStream.pipe(res);
    
    // Only clean up after the response finishes. `close` can fire early on a
    // mobile browser navigation and used to remove the export mid-download.
    res.on('finish', () => {
      try {
        fs.unlinkSync(finalPath);
        // Also delete the status file
        const statusPath = path.join(tempDir, `status_${id}.json`);
        if (fs.existsSync(statusPath)) {
          fs.unlinkSync(statusPath);
        }
      } catch (err) {
        console.error('Failed to cleanup temp file:', err);
      }
    });

  } catch (error: unknown) {
    console.error('Error serving download:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to serve download' });
    }
  }
}
