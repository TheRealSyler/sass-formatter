import { SassFormatter as SF } from '../index';

test('Convert css ONE LINER', () => {
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

test('Convert (scss)', () => {
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
`, { debug: false }
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


test('Convert Interpolation', () => {
  const a = SF.Format(
    `#{body} {
      color: red
}
`
  );

  expect(a).toBe(`#{body}
  color: red
`);
});

test('Convert Comment', () => {
  const a = SF.Format(
    `.class { // {} ""
      color: red
}
`
  );

  expect(a).toBe(`.class  // {} ""
  color: red
`);
});
test('Convert Pseudo', () => {
  const a = SF.Format(

    `.class{
      :not(p) {
        color: blue;
  }

    }
`, { debug: false }
  );

  expect(a).toBe(`.class
  :not(p)
    color: blue
`);
});

test('Convert One liner with css class below', () => {
  const a = SF.Format(

    `.class {prop: awd}
  .class,
    .class {
      :not(p) {
        color: blue;
  }

    }
`, { debug: false }
  );

  expect(a).toBe(`.class
  prop: awd
  .class,
  .class
    :not(p)
      color: blue
`);
});
