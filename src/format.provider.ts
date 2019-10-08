import { getCLassOrIdIndentationOffset, getIndentationOffset, convertScssOrCss, LogFormatInfo } from './format.utility';
import { FormatHandleBlockHeader, FormatHandleProperty, FormatHandleLocalContext } from './format.handlers';
import {
  isBlockCommentStart,
  isBlockCommentEnd,
  isIgnore,
  isSassSpace,
  isProperty,
  isReset,
  isAnd,
  isClassOrId,
  isMixin,
  isHtmlTag,
  isStar,
  isBracketSelector,
  isPseudo,
  isLoop,
  isInclude,
  isScssOrCss,
  isComment,
  getDistanceReversed,
  isEmptyOrWhitespace,
  isBracketOrWhitespace,
  isMedia,
  isPreSelector
} from 'suf-regex';
import { FormattingState } from './format.state';

export interface SassFormatterConfig {
  enabled?: boolean;
  debug?: boolean;
  deleteCompact?: boolean;
  deleteEmptyRows?: boolean;
  deleteWhitespace?: boolean;
  convert?: boolean;
  replaceSpacesOrTabs?: boolean;
  setPropertySpace?: boolean;
}

export interface SassFormattingOptions {
  tabSize: number;
  insertSpaces: boolean;
}

export class SassTextLine {
  text: string;
  isEmptyOrWhitespace: boolean;
  constructor(text: string, public lineNumber: number) {
    this.text = text;
    this.isEmptyOrWhitespace = isEmptyOrWhitespace(text);
  }
}

export class SassTextDocument {
  private lines?: SassTextLine[];
  lineCount: number;
  private rawText?: string;
  constructor(text: string) {
    this.rawText = text;
    const split = text.split(/\r?\n/g);
    this.lines = [];
    for (let i = 0; i < split.length; i++) {
      const LineText = split[i];
      this.lines.push(new SassTextLine(LineText, i));
    }
    this.lineCount = split.length;
  }
  lineAt(lineNumber: number) {
    if (this.lines !== undefined) {
      return this.lines[lineNumber];
    } else {
      return new SassTextLine(
        '[ERROR] This error should never happen if it does then look in src/format.provider.ts => SassTextDocument => lineAt',
        -1
      );
    }
  }
  getText() {
    return this.rawText || '';
  }
}

const DefaultConfig = {
  convert: true,
  debug: false,
  deleteCompact: true,
  deleteEmptyRows: true,
  deleteWhitespace: true,
  enabled: true,
  replaceSpacesOrTabs: true,
  setPropertySpace: true
};

