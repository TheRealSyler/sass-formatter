import { SassFormatter as SF } from '../index';

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

test('Check @if && @else', () => {
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

test('@forward and @use', () => {
  expect(
    SF.Format(
      `  @use 'sass:map' as MAP
      @use "bootstrap";

      @forward "src/list" as list-*;

li {
  @include bootstrap.list-reset;
}


   `,
      { debug: false }
    )
  ).toBe(`@use 'sass:map' as MAP
@use "bootstrap"

@forward "src/list" as list-*

li
  @include bootstrap.list-reset
`);
});
test('@include', () => {
  expect(
    SF.Format(
      `
.class
   margin: 200px
  @include mixin(5rem)
        padding: 4rem
  +mixin
    border: none

.class
     margin: 20px
      +mixin
      padding: 4rem
`,
      { debug: false }
    )
  ).toBe(`
.class
  margin: 200px
  @include mixin(5rem)
    padding: 4rem
  +mixin
    border: none

.class
  margin: 20px
  +mixin
    padding: 4rem
`);
});
