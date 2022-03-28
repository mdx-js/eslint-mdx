# Contributing

Hi! 👋 We’re excited that you’re interested in contributing!

## Core Guidelines

[Read the guidelines on the MDX website][contributing]

## Packages Releasing Difference

This project is a [lerna][] monorepo, so packages releasing is controlled by [lerna][].

1. Make sure you have both GitHub repository and npm write permissions at the same time.
2. You need a GitHub token with a `public_repo` scope as `GH_TOKEN` in the environment to publish
3. Run `yarn release` simply, or `GH_TOKEN=xxx yarn release` to export `GH_TOKEN` at one time.

### Release a bete next version

Run `yarn release-next`

[contributing]: https://mdxjs.com/contributing
[lerna]: https://github.com/lerna/lerna
