export type SmartCutRange = { start: number; end: number };

export type SmartCutAnalysisOptions = {
  threshold?: number;
  minimumSilenceSeconds?: number;
  speechPaddingSeconds?: number;
  analysisWindowSeconds?: number;
};

/** Convert decoded PCM into source ranges to retain without clipping speech. */
export function findSmartCutKeepRanges(
  channels: Float32Array[],
  sampleRate: number,
  sourceStart: number,
  sourceEnd: number,
  options: SmartCutAnalysisOptions = {},
): SmartCutRange[] {
  if (!channels.length || !Number.isFinite(sampleRate) || sampleRate <= 0) {
    throw new Error('The decoded clip does not contain an audio channel.');
  }

  const duration = channels[0].length / sampleRate;
  const rangeStart = Math.max(0, Math.min(sourceStart, duration));
  const rangeEnd = Math.max(rangeStart, Math.min(sourceEnd, duration));
  if (rangeEnd - rangeStart <= 0.01) return [];

  const threshold = options.threshold ?? 0.0056;
  const minimumSilence = options.minimumSilenceSeconds ?? 0.55;
  const padding = options.speechPaddingSeconds ?? 0.12;
  const windowSize = Math.max(1, Math.round(sampleRate * (options.analysisWindowSeconds ?? 0.02)));
  const firstSample = Math.floor(rangeStart * sampleRate);
  const lastSample = Math.min(channels[0].length, Math.ceil(rangeEnd * sampleRate));
  const silentRanges: SmartCutRange[] = [];
  let silenceStartedAt: number | null = null;

  for (let offset = firstSample; offset < lastSample; offset += windowSize) {
    const limit = Math.min(lastSample, offset + windowSize);
    let peakRms = 0;
    for (const channel of channels) {
      let sumSquares = 0;
      const channelLimit = Math.min(limit, channel.length);
      for (let index = offset; index < channelLimit; index++) sumSquares += channel[index] * channel[index];
      peakRms = Math.max(peakRms, Math.sqrt(sumSquares / Math.max(1, channelLimit - offset)));
    }
    const windowStart = offset / sampleRate;
    if (peakRms < threshold) {
      if (silenceStartedAt === null) silenceStartedAt = windowStart;
    } else if (silenceStartedAt !== null) {
      if (windowStart - silenceStartedAt >= minimumSilence) silentRanges.push({ start: silenceStartedAt, end: windowStart });
      silenceStartedAt = null;
    }
  }
  if (silenceStartedAt !== null && rangeEnd - silenceStartedAt >= minimumSilence) {
    silentRanges.push({ start: silenceStartedAt, end: rangeEnd });
  }

  const keepRanges: SmartCutRange[] = [];
  let cursor = rangeStart;
  for (const silence of silentRanges) {
    const removalStart = Math.max(cursor, silence.start + padding);
    const removalEnd = Math.min(rangeEnd, silence.end - padding);
    if (removalEnd - removalStart < 0.2) continue;
    if (removalStart > cursor + 0.01) keepRanges.push({ start: cursor, end: removalStart });
    cursor = Math.max(cursor, removalEnd);
  }
  if (cursor < rangeEnd - 0.01) keepRanges.push({ start: cursor, end: rangeEnd });
  return keepRanges.length ? keepRanges : [{ start: rangeStart, end: rangeEnd }];
}
