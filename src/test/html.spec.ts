import { SassFormatter as SF } from '../index';

test('Sass Format: path tag', () => {
  expect(SF.Format('.class\n  path\n  margin: 20px')).toBe('.class\n  path\n    margin: 20px\n');
});
test('Sass Format: figcaption tag', () => {
  expect(SF.Format('.class\n  figcaption\n  margin: 20px')).toBe(
    '.class\n  figcaption\n    margin: 20px\n'
  );
});
