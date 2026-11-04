// This VPS has deliberately modest resources. Keep one FFmpeg render active at
// a time so an export never makes the editor or site unresponsive for everyone.
type QueuedExport = { id: string; run: () => Promise<void>; priority: number };

type QueueState = {
  activeId?: string;
  jobs: QueuedExport[];
  draining: boolean;
};

const globalQueue = globalThis as typeof globalThis & { nexuscutExportQueue?: QueueState };
const state: QueueState = globalQueue.nexuscutExportQueue ?? {
  jobs: [],
  draining: false,
};
globalQueue.nexuscutExportQueue = state;

export const EXPORT_QUEUE_CAPACITY = 5;

async function drain() {
  if (state.draining) return;
  state.draining = true;
  try {
    while (state.jobs.length) {
      const job = state.jobs.shift()!;
      state.activeId = job.id;
      try {
        await job.run();
      } catch (error) {
        // The job itself records an actionable error for the browser. Do not
        // let one failed render block everyone behind it.
        console.error('Queued export failed', error);
      } finally {
        state.activeId = undefined;
      }
    }
  } finally {
    state.draining = false;
  }
}

export function enqueueExport(id: string, run: () => Promise<void>, priority = 0) {
  const total = state.jobs.length + (state.activeId ? 1 : 0);
  if (total >= EXPORT_QUEUE_CAPACITY) return { accepted: false as const };

  const job = { id, run, priority };
  // Agency (2) queues ahead of Pro (1), and Pro queues ahead of standard (0).
  // Never interrupt an active render and preserve FIFO within each level.
  const firstLowerPriorityJob = state.jobs.findIndex((queuedJob) => queuedJob.priority < priority);
  if (firstLowerPriorityJob === -1) state.jobs.push(job);
  else state.jobs.splice(firstLowerPriorityJob, 0, job);

  const queueIndex = state.jobs.findIndex((queuedJob) => queuedJob.id === id);
  const position = queueIndex + 1 + (state.activeId ? 1 : 0);
  void drain();
  return { accepted: true as const, position };
}

export function getExportQueuePosition(id: string) {
  if (state.activeId === id) return 0;
  const index = state.jobs.findIndex((job) => job.id === id);
  return index === -1 ? undefined : index + 1 + (state.activeId ? 1 : 0);
}
