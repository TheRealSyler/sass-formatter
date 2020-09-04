import { SassFormatter as SF } from '../index';

test('+include()', () => {
  const a = SF.Format(
    `
th
  +caption-semi-bold()
    padding: 12px 24px

`,
    { insertSpaces: true, tabSize: 2 }
  );
  expect(a).toEqual(
    `
th
  +caption-semi-bold()
  padding: 12px 24px
`
  );
});
