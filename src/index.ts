import { getIndentationOffset, isConvert } from './utility';
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
  isInclude
} from 'suf-regex';
import { FormattingState } from './state';
import { FormatHandleLocalContext } from './formatters/format.utility';
import { FormatBlockHeader } from './formatters/format.header';
import { FormatProperty } from './formatters/format.property';
import { FormatHandleBlockComment } from './formatters/format.blockComment';
import { convertScssOrCss } from './formatters/format.convert';
import { FormatAtForwardOrAtUse } from './formatters/format.atForwardOrAtUse';
import { SassFormatterConfig } from './config';
import { SassTextLine } from './sassTextLine';
import { LogDebugResult, PushDebugInfo } from './logger';

export { SassFormatterConfig } from './config';

export class SassFormatter {
  static Format(text: string, config?: Partial<SassFormatterConfig>): string {
    const STATE = new FormattingState();

    STATE.lines = text.split('\n');
    STATE.CONFIG = {
      ...STATE.CONFIG,
      ...config
    };

    for (let i = 0; i < STATE.lines.length; i++) {
      STATE.currentLine = i;
      this.handleLine(new SassTextLine(STATE.lines[i]), STATE);
    }
    if (!STATE.RESULT.endsWith('\n')) {
      this.addNewLine(STATE);
    }

    if (STATE.CONFIG.debug) {
      LogDebugResult(STATE.RESULT);
    }
    return STATE.RESULT;
  }

  private static handleLine(line: SassTextLine, STATE: FormattingState) {
    if (isBlockCommentStart(line.get())) {
      STATE.CONTEXT.isInBlockComment = true;
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
            ...FormatHandleLocalContext(line, STATE),
            ResetTabs: isReset(line.get()),
            isAnd_: isAnd(line.get()),
            isProp: isProperty(line.get()),
            indentation: getIndentationOffset(line.get(), STATE.CONTEXT.tabs, STATE.CONFIG.tabSize),
            isAdjacentSelector: isAdjacentSelector(line.get()),
            isHtmlTag: isHtmlTag(
              line
                .get()
                .trim()
                .split(' ')[0]
            ),
            isClassOrIdSelector: isClassOrId(line.get()),
            isInterpolatedProp: isInterpolatedProperty(line.get())
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
          }
          // ####### Properties #######
          else if (this.isProperty(STATE, line.get())) {
            this.ResetCONTEXT('normal', STATE);
            this.addNewLine(STATE);
            STATE.RESULT += FormatProperty(line, STATE);
          }
          // ####### Convert #######
          else if (isConvert(line, STATE)) {
            this.ResetCONTEXT('convert', STATE);
            const edit = convertScssOrCss(line.get(), STATE).text;
            PushDebugInfo({
              title: 'CONVERT',
              lineNumber: STATE.currentLine,
              oldLineText: STATE.lines[STATE.currentLine],
              newLineText: edit,
              debug: STATE.CONFIG.debug
            });
            this.addNewLine(STATE);
            STATE.RESULT += edit;
          } else {
            PushDebugInfo({
              title: 'NO CHANGE',
              lineNumber: STATE.currentLine,
              oldLineText: STATE.lines[STATE.currentLine],
              newLineText: 'NULL',
              debug: STATE.CONFIG.debug
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
        debug: STATE.CONFIG.debug
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
            debug: STATE.CONFIG.debug
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
        debug: STATE.CONFIG.debug
      });
      this.addNewLine(STATE);
    } else if (pass) {
      PushDebugInfo({
        title: 'EMPTY LINE',
        lineNumber: STATE.currentLine,
        oldLineText: STATE.lines[STATE.currentLine],
        newLineText: 'NEWLINE',
        debug: STATE.CONFIG.debug
      });
      this.addNewLine(STATE);
    }
  }

  private static isBlockHeader(line: SassTextLine, STATE: FormattingState) {
    return (
      !STATE.LOCAL_CONTEXT.isInterpolatedProp &&
      (isMixin(line.get()) || // adds =mixin
        isPseudo(line.get()) ||
        isSelectorOperator(line.get()) ||
        isStar(line.get()) ||
        isBracketSelector(line.get()) ||
        STATE.LOCAL_CONTEXT.isAdjacentSelector ||
        STATE.LOCAL_CONTEXT.ResetTabs ||
        STATE.LOCAL_CONTEXT.isAnd_ ||
        STATE.LOCAL_CONTEXT.isHtmlTag ||
        isCssSelector(line.get())) // adds all lines that start with [@.#%]
    );
  }

  private static isProperty(STATE: FormattingState, lineText: string) {
    return (
      isInclude(lineText) || // adds +mixin, @include is handled in the block header.
      STATE.LOCAL_CONTEXT.isInterpolatedProp ||
      STATE.LOCAL_CONTEXT.isProp ||
      STATE.LOCAL_CONTEXT.isAtKeyframesPoint ||
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
      STATE.RESULT += '\n';
    } else {
      STATE.CONTEXT.isFirstLine = false;
    }
  }
}
