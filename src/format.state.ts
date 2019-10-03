interface FormatContext {
  convert: {
    lastSelector: string;
    wasLastLineCss: boolean;
  };
  keyframes: {
    is: boolean;
    tabs: number;
  };
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
     * true if a selector end with a comma
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
  isClassOrIdSelector: boolean;
  isIfOrElse: boolean;
  isIfOrElseAProp: boolean;
  isKeyframes: boolean;
  isKeyframesPoint: boolean;
}

export class FormattingState {
  isFirstLine = true;
  ALLOW_SPACE = false;
  isInBlockComment = false;
  ignoreLine = false;
  LOCAL_CONTEXT: FormatLocalContext;
  constructor() {
    this.LOCAL_CONTEXT = {
      ResetTabs: false,
      indentation: {
        distance: 0,
        offset: 0
      },
      isAnd_: false,
      isClassOrIdSelector: false,
      isIfOrElse: false,
      isIfOrElseAProp: false,
      isKeyframes: false,
      isKeyframesPoint: false,
      isProp: false
    };
  }
  CONTEXT: FormatContext = {
    convert: {
      lastSelector: '',
      wasLastLineCss: false
    },
    keyframes: {
      is: false,
      tabs: 0
    },
    tabs: 0,
    currentTabs: 0,
    firstCommaHeader: { exists: false, distance: 0 }
  };
  setLocalContext(context: FormatLocalContext) {
    this.LOCAL_CONTEXT = context;
  }
}
