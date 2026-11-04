const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');
const os = require('os');
const dotenv = require('dotenv');
const { exec } = require('child_process');
const util = require('util');

dotenv.config();
const execPromise = util.promisify(exec);

const app = express();
app.use(cors());
app.use(express.json());

// No file size limit on multer - stores to temp dir
const upload = multer({ dest: os.tmpdir() });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Full video transcription with ffmpeg audio extraction - NO size limits here!
app.post('/api/transcribe', upload.single('file'), async (req, res) => {
  const tempVideoPath = req.file ? req.file.path : null;
  const tempAudioPath = tempVideoPath ? tempVideoPath + '_audio.mp3' : null;
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    console.log('Received file:', req.file.originalname, 'size:', req.file.size, 'bytes');

    // Find ffmpeg from @ffmpeg-installer or system
    let ffmpegCmd;
    try { ffmpegCmd = require('@ffmpeg-installer/ffmpeg').path; } catch(e) { ffmpegCmd = 'ffmpeg'; }

    // Whisper does not need a music-quality stereo track.  A compact mono speech
    // track is more reliable for long recordings and stays below its upload limit.
    const command = `"${ffmpegCmd}" -y -fflags +genpts+igndts -i "${tempVideoPath}" -vn -af "loudnorm=I=-16:TP=-1.5:LRA=11" -ac 1 -ar 16000 -acodec libmp3lame -b:a 48k "${tempAudioPath}"`;
    console.log('Extracting audio with ffmpeg...');
    await execPromise(command);

    const stat = fs.statSync(tempAudioPath);
    if (stat.size === 0) throw new Error('Extracted audio is empty.');

    console.log('Sending to Whisper API...');
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempAudioPath),
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['word'],
    });

    res.json({ transcription });
  } catch (error) {
    console.error('Transcription error:', error.message);
    const details = error && error.message ? error.message : '';
    // FFmpeg emits this when the uploaded video contains only a video stream.
    // Surface a useful, actionable answer instead of its internal command output.
    if (/does not contain any stream|Stream map .*matches no streams|Output file .*does not contain any stream/i.test(details)) {
      return res.status(422).json({
        error: 'This video has no audio track, so Auto Captions cannot detect speech. Use a video with spoken audio, or add captions manually.'
      });
    }
    res.status(500).json({ error: 'Caption generation could not be completed. Please try again, or use a shorter video with clear spoken audio.' });
  } finally {
    try { if (tempVideoPath && fs.existsSync(tempVideoPath)) fs.unlinkSync(tempVideoPath); } catch(e) {}
    try { if (tempAudioPath && fs.existsSync(tempAudioPath)) fs.unlinkSync(tempAudioPath); } catch(e) {}
  }
});

// Image Background Removal
app.post('/api/remove-bg', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });
    const inputPath = path.join(__dirname, req.file.path);
    const renamedInput = inputPath + '.jpg';
    fs.renameSync(inputPath, renamedInput);
    const outputPath = inputPath + '_no_bg.png';
    exec(`rembg i ${renamedInput} ${outputPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error('rembg error:', stderr);
        if (fs.existsSync(renamedInput)) fs.unlinkSync(renamedInput);
        return res.status(500).json({ error: 'Background removal failed' });
      }
      res.sendFile(outputPath, () => {
        if (fs.existsSync(renamedInput)) fs.unlinkSync(renamedInput);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Background removal failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`NexusCut AI Backend running on port ${PORT}`));
