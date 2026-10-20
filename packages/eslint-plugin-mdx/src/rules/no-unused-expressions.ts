import path from 'node:path'

import type { Rule } from 'eslint'
// eslint-disable-next-line sonarjs/deprecation -- the only way to reuse a built-in rule
import { builtinRules } from 'eslint/use-at-your-own-risk'
import type { ParserOptions } from 'eslint-mdx'
import { arrayify, DEFAULT_EXTENSIONS, MARKDOWN_EXTENSIONS } from 'eslint-mdx'

interface CoreRule {
  meta?: {
    defaultOptions?: unknown[]
    messages?: Record<string, string>
    schema?: unknown
  }
  create(context: Rule.RuleContext): Rule.RuleListener
}

// eslint-disable-next-line sonarjs/deprecation -- the only way to reuse a built-in rule
const coreRule: CoreRule = builtinRules.get('no-unused-expressions')

const isMdxFile = (
  filename: string,
  extensions?: string[] | string,
  markdownExtensions?: string[] | string,
) => {
  const extname = path.extname(filename)
  return (
    [...DEFAULT_EXTENSIONS, ...arrayify(extensions)].includes(extname) ||
    [...MARKDOWN_EXTENSIONS, ...arrayify(markdownExtensions)].includes(extname)
  )
}

export const noUnusedExpressions: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow unused expressions outside MDX content',
      recommended: true,
    },
    schema: coreRule.meta?.schema,
    defaultOptions: coreRule.meta?.defaultOptions,
    messages: coreRule.meta?.messages,
  },
  create(context) {
    const filename =
      context.filename ??
      (context as unknown as { getFilename: () => string }).getFilename.call(
        context,
      )

    const { extensions, markdownExtensions } = {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
      // @ts-ignore -- ESLint v10 removed
      ...context.parserOptions,
      ...context.languageOptions?.parserOptions,
    } as ParserOptions

    const isMdx = isMdxFile(filename, extensions, markdownExtensions)
    const contextOptions = (context as unknown as { options: unknown[] })
      .options

    // The core rule assumes it always receives an options object, while ESLint
    // passes an empty array to a userland rule configured without options.
    const coreContext = Object.create(context) as Rule.RuleContext
    Object.defineProperty(coreContext, 'options', {
      configurable: true,
      enumerable: true,
      value: contextOptions.length > 0 ? contextOptions : [{}],
      writable: true,
    })

    const visitors = coreRule.create(coreContext)
    const visitExpressionStatement = visitors.ExpressionStatement

    return {
      ...visitors,
      ExpressionStatement(node) {
        // MDX content expressions are emitted as top-level statements. They
        // are expressions in the document, not unused JavaScript statements.
        if (
          isMdx &&
          (node as { parent?: { type: string } }).parent?.type === 'Program'
        ) {
          return
        }

        visitExpressionStatement(node)
      },
    }
  },
}
