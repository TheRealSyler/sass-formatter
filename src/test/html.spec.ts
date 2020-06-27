import { SassFormatter as SF } from '../index';

test('Sass Format: path tag', () => {
  expect(SF.Format('.class\n  path\n  margin: 20px')).toBe('.class\n  path\n    margin: 20px\n');
});
test('Sass Format: figcaption tag', () => {
  expect(SF.Format('.class\n  figcaption\n  margin: 20px')).toBe(
    '.class\n  figcaption\n    margin: 20px\n'
  );
});
test('Sass Format: figcaption tag', () => {
  expect(
    SF.Format(
      `tr:nth-child(2n+1)
    background-color: $alt-row-color`
    )
  ).toBe(
    SF.Format(
      `tr:nth-child(2n+1)
  background-color: $alt-row-color`
    )
  );
});
test('Sass Format: keyframe point', () => {
  expect(
    SF.Format(
      `@keyframes foo
  from
  top: 0px`
    )
  ).toBe(
    SF.Format(
      `@keyframes foo
  from
    top: 0px`
    )
  );
});
