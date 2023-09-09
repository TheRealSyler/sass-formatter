import { SassFormatter as SF } from '../index';

test('Sass Format: Block Comment', () => {
  const a = SF.Format(
    ` /**
   * @comment
      * test Comment text.
 		   			*
   *
   *
   */
`,
    { insertSpaces: false, debug: false }
  );

  expect(a).toBe(` /**
	* @comment
	* test Comment text.
	*
	*
	*
	*/
`);
});
test('Sass Format: Block Comment 2', () => {
  const a = SF.Format(
    `.a
  color: red

/*
 * My block comment
 */
.something-else
  color: red
`,
    { insertSpaces: true, debug: false }
  );

  expect(a).toBe(`.a
  color: red

/*
 * My block comment
 */
.something-else
  color: red
`);
});

test('Sass Format: Check Comment and @font-face', () => {
  const a = SF.Format(
    `
 /*
    * Comment
     */

		@font-face
    margin: 200px`,
    { insertSpaces: true, debug: false }
  );
  expect(a).toBe(`
 /*
  * Comment
  */

@font-face
  margin: 200px
`);
});

test('#73', () => {
  const a = SF.Format(`
/*
 Grid: x

 Clamp y
*/`,
    { insertSpaces: true, debug: false }
  );
  expect(a).toBe(`
/*
 Grid: x

 Clamp y
*/
`);
});

test('Sass Format: Check Comment and indentation, multiple', () => {
  const a = SF.Format(
    `
		/*
       * Comment

		@font-face
    margin: 200px`,
    { insertSpaces: true }
  );
  const expectThis = `
    /*
     * Comment

@font-face
  margin: 200px
`;
  expect(a).toBe(expectThis);

  expect(SF.Format(a, { insertSpaces: true })).toBe(expectThis);
});
