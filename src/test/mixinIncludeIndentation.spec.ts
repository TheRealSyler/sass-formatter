import { SassFormatter as SF } from '../index';

test('Mixin indentation I', () => {
  const a = SF.Format(
    `
.class
  +mixin
        margin: 20px
  +mixin()
        margin: 20px

  +mixin
 margin: 20px
  +mixin()
  margin: 20px
  

  @include mixin
      margin: 20px
  @include mixin()
      margin: 20px
  
  @include mixin
   margin: 20px
  @include mixin()
   margin: 20px

`, { debug: false }
  );
  expect(a).toEqual(
    `
.class
  +mixin
    margin: 20px
  +mixin()
    margin: 20px

  +mixin
  margin: 20px
  +mixin()
  margin: 20px

  @include mixin
    margin: 20px
  @include mixin()
    margin: 20px

  @include mixin
  margin: 20px
  @include mixin()
  margin: 20px
`
  );
});


test('Mixin indentation II', () => {
  const a = SF.Format(
    `
.class
  +mixin
 margin: 20px
          border-radius: 20px
  +mixin
margin: 20px
border-radius: 20px

`, { debug: false }
  );
  expect(a).toEqual(
    `
.class
  +mixin
  margin: 20px
  border-radius: 20px
  +mixin
  margin: 20px
  border-radius: 20px
`
  );
});
