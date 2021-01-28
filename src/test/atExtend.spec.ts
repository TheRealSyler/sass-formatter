import { SassFormatter as SF } from '../index';

test('AtExtend', () => {
  const a = SF.Format(
    `
    .class
      @extend %profile
        margin: 20px
`,
    { debug: false }
  );
  expect(a).toEqual(
    `
.class
  @extend %profile
  margin: 20px
`
  );
});
