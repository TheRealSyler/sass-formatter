import { SassFormatter as SF } from '../index';

test('Sass Format: Insert tabs', () => {
  const a = SF.Format(
    `
  


  

  
    .test
    margin: 234px      
    -moz-animation:             abs()
  
  .test2
    max-width: 23px  
`,
    { insertSpaces: false }
  );
  expect(a).toEqual(
    `
.test
	margin: 234px
	-moz-animation: abs()

	.test2
		max-width: 23px
`
  );
});
