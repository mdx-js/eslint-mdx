import { createSyncFn } from 'synckit'

import { cjsRequire } from './helpers.ts'
import type {
  WorkerOptions,
  WorkerParseResult,
  WorkerProcessResult,
} from './types.js'

export const performSyncWork = createSyncFn(
  cjsRequire.resolve('./worker.js'),
) as ((options: Omit<WorkerOptions, 'process'>) => WorkerParseResult) &
  ((options: WorkerOptions & { process: true }) => WorkerProcessResult)
