import { getIndentationOffset, PushDebugInfo, Log, isConvert } from './utility';
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
  isSelectorOperator,
  isBlockCommentEnd,
  isEmptyOrWhitespace,
  isClassOrId,
  isCssSelector,
  isAtForwardOrAtUse,
  isMixin,
  isInclude,
  isInterpolatedProperty
} from 'suf-regex';
import { FormattingState } from './state';
import { FormatHandleLocalContext } from './formatters/format.utility';
import { FormatBlockHeader } from './formatters/format.header';
import { FormatProperty } from './formatters/format.property';
import { FormatHandleBlockComment } from './formatters/format.blockComment';
import { convertScssOrCss } from './formatters/format.convert';
import { FormatAtForwardOrAtUse } from './formatters/format.atForwardOrAtUse';
import { SassFormatterConfig } from './config';

export class SassTextLine {
  isEmptyOrWhitespace: boolean;
  constructor(private text: string, public lineNumber: number) {
    this.isEmptyOrWhitespace = isEmptyOrWhitespace(text);
  }
  /**Sets the text of the line. */
  set(text: string) {
    this.text = text;
  }
  /**Gets the text of the line. */
  get(): string {
    return this.text;
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
              lineNumber: line.lineNumber,
              oldLineText: STATE.lineText,
              newLineText: edit,
              debug: STATE.CONFIG.debug
            });
            this.addNewLine(STATE);
            STATE.RESULT += edit;
          } else {
            PushDebugInfo({
              title: 'NO CHANGE',
              lineNumber: line.lineNumber,
              oldLineText: STATE.lineText,
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
        lineNumber: line.lineNumber,
        oldLineText: STATE.lineText,
        newLineText: edit,
        debug: STATE.CONFIG.debug
      });
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

      const compact = STATE.CONFIG.deleteCompact ? true : !isProperty(nextLine.get());
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
            lineNumber: line.lineNumber,
            oldLineText: STATE.lineText,
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
        lineNumber: line.lineNumber,
        oldLineText: STATE.lineText,
        newLineText: 'NEWLINE',
        debug: STATE.CONFIG.debug
      });
      this.addNewLine(STATE);
    } else if (pass) {
      PushDebugInfo({
        title: 'EMPTY LINE',
        lineNumber: line.lineNumber,
        oldLineText: STATE.lineText,
        newLineText: 'NEWLINE',
        debug: STATE.CONFIG.debug
      });
      this.addNewLine(STATE);
    }
  }

  private static isBlockHeader(line: SassTextLine, STATE: FormattingState) {
    return (
      !STATE.LOCAL_CONTEXT.isInterpolatedProp &&
      (isMixin(line.get()) || // also adds =mixin
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
