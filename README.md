# `eslint-parser-mdx`

[![Travis](https://img.shields.io/travis/com/rx-ts/eslint-plugin-mdx.svg?style=flat-square)](https://travis-ci.com/rx-ts/eslint-plugin-mdx)
[![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![npm](https://img.shields.io/npm/v/@rxts/eslint-plugin-mdx.svg?style=flat-square)](https://npmjs.org/@rxts/eslint-plugin-mdx)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

> [ESLint](https://eslint.org/) Parser/Plugin for [MDX](https://github.com/mdx-js/mdx)

## Install

```sh
# yarn
yarn add @rxts/eslint-plugin-mdx

# npm
npm i @rxts/eslint-plugin-mdx
```

## Usage

1. In your ESLint config file, add:

   ```json
   {
     "extends": ["plugin:@rxts/mdx/recommended"]
   }
   ```

2. Make sure ESLint knows to run on `.mdx` files:

   ```sh
   eslint . --ext js,mdx
   ```
