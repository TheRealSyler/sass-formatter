import { getIndentationOffset } from './utility';
import {
  isBlockCommentStart,
  isIgnore,
  isSassSpace,
  isProperty,
  isReset,
  isAnd,
  isHtmlTag,
  isStar,
  isBracketSelector,
  isPseudo,
  isBracketOrWhitespace,
  isAdjacentSelector,
  isBlockCommentEnd,
  isClassOrId,
  isAtForwardOrAtUse,
  isMixin,
  isInterpolatedProperty,
  isSelectorOperator,
  isCssSelector,
  isAtExtend,
  isInclude,
  getDistance,
  isVar as isVar__DoesntCoverAllCases,
  isAtImport,
} from 'suf-regex';
import { FormattingState } from './state';
import { isAtKeyframes } from './formatters/format.utility';
import { FormatBlockHeader } from './formatters/format.header';
import { FormatProperty } from './formatters/format.property';
import { FormatHandleBlockComment } from './formatters/format.blockComment';
import { FormatAtForwardOrAtUse } from './formatters/format.atForwardOrAtUse';
import { SassFormatterConfig } from './config';
import { SassTextLine } from './sassTextLine';
import { LogDebugResult, PushDebugInfo } from './logger';

export { SassFormatterConfig, defaultSassFormatterConfig } from './config';

function isVar(payload: string): boolean {
  return isVar__DoesntCoverAllCases(payload) || /^[\t ]*(\$|--)\S+\s*:.*/gm.test(payload)
}

export class SassFormatter {
  static Format(text: string, config?: Partial<SassFormatterConfig>): string {
    const STATE = new FormattingState();

    STATE.lines = text.split(/\r?\n/);
    STATE.CONFIG = {
      ...STATE.CONFIG,
      ...config,
    };

    STATE.LINE_ENDING = STATE.CONFIG.lineEnding === 'LF' ? '\n' : '\r\n';

    for (let i = 0; i < STATE.lines.length; i++) {
      STATE.currentLine = i;
      this.formatLine(new SassTextLine(STATE.lines[i]), STATE);
    }
    if (!STATE.RESULT.endsWith(STATE.LINE_ENDING)) {
      this.addNewLine(STATE);
    }

    if (STATE.CONFIG.debug) {
      LogDebugResult(STATE.RESULT);
    }
    return STATE.RESULT;
  }

