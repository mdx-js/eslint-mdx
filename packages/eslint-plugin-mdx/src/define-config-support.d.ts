export interface Extends {
  'plugin:mdx/base': void
  'plugin:mdx/code-blocks': void
  'plugin:mdx/codeBlocks': void
  'plugin:mdx/flat': void
  'plugin:mdx/flatCodeBlocks': void
  'plugin:mdx/overrides': void
  'plugin:mdx/recommended': void
}

export interface Plugins {
  mdx: void
}

export interface RuleOptions {
  /**
   * Linter integration with remark plugins
   */
  'mdx/remark': []
}

declare module 'eslint-define-config' {
  export interface CustomExtends extends Extends {}
  export interface CustomPlugins extends Plugins {}
  export interface CustomRuleOptions extends RuleOptions {}
}
