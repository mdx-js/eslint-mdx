import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

export default {
  plugins: [
    [remarkFrontmatter, ['yaml', 'toml']],
    remarkGfm,
    remarkMath,
  ],
}
