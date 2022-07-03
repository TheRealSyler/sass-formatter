import { SassFormatter as SF } from '../index';

test('path tag', () => {
  expect(SF.Format('.class\n  path\n  margin: 20px')).toBe('.class\n  path\n    margin: 20px\n');
});
test('figcaption tag', () => {
  expect(SF.Format('.class\n  figcaption\n  margin: 20px')).toBe(
    '.class\n  figcaption\n    margin: 20px\n'
  );
});
test('figcaption tag', () => {
  expect(
    SF.Format(
      `tr:nth-child(2n+1)
    background-color: $alt-row-color`
    )
  ).toBe(

    `tr:nth-child(2n+1)
  background-color: $alt-row-color
`);
});
test('keyframe point', () => {
  expect(
    SF.Format(
      `@keyframes foo
  from
  top: 0px`
    )
  ).toBe(
    `@keyframes foo
  from
    top: 0px
`);
});

test('slot', () => {
  expect(
    SF.Format(
      `:host
  contain: content
  slot
      display: grid`
    )
  ).toBe(
    `:host
  contain: content
  slot
    display: grid
`);
});
