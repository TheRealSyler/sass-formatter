import { SassFormatter as SF } from '../index';

test('Variable Indentation', () => {
  const a = SF.Format(
    `
$var: 20px
  $var2: 20px
`,
    { debug: false }
  );
  expect(a).toEqual(
    `
$var: 20px
$var2: 20px
`
  );
});
