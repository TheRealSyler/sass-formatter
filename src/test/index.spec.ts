import { SassFormatter as SF } from '../index';

test('Sass Format: Simple Indentation', () => {
  const a = SF.Format(
    `


.class
    margin: 10px
              padding: 10rem
`,
    { insertSpaces: true, tabSize: 2 }
  );
  expect(a).toEqual(
    `
.class
  margin: 10px
  padding: 10rem
`
  );
});

test('Sass Format: Indentation & Whitespace', () => {
  const a = SF.Format(
    `
@import ../test.sass

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
    { insertSpaces: true, tabSize: 2, debug: true }
  );
  expect(a).toEqual(
    `
@import ../test.sass

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
`,
    { insertSpaces: true, tabSize: 2 }
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

test('Sass Format: Insert tabs', () => {
  const a = SF.Format(
    `
  


  

  
    .test
    margin: 234px      
    -moz-animation:             abs()
  
  .test2
    max-width: 23px  
`,
    { insertSpaces: false, tabSize: 2 }
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

test('Sass Format: Alternative @mixin', () => {
  const a = SF.Format(
    `
    =desktop
margin: 200px
            =test
left: 50px  

.footer
    margin-top: 3rem
      +selector
          padding-top: 220px
`,
    { insertSpaces: true, tabSize: 2 }
  );
  expect(a).toEqual(
    `
=desktop
  margin: 200px
  =test
    left: 50px

.footer
  margin-top: 3rem
  +selector
  padding-top: 220px
`
  );
});

test('Sass Format: Comma separated selectors', () => {
  const a = SF.Format(
    `
.footer,
  .footer,
.footer2
margin: 10px
  padding: 20px


.test,
    #test
    
    margin: 10px
      +awd
  padding: 20px


`,
    { insertSpaces: true, tabSize: 2 }
  );
  expect(a).toEqual(
    `
.footer,
.footer,
.footer2
  margin: 10px
  padding: 20px

.test,
#test

  margin: 10px
  +awd
  padding: 20px
`
  );
});

test('Sass Format: check + selector and + @include', () => {
  const a = SF.Format(
    `
  .class + div,
      div 
      + section
        margin: 200px
                  +mixin
        + .OtherClass
          padding: 2rem

    .class,
      .OtherClass
        + div
        padding: 2rem
`,
    { insertSpaces: true, tabSize: 2, debug: false }
  );
  expect(a).toEqual(
    `
.class + div,
div
+ section
  margin: 200px
  +mixin
  + .OtherClass
    padding: 2rem

    .class,
    .OtherClass
    + div
      padding: 2rem
`
  );
});

test('Sass Format Case 9', () => {
  const a = SF.Format(
    `
.foo
position:   relative

  @media only screen and (min-width: 600px)
    .foo
  position: absolute

    & > .bar
  width: 100%

`,
    { insertSpaces: true, tabSize: 2 }
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
  const a = SF.Format(
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


`,
    { insertSpaces: true, tabSize: 2 }
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
  const a = SF.Format(
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
     
`,
    { insertSpaces: true, tabSize: 2 }
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

test('Sass Format: \\:root', () => {
  const a = SF.Format('\\:root\n     --color: red', { insertSpaces: true, tabSize: 2 });

  expect(a).toBe('\\:root\n  --color: red');
});

test('Sass Format: Block Comment', () => {
  const a = SF.Format(
    `/**
* @comment
      * test Comment text.
 		   			*
 *
 *
 */`,
    { insertSpaces: false, tabSize: 2, debug: false }
  );

  expect(a).toBe(`/**
	* @comment
	* test Comment text.
	*
	*
	*
	*/`);
});

test('Sass Format: Interpolation', () => {
  const a = SF.Format(
    `#{body}
    color: red

#{main}
    color:red`,
    { insertSpaces: true, tabSize: 2 }
  );

  expect(a).toBe(`#{body}
  color: red

#{main}
  color: red`);
});

test('Sass Format: Check Comment and @font-face', () => {
  const a = SF.Format(
    `
		/**
    * Comment
 */
		@font-face
    margin: 200px`,
    { insertSpaces: true, tabSize: 2 }
  );
  expect(a).toBe(`
 /**
 * Comment
 */
@font-face
  margin: 200px`);
});

test('Sass Format: Check @keyframes', () => {
  const a = SF.Format(
    `
.class
    animation: test 200ms
@keyframes test
   from 
   transform: rotate(0deg)    
   
   to
   transform: rotate(90deg)        `,
    { insertSpaces: true, tabSize: 2 }
  );
  expect(a).toBe(`
.class
  animation: test 200ms
@keyframes test
  from
    transform: rotate(0deg)

  to
    transform: rotate(90deg)`);
});

test('Sass Format: Check @if && @else', () => {
  const a = SF.Format(
    `
$light-background: #f2ece4;
$light-text: #036;
$dark-background: #6b717f;
$dark-text: #d2e1dd;
    
    @mixin theme-colors($light-theme: true) {
      @if $light-theme {
        background-color: $light-background;
        color: $light-text;
      } @else {
        background-color: $dark-background;
        color: $dark-text;
      }
    }
    
    .banner {
      @include theme-colors($light-theme: true);
      body.dark & {
               @include theme-colors($light-theme: false);
      }
    }
           `,
    { debug: false }
  );
  expect(a).toBe(`
$light-background: #f2ece4
$light-text: #036
$dark-background: #6b717f
$dark-text: #d2e1dd

@mixin theme-colors($light-theme: true)
  @if $light-theme
    background-color: $light-background
    color: $light-text
    @else
      background-color: $dark-background
      color: $dark-text

    .banner
      @include theme-colors($light-theme: true)
      body.dark &
        @include theme-colors($light-theme: false)
`);
});

test('Sass Format: Options', () => {
  expect(
    SF.Format(
      `  
   `,
      { deleteCompact: false, convert: false }
    )
  ).toBe(``);
  expect(SF.Format(`.class { padding: 20px }`, { convert: false })).toBe(`.class { padding: 20px }`);
  expect(
    SF.Format(
      `.class  
  margin: 200px       `
    )
  ).toBe(
    `.class
  margin: 200px`
  );
});

test('Sass Format: Commands', () => {
  expect(
    SF.Format(
      `
.class
    ///I
    margin: 200px`
    )
  ).toBe(`
.class
    ///I
    margin: 200px`);
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
        margin: 200px`);
  expect(
    SF.Format(
      `
.class
        ///S

      


     margin: 200px`
    )
  ).toBe(`
.class
        ///S




  margin: 200px`);
});
