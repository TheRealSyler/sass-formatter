import { SassFormatter as SF } from '../index';

test('Sass Format: +mixin', () => {
  expect(
    SF.Format(
      `.class
  +mixin
            selector: attribute`
    )
  ).toBe(
    `.class
  +mixin
    selector: attribute
`
  );
  expect(
    SF.Format(
      `.class
  +mixin(45deg)
selector: attribute
`
    )
  ).toBe(
    `.class
  +mixin(45deg)
  selector: attribute
`
  );
});
