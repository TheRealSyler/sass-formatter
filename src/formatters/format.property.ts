import { SassTextLine } from '../index';

import { FormattingState } from '../state';

import { hasPropertyValueSpace, isScssOrCss, getDistanceReversed, isComment as isComment_ } from 'suf-regex';

import { convertScssOrCss, replaceSpacesOrTabs, PushLog, replaceWithOffset } from '../utility';

import { FormatSetTabs } from './format.utility';

export function FormatProperty(line: SassTextLine, STATE: FormattingState) {
  let lineText = line.text;
  let setSpace = false;
  let convert = false;
  let replaceSpaceOrTabs = false;
  let edit: string = lineText;
  const isComment = isComment_(line.text);
  if (
    !STATE.LOCAL_CONTEXT.isHtmlTag &&
    !hasPropertyValueSpace(line.text) &&
    STATE.LOCAL_CONTEXT.isProp &&
    STATE.CONFIG.setPropertySpace
  ) {
    lineText = lineText.replace(/(^[\t ]*[\$\w-]+:)[\t ]*/, '$1 ');
    setSpace = true;
  }
  if (STATE.CONFIG.convert && isScssOrCss(line.text, STATE.CONTEXT.convert.wasLastLineCss) && !isComment) {
    const convertRes = convertScssOrCss(lineText, STATE);
    lineText = convertRes.text;
    convert = true;
  }
  // Set Context Vars
  STATE.CONTEXT.convert.wasLastLineCss = convert;
  const move = STATE.LOCAL_CONTEXT.indentation.offset !== 0 && !isComment;
  if (
    STATE.CONFIG.replaceSpacesOrTabs &&
    !move &&
    (STATE.CONFIG.insertSpaces
      ? /\t/g.test(lineText)
      : new RegExp(' '.repeat(STATE.CONFIG.tabSize), 'g').test(lineText))
  ) {
    lineText = replaceSpacesOrTabs(lineText, STATE).trimRight();
    replaceSpaceOrTabs = true;
  }
  // Return
  if (move) {
    PushLog(STATE.CONFIG.debug, line.lineNumber, {
      title: 'MOVE',
      convert,
      setSpace,
      offset: STATE.LOCAL_CONTEXT.indentation.offset,
      replaceSpaceOrTabs
    });

    edit = replaceWithOffset(lineText, STATE.LOCAL_CONTEXT.indentation.offset, STATE).trimRight();
  } else if (getDistanceReversed(line.text, STATE.CONFIG.tabSize) > 0 && STATE.CONFIG.deleteWhitespace) {
    PushLog(STATE.CONFIG.debug, line.lineNumber, { title: 'TRAIL', convert, setSpace, replaceSpaceOrTabs });

    edit = lineText.trimRight();
  } else if (setSpace || convert || replaceSpaceOrTabs) {
    PushLog(STATE.CONFIG.debug, line.lineNumber, { title: 'CHANGE', convert, setSpace, replaceSpaceOrTabs });
    edit = lineText;
  }

  FormatSetTabs(STATE);

  return edit;
}
