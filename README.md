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
[![David](https://img.shields.io/david/rx-ts/eslint-mdx.svg)](https://david-dm.org/rx-ts/eslint-mdx)
[![David Dev](https://img.shields.io/david/dev/rx-ts/eslint-mdx.svg)](https://david-dm.org/rx-ts/eslint-mdx?type=dev)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

> [ESLint] Parser/Plugin for [MDX], helps you lint all ES syntaxes excluding `code` block of course.
> Work perfectly with `eslint-plugin-import`, `eslint-plugin-prettier` or any other eslint plugins.

## Packages

This repository is a monorepo that we manage using Lerna. This means we actually publish several packages to npm from the same codebase, including:

| Package                                                  | Version                                                                                                                   | Description                                    |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| [`eslint-mdx`](/packages/eslint-mdx)                     | [![npm](https://img.shields.io/npm/v/eslint-mdx.svg)](https://www.npmjs.com/package/eslint-mdx)                           | ESLint Parser for MDX                          |
| [`@rxts/eslint-plugin-mdx`](/packages/eslint-plugin-mdx) | [![npm](https://img.shields.io/npm/v/@rxts/eslint-plugin-mdx.svg)](https://www.npmjs.com/package/@rxts/eslint-plugin-mdx) | ESLint Plugin, Configuration and Rules for MDX |

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

   2. If you're using `eslint@^5.0.0`, you need to enable this parse/plugin manually, because `eslint@5` does not support `extends` for `overrides` property in its configuration:

      ```json
      {
        "extends": ["plugin:@rxts/mdx/recommended"],
        "overrides": [
          {
            "files": ["*.mdx"],
            "globals": {
              "React": false
            },
            "rules": {
              "lines-between-class-members": 0,
              "react/react-in-jsx-scope": 0
            }
          }
        ]
      }
      ```

2. Make sure ESLint knows to run on `.mdx` files:

   ```sh
   eslint . --ext js,mdx
   ```

## Parser Options

1. `parser` (`string | Function`): Custom parser for ES syntax is supported, although `@typescript-eslint/parser` or `babel-eslint` will be detected automatically what means you actually do not need do this:

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

> This parser/plugin can only handle ES syntaxes for you, markdown related syntaxes will just be ignored, you can use [markdownlint] or [remake-lint] to lint that part.

I have a very preliminary idea to integrate with [remake-lint].

## Changelog

Detailed changes for each release are documented in [CHANGELOG.md](./CHANGELOG.md).

## License

[MIT]

[eslint]: https://eslint.org
[eslint-plugin-react]: https://github.com/yannickcr/eslint-plugin-react
[mdx]: https://github.com/mdx-js/mdx
[mit]: http://opensource.org/licenses/MIT
[markdownlint]: https://github.com/markdownlint/markdownlint
[remake-lint]: https://github.com/remarkjs/remark-lint
