import { SassFormatter as SF } from '../index';

test('\\:root', () => {
  expect(SF.Format('\\:root\n     --color: red   ')).toBe('\\:root\n  --color: red\n');
});

test('line endings', () => {
  const LF = '@keyframes aaa\n  from\n    background: white\n  to\n    background: black\n';
  expect(SF.Format(LF, { lineEnding: 'LF' })).toBe(LF);
  const CRLF =
    '@keyframes aaa\r\n  from\r\n    background: white\r\n  to\r\n    background: black\r\n';
  expect(SF.Format(CRLF, { lineEnding: 'CRLF' })).toBe(CRLF);
});
