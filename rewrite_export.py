import os
import re

with open('src/app/api/export/route.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import { NextResponse } from 'next/server';", "import { NextApiRequest, NextApiResponse } from 'next';\nimport Busboy from 'busboy';")

config_str = '''
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};
'''

content = content.replace("export async function POST(req: Request) {", config_str + "\nexport default async function handler(req: NextApiRequest, res: NextApiResponse) {\n  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });")

parsing_logic = '''
    const data = await new Promise<any>((resolve, reject) => {
      const busboy = Busboy({ headers: req.headers });
      const fields: any = {};
      const files: any = {};

      busboy.on('file', (name, file, info) => {
        const saveTo = path.join(os.tmpdir(), ${name}-);
        file.pipe(fs.createWriteStream(saveTo));
        if (!files[name]) files[name] = [];
        files[name].push(saveTo);
      });

      busboy.on('field', (name, val) => {
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
'''

content = content.replace("const formData = await req.formData() as any;", parsing_logic)

# Change File logic to filepath logic
content = content.replace("const mainVideoFiles: File[] = [];", "const mainVideoFiles: string[] = [];")
content = content.replace("mainVideoFiles.push(formData.get(ideoFile_) as File);", "mainVideoFiles.push(formData.get(ideoFile_) as string);")
content = content.replace("const bgmFile = formData.get('bgmFile') as File | null;", "const bgmFile = formData.get('bgmFile') as string | null;")
content = content.replace("const ttsFile = formData.get('ttsFile') as File | null;", "const ttsFile = formData.get('ttsFile') as string | null;")

# ArrayBuffer replacements
content = content.replace("Buffer.from(await vFile.arrayBuffer())", "fs.readFileSync(vFile)")
content = content.replace("Buffer.from(await bgmFile.arrayBuffer())", "fs.readFileSync(bgmFile)")
content = content.replace("Buffer.from(await ttsFile.arrayBuffer())", "fs.readFileSync(ttsFile)")

# NextResponse replacements
content = content.replace("return NextResponse.json({ error: 'You have reached your free tier limit of 10 exports.' }, { status: 403 });", "return res.status(403).json({ error: 'You have reached your free tier limit of 10 exports.' });")
content = content.replace("return NextResponse.json({ error: error.message }, { status: 500 });", "return res.status(500).json({ error: error.message });")

success_response = '''
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', ttachment; filename="export_.mp4");
    res.send(outputBuffer);
    return;
'''
content = re.sub(r'return new NextResponse\(outputBuffer, \{[^}]+\}\);', success_response, content, flags=re.DOTALL)

with open('src/pages/api/export.ts', 'w', encoding='utf-8') as f:
    f.write(content)
