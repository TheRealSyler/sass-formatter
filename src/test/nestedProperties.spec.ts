import { SassFormatter as SF } from '../index';

test('Nested Properties', () => {
  const a = SF.Format(
    `
.class
  border:
        style: dashed 
     width: 30px
     color: blue
  margin: 20px
     
`,
    { debug: false }
  );
  expect(a).toEqual(
    `
.class
  border:
    style: dashed
    width: 30px
    color: blue
  margin: 20px
`
  );
});