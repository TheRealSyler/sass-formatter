import { SassFormatter as SF } from '../index';

test('Comma separated selectors', () => {
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

test('class + selector', () => {
  const a = SF.Format(
    `
  .class + div,
      div 
      + section
        margin: 200px
                  +mixin()
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
  +mixin()
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
