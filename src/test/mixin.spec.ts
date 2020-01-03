import { SassFormatter as SF } from '../index';

test('Sass Format: Alternative @mixin', () => {
  const a = SF.Format(
    `
    =desktop
margin: 200px
            =test
left: 50px  

.footer
    margin-top: 3rem
      + selector
          padding-top: 220px
          +desktop
       margin-left: 20px
`
  );
  expect(a).toEqual(
    `
=desktop
  margin: 200px
  =test
    left: 50px

.footer
  margin-top: 3rem
  + selector
    padding-top: 220px
    +desktop
    margin-left: 20px
`
  );
});
