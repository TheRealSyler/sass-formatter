import { SassFormatter as SF } from '../index';

test('Sass Format: Convert css ONE LINER', () => {
  expect(
    SF.Format(
      `  .class    \t\t       {width:335px;     \t     float:left;\t overflow:hidden; padding-left:5px;}


   `,
      { debug: false }
    )
  ).toBe(`.class
  width: 335px
  float: left
  overflow: hidden
  padding-left: 5px
`);
});

test('Sass Format: Conversion (From scss)', () => {
  const a = SF.Format(
    `
$var: 100vh;

.test-scss {
  margin:100px;
  &:hover {
    left:10rem
  }
}
.test-scss-2 {
                    margin:         $var;
                  
}
`
  );
  expect(a).toEqual(
    `
$var: 100vh

.test-scss
  margin: 100px
  &:hover
    left: 10rem


  &-2
    margin: $var
`
  );
});
