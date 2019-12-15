import { getBlockHeaderOffset, getIndentationOffset, convertScssOrCss, PushLog, Log } from './utility';
import {
  isBlockCommentStart,
  isBlockCommentEnd,
  isIgnore,
  isSassSpace,
  isProperty,
  isReset,
  isAnd,
  isMixin,
  isHtmlTag,
  isStar,
  isBracketSelector,
  isPseudo,
  isLoop,
  isScssOrCss,
  isComment,
  isBracketOrWhitespace,
  isMedia,
  isFontFace
} from 'suf-regex';
import { FormattingState } from './state';
import { FormatHandleLocalContext } from './formatters/format.utility';
import { FormatBlockHeader } from './formatters/format.header';
import { FormatProperty } from './formatters/format.property';
import { FormatHandleBlockComment } from './formatters/format.blockComment';

export interface SassFormatterConfig {
  debug: boolean;
  deleteCompact: boolean;
  deleteEmptyRows: boolean;
  deleteWhitespace: boolean;
  convert: boolean;
  replaceSpacesOrTabs: boolean;
  setPropertySpace: boolean;
  tabSize: number;
  insertSpaces: boolean;
}

export class SassTextLine {
  text: string;
  isEmptyOrWhitespace: boolean;
  constructor(text: string, public lineNumber: number) {
    this.text = text;
    this.isEmptyOrWhitespace = /^[\t ]*\n?$/.test(text); // TODO replace with isWhiteSpaceOrEmpty
  }
}

export class SassFormatter {
  static Format(text: string, config?: Partial<SassFormatterConfig>): string {
    const STATE = new FormattingState();
    STATE.text = text;
    STATE.CONFIG = {
      ...STATE.CONFIG,
      ...config
    };

    for (STATE.char = 0; STATE.char < STATE.text.length; STATE.char++) {
      const char = STATE.text[STATE.char];
      const last = STATE.char === STATE.text.length - 1;
      const isNewLine = char === '\n';

      if (isNewLine || last) {
        STATE.CONTEXT.isLastLine = last;
        if (last && !isNewLine) {
          STATE.lineText += char;
        }

        this.handleLine(new SassTextLine(STATE.lineText, STATE.line), STATE);

        if (last && isNewLine && !STATE.RESULT.endsWith('\n')) {
          this.addNewLine(STATE);
        }
        STATE.line++;
        STATE.lineText = '';
      } else {
        STATE.lineText += char;
      }
    }

    if (STATE.CONFIG.debug) {
      Log(STATE.RESULT);
    }
    return STATE.RESULT;
  }

