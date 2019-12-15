import {
  getDistance,
  isMoreThanOneClassOrId,
  escapeRegExp,
  isPseudoWithParenthesis,
  isCssOneLiner,
  isCssPseudo,
  isClassOrId
} from 'suf-regex';
import { logger } from './logger';
import { SassTextLine } from './index';
import { FormattingState } from './state';

/**
 * returns the relative distance that the class or id should be at.
 */
export function getBlockHeaderOffset(distance: number, tabSize: number, current: number, ignoreCurrent: boolean) {
  if (distance === 0) {
    return 0;
  }
  if (tabSize * Math.round(distance / tabSize - 0.1) > current && !ignoreCurrent) {
    return current - distance;
  }
  return tabSize * Math.round(distance / tabSize - 0.1) - distance;
}
/**
 * adds or removes whitespace based on the given offset, a positive value adds whitespace a negative value removes it.
 */
export function replaceWithOffset(text: string, offset: number, STATE: FormattingState) {
  if (offset < 0) {
    text = text.replace(/\t/g, ' '.repeat(STATE.CONFIG.tabSize)).replace(new RegExp(`^ {${Math.abs(offset)}}`), '');
    if (!STATE.CONFIG.insertSpaces) {
      text = replaceSpacesOrTabs(text, STATE, false);
    }
  } else {
    text = text.replace(
      /^/,
      STATE.CONFIG.insertSpaces ? ' '.repeat(offset) : '\t'.repeat(offset / STATE.CONFIG.tabSize)
    );
  }
  return text;
}
/**
 * returns the difference between the current indentation and the indentation of the given text.
 */
export function getIndentationOffset(
  text: string,
  indentation: number,
  tabSize: number
): { offset: number; distance: number } {
  const distance = getDistance(text, tabSize);
  return { offset: indentation - distance, distance };
}
/**
 *
 */
export function isKeyframePoint(text: string, isAtKeyframe: boolean) {
  if (isAtKeyframe === false) {
    return false;
  }
  return /^[\t ]*\d+%/.test(text) || /^[\t ]*from|^[\t ]*to/.test(text);
}
/**
 * if the Property Value Space is none or more that one, this function returns false, else true;
 */
export function hasPropertyValueSpace(text: string) {
  const split = text.split(':');
  return split[1] === undefined
    ? true
    : split[1][0] === undefined
    ? true
    : split[1].startsWith(' ')
    ? split[1][1] === undefined
      ? true
      : !split[1][1].startsWith(' ')
    : false;
}

/**
 * converts scss/css to sass.
 */
export function convertScssOrCss(
  text: string,
  STATE: FormattingState
): { text: string; increaseTabSize: boolean; lastSelector: string } {
  const isMultiple = isMoreThanOneClassOrId(text);
  let lastSelector = STATE.CONTEXT.convert.lastSelector;
  StoreLog.TempConvertData.log = true;
  StoreLog.TempConvertData.text = text;
  if (!/[\t ]*[#.%]\{.*?}/.test(text)) {
    if (lastSelector && new RegExp('^.*' + escapeRegExp(lastSelector)).test(text)) {
      SetStoreConvertInfoType('LAST SELECTOR');
      let newText = text.replace(lastSelector, '');
      if (isPseudoWithParenthesis(text)) {
        newText = newText.split('(')[0].trim() + '(&' + ')';
      } else if (text.trim().startsWith(lastSelector)) {
        newText = text.replace(lastSelector, '&');
      } else {
        newText = newText.replace(/ /g, '') + ' &';
      }
      return {
        lastSelector,
        increaseTabSize: true,
        text: '\n'.concat(replaceWithOffset(removeInvalidChars(newText).trimRight(), STATE.CONFIG.tabSize, STATE))
      };
    } else if (isCssOneLiner(text)) {
      SetStoreConvertInfoType('ONE LINER');
      const split = text.split('{');
      return {
        increaseTabSize: false,
        lastSelector: split[0].trim(),
        text: removeInvalidChars(
          split[0].trim().concat('\n', replaceWithOffset(split[1].trim(), STATE.CONFIG.tabSize, STATE))
        ).trimRight()
      };
    } else if (isCssPseudo(text) && !isMultiple) {
      SetStoreConvertInfoType('PSEUDO');
      return {
        increaseTabSize: false,
        lastSelector,
        text: removeInvalidChars(text).trimRight()
      };
    } else if (isClassOrId(text)) {
      SetStoreConvertInfoType('CLASS OR ID');
      lastSelector = removeInvalidChars(text).trimRight();
    }
  }
  SetStoreConvertInfoType('DEFAULT');
  return { text: removeInvalidChars(text).trimRight(), increaseTabSize: false, lastSelector };
}

function removeInvalidChars(text: string) {
  let newText = '';
  let isInQuotes = false;
  let isInComment = false;
  let isInVarSelector = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (!isInQuotes && char === '/' && text[i + 1] === '/') {
      isInComment = true;
    } else if (/['"]/.test(char)) {
      isInQuotes = !isInQuotes;
    } else if (/#/.test(char) && /{/.test(text[i + 1])) {
      isInVarSelector = true;
    } else if (isInVarSelector && /}/.test(text[i - 1])) {
      isInVarSelector = false;
    }
    if (!/[;\{\}]/.test(char) || isInQuotes || isInComment || isInVarSelector) {
      newText += char;
    }
  }
  return newText;
}

export function replaceSpacesOrTabs(text: string, STATE: FormattingState, insertSpaces?: boolean) {
  if (insertSpaces !== undefined ? insertSpaces : STATE.CONFIG.insertSpaces) {
    return text.replace(/\t/g, ' '.repeat(STATE.CONFIG.tabSize));
  } else {
    return text.replace(new RegExp(' '.repeat(STATE.CONFIG.tabSize), 'g'), '\t');
  }
}
interface LogFormatInfo {
  title: string;
  setSpace?: boolean;
  convert?: boolean;
  offset?: number;
  replaceSpaceOrTabs?: boolean;
  nextLine?: SassTextLine;
}
export function PushLog(enableDebug: boolean, lineNumber: number, info: LogFormatInfo) {
  if (enableDebug) {
    StoreLog.logs.push({ info, lineNumber, ConvertData: StoreLog.TempConvertData });

    StoreLog.resetTempConvertData();
  } else {
    StoreLog.resetTempConvertData();
  }
}
export function Log(res: string) {
  logger.Log('info', StoreLog.logs, res);
}

function SetStoreConvertInfoType(type: string) {
  StoreLog.TempConvertData.type = type;
}

export interface LogType {
  type: string;
  text: string;
  log: boolean;
}
export interface Log {
  ConvertData: LogType;
  lineNumber: number;
  info: LogFormatInfo;
}
class StoreLog {
  static TempConvertData: LogType;
  static resetTempConvertData() {
    this.TempConvertData = {
      text: '',
      type: '',
      log: false
    };
  }
  static logs: { ConvertData: LogType; lineNumber: number; info: LogFormatInfo }[] = [];
}
