import { SassFormatter as SF } from '../index';

test('\\:root', () => {
  expect(SF.Format('\\:root\n     --color: red   ')).toBe('\\:root\n  --color: red\n');
});

test('property spaces.', () => {
  expect(SF.Format('.test\n     border: solid    20px    green   ')).toBe(
    '.test\n  border: solid 20px green\n'
  );
});

test('line endings', () => {
  const LF = '@keyframes aaa\n  from\n    background: white\n  to\n    background: black\n';
  expect(SF.Format(LF, { lineEnding: 'LF' })).toBe(LF);
  const CRLF =
    '@keyframes aaa\r\n  from\r\n    background: white\r\n  to\r\n    background: black\r\n';
  expect(SF.Format(CRLF, { lineEnding: 'CRLF' })).toBe(CRLF);
});