  private static handleLine(line: SassTextLine, STATE: FormattingState) {
    if (isBlockCommentStart(line.text)) {
      STATE.CONTEXT.isInBlockComment = true;
    }
    if (STATE.CONTEXT.ignoreLine) {
      STATE.CONTEXT.ignoreLine = false;
      this.addNewLine(STATE);
      STATE.RESULT += line.text;
    } else if (STATE.CONTEXT.isInBlockComment) {
      this.handleCommentBlock(STATE, line);
    } else {
      if (isIgnore(line.text)) {
        STATE.CONTEXT.ignoreLine = true;
        this.addNewLine(STATE);
        STATE.RESULT += line.text;
      } else {
        if (isSassSpace(line.text)) {
          STATE.CONTEXT.allowSpace = true;
        }
        // ####### Empty Line #######
        if (line.isEmptyOrWhitespace || (STATE.CONFIG.convert ? isBracketOrWhitespace(line.text) : false)) {
          this.handleEmptyLine(STATE, line);
        } else {
          STATE.setLocalContext({
            ...FormatHandleLocalContext(line, STATE),
            ResetTabs: isReset(line.text),
            isAnd_: isAnd(line.text),
            isProp: isProperty(line.text),
            indentation: getIndentationOffset(line.text, STATE.CONTEXT.tabs, STATE.CONFIG.tabSize),
            isAdjacentSelector: isAdjacentSelector(line.text),
            isHtmlTag: isHtmlTag(line.text.trim().split(' ')[0]),
            isClassOrIdSelector: /^[\t ]*[#\.%]/.test(line.text) // TODO replace with isClassOrId
          });
          //####### Block Header #######
          if (this.isBlockHeader(line, STATE)) {
            this.HandleBlockHeader(STATE, line);
          }
          // ####### Properties #######
          else if (this.isProperty(STATE, line)) {
            this.handleProperty(STATE, line);
          }
          // ####### Convert #######
          else if (this.isConvert(line, STATE)) {
            this.handleConvert(line, STATE);
          } else {
            this.addNewLine(STATE);
            STATE.RESULT += line.text;
          }
          // set CONTEXT Variables
          STATE.CONTEXT.wasLastLineSelector =
            STATE.LOCAL_CONTEXT.isClassOrIdSelector ||
            STATE.LOCAL_CONTEXT.isAdjacentSelector ||
            STATE.LOCAL_CONTEXT.isHtmlTag;
        }
      }
    }
  }

  private static handleCommentBlock(STATE: FormattingState, line: SassTextLine) {
    this.addNewLine(STATE);
    STATE.RESULT += FormatHandleBlockComment(line.text, STATE);
    if (isBlockCommentEnd(line.text)) {
      STATE.CONTEXT.isInBlockComment = false;
    }
    if (STATE.CONFIG.debug) {
      PushLog(STATE.CONFIG.debug, line.lineNumber, { title: 'COMMENT BLOCK' });
    }
  }

  private static handleEmptyLine(STATE: FormattingState, line: SassTextLine) {
    this.ResetCONTEXT('normal', STATE);
    let pass = true; // its not useless, trust me.

    if (STATE.CONFIG.deleteEmptyRows && !STATE.CONTEXT.isLastLine) {
      const getNextLine = () => {
        for (let i = STATE.char + 1; i < STATE.text.length; i++) {
          const char = STATE.text[i];
          if (char === '\n') {
            return new SassTextLine(STATE.lineText, STATE.line + 1);
          }
          STATE.lineText += char;
        }
        return new SassTextLine('', -1);
      };
      const nextLine: SassTextLine = getNextLine();

      const compact = STATE.CONFIG.deleteCompact ? true : !isProperty(nextLine.text);
      const nextLineWillBeDeleted = STATE.CONFIG.convert ? isBracketOrWhitespace(nextLine.text) : false;

      if (
        (compact && !STATE.CONTEXT.allowSpace && nextLine.isEmptyOrWhitespace) ||
        (compact && !STATE.CONTEXT.allowSpace && nextLineWillBeDeleted)
      ) {
        if (STATE.CONFIG.debug) {
          PushLog(STATE.CONFIG.debug, line.lineNumber, { title: 'DELETE', nextLine });
        }
        pass = false;
      }
    }
    if (line.text.length > 0 && pass && STATE.CONFIG.deleteWhitespace) {
      PushLog(STATE.CONFIG.debug, line.lineNumber, { title: 'WHITESPACE' });
      this.addNewLine(STATE);
    } else if (pass) {
      this.addNewLine(STATE);
    }
  }

  // SECTION  Block Header
  private static isBlockHeader(line: SassTextLine, STATE: FormattingState) {
    return (
      isMixin(line.text) ||
      isPseudo(line.text) ||
      isMedia(line.text) ||
      /^[\t ]*[>~]/.test(line.text) || // TODO  Change to isSelectorOperator
      isStar(line.text) ||
      isBracketSelector(line.text) ||
      isFontFace(line.text) ||
      STATE.LOCAL_CONTEXT.isClassOrIdSelector ||
      STATE.LOCAL_CONTEXT.isAdjacentSelector ||
      STATE.LOCAL_CONTEXT.isIfOrElse ||
      STATE.LOCAL_CONTEXT.ResetTabs ||
      STATE.LOCAL_CONTEXT.isAnd_ ||
      STATE.LOCAL_CONTEXT.isKeyframes ||
      STATE.LOCAL_CONTEXT.isHtmlTag ||
      isLoop(line.text)
    );
  }

  private static HandleBlockHeader(
    STATE: FormattingState,

    line: SassTextLine
  ) {
    const offset = getBlockHeaderOffset(
      STATE.LOCAL_CONTEXT.indentation.distance,
      STATE.CONFIG.tabSize,
      STATE.CONTEXT.currentTabs,
      STATE.LOCAL_CONTEXT.ResetTabs
    );
    STATE.CONTEXT.keyframes.is = STATE.LOCAL_CONTEXT.isKeyframes || STATE.LOCAL_CONTEXT.isKeyframesPoint;
    STATE.CONTEXT.allowSpace = false;

    const formatRes = FormatBlockHeader(
      {
        line,
        offset:
          STATE.LOCAL_CONTEXT.isAdjacentSelector && STATE.CONTEXT.wasLastLineSelector
            ? STATE.CONTEXT.lastSelectorTabs - STATE.LOCAL_CONTEXT.indentation.distance
            : offset
      },
      STATE
    );

    this.addNewLine(STATE);
    STATE.RESULT += formatRes;
  }
  //_ !SECTION

  // SECTION Property
  private static isProperty(STATE: FormattingState, line: SassTextLine) {
    return (
      STATE.LOCAL_CONTEXT.isProp ||
      /^[\t ]*(@include|\+[^\t ])/.test(line.text) || // NOTE change suf-regex and replace with isInclude
      STATE.LOCAL_CONTEXT.isKeyframesPoint ||
      STATE.LOCAL_CONTEXT.isIfOrElseAProp
    );
  }

  private static handleProperty(STATE: FormattingState, line: SassTextLine) {
    this.ResetCONTEXT('normal', STATE);
    const formatRes = FormatProperty(line, STATE);

    this.addNewLine(STATE);
    STATE.RESULT += formatRes;
  }
  //_ !SECTION

  private static handleConvert(line: SassTextLine, STATE: FormattingState) {
    const convertRes = convertScssOrCss(line.text, STATE);
    // Set Context Vars
    this.ResetCONTEXT('convert', STATE);
    PushLog(STATE.CONFIG.debug, line.lineNumber, { title: 'CONVERT', convert: true });
    this.addNewLine(STATE);
    STATE.RESULT += convertRes.text;
  }

  private static isConvert(line: SassTextLine, STATE: FormattingState) {
    return (
      STATE.CONFIG.convert && isScssOrCss(line.text, STATE.CONTEXT.convert.wasLastLineCss) && !isComment(line.text)
    );
  }

  private static ResetCONTEXT(type: 'normal' | 'convert', STATE: FormattingState) {
    STATE.CONTEXT.firstCommaHeader.exists = false;
    if (type === 'convert') {
      STATE.CONTEXT.convert.wasLastLineCss = true;
    }
  }

  /**
   * Adds new Line If not first line.
   */
  private static addNewLine(STATE: FormattingState) {
    if (!STATE.CONTEXT.isFirstLine) {
      STATE.RESULT += '\n';
    } else {
      STATE.CONTEXT.isFirstLine = false;
    }
  }
}
