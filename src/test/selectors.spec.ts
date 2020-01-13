import { SassFormatter as SF } from '../index';

test('Selectors: Comma separated selectors', () => {
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


`
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

test('Selectors: check + selector', () => {
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
    { debug: false }
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

test('Selectors: @media and (& >)', () => {
  const a = SF.Format(
    `
.foo
position:   relative

  @media only screen and (min-width: 600px)
    .foo
  position: absolute

    & > .bar
  width: 100%

`
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

test('Selectors: operators(> + ~)', () => {
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


`
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
test('Selectors: Square bracket selector', () => {
  const a = SF.Format(
    `
input[type=time]
     margin: 20px

       .class
  padding: 2rem

input[type=time]::-webkit-datetime-edit-hour-field,
     input[type=time]::-webkit-datetime-edit-minute-field,
     input[type=time]::-webkit-datetime-edit-ampm-field
       border-radius: 5px

`,
    { debug: false }
  );
  expect(a).toEqual(
    `
input[type=time]
  margin: 20px

  .class
    padding: 2rem

input[type=time]::-webkit-datetime-edit-hour-field,
input[type=time]::-webkit-datetime-edit-minute-field,
input[type=time]::-webkit-datetime-edit-ampm-field
  border-radius: 5px
`
  );
});
