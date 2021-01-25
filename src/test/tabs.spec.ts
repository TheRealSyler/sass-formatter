import { SassFormatter as SF } from '../index';

test('Replace spaces with tabs', () => {
  const a = SF.Format(
    `
.class
  margin: 20px
  .subClass
    padding: 20px
  div
border-radius: 20px
`, { insertSpaces: false, debug: false }
  );
  expect(a).toEqual(
    `
.class
	margin: 20px
	.subClass
		padding: 20px
	div
		border-radius: 20px
`
  );
});
