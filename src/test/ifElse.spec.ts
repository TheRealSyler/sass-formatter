
import { SassFormatter as SF } from '../index';

test('@If @Else I', () => {
  const a = SF.Format(
    `
.class
  @if $light-theme
        background-color: $light-background
     @else 
       background-color: $dark-background
  
`,
    { debug: false }
  );
  expect(a).toEqual(
    `
.class
  @if $light-theme
    background-color: $light-background
  @else
    background-color: $dark-background
`
  );
});
test('@If @Else II', () => {
  const a = SF.Format(
    `
.class
  @if $light-theme
        background-color: $light-background
@else 
       background-color: $dark-background
  
`,
    { debug: false }
  );
  expect(a).toEqual(
    `
.class
  @if $light-theme
    background-color: $light-background
  @else
    background-color: $dark-background
`
  );
});
