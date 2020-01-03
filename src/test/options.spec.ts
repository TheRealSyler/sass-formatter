import { SassFormatter as SF } from '../index';

test('Sass Format: Check Comment and @font-face', () => {
  const a = SF.Format(
    `
		/**
    * Comment
 */
		@font-face
    margin: 200px`,
    { insertSpaces: true, tabSize: 2 }
  );
  expect(a).toBe(`
 /**
 * Comment
 */
@font-face
  margin: 200px`);
});
