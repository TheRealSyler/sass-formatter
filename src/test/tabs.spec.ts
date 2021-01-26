import { SassFormatter as SF } from '../index';

test('Replace spaces with tabs I', () => {
  const a = SF.Format(
    `
.class
  margin: 20px
  .subClass
    padding: 20px
  div
border-radius: 20px
`, { insertSpaces: false, debug: false }
  );
  expect(a).toEqual(
    `
.class
	margin: 20px
	.subClass
		padding: 20px
	div
		border-radius: 20px
`
  );
});

test('Replace spaces with tabs II', () => {
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
