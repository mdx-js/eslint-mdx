// @ts-check

/** @import {Options} from 'remark-validate-links' */

import validateLinks from "remark-validate-links";

export default {
  plugins: [
    [
      validateLinks,
      /** @type {Options} */ ({
        skipPathPatterns: [/[/\\]test$/],
      }),
    ],
  ],
}
