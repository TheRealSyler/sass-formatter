import { SassFormatter as SF } from '../index';

test('Sass Format: Commands', () => {
  expect(
    SF.Format(
      `
.class
    ///I
    margin: 200px`, { debug: false }
    )
  ).toBe(`
.class
    ///I
    margin: 200px
`);
  expect(
    SF.Format(
      `
.class
        ///R
    margin: 200px`
    )
  ).toBe(`
.class
        ///R
        margin: 200px
`);
  expect(
    SF.Format(
      `
.class
        ///S

      


     margin: 200px`,
      { debug: false }
    )
  ).toBe(`
.class
        ///S




  margin: 200px
`);
});
