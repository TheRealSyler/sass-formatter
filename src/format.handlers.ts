import {
  convertScssOrCss,
  replaceSpacesOrTabs,
  replaceWithOffset,
  hasPropertyValueSpace,
  LogFormatInfo,
  isKeyframePoint
} from './format.utility';

import { SassFormatterConfig, SassTextLine, SassFormattingOptions } from './format.provider';
import {
  isScssOrCss,
  isHtmlTag,
  isIfOrElse,
  isElse,
  isComment as isComment_,
  isKeyframes as isKeyframes_,
  getDistanceReversed
} from 'suf-regex';
import { FormattingState } from './format.state';

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
  if (inp.config.convert && isScssOrCss(inp.line.text, State.CONTEXT.convert.wasLastLineCss) && !isComment_(inp.line.text)) {
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
    LogFormatInfo(inp.enableDebug, inp.line.lineNumber, { title: 'SET NEW TAB', convert, replaceSpaceOrTabs });
    edit = replaceWithOffset(lineText, inp.offset, inp.options).trimRight();
  } else if (getDistanceReversed(inp.line.text, inp.options.tabSize) > 0 && inp.config.deleteWhitespace) {
    LogFormatInfo(inp.enableDebug, inp.line.lineNumber, { title: 'TRAIL', convert, replaceSpaceOrTabs });
    edit = lineText.trimRight();
  } else if (convert || replaceSpaceOrTabs) {
    LogFormatInfo(inp.enableDebug, inp.line.lineNumber, { title: 'CHANGE', convert, replaceSpaceOrTabs });
    edit = lineText;
  }
  FormatHandleSetTabs(inp.options, State, { additionalTabs, offset: inp.offset });
  return edit;
}

export function FormatHandleProperty(
  i: {
    line: SassTextLine;
    options: SassFormattingOptions;
    config: SassFormatterConfig;
    enableDebug: boolean;
  },
  State: FormattingState
) {
  let lineText = i.line.text;
  let setSpace = false;
  let convert = false;
  let replaceSpaceOrTabs = false;
  let edit: string = lineText;
  const isComment = isComment_(i.line.text);
  if (!isHtmlTag(i.line.text) && !hasPropertyValueSpace(i.line.text) && State.LOCAL_CONTEXT.isProp && i.config.setPropertySpace) {
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
export function FormatHandleLocalContext(line: SassTextLine, options: SassFormattingOptions, State) {
  const isPointCheck = isKeyframePoint(line.text, State.CONTEXT.keyframes.is);
  if (State.CONTEXT.keyframes.is && isPointCheck) {
    State.CONTEXT.tabs = Math.max(0, State.CONTEXT.keyframes.tabs);
  }
  const isKeyframes = isKeyframes_(line.text);

  let IS_IF_OR_ELSE_ = isIfOrElse(line.text);
  let isIfOrElseAProp = false;
  if (State.CONTEXT.keyframes.is && IS_IF_OR_ELSE_) {
    IS_IF_OR_ELSE_ = false;
    isIfOrElseAProp = true;
    State.CONTEXT.tabs = State.CONTEXT.keyframes.tabs + options.tabSize;
  }
  if (IS_IF_OR_ELSE_ && !State.CONTEXT.keyframes.is && isElse(line.text)) {
    isIfOrElseAProp = true;
    IS_IF_OR_ELSE_ = false;
    State.CONTEXT.tabs = Math.max(0, State.CONTEXT.currentTabs - options.tabSize);
  }
  return {
    isIfOrElse: IS_IF_OR_ELSE_,
    isIfOrElseAProp,
    isKeyframes,
    isKeyframesPoint: isPointCheck
  };
}
function FormatHandleSetTabs(
  options: SassFormattingOptions,
  State: FormattingState,
  headerStuff?: { offset: number; additionalTabs: number }
) {
  if (headerStuff === undefined) {
    // § set Tabs Property
    if (State.CONTEXT.keyframes.is && State.LOCAL_CONTEXT.isKeyframesPoint) {
      State.CONTEXT.tabs = Math.max(0, State.CONTEXT.keyframes.tabs + options.tabSize);
    }
    if (State.LOCAL_CONTEXT.isIfOrElseAProp && State.CONTEXT.keyframes.is) {
      State.CONTEXT.tabs = State.CONTEXT.keyframes.tabs + options.tabSize * 2;
    } else if (State.LOCAL_CONTEXT.isIfOrElseAProp && !State.CONTEXT.keyframes.is) {
      State.CONTEXT.tabs = State.CONTEXT.currentTabs;
    }
  } else {
    //§ set Tabs Header Block
    if (State.LOCAL_CONTEXT.isKeyframes) {
      State.CONTEXT.keyframes.tabs = Math.max(0, State.LOCAL_CONTEXT.indentation.distance + headerStuff.offset + options.tabSize);
    }
    if (State.LOCAL_CONTEXT.ResetTabs) {
      State.CONTEXT.tabs = Math.max(0, State.LOCAL_CONTEXT.indentation.distance + headerStuff.offset);
      State.CONTEXT.currentTabs = State.CONTEXT.tabs;
    } else {
      State.CONTEXT.tabs = Math.max(
        0,
        State.LOCAL_CONTEXT.indentation.distance + headerStuff.offset + options.tabSize + headerStuff.additionalTabs
      );

      State.CONTEXT.currentTabs = State.CONTEXT.tabs;
    }
  }
}
