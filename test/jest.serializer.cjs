const { createSnapshotSerializer } = require('path-serializer')

const serializer = createSnapshotSerializer({
  features: {
    escapeDoubleQuotes: false,
  },
  replacePost: [
    {
      match: /(['"`])(\.\.([\\/]))+([\w-]+\3)+[^\\/]*\1/g,
      mark: sub => 'relative/' + sub.replaceAll('\\', '/'),
    },
  ],
})

module.exports = serializer
