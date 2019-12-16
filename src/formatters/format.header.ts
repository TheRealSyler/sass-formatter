import { SassTextLine } from '../index';

import { FormattingState } from '../state';

import { isScssOrCss, getDistanceReversed, isComment as isComment_ } from 'suf-regex';

import { replaceSpacesOrTabs, PushLog, replaceWithOffset } from '../utility';
import { FormatSetTabs } from './format.utility';
import { convertScssOrCss } from './format.convert';

export function FormatBlockHeader(
  inp: {
    line: SassTextLine;
    offset: number;
  },
  STATE: FormattingState
) {
  let replaceSpaceOrTabs = false;
  let convert = false;
  let lineText = inp.line.text;
  let additionalTabs = 0;
  let edit: string = lineText;
  if (
    STATE.CONFIG.convert &&
    isScssOrCss(inp.line.text, STATE.CONTEXT.convert.wasLastLineCss) &&
    !isComment_(inp.line.text)
  ) {
    const convertRes = convertScssOrCss(lineText, STATE);
    STATE.CONTEXT.convert.lastSelector = convertRes.lastSelector;
    if (convertRes.increaseTabSize) {
      additionalTabs = STATE.CONFIG.tabSize;
    }
    lineText = convertRes.text;
    convert = true;
  }

  if (!convert && STATE.LOCAL_CONTEXT.isClassOrIdSelector) {
    STATE.CONTEXT.convert.lastSelector = '';
  }

  if (STATE.CONFIG.replaceSpacesOrTabs && STATE.CONFIG.insertSpaces ? /\t/g.test(lineText) : / /g.test(lineText)) {
    lineText = replaceSpacesOrTabs(lineText, STATE);
    replaceSpaceOrTabs = true;
  }
  if (STATE.CONTEXT.firstCommaHeader.exists) {
    inp.offset = STATE.CONTEXT.firstCommaHeader.distance - STATE.LOCAL_CONTEXT.indentation.distance;
  }
  // Set Context Vars
  STATE.CONTEXT.convert.wasLastLineCss = convert;
  if (lineText.trim().endsWith(',')) {
    if (STATE.CONTEXT.firstCommaHeader.exists !== true) {
      STATE.CONTEXT.firstCommaHeader.distance = STATE.LOCAL_CONTEXT.indentation.distance + inp.offset;
    }
    STATE.CONTEXT.firstCommaHeader.exists = true;
  } else {
    STATE.CONTEXT.firstCommaHeader.exists = false;
  }

  // Return
  if (inp.offset !== 0) {
    PushLog(STATE.CONFIG.debug, inp.line.lineNumber, {
      title: 'SET TAB',
      convert,
      replaceSpaceOrTabs,
      offset: inp.offset
    });
    edit = replaceWithOffset(lineText, inp.offset, STATE).trimRight();
  } else if (getDistanceReversed(inp.line.text, STATE.CONFIG.tabSize) > 0 && STATE.CONFIG.deleteWhitespace) {
    PushLog(STATE.CONFIG.debug, inp.line.lineNumber, { title: 'TRAIL', convert, replaceSpaceOrTabs });
    edit = lineText.trimRight();
  } else if (convert || replaceSpaceOrTabs) {
    PushLog(STATE.CONFIG.debug, inp.line.lineNumber, { title: 'CHANGE', convert, replaceSpaceOrTabs });
    edit = lineText;
  }
  STATE.CONTEXT.lastSelectorTabs = Math.max(STATE.LOCAL_CONTEXT.indentation.distance + inp.offset, 0);
  FormatSetTabs(STATE, { additionalTabs, offset: inp.offset });
  return edit;
}
