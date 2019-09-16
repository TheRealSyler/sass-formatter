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

export interface FormatContext {
  convert: {
    lastSelector: string;
    wasLastLineCss: boolean;
  };
  keyframes: {
    is: boolean;
    tabs: number;
  };
  tabs: number;
  currentTabs: number;
  // lastHeader: { offset: number; endedWithComma: boolean };
}
export interface FormatLocalContext {
  ResetTabs: boolean;
  isAnd_: boolean;
  isProp: boolean;
  indentation: {
    offset: number;
    distance: number;
  };
  isClassOrIdSelector: boolean;
  isIfOrElse: boolean;
  isIfOrElseAProp: boolean;
  isKeyframes: boolean;
  isKeyframesPoint: boolean;
}

export function FormatHandleBlockHeader(i: {
  line: SassTextLine;
  options: SassFormattingOptions;
  config: SassFormatterConfig;
  enableDebug: boolean;
  LocalContext: FormatLocalContext;
  offset: number;
  Context: FormatContext;
}) {
  let replaceSpaceOrTabs = false;
  let convert = false;
  let lineText = i.line.text;
  let additionalTabs = 0;
  let edit: string = lineText;
  if (i.config.convert && isScssOrCss(i.line.text, i.Context.convert.wasLastLineCss) && !isComment_(i.line.text)) {
    const convertRes = convertScssOrCss(lineText, i.options, i.Context.convert.lastSelector);
    i.Context.convert.lastSelector = convertRes.lastSelector;
    if (convertRes.increaseTabSize) {
      additionalTabs = i.options.tabSize;
    }
    lineText = convertRes.text;
    convert = true;
  }

  if (!convert && i.LocalContext.isClassOrIdSelector) {
    i.Context.convert.lastSelector = '';
  }

  if (i.config.replaceSpacesOrTabs && i.options.insertSpaces ? /\t/g.test(lineText) : / /g.test(lineText)) {
    lineText = replaceSpacesOrTabs(lineText, i.options.insertSpaces, i.options.tabSize);
    replaceSpaceOrTabs = true;
  }
  // if (i.Context.lastHeader.endedWithComma) {
  //   // additionalTabs -= i.options.tabSize;
  //   i.offset = i.Context.lastHeader.offset;
  // }
  // Set Context Vars
  // i.Context.convert.wasLastLineCss = convert;
  // if (lineText.trim().endsWith(',')) {
  //   i.Context.lastHeader.endedWithComma = true;
  // } else {
  //   i.Context.lastHeader.endedWithComma = false;
  // }

  // Return
  if (i.offset !== 0) {
    LogFormatInfo(i.enableDebug, i.line.lineNumber, { title: 'SET NEW TAB', convert, replaceSpaceOrTabs });
    edit = replaceWithOffset(lineText, i.offset, i.options).trimRight();
  } else if (getDistanceReversed(i.line.text, i.options.tabSize) > 0 && i.config.deleteWhitespace) {
    LogFormatInfo(i.enableDebug, i.line.lineNumber, { title: 'TRAIL', convert, replaceSpaceOrTabs });
    edit = lineText.trimRight();
  } else if (convert || replaceSpaceOrTabs) {
    LogFormatInfo(i.enableDebug, i.line.lineNumber, { title: 'CHANGE', convert, replaceSpaceOrTabs });
    edit = lineText;
  }
  i.Context = FormatHandleSetTabs(i.Context, i.LocalContext, i.options, { additionalTabs, offset: i.offset });
  return { edit, context: i.Context, additionalTabs };
}

