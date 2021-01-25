import { SassFormatter as SF } from '../index';

test('+include()', () => {
  const a = SF.Format(
    `
th
  +caption-semi-bold()
    padding: 12px 24px
  margin: 12px 24px  
  border-radius: 6px    

`, { debug: false }

  );
  expect(a).toEqual(
    `
th
  +caption-semi-bold()
    padding: 12px 24px
  margin: 12px 24px
  border-radius: 6px
`
  );
});


test('+mixin', () => {
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
