# Contributing

Hi! 👋 We’re excited that you’re interested in contributing!

## Core Guidelines

[Read the guidelines on the MDX website][contributing]

## Packages Releasing Difference

This project is a [lerna][] monorepo, so packages releasing is controlled by [lerna][].

1. Make sure you have both GitHub repository and npm write permissions at the same time.
2. Export an environment named `GH_TOKEN` for `lerna publish`.
3. Run `yarn deploy` simply, or `GH_TOKEN=xxx yarn deploy` to export `GH_TOKEN` at one time.

[contributing]: https://mdxjs.com/contributing
[lerna]: https://github.com/lerna/lerna
