import { SassFormatter } from './index';
import { SassTextDocument } from './provider';
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

test('Sass Format Case 8', () => {
  const a = SassFormatter.Format(
    new SassTextDocument(
      `
.footer,
  .footer,
.footer2
margin: 10px
  padding: 20px

`
    ),
    { insertSpaces: true, tabSize: 2 },
    { debug: false }
  );
  expect(a).toEqual(
    `
.footer,
.footer,
.footer2
  margin: 10px
  padding: 20px
`
  );
});
test('Sass Format Case 8.1', () => {
  const a = SassFormatter.Format(
    new SassTextDocument(
      `
  .footer,
#footer,
          +footer2
margin: 10px
  padding: 20px

`
    ),
    { insertSpaces: true, tabSize: 2 },
    { debug: false }
  );
  expect(a).toEqual(
    `
.footer,
#footer,
+footer2
  margin: 10px
  padding: 20px
`
  );
});
test('Sass Format Case 9', () => {
  const a = SassFormatter.Format(
    new SassTextDocument(
      `
.foo
position: relative

  @media only screen and (min-width: 600px)
    .foo
  position: absolute

    & > .bar
  width: 100%

`
    ),
    { insertSpaces: true, tabSize: 2 },
    { debug: false }
  );
  expect(a).toEqual(
    `
.foo
  position: relative

  @media only screen and (min-width: 600px)
    .foo
      position: absolute

    & > .bar
      width: 100%
`
  );
});
test('Sass Format Case 10', () => {
  const a = SassFormatter.Format(
    new SassTextDocument(
      `
.class
  .class
    color: none
    span
      color: none

      > span
      color: none
  + span
      color: none

  ~ div
  color: none


`
    ),
    { insertSpaces: true, tabSize: 2 },
    { debug: false }
  );
  expect(a).toEqual(
    `
.class
  .class
    color: none
    span
      color: none

      > span
        color: none
  + span
    color: none

  ~ div
    color: none
`
  );
});
test('Sass Format Case 11', () => {
  const a = SassFormatter.Format(
    new SassTextDocument(
      `
    span
      color: none

      @for $i from 0 through 2
         
          &:nth-child(#{$i})
              color: none
          @each $author in $list
              .photo-#{$author}
                background: image-url("avatars/#{$author}.png") no-repeat

    @while $types > 0
          .while-#{$types}
 width: $type-width + $types
     
`
    ),
    { insertSpaces: true, tabSize: 2 },
    { debug: false }
  );
  expect(a).toEqual(
    `
span
  color: none

  @for $i from 0 through 2

    &:nth-child(#{$i})
      color: none
      @each $author in $list
        .photo-#{$author}
          background: image-url("avatars/#{$author}.png") no-repeat

    @while $types > 0
      .while-#{$types}
        width: $type-width + $types
`
  );
});
test('Sass Format Case 12', () => {
  const a = SassFormatter.Format(
    new SassTextDocument('\\:root\n     --color: red'),
    { insertSpaces: true, tabSize: 2 },
    { debug: false, ignoreBackslash: true }
  );

  expect(a).toBe('\\:root\n  --color: red');
});
test('Sass Format Case 13', () => {
  const a = SassFormatter.Format(
    new SassTextDocument(`/**
    * @comment
      * test Comment text.
 		   			*
 *
 *
 */`),
    { insertSpaces: false, tabSize: 2 },
    { debug: true }
  );

  expect(a).toBe(`/**
	* @comment
	* test Comment text.
	*
	*
	*
	*/`);
});
