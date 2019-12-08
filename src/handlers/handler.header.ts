import { SassTextLine, SassFormattingOptions, SassFormatterConfig } from '..';

import { FormattingState } from '../state';

import { isScssOrCss, getDistanceReversed, isComment as isComment_ } from 'suf-regex';

import { convertScssOrCss, replaceSpacesOrTabs, PushLog, replaceWithOffset } from '../utility';
import { FormatHandleSetTabs } from './handler.utility';

export function FormatHandleBlockHeader(
  inp: {
    line: SassTextLine;
    options: SassFormattingOptions;
    config: SassFormatterConfig;
    enableDebug: boolean;
    offset: number;
  },
  State: FormattingState
) {
  let replaceSpaceOrTabs = false;
  let convert = false;
  let lineText = inp.line.text;
  let additionalTabs = 0;
  let edit: string = lineText;
  if (
    inp.config.convert &&
    isScssOrCss(inp.line.text, State.CONTEXT.convert.wasLastLineCss) &&
    !isComment_(inp.line.text)
  ) {
    const convertRes = convertScssOrCss(lineText, inp.options, State.CONTEXT.convert.lastSelector);
    State.CONTEXT.convert.lastSelector = convertRes.lastSelector;
    if (convertRes.increaseTabSize) {
      additionalTabs = inp.options.tabSize;
    }
    lineText = convertRes.text;
    convert = true;
  }

  if (!convert && State.LOCAL_CONTEXT.isClassOrIdSelector) {
    State.CONTEXT.convert.lastSelector = '';
  }

  if (inp.config.replaceSpacesOrTabs && inp.options.insertSpaces ? /\t/g.test(lineText) : / /g.test(lineText)) {
    lineText = replaceSpacesOrTabs(lineText, inp.options.insertSpaces, inp.options.tabSize);
    replaceSpaceOrTabs = true;
  }
  if (State.CONTEXT.firstCommaHeader.exists) {
    inp.offset = State.CONTEXT.firstCommaHeader.distance - State.LOCAL_CONTEXT.indentation.distance;
  }
  // Set Context Vars
  State.CONTEXT.convert.wasLastLineCss = convert;
  if (lineText.trim().endsWith(',')) {
    if (State.CONTEXT.firstCommaHeader.exists !== true) {
      State.CONTEXT.firstCommaHeader.distance = State.LOCAL_CONTEXT.indentation.distance + inp.offset;
    }
    State.CONTEXT.firstCommaHeader.exists = true;
  } else {
    State.CONTEXT.firstCommaHeader.exists = false;
  }

  // Return
  if (inp.offset !== 0) {
    PushLog(inp.enableDebug, inp.line.lineNumber, { title: 'SET NEW TAB', convert, replaceSpaceOrTabs });
    edit = replaceWithOffset(lineText, inp.offset, inp.options).trimRight();
  } else if (getDistanceReversed(inp.line.text, inp.options.tabSize) > 0 && inp.config.deleteWhitespace) {
    PushLog(inp.enableDebug, inp.line.lineNumber, { title: 'TRAIL', convert, replaceSpaceOrTabs });
    edit = lineText.trimRight();
  } else if (convert || replaceSpaceOrTabs) {
    PushLog(inp.enableDebug, inp.line.lineNumber, { title: 'CHANGE', convert, replaceSpaceOrTabs });
    edit = lineText;
  }

  FormatHandleSetTabs(inp.options, State, { additionalTabs, offset: inp.offset });
  return edit;
}
