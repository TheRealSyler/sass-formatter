import { SassFormatter as SF } from '../index';

test('Indentation & Whitespace', () => {
  const a = SF.Format(
    `
@import ../test.sass

    $test: 23;
    $test: 23;


      @mixin name ( $test )
       &:active
         left: $test


   

 
 

.checkbox
  background-color: $dark-gray
  border: solid 1px $font
  border-radius: 2px
                    outline: none
  appearance: none
  -webkit-appearance: none
                  -moz-appearance: none
  width:   $test
  height: 16px
                     cursor: pointer
  position: relative
  i:not(.fv)
    &::after
 display: block
      background: $light-gray
               &::after
               position: absolute
    display: none
    content: ""
                  left: 5px
      div
 top: $awd
                  @include name ($test)

`,
    { debug: false }
  );
  expect(a).toEqual(
    `
@import ../test.sass

$test: 23
$test: 23

@mixin name ( $test )
  &:active
    left: $test

.checkbox
  background-color: $dark-gray
  border: solid 1px $font
  border-radius: 2px
  outline: none
  appearance: none
  -webkit-appearance: none
  -moz-appearance: none
  width: $test
  height: 16px
  cursor: pointer
  position: relative
  i:not(.fv)
    &::after
      display: block
      background: $light-gray
      &::after
        position: absolute
        display: none
        content: ""
        left: 5px
      div
        top: $awd
        @include name ($test)
`
  );
});

test('Sass Format: Simple Indentation', () => {
  const a = SF.Format(
    `
  
.class
    margin: 10px
              padding: 10rem
`,
    { debug: false }
  );
  expect(a).toEqual(
    `
.class
  margin: 10px
  padding: 10rem
`
  );
});

test('Sass Format: prevent indentation #43', () => {
  const a = SF.Format(
    `
.test
  color: black

$c: black
`,
{ debug: false }
);
expect(a).toEqual(
  `
.test
  color: black

$c: black
`
  );
});
