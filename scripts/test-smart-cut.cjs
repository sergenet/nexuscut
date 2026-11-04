const assert = require('node:assert/strict');
const test = require('node:test');

const { findSmartCutKeepRanges } = require('../scratch/test-build/smartCut.js');

function channelWithSound(sampleRate, duration, audibleRanges) {
  const channel = new Float32Array(sampleRate * duration);
  for (const [start, end] of audibleRanges) {
    for (let index = start * sampleRate; index < end * sampleRate; index++) channel[index] = 0.2;
  }
  return channel;
}

test('Smart Cut removes sustained silence while preserving speech padding', () => {
  const sampleRate = 1000;
  const channel = channelWithSound(sampleRate, 10, [[0, 2], [4, 6], [8, 10]]);
  const ranges = findSmartCutKeepRanges([channel], sampleRate, 0, 10);
  assert.deepEqual(ranges, [
    { start: 0, end: 2.12 },
    { start: 3.88, end: 6.12 },
    { start: 7.88, end: 10 },
  ]);
});

test('Smart Cut keeps natural short pauses', () => {
  const sampleRate = 1000;
  const channel = channelWithSound(sampleRate, 3, [[0, 1], [1.4, 3]]);
  assert.deepEqual(findSmartCutKeepRanges([channel], sampleRate, 0, 3), [{ start: 0, end: 3 }]);
});

test('Smart Cut respects a trimmed source range', () => {
  const sampleRate = 1000;
  const channel = channelWithSound(sampleRate, 10, [[0, 2], [4, 10]]);
  assert.deepEqual(findSmartCutKeepRanges([channel], sampleRate, 1, 5), [
    { start: 1, end: 2.12 },
    { start: 3.88, end: 5 },
  ]);
});
