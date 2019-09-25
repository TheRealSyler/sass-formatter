import { SassFormatter } from './index';
import { SassTextDocument } from './format.provider';
test('Sass Format Case 1', () => {
  const a = SassFormatter.Format(
    new SassTextDocument(
      `


.class
    margin: 10px
              padding: 10rem
`
    ),
    { insertSpaces: true, tabSize: 2 },
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

test('Sass Format Case 2', () => {
  const a = SassFormatter.Format(
    new SassTextDocument(
      `







.checkbox
  background-color: $dark-gray
  border: solid 1px $font
  border-radius: 2px
                    outline: none
  appearance: none
  -webkit-appearance: none
                  -moz-appearance: none
  width: 16px
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


`
    ),
    { insertSpaces: true, tabSize: 2 },
    { debug: false }
  );
  expect(a).toEqual(
    `
.checkbox
  background-color: $dark-gray
  border: solid 1px $font
  border-radius: 2px
  outline: none
  appearance: none
  -webkit-appearance: none
  -moz-appearance: none
  width: 16px
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
`
  );
});
test('Sass Format Case 3', () => {
  const a = SassFormatter.Format(
    new SassTextDocument(
      `
@import ../test.sass
$test: 23;

@mixin name ( $test )
  &:active
      left: $test 
     
div#{abc}
  margin: 299px
 top: 29px

div
    top: $awd
        @include name ()
    
`
    ),
    { insertSpaces: true, tabSize: 2 },
    { debug: false }
  );
  expect(a).toEqual(
    `
@import ../test.sass
$test: 23

@mixin name ( $test )
  &:active
    left: $test

div#{abc}
  margin: 299px
  top: 29px

div
  top: $awd
  @include name ()
`
  );
});
test('Sass Format Case 4', () => {
  const a = SassFormatter.Format(
    new SassTextDocument(
      `
$var: 100vh;

.test-scss {
  margin: 100px;
  &:hover {
    left: 10rem
  }
}
.test-scss-2 {
                    margin:         $var;
}
`
    ),
    { insertSpaces: true, tabSize: 2 },
    { debug: false }
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
test('Sass Format Case 5', () => {
  const a = SassFormatter.Format(
    new SassTextDocument(
      `

  .badge-dot {
    padding-left: 0;
    padding-right: 0;
    background: transparent;
    font-weight: $font-weight-normal;
    font-size: $font-size-sm;
    text-transform: none;

    strong {
        color: $gray-800;
    }

    i {
        display: inline-block;
        vertical-align: middle;
        width: .375rem;
        height: .375rem;
        border-radius: 50%;
        margin-right: .375rem;
    }

    &.badge-md {
        i {
            width: .5rem;
            height: .5rem;
        }
    }

    &.badge-lg {
        i {
            width: .625rem;
            height: .625rem;
        }
    }
}
  
`
    ),
    { insertSpaces: true, tabSize: 2 },
    { debug: false }
  );
  expect(a).toEqual(
    `
.badge-dot
  padding-left: 0
  padding-right: 0
  background: transparent
  font-weight: $font-weight-normal
  font-size: $font-size-sm
  text-transform: none

  strong
    color: $gray-800

    i
      display: inline-block
      vertical-align: middle
      width: .375rem
      height: .375rem
      border-radius: 50%
      margin-right: .375rem

    &.badge-md
      i
        width: .5rem
        height: .5rem

    &.badge-lg
      i
        width: .625rem
        height: .625rem
`
  );
});
test('Sass Format Case 6', () => {
  const a = SassFormatter.Format(
    new SassTextDocument(
      `
  


  

  
    .test
    margin: 234px      
    -moz-animation:             abs()
  
  .test2
    max-width: 23px  
`
    ),
    { insertSpaces: false, tabSize: 2 },
    { debug: false }
  );
  expect(a).toEqual(
    `
.test
	margin: 234px
	-moz-animation: abs()

	.test2
		max-width: 23px
`
  );
});

test('Sass Format Case 7', () => {
  const a = SassFormatter.Format(
    new SassTextDocument(
      `


.footer
    margin-top: 3rem
      +desktop
          padding-top: 220px
`
    ),
    { insertSpaces: true, tabSize: 2 },
    { debug: false }
  );
  expect(a).toEqual(
    `
.footer
  margin-top: 3rem
  +desktop
    padding-top: 220px
`
  );
});
