import { getCLassOrIdIndentationOffset, getIndentationOffset, convertScssOrCss, LogFormatInfo } from './format.utility';
import {
  FormatHandleBlockHeader,
  FormatHandleProperty,
  FormatHandleLocalContext,
  FormatContext,
  FormatLocalContext
} from './format.handlers';
import {
  isBlockCommentStart,
  isBlockCommentEnd,
  isIgnore,
  isSassSpace,
  isProperty,
  isAnd,
  isHtmlTag,
  isStar,
  isBracketSelector,
  isComment,
  isPseudo,
  isReset,
  isMixin,
  isEach,
  isInclude,
  isScssOrCss,
  isEmptyOrWhitespace,
  isClassOrId,
  isBracketOrWhitespace
} from './utility.regex';
import { getDistanceReversed } from './utility';

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
  private lines: SassTextLine[] = [];
  lineCount: number;
  rawText: string;
  constructor(text: string) {
    this.rawText = text;
    const split = text.split('\n');
    for (let i = 0; i < split.length; i++) {
      const LineText = split[i];
      this.lines.push(new SassTextLine(LineText, i));
    }
    this.lineCount = split.length;
  }
  lineAt(lineNumber: number) {
    return this.lines[lineNumber];
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
      let result: string = '';

      let ALLOW_SPACE = false;
      let isInBlockComment = false;
      let ignoreLine = false;

      let CONTEXT: FormatContext = {
        convert: {
          lastSelector: '',
          wasLastLineCss: false
        },
        keyframes: {
          is: false,
          tabs: 0
        },
        tabs: 0,
        currentTabs: 0
        // lastHeader: { endedWithComma: false, offset: 0 }
      };

      // handle first line (test case 3 fails without this)
      let start = 0;
      if (document.lineAt(0).isEmptyOrWhitespace) {
        result += document.lineAt(0).text;
        start = 1;
      }

      for (let i = start; i < document.lineCount; i++) {
        const line = document.lineAt(i);

        if (isBlockCommentStart(line.text)) {
          isInBlockComment = true;
        }
        if (isBlockCommentEnd(line.text)) {
          isInBlockComment = false;
        }

        if (ignoreLine || isInBlockComment) {
          ignoreLine = false;
        } else {
          if (isIgnore(line.text)) {
            ignoreLine = true;
          } else {
            if (isSassSpace(line.text)) {
              ALLOW_SPACE = true;
            }
            // ####### Empty Line #######

            if (line.isEmptyOrWhitespace || (config.convert ? isBracketOrWhitespace(line.text) : false)) {
              // Context.lastHeader.endedWithComma = false;
              let pass = true; // its not useless, trust me.

              if (config.deleteEmptyRows && document.lineCount - 1 > i) {
                const nextLine = document.lineAt(i + 1);
                const compact = config.deleteCompact ? true : !isProperty(nextLine.text);
                const nextLineWillBeDeleted = config.convert ? isBracketOrWhitespace(nextLine.text) : false;
                if ((compact && !ALLOW_SPACE && nextLine.isEmptyOrWhitespace) || (compact && !ALLOW_SPACE && nextLineWillBeDeleted)) {
                  if (enableDebug) {
                    LogFormatInfo(enableDebug, line.lineNumber, { title: 'DELETE', nextLine });
                  }

                  pass = false;
                  // result.push(new TextEdit(new Range(line.range.start, nextLine.range.start), ''));
                }
              }

              if (line.text.length > 0 && pass && config.deleteWhitespace) {
                LogFormatInfo(enableDebug, line.lineNumber, { title: 'WHITESPACE' });
                result += '\n';
              } else if (pass) {
                result += '\n';
              }
            } else {
              const LOCAL_CONTEXT: FormatLocalContext = {
                ...FormatHandleLocalContext(line, CONTEXT, options),
                ResetTabs: isReset(line.text),
                isAnd_: isAnd(line.text),
                isProp: isProperty(line.text),
                indentation: getIndentationOffset(line.text, CONTEXT.tabs, options.tabSize),
                isClassOrIdSelector: isClassOrId(line.text)
              };
              //####### Block Header #######
              if (
                LOCAL_CONTEXT.isClassOrIdSelector ||
                isMixin(line.text) ||
                isHtmlTag(line.text.trim().split(' ')[0]) ||
                isStar(line.text) ||
                LOCAL_CONTEXT.isIfOrElse ||
                LOCAL_CONTEXT.ResetTabs ||
                LOCAL_CONTEXT.isAnd_ ||
                isBracketSelector(line.text) ||
                isPseudo(line.text) ||
                LOCAL_CONTEXT.isKeyframes ||
                isEach(line.text)
              ) {
                const offset = getCLassOrIdIndentationOffset(
                  LOCAL_CONTEXT.indentation.distance,
                  options.tabSize,
                  CONTEXT.currentTabs,
                  LOCAL_CONTEXT.ResetTabs
                );

                CONTEXT.keyframes.is = LOCAL_CONTEXT.isKeyframes || LOCAL_CONTEXT.isKeyframesPoint;
                ALLOW_SPACE = false;

                const formatRes = FormatHandleBlockHeader({
                  line,
                  options,
                  config,
                  enableDebug,
                  LocalContext: LOCAL_CONTEXT,
                  offset,
                  Context: CONTEXT
                });

                result += '\n';
                result += formatRes.edit;

                CONTEXT = formatRes.context;
              }
              // ####### Properties #######
              else if (LOCAL_CONTEXT.isProp || isInclude(line.text) || LOCAL_CONTEXT.isKeyframesPoint || LOCAL_CONTEXT.isIfOrElseAProp) {
                const formatRes = FormatHandleProperty({
                  config,
                  enableDebug,
                  LocalContext: LOCAL_CONTEXT,
                  Context: CONTEXT,
                  line,
                  options
                });

                result += '\n';
                result += formatRes.edit;
                CONTEXT = formatRes.context;
              }
              // ####### Convert #######
              else if (config.convert && isScssOrCss(line.text, CONTEXT.convert.wasLastLineCss) && !isComment(line.text)) {
                const convertRes = convertScssOrCss(line.text, options, CONTEXT.convert.lastSelector);
                // Set Context Vars
                // Context.lastHeader.endedWithComma = false;
                CONTEXT.convert.wasLastLineCss = true;
                LogFormatInfo(enableDebug, line.lineNumber, { title: 'CONVERT', convert: true });
                result += '\n';
                result += convertRes.text;
              } else if (getDistanceReversed(line.text, options.tabSize) > 0 && config.deleteWhitespace) {
                let lineText = line.text;
                let convert = false;
                if (config.convert && isScssOrCss(line.text, CONTEXT.convert.wasLastLineCss) && !isComment(line.text)) {
                  const convertRes = convertScssOrCss(lineText, options, CONTEXT.convert.lastSelector);
                  lineText = convertRes.text;
                  convert = true;
                }
                // Set Context Vars
                // Context.lastHeader.endedWithComma = false;
                CONTEXT.convert.wasLastLineCss = convert;
                LogFormatInfo(enableDebug, line.lineNumber, { title: 'TRAIL', convert });

                result += '\n';
                result += lineText.trimRight();
              } else {
                result += '\n';
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
      return document.rawText;
    }
  }
}
