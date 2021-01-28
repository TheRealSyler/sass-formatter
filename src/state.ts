import { defaultSassFormatterConfig, SassFormatterConfig } from './config';

interface FormatContext {
  isFirstLine: boolean;
  isLastLine: boolean;
  isInBlockComment: boolean;
  wasLastHeaderIncludeMixin: boolean;
  wasLastHeaderNestedProp: boolean;
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
    /**true if in @keyframes body. */
    isIn: boolean;
    /** the indentation level of the keyframes declaration. */
    indentation: number;
  };
  if: {
    /**true if in @if body. */
    isIn: boolean;
    /** the indentation level of the @if declaration. */
    indentation: number;
  };
  /**
   * Indentation level of the last selector
   */
  lastSelectorIndentation: number;
  /**
   * if `.class` is at line 0 and has an indentation level of 0,
   * then this property should be set to the current `tabSize`.
   *
   * so that the properties get the correct indentation level.
   */
  indentation: number;
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
     * true previous selector ends with a comma
     */ exists: boolean;
  };
}
/**
 * This is the context for each line.
 */
export interface StateLocalContext {
  isReset: boolean;
  isAnd: boolean;
  isProp: boolean;
  indentation: {
    offset: number;
    distance: number;
  };
  isAtExtend: boolean;
  isClassOrIdSelector: boolean;
  isHtmlTag: boolean;
  isIf: boolean;
  isElse: boolean;
  isAtKeyframes: boolean;
  isAtKeyframesPoint: boolean;
  isAdjacentSelector: boolean;
  isInterpolatedProp: boolean;
  isInclude: boolean
  isVariable: boolean;
  isImport: boolean;
  isNestPropHead: boolean;
}

export class FormattingState {
  lines: string[] = [];

  /** Current line index. */
  currentLine = 0;

  LINE_ENDING: '\n' | '\r\n' = '\n';

  /** Formatting Result */
  RESULT = '';

  /** Context For Each Line. */
  LOCAL_CONTEXT: StateLocalContext = {
    isAdjacentSelector: false,
    isHtmlTag: false,
    isReset: false,
    indentation: {
      distance: 0,
      offset: 0,
    },
    isAtExtend: false,
    isAnd: false,
    isClassOrIdSelector: false,
    isIf: false,
    isElse: false,
    isAtKeyframes: false,
    isAtKeyframesPoint: false,
    isProp: false,
    isInterpolatedProp: false,
    isInclude: false,
    isVariable: false,
    isImport: false,
    isNestPropHead: false
  };

  CONTEXT: FormatContext = {
    if: {
      isIn: false,
      indentation: 0,
    },
    blockCommentDistance: 0,
    wasLastHeaderIncludeMixin: false,
    wasLastHeaderNestedProp: false,
    isFirstLine: true,
    isLastLine: false,
    allowSpace: false,
    isInBlockComment: false,
    ignoreLine: false,
    lastSelectorIndentation: 0,
    wasLastLineSelector: false,
    convert: {
      lastSelector: '',
      wasLastLineCss: false,
    },
    keyframes: {
      isIn: false,
      indentation: 0,
    },
    indentation: 0,
    firstCommaHeader: { exists: false, distance: 0 },
  };
  CONFIG: SassFormatterConfig = defaultSassFormatterConfig;
  setLocalContext(context: StateLocalContext) {
    this.LOCAL_CONTEXT = context;
  }
}
