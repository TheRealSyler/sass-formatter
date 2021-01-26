import { SassFormatter as SF } from '../index';

test('make sure #46 doesn\'t happen again.', () => {
  const a = SF.Format(
    `
.master
  display: none
  &.active
    display: block

@import "media"
  
`,
    { debug: false }
  );
  expect(a).toEqual(
    `
.master
  display: none
  &.active
    display: block

@import "media"
`
  );
});
