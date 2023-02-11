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


test('#66', () => {
  const a = SF.Format(
    `.text-element {
  text-align: right;
  margin: 1rem 0;
  
  .block-element {
    font-size: 3rem;
    line-height: 1em;
        
    .block-element:before, .block-element:after{
      content: '"';
    }
  }
      
  span {
    font-family: Arial, serif;
    font-size : 0.8rem;
    margin-top: 1rem;
  }
}`, { debug: false }
  )

  expect(a).toBe(`.text-element
  text-align: right
  margin: 1rem 0

  .block-element
    font-size: 3rem
    line-height: 1em

    &:before, .block-element:after
      content: '"'

  span
    font-family: Arial, serif
    font-size: 0.8rem
    margin-top: 1rem
`)

})

test('#69', () => {
  const a = SF.Format(
    `@mixin button($color, $background-color, $hover-color) {
  width: 12.5rem;
  display: block;
  color: $color;
  background-color: $background-color;
  
  font: {
      size: 1.25rem;
  }
  
  text: {
      decoration: none;
      align: center;
  }
              
  &:hover {
  background-color: $hover-color;
  }
  }`, { debug: false }
  )

  expect(a).toBe(`@mixin button($color, $background-color, $hover-color)
  width: 12.5rem
  display: block
  color: $color
  background-color: $background-color

  font:
    size: 1.25rem

  text:
    decoration: none
    align: center

  &:hover
    background-color: $hover-color
`)

})
