import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;

export const getFFmpeg = async (onProgress?: (progress: number) => void): Promise<FFmpeg> => {
  if (!ffmpegInstance) {
    ffmpegInstance = new FFmpeg();
    const coreBase = `${window.location.origin}/ffmpeg`;
    await ffmpegInstance.load({
      coreURL: await toBlobURL(`${coreBase}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${coreBase}/ffmpeg-core.wasm`, 'application/wasm'),
      classWorkerURL: `${coreBase}/814.ffmpeg.js`,
    });
  }
  if (onProgress) ffmpegInstance.on('progress', ({ progress }) => onProgress(progress));
  return ffmpegInstance;
};

export const loadMediaToFFmpeg = async (ffmpeg: FFmpeg, fileName: string, mediaUri: string) => {
  try {
    const data = await fetchFile(mediaUri);
    await ffmpeg.writeFile(fileName, data);
  } catch (error) {
    console.error(`Failed to load media ${fileName} into FFmpeg:`, error);
    throw error;
  }
};
