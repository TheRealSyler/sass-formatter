import { SassTextLine } from '../index';

import { FormattingState } from '../state';

import { hasPropertyValueSpace, isScssOrCss, getDistanceReversed, isComment as isComment_ } from 'suf-regex';

import { replaceSpacesOrTabs, PushDebugInfo, replaceWithOffset } from '../utility';

import { FormatSetTabs } from './format.utility';
import { convertScssOrCss } from './format.convert';

export function FormatProperty(line: SassTextLine, STATE: FormattingState) {
  let setSpace = false;
  let convert = false;
  let replaceSpaceOrTabs = false;
  let edit: string = line.get();
  const isComment = isComment_(line.get());
  if (
    !STATE.LOCAL_CONTEXT.isHtmlTag &&
    !hasPropertyValueSpace(line.get()) &&
    STATE.LOCAL_CONTEXT.isProp &&
    STATE.CONFIG.setPropertySpace
  ) {
    line.set(line.get().replace(/(^[\t ]*[\$\w-]+:)[\t ]*/, '$1 '));
    setSpace = true;
  }
  if (STATE.CONFIG.convert && isScssOrCss(line.get(), STATE.CONTEXT.convert.wasLastLineCss) && !isComment) {
    const convertRes = convertScssOrCss(line.get(), STATE);
    line.set(convertRes.text);
    convert = true;
  }
  // Set Context Vars
  STATE.CONTEXT.convert.wasLastLineCss = convert;
  const move = STATE.LOCAL_CONTEXT.indentation.offset !== 0 && !isComment;
  if (
    STATE.CONFIG.replaceSpacesOrTabs &&
    !move &&
    (STATE.CONFIG.insertSpaces
      ? /\t/g.test(line.get())
      : new RegExp(' '.repeat(STATE.CONFIG.tabSize), 'g').test(line.get()))
  ) {
    line.set(replaceSpacesOrTabs(line.get(), STATE).trimRight());
    replaceSpaceOrTabs = true;
  }
  // Return
  if (move) {
    edit = replaceWithOffset(line.get(), STATE.LOCAL_CONTEXT.indentation.offset, STATE).trimRight();
    PushDebugInfo({
      title: 'PROPERTY: MOVE',
      lineNumber: line.lineNumber,
      oldLineText: STATE.lineText,
      newLineText: edit,
      debug: STATE.CONFIG.debug,
      convert,
      setSpace,
      offset: STATE.LOCAL_CONTEXT.indentation.offset,
      replaceSpaceOrTabs
    });
  } else if (getDistanceReversed(line.get(), STATE.CONFIG.tabSize) > 0 && STATE.CONFIG.deleteWhitespace) {
    edit = line.get().trimRight();
    PushDebugInfo({
      title: 'PROPERTY: TRAIL',
      lineNumber: line.lineNumber,
      oldLineText: STATE.lineText,
      newLineText: edit,
      debug: STATE.CONFIG.debug,
      convert,
      setSpace,
      replaceSpaceOrTabs
    });
  } else if (setSpace || convert || replaceSpaceOrTabs) {
    edit = line.get();
    PushDebugInfo({
      title: 'PROPERTY: CHANGE',
      lineNumber: line.lineNumber,
      oldLineText: STATE.lineText,
      newLineText: edit,
      debug: STATE.CONFIG.debug,
      convert,
      setSpace,
      replaceSpaceOrTabs
    });
  } else {
    PushDebugInfo({
      title: 'PROPERTY: DEFAULT',
      lineNumber: line.lineNumber,
      oldLineText: STATE.lineText,
      newLineText: edit,
      debug: STATE.CONFIG.debug,
      convert,
      setSpace,
      replaceSpaceOrTabs
    });
  }

  FormatSetTabs(STATE);
  return edit;
}
