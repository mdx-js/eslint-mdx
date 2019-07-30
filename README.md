# `eslint-plugin-mdx`

[![Travis](https://img.shields.io/travis/com/rx-ts/eslint-plugin-mdx.svg)](https://travis-ci.com/rx-ts/eslint-plugin-mdx)
[![npm](https://img.shields.io/npm/v/@rxts/eslint-plugin-mdx.svg)](https://npmjs.org/@rxts/eslint-plugin-mdx)
[![David](https://img.shields.io/david/rx-ts/eslint-plugin-mdx.svg)](https://david-dm.org/rx-ts/eslint-plugin-mdx)
[![David Dev](https://img.shields.io/david/dev/rx-ts/eslint-plugin-mdx.svg)](https://david-dm.org/rx-ts/eslint-plugin-mdx?type=dev)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

> [ESLint](https://eslint.org/) Parser/Plugin for [MDX](https://github.com/mdx-js/mdx)

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
        "overrides": [
          {
            "files": ["*.mdx"],
            "extends": ["plugin:@rxts/mdx/recommended"]
          }
        ]
      }
      ```

   2. If you're using `eslint@^5.0.0`, you need to enable this parse/plugin manually, because `eslint@5` does not support `extends` for `overrides` property in its configuration:

      ```json
      {
        "overrides": [
          {
            "files": ["*.mdx"],
            "parser": "@rxts/eslint-plugin-mdx",
            "plugins": ["@rxts/mdx"],
            "rules": {
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

3. Custom parser for ES syntax is also supported:

   ```json
   {
     "overrides": [
       {
         "files": ["*.mdx"],
         "extends": ["plugin:@rxts/mdx/recommended"],
         "parserOptions": {
           "parser": "babel-eslint"
         }
       }
     ]
   }
   ```

## Changelog

Detailed changes for each release are documented in [CHANGELOG.md](./CHANGELOG.md).

## License

[MIT](http://opensource.org/licenses/MIT)
