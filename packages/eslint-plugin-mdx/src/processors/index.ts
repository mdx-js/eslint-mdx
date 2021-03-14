import { markdown } from './markdown'
import { remark } from './remark'

export * from './options'
export * from './types'

export const processors = {
  markdown,
  remark,
}