export class SassFormatter {
  static Format(document: SassTextDocument, options: SassFormattingOptions, config?: SassFormatterConfig) {
    if (config === undefined) {
      config = DefaultConfig;
    }
    config = Object.assign(DefaultConfig, config);
    if (config.enabled === true) {
      const enableDebug: boolean = config.debug ? config.debug : false;
      if (enableDebug) {
        console.log('FORMAT');
      }
      const State = new FormattingState();

      let result: string = '';

      for (let i = 0; i < document.lineCount; i++) {
        const line = document.lineAt(i);

        if (isBlockCommentStart(line.text)) {
          State.isInBlockComment = true;
        }
        if (isBlockCommentEnd(line.text)) {
          State.isInBlockComment = false;
        }

        if (State.ignoreLine || State.isInBlockComment) {
          State.ignoreLine = false;
        } else {
          if (isIgnore(line.text)) {
            State.ignoreLine = true;
          } else {
            if (isSassSpace(line.text)) {
              State.ALLOW_SPACE = true;
            }
            // ####### Empty Line #######

            if (line.isEmptyOrWhitespace || (config.convert ? isBracketOrWhitespace(line.text) : false)) {
              ResetContext('normal', State);
              let pass = true; // its not useless, trust me.

              if (config.deleteEmptyRows && document.lineCount - 1 > i) {
                const nextLine = document.lineAt(i + 1);
                const compact = config.deleteCompact ? true : !isProperty(nextLine.text);
                const nextLineWillBeDeleted = config.convert ? isBracketOrWhitespace(nextLine.text) : false;
                if (
                  (compact && !State.ALLOW_SPACE && nextLine.isEmptyOrWhitespace) ||
                  (compact && !State.ALLOW_SPACE && nextLineWillBeDeleted)
                ) {
                  if (enableDebug) {
                    LogFormatInfo(enableDebug, line.lineNumber, { title: 'DELETE', nextLine });
                  }

                  pass = false;
                  // result.push(new TextEdit(new Range(line.range.start, nextLine.range.start), ''));
                }
              }

              if (line.text.length > 0 && pass && config.deleteWhitespace) {
                LogFormatInfo(enableDebug, line.lineNumber, { title: 'WHITESPACE' });
                result += addNewLine(State);
              } else if (pass) {
                result += addNewLine(State);
              }
            } else {
              // Set Local State
              State.setLocalContext({
                ...FormatHandleLocalContext(line, options, State),
                ResetTabs: isReset(line.text),
                isAnd_: isAnd(line.text),
                isProp: isProperty(line.text),
                indentation: getIndentationOffset(line.text, State.CONTEXT.tabs, options.tabSize),
                isClassOrIdSelector: isClassOrId(line.text)
              });
              //####### Block Header #######
              if (
                isMedia(line.text) ||
                isPreSelector(line.text) ||
                State.LOCAL_CONTEXT.isClassOrIdSelector ||
                isMixin(line.text) ||
                isHtmlTag(line.text.trim().split(' ')[0]) ||
                isStar(line.text) ||
                State.LOCAL_CONTEXT.isIfOrElse ||
                State.LOCAL_CONTEXT.ResetTabs ||
                State.LOCAL_CONTEXT.isAnd_ ||
                isBracketSelector(line.text) ||
                isPseudo(line.text) ||
                State.LOCAL_CONTEXT.isKeyframes ||
                isLoop(line.text)
              ) {
                const offset = getCLassOrIdIndentationOffset(
                  State.LOCAL_CONTEXT.indentation.distance,
                  options.tabSize,
                  State.CONTEXT.currentTabs,
                  State.LOCAL_CONTEXT.ResetTabs
                );

                State.CONTEXT.keyframes.is = State.LOCAL_CONTEXT.isKeyframes || State.LOCAL_CONTEXT.isKeyframesPoint;
                State.ALLOW_SPACE = false;

                const formatRes = FormatHandleBlockHeader(
                  {
                    line,
                    options,
                    config,
                    enableDebug,
                    offset
                  },
                  State
                );

                result += addNewLine(State);
                result += formatRes;
              }
              // ####### Properties #######
              else if (
                State.LOCAL_CONTEXT.isProp ||
                isInclude(line.text) ||
                State.LOCAL_CONTEXT.isKeyframesPoint ||
                State.LOCAL_CONTEXT.isIfOrElseAProp
              ) {
                ResetContext('normal', State);
                const formatRes = FormatHandleProperty(
                  {
                    config,
                    enableDebug,
                    line,
                    options
                  },
                  State
                );

                result += addNewLine(State);
                result += formatRes;
              }
              // ####### Convert #######
              else if (config.convert && isScssOrCss(line.text, State.CONTEXT.convert.wasLastLineCss) && !isComment(line.text)) {
                const convertRes = convertScssOrCss(line.text, options, State.CONTEXT.convert.lastSelector);
                // Set Context Vars
                ResetContext('convert', State);
                LogFormatInfo(enableDebug, line.lineNumber, { title: 'CONVERT', convert: true });
                result += addNewLine(State);
                result += convertRes.text;
              } else if (getDistanceReversed(line.text, options.tabSize) > 0 && config.deleteWhitespace) {
                let lineText = line.text;
                let convert = false;
                if (config.convert && isScssOrCss(line.text, State.CONTEXT.convert.wasLastLineCss) && !isComment(line.text)) {
                  const convertRes = convertScssOrCss(lineText, options, State.CONTEXT.convert.lastSelector);
                  lineText = convertRes.text;
                  convert = true;
                }
                // Set Context Vars
                ResetContext('normal', State);
                State.CONTEXT.convert.wasLastLineCss = convert;
                LogFormatInfo(enableDebug, line.lineNumber, { title: 'TRAIL', convert });

                result += addNewLine(State);
                result += lineText.trimRight();
              } else {
                result += addNewLine(State);
                result += line.text;
              }
            }
          }
        }
      }

      if (config.debug) {
        console.log('RESULT:'.concat(result, ':END'));
      }
      return result;
    } else {
      return document.getText();
    }
  }
}

function ResetContext(type: 'normal' | 'convert', State) {
  State.CONTEXT.firstCommaHeader.exists = false;
  if (type === 'convert') {
    State.CONTEXT.convert.wasLastLineCss = true;
  }
}

function addNewLine(State) {
  if (State.isFirstLine) {
    State.isFirstLine = false;
    return '';
  } else {
    return '\n';
  }
}
