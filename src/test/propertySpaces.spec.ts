import { setPropertyValueSpaces } from '../formatters/format.property';
import { SassFormatter as SF } from '../index';
import { FormattingState } from '../state';


test('setPropertyValueSpaces Function', () => {
  const STATE = new FormattingState()
  STATE.LOCAL_CONTEXT.isProp = true
  STATE.CONFIG.setPropertySpace = true
  expect(setPropertyValueSpaces(STATE, '').text).toEqual('')
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
    { insertSpaces: true, tabSize: 2, debug: false }
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
