import { getRemarkProcessor } from 'eslint-mdx'
import { runAsWorker } from 'synckit'
import type { VFileOptions } from 'vfile'
import vfile from 'vfile'

runAsWorker(
  async (
    fileOptions: VFileOptions,
    physicalFilename: string,
    isMdx: boolean,
  ) => {
    const remarkProcessor = getRemarkProcessor(physicalFilename, isMdx)
    const file = vfile(fileOptions)
    try {
      await remarkProcessor.process(file)
    } catch (err) {
      if (!file.messages.includes(err)) {
        file.message(err).fatal = true
      }
    }
    return {
      messages: file.messages,
      content: file.toString(),
    }
  },
).catch(console.error)
