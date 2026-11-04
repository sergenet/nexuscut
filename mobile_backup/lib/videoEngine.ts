import { FFmpegKit, ReturnCode } from 'ffmpeg-kit-react-native';
import { Paths } from 'expo-file-system';
import { Platform } from 'react-native';

export interface ResolutionConfig {
  aspectRatio: '16:9' | '9:16' | '1:1' | 'custom';
  customW?: number;
  customH?: number;
  audioMix?: 'mix' | 'mute-video' | 'mute-custom';
}

export class VideoEngine {
  /**
   * Trims a single video file using its URI.
   * In a real implementation, this runs FFmpeg. Here we mock it.
   */
  static async trimVideo(inputUri: string, startTime: number, duration: number): Promise<string | null> {
    const outputFileName = `trim_${Date.now()}.mp4`;
    const outputUri = Platform.OS === 'web' ? `/cache/${outputFileName}` : `${Paths.cache.uri}${outputFileName}`;

    console.log(`[VideoEngine Mock] Trimming ${inputUri} from ${startTime} for ${duration}s`);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return outputUri;
  }

  /**
   * Translates the timeline segments into a raw FFmpeg command string.
   */
  static generateFFmpegCommand(segments: any[], isPro: boolean, resConfig: ResolutionConfig): string {
    if (!segments || segments.length === 0) return '';

    const videoSegments = segments
      .filter(s => s.type === 'video' && s.src)
      .sort((a, b) => a.start - b.start);

    const audioSegments = segments
      .filter(s => s.type === 'audio' && s.src)
      .sort((a, b) => a.start - b.start);

    const textSegments = segments
      .filter(s => s.type === 'text' && s.text)
      .sort((a, b) => a.start - b.start);

    if (videoSegments.length === 0) return '';

    let inputs = '';
    
    // Add all video inputs
    videoSegments.forEach(s => {
      inputs += `-i "${s.src}" `;
    });

    // Add all audio inputs
    audioSegments.forEach(s => {
      inputs += `-i "${s.src}" `;
    });

    let filterComplex = '-filter_complex "';
    let concatVidInputs = '';
    let concatAudInputs = '';

    // Calculate Resolution based on Quality (4K/1080p) and Aspect Ratio
    let targetW = isPro ? 3840 : 1920;
    let targetH = isPro ? 2160 : 1080;

    if (resConfig.aspectRatio === '9:16') {
      targetW = isPro ? 2160 : 1080;
      targetH = isPro ? 3840 : 1920;
    } else if (resConfig.aspectRatio === '1:1') {
      targetW = isPro ? 2160 : 1080;
      targetH = isPro ? 2160 : 1080;
    } else if (resConfig.aspectRatio === 'custom') {
      targetW = resConfig.customW || targetW;
      targetH = resConfig.customH || targetH;
    }

    // 1. Process Video Segments
    videoSegments.forEach((s, index) => {
      const trimStart = s.trimStart || 0;
      const speed = s.speed || 1.0;
      const ptsFactor = 1 / speed;
      filterComplex += `[${index}:v]trim=start=${trimStart}:duration=${s.duration},setpts=${ptsFactor}*(PTS-STARTPTS),scale=${targetW}:${targetH}:force_original_aspect_ratio=decrease,pad=${targetW}:${targetH}:(ow-iw)/2:(oh-ih)/2:color=black[v${index}]; `;
      concatVidInputs += `[v${index}]`;
      
      // If we aren't muting the video, prepare its audio stream for the concat filter
      if (resConfig.audioMix !== 'mute-video') {
        let audioFilters = `atrim=start=${trimStart}:duration=${s.duration},asetpts=PTS-STARTPTS,atempo=${speed}`;
        if (s.enhanceAudio) {
          audioFilters += `,afftdn=nf=-25`; // Basic FFmpeg noise reduction
        }
        filterComplex += `[${index}:a]${audioFilters}[a${index}]; `;
        concatAudInputs += `[a${index}]`;
      }
    });

    // 2. Concat Video (and conditionally its Audio)
    const hasVideoAudio = resConfig.audioMix !== 'mute-video';
    
    // Check if any segment has a transition
    const hasTransitions = videoSegments.some(s => s.transitionOut);
    
    if (hasTransitions && videoSegments.length > 1) {
      // Generate xfade chain (simplified for mock visualization)
      let prevOut = '[v0]';
      let currentOffset = 0;
      for (let i = 0; i < videoSegments.length - 1; i++) {
        const seg = videoSegments[i];
        const nextSeg = videoSegments[i+1];
        const transType = seg.transitionOut === 'crossfade' ? 'fade' : seg.transitionOut === 'wipe' ? 'wipeleft' : 'fadeblack';
        currentOffset += seg.duration - (seg.transitionOut ? 1 : 0); // 1 sec overlap
        
        const nextIn = `[v${i+1}]`;
        const outName = i === videoSegments.length - 2 ? '[outv]' : `[xf${i}]`;
        
        if (seg.transitionOut) {
          filterComplex += `${prevOut}${nextIn}xfade=transition=${transType}:duration=1:offset=${currentOffset}${outName}; `;
        } else {
          // If no transition between these two, fallback to concat for this pair
          filterComplex += `${prevOut}${nextIn}concat=n=2:v=1:a=0${outName}; `;
        }
        prevOut = outName;
      }
      // For audio, just concat for now to keep it simple
      if (hasVideoAudio) {
         filterComplex += `${concatAudInputs}concat=n=${videoSegments.length}:v=0:a=1[outv_a]; `;
      }
    } else {
      filterComplex += `${concatVidInputs}${hasVideoAudio ? concatAudInputs : ''}concat=n=${videoSegments.length}:v=1:a=${hasVideoAudio ? '1' : '0'}[outv]${hasVideoAudio ? '[outv_a]' : ''}; `;
    }

    // 3. Process Custom Audio Segments
    let delayedAudioLabels = '';
    const hasCustomAudio = audioSegments.length > 0 && resConfig.audioMix !== 'mute-custom';
    
    if (hasCustomAudio) {
      audioSegments.forEach((s, aIndex) => {
        // Audio files are added to inputs AFTER video files, so their index is videoSegments.length + aIndex
        const inputIndex = videoSegments.length + aIndex;
        // delay string expects milliseconds e.g. 5000|5000 (for left and right channels)
        const delayMs = Math.floor(s.start * 1000);
        
        let customAudioFilters = `adelay=${delayMs}|${delayMs}`;
        if (s.enhanceAudio) customAudioFilters += `,afftdn=nf=-25`;
        if (s.speed && s.speed !== 1.0) customAudioFilters += `,atempo=${s.speed}`;

        filterComplex += `[${inputIndex}:a]${customAudioFilters}[delay_a${aIndex}]; `;
        delayedAudioLabels += `[delay_a${aIndex}]`;
      });
    }

    // 4. Mix Audio Streams
    let finalAudioMap = '';
    if (hasVideoAudio && hasCustomAudio) {
      // Mix both!
      filterComplex += `[outv_a]${delayedAudioLabels}amix=inputs=${1 + audioSegments.length}:duration=first:dropout_transition=2[final_a]; `;
      finalAudioMap = '-map "[final_a]"';
    } else if (hasVideoAudio && !hasCustomAudio) {
      // Only Video Audio
      finalAudioMap = '-map "[outv_a]"';
    } else if (!hasVideoAudio && hasCustomAudio) {
      // Only Custom Audio (Mix custom audio segments together if > 1)
      if (audioSegments.length > 1) {
        filterComplex += `${delayedAudioLabels}amix=inputs=${audioSegments.length}:duration=first:dropout_transition=2[final_a]; `;
        finalAudioMap = '-map "[final_a]"';
      } else {
        finalAudioMap = `-map "${delayedAudioLabels}"`; // e.g., -map "[delay_a0]"
      }
    } else {
      // Both muted, no audio mapping
    }

    // 5. Add Custom Text Overlays and Watermark
    let finalDrawText = '';
    
    // Compile Custom Text Segments
    textSegments.forEach(txt => {
      // FFmpeg requires escaping text, especially single quotes
      const escapedText = txt.text?.replace(/'/g, "\\'") || '';
      const fSize = txt.fontSize || (resConfig.aspectRatio === '9:16' ? 48 : 64);
      const yPosStr = txt.yPosition ? `h*(${txt.yPosition}/100)-th/2` : 'h-th-100'; // Fallback to bottom if undefined
      const color = (txt.color || '#ffffff').replace('#', '0x'); // FFmpeg hex color format
      
      finalDrawText += `drawtext=text='${escapedText}':fontcolor=${color}:fontsize=${fSize}:x=(w-tw)/2:y=${yPosStr}:enable='between(t,${txt.start},${txt.end})',`;
    });

    if (!isPro) {
      finalDrawText += `drawtext=text='NexusCut':fontcolor=white:fontsize=${resConfig.aspectRatio === '9:16' ? 24 : 48}:box=1:boxcolor=black@0.5:boxborderw=10:x=w-tw-20:y=h-th-20`;
    } else {
      // Remove trailing comma if present
      if (finalDrawText.endsWith(',')) {
        finalDrawText = finalDrawText.slice(0, -1);
      }
    }

    if (finalDrawText) {
      filterComplex += `[outv]${finalDrawText}[finalv]" -map "[finalv]" ${finalAudioMap}`;
    } else {
      filterComplex += `" -map "[outv]" ${finalAudioMap}`;
    }

    // 3. Output options
    const outputFileName = `export_${resConfig.aspectRatio.replace(':', 'x')}_${Date.now()}.mp4`;
    const outputUri = Platform.OS === 'web' ? `/cache/${outputFileName}` : `${Paths.cache.uri}${outputFileName}`;

    return `${inputs} ${filterComplex} -c:v libx264 -preset ultrafast -y "${outputUri}"`;
  }

  /**
   * Compiles the entire timeline project (merging all segments) into a single video.
   */
  static async compileProject(segments: any[], isPro: boolean = false, resConfig: ResolutionConfig = { aspectRatio: '16:9' }): Promise<{ command: string, outputUri: string } | null> {
    console.log(`Compiling project with ${segments.length} segments at ${resConfig.aspectRatio}`);
    
    const command = this.generateFFmpegCommand(segments, isPro, resConfig);
    console.log("[VideoEngine] Generated FFmpeg Command:\n", command);

    // For MVP demonstration, we mock the execution delay
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          command,
          outputUri: Platform.OS === 'web' ? `/cache/export_${Date.now()}.mp4` : `${Paths.cache.uri}export_${Date.now()}.mp4`
        });
      }, 3000); // Simulate 3 seconds of rendering
    });
  }
}
