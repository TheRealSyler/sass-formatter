import { SassFormatter as SF } from '../index';

test('Sass Format Case 11', () => {
  const a = SF.Format(
    `
    .class
      @extend %profile
        margin: 20px
`,
    { insertSpaces: true, tabSize: 2 }
  );
  expect(a).toEqual(
    `
.class
  @extend %profile
  margin: 20px
`
  );
});
