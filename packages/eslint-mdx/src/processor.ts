import fs from 'fs'
import path from 'path'

/**
 * Given a filepath, get the nearest path that is a regular file.
 * The filepath provided by eslint may be a virtual filepath rather than a file
 * on disk. This attempts to transform a virtual path into an on-disk path
 */
export const getPhysicalFilename = (filename: string): string => {
  try {
    if (fs.statSync(filename).isFile()) {
      return filename
    }
  } catch (err) {
    // https://github.com/eslint/eslint/issues/11989
    if ((err as { code: string }).code === 'ENOTDIR') {
      return getPhysicalFilename(path.dirname(filename))
    }
  }

  return filename
}
