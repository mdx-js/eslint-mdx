<p align="center">
  <a href="https://eslint.org">
    <img src="https://eslint.org/assets/img/logo.svg" height="50">
  </a>
  <a href="#readme">
    <img src="https://rx-ts.github.io/assets/heart.svg" height="50">
  </a>
  <a href="https://github.com/mdx-js/mdx">
    <img src="https://mdx-logo.now.sh"  height="50">
  </a>
</p>

[![Travis](https://img.shields.io/travis/com/mdx-js/eslint-mdx.svg)](https://travis-ci.com/mdx-js/eslint-mdx)
[![Codacy Grade](https://img.shields.io/codacy/grade/4ea8225261c04837995a858676caae4b)](https://www.codacy.com/app/JounQin/eslint-mdx)
[![Codecov](https://img.shields.io/codecov/c/gh/mdx-js/eslint-mdx)](https://codecov.io/gh/mdx-js/eslint-mdx)
[![type-coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fmdx-js%2Feslint-mdx%2Fmaster%2Fpackage.json)](https://github.com/plantain-00/type-coverage)
[![GitHub release](https://img.shields.io/github/release/mdx-js/eslint-mdx)](https://github.com/mdx-js/eslint-mdx/releases)
[![David Dev](https://img.shields.io/david/dev/mdx-js/eslint-mdx.svg)](https://david-dm.org/mdx-js/eslint-mdx?type=dev)

[![Conventional Commits](https://img.shields.io/badge/conventional%20commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org)
[![codechecks.io](https://raw.githubusercontent.com/codechecks/docs/master/images/badges/badge-default.svg?sanitize=true)](https://codechecks.io)

> [ESLint][] Parser/Plugin for [MDX][], helps you lint all ES syntaxes.
> Linting `code` blocks can be enabled with `mdx/code-blocks` setting too!
> Work perfectly with `eslint-plugin-import`, `eslint-plugin-prettier` or any other eslint plugins.
> And also can be integrated with [remark-lint][] plugins to lint markdown syntaxes.

## TOC <!-- omit in toc -->

- [VSCode Extension](#vscode-extension)
- [Packages](#packages)
- [Install](#install)
- [Notice](#notice)
- [Usage](#usage)
- [Parser Options](#parser-options)
- [Rules](#rules)
  - [mdx/no-jsx-html-comments](#mdxno-jsx-html-comments)
  - [mdx/no-unused-expressions](#mdxno-unused-expressions)
  - [mdx/remark](#mdxremark)
- [Prettier Integration](#prettier-integration)
- [Changelog](#changelog)
- [License](#license)

## VSCode Extension

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/JounQin.vscode-mdx)](https://marketplace.visualstudio.com/items?itemName=JounQin.vscode-mdx)

[VSCode MDX][]\: Integrates with [VSCode ESLint][], syntaxes highlighting and error reporting.

## Packages

This repository is a monorepo managed by [Lerna][] what means we actually publish several packages to npm from same codebase, including:

| Package                                            | Description                                    | Version                                                                                                       | Peer Dependencies                                                                                                                                                                          | Dependencies                                                                                                                                                           |
| -------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`eslint-mdx`](/packages/eslint-mdx)               | ESLint Parser for MDX                          | [![npm](https://img.shields.io/npm/v/eslint-mdx.svg)](https://www.npmjs.com/package/eslint-mdx)               | [![David Peer](https://img.shields.io/david/peer/mdx-js/eslint-mdx.svg?path=packages/eslint-mdx)](https://david-dm.org/mdx-js/eslint-mdx?path=packages/eslint-mdx&type=peer)               | [![David](https://img.shields.io/david/mdx-js/eslint-mdx.svg?path=packages/eslint-mdx)](https://david-dm.org/mdx-js/eslint-mdx?path=packages/eslint-mdx)               |
| [`eslint-plugin-mdx`](/packages/eslint-plugin-mdx) | ESLint Plugin, Configuration and Rules for MDX | [![npm](https://img.shields.io/npm/v/eslint-plugin-mdx.svg)](https://www.npmjs.com/package/eslint-plugin-mdx) | [![David Peer](https://img.shields.io/david/peer/mdx-js/eslint-mdx.svg?path=packages/eslint-plugin-mdx)](https://david-dm.org/mdx-js/eslint-mdx?path=packages/eslint-plugin-mdx&type=peer) | [![David](https://img.shields.io/david/mdx-js/eslint-mdx.svg?path=packages/eslint-plugin-mdx)](https://david-dm.org/mdx-js/eslint-mdx?path=packages/eslint-plugin-mdx) |

## Install

```sh
# yarn
yarn add -D eslint-plugin-mdx

# npm
npm i -D eslint-plugin-mdx
```

## Notice

If you're using multi languages, `js/jsx/ts/tsx/vue`, etc for example, you'd better to always use [`overrides`](https://eslint.org/docs/user-guide/configuring/configuration-files#how-do-overrides-work) feature of ESLint, because configs may be overridden by following configs.

See [#251](https://github.com/mdx-js/eslint-mdx/issues/251#issuecomment-736139224) for more details.

## Usage

1. In your ESLint config file:

   1. If you're using `eslint >= 6.4.0`, just add:

      ```jsonc
      {
        "extends": ["plugin:mdx/recommended"],
        // optional, if you want to lint code blocks at the same time
        "settings": {
          "mdx/code-blocks": true,
          // optional, if you want to disable language mapper, set it to `false`
          // if you want to override the default language mapper inside, you can provide your own
          "mdx/language-mapper": {}
        }
      }
      ```

   2. If you're using `eslint >=6.0.0 and <6.4.0`, add as following because it does not support overrides from npm pkg:

      ```jsonc
      {
        "extends": ["plugin:mdx/recommended"],
        // optional, if you want to lint code blocks at the same time
        "settings": {
          "mdx/code-blocks": true,
          // optional, if you want to disable language mapper, set it to `false`
          // if you want to override the default language mapper inside, you can provide your own
          "mdx/language-mapper": {}
        },
        "overrides": [
          {
            "files": ["*.md"],
            "rules": {
              "prettier/prettier": [
                2,
                {
                  // unnecessary if you're not using `eslint-plugin-prettier`, but required if you are
                  "parser": "markdown"
                }
              ]
            }
          },
          {
            "files": ["*.mdx"],
            "extends": ["plugin:mdx/overrides"]
          },
          {
            "files": "**/*.{md,mdx}/**",
            "extends": "plugin:mdx/code-blocks"
          }
        ]
      }
      ```

   3. If you're using `eslint@^5.0.0`, you need to enable this parser/plugin manually, because `eslint@5` does not support `extends` for `overrides` property in its configuration:

      ```js
      const configs = require('eslint-plugin-mdx/lib/configs')

      module.exports = {
        extends: ['plugin:mdx/recommended'],
        // optional, if you want to lint code blocks at the same time
        settings: {
          'mdx/code-blocks': true,
          // optional, if you want to disable language mapper, set it to `false`
          // if you want to override the default language mapper inside, you can provide your own
          'mdx/language-mapper': {},
        },
        overrides: [
          {
            files: ['*.md'],
            rules: {
              'prettier/prettier': [
                2,
                {
                  // unnecessary if you're not using `eslint-plugin-prettier`, but required if you are
                  parser: 'markdown',
                },
              ],
            },
          },
          {
            files: ['*.mdx'],
            ...configs.overrides,
          },
          {
            files: '**/*.{md,mdx}/**',
            ...configs.codeBlocks,
          },
        ],
      }
      ```

2. Make sure ESLint knows to run on `.md` or `.mdx` files:

   ```sh
   eslint . --ext js,md,mdx
   ```

## Parser Options

1. `parser` (`string | ParserConfig | ParserFn`): Custom parser for ES syntax is supported, although `@typescript-eslint/parser` or `@babel/eslint-parser` or `babel-eslint` will be detected automatically what means you actually do not need to do this:

   ```json
   {
     "extends": ["plugin:mdx/recommended"],
     "parserOptions": {
       "parser": "babel-eslint"
     }
   }
   ```

2. `extensions` (`string | string[]`): `eslint-mdx` will only resolve `.mdx` files by default, files with other extensions will be resolved by the `parser` option. If you want to resolve other extensions as like `.mdx`, you can use this option.

3. `markdownExtensions` (`string | string[]`): `eslint-mdx` will only treat `.md` files as plain markdown by default, and will lint them via remark plugins. If you want to resolve other extensions as like `.md`, you can use this option.

## Rules

### mdx/no-jsx-html-comments

_Fixable_: HTML style comments in jsx block is invalid, this rule will help you to fix it by transforming it to JSX style comments.

### mdx/no-unused-expressions

[MDX][] can render `jsx` block automatically without exporting them, but [ESLint][] will report `no-unused-expressions` issue which could be unexpected, this rule is the replacement, so make sure that you've turned off the original `no-unused-expressions` rule.

### mdx/remark

_possible fixable depends on your remark plugins_:

Integration with [remark-lint][] plugins, it will read [remark's configuration](https://github.com/remarkjs/remark/tree/master/packages/remark-cli#remark-cli) automatically via [cosmiconfig][]. But `.remarkignore` will not be respected, you should use `.eslintignore` instead.

If you want to disable or change severity of some related rules, it won't work by setting rules in eslint config like `'remark-lint-no-duplicate-headings': 0`, you should change your remark config instead like following:

```jsonc
{
  "plugins": [
    "@1stg/remark-config",
    // change to error severity, notice `[]` is required
    ["lint-no-duplicate-headings", [2]],
    // disable following plugin
    [
      "lint-no-multiple-toplevel-headings",
      [0] // or false
    ]
  ]
}
```

## Prettier Integration

If you're using [remark-lint][] feature with [Prettier][] both together, you can try [remark-preset-prettier][] which helps you to _turn off all rules that are unnecessary or might conflict with [Prettier][]_.

```json
{
  "plugins": [
    "preset-lint-consistent",
    "preset-lint-recommended",
    "preset-lint-markdown-style-guide",
    "preset-prettier"
  ]
}
```

## Changelog

Detailed changes for each release are documented in [CHANGELOG.md](./CHANGELOG.md).

## License

[MIT][] © [JounQin][]@[1stG.me][]

[1stg.me]: https://www.1stg.me
[cosmiconfig]: https://github.com/davidtheclark/cosmiconfig
[eslint]: https://eslint.org
[jounqin]: https://GitHub.com/JounQin
[lerna]: https://github.com/lerna/lerna
[mdx]: https://github.com/mdx-js/mdx
[mit]: http://opensource.org/licenses/MIT
[prettier]: https://prettier.io
[remark-lint]: https://github.com/remarkjs/remark-lint
[remark-preset-prettier]: https://github.com/JounQin/remark-preset-prettier
[vscode eslint]: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
[vscode mdx]: https://github.com/mdx-js/vscode-mdx
