import { SassFormatter as SF } from '../index';

test('Class #62', () => {
  const a = SF.Format(

    `a[href]
  color: red
.a
  .b
  color: black
a[href="/"]
  color: green`, { debug: false }
  );

  expect(a).toBe(`a[href]
  color: red
.a
  .b
    color: black
a[href="/"]
  color: green
`);
});
