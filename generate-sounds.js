const fs = require('fs');
const path = require('path');

const soundsDir = path.join(__dirname, 'public', 'sounds');
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

function writeWav(filename, sampleRate, durationStr, generateSample) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const duration = durationStr;
  const numSamples = Math.floor(sampleRate * duration);
  const blockAlign = numChannels * bitsPerSample / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const chunkSize = 36 + dataSize;
  
  const buffer = Buffer.alloc(44 + dataSize);
  
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(chunkSize, 4);
  buffer.write('WAVE', 8);
  
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); 
  buffer.writeUInt16LE(1, 20); 
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.max(-1, Math.min(1, generateSample(t, i, numSamples)));
    const val = Math.round(sample * 32767);
    buffer.writeInt16LE(val, 44 + i * 2);
  }
  
  fs.writeFileSync(path.join(soundsDir, filename), buffer);
  console.log(`Generated ${filename}`);
}

writeWav('ding.wav', 44100, 1.0, (t) => {
  const freq = 880; 
  const envelope = Math.exp(-t * 5); 
  return Math.sin(2 * Math.PI * freq * t) * envelope * 0.9;
});

writeWav('pop.wav', 44100, 0.5, (t) => {
  const freq = 400 - (t * 2000); 
  const envelope = t < 0.05 ? Math.exp(-t * 50) : 0;
  return Math.sin(2 * Math.PI * freq * t) * envelope * 0.9;
});

writeWav('whoosh.wav', 44100, 1.5, (t, i, numSamples) => {
  const normalized = t / 1.5;
  const envelope = Math.sin(normalized * Math.PI); 
  const noise = (Math.random() * 2 - 1);
  return noise * envelope * envelope * 0.9; 
});

writeWav('boom.wav', 44100, 2.0, (t) => {
  const freq = 100 * Math.exp(-t * 3); 
  const envelope = Math.exp(-t * 1.5);
  const noise = (Math.random() * 2 - 1) * 0.1; 
  return (Math.sin(2 * Math.PI * freq * t) + noise) * envelope * 0.9;
});
