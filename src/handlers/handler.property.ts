import { SassTextLine, SassFormattingOptions, SassFormatterConfig } from '..';

import { FormattingState } from '../state';

import { isHtmlTag, hasPropertyValueSpace, isScssOrCss, getDistanceReversed, isComment as isComment_ } from 'suf-regex';

import { convertScssOrCss, replaceSpacesOrTabs, LogFormatInfo, replaceWithOffset } from '../utility';

import { FormatHandleSetTabs } from './handler.utility';

export function FormatHandleProperty(
  i: {
    line: SassTextLine;
    options: SassFormattingOptions;
    config: SassFormatterConfig;
    enableDebug: boolean;
  },
  State: FormattingState
) {
  /**
   *
   */
  let lineText = i.line.text;
  let setSpace = false;
  let convert = false;
  let replaceSpaceOrTabs = false;
  let edit: string = lineText;
  const isComment = isComment_(i.line.text);
  if (
    !isHtmlTag(i.line.text) &&
    !hasPropertyValueSpace(i.line.text) &&
    State.LOCAL_CONTEXT.isProp &&
    i.config.setPropertySpace
  ) {
    lineText = lineText.replace(/(^[\t ]*[\$\w-]+:)[\t ]*/, '$1 ');
    setSpace = true;
  }
  if (i.config.convert && isScssOrCss(i.line.text, State.CONTEXT.convert.wasLastLineCss) && !isComment) {
    const convertRes = convertScssOrCss(lineText, i.options, State.CONTEXT.convert.lastSelector);
    lineText = convertRes.text;
    convert = true;
  }
  // Set Context Vars
  State.CONTEXT.convert.wasLastLineCss = convert;
  const move = State.LOCAL_CONTEXT.indentation.offset !== 0 && !isComment;
  if (
    i.config.replaceSpacesOrTabs &&
    !move &&
    (i.options.insertSpaces ? /\t/g.test(lineText) : new RegExp(' '.repeat(i.options.tabSize), 'g').test(lineText))
  ) {
    lineText = replaceSpacesOrTabs(lineText, i.options.insertSpaces, i.options.tabSize);
    replaceSpaceOrTabs = true;
  }
  // Return
  if (move) {
    LogFormatInfo(i.enableDebug, i.line.lineNumber, {
      title: 'MOVE',
      convert,
      setSpace,
      offset: State.LOCAL_CONTEXT.indentation.offset,
      replaceSpaceOrTabs
    });

    edit = replaceWithOffset(lineText, State.LOCAL_CONTEXT.indentation.offset, i.options).trimRight();
  } else if (getDistanceReversed(i.line.text, i.options.tabSize) > 0 && i.config.deleteWhitespace) {
    LogFormatInfo(i.enableDebug, i.line.lineNumber, { title: 'TRAIL', convert, setSpace, replaceSpaceOrTabs });

    edit = lineText.trimRight();
  } else if (setSpace || convert || replaceSpaceOrTabs) {
    LogFormatInfo(i.enableDebug, i.line.lineNumber, { title: 'CHANGE', convert, setSpace, replaceSpaceOrTabs });
    edit = lineText;
  }

  FormatHandleSetTabs(i.options, State);

  return edit;
}
