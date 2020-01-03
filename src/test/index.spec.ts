import { SassFormatter as SF } from '../index';

test('Sass Format: \\:root', () => {
  const a = SF.Format('\\:root\n     --color: red', { insertSpaces: true, tabSize: 2 });

  expect(a).toBe('\\:root\n  --color: red');
});
