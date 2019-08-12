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

[![Travis](https://img.shields.io/travis/com/rx-ts/eslint-mdx.svg)](https://travis-ci.com/rx-ts/eslint-mdx)
[![Codecov](https://img.shields.io/codecov/c/gh/rx-ts/eslint-mdx)](https://codecov.io/gh/rx-ts/eslint-mdx)
[![type-coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Frx-ts%2Feslint-mdx%2Fmaster%2Fpackage.json)](https://github.com/rx-ts/eslint-mdx)
[![GitHub release](https://img.shields.io/github/release/rx-ts/eslint-mdx)](https://github.com/rx-ts/eslint-mdx/releases)
[![David Dev](https://img.shields.io/david/dev/rx-ts/eslint-mdx.svg)](https://david-dm.org/rx-ts/eslint-mdx?type=dev)
[![Conventional Commits](https://img.shields.io/badge/conventional%20commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org)
[![codechecks.io](https://raw.githubusercontent.com/codechecks/docs/master/images/badges/badge-default.svg?sanitize=true)](https://codechecks.io)

> [ESLint] Parser/Plugin for [MDX], helps you lint all ES syntaxes excluding `code` block of course.
> Work perfectly with `eslint-plugin-import`, `eslint-plugin-prettier` or any other eslint plugins.

## VSCode Extension [![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/JounQin.vscode-mdx)](https://marketplace.visualstudio.com/items?itemName=JounQin.vscode-mdx)

[VSCode MDX]: Integrates with [VSCode ESLint], syntaxes highlighting and error reporting.

## Packages

This repository is a monorepo managed by [Lerna] what means we actually publish several packages to npm from same codebase, including:

| Package                                                  | Description                                    | Version                                                                                                                   | Peer Dependencies                                                                                                                                                                        | Dependencies                                                                                                                                                         |
| -------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`eslint-mdx`](/packages/eslint-mdx)                     | ESLint Parser for MDX                          | [![npm](https://img.shields.io/npm/v/eslint-mdx.svg)](https://www.npmjs.com/package/eslint-mdx)                           | [![David Peer](https://img.shields.io/david/peer/rx-ts/eslint-mdx.svg?path=packages/eslint-mdx)](https://david-dm.org/rx-ts/eslint-mdx?path=packages/eslint-mdx&type=peer)               | [![David](https://img.shields.io/david/rx-ts/eslint-mdx.svg?path=packages/eslint-mdx)](https://david-dm.org/rx-ts/eslint-mdx?path=packages/eslint-mdx)               |
| [`@rxts/eslint-plugin-mdx`](/packages/eslint-plugin-mdx) | ESLint Plugin, Configuration and Rules for MDX | [![npm](https://img.shields.io/npm/v/@rxts/eslint-plugin-mdx.svg)](https://www.npmjs.com/package/@rxts/eslint-plugin-mdx) | [![David Peer](https://img.shields.io/david/peer/rx-ts/eslint-mdx.svg?path=packages/eslint-plugin-mdx)](https://david-dm.org/rx-ts/eslint-mdx?path=packages/eslint-plugin-mdx&type=peer) | [![David](https://img.shields.io/david/rx-ts/eslint-mdx.svg?path=packages/eslint-plugin-mdx)](https://david-dm.org/rx-ts/eslint-mdx?path=packages/eslint-plugin-mdx) |

## Install

```sh
# yarn
yarn add -D @rxts/eslint-plugin-mdx

# npm
npm i -D @rxts/eslint-plugin-mdx
```

## Usage

1. In your ESLint config file:

   1. If you're using `eslint >= 6.0.0`, add:

      ```json
      {
        "extends": ["plugin:@rxts/mdx/recommended"],
        "overrides": [
          {
            "files": ["*.mdx"],
            "extends": ["plugin:@rxts/mdx/overrides"]
          }
        ]
      }
      ```

   2. If you're using `eslint@^5.0.0`, you need to enable this parser/plugin manually, because `eslint@5` does not support `extends` for `overrides` property in its configuration:

      ```js
      const rebass = require('rebass')

      module.exports = {
        extends: ['plugin:@rxts/mdx/recommended'],
        overrides: [
          {
            files: ['*.mdx'],
            globals: Object.keys(rebass).reduce(
              (globals, Component) =>
                Object.assign(globals, {
                  [Component]: false,
                }),
              {
                React: false,
              },
            ),
            rules: {
              'lines-between-class-members': 0,
              'react/jsx-no-undef': [
                2,
                {
                  allowGlobals: true,
                },
              ],
              'react/react-in-jsx-scope': 0,
            },
          },
        ],
      }
      ```

2. Make sure ESLint knows to run on `.mdx` files:

   ```sh
   eslint . --ext js,mdx
   ```

## Parser Options

1. `parser` (`string | ParserConfig | ParserFn`): Custom parser for ES syntax is supported, although `@typescript-eslint/parser` or `babel-eslint` will be detected automatically what means you actually do not need to do this:

   ```json
   {
     "extends": ["plugin:@rxts/mdx/recommended"],
     "parserOptions": {
       "parser": "babel-eslint"
     }
   }
   ```

2. `extensions` (`string | string[]`): `eslint-mdx` will only resolve `.mdx` files by default, files with other extensions will be resolved by the `parser` option. If you want to resolve other extensions as like `.mdx`, you can use this option.

## Rules

### @rxts/mdx/no-jsx-html-comments

HTML style comments in jsx block is invalid, this rule will help you to fix it by transforming it to JSX style comments.

### @rxts/mdx/no-unescaped-entities

Inline JSX like `Inline <Component />` is supported by [MDX], but rule `react/no-unescaped-entities` from [eslint-plugin-react] is incompatible with it, `@rxts/mdx/no-unescaped-entities` is the replacement.

### @rxts/mdx/no-unused-expressions

[MDX] can render `jsx` block automatically without exporting them, but [ESLint] will report `no-unused-expressions` issue which could be unexpected, this rule is a replacement of it, so make sure that you've turned off the original `no-unused-expressions` rule.

## Limitation

> This parser/plugin can only handle ES syntaxes for you, markdown related syntaxes will just be ignored, you can use [markdownlint] or [remark-lint] to lint that part.

I have a very preliminary idea to integrate with [remark-lint].

## Changelog

Detailed changes for each release are documented in [CHANGELOG.md](./CHANGELOG.md).

## License

[MIT] © [JounQin]@[1stG]

[1stg]: https://www.1stg.me
[eslint]: https://eslint.org
[eslint-plugin-react]: https://github.com/yannickcr/eslint-plugin-react
[jounqin]: https://GitHub.com/JounQin
[lerna]: https://github.com/lerna/lerna
[mdx]: https://github.com/mdx-js/mdx
[mit]: http://opensource.org/licenses/MIT
[markdownlint]: https://github.com/markdownlint/markdownlint
[remark-lint]: https://github.com/remarkjs/remark-lint
[vscode eslint]: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
[vscode mdx]: https://github.com/rx-ts/vscode-mdx
