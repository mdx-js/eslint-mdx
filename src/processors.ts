import { normalizeMdx } from './normalizer'

export const processors = {
  '.mdx': {
    preprocess(code: string) {
      return [normalizeMdx(code)]
    },
    supportsAutofix: true,
  },
}
