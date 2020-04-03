import { SassFormatter as SF } from '../index';

test('Sass Format: \\:root', () => {
  expect(SF.Format('\\:root\n     --color: red   ')).toBe('\\:root\n  --color: red\n');
});
