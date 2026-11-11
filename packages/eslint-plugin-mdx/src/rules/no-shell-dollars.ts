import type { Rule } from 'eslint'
import type { MDCode } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'no-shell-dollars': never
  }
}

const shellLanguages = new Set([
  'bash',
  'bats',
  'command',
  'csh',
  'ebuild',
  'eclass',
  'ksh',
  'sh',
  'sh.in',
  'tcsh',
  'tmux',
  'tool',
  'zsh',
  'zsh-theme',
  'abuild',
  'alpine-abuild',
  'apkbuild',
  'gentoo-ebuild',
  'gentoo-eclass',
  'openrc',
  'openrc-runscript',
  'shell',
  'shell-script',
])

export const noShellDollars: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow shell code prefixed by dollar signs',
    },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context.sourceCode, 'no-shell-dollars')

    if (!config) {
      return {}
    }

    return {
      MDCode(node: MDCode) {
        if (!node.lang || !shellLanguages.has(node.lang)) {
          return
        }

        const lines = node.value
          .split('\n')
          .map(line => line.trim())
          .filter(Boolean)

        if (lines.length > 0 && lines.every(line => line.startsWith('$'))) {
          context.report({
            loc: node.loc,
            message:
              'Unexpected shell code with every line prefixed by `$`, expected different code for input and output',
          })
        }
      },
    }
  },
}