  private static formatLine(line: SassTextLine, STATE: FormattingState) {
    if (isBlockCommentStart(line.get())) {
      STATE.CONTEXT.isInBlockComment = true;
      STATE.CONTEXT.blockCommentDistance = getDistance(line.get(), STATE.CONFIG.tabSize);
    } else if (
      STATE.CONTEXT.isInBlockComment &&
      STATE.CONTEXT.blockCommentDistance >= getDistance(line.get(), STATE.CONFIG.tabSize)
    ) {
      STATE.CONTEXT.isInBlockComment = false;
      STATE.CONTEXT.blockCommentDistance = 0;
    }

    if (STATE.CONTEXT.ignoreLine) {
      STATE.CONTEXT.ignoreLine = false;
      this.addNewLine(STATE);
      STATE.RESULT += line.get();
    } else if (STATE.CONTEXT.isInBlockComment) {
      this.handleCommentBlock(STATE, line);
    } else {
      if (isIgnore(line.get())) {
        STATE.CONTEXT.ignoreLine = true;
        this.addNewLine(STATE);
        STATE.RESULT += line.get();
      } else {
        if (isSassSpace(line.get())) {
          STATE.CONTEXT.allowSpace = true;
        }
        // ####### Empty Line #######
        if (
          line.isEmptyOrWhitespace ||
          (STATE.CONFIG.convert ? isBracketOrWhitespace(line.get()) : false)
        ) {
          this.handleEmptyLine(STATE, line);
        } else {
          STATE.setLocalContext({
            ...isAtKeyframes(line, STATE),
            ResetTabs: isReset(line.get()),
            isAnd_: isAnd(line.get()),
            isProp: isProperty(line.get()),
            indentation: getIndentationOffset(line.get(), STATE.CONTEXT.tabs, STATE.CONFIG.tabSize),
            isAdjacentSelector: isAdjacentSelector(line.get()),
            isHtmlTag: isHtmlTag(line.get().trim().split(' ')[0]),
            isClassOrIdSelector: isClassOrId(line.get()),
            isAtExtend: isAtExtend(line.get()),
            isInterpolatedProp: isInterpolatedProperty(line.get()),
            isInclude: isInclude(line.get()),
            isVariable: isVar(line.get()),
            isImport: isAtImport(line.get()),
          });
          // ####### Is @forward or @use #######
          if (isAtForwardOrAtUse(line.get())) {
            this.addNewLine(STATE);
            STATE.RESULT += FormatAtForwardOrAtUse(line, STATE);
          }
          // ####### Block Header #######
          else if (this.isBlockHeader(line, STATE)) {
            this.addNewLine(STATE);
            STATE.RESULT += FormatBlockHeader(line, STATE);
            STATE.CONTEXT.wasLastHeaderIncludeMixin = STATE.LOCAL_CONTEXT.isInclude
          }
          // ####### Properties or Vars #######
          else if (this.isProperty(STATE)) {
            this.ResetCONTEXT('normal', STATE);
            this.addNewLine(STATE);
            STATE.RESULT += FormatProperty(line, STATE);
          }
          // ####### Convert #######
          // else if (convertLine(line, STATE)) {
          //   this.ResetCONTEXT('convert', STATE);
          //   const edit = convertScssOrCss(line.get(), STATE).text;
          //   PushDebugInfo({
          //     title: 'CONVERT',
          //     lineNumber: STATE.currentLine,
          //     oldLineText: STATE.lines[STATE.currentLine],
          //     newLineText: edit,
          //     debug: STATE.CONFIG.debug,
          //   });
          //   this.addNewLine(STATE);
          //   STATE.RESULT += edit;
          else {
            PushDebugInfo({
              title: 'NO CHANGE',
              lineNumber: STATE.currentLine,
              oldLineText: STATE.lines[STATE.currentLine],
              newLineText: 'NULL',
              debug: STATE.CONFIG.debug,
            });

            this.addNewLine(STATE);
            STATE.RESULT += line.get();
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
    const edit = FormatHandleBlockComment(line.get(), STATE);
    STATE.RESULT += edit;

    if (isBlockCommentEnd(line.get())) {
      STATE.CONTEXT.isInBlockComment = false;
    }
    if (STATE.CONFIG.debug) {
      PushDebugInfo({
        title: 'COMMENT BLOCK',
        lineNumber: STATE.currentLine,
        oldLineText: STATE.lines[STATE.currentLine],
        newLineText: edit,
        debug: STATE.CONFIG.debug,
      });
    }
  }

  private static handleEmptyLine(STATE: FormattingState, line: SassTextLine) {
    this.ResetCONTEXT('normal', STATE);
    let pass = true; // its not useless, trust me.

    if (STATE.CONFIG.deleteEmptyRows && !STATE.CONTEXT.isLastLine) {
      const nextLine = new SassTextLine(STATE.lines[STATE.currentLine + 1]);

      const compact = !isProperty(nextLine.get());
      const nextLineWillBeDeleted = STATE.CONFIG.convert
        ? isBracketOrWhitespace(nextLine.get())
        : false;

      if (
        (compact && !STATE.CONTEXT.allowSpace && nextLine.isEmptyOrWhitespace) ||
        (compact && !STATE.CONTEXT.allowSpace && nextLineWillBeDeleted)
      ) {
        if (STATE.CONFIG.debug) {
          PushDebugInfo({
            title: 'EMPTY LINE: DELETE',
            nextLine,
            lineNumber: STATE.currentLine,
            oldLineText: STATE.lines[STATE.currentLine],
            newLineText: 'DELETED',
            debug: STATE.CONFIG.debug,
          });
        }
        pass = false;
      }
    }
    if (line.get().length > 0 && pass && STATE.CONFIG.deleteWhitespace) {
      PushDebugInfo({
        title: 'EMPTY LINE: WHITESPACE',
        lineNumber: STATE.currentLine,
        oldLineText: STATE.lines[STATE.currentLine],
        newLineText: 'NEWLINE',
        debug: STATE.CONFIG.debug,
      });
      this.addNewLine(STATE);
    } else if (pass) {
      PushDebugInfo({
        title: 'EMPTY LINE',
        lineNumber: STATE.currentLine,
        oldLineText: STATE.lines[STATE.currentLine],
        newLineText: 'NEWLINE',
        debug: STATE.CONFIG.debug,
      });
      this.addNewLine(STATE);
    }
  }

  private static isBlockHeader(line: SassTextLine, STATE: FormattingState) {
    return (
      !STATE.LOCAL_CONTEXT.isInterpolatedProp &&
      !STATE.LOCAL_CONTEXT.isAtExtend &&
      !STATE.LOCAL_CONTEXT.isImport &&
      (
        STATE.LOCAL_CONTEXT.isAdjacentSelector ||
        STATE.LOCAL_CONTEXT.ResetTabs ||
        STATE.LOCAL_CONTEXT.isAnd_ ||
        STATE.LOCAL_CONTEXT.isHtmlTag ||
        STATE.LOCAL_CONTEXT.isInclude ||
        isMixin(line.get()) || // adds =mixin
        isPseudo(line.get()) ||
        isSelectorOperator(line.get()) ||
        isStar(line.get()) ||
        isBracketSelector(line.get()) ||
        isCssSelector(line.get())) // adds all lines that start with [@.#%]
    );
  }

  private static isProperty(STATE: FormattingState) {
    return (
      STATE.LOCAL_CONTEXT.isImport ||
      STATE.LOCAL_CONTEXT.isVariable ||
      STATE.LOCAL_CONTEXT.isInterpolatedProp ||
      STATE.LOCAL_CONTEXT.isProp ||
      STATE.LOCAL_CONTEXT.isAtKeyframesPoint ||
      STATE.LOCAL_CONTEXT.isAtExtend ||
      STATE.LOCAL_CONTEXT.isIfOrElseAProp
    );
  }

  private static ResetCONTEXT(type: 'normal' | 'convert', STATE: FormattingState) {
    STATE.CONTEXT.firstCommaHeader.exists = false;
    if (type === 'convert') {
      STATE.CONTEXT.convert.wasLastLineCss = true;
    }
  }

  /** Adds new Line If not first line. */
  private static addNewLine(STATE: FormattingState) {
    if (!STATE.CONTEXT.isFirstLine) {
      STATE.RESULT += STATE.LINE_ENDING;
    } else {
      STATE.CONTEXT.isFirstLine = false;
    }
  }
}
