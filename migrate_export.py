import os
import re

with open('src/app/api/export/route.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace imports
content = content.replace("import { NextResponse } from 'next/server';", "import { NextApiRequest, NextApiResponse } from 'next';\nimport Busboy from 'busboy';")

# Add config
config_str = '''
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};
'''

content = content.replace("export async function POST(req: Request) {", config_str + "\nexport default async function handler(req: NextApiRequest, res: NextApiResponse) {\n  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });")

# Replace parsing logic
parsing_logic = '''
    const data = await new Promise<any>((resolve, reject) => {
      const busboy = Busboy({ headers: req.headers });
      const fields: any = {};
      const files: any = {};

      busboy.on('file', (name, file, info) => {
        const { filename, encoding, mimeType } = info;
        const saveTo = path.join(os.tmpdir(), ${name}-);
        file.pipe(fs.createWriteStream(saveTo));
        if (!files[name]) files[name] = [];
        files[name].push(saveTo);
      });

      busboy.on('field', (name, val, info) => {
        fields[name] = val;
      });

      busboy.on('finish', () => resolve({ fields, files }));
      busboy.on('error', reject);
      req.pipe(busboy);
    });

    const formData = {
      has: (name: string) => data.fields[name] !== undefined || data.files[name] !== undefined,
      get: (name: string) => {
        if (data.fields[name] !== undefined) return data.fields[name];
        if (data.files[name] && data.files[name].length > 0) return data.files[name][0];
        return null;
      }
    };
    
    // Convert File object logic to file path logic
'''

# Wait, the rest of the code expects formData.get() to return a File object where we read its buffer!
# Actually, the existing code says:
# const mainVideoFiles: File[] = [];
# Then: const mainVideoBuffers = await Promise.all(mainVideoFiles.map(f => f.arrayBuffer()));
# If we replace mainVideoFiles with file paths (strings), we need to replace .arrayBuffer() with fs.readFileSync!
