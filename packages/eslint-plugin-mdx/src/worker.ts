import { runAsWorker } from 'synckit'
import type { VFileOptions } from 'vfile'
import vfile from 'vfile'

import { getRemarkProcessor } from './rules'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
runAsWorker(
  async (
    textOrFileOptions: string | VFileOptions,
    physicalFilename: string,
    isMdx: boolean,
  ) => {
    const remarkProcessor = getRemarkProcessor(physicalFilename, isMdx)
    const file = vfile(textOrFileOptions)
    try {
      await remarkProcessor.process(file)
    } catch (err) {
      if (!file.messages.includes(err)) {
        file.message(err).fatal = true
      }
    }
    return typeof textOrFileOptions === 'string'
      ? file.toString()
      : { messages: file.messages }
  },
)
