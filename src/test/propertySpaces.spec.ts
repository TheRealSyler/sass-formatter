import { setPropertyValueSpaces } from '../formatters/format.property';
import { SassFormatter as SF } from '../index';
import { FormattingState } from '../state';


test('setPropertyValueSpaces Function', () => {
  const STATE = new FormattingState()
  STATE.LOCAL_CONTEXT.isProp = true
  STATE.CONFIG.setPropertySpace = true
  expect(setPropertyValueSpaces(STATE, '')).toEqual('')
  expect(setPropertyValueSpaces(STATE, '  margin:')).toEqual('  margin:')
});

test('Property Spaces', () => {
  const a = SF.Format(
    `
    .class
      margin :   23rem    23px  
      padding: 1. 0
      font-size: 1.    34rem
      top:   .324rem  
      bottom:.324rem  
      border: solid  red    20px  
      display \t : flex
`,
    { debug: false }
  );
  expect(a).toEqual(
    `
.class
  margin: 23rem 23px
  padding: 1.0
  font-size: 1.34rem
  top: .324rem
  bottom: .324rem
  border: solid red 20px
  display: flex
`
  );
});
test('Don\' set Property Spaces', () => {
  const a = SF.Format(
    `
    .class
      margin :   23rem    23px  

`,
    { setPropertySpace: false, debug: false }
  );
  expect(a).toEqual(
    `
.class
  margin :   23rem    23px
`
  );
});

test('Variable spaces', () => {
  const a = SF.Format(
    `
$a : black   
$b :black
$c: black 
$d:black
$e \t : black

$x: border  thin    solid
`,
{ debug: false }
);
expect(a).toEqual(
  `
$a: black
$b: black
$c: black
$d: black
$e: black

$x: border thin solid
`
  );
});
