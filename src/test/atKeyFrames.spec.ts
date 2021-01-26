import { SassFormatter as SF } from '../index';

test('Keyframes I', () => {
  const a = SF.Format(
    `
@keyframes name-of-animation
from
      transform: rotate(0deg)
          to
transform: rotate(360deg)
  
`,
    { debug: false }
  );
  expect(a).toEqual(
    `
@keyframes name-of-animation
  from
    transform: rotate(0deg)
  to
    transform: rotate(360deg)
`
  );
});


test('Keyframes II', () => {
  const a = SF.Format(
    `
.class
    animation: test 200ms
@keyframes test
   0% 
transform: rotate(0deg)    
   
   75% 
          transform: rotate(90deg)    
   
   100%
   transform: rotate(0deg)        `

  );
  expect(a).toBe(`
.class
  animation: test 200ms
@keyframes test
  0%
    transform: rotate(0deg)

  75%
    transform: rotate(90deg)

  100%
    transform: rotate(0deg)
`);
});


test('Keyframes III', () => {
  const a = SF.Format(
    `
@keyframes name-of-animation
  from
    @if $light-theme
      background-color: $light-background
  @else
    background-color: $dark-background
    transform: rotate(0deg)  
          to
transform: rotate(360deg)
  
`,
    { debug: false }
  );
  expect(a).toEqual(
    `
@keyframes name-of-animation
  from
    @if $light-theme
      background-color: $light-background
    @else
      background-color: $dark-background
      transform: rotate(0deg)
  to
    transform: rotate(360deg)
`
  );
});