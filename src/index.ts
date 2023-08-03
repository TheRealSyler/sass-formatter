import { SassFormatterConfig } from './config'
import { FormatAtForwardOrAtUse } from './formatters/format.atForwardOrAtUse'
import { FormatHandleBlockComment } from './formatters/format.blockComment'
import { FormatBlockHeader } from './formatters/format.header'
import { FormatProperty } from './formatters/format.property'
import { LogDebugResult, PushDebugInfo, ResetDebugLog, SetDebugLOCAL_CONTEXT } from './logger'
import {
  getDistance, isAdjacentSelector, isAnd, isAtExtend, isAtForwardOrAtUse, isAtImport, isBlockCommentEnd, isBlockCommentStart, isBracketOrWhitespace, isBracketSelector, isClassOrId, isCssSelector, isHtmlTag, isIgnore, isInclude, isInterpolatedProperty, isKeyframes, isProperty, isPseudo, isReset, isSassSpace, isSelectorOperator, isStar, isVar
} from './regex/regex'
import { SassTextLine } from './sassTextLine'
import { FormattingState } from './state'
import { getIndentationOffset, isKeyframePointAndSetIndentation } from './utility'

export { SassFormatterConfig, defaultSassFormatterConfig } from './config'

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
      ResetDebugLog()
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

      PushDebugInfo({
        title: 'IGNORED',
        lineNumber: STATE.currentLine,
        oldLineText: line.get(),
        debug: STATE.CONFIG.debug,
        newLineText: 'NULL'
      });

    } else if (STATE.CONTEXT.isInBlockComment) {
      this.handleCommentBlock(STATE, line);
    } else {
      if (isIgnore(line.get())) {
        STATE.CONTEXT.ignoreLine = true;
        this.addNewLine(STATE);
        STATE.RESULT += line.get();

        PushDebugInfo({
          title: 'IGNORE',
          lineNumber: STATE.currentLine,
          oldLineText: line.get(),
          debug: STATE.CONFIG.debug,
          newLineText: 'NULL'
        });

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
            isAtKeyframesPoint: isKeyframePointAndSetIndentation(line, STATE), // IMPORTANT: has to be first
            indentation: getIndentationOffset(line.get(), STATE.CONTEXT.indentation, STATE.CONFIG.tabSize),
            isIf: /[\t ]*@if/i.test(line.get()),
            isElse: /[\t ]*@else/i.test(line.get()),
            isAtKeyframes: isKeyframes(line.get()),
            isReset: isReset(line.get()),
            isAnd: isAnd(line.get()),
            isProp: isProperty(line.get()),
            isAdjacentSelector: isAdjacentSelector(line.get()),
            isHtmlTag: isHtmlTag(line.get()),
            isClassOrIdSelector: isClassOrId(line.get()),
            isAtExtend: isAtExtend(line.get()),
            isInterpolatedProp: isInterpolatedProperty(line.get()),
            isInclude: isInclude(line.get()),
            isVariable: isVar(line.get()),
            isImport: isAtImport(line.get()),
            isNestPropHead: /^[\t ]* \S*[\t ]*:[\t ]*\{?$/.test(line.get())
          });

          if (STATE.CONFIG.debug) {
            if (/\/\/[\t ]*info[\t ]*$/.test(line.get())) {

              SetDebugLOCAL_CONTEXT(STATE.LOCAL_CONTEXT)
            }

          }

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
          // ####### Properties or Vars #######
          else if (this.isProperty(STATE)) {
            STATE.CONTEXT.firstCommaHeader.exists = false;
            this.addNewLine(STATE);
            STATE.RESULT += FormatProperty(line, STATE);
          }
          else {

            PushDebugInfo({
              title: 'NO CHANGE',
              lineNumber: STATE.currentLine,
              oldLineText: line.get(),
              debug: STATE.CONFIG.debug,
              newLineText: 'NULL'
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

    PushDebugInfo({
      title: 'COMMENT BLOCK',
      lineNumber: STATE.currentLine,
      oldLineText: STATE.lines[STATE.currentLine],
      newLineText: edit,
      debug: STATE.CONFIG.debug,
    });

  }

  private static handleEmptyLine(STATE: FormattingState, line: SassTextLine) {
    STATE.CONTEXT.firstCommaHeader.exists = false;
    let pass = true; // its not useless, trust me.
    /*istanbul ignore else */
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

        PushDebugInfo({
          title: 'EMPTY LINE: DELETE',
          nextLine,
          lineNumber: STATE.currentLine,
          oldLineText: STATE.lines[STATE.currentLine],
          newLineText: 'DELETED',
          debug: STATE.CONFIG.debug,
        });

        pass = false;
      }
    }
    if (line.get().length > 0 && pass) {
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
        STATE.LOCAL_CONTEXT.isReset ||
        STATE.LOCAL_CONTEXT.isAnd ||
        (STATE.LOCAL_CONTEXT.isHtmlTag && !/^[\t ]*style[\t ]*:/.test(line.get())) ||
        STATE.LOCAL_CONTEXT.isInclude ||
        STATE.LOCAL_CONTEXT.isNestPropHead ||
        isPseudo(line.get()) ||
        isSelectorOperator(line.get()) ||
        isStar(line.get()) ||
        isBracketSelector(line.get()) ||
        isCssSelector(line.get())) // adds all lines that start with [@.#%=]
    );
  }

  private static isProperty(STATE: FormattingState) {
    return (
      STATE.LOCAL_CONTEXT.isImport ||
      STATE.LOCAL_CONTEXT.isAtExtend ||
      STATE.LOCAL_CONTEXT.isVariable ||
      STATE.LOCAL_CONTEXT.isInterpolatedProp ||
      STATE.LOCAL_CONTEXT.isProp ||
      STATE.LOCAL_CONTEXT.isAtKeyframesPoint
    );
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