export function FormatHandleProperty(i: {
  line: SassTextLine;
  options: SassFormattingOptions;
  config: SassFormatterConfig;
  enableDebug: boolean;
  LocalContext: FormatLocalContext;
  Context: FormatContext;
}) {
  let lineText = i.line.text;
  let setSpace = false;
  let convert = false;
  let replaceSpaceOrTabs = false;
  let edit: string = lineText;
  const isComment = isComment_(i.line.text);
  if (!isHtmlTag(i.line.text) && !hasPropertyValueSpace(i.line.text) && i.LocalContext.isProp && i.config.setPropertySpace) {
    lineText = lineText.replace(/(^[\t ]*[\$\w-]+:)[\t ]*/, '$1 ');
    setSpace = true;
  }
  if (i.config.convert && isScssOrCss(i.line.text, i.Context.convert.wasLastLineCss) && !isComment) {
    const convertRes = convertScssOrCss(lineText, i.options, i.Context.convert.lastSelector);
    lineText = convertRes.text;
    convert = true;
  }
  // Set Context Vars
  // i.Context.lastHeader.endedWithComma = false;
  i.Context.convert.wasLastLineCss = convert;
  const move = i.LocalContext.indentation.offset !== 0 && !isComment;
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
      offset: i.LocalContext.indentation.offset,
      replaceSpaceOrTabs
    });

    edit = replaceWithOffset(lineText, i.LocalContext.indentation.offset, i.options).trimRight();
  } else if (getDistanceReversed(i.line.text, i.options.tabSize) > 0 && i.config.deleteWhitespace) {
    LogFormatInfo(i.enableDebug, i.line.lineNumber, { title: 'TRAIL', convert, setSpace, replaceSpaceOrTabs });

    edit = lineText.trimRight();
  } else if (setSpace || convert || replaceSpaceOrTabs) {
    LogFormatInfo(i.enableDebug, i.line.lineNumber, { title: 'CHANGE', convert, setSpace, replaceSpaceOrTabs });
    edit = lineText;
  }

  i.Context = FormatHandleSetTabs(i.Context, i.LocalContext, i.options);

  return { edit, context: i.Context };
}
export function FormatHandleLocalContext(line: SassTextLine, CONTEXT: FormatContext, options: SassFormattingOptions) {
  const isPointCheck = isKeyframePoint(line.text, CONTEXT.keyframes.is);
  if (CONTEXT.keyframes.is && isPointCheck) {
    CONTEXT.tabs = Math.max(0, CONTEXT.keyframes.tabs);
  }
  const isKeyframes = isKeyframes_(line.text);

  let IS_IF_OR_ELSE_ = isIfOrElse(line.text);
  let isIfOrElseAProp = false;
  if (CONTEXT.keyframes.is && IS_IF_OR_ELSE_) {
    IS_IF_OR_ELSE_ = false;
    isIfOrElseAProp = true;
    CONTEXT.tabs = CONTEXT.keyframes.tabs + options.tabSize;
  }
  if (IS_IF_OR_ELSE_ && !CONTEXT.keyframes.is && isElse(line.text)) {
    isIfOrElseAProp = true;
    IS_IF_OR_ELSE_ = false;
    CONTEXT.tabs = Math.max(0, CONTEXT.currentTabs - options.tabSize);
  }
  return {
    isIfOrElse: IS_IF_OR_ELSE_,
    isIfOrElseAProp,
    isKeyframes,
    isKeyframesPoint: isPointCheck
  };
}
function FormatHandleSetTabs(
  CONTEXT: FormatContext,
  LOCAL_CONTEXT: FormatLocalContext,
  options: SassFormattingOptions,
  headerStuff?: { offset: number; additionalTabs: number }
) {
  if (headerStuff === undefined) {
    // § set Tabs Property
    if (CONTEXT.keyframes.is && LOCAL_CONTEXT.isKeyframesPoint) {
      CONTEXT.tabs = Math.max(0, CONTEXT.keyframes.tabs + options.tabSize);
    }
    if (LOCAL_CONTEXT.isIfOrElseAProp && CONTEXT.keyframes.is) {
      CONTEXT.tabs = CONTEXT.keyframes.tabs + options.tabSize * 2;
    } else if (LOCAL_CONTEXT.isIfOrElseAProp && !CONTEXT.keyframes.is) {
      CONTEXT.tabs = CONTEXT.currentTabs;
    }
  } else {
    //§ set Tabs Header Block
    if (LOCAL_CONTEXT.isKeyframes) {
      CONTEXT.keyframes.tabs = Math.max(0, LOCAL_CONTEXT.indentation.distance + headerStuff.offset + options.tabSize);
    }
    if (LOCAL_CONTEXT.ResetTabs) {
      CONTEXT.tabs = Math.max(0, LOCAL_CONTEXT.indentation.distance + headerStuff.offset);
      CONTEXT.currentTabs = CONTEXT.tabs;
    } else {
      CONTEXT.tabs = Math.max(0, LOCAL_CONTEXT.indentation.distance + headerStuff.offset + options.tabSize + headerStuff.additionalTabs);

      CONTEXT.currentTabs = CONTEXT.tabs;
    }
  }
  return CONTEXT;
}
