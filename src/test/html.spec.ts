import { SassFormatter as SF } from '../index';

test('Sass Format: path tag', () => {
  expect(SF.Format('.class\n  path\n  margin: 20px')).toBe('.class\n  path\n    margin: 20px\n');
});
