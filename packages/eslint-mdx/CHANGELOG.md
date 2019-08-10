# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.9.6](https://github.com/rx-ts/eslint-mdx/compare/v0.9.5...v0.9.6) (2019-08-07)


### Bug Fixes

* custom parser resolved undefined error ([1bbb1ff](https://github.com/rx-ts/eslint-mdx/commit/1bbb1ff))

## [0.9.5](https://github.com/rx-ts/eslint-mdx/compare/v0.9.3...v0.9.5) (2019-08-05)


### Bug Fixes

* options unchangeable issue for default parser ([e76c483](https://github.com/rx-ts/eslint-mdx/commit/e76c483))

## [0.9.4](https://github.com/rx-ts/eslint-mdx/compare/v0.9.3...v0.9.4) (2019-08-05)


### Bug Fixes

* adjacent jsx nodes should be allowed in mdx ([8456381](https://github.com/rx-ts/eslint-mdx/commit/8456381))
* skip combine jsx nodes for root/jsx node ([90583f7](https://github.com/rx-ts/eslint-mdx/commit/90583f7))

## [0.9.3](https://github.com/rx-ts/eslint-mdx/compare/v0.9.1...v0.9.3) (2019-08-04)


### Bug Fixes

* error from typescript parser in plain object ([f634e40](https://github.com/rx-ts/eslint-mdx/commit/f634e40))

## [0.9.1](https://github.com/rx-ts/eslint-mdx/compare/v0.9.0...v0.9.1) (2019-08-03)


### Bug Fixes

* always extends base config ([530160a](https://github.com/rx-ts/eslint-mdx/commit/530160a))

## [0.9.0](https://github.com/rx-ts/eslint-mdx/compare/v0.8.1...v0.9.0) (2019-08-03)


### Features

* support other extensions, detect parsers automatically ([5386098](https://github.com/rx-ts/eslint-mdx/commit/5386098))

## [0.8.1](https://github.com/rx-ts/eslint-mdx/compare/v0.7.1...v0.8.1) (2019-08-03)


### Features

* split into two packages, use lerna as publisher ([#22](https://github.com/rx-ts/eslint-mdx/issues/22)) ([349b1ff](https://github.com/rx-ts/eslint-mdx/commit/349b1ff)), closes [#21](https://github.com/rx-ts/eslint-mdx/issues/21)

## [0.8.0](https://github.com/rx-ts/eslint-mdx/compare/v0.7.1...v0.8.0) (2019-08-03)


### Features

* split into two packages, use lerna as publisher ([#22](https://github.com/rx-ts/eslint-mdx/issues/22)) ([349b1ff](https://github.com/rx-ts/eslint-mdx/commit/349b1ff)), closes [#21](https://github.com/rx-ts/eslint-mdx/issues/21)

## [0.7.1](https://github.com/rx-ts/eslint-mdx/compare/v0.7.0...v0.7.1) (2019-08-03)


### Features

* export a parse function for compatibility usage ([0fdaf9f](https://github.com/rx-ts/eslint-mdx/commit/0fdaf9f))

## [0.7.0](https://github.com/rx-ts/eslint-mdx/compare/v0.6.0...v0.7.0) (2019-08-02)


### Features

* add new rule no-unescaped-entities ([dca8633](https://github.com/rx-ts/eslint-mdx/commit/dca8633))

## [0.6.0](https://github.com/rx-ts/eslint-mdx/compare/v0.5.0...v0.6.0) (2019-08-02)


### Features

* add new rule `no-jsx-html-comments`, close [#13](https://github.com/rx-ts/eslint-mdx/issues/13) ([67ba91e](https://github.com/rx-ts/eslint-mdx/commit/67ba91e))
* processor support for normalize comments in jsx [ci skip] ([114831c](https://github.com/rx-ts/eslint-mdx/commit/114831c))

## [0.5.0](https://github.com/rx-ts/eslint-mdx/compare/v0.4.1...v0.5.0) (2019-07-31)


### Features

* add `@rxts/mdx/no-unused-expressions` rule to replace eslint's ([5d62b55](https://github.com/rx-ts/eslint-mdx/commit/5d62b55))

## [0.4.1](https://github.com/rx-ts/eslint-mdx/compare/v0.4.0...v0.4.1) (2019-07-31)


### Features

* perf: extract `parseMdx`, exports everything in package ([1f965a1](https://github.com/rx-ts/eslint-mdx/commit/1f965a1))

## [0.4.0](https://github.com/rx-ts/eslint-mdx/compare/v0.3.1...v0.4.0) (2019-07-31)


### Features

* add body and comments into ast, fix [#12](https://github.com/rx-ts/eslint-mdx/issues/12) ([5b28bd5](https://github.com/rx-ts/eslint-mdx/commit/5b28bd5))

## [0.3.1](https://github.com/rx-ts/eslint-mdx/compare/v0.3.0...v0.3.1) (2019-07-30)


### Bug Fixes

* `.*` could not match multi lines, use `[\s\S]*` instead, close [#4](https://github.com/rx-ts/eslint-mdx/issues/4) ([f7e7efe](https://github.com/rx-ts/eslint-mdx/commit/f7e7efe))

## [0.3.0](https://github.com/rx-ts/eslint-mdx/compare/v0.2.1...v0.3.0) (2019-07-30)


### Bug Fixes

* inline jsx and comment parsing error, close [#4](https://github.com/rx-ts/eslint-mdx/issues/4), [#7](https://github.com/rx-ts/eslint-mdx/issues/7) ([5297a0b](https://github.com/rx-ts/eslint-mdx/commit/5297a0b))

## [0.2.1](https://github.com/rx-ts/eslint-mdx/compare/v0.2.0...v0.2.1) (2019-07-30)


### Bug Fixes

* eslint@5 is actually supported ([e470ddc](https://github.com/rx-ts/eslint-mdx/commit/e470ddc))

## [0.2.0](https://github.com/rx-ts/eslint-mdx/compare/v0.1.3...v0.2.0) (2019-07-30)


### Features

* support custom parser like babel-eslint ([b718574](https://github.com/rx-ts/eslint-mdx/commit/b718574))

## [0.1.3](https://github.com/rx-ts/eslint-mdx/compare/v0.1.2...v0.1.3) (2019-07-29)


### Bug Fixes

* upgrade peer dependency eslint to >= 6.0.0 ([#3](https://github.com/rx-ts/eslint-mdx/issues/3) [#4](https://github.com/rx-ts/eslint-mdx/issues/4)) ([f0ab288](https://github.com/rx-ts/eslint-mdx/commit/f0ab288))

## [0.1.2](https://github.com/rx-ts/eslint-mdx/compare/v0.1.1...v0.1.2) (2019-07-29)


### Bug Fixes

* show correct column and line on lint error ([90c5390](https://github.com/rx-ts/eslint-mdx/commit/90c5390))

## [0.1.1](https://github.com/rx-ts/eslint-mdx/compare/v0.1.0...v0.1.1) (2019-07-29)


### Bug Fixes

* overrides in node_modules seems not working ([d2f1535](https://github.com/rx-ts/eslint-mdx/commit/d2f1535))

## 0.1.0 (2019-07-29)


### Features

* traverse ast nodes ([6a71e25](https://github.com/rx-ts/eslint-mdx/commit/6a71e25))
