import { createSyncFn } from 'synckit'

import type {
  WorkerOptions,
  WorkerParseResult,
  WorkerProcessResult,
} from './types'

const workerPath = require.resolve('./worker')

export const performSyncWork = createSyncFn(workerPath) as ((
  options: Omit<WorkerOptions, 'process'>,
) => WorkerParseResult) &
  ((options: WorkerOptions & { process: true }) => WorkerProcessResult)
