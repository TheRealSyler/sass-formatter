import { defaultSassFormatterConfig, SassFormatterConfig } from './config';

interface FormatContext {
  isFirstLine: boolean;
  isLastLine: boolean;
  isInBlockComment: boolean;
  blockCommentDistance: number;
  /**
   * The Formatter ignores whitespace until the next selector.
   */
  allowSpace: boolean;

  /**
   * The Formatter Skips one line.
   */
  ignoreLine: boolean;
  /**
   * true if the last line was a selector.
   */
  wasLastLineSelector: boolean;
  convert: {
    lastSelector: string;
    wasLastLineCss: boolean;
  };
  keyframes: {
    is: boolean;
    tabs: number;
  };
  /**
   * Indentation level of the last selector
   */
  lastSelectorTabs: number;
  /**
   * if `.class` is at line 0 and has an indentation level of 0,
   * then this property should be set to the current `tabSize`.
   *
   * so that the properties get the correct indentation level.
   */
  tabs: number;
  /**
   * forgot what this is for, but `DO NOT REMOVE THIS`,
   * don't be an idiot and write documentations before you forget what the code does.
   */
  currentTabs: number;
  /**
   * used if there is there are multiple selectors, example line 0 has
   * `.class1,` and line 1 has `#someId` this stores the distance of the first selector (`.class1` in this example)
   *  so that the indentation of the following selectors gets set to the indentation of the first selector.
   */
  firstCommaHeader: {
    /**
     * distance of the first selector.
     */
    distance: number;
    /**
     * true if a selector ends with a comma
     */ exists: boolean;
  };
}
/**
 * This is the context for each line.
 */
interface FormatLocalContext {
  ResetTabs: boolean;
  isAnd_: boolean;
  isProp: boolean;
  indentation: {
    offset: number;
    distance: number;
  };
  isAtExtend: boolean;
  isClassOrIdSelector: boolean;
  isHtmlTag: boolean;
  isIfOrElseAProp: boolean;
  isAtKeyframes: boolean;
  isAtKeyframesPoint: boolean;
  isAdjacentSelector: boolean;
  isInterpolatedProp: boolean;
  isInclude: false | 'prop' | 'header';
  isVariable: boolean;
  isImport: boolean;
}

export class FormattingState {
  lines: string[] = [];

  /** Current line index. */
  currentLine = 0;

  LINE_ENDING: '\n' | '\r\n' = '\n';

  /** Formatting Result */
  RESULT = '';

  /** Context For Each Line. */
  LOCAL_CONTEXT: FormatLocalContext = {
    isAdjacentSelector: false,
    isHtmlTag: false,
    ResetTabs: false,
    indentation: {
      distance: 0,
      offset: 0,
    },
    isAtExtend: false,
    isAnd_: false,
    isClassOrIdSelector: false,
    isIfOrElseAProp: false,
    isAtKeyframes: false,
    isAtKeyframesPoint: false,
    isProp: false,
    isInterpolatedProp: false,
    isInclude: false,
    isVariable: false,
    isImport: false,
  };

  CONTEXT: FormatContext = {
    blockCommentDistance: 0,
    isFirstLine: true,
    isLastLine: false,
    allowSpace: false,
    isInBlockComment: false,
    ignoreLine: false,
    lastSelectorTabs: 0,
    wasLastLineSelector: false,
    convert: {
      lastSelector: '',
      wasLastLineCss: false,
    },
    keyframes: {
      is: false,
      tabs: 0,
    },
    tabs: 0,
    currentTabs: 0,
    firstCommaHeader: { exists: false, distance: 0 },
  };
  CONFIG: SassFormatterConfig = defaultSassFormatterConfig;
  setLocalContext(context: FormatLocalContext) {
    this.LOCAL_CONTEXT = context;
  }
}
