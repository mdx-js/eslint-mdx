import { hasProperties } from 'eslint-mdx'
import { runAsWorker } from 'synckit'
import type { VFileOptions } from 'vfile'

import { getRemarkProcessor } from './rules'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
runAsWorker(
  async (options: VFileOptions, physicalFilename: string, isMdx: boolean) => {
    const remarkProcessor = getRemarkProcessor(physicalFilename, isMdx)
    try {
      const vfile = await remarkProcessor.process(options)
      return {
        messages: vfile.messages,
      }
    } catch (err) {
      return {
        error: {
          message: hasProperties<Error>(err, ['message'])
            ? err.message
            : (console.error(err),
              'Fetal error without message, please check the output instead'),
        },
      }
    }
  },
)
