import serializer from './jest.serializer.cjs'

describe('serializer', () => {
  test('it should serialize relative paths for Windows', () => {
    expect(
      serializer.serialize('Cannot find file `..\\..\\getting-started\\zero`'),
    ).toMatchInlineSnapshot(
      `""Cannot find file <RELATIVE_GETTING_STARTED_ZERO>""`,
    )
    expect(
      serializer.serialize('Cannot find file `../../getting-started/zero`'),
    ).toMatchInlineSnapshot(
      `""Cannot find file <RELATIVE_GETTING_STARTED_ZERO>""`,
    )
  })
})
